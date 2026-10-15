/* 拜访规则表单共用结构：新增与详情编辑使用同一字段和读取口径。 */
window.RY = window.RY || {};
RY.visitRuleForm = (function () {
  'use strict';
  function options(kind, values) {
    var list = kind === 'users' ? RY.store.all('users') : RY.store.all(kind);
    var key = kind === 'users' ? 'id' : 'code';
    return list.filter(function (x) { return x.status !== '停用' || values.indexOf(x[key]) >= 0; }).map(function (x) {
      var value = x[key];
      return '<label class="vr-check"><input type="checkbox" data-scope="' + kind + '" value="' + RY.ui.esc(value) + '"' +
        (values.indexOf(value) >= 0 ? ' checked' : '') + '> ' + RY.ui.esc(x.name) + '</label>';
    }).join('');
  }
  function typeOptions(values) {
    return ['实地拜访', '远程拜访'].map(function (value) {
      return '<label class="vr-check"><input type="checkbox" data-scope="visitTypes" value="' + value + '"' +
        (values.indexOf(value) >= 0 ? ' checked' : '') + '> ' + value + '</label>';
    }).join('');
  }
  function render(rule, create) {
    var s = rule.scopeSpec || { businessLines: [], regions: [], users: [], visitTypes: [] };
    function val(key) { return RY.ui.esc(rule[key] == null ? '' : String(rule[key])); }
    return '<div class="cr-form-block"><h3>规则标识</h3><div class="cr-rule-fields">' +
      (create ? '<div class="ry-field"><label class="ry-field__label">规则编码 *</label><input class="ry-input" name="familyCode" value="" placeholder="如 VR-EAST；编码不含版本号"><button type="button" data-pcn-rule="cfgVisitCode"></button></div>' : '') +
      '<div class="ry-field"><label class="ry-field__label">规则名称 *</label><input class="ry-input" name="name" value="' + val('name') + '"></div></div></div>' +
      '<div class="cr-form-block"><h3>适用范围 <button type="button" data-pcn-rule="cfgVisitScope"></button></h3>' +
      '<div class="vr-scope"><div><b>业务线</b>' + options('businessLines', s.businessLines || []) + '</div>' +
      '<div><b>经营区域</b>' + options('regions', s.regions || []) + '</div>' +
      '<div><b>具体人员</b>' + options('users', s.users || []) + '</div>' +
      '<div><b>拜访类型</b>' + typeOptions(s.visitTypes || []) + '</div></div></div>' +
      '<div class="cr-form-block"><h3>异常提示参数 <button type="button" data-pcn-rule="cfgVisitAnomaly"></button></h3><div class="vr-params">' +
      '<div class="ry-field"><label class="ry-field__label">签到半径（米） *</label><input class="ry-input" type="number" min="1" name="radius" value="' + val('radius') + '"></div>' +
      '<div class="ry-field"><label class="ry-field__label">定位精度阈值（米） *</label><input class="ry-input" type="number" min="1" name="accuracy" value="' + val('accuracy') + '"></div>' +
      '<div class="ry-field"><label class="ry-field__label">签到签退间隔提示值（分钟） *</label><input class="ry-input" type="number" min="1" name="duration" value="' + val('duration') + '"></div></div>' +
      '<label class="vr-check"><input type="checkbox" name="imageRequired"' + (rule.imageRequired ? ' checked' : '') + '> 缺少现场图片时提示异常</label>' +
      '<div class="cr-rule-fields"><div class="ry-field"><label class="ry-field__label">校验说明</label><textarea class="ry-textarea" name="checkRule" rows="3">' + val('checkRule') + '</textarea></div>' +
      '<div class="ry-field"><label class="ry-field__label">异常处理说明</label><textarea class="ry-textarea" name="exceptionRule" rows="3">' + val('exceptionRule') + '</textarea></div></div>' +
      '</div>';
  }
  function read(host) {
    function value(name) { var el = host.querySelector('[name="' + name + '"]'); return el ? el.value.trim() : ''; }
    function checked(kind) { return Array.prototype.map.call(host.querySelectorAll('[data-scope="' + kind + '"]:checked'), function (el) { return el.value; }); }
    return {
      familyCode: value('familyCode'), name: value('name'), radius: Number(value('radius')),
      accuracy: Number(value('accuracy')), duration: Number(value('duration')),
      imageRequired: !!host.querySelector('[name="imageRequired"]:checked'),
      checkRule: value('checkRule'), exceptionRule: value('exceptionRule'),
      scopeSpec: { businessLines: checked('businessLines'), regions: checked('regions'), users: checked('users'), visitTypes: checked('visitTypes') }
    };
  }
  function scopeText(rule) {
    var s = rule.scopeSpec || {};
    var parts = [];
    [['businessLines', 'businessLines', 'code'], ['regions', 'regions', 'code'], ['users', 'users', 'id']].forEach(function (entry) {
      var ids = s[entry[0]] || [];
      if (ids.length) parts.push(ids.map(function (id) {
        var x = RY.store.all(entry[1]).filter(function (v) { return v[entry[2]] === id; })[0];
        return x ? x.name : id;
      }).join('、'));
    });
    if ((s.visitTypes || []).length) parts.push(s.visitTypes.join('、'));
    return parts.length ? parts.join(' 且 ') : '全部拜访';
  }
  function viewerCanRead(rule, user) {
    if (user.role !== 'R2') return true;
    if (rule.status !== '生效') return false;
    var s = rule.scopeSpec || {};
    return (!(s.businessLines || []).length || s.businessLines.some(function (x) { return (user.businessLine || []).indexOf(x) >= 0; })) &&
      (!(s.regions || []).length || s.regions.some(function (x) { return (user.region || []).indexOf(x) >= 0; })) &&
      (!(s.users || []).length || s.users.some(function (x) { return x === user.id || RY.store.inTeamOf(x, user.id); }));
  }
  return { render: render, read: read, scopeText: scopeText, viewerCanRead: viewerCanRead };
})();
