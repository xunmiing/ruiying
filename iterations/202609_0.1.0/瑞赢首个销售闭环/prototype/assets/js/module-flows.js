/* 瑞赢 0.1 评审视图：按模块展示典型业务流程，不代替各模块 PRD。 */
(function () {
  'use strict';

  var sources = {
    customer: '../prd/01-客户联系人与地址.md',
    lead: '../prd/02-线索与线索池.md',
    opportunity: '../prd/03-商机与流程模板.md',
    work: '../prd/04-任务销售活动日程与日报.md',
    agent: '../prd/05-Agent候选与人工确认.md',
    system: '../prd/08-PC基础平台与集成治理.md'
  };
  var flows = {
    customer: {
      name: '客户', scope: '客户主档、经营关系、客户关系网、地址与价值档案', source: sources.customer,
      steps: [
        ['发起建档', '手工新建、线索转换或批量导入时进入客户创建。'],
        ['识别与查重', '核对客户身份及疑似重复主体，确认可新建或关联。'],
        ['建立经营关系', '新客户与初始区域、业务线、负责人经营关系在同一事务内成立。'],
        ['维护客户资料', '按权限维护联系人、地址、关系网、价值档案及修改历史。'],
        ['持续经营或入池', '有效经营关系承接销售；最后一条有效关系停止后进入全国公海。']
      ],
      branches: [
        ['公海分支', '认领或分派公海客户时，结束公海占用并创建新的有效经营关系。'],
        ['边界', '客户主档不保存销售负责人；全国公海与线索池各自独立。']
      ]
    },
    contact: {
      name: '联系人', scope: '自然人资料与客户任职关系', source: sources.customer,
      steps: [
        ['选择真实客户', '从客户或联系人入口进入，确定要关联的客户。'],
        ['查找或新建', '核对已有联系人，避免为同一人重复建档。'],
        ['建立联系人关系', '记录其在该客户中的角色、部门与有效关系。'],
        ['维护联系方式', '按权限维护电话、微信等多值信息及必要资料。'],
        ['业务中引用', '在客户、商机或销售活动中关联；查看仍按客户数据权限过滤。']
      ],
      branches: [
        ['多客户关系', '同一联系人可关联多个客户，各段任职关系分别维护。'],
        ['活动参与人', '一次沟通可先记录未建档参与人；不强制自动创建联系人。']
      ]
    },
    lead: {
      name: '线索', scope: '从原始机会到正式商机的单条转换', source: sources.lead,
      steps: [
        ['取得线索', '手工、导入或试点候选确认后形成线索。'],
        ['查重与归池', '识别重复并按来源、池规则确定待认领或负责人。'],
        ['派领与跟进', '有权人员分派、认领，记录活动、任务及下一步。'],
        ['单条转换', '为每条新商机选择或新建客户，按需建立联系人关系。'],
        ['形成正式结果', '至少创建一条商机；整体事务成功后更新线索并保留来源关系。']
      ],
      branches: [
        ['转换失败', '客户、初始经营关系或任一商机校验失败时，整条转换不生效。'],
        ['其他结论', '重复、无效或暂不转换按线索规则处理，不能仅关联客户就算转换。']
      ]
    },
    opportunity: {
      name: '商机', scope: '正式销售机会、版本化模板与阶段推进', source: sources.opportunity,
      steps: [
        ['创建商机', '直接创建或由线索转换生成，关联有效主客户。'],
        ['确定推进模式', '选择主业务线与销售场景，绑定适用流程模板版本。'],
        ['进入阶段', '按模板记录详细阶段，并在需要时生成统一正式任务。'],
        ['推进与协作', '记录活动、团队、下一步，校验必填字段和必须完成的阶段任务。'],
        ['结束或继续', '按实际结果关闭；后续重激活、回退或迁移保留过程历史。']
      ],
      branches: [
        ['门槛未满足', '阶段推进被阻止并提示缺口；停滞提醒不改变商机状态。'],
        ['多业务线', '业务线明细可有主／协同角色，但一条商机仍只有一套阶段与主负责人。']
      ]
    },
    activity: {
      name: '普通销售活动', scope: '已发生的沟通事实与业务对象关联', source: sources.work,
      steps: [
        ['进入记录', '从客户、线索、商机或互动时间线发起。'],
        ['填写发生事实', '记录活动类型、发生时间、实际沟通人和内容摘要。'],
        ['关联业务对象', '至少关联一类有效对象；客户关联按来源条件判断。'],
        ['保存与追溯', '形成普通活动 ID，展示在有权对象的活动时间线。'],
        ['维护下一步', '补充纪要、原件或纠错记录；由用户选择是否产生任务候选。']
      ],
      branches: [
        ['参与人未建档', '可先记录姓名或称谓，不强制创建联系人。'],
        ['对象边界', '普通活动是已发生事实，不代替正式拜访或未来任务。']
      ]
    },
    visit: {
      name: '正式拜访', scope: '独立 visit_id 的计划、执行与异常复核', source: sources.work,
      steps: [
        ['创建计划', '选主客户与有效经营范围，填写时间、地址并生成稳定 visit_id。'],
        ['现场签到', '保存实际时间、位置和签到证据；异常情况独立记录。'],
        ['拜访与签退', '围绕同一拜访记录补充执行事实和签退信息。'],
        ['纪要与下一步', '提交拜访总结，按需选择下一步任务。'],
        ['完成或复核', '满足完成门槛后完成；异常走待复核、待补充、已复核。']
      ],
      branches: [
        ['未到访或取消', '到期未签到先提醒；用户或主管明确改期、取消或确认未到访。'],
        ['异常边界', '异常复核不自动改变拜访主状态，也不自动形成绩效结论。']
      ]
    },
    task: {
      name: '任务', scope: '统一正式任务与独立候选的处理边界', source: sources.work,
      steps: [
        ['确定来源', '自建、主管指派、候选确认写入或规则生成。'],
        ['创建正式任务', '指定唯一负责人、可选参与人、截止时间及关联对象。'],
        ['待处理执行', '负责人直接处理；协作人可按权限提交协作成果。'],
        ['提交成果', '负责人记录完成结果，任务直接进入已完成。'],
        ['回到源业务', '商机阶段、拜访或活动等源对象按原任务 ID 展示结果。']
      ],
      branches: [
        ['取消分支', '符合条件的待处理任务可取消；逾期只是时间标记。'],
        ['候选边界', 'AI 待确认不算正式任务；正式任务无接收、拒绝、验收或退回。']
      ]
    },
    schedule: {
      name: '日程', scope: '独立日程与源业务时间投影分开', source: sources.work,
      steps: [
        ['选择来源', '用户创建独立日程，或从日历查看任务、拜访等源对象投影。'],
        ['展示日历', '按今天、本周或本月查看时间与来源类型。'],
        ['处理独立日程', '有权用户编辑、取消或删除真实日程记录。'],
        ['条件同步', '组织开启且用户授权时，同步独立日程与正式拜访到企微。'],
        ['回源处理', '点击任务、拜访、线索或商机投影，进入源对象执行动作。']
      ],
      branches: [
        ['转任务', '独立日程可转正式任务，保留原日程及转换记录，不双向联动。'],
        ['同步边界', '企微不回写任务截止时间；投影不生成第二份业务对象。']
      ]
    },
    report: {
      name: '日报', scope: '正式事实、销售补充、提交快照与主管建议', source: sources.work,
      steps: [
        ['汇集当日事实', '读取有权的客户、线索、商机、活动、拜访和任务正式变化。'],
        ['形成工作草稿', '可使用 AI 初始底稿，销售编辑后不被刷新自动覆盖。'],
        ['销售补充', '核对来源并补充当日情况、问题与下一步。'],
        ['提交冻结', '形成提交时的事实快照和只读正文。'],
        ['主管阅读', '主管打开正文才记本人已读，可追加不可修改的建议。']
      ],
      branches: [
        ['无正式事实', '仍可填写非空说明并提交，不得提交完全空白日报。'],
        ['提交后边界', '不退回、不重提、不编辑提交版本；建议不改原正文。']
      ]
    },
    agent: {
      name: 'Agent 候选', scope: '来源证据、人工确认与正式业务写入', source: sources.agent,
      steps: [
        ['合法来源', '取得有权输入并校验用户、对象及来源版本。'],
        ['识别与生成', '匹配业务上下文，产生带来源证据的候选内容。'],
        ['人工处理', '发起人查看事实、推断与缺失，可修改、确认或忽略。'],
        ['正式写入', '确认后重新鉴权，逐条校验必填、查重、版本和幂等。'],
        ['返回结果', '成功项返回正式 ID；失败项保留确认内容与原因供处理。']
      ],
      branches: [
        ['写入失败', '使用原幂等键重试前重新校验；业务环境变化时停止机械重试。'],
        ['人工主链', 'AI 不可用时，销售活动、任务和日报的手工处理继续可用。']
      ]
    },
    knowledge: {
      name: '知识管理', scope: '瑞赢知识文档的草稿、发布与使用', source: sources.system,
      steps: [
        ['创建草稿', '有权管理员维护文档内容、标签及适用范围。'],
        ['校验发布', '按编辑与发布按钮权限检查内容和发布范围。'],
        ['形成版本', '发布后产生正式版本，已发布内容不被草稿直接覆盖。'],
        ['检索与引用', '有权用户在知识库或全局搜索中查看；Agent 按权限引用。'],
        ['更新或停用', '修改已发布文档先形成新草稿，重新发布或停用。']
      ],
      branches: [
        ['可见范围', '仅已发布且用户处于发布范围内的知识进入全局搜索。'],
        ['外部来源', '公司知识库原件与瑞赢维护文档分开，引用仍校验源权限。']
      ]
    },
    system: {
      name: '系统管理', scope: '以业务规则配置为例；组织权限、异常事项和 AI 运行各有独立处理路径', source: sources.system,
      steps: [
        ['选择配置', '进入字典、模板、线索池、公海、区域业务线或任务／拜访／Agent 配置。'],
        ['编辑规则', '按配置对象维护适用范围、参数和业务约束。'],
        ['校验与发布', '校验功能与按钮权限、内容及版本条件。'],
        ['业务生效', '按各规则的生效和版本绑定方式作用于源业务对象。'],
        ['留存追溯', '保留变更记录；异常事项与 AI 失败在各自页面处理。']
      ],
      branches: [
        ['权限与人员', '组织、角色变化先重算可见范围；业务责任移交仍需单独处理。'],
        ['本期边界', '独立指标配置、集成同步、消息投递及审计查询页面不在 0.1 前台。']
      ]
    }
  };

  var picker = document.getElementById('module-flow-select');
  var content = document.getElementById('module-flow-content');
  if (!picker || !content) return;

  function el(tag, className, value) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (value) node.textContent = value;
    return node;
  }

  function render() {
    var flow = flows[picker.value] || flows.customer;
    content.textContent = '';
    content.appendChild(el('h3', '', flow.name + ' · 典型流程'));
    content.appendChild(el('p', 'note', flow.scope));
    var scroll = el('div', 'module-flow-scroll');
    var grid = el('div', 'module-flow-grid');
    grid.setAttribute('role', 'list');
    grid.setAttribute('aria-label', flow.name + '业务流程');
    flow.steps.forEach(function (step, index) {
      var card = el('div', 'module-flow-step');
      card.setAttribute('role', 'listitem');
      card.appendChild(el('span', 'module-flow-num', 'STEP ' + (index + 1)));
      card.appendChild(el('strong', '', step[0]));
      card.appendChild(el('p', '', step[1]));
      grid.appendChild(card);
    });
    scroll.appendChild(grid);
    content.appendChild(scroll);
    var branches = el('div', 'module-flow-branches');
    flow.branches.forEach(function (branch) {
      var card = el('div', 'module-flow-branch');
      card.appendChild(el('b', '', branch[0]));
      card.appendChild(el('p', '', branch[1]));
      branches.appendChild(card);
    });
    content.appendChild(branches);
    var source = el('p', 'module-flow-source', '规则依据：');
    var link = el('a', '', '查看对应模块 PRD');
    link.href = flow.source;
    source.appendChild(link);
    content.appendChild(source);
  }

  picker.addEventListener('change', render);
  render();
})();
