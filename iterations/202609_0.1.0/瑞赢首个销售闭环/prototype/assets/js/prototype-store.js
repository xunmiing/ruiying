/* ==========================================================================
 * 瑞赢 0.1 · PC 原型跨页演示状态（prototype-store.js）
 * --------------------------------------------------------------------------
 * 职责：
 *  1. 以 sessionStorage 保存跨页演示状态：当前模拟角色、样例对象变更结果、
 *     列表作用域与筛选、批量选中、处理记录、消息已读状态。
 *  2. 提供对象级变更方法（新建、编辑、转换、阶段推进／回退、休眠、关闭、拆分、
 *     公海认领／分派／回收、批量与导入导出结果落库），保证跨页数据一致。
 *  3. 提供「重置演示数据」。
 *
 * 边界：本文件只负责演示状态与数据变更，不渲染任何业务页面，也不承担权限判定
 *       （权限判定见 permissions.js）。
 *
 * 说明：本原型不连接任何真实接口；所有「工商查询」「异步执行」「并发冲突」
 *       均为可预期的演示模拟，用于呈现交互和状态表达，不代表生产技术实现。
 * ========================================================================== */
window.RY = window.RY || {};

RY.store = (function () {
  'use strict';

  var KEY = RY.seed.meta.storeKey;
  var SEQ_START = { CUS: 20, CON: 12, LED: 150, OPP: 60, OBL: 20, CBL: 20, CPH: 10, CREL: 10, ADR: 20, CR: 10, TSK: 90, ACT: 100, VH: 10, EXC: 10, JOB: 10, MSG: 300, AUD: 10, CRQ: 1,
    /* 0.1 全量原型新增对象序列 */
    SCH: 10, RPT: 10, RUN: 10, CAND: 10, KB: 10, MT: 10, MD: 10, EXT: 10, SYNC: 10, QI: 10, QR: 10, PP: 10, HO: 10, PSY: 10 };

  var db = null;

  function normalizeStageTask(t, s) {
    var o = (s.opportunities || []).filter(function (x) { return x.id === t.oppId; })[0];
    t.name = t.name || t.title;
    t.title = t.title || t.name;
    t.source = '规则生成';
    t.bizType = '阶段任务';
    t.stageTask = true;
    t.systemGenerated = true;
    t.related = { type: '商机', id: t.oppId, name: o ? o.name : t.oppId };
    t.collaborators = t.collaborators || [];
    t.needAccept = false;
    t.acceptor = '';
    t.acceptorRule = '';
    t.dueAt = t.dueAt || t.due || '';
    t.due = t.dueAt;
    t.ruleVersion = t.ruleVersion || t.templateVersion || '';
    t.stageRound = t.stageRound || 1;
    t.createdAt = t.createdAt || t.enteredAt || now();
    t.createdBy = t.createdBy || '系统';
    t.flowSnapshot = t.flowSnapshot || { ruleCode: 'TR-STAGE-V1', ruleVersion: 'V1', frozenAt: t.createdAt };
    t.history = t.history || [{ at: t.createdAt, actor: '系统', action: '阶段进入生成正式任务', from: '', to: t.status }];
    return t;
  }

  function normalizeTasks(s) {
    s.tasks = s.tasks || [];
    (s.stageTasks || []).forEach(function (t) {
      if (!s.tasks.some(function (existing) { return existing.id === t.id; })) s.tasks.unshift(normalizeStageTask(t, s));
    });
    delete s.stageTasks;
    s.tasks.forEach(function (t) {
      if (t.stageTask) {
        t.oppId = t.oppId || (t.related && t.related.id) || '';
        normalizeStageTask(t, s);
      }
      var old = t.status;
      if (['待接收', '待确认', '待完成', '进行中'].indexOf(old) >= 0) t.status = '待处理';
      else if (old === '待验收') t.status = '已完成';
      else if (old === '已拒绝' || old === '已失效') {
        t.status = '已取消';
        t.cancelReason = t.cancelReason || t.rejectReason || t.invalidReason || '旧演示状态迁移';
      }
      t.needAccept = false;
      t.acceptor = '';
      t.acceptorRule = '';
      if (t.flowSnapshot) { delete t.flowSnapshot.needAccept; delete t.flowSnapshot.acceptor; }
      if (old !== t.status) {
        t.history = t.history || [];
        t.history.push({ at: now(), actor: '系统', action: '旧原型任务状态迁移', from: old, to: t.status });
      }
    });
    return s;
  }

  function now() {
    var d = new Date();
    function p(n) { return n < 10 ? '0' + n : '' + n; }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function today() { return now().slice(0, 10); }

  function addDays(dateStr, n) {
    var d = dateStr ? new Date(dateStr.replace(/-/g, '/')) : new Date();
    d.setDate(d.getDate() + n);
    function p(x) { return x < 10 ? '0' + x : '' + x; }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }

  function fresh() {
    var s = RY.cloneSeed();
    normalizeRegions(s);
    normalizeTasks(s);
    normalizeVisits(s);
    normalizeTaskExamples(s);
    normalizeScheduleExamples(s);
    normalizeReportSnapshots(s);
    s.runtime = {
      role: 'R1',
      userId: 'U-001',
      seq: JSON.parse(JSON.stringify(SEQ_START)),
      listState: {},
      selection: {},
      uiState: {},
      lastImport: null
    };
    return s;
  }

  /* 区域配置单一来源：regionRules 是配置页维护的权威数据（含外部稳定编码、CRM 映射、状态与历史），
     demo 里另有一份薄的 regions 仅供旧读取点使用。统一指向同一份，避免「配置页改了、业务侧读不到」。 */
  function normalizeRegions(s) {
    if (!s.regionRules || !s.regionRules.length) s.regionRules = s.regions || [];
    s.regions = s.regionRules;
    return s;
  }

  function normalizeVisits(s) {
    var h5VisitRelation = (RY.seed.businessRelations || []).filter(function (x) { return x.id === 'CBL-H5-0001'; })[0];
    if (h5VisitRelation && !(s.businessRelations || []).some(function (x) { return x.id === h5VisitRelation.id; })) {
      s.businessRelations.push(JSON.parse(JSON.stringify(h5VisitRelation)));
    }
    (RY.seed.visits || []).filter(function (v) { return /^VH-H5-000[23]$/.test(v.id); }).forEach(function (example) {
      if (!(s.visits || []).some(function (v) { return v.id === example.id; })) s.visits.push(JSON.parse(JSON.stringify(example)));
    });
    (s.visitRules || []).forEach(function (r) {
      r.familyCode = r.familyCode || String(r.code || '').replace(/-V\d+.*$/, '');
      r.scopeSpec = r.scopeSpec || { businessLines: r.code === 'VR-CE-V2' ? ['BL-CE'] : [], regions: [], users: [], visitTypes: [] };
    });
    (s.visits || []).forEach(function (v) {
      var rel = (s.businessRelations || []).filter(function (x) {
        return x.customerId === v.customerId && x.owner === v.owner && x.status === '有效';
      })[0];
      v.businessLine = v.businessLine || (rel && rel.businessLine) || '';
      v.region = v.region || (rel && rel.region) || '';
      v.exceptionIssues = v.exceptionIssues || (v.checkInIssue ? [v.checkInIssue] : []);
      v.supplements = v.supplements || [];
      v.corrections = v.corrections || [];
      if (!v.ruleSnapshot && v.review && v.review.ruleVersion) {
        var old = (s.visitRules || []).filter(function (r) { return r.code === v.review.ruleVersion; })[0];
        if (old) v.ruleSnapshot = { id: old.id, code: old.code, version: old.version, radius: old.radius,
          accuracy: old.accuracy, duration: old.duration, imageRequired: !!old.imageRequired, boundAt: v.createdAt || '' };
      }
    });
    return s;
  }

  function normalizeActivityExample(s) {
    var example = (RY.seed.activities || []).filter(function (x) { return x.id === 'ACT-202609-0090'; })[0];
    var saved = (s.activities || []).filter(function (x) { return x.id === 'ACT-202609-0090'; })[0];
    if (!example || !saved || saved.origin || saved.createdAt || (saved.corrections || []).length) return s;
    ['channel', 'target', 'request', 'agreement', 'nextAction', 'origin', 'aiResult', 'evidence', 'corrections', 'history'].forEach(function (key) {
      saved[key] = JSON.parse(JSON.stringify(example[key]));
    });
    return s;
  }

  function normalizeTaskExamples(s) {
    (RY.seed.tasks || []).filter(function (x) { return /^TSK-(PC|H5)-/.test(x.id); }).forEach(function (example) {
      if (!(s.tasks || []).some(function (x) { return x.id === example.id; })) s.tasks.push(JSON.parse(JSON.stringify(example)));
    });
    var pending = (RY.seed.tasks || []).filter(function (x) { return x.id === 'TSK-202609-0098'; })[0];
    if (pending && !(s.tasks || []).some(function (x) { return x.id === pending.id; })) s.tasks.push(JSON.parse(JSON.stringify(pending)));
    var seeded = (RY.seed.tasks || []).filter(function (x) { return x.id === 'TSK-202609-0091'; })[0];
    var current = (s.tasks || []).filter(function (x) { return x.id === 'TSK-202609-0091'; })[0];
    if (seeded && current && !current.collabRecords) current.collabRecords = JSON.parse(JSON.stringify(seeded.collabRecords || []));
    normalizeTasks(s);
    return s;
  }

  function normalizeCandidateExamples(s) {
    s.agentCandidates = s.agentCandidates || [];
    (RY.seed.agentCandidates || []).filter(function (x) { return /^CAND-(H5|PC)-TASK-/.test(x.id); }).forEach(function (example) {
      if (!s.agentCandidates.some(function (x) { return x.id === example.id; })) s.agentCandidates.push(JSON.parse(JSON.stringify(example)));
    });
    return s;
  }

  function normalizeReportSnapshots(s) {
    var firstDraft = (RY.seed.reports || []).filter(function (x) { return x.id === 'RPT-202609-0003'; })[0];
    var savedFirstDraft = (s.reports || []).filter(function (x) { return x.id === 'RPT-202609-0003'; })[0];
    if (firstDraft && savedFirstDraft && savedFirstDraft.status !== '已提交' && !(savedFirstDraft.sources || []).length) {
      savedFirstDraft.sources = JSON.parse(JSON.stringify(firstDraft.sources || []));
    }
    var example = (RY.seed.reports || []).filter(function (x) { return x.id === 'RPT-202609-0004'; })[0];
    if (example && !(s.reports || []).some(function (x) { return x.userId === example.userId && x.date === example.date; })) {
      s.reports.push(JSON.parse(JSON.stringify(example)));
    }
    (s.reports || []).forEach(function (r) {
      if (r.status === '已提交' && !r.frozenFacts) r.frozenFacts=JSON.parse(JSON.stringify(r.facts || {}));
      if (r.status === '已提交' && !r.frozenSources) r.frozenSources=JSON.parse(JSON.stringify(r.sources || []));
    });
    return s;
  }

  function normalizeScheduleExamples(s) {
    (RY.seed.schedules || []).filter(function (x) { return x.id==='SCH-202609-0005' || x.id==='SCH-202609-0006' || /^SCH-H5-CAL-/.test(x.id); }).forEach(function (example) {
      if (!(s.schedules || []).some(function (x) { return x.id===example.id; })) s.schedules.push(JSON.parse(JSON.stringify(example)));
    });
    return s;
  }

  function load() {
    if (db) return db;
    var raw = null;
    try { raw = window.sessionStorage.getItem(KEY); } catch (e) { raw = null; }
    if (raw) {
      try { db = JSON.parse(raw); } catch (e2) { db = null; }
    }
    if (!db || !db.runtime || !db.customers) db = fresh();
    else { normalizeRegions(db); normalizeTasks(db); normalizeVisits(db); normalizeActivityExample(db); normalizeTaskExamples(db); normalizeCandidateExamples(db); normalizeScheduleExamples(db); normalizeReportSnapshots(db); }
    var migratedLeadStatus = false;
    (db.leads || []).forEach(function (lead) {
      if (lead.status === '待培育') {
        migratedLeadStatus = true;
        lead.status = lead.lastFollowUpAt ? '跟进中' : '待处理';
        if (!lead.nextAction && lead.cultivateReason) lead.nextAction = lead.cultivateReason;
        if (!lead.nextFollowUp && lead.cultivateReview) lead.nextFollowUp = lead.cultivateReview + ' 10:00';
      }
    });
    (db.opportunities || []).forEach(function (opp) {
      if (opp.closeResult === '终止') opp.closeResult = '关闭';
      if (opp.processStatus === '休眠') opp.processStatus = '进行中';
      if (opp.closeResult) opp.processStatus = '已结束';
      else opp.processStatus = '进行中';
    });
    if (migratedLeadStatus) save();
    var maxTaskSeq = (db.tasks || []).reduce(function (max, t) {
      var match = /^TSK-\d{6}-(\d+)$/.exec(String(t.id || ''));
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);
    db.runtime.seq.TSK = Math.max(db.runtime.seq.TSK || 0, maxTaskSeq);
    db.runtime.seq.RPT = Math.max(db.runtime.seq.RPT || 0, (db.reports || []).reduce(function (max, r) { var m = /^RPT-\d{6}-(\d+)$/.exec(String(r.id || '')); return m ? Math.max(max, Number(m[1])) : max; }, 0));
    return db;
  }

  function save() {
    try { window.sessionStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* 隐私模式下降级为内存态 */ }
    return db;
  }

  function restoreOpportunitySnapshot(snapshot, opportunity) {
    var restored = snapshot.opportunities.filter(function (x) { return x.id === opportunity.id; })[0];
    if (restored) {
      Object.keys(opportunity).forEach(function (k) { delete opportunity[k]; });
      Object.keys(restored).forEach(function (k) { opportunity[k] = restored[k]; });
      snapshot.opportunities[snapshot.opportunities.indexOf(restored)] = opportunity;
    }
    db = snapshot; save();
  }

  function reset() {
    db = fresh();
    save();
    return db;
  }

  function month() { return RY.seed.meta.demoDate.slice(0, 7).replace('-', ''); }

  function nextId(prefix, pad) {
    load();
    var n = (db.runtime.seq[prefix] || 0) + 1;
    db.runtime.seq[prefix] = n;
    var s = '' + n;
    while (s.length < (pad || 4)) s = '0' + s;
    return prefix + '-' + month() + '-' + s;
  }

  function nextOpportunityLineId() {
    var max = 0;
    all('opportunities').forEach(function (o) {
      (o.lines || []).forEach(function (line) {
        var match = /^OBL-(\d+)$/.exec(String(line.code || ''));
        if (match) max = Math.max(max, Number(match[1]));
      });
    });
    return 'OBL-' + String(max + 1).padStart(4, '0');
  }

  /* --------------------------------------------------------------- 角色 */

  function role() { return load().runtime.role; }
  /* 原型演示身份：切换角色时同步切换到该角色的代表性演示用户，
     使「我的／团队」范围、日报归属和权限结果自洽。生产系统没有身份切换。 */
  var ROLE_REP = { R1: 'U-001', R2: 'U-003', R3: 'U-004', R4: 'U-005', R5: 'U-006' };
  function setRole(r) {
    load().runtime.role = r;
    if (ROLE_REP[r]) load().runtime.userId = ROLE_REP[r];
    save();
  }
  function setUser(id) { load().runtime.userId = id; save(); }
  function currentUser() {
    var st = load().runtime;
    // 日报跨端走查使用同一名销售主管，确保 PC 与 H5 打开的是同一份本人草稿。
    if (/\/pc\/report\/(?:list|detail)\.html$/.test(window.location.pathname)) {
      return db.users.filter(function (u) { return u.id === 'U-003'; })[0] || db.users[0];
    }
    // 其余 PC 页面仍固定原演示账号。
    if (/\/(?:pc(?:\/|\.html$)|architecture\.html$)/.test(window.location.pathname)) {
      return db.users.filter(function (u) { return u.id === 'U-006'; })[0] || db.users[0];
    }
    // H5 也固定一个可走查销售与主管业务的演示账号；角色权限仍按正式模型在页面说明展示。
    if (document.body && document.body.getAttribute('data-end') === 'h5') {
      return db.users.filter(function (u) { return u.id === 'U-003'; })[0] || db.users[0];
    }
    var byId = db.users.filter(function (u) { return u.id === st.userId; })[0];
    if (byId) return byId;
    var candidates = db.users.filter(function (u) { return u.role === st.role; });
    return candidates[0] || db.users[0];
  }
  function user(id) {
    load();
    for (var i = 0; i < db.users.length; i++) if (db.users[i].id === id) return db.users[i];
    return null;
  }
  function userName(id) { var u = user(id); return u ? u.name : '—'; }

  /* --------------------------------------------------------------- 查询 */

  function find(list, id) {
    load();
    var arr = list === 'stageTasks' ? db.tasks.filter(function (t) { return t.stageTask; }) : (db[list] || []);
    for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i];
    return null;
  }
  function all(list) {
    load();
    if (list === 'stageTasks') return db.tasks.filter(function (t) { return t.stageTask; });
    if (list === 'tasks' && /\/h5\//.test(window.location.pathname)) return db.tasks.filter(function (t) { return !t.pcReviewExample; });
    return db[list] || [];
  }

  /* 可选的启用区域：停用区域不能用于新的选择；历史数据与列表筛选仍可展示停用值。 */
  function activeRegions() {
    return all('regions').filter(function (r) { return !r.status || r.status === '启用'; });
  }

  function customer(id) { return find('customers', id); }
  function contact(id) { return find('contacts', id); }
  function lead(id) { return find('leads', id); }
  function opp(id) { return find('opportunities', id); }
  function job(id) { return find('jobs', id); }
  function template(code, version) {
    var ts = all('templates');
    for (var i = 0; i < ts.length; i++) {
      if (ts[i].code === code && (!version || ts[i].version === version)) return ts[i];
    }
    return null;
  }
  function templateByKey(code, version) {
    return template(code, version);
  }
  function customField(code) {
    var fs = all('customFields');
    for (var i = 0; i < fs.length; i++) if (fs[i].code === code) return fs[i];
    return null;
  }
  function regionName(code) {
    var rs = all('regions');
    for (var i = 0; i < rs.length; i++) if (rs[i].code === code) return rs[i].name;
    return code || '—';
  }
  function businessLineName(code) {
    var bs = all('businessLines');
    for (var i = 0; i < bs.length; i++) if (bs[i].code === code) return bs[i].name;
    return code || '—';
  }
  /* 场景解析：调用方既可能持有场景编码（模板与商机都存 code），也可能持有场景名称，
     两种都接受；找不到返回 null，由调用方显式处理。 */
  function scenarioByLine(line, scene) {
    var ss = all('scenarios');
    for (var i = 0; i < ss.length; i++) {
      if (ss[i].businessLine === line && (ss[i].code === scene || ss[i].name === scene)) return ss[i];
    }
    return null;
  }
  /* 场景显示名：按业务线＋编码/名称取，取不到时回退为原值，避免页面出现空文本。 */
  function sceneName(line, scene) {
    var s = scenarioByLine(line, scene);
    return s ? s.name : (scene || '—');
  }
  function scenarioOptions(line) {
    return all('scenarios').filter(function (s) { return s.businessLine === line; });
  }
  function enabledScenarioOptions(line) {
    return scenarioOptions(line).filter(function (s) { return s.status !== '停用'; });
  }
  function scenarioSave(code, patch, reason) {
    load(); patch = patch || {};
    var item = code ? all('scenarios').filter(function (s) { return s.code === code; })[0] : null;
    var newCode = String(patch.code || code || '').trim();
    if (!String(reason || '').trim()) return { ok: false, msg: '新增或编辑销售场景需要填写原因。' };
    if (!newCode || !String(patch.name || '').trim() || !patch.businessLine) return { ok: false, msg: '场景编码、名称和所属业务线必填。' };
    if (!all('businessLines').some(function (b) { return b.code === patch.businessLine && b.status === '启用'; })) return { ok: false, msg: '请选择启用状态的业务线。' };
    if (all('scenarios').some(function (s) { return s.code === newCode && s !== item; })) return { ok: false, msg: '销售场景编码已存在。' };
    if (item && newCode !== code) return { ok: false, msg: '场景编码不可修改；请停用旧场景并新建场景。' };
    if (item && item.businessLine !== patch.businessLine) return { ok: false, msg: '已有销售场景不能更改所属业务线；请停用旧场景并在目标业务线新建。' };
    if (!item) { item = { code: newCode, history: [] }; all('scenarios').push(item); }
    var before = JSON.stringify({ name: item.name || '', businessLine: item.businessLine || '', status: item.status || '启用' });
    item.name = String(patch.name).trim(); item.businessLine = patch.businessLine; item.status = patch.status || item.status || '启用';
    item.history = item.history || [];
    item.history.push({ at: stamp(), by: me().id, action: code ? '编辑销售场景' : '新建销售场景', from: before, to: JSON.stringify(patch), reason: reason || '' });
    audit('业务配置', '销售场景｜' + item.code, code ? '编辑销售场景' : '新增销售场景', before, JSON.stringify(patch));
    save(); return { ok: true, item: item };
  }
  function scenarioToggle(code, status, reason) {
    if (status !== '启用' && status !== '停用') return { ok: false, msg: '场景状态无效。' };
    var s = all('scenarios').filter(function (x) { return x.code === code; })[0];
    if (!s) return { ok: false, msg: '销售场景不存在。' };
    if (!String(reason || '').trim()) return { ok: false, msg: '启用或停用场景需要填写原因。' };
    var before = s.status || '启用'; s.status = status;
    s.history = s.history || []; s.history.push({ at: stamp(), by: me().id, action: status === '停用' ? '停用销售场景' : '启用销售场景', from: before, to: status, reason: reason });
    audit('业务配置', '销售场景｜' + code, status === '停用' ? '停用销售场景' : '启用销售场景', before, status + '｜' + reason);
    save(); return { ok: true, item: s };
  }

  /** 模板唯一匹配：主业务线 + 销售场景 → 恰一个生效模板。返回 {state, template, candidates} */
  function matchTemplate(lineCode, sceneCode, opts) {
    opts = opts || {};
    if (opts.forceServiceError) return { state: 'service-error', candidates: [] };
    var ts = all('templates').filter(function (t) {
      return t.businessLine === lineCode && t.scene === sceneCode && t.status === '生效';
    });
    var line = all('businessLines').filter(function (b) { return b.code === lineCode; })[0];
    var scenario = scenarioByLine(lineCode, sceneCode);
    if (!line || line.status !== '启用' || !scenario || scenario.status === '停用') return { state: 'missing', template: null, candidates: [] };
    if (ts.length === 1) return { state: 'ok', template: ts[0], candidates: ts };
    if (ts.length === 0) return { state: 'missing', template: null, candidates: ts };
    return { state: 'multi', template: null, candidates: ts };
  }

  /* --------------------------------------------------------- 客户与关系 */

  function relationsOf(customerId) {
    return all('businessRelations').filter(function (r) { return r.customerId === customerId; });
  }

  function createCustomer(input) {
    load();
    var id = nextId('CUS');
    var c = {
      id: id, name: input.name, alias: input.alias || '', type: input.type, status: '正常',
      identity: input.identity || '未核验', creditCode: input.creditCode || '',
      creditMissing: !input.creditCode && input.type !== '自然人客户',
      value: '', valueReview: '', valueAdjustedAt: '', valueReviewer: '',
      legalPerson: input.legalPerson || '', regCapital: input.regCapital || '', foundDate: input.foundDate || '',
      industry: input.industry || '', businessScope: input.businessScope || '',
      source: input.source || '人工录入', remark: input.remark || '',
      createdAt: now(), updatedAt: now(),
      industrySource: input.industrySource || '工商查询服务', industryQueriedAt: now(),
      industryState: input.industryState || '正常成功',
      contactsCount: 0, oppsCount: 0
    };
    db.customers.unshift(c);
    audit('客户', id, '新建客户', '—', c.name + '（' + c.type + '）');
    save();
    return c;
  }

  function activeRelationsOf(customerId) {
    return relationsOf(customerId).filter(function (r) { return r.status === '有效' && !!r.owner; });
  }

  function ownerRegionOptions(ownerId) {
    var u = user(ownerId || currentUser().id);
    return u ? (u.region || []).slice() : [];
  }

  /* 建档统一入口：客户主档与初始经营关系同一事务创建。
     0.1 不按角色改写默认负责人，也不以区域／业务线资格阻断提交。 */
  function createCustomerWithInitialRelation(customerInput, relationInput, idempotencyKey) {
    load();
    db.runtime.idempotency = db.runtime.idempotency || {};
    if (idempotencyKey && db.runtime.idempotency[idempotencyKey]) return db.runtime.idempotency[idempotencyKey];
    relationInput = relationInput || {};
    var owner = relationInput.owner || currentUser().id;
    var region = relationInput.region;
    var line = relationInput.businessLine;
    if (!customerInput || !String(customerInput.name || '').trim()) return { ok: false, reason: '请填写客户名称。' };
    if (!user(owner)) return { ok: false, reason: '负责人不存在或已失效。' };
    if (!region || !all('regions').some(function (x) { return x.code === region && (!x.status || x.status === '启用'); })) {
      return { ok: false, reason: '请选择有效经营区域（已停用的区域不能用于新的选择）。' };
    }
    if (!line || !all('businessLines').some(function (x) { return x.code === line && x.status === '启用'; })) return { ok: false, reason: '请选择有效业务线。' };
    var snapshot = JSON.parse(JSON.stringify(db));
    try {
      var c = createCustomer(customerInput);
      var rel = {
        id: nextId('CBL'), customerId: c.id, customerName: c.name,
        region: region, businessLine: line, status: '有效', owner: owner,
        collaborators: [], poolRecordId: '', protectUntil: '', lastActivityAt: today(), createdAt: today()
      };
      db.businessRelations.unshift(rel);
      audit('客户经营关系', rel.id, '创建初始经营关系', '—', c.name + '｜' + regionName(region) + '｜' + businessLineName(line) + '｜主负责人：' + userName(owner));
      var result = { ok: true, customer: c, relation: rel };
      if (idempotencyKey) db.runtime.idempotency[idempotencyKey] = result;
      save();
      return result;
    } catch (e) {
      db = snapshot;
      save();
      return { ok: false, reason: '创建失败，客户主档与初始经营关系均未创建。' };
    }
  }

  function updateCustomer(id, patch, actionName) {
    load();
    var c = customer(id);
    if (!c) return null;
    var before = [];
    Object.keys(patch).forEach(function (k) {
      if (c[k] !== patch[k]) before.push(k + '：' + (c[k] || '—'));
      c[k] = patch[k];
    });
    c.updatedAt = now();
    if (before.length) audit('客户', id, actionName || '普通字段编辑', before.join('；'), Object.keys(patch).map(function (k) { return k + '：' + (patch[k] || '—'); }).join('；'));
    save();
    return c;
  }

  function createContact(input) {
    load();
    var id = nextId('CON');
    var phones = Array.isArray(input.phones) ? input.phones.filter(Boolean) : (input.phonePlain ? [input.phonePlain] : []);
    var wechats = Array.isArray(input.wechats) ? input.wechats.filter(Boolean) : (input.wechat ? [input.wechat] : []);
    var plain = phones[0] || '';
    var c = {
      id: id, name: input.name, phone: input.phone || maskPhone(plain), phonePlain: plain, phones: phones,
      wechat: wechats[0] || '', wechats: wechats, email: input.email || '', title: input.title || '',
      org: input.org || '', addressId: '', createdAt: now(), lastContactAt: ''
    };
    db.contacts.unshift(c);
    audit('联系人', id, '新建联系人', '—', c.name);
    save();
    return c;
  }

  function maskPhone(p) {
    if (!p || p.length < 7) return p || '';
    return p.slice(0, 3) + '****' + p.slice(7);
  }

  function addContactRelation(contactId, customerId, roles, dept, title, primary) {
    load();
    /* 同一联系人＋客户只保留一条有效关系：已存在时直接复用，不新建（prd/01 §4） */
    var existed = activeContactRelation(contactId, customerId);
    if (existed) return existed;
    var id = nextId('CR');
    var r = { id: id, contactId: contactId, customerId: customerId, roles: roles, dept: dept || '', title: title || '', primary: !!primary, status: '有效', from: today() };
    db.contactRelations.unshift(r);
    var c = customer(customerId);
    if (c) c.contactsCount = all('contactRelations').filter(function (x) { return x.customerId === customerId && x.status === '有效'; }).length;
    audit('联系人关系', id, '新增联系人客户关系', '—', customerId);
    save();
    return r;
  }

  /* 建档统一入口：正式联系人与首条客户关系同一事务创建。
     prd/01 §4：销售人工创建正式联系人必须同时关联至少一个真实客户，不开放孤立创建。 */
  function createContactWithRelation(contactInput, relationInput, idempotencyKey) {
    load();
    db.runtime.idempotency = db.runtime.idempotency || {};
    if (idempotencyKey && db.runtime.idempotency[idempotencyKey]) return db.runtime.idempotency[idempotencyKey];
    relationInput = relationInput || {};
    var cus = relationInput.customerId ? customer(relationInput.customerId) : null;
    if (!contactInput || !String(contactInput.name || '').trim()) return { ok: false, reason: '请填写联系人姓名。' };
    if (!cus) return { ok: false, reason: '正式联系人必须关联一个真实客户；如客户尚未建档，请先创建客户。' };
    if (cus.status !== '正常') return { ok: false, reason: '客户「' + cus.name + '」当前状态为「' + cus.status + '」，不能建立联系人关系。' };
    var roles = (relationInput.roles || []).filter(function (x) { return !!x; });
    if (!roles.length) return { ok: false, reason: '请至少选择一个客户角色。' };
    var snapshot = JSON.parse(JSON.stringify(db));
    try {
      var c = createContact(contactInput);
      var rel = addContactRelation(c.id, cus.id, roles, relationInput.dept, relationInput.title || contactInput.title, !!relationInput.primary);
      var result = { ok: true, contact: c, relation: rel, customer: cus };
      if (idempotencyKey) db.runtime.idempotency[idempotencyKey] = result;
      save();
      return result;
    } catch (e) {
      db = snapshot;
      save();
      return { ok: false, reason: '创建失败，联系人与客户关系均未创建。' };
    }
  }

  function createAddress(input) {
    load();
    var id = nextId('ADR');
    var a = {
      id: id, ownerType: input.ownerType, ownerId: input.ownerId, type: input.type,
      region: input.region, detail: input.detail, source: input.source || '人工录入', createdAt: now()
    };
    db.addresses.unshift(a);
    audit('地址', id, '新增地址', '—', a.type + ' ' + a.detail);
    save();
    return a;
  }

  function removeAddress(id, reason) {
    load();
    var idx = db.addresses.findIndex(function (x) { return x.id === id; });
    if (idx < 0) return { ok: false, reason: '地址不存在或已被移除。' };
    var a = db.addresses[idx];
    if (a.type === '注册地址') return { ok: false, reason: '注册地址属于高影响字段，请走资料变更申请。' };
    db.addresses.splice(idx, 1);
    audit('地址', id, '移除当前地址', a.type + '｜' + a.region + '｜' + a.detail, '已移除｜说明：' + (reason || '—'));
    save();
    return { ok: true, address: a };
  }

  function setCustomerIdentity(customerId, value, note) {
    load();
    var c = customer(customerId);
    if (!c) return { ok: false, reason: '客户不存在。' };
    if (['未核验', '已核验', '需复核'].indexOf(value) < 0) return { ok: false, reason: '核验状态不合法。' };
    var from = c.identity;
    c.identity = value;
    c.updatedAt = now();
    audit('客户', customerId, '身份核验调整', from, value + (note ? '｜说明：' + note : ''));
    save();
    return { ok: true, customer: c };
  }

  function submitGroupCandidate(input) {
    load();
    var id = nextId('GC');
    db.exceptions.unshift({
      id: id, objectType: '客户候选', objectId: id, target: '集团客户建档', type: '高影响建档',
      status: '待处理', handler: '', source: '销售', createdAt: now(), updatedAt: now(),
      note: '集团名称：' + input.name + '｜其他名称：' + (input.alias || '—') + '｜申请说明：' + (input.note || '—'), values: input
    });
    audit('客户候选', id, '提交集团客户候选', '—', input.name);
    save();
    return db.exceptions[0];
  }

  function confirmGroupCandidate(exceptionId, relationInput) {
    load();
    var e = find('exceptions', exceptionId);
    if (!e || e.type !== '高影响建档' || e.status === '已完成') return { ok: false, reason: '集团候选不存在或已处理。' };
    var v = e.values || {};
    var made = createCustomerWithInitialRelation({ name: v.name, alias: v.alias || '', type: '集团客户', creditCode: v.creditCode || '', source: v.source || '销售提交', remark: v.note || '' }, relationInput || v.initialRelation, 'group-confirm:' + exceptionId);
    if (!made.ok) return made;
    e.status = '已完成'; e.handler = currentUser().id; e.updatedAt = now(); e.createdCustomerId = made.customer.id;
    audit('客户候选', exceptionId, '正式确认集团客户', '候选', made.customer.id + '｜' + made.relation.id);
    save();
    return made;
  }

  function setCustomerValue(customerId, value, reason) {
    load();
    var c = customer(customerId);
    if (!c) return null;
    if (c.value === value) return null;
    if (c.value && !reason) return null;
    var from = c.value;
    c.value = value;
    c.valueReview = '';
    c.valueAdjustedAt = today();
    c.valueReviewer = '';
    c.updatedAt = now();
    db.valueHistory.unshift({
      id: nextId('VH'), customerId: customerId, action: from ? '调整' : '设置', from: from, to: value,
      reason: reason, operator: currentUser().name, at: now()
    });
    audit('客户', customerId, '客户价值' + (from ? '调整' : '设置'), from || '未分级', (value || '未分级') + (reason ? '｜说明：' + reason : ''));
    save();
    return c;
  }

  function reviewCustomerValue(customerId, agree, reason) {
    return null; /* 旧 H5 原型的兼容入口；0.1 不再允许价值复核写入。 */
  }

  function handleException(id, action) {
    load();
    var e = find('exceptions', id);
    if (!e) return null;
    if (action === 'claim') { e.status = '处理中'; e.handler = currentUser().id; }
    if (action === 'return') { e.status = '待处理'; e.handler = ''; }
    if (action === 'done') { e.status = '已完成'; e.handler = e.handler || currentUser().id; }
    if (action === 'reject') { e.status = '不采纳'; e.handler = e.handler || currentUser().id; }
    e.updatedAt = now();
    if (action === 'done' && e.submitted && e.objectId) {
      var c = customer(e.objectId);
      if (c && e.submitted.name) c.name = e.submitted.name;
      if (c && e.submitted.creditCode) { c.creditCode = e.submitted.creditCode; c.creditMissing = false; }
    }
    audit('异常事项', id, '异常处理·' + action, e.status, e.status);
    save();
    return e;
  }

  /* ----------------------------------------------------------- 全国公海 */

  function poolRecords() {
    return all('poolRecords').filter(function (p) { return p.status === '有效'; });
  }

  function claimPool(recordId, actorId, input, operation) {
    load();
    input = input || {};
    var action = operation === 'assign' ? '分派' : '认领';
    if (db.cusPoolRule && db.cusPoolRule.claimActions && db.cusPoolRule.claimActions[action] === false) return { ok: false, reason: action + '入口已由全国公海规则关闭。' };
    var p = find('poolRecords', recordId);
    if (!p || p.status !== '有效') return { ok: false, reason: '该公海记录已不在池内。' };
    if (p.claimedBy) return { ok: false, reason: '该客户已被' + userName(p.claimedBy) + '认领，请刷新后重试。' };
    if (activeRelationsOf(p.customerId).length) return { ok: false, reason: '该客户已存在有效经营关系，不能从全国公海认领或分派。' };
    if (!input.region || !input.businessLine) return { ok: false, reason: '认领时必须选择经营区域和业务线。' };
    var poolRule = db.cusPoolRule || {};
    if (poolRule.holdLimit > 0 && db.businessRelations.filter(function (rel) { return rel.status === '有效' && rel.owner === actorId; }).length >= poolRule.holdLimit) return { ok: false, reason: '目标负责人已达到全国公海持有上限。' };
    p.claimedBy = actorId;
    p.status = '已认领';
    p.claimAt = now();
    var c = customer(p.customerId);
    var rel = { id: nextId('CBL'), customerId: p.customerId, customerName: c.name, region: input.region, businessLine: input.businessLine, status: '有效', owner: actorId, collaborators: [], poolRecordId: '', protectUntil: poolRule.protectEnabled ? addDays(today(), Number(poolRule.protectDays) || 0) : '', lastActivityAt: today(), createdAt: today() };
    db.businessRelations.unshift(rel);
    p.relationId = rel.id;
    audit('客户', p.customerId, '全国公海认领', '无有效经营关系', regionName(input.region) + '｜' + businessLineName(input.businessLine) + '｜主负责人：' + userName(actorId));
    save();
    return { ok: true, record: p, relation: rel };
  }

  function assignPool(recordId, targetId, input) {
    var r = claimPool(recordId, targetId, input, 'assign');
    if (r.ok) { r.record.status = '已分派'; r.record.assignedTo = targetId; r.record.assignAt = now(); save(); }
    return r;
  }

  /* 停止经营关系；当客户已无其他有效关系时，系统自动将客户主档放入全国公海。 */
  function releasePool(relationId, reason) {
    load();
    var rel = find('businessRelations', relationId);
    if (!rel) return null;
    var prev = rel.owner;
    rel.status = '停止经营';
    rel.stopReason = reason || '停止经营';
    rel.owner = '';
    rel.poolRecordId = '';
    rel.protectUntil = '';
    var c = customer(rel.customerId);
    if (activeRelationsOf(rel.customerId).length) { save(); return rel; }
    var existing = poolRecords().filter(function (p) { return p.customerId === rel.customerId; })[0];
    if (!existing) db.poolRecords.unshift({
      id: nextId('CPH'), customerId: rel.customerId,
      customerName: rel.customerName, customerType: c ? c.type : '—', customerValue: c ? c.value : '',
      status: '有效',
      entryAt: now(), entryReason: '最后一条有效经营关系停止', entryNote: reason || '', lastActivityAt: rel.lastActivityAt,
      claimable: true, prevOwner: prev, prevCollaborators: (rel.collaborators || []).slice(), previousRelationIds: [rel.id]
    });
    rel.collaborators = [];
    audit('客户', rel.customerId, '进入全国公海', '存在有效经营关系', '无有效经营关系');
    save();
    return rel;
  }

  function recyclePool(relationId, reason) {
    return releasePool(relationId, reason || '停止经营');
  }

  function addCollaborator(relationId, userId) {
    load();
    var rel = find('businessRelations', relationId);
    if (!rel) return null;
    rel.collaborators = rel.collaborators || [];
    if (rel.collaborators.indexOf(userId) === -1) rel.collaborators.push(userId);
    audit('客户经营关系', relationId, '新增协作人', '—', userName(userId));
    save();
    return rel;
  }

  function stopOperating(relationId, reason) {
    return releasePool(relationId, reason || '停止经营');
  }

  /* 主动建立额外经营关系（prd/01 §8.2）：
     新建客户已原子创建初始经营关系；本入口用于已有客户增加其他经营关系。
     销售只能在本人同时具备该区域与该业务线资格时建立；默认本人为主负责人，可同时加协作人。
     校验顺序：客户可用 → 区域/业务线 → 资格 → 重复单元 → 公海占用 → 持有上限。
     主动建关系不产生保护期：保护期只由全国公海分派或认领产生。 */
  var RELATION_HOLD_LIMIT = 30;

  function relationHoldCount(userId) {
    var uid = userId || currentUser().id;
    return all('businessRelations').filter(function (r) {
      return r.status === '有效' && r.owner === uid;
    }).length;
  }

  function userQualified(userId, region, businessLine) {
    var u = user(userId || currentUser().id);
    if (!u) return false;
    return (u.region || []).indexOf(region) !== -1 && (u.businessLine || []).indexOf(businessLine) !== -1;
  }

  function relationPrecheck(customerId, region, businessLine) {
    var c = customer(customerId);
    if (!c) return { ok: false, reason: '客户不存在或已被合并，请返回列表重新进入。' };
    if (c.status !== '正常') return { ok: false, reason: '客户当前状态为「' + c.status + '」，不能建立经营关系。' };
    if (!region) return { ok: false, reason: '请选择区域。' };
    if (!businessLine) return { ok: false, reason: '请选择业务线。' };
    if (!userQualified(null, region, businessLine)) {
      return { ok: false, reason: '你在「' + regionName(region) + '／' + businessLineName(businessLine) + '」不具备资格，不能主动建立经营关系。' };
    }
    var same = all('businessRelations').filter(function (r) {
      return r.customerId === customerId && r.region === region && r.businessLine === businessLine;
    });
    /* 公海与有效经营关系互斥：池内客户应通过认领或分派创建初始关系。 */
    var pool = all('poolRecords').filter(function (p) {
      return p.customerId === customerId && p.status === '有效';
    })[0];
    if (pool) {
      return { ok: false, reason: '该客户当前在全国公海（' + pool.id + '），请通过认领或主管分派创建初始经营关系。' };
    }
    var dup = same.filter(function (r) { return r.status === '有效'; })[0];
    if (dup) {
      return { ok: false, reason: '该客户在「' + regionName(region) + '／' + businessLineName(businessLine) + '」已有有效经营关系（' + dup.id + '，主负责人：' + (dup.owner ? userName(dup.owner) : '空') + '）。同一经营单元不能重复建立，如需接手请走公海认领或主管分派。' };
    }
    if (relationHoldCount() >= RELATION_HOLD_LIMIT) {
      return { ok: false, reason: '你当前主负责的有效经营关系已达上限（' + relationHoldCount() + ' / ' + RELATION_HOLD_LIMIT + ' 条）。持有量只统计主负责的有效关系，协作与停止经营不计。请先停止不再经营的关系或由主管转派。' };
    }
    return { ok: true, stopped: same.filter(function (r) { return r.status === '停止经营'; })[0] || null };
  }

  function createRelation(customerId, input) {
    load();
    var pre = relationPrecheck(customerId, input.region, input.businessLine);
    if (!pre.ok) return pre;
    var c = customer(customerId);
    var owner = input.owner || currentUser().id;
    var rel = pre.stopped;
    if (rel) {
      /* 同一单元曾停止经营：恢复原单元，不再建第二个单元，避免重复经营单元。 */
      rel.status = '有效';
      rel.owner = owner;
      rel.collaborators = (input.collaborators || []).slice();
      rel.stopReason = '';
      rel.poolRecordId = '';
      rel.protectUntil = '';
      rel.lastActivityAt = today();
      audit('客户经营关系', rel.id, '恢复经营', '停止经营',
        '有效（主负责人：' + userName(owner) + '｜' + regionName(rel.region) + '｜' + businessLineName(rel.businessLine) + '）');
    } else {
      rel = {
        id: nextId('CBL'), customerId: customerId, customerName: c.name,
        region: input.region, businessLine: input.businessLine, status: '有效',
        owner: owner, collaborators: (input.collaborators || []).slice(),
        poolRecordId: '', protectUntil: '', lastActivityAt: today(), createdAt: today()
      };
      db.businessRelations.unshift(rel);
      audit('客户经营关系', rel.id, '主动建立经营关系', '—',
        c.name + '｜' + regionName(rel.region) + '｜' + businessLineName(rel.businessLine) + '｜主负责人：' + userName(owner));
    }
    save();
    return { ok: true, relation: rel, restarted: !!pre.stopped };
  }

  /* 指派／直接转派主负责人（prd/01 §8.2）：
     主管可直接转派，不经全国公海；目标须通过资格与持有上限校验；
     默认保留协作人，也可同次调整。与主动建关系一样不产生保护期。
     注意：这里既不创建也不清除 protectUntil —— 保护期只由公海认领或分派产生，
     转派时既有保护期属于该经营单元，是否延续不由原型擅自决定。 */
  function relationCandidates(region, businessLine, excludeId) {
    return all('users').filter(function (x) {
      if (x.id === excludeId) return false;
      if (x.role !== 'R1' && x.role !== 'R2') return false;
      return userQualified(x.id, region, businessLine);
    });
  }

  function relationOwnerPrecheck(relationId, targetId) {
    var rel = find('businessRelations', relationId);
    if (!rel) return { ok: false, reason: '经营关系不存在，请返回列表重新进入。' };
    if (rel.status !== '有效') return { ok: false, reason: '该经营关系当前为「' + rel.status + '」，不能调整主负责人。' };
    if (!targetId) return { ok: false, reason: '请选择目标主负责人。' };
    if (rel.owner === targetId) return { ok: false, reason: '目标已是该经营关系的主负责人，无需调整。' };
    if (!userQualified(targetId, rel.region, rel.businessLine)) {
      return { ok: false, reason: userName(targetId) + '不具备「' + regionName(rel.region) + '／' + businessLineName(rel.businessLine) + '」的经营资格，不能作为主负责人。' };
    }
    var n = relationHoldCount(targetId);
    if (n >= RELATION_HOLD_LIMIT) {
      return { ok: false, reason: userName(targetId) + ' 当前主负责的有效经营关系已达上限（' + n + ' / ' + RELATION_HOLD_LIMIT + ' 条），不能承接新的经营单元。' };
    }
    return { ok: true, relation: rel };
  }

  function setRelationOwner(relationId, targetId, opts) {
    load();
    opts = opts || {};
    var pre = relationOwnerPrecheck(relationId, targetId);
    if (!pre.ok) return pre;
    var rel = pre.relation;
    var before = rel.owner ? userName(rel.owner) : '空（待分配）';
    var keep = opts.collaborators === undefined || opts.collaborators === null;
    var cols = keep ? (rel.collaborators || []) : (opts.collaborators || []);
    /* 新主负责人不应同时是自己的协作人。 */
    rel.collaborators = cols.filter(function (x) { return x !== targetId; });
    rel.owner = targetId;
    rel.poolRecordId = '';
    rel.lastActivityAt = today();
    audit('客户经营关系', rel.id, opts.action || '直接转派主负责人', '主负责人：' + before,
      '主负责人：' + userName(targetId) + '（原因：' + (opts.reason || '—') + '）'
      + (keep ? '｜协作人保留' : '｜协作人同次调整为：' + (rel.collaborators.length ? rel.collaborators.map(userName).join('、') : '无')));
    save();
    return { ok: true, relation: rel };
  }

  function assignRelationOwner(relationId, targetId, reason) {
    return setRelationOwner(relationId, targetId, { reason: reason, action: '指派主负责人' });
  }

  function transferRelation(relationId, targetId, opts) {
    return setRelationOwner(relationId, targetId, opts);
  }

  /* ----------------------------------------------------------------- 线索 */

  function createLead(input) {
    load();
    var id = nextId('LED');
    var l = {
      id: id, raw: input.raw, source: input.source, sourceRecord: input.sourceRecord || '人工录入',
      status: '待处理', customerId: input.customerId || '', contactId: input.contactId || '',
      phone: input.phone || '', contactName: input.contactName || '',
      salesRegionProvince: input.salesRegionProvince || '', salesRegionCity: input.salesRegionCity || '',
      candidateLines: input.candidateLines || [], candidateProducts: [],
      currentPool: input.currentPool || '', sourcePool: input.sourcePool || '', owner: input.owner || '',
      protectUntil: '', nextAction: '', nextFollowUp: '', lastFollowUpAt: '',
      idempotencyKey: input.idempotencyKey || '',
      createdAt: now(), createdBy: currentUser().id
    };
    if (l.owner) {
      var pool = poolOf(l.sourcePool);
      l.protectUntil = pool && pool.protectEnabled ? addDays(today(), pool.protectDays) + ' 22:00' : '';
    } else if (l.currentPool && !l.owner) {
      l.currentPool = l.currentPool;
    }
    db.leads.unshift(l);
    audit('线索', id, '新建线索', '—', l.raw.slice(0, 30));
    save();
    return l;
  }

  function poolOf(code) {
    var ps = all('leadPools');
    for (var i = 0; i < ps.length; i++) if (ps[i].code === code) return ps[i];
    return null;
  }

  function updateLead(id, patch, actionName) {
    load();
    var l = lead(id);
    if (!l) return null;
    var before = Object.keys(patch).map(function (k) {
      var oldValue = l[k] === undefined || l[k] === '' ? '未填写' : l[k];
      var newValue = patch[k] === undefined || patch[k] === '' ? '未填写' : patch[k];
      return k + '：' + oldValue + ' → ' + newValue;
    });
    Object.keys(patch).forEach(function (k) { l[k] = patch[k]; });
    audit('线索', id, actionName || '线索编辑', '—', before.join('；'));
    save();
    return l;
  }

  function leadAction(id, action, payload) {
    load();
    var l = lead(id);
    if (!l) return { ok: false, reason: '线索不存在。' };
    payload = payload || {};
    /* 版本校验（prd/02 §3.2 认领需校验状态和版本）：调用方传入展示版本时生效，
       版本不一致说明他人已更新，先刷新再操作。 */
    if (payload.version && l.updatedAt && payload.version !== l.updatedAt) {
      return { ok: false, reason: '该线索已被其他人更新，请刷新后重试。' };
    }
    var pool = poolOf(l.sourcePool) || poolOf(l.currentPool);

    if (action === 'claim') {
      if (l.status === '已转化' || l.status === '无效') return { ok: false, reason: '终态线索不允许认领。' };
      if (!l.currentPool) return { ok: false, reason: '该线索当前不在池内，无法认领。' };
      var p = poolOf(l.currentPool);
      if (!p || !p.allowClaim) return { ok: false, reason: '当前池未开放主动认领。' };
      if (l.claimLocked) return { ok: false, reason: '该线索已被他人认领，请刷新后查看最新归属。' };
      if (payload.holdCount >= p.holdLimit) return { ok: false, reason: '你当前持有的线索已达该池上限（' + p.holdLimit + ' 条）。' };
      l.owner = currentUser().id;
      l.currentPool = '';
      /* 归属动作只改变归属事实，不改变业务状态：prd/02 §3.2 明文规定分派不改状态；
         认领同理——「跟进中」要求至少一条正式销售活动，认领本身不产生活动（prd/02 §2）。 */
      l.protectUntil = p.protectEnabled ? addDays(today(), p.protectDays) + ' 22:00' : '';
    }
    if (action === 'assign') {
      if (l.status === '已转化' || l.status === '无效') return { ok: false, reason: '终态线索不允许分派。' };
      if (!payload.target) return { ok: false, reason: '请选择目标负责人。' };
      /* 池内分派：目标必须是该池成员，且是可承接线索的销售角色（prd/02 §3.2） */
      var tk = leadTargetCheck(payload.target, { requireMember: true, pool: poolOf(l.currentPool) || pool, candidateLines: l.candidateLines });
      if (!tk.ok) return tk;
      l.owner = payload.target;
      l.currentPool = '';
      l.protectUntil = pool && pool.protectEnabled ? addDays(today(), pool.protectDays) + ' 22:00' : '';
    }
    if (action === 'transfer') {
      if (!l.owner || l.currentPool) return { ok: false, reason: '只有当前负责人可转交负责人名下的线索。' };
      if (!payload.target) return { ok: false, reason: '请选择受让人。' };
      /* 转交不经池：目标须有效且有数据范围，不要求属于原池；成功后清保护期（prd/02 §3.4） */
      var tk2 = leadTargetCheck(payload.target, { requireMember: false, candidateLines: l.candidateLines });
      if (!tk2.ok) return tk2;
      l.owner = payload.target;
      l.protectUntil = '';
    }
    if (action === 'returnPool') {
      if (!l.owner || !l.sourcePool) return { ok: false, reason: '仅可退回当前负责人从线索池取得的线索。' };
      if (!payload.note) return { ok: false, reason: '请填写退回原因。' };
      var returnTarget = poolOf(payload.pool || l.sourcePool);
      if (!returnTarget || returnTarget.status !== '启用' || !returnTarget.returnEnabled) return { ok: false, reason: '目标池不可接收退回线索。' };
      l.currentPool = returnTarget.code;
      l.owner = '';
      l.protectUntil = '';
      /* 退回只改归属与保护事实，不把「跟进中」改回「待处理」（prd/02 §2） */
    }
    if (action === 'recycle') {
      if (!l.owner) return { ok: false, reason: '当前线索没有负责人，无需回收。' };
      if (!payload.note) return { ok: false, reason: '请填写回收原因。' };
      var recycleTarget = poolOf(payload.pool);
      if (!recycleTarget || recycleTarget.status !== '启用') return { ok: false, reason: '请选择可接收线索的有效目标池。' };
      l.currentPool = recycleTarget.code;
      l.owner = '';
      l.protectUntil = '';
      /* 回收同上：状态由销售活动与显式动作决定，不随归属变化回退 */
    }
    if (action === 'nurture' || action === 'nurtureReview') return { ok: false, reason: '线索不再提供待培育状态，请使用下一步动作和下次跟进时间安排后续处理。' };
    if (action === 'invalid') {
      l.status = '无效';
      l.invalidReason = payload.reason;
      l.invalidNote = payload.note || '';
      l.currentPool = '';
      l.protectUntil = '';
    }
    if (action === 'correctInvalid') {
      l.status = l.statusBeforeInvalid || '跟进中';
      l.owner = l.ownerBeforeInvalid || '';
      l.protectUntil = l.protectUntilBeforeInvalid || '';
      l.currentPool = l.ownerBeforeInvalid ? '' : (l.poolBeforeInvalid || '');
      l.correctNote = payload.reason;
      l.correctedBy = currentUser().id;
      l.correctedAt = now();
      l.invalidReason = '';
    }
    l.updatedAt = now();
    audit('线索', id, '线索动作·' + action, '—', payload.note || action);
    save();
    return { ok: true, lead: l };
  }

  function paramDays(key, dft) {
    var params = all('params') || [];
    for (var i = 0; i < params.length; i++) if (params[i].key === key) return params[i].value;
    return dft;
  }

  /* 客户查重（prd/01 §3.2 分层查重）：信用代码规范化后全库精确相同**必须阻断**；
     名称相同／高度相似只作**强提示**，用户说明原因后可继续；不自动合并。 */
  function normCredit(v) { return String(v || '').replace(/[\s-]/g, '').toUpperCase(); }
  function customerDupCandidates(name, creditCode, excludeId) {
    var n = String(name || '').trim(), code = normCredit(creditCode);
    var cs = all('customers').filter(function (c) { return c.id !== excludeId; });
    var mustBlock = code ? cs.filter(function (c) { return normCredit(c.creditCode) === code; }) : [];
    var warn = n ? cs.filter(function (c) {
      return c.name === n || c.name.indexOf(n) >= 0 || (n.length > 3 && n.indexOf(c.name) >= 0);
    }) : [];
    return { mustBlock: mustBlock, warn: warn.filter(function (c) { return mustBlock.indexOf(c) < 0; }) };
  }

  /* 联系人＋客户只保留一条有效关系 */
  function activeContactRelation(contactId, customerId) {
    return all('contactRelations').filter(function (r) {
      return r.contactId === contactId && r.customerId === customerId && r.status === '有效';
    })[0] || null;
  }

  /* 线索归属动作的目标校验（prd/02 §3.2／§3.4）：
     目标必须是可承接线索的销售角色；池内分派还必须是该池成员；候选业务线有值时要求业务线范围有交集。 */
  function leadTargetCheck(targetId, opts) {
    opts = opts || {};
    var u = user(targetId);
    if (!u) return { ok: false, reason: '目标负责人不存在或已失效。' };
    if (['R1', 'R2'].indexOf(u.role) < 0) {
      return { ok: false, reason: u.name + ' 当前角色（' + u.role + '）不是可承接线索的销售角色。' };
    }
    if (opts.requireMember) {
      var p = opts.pool;
      if (!p) return { ok: false, reason: '该线索当前不在池内，无法执行池内分派。' };
      if ((p.members || []).indexOf(targetId) < 0) {
        return { ok: false, reason: '池内分派的目标销售必须是「' + p.name + '」的成员。' };
      }
    }
    var lines = opts.candidateLines || [];
    var scope = u.businessLine || [];
    if (lines.length && scope.length && !lines.some(function (c) { return scope.indexOf(c) >= 0; })) {
      return { ok: false, reason: u.name + ' 的业务线范围与线索候选业务线无交集，不在该线索的数据范围内。' };
    }
    return { ok: true };
  }

  function convertLead(id, payload) {
    load();
    payload = payload || {};
    var l = lead(id);
    if (!l) return { ok: false, reason: '线索不存在。' };

    /* 幂等：同一线索的重复提交返回首次成功结果，不再生成任何对象（演示一致性要求；
       prd/02 §9 将跨系统补偿与幂等键列为 0.1 不做，此处只保证页面重复提交不重复建对象）。 */
    db.runtime.convertResults = db.runtime.convertResults || {};
    if (db.runtime.convertResults[id]) return db.runtime.convertResults[id];

    if (l.status === '已转化') return { ok: false, reason: '该线索已转化，不允许重复转换。' };
    if (l.status === '无效') return { ok: false, reason: '无效线索需先由主管或有权限人员纠错后才能转换。' };
    if (!payload.opportunities || !payload.opportunities.length || !payload.opportunities.every(function (o) { return !!o.customerMode; })) {
      return { ok: false, reason: '整条转换至少新建一条商机，且每条商机必须独立选择客户。' };
    }
    return convertLeadByOpportunity(id, l, payload);

  }

  /* 每条新商机独立确定客户和联系人，整条线索仍只提交一次。 */
  function convertLeadByOpportunity(id, l, payload) {
    var P = (typeof RY !== 'undefined' && RY.perm) ? RY.perm : null;
    var opps = payload.opportunities || [];
    var errs = [];
    if (P && !P.can('lead.convert', l)) errs.push('当前账号没有该线索的转换权限。');
    if (P && !P.can('opp.create')) errs.push('当前账号没有新建商机权限。');
    if (!opps.length) errs.push('至少新建一条商机。');
    opps.forEach(function (o, i) {
      var tag = '商机 ' + (i + 1) + '：';
      if (!String(o.name || '').trim()) errs.push(tag + '名称必填。');
      if (!o.businessLine || !all('businessLines').some(function (b) { return b.code === o.businessLine && b.status === '启用'; })) errs.push(tag + '请选择有效主业务线。');
      if (!o.scene || matchTemplate(o.businessLine, o.scene).state !== 'ok') errs.push(tag + '销售场景和唯一生效模板未通过校验。');
      if (!o.owner || !user(o.owner) || !leadTargetCheck(o.owner, { candidateLines: o.businessLine ? [o.businessLine] : [] }).ok) {
        errs.push(tag + '请选择有资格承接该业务线的主负责人。');
      }
      if (o.customerMode === 'link') {
        var existing = customer(o.customerId);
        if (!existing || existing.status !== '正常' || (P && P.inScope && !P.inScope('customer', existing))) errs.push(tag + '请选择有权使用的正常客户。');
      } else if (o.customerMode === 'reuse') {
        var prior = Number(o.reuseIndex);
        if (!/^\d+$/.test(String(o.reuseIndex)) || prior >= i || !opps[prior] || opps[prior].customerMode !== 'create') errs.push(tag + '请选择前面在本次转换中新建的客户。');
      } else if (o.customerMode === 'create') {
        var ci = o.customer || {};
        if (P && !P.can('customer.create')) errs.push(tag + '当前账号没有新建客户权限。');
        if (!String(ci.name || '').trim() || !ci.region || !ci.businessLine || !user(ci.owner)) errs.push(tag + '新客户名称、区域、业务线和初始经营关系负责人必填。');
        var dup = customerDupCandidates(ci.name, ci.creditCode);
        if (dup.mustBlock.length || (dup.warn.length && !String(o.dupReason || '').trim())) errs.push(tag + '客户查重未通过，请关联已有客户或填写查重说明。');
      } else errs.push(tag + '请选择新建或关联客户。');
      if (o.contactMode === 'create') {
        if (P && !P.can('contact.create')) errs.push(tag + '当前账号没有新建联系人权限。');
        if (!String((o.contact || {}).name || '').trim() || !(o.contact.roles || []).length) errs.push(tag + '联系人姓名和客户角色必填。');
      } else if (o.contactMode === 'link') {
        if (!contact(o.contactId) || !(o.contactRoles || []).length) errs.push(tag + '请选择已有联系人和客户角色。');
      }
    });
    if (errs.length) return { ok: false, reason: errs.join('；'), errors: errs };
    var snapshot = JSON.parse(JSON.stringify(db));
    try {
      var result = { customer: null, contact: null, opportunities: [], created: [], relations: [] };
      var customersByRow = [];
      opps.forEach(function (o, i) {
        var c;
        if (o.customerMode === 'create') {
          var ci = o.customer;
          var made = createCustomerWithInitialRelation({ name: ci.name, type: ci.type, creditCode: ci.creditCode || '', alias: ci.alias || '', source: '线索转换' },
            { region: ci.region, businessLine: ci.businessLine, owner: ci.owner }, 'lead-convert:' + id + ':customer:' + i);
          if (!made.ok) throw new Error('商机 ' + (i + 1) + ' 的客户创建失败：' + made.reason);
          c = made.customer;
          result.created.push({ type: '客户', id: c.id, name: c.name });
          result.created.push({ type: '经营关系', id: made.relation.id, name: c.name });
          result.relations.push(made.relation);
        } else if (o.customerMode === 'reuse') c = customersByRow[Number(o.reuseIndex)];
        else c = customer(o.customerId);
        customersByRow[i] = c;
        if (o.contactMode === 'create') {
          var ct = o.contact;
          var madeContact = createContactWithRelation({ name: ct.name, phonePlain: ct.phone || '', title: ct.title || '' },
            { customerId: c.id, roles: ct.roles, dept: ct.dept, title: ct.title, primary: true }, 'lead-convert:' + id + ':contact:' + i);
          if (!madeContact.ok) throw new Error('商机 ' + (i + 1) + ' 的联系人创建失败：' + madeContact.reason);
          result.created.push({ type: '联系人', id: madeContact.contact.id, name: madeContact.contact.name });
          if (!result.contact) result.contact = madeContact.contact;
        } else if (o.contactMode === 'link') {
          var linked = contact(o.contactId);
          if (!activeContactRelation(linked.id, c.id)) addContactRelation(linked.id, c.id, o.contactRoles, o.contactDept || '', o.contactTitle || '', false);
          if (!result.contact) result.contact = linked;
        }
        var madeOpp = createOpportunity({ name: o.name, customerId: c.id, owner: o.owner, allowOwnerAssignment: true,
          businessLine: o.businessLine, scene: o.scene, predictedClose: o.predictedClose || '', scope: o.scope || '',
          salesRegionProvince: o.salesRegionProvince || l.salesRegionProvince || '', salesRegionCity: o.salesRegionCity || l.salesRegionCity || '', source: '线索转换', sourceLead: id });
        if (!madeOpp.ok) throw new Error('商机 ' + (i + 1) + ' 创建失败：' + madeOpp.reason);
        result.opportunities.push(madeOpp.opportunity);
        result.created.push({ type: '商机', id: madeOpp.opportunity.id, name: madeOpp.opportunity.name });
        if (!result.customer) result.customer = c;
      });
      l.status = '已转化'; l.convertAt = now(); l.convertBy = currentUser().id;
      l.convertTargets = result.created.map(function (x) { return x.id; });
      if (!l.customerId && result.opportunities.length === 1) l.customerId = result.opportunities[0].customerId;
      if (!l.contactId && result.opportunities.length === 1 && result.contact) l.contactId = result.contact.id;
      l.currentPool = ''; l.protectUntil = ''; l.updatedAt = now();
      audit('线索', id, '整条转换', payload.fromStatus || '待处理', '已转化');
      var okResult = { ok: true, result: result, lead: l };
      db.runtime.convertResults[id] = okResult;
      save();
      return okResult;
    } catch (e) {
      db = snapshot;
      save();
      return { ok: false, reason: '转换失败，已恢复转换前的全部状态：' + (e && e.message ? e.message : '未知写入错误') };
    }
  }

  /* ----------------------------------------------------------------- 商机 */

  function createOpportunity(input) {
    load();
    var m = matchTemplate(input.businessLine, input.scene);
    if (m.state !== 'ok') return { ok: false, match: m, reason: matchReason(m, input) };
    var selectedCustomer = input.customerId ? customer(input.customerId) : null;
    if (!input.customerId || !selectedCustomer) {
      return { ok: false, match: m, reason: '正式商机必须关联有效客户。' };
    }
    if (selectedCustomer.status !== '正常') return { ok: false, match: m, reason: '只有正常客户或带待治理标签的客户可以创建商机。' };
    if (!input.name) return { ok: false, match: m, reason: '商机名称必填。' };
    var id = nextId('OPP');
    var tpl = m.template;
    var o = {
      id: id, name: input.name, customerId: input.customerId, owner: input.allowOwnerAssignment && user(input.owner) ? input.owner : currentUser().id,
      processStatus: '进行中', templateCode: tpl.code, templateVersion: tpl.version,
      currentStageCode: tpl.stages[0].code, predictedClose: input.predictedClose || '',
      salesRegionProvince: input.salesRegionProvince || '', salesRegionCity: input.salesRegionCity || '',
      nextAction: '', nextActionAt: '',
      lines: [{ code: nextId('OBL'), businessLine: input.businessLine, role: '主业务线', scene: input.scene, scope: input.scope || '', status: '当前参与' }],
      team: [{ userId: input.allowOwnerAssignment && user(input.owner) ? input.owner : currentUser().id, role: '主负责人' }],
      custom: {}, stageHistory: [{ from: '', to: tpl.stages[0].code, at: now(), by: currentUser().id, note: '创建商机，自动进入首个详细阶段' }],
      stageEnteredAt: now(), source: input.source || '直接创建', sourceLead: input.sourceLead || '',
      closeResult: '', closeBasis: '', closeReason: '', closeNote: '', closedAt: '', closedBy: '',
      createdAt: now(), updatedAt: now()
    };
    db.opportunities.unshift(o);
    var initialEntry = o.stageHistory[0];
    initialEntry.eventId = nextId('SEV');
    generateStageTasks(o, tpl.stages[0], initialEntry);
    var c = customer(input.customerId);
    if (c) c.oppsCount = all('opportunities').filter(function (x) { return x.customerId === input.customerId; }).length;
    audit('商机', id, '新建商机', '—', o.name + '｜模板 ' + tpl.name + ' ' + tpl.version);
    save();
    return { ok: true, opportunity: o, match: m };
  }

  function updateOpportunitySalesRegion(o, province, city) {
    load();
    if (!o || !opp(o.id)) return { ok: false, reason: '商机不存在或已不可用。' };
    province = String(province || '').trim(); city = String(city || '').trim();
    if (!!province !== !!city) return { ok: false, reason: '省份和城市请同时填写，或同时留空。' };
    var before = (o.salesRegionProvince || '未填写') + ' · ' + (o.salesRegionCity || '未填写');
    var after = province && city ? province + ' · ' + city : '未填写';
    if (before === after) return { ok: true, opportunity: o };
    o.salesRegionProvince = province; o.salesRegionCity = city; o.updatedAt = now();
    audit('商机', o.id, '修改销售归属地区', before, after);
    save();
    return { ok: true, opportunity: o };
  }

  function matchReason(m, input) {
    var line = businessLineName(input.businessLine);
    if (m.state === 'missing') return '未找到「' + line + ' ＋ ' + input.scene + '」对应的生效流程模板，商机无法创建。请确认主业务线与销售场景，或联系销售运营补齐模板配置。';
    if (m.state === 'multi') return '「' + line + ' ＋ ' + input.scene + '」匹配到多条生效模板，无法唯一确定使用哪一条，商机无法创建。';
    if (m.state === 'service-error') return '流程模板校验服务暂时不可用，商机无法创建。已保留当前页面填写内容，可稍后重试。';
    return '商机创建失败。';
  }

  function currentTemplate(o) {
    var t = template(o.templateCode, o.templateVersion);
    return t;
  }

  /* 停滞仅是进行中商机的风险提醒。 */
  function opportunityStagnation(o) {
    if (!o || !o.stageEnteredAt) return { days: 0, threshold: 0, on: false, paused: false };
    var tpl = currentTemplate(o), threshold = tpl ? Number(tpl.stagnantDays || 14) : 14;
    function day(v) { var d = new Date(String(v || '').replace(/-/g, '/').slice(0, 10)); return isNaN(d.getTime()) ? null : Math.floor(d.getTime() / 86400000); }
    var start = day(o.stageEnteredAt), end = day(today());
    var days = start === null || end === null ? 0 : Math.max(0, end - start);
    return { days: days, threshold: threshold, on: o.processStatus === '进行中' && !o.closeResult && days > threshold, paused: false };
  }

  function currentStage(o) {
    var t = currentTemplate(o);
    if (!t) return null;
    for (var i = 0; i < t.stages.length; i++) if (t.stages[i].code === o.currentStageCode) return t.stages[i];
    return null;
  }

  function stageIndex(o) {
    var t = currentTemplate(o);
    if (!t) return -1;
    for (var i = 0; i < t.stages.length; i++) if (t.stages[i].code === o.currentStageCode) return i;
    return -1;
  }

  function currentStageEntryEvent(o) {
    if (!o) return null;
    var events = o.stageHistory || [];
    for (var i = events.length - 1; i >= 0; i--) {
      if (events[i].to === o.currentStageCode && events[i].at === o.stageEnteredAt && events[i].eventId) return events[i];
    }
    return null;
  }
  function isSystemStageTask(task) {
    return !!(task && (task.systemGenerated || /^阶段进入事件(?:\s|$)/.test(String(task.generatedBy || ''))));
  }

  function generateStageTasks(o, stage, entryEvent) {
    if (!stage || !stage.tasks || !stage.tasks.length) return [];
    var created = [];
    entryEvent = entryEvent || (o.stageHistory || []).filter(function (h) {
      return h.to === stage.code && h.at === o.stageEnteredAt;
    }).slice(-1)[0];
    if (!entryEvent) return created;
    if (!entryEvent.eventId) entryEvent.eventId = nextId('SEV');
    stage.tasks.forEach(function (tk, taskIndex) {
      var dup = all('stageTasks').some(function (x) {
        return x.oppId === o.id && x.stageEntryEventId === entryEvent.eventId && x.templateTaskIndex === taskIndex;
      });
      if (dup) return;
      var dueAt = tk.dueDays === undefined || tk.dueDays === null ? '' : addDays(today(), tk.dueDays) + ' 23:59';
      var id = nextId('TSK');
      var generated = normalizeStageTask({
        id: id, oppId: o.id, templateVersion: o.templateCode + '-' + o.templateVersion,
        stageEntryEventId: entryEvent.eventId, templateTaskIndex: taskIndex,
        stageCode: stage.code, stageRound: (o.stageHistory || []).filter(function (h) { return h.to === stage.code; }).length,
        title: tk.title, desc: tk.desc, must: !!tk.must, due: dueAt, dueAt: dueAt,
        status: '待处理', owner: o.owner, systemGenerated: true,
        needAccept: false, acceptor: '', acceptorRule: '',
        flowSnapshot: { ruleCode: 'TR-STAGE-V1', ruleVersion: 'V1', frozenAt: now() },
        generatedBy: '阶段进入事件 ' + entryEvent.eventId, enteredAt: entryEvent.at, assigneeChanged: false
      }, db);
      db.tasks.unshift(generated);
      audit('任务', id, '阶段进入生成正式任务', '—', generated.name);
      created.push(id);
    });
    return created;
  }

  /** 门槛校验：预计成交时间系统固定门槛 + 模板必填字段 + 必须完成的阶段任务 */
  function gateCheck(o, direction) {
    var t = currentTemplate(o);
    var stage = currentStage(o);
    var problems = [];
    if (!t || !stage) return { pass: false, problems: [{ kind: 'template', text: '当前商机未匹配到有效模板版本。' }] };

    if (direction === 'forward') {
      if (stage.unified === '机会确认' && !o.predictedClose) {
        problems.push({ kind: 'system', text: '预计成交时间：离开「机会确认」前必须填写（系统固定门槛，不可由模板或角色关闭）。' });
      }
      (stage.requiredFields || []).forEach(function (cf) {
        if (!o.custom || !o.custom[cf]) {
          var f = customField(cf);
          problems.push({ kind: 'field', code: cf, text: '必填字段未填写：' + (f ? f.name : cf) });
        }
      });
      var entry = currentStageEntryEvent(o);
      var currentTasks = all('stageTasks').filter(function (x) {
        return x.oppId === o.id && x.stageCode === stage.code && x.must && (!entry || x.stageEntryEventId === entry.eventId) && x.status !== '已完成';
      });
      currentTasks.forEach(function (x) {
        problems.push({ kind: 'task', id: x.id, text: '必须完成的阶段任务未完成：' + x.title });
      });
      (stage.tasks || []).forEach(function (cfg, index) {
        if (!cfg.must) return;
        var exists = all('stageTasks').some(function (x) {
          return x.oppId === o.id && x.stageCode === stage.code &&
            (entry ? x.stageEntryEventId === entry.eventId && x.templateTaskIndex === index : x.title === cfg.title);
        });
        if (!exists) problems.push({ kind: 'task', text: '必做阶段任务尚未生成：' + cfg.title });
      });
        if (o.closeResult) problems.push({ kind: 'closed', text: '商机已结束（' + o.closeResult + '），仅关闭结果可重新激活。' });
    }
    return { pass: problems.length === 0, problems: problems };
  }

  function advanceStage(o, note) {
    load();
    var t = currentTemplate(o);
    var idx = stageIndex(o);
    if (!t || idx < 0) return { ok: false, reason: '当前阶段不存在。' };
    if (idx >= t.stages.length - 1) return { ok: false, reason: '已处于最后阶段，无后续阶段可推进。' };
    if (o.closeResult) return { ok: false, reason: '商机已结束（' + o.closeResult + '），仅关闭结果可重新激活。' };
    var g = gateCheck(o, 'forward');
    if (!g.pass) return { ok: false, gate: g, reason: '阶段门槛未通过，不能推进。' };
    var next = t.stages[idx + 1];
    var entry = { from: o.currentStageCode, to: next.code, at: now(), by: currentUser().id, note: note || '', eventId: nextId('SEV') };
    o.stageHistory.push(entry);
    o.currentStageCode = next.code;
    o.stageEnteredAt = now();
    o.updatedAt = now();
    generateStageTasks(o, next, entry);
    audit('商机', o.id, '阶段推进', t.stages[idx].name, next.name);
    save();
    return { ok: true, stage: next };
  }

  function rollbackStage(o, targetCode, note) {
    load();
    var t = currentTemplate(o);
    if (!t || !o) return { ok: false, reason: '当前冻结模板不可用，无法回退。' };
    var idx = stageIndex(o);
    var target = -1;
    for (var i = 0; i < t.stages.length; i++) if (t.stages[i].code === targetCode) target = i;
    if (target < 0) return { ok: false, reason: '目标阶段不存在。' };
    if (target >= idx) return { ok: false, reason: '只能回退到历史阶段（当前阶段之前的阶段）。' };
    if (o.closeResult) return { ok: false, reason: '商机已结束（' + o.closeResult + '），仅关闭结果可重新激活。' };
    all('stageTasks').forEach(function (task) {
      var taskStageIndex = t.stages.findIndex(function (s) { return s.code === task.stageCode; });
      if (task.oppId === o.id && isSystemStageTask(task) && taskStageIndex >= target && taskStageIndex <= idx &&
          task.status !== '已完成' && task.status !== '已失效') invalidateStageTask(task, '阶段回退导致上下文变化');
    });
    var entry = { from: o.currentStageCode, to: targetCode, at: now(), by: currentUser().id, note: note || '历史回退', eventId: nextId('SEV') };
    o.stageHistory.push(entry);
    o.currentStageCode = targetCode;
    o.stageEnteredAt = now();
    generateStageTasks(o, t.stages[target], entry);
    o.updatedAt = now();
    audit('商机', o.id, '阶段回退', t.stages[idx].name, t.stages[target].name);
    save();
    return { ok: true, stage: t.stages[target] };
  }

  function changeMainLine(o, newLine, newScene, note) {
    load();
    if (!o || o.closeResult) return { ok: false, reason: '已关闭商机不能变更业务线或迁移模板。' };
    var m = matchTemplate(newLine, newScene);
    if (m.state !== 'ok') return { ok: false, match: m, reason: matchReason(m, { businessLine: newLine, scene: newScene }) };
    var t = currentTemplate(o);
    var idx = stageIndex(o);
    var nextTpl = m.template;
    if (!t || idx < 0) return { ok: false, reason: '当前冻结模板或阶段不可用，无法安全迁移。' };
    var oldStage = t.stages[idx];
    var exact = nextTpl.stages.filter(function (s) { return s.code === oldStage.code; });
    var sameUnified = nextTpl.stages.filter(function (s) { return s.unified === oldStage.unified; });
    var target = exact.length === 1 ? exact[0] : (sameUnified.length === 1 ? sameUnified[0] : null);
    if (!target) {
      var chosen = arguments.length > 4 ? arguments[4] : '';
      target = nextTpl.stages.filter(function (s) { return s.code === chosen; })[0] || null;
      if (!target || target.unified !== oldStage.unified) {
        return { ok: false, needsStageChoice: true, candidates: sameUnified, reason: sameUnified.length ?
          '新模板在当前统一阶段「' + oldStage.unified + '」有多个详细阶段，请明确选择目标阶段。' :
          '新模板没有当前统一阶段「' + oldStage.unified + '」的目标阶段，迁移被阻断。' };
      }
    }
    var main = o.lines.filter(function (l) { return l.role === '主业务线'; })[0];
    var oldLine = main && main.businessLine;
    var oldLineName = businessLineName(oldLine) || oldLine || '—';
    var oldTplName = t ? t.name + ' ' + t.version : '—';
    if (o.lines.some(function (l) { return l.businessLine === newLine && l.splitTo; })) {
      return { ok: false, reason: '该业务线已拆分到独立商机，不能重新成为原商机主业务线。' };
    }
    var targetLine = oldLine !== newLine ? o.lines.filter(function (l) { return l.role !== '主业务线' && l.businessLine === newLine && !l.splitTo; })[0] : null;
    var migrationSnapshot = JSON.parse(JSON.stringify(db));
    try {
    if (main && oldLine !== newLine) {
      main.role = '协同业务线'; main.scene = ''; main.status = '当前参与';
      main.lineHistory = main.lineHistory || [];
      main.lineHistory.push({ at: now(), by: currentUser().id, action: '主业务线转为协同业务线', reason: note || '' });
    }
    if (targetLine) {
      targetLine.role = '主业务线'; targetLine.scene = newScene; targetLine.status = '当前参与';
      targetLine.lineHistory = targetLine.lineHistory || [];
      targetLine.lineHistory.push({ at: now(), by: currentUser().id, action: '协同业务线转为主业务线', reason: note || '' });
    } else if (main && oldLine !== newLine) {
      o.lines.push({ code: nextOpportunityLineId(), businessLine: newLine, role: '主业务线', scene: newScene, scope: '', status: '当前参与', lineHistory: [] });
    } else if (main) {
      main.businessLine = newLine; main.scene = newScene;
    }
    var previousStageCode = o.currentStageCode;
    o.templateCode = nextTpl.code;
    o.templateVersion = nextTpl.version;
    o.currentStageCode = target.code;
    o.stageEnteredAt = now();
    var entry = { from: previousStageCode, to: target.code, at: now(), by: currentUser().id, note: '主业务线变更导致模板迁移：' + oldTplName + ' → ' + nextTpl.name + ' ' + nextTpl.version + '；' + (note || ''), eventId: nextId('SEV') };
    o.stageHistory.push(entry);
    // 上下文变化使原阶段任务失效（不取消）
    all('stageTasks').forEach(function (x) {
      if (x.oppId === o.id && isSystemStageTask(x) && x.status !== '已完成' && x.status !== '已失效') invalidateStageTask(x, '模板迁移导致上下文变化');
    });
    generateStageTasks(o, target, entry);
    o.updatedAt = now();
    audit('商机', o.id, '主业务线变更与模板迁移', oldLineName + '｜' + oldTplName, businessLineName(newLine) + '｜' + nextTpl.name + ' ' + nextTpl.version + (note ? '｜原因：' + note : ''));
    save();
    return { ok: true, template: nextTpl, stage: target };
    } catch (err) {
      restoreOpportunitySnapshot(migrationSnapshot, o);
      return { ok: false, reason: '模板迁移失败，已恢复原主业务线、模板、阶段、任务和历史：' + (err && err.message ? err.message : '未知错误') };
    }
  }

  function addOpportunityLine(o, lineCode, scope, reason) {
    load();
    if (!o || o.closeResult) return { ok: false, reason: '商机不存在或已关闭，不能增加协同业务线。' };
    if (!String(reason || '').trim()) return { ok: false, reason: '请填写增加协同业务线的原因。' };
    var line = all('businessLines').filter(function (x) { return x.code === lineCode && x.status === '启用'; })[0];
    if (!line) return { ok: false, reason: '请选择启用状态的业务线。' };
    var existing = (o.lines || []).filter(function (x) { return x.businessLine === lineCode; })[0];
    if (existing && existing.role === '主业务线') return { ok: false, reason: '该业务线已经是本商机的主业务线。' };
    if (existing && existing.splitTo) return { ok: false, reason: '该业务线已拆分到独立商机，不能重新加入原商机。' };
    if (existing && existing.status === '当前参与') return { ok: false, reason: '该业务线已经在协同业务线中。' };
    if (existing) {
      existing.status = '当前参与'; existing.scope = String(scope || '').trim();
      existing.lineHistory = existing.lineHistory || [];
      existing.lineHistory.push({ at: now(), by: currentUser().id, action: '恢复协同业务线', reason: reason });
    } else {
      existing = { code: nextOpportunityLineId(), businessLine: lineCode, role: '协同业务线', scene: '', scope: String(scope || '').trim(), status: '当前参与', lineHistory: [] };
      existing.lineHistory.push({ at: now(), by: currentUser().id, action: '增加协同业务线', reason: reason });
      o.lines.push(existing);
    }
    o.updatedAt = now();
    audit('商机', o.id, '增加协同业务线', '—', line.name + (scope ? '｜范围：' + scope : '') + '｜原因：' + reason);
    save(); return { ok: true, line: existing };
  }

  function removeOpportunityLine(o, lineCode, reason) {
    load();
    if (!o || o.closeResult) return { ok: false, reason: '商机不存在或已关闭，不能移除协同业务线。' };
    if (!String(reason || '').trim()) return { ok: false, reason: '请填写移除协同业务线的原因。' };
    var item = (o.lines || []).filter(function (x) { return x.businessLine === lineCode && x.role !== '主业务线' && x.status === '当前参与'; })[0];
    if (!item) return { ok: false, reason: '当前参与的协同业务线不存在。' };
    if (item.splitTo) return { ok: false, reason: '该业务线已拆分，不能再按普通协同业务线移除。' };
    item.status = '已移除';
    item.lineHistory = item.lineHistory || [];
    item.lineHistory.push({ at: now(), by: currentUser().id, action: '移除协同业务线', reason: reason });
    o.updatedAt = now();
    audit('商机', o.id, '移除协同业务线', businessLineName(lineCode), '已移除｜原因：' + reason);
    save(); return { ok: true, line: item };
  }

  function sleepOpp() { return { ok: false, reason: '商机没有休眠状态。' }; }
  function resumeOpp() { return { ok: false, reason: '商机没有休眠状态。' }; }

  function closeOpp(o, result, payload) {
    if (!o || o.closeResult || ['赢单', '输单', '关闭'].indexOf(result) < 0) return { ok: false, reason: '商机不存在、已关闭或关闭结果不合法。' };
    payload = payload || {};
    if (result === '赢单' && !payload.basis) return { ok: false, reason: '赢单必须选择成交依据。' };
    if (result !== '赢单' && !payload.reason) return { ok: false, reason: '输单或关闭必须选择原因。' };
    if ((payload.basis === '其他' || payload.reason === '其他') && !String(payload.note || '').trim()) return { ok: false, reason: '选择“其他”时必须填写说明。' };
    var previousStatus = o.processStatus || '进行中';
    o.closeHistory = o.closeHistory || [];
    var closeEvent = {
      result: result, basis: payload.basis || '', reason: payload.reason || '', note: payload.note || '',
      closedAt: now(), closedBy: currentUser().id, processStatus: previousStatus,
      stageCode: o.currentStageCode, templateCode: o.templateCode, templateVersion: o.templateVersion
    };
    o.closeHistory.push(closeEvent);
    o.closedFromStatus = previousStatus;
    o.closeResult = result;
    o.closeBasis = payload && payload.basis || '';
    o.closeReason = payload && payload.reason || '';
    o.closeNote = payload && payload.note || '';
    o.closedAt = closeEvent.closedAt;
    o.closedBy = currentUser().id;
    o.processStatus = '已结束';
    audit('商机', o.id, '关闭商机', previousStatus, result + '｜' + (o.closeBasis || o.closeReason || '') + (o.closeNote ? '｜' + o.closeNote : ''));
    save();
    return { ok: true, opportunity: o };
  }

  function reopenOpp(o, reason) {
    if (!o || o.closeResult !== '关闭' || !String(reason || '').trim()) return { ok: false, reason: '仅已结束（关闭）商机可填写原因后重新激活。' };
    o.processStatus = '进行中';
    o.closeResult = '';
    o.closedAt = '';
    o.closedBy = '';
    o.closeReason = '';
    o.closeNote = '';
    o.closeBasis = '';
    o.reopenReason = reason;
    o.reopenAt = now();
    o.reopenBy = currentUser().id;
    o.stageHistory.push({ from: o.currentStageCode, to: o.currentStageCode, at: now(), by: currentUser().id, note: '重新激活：' + reason });
    audit('商机', o.id, '重新激活商机', '已结束（关闭）', o.processStatus + '｜原因：' + (reason || ''));
    save();
    return o;
  }

  function splitLine(o, lineCode, payload) {
    load();
    payload = payload || {};
    if (!o || o.closeResult || o.processStatus !== '进行中') return { ok: false, reason: '只有进行中的商机可以拆分协同业务线。' };
    var line = o.lines.filter(function (l) { return l.code === lineCode; })[0];
    if (!line) return { ok: false, reason: '协同业务线不存在。' };
    if (line.role === '主业务线' || line.status !== '当前参与') return { ok: false, reason: '只能拆分当前参与的协同业务线。' };
    if (!String(payload.name || '').trim() || !payload.scene || !user(payload.owner) || !String(payload.reason || '').trim()) return { ok: false, reason: '请确认新商机名称、场景、有效负责人并填写拆分原因。' };
    var snapshot = JSON.parse(JSON.stringify(db));
    try {
      var res = createOpportunity({
        name: payload.name, customerId: o.customerId, businessLine: line.businessLine,
        scene: payload.scene, predictedClose: '', scope: line.scope, owner: payload.owner, allowOwnerAssignment: true,
        source: '由商机 ' + o.id + ' 拆分协同业务线', sourceOpportunityId: o.id,
        splitReason: payload.reason
      });
      if (!res.ok) return res;
      line.status = '已拆分为新商机';
      line.splitTo = res.opportunity.id;
      res.opportunity.stageHistory[0].note = '由商机 ' + o.id + ' 拆分协同业务线创建';
      res.opportunity.sourceOpportunityId = o.id;
      res.opportunity.splitFrom = { opportunityId: o.id, lineCode: line.code, reason: payload.reason };
      res.opportunity.splitReason = payload.reason;
      audit('商机', o.id, '拆分协同业务线', line.businessLine, res.opportunity.id + '｜原因：' + payload.reason);
      save();
      return res;
    } catch (err) {
      var restored = snapshot.opportunities.filter(function (x) { return x.id === o.id; })[0];
      if (restored) {
        Object.keys(o).forEach(function (k) { delete o[k]; });
        Object.keys(restored).forEach(function (k) { o[k] = restored[k]; });
        snapshot.opportunities[snapshot.opportunities.indexOf(restored)] = o;
      }
      db = snapshot; save();
      return { ok: false, reason: '拆分未完成，已恢复原商机与所有关联状态：' + (err && err.message ? err.message : '未知错误') };
    }
  }

  function addTeamMember(o, userId, roleName) {
    load();
    if (o.team.some(function (m) { return m.userId === userId; })) return { ok: false, reason: '该成员已在商机团队中。' };
    o.team.push({ userId: userId, role: roleName });
    o.updatedAt = now();
    audit('商机', o.id, '新增团队成员', '—', userName(userId) + '／' + roleName);
    save();
    return { ok: true };
  }

  function removeTeamMember(o, userId) {
    load();
    var m = o.team.filter(function (x) { return x.userId === userId; })[0];
    if (!m) return { ok: false, reason: '该成员不在商机团队中。' };
    if (m.role === '主负责人') return { ok: false, reason: '主负责人不能被移除，请先转派主负责人。' };
    o.team = o.team.filter(function (x) { return x.userId !== userId; });
    o.updatedAt = now();
    audit('商机', o.id, '移除团队成员', userName(userId), '—');
    save();
    return { ok: true };
  }

  function changeOpportunityCustomer(o, customerId, reason) {
    load();
    var target = customer(customerId);
    if (!o || o.closeResult || !target || target.status !== '正常') return { ok: false, reason: '请选择状态正常的客户。' };
    if (!String(reason || '').trim()) return { ok: false, reason: '变更客户必须填写原因。' };
    var before = o.customerId;
    var previous = customer(before);
    o.customerHistory = o.customerHistory || [];
    o.customerHistory.push({ customerId: before, at: now(), by: currentUser().id, reason: reason });
    o.customerId = customerId; o.updatedAt = now();
    if (previous) previous.oppsCount = all('opportunities').filter(function (x) { return x.customerId === before; }).length;
    target.oppsCount = all('opportunities').filter(function (x) { return x.customerId === customerId; }).length;
    audit('商机', o.id, '变更关联客户', before, customerId + '｜原因：' + reason);
    save(); return { ok: true, opportunity: o };
  }

  function updateOpportunityNextAction(o, action, at) {
    load();
    if (!o || o.closeResult) return { ok: false, reason: '已关闭商机不能维护下一步行动。' };
    if (!String(action || '').trim()) return { ok: false, reason: '请填写下一步行动。' };
    o.nextActionHistory = o.nextActionHistory || [];
    o.nextActionHistory.push({ action: o.nextAction || '', at: o.nextActionAt || '', changedAt: now(), by: currentUser().id });
    var before = (o.nextAction || '—') + '｜' + (o.nextActionAt || '—');
    o.nextAction = String(action).trim(); o.nextActionAt = at || ''; o.updatedAt = now();
    audit('商机', o.id, '更新下一步行动', before, o.nextAction + '｜' + (o.nextActionAt || '未安排'));
    save(); return { ok: true, opportunity: o };
  }

  function reassignOwner(o, userId, reason) {
    load();
    if (!o || o.closeResult || !user(userId)) return { ok: false, reason: '商机已关闭或目标负责人无效，不能转派。' };
    if (o.owner === userId) return { ok: false, reason: '所选人员已经是当前主负责人。' };
    var before = o.owner;
    o.owner = userId;
    o.team = o.team.map(function (m) {
      if (m.userId === before && m.role === '主负责人') m.role = '协同销售';
      return m;
    });
    if (!o.team.some(function (m) { return m.userId === userId; })) o.team.push({ userId: userId, role: '主负责人' });
    else o.team = o.team.map(function (m) { if (m.userId === userId) m.role = '主负责人'; return m; });
    all('stageTasks').forEach(function (task) {
      if (task.oppId === o.id && isSystemStageTask(task) && !task.assigneeChanged && task.owner === before &&
          ['已完成', '已失效', '已取消', '已拒绝'].indexOf(task.status) < 0) {
        task.owner = userId;
        hist(task, '系统', '商机主负责人转派同步更新任务责任人', userName(before), userName(userId));
        audit('任务', task.id, '自动转派', userName(before), userName(userId));
      }
    });
    o.updatedAt = now();
    audit('商机', o.id, '转派主负责人', userName(before), userName(userId) + '（原因：' + (reason || '—') + '）');
    save();
    return o;
  }

  function invalidateStageTask(t, reason) {
    var before = t.status;
    t.status = '已取消'; t.cancelReason = reason;
    hist(t, '系统', '阶段上下文变化自动取消', before, '已取消', reason);
    audit('任务', t.id, '阶段上下文变化自动取消', before, '已取消');
  }

  /* -------------------------------------------------- 处理记录 / 批量 / 导入导出 */

  function addJob(job) {
    load();
    var id = job.id || nextId('JOB');
    var j = {
      id: id, type: job.type, action: job.action, object: job.object, status: job.status || '处理中',
      submittedAt: now(), operator: currentUser().id, total: job.total || 0, success: job.success || 0,
      failed: job.failed || 0, expiresAt: addDays(today(), 7) + ' ' + now().slice(11),
      processId: job.processId || ('JOB-' + month() + '-' + id.slice(-4)),
      items: job.items || [], fileName: job.fileName || '', fields: job.fields || [], sourceFile: job.sourceFile || '',
      retryOf: job.retryOf || ''
    };
    db.jobs.unshift(j);
    audit('处理记录', id, j.action, '—', j.status + '｜总数 ' + j.total + '，成功 ' + j.success + '，失败 ' + j.failed);
    save();
    return j;
  }

  function updateJob(id, patch) {
    load();
    var j = find('jobs', id);
    if (!j) return null;
    Object.keys(patch).forEach(function (k) { j[k] = patch[k]; });
    save();
    return j;
  }

  function retryFailed(jobId) {
    load();
    var j = find('jobs', jobId);
    if (!j) return null;
    var items = (j.items || []).filter(function (x) { return x.result === '失败'; });
    var nj = addJob({
      type: j.type, action: j.action + '（只重试失败项）', object: j.object, status: '部分成功',
      total: items.length, success: Math.max(0, items.length - 1), failed: Math.min(1, items.length),
      retryOf: j.id,
      items: items.map(function (x, i) {
        return { key: x.key, name: x.name, result: i === items.length - 1 && items.length > 1 ? '失败' : '成功', reason: i === items.length - 1 && items.length > 1 ? x.reason : '' };
      })
    });
    return nj;
  }

  function markMessageRead(id, read) {
    load();
    var m = find('messages', id);
    if (m && (!m.receiver || m.receiver === me().id)) { m.read = read === undefined ? true : read; save(); }
    return m;
  }

  function markAllMessagesRead() {
    load();
    var uid = me().id;
    db.messages.forEach(function (m) { if (!m.receiver || m.receiver === uid) m.read = true; });
    save();
  }

  function audit(objectType, objectId, action, from, to) {
    load();
    db.audits.unshift({
      id: 'AUD-' + (1000 + db.audits.length), at: now(), actor: currentUser().name, source: 'PC（原型）',
      objectType: objectType, objectId: objectId, action: action, result: '成功', from: from, to: to
    });
  }

  /* --------------------------------------------------- 列表作用域与选中态 */

  function listState(key, patch) {
    load();
    if (!db.runtime.listState[key]) db.runtime.listState[key] = { page: 1, size: 10, filters: {}, sort: null, columns: null, scope: null, keyword: '' };
    if (patch) { Object.keys(patch).forEach(function (k) { db.runtime.listState[key][k] = patch[k]; }); save(); }
    return db.runtime.listState[key];
  }

  function selection(key, ids) {
    load();
    if (ids !== undefined) { db.runtime.selection[key] = ids; save(); }
    return db.runtime.selection[key] || [];
  }

  function uiState(key, patch) {
    load();
    if (!db.runtime.uiState[key]) db.runtime.uiState[key] = {};
    if (patch) { Object.keys(patch).forEach(function (k) { db.runtime.uiState[key][k] = patch[k]; }); save(); }
    return db.runtime.uiState[key];
  }

  /* ==========================================================================
     以下为 0.1 全量原型新增域：任务、销售活动、正式拜访、统一日程、日报、
     Agent 候选、知识、消息投递、集成与同步、异常事项、数据质量、指标、
     业务配置、人员权限与移交。
     所有函数只读写「已确认正式规则」允许的字段与状态，不在前端创造新规则；
     演示态（身份切换、注入失败）都记为原型演示手段，不是生产行为。
     ========================================================================== */

  function arr(list) { return all(list); }
  function stamp() { return now(); }
  function hist(o, actor, action, from, to, note) {
    if (!o.history) o.history = [];
    o.history.push({ at: stamp(), actor: actor, action: action, from: from, to: to, note: note || '' });
  }
  function me() { return currentUser(); }
  function isTeamScope(scope) { return scope === 'team'; }
  function inTeamOf(ownerId, leaderId) {
    if (!leaderId) return false;
    var u = user(ownerId);
    if (!u) return false;
    var lead = user(leaderId);
    if (!lead) return false;
    /* 演示口径：主管的团队＝同一部门内除本人外的成员，或区域资格被主管覆盖的成员。 */
    return u.dept === lead.dept || (u.region || []).some(function (r) { return (lead.region || []).indexOf(r) >= 0; });
  }

  /* ============================================================ 任务（04 §2） */

  /* 逾期是依据有效截止时间派生的时间标识，不是状态；任务不建「延期中」状态。 */
  function taskOverdue(t) {
    if (!t || !t.dueAt) return false;
    if (t.status !== '待处理') return false;
    return t.dueAt.replace(/-/g, '/') < now().replace(/-/g, '/');
  }
  function taskDaysLeft(t) {
    if (!t || !t.dueAt) return null;
    var a = new Date(t.dueAt.replace(/-/g, '/')), b = new Date(now().replace(/-/g, '/'));
    return Math.round((a - b) / 86400000);
  }
  function taskRemindWindow() { return 3; }
  function taskSoon(t) {
    var d = taskDaysLeft(t);
    return d !== null && d >= 0 && d <= taskRemindWindow() && t.status === '待处理';
  }
  function tasks(scope) {
    var list = arr('tasks');
    if (!scope || scope === 'all') return list;
    var u = me();
    if (scope === 'mine') return list.filter(function (t) { return t.owner === u.id; });
    if (scope === 'related') return list.filter(function (t) { return t.createdBy === u.id || (t.collaborators || []).indexOf(u.id) >= 0; });
    return list.filter(function (t) { return t.owner === u.id || inTeamOf(t.owner, u.id); });
  }
  function task(id) { var t = find('tasks', id); return t && t.pcReviewExample && /\/h5\//.test(window.location.pathname) ? null : t; }

  function createTask(p) {
    load();
    var id = nextId('TSK');
    var t = {
      id: id, name: p.name, source: p.source || '自建任务', bizType: p.bizType || '客户跟进',
      owner: p.owner, collaborators: p.participants || p.collaborators || [], needAccept: false,
      acceptor: '', acceptorRule: '',
      status: '待处理',
      dueAt: p.meeting && p.meeting.endAt ? p.meeting.endAt : (p.dueAt || ''),
      doneAt: '', description: p.description || '', meeting: p.meeting || null,
      related: p.related || { type: '', id: '', name: '' },
      flowSnapshot: { ruleCode: 'TR-MANUAL-V1', ruleVersion: 'V1', frozenAt: stamp() },
      stageTask: false, ruleVersion: '', createdAt: stamp(), createdBy: me().id, history: []
    };
    hist(t, me().name, t.source + '创建', '', t.status);
    db.tasks.unshift(t);
    audit('任务', id, '创建任务', '—', t.name + '｜' + t.status);
    save();
    return t;
  }

  /* 正式任务仅待处理／已完成／已取消；改期与取消由创建人处理。 */
  function taskAct(id, action, p) {
    load();
    var t = find('tasks', id); if (!t) return { ok: false, msg: '任务不存在' };
    p = p || {};
    var u = me(), before = t.status;
    if (action === '延期') action = '改期'; /* 旧演示入口兼容；页面统一展示改期。 */
    if (action === '完成') {
      if (t.owner !== u.id) return { ok: false, msg: '只有任务负责人可以完成任务' };
      if (t.status !== '待处理') return { ok: false, msg: '仅待处理任务可以完成' };
      t.status = '已完成';
      t.doneAt = stamp(); t.result = p.result || ''; t.resultAttachments = p.attachments || [];
    } else if (action === '改期') {
      if (t.createdBy !== u.id) return { ok: false, msg: '只有创建人可以改期' };
      if (t.status !== '待处理') return { ok: false, msg: '仅待处理任务可以改期' };
      if (!p.dueAt || !p.reason) return { ok: false, msg: '请填写新截止时间和改期原因' };
      if (t.meeting && t.meeting.at && p.dueAt <= t.meeting.at) return { ok: false, msg: '会议结束时间须晚于开始时间' };
      t.originalDueAt = t.originalDueAt || t.dueAt;
      t.dueAt = p.dueAt;
      if (t.meeting) t.meeting.endAt = p.dueAt;
      t.rescheduledAt = stamp(); t.rescheduleReason = p.reason;
    } else if (action === '取消') {
      if (t.createdBy !== u.id) return { ok: false, msg: '只有创建人可以取消任务' };
      if (t.status !== '待处理') return { ok: false, msg: '仅待处理任务可以取消' };
      if (!p.reason) return { ok: false, msg: '取消必须填写原因' };
      if (t.stageTask && t.must) {
        var linkedOpp = opp(t.oppId || (t.related && t.related.id));
        var activeEntry = linkedOpp && currentStageEntryEvent(linkedOpp);
        if (linkedOpp && !linkedOpp.closeResult && linkedOpp.currentStageCode === t.stageCode &&
            (!activeEntry || !t.stageEntryEventId || activeEntry.eventId === t.stageEntryEventId)) {
          return { ok: false, msg: '当前阶段的必做任务不能人工取消' };
        }
      }
      t.status = '已取消'; t.cancelReason = p.reason;
    } else {
      return { ok: false, msg: '该动作已退出正式任务流程' };
    }
    hist(t, u.name, action, before, t.status, p.reason || '');
    audit('任务', id, action, before, t.status);
    save();
    return { ok: true, task: t, msg: '已完成「' + action + '」' };
  }

  function addTaskCollabRecord(id, note) {
    load();
    var t = find('tasks', id), u = me();
    if (!t) return { ok: false, msg: '任务不存在' };
    if (t.owner !== u.id && (t.collaborators || []).indexOf(u.id) < 0) return { ok: false, msg: '只有责任人或协作人可以新增协作记录' };
    if (!note || !String(note).trim()) return { ok: false, msg: '请填写协作内容' };
    var value = String(note).trim();
    t.collabRecords = t.collabRecords || [];
    t.collabRecords.push({ at: stamp(), by: u.id, note: value });
    hist(t, u.name, '新增协作记录', '—', '已记录', value);
    audit('任务', id, '新增协作记录', '—', u.name + '｜' + value);
    save();
    return { ok: true, task: t };
  }

  function remindTask(id) {
    load();
    var t = find('tasks', id), u = me();
    if (!t) return { ok: false, msg: '任务不存在' };
    if (t.createdBy !== u.id) return { ok: false, msg: '只有创建人可以催办' };
    if (t.status !== '待处理') return { ok: false, msg: '仅待处理任务可以催办' };
    if (t.lastRemindedAt && t.lastRemindedAt.slice(0, 10) === today()) return { ok: false, msg: '今天已催办，请勿重复发送' };
    t.lastRemindedAt = stamp();
    hist(t, u.name, '催办', t.status, t.status, '向责任人提醒');
    db.messages.unshift({ id: nextId('MSG'), event: '任务催办', title: '任务待处理提醒：' + t.name,
      body: u.name + '提醒你处理任务。', at: stamp(), read: false,
      receiver: t.owner, link: 'h5/task/detail.html?id=' + encodeURIComponent(t.id) });
    audit('任务', id, '催办', u.name, userName(t.owner));
    save();
    return { ok: true, msg: '已向责任人发送站内催办提醒' };
  }

  function saveMeetingRecord(id, text, minutes, assignments) {
    load();
    var t = find('tasks', id), u = me();
    if (!t || !t.meeting) return { ok: false, msg: '会议任务不存在' };
    if (t.owner !== u.id) return { ok: false, msg: '只有会议任务负责人可以保存记录' };
    if (t.status !== '待处理') return { ok: false, msg: '任务已结束，会议记录只读' };
    if (!String(text || '').trim()) return { ok: false, msg: '请先上传或粘贴会议文字记录' };
    t.meeting.text = String(text).trim();
    t.meeting.minutes = String(minutes || '').trim();
    t.meeting.assignments = String(assignments || '').trim();
    t.meeting.updatedAt = stamp();
    hist(t, u.name, '更新会议文字与纪要', t.status, t.status, '同一任务 ID');
    audit('任务', id, '更新会议记录', '旧版本', t.meeting.updatedAt);
    save();
    return { ok: true, task: t, msg: '会议文字、纪要与分工已保存' };
  }

  /* ==================================================== 销售活动（04 §3） */

  /* 销售活动必须至少关联一个有效业务对象，否则不能保存；销售活动不改写正式事实。 */
  function activityList(scope) {
    var list = arr('activities');
    if (!scope || scope === 'all') return list;
    var u = me();
    if (scope === 'mine') return list.filter(function (a) { return a.owner === u.id; });
    return list.filter(function (a) { return a.owner === u.id || inTeamOf(a.owner, u.id); });
  }
  function activity(id) { return find('activities', id); }
  function createActivity(p) {
    load();
    var links = (p.related || []).filter(function (r) { return r && r.id; });
    if (!links.length) return { ok: false, msg: '销售活动至少关联一个有效业务对象' };
    var id = nextId('ACT');
    var a = {
      id: id, channel: p.channel, at: p.at || stamp(), owner: p.owner || me().id,
      target: p.target || '', content: p.content || '', request: p.request || '',
      agreement: p.agreement || '', nextAction: p.nextAction || '',
      related: links, origin: p.origin || '手工录入',
      aiResult: p.aiResult || null, evidence: p.evidence || [],
      corrections: [], createdAt: stamp(), createdBy: me().id, history: []
    };
    hist(a, me().name, '创建销售活动', '', a.channel);
    db.activities.unshift(a);
    audit('销售活动', id, '创建', '—', a.channel + '｜' + a.target);
    save();
    return { ok: true, activity: a };
  }
  function correctActivity(id, p) {
    load();
    var a = find('activities', id); if (!a) return { ok: false, msg: '销售活动不存在' };
    if ((a.owner || a.actor) !== me().id) return { ok: false, msg: '只能纠错本人发起的活动' };
    if (!p || !String(p.reason || '').trim()) return { ok: false, msg: '纠错原因必填' };
    var before = { channel: a.channel || a.type || '', target: a.target || '',
      content: a.content || a.summary || '', nextAction: a.nextAction || '' };
    if (p.channel) a.channel = p.channel;
    if (typeof p.content === 'string') a.content = p.content;
    if (typeof p.nextAction === 'string') a.nextAction = p.nextAction;
    if (typeof p.target === 'string') a.target = p.target;
    var after = { channel: a.channel || a.type || '', target: a.target || '',
      content: a.content || a.summary || '', nextAction: a.nextAction || '' };
    a.corrections = a.corrections || [];
    a.corrections.push({ at: stamp(), by: me().id, reason: p.reason.trim(), before: before, after: after });
    a.correctedAt = stamp(); a.correctedBy = me().id;
    hist(a, me().name, '纠错', '', '', p.reason);
    audit('销售活动', id, '纠错', before.channel, a.channel + '｜原因：' + p.reason);
    save();
    return { ok: true, activity: a };
  }

  /* ==================================================== 正式拜访（04 §4） */

  function visitList(scope) {
    var list = arr('visits');
    if (!scope || scope === 'all') return list;
    var u = me();
    if (scope === 'mine') return list.filter(function (v) { return v.owner === u.id; });
    return list.filter(function (v) { return v.owner === u.id || inTeamOf(v.owner, u.id); });
  }
  function visit(id) { return find('visits', id); }
  function visitRuleScope(r) {
    var s = r.scopeSpec || {};
    return { businessLines: s.businessLines || [], regions: s.regions || [], users: s.users || [], visitTypes: s.visitTypes || [] };
  }
  function visitRuleRank(r) {
    var s = visitRuleScope(r);
    if (s.users.length) return 4;
    if (s.businessLines.length && s.regions.length) return 3;
    if (s.businessLines.length || s.regions.length) return 2;
    return 1;
  }
  function visitRuleFor(p) {
    load();
    return arr('visitRules').filter(function (r) {
      if (r.status !== '生效') return false;
      var s = visitRuleScope(r);
      return (!s.businessLines.length || s.businessLines.indexOf(p.businessLine) >= 0) &&
        (!s.regions.length || s.regions.indexOf(p.region) >= 0) &&
        (!s.users.length || s.users.indexOf(p.owner) >= 0) &&
        (!s.visitTypes.length || s.visitTypes.indexOf(p.type) >= 0);
    }).sort(function (a, b) {
      return visitRuleRank(b) - visitRuleRank(a) ||
        String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')) ||
        String(a.code).localeCompare(String(b.code));
    })[0] || null;
  }
  function visitRuleSnapshot(r) {
    return r ? { id: r.id, code: r.code, version: r.version, radius: r.radius,
      accuracy: r.accuracy, duration: r.duration, imageRequired: !!r.imageRequired, boundAt: stamp() } : null;
  }
  function visitIssue(v, issue, detail) {
    v.exceptionIssues = v.exceptionIssues || [];
    if (v.exceptionIssues.indexOf(issue) < 0) v.exceptionIssues.push(issue);
    v.exception = '待复核'; v.reviewStatus = '待复核';
    v.checkInIssue = v.exceptionIssues.join('、');
    v.exceptionDetail = [v.exceptionDetail, detail].filter(Boolean).join('；');
  }
  function visitDistanceMeters(a, b) {
    if (!a || !b || a.lat == null || a.lng == null || b.lat == null || b.lng == null ||
        !Number.isFinite(Number(a.lat)) || !Number.isFinite(Number(a.lng)) ||
        !Number.isFinite(Number(b.lat)) || !Number.isFinite(Number(b.lng))) return null;
    var rad = Math.PI / 180, dLat = (Number(a.lat) - Number(b.lat)) * rad,
      dLng = (Number(a.lng) - Number(b.lng)) * rad;
    var x = Math.sin(dLat / 2) ** 2 + Math.cos(Number(a.lat) * rad) *
      Math.cos(Number(b.lat) * rad) * Math.sin(dLng / 2) ** 2;
    return Math.round(6371000 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)));
  }
  function createVisit(p) {
    load();
    if (!p || !p.customerId || !p.planAt) return null;
    var c = customer(p.customerId);
    if (!c) return null;
    var owner = p.owner || me().id;
    var rel = arr('businessRelations').filter(function (x) {
      return x.customerId === p.customerId && x.owner === owner && x.status === '有效' &&
        (!p.businessLine || x.businessLine === p.businessLine) && (!p.region || x.region === p.region);
    })[0];
    if (!rel) return null;
    if ((p.contactIds || []).some(function (contactId) {
      return !arr('contactRelations').some(function (x) { return x.customerId === p.customerId && x.contactId === contactId; });
    })) return null;
    if (p.opportunityId && !arr('opportunities').some(function (x) { return x.id === p.opportunityId && x.customerId === p.customerId; })) return null;
    if (p.taskId && !arr('tasks').some(function (x) { return x.id === p.taskId && x.owner === owner; })) return null;
    var id = nextId('VH');
    var businessLine = p.businessLine || (rel && rel.businessLine) || '';
    var region = p.region || (rel && rel.region) || '';
    var type = p.type || '实地拜访';
    var matchedRule = visitRuleFor({ businessLine: businessLine, region: region, owner: owner, type: type });
    var v = {
      id: id, customerId: p.customerId, contactIds: p.contactIds || [], opportunityId: p.opportunityId || '', taskId: p.taskId || '',
      owner: owner, businessLine: businessLine, region: region,
      type: type, status: '计划中', exception: '', reviewStatus: '', checkInIssue: '', exceptionIssues: [],
      planAt: p.planAt, planSnapshotAt: '', addressSnapshot: p.addressSnapshot || { region: c ? c.region : '', detail: '' },
      checkInAt: '', checkInLoc: null, checkOutAt: '', checkOutLoc: null,
      summary: null, nextStep: '', evidence: [], exceptionDetail: '',
      ruleSnapshot: visitRuleSnapshot(matchedRule),
      review: { by: '', at: '', result: '', reason: '', ruleVersion: matchedRule ? matchedRule.code : '' },
      note: '', supplements: [], corrections: [], createdAt: stamp(), createdBy: me().id, history: []
    };
    hist(v, me().name, '创建正式拜访', '', '计划中');
    db.visits.unshift(v);
    audit('正式拜访', id, '创建', '—', (c ? c.name : p.customerId) + '｜' + v.planAt);
    save();
    return v;
  }
  /* 签到：定位成功进入进行中并冻结计划快照；定位失败允许填写原因后继续进行，不采集连续轨迹。 */
  function visitCheckIn(id, opts) {
    load();
    var v = find('visits', id); if (!v) return { ok: false, msg: '拜访不存在' };
    opts = opts || {};
    if (v.status !== '计划中') return { ok: false, msg: '仅计划中状态可以签到' };
    if (opts.ok !== false && !opts.loc) return { ok: false, msg: '请提供本次签到定位；定位失败时填写原因后继续' };
    v.planSnapshotAt = stamp();
    if (opts.ok === false) {
      if (!opts.reason) return { ok: false, msg: '定位失败必须填写原因后才能继续' };
      visitIssue(v, '定位失败', opts.detail || '定位失败，销售填写原因后继续进行');
      v.exceptionReason = opts.reason; v.exceptionNoteBy = me().id; v.exceptionNoteAt = stamp();
      v.status = '进行中';
      hist(v, me().name, '定位失败填写原因继续', '计划中', '进行中', opts.reason);
      audit('正式拜访', id, '异常签到', '计划中', '进行中｜原因：' + opts.reason);
      save();
      return { ok: true, visit: v, msg: '已记录异常签到并继续拜访' };
    }
    v.checkInAt = stamp();
    v.checkInLoc = opts.loc;
    v.status = '进行中';
    var rule = v.ruleSnapshot;
    if (rule && (v.checkInLoc.acc == null || !Number.isFinite(Number(v.checkInLoc.acc)) || Number(v.checkInLoc.acc) > rule.accuracy)) {
      visitIssue(v, '定位精度不足', '签到定位精度 ' + (v.checkInLoc.acc == null ? '未提供' : v.checkInLoc.acc + ' 米') + '，未满足规则阈值 ≤' + rule.accuracy + ' 米');
    }
    var distance = visitDistanceMeters(v.checkInLoc, v.addressSnapshot);
    if (distance !== null) {
      v.checkInDistance = distance;
      if (rule && distance > rule.radius) visitIssue(v, '超出签到半径', '签到位置距计划地址 ' + distance + ' 米，超过规则阈值 ' + rule.radius + ' 米');
    }
    hist(v, me().name, '签到并冻结计划快照', '计划中', '进行中');
    audit('正式拜访', id, '签到', '计划中', '进行中');
    save();
    return { ok: true, visit: v, msg: '签到成功' };
  }
  /* 完成门槛＝有效签到或已说明的异常签到 + 签退 + 拜访总结；图片不作为阻断项。 */
  function visitCheckOut(id, loc, summary) {
    load();
    var v = find('visits', id); if (!v) return { ok: false, msg: '拜访不存在' };
    if (v.status !== '进行中') return { ok: false, msg: '仅进行中状态可以签退' };
    if (!summary || !String(summary.nextStep || '').trim() ||
        !Object.keys(summary).some(function (k) { return k !== 'nextStep' && k !== 'checkOutReason' && String(summary[k] || '').trim(); })) {
      return { ok: false, msg: '拜访总结内容与下一步动作必须填写' };
    }
    if (!loc && !summary.checkOutReason) return { ok: false, msg: '签退定位失败时请填写原因' };
    v.checkOutAt = stamp(); v.checkOutLoc = loc || null;
    v.summary = summary; v.nextStep = summary.nextStep;
    if (!loc) {
      visitIssue(v, '签退定位失败', summary.checkOutReason);
    }
    if (loc && v.ruleSnapshot && (loc.acc == null || !Number.isFinite(Number(loc.acc)) || Number(loc.acc) > v.ruleSnapshot.accuracy)) {
      visitIssue(v, '签退定位精度不足', '签退定位精度 ' + (loc.acc == null ? '未提供' : loc.acc + ' 米') + '，未满足规则阈值 ≤' + v.ruleSnapshot.accuracy + ' 米');
    }
    if (v.ruleSnapshot && v.checkInAt) {
      var elapsed = Math.round((new Date(v.checkOutAt.replace(/-/g, '/')) - new Date(v.checkInAt.replace(/-/g, '/'))) / 60000);
      if (elapsed >= 0 && elapsed < v.ruleSnapshot.duration) visitIssue(v, '签到签退间隔不足', '间隔 ' + elapsed + ' 分钟，低于规则提示阈值 ' + v.ruleSnapshot.duration + ' 分钟');
    }
    if (v.ruleSnapshot && v.ruleSnapshot.imageRequired && !(v.evidence || []).length) {
      visitIssue(v, '现场图片缺失', '未上传现场图片；仅提示风险，不阻断拜访完成');
    }
    v.status = '已完成';
    hist(v, me().name, '签退并提交拜访总结', '进行中', '已完成');
    audit('正式拜访', id, '签退完成', '进行中', '已完成');
    save();
    return { ok: true, visit: v, msg: '拜访已完成' };
  }
  function visitSupplement(id, note, attachment) {
    load();
    var v = find('visits', id);
    if (!v || (!String(note || '').trim() && !attachment)) return { ok: false, msg: '请填写补充说明或上传附件' };
    v.supplements = v.supplements || [];
    v.supplements.push({ note: String(note || '').trim(), attachment: attachment || null, by: me().id, at: stamp() });
    hist(v, me().name, '追加补充说明／附件', '', String(note || '').trim() || (attachment && attachment.name) || '');
    audit('正式拜访', id, '追加补充说明／附件', '', String(note || '').trim() || (attachment && attachment.name) || '');
    save();
    return { ok: true };
  }
  function visitCorrection(id, field, proposed, reason) {
    load();
    var v = find('visits', id);
    if (!v || !field || !String(proposed || '').trim() || !String(reason || '').trim()) return { ok: false, msg: '纠错字段、建议内容和原因均必填' };
    v.corrections = v.corrections || [];
    v.corrections.push({ field: field, proposed: proposed.trim(), reason: reason.trim(), by: me().id, at: stamp() });
    hist(v, me().name, '追加纠错记录', field, proposed.trim(), reason.trim());
    audit('正式拜访', id, '追加纠错记录', field, proposed.trim(), reason.trim());
    save();
    return { ok: true };
  }
  /* 异常复核只改变异常状态，不改变拜访主状态，也不改写拜访事实。 */
  function visitReview(id, result, reason) {
    load();
    var v = find('visits', id); if (!v) return { ok: false, msg: '拜访不存在' };
    if (!v.exception) return { ok: false, msg: '该拜访没有待复核异常' };
    if (['待复核', '待补充'].indexOf(v.exception) < 0) return { ok: false, msg: '当前异常状态不可复核' };
    if (result === '待补充' && !reason) return { ok: false, msg: '要求补充必须填写原因' };
    var before = v.exception;
    v.exception = result; v.reviewStatus = result;
    v.review = { by: me().id, at: stamp(), result: result, reason: reason || '', ruleVersion: (v.ruleSnapshot && v.ruleSnapshot.code) || '' };
    hist(v, me().name, '异常复核', before, result, reason || '');
    audit('正式拜访', id, '异常复核', before, result);
    save();
    return { ok: true, visit: v };
  }
  /* 批量复核只允许同规则版本、同结论且无需销售补充的记录；逐条重检、允许部分成功。 */
  function batchVisitReview(ids, result, reason) {
    load();
    var results = [];
    var first = ids.map(function (key) { return find('visits', key); }).filter(function (x) { return x && x.exception === '待复核'; })[0];
    var expectedVersion = first && first.ruleSnapshot ? first.ruleSnapshot.code : '';
    ids.forEach(function (id) {
      var v = find('visits', id);
      if (!v) { results.push({ id: id, ok: false, msg: '拜访不存在' }); return; }
      if (['待复核', '待补充'].indexOf(v.exception) < 0) { results.push({ id: id, ok: false, msg: '当前异常状态不可批量复核，跳过' }); return; }
      if (((v.ruleSnapshot && v.ruleSnapshot.code) || '') !== expectedVersion) { results.push({ id: id, ok: false, msg: '规则版本不一致，需逐条复核' }); return; }
      if (v.exception === '待补充') { results.push({ id: id, ok: false, msg: '需要销售补充的记录不能批量复核' }); return; }
      var r = visitReview(id, result, reason);
      results.push({ id: id, ok: r.ok, msg: r.ok ? ('已复核为「' + result + '」') : r.msg });
    });
    return results;
  }

  /* ==================================================== 统一日程（04 §5） */

  function scheduleList(scope) {
    var list = arr('schedules');
    if (!scope || scope === 'all') return list;
    var u = me();
    if (scope === 'mine') return list.filter(function (s) { return s.owner === u.id; });
    return list.filter(function (s) { return s.owner === u.id || inTeamOf(s.owner, u.id); });
  }
  function sched(id) { return find('schedules', id); }
  function createSchedule(p) {
    load();
    if (!p.title || !p.startAt) return { ok: false, msg: '日程标题与开始时间必填' };
    if (p.endAt && p.endAt < p.startAt) return { ok: false, msg: '结束时间不能早于开始时间' };
    if (p.owner && p.owner !== me().id) return { ok: false, msg: '只能创建本人的独立日程' };
    var id = nextId('SCH');
    var s = {
      id: id, title: p.title, owner: me().id, type: p.type || '个人安排',
      startAt: p.startAt, endAt: p.endAt || p.startAt, status: '有效',
      related: p.related || { type: '', id: '', name: '' }, note: p.note || '',
      isConverted: false, convertedTaskId: '', convertedAt: '', convertedBy: '',
      wecomSync: { status: '待同步', at: '', externalId: '', failReason: '', retryCount: 0 },
      createdAt: stamp(), createdBy: me().id, history: []
    };
    hist(s, me().name, '创建独立日程', '', '有效');
    db.schedules.unshift(s);
    audit('独立日程', id, '创建', '—', p.title);
    save();
    return { ok: true, schedule: s };
  }
  function updateSchedule(id, p) {
    load();
    var s = find('schedules', id); if (!s) return { ok: false, msg: '日程不存在' };
    if (s.owner !== me().id) return { ok: false, msg: '仅日程负责人可以编辑' };
    if (s.status !== '有效' || s.isConverted) return { ok: false, msg: '已取消、已删除或已转任务的日程不能编辑' };
    if (p.endAt && (p.startAt || s.startAt) && p.endAt < (p.startAt || s.startAt)) return { ok: false, msg: '结束时间不能早于开始时间' };
    var before = JSON.stringify({ title:s.title, type:s.type, startAt:s.startAt, endAt:s.endAt, note:s.note, related:s.related });
    ['title', 'type', 'startAt', 'endAt', 'note', 'related'].forEach(function (k) { if (p[k] !== undefined) s[k] = p[k]; });
    var after = JSON.stringify({ title:s.title, type:s.type, startAt:s.startAt, endAt:s.endAt, note:s.note, related:s.related });
    s.wecomSync.status = '待同步'; s.wecomSync.failReason = '';
    hist(s, me().name, '编辑日程', before, after, '');
    audit('独立日程', id, '编辑', before, after);
    save();
    return { ok: true, schedule: s };
  }
  function cancelSchedule(id, reason) {
    load();
    var s = find('schedules', id); if (!s) return { ok: false, msg: '日程不存在' };
    if (s.owner !== me().id) return { ok: false, msg: '仅日程负责人可以取消' };
    if (s.isConverted) return { ok: false, msg: '已转任务的日程保留原记录，不能取消' };
    if (s.status !== '有效') return { ok: false, msg: '仅有效日程可以取消' };
    s.status = '已取消'; s.cancelReason = reason || ''; s.wecomSync.status = '已取消';
    hist(s, me().name, '取消日程', '有效', '已取消', reason || '');
    audit('独立日程', id, '取消', '有效', '已取消');
    save();
    return { ok: true, schedule: s };
  }
  function deleteSchedule(id, reason) {
    load();
    var s = find('schedules', id); if (!s) return { ok: false, msg: '日程不存在' };
    if (s.owner !== me().id) return { ok: false, msg: '仅日程负责人可以删除' };
    if (s.isConverted) return { ok: false, msg: '已转任务的日程保留原记录，不能删除' };
    if (s.status === '已删除') return { ok: false, msg: '日程已删除' };
    s.status = '已删除'; s.deleteReason = reason || '';
    hist(s, me().name, '删除日程', '', '已删除', reason || '');
    audit('独立日程', id, '删除', '', '已删除');
    save();
    return { ok: true, schedule: s };
  }
  function retryScheduleSync(id) {
    load();
    var s=find('schedules',id); if (!s) return { ok:false,msg:'日程不存在' };
    if (s.owner!==me().id || s.status!=='有效') return { ok:false,msg:'当前用户不能重试该日程同步' };
    if (!s.wecomSync || s.wecomSync.status!=='失败') return { ok:false,msg:'仅同步失败的日程可重试' };
    if ((s.wecomSync.retryCount || 0)>=3) return { ok:false,msg:'已达到自动重试上限，请交由异常处理' };
    s.wecomSync.status='待同步'; s.wecomSync.failReason=''; s.wecomSync.retryCount=(s.wecomSync.retryCount || 0)+1;
    hist(s,me().name,'重试企微同步','失败','待同步'); audit('独立日程',id,'重试企微同步','失败','待同步'); save();
    return { ok:true,schedule:s };
  }
  /* 转任务只写派生字段，不新增「已转换」主状态。 */
  function scheduleToTask(id, p) {
    load();
    var s = find('schedules', id); if (!s) return { ok: false, msg: '日程不存在' };
    if (s.owner !== me().id) return { ok: false, msg: '仅日程负责人可以转为任务' };
    if (s.status !== '有效') return { ok: false, msg: '仅有效日程可以转为任务' };
    if (s.isConverted) return { ok: false, msg: '该日程已转为任务，请勿重复转换' };
    var r = createTask({
      name: p.name || s.title, source: '自建任务', bizType: p.bizType || '客户跟进',
      owner: s.owner, dueAt: p.dueAt || s.endAt,
      related: s.related && s.related.id ? { type: s.related.type, id: s.related.id, name: s.related.name } : { type: '', id: '', name: '' }
    });
    s.isConverted = true; s.convertedTaskId = r.id; s.convertedAt = stamp(); s.convertedBy = me().id;
    hist(s, me().name, '转为任务（派生字段）', '', r.id);
    audit('独立日程', id, '转为任务', '—', r.id);
    save();
    return { ok: true, schedule: s, task: r };
  }

  /* 统一日历：独立日程 + 只读投影。
     首批投影白名单仅三项：线索下次跟进、商机下一步行动、商机预计成交日期。
     投影不可在日历上直接修改，点击回到源对象。企微不同步任务。 */
  function calendarEvents(monthStr) {
    load();
    var out = [];
    var m = monthStr || month();
    function inM(d) { return d && d.slice(0, 7) === m; }
    arr('schedules').forEach(function (s) {
      if (s.status !== '有效' || s.isConverted || !inM(s.startAt)) return;
      out.push({ date: s.startAt.slice(0, 10), time: s.startAt.slice(11, 16), endTime: (s.endAt || '').slice(11, 16),
        title: s.title, kind: 'schedule', srcType: '独立日程', srcId: s.id, owner: s.owner,
        path: 'schedule/detail.html', editable: true, wecom: s.wecomSync.status });
    });
    arr('tasks').forEach(function (t) {
      var meetingAt = t.bizType === '会议任务' && t.meeting && t.meeting.at;
      var displayAt = meetingAt || t.dueAt;
      if ((meetingAt ? ['已取消', '已失效', '已拒绝'] : ['已完成', '已取消', '已失效', '已拒绝']).indexOf(t.status) >= 0 || !inM(displayAt)) return;
      out.push({ date: displayAt.slice(0, 10), time: displayAt.slice(11, 16),
        endTime: meetingAt && t.meeting.endAt ? t.meeting.endAt.slice(11, 16) : '',
        title: t.name, kind: 'task',
        srcType: '任务', srcId: t.id, owner: t.owner, path: 'task/detail.html', editable: false, project: false });
    });
    arr('visits').forEach(function (v) {
      if (['已取消'].indexOf(v.status) >= 0 || !inM(v.planAt)) return;
      out.push({ date: v.planAt.slice(0, 10), time: v.planAt.slice(11, 16), title: '正式拜访：' + ((customer(v.customerId) || {}).name || v.customerId),
        kind: 'visit', srcType: '正式拜访', srcId: v.id, owner: v.owner, path: 'visit/detail.html', editable: false, wecom: v.status });
    });
    arr('leads').forEach(function (l) {
      if (!l.nextFollowUp || !inM(l.nextFollowUp)) return;
      out.push({ date: l.nextFollowUp.slice(0, 10), time: l.nextFollowUp.slice(11, 16), title: '线索下次跟进：' + (l.raw || '').slice(0, 18) + '…',
        kind: 'lead', srcType: '线索', srcId: l.id, owner: l.owner, path: 'lead/detail.html', editable: false, project: true });
    });
    arr('opportunities').forEach(function (o) {
      if (o.processStatus === '已结束') return;
      if (o.nextActionAt && inM(o.nextActionAt)) {
        out.push({ date: o.nextActionAt.slice(0, 10), time: '', title: '商机下一步行动：' + o.nextAction,
          kind: 'opp', srcType: '商机', srcId: o.id, owner: o.owner, path: 'opportunity/detail.html', editable: false, project: true, sub: 'nextAction' });
      }
      if (o.predictedClose && inM(o.predictedClose)) {
        out.push({ date: o.predictedClose.slice(0, 10), time: '', title: '商机预计成交：' + o.name,
          kind: 'opp', srcType: '商机', srcId: o.id, owner: o.owner, path: 'opportunity/detail.html', editable: false, project: true, sub: 'predictedClose' });
      }
    });
    out.sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); });
    return out;
  }

  /* ==================================================== 日报（04 §6） */

  function reportList(scope) {
    var list = arr('reports');
    if (!scope || scope === 'all') return list;
    var u = me();
    if (scope === 'mine') return list.filter(function (r) { return r.userId === u.id; });
    return list.filter(function (r) { return r.userId === u.id || inTeamOf(r.userId, u.id); });
  }
  function report(id) { return find('reports', id); }
  function reportDraftOf(userId, date) {
    return arr('reports').filter(function (r) { return r.userId === userId && r.date === date; })[0] || null;
  }
  function reportDraftText(r) {
    var labels = { customers:'客户', leads:'线索', opportunities:'商机', activities:'销售活动', visits:'正式拜访', tasks:'任务' };
    var lines = [];
    Object.keys(labels).forEach(function (key) {
      (r.facts && r.facts[key] || []).forEach(function (item) {
        lines.push('• ' + labels[key] + '：' + (item.name || item.id) + (item.change ? '（' + item.change + '）' : ''));
      });
    });
    if (!lines.length) return '今日业务事实\n今日暂无可汇总的正式业务事实。\n\n工作总结\n【模拟草稿】今天完成客户需求沟通和资料整理，待客户确认关键需求后继续推进。\n\n明日计划\n跟进客户反馈，整理待确认事项。';
    var original = String(r.aiDraft || '').trim();
    var topics = [];
    Object.keys(labels).forEach(function (key) { (r.facts && r.facts[key] || []).forEach(function (item) {
      if (topics.length < 3) topics.push(item.name || item.id);
    }); });
    var summary = original && !/^系统识别到今日正式业务事实/.test(original)
      ? original : '今日记录了 ' + lines.length + ' 项已确认的业务进展，涉及' + topics.join('、') + '。';
    return '今日业务事实\n' + lines.join('\n') + '\n\n工作总结\n' + summary;
  }
  function reportFactsAtSubmit(r) {
    var facts = JSON.parse(JSON.stringify(r.facts || {}));
    ['customers','leads','opportunities','activities','visits','tasks'].forEach(function (key) { facts[key] = facts[key] || []; });
    function add(key, item, name, change) {
      if (!item || facts[key].some(function (x) { return x.id === item.id; })) return;
      facts[key].push({ id:item.id, name:name || item.id, change:change });
    }
    arr('leads').forEach(function (x) { if ((x.owner === r.userId || x.createdBy === r.userId) && String(x.createdAt || '').slice(0,10) === r.date) add('leads',x,x.name || x.raw,'新建'); });
    arr('opportunities').forEach(function (x) { if (x.owner === r.userId && String(x.createdAt || '').slice(0,10) === r.date) add('opportunities',x,x.name,'新建'); });
    arr('activities').forEach(function (x) { if ((x.owner || x.actor) === r.userId && String(x.at || x.occurredAt || '').slice(0,10) === r.date) add('activities',x,x.title || x.summary || x.content,'新增'); });
    arr('visits').forEach(function (x) { if (x.owner === r.userId && String(x.checkInAt || '').slice(0,10) === r.date) add('visits',x,x.title || x.id,x.status); });
    arr('tasks').forEach(function (x) { if (x.owner === r.userId && String(x.doneAt || x.canceledAt || '').slice(0,10) === r.date) add('tasks',x,x.name,x.status); });
    arr('businessRelations').forEach(function (x) {
      if (x.owner !== r.userId || String(x.createdAt || '').slice(0,10) !== r.date) return;
      var customer = find('customers', x.customerId);
      add('customers',customer,customer && customer.name,'新增经营关系');
    });
    return facts;
  }
  function ensureReportEditableDraft(id) {
    load();
    var r = find('reports', id);
    if (!r) return { ok:false, msg:'日报不存在' };
    if (r.userId !== me().id) return { ok:false, msg:'只能编辑本人日报' };
    if (r.status === '已提交') return { ok:true, report:r };
    var manuallySaved = (r.history || []).some(function (h) { return h.action === '保存草稿'; });
    if (!String(r.draftBody || '').trim() && !manuallySaved) r.draftBody = reportDraftText(r);
    r.draftSeeded = true;
    save();
    return { ok:true, report:r };
  }
  function ensureReportDraft(userId, date) {
    load();
    if (userId !== me().id) return { ok: false, msg: '只能生成本人日报' };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) return { ok: false, msg: '日期格式无效' };
    var existing = reportDraftOf(userId, date);
    if (existing) return { ok: true, report: existing };
    var facts = { customers: [], leads: [], opportunities: [], activities: [], visits: [], tasks: [] };
    function add(key, row, name, change) { facts[key].push({ id: row.id, name: name, change: change }); }
    arr('activities').forEach(function (x) { if ((x.owner || x.actor) === userId && String(x.at || x.occurredAt || '').slice(0, 10) === date) add('activities', x, x.title || x.summary || x.id, '新增'); });
    arr('visits').forEach(function (x) { if (x.owner === userId && String(x.checkInAt || '').slice(0, 10) === date) add('visits', x, x.title || x.id, x.status); });
    arr('tasks').forEach(function (x) { if (x.owner === userId && String(x.doneAt || '').slice(0, 10) === date) add('tasks', x, x.name || x.id, x.status); });
    var id = nextId('RPT');
    var total=Object.keys(facts).reduce(function (n,k) { return n+facts[k].length; },0);
    var report = { id: id, userId: userId, date: date, status: '草稿', aiDraft: total ? '系统识别到今日正式业务事实 '+total+' 项，请核对并补充工作结论。' : '今日暂无可提炼的正式业务事实，请说明当日工作情况。', draftBody: '', draftSeeded:true, submittedBody: '', facts: facts,
      sources: [], submittedAt: '', submitIdem: '', readBy: {}, advices: [],
      history: [{ at: stamp(), actor: '系统', action: '首次打开兜底生成草稿', from: '', to: '草稿' }] };
    Object.keys(facts).forEach(function (key) { facts[key].forEach(function (item) { report.sources.push({ type: key, id: item.id }); }); });
    report.draftBody = reportDraftText(report);
    db.reports.unshift(report); audit('日报', id, '兜底生成草稿', '—', '草稿'); save();
    return { ok: true, report: report };
  }

  function saveReportDraft(id, body) {
    load();
    var r = find('reports', id); if (!r) return { ok: false, msg: '日报不存在' };
    if (r.userId !== me().id) return { ok: false, msg: '只能保存本人日报' };
    if (r.status === '已提交') return { ok: false, msg: '已提交日报已冻结，不能再编辑' };
    r.draftBody = body; r.draftSeeded = true;
    hist(r, me().name, '保存草稿', '草稿', '草稿');
    audit('日报', id, '保存草稿', '', '草稿');
    save();
    return { ok: true, report: r };
  }
  /* 一次提交：冻结正文、事实快照与来源；提交后不退回、不重提、不编辑。 */
  function submitReport(id, body) {
    load();
    var r = find('reports', id); if (!r) return { ok: false, msg: '日报不存在' };
    if (r.userId !== me().id) return { ok: false, msg: '只能提交本人日报' };
    if (r.status === '已提交') return { ok: false, msg: '该日报已提交并冻结，不能重复提交' };
    var text = body || r.draftBody;
    if (!text || !String(text).trim()) return { ok: false, msg: '日报正文不能为空' };
    r.draftBody = text; r.submittedBody = text; r.status = '已提交';
    r.submittedAt = stamp(); r.submitIdem = id + '-submit';
    r.frozenFacts = reportFactsAtSubmit(r);
    r.frozenSources = JSON.parse(JSON.stringify(r.sources || []));
    Object.keys(r.frozenFacts).forEach(function (key) { r.frozenFacts[key].forEach(function (item) {
      if (!r.frozenSources.some(function (x) { return x.id === item.id; })) r.frozenSources.push({ type:key, id:item.id });
    }); });
    hist(r, me().name, '一次提交并冻结快照', '草稿', '已提交');
    audit('日报', id, '提交', '草稿', '已提交');
    save();
    return { ok: true, report: r };
  }
  function addReportAdvice(id, text) {
    load();
    var r = find('reports', id); if (!r) return { ok: false, msg: '日报不存在' };
    if (r.userId === me().id || ['R2', 'R3', 'R5'].indexOf(me().role) < 0 || !RY.perm.inScope('report',{userId:r.userId})) return { ok: false, msg: '当前用户无权建议该日报' };
    if (!text || !String(text).trim()) return { ok: false, msg: '建议内容不能为空' };
    r.advices = r.advices || [];
    r.advices.push({ id: 'ADV-' + (r.advices.length + 1), by: me().id, at: stamp(), text: String(text).trim() });
    hist(r, me().name, '追加主管建议', '—', '已追加', String(text).trim());
    /* 新建议不重置他人阅读状态。 */
    audit('日报', id, '追加主管建议', '', text.slice(0, 30));
    save();
    return { ok: true, report: r };
  }
  function markReportRead(id, read) {
    load();
    var r = find('reports', id); if (!r) return { ok: false, msg: '日报不存在' };
    var u = me();
    if (r.userId === u.id || ['R2', 'R3', 'R5'].indexOf(u.role) < 0 || !RY.perm.inScope('report',{userId:r.userId})) return { ok: false, msg: '当前用户无权修改阅读状态' };
    r.readBy = r.readBy || {};
    r.readBy[u.id] = { read: read !== false, at: read === false ? '' : stamp(), unreadAt: read === false ? stamp() : '' };
    hist(r, u.name, read === false ? '标记未读' : '标记已读', read === false ? '已读' : '未读', read === false ? '未读' : '已读');
    save();
    return { ok: true, report: r };
  }

  /* ==================================================== Agent（05） */

  function candidateList(opts) {
    load();
    opts = opts || {};
    var list = arr('agentCandidates');
    var u = me();
    list = list.filter(function (c) { return c.owner === u.id || u.role === 'R5'; });
    if (opts.age) list = list.filter(function (c) { return c.age === opts.age; });
    if (opts.status) list = list.filter(function (c) { return c.status === opts.status; });
    if (opts.writeFail) list = list.filter(function (c) { return c.writeStatus === '写入失败'; });
    return list;
  }
  function candidate(id) { return find('agentCandidates', id); }
  function candidateConfirm(id, finalValue) {
    load();
    var c = find('agentCandidates', id);
    if (!c) return { ok: false, msg: '候选不存在' };
    if (c.owner !== me().id) return { ok: false, msg: '只能确认分配给自己的候选' };
    if (c.status === '已失效') return { ok: false, msg: '候选已失效（来源版本已更新），不能继续确认' };
    if (c.status === '已确认' && c.writeStatus === '写入成功') return { ok: false, msg: '候选已确认并写入成功，不能重复写入' };
    if (c.writtenObjectId && find(c.kind === '候选任务' ? 'tasks' : 'activities', c.writtenObjectId)) {
      c.writeStatus = '写入成功'; save(); return { ok: true, candidate: c, msg: '正式对象已存在，无需重复创建' };
    }
    var v = finalValue || c.aiSuggestion;
    if (!v || !Object.keys(v).length) return { ok: false, msg: '确认前必须有人工确认过的最终值' };
    var alreadyConfirmed = c.status === '已确认';
    c.finalValue = v;
    c.status = '已确认'; if (!alreadyConfirmed) { c.confirmedBy = me().id; c.confirmedAt = stamp(); }
    /* 写入：以幂等键防重复；失败时保留已确认状态与最终值，允许按原参数重试。 */
    c.writeStatus = '写入中';
    var res = (function () {
      if (c.kind === '候选销售活动') {
        return createActivity({
          channel: v['沟通方式'] || '客户面访', at: v['沟通时间'] || stamp(), owner: c.owner,
          target: v['沟通对象'] || '', content: v['沟通内容'] || '', request: v['客户诉求'] || '',
          agreement: v['共识与承诺'] || '', nextAction: v['下一步动作'] || '',
          related: c.relatedObjects, origin: 'Agent 候选（' + c.origin + '）'
        });
      }
      if (c.kind === '候选任务') {
        var owner = v['责任人'] || c.owner;
        if (!find('users', owner)) return { ok: false, msg: '责任人无法解析为有效用户' };
        if (!v['任务名称'] || !v['截止时间']) return { ok: false, msg: '任务名称与截止时间必填' };
        return { ok: true, task: createTask({
          name: v['任务名称'], source: '沟通提炼', bizType: v['业务类型'] || '客户跟进',
          owner: owner, dueAt: v['截止时间'] || '', needAccept: false,
          related: c.relatedObjects.length ? { type: c.relatedObjects[0].type, id: c.relatedObjects[0].id, name: c.relatedObjects[0].name } : { type: '', id: '', name: '' }
        }) };
      }
      return { ok: false, msg: '该候选类型不直接生成正式对象' };
    })();
    if (res.ok) {
      c.writeStatus = '写入成功';
      c.writtenObjectId = (res.activity && res.activity.id) || (res.task && res.task.id) || '';
      c.writtenAt = stamp();
    } else {
      c.writeStatus = '写入失败'; c.failReason = res.msg;
      c.failKind = /必填|无法解析|无效|验收入|未配置|不唯一/.test(res.msg) ? '业务异常（不可自动重试）' : '技术异常（可重试）';
    }
    audit('Agent 候选', id, '确认并写入', '待确认', c.status + '｜' + c.writeStatus);
    save();
    return { ok: res.ok, candidate: c, msg: res.ok ? '已确认并写入正式对象' : res.msg };
  }
  function candidateIgnore(id, reason) {
    load();
    var c = find('agentCandidates', id); if (!c) return { ok: false, msg: '候选不存在' };
    if (c.owner !== me().id) return { ok: false, msg: '只能忽略分配给自己的候选' };
    if (c.status !== '待确认') return { ok: false, msg: '仅待确认候选可以忽略' };
    c.status = '已忽略'; c.ignoreReason = reason || ''; c.ignoredAt = stamp();
    audit('Agent 候选', id, '忽略', '待确认', '已忽略');
    save();
    return { ok: true, candidate: c };
  }
  function candidateBatchConfirm(ids) {
    load();
    var results = [];
    ids.forEach(function (id) {
      var c = find('agentCandidates', id);
      if (!c) { results.push({ id: id, ok: false, msg: '候选不存在' }); return; }
      if (c.status !== '待确认') { results.push({ id: id, ok: false, msg: '候选状态不是待确认，跳过' }); return; }
      var r = candidateConfirm(id, c.finalValue || c.aiSuggestion);
      results.push({ id: id, ok: r.ok, msg: r.ok ? '已确认并写入' : r.msg });
    });
    return results;
  }
  function candidateRetryWrite(id, amendedValue) {
    load();
    var c = find('agentCandidates', id); if (!c) return { ok: false, msg: '候选不存在' };
    if (c.owner !== me().id || c.status !== '已确认') return { ok: false, msg: '仅原确认人可以重试已确认候选' };
    if (c.writeStatus !== '写入失败') return { ok: false, msg: '仅写入失败的候选可以重试' };
    if (amendedValue && c.kind === '候选任务') {
      if (!String(amendedValue['任务名称'] || '').trim() || !String(amendedValue['截止时间'] || '').trim() || !find('users', amendedValue['责任人'])) {
        return { ok: false, msg: '请先补齐任务名称、截止时间和有效责任人' };
      }
      c.finalValue = Object.assign({}, c.finalValue || c.aiSuggestion || {}, amendedValue);
      c.failResolved = true;
    }
    if (c.failKind && c.failKind.indexOf('不可自动重试') >= 0 && !c.failResolved) {
      return { ok: false, msg: '该失败为业务异常，需先补齐前提条件，不能直接重试' };
    }
    c.writeStatus = '未写入';
    return candidateConfirm(id, c.finalValue || c.aiSuggestion);
  }
  function agentRunList(filter) {
    var list = arr('agentRuns');
    if (!filter || filter === 'all') return list;
    return list.filter(function (r) { return r.status === filter; });
  }

  /* ==================================================== 知识（08） */

  function knowledgeList(q, opts) {
    load();
    opts = opts || {};
    var list = arr('knowledge');
    var u = me();
    list = list.filter(function (k) { return k.status === '已发布' || u.role === 'R5' || k.owner === u.id; });
    if (opts.includeInactive) { /* 管理端可看全部状态 */ } else {
      list = list.filter(function (k) { return k.status === '已发布'; });
    }
    if (opts.q) {
      var s = opts.q.toLowerCase();
      list = list.filter(function (k) { return (k.title + k.summary + k.code).toLowerCase().indexOf(s) >= 0; });
    }
    return list;
  }
  function kb(id) { return find('knowledge', id); }

  function knowledgeCreate(input) {
    load();
    var title = String(input.title || '').trim(), body = String(input.body || '').trim();
    if (!title || (!body && !input.hasFiles)) return { ok: false, msg: '标题必填；正文和附件至少填写一项' };
    if (!String(input.code || '').trim()) return { ok: false, msg: '文档编码必填' };
    if (arr('knowledge').some(function (k) { return k.code === input.code.trim(); })) return { ok: false, msg: '文档编码已存在' };
    var k = { id: nextId('KB', 4), code: input.code.trim(), title: title, summary: String(input.summary || '').trim(),
      body: body, attachments: [], scope: input.scope || '全员', allowDownload: !!input.allowDownload, allowShare: !!input.allowShare,
      owner: me().id, version: 'V1', status: '草稿', publishedAt: '', createdAt: stamp(), history: [] };
    k.history.push({ version: 'V1', at: k.createdAt, by: me().id, action: '创建', note: '创建草稿' });
    db.knowledge.unshift(k); audit('知识', k.id, '创建草稿', '', k.code); save();
    return { ok: true, doc: k };
  }

  function knowledgeSaveDraft(id, input) {
    load();
    var k = find('knowledge', id); if (!k) return { ok: false, msg: '知识文档不存在' };
    if (!String(input.title || '').trim() || (!String(input.body || '').trim() && !(input.attachments || []).length)) return { ok: false, msg: '标题必填；正文和附件至少填写一项' };
    if (k.status === '已停用') return { ok: false, msg: '已停用文档不可编辑' };
    var patch = { title: input.title.trim(), summary: String(input.summary || '').trim(), body: input.body,
      attachments: Array.isArray(input.attachments) ? input.attachments : ((k.pendingDraft || k).attachments || []).slice(),
      scope: input.scope || '全员', allowDownload: !!input.allowDownload, allowShare: !!input.allowShare };
    if (k.status === '已发布') k.pendingDraft = patch;
    else Object.assign(k, patch);
    k.history = k.history || [];
    k.history.push({ version: k.version, at: stamp(), by: me().id, action: '修改', note: k.status === '已发布' ? '保存待发布修改' : '编辑草稿' });
    audit('知识', id, '保存草稿', '', k.version); save();
    return { ok: true, doc: k };
  }

  /* 知识发布范围（08 §12）：只有「已发布」且「当前用户处于发布范围内」的知识
     才进入全局搜索与普通浏览。发布范围支持全员、指定角色、指定业务线。
     无法识别的范围一律不放行——与系统其余部分一致，按失败关闭处理。 */
  function knowledgeInPublishScope(k, user) {
    if (!k || k.status !== '已发布') return false;
    var u = user || me();
    var scope = String(k.scope || '');
    if (scope.indexOf('全员') >= 0) return true;
    var mRole = scope.match(/指定角色：([^；]*)/);
    if (mRole) {
      var roles = mRole[1].split(/[、,，]/).map(function (s) { return s.trim(); }).filter(Boolean);
      return roles.indexOf(u.role) >= 0;
    }
    var mLine = scope.match(/指定业务线：([^；]*)/);
    if (mLine) {
      var names = mLine[1].split(/[、,，]/).map(function (s) { return s.trim(); }).filter(Boolean);
      var mine = (u.businessLine || []).map(businessLineName);
      return mine.some(function (n) { return names.indexOf(n) >= 0; });
    }
    return false;
  }
  function knowledgePublish(id, note) {
    load();
    var k = find('knowledge', id); if (!k) return { ok: false, msg: '知识文档不存在' };
    if (k.status === '已停用') return { ok: false, msg: '已停用文档不可直接发布' };
    if (k.status === '已发布' && !k.pendingDraft) return { ok: false, msg: '该文档没有待发布修改' };
    var publishContent = k.pendingDraft || k;
    if (!String(publishContent.body || '').trim() && !(publishContent.attachments || []).length) return { ok: false, msg: '正文和附件至少填写一项，不能发布空文档' };
    if (k.pendingDraft) {
      Object.assign(k, k.pendingDraft);
      delete k.pendingDraft;
      k.version = 'V' + (parseInt(String(k.version || 'V1').replace(/\D/g, ''), 10) + 1);
    }
    k.status = '已发布'; k.publishedAt = stamp();
    k.history = k.history || [];
    k.history.push({ version: k.version, at: k.publishedAt, by: me().id, action: '发布', note: note || '发布' });
    audit('知识', id, '发布', '', k.version);
    save();
    return { ok: true, doc: k };
  }
  function knowledgeDeactivate(id, reason) {
    load();
    var k = find('knowledge', id); if (!k) return { ok: false, msg: '知识文档不存在' };
    if (k.status !== '已发布') return { ok: false, msg: '仅已发布文档可以停用' };
    k.status = '已停用'; k.deactivatedAt = stamp(); k.deactivateReason = reason || '';
    k.history = k.history || [];
    k.history.push({ version: k.version, at: k.deactivatedAt, by: me().id, action: '停用', note: reason || '' });
    /* 停用后不进入普通搜索，也不作为 Agent 新回答来源。 */
    audit('知识', id, '停用', '已发布', '已停用｜' + (reason || ''));
    save();
    return { ok: true, doc: k };
  }

  /* ==================================================== 消息投递（07/08） */

  /* 个人企微提醒偏好仅影响后续可选推送；站内消息仍完整记录。 */
  function notificationPrefs(userId) {
    load();
    var uid = userId || me().id;
    db.runtime.notificationPrefs = db.runtime.notificationPrefs || {};
    return Object.assign({ taskDue: true, dailyMissing: true }, db.runtime.notificationPrefs[uid] || {});
  }
  function saveNotificationPrefs(values) {
    load();
    var uid = me().id;
    db.runtime.notificationPrefs = db.runtime.notificationPrefs || {};
    db.runtime.notificationPrefs[uid] = {
      taskDue: !!values.taskDue, dailyMissing: !!values.dailyMissing
    };
    audit('个人消息设置', uid, '修改企微提醒偏好', '旧设置', JSON.stringify(db.runtime.notificationPrefs[uid]));
    save();
    return { ok: true, prefs: notificationPrefs(uid) };
  }

  function deliveryList(filter) {
    var list = arr('messageDeliveries');
    filter = filter || {};
    if (filter.delivery) list = list.filter(function (m) { return m.deliveryStatus === filter.delivery; });
    if (filter.read) list = list.filter(function (m) { return m.readStatus === filter.read; });
    if (filter.channel) list = list.filter(function (m) { return m.channel === filter.channel; });
    return list;
  }
  /* 投递失败不改变来源业务对象；只重投消息，超限时创建「消息投递失败」异常事项。 */
  function retryDelivery(id) {
    load();
    var m = find('messageDeliveries', id); if (!m) return { ok: false, msg: '投递记录不存在' };
    if (m.deliveryStatus === '成功') return { ok: false, msg: '该记录已投递成功，不重复投递' };
    m.retryCount = (m.retryCount || 0) + 1;
    if (m.retryCount > 3) {
      m.deliveryStatus = '失败'; m.failReason = m.failReason || '超过自动重试上限';
      var ex = arr('exceptions').filter(function (e) { return e.sourceMsgId === m.msgId; })[0];
      if (!ex) {
        var eid = nextId('EXC');
        db.exceptions.unshift({ id: eid, type: '消息投递失败', objectType: m.target.type, objectId: m.target.id,
          detail: '消息「' + m.event + '」多次投递失败，需人工处理', status: '待处理', handler: '', sourceMsgId: m.msgId,
          at: stamp(), history: [{ at: stamp(), actor: me().name, action: '系统创建异常事项', from: '', to: '待处理' }] });
        audit('异常事项', eid, '系统创建', '—', '消息投递失败');
      }
      save();
      return { ok: false, msg: '已超过自动重试上限，已创建「消息投递失败」异常事项' };
    }
    m.deliveryStatus = '成功'; m.failReason = '';
    audit('消息投递', id, '手工重试投递', '失败', '成功');
    save();
    return { ok: true, msg: '第 ' + m.retryCount + ' 次重试投递成功' };
  }

  /* ==================================================== 集成与同步（08） */

  function extSystems() { return arr('externalSystems'); }
  function syncList(filter) {
    var list = arr('syncJobs');
    filter = filter || {};
    if (filter.status) list = list.filter(function (s) { return s.status === filter.status; });
    if (filter.system) list = list.filter(function (s) { return s.system === filter.system; });
    return list;
  }
  function retrySync(id) {
    load();
    var s = find('syncJobs', id); if (!s) return { ok: false, msg: '同步任务不存在' };
    if (s.status === '成功') return { ok: false, msg: '该同步任务已成功，不重复执行' };
    s.retryCount = (s.retryCount || 0) + 1;
    if (s.retryCount > s.maxRetry) {
      s.status = '失败';
      save();
      return { ok: false, msg: '已超过最大重试次数，需人工处理' };
    }
    s.executedAt = stamp();
    s.status = '成功'; s.lastSuccessAt = stamp(); s.failReason = '';
    audit('同步任务', id, '重试同步', '', '成功');
    save();
    return { ok: true, msg: '重试成功' };
  }

  /* ==================================================== 异常事项与数据质量（07/08） */

  function exceptionList(filter) {
    var list = arr('exceptions');
    filter = filter || {};
    if (filter.status) list = list.filter(function (e) { return e.status === filter.status; });
    if (filter.type) list = list.filter(function (e) { return e.type === filter.type; });
    return list;
  }
  /* 领取＝原子占用；同一事项同一时间只有一条未完成记录。 */
  function exceptionClaim(id) {
    load();
    var e = find('exceptions', id); if (!e) return { ok: false, msg: '异常事项不存在' };
    if (e.status !== '待处理') return { ok: false, msg: '仅待处理事项可以领取' };
    if (e.handler) return { ok: false, msg: '该事项已被 ' + userName(e.handler) + ' 领取' };
    e.handler = me().id; e.status = '处理中'; e.claimedAt = stamp();
    hist(e, me().name, '领取', '待处理', '处理中');
    audit('异常事项', id, '领取', '待处理', '处理中');
    save();
    return { ok: true, item: e };
  }
  function exceptionReturn(id, reason) {
    load();
    var e = find('exceptions', id); if (!e) return { ok: false, msg: '异常事项不存在' };
    if (e.status !== '处理中') return { ok: false, msg: '仅处理中事项可以退回' };
    if (!reason) return { ok: false, msg: '退回必须填写原因' };
    var old = e.handler;
    e.handler = ''; e.status = '待处理'; e.returnReason = reason; e.returnedAt = stamp();
    hist(e, me().name, '退回', '处理中', '待处理', reason);
    audit('异常事项', id, '退回', '处理中', '待处理｜原因：' + reason);
    save();
    return { ok: true, item: e };
  }
  /* 异常事项不能直接修改正式业务事实，必须跳转源对象使用正式动作。 */
  function exceptionComplete(id, note) {
    load();
    var e = find('exceptions', id); if (!e) return { ok: false, msg: '异常事项不存在' };
    if (e.status !== '处理中' && e.status !== '待处理') return { ok: false, msg: '当前状态不可完成' };
    if (!note) return { ok: false, msg: '完成必须填写处理说明' };
    var before = e.status;
    e.status = '已完成'; e.handler = e.handler || me().id; e.note = note; e.finishedAt = stamp();
    hist(e, me().name, '完成', before, '已完成', note);
    audit('异常事项', id, '完成', before, '已完成');
    save();
    return { ok: true, item: e };
  }
  function exceptionReject(id, reason) {
    load();
    var e = find('exceptions', id); if (!e) return { ok: false, msg: '异常事项不存在' };
    if (['已完成', '不采纳'].indexOf(e.status) >= 0) return { ok: false, msg: '当前状态不可变更' };
    if (!reason) return { ok: false, msg: '不采纳必须填写原因' };
    var before = e.status;
    e.status = '不采纳'; e.rejectReason = reason; e.finishedAt = stamp();
    hist(e, me().name, '不采纳', before, '不采纳', reason);
    audit('异常事项', id, '不采纳', before, '不采纳｜原因：' + reason);
    save();
    return { ok: true, item: e };
  }
  /* 数据质量结果状态：当前存在／已消除／已忽略，不复用异常事项状态。 */
  function qualityIssueList(filter) {
    var list = arr('qualityIssues');
    filter = filter || {};
    if (filter.status) list = list.filter(function (q) { return q.resultStatus === filter.status; });
    if (filter.type) list = list.filter(function (q) { return q.type === filter.type; });
    return list;
  }
  /* 「待治理」是数据质量派生标签：仅表示该客户当前存在质量问题（如统一社会信用代码缺失），
     它既不是客户记录状态，也不构成资料治理流程；0.1 客户资料只由权限控制＋修改历史负责。 */
  function qualityPending(customerId) {
    load();
    return arr('qualityIssues').filter(function (q) {
      return q.objectType === '客户' && q.objectId === customerId && q.resultStatus === '当前存在';
    })[0] || null;
  }
  function qualityIgnore(id, reason) {
    load();
    var q = find('qualityIssues', id); if (!q) return { ok: false, msg: '质量问题不存在' };
    if (q.resultStatus !== '当前存在') return { ok: false, msg: '仅当前存在的问题可以忽略' };
    if (!reason) return { ok: false, msg: '忽略必须填写原因' };
    q.resultStatus = '已忽略'; q.ignoredReason = reason; q.ignoredAt = stamp(); q.ignoredBy = me().id;
    audit('数据质量', id, '忽略问题', '当前存在', '已忽略｜原因：' + reason);
    save();
    return { ok: true, item: q };
  }
  /* 修正源对象 → 重新检测 → 问题消失 → 关联异常事项完成。 */
  function qualityRerun() {
    load();
    var now0 = stamp();
    arr('qualityRules').forEach(function (r) { r.lastRunAt = now0; });
    var cleared = 0;
    arr('qualityIssues').forEach(function (q) {
      if (q.resultStatus !== '当前存在') return;
      var gone = false;
      if (q.objectType === '客户') {
        var c = customer(q.objectId);
        if (c && q.missingFields.indexOf('统一社会信用代码') >= 0 && c.creditCode) gone = true;
      }
      if (gone) {
        q.resultStatus = '已消除'; q.clearedAt = now0;
        if (q.exceptionId) {
          var e = find('exceptions', q.exceptionId);
          if (e && e.status !== '已完成') { e.status = '已完成'; e.note = '源对象修正后重新检测，问题消除'; e.finishedAt = now0; }
        }
        cleared++;
      }
    });
    audit('数据质量', '—', '手工重新检测', '', '规则版本 V1／V2｜已消除 ' + cleared + ' 条');
    save();
    return { ok: true, cleared: cleared };
  }

  /* ==================================================== 人员、权限与移交（07） */

  function peopleList() { return arr('users'); }
  function permPendingList(filter) {
    var list = arr('permissionPending');
    if (filter && filter.status) list = list.filter(function (p) { return p.status === filter.status; });
    return list;
  }
  function permPendingAct(id, action, reason) {
    load();
    var p = find('permissionPending', id); if (!p) return { ok: false, msg: '待处理事项不存在' };
    if (p.status === '已完成') return { ok: false, msg: '该事项已完成' };
    if (action === '开始处理') { if (p.status !== '待处理') return { ok: false, msg: '仅待处理可以开始处理' }; p.status = '处理中'; }
    else if (action === '完成') {
      if (!reason) return { ok: false, msg: '完成必须填写处理说明' };
      p.status = '已完成'; p.note = reason; p.finishedAt = stamp(); p.handler = me().id;
    } else return { ok: false, msg: '未知动作' };
    audit('权限待处理', id, action, '', p.status);
    save();
    return { ok: true, item: p };
  }
  function handoverList(filter) {
    var list = arr('handovers');
    if (filter && filter.status) list = list.filter(function (h) { return h.status === filter.status; });
    return list;
  }
  function handover(id) { return find('handovers', id); }
  function handoverPrecheck(id) {
    load();
    var h = find('handovers', id); if (!h) return { ok: false, msg: '移交作业不存在' };
    h.precheckAt = stamp();
    h.items.forEach(function (it) {
      if (!it.receiver) {
        var r = { owner: 'U-001' };
        it.precheck = '需指定接收人';
      } else {
        var u = user(it.receiver);
        it.precheck = u ? '可接收（区域／业务线资格校验通过）' : '接收人不可用';
      }
    });
    h.status = h.status === '待预检' ? '待确认' : h.status;
    audit('人员移交', id, '执行预检', '', h.items.length + ' 项待移交');
    save();
    return { ok: true, handover: h };
  }
  /* 执行支持部分成功与失败重试，成功项不重复；未指定接收人的项保持待移交，不自动进入公海。 */
  function handoverRun(id, items) {
    load();
    var h = find('handovers', id); if (!h) return { ok: false, msg: '移交作业不存在' };
    if (['待预检'].indexOf(h.status) >= 0) return { ok: false, msg: '必须先执行预检' };
    if (['已完成', '已取消', '处理中'].indexOf(h.status) >= 0) return { ok: false, msg: '当前状态不可执行移交' };
    if (items) h.items = items;
    var results = [];
    h.items.forEach(function (it) {
      if (it.result === '成功') { results.push({ id: it.id, ok: true, msg: '已成功，不重复执行' }); return; }
      if (!it.receiver) { it.result = '失败'; it.note = it.note || '未指定接收人，保持待移交'; results.push({ id: it.id, ok: false, msg: '未指定接收人' }); return; }
      var o = find(it.type.indexOf('客户经营责任') >= 0 ? 'businessRelations' : it.type.indexOf('线索') >= 0 ? 'leads' : it.type.indexOf('商机') >= 0 ? 'opportunities' : it.type.indexOf('任务') >= 0 ? 'tasks' : 'businessRelations', it.id);
      if (!o) { it.result = '失败'; results.push({ id: it.id, ok: false, msg: '源对象已不可用' }); return; }
      if (o.status === '已失效' || o.status === '已取消' || o.status === '已转化') { it.result = '失败'; it.note = '源对象状态为 ' + o.status + '，不再需要移交'; results.push({ id: it.id, ok: false, msg: it.note }); return; }
      if (o.owner !== undefined) o.owner = it.receiver;
      it.result = '成功'; it.note = it.note || ('已移交至 ' + userName(it.receiver));
      results.push({ id: it.id, ok: true, msg: it.note });
    });
    var okc = results.filter(function (r) { return r.ok; }).length;
    var fail = results.length - okc;
    h.status = fail === 0 ? '已完成' : (okc === 0 ? '待确认' : '部分成功');
    h.executedAt = stamp();
    audit('人员移交', id, '执行移交', '', '成功 ' + okc + '，失败 ' + fail);
    save();
    return { ok: fail === 0, handover: h, results: results, okc: okc, fail: fail };
  }
  function peopleSyncList(filter) {
    var list = arr('peopleSyncIssues');
    if (filter && filter.status) list = list.filter(function (p) { return p.status === filter.status; });
    return list;
  }
  function peopleSyncAct(id, action, reason) {
    load();
    var p = find('peopleSyncIssues', id); if (!p) return { ok: false, msg: '记录不存在' };
    if (p.status === '已处理') return { ok: false, msg: '该记录已处理' };
    if (action === '标记已处理') { p.status = '已处理'; p.note = reason || p.note; p.handledAt = stamp(); p.handler = me().id; }
    else if (action === '等待用户中心重新推送') { p.status = '处理中'; p.note = '已通知用户中心侧修正后重新推送'; }
    else return { ok: false, msg: '未知动作' };
    audit('人员同步异常', id, action, '', p.status);
    save();
    return { ok: true, item: p };
  }

  /* ==================================================== 指标（06 §4） */

  var METRIC_THEMES = ['客户经营', '商机推进', '商机结果', '执行闭环', '时效异常', '数据质量'];

  function metric(code) { return arr('metrics').filter(function (m) { return m.code === code; })[0] || null; }
  function metricRange(preset) {
    var t = today();
    if (!preset || preset === '本月') return { label: '本月', from: t.slice(0, 7) + '-01', to: t };
    if (preset === '上月') { var d = new Date(t.replace(/-/g, '/')); d.setDate(0); var m = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2); return { label: '上月', from: m + '-01', to: m + '-' + ('0' + d.getDate()).slice(-2) }; }
    if (preset === '本季度') { var q = Math.floor(new Date(t.replace(/-/g, '/')).getMonth() / 3) * 3 + 1; return { label: '本季度', from: t.slice(0, 4) + '-' + ('0' + q).slice(-2) + '-01', to: t }; }
    if (preset === '近 30 天') { return { label: '近 30 天', from: addDays(t, -29), to: t }; }
    return { label: '本月', from: t.slice(0, 7) + '-01', to: t };
  }
  function inRange(d, r) { return !!d && d.slice(0, 10) >= r.from && d.slice(0, 10) <= r.to; }
  function metricInjectFail(code, on) {
    load();
    var f = db.runtime.uiState.metricFailed || {};
    if (on) f[code] = true; else delete f[code];
    db.runtime.uiState.metricFailed = f; save();
  }
  /* 指标计算：
     — 未知、不可计算、无分母一律显示「—」，只有确定为零才显示 0；
     — 单卡失败只影响该卡，其他卡继续可用；
     — 字段映射未完成的指标显示「暂无可用数据」，不显示 0。 */
  function metricValue(code, filters) {
    load();
    filters = filters || {};
    var r = metricRange(filters.range);
    var m = metric(code);
    if (!m) return { code: code, name: code, status: 'undefined', display: '—', reason: '指标未定义' };
    var failed = (db.runtime.uiState.metricFailed || {})[code];
    var mappingMissing = ['MET-OPP-STALL', 'MET-TSK-SOON'];
    var base = {
      code: code, name: m.name, theme: m.theme, type: m.type, unit: m.unit, version: m.version,
      formula: m.formula, owner: m.owner, refresh: m.refresh, drill: m.drill,
      dataAt: today() + ' ' + now().slice(11, 16), range: r
    };
    if (failed) return Object.assign(base, { status: 'failed', display: '暂无可用数据', reason: '该卡数据获取失败（其他指标不受影响）' });
    if (mappingMissing.indexOf(code) >= 0) return Object.assign(base, { status: 'nomapping', display: '暂无可用数据', reason: '指标字段映射未完成' });

    var custs = arr('customers');
    var rels = arr('businessRelations');
    var opps = arr('opportunities');
    var tsks = arr('tasks');
    var rpts = arr('reports');
    var v = 0, ok = true, zero = true, extra = {};

    if (code === 'MET-CUS-TOTAL') v = custs.length;
    else if (code === 'MET-CUS-NEW') v = custs.filter(function (c) { return inRange(c.createdAt, r); }).length;
    else if (code === 'MET-CUS-OPERATING') v = custs.filter(function (c) { return rels.some(function (x) { return x.customerId === c.id && x.status === '有效'; }); }).length;
    else if (code === 'MET-CUS-NEWREL') v = custs.filter(function (c) { return rels.some(function (x) { return x.customerId === c.id && x.status === '有效' && inRange(x.createdAt, r); }); }).length;
    else if (code === 'MET-OPP-TOTAL') v = opps.length;
    else if (code === 'MET-OPP-NEW') v = opps.filter(function (o) { return inRange(o.createdAt, r); }).length;
    else if (code === 'MET-OPP-OPEN') v = opps.filter(function (o) { return o.processStatus === '进行中'; }).length;
    else if (code === 'MET-OPP-STAGE') {
      var dist = {}; UNIFIED_STAGE_NAMES().forEach(function (n) { dist[n] = 0; });
      opps.filter(function (o) { return o.processStatus === '进行中'; }).forEach(function (o) {
        var c = currentStageByTemplate(o); if (c) dist[c.stageName] = (dist[c.stageName] || 0) + 1;
      });
      v = opps.filter(function (o) { return o.processStatus === '进行中'; }).length;
      extra.distribution = dist;
    }
    else if (code === 'MET-OPP-CLOSED') v = opps.filter(function (o) { return o.closedAt && inRange(o.closedAt, r); }).length;
    else if (code === 'MET-OPP-WON') v = opps.filter(function (o) { return o.closeResult === '赢单' && inRange(o.closedAt, r); }).length;
    else if (code === 'MET-OPP-LOST') v = opps.filter(function (o) { return o.closeResult === '输单' && inRange(o.closedAt, r); }).length;
    else if (code === 'MET-OPP-WINRATE') {
      var w = opps.filter(function (o) { return o.closeResult === '赢单' && inRange(o.closedAt, r); }).length;
      var l = opps.filter(function (o) { return o.closeResult === '输单' && inRange(o.closedAt, r); }).length;
      extra.numerator = w; extra.denominator = w + l;
      if (w + l === 0) { ok = false; extra.denominatorZero = true; } else { v = Math.round(w / (w + l) * 1000) / 10; }
    }
    else if (code === 'MET-TSK-SHOULD') v = tsks.filter(function (t) { return inRange(t.dueAt, r) && ['已取消', '已失效'].indexOf(t.status) < 0; }).length;
    else if (code === 'MET-TSK-DONE') v = tsks.filter(function (t) { return inRange(t.dueAt, r) && t.status === '已完成'; }).length;
    else if (code === 'MET-TSK-RATE') {
      var should = tsks.filter(function (t) { return inRange(t.dueAt, r) && ['已取消', '已失效'].indexOf(t.status) < 0; }).length;
      var done = tsks.filter(function (t) { return inRange(t.dueAt, r) && t.status === '已完成'; }).length;
      extra.numerator = done; extra.denominator = should;
      if (!should) { ok = false; } else { v = Math.round(done / should * 1000) / 10; }
    }
    else if (code === 'MET-RPT-RATE') {
      var subs = rpts.filter(function (x) { return inRange(x.date, r); });
      var uniq = {}; subs.forEach(function (x) { uniq[x.userId + '|' + x.date] = { u: x.userId, d: x.date, s: x.status }; });
      var cells = Object.keys(uniq).map(function (k) { return uniq[k]; });
      var shouldN = cells.length, doneN = cells.filter(function (c) { return c.s === '已提交'; }).length;
      extra.numerator = doneN; extra.denominator = shouldN; extra.cells = cells;
      if (!shouldN) { ok = false; } else { v = Math.round(doneN / shouldN * 1000) / 10; }
    }
    else if (code === 'MET-TSK-OVERDUE') v = tsks.filter(function (t) { return taskOverdue(t); }).length;
    else if (code === 'MET-TSK-OVDRATE') {
      var openT = tsks.filter(function (t) { return t.status === '待处理' && t.dueAt; });
      var od = openT.filter(taskOverdue).length;
      extra.numerator = od; extra.denominator = openT.length;
      if (!openT.length) { ok = false; } else { v = Math.round(od / openT.length * 1000) / 10; }
    }
    else if (code === 'MET-CUS-COMPLETE' || code === 'MET-CUS-MISSING') {
      var key = ['customerName', 'customerType', 'creditCode', 'region'];
      var bad = custs.filter(function (c) { return key.some(function (k) { return !c[k]; }); });
      extra.numerator = custs.length - bad.length; extra.denominator = custs.length;
      if (code === 'MET-CUS-MISSING') v = bad.length;
      else if (!custs.length) { ok = false; } else { v = Math.round((custs.length - bad.length) / custs.length * 1000) / 10; }
    }
    else if (code === 'MET-OPP-COMPLETE' || code === 'MET-OPP-MISSING') {
      var bad2 = opps.filter(function (o) { return !o.customerId || !o.name || !o.lines || !o.lines.length || (o.currentStageCode !== 'ST-CE-01' && !o.predictedClose); });
      extra.numerator = opps.length - bad2.length; extra.denominator = opps.length;
      if (code === 'MET-OPP-MISSING') v = bad2.length;
      else if (!opps.length) { ok = false; } else { v = Math.round((opps.length - bad2.length) / opps.length * 1000) / 10; }
    }
    else { return Object.assign(base, { status: 'undefined', display: '—', reason: '该指标未纳入本期口径' }); }

    /* 环比：仅发生型指标展示；跨版本、无上期或上期为 0 都不计算增长率。 */
    var trend = null;
    if (m.type === '发生型') {
      var prev = metricRange(filters.range === '上月' ? '上月' : '上月');
      var prevVal = null;
      if (code === 'MET-OPP-WON') prevVal = opps.filter(function (o) { return o.closeResult === '赢单' && inRange(o.closedAt, prev); }).length;
      else if (code === 'MET-OPP-NEW') prevVal = opps.filter(function (o) { return inRange(o.createdAt, prev); }).length;
      else if (code === 'MET-CUS-NEW') prevVal = custs.filter(function (c) { return inRange(c.createdAt, prev); }).length;
      else if (code === 'MET-TSK-DONE') prevVal = tsks.filter(function (t) { return inRange(t.dueAt, prev) && t.status === '已完成'; }).length;
      else prevVal = null;
      if (prevVal === null || prevVal === undefined) trend = { display: '—', reason: '无上期对比数据' };
      else if (prevVal === 0) trend = { display: ok ? '新增 ' + v : '—', reason: '上期为 0，不计算增长率' };
      else trend = { display: (v - prevVal >= 0 ? '+' : '') + Math.round((v - prevVal) / prevVal * 1000) / 10 + '%', prev: prevVal };
    }

    if (!ok) return Object.assign(base, { status: 'unknown', display: '—', reason: extra.denominatorZero ? '本期分母为 0，无可计算比率' : '分母不足，无法计算', numerator: extra.numerator, denominator: extra.denominator, trend: trend, extra: extra });
    return Object.assign(base, { status: 'ok', display: m.unit === '%' ? (v + '%') : String(v), value: v, trend: trend, extra: extra, zero: zero && v === 0 });
  }

  function UNIFIED_STAGE_NAMES() { return ['机会确认', '需求确认', '方案验证', '报价与审批', '商务与合同']; }
  function currentStageByTemplate(o) {
    var t = template(o.templateCode, o.templateVersion);
    if (!t) return null;
    var st = (t.stages || []).filter(function (s) { return s.code === o.currentStageCode; })[0];
    /* 模板阶段对象上的统一阶段字段名是 unified（见 demo-data 的 templates 与 gateCheck 的判定）；
       同时兼容 unifiedStage，避免此处静默退化为详细阶段名，导致阶段分布与下钻的「当前阶段」列
       显示 8 个详细阶段而不是 5 个统一阶段。 */
    return st ? { stageName: st.unified || st.unifiedStage || st.name, detail: st.name } : null;
  }

  /* 看板：六个主题分组，不停留在等权平铺。 */
  function metricBoard(filters) {
    var list = arr('metrics').map(function (m) { return metricValue(m.code, filters); });
    return METRIC_THEMES.map(function (th) {
      var items = list.filter(function (x) { return x.theme === th; });
      return {
        theme: th,
        period: items.filter(function (x) { return x.type === '发生型'; }),
        current: items.filter(function (x) { return x.type === '当前状态'; })
      };
    });
  }

  /* 下钻：保留指标、版本、筛选与来源上下文，展示纳入／未纳入原因；比率展示完整分母。 */
  function metricDrill(code, filters) {
    load();
    filters = filters || {};
    var m = metric(code); if (!m) return null;
    var r = metricRange(filters.range);
    var mv = metricValue(code, filters);
    var rows = [], excluded = [], denomRows = [], columns = [];
    var custs = arr('customers');

    if (code.indexOf('MET-CUS') === 0) {
      columns = ['客户名称', '客户类型', '所属区域', '统一社会信用代码', '经营关系', '负责人', '纳入判定', '未纳入原因'];
      custs.forEach(function (c) {
        var rs = arr('businessRelations').filter(function (x) { return x.customerId === c.id; });
        var act = rs.filter(function (x) { return x.status === '有效'; });
        var include = true, why = '';
        if (code === 'MET-CUS-OPERATING') { include = act.length > 0; why = include ? '' : '当前无有效经营关系'; }
        if (code === 'MET-CUS-NEW') { include = inRange(c.createdAt, r); why = include ? '' : '创建时间不在统计周期内'; }
        if (code === 'MET-CUS-NEWREL') { include = rs.some(function (x) { return x.status === '有效' && inRange(x.createdAt, r); }); why = include ? '' : '周期内无新建有效经营关系'; }
        if (code === 'MET-CUS-COMPLETE' || code === 'MET-CUS-MISSING') {
          var miss = ['customerName', 'customerType', 'creditCode', 'region'].filter(function (k) { return !c[k]; });
          include = miss.length === 0; why = include ? '' : ('缺失字段：' + miss.join('、'));
        }
        if (code === 'MET-CUS-MISSING') { include = why !== ''; why = include ? why : '关键字段完整'; }
        var row = [c.customerName, c.customerType || '—', c.region || '—', c.creditCode || '—',
          act.length ? act.map(function (x) { return x.region + '／' + x.businessLine; }).join('；') : '无',
          act.length ? (act.map(function (x) { return userName(x.owner) || '全国公海'; }).join('；')) : '—',
          include ? '纳入' : '未纳入', why || '—'];
        (include ? rows : excluded).push({ cells: row, id: c.id, name: c.customerName, path: 'customer/detail.html' });
      });
      if (code === 'MET-CUS-COMPLETE' || code === 'MET-CUS-MISSING') columns = ['客户名称', '客户类型', '所属区域', '统一社会信用代码', '缺失字段', '纳入判定', '未纳入原因'];
      if (code === 'MET-CUS-COMPLETE' || code === 'MET-CUS-MISSING') {
        rows = custs.map(function (c) {
          var miss = ['customerName', 'customerType', 'creditCode', 'region'].filter(function (k) { return !c[k]; });
          var inc = code === 'MET-CUS-COMPLETE' ? miss.length === 0 : miss.length > 0;
          return { cells: [c.customerName, c.customerType || '—', c.region || '—', c.creditCode || '—', miss.join('、') || '无', inc ? '纳入' : '未纳入', inc ? '—' : '不满足该指标判定'], id: c.id, name: c.customerName, path: 'customer/detail.html' };
        });
        excluded = [];
      }
    } else if (code.indexOf('MET-OPP') === 0) {
      columns = ['商机名称', '客户', '当前阶段', '过程状态', '预计成交时间', '负责人', '纳入判定', '未纳入原因'];
      arr('opportunities').forEach(function (o) {
        var cs = currentStageByTemplate(o);
        var include = true, why = '';
        if (code === 'MET-OPP-OPEN' || code === 'MET-OPP-STAGE') { include = o.processStatus === '进行中'; why = include ? '' : ('过程状态为「' + o.processStatus + '」，不计入推进中'); }
        if (code === 'MET-OPP-WON') { include = o.closeResult === '赢单'; why = include ? '' : ('当前结果为「' + (o.closeResult || '未结束') + '」'); }
        if (code === 'MET-OPP-LOST') { include = o.closeResult === '输单'; why = include ? '' : ('当前结果为「' + (o.closeResult || '未结束') + '」'); }
        if (code === 'MET-OPP-WINRATE') {
          include = o.closeResult === '赢单' || o.closeResult === '输单';
          why = include ? '' : (o.closeResult === '关闭' ? '关闭不进入分母' : '未结束，不进入分母');
        }
        if (code === 'MET-OPP-NEW') { include = inRange(o.createdAt, r); why = include ? '' : '创建时间不在统计周期内'; }
        if (code === 'MET-OPP-CLOSED') { include = !!o.closedAt && inRange(o.closedAt, r); why = include ? '' : '结果时间不在统计周期内'; }
        if (code === 'MET-OPP-COMPLETE' || code === 'MET-OPP-MISSING') {
          var miss2 = [];
          if (!o.customerId) miss2.push('客户');
          if (!o.name) miss2.push('商机名称');
          if (!o.lines || !o.lines.length) miss2.push('主业务线');
          if (o.currentStageCode !== 'ST-CE-01' && !o.predictedClose) miss2.push('预计成交时间');
          include = miss2.length === 0; why = include ? '' : ('缺失字段：' + miss2.join('、'));
          if (code === 'MET-OPP-MISSING') { include = miss2.length > 0; why = include ? why : '关键字段完整'; }
        }
        if (code === 'MET-OPP-WINRATE') denomRows.push({ cells: [o.name, (customer(o.customerId) || {}).name || o.customerId, cs ? cs.stageName : '—', o.processStatus, o.predictedClose || '待补充', userName(o.owner), o.closeResult === '赢单' ? '赢单（分子）' : '输单（分母）', '—'], id: o.id, name: o.name, path: 'opportunity/detail.html' });
        var row = [o.name, (customer(o.customerId) || {}).name || o.customerId, cs ? cs.stageName : '—', o.processStatus, o.predictedClose || '待补充', userName(o.owner), include ? '纳入' : '未纳入', why || '—'];
        (include ? rows : excluded).push({ cells: row, id: o.id, name: o.name, path: 'opportunity/detail.html' });
      });
    } else if (code.indexOf('MET-TSK') === 0 || code.indexOf('MET-RPT') === 0) {
      if (code.indexOf('MET-TSK') === 0) {
        columns = ['任务名称', '来源', '业务类型', '责任人', '状态', '有效截止时间', '实际完成时间', '是否逾期完成', '纳入判定', '未纳入原因'];
        arr('tasks').forEach(function (t) {
          var include = true, why = '';
          if (['MET-TSK-SHOULD', 'MET-TSK-DONE', 'MET-TSK-RATE'].indexOf(code) >= 0) {
            include = inRange(t.dueAt, r) && ['已取消', '已失效'].indexOf(t.status) < 0;
            why = include ? '' : (['已取消', '已失效'].indexOf(t.status) >= 0 ? ('状态为「' + t.status + '」，整单剔除') : '有效截止时间不在统计周期内');
          }
          if (code === 'MET-TSK-DONE') { include = include && t.status === '已完成'; why = include ? '' : '当前未完成'; }
          if (code === 'MET-TSK-OVERDUE' || code === 'MET-TSK-OVDRATE') {
            include = taskOverdue(t); why = include ? '' : (t.dueAt ? '未逾期' : '无有效截止时间，不进入分母');
          }
          var row = [t.name, t.source, t.bizType, userName(t.owner), t.status, (t.originalDueAt ? t.originalDueAt + ' → ' + t.dueAt : t.dueAt) || '—',
            t.doneAt || '—', (t.status === '已完成' && taskOverdue({ status: '进行中', dueAt: t.dueAt })) ? '是' : (t.status === '已完成' ? '否' : '—'),
            include ? '纳入' : '未纳入', why || '—'];
          (include ? rows : excluded).push({ cells: row, id: t.id, name: t.name, path: 'task/detail.html' });
        });
      } else {
        columns = ['日期', '人员', '团队', '应提交状态', '提交状态', '提交时间', '纳入判定', '未纳入原因'];
        arr('reports').forEach(function (x) {
          var inc = inRange(x.date, r);
          (inc ? rows : excluded).push({ cells: [x.date, userName(x.userId), (user(x.userId) || {}).dept || '—', '应提交', x.status, x.submittedAt || '—', inc ? '纳入' : '未纳入', inc ? '—' : '应提交日期不在统计周期内'], id: x.id, name: x.date + ' ' + userName(x.userId), path: 'report/detail.html' });
        });
      }
    } else if (code.indexOf('MET-OPP-COMPLETE') === 0) { /* 已在上方商机分支处理 */ }

    return {
      metric: m, value: mv, filters: filters, range: r, columns: columns,
      rows: rows, excluded: excluded, denominatorRows: denomRows,
      includedCount: rows.length, excludedCount: excluded.length,
      dataAt: mv.dataAt, version: m.version, source: m.source, canExport: true
    };
  }

  /* ==================================================== 业务配置与指标配置（06） */

  var CONFIG_B = { taskRules: '任务规则', visitRules: '拜访规则' };
  var flowTemplates = function () { return arr('templates'); };

  /* 流程模板按「业务线 ＋ 销售场景」唯一绑定，模板对象没有 id，只能以 code/version 定位，
     因此不走 configBPublish（它按 id 查找）。这里单独实现同一套 B 类语义：
     草稿 → 校验 → 立即原子发布 → 旧版本转历史；发布失败回滚，旧版本继续生效。 */
  function templateKey(code, version) {
    return 'TPL-DRAFT-' + code + '-' + String(version || '').replace(/^v/i, '');
  }
  function templateCreateDraft(input) {
    load(); input = input || {};
    var code = String(input.code || '').trim(), name = String(input.name || '').trim();
    if (!code || !name || !input.businessLine || !input.scene) return { ok: false, msg: '模板编码、名称、业务线和销售场景必填。' };
    if (arr('templates').some(function (t) { return t.code === code; })) return { ok: false, msg: '模板编码已存在；已有模板请创建新版本。' };
    if (!arr('businessLines').some(function (b) { return b.code === input.businessLine && b.status === '启用'; })) return { ok: false, msg: '请选择启用状态的业务线。' };
    var sc = scenarioByLine(input.businessLine, input.scene);
    if (!sc || sc.status === '停用') return { ok: false, msg: '请选择该业务线下已启用的销售场景。' };
    var existingKey = arr('templates').filter(function (t) { return t.businessLine === input.businessLine && t.scene === input.scene && (t.status === '生效' || t.status === '草稿'); });
    if (existingKey.length) return { ok: false, msg: '该业务线与销售场景已有模板或草稿；请进入已有模板创建新版本。' };
    var t = { code: code, version: 'v1', name: name, businessLine: input.businessLine, scene: input.scene,
      status: '草稿', isNewSeries: true, publishedAt: '', stagnantDays: input.stagnantDays == null || input.stagnantDays === '' ? 14 : Number(input.stagnantDays), stages: [], note: String(input.note || '新建流程模板'), history: [] };
    arr('templates').unshift(t);
    t.history.push({ version: t.version, at: stamp(), by: me().id, action: '新建模板草稿', note: t.note });
    audit('业务配置', code + ' ' + t.version, '新建流程模板草稿', '—', JSON.stringify({ name: name, businessLine: t.businessLine, scene: t.scene }));
    save(); return { ok: true, draft: t, msg: '已创建模板草稿 ' + code + ' v1。' };
  }
  function templateDraftSave(code, patch) {
    load();
    var list0 = arr('templates');
    /* 新草稿一律以「当前生效版本」为基线；没有生效版本时才退回该编码下的第一条。 */
    var base = list0.filter(function (t) { return t.code === code && t.status === '生效'; })[0] ||
      list0.filter(function (t) { return t.code === code; }).pop();
    if (!base) return { ok: false, msg: '模板不存在，不能基于不存在的版本创建草稿' };
    var list = list0;
    var draft = list.filter(function (t) { return t.code === code && t.status === '草稿'; })[0];
    if (!draft) {
      var next = 'v' + (parseInt(String(base.version || 'v1').replace(/^v/i, ''), 10) + 1);
      draft = {
        code: code, version: next, name: patch && patch.name ? patch.name : base.name,
        businessLine: base.businessLine, scene: base.scene, status: '草稿', publishedAt: '',
        stagnantDays: base.stagnantDays, stages: JSON.parse(JSON.stringify(base.stages || [])),
        note: (patch && patch.note) || '基于已生效版本复制的新草稿', history: []
      };
      list.unshift(draft);
    }
    if (patch && patch.businessLine !== undefined && !draft.isNewSeries && patch.businessLine !== draft.businessLine) return { ok: false, msg: '已有模板系列不能直接更改业务线；请创建新模板并按迁移规则处理。' };
    if (patch && patch.scene !== undefined && !draft.isNewSeries && patch.scene !== draft.scene) return { ok: false, msg: '已有模板系列不能直接更改销售场景；请创建新模板并按迁移规则处理。' };
    ['name', 'stagnantDays', 'note', 'businessLine', 'scene'].forEach(function (k) {
      if (patch && patch[k] !== undefined) draft[k] = patch[k];
    });
    if (patch && patch.stages !== undefined) draft.stages = JSON.parse(JSON.stringify(patch.stages));
    draft.history = draft.history || [];
    draft.history.push({ version: draft.version, at: stamp(), by: me().id, action: '保存草稿', note: draft.note || '' });
    audit('业务配置', code + ' ' + draft.version, '保存草稿（B 类）', '', draft.note || '');
    save();
    return { ok: true, draft: draft, msg: '已保存草稿 ' + draft.version };
  }
  function templateValidate(code) {
    load();
    var draft = arr('templates').filter(function (t) { return t.code === code && t.status === '草稿'; })[0];
    if (!draft) return { ok: false, errors: ['没有待发布的草稿版本'], msg: '没有待发布的草稿版本' };
    var errs = [];
    if (!String(draft.name || '').trim()) errs.push('模板名称必填');
    if (!Number.isInteger(Number(draft.stagnantDays)) || Number(draft.stagnantDays) < 1) errs.push('停滞阈值必须为不小于 1 的整数');
    var line = arr('businessLines').filter(function (b) { return b.code === draft.businessLine; })[0];
    if (!line || line.status !== '启用') errs.push('模板必须绑定启用状态的业务线');
    var scene = scenarioByLine(draft.businessLine, draft.scene);
    if (!scene || scene.status === '停用') errs.push('模板必须绑定该业务线下已启用的销售场景');
    if (!draft.stages || !draft.stages.length) errs.push('至少保留一个阶段');
    var seen = {}, seenNames = {}, lastUnified = -1;
    (draft.stages || []).forEach(function (s, i) {
      if (!String(s.name || '').trim()) errs.push('第 ' + (i + 1) + ' 个阶段缺少阶段名称');
      var normName = String(s.name || '').trim().toLowerCase();
      if (normName && seenNames[normName]) errs.push('阶段名称重复：' + s.name);
      if (normName) seenNames[normName] = true;
      if (!String(s.code || '').trim()) errs.push('第 ' + (i + 1) + ' 个阶段缺少阶段编码');
      if (seen[s.code]) errs.push('阶段编码重复：' + s.code);
      seen[s.code] = true;
      var u = s.unified || s.unifiedStage;
      if (!u) { errs.push('阶段「' + (s.name || s.code) + '」缺少统一阶段映射'); return; }
      var idx = UNIFIED_STAGE_NAMES().indexOf(u);
      if (idx < 0) { errs.push('阶段「' + s.name + '」的统一阶段「' + u + '」不在五个统一阶段之内'); return; }
      if (idx < lastUnified) errs.push('阶段「' + s.name + '」的统一阶段顺序回退，流程阶段必须单调推进');
      lastUnified = idx;
    });
    /* 首阶段必须映射「机会确认」：所有模板都从机会确认开始（prd/03 §7.1），
       否则新商机会直接落到后续阶段，系统固定门槛（预计成交时间）将永不触发。 */
    var first = (draft.stages || [])[0];
    if (first && (first.unified || first.unifiedStage) !== '机会确认') {
      errs.push('首个详细阶段「' + (first.name || first.code) + '」必须映射统一阶段「机会确认」');
    }
    /* 匹配键唯一：同一「主业务线＋销售场景」只能有一个生效模板（prd/03 §6）。
       缺这条校验时，配置侧可以发布出同键两条生效模板，销售侧创建会被全部阻断。 */
    var dupKey = arr('templates').filter(function (t) {
      return t.code !== code && t.status === '生效' && t.businessLine === draft.businessLine && t.scene === draft.scene;
    });
    if (dupKey.length) {
      errs.push('匹配键「' + businessLineName(draft.businessLine) + '＋' + sceneName(draft.businessLine, draft.scene) +
        '」已有生效模板（' + dupKey.map(function (t) { return t.code + ' ' + t.version; }).join('、') + '），同一匹配键只能有一个生效版本');
    }
    /* 字段与任务配置有效（prd/03 §8.1／§8.2）：引用的字段必须存在、启用且适用于本模板主业务线；
       阶段任务必须有标题，截止天数要么留空（无截止），要么为 ≥1 的整数。 */
    (draft.stages || []).forEach(function (s) {
      var label = '阶段「' + (s.name || s.code) + '」';
      (s.requiredFields || []).forEach(function (cf) {
        var f = customField(cf);
        if (!f) { errs.push(label + '引用了不存在的自定义字段：' + cf); return; }
        if (f.status && f.status !== '启用') { errs.push(label + '引用了已停用的自定义字段：' + (f.name || cf)); return; }
        var scope = f.businessLines || [];
        if (scope.length && scope.indexOf(draft.businessLine) < 0) {
          errs.push(label + '引用的字段「' + (f.name || cf) + '」不适用于模板主业务线；协同业务线不能作为固定门槛');
        }
      });
      (s.tasks || []).forEach(function (tk, ti) {
        var tn = label + '第 ' + (ti + 1) + ' 个阶段任务';
        if (!tk.title || !String(tk.title).trim()) errs.push(tn + '缺少任务标题');
        if (tk.dueDays !== undefined && tk.dueDays !== null && tk.dueDays !== '') {
          var n = Number(tk.dueDays);
          if (!Number.isInteger(n) || n < 1) errs.push(tn + '的截止天数必须为不小于 1 的整数，或留空表示无截止');
        }
      });
    });
    save();
    return { ok: errs.length === 0, errors: errs, msg: errs.length ? errs.join('；') : '校验通过' };
  }
  /* 发布即整版生效或整版不生效；不做「模板 A 用新版本、模板 B 用旧版本」的跨版本替换。 */
  function templatePublish(code, reason) {
    load();
    if (!String(reason || '').trim()) return { ok: false, msg: '发布流程模板需要填写发布原因。' };
    var v = templateValidate(code);
    if (!v.ok) return { ok: false, msg: '校验未通过：' + v.msg, errors: v.errors, published: false };
    var list = arr('templates');
    var draft = list.filter(function (t) { return t.code === code && t.status === '草稿'; })[0];
    var actives = list.filter(function (t) { return t.code === code && t.status === '生效'; });
    try {
      actives.forEach(function (t) { t.status = '历史'; t.retiredAt = stamp(); });
      draft.status = '生效'; draft.publishedAt = stamp(); draft.publisher = me().id;
      draft.history.push({ version: draft.version, at: stamp(), by: me().id, action: '立即发布', note: reason });
    } catch (e) {
      actives.forEach(function (t) { t.status = '生效'; t.retiredAt = ''; });
      draft.status = '草稿';
      return { ok: false, msg: '发布失败，已回滚；旧版本继续生效', published: false };
    }
    audit('业务配置', code, '立即发布（B 类）', '旧版本', code + ' ' + draft.version + '｜原因：' + reason);
    save();
    return { ok: true, published: true, draft: draft, msg: '已原子发布 ' + draft.version + '；历史商机继续按原版本解释' };
  }
  /* 恢复旧版本＝基于旧版本复制出一个新草稿，再用正常发布流程生效；不做版本指针回拨。 */
  function templateRestore(code, version, reason) {
    load();
    if (!String(reason || '').trim()) return { ok: false, msg: '恢复历史版本需要填写原因。' };
    var src = template(code, version);
    if (!src) return { ok: false, msg: '目标版本不存在' };
    if (src.status === '生效') return { ok: false, msg: '该版本已是生效版本' };
    if (src.status === '草稿') return { ok: false, msg: '该版本已是草稿，直接编辑即可' };
    var list = arr('templates');
    if (list.filter(function (t) { return t.code === code && t.status === '草稿'; }).length) {
      return { ok: false, msg: '已存在草稿版本，请先发布或删除后再恢复旧版本' };
    }
    var act = list.filter(function (t) { return t.code === code && t.status === '生效'; })[0];
    var next = 'v' + (parseInt(String((act && act.version) || version).replace(/^v/i, ''), 10) + 1);
    var copy = JSON.parse(JSON.stringify(src));
    copy.version = next; copy.status = '草稿'; copy.publishedAt = '';
    copy.note = '由 ' + version + ' 复制生成的新草稿（恢复旧版本）：' + reason;
    copy.history = [{ version: next, at: stamp(), by: me().id, action: '从 ' + version + ' 复制为新草稿', note: copy.note }];
    list.unshift(copy);
    audit('业务配置', code, '恢复旧版本（复制为新草稿）', version, next);
    save();
    return { ok: true, draft: copy, msg: '已从 ' + version + ' 复制出草稿 ' + next + '，请校验后发布' };
  }
  function templateDeactivate(code, reason) {
    load();
    var active = arr('templates').filter(function (t) { return t.code === code && t.status === '生效'; })[0];
    if (!active) return { ok: false, msg: '没有生效版本可停用。' };
    if (!String(reason || '').trim()) return { ok: false, msg: '停用流程模板需要填写原因。' };
    var refs = arr('opportunities').filter(function (o) { return o.templateCode === code; }).length;
    active.status = '停用'; active.retiredAt = stamp(); active.deactivateReason = reason;
    active.history = active.history || []; active.history.push({ version: active.version, at: stamp(), by: me().id, action: '停用', note: reason });
    audit('业务配置', code + ' ' + active.version, '停用流程模板', '生效', '停用｜引用商机 ' + refs + ' 条｜原因：' + reason);
    save(); return { ok: true, template: active, referenceCount: refs };
  }

  /* 核心状态机枚举：这些字典分组同时是状态机与页面判定的事实源，
     任意改名或删除会破坏状态语义，因此字典页对它们只读（prd/02 §2、prd/03 §7.1、§13）。 */
  var CORE_DICT_GROUPS = ['leadStatus', 'unifiedStage', 'oppProcessStatus', 'oppCloseResult', 'wonBasis',
    'lostReason', 'stopReason', 'customerStatus', 'exceptionStatus'];
  function isCoreDict(key) { return CORE_DICT_GROUPS.indexOf(key) >= 0; }

  /* 字典值的业务引用登记：删除前必须检查；已引用条目保留历史解释，不做物理删除。
     未登记的分组不做猜测性判断，由页面显式提示「引用检查未覆盖该分组」。 */
  var DICT_USAGE = {
    customerType: [{ coll: 'customers', get: function (r) { return [r.type]; } }],
    customerStatus: [{ coll: 'customers', get: function (r) { return [r.status]; } }],
    customerValue: [{ coll: 'customers', get: function (r) { return [r.value]; } }],
    addressType: [{ coll: 'addresses', get: function (r) { return [r.type]; } }],
    contactRole: [{ coll: 'contactRelations', get: function (r) { return r.roles || []; } }],
    customerNetworkType: [{ coll: 'customerNetworks', get: function (r) { return [r.type]; } }],
    operateStatus: [{ coll: 'businessRelations', get: function (r) { return [r.status]; } }],
    leadStatus: [{ coll: 'leads', get: function (r) { return [r.status]; } }],
    leadPoolStatus: [{ coll: 'leadPools', get: function (r) { return [r.status]; } }],
    leadSource: [{ coll: 'leads', get: function (r) { return [r.source]; } }],
    leadInvalidReason: [{ coll: 'leads', get: function (r) { return [r.invalidReason]; } }],
    recordSource: [{ coll: 'leads', get: function (r) { return [r.sourceRecord]; } },
      { coll: 'customers', get: function (r) { return [r.source]; } }],
    oppProcessStatus: [{ coll: 'opportunities', get: function (r) { return [r.processStatus]; } }],
    oppCloseResult: [{ coll: 'opportunities', get: function (r) { return [r.closeResult]; } }],
    wonBasis: [{ coll: 'opportunities', get: function (r) { return [r.closeBasis]; } }],
    lostReason: [{ coll: 'opportunities', get: function (r) { return [r.closeReason]; } }],
    stopReason: [{ coll: 'opportunities', get: function (r) { return [r.closeReason]; } }],
    teamRole: [{ coll: 'opportunities', get: function (r) { return (r.team || []).map(function (m) { return m.role; }); } }],
    jobType: [{ coll: 'jobs', get: function (r) { return [r.type]; } }],
    jobStatus: [{ coll: 'jobs', get: function (r) { return [r.status]; } }],
    exceptionStatus: [{ coll: 'exceptions', get: function (r) { return [r.status]; } }]
  };
  function dictUsageKnown(key) { return !!DICT_USAGE[key]; }
  /* 返回引用该值的业务对象清单（用于删除前检查与提示）。 */
  function dictUsage(key, value) {
    var hits = [];
    (DICT_USAGE[key] || []).forEach(function (entry) {
      (all(entry.coll) || []).forEach(function (row) {
        var vals = entry.get(row) || [];
        if (vals.indexOf(value) >= 0) hits.push({ coll: entry.coll, id: row.id || '' });
      });
    });
    return hits;
  }

  function configA(key) {    load();
    if (key === 'cusPool') return db.cusPoolRule;
    if (key === 'regions') return db.regionRules;
    if (key === 'scenarios') return db.scenarios;
    if (key === 'dict') return db.dicts;
    if (key === 'customFields') return db.customFields;
    if (key === 'leadPool') return db.leadPools;
    if (key === 'agentConfig') return db.agentConfig;
    return null;
  }
  /* A 类配置：保存即生效并留历史，不建设审批与未来定时生效。 */
  function configASave(key, patch, reason) {
    load();
    var o = configA(key); if (!o) return { ok: false, msg: '配置不存在' };
    var target = Array.isArray(o) ? o[0] : o;
    var before = JSON.parse(JSON.stringify(patch ? Object.keys(patch).reduce(function (a, k) { a[k] = (Array.isArray(o) ? o[0] : o)[k]; return a; }, {}) : {}));
    Object.keys(patch || {}).forEach(function (k) { if (patch[k] !== undefined) target[k] = patch[k]; });
    target.history = target.history || [];
    target.history.push({ at: stamp(), by: me().id, action: '修改配置', from: JSON.stringify(before), to: JSON.stringify(patch), reason: reason || '' });
    audit('业务配置', key, '保存生效（A 类）', JSON.stringify(before), JSON.stringify(patch));
    save();
    return { ok: true, saved: target };
  }
  /* 数组型 A 类配置（区域规则、自定义字段、线索池）按条目定位保存。
     configASave 只能表达「单对象」型配置；数组型若沿用它会固定改写第 0 条，
     因此这里单独按 code／id 定位到具体条目，并且新增与删除同样留历史。 */
  function configAItem(key, code, patch, reason) {
    load();
    var o = configA(key);
    if (!Array.isArray(o)) return { ok: false, msg: '该配置不是数组型配置，请使用保存生效' };
    var item = code ? o.filter(function (x) { return x.id === code || x.code === code; })[0] : null;
    if (code && !item) return { ok: false, msg: '配置项不存在：' + code };
    var isNew = !item;
    if (isNew) {
      item = {};
      var id = (patch && (patch.id || patch.code)) || code;
      if (id) item.id = id;
      o.push(item);
    }
    var before = {};
    Object.keys(patch || {}).forEach(function (k) { if (!isNew) before[k] = item[k]; });
    Object.keys(patch || {}).forEach(function (k) { if (patch[k] !== undefined) item[k] = patch[k]; });
    item.history = item.history || [];
    item.history.push({
      at: stamp(), by: me().id, action: isNew ? '新增配置项' : '修改配置项',
      from: JSON.stringify(before), to: JSON.stringify(patch), reason: reason || ''
    });
    audit('业务配置', key + '｜' + (code || item.code || ''), isNew ? '新增（A 类）' : '保存生效（A 类）',
      JSON.stringify(before), JSON.stringify(patch));
    save();
    return { ok: true, item: item, isNew: isNew };
  }
  function configARemove(key, code, reason) {
    load();
    var o = configA(key);
    if (!Array.isArray(o)) return { ok: false, msg: '该配置不是数组型配置' };
    var idx = -1;
    o.forEach(function (x, i) { if (x.id === code || x.code === code) idx = i; });
    if (idx < 0) return { ok: false, msg: '配置项不存在：' + code };
    var removed = o.splice(idx, 1)[0];
    audit('业务配置', key + '｜' + code, '删除配置项（A 类）', (removed.name || code), '', reason || '');
    save();
    return { ok: true, removed: removed };
  }
  /* B 类规则草稿保存：只改草稿版本；生效版本与在途对象不受影响。 */
  function configBSaveDraft(key, id, patch, reason) {
    load();
    var item = find(key, id);
    if (!item) return { ok: false, msg: '规则不存在' };
    if (item.status !== '草稿') return { ok: false, msg: '只有草稿版本可以编辑；生效与历史版本只读' };
    var before = {};
    Object.keys(patch || {}).forEach(function (k) { before[k] = item[k]; });
    Object.keys(patch || {}).forEach(function (k) { if (patch[k] !== undefined) item[k] = patch[k]; });
    item.history = item.history || [];
    item.history.push({ version: item.version, at: stamp(), by: me().id, action: '保存草稿', note: reason || '' });
    audit('业务配置', key + '｜' + (item.code || id), '保存草稿（B 类）', JSON.stringify(before), JSON.stringify(patch));
    save();
    return { ok: true, item: item, msg: '草稿已保存，发布后才会生效' };
  }
  function configBList(key) { return arr(key); }
  function taskRuleCloneDraft(id) {
    load();
    var source = find('taskRules', id);
    if (!source || source.status === '草稿') return { ok: false, msg: '请选择生效或历史版本' };
    var family = source.code.replace(/-V\d+.*$/, '');
    var siblings = arr('taskRules').filter(function (r) { return r.code.replace(/-V\d+.*$/, '') === family; });
    var draft = siblings.filter(function (r) { return r.status === '草稿'; })[0];
    if (draft) return { ok: true, item: draft, msg: '已有进行中的草稿' };
    var version = 1 + Math.max.apply(null, siblings.map(function (r) { return Number((/V(\d+)/.exec(r.version || '') || [0, 0])[1]); }));
    var copy = JSON.parse(JSON.stringify(source));
    copy.id = nextId('TR'); copy.code = family + '-V' + version; copy.version = 'V' + version + '（草稿）';
    copy.status = '草稿'; copy.publishedAt = ''; copy.publisher = '';
    copy.history = [{ version: copy.version, at: stamp(), by: me().id, action: '复制为新草稿', note: '来源：' + source.code }];
    db.taskRules.push(copy);
    audit('业务配置', copy.code, '复制任务规则草稿', source.code, copy.code);
    save();
    return { ok: true, item: copy };
  }
  function visitRuleCreateDraft(input) {
    load();
    var family = String(input.familyCode || '').trim().toUpperCase();
    if (!/^VR-[A-Z0-9-]+$/.test(family) || /-V\d+$/.test(family)) return { ok: false, msg: '规则编码须以 VR- 开头，使用大写字母、数字或连字符，且不含版本号' };
    if (arr('visitRules').some(function (r) { return r.familyCode === family; })) return { ok: false, msg: '规则编码已存在；请进入原规则生成新草稿' };
    var item = {
      id: nextId('VR'), familyCode: family, code: family + '-V1', version: 'V1（草稿）',
      name: String(input.name || '').trim(), category: 'B 类', status: '草稿',
      scopeSpec: input.scopeSpec || { businessLines: [], regions: [], users: [], visitTypes: [] },
      scope: input.scope || '全部拜访', radius: Number(input.radius), accuracy: Number(input.accuracy),
      duration: Number(input.duration), imageRequired: !!input.imageRequired,
      checkRule: input.checkRule || '', exceptionRule: input.exceptionRule || '',
      publishedAt: '', publisher: '', history: [{ version: 'V1（草稿）', at: stamp(), by: me().id, action: '新建草稿', note: input.note || '' }]
    };
    db.visitRules.push(item);
    audit('业务配置', item.code, '新建拜访规则草稿', '', item.name);
    save();
    return { ok: true, item: item };
  }
  function visitRuleCloneDraft(id) {
    load();
    var source = find('visitRules', id);
    if (!source || source.status === '草稿') return { ok: false, msg: '请选择生效或历史版本' };
    var family = source.familyCode || source.code.replace(/-V\d+.*$/, '');
    var siblings = arr('visitRules').filter(function (r) { return r.familyCode === family; });
    var draft = siblings.filter(function (r) { return r.status === '草稿'; })[0];
    if (draft) return { ok: true, item: draft, msg: '已有进行中的草稿' };
    var version = 1 + Math.max.apply(null, siblings.map(function (r) { return Number((/V(\d+)/.exec(r.version || '') || [0, 0])[1]); }));
    var copy = JSON.parse(JSON.stringify(source));
    copy.id = nextId('VR'); copy.code = family + '-V' + version; copy.version = 'V' + version + '（草稿）';
    copy.status = '草稿'; copy.publishedAt = ''; copy.publisher = '';
    copy.history = [{ version: copy.version, at: stamp(), by: me().id, action: '复制为新草稿', note: '来源：' + source.code }];
    db.visitRules.push(copy);
    audit('业务配置', copy.code, '复制拜访规则草稿', source.code, copy.code);
    save();
    return { ok: true, item: copy };
  }
  function visitRuleDisable(id, reason) {
    load();
    var item = find('visitRules', id);
    if (!item || item.status !== '生效') return { ok: false, msg: '只有生效规则可停用' };
    if (!String(reason || '').trim()) return { ok: false, msg: '停用原因必填' };
    item.status = '停用'; item.disabledAt = stamp();
    item.history.push({ version: item.version, at: stamp(), by: me().id, action: '停用', note: reason.trim() });
    audit('业务配置', item.code, '停用拜访规则', '生效', '停用', reason.trim());
    save();
    return { ok: true, item: item };
  }
  function configBValidate(key, id) {
    load();
    var item = find(key, id); if (!item) return { ok: false, msg: '规则不存在' };
    var errs = [];
    if (!item.name) errs.push('规则名称必填');
    if (key === 'visitRules') {
      if (!(item.radius > 0)) errs.push('签到半径必须大于 0');
      if (!(item.accuracy > 0)) errs.push('定位精度阈值必须大于 0');
      if (!(item.duration > 0)) errs.push('提示时长必须大于 0');
      var scope = visitRuleScope(item);
      [['businessLines', 'businessLines', 'code'], ['regions', 'regions', 'code'], ['users', 'users', 'id']].forEach(function (entry) {
        scope[entry[0]].forEach(function (code) {
          if (!arr(entry[1]).some(function (x) { return x[entry[2]] === code && x.status !== '停用'; })) errs.push('适用范围包含不存在或已停用的对象：' + code);
        });
      });
      scope.visitTypes.forEach(function (type) { if (['实地拜访', '远程拜访'].indexOf(type) < 0) errs.push('拜访类型无效：' + type); });
    }
    if (key === 'taskRules') {
      if (!item.sourceRule) errs.push('来源规则必填');
      item.needAccept = false;
      item.rejectAllowed = false;
      item.acceptorRule = '';
    }
    save();
    return { ok: errs.length === 0, errors: errs, msg: errs.length ? errs.join('；') : '校验通过' };
  }
  /* B 类：立即原子发布新版本；发布失败不能部分生效，旧版本继续生效，草稿保留。 */
  function configBPublish(key, id, reason) {
    load();
    var item = find(key, id); if (!item) return { ok: false, msg: '规则不存在' };
    if (item.status !== '草稿') return { ok: false, msg: '只有草稿可以发布' };
    if (key === 'visitRules' && !String(reason || '').trim()) return { ok: false, msg: '发布原因必填' };
    var v = configBValidate(key, id);
    if (!v.ok) return { ok: false, msg: '校验未通过：' + v.msg, errors: v.errors, published: false };
    var list = arr(key);
    var code = item.familyCode || item.code.replace(/-V\d+.*$/, '');
    var actives = list.filter(function (x) { return (x.familyCode || x.code.replace(/-V\d+.*$/, '')) === code && x.status === '生效'; });
    try {
      actives.forEach(function (x) { x.status = '历史'; x.retiredAt = stamp(); });
      item.status = '生效'; item.publishedAt = stamp(); item.publisher = me().id;
      item.version = item.version.replace('（草稿）', '');
      item.history.push({ version: item.version, at: stamp(), by: me().id, action: '立即发布', note: reason || '原子发布新版本' });
    } catch (e) {
      /* 发布失败：回滚到发布前状态，不允许部分生效。 */
      actives.forEach(function (x) { x.status = '生效'; x.retiredAt = ''; });
      item.status = '草稿';
      return { ok: false, msg: '发布失败，已回滚；旧版本继续生效', published: false };
    }
    audit('业务配置', id, '立即发布（B 类）', code + ' 旧版本', code + ' ' + item.version, reason || '');
    save();
    return { ok: true, published: true, item: item, msg: '已原子发布 ' + item.version + '；历史对象继续按原版本解释' };
  }
  function metricDefList() { return arr('metrics'); }
  function metricVersionList(code) {
    load();
    var list = arr('metricVersions');
    return code ? list.filter(function (v) { return v.code === code; }) : list;
  }
  function metricDraftSave(code, patch, reason) {
    load();
    var m = metric(code); if (!m) return { ok: false, msg: '指标不存在' };
    var nextV = 'V' + (parseInt((m.version || 'V1').slice(1), 10) + 1);
    var draft = arr('metricVersions').filter(function (v) { return v.code === code && v.status === '草稿'; })[0];
    if (!draft) {
      draft = { id: 'MV-D' + (arr('metricVersions').length + 1), code: code, version: nextV, status: '草稿',
        publishedAt: '', effectiveAt: '', retiredAt: '', publisher: me().id, change: reason || '调整口径', note: '' };
      db.metricVersions.unshift(draft);
    }
    Object.keys(patch || {}).forEach(function (k) { if (patch[k] !== undefined) draft[k] = patch[k]; });
    draft.change = (patch && patch.change) || draft.change;
    audit('指标配置', code, '保存草稿', '', draft.version);
    save();
    return { ok: true, draft: draft, msg: '已保存草稿 ' + draft.version };
  }
  function metricValidate(code) {
    load();
    var draft = arr('metricVersions').filter(function (v) { return v.code === code && v.status === '草稿'; })[0];
    if (!draft) return { ok: false, msg: '没有待发布的草稿版本' };
    var errs = [];
    if (!draft.change) errs.push('变更说明必填');
    save();
    return { ok: errs.length === 0, errors: errs, msg: errs.length ? errs.join('；') : '校验通过' };
  }
  /* 指标轻量 B 类：草稿 → 校验 → 立即发布 → 旧版本转历史；跨版本不计算环比。 */
  function metricPublish(code) {
    load();
    var v = metricValidate(code);
    if (!v.ok) return { ok: false, msg: v.msg, errors: v.errors };
    var draft = arr('metricVersions').filter(function (x) { return x.code === code && x.status === '草稿'; })[0];
    var m = metric(code);
    var old = arr('metricVersions').filter(function (x) { return x.code === code && x.status === '生效'; });
    try {
      old.forEach(function (x) { x.status = '历史'; x.retiredAt = stamp(); });
      draft.status = '生效'; draft.publishedAt = stamp(); draft.effectiveAt = stamp(); draft.publisher = me().id;
      if (m) { m.version = draft.version; m.publishedAt = draft.publishedAt; }
    } catch (e) {
      old.forEach(function (x) { x.status = '生效'; x.retiredAt = ''; });
      draft.status = '草稿';
      return { ok: false, msg: '发布失败，已回滚；旧版本继续生效' };
    }
    audit('指标配置', code, '立即发布', '', draft.version + '｜' + draft.change);
    save();
    return { ok: true, draft: draft, msg: '已发布 ' + draft.version + '；历史数据不自动重算' };
  }

  /* ==================================================== 审计（07/08） */

  function auditList(filter) {
    var list = arr('audits');
    filter = filter || {};
    if (filter.objectType) list = list.filter(function (a) { return a.objectType === filter.objectType; });
    if (filter.source) list = list.filter(function (a) { return a.source === filter.source; });
    if (filter.actor) list = list.filter(function (a) { return a.actor === filter.actor; });
    if (filter.q) {
      var s = filter.q.toLowerCase();
      list = list.filter(function (a) { return (a.action + a.objectType + a.objectId + (a.from || '') + (a.to || '')).toLowerCase().indexOf(s) >= 0; });
    }
    return list;
  }

  return {
    KEY: KEY, load: load, save: save, reset: reset, now: now, today: today, addDays: addDays,
    nextId: nextId, month: month,
    role: role, setRole: setRole, currentUser: currentUser, user: user, userName: userName,
    all: all, find: find, customer: customer, contact: contact, lead: lead, opp: opp, job: job,
    template: template, templateByKey: templateByKey, currentTemplate: currentTemplate, currentStage: currentStage,
    stageIndex: stageIndex, opportunityStagnation: opportunityStagnation, customField: customField, regionName: regionName, businessLineName: businessLineName, activeRegions: activeRegions,
    scenarioOptions: scenarioOptions, enabledScenarioOptions: enabledScenarioOptions, scenarioSave: scenarioSave, scenarioToggle: scenarioToggle,
    scenarioByLine: scenarioByLine, sceneName: sceneName, matchTemplate: matchTemplate, matchReason: matchReason,
    relationsOf: relationsOf, activeRelationsOf: activeRelationsOf,
    createCustomer: createCustomer, createCustomerWithInitialRelation: createCustomerWithInitialRelation,
    ownerRegionOptions: ownerRegionOptions, updateCustomer: updateCustomer, setCustomerValue: setCustomerValue,
    setCustomerIdentity: setCustomerIdentity, submitGroupCandidate: submitGroupCandidate, confirmGroupCandidate: confirmGroupCandidate,
    reviewCustomerValue: reviewCustomerValue, handleException: handleException,
    createContact: createContact, addContactRelation: addContactRelation, createContactWithRelation: createContactWithRelation,
    createAddress: createAddress, removeAddress: removeAddress,
    poolRecords: poolRecords, claimPool: claimPool, assignPool: assignPool, releasePool: releasePool,
    recyclePool: recyclePool, addCollaborator: addCollaborator, stopOperating: stopOperating,
    createRelation: createRelation, relationPrecheck: relationPrecheck,
    relationHoldCount: relationHoldCount, userQualified: userQualified, RELATION_HOLD_LIMIT: RELATION_HOLD_LIMIT,
    relationCandidates: relationCandidates, relationOwnerPrecheck: relationOwnerPrecheck,
    assignRelationOwner: assignRelationOwner, transferRelation: transferRelation,
    createLead: createLead, updateLead: updateLead, leadAction: leadAction, convertLead: convertLead, poolOf: poolOf,
    createOpportunity: createOpportunity, updateOpportunitySalesRegion: updateOpportunitySalesRegion, gateCheck: gateCheck, advanceStage: advanceStage, rollbackStage: rollbackStage, currentStageEntryEvent: currentStageEntryEvent,
    changeMainLine: changeMainLine, addOpportunityLine: addOpportunityLine, removeOpportunityLine: removeOpportunityLine,
    sleepOpp: sleepOpp, resumeOpp: resumeOpp, closeOpp: closeOpp, reopenOpp: reopenOpp,
    splitLine: splitLine, addTeamMember: addTeamMember, removeTeamMember: removeTeamMember, reassignOwner: reassignOwner,
    changeOpportunityCustomer: changeOpportunityCustomer, updateOpportunityNextAction: updateOpportunityNextAction,
    generateStageTasks: generateStageTasks,
    addJob: addJob, updateJob: updateJob, retryFailed: retryFailed,
    markMessageRead: markMessageRead, markAllMessagesRead: markAllMessagesRead, audit: audit,
    listState: listState, selection: selection, uiState: uiState,
    setUser: setUser, arr: arr, isTeamScope: isTeamScope, inTeamOf: inTeamOf,
    /* 任务 */
    tasks: tasks, task: task, taskAct: taskAct, addTaskCollabRecord: addTaskCollabRecord, remindTask: remindTask, saveMeetingRecord: saveMeetingRecord, taskOverdue: taskOverdue, taskSoon: taskSoon,
    taskDaysLeft: taskDaysLeft, taskRemindWindow: taskRemindWindow,
    createTask: createTask,
    /* 销售活动 */
    activityList: activityList, activity: activity, createActivity: createActivity, correctActivity: correctActivity,
    /* 正式拜访 */
    visitList: visitList, visit: visit, createVisit: createVisit, visitCheckIn: visitCheckIn,
    visitCheckOut: visitCheckOut, visitReview: visitReview, batchVisitReview: batchVisitReview,
    visitRuleFor: visitRuleFor, visitSupplement: visitSupplement, visitCorrection: visitCorrection,
    /* 统一日程 */
    scheduleList: scheduleList, sched: sched, createSchedule: createSchedule, updateSchedule: updateSchedule,
    cancelSchedule: cancelSchedule, deleteSchedule: deleteSchedule, scheduleToTask: scheduleToTask, retryScheduleSync: retryScheduleSync,
    calendarEvents: calendarEvents,
    /* 日报 */
    reportList: reportList, report: report, reportDraftOf: reportDraftOf, ensureReportDraft: ensureReportDraft, ensureReportEditableDraft: ensureReportEditableDraft, saveReportDraft: saveReportDraft,
    submitReport: submitReport, addReportAdvice: addReportAdvice, markReportRead: markReportRead,
    /* Agent */
    candidateList: candidateList, candidate: candidate, candidateConfirm: candidateConfirm,
    candidateIgnore: candidateIgnore, candidateBatchConfirm: candidateBatchConfirm,
    candidateRetryWrite: candidateRetryWrite, agentRunList: agentRunList,
    /* 知识 */
    knowledgeList: knowledgeList, kb: kb, knowledgeCreate: knowledgeCreate, knowledgeSaveDraft: knowledgeSaveDraft, knowledgeInPublishScope: knowledgeInPublishScope,
    knowledgePublish: knowledgePublish, knowledgeDeactivate: knowledgeDeactivate,
    /* 消息投递 */
    deliveryList: deliveryList, retryDelivery: retryDelivery,
    notificationPrefs: notificationPrefs, saveNotificationPrefs: saveNotificationPrefs,
    /* 集成与同步 */
    extSystems: extSystems, syncList: syncList, retrySync: retrySync,
    /* 异常事项与数据质量 */
    exceptionList: exceptionList, exceptionClaim: exceptionClaim, exceptionReturn: exceptionReturn,
    exceptionComplete: exceptionComplete, exceptionReject: exceptionReject,
    qualityIssueList: qualityIssueList, qualityIgnore: qualityIgnore, qualityRerun: qualityRerun,
    qualityPending: qualityPending,
    /* 人员、权限与移交 */
    peopleList: peopleList, permPendingList: permPendingList, permPendingAct: permPendingAct,
    handoverList: handoverList, handover: handover, handoverPrecheck: handoverPrecheck, handoverRun: handoverRun,
    peopleSyncList: peopleSyncList, peopleSyncAct: peopleSyncAct,
    /* 指标与配置 */
    METRIC_THEMES: METRIC_THEMES, metric: metric, metricRange: metricRange, metricValue: metricValue,
    metricBoard: metricBoard, metricDrill: metricDrill, metricInjectFail: metricInjectFail,
    metricDefList: metricDefList, metricVersionList: metricVersionList, metricDraftSave: metricDraftSave,
    metricValidate: metricValidate, metricPublish: metricPublish,
    configA: configA, configASave: configASave, configAItem: configAItem,
    isCoreDict: isCoreDict, dictUsage: dictUsage, dictUsageKnown: dictUsageKnown, CORE_DICT_GROUPS: CORE_DICT_GROUPS,
    configARemove: configARemove, configBList: configBList, configBSaveDraft: configBSaveDraft, taskRuleCloneDraft: taskRuleCloneDraft,
    configBValidate: configBValidate, configBPublish: configBPublish,
    visitRuleCreateDraft: visitRuleCreateDraft, visitRuleCloneDraft: visitRuleCloneDraft, visitRuleDisable: visitRuleDisable,
    flowTemplates: flowTemplates, templateCreateDraft: templateCreateDraft, templateDraftSave: templateDraftSave,
    templateValidate: templateValidate, templatePublish: templatePublish, templateRestore: templateRestore,
    templateDeactivate: templateDeactivate,
    /* 审计 */
    auditList: auditList
  };
})();
