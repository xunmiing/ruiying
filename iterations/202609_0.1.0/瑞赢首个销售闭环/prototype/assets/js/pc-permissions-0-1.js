/* PC-only review overlay for the confirmed 0.1 three-role model.
 * H5 continues to use permissions.js until its separate prototype update. */
(function () {
  'use strict';
  if (!window.RY || !RY.perm || !RY.store) return;
  var P = RY.perm, S = RY.store;
  var roles = { R1: { code: 'R1', name: '销售' }, R2: { code: 'R2', name: '销售主管/经理' }, R3: { code: 'R3', name: '管理员（运营）' } };
  var oldPages = P.PAGES, oldActions = P.ACTIONS;
  function role(u) {
    var code = (u || S.currentUser()).role;
    return code === 'R4' || code === 'R5' ? 'R3' : code;
  }
  function defaults(list, kind) {
    var out = [];
    if (list.indexOf('R1') >= 0) out.push('R1');
    if (list.indexOf('R2') >= 0) out.push('R2');
    if (kind === 'page' || ['R3', 'R4', 'R5'].some(function (x) { return list.indexOf(x) >= 0; })) out.push('R3');
    return out;
  }
  Object.keys(oldPages).forEach(function (key) {
    if (key.indexOf('h5.') !== 0 && key !== 'agent.service') oldPages[key] = defaults(oldPages[key], 'page');
  });
  Object.keys(oldActions).forEach(function (key) {
    oldActions[key] = defaults(oldActions[key], 'action');
  });
  ['contact.plain', 'analysis.plain', 'perm.grantR5'].forEach(function (key) { delete oldActions[key]; });
  Object.keys(P.ROLES).forEach(function (key) { delete P.ROLES[key]; });
  Object.keys(roles).forEach(function (key) { P.ROLES[key] = roles[key]; });
  // Historical demo records still carry R4/R5. Treat them as the single admin role.
  P.ROLES.R4 = roles.R3;
  P.ROLES.R5 = roles.R3;

  function matrix() {
    var st = S.uiState('pcThreeRoleMatrix', null) || {};
    return st;
  }
  function allowed(group, key, base) {
    var override = (matrix()[group] || {})[key];
    return override || base;
  }
  P.setMatrix = function (group, key, list) {
    var st = matrix();
    st[group] = st[group] || {};
    st[group][key] = list.filter(function (x) { return !!roles[x]; });
    S.uiState('pcThreeRoleMatrix', st);
  };
  P.buttonRoles = function (key) {
    return allowed('actions', key, oldActions[key] || []).slice();
  };
  P.dataScope = function (user) {
    var r = role(user);
    return { scope: r === 'R1' ? 'self' : r === 'R2' ? 'team' : 'all',
      label: r === 'R1' ? '本人负责、本人协作、所属线索池待认领线索及全国公海' :
        r === 'R2' ? '本人及本团队，含所属线索池待认领线索与全国公海' : '全部业务数据' };
  };
  var oldInScope = P.inScope;
  P.inScope = function (kind, obj) {
    var r = role();
    if (r === 'R3') return true;
    if (!obj) return false;
    var normalized = ({ leads:'lead', opportunities:'opp', customers:'customer', contacts:'contact',
      tasks:'task', activities:'activity', visits:'visit', schedules:'schedule', reports:'report' })[kind] || kind;
    var user = S.currentUser(), uid = user.id;
    function person(id) { return id === uid || (r === 'R2' && !!id && S.inTeamOf(id, uid)); }
    function ownerOrCollab(x) { return person(x.owner || x.userId) || (x.collaborators || []).some(person) ||
      (x.team || []).some(function (m) { return person(m.userId || m); }); }
    function customer(id) {
      if (!id) return false;
      var relations = S.activeRelationsOf(id) || [];
      if (!relations.length) return true; // 全国公海对销售完整可见
      return relations.some(ownerOrCollab);
    }
    if (normalized === 'customer' || normalized === 'relation') return customer(obj.customerId || obj.id);
    if (normalized === 'contact') {
      var links = S.all('contactRelations').filter(function (x) { return x.contactId === obj.id; });
      return links.some(function (x) { return P.contactCustomerInScope(x.customerId); });
    }
    if (normalized === 'lead') {
      if (obj.currentPool && !obj.owner) {
        var pool = S.poolOf(obj.currentPool);
        if (pool && (pool.members || []).indexOf(uid) >= 0) return true;
        if (r === 'R2' && pool && (pool.members || []).some(person)) return true;
      }
      return ownerOrCollab(obj);
    }
    if (normalized === 'opp' || normalized === 'task' || normalized === 'activity' ||
        normalized === 'visit' || normalized === 'schedule' || normalized === 'report') return ownerOrCollab(obj);
    return oldInScope(kind, obj);
  };
  P.contactCustomerInScope = function (id) {
    if (!id || !S.customer(id)) return false;
    if (role() === 'R3') return true;
    var rels = S.activeRelationsOf(id) || [];
    if (!rels.length) return false; // 公海只从客户详情查看联系人
    var uid = S.currentUser().id, manager = role() === 'R2';
    function member(personId) { return personId === uid || (manager && !!personId && S.inTeamOf(personId, uid)); }
    return rels.some(function (rel) {
      return member(rel.owner || rel.userId) || (rel.collaborators || []).some(member) ||
        (rel.team || []).some(function (person) { return member(person.userId || person); });
    });
  };
  P.canViewPlainPhone = function () { return true; };
  P.page = function (key) {
    var base = oldPages[key];
    return !!base && allowed('pages', key, base).indexOf(role()) >= 0;
  };
  P.can = function (key, obj) {
    var base = oldActions[key];
    if (!base) return false;
    if (allowed('actions', key, base).indexOf(role()) < 0) return false;
    if (obj && /\.export$/.test(key)) return true;
    if (obj && !P.inScope(key.split('.')[0], obj)) return false;
    return true;
  };
  P.whyNot = function (key) {
    return P.can(key) ? '' : '当前角色未获「' + key + '」按钮权限，或对象不在当前数据范围内。';
  };
  P.guard = function (key, type, id) {
    if (!P.page(key)) return { ok: false, kind: 'no-permission', reason: '当前角色未获该功能列表权限。' };
    if (id) {
      var obj = type && S.find(type, id);
      if (!obj) return { ok: false, kind: 'unavailable', reason: '对象不存在或不可用。' };
      if (!P.inScope(type, obj)) return { ok: false, kind: 'no-permission', reason: '对象不在当前数据范围内。' };
    }
    return { ok: true };
  };
  P.visibleNav = function () {
    function mark(item) { return Object.assign({}, item, { allowed: P.page(item.key) }); }
    function group(item) {
      var items = (item.items || (item.key ? [item] : [])).map(mark);
      return Object.assign({}, item, { items: items, allowed: items.some(function (x) { return x.allowed; }) });
    }
    return P.navTree().map(function (item) {
      if (!item.groups) return group(item);
      var groups = item.groups.map(group);
      return Object.assign({}, item, { groups: groups, allowed: groups.some(function (x) { return x.allowed; }) });
    });
  };
  P.pcRole = role;
})();
