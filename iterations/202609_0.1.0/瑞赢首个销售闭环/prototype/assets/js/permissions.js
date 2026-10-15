/* ==========================================================================
 * 瑞赢 0.1 · 原型权限模拟（permissions.js）
 * --------------------------------------------------------------------------
 * 依据：assets/permission-model.md、prd/00 §3／§4／§5／§6、prd/07、
 *       prd/01 §12、prd/02 §8、prd/03 §14、prd/04、prd/05、prd/06、prd/08。
 *
 * 权限计算口径（原型按此模拟，全部为前端演示，不代表生产鉴权实现）：
 *   角色页面权限 ∩ 动作权限 ∩ 数据范围 ∩ 字段规则 ∩ 当前对象状态
 *   - 多角色为并集，无主角色、无显式拒绝。
 *   - 菜单不是新的权限层级，只是已有页面权限的导航表现。
 *   - 每个入口（首页快捷入口、搜索、消息、深链、列表进详情、关联跳转、
 *     跨端进入、下载与重试）都重新鉴权。
 *   - 失去权限后不再展示对象标题、摘要、数量与未授权关联关系。
 *
 * 能力项：业务配置能力按能力项判定，
 * 除 R5 固定最高权限外不得按角色名称推断，尤其不能默认 R3 拥有全部配置能力。
 *
 * 原型不通过隐藏按钮代替权限表达：无权限时按钮可见并标注原因，或给出明确拒绝原因。
 * ========================================================================== */
window.RY = window.RY || {};

RY.perm = (function () {
  'use strict';

  var S = function () { return RY.store; };

  /* ------------------------------------------------------------ 角色定义 */

  var ROLES = {
    R1: { code: 'R1', name: '销售', desc: '处理本人及被授权协作范围内的业务对象' },
    R2: { code: 'R2', name: '销售主管', desc: '同时处理本人销售业务和授权团队内的分派、拜访复核与日报建议' },
    R3: { code: 'R3', name: '销售运营', desc: '维护获授权的业务配置、指标、知识与数据质量能力' },
    R4: { code: 'R4', name: '客户数据管理', desc: '客户资料维护能力包：主体资料、客户关系网、合并、恢复' },
    R5: { code: 'R5', name: '系统管理员', desc: '系统固定最高权限人工角色' },
    R6: { code: 'R6', name: 'Agent / 服务身份', desc: '在调用用户权限与服务身份权限交集内执行获准动作' }
  };

  /* ------------------------------------------------- 业务配置能力项 */

  /**
   * roles 是该能力项「可授予」的角色集合，def 是原型默认是否已授予。
   * R5 是旧演示身份，三角色映射在 pc-permissions-0-1.js 中；
   * 配置查看、编辑、发布、启停分别计算 —— R3 默认只有「查看配置」。
   */
  var CAPS = {
    'cap.config.view': { name: '查看配置', roles: ['R2', 'R3', 'R5'], def: true },
    'cap.config.edit': { name: '编辑配置（含校验）', roles: ['R3', 'R5'], def: false },
    'cap.config.publish': { name: '发布配置', roles: ['R3', 'R5'], def: false },
    'cap.config.toggle': { name: '启用／停用配置', roles: ['R3', 'R5'], def: false }
  };
  var CAP_STATE = {};
  Object.keys(CAPS).forEach(function (k) { CAP_STATE[k] = CAPS[k].def; });

  /* 未登记键的收集器：只用于静态检查与评审，不改变页面行为。 */
  var UNKNOWN = { page: [], action: [], cap: [] };
  function noteUnknown(kind, key) {
    if (!key) return;
    if (UNKNOWN[kind].indexOf(key) < 0) UNKNOWN[kind].push(key);
  }

  function cap(key) {
    var c = CAPS[key];
    if (!c) { noteUnknown('cap', key); return true; }
    var u = S().currentUser();
    if (u.role === 'R5') return true;           /* R5 固定最高权限 */
    if (c.roles.indexOf(u.role) < 0) return false;
    return !!CAP_STATE[key];
  }
  function capSet(key, value) {
    if (value === undefined) return !!CAP_STATE[key];
    CAP_STATE[key] = !!value;
    return CAP_STATE[key];
  }

  /* ------------------------------------------------- 页面（菜单）权限 */

  var ALL5 = ['R1', 'R2', 'R3', 'R4', 'R5'];
  var SALES_ALL = ['R1', 'R2', 'R3', 'R4', 'R5'];
  var SALES = ['R1', 'R2'];
  var MGR = ['R2', 'R5'];
  var MGR_DATA = ['R2', 'R4', 'R5'];
  var OPS = ['R3', 'R5'];
  var DATA = ['R4', 'R5'];
  var SYS = ['R5'];
  var AGENT = ['R6'];

  var PAGES = {
    /* 首页与全局 */
    'home': SALES_ALL, 'search': SALES_ALL, 'message': SALES_ALL, 'processing': SALES_ALL,
    'processing.detail': SALES_ALL, 'state': SALES_ALL,
    /* 客户管理 */
    'customer.list': SALES_ALL, 'customer.detail': SALES_ALL, 'customer.create': SALES,
    'customer.pool': ['R1', 'R2', 'R4', 'R5'], 'customer.import': ['R1', 'R2', 'R3', 'R4'],
    'contact.list': SALES_ALL, 'contact.detail': SALES_ALL,
    /* 销售管理 */
    'lead.list': SALES_ALL, 'lead.detail': SALES_ALL, 'lead.create': ['R1', 'R2', 'R3'],
    'lead.convert': SALES, 'lead.convertResult': SALES,
    'opp.list': SALES, 'opp.detail': SALES, 'opp.create': SALES,
    'activity.list': SALES_ALL, 'activity.detail': SALES_ALL,
    'visit.list': SALES_ALL, 'visit.detail': SALES_ALL,
    /* 工作管理 */
    'task.list': SALES_ALL, 'task.detail': SALES_ALL,
    'schedule.list': SALES_ALL, 'schedule.detail': SALES_ALL,
    'report.list': SALES_ALL, 'report.detail': SALES_ALL,
    /* 分析（能力项判定，见 CAP_PAGE） */
    /* 业务配置（能力项判定） */
    'cfg.dict': OPS, 'cfg.oppField': OPS, 'cfg.template': OPS, 'cfg.leadPool': OPS,
    'cfg.cusPool': OPS, 'cfg.region': OPS, 'cfg.task': OPS, 'cfg.visit': ['R2', 'R3', 'R5'],
    /* 指标配置（能力项判定） */
    /* Agent 配置 */
    'agent.config': OPS,
    /* 人员、权限与移交 */
    'people.list': MGR_DATA, 'perm.config': SYS, 'perm.pending': MGR_DATA,
    'handover': MGR_DATA, 'people.sync': MGR_DATA,
    /* 异常与质量 */
    'exception.list': ['R2', 'R3', 'R4', 'R5'], 'exception.detail': ['R2', 'R3', 'R4', 'R5'],
    /* 知识 */
    'knowledge.list': SALES_ALL, 'knowledge.detail': SALES_ALL, 'knowledge.manage': OPS,
    'ai.ops': OPS,
    /* 集成、消息、AI 运行、审计 */
    /* 企业微信 H5：与 PC 共用同一批页面权限与数据范围 */
    'h5.home': SALES_ALL, 'h5.more': SALES_ALL, 'h5.message': SALES_ALL, 'h5.quicknote': SALES_ALL,
    'h5.team.index': MGR,
    'h5.customer.list': SALES_ALL, 'h5.customer.detail': SALES_ALL, 'h5.customer.create': SALES,
    'h5.customer.pool': ['R1', 'R2', 'R4', 'R5'],
    'h5.contact.list': SALES_ALL, 'h5.contact.detail': SALES_ALL,
    'h5.lead.list': SALES_ALL, 'h5.lead.detail': SALES_ALL, 'h5.lead.create': ['R1', 'R2', 'R3'],
    'h5.lead.convert': SALES,
    'h5.opp.list': SALES, 'h5.opp.detail': SALES, 'h5.opp.create': SALES,
    'h5.activity.list': SALES_ALL, 'h5.activity.detail': SALES_ALL, 'h5.activity.create': SALES_ALL,
    'h5.visit.list': SALES_ALL, 'h5.visit.detail': SALES_ALL,
    'h5.task.list': SALES_ALL, 'h5.task.detail': SALES_ALL,
    'h5.task.create': ['R1', 'R2', 'R5'],
    'h5.calendar': SALES_ALL,
    'h5.report.daily': SALES_ALL, 'h5.report.team': MGR,
    'h5.agent.index': SALES_ALL, 'h5.agent.organize': SALES_ALL, 'h5.agent.confirm': SALES_ALL,
    'h5.agent.pending': SALES_ALL, 'h5.agent.meeting': SALES_ALL, 'h5.agent.object': SALES_ALL,
    'h5.agent.create': ['R1', 'R2', 'R3'],
    'h5.agent.manager': MGR,
    'h5.knowledge.list': SALES_ALL, 'h5.knowledge.detail': SALES_ALL,
    /* Agent 服务身份 */
    'agent.service': AGENT
  };

  /* 页面与能力项的绑定：有绑定则页面进入同时要求该能力项。 */
  var CAP_PAGE = {
    'cfg.dict': 'cap.config.view',
    'cfg.oppField': 'cap.config.view',
    'cfg.template': 'cap.config.view',
    'cfg.leadPool': 'cap.config.view',
    'cfg.cusPool': 'cap.config.view',
    'cfg.region': 'cap.config.view',
    'cfg.task': 'cap.config.view',
    'cfg.visit': 'cap.config.view',
    'agent.config': 'cap.config.view'
  };

  /* ------------------------------------------------------------ 动作权限 */

  var ACTIONS = {
    /* 客户 */
    'customer.create': SALES,
    'customer.edit.normal': ['R1', 'R2', 'R4'],
    'customer.edit.highImpact': DATA,
    'customer.import': ['R1', 'R2', 'R3', 'R4'],
    'customer.export': SALES_ALL,
    'customer.address.edit': ['R1', 'R2', 'R4'],
    'customer.grade': SALES,
    /* 经营关系与全国公海 */
    'relation.create': ['R1', 'R2', 'R4'],
    'relation.collaborator': ['R1', 'R2', 'R4'],
    'relation.stop': ['R2', 'R4', 'R5'],
    /* 指派与转派主负责人属主管能力（prd/01 §8.2）：创建人只能提交主管分派。 */
    'relation.assign': MGR_DATA,
    'relation.transfer': MGR_DATA,
    'pool.view': SALES_ALL,
    'pool.claim': SALES,
    'pool.assign': MGR_DATA,
    /* 联系人 */
    'contact.create': ['R1', 'R2', 'R4'],
    'contact.edit': ['R1', 'R2', 'R4'],
    'contact.relation': ['R1', 'R2', 'R4'],
    'contact.plain': ['R1', 'R2', 'R4', 'R5'],
    'contact.export': SALES_ALL,
    'contact.import': ['R1', 'R2', 'R3', 'R4'],
    /* 客户关系网 */
    'customerNetwork.edit': ['R2', 'R3', 'R4', 'R5'],
    /* 线索 */
    'lead.create': ['R1', 'R2', 'R3'],
    'lead.edit': SALES,
    'lead.claim': SALES,
    'lead.assign': ['R2', 'R3', 'R5'],
    'lead.transfer': SALES,
    'lead.returnPool': SALES,
    'lead.recycle': ['R2', 'R3', 'R5'],
    'lead.invalid': SALES,
    'lead.correctInvalid': MGR,
    'lead.convert': SALES,
    'lead.import': ['R1', 'R2', 'R3'],
    'lead.export': ['R1', 'R2', 'R3'],
    'leadBatch.transfer': SALES,
    'leadBatch.assign': ['R2', 'R3'],
    'leadBatch.return': SALES,
    'leadBatch.recycle': ['R2', 'R3'],
    /* 商机 */
    'opp.create': SALES,
    'opp.advance': ['R1', 'R2'],
    'opp.rollback': ['R1', 'R2'],
    'opp.sleep': ['R1', 'R2'],
    'opp.resume': ['R1', 'R2'],
    'opp.close': ['R1', 'R2'],
    'opp.reopen': MGR,
    'opp.split': SALES,
    'opp.reassign': MGR,
    'opp.team': SALES,
    'opp.lines': ['R1', 'R2', 'R5'],
    'opp.customer.change': ['R1', 'R2', 'R5'],
    'opp.nextAction': ['R1', 'R2', 'R5'],
    'opp.export': ['R1', 'R2', 'R3'],
    'opp.batch.reassign': MGR,
    'opp.batch.team': MGR,
    'opp.migrate': ['R1', 'R2', 'R5'],
    /* 销售活动（不可通用批量修改） */
    'activity.create': SALES,
    'activity.edit': SALES,
    'activity.correct': ['R1', 'R2', 'R5'],
    'activity.export': SALES_ALL,
    /* 正式拜访 */
    'visit.create': SALES,
    'visit.checkIn': SALES,
    'visit.checkOut': SALES,
    'visit.cancel': SALES,
    'visit.supplement': ['R1', 'R2', 'R5'],
    'visit.correct': ['R1', 'R2', 'R5'],
    'visit.review': MGR,
    'visit.batchReview': MGR,
    'visit.export': SALES_ALL,
    /* 任务 */
    'task.create': ['R1', 'R2', 'R5'],
    'task.complete': ['R1', 'R2', 'R5'],
    'task.collabRecord': ['R1', 'R2', 'R5'],
    'task.reschedule': ['R1', 'R2', 'R5'],
    'task.cancel': ['R1', 'R2', 'R5'],
    'task.assign': MGR,
    'task.batchReassign': MGR,
    'task.export': SALES_ALL,
    /* 日程 */
    'schedule.create': SALES_ALL,
    'schedule.edit': SALES_ALL,
    'schedule.cancel': SALES_ALL,
    'schedule.delete': SALES_ALL,
    'schedule.toTask': SALES_ALL,
    'schedule.syncRetry': SALES_ALL,
    /* 日报 */
    'report.edit': SALES,
    'report.submit': SALES,
    'report.read': MGR,
    'report.advice': MGR,
    'report.export': MGR,
    /* 业务配置 */
    'config.editA': OPS,
    'config.editB': OPS,
    'visitRule.edit': OPS,
    'config.validate': OPS,
    'config.publish': OPS,
    'config.toggle': OPS,
    'agentConfig.edit': OPS,
    /* 人员、权限与移交 */
    'people.view': MGR_DATA,
    'people.disable': SYS,
    'perm.grantR5': SYS,
    'perm.edit': SYS,
    'permPending.handle': MGR_DATA,
    'handover.precheck': MGR_DATA,
    'handover.execute': MGR_DATA,
    'peopleSync.handle': MGR_DATA,
    /* 异常与质量 */
    'exception.claim': ['R2', 'R3', 'R4', 'R5'],
    'exception.return': ['R2', 'R3', 'R4', 'R5'],
    'exception.complete': ['R2', 'R3', 'R4', 'R5'],
    'exception.reject': ['R3', 'R4', 'R5'],
    'quality.ignore': ['R3', 'R4', 'R5'],
    'quality.rerun': OPS,
    'quality.rule.edit': OPS,
    /* 知识 */
    'knowledge.view': SALES_ALL,
    'knowledge.download': SALES_ALL,
    'knowledge.create': OPS,
    'knowledge.edit': OPS,
    'knowledge.publish': OPS,
    'knowledge.deactivate': OPS,
    /* 集成、消息、AI 运行、审计 */
    'integration.view': OPS,
    'integration.retry': OPS,
    'msg.view': OPS,
    'msg.retry': OPS,
    'msg.template.edit': OPS,
    'ai.ops.view': OPS,
    'ai.ops.retry': OPS,
    'audit.view': ['R2', 'R3', 'R4', 'R5'],
    /* Agent 候选 */
    'agent.candidateConfirm': SALES_ALL,
    'agent.candidateIgnore': SALES_ALL,
    'agent.candidateBatch': SALES_ALL,
    'agent.candidateRetry': SALES_ALL,
    'agent.organize': SALES_ALL,
    'agent.objectAI': SALES_ALL,
    'agent.reportDraft': SALES,
    'agent.managerView': MGR,
    /* 其他 */
    'export.granted': SALES_ALL,
    'batch.use': SALES_ALL,
    'import.use': ['R1', 'R2', 'R3', 'R4']
  };

  /* ------------------------------------------------------------ 数据范围 */

  /**
   * 返回当前角色可见的数据范围描述与判定。
   * scope: 'self' 仅本人 | 'team' 本团队 | 'all' 全部
   */
  function dataScope(user) {
    var u = user || S().currentUser();
    var r = u.role;
    if (r === 'R1') return { scope: 'self', label: '本人负责（含本人持有的线索、本人负责的经营关系与商机、本人任务与日报）' };
    if (r === 'R2') return { scope: 'team', label: '本团队（授权管理组织节点并包含下级组织）' };
    if (r === 'R3') return { scope: 'all', label: '全部（运营与配置视图，不做经营决策）' };
    if (r === 'R4') return { scope: 'all', label: '全部客户主数据（治理能力包视图）' };
    if (r === 'R5') return { scope: 'all', label: '全部（系统固定最高权限）' };
    if (r === 'R6') return { scope: 'self', label: '服务身份：调用用户权限 ∩ 服务身份权限' };
    return { scope: 'all', label: '全部' };
  }

  /**
   * 对象类型名归一：调用方按集合名（opportunities）或单数名（opp）传入都要能判定，
   * 否则数据范围会被静默跳过——数据范围必须真正参与判定，不能用前端隐藏代替。
   */
  var KIND_ALIAS = {
    customers: 'customer', customer: 'customer',
    contacts: 'contact', contact: 'contact',
    leads: 'lead', lead: 'lead',
    opportunities: 'opp', opportunity: 'opp', opps: 'opp', opp: 'opp',
    relations: 'relation', businessRelations: 'relation', relation: 'relation',
    tasks: 'task', task: 'task',
    activities: 'activity', activity: 'activity',
    visits: 'visit', visit: 'visit',
    schedules: 'schedule', schedule: 'schedule',
    reports: 'report', report: 'report',
    agentCandidates: 'candidate', candidate: 'candidate'
  };

  function activeCustomerRelations(customerId) {
    return RY.store.relationsOf(customerId).filter(function (r) { return r.status === '有效' && !!r.owner; });
  }

  function customerScopeType(customerId, userId) {
    var uid = userId || S().currentUser().id;
    var rels = activeCustomerRelations(customerId);
    if (rels.some(function (r) { return r.owner === uid; })) return 'mine';
    if (rels.some(function (r) { return (r.collaborators || []).indexOf(uid) >= 0; })) return 'collab';
    var me = S().currentUser();
    if (me.role !== 'R1' && rels.some(function (r) {
      return RY.store.inTeamOf(r.owner, uid) || (r.collaborators || []).some(function (x) { return RY.store.inTeamOf(x, uid); });
    })) return 'team';
    return '';
  }

  /** 客户范围只依据有效经营关系；主负责优先，「我负责」与「我协作」互斥。 */
  function customerInScope(customerId) {
    return !!customerScopeType(customerId);
  }

  function inScope(kind, obj) {
    var u = S().currentUser();
    var normalizedKind = KIND_ALIAS[kind] || kind;
    if (normalizedKind === 'opp' && (u.role === 'R3' || u.role === 'R4')) return false;
    var scope = dataScope(u).scope;
    if (scope === 'all') return true;
    if (!obj) return false;
    var k = normalizedKind;
    var teamOf = RY.store.inTeamOf;
    /* 本人负责或作为协同人的通用判定。 */
    function ownOrCollab(o) {
      if (o.owner === u.id) return true;
      if ((o.collaborators || []).indexOf(u.id) >= 0) return true;
      return false;
    }
    if (k === 'lead') {
      if (scope === 'self') return obj.owner === u.id;
      return true; /* 主管可见团队全部线索，含池内 */
    }
    if (k === 'opp') {
      if (scope === 'self') return obj.owner === u.id || (obj.team || []).some(function (m) { return m.userId === u.id; });
      if (scope === 'team') return obj.owner === u.id || teamOf(obj.owner, u.id) || (obj.team || []).some(function (m) { return m.userId === u.id; });
      return false;
    }
    if (k === 'customer' || k === 'relation') {
      if (scope === 'self') return customerInScope(obj.customerId || obj.id);
      return true;
    }
    /* 联系人没有独立经营权：按其关联客户的数据范围判断。 */
    if (k === 'contact') {
      if (scope !== 'self') return true;
      var links = RY.store.all('contactRelations').filter(function (x) { return x.contactId === obj.id; });
      if (!links.length) return true; /* 尚未关联任何客户的基础资料，不做隐藏 */
      return links.some(function (x) { return customerInScope(x.customerId); });
    }
    if (k === 'task' || k === 'activity' || k === 'visit' || k === 'schedule' || k === 'report' || k === 'candidate') {
      var ownerId = k === 'report' ? obj.userId : obj.owner;
      if (k === 'task' && obj.createdBy === u.id) return true;
      if (k === 'candidate') return ownerId === u.id;
      if (scope === 'self') return ownOrCollab(obj) || ownerId === u.id;
      return ownerId === u.id || teamOf(ownerId, u.id);
    }
    return true;
  }

  /* ------------------------------------------------------------ 字段规则 */

  /** 联系人手机号明文：需动作权限 + 独立字段级授权。 */
  function canViewPlainPhone() {
    return can('contact.plain') && grant('plain');
  }

  /* ------------------------------------------------------------ 演示开关 */

  /**
   * 原型演示开关，仅用于演示「未获授权 / 弱网 / 外部服务失败 / 并发冲突」的表达，
   * 不代表任何生产配置。
   */
  var GRANTS = { plain: false, export: false };
  var FLAGS = { weakNetwork: false, serviceError: false, conflict: false, keepSelection: true };

  function grant(key, value) {
    if (value === undefined) return !!GRANTS[key];
    GRANTS[key] = !!value;
    return GRANTS[key];
  }
  function flag(key, value) {
    if (value === undefined) return !!FLAGS[key];
    FLAGS[key] = !!value;
    return FLAGS[key];
  }

  /* ------------------------------------------------------------ 判定入口 */

  function can(action, obj) {
    var u = S().currentUser();
    var list = ACTIONS[action];
    /* 动作键放宽：动作表覆盖高频业务动作，页面内的通用展示判断（如「查看某区块」）不逐一登记。
       但未登记的动作会被记录，便于静态检查发现拼写错误或漏登记的动作。 */
    if (!list) { noteUnknown('action', action); return true; }
    if (u.role === 'R5') return true;
    if (list.indexOf(u.role) === -1) return false;
    /* 业务配置动作同时受能力项约束。 */
    var CAP_ACTION = {
      'config.editA': 'cap.config.edit', 'config.editB': 'cap.config.edit',
      'config.validate': 'cap.config.edit', 'config.publish': 'cap.config.publish',
      'config.toggle': 'cap.config.toggle', 'agentConfig.edit': 'cap.config.edit'
    };
    if (CAP_ACTION[action] && !cap(CAP_ACTION[action])) return false;
    if (action === 'customer.export' || action === 'contact.export' || action === 'lead.export' ||
        action === 'opp.export' || action === 'activity.export' || action === 'visit.export' ||
        action === 'task.export' || action === 'report.export') {
      return GRANTS.export;
    }
    if (obj) {
      if (obj.owner !== undefined && action.indexOf('lead.') === 0 && action !== 'lead.create' && action !== 'lead.import' && action !== 'lead.export') {
        var scope = dataScope(u).scope;
        if (scope === 'self' && obj.owner && obj.owner !== u.id) return false;
      }
      if (action === 'opp.advance' || action === 'opp.rollback' || action === 'opp.close' || action === 'opp.sleep' || action === 'opp.resume' || action === 'opp.reopen' || action === 'opp.team' || action === 'opp.split' || action === 'opp.lines' || action === 'opp.migrate' || action === 'opp.reassign' || action === 'opp.customer.change' || action === 'opp.nextAction') {
        if (obj.owner !== u.id && !(u.role === 'R2' && inScope('opportunities', obj))) return false;
      }
      if (action === 'task.complete') {
        if (obj.owner !== u.id) return false;
      }
      if (action === 'task.collabRecord' && obj.owner !== u.id && (obj.collaborators || []).indexOf(u.id) < 0) return false;
      if ((action === 'task.reschedule' || action === 'task.cancel') && obj.createdBy !== u.id) return false;
      if (action === 'report.advice' && obj.userId === u.id) return false;
    }
    return true;
  }

  /* 未登记的页面键一律拒绝（fail-closed）。页面清单是封闭集合，不能因为键名写错就默认放行，
     否则会形成「未登记正式业务入口」并且在评审中看不出差异。 */
  function page(key) {
    var list = PAGES[key];
    if (!list) { noteUnknown('page', key); return false; }
    var u = S().currentUser();
    if (u.role === 'R5') return true;
    if (list.indexOf(u.role) < 0) return false;
    if (CAP_PAGE[key] && !cap(CAP_PAGE[key])) return false;
    return true;
  }

  function whyNot(action) {
    var u = S().currentUser();
    var list = ACTIONS[action];
    if (!list) return '';
    if (list.indexOf(u.role) >= 0) {
      var CAP_ACTION = {
        'config.editA': 'cap.config.edit', 'config.editB': 'cap.config.edit',
        'config.validate': 'cap.config.edit', 'config.publish': 'cap.config.publish',
        'config.toggle': 'cap.config.toggle', 'agentConfig.edit': 'cap.config.edit'
      };
      if (CAP_ACTION[action] && !cap(CAP_ACTION[action])) {
        return '当前账号未获「' + CAPS[CAP_ACTION[action]].name + '」能力项授权。角色是默认权限集合，能力项才是服务端授权依据。';
      }
      if (!GRANTS.export && /\.export$/.test(action)) return '当前账号未获「导出」独立授权。导出属于独立授权动作，需要单独授予。';
      if (action === 'contact.plain' && !GRANTS.plain) return '当前账号未获「联系人敏感信息明文查看」字段级授权。';
      if (action === 'perm.grantR5') return '只有 R5 可以授予或撤销 R5；系统必须始终保留至少 1 个有效 R5。';
      return '';
    }
    var roleNames = list.map(function (r) { return ROLES[r].name; }).join('、');
    return '当前模拟身份为「' + u.name + '（' + ROLES[u.role].name + '）」，该动作仅对 ' + roleNames + ' 开放。权限由「角色页面权限 ∩ 动作权限 ∩ 数据范围 ∩ 字段规则 ∩ 当前对象状态」共同决定。';
  }

  /* ------------------------------------------------------------ 导航结构 */

  /* PC 五个一级导航分组（prd/00 §3）+ 首页。 */
  function navTree() {
    return [
      {
        key: 'home', name: '首页', href: 'pc.html',
        items: [{ key: 'home', name: '工作台首页', href: 'pc.html' }]
      },
      {
        key: 'customer', name: '客户管理', items: [
          { key: 'customer.list', name: '客户', href: 'pc/customer/list.html?menu=1' },
          { key: 'contact.list', name: '联系人', href: 'pc/contact/list.html' }
        ]
      },
      {
        key: 'sales', name: '销售管理', items: [
          { key: 'lead.list', name: '线索', href: 'pc/lead/list.html?menu=1' },
          { key: 'opp.list', name: '商机', href: 'pc/opportunity/list.html?menu=1' },
          { key: 'activity.list', name: '销售活动', href: 'pc/activity/list.html' }
        ]
      },
      {
        key: 'work', name: '工作管理', items: [
          { key: 'task.list', name: '任务', href: 'pc/task/list.html?menu=1' },
          { key: 'schedule.list', name: '日程', href: 'pc/schedule/list.html' },
          { key: 'report.list', name: '日报', href: 'pc/report/list.html?menu=1' }
        ]
      },
      {
        key: 'system', name: '系统管理', groups: [
          {
            name: '人员组织与权限', items: [
              { key: 'people.list', name: '人员组织与权限', href: 'pc/people/list.html' }
            ]
          },
          {
            name: '业务配置', items: [
              { key: 'cfg.dict', name: '字典管理', href: 'pc/config/dict.html' },
              { key: 'cfg.template', name: '商机流程模板', href: 'pc/config/template.html' },
              { key: 'cfg.leadPool', name: '线索池配置', href: 'pc/config/lead-pool.html' },
              { key: 'cfg.cusPool', name: '全国公海规则', href: 'pc/config/cus-pool.html' },
              { key: 'cfg.region', name: '区域与业务线', href: 'pc/config/region.html' },
              { key: 'cfg.task', name: '任务规则', href: 'pc/config/task-rule.html' },
              { key: 'cfg.visit', name: '拜访规则', href: 'pc/config/visit-rule.html' },
              { key: 'agent.config', name: 'Agent 配置', href: 'pc/agent/config.html' }
            ]
          },
          {
            name: '异常事项', items: [
              { key: 'exception.list', name: '异常事项', href: 'pc/exception/list.html' }
            ]
          },
          {
            name: '知识管理', items: [
              { key: 'knowledge.manage', name: '知识管理', href: 'pc/knowledge/list.html' }
            ]
          },
          {
            name: 'AI 运行记录与失败治理', items: [
              { key: 'ai.ops', name: 'AI 运行记录与失败治理', href: 'pc/ai/ops.html' }
            ]
          }
        ]
      }
    ];
  }

  /**
   * 按当前角色与能力项过滤；保留被裁剪原因以便页面明确标注，不伪造入口。
   * 保留全部节点，只把不可见的节点标记 allowed:false，由页面决定折叠或置灰。
   */
  function visibleNav() {
    function mark(it) {
      if (it.disabled) return it;
      return Object.assign({}, it, { allowed: page(it.key) });
    }
    /* 分组节点统一为 { name, items }；但单个叶子也可以直接挂在 groups 下，
       这里统一归一成 items，避免任何节点形状差异把页面打崩。 */
    function normGroup(gr) {
      var items = (gr.items || (gr.key ? [gr] : [])).map(mark);
      return Object.assign({}, gr, { items: items, allowed: items.some(function (i) { return i.allowed; }) });
    }
    return navTree().map(function (g) {
      if (g.groups) {
        var groups = g.groups.map(normGroup);
        var anyAllowed = groups.some(function (gr) { return gr.allowed; });
        var sysOk = page('exception.list') || page('quality.overview') || page('metric.def') ||
          page('agent.config') || page('knowledge.manage') || page('integration.system') ||
          page('msg.delivery') || page('ai.ops') || page('audit.list') ||
          page('people.list') || page('perm.config') || page('perm.pending') ||
          page('handover') || page('people.sync') ||
          page('cfg.dict') || page('cfg.oppField') || page('cfg.template') || page('cfg.leadPool') ||
          page('cfg.cusPool') || page('cfg.region') || page('cfg.task') || page('cfg.visit') ||
          page('metric.version');
        return Object.assign({}, g, { groups: groups, allowed: anyAllowed || sysOk });
      }
      return normGroup(g);
    });
  }

  /** 统一入口再鉴权：用在深链、搜索、消息跳转、列表进详情等所有入口。 */
  function guard(pageKey, objType, objId) {
    if (!page(pageKey)) {
      return { ok: false, kind: 'no-permission', reason: '当前账号没有「' + pageKey + '」的页面权限。' };
    }
    if (objId) {
      var obj = objType ? S().find(objType, objId) : null;
      if (!obj) return { ok: false, kind: 'unavailable', reason: '对象不存在，或已被合并、删除或因权限收敛不再对当前账号可见。' };
      if (!inScope(objType, obj)) {
        return { ok: false, kind: 'no-permission', reason: '该对象不在当前账号的数据范围内。' };
      }
    }
    return { ok: true };
  }

  return {
    ROLES: ROLES, PAGES: PAGES, ACTIONS: ACTIONS, CAPS: CAPS,
    can: can, page: page, whyNot: whyNot, dataScope: dataScope, inScope: inScope,
    customerInScope: customerInScope, customerScopeType: customerScopeType, activeCustomerRelations: activeCustomerRelations,
    canViewPlainPhone: canViewPlainPhone, grant: grant, flag: flag,
    cap: cap, capSet: capSet, unknown: function () { return { page: UNKNOWN.page.slice(), action: UNKNOWN.action.slice(), cap: UNKNOWN.cap.slice() }; },
    navTree: navTree, visibleNav: visibleNav, guard: guard
  };
})();
