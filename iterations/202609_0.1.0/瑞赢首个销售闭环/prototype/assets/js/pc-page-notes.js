/* PC prototype review notes: one hidden page panel and contextual field notes.
 * This script is deliberately PC-only and never changes business data. */
(function () {
  'use strict';
  if (!/\/pc(?:\/|\.html$)/.test(location.pathname)) return;
  var script = document.currentScript;
  var css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = script.src.replace(/js\/pc-page-notes\.js(?:\?.*)?$/, 'css/pc-page-notes.css');
  document.head.appendChild(css);
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
  var path = location.pathname.split('/prototype/').pop();
  var isCustomerList = path === 'pc/customer/list.html';
  var isContactList = path === 'pc/contact/list.html';
  var isPoolList = path === 'pc/customer/public-pool.html';
  var isCustomerRelatedList = isCustomerList || isContactList || isPoolList;
  var isCustomerDetail = path === 'pc/customer/detail.html';
  var isCustomerCreate = path === 'pc/customer/create.html';
  var isContactDetail = path === 'pc/contact/detail.html';
  var importKind = new URLSearchParams(location.search).get('kind') || 'customer';
  var isCustomerImport = path === 'pc/customer/import.html' && importKind === 'customer';
  var isContactImport = path === 'pc/customer/import.html' && importKind === 'contact';
  var isCustomerReviewPage = isCustomerRelatedList || isCustomerDetail || isCustomerCreate || isContactDetail || isCustomerImport || isContactImport;
  var isActivityList = path === 'pc/activity/list.html';
  var isActivityDetail = path === 'pc/activity/detail.html';
  var isVisitList = path === 'pc/visit/list.html';
  var isVisitDetail = path === 'pc/visit/detail.html';
  var isWorkPage = isActivityList || isActivityDetail || isVisitList || isVisitDetail;
  var isDictPage = path === 'pc/config/dict.html';
  var isTaskRuleConfig = path === 'pc/config/task-rule.html';
  var isCusPoolConfig = path === 'pc/config/cus-pool.html';
  var isVisitRuleList = path === 'pc/config/visit-rule.html';
  var isVisitRuleNew = path === 'pc/config/visit-rule-new.html';
  var isVisitRuleDetail = path === 'pc/config/visit-rule-detail.html';
  var isVisitRuleConfig = isVisitRuleList || isVisitRuleNew || isVisitRuleDetail;
  var isConfigPage = isDictPage || isTaskRuleConfig || isCusPoolConfig || isVisitRuleConfig || path === 'pc/config/lead-pool.html' || path === 'pc/config/template.html';
  var isReportPage = path === 'pc/report/list.html' || path === 'pc/report/detail.html';
  var isScheduleList = path === 'pc/schedule/list.html';
  var isScheduleDetail = path === 'pc/schedule/detail.html';
  var isSchedulePage = isScheduleList || isScheduleDetail;
  var isTaskList = path === 'pc/task/list.html';
  var isTaskDetail = path === 'pc/task/detail.html';
  var isTaskPage = isTaskList || isTaskDetail;
  var isKnowledgeList = path === 'pc/knowledge/list.html';
  var isKnowledgeCreate = path === 'pc/knowledge/create.html';
  var isKnowledgeDetail = path === 'pc/knowledge/detail.html';
  var isKnowledgePage = isKnowledgeList || isKnowledgeCreate || isKnowledgeDetail;
  var pcSalesPages = {
    'pc/lead/list.html': ['线索列表用于按本人、团队和所属池范围处理线索。', ['切换范围并按条件筛选、排序线索', '查看结果与线索详情', '新建、固定模板导入和导出', '对勾选线索批量分派、转交或退回'], '筛选、排序和结果数以当前可见数据为准；返回列表恢复上次条件。列表行与批量操作在本 HTML 评审原型中不按角色按钮权限拦截，仍受线索状态、归属及必填条件约束；正式系统须校验按钮权限、池成员资格、并发认领和持有上限。'],
    'pc/lead/detail.html': ['线索详情集中展示来源、归属、跟进与处理历史。', ['查看概览和当前状态', '记录跟进及关联任务、活动', '认领、分派、转交或退回线索', '标记无效、纠错及进入整条转换'], '详情深链与列表使用同一数据范围；状态变更和认领须由服务端重新校验当前归属、保护期及按钮权限。'],
    'pc/lead/create.html': ['新建线索以低门槛记录经营信号，并选择本人负责或放入线索池。', ['填写线索原始内容与来源', '选择候选业务线及可选正式联系人', '填写可后补的联系人和地区信息', '选择归属并保存线索'], '创建时只可选择本人负责或放入启用的线索池；负责人和所属池有且只有一方存在。正式查重、唯一性和原子保存由服务端保证。'],
    'pc/lead/convert.html': ['整条转换把一条线索一次性转换为正式业务对象。', ['查看待转换线索', '为每条商机选择客户及该客户联系人', '预览并提交转换', '查看转换结果'], '至少新建一条商机；所有对象整体成功或整体失败，并发、幂等与回滚由服务端保证。'],
    'pc/lead/convert-result.html': ['转换结果汇总本次创建及关联的正式对象。', ['查看客户、联系人和商机结果', '进入有权查看的对象详情', '返回线索列表'], '结果链接仍按当前角色数据范围校验；重复提交须由服务端幂等处理。'],
    'pc/opportunity/list.html': ['商机列表汇总当前范围内的商机进度与经营状态。', ['筛选、排序并设置展示列', '查看阶段与结果统计', '进入商机详情或新建商机', '导出及批量维护负责人、团队成员'], '演示商机固定显示在首行，不计入正式结果、统计、筛选、批量或导出。正式数据的统计、筛选、搜索和导出只计算可见商机；返回列表恢复条件。批量操作逐条预检，服务端再次校验权限和对象状态。'],
    'pc/opportunity/detail.html': ['商机详情围绕一套整体流程管理阶段、业务线、团队与经营记录。', ['查看概况、阶段和模板快照', '维护业务线、团队及下一步行动', '推进或回退阶段并处理正式阶段任务', '记录活动、关闭或重新激活商机并查看历史'], '阶段门槛、任务幂等、模板迁移及并发写入由服务端执行；详情深链与列表使用相同数据范围。'],
    'pc/opportunity/create.html': ['新建商机先确定客户、名称、唯一主业务线和销售场景。', ['选择有权查看的有效客户', '填写商机名称、主业务线与场景', '预览唯一匹配的流程模板', '保存后进入商机详情'], '主业务线与场景唯一匹配生效模板；未匹配时不可成立正式商机，匹配和原子保存由服务端校验。']
  };
  var salesPage = pcSalesPages[path];
  var salesFeatures = {
    'pc/lead/list.html': [['范围与筛选', '切换本人、团队、池内等可见范围，按条件筛选和排序。'], ['列表与详情', '查看匹配结果和完整线索，并进入详情。'], ['新建与导入导出', '新建线索、使用固定模板导入，或导出当前范围结果。'], ['批量处理', '勾选线索后执行分派、转交或退回，并查看逐条处理结果。']],
    'pc/lead/detail.html': [['线索概况与跟进', '在同一页签查看来源、归属、销售活动、正式任务和下一步计划。'], ['归属处理', '按当前状态认领、分派、转交或退回线索。'], ['状态与转换', '标记无效、进行纠错，或进入整条转换。'], ['日志记录', '查看线索状态、归属和操作历史。']],
    'pc/lead/create.html': [['基础录入', '填写原始内容、来源和可选的候选业务线。'], ['联系人信息', '并排填写联系人姓名和电话，可选择关联已有正式联系人。'], ['归属与保存', '选择本人负责或放入线索池后保存。']],
    'pc/lead/convert.html': [['线索核对', '查看待转换线索及其当前状态。'], ['商机配置', '为每条拟建商机选择客户和该客户下的联系人。'], ['转换提交', '预览转换对象并一次性提交整条转换。'], ['结果查看', '成功后查看正式对象，失败时查看原因。']],
    'pc/lead/convert-result.html': [['结果汇总', '查看本次创建和关联的客户、联系人与商机。'], ['对象跳转', '进入当前有权查看的正式对象详情。'], ['返回列表', '返回线索列表继续处理其他线索。']],
    'pc/opportunity/list.html': [['筛选与列显示', '按客户、业务线、场景和阶段等条件筛选、排序并设置展示列。'], ['统计与列表', '查看可见商机的阶段、状态统计及匹配结果。'], ['新建与详情', '新建商机或进入商机详情。'], ['导出与批量', '导出当前结果，批量转交负责人或维护团队成员。']],
    'pc/opportunity/detail.html': [['概况与流程', '查看客户、业务线、模板版本、当前阶段和历史。'], ['业务维护', '查看普通字段，点击编辑后维护字段值；同时维护业务线、团队成员及下一步行动。'], ['阶段与任务', '推进或回退阶段，处理当前阶段的正式任务。'], ['经营结果', '记录活动、关闭或重新激活商机并查看留痕。']],
    'pc/opportunity/create.html': [['客户选择', '从有权查看的有效客户中选择关联客户。'], ['商机录入', '填写名称、唯一主业务线、销售场景等信息。'], ['模板预览', '查看主业务线和场景匹配的生效流程模板。'], ['创建保存', '提交后进入新商机详情。']]
  };
  var leadButtons = {
    'pc/lead/list.html': [['新建线索','lead.create'],['固定模板导入','lead.import'],['导出','lead.export'],['批量分派','leadBatch.assign'],['批量转交','leadBatch.transfer'],['批量退回','leadBatch.return'],['批量回收','leadBatch.recycle']],
    'pc/lead/detail.html': [['编辑与下一步行动','lead.edit'],['认领','lead.claim'],['分派','lead.assign'],['转交','lead.transfer'],['退回池内','lead.returnPool'],['主管回收','lead.recycle'],['标记无效','lead.invalid'],['无效纠错','lead.correctInvalid'],['整条转换','lead.convert'],['记录销售活动','activity.create']],
    'pc/lead/create.html': [['保存线索','lead.create']],
    'pc/lead/convert.html': [['提交整条转换','lead.convert']],
    'pc/lead/convert-result.html': []
  };
  var oppButtons = {
    'pc/opportunity/list.html': [['新建商机','opp.create'],['导出','opp.export'],['推进阶段','opp.advance'],['批量转交负责人','opp.batch.reassign'],['批量维护团队','opp.batch.team']],
    'pc/opportunity/detail.html': [['变更关联客户','opp.customer.change'],['编辑下一步行动','opp.nextAction'],['推进阶段','opp.advance'],['回退阶段','opp.rollback'],['关闭商机','opp.close'],['重新激活','opp.reopen'],['维护团队','opp.team'],['维护业务线','opp.lines'],['变更主业务线','opp.migrate'],['拆分商机','opp.split']],
    'pc/opportunity/create.html': [['保存商机','opp.create']]
  };
  var item = window.RY && RY.manifest && RY.manifest.byPath ? RY.manifest.byPath[path] : null;
  var title = (document.title || '').split('·')[0].trim() || '当前页面';
  var notes = [];
  function add(match, title, text) { notes.push({ match: match, title: title, text: text }); }
  if (/pc\/activity\//.test(path)) {
    add(/沟通对象|实际沟通人/, '实际沟通人', '填写本次真正参与沟通者的姓名或称谓，可填写多人。已建档者可关联现有联系人；未建档者不必为了保存活动而新建联系人。');
    add(/关联联系人/, '关联联系人', '仅关联已经建档的联系人。需要长期维护人员资料时，销售可主动创建联系人，并关联真实客户。');
  }
  if (/pc\/lead\//.test(path)) {
    add(/当前线索池|线索池|池内线索/, '池内完整查看', '具备线索池成员资格的销售可在认领前查看完整线索信息；认领另行校验按钮权限、持有上限、保护期和当前状态。');
    add(/沟通对象|实际沟通人/, '实际沟通人', '本次跟进的实际沟通人可先以姓名或称谓记录；不强制建立正式联系人。');
  }
  if (/pc\/customer\/public-pool/.test(path)) {
    add(/全国公海|客户名称/, '公海完整详情', '所有销售可查看全国公海中的完整客户详情。公海只收纳当前零条有效经营关系的客户；认领资格不限制查看。');
    add(/认领/, '认领单独校验', '查看不等于可以认领。认领还需按钮权限、区域和业务线资格、持有上限、保护规则及当前仍在公海。');
  }
  if (/pc\/(customer|contact)\//.test(path)) {
    add(/手机号|联系电话|联系方式/, '联系方式', '有权查看该客户或联系人记录，即可查看其完整业务字段。本期不设置独立明文查看或字段范围权限。');
  }
  if (/pc\/permission\/config/.test(path)) {
    add(/数据范围/, '固定数据范围', '销售看本人、协作、所属池待认领线索及全国公海；主管/经理增加本团队；管理员（运营）看全部。数据范围不单独配置。');
    add(/功能列表|页面权限/, '功能列表', '只配置功能列表和按钮权限；页面是否可进入由功能列表权限决定，业务对象仍按固定角色数据范围过滤。');
  }
  var panel, trigger, pop;
  function syncInlineContracts() {
    if (!panel || isCustomerCreate) return;
    var cards = Array.prototype.filter.call(document.querySelectorAll('.ry-card h3'), function (h) {
      return !h.closest('.pcn-panel') && h.textContent.trim() === '本页契约';
    }).map(function (h) { return h.closest('.ry-card'); }).filter(Boolean);
    cards.forEach(function (card) { card.classList.add('pcn-contract-hidden'); });
    var html = cards.map(function (card) {
      var body = card.querySelector('.ry-card__body');
      return '<div class="pcn-contract-copy">' + (body ? body.innerHTML : card.innerHTML) + '</div>';
    }).join('');
    var section = panel.querySelector('#pcn-inline-contract');
    if (!cards.length) { if (section) section.remove(); return; }
    if (!section) { section = document.createElement('section'); section.id = 'pcn-inline-contract'; section.className = 'pcn-section'; panel.appendChild(section); }
    var next = '<h3>本页契约</h3>' + html;
    if (section.innerHTML !== next) section.innerHTML = next;
  }
  var customerRules = {
    knowledgeLifecycle: { title: '文档状态', text: '草稿保存后不进入检索；只有已发布且用户在范围内的版本进入普通搜索和 Agent 新回答。停用后保留历史。' },
    knowledgeScope: { title: '发布范围', text: '支持全员、指定角色、指定业务线。无法识别的范围按失败关闭处理；浏览、下载、分享和 Agent 检索须重新鉴权。' },
    knowledgePublish: { title: '发布与停用', text: '发布后当前草稿生效；已发布文档的修改先保存为待发布草稿，重新发布才替换在线版本。停用需原因并留痕。' },
    knowledgeVersion: { title: '日志记录', text: '记录创建时间、创建人及每次修改、发布、停用的时间与操作人；已发布内容须经重新发布才更新，不提供旧版本回拨。' },
    knowledgeRetrieval: { title: 'Agent 检索', text: 'Agent 只使用当前调用者有权访问的已发布版本；运行治理页不能扩大来源全文权限。' },
    knowledgeFile: { title: '知识附件', text: '正文和附件至少提供一项。HTML 原型把所选文件保存在本浏览器的 IndexedDB，可在详情下载、增删附件；清除浏览器站点数据后文件不可恢复。正式系统须提供服务端上传、文件扫描、权限校验与版本关联，约束未配置或扫描失败时不得发布。' },
    taskAssignConfirm: { title:'指派与确认', text:'主管指派和自建任务均直接进入待处理；负责人处理完成，无法执行时联系创建人改派或取消。' },
    taskCompletionAttachment: { title:'完成附件', text:'完成时可选择图片、文件或视频作为可选附件，并与成果内容一同展示。本 HTML 评审原型只保存所选文件的名称、类型和大小，不上传或保存文件内容；正式上传与访问需服务端实现。' },
    taskStageAdvance: { title:'阶段推进', text:'阶段任务完成后，不自动推进商机阶段；推进仍从商机详情发起。' },
    taskBatchRule: { title:'批量规则', text:'任务批量仅允许转派。单批最多 100 条，逐条预检和执行；失败项可按原参数重试，已成功项不重复执行。处理记录仅本人可见，不替代正式审计。' },
    taskCandidateCheck: { title:'候选处理口径', text:'当前待确认含需补齐的任务候选；缺必填在确认前拦截。写入失败仅含已确认但未生成正式任务的候选，展示原因；字段问题补齐后由原确认人手动重试，技术失败可直接重试。重试沿原候选核查写入结果，避免重复创建。' },
    taskExportRule: { title:'导出权限', text:'导出仍按按钮权限控制，领取结果时重新校验当前权限与对象范围。' },
    taskTransferRule: { title:'转派规则', text:'待处理任务可以转派，转派后仍为待处理。原截止时间、成果要求快照和历史保留。' },
    taskReturnRule: { title:'验收退回', text:'正式任务不设验收退回；负责人完成后直接已完成。' },
    taskRuleVersion: { title:'规则版本', text:'任务规则按草稿、校验、立即发布生效；已生成任务保留生成时的规则快照。正式任务直接待处理，不配置接收、拒绝或验收。' },
    cfgCusPoolScope: { title:'公海范围', text:'全国公海只收纳零条有效经营关系的客户主档；停止最后一条有效经营关系后自动入池。本期不设区域公海、主动释放或自动回收。' },
    cfgCusPoolActions: { title:'认领与分派', text:'认领由销售创建初始经营关系；分派由有权人员指定销售并创建初始经营关系。关闭动作开关后，正式业务入口应同步失效；服务端仍须校验按钮权限、资格和并发。' },
    cfgCusPoolHold: { title:'持有上限', text:'认领时按当前有效经营关系逐条校验持有上限。调整上限只影响后续认领，不追溯清理已持有关系；最终并发结果由服务端判定。' },
    cfgCusPoolProtect: { title:'保护期', text:'仅在公海认领或分派成功时按服务端事务时间生成保护期；活动不续期，到期不自动回收。' },
    cfgCusPoolSave: { title:'保存生效', text:'全国公海规则是 A 类配置：保存即生效并留变更历史，不走审批或预约生效。HTML 只演示交互，正式校验和并发写入由服务端执行。' },
    cfgVisitMatch: { title:'规则匹配', text:'按具体人员、业务线与区域组合、单维业务线或区域、全局的顺序匹配；同级取最近发布版本。同维度多选任选其一，跨维度同时选择须全部命中。' },
    cfgVisitCode: { title:'规则编码', text:'编码用于识别同一规则族，新建草稿时填写；保存后沿用该编码，后续变更通过新版本管理。' },
    cfgVisitScope: { title:'适用范围', text:'可按业务线、经营区域、具体人员和拜访类型限定；同一维度多选任选其一，跨维度同时命中。均未选择时适用全部拜访。' },
    cfgVisitAnomaly: { title:'异常提示', text:'签到半径比较签到点与计划地址；定位精度、签到签退间隔和缺少现场图片只提示异常，不阻断完成。签退可以在其他地点；无可用计划坐标时不做半径判断。' },
    cfgVisitVersion: { title:'版本生效', text:'新增和修改先保存草稿；校验通过后立即发布才影响新拜访。已发生拜访保留创建时规则快照；未匹配生效规则时只保存拜访事实。正式发布须由服务端原子执行。' },
    cfgVisitHistory: { title:'版本历史', text:'生效与历史版本只读；修改须从已有版本复制新草稿。停用要填写原因并留历史，已发生拜访继续按原快照解释。' },
    reportListRead: { title: '阅读口径', text: '阅读状态属于本人行为；打开有权查看的已提交日报记为本人已读，也可手工标记未读。本期不提供批量已读或未读。' },
    reportListStats: { title: '统计口径', text: '周视图按周一至周日，月视图按自然月统计当前角色可见的已有日报记录，包含本页临时示例记录。日期圆点表示当天有记录；右侧统计不受左侧关键词、提交人、状态及日期选择影响。草稿不包含尚未生成记录的人员；我未读只计本人尚未阅读的他人已提交日报。' },
    reportAdvice: { title: '主管建议', text: '建议只追加，不能改写销售提交的正文；写入日志记录，保留历史建议，也不重置其他读者的已读状态。' },
    reportExport: { title: '导出范围', text: '只导出当前可见范围与筛选结果中的正式日报，本页临时示例记录不导出。导出为异步任务，在处理记录查看；服务端仍须重新校验权限。' },
    reportDetailStatus: { title: '状态示例', text: '点击状态只切换到当前可见的日报示例，不会提交或改写日报。' },
    reportDetailFacts: { title: '事实来源', text: '销售可以修改日报中的事实描述，但不能借此改写源业务对象。来源单独只读保存，提交时与最终正文一同冻结；来源链接仍按当前对象权限校验。0.1 不提供新增事实提醒或草稿刷新。' },
    reportDetailAi: { title: '原始底稿', text: '首次 AI 原始底稿只在 PC 供核对；PC 与 H5 编辑的是同一份分段草稿。原始底稿不随销售编辑而覆盖，也不作为最终提交正文。' },
    reportDetailFreeze: { title: '提交冻结', text: '日报只能提交一次。提交后正文、系统事实和来源冻结，不退回、不重提；主管建议另行追加。' },
    reportDetailAdvice: { title: '建议追加', text: '主管建议只追加，不改写销售正文，也不重置他人的阅读状态；不能为本人日报写建议。' },
    reportDetailRead: { title: '阅读状态', text: '主管打开日报详情时记录本人已读，也可手工标记本人已读或未读；不提供批量改写。' },
    reportDetailHistory: { title: '日志记录', text: '草稿保存、提交、建议和阅读状态变化均保留操作记录，按时间倒序查看。' },
    scheduleProjection: { title: '日历投影', text: '日历只显示有效且未转任务的独立日程；已取消、已删除的日程在列表查询。列表、周历和月历点击日程后均在右侧查看相同详情。任务截止、正式拜访、线索下次跟进及商机时间为只读投影，右侧查看来源信息后可进入源对象处理。任务不做企微同步。主管可查看团队安排，其他人的个人安排仅显示忙碌。' },
    scheduleCreateSync: { title: '创建与同步', text: '创建独立日程后系统尝试同步到企微日历。同步失败不影响日程本身的有效性，可在详情页重试。' },
    scheduleEditSync: { title: '编辑与同步', text: '编辑会将企微同步状态重置为待同步并触发重新同步；已取消或已删除的日程不可编辑。' },
    scheduleCancel: { title: '取消日程', text: '取消后日程主状态改为已取消，企微侧同步状态一并置为已取消；记录与日志保留。' },
    scheduleDelete: { title: '删除日程', text: '删除为软删除：日程标记为已删除，从默认列表隐藏，日志和审计记录保留。' },
    scheduleToTask: { title: '日程转任务', text: '转换成功后日程主状态不变，只记录已转换、生成的任务编号、转换时间与转换人；同一日程不能重复转换。' },
    cfgLeadPoolLifecycle: { title: '入池与停收', text: '停止接收只阻止新线索入池；已在池中的线索仍可认领。本期不建设自动回收和未跟进预警。' },
    cfgLeadPoolProtect: { title: '保护期', text: '认领成功时按服务端时间生成保护期；跟进活动不续期，到期不自动回收。配置变更不追溯已有线索。' },
    cfgLeadPoolLimit: { title: '持有上限', text: '认领时逐条校验持有上限，达到上限不能继续认领；并发与最终结果由服务端判定。' },
    cfgLeadPoolCode: { title: '池编码', text: '线索池编码新建时填写，保存后不可修改。' },
    cfgLeadPoolMembers: { title: '认领成员', text: '只有本池成员且具有认领按钮权限的销售可认领；查看与认领分别判断。' },
    cfgLeadPoolSave: { title: '保存生效', text: 'A 类配置保存即生效并留变更历史，只影响之后的认领和退回。' },
    cfgDictScope: { number: '①', title: '字典口径', text: '字典维护可配置枚举的取值来源。字典编码、名称、适用范围，以及条目编码、名称、排序和启用状态属于正式字段框架；本 HTML 当前只演示已有分组的条目名称与排序。历史对象已记录的取值不随调整改写。' },
    cfgDictCore: { number: '②', title: '核心只读', text: '核心状态机枚举只读，不在字典页新增、删除或改义。商机统一阶段、线索和商机状态等由业务规则约束，调整须先完成产品规则确认。' },
    cfgDictSave: { number: '③', title: '保存生效', text: '字典为 A 类配置：保存前应整体校验，成功后立即生效并记录修改历史，只影响之后的新选择。正式规则中普通保存不强制原因，高影响停用、恢复或纠错要求原因；当前 HTML 保存弹窗要求填写原因作为演示留痕。' },
    cfgDictDelete: { number: '④', title: '引用与删除', text: '已引用条目不能物理删除；停用只阻止新数据选用，历史仍展示原值。正式实现应校验引用关系及并发保存；当前 HTML 仅对已登记的演示引用执行删除阻断，未登记的引用关系会提示确认。' },
    cfgTemplateMatch: { title: '模板匹配', text: '启用业务线与销售场景唯一匹配生效模板。商机创建时绑定版本；协同业务线不单独匹配。' },
    cfgTemplatePublish: { title: '发布规则', text: '草稿保存并校验后立即发布。发布必须整体生效，失败时旧版继续生效；本期不做定时、灰度或分批发布。' },
    cfgTemplateVersion: { title: '版本解释', text: '历史商机继续按绑定版本解释，新版不回填或重算；恢复旧版须复制为新草稿再发布。' },
    cfgTemplateStages: { title: '阶段顺序', text: '详细阶段按顺序推进，统一阶段只能按五个标准阶段单调映射。本期不配置商机自定义字段。' },
    leadOwnership: { title: '线索归属', text: '线索在任何时刻必须满足：有且只有一位当前负责人，或有且只有一个所属池。两者不可同时存在，也不可同时为空。池成员认领前可查看完整线索；认领须由服务端重新校验状态、成员资格、持有上限和保护期并处理并发。' },
    leadCreateRaw: { title: '原始内容', text: '必填。这是线索的唯一必填内容字段；可直接记录客户原话和需求信号，不要求先结构化。' },
    leadCreateSource: { title: '线索来源', text: '来源必填，创建后不可修改，用于追溯线索从哪里进入。' },
    leadCreateLines: { title: '候选业务线', text: '可多选；只作为候选参考，不代表已经形成正式商机或业务线归属。' },
    leadCreateContact: { title: '正式联系人', text: '选择已有正式联系人后，联系人姓名和完整电话自动填充且不可编辑；选回“暂不关联”后可手工填写。手工填写不会自动创建正式联系人。' },
    leadCreatePhone: { title: '联系人电话', text: '关联正式联系人时自动填充完整电话并锁定；取消关联后可手工填写。有权查看线索的人员可查看完整电话，本期不另设明文查看权限。' },
    leadCreateRegion: { title: '销售归属地区', text: '由销售填写，可留空；不用于人员权限或客户经营关系判定。' },
    leadCreatePool: { title: '目标线索池', text: '只在选择“放入线索池”时生效。创建后线索没有当前负责人，由池成员认领或主管/经理分派。' },
    leadActivity: { title: '活动与计划', text: '销售活动记录已发生的事实；下一步动作和下次跟进时间属于当前计划，正式任务另行创建与维护。保存活动只更新最近跟进时间，不自动覆盖计划或创建任务。' },
    leadConversion: { title: '整条转换', text: '转换至少新建一条商机，各商机分别选择有效客户和该客户下的联系人。所有对象整体成功或失败；服务端负责事务、幂等与回滚。' },
    oppTemplate: { title: '模板匹配', text: '商机是已经确认的正式销售机会，必须关联正式客户。客户、商机名称、唯一主业务线和销售场景为成立条件。主业务线与场景唯一匹配生效模板，创建时冻结版本；服务端最终校验。' },
    oppStage: { title: '阶段推进', text: '按统一阶段顺序推进，当前阶段必填字段及必做任务满足后方可推进。回退与模板迁移保留历史，正式阶段任务由服务端按阶段进入事件幂等生成。' },
    oppStagnation: { title: '停滞提醒', text: '当前阶段触发停滞提醒时，商机仍为进行中。停滞是风险标记，不是流程状态；停滞期间不等同于已发送提醒。' },
    oppRestore: { title: '返回恢复', text: '筛选条件会随列表状态保留；从详情返回时恢复范围、筛选、排序与页码。' },
    oppBatch: { title: '批量规则', text: '白名单批量单次上限 100 条，超出必须收窄范围；逐条预检、异步执行，已成功项不重复执行。服务端仍须校验权限和对象状态。' },
    oppOrdinaryFields: { title: '普通字段', text: '本期在商机详情填写普通字段，并按当前阶段的必填要求校验。自定义字段的定义、字典和场景配置暂不建设；阶段推进时缺失必填字段，应指出具体字段。' },
    oppOwner: { title: '主负责人', text: '同一商机只有一位主负责人。转派后原主负责人自动变为协同销售，其他团队成员不清空；主负责人不能直接移出团队，须先转派。团队变更逐条留痕。' },
    oppTasks: { title: '正式阶段任务', text: '阶段任务属于统一正式任务，由阶段进入事件生成。是否验收按生成时的流程快照处理；必做任务只有最终已完成才满足推进门禁。改变阶段不会取消已生成任务，而会使其失效。' },
    oppSplit: { title: '协同业务线拆分', text: '协同业务线仅在需要独立推进阶段、独立成交时，由人主动拆分为新商机。' },
    oppHistory: { title: '日志口径', text: '历史按时间倒序汇总阶段与任务、业务状态、结束与重新激活、模板迁移、团队及信息变更。重复关闭和重新激活各保留独立事件。' },
    scope: { title: '可见范围', text: '本原型固定展示四个范围 tab，方便逐项评审。正式使用时，销售可见“我负责的、我协作的、全部客户”，主管/经理增加“团队客户”，管理员（运营）可见“全部客户”；“全部客户”仍按各角色数据范围过滤。' },
    filters: { title: '条件保留', text: '查询、重置及排序作用于当前可见范围。返回客户列表时恢复上次的筛选条件和排序。' },
    results: { number: '1', title: '结果口径', text: '结果数按当前范围和全部已生效筛选条件计算，不含全国公海客户；原型固定显示四个 Tab 供评审，正式可见范围仍按角色和数据权限判断。' },
    columns: { number: '2', title: '横向浏览', text: '业务字段可在列显示设置中选择；选择框固定在左侧，不参与列设置。字段较多时可横向滚动，也可用左右按钮浏览。' },
    batch: { number: '3', title: '批量规则', text: '仅对已勾选客户的有效经营关系执行批量动作；逐条预检，部分失败显示原因。客户主体资料、价值和客户关系网不参与批量。' },
    contactFilter: { title: '联系人筛选', text: '按姓名、联系方式、客户角色、关联客户和关系状态筛选联系人；筛选结果受正式数据范围限制。' },
    contactResult: { title: '结果口径', text: '结果条数为当前筛选条件下的联系人数量。销售只看本人负责或协作客户的联系人，主管/经理增加团队，管理员（运营）看全部；创建人不单独取得持续查看权。公海客户联系人从该客户详情查看，不进入销售普通联系人列表。' },
    contactColumns: { title: '列显示', text: '可选择展示字段。字段较多时横向滚动或点击左右按钮；有权查看联系人时展示完整手机号和微信号。' },
    contactListChannels: { title: '完整联系方式', text: '联系人进入本人负责或协作客户范围后，列表可显示完整手机号和微信号；主管/经理增加团队客户，管理员（运营）查看全部。创建人不单独取得持续查看权，本期不设字段明文权限。' },
    contactBatch: { title: '关系批量', text: '批量建立或置失效的是联系人与客户的关系，逐条预检；不删除联系人基础资料。' },
    poolFilter: { title: '公海筛选', text: '按客户名称、入池原因、认领资格与入池时间筛选全国公海记录；认领资格仅影响认领，不限制完整客户详情查看。' },
    poolResult: { title: '公海口径', text: '全国公海收纳当前没有有效经营关系的客户主档。列表按当前筛选条件计数，点击客户名称可查看完整详情。' },
    poolClaim: { title: '认领资格', text: '所有销售可查看完整公海客户详情；认领另按按钮权限、区域与业务线资格、持有上限及当前状态校验。' },
    poolBatch: { title: '批量分派', text: '批量分派只对当前仍在公海的客户生效，按按钮权限及业务条件逐条预检。' },
    detailScope: { title: '完整查看', text: '有客户详情页面权限且客户在可见范围内，即可查看完整业务字段。全国公海客户认领前也可查看完整详情；认领资格另行判断。' },
    detailActions: { title: '详情操作', text: '资料编辑和经营关系维护分别按按钮权限与对象范围判断。资料修改直接生效并记录日志；0.1 不提供客户身份核验或合并操作。' },
    detailEdit: { title: '资料编辑', text: '有对应编辑权限时可直接修改客户资料并立即生效；无权限时仅查看。每次修改记录时间、操作人、字段及前后值，不设置资料修改申请或审批流程。' },
    detailIndustry: { title: '工商信息', text: '工商登记查询结果仅作为建档与核验参考，不代表客户主数据已核验；查询差异提示复核，不静默覆盖主档。' },
    detailValue: { title: '价值分级', text: '价值分级是经营参考标签，不属于资料质量字段。有权人员设置或调整后立即生效；每次变更写入日志，不设主管复核或期限。' },
    detailAddress: { title: '客户地址', text: '工商注册地址修改需主体资料编辑权限并记录前后值；办公、经营和项目／服务地址按地址编辑权限维护。地址类型、来源和修改历史在客户详情查看。' },
    detailRelation: { title: '经营关系', text: '经营关系回答谁在什么区域、围绕什么业务线经营客户；列表与责任范围只按有效关系计算。\n经营单位＝客户＋区域＋业务线；每条有效关系同一时间只有一个主负责人，协作人可有多个但不取得独立经营权。\n主管可直接转派主负责人，目标须通过资格和持有上限校验，默认保留协作人；直接转派不经公海。\n保护期只由公海分派或认领产生；主动建关系和直接转派不产生保护期，到期不自动回收。\n停止经营保留历史；仍有其他有效关系时不入池，停止最后一条时自动进入全国公海。' },
    detailContactRelation: { title: '联系人关系', text: '姓名、手机号、微信号和邮箱属于联系人共享基础资料。客户角色、部门、职务和主要联系人按联系人与客户的关系分别维护。\n关系可置失效并保留有效期，联系人基础记录不删除；同一联系人可复用到多家客户，不必重复建档。' },
    detailNetwork: { title: '关系网络', text: '客户关系网表示客户主体之间的业务或组织关联，不等同于经营负责人关系。\n0.1 只维护关联客户、集团／总分／上游／下游四类关系、关系标签和备注；合作模式、股权、控制、品牌及特殊背景写入备注。\n本期不建设股权或控股比例、实际控制人、有效期、权重、穿透、自定义关系类型及审批治理。' },
    detailActivity: { title: '关联记录', text: '销售活动、任务和正式拜访是独立业务对象。本页只读展示与客户相关的记录；新增或编辑需进入各对象的正式页面。' },
    detailHistory: { title: '日志口径', text: '正式审计记录只追加、不可删除，本期不提供审计导出，也不受处理记录 7 天清理影响。\n批量、导入与导出的处理记录仅本人可见，保留 7 天，不能替代正式审计。' },
    poolContact: { title: '公海联系人', text: '公海客户认领前可在本客户详情查看关联联系人的完整姓名、手机号、微信号和邮箱；不进入销售及主管/经理的普通联系人列表，也不因查看而获得编辑或关系维护权限。管理员（运营）仍按全部数据范围查看。' },
    createType: { number: '1', title: '客户类型', text: '客户类型决定采集字段。集团客户由销售提交候选、管理员查重确认；自然人客户本期不采集完整身份证号。' },
    createRelation: { number: '2', title: '初始关系', text: '新建客户必须同步创建初始经营关系；负责人默认为创建人，经营区域和业务线必填。客户主档与初始关系一并成功或失败。' },
    createLookup: { number: '3', title: '工商查询', text: '按名称查询外部工商信息；成功后带入表单，可人工修订。未找到、失败或超时仍可手工建档；查询结果不等于身份核验。' },
    createContact: { number: '4', title: '首位联系人', text: '可选填；填写姓名后同步创建联系人及其与客户的关系。自然人客户不显示此组。姓名与手机号用于疑似重复提示。' },
    createDup: { number: '5', title: '分层查重', text: '保存前按规则查重；技术重复会阻断创建，疑似重复提示人工判断。' },
    createSave: { number: '6', title: '保存规则', text: '客户主档与初始经营关系一并创建；技术重复阻断，同名或相似时说明原因后可继续。黄色说明仅供评审，正式唯一性和并发由服务端执行。' },
    contactDetailScope: { title: '可见关系', text: '独立详情以本人负责或协作客户关系为销售查看依据；主管/经理增加团队。创建人不单独取得持续查看权；公海客户联系人仅从该客户详情查看。这里只展示有权客户关系及完整联系人资料。' },
    contactDetailEdit: { title: '共享资料', text: '姓名、职务、组织及联系方式为跨客户共享的基础资料。编辑按按钮权限和可见客户关系判断，修改记录可追溯。' },
    contactDetailRelation: { title: '客户关系', text: '同一联系人可关联多个真实客户。关系维护按按钮权限和客户范围判断；同一客户同时只能有一条有效关系。' },
    contactDetailChannels: { title: '完整联系方式', text: '有权查看联系人即可直接查看完整手机号、微信号和邮箱；本期不设置单独明文查看权限。导出另按导出按钮权限判断。' },
    contactCreate: { title: '建档关联', text: '正式联系人新增时必须关联至少一位真实客户；联系人基础资料与客户关系一并创建。姓名和手机号疑似重复时提示人工确认。' },
    importTemplate: { title: '固定模板', text: '按客户或联系人下载对应固定模板。字段、列顺序和必填项由系统定义，不支持自定义字段映射。' },
    importCheck: { title: '逐行预检', text: '上传后先校验模板和每行数据，列出失败与待确认项；不会直接写入。联系人行必须匹配真实客户，客户行须具备初始经营关系。' },
    importConfirm: { title: '人工确认', text: '仅预检通过及人工明确选择继续的行进入导入任务；失败行保留原因供修正。' },
    importResult: { title: '导入结果', text: '提交后异步执行，逐行结果和失败原因在处理记录中查看；客户导入同时创建初始经营关系，联系人导入同时建立客户关系。' }
  };
  Object.assign(customerRules, {
    activityScope: { number: '②', title: '可见范围', text: '普通活动按发生人及协作关系分别鉴权。销售查看本人负责或协作的记录；主管/经理增加本团队；管理员（运营）查看全部。切换范围不扩大正式数据权限。' },
    activityFact: { number: '③', title: '已发生事实', text: '本页只显示已发生的普通销售活动。正式拜访在相邻页签查看，仍使用独立 visit_id 和拜访状态。普通活动不可物理删除；修改须留纠错记录。' },
    activityExport: { number: '①', title: '导出口径', text: '只导出当前普通活动页签中符合筛选和数据范围的记录。导出另按按钮权限校验，异步任务在处理记录中领取。' },
    visitScope: { number: '③', title: '可见范围', text: '正式拜访按负责人及协作关系分别鉴权。销售查看本人负责或协作的记录；主管/经理增加本团队；管理员（运营）查看全部。列表及详情深链均须重新校验。' },
    visitEntry: { number: '②', title: 'H5 发起拜访', text: '拜访计划、签到、签退和总结在企微 H5 执行。PC 主要用于查询拜访事实、查看证据、补充纠错和异常复核。' },
    visitReview: { number: '④', title: '复核规则', text: '异常复核只改变异常处理状态，不改变拜访主状态或签到、签退事实。批量复核限同规则版本、同结论且无需销售补充的记录；逐条重检并记录失败项。' },
    visitExport: { number: '①', title: '导出口径', text: '只导出当前正式拜访页签中符合筛选和数据范围的记录。导出另按按钮权限校验，异步任务在处理记录中领取。' },
    activityDetailFact: { number: '①', title: '活动事实', text: '普通活动记录已发生的销售沟通事实，至少关联一个业务对象。正式保存后不可物理删除；后续修订通过纠错记录保留前后值。' },
    activityDetailRelated: { number: '④', title: '关联对象', text: '正式普通活动至少关联一个业务对象。详情只展示当前身份有权查看的关联对象；无权对象的名称和数量不展示。' },
    activityDetailAi: { number: '②', title: 'AI 结果', text: 'AI 整理结果是辅助信息。候选内容须经发起人人工确认后才能写入正式活动字段；正式事实以活动记录为准。' },
    activityDetailEvidence: { number: '③', title: '原件权限', text: '原件依附普通活动，按源对象权限查看和下载。演示样例可能只有文件元数据，没有可预览内容。' },
    activityDetailMissingFile: { number: '③', title: '暂不可预览', text: '这条演示记录仅保存文件名称和大小，尚未接入文件内容，因此暂时没有可打开的原件。' },
    activityDetailCorrection: { number: '⑤', title: '纠错留痕', text: '普通活动是已发生事实。纠错只追加原因、操作人、时间和前后值，不删除原活动，也不覆盖原件。' },
    activityDetailLegacy: { number: '⑤', title: '旧记录说明', text: '这条旧纠错记录没有完整的前后值。页面不以当前值推测历史，请以原审计记录为准。' },
    activityDetailVisit: { number: '⑥', title: '与拜访', text: '正式拜访是独立业务对象，在销售活动入口的另一个页签查看；普通活动与拜访状态不自动联动。' },
    activityDetailTask: { number: '⑦', title: '与任务', text: '普通活动记录已发生的沟通，任务记录未来动作。活动保存不代表任务完成，任务需按自身规则处理。' },
    activityDetailAgent: { number: '⑧', title: '与 Agent', text: 'Agent 只生成候选活动与候选任务；正式写入须由发起人人工确认。' },
    activityDetailCorrectionFlow: { number: '⑤', title: '纠错提交', text: '提交时保留纠错人、时间、原因和本次前后值。历史版本可查，不提供物理删除。' },
    visitDetailSnapshot: { number: '①', title: '计划快照', text: '计划地址快照在签到时冻结。后续客户地址变化不改写本次拜访的历史判断；改期和取消保留原值与原因。' },
    visitDetailPoints: { number: '②', title: '采集范围', text: '只采集签到和签退两个点位及时间，不采集连续轨迹，也不还原移动路径。定位失败可填写原因后继续并进入异常复核。' },
    visitDetailComplete: { number: '③', title: '完成门槛', text: '有效签到或已说明的异常签到、签退和拜访总结是完成最小门槛。图片及附件不作为完成阻断项。' },
    visitDetailReview: { number: '④', title: '复核边界', text: '异常复核只改变异常处理状态，不改变拜访主状态，也不改写签到、签退时间和定位快照。复核使用创建时绑定的规则版本并留痕。' },
    visitDetailCorrection: { number: '⑤', title: '只追加', text: '已完成拜访可追加补充说明、附件和纠错记录；不覆盖签到签退、定位、原始图片及渠道原件。' },
    visitDetailHistory: { number: '⑥', title: '留痕规则', text: '拜访改期、取消、执行、异常复核、补充及纠错均保留历史。正式审计只追加，不能用普通编辑动作覆盖。' }
  });
  function closePop() { if (pop) { pop.remove(); pop = null; } }
  function openPop(badge, note) {
    closePop();
    pop = document.createElement('div'); pop.className = 'pcn-pop'; pop.setAttribute('role','dialog');
    pop.innerHTML = '<div class="pcn-pop__head"><strong>'+esc(note.title)+'</strong><button type="button" aria-label="关闭规则说明">×</button></div>' + String(note.text || '').split('\n').map(function (part) { return '<p>'+esc(part)+'</p>'; }).join('');
    document.body.appendChild(pop);
    pop.querySelector('button').onclick = closePop;
    var rect = badge.getBoundingClientRect();
    pop.style.top = Math.min(window.innerHeight - pop.offsetHeight - 12, rect.bottom + 6) + 'px';
    pop.style.left = Math.max(12, Math.min(rect.left, window.innerWidth - pop.offsetWidth - 12)) + 'px';
  }
  function eligible(el) {
    if (el.closest('.pcn-panel,.pcn-pop,.ry-side,.ry-top')) return false;
    return el.matches('label,.ry-field__label,th,.ry-sec-title,h3,h4');
  }
  function place() {
    if (salesPage) {
      var anchors = path === 'pc/lead/list.html' || path === 'pc/lead/create.html' || path === 'pc/opportunity/list.html' ? [] : path.indexOf('pc/lead/') === 0 ? [
        { match: /目标负责人|目标线索池|当前线索池/, key: 'leadOwnership' },
        { match: /转换为商机|目标商机|整条转换/, key: 'leadConversion' }
      ] : [
        { match: /主业务线（唯一）|销售场景/, key: 'oppTemplate' },
        { match: /阶段推进|推进到下一阶段|当前阶段/, key: 'oppStage' }
      ];
      document.querySelectorAll('label,.ry-field__label,h3,h4').forEach(function (el) {
        if (el.dataset.pcnReady || el.closest('.pcn-panel,.pcn-pop,.ry-side,.ry-top') || el.querySelector('.pcn-tag')) return;
        var raw = (el.textContent || '').trim();
        if (!raw || raw.length > 65) return;
        var found = anchors.find(function (a) { return a.match.test(raw); });
        if (!found) return;
        el.dataset.pcnReady = '1';
        var badge = document.createElement('button'); badge.type = 'button'; badge.className = 'pcn-tag';
        badge.textContent = '◆ ' + customerRules[found.key].title;
        badge.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); openPop(badge, customerRules[found.key]); });
        el.appendChild(badge);
      });
    }
    if (isCustomerReviewPage || salesPage || isWorkPage || isConfigPage || isReportPage || isSchedulePage || isTaskPage || isKnowledgePage) document.querySelectorAll('[data-pcn-rule]').forEach(function (el) {
      if (el.dataset.pcnReady) return;
      var note = customerRules[el.dataset.pcnRule];
      if (!note) return;
      el.dataset.pcnReady = '1';
      el.classList.add('pcn-tag');
      el.textContent = (note.number || '◆') + ' ' + note.title;
      el.setAttribute('aria-label', '查看规则：' + note.title);
      el.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); openPop(el, note); });
    });
    document.querySelectorAll('[data-perm-note]').forEach(function (el) {
      if (el.dataset.pcnReady) return;
      el.dataset.pcnReady = '1';
      var label = (el.textContent || '').replace(/^[◆①②③④⑤⑥⑦⑧⑨⑩\d.、\s]+/, '').trim() || '权限规则';
      el.textContent = '◆ ' + label;
      el.classList.add('pcn-tag');
      el.addEventListener('click', function (e) {
        e.preventDefault(); e.stopImmediatePropagation();
        openPop(el, { title: label, text: /范围|可见/.test(label) ?
          '销售可查看本人负责与协作数据、所属线索池待认领线索、全国公海完整客户详情；主管/经理增加本团队；管理员（运营）查看全部。' :
          '此操作按功能列表权限、按钮权限及固定角色数据范围判断；有权查看记录时可查看完整业务字段。' });
      }, true);
    });
    if (!notes.length || salesPage || isWorkPage || isCustomerDetail || isCustomerCreate || isContactList || isContactDetail || isCustomerImport || isContactImport) return;
    document.querySelectorAll('label,.ry-field__label,th,.ry-sec-title,h3,h4').forEach(function (el) {
      if (!eligible(el) || el.querySelector('.pcn-tag')) return;
      var raw = (el.textContent || '').trim();
      if (!raw || raw.length > 80) return;
      var found = notes.find(function (n) { return n.match.test(raw); });
      if (!found) return;
      var badge = document.createElement('button'); badge.type = 'button'; badge.className = 'pcn-tag';
      badge.textContent = '◆ ' + found.title; badge.title = found.title;
      badge.setAttribute('aria-label', '查看规则：' + found.title);
      badge.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); openPop(badge, found); });
      el.appendChild(badge);
    });
  }
  function boot() {
    trigger = document.createElement('button'); trigger.type = 'button'; trigger.className = 'pcn-trigger';
    trigger.textContent = '页面说明'; trigger.setAttribute('aria-expanded','false');
    panel = document.createElement('aside'); panel.className = 'pcn-panel' + (isCustomerReviewPage || salesPage || isWorkPage || isConfigPage || isReportPage || isSchedulePage || isTaskPage || isKnowledgePage ? ' pcn-panel--customer' : ''); panel.hidden = true;
    var metadata = isCustomerReviewPage || salesPage || isWorkPage || isConfigPage || isReportPage || isSchedulePage || isTaskPage || isKnowledgePage ? '<div class="pcn-meta pcn-meta-row">' +
      '<div><span>所属模块</span><b>'+esc(isKnowledgePage ? '知识管理' : isWorkPage ? '销售活动' : isConfigPage ? '业务配置' : isReportPage || isSchedulePage || isTaskPage ? '工作管理' : salesPage ? path.indexOf('pc/lead/') === 0 ? '线索' : '商机' : item && item.module || '客户管理')+'</b></div>' +
      (isDictPage ? '' : '<div><span>页面契约</span><b>'+esc(isContactImport ? 'PG-CON-IMPORT' : item && item.contract || '按当前 PRD 页面清单')+'</b></div>') +
      '<div><span>依据</span><b>'+esc(isContactImport ? 'prd/01 §5、§13' : item && item.prd || 'prd/01')+'</b></div></div>' :
      '<dl class="pcn-meta"><dt>所属模块</dt><dd>'+esc(item && item.module || 'PC 业务页面')+'</dd>' +
      '<dt>页面契约</dt><dd>'+esc(item && item.contract || '按当前 PRD 页面清单')+'</dd>' +
      '<dt>依据</dt><dd>'+esc(item && item.prd || '0.1 总 PRD 与对应模块 PRD')+'</dd></dl>';
    function customerListTable(headers, rows) {
      var tableClass = headers.length === 5 ? ' pcn-customer-filter-table' : headers.length === 4 ? ' pcn-customer-field-table' : '';
      return '<div class="pcn-table-wrap"><table class="pcn-table' + tableClass + '"><thead><tr>' +
        headers.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') +
        '</tr></thead><tbody>' + rows.map(function (row) {
          return '<tr>' + row.map(function (value) { return '<td>' + esc(value) + '</td>'; }).join('') + '</tr>';
        }).join('') + '</tbody></table></div>';
    }
    var customerListContract = '<section class="pcn-section pcn-contract-section">' +
      '<table class="pcn-create-contract"><thead><tr><th>页面编号</th><th>适用端</th><th>依据</th></tr></thead><tbody><tr>' +
      '<td>' + esc(item && item.contract || 'PG-CUS-LIST') + '</td><td>PC</td>' +
      '<td>' + esc(item && item.prd || 'prd/00 §5.1；prd/01 §3') + '</td></tr></tbody></table>' +
      '<dl><dt>覆盖范围</dt><dd>' + esc(item && item.views ? item.views.join('、') : '客户范围、查询、列表操作') + '</dd>' +
      '<dt>验收项</dt><dd>' + esc(item && item.ac ? item.ac.join('、') : 'AC-42') + '</dd></dl></section>';
    var customerFilterRows = [
      ['关键词', '首行·文本框', '客户名称、其他名称、客户编号、统一社会信用代码', '空', '在当前范围内包含匹配'],
      ['客户类型', '首行·下拉选择', '客户类型字典', '全部', '按客户主体类型匹配'],
      ['记录状态', '首行·下拉选择', '客户记录状态字典', '全部', '按客户主档状态匹配'],
      ['价值分级', '首行·下拉选择', '未分级及价值分级字典', '全部', '按当前分级匹配'],
      ['排序', '首行·下拉选择', '最近更新、创建时间、客户名称、价值分级', '最近更新优先', '改变当前结果的顺序，不改变范围和数量'],
      ['经营区域', '更多筛选·下拉选择', '经营区域数据', '全部', '匹配同一条有效经营关系'],
      ['经营业务线', '更多筛选·下拉选择', '业务线数据', '全部', '与区域、负责人等共同匹配同一条有效经营关系'],
      ['主负责人', '更多筛选·下拉选择', '销售与销售主管人员', '全部', '匹配同一条有效经营关系的主负责人'],
      ['创建时间（起）', '更多筛选·日期选择', '客户主档创建日期', '空', '创建日期不早于所选日期'],
      ['创建时间（止）', '更多筛选·日期选择', '客户主档创建日期', '空', '创建日期不晚于所选日期'],
      ['数据质量', '更多筛选·下拉选择', '不限、仅看待治理、仅看缺统一社会信用代码', '不限', '匹配当前客户的数据质量标签']
    ];
    var customerFieldRows = [
      ['客户编号', '客户主档编号', '文本', '是'],
      ['客户名称', '客户当前正式名称', '链接；进入详情', '是'],
      ['其他名称', '简称、品牌名、曾用名等当前其他名称', '文本；无值显示—', '是'],
      ['客户类型', '客户主体类型', '文本', '是'],
      ['记录状态', '客户主档当前状态', '状态标签', '是'],
      ['价值分级', '客户当前价值级别', '分级标签', '是'],
      ['价值调整时间', '最近一次价值调整时间', '日期时间；无值显示—', '否'],
      ['经营区域', '有效经营关系的区域', '多值以顿号分隔', '是'],
      ['经营业务线', '有效经营关系的业务线', '多值以顿号分隔', '是'],
      ['经营主负责人', '有效经营关系的主负责人', '多值以顿号分隔', '是'],
      ['联系人', '客户关联的联系人数量', '人数', '是'],
      ['商机', '客户关联的商机数量', '数量', '否'],
      ['数据质量', '待治理、缺信用代码等派生标记', '标签；无异常显示正常', '是'],
      ['最近更新', '客户主档最近更新时间', '日期时间', '是']
    ];
    var customerContent =
      '<section class="pcn-section"><h3>页面介绍</h3><p>按当前用户有权范围查看经营客户，筛选客户主档及有效经营关系，并进入客户详情。零条有效经营关系的客户在全国公海页面查看。</p></section>' +
      '<section class="pcn-section"><h3>操作按钮说明</h3>' + customerListTable(
        ['位置／按钮', '作用与结果', '可用条件／权限'], [
          ['【顶部】联系人列表／全国公海', '分别进入联系人列表、全国公海页面。', '进入目标页面后按其页面权限及数据范围查看。'],
          ['【结果】导入客户', '进入客户导入页，提交文件后按导入流程处理。', '需客户导入页面及动作权限。'],
          ['【结果】导出／提交导出', '选择当前筛选结果、已勾选记录或当前页及导出字段，提交异步导出。', '需导出按钮权限；逐条校验对象数据范围。'],
          ['【结果】新增客户', '进入新建客户页。', '需新建按钮权限。'],
          ['【表格】客户名称／点击行', '进入该客户详情。', '仅可进入当前有权查看的客户；返回后恢复列表状态。'],
          ['【批量】新增协作人', '为所选客户的有效经营关系增加协作人，提交后查看逐条结果。', '需协作人按钮权限及目标经营关系的操作资格；逐条预检。'],
          ['【批量】转派主负责人', '为所选客户的有效经营关系选择新主负责人并提交。', '需转派按钮权限；销售协作人不能仅凭协作身份执行。'],
          ['【批量】停止经营', '填写停止原因，提交后逐条停止符合条件的有效经营关系。', '需停止经营按钮权限及目标经营关系的操作资格。']
        ]) + '<p>批量处理逐条校验并展示结果，单次最多选择 100 条客户；不提供客户合并或批量修改主体资料。</p></section>' +
      '<section class="pcn-section"><h3>角色权限与数据范围</h3>' + customerListTable(
        ['角色', '可查看数据范围／可见 Tab', '可用操作'], [
          ['销售', '本人主负责或协作且有有效经营关系的客户；全部、我负责的、我协作的。', '可浏览、筛选、查看详情；新建、导入、导出须有对应权限。对本人主负责的经营单元，可按按钮权限新增协作人；仅作为协作人不获得转派或停止经营权。'],
          ['销售主管／经理', '本人及本团队成员主负责或协作的经营客户；全部、团队、我负责的、我协作的。', '可浏览、筛选、查看详情；新建、导入、导出及批量新增协作人、转派、停止经营均须相应按钮权限，并校验目标经营关系。'],
          ['管理员（运营）', '全部有有效经营关系的客户；全部。', '可浏览、筛选、查看详情；导入、导出及经营关系批量动作按功能列表与按钮授权，不因管理员身份自动获得每个动作。']
        ]) + '<p>以下范围 Tab 只在角色有权数据内计算；全国公海客户不进入本列表。</p>' + customerListTable(
        ['范围 Tab', '纳入条件', '正式角色可见性'], [
          ['全部', '当前角色有权查看且至少有一条有效经营关系的客户；不含全国公海', '销售、主管/经理、管理员（运营）；各按自身数据范围'],
          ['团队', '本人或本团队成员主负责或协作的经营客户', '有团队管理权限的主管/经理'],
          ['我负责的', '本人是任一有效经营关系的主负责人', '销售、主管/经理'],
          ['我协作的', '本人为有效经营关系协作人且不是该客户任一有效关系的主负责人', '销售、主管/经理']
        ]) + '<p>本 HTML 原型固定展示四个 Tab 用于评审；正式入口按角色显示。业务动作需同时满足页面、按钮、数据范围与对象状态规则。</p></section>' +
      '<section class="pcn-section"><h3>筛选项表</h3>' + customerListTable(
        ['筛选项', '位置与控件', '选项范围／来源', '默认值', '作用与特殊规则'], customerFilterRows) + '</section>' +
      '<section class="pcn-section"><h3>列表字段表</h3>' + customerListTable(
        ['列表字段', '含义／来源', '展示方式', '默认显示'], customerFieldRows) +
      '<p>最左侧选择框用于跨页选择和批量处理，固定显示且不可在列显示设置中关闭。本页没有独立的行操作列；客户名称是详情入口。</p></section>';
    var contactContent = '<section class="pcn-section"><h3>页面介绍与功能</h3><p>本页集中查看和维护本人负责或协作客户关联的联系人。公海客户的联系人从公海客户详情查看；有权查看时联系方式完整展示。</p>' +
      '<ul><li><b>查询筛选：</b>按姓名、联系方式、客户角色、关联客户和关系状态查找联系人。</li>' +
      '<li><b>列显示：</b>选择显示字段；字段较多时横向滚动或使用左右按钮。</li>' +
      '<li><b>查看详情：</b>点击姓名进入详情，查看基础资料、关联客户及关系历史。</li>' +
      '<li><b>新增与编辑：</b>按按钮权限新建联系人或编辑其跨客户共享的基础资料。</li>' +
      '<li><b>客户关系：</b>为联系人建立、维护或置失效与客户的关系。</li>' +
      '<li><b>导入导出：</b>使用固定模板导入，或按按钮权限导出当前筛选结果。</li>' +
      '<li><b>批量处理：</b>勾选联系人后，逐条预检并批量建立或置失效客户关系。</li></ul></section>' +
      '<section class="pcn-section"><h3>角色权限</h3><div class="pcn-table-wrap"><table class="pcn-table"><thead><tr><th>角色</th><th>可查看的数据</th><th>默认可用操作</th></tr></thead><tbody>' +
      '<tr><th>销售</th><td>本人负责或协作客户的联系人；创建人不单独取得持续查看权。公海客户联系人只从客户详情查看。</td><td>新增、编辑、维护客户关系、导入及导出。</td></tr>' +
      '<tr><th>销售主管/经理</th><td>本人及本团队客户的联系人。</td><td>销售可用操作，并在团队范围内处理联系人关系。</td></tr>' +
      '<tr><th>管理员（运营）</th><td>全部联系人。</td><td>新增、编辑、维护客户关系、导入及导出。</td></tr>' +
      '</tbody></table></div><p>页面入口和按钮权限可配置；数据范围按角色固定。有权查看记录时可查看完整联系方式，不设置字段明文权限。公海客户联系人不进入销售普通联系人列表。</p></section>' +
      '<section class="pcn-section"><h3>列表口径</h3><ul><li>结果条数为当前筛选条件下、本人负责或协作客户关联的联系人数量；创建人不作为独立筛选条件。</li><li>全国公海客户的联系人在其客户详情完整查看，不计入销售普通列表。</li><li>批量操作针对联系人与客户的关系，不删除联系人基础资料。</li></ul></section>';
    var poolContent = '<section class="pcn-section"><h3>页面介绍与功能</h3><p>全国公海集中展示当前没有有效经营关系的客户主档。具备页面权限的销售可在认领前查看完整客户详情；认领资格只控制认领动作。</p>' +
      '<ul><li><b>公海概览：</b>查看公海客户数量与可认领数量。</li>' +
      '<li><b>查询排序：</b>按名称、入池原因、认领资格和入池时间筛选，按入池时间或客户名称排序。</li>' +
      '<li><b>查看详情：</b>点击客户名称进入完整客户详情，查看入池前后的业务信息。</li>' +
      '<li><b>认领：</b>满足资格的销售认领客户，并创建初始经营关系。</li>' +
      '<li><b>分派：</b>有按钮权限的主管或管理员指定主负责人。</li>' +
      '<li><b>流转历史：</b>查看客户入池与后续处理记录。</li>' +
      '<li><b>导出：</b>按按钮权限导出当前筛选的公海清单。</li>' +
      '<li><b>批量分派：</b>勾选公海客户后逐条预检并分派。</li></ul></section>' +
      '<section class="pcn-section"><h3>角色权限</h3><div class="pcn-table-wrap"><table class="pcn-table"><thead><tr><th>角色</th><th>可查看的数据</th><th>默认可用操作</th></tr></thead><tbody>' +
      '<tr><th>销售</th><td>全国公海全部客户的完整详情。</td><td>满足认领条件时认领；可导出公海清单。</td></tr>' +
      '<tr><th>销售主管/经理</th><td>全国公海全部客户的完整详情。</td><td>认领、分派、批量分派及导出。</td></tr>' +
      '<tr><th>管理员（运营）</th><td>全国公海全部客户的完整详情。</td><td>分派、批量分派及导出；认领需另配按钮权限。</td></tr>' +
      '</tbody></table></div><p>所有角色的查看范围均为完整客户详情；认领、分派与导出按各自按钮权限校验。</p></section>' +
      '<section class="pcn-section"><h3>列表口径</h3><ul><li>公海只收纳当前零条有效经营关系的客户。</li><li>认领资格与查看范围分别判断，资格不足仍可查看完整详情。</li></ul></section>';
    function reviewContent(intro, features, operations, extra) {
      var roleOperations = Array.isArray(operations) ? operations : [operations, operations, operations];
      var roleRows = [
        ['销售', '本人负责或协作的客户及其联系人；全国公海客户及其联系人从客户详情查看。', roleOperations[0]],
        ['销售主管/经理', '本人及本团队客户和联系人；全国公海客户及其联系人从客户详情查看。', roleOperations[1]],
        ['管理员（运营）', '全部客户和联系人。', roleOperations[2]]
      ];
      return '<section class="pcn-section"><h3>页面介绍与功能</h3><p>' + intro + '</p><ul>' + features.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></section>' +
        '<section class="pcn-section"><h3>角色权限</h3><div class="pcn-table-wrap"><table class="pcn-table"><thead><tr><th>角色</th><th>数据范围</th><th>本页操作</th></tr></thead><tbody>' +
        roleRows.map(function (x) { return '<tr><th>' + x[0] + '</th><td>' + x[1] + '</td><td>' + x[2] + '</td></tr>'; }).join('') +
        '</tbody></table></div><p>页面入口由功能列表权限控制；每项操作另按按钮权限判断。有权查看记录时可看完整字段。</p></section>' +
        (extra ? '<section class="pcn-section"><h3>页面规则</h3><p>' + extra + '</p></section>' : '');
    }
    var customerDetailContent = reviewContent('本页汇总客户主档及其经营信息。客户范围决定能否进入详情，进入后可查看完整字段。', [
      '<b>主体概览：</b>查看客户类型、工商登记信息、价值分级与资料质量。',
      '<b>资料维护：</b>按按钮权限编辑主体和普通字段、查询工商信息或调整分级。',
      '<b>地址：</b>查看与维护客户地址及注册地址。',
      '<b>经营关系：</b>查看主负责人、协作人、区域和业务线，并按权限维护关系。',
      '<b>联系人及客户关系网：</b>查看或维护关联联系人及客户主体之间的关系。',
      '<b>经营记录：</b>查看销售活动、商机和变更日志。'
    ], ['查看完整详情；编辑本人客户资料、地址、联系人与协作关系；可直接设置客户价值，依按钮权限。', '查看本人及团队客户；可直接调整客户价值、转派和停止经营，依按钮权限。', '查看全部客户；可处理资料、客户价值及经营关系维护，依按钮权限。'], '全国公海客户认领前也能查看完整客户及其联系人信息；公海联系人只在该客户详情查看，不进入销售普通联系人列表。认领资格只影响认领动作。本期不提供客户身份核验、价值复核或合并。');
    var customerCreateContract = '<section class="pcn-section pcn-contract-section">' +
      '<table class="pcn-create-contract"><thead><tr><th>页面编号</th><th>适用端</th><th>依据</th></tr></thead><tbody><tr>' +
      '<td>' + esc(item && item.contract || 'PG-CUS-CREATE') + '</td>' +
      '<td>' + esc(item && item.end || 'PC') + '</td>' +
      '<td>' + esc(item && item.prd || 'prd/01') + '</td></tr></tbody></table>' +
      '<dl><dt>覆盖范围</dt><dd>' + esc(item && item.views ? item.views.join('、') : '客户与初始经营关系创建') + '</dd>' +
      '<dt>验收项</dt><dd>' + esc(item && item.ac ? item.ac.join('、') : '见客户模块验收') + '</dd></dl></section>';
    var customerCreateContent = '<section class="pcn-section"><h3>页面功能与规则</h3><p>创建客户主档及一条初始经营关系；可选填首位联系人。集团客户提交候选，确认后才创建正式主档。自然人不采集工商登记及首位联系人。</p><p>客户名称相同或相似时需说明原因后继续；信用代码规范化后全库精确重复必须阻断。工商查询失败仍可手工建档。客户资料有对应编辑权限时直接修改并记录前后值。</p><p>正式新建操作受页面与创建按钮权限控制，负责人可在允许的销售、销售主管中选择。黄色标签说明规则，不能证明正式服务端鉴权、唯一性或并发控制。</p></section>' +
      '<section class="pcn-section"><h3>字段要求</h3><h4>客户主体</h4><div class="pcn-table-wrap"><table class="pcn-table"><thead><tr><th>字段名称</th><th>字段类型</th><th>是否必填</th><th>备注</th></tr></thead><tbody><tr><td>客户类型</td><td>单选</td><td>是</td><td>集团客户、组织客户、个体工商户、自然人客户；自然人不显示工商登记和首位联系人。集团仅提交候选。</td></tr><tr><td>客户名称</td><td>文本框</td><td>是</td><td>填写正式完整名称；同名或相似时说明原因后可继续。</td></tr><tr><td>其他名称（简称／品牌名／曾用名）</td><td>文本框</td><td>否</td><td>参与搜索和疑似重复识别，不替代主名称。</td></tr><tr><td>客户来源</td><td>下拉选择</td><td>否</td><td>选项来自客户来源字典。</td></tr></tbody></table></div><h4>初始经营关系</h4><div class="pcn-table-wrap"><table class="pcn-table"><thead><tr><th>字段名称</th><th>字段类型</th><th>是否必填</th><th>备注</th></tr></thead><tbody><tr><td>负责人</td><td>下拉选择</td><td>是</td><td>默认创建人，可调整；选项为销售与销售主管。</td></tr><tr><td>经营区域</td><td>下拉选择</td><td>是</td><td>启用区域；负责人仅关联一个区域时自动带出，多区域时选择。</td></tr><tr><td>业务线</td><td>下拉选择</td><td>是</td><td>启用业务线；方向未明可选未明确业务线。</td></tr></tbody></table></div><h4>工商登记信息</h4><div class="pcn-table-wrap"><table class="pcn-table"><thead><tr><th>字段名称</th><th>字段类型</th><th>是否必填</th><th>备注</th></tr></thead><tbody><tr><td>统一社会信用代码</td><td>文本框</td><td>否</td><td>自然人不显示；规范化后全库精确相同阻断。</td></tr><tr><td>法定代表人</td><td>文本框</td><td>否</td><td>自然人不显示；可由工商查询结果带入并人工修订。</td></tr><tr><td>注册资本</td><td>文本框</td><td>否</td><td>自然人不显示；可由工商查询结果带入并人工修订。</td></tr><tr><td>成立日期</td><td>日期选择</td><td>否</td><td>自然人不显示；可由工商查询结果带入并人工修订。</td></tr><tr><td>所属行业</td><td>文本框</td><td>否</td><td>自然人不显示；可由工商查询结果带入并人工修订。</td></tr><tr><td>工商登记地址</td><td>文本框</td><td>否</td><td>自然人不显示；查询结果可带入并人工修订。</td></tr><tr><td>经营范围</td><td>文本域</td><td>否</td><td>自然人不显示；可由工商查询结果带入并人工修订。</td></tr></tbody></table></div><h4>首位联系人</h4><div class="pcn-table-wrap"><table class="pcn-table"><thead><tr><th>字段名称</th><th>字段类型</th><th>是否必填</th><th>备注</th></tr></thead><tbody><tr><td>姓名</td><td>文本框</td><td>否</td><td>自然人不显示；填写后同步创建联系人及客户关系。</td></tr><tr><td>手机号</td><td>文本框</td><td>否</td><td>自然人不显示；与姓名一同用于疑似重复提示。</td></tr><tr><td>职务</td><td>文本框</td><td>否</td><td>自然人不显示。</td></tr></tbody></table></div><h4>备注</h4><div class="pcn-table-wrap"><table class="pcn-table"><thead><tr><th>字段名称</th><th>字段类型</th><th>是否必填</th><th>备注</th></tr></thead><tbody><tr><td>备注</td><td>文本域</td><td>否</td><td>记录建档背景或合作线索来源。</td></tr></tbody></table></div></section>';
    var contactDetailContent = reviewContent('本页查看联系人共享资料，以及当前范围内可见的客户关系和经营记录。', [
      '<b>基础资料：</b>查看并按权限编辑姓名、职务、组织、邮箱等共享资料。',
      '<b>联系方式：</b>直接查看完整手机号、微信号与邮箱，并按权限导出。',
      '<b>客户关系：</b>查看可见客户关系，按权限新增、维护或设置主要联系人。',
      '<b>关联记录：</b>查看销售活动与变更日志。'
    ], ['查看完整联系方式；编辑及维护本人可见客户关系，导出依按钮权限。', '查看完整联系方式；维护本人和团队可见客户关系，导出依按钮权限。', '查看全部联系人完整资料；编辑、关系维护与导出依按钮权限。'], '不可见客户的关系名称和数量不出现在详情中；基础资料修改会影响所有关联客户。');
    var importLabel = isContactImport ? '联系人' : '客户';
    var importContent = reviewContent('本页使用固定模板批量导入' + importLabel + '，从逐行预检到异步结果使用同一流程。', [
      '<b>下载模板：</b>查看固定列及必填项，下载对应对象的模板和示例。',
      '<b>上传预检：</b>校验模板结构与每行数据，展示成功、失败和待确认项。',
      '<b>人工确认：</b>选择待确认行，确认本次实际提交的数据。',
      '<b>异步结果：</b>提交导入任务，在处理记录查看逐行结果和失败原因。'
    ], ['具备' + importLabel + '导入按钮权限可提交本人范围数据。', '具备' + importLabel + '导入按钮权限可提交本人及团队范围数据。', '具备' + importLabel + '导入按钮权限可提交全部范围数据。'], isContactImport ? '联系人行须关联真实客户，联系人基础资料与关系一并创建。' : '客户行须包含初始经营关系，客户主档与关系一并创建。');
    var salesContent = '';
    if (salesPage) {
      var lead = path.indexOf('pc/lead/') === 0;
      var range = lead ? ['本人负责或协作的线索、所属池待认领线索', '本人及本团队线索、所属池待认领线索', '全部线索'] : ['本人负责或参与的商机', '本人及本团队负责或参与的商机', '全部商机'];
      var roles = ['R1', 'R2', 'R3'];
      function grantedButtons(code) {
        var buttons = lead ? leadButtons[path] : oppButtons[path];
        if (!buttons || !buttons.length) return '本页无业务写入按钮；可进入的结果链接仍按目标对象范围校验。';
        if (path === 'pc/lead/list.html' || path === 'pc/lead/detail.html') return esc(leadButtons[path].map(function (x) { return x[0]; }).join('、')) + (path === 'pc/lead/list.html' ? '；列表行另可按状态操作：认领、记录跟进、转交、退回池内、编辑、转换等。' : '。') + '评审原型不按角色拦截本页按钮；仍按业务状态和归属展示。';
        var names = buttons.filter(function (x) { return window.RY && RY.perm && RY.perm.buttonRoles && RY.perm.buttonRoles(x[1]).indexOf(code) >= 0; }).map(function (x) { return x[0]; });
        return names.length ? esc(names.join('、')) + '（仍按对象状态和范围校验）' : '当前未配置本页操作按钮';
      }
      salesContent = '<section class="pcn-section"><h3>页面介绍与功能</h3><p>' + esc(salesPage[0]) + '</p><ul>' + salesFeatures[path].map(function (f) { return '<li><b>' + esc(f[0]) + '：</b>' + esc(f[1]) + '</li>'; }).join('') + '</ul></section>' +
        '<section class="pcn-section"><h3>角色权限</h3><div class="pcn-table-wrap"><table class="pcn-table"><thead><tr><th>角色</th><th>数据范围</th><th>可见内容</th><th>操作权限</th></tr></thead><tbody>' +
        ['销售', '销售主管/经理', '管理员（运营）'].map(function (role, i) { return '<tr><th>' + role + '</th><td>' + range[i] + '</td><td>范围内记录的完整业务字段；不可见记录不展示名称、摘要或数量。</td><td>' + grantedButtons(roles[i]) + '</td></tr>'; }).join('') +
        '</tbody></table></div><p>原型只涉及以上三个人工角色；数据范围按角色固定。' + (path === 'pc/lead/list.html' || path === 'pc/lead/detail.html' || !lead ? '本页为交互评审，' + (lead ? '线索' : '商机') + '操作按钮对三个角色均开放演示；上表列出正式按钮配置，实际权限在正式系统中校验。' : '上表列出当前按钮授权，权限可在功能列表和按钮配置中调整；角色名称本身不决定业务动作。') + '</p></section>' +
        '<section class="pcn-section"><h3>页面级规则</h3><p>' + esc(salesPage[2]) + '</p></section>';
      if (path === 'pc/lead/create.html') salesContent +=
        '<section class="pcn-section"><h3>分层查重</h3><ul>' +
        '<li><b>线索业务相似：</b>提示人工判断，不阻断保存。</li>' +
        '<li><b>联系人电话重复：</b>提示尽量合并跟进，不单独阻断保存。</li>' +
        '<li><b>技术幂等重复：</b>来源系统与外部记录 ID 相同须阻断重复创建；由服务端校验。</li>' +
        '<li><b>客户或联系人重复：</b>在整条转换时按正式对象的分层查重规则处理。</li>' +
        '</ul><p>本页不展示常驻查重模块。原型表单不能替代服务端唯一性与并发校验。</p></section>' +
        '<section class="pcn-section"><h3>本页契约</h3><p>PG-LEAD-CREATE · PC · 销售管理；依据 prd/02 §2；覆盖验收 AC-08、AC-15。页面覆盖极低门槛录入、最少必填、归属二选一与候选业务线。</p></section>';
    }
    var workContent = '';
    if (isWorkPage) {
      var workIntro = isActivityList ? '普通活动页签只查看已发生的正式销售活动；正式拜访在相邻页签查看。' :
        isVisitList ? '正式拜访页签查看计划、执行、异常与复核；拜访仍是独立业务对象。' :
        isActivityDetail ? '普通活动详情集中查看活动事实、关联对象、AI 结果、原件与纠错历史。' :
        '正式拜访详情围绕稳定 visit_id 查看计划、执行证据、异常复核、补充纠错和历史。';
      var workFeatures = isActivityList ? [
        '按本人、团队或当前全部可见范围查看普通活动。', '按关键词、渠道、发生人、关联对象和时间筛选。',
        '进入普通活动详情；本人活动可按按钮权限提交纠错。', '按导出按钮权限异步导出当前筛选结果。'
      ] : isVisitList ? [
        '按本人、团队或当前全部可见范围查看正式拜访。', '按状态、类型、异常复核、负责人和计划时间筛选。',
        '进入拜访详情，查看签到签退及原件；按权限逐条复核异常。', '按按钮权限批量复核或异步导出拜访。'
      ] : isActivityDetail ? [
        '查看已发生的活动事实及有权关联对象。', '查看 AI 整理结果与可用原件。',
        '本人活动按权限纠错并查看前后版本和操作历史。'
      ] : [
        '查看拜访主状态、计划与地址快照、签到签退和总结。', '查看证据附件、异常状态及复核结果。',
        '按权限追加补充、提交纠错或复核异常，并查看历史与审计。'
      ];
      var workObject = isActivityList || isActivityDetail ? '普通活动' : '正式拜访';
      var workActions = isActivityList ? ['查看本人范围；记录活动在 H5 执行；纠错本人活动和导出依按钮权限。', '查看本人及团队范围；纠错本人活动和导出依按钮权限。', '查看全部范围；纠错与导出依按钮权限。'] :
        isVisitList ? ['查看本人范围；拜访计划与执行在 H5；导出依按钮权限。', '查看本人及团队范围；逐条或批量复核及导出依按钮权限。', '查看全部范围；复核及导出依按钮权限。'] :
        isActivityDetail ? ['查看本人负责或协作记录；本人活动纠错依按钮权限。', '查看本人及团队记录；本人活动纠错依按钮权限。', '查看全部记录；纠错依按钮权限。'] :
        ['查看本人负责或协作拜访；补充与纠错依按钮权限。', '查看本人及团队拜访；补充、纠错和异常复核依按钮权限。', '查看全部拜访；补充、纠错和异常复核依按钮权限。'];
      workContent = '<section class="pcn-section"><h3>页面介绍与功能</h3><p>' + esc(workIntro) + '</p><ul>' +
        workFeatures.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></section>' +
        '<section class="pcn-section"><h3>角色权限</h3><div class="pcn-table-wrap"><table class="pcn-table"><thead><tr><th>角色</th><th>数据范围</th><th>本页操作</th></tr></thead><tbody>' +
        ['销售', '销售主管/经理', '管理员（运营）'].map(function (role, i) {
          return '<tr><th>' + role + '</th><td>' + (i === 0 ? '本人负责或协作的' : i === 1 ? '本人及本团队的' : '全部') + workObject + '</td><td>' + esc(workActions[i]) + '</td></tr>';
        }).join('') + '</tbody></table></div><p>页面入口由功能列表权限控制；操作按按钮权限和对象范围分别校验。原型中的黄色标签解释规则，不代表服务端校验已实现。</p></section>' +
        '<section class="pcn-section"><h3>页面口径</h3><ul><li>PC 销售活动入口分为普通活动和正式拜访两个页签，分别读取 activities 与 visits；两类记录不互相复制。</li>' +
        '<li>' + (isActivityList ? '普通活动列表只计已发生的正式活动；没有混合批量修改。' : isVisitList ? '正式拜访可处于计划中，异常复核状态与拜访主状态独立；批量操作仅针对拜访。' : isActivityDetail ? '普通活动修订保留前后值与原因；原件不随普通编辑覆盖。' : '拜访使用稳定 visit_id；签到签退和证据原件保留原事实，补充与纠错只追加。') + '</li></ul></section>';
    }
    var configContent = '';
    if (isConfigPage) {
      if (isCusPoolConfig) {
        configContent = '<section class="pcn-section"><h3>页面介绍与功能</h3><p>本页维护全国公海认领与分派动作、销售持有上限和保护期，并查看配置影响与变更记录。</p><ul>' +
          '<li><b>动作开关：</b>设置认领和分派是否开放。</li><li><b>持有与保护：</b>调整认领持有上限、保护期天数和启用状态。</li><li><b>影响查看：</b>查看当前公海记录和销售人均持有量。</li><li><b>保存与历史：</b>填写变更原因后保存生效，查看历次修改。</li></ul></section>' +
          '<section class="pcn-section"><h3>角色权限</h3><div class="pcn-table-wrap"><table class="pcn-table"><thead><tr><th>角色</th><th>数据范围</th><th>可见内容</th><th>操作权限</th></tr></thead><tbody>' +
          '<tr><th>销售</th><td>无配置数据</td><td>无配置入口，不展示规则摘要或数量。</td><td>无。</td></tr><tr><th>销售主管/经理</th><td>无配置数据</td><td>无配置入口，不展示规则摘要或数量。</td><td>无。</td></tr><tr><th>管理员（运营）</th><td>全国公海规则</td><td>完整规则取值、影响统计和变更历史。</td><td>按按钮权限编辑、保存或还原当前配置。</td></tr></tbody></table></div></section>' +
          '<section class="pcn-section"><h3>页面级规则</h3><p>全国公海只收纳零条有效经营关系的客户主档；停止最后一条有效关系后自动入池。A 类配置保存即生效，仅影响之后的认领和分派，不追溯已有持有关系。正式权限、资格、并发及配置写入由服务端校验。</p></section>';
      } else if (isVisitRuleConfig) {
        var visitIntro = isVisitRuleList ? '本页按规则族汇总拜访规则及其生效、草稿和历史版本。' : isVisitRuleNew ? '本页新建拜访规则草稿，设置适用范围和异常提示参数。' : '本页查看一条拜访规则的内容与版本历史，并按权限编辑草稿、发布或停用。';
        var visitFeatures = isVisitRuleList ? [
          ['规则浏览', '按规则族查看适用范围、生效版本、草稿和历史版本数量。'],
          ['详情查看', '进入规则详情查看完整字段和版本历史。'],
          ['新增规则', '按按钮权限进入新建页，保存为草稿。']
        ] : isVisitRuleNew ? [
          ['基础录入', '填写规则编码、名称及适用的业务线、区域、人员和拜访类型。'],
          ['异常参数', '设置签到半径、定位精度、签到签退间隔和现场图片提示。'],
          ['保存草稿', '校验必填字段后创建草稿，进入详情继续校验和发布。']
        ] : [
          ['规则查看', '查看适用范围、异常参数和当前版本状态。'],
          ['草稿维护', '编辑草稿并校验，或从已发布版本复制新草稿。'],
          ['发布停用', '按按钮权限发布或停用，填写原因并查看结果。'],
          ['版本历史', '切换查看同一规则的生效、草稿及历史版本。']
        ];
        configContent = '<section class="pcn-section"><h3>页面介绍与功能</h3><p>' + visitIntro + '</p><ul>' + visitFeatures.map(function (x) { return '<li><b>' + x[0] + '：</b>' + x[1] + '</li>'; }).join('') + '</ul></section>' +
          '<section class="pcn-section"><h3>角色权限</h3><div class="pcn-table-wrap"><table class="pcn-table"><thead><tr><th>角色</th><th>数据范围</th><th>可见内容</th><th>操作权限</th></tr></thead><tbody>' +
          '<tr><th>销售</th><td>无配置数据</td><td>无拜访规则配置入口。</td><td>无。</td></tr>' +
          '<tr><th>销售主管/经理</th><td>' + (isVisitRuleNew ? '无新建页数据' : '本人及团队适用的生效规则') + '</td><td>' + (isVisitRuleNew ? '无新建页入口。' : '匹配范围内的生效版本；不展示草稿和历史配置。') + '</td><td>只读查看已生效规则；无新增、编辑、发布或停用权限。</td></tr>' +
          '<tr><th>管理员（运营）</th><td>全部拜访规则及版本</td><td>完整规则字段、草稿、生效版本和历史。</td><td>按按钮权限新增、编辑草稿、校验、发布、复制草稿和停用。</td></tr></tbody></table></div></section>' +
          '<section class="pcn-section"><h3>页面级规则</h3><p>规则按具体人员、业务线与区域组合、单维业务线或区域、全局的优先级匹配；同级取最近发布版本。B 类配置保存草稿不生效，校验并立即发布后才影响新拜访；已有拜访保留创建时快照。没有命中生效规则时只保存拜访事实，异常提示不阻断完成。正式匹配和原子发布由服务端执行。</p></section>';
      } else if (isTaskRuleConfig) {
        configContent = '<section class="pcn-section"><h3>页面介绍与功能</h3><p>本页维护任务来源、确认和验收等生成规则的版本。</p><ul><li><b>版本浏览：</b>在左侧选择草稿、生效或历史版本，在右侧查看明细与差异。</li><li><b>草稿维护：</b>编辑草稿，或从生效和历史版本生成新草稿。</li><li><b>校验发布：</b>校验草稿并立即发布，历史任务保留原规则快照。</li></ul></section>' +
          '<section class="pcn-section"><h3>角色权限</h3><div class="pcn-table-wrap"><table class="pcn-table"><thead><tr><th>角色</th><th>数据范围</th><th>可见内容</th><th>操作权限</th></tr></thead><tbody><tr><th>销售</th><td>无配置数据</td><td>无配置入口。</td><td>无。</td></tr><tr><th>销售主管/经理</th><td>无配置数据</td><td>无配置入口。</td><td>无。</td></tr><tr><th>管理员（运营）</th><td>全部任务规则</td><td>规则与版本明细。</td><td>按按钮权限生成或编辑草稿、校验、发布。</td></tr></tbody></table></div></section>' +
          '<section class="pcn-section"><h3>页面级规则</h3><p>B 类配置保存草稿不生效；校验通过后立即发布才影响新任务。已经生成的任务保留创建时快照。主管指派进入待确认，负责人仅可接受；不提供允许拒绝配置，也不做定时发布或灰度。正式校验和原子发布由服务端执行。</p></section>';
      } else if (isDictPage) {
        configContent = '<section class="pcn-section"><h3>页面介绍与功能</h3><p>本页维护可配置枚举字典，供业务录入和配置选择使用；核心状态机枚举只读展示。</p><ul>' +
          '<li><b>分组切换：</b>选择字典分组，查看条目和当前数量。</li>' +
          '<li><b>条目维护：</b>编辑名称、添加、排序或删除普通条目；切换前提示未保存修改。</li>' +
          '<li><b>保存生效：</b>保存 A 类配置并查看日志记录；放弃修改可恢复当前值。</li>' +
          '<li><b>引用处理：</b>删除时检查已登记的业务引用；核心枚举保持只读。</li></ul></section>' +
          '<section class="pcn-section"><h3>角色权限</h3><div class="pcn-table-wrap"><table class="pcn-table"><thead><tr><th>角色</th><th>正式页面权限</th><th>正式操作权限</th></tr></thead><tbody>' +
          '<tr><th>销售</th><td>无字典配置入口。</td><td>无配置操作。</td></tr>' +
          '<tr><th>销售主管/经理</th><td>无字典配置入口。</td><td>无配置操作。</td></tr>' +
          '<tr><th>管理员（运营）</th><td>可查看全部字典分组、条目与日志记录。</td><td>编辑按配置按钮权限校验；核心状态机始终只读。</td></tr>' +
          '</tbody></table></div><p>本 HTML 为评审完整展示页面及按钮，不按当前演示账号拦截。正式系统按功能列表控制入口，并在服务端校验编辑权限。</p></section>' +
          '<section class="pcn-section"><h3>页面级规则</h3><p>A 类配置保存即生效并留历史，已引用条目不物理删除；停用只影响新选择，历史值保留。字典编码、适用范围、条目编码和启用状态属于正式规格，当前 HTML 尚未提供维护控件。</p></section>';
      } else {
      var leadPoolConfig = path === 'pc/config/lead-pool.html';
      var configIntro = leadPoolConfig ? '本页维护线索池的认领成员、持有上限、保护期和接收状态。' : '本页维护商机流程模板的阶段结构、任务和版本。';
      var configFeatures = leadPoolConfig ? [
        ['线索池查看', '查看各池状态、在池线索、成员及当前配置。'],
        ['新增与编辑', '维护名称、编码、上限、保护期、退回规则和成员，并填写变更原因。'],
        ['状态调整', '停止接收或恢复启用线索池。']
      ] : [
        ['模板筛选', '按业务线、场景、名称和编码查找模板及版本。'],
        ['阶段编辑', '在草稿中维护详细阶段、统一阶段映射和阶段任务。'],
        ['校验与发布', '保存草稿、校验并立即发布新版本。'],
        ['版本历史', '查看生效、历史和草稿版本，将历史版本复制为新草稿。']
      ];
      configContent = '<section class="pcn-section"><h3>页面介绍与功能</h3><p>' + configIntro + '</p><ul>' +
        configFeatures.map(function (x) { return '<li><b>' + x[0] + '：</b>' + x[1] + '</li>'; }).join('') + '</ul></section>' +
        '<section class="pcn-section"><h3>角色权限</h3><div class="pcn-table-wrap"><table class="pcn-table"><thead><tr><th>角色</th><th>数据范围</th><th>可见内容</th><th>操作权限</th></tr></thead><tbody>' +
        '<tr><th>销售</th><td>无</td><td>无配置入口，不展示配置名称、摘要或数量。</td><td>无。</td></tr>' +
        '<tr><th>销售主管/经理</th><td>无</td><td>无配置入口，不展示配置名称、摘要或数量。</td><td>无。</td></tr>' +
        '<tr><th>管理员（运营）</th><td>全部' + (leadPoolConfig ? '线索池' : '流程模板及版本') + '</td><td>完整配置字段与历史。</td><td>' +
        (leadPoolConfig ? '查看、新增、编辑、停止接收和恢复启用；写入操作按配置按钮权限判断。' : '查看、新建、编辑草稿、校验、发布、停用和复制版本；写入操作按配置按钮权限判断。') + '</td></tr>' +
        '</tbody></table></div><p>原型只涉及三个人工角色；入口和按钮权限可配置，数据范围按角色固定。</p></section>' +
        '<section class="pcn-section"><h3>页面级规则</h3><p>' +
        (leadPoolConfig ? 'A 类配置保存即生效并留历史。变更只影响后续认领与退回，不追溯已有线索；无自动回收或未跟进预警。' : 'B 类配置依次保存草稿、校验、立即原子发布。历史商机继续使用绑定版本；本期不做商机自定义字段。') +
        '</p></section><section class="pcn-section"><h3>本页契约</h3><p>' +
        (leadPoolConfig ? 'PG-ADM-LEADPOOL · PC · 业务配置；依据 prd/00 §5.5、prd/06 §9；覆盖验收 AC-55。' : 'PG-ADM-TEMPLATE · PC · 业务配置；依据 prd/00 §5.5、prd/06 §9、prd/03 §6；覆盖验收 AC-56、AC-57。') + '</p></section>';
      }
    }
    var scheduleContent = isScheduleList ? '<section class="pcn-section"><h3>页面介绍与功能</h3><p>本页以周时间轴管理近期安排，可切换月历查看整月分布；右侧展示选中日期的完整议程，列表视图用于核对独立日程字段。</p>' +
      '<ul><li><b>周月浏览：</b>默认定位今天所在周，按周期前后切换、返回今天，或切换月历并选择日期。</li>' +
      '<li><b>范围与筛选：</b>在我的、团队或全部范围中查看安排，展开筛选后按关键词、负责人、类型及状态查询。</li>' +
      '<li><b>查看与新建：</b>列表、周历和月历点击日程均在右侧打开同一套详情，查看日程信息、关联对象、企微同步状态和日志；点击周视图空白时间格可预填时间新建日程。</li></ul></section>' +
      '<section class="pcn-section"><h3>角色权限</h3><div class="pcn-table-wrap"><table class="pcn-table"><thead><tr><th>角色</th><th>数据范围</th><th>可见内容</th><th>操作权限</th></tr></thead><tbody>' +
      '<tr><th>销售</th><td>本人负责或协作的安排</td><td>本人可见的独立日程与业务时间投影。</td><td>新建及维护本人独立日程；投影回源对象处理。</td></tr>' +
      '<tr><th>销售主管/经理</th><td>本人及团队安排</td><td>团队独立日程与投影；他人的个人安排仅显示忙碌。</td><td>新建及维护本人独立日程；查看团队安排。</td></tr>' +
      '<tr><th>管理员（运营）</th><td>全部安排</td><td>全部独立日程与业务时间投影。</td><td>按按钮权限处理独立日程。</td></tr>' +
      '</tbody></table></div></section><section class="pcn-section"><h3>页面级规则</h3><p>首次进入定位今天所在周：销售默认我的日程，主管默认团队日程，管理员默认全部日程。日历中的任务截止、正式拜访及线索、商机时间是只读投影；仅独立日程为日程对象。其他人的个人安排仅显示忙碌。当前周的临时示例安排只用于页面走查，不写入正式日程；周月模式、日期、范围和筛选会保留。</p></section>' +
      '<section class="pcn-section"><h3>本页契约</h3><p>PG-SCH-LIST · PC · 工作管理；依据 prd/00 §5.3、prd/04 §5；覆盖验收 AC-34。</p></section>' : isScheduleDetail ?
      '<section class="pcn-section"><h3>页面介绍与功能</h3><p>本页集中查看一条独立日程，处理日程状态、任务转换和企微同步异常。</p><ul>' +
      '<li><b>页面查看：</b>在同一页面查看四个模块：上方并排展示日程信息和关联对象，下方并排展示企微同步状态和日志。</li>' +
      '<li><b>操作处理：</b>按当前状态和按钮权限编辑、转任务、取消、删除或重试同步。</li>' +
      '<li><b>日志：</b>按时间倒序查看创建、编辑、转换、状态变化及同步重试。</li></ul></section>' +
      '<section class="pcn-section"><h3>角色权限</h3><div class="pcn-table-wrap"><table class="pcn-table"><thead><tr><th>角色</th><th>数据范围</th><th>可见内容</th><th>操作权限</th></tr></thead><tbody>' +
      '<tr><th>销售</th><td>本人负责或协作的日程</td><td>范围内完整业务信息。</td><td>按按钮权限处理本人日程。</td></tr>' +
      '<tr><th>销售主管/经理</th><td>本人及团队日程</td><td>团队日程；他人的个人安排在日历仅显示忙碌。</td><td>按按钮权限处理本人日程，查看团队日程。</td></tr>' +
      '<tr><th>管理员（运营）</th><td>全部日程</td><td>全部独立日程信息。</td><td>查看全部日程；本页写入操作仅对本人负责日程开放，并按按钮权限执行。</td></tr></tbody></table></div></section>' +
      '<section class="pcn-section"><h3>页面级规则</h3><p>直接打开详情重新校验页面权限、数据范围与当前状态。日程主状态为有效、已取消、已删除；转任务仅写派生字段。只有独立日程与正式拜访同步企微，同步失败不阻断本地日程。</p></section>' +
      '<section class="pcn-section"><h3>本页契约</h3><p>PG-SCH-DETAIL · PC · 工作管理；依据 prd/00 §5.3、prd/04 §5；覆盖验收 AC-34、AC-35。</p></section>' : '';
    var reportContent = '';
    if (isReportPage) {
      var reportList = path === 'pc/report/list.html';
      var reportIntro = reportList ? '本页以主管/经理阅读团队日报为主：左侧筛选和选择日报，中间预览当前日报，右侧通过日历定位日期并查看周期统计；销售仍可填写本人日报。' : '本页直接编辑 PC 与 H5 共用的分段日报正文；首次 AI 原始底稿仅在 PC 按需展开，提交后正文与事实来源冻结。';
      var reportFeatures = reportList ? [
        ['日报阅读', '默认选择全部日报；列表结果仍按当前角色数据范围显示，未读的已提交日报优先排列，点击后在中间切换详情。'],
        ['日期定位与筛选', '右侧日历默认按周显示，可切换月份、翻动周期和返回今天；点击日期筛选左侧列表，再点一次取消日期筛选。左侧直接搜索关键词，状态、提交人、本人阅读状态及跨日期范围收在更多筛选中。'],
        ['日报详情与统计', '中间先展示共用的日报正文，再展示只读事实来源、追加建议和日志；首次原始底稿仅在 PC 按需展开。右下统计当前范围和周期的日报记录、已提交、草稿及我未读。'],
        ['处理操作', '可继续填写本人正式草稿，并按权限追加建议、标记阅读状态或导出当前结果。']
      ] : [
        ['系统生成', '查看系统生成内容、关联的客户、线索、商机、销售活动、拜访和任务事实，以及可访问的来源；空事实草稿展示模拟摘要供走查。'],
        ['补充信息', '编辑本人草稿正文并保存或提交；提交按钮在 HTML 评审原型中不受按钮权限限制，提交后展示冻结正文。'],
        ['追加建议', '已提交日报展示历史建议，并可按权限为他人追加建议。'],
        ['日志', '已提交日报按时间查看提交、建议与阅读等操作记录；不另设阅读信息区。']
      ];
      reportContent = '<section class="pcn-section"><h3>页面介绍与功能</h3><p>' + reportIntro + '</p><ul>' +
        reportFeatures.map(function (x) { return '<li><b>' + x[0] + '：</b>' + x[1] + '</li>'; }).join('') + '</ul></section>' +
        '<section class="pcn-section"><h3>角色权限</h3><div class="pcn-table-wrap"><table class="pcn-table"><thead><tr><th>角色</th><th>数据范围</th><th>可见内容</th><th>操作权限</th></tr></thead><tbody>' +
        '<tr><th>销售</th><td>本人日报</td><td>本人草稿、已提交正文与范围内系统事实。</td><td>保存草稿、一次提交本人日报；无建议与导出权限。</td></tr>' +
        '<tr><th>销售主管/经理</th><td>本人及本团队日报</td><td>范围内日报的完整业务字段与可访问来源。</td><td>提交本人日报；查看团队日报、追加建议、标记本人阅读状态及导出，分别按按钮权限执行。</td></tr>' +
        '<tr><th>管理员（运营）</th><td>全部日报</td><td>完整日报字段；来源深链仍按源对象范围校验。</td><td>查看、追加建议、标记本人阅读状态及导出，分别按按钮权限执行。</td></tr>' +
        '</tbody></table></div><p>原型只涉及三个人工角色；页面入口与按钮权限可配置，日报数据范围按角色固定。无权记录不展示名称、摘要或隐藏数量。</p></section>' +
        '<section class="pcn-section"><h3>页面级规则</h3><p>' +
        (reportList ? '从菜单进入默认全部可见范围、业务日期当天、状态不限；当天无日报时展示空态。可切换日期与周月视图。周期、范围、筛选、日历选中日期、当前选中日报和页码会保留；从菜单再次进入重置为默认值。右侧统计按可见范围与当前周或月计算，左侧列表按筛选及所选日期展示；更多筛选中的自定义日期范围会暂时覆盖周月周期。临时示例日报仅用于本页走查，可查看、标记阅读和追加建议，不写入正式日报，也不参与导出。不做批量已读、未读或退回。' : '详情深链重新校验范围。首次生成一份分段可编辑正文，已有手工内容不被覆盖；事实来源为只读投影，首次 AI 原始底稿仅在 PC 查看。提交时冻结事实、来源和正文，提交后增加追加建议与日志，不退回、不重提。') +
        '</p></section><section class="pcn-section"><h3>本页契约</h3><p>' +
        (reportList ? 'PG-RPT-LIST · PC · 工作管理；依据 prd/00 §5.3、prd/04 §6；覆盖验收 AC-36、AC-37。' : 'PG-RPT-DETAIL · PC · 工作管理；依据 prd/00 §5.3、prd/04 §6；覆盖验收 AC-36、AC-38、AC-20、AC-29。') + '</p></section>';
    }
    var taskContent = isTaskPage ? '<section class="pcn-section"><h3>页面介绍与功能</h3><p>' +
      (isTaskList ? '从菜单进入时，本页默认展示当前账号有权查看的全部正式任务，状态与时间均不限制；可切换待确认、我的、团队。' : '本页查看任务归属、结果与日志，并按当前状态处理完成和创建人管理操作。') + '</p><ul>' +
      (isTaskList ? '<li><b>全部：</b>默认包含权限范围内待处理、已完成、已取消的正式任务；候选待确认不计入。</li><li><b>待确认：</b>用独立表格逐列展示本人 Agent 任务候选的编号、名称、来源、关联对象、生成时间、拟定截止、责任人、核对状态及依据；可按关键词、核对状态、来源查询。需补齐／需核对只是评审提示；核对来源与建议后可修改字段并确认生成正式任务，或忽略候选。</li><li><b>我的：</b>我负责、我参与、我创建可多选，默认前两项；关系取并集并按任务 ID 去重，再按全部、今天、本周、逾期筛选。</li><li><b>团队：</b>查看本人及授权团队成员的正式任务。</li><li><b>任务详情：</b>点击任务名称、行或下一步按钮，在右侧抽屉处理任务；关闭后保留 Tab、筛选、排序与页码。</li><li><b>任务查询：</b>按来源、状态、类型、责任人和截止时间筛选。</li><li><b>新建与批量：</b>按按钮权限创建或转派，批量转派逐条预检并展示结果。</li>' : '<li><b>任务详情：</b>顶部集中查看状态、人员、截止时间、创建信息和流程快照；下方依次查看任务内容与关联、执行结果、日志，不重复展示顶部字段。</li><li><b>任务处理：</b>任务创建后直接待处理；负责人提交完成成果，创建人修改截止时间或取消，参与人补充记录；可修改项在对应字段旁操作。</li><li><b>完成材料：</b>填写成果内容，并可选择图片、文件或视频附件。</li><li><b>日志记录：</b>按时间倒序查看任务动作、审计记录和来源锚点；状态示例在详情上方直接展示，仅用于原型走查，正式页面不展示。</li>') +
      '</ul></section><section class="pcn-section"><h3>角色权限</h3><div class="pcn-table-wrap"><table class="pcn-table"><thead><tr><th>角色</th><th>数据范围</th><th>可见内容</th><th>操作权限</th></tr></thead><tbody>' +
      '<tr><th>销售</th><td>本人负责、参与或创建的任务</td><td>有权任务的完整业务字段、成果和日志。</td><td>新建本人任务；完成本人待处理任务。人工任务由创建人改期或取消。</td></tr>' +
      '<tr><th>销售主管/经理</th><td>本人、本人创建及团队任务</td><td>团队任务完整内容及待处理情况。</td><td>新建并指派任务、转派；作为创建人改期或取消。</td></tr>' +
      '<tr><th>管理员（运营）</th><td>全部任务</td><td>全部任务完整业务字段与日志。</td><td>查看、配置与获授权的批量处理；人工任务的改期和取消仍按创建人判断。</td></tr>' +
      '</tbody></table></div></section><section class="pcn-section"><h3>页面级规则</h3><p>PC 从菜单进入固定使用“全部”范围，展示当前账号有权查看的全部正式任务，状态、时间均不限制；另可切换“待确认、我的、团队”。待确认仅含归属本人的 Agent 任务候选；我的关系组可多选我负责、我参与、我创建，默认前两项，关系取并集、按任务 ID 去重，时间组单选并与关系取交集。今天按今天截止，本周按周一至周日截止，逾期仅含已过截止时间且仍待处理的任务；全部包含无截止时间任务及有权的已完成、已取消任务。切换入口回到第一页；详情返回恢复 Tab、筛选、排序、页码，从菜单再次进入重置默认值。仅由本人创建的任务也可查看并按权限处理，但不获得负责人完成权限。PC 正式任务只展示待处理、已完成和已取消；所有来源创建后直接待处理。逾期仅是时间标记。无法执行时联系创建人。阶段任务共用正式任务对象，当前阶段必做任务不可人工取消；上下文失效由系统取消并留痕。PC 拜访计划入口跳转现有正式拜访流程。附件入口在原型中仅保存文件元信息，正式上传、权限和审计由服务端实现。</p></section>' : '';
    var knowledgeContent = isKnowledgePage ? '<section class="pcn-section"><h3>页面介绍与功能</h3><p>' +
      (isKnowledgeList ? '本页汇总草稿、已发布和已停用的知识文档，支持查询并进入维护。' : isKnowledgeCreate ? '本页填写知识内容及发布范围，保存为待发布草稿。' : '本页查看当前正文、附件与操作日志，并维护待发布修改。') + '</p><ul>' +
      (isKnowledgeList ? '<li><b>状态查询：</b>切换状态，按标题、编码和摘要查询。</li><li><b>新建文档：</b>进入新建页，保存草稿后查看详情。</li><li><b>维护操作：</b>查看详情，有权限时发布或停用。</li>' : isKnowledgeCreate ? '<li><b>填写内容：</b>录入编码、标题和摘要；正文与附件至少提供一项。</li><li><b>配置范围：</b>选择发布范围、下载和分享开关。</li><li><b>保存草稿：</b>校验必填与编码后进入详情；草稿不进入检索。</li>' : '<li><b>查看日志：</b>阅读当前正文、附件与按时间记录的创建、修改、发布、停用日志。</li><li><b>编辑草稿：</b>修改正文，新增或移除附件；待发布修改不立即覆盖在线版本。</li><li><b>发布停用：</b>发布新版本或填写原因停用。</li>') +
      '</ul></section><section class="pcn-section"><h3>角色权限</h3><div class="pcn-table-wrap"><table class="pcn-table"><thead><tr><th>角色</th><th>数据范围</th><th>可见内容</th><th>操作权限</th></tr></thead><tbody>' +
      '<tr><th>销售</th><td>发布范围内</td><td>有权版本的正文与基本信息。</td><td>按功能和按钮权限查看、下载或分享；维护须另行授权。</td></tr>' +
      '<tr><th>销售主管/经理</th><td>发布范围内</td><td>有权版本的正文与基本信息。</td><td>按功能和按钮权限查看、下载或分享；维护须另行授权。</td></tr>' +
      '<tr><th>管理员（运营）</th><td>获授维护范围及发布范围</td><td>可维护的草稿、当前内容和操作日志。</td><td>按功能和按钮权限新建、编辑、发布、停用。</td></tr>' +
      '</tbody></table></div></section><section class="pcn-section"><h3>页面级规则</h3><p>列表状态与关键词共同筛选。草稿不进入普通搜索或 Agent 检索；已发布版本还需满足发布范围。详情深链、下载、分享和 Agent 检索须在服务端重新校验权限。创建及每次修改、发布、停用均记录时间和操作人；日志只追加，不提供旧版本回拨。发布失败时原生效内容不变。HTML 附件保存在当前浏览器，正式文件上传、扫描、使用记录和跨设备访问由服务端实现。</p></section>' : '';
    var listTabRows = {
      'pc/contact/list.html': [['普通联系人列表（无范围 tab）', '以有权查看的客户关系判定；创建人不单独取得查看权', '本人负责或协作客户', '本人及团队客户', '全部联系人']],
      'pc/lead/list.html': [
        ['全部', '菜单默认：当前角色有权的已分配和池内线索，状态与时间不限', '本人及有权池', '本人、团队及有权池', '全部线索'],
        ['团队', '本人或团队成员负责的线索', '无团队时仅本人', '可见', '可见'],
        ['我的线索', '当前负责人是本人', '可见', '可见', '非管理员专属入口'],
        ['池内线索', '尚无负责人，归属本人有权查看的线索池', '有成员资格的池', '本人或团队有权访问的池', '全部池']
      ],
      'pc/opportunity/list.html': [
        ['全部', '菜单默认：当前角色有权的商机，状态与时间不限', '本人负责或参与', '本人及团队', '全部商机'],
        ['团队', '本人或团队成员负责或参与的商机', '无团队时仅本人', '可见', '可见'],
        ['我负责的', '主负责人是本人', '可见', '可见', '可见'],
        ['我参与的', '本人作为商机团队成员参与的商机', '可见', '可见', '可见']
      ],
      'pc/activity/list.html': [
        ['我的活动', '本人是活动发生人', '可见', '可见', '可见'],
        ['团队活动', '活动发生人属于本人团队', '不可见', '可见', '不可见'],
        ['全部活动', '当前角色可见的普通活动', '本人范围', '本人及团队范围', '全部普通活动']
      ],
      'pc/visit/list.html': [
        ['我的拜访', '本人是拜访负责人', '可见', '可见', '可见'],
        ['团队拜访', '拜访负责人属于本人团队', '不可见', '可见', '不可见'],
        ['全部拜访', '当前角色可见的正式拜访', '本人范围', '本人及团队范围', '全部正式拜访']
      ],
      'pc/task/list.html': [
        ['全部', '菜单默认：当前角色有权的全部正式任务；状态、时间不限', '本人可见范围', '本人及团队范围', '全部任务'],
        ['待确认', '仅本人有权确认的 Agent 任务候选；不计入正式任务', '可见', '可见', '可见'],
        ['我的', '关系多选：我负责、我参与、我创建；默认前两项，按 ID 去重；时间单选', '可见', '可见', '可见'],
        ['团队', '本人及团队成员负责的任务；二级：全部、今日、本周、逾期', '无团队时仅本人', '可见', '可见']
      ],
      'pc/schedule/list.html': [
        ['我的日程', '本人负责的独立日程及有权业务时间投影', '可见', '可见', '可见'],
        ['团队日程', '本人及团队安排；他人的私人日程仅显示忙碌', '不可见', '可见', '不可见'],
        ['全部日程', '当前角色可见的全部安排', '本人范围', '本人及团队范围', '全部范围']
      ],
      'pc/report/list.html': [
        ['全部', '菜单默认：当前角色有权的当天日报，状态不限', '本人日报', '本人及团队日报', '全部日报'],
        ['团队', '本人及团队成员提交的日报', '无团队时仅本人', '可见', '可见'],
        ['我的', '提交人是本人', '可见', '可见', '可见']
      ]
    };
    var standardListConfigs = {
      'pc/contact/list.html': {
        intro: '按关联客户的数据范围查看联系人共享资料及客户关系；创建人不单独取得持续查看权。',
        buttons: [
          ['【顶部】固定模板导入', '进入联系人固定模板导入页，预检并提交联系人及客户关系。', '需导入页面和按钮权限。'],
          ['【顶部】导出', '导出当前有权范围内的联系人结果。', '需导出按钮权限，逐条校验关联客户范围。'],
          ['【顶部】新增联系人', '进入联系人建档入口。', '需新建按钮权限。'],
          ['【表格】姓名', '进入联系人详情。', '只展示有权客户关系。'],
          ['【表格】编辑／客户关系', '编辑共享基础资料，或维护与客户的关系。', '分别校验按钮权限和目标客户范围。'],
          ['【批量】建立客户关系／置关系失效', '逐条预检并处理所选联系人的客户关系。', '仅处理关系，不批量修改或删除联系人基础资料。']
        ],
        roles: [
          ['销售', '本人负责或协作客户关联的联系人；无范围 Tab。', '详情、新增、编辑、关系维护、导入、导出及批量关系动作按按钮权限和客户范围执行。'],
          ['销售主管／经理', '本人及本团队客户关联的联系人；无范围 Tab。', '在团队范围内按相应按钮权限处理联系人及客户关系。'],
          ['管理员（运营）', '全部联系人；无范围 Tab。', '新建、编辑、关系维护、导入、导出及批量关系动作按按钮授权。']
        ],
        filters: [
          ['关键词', '首行·文本框', '姓名、编号、组织、职务、手机号、微信号', '空', '在可见联系人内包含匹配'],
          ['客户角色', '首行·下拉选择', '客户角色字典', '全部', '匹配可见客户关系中的角色'],
          ['关联客户', '首行·下拉选择', '有权查看的经营客户', '全部', '匹配指定客户关系'],
          ['关系状态', '首行·下拉选择', '全部、有效、失效', '全部', '匹配可见客户关系状态'],
          ['手机号', '更多筛选·下拉选择', '全部、已登记、未登记', '全部', '按联系人手机号是否有值匹配']
        ],
        fields: [
          ['姓名', '联系人姓名', '详情链接', '是'], ['联系人编号', '联系人主档编号', '文本', '是'],
          ['所在组织', '联系人组织', '文本', '是'], ['职务', '联系人职务', '文本', '是'],
          ['手机号', '可登记多个手机号', '首个号码及多值数量提示', '是'], ['微信号', '可登记多个微信号', '首个号码及多值数量提示', '是'],
          ['关联客户数', '有效客户关系数量及失效关系提示', '数量', '是'], ['客户角色', '有效关系中的角色', '多值标签', '是'],
          ['主要联系人于', '将其标为主要联系人的有权客户', '多值客户名称', '是'], ['最近联系时间', '最近联系日期', '日期', '是']
        ],
        note: '选择框用于关系批量处理；最右侧操作列固定。公海客户联系人从公海客户详情查看，不进入销售普通联系人列表。'
      },
      'pc/customer/public-pool.html': {
        intro: '全国公海展示零条有效经营关系的客户主档；顶部公海客户数与可认领客户数统计保留。查看完整详情与认领资格分别判断。',
        buttons: [
          ['【顶部】客户列表', '返回有有效经营关系的客户列表。', '进入后按客户列表范围查看。'],
          ['【顶部】导出公海清单', '导出当前筛选下的公海客户。', '需导出按钮权限。'],
          ['【表格】客户名称', '进入公海客户完整详情。', '公海查看权不等于认领权。'],
          ['【表格】认领', '选择初始经营区域、业务线并建立经营关系。', '需认领按钮权限，且满足资格、上限、状态和并发条件。'],
          ['【表格】分派／流转历史', '指定主负责人，或查看入池与处理记录。', '分派需对应按钮权限；历史按查看范围展示。'],
          ['【批量】分派', '对所选公海客户逐条预检并分派。', '需批量分派权限；允许部分成功。']
        ],
        roles: [
          ['销售', '全国公海全部客户；无范围 Tab。', '可查看完整详情；认领需按钮权限与个人资格，导出另行授权。'],
          ['销售主管／经理', '全国公海全部客户；无范围 Tab。', '认领、分派、批量分派与导出分别按按钮权限及对象条件执行。'],
          ['管理员（运营）', '全国公海全部客户；无范围 Tab。', '分派、批量分派和导出按按钮权限执行；认领需另行授权。']
        ],
        filters: [
          ['关键词', '首行·文本框', '客户名称、客户编号、公海记录编号', '空', '在公海客户内包含匹配'],
          ['入池原因', '首行·下拉选择', '全部、最后一条有效经营关系停止', '全部', '按入池原因匹配'],
          ['认领资格', '首行·下拉选择', '全部、我满足条件、我不满足', '全部', '只筛选资格，不改变查看范围'],
          ['入池时间', '更多筛选·起止输入', '入池日期区间', '空', '按入池时间闭区间匹配'],
          ['排序', '结果区·下拉选择', '入池时间、客户名称', '入池时间新到旧', '只改变结果顺序']
        ],
        fields: [
          ['客户名称', '客户当前正式名称', '详情链接', '是'], ['客户编号', '客户主档编号', '文本', '是'],
          ['客户类型', '客户主体类型', '标签', '是'], ['价值分级', '当前价值级别', '标签', '是'],
          ['入池原因', '进入公海原因', '文本', '是'], ['入池时间', '进入公海时间', '日期时间', '是'],
          ['入池备注', '入池时记录的备注', '文本', '是'], ['最近销售活动', '最近活动日期', '日期', '是'],
          ['认领资格', '当前账号认领判断及阻断原因', '状态标签与原因', '是']
        ],
        note: '顶部统计不随表格筛选消失；选择框用于批量分派，最右侧操作列固定。'
      },
      'pc/lead/list.html': {
        intro: '在当前有权范围查看已分配及池内线索；固定演示线索只用于评审，不计入正式结果、筛选、导出或批量。',
        buttons: [
          ['【顶部】固定模板导入／导出／新建线索', '分别进入导入、提交导出或新建线索。', '按各自页面与按钮权限执行。'],
          ['【表格】线索编号', '进入线索详情。', '仅查看当前有权线索。'],
          ['【表格】认领／分派／转交／退回池内', '维护线索当前负责人或所属池。', '随池内、负责人、角色权限及当前状态变化；更多菜单显示剩余动作。'],
          ['【表格】记录跟进／编辑／标记无效／无效纠错／整条转换', '分别记录经营进展、修订线索、变更状态或整条转化。', '按当前状态、归属及按钮权限执行；整条转换不提供批量。'],
          ['【批量】转交／分派／退回池内／回收', '对所选线索逐条预检并处理归属。', '各动作需对应权限；仅处理符合当前池、负责人和状态条件的线索。']
        ],
        roles: [
          ['销售', '本人负责及有成员资格的线索池；全部、我负责的、池内。', '可按按钮权限认领、跟进、退回、编辑或转换；分派与回收依正式授权。'],
          ['销售主管／经理', '本人、团队及有权线索池；全部、团队、我负责的、池内。', '可按权限分派、转交、回收及执行相应批量动作。'],
          ['管理员（运营）', '全部线索与有权池；全部。', '查看、导入、导出和治理动作按功能及按钮授权。']
        ],
        filters: [
          ['关键词', '首行·文本框', '线索编号、原始内容、手机号', '空', '包含匹配'],
          ['当前负责人', '首行·下拉选择', '销售、主管及池内无负责人', '全部', '按当前归属匹配'],
          ['当前池', '首行·下拉选择', '线索池', '全部', '按当前池匹配'],
          ['线索状态', '首行·下拉选择', '待处理、跟进中、已转化、无效', '全部', '与数据范围独立'],
          ['来源池', '更多筛选·下拉选择', '线索池', '全部', '按来源池匹配'],
          ['来源', '更多筛选·下拉选择', '线索来源字典', '全部', '按来源匹配'],
          ['候选业务线', '更多筛选·下拉选择', '业务线', '全部', '匹配候选业务线'],
          ['保护期', '更多筛选·下拉选择', '期内、已到期、无保护期', '全部', '按保护截止日期判断'],
          ['创建时间', '更多筛选·起止输入', '创建日期区间', '空', '闭区间匹配'],
          ['最近跟进', '更多筛选·起止输入', '最近跟进日期区间', '空', '无跟进日期时不命中指定区间']
        ],
        fields: [
          ['线索编号', '正式线索编号', '详情链接', '是'], ['原始摘要', '原始内容摘要', '截断文本', '是'],
          ['来源', '线索来源', '文本', '是'], ['来源记录', '外部来源记录', '文本', '是'],
          ['候选业务线', '线索候选方向', '多值标签', '是'], ['销售归属地区', '省市信息', '文本', '是'],
          ['当前负责人', '当前主负责人', '姓名', '是'], ['当前池', '当前所属线索池', '文本', '是'],
          ['业务状态', '线索当前状态及补充原因', '状态标签', '是'], ['保护截止时间', '保护期截止与到期提示', '日期和提示', '是'],
          ['下一步动作', '下一步经营动作', '文本', '是'], ['下次跟进', '下次跟进日期', '日期', '是'],
          ['最近活动', '最近跟进或活动日期', '日期', '是']
        ],
        note: '选择框与最右侧操作列固定；演示线索不参与正式统计及批量。'
      },
      'pc/opportunity/list.html': {
        intro: '按当前有权范围查看商机；顶部统计可快捷筛选进行中、停滞提醒及已结束商机。固定演示商机不计入正式结果。',
        buttons: [
          ['【顶部】新建商机', '进入商机创建页。', '需新建按钮权限。'],
          ['【结果】导出', '按当前范围和筛选条件异步导出正式商机。', '需独立导出权限，逐条校验对象范围。'],
          ['【表格】商机名称／详情', '进入商机详情。', '仅进入当前有权商机。'],
          ['【表格】推进阶段', '进入商机阶段推进流程。', '需推进权限并满足当前阶段条件。'],
          ['【表格】更多', '进入详情中的阶段任务、业务线协同及日志记录。', '各目标操作仍按详情权限与对象状态判断。'],
          ['【批量】转派主负责人／加团队成员／移出团队成员', '逐条预检并调整所选商机的负责人或团队。', '仅限白名单动作；需对应按钮权限。']
        ],
        roles: [
          ['销售', '本人负责或参与的商机；全部、我负责的、我参与的。', '查看、新建、推进、导出及团队动作依按钮权限和对象归属。'],
          ['销售主管／经理', '本人及团队商机；全部、团队、我负责的、我参与的。', '可按授权转派负责人、维护团队及处理阶段。'],
          ['管理员（运营）', '全部商机；全部。', '查看与获授权的导出、转派和团队维护。']
        ],
        filters: [
          ['关键词', '首行·文本框', '商机名称、编号、客户名称', '空', '包含匹配'],
          ['客户', '首行·下拉选择', '客户列表', '全部', '按关联客户匹配'],
          ['主业务线', '首行·下拉选择', '业务线', '全部', '按当前主业务线匹配'],
          ['销售场景', '首行·下拉选择', '销售场景', '全部', '按主业务线场景匹配'],
          ['销售归属地区', '更多筛选·文本框', '省或城市', '空', '包含匹配'],
          ['统一阶段／当前详细阶段', '更多筛选·下拉选择', '统一阶段字典、当前模板阶段', '全部', '两个条件分别生效'],
          ['主负责人／团队成员', '更多筛选·下拉选择', '用户', '全部', '按归属或参与关系匹配'],
          ['流程状态／已结束结果', '更多筛选·下拉选择', '对应状态与结果字典', '全部', '按当前流程及关闭结果匹配'],
          ['预计成交时间（起／止）', '更多筛选·日期选择', '预计成交日期区间', '空', '闭区间匹配'],
          ['最近更新（起）', '更多筛选·日期选择', '最近更新日期', '空', '不早于所选日期'],
          ['停滞风险', '更多筛选·下拉选择', '不看停滞、仅看停滞提醒', '不看停滞', '仅看停滞商机'],
          ['排序', '更多筛选·下拉选择', '最近更新、成交时间、阶段停留、停滞天数、创建时间', '最近更新新到旧', '只改变当前结果顺序']
        ],
        fields: [
          ['商机名称', '商机名称', '详情链接', '是'], ['商机编号', '商机编号', '文本', '是'],
          ['客户', '关联客户名称', '文本', '是'], ['客户编号', '关联客户编号', '文本', '是'],
          ['主业务线', '唯一主业务线', '文本', '是'], ['销售场景', '当前销售场景', '文本', '是'],
          ['销售归属地区', '省市信息', '文本', '是'], ['流程模板', '当前模板名称', '文本', '是'],
          ['模板版本', '模板版本号', '文本', '是'], ['当前详细阶段', '当前模板阶段', '文本', '是'],
          ['统一阶段', '统一口径阶段', '文本', '是'], ['阶段进入时间', '进入当前阶段时间', '日期时间', '是'],
          ['主负责人', '商机负责人', '姓名', '是'], ['预计成交时间', '预计成交日期', '日期', '是'],
          ['流程状态', '当前流程状态', '状态标签', '是'], ['关闭结果', '赢单、输单或关闭结果', '文本', '是'],
          ['创建时间', '商机创建时间', '日期时间', '是'], ['最近更新', '商机最近更新时间', '日期时间', '是']
        ],
        note: '顶部统计快捷筛选保留；选择框与最右侧操作列固定。演示商机不参与正式筛选、统计、导出或批量。'
      },
      'pc/activity/list.html': {
        intro: '销售活动入口保留“普通活动／正式拜访”两个类型页签。本页只读取已发生的普通活动；正式拜访在独立页签读取 visits，不混成一张表。',
        buttons: [
          ['【顶部】导出普通活动', '按当前范围与筛选条件异步导出普通活动。', '需普通活动导出按钮权限。'],
          ['【顶部】在 H5 记录活动', '进入 H5 普通活动记录页。', '录入仍按目标页权限执行。'],
          ['【表格】活动编号／详情', '进入普通活动详情，查看事实、关联对象和日志。', '仅进入当前有权普通活动。'],
          ['【表格】纠错', '本人活动提交纠错原因与修改内容，保留前后版本。', '需纠错按钮权限；原始事实不删除。']
        ],
        roles: [
          ['销售', '本人发生的普通活动；我的活动、全部活动。', '查看详情；本人活动纠错及导出分别按按钮权限。'],
          ['销售主管／经理', '本人及团队普通活动；我的活动、团队活动、全部活动。', '查看团队范围；本人活动纠错及导出依按钮权限。'],
          ['管理员（运营）', '全部普通活动；全部活动。', '查看、纠错与导出按对应按钮权限。']
        ],
        filters: [
          ['关键词', '首行·文本框', '活动编号、内容、实际沟通人', '空', '包含匹配'],
          ['沟通渠道', '首行·下拉选择', '电话、会议、消息、微信、邮件、上门、客户面访', '全部', '按实际渠道匹配'],
          ['发生人', '首行·下拉选择', '用户', '全部', '按活动发生人匹配'],
          ['关联对象类型', '首行·下拉选择', '客户、联系人、线索、商机', '全部', '仅匹配有权查看的关联对象'],
          ['发生时间', '更多筛选·起止输入', '活动发生日期区间', '空', '闭区间匹配；默认按发生时间新到旧']
        ],
        fields: [
          ['活动编号', '普通活动编号', '详情链接', '是'], ['内容摘要', '活动内容或摘要', '截断文本', '是'],
          ['沟通渠道', '实际渠道', '文本', '是'], ['实际沟通人', '实际参与沟通的人', '文本', '是'],
          ['发生时间', '活动发生时间', '日期时间', '是'], ['发生人', '活动负责人或发生人', '姓名', '是'],
          ['可查看关联对象数', '当前有权查看的关联对象数量', '数量', '是'], ['录入来源', '活动来源', '文本', '是'],
          ['纠错次数', '已提交纠错数量', '数量', '是']
        ],
        note: '普通活动与正式拜访是两个独立对象和流程；本页没有行选择框或通用批量业务动作，最右侧操作列固定。'
      },
      'pc/visit/list.html': {
        intro: '销售活动入口保留“普通活动／正式拜访”两个类型页签。本页只读取正式拜访及其独立计划、执行、异常复核状态；普通活动在相邻页签查看。',
        buttons: [
          ['【顶部】查看适用规则／导出', '查看拜访规则，或按当前范围与筛选条件导出正式拜访。', '规则入口面向主管；导出需独立按钮权限。'],
          ['【表格】拜访编号／详情', '进入正式拜访详情，查看计划、签到签退、证据及日志。', '仅进入有权拜访。'],
          ['【表格】异常复核', '对待复核或待补充异常提交复核结论。', '需复核权限；不改写拜访事实与主状态。'],
          ['【批量】复核', '对所选待复核异常逐条预检并批量复核。', '需批量复核权限；其他异常状态逐条跳过并说明原因。']
        ],
        roles: [
          ['销售', '本人负责或参与的正式拜访；我的拜访、全部拜访。', '查看详情；导出按按钮权限，计划与执行在 H5。'],
          ['销售主管／经理', '本人及团队正式拜访；我的拜访、团队拜访、全部拜访。', '查看、逐条或批量复核及导出分别按按钮权限。'],
          ['管理员（运营）', '全部正式拜访；全部拜访。', '查看、复核与导出按功能和按钮授权。']
        ],
        filters: [
          ['关键词', '首行·文本框', '拜访编号、客户名称', '空', '包含匹配'],
          ['拜访状态', '首行·下拉选择', '计划中、进行中、已完成、未到访、已取消', '全部', '主状态与异常复核独立'],
          ['拜访类型', '首行·下拉选择', '实地拜访、远程拜访', '全部', '按拜访类型匹配'],
          ['异常复核', '首行·下拉选择', '待复核、待补充、已复核', '全部', '按异常状态匹配'],
          ['负责人', '更多筛选·下拉选择', '用户', '全部', '按拜访负责人匹配'],
          ['计划时间', '更多筛选·起止输入', '计划日期区间', '空', '闭区间匹配；默认按计划时间新到旧']
        ],
        fields: [
          ['拜访编号', '正式拜访编号', '详情链接', '是'], ['客户', '关联客户名称', '文本', '是'],
          ['拜访类型', '实地或远程拜访', '标签', '是'], ['计划时间', '计划拜访时间', '日期时间', '是'],
          ['计划快照时间', '计划版本快照时间', '日期时间', '是'], ['负责人', '拜访负责人', '姓名', '是'],
          ['拜访状态', '当前拜访主状态', '状态标签', '是'], ['签到时间', '实际签到时间', '日期时间', '是'],
          ['签退时间', '实际签退时间', '日期时间', '是'], ['异常状态', '当前异常复核状态', '状态标签', '是'],
          ['异常类型', '签到或执行异常类型', '文本', '是']
        ],
        note: '选择框用于拜访专属批量复核，最右侧操作列固定；正式拜访与普通活动保持各自对象、筛选、权限和流程。'
      },
      'pc/task/list.html': {
        intro: '从菜单进入默认显示当前账号有权查看的全部正式任务，状态和时间不限；待确认单独展示归属本人的 Agent 任务候选。',
        buttons: [
          ['【顶部】新建任务', '选择人工任务或拜访计划等创建入口。', '按目标页面和新建按钮权限执行。'],
          ['【待确认】确认', '核对 Agent 建议与来源，可修改任务名称、截止时间、业务类型和责任人；确认后生成正式待处理任务。', '仅候选归属人且有候选确认权限时可执行。'],
          ['【待确认】忽略', '确认不采用该候选，不生成正式任务。', '仅候选归属人且有候选忽略权限时可执行。'],
          ['【表格】任务名称／点击行／操作列', '在右侧抽屉打开任务详情，或由操作列发起完成任务。', '按任务数据范围、状态及对应处理权限执行。'],
          ['【批量】转派', '对所选正式任务逐条预检并转派责任人。', '需批量转派按钮权限；展示逐条结果。']
        ],
        roles: [
          ['销售', '本人负责、参与或创建的正式任务；全部、待确认、我的。', '新建本人任务、处理本人待办；转派与批量动作另按按钮授权。'],
          ['销售主管／经理', '本人、本人创建及团队正式任务；全部、待确认、我的、团队。', '查看团队待办；新建、指派或批量转派按按钮权限。'],
          ['管理员（运营）', '全部正式任务；全部。', '查看、配置及批量处理按按钮授权；人工任务改期或取消仍受创建人约束。']
        ],
        filters: [
          ['待确认·关键词', '首行·文本框', '候选编号、任务名称、关联对象名称', '空', '包含匹配'],
          ['待确认·核对状态', '首行·下拉选择', '需补齐、需核对、信息完整', '全部', '按候选字段完整度和依据提示筛选'],
          ['待确认·来源', '首行·下拉选择', '当前候选中的 Agent 来源', '全部来源', '按候选来源匹配'],
          ['关键词', '首行·文本框', '任务编号、名称、关联对象名称', '空', '包含匹配'],
          ['任务状态', '首行·下拉选择', '待处理、已完成、已取消', '全部', '与范围及时间条件独立'],
          ['任务来源', '首行·下拉选择', '任务来源字典', '全部', '按生成来源匹配'],
          ['业务类型', '首行·下拉选择', '业务类型', '全部', '按业务分类匹配'],
          ['排序', '首行·下拉选择', '截止时间近远、创建时间新旧', '截止时间近到远', '只改变结果顺序'],
          ['责任人', '更多筛选·下拉选择', '用户', '全部', '按当前负责人匹配'],
          ['截止时间口径', '更多筛选·下拉选择', '全部、已逾期、3 天内到期', '全部', '按截止时间和终结状态判断'],
          ['阶段任务', '更多筛选·下拉选择', '全部、仅阶段任务、排除阶段任务', '全部', '按任务来源标记匹配'],
          ['关联对象类型', '更多筛选·下拉选择', '客户、联系人、线索、商机等', '全部', '按关联对象类型匹配'],
          ['创建时间（起／止）', '更多筛选·日期选择', '创建日期区间', '空', '按起止日期匹配']
        ],
        fields: [
          ['待确认·候选编号', 'Agent 任务候选编号', '文本', '是'], ['待确认·任务名称', 'Agent 建议的任务名称', '文本', '是'],
          ['待确认·来源', '候选生成来源', '文本', '是'], ['待确认·关联对象', '来源关联的业务对象', '文本', '是'],
          ['待确认·生成时间', '候选创建时间', '日期时间', '是'], ['待确认·拟定截止', 'Agent 建议的截止时间', '日期时间', '是'],
          ['待确认·责任人', 'Agent 建议的任务责任人', '姓名', '是'], ['待确认·核对状态', '字段完整度与人工核对提示', '状态标签', '是'],
          ['待确认·核对依据', '需要核对的字段证据', '文本', '是'],
          ['任务编号', '正式任务编号', '文本', '否'], ['任务名称', '任务标题', '详情入口', '是'],
          ['任务来源', '人工、阶段、系统等来源', '文本', '否'], ['业务类型', '任务业务分类', '文本', '否'],
          ['状态', '待处理、已完成、已取消', '状态标签', '是'], ['责任人', '当前任务负责人', '姓名', '是'],
          ['参与人', '任务参与成员', '多值姓名', '否'], ['截止时间', '当前截止日期', '日期时间', '是'],
          ['到期标识', '逾期或临近到期标记', '状态提示', '是'], ['原截止时间', '原始截止日期', '日期时间', '否'],
          ['关联对象类型', '关联业务对象类型', '文本', '否'], ['关联对象名称', '关联业务对象名称', '链接或文本', '是'],
          ['生成阶段', '阶段任务来源阶段', '文本', '否'],
          ['阶段轮次', '阶段任务轮次', '文本', '否'], ['模板版本', '阶段任务规则版本', '文本', '否'],
          ['创建时间', '任务创建时间', '日期时间', '否']
        ],
        note: '主 Tab 决定数据范围，二级快捷入口筛选今日、本周、逾期或追踪关系。待确认独立展示候选表格，无批量选择；确认／忽略操作列固定在最右侧且不可隐藏。正式任务选择框固定在最左侧，完成任务／查看详情操作列固定在最右侧。'
      }
    };
    var standardListConfig = standardListConfigs[path];
    var standardListContent = standardListConfig ?
      '<section class="pcn-section"><h3>页面介绍</h3><p>' + esc(standardListConfig.intro) + '</p></section>' +
      '<section class="pcn-section"><h3>操作按钮说明</h3>' + customerListTable(['位置／按钮', '作用与结果', '可用条件／权限'], standardListConfig.buttons) + '</section>' +
      '<section class="pcn-section"><h3>角色权限与数据范围</h3>' + customerListTable(['角色', '可查看数据范围／可见 Tab', '可用操作'], standardListConfig.roles) +
      (listTabRows[path] && path !== 'pc/contact/list.html' ? customerListTable(['范围 Tab', '纳入条件', '销售', '主管／经理', '管理员（运营）'], listTabRows[path]) : '') + '</section>' +
      '<section class="pcn-section"><h3>筛选项表</h3>' + customerListTable(['筛选项', '位置与控件', '选项范围／来源', '默认值', '作用与特殊规则'], standardListConfig.filters) + '</section>' +
      '<section class="pcn-section"><h3>列表字段表</h3>' + customerListTable(['列表字段', '含义／来源', '展示方式', '默认显示'], standardListConfig.fields) +
      '<p>' + esc(standardListConfig.note) + '</p></section>' : '';
    var standardListContract = standardListConfig ? '<section class="pcn-section pcn-contract-section"><table class="pcn-create-contract"><thead><tr><th>页面编号</th><th>适用端</th><th>依据</th></tr></thead><tbody><tr><td>' +
      esc(item && item.contract || '按当前页面清单') + '</td><td>PC</td><td>' + esc(item && item.prd || '对应模块 PRD') + '</td></tr></tbody></table><dl><dt>覆盖范围</dt><dd>' + esc(item && item.views ? item.views.join('、') : '本页列表功能') + '</dd><dt>验收项</dt><dd>' + esc(item && item.ac ? item.ac.join('、') : '见对应模块验收') + '</dd></dl></section>' : '';
    var tabRows = isCustomerList || standardListConfig ? null : listTabRows[path];
    var listTabContent = tabRows ? '<section class="pcn-section"><h3>列表 tab 与角色权限</h3><div class="pcn-table-wrap"><table class="pcn-table"><thead><tr><th>tab</th><th>纳入条件</th><th>销售</th><th>销售主管/经理</th><th>管理员（运营）</th></tr></thead><tbody>' +
      tabRows.map(function (row) { return '<tr>' + row.map(function (cell, i) { return (i ? '<td>' : '<th>') + esc(cell) + (i ? '</td>' : '</th>'); }).join('') + '</tr>'; }).join('') +
      '</tbody></table></div><p>“全部”始终只统计当前角色有权查看的记录。普通活动／正式拜访是对象类型切换；日程的列表／周／月与日报的周／月是展示方式；任务二级入口是主 tab 内的筛选。评审原型固定展示的 tab 不能作为正式授权依据；正式入口、搜索、详情与统计应采用同一数据范围。</p></section>' : '';
    var panelTitle = isCustomerImport || isContactImport ? importLabel + '固定模板导入' : title;
    panel.innerHTML = '<div class="pcn-panel__head"><h2>'+esc(panelTitle)+'</h2><button type="button" aria-label="关闭'+esc(panelTitle)+'页面说明">×</button></div>' +
      (isCustomerCreate ? customerCreateContract : isCustomerList ? customerListContract : standardListConfig ? standardListContract : metadata) + (standardListConfig ? standardListContent : isKnowledgePage ? knowledgeContent : isTaskPage ? taskContent : isWorkPage ? workContent : isConfigPage ? configContent : isReportPage ? reportContent : isSchedulePage ? scheduleContent : salesPage ? salesContent : isCustomerList ? customerContent : isContactList ? contactContent : isPoolList ? poolContent : isCustomerDetail ? customerDetailContent : isCustomerCreate ? customerCreateContent : isContactDetail ? contactDetailContent : isCustomerImport || isContactImport ? importContent :
      '<dl><dt>主要内容</dt><dd>'+esc(item && item.views && item.views.join ? item.views.join('、') : '见本页业务操作')+'</dd></dl>' +
      '<p>黄色标签位于相关字段或操作附近，点击可查看具体规则；此原型只展示交互与规则说明。</p>') + listTabContent;
    document.body.appendChild(trigger); document.body.appendChild(panel);
    syncInlineContracts();
    function setOpen(value) { panel.hidden = !value; trigger.setAttribute('aria-expanded', value ? 'true' : 'false'); }
    trigger.onclick = function () { if (!isCustomerCreate) syncInlineContracts(); setOpen(panel.hidden); closePop(); };
    panel.querySelector('button').onclick = function () { setOpen(false); };
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closePop(); setOpen(false); } });
    document.addEventListener('click', function (e) { if (pop && !e.target.closest('.pcn-pop,.pcn-tag')) closePop(); });
    var timer;
    new MutationObserver(function () { clearTimeout(timer); timer = setTimeout(function () { place(); syncInlineContracts(); }, 100); }).observe(document.body, { childList:true, subtree:true });
    place();
  }
  function bindTaskDetailDrawerLinks() {
    if (!/\/pc\//.test(location.pathname) || /\/pc\/task\/(?:list|detail)\.html$/.test(location.pathname)) return;
    var style = document.createElement('style');
    style.textContent = '.pcn-task-drawer .ry-drawer{width:min(920px,96vw);max-width:96vw}.pcn-task-drawer .ry-layer__body{padding:0;overflow:hidden}.pcn-task-drawer iframe{display:block;width:100%;height:100%;border:0;background:var(--bg)}';
    document.head.appendChild(style);
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank') return;
      var url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }
      if (!/\/pc\/task\/detail\.html$/.test(url.pathname) || !url.searchParams.get('id')) return;
      e.preventDefault(); e.stopPropagation();
      url.searchParams.set('drawer', '1');
      var changed = false, frame;
      function onMessage(event) { if (frame && event.source === frame.contentWindow && event.data && event.data.type === 'ry-task-detail-changed') changed = true; }
      window.addEventListener('message', onMessage);
      RY.ui.drawer({ title: '任务详情', size: 'lg',
        body: '<iframe title="任务详情" src="' + esc(url.href) + '"></iframe>',
        onOpen: function (mask) { mask.classList.add('pcn-task-drawer'); frame = mask.querySelector('iframe'); },
        onClose: function () { window.removeEventListener('message', onMessage); if (changed) location.reload(); }
      });
    }, true);
  }
  bindTaskDetailDrawerLinks();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
