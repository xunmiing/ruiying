/* ==========================================================================
 * 瑞赢 0.1 · 页面清单与追溯（page-manifest.js）
 * --------------------------------------------------------------------------
 * 依据：prd/00-产品结构与页面清单 V0.19 §1～§9、prd.md §6.0 页面契约登记、
 *       prd/01～prd/08 模块 PRD、testcase.md（AC-01～AC-78）。
 *
 * 本清单是「页面契约 ↔ 实际 HTML 文件」的唯一对照表：
 *   - inThisRound 全部为 true：00 页面清单中的全部当前页面／视图都在本轮生成；
 *     本期有效页面以 2026-10-12 轻量化范围为准；退出页面仅留历史文件。
 *   - 未生成页面一律不出现在本清单中，避免用占位页冒充交付。
 *   - 视图（views）用 | 分隔，表示同一页面内通过 Tab／抽屉／展开区承载的视图，
 *     不为其单独拆分 HTML。
 *   - 平台治理类合同（如 AI 运行记录与失败治理 PG-AI-OPS）与 00 §6 的分组归属
 *     保持文档原样；实现位置以 path 为准。
 *
 * architecture.html 是评审说明文件，不是页面契约，不计入页面总数。
 * ========================================================================== */
window.RY = window.RY || {};

RY.manifest = (function () {
  'use strict';

  var ALL5 = 'R1 销售｜R2 销售主管｜R3 销售运营｜R4 客户数据管理｜R5 系统管理员';

  /* 一行一个页面：path|contract|end|module|roles|prd|views|ac|status
     roles 为 'ALL5' 时表示五个角色都可进入（实际进入仍需数据范围与对象状态校验）。 */
  var RAW = [
    /* ---------------------------------------------------- 根：两个统一入口 */
    'pc.html|PC-HOME|PC|首页与全局能力|ALL5|prd/00 §2.1／§2.2；prd/06 §2|欢迎信息|按权限过滤的固定快捷入口|右上角全局入口（搜索／消息／处理记录／头像）|不显示指标、待办聚合与最近访问|AC-01|已生成',
    'index.html|PG-HOME-TODAY|H5|首页和工作入口|ALL5|prd/00 §1.1／§2；prd/05 §3.1|今日工作|快捷入口（客户／线索／商机／任务／日程／拜访／日报／瑞赢 AI）|消息入口|按角色、数据范围与对象状态聚合|AC-01|已生成',
    /* ------------------------------------------------ PC 全局与统一状态页 */
    'pc/search.html|PG-GLOBAL-SEARCH|PC|首页与全局能力|ALL5|prd/00 §4；prd/08 §3|八类对象搜索（客户／联系人／线索／商机／任务／正式拜访／日报／知识）|结果分类|进入即重新鉴权|AC-03|已生成',
    'pc/message/list.html|PG-GLOBAL-MESSAGE|PC|首页与全局能力|ALL5|prd/00 §4；prd/07 §5；prd/08 §16|站内消息|已读未读|来源深链|打开目标重新鉴权|AC-70|已生成',
    'pc/processing/list.html|PG-GLOBAL-PROCESSING|PC|首页与全局能力|ALL5|prd/00 §4／§8|只展示本人发起|批量／导入／导出处理记录|保留 7 天|不替代正式审计|AC-45|已生成',
    'pc/processing/detail.html|PG-GLOBAL-PROCESSING-DETAIL|PC|首页与全局能力|ALL5|prd/00 §4／§8|总数|成功数|失败数|失败明细|文件下载|失败项按原参数重试|AC-45 AC-46|已生成',
    'pc/state.html|PG-GLOBAL-STATE|PC|首页与全局能力|ALL5|prd/00 §4／§7／§9|无权限页不展示标题摘要与数量|对象不可用页|版本冲突提示|异步处理中状态|部分成功结果|AC-63 AC-64|已生成',
    /* ------------------------------------------------------------ PC 客户管理 */
    'pc/customer/list.html|PG-CUS-LIST|PC|客户管理|ALL5|prd/00 §5.1；prd/01 §3|全部｜团队｜我负责的｜我协作的|菜单进入默认全部|状态时间不限|组合筛选|导入导出|AC-42|已生成',
    'pc/customer/detail.html|PG-CUS-DETAIL|PC|客户管理|ALL5|prd/00 §5.1；prd/01 §8～§12|概览|客户地址|经营关系|联系人|客户关系网|销售活动|商机|历史|权限控制加修改历史|AC-41 AC-42|已生成',
    'pc/customer/create.html|PG-CUS-CREATE|PC|客户管理|R1,R2|prd/01 §0、§4～§7|客户与初始经营关系原子创建|负责人与区域联动|分层查重|幂等与回滚|AC-01 AC-03 CUS-N01 CUS-N02 CUS-N03 CUS-N04|已生成',
    'pc/customer/public-pool.html|PG-CUS-POOL|PC|客户管理|R1,R2,R4,R5|prd/01 §11|零有效经营关系客户主档|认领|主管分派|初始经营关系|AC-42 AC-43|已生成',
    'pc/customer/import.html|PG-CUS-IMPORT|PC|客户管理|R1,R2,R3,R4|prd/00 §8；prd/01 §6|模板导入|导入预检|逐条结果|部分成功|失败项重试|AC-44|已生成',
    'pc/contact/list.html|PG-CON-LIST|PC|客户管理|ALL5|prd/00 §5.1；prd/01 §13|单一列表|新增|导入|导出|无通用联系人批量修改| AC-47 AC-39 |已生成',
    'pc/contact/detail.html|PG-CON-DETAIL|PC|客户管理|ALL5|prd/00 §5.1；prd/01 §13／§14|概览|关联客户|销售活动|历史|仅展示有权客户关系| AC-48 AC-24 AC-39 |已生成',
    /* ------------------------------------------------------------ PC 销售管理 */
    'pc/lead/list.html|PG-LEAD-LIST|PC|销售管理|ALL5|prd/00 §5.2；prd/02 §3／§9|全部｜团队｜我负责的｜池内|菜单进入状态时间不限|分派|转交|退回|主管回收|禁止批量转换| AC-10 AC-11 AC-15 |已生成',
    'pc/lead/detail.html|PG-LEAD-DETAIL|PC|销售管理|ALL5|prd/00 §5.2；prd/02 §4～§8|概览|销售活动|任务与日程|历史|状态动作与纠错|AC-12|已生成',
    'pc/lead/create.html|PG-LEAD-CREATE|PC|销售管理|R1,R2,R3|prd/02 §2|极低门槛录制|最少必填|池与业务线判定| AC-08 AC-15 |已生成',
    'pc/lead/convert.html|PG-LEAD-CONVERT|PC|销售管理|R1,R2|prd/02 §10|单条整体事务转换|一次校验|失败整体回滚|不建设批量转换| AC-13 AC-14 AC-16 |已生成',
    'pc/lead/convert-result.html|PG-LEAD-CONVERT-RESULT|PC|销售管理|R1,R2|prd/00 §5.2；prd/02 §10|展示创建与关联的客户、联系人、商机及其他正式对象|由用户选择进入|AC-14|已生成',
    'pc/opportunity/list.html|PG-OPP-LIST|PC|销售管理|ALL5|prd/00 §5.2；prd/03 §14|默认全部可见范围、状态时间不限|负责人与团队筛选|批量只允许转交主负责人、增加移除团队成员|AC-21|已生成',
    'pc/opportunity/detail.html|PG-OPP-DETAIL|PC|销售管理|ALL5|prd/00 §5.2；prd/03 §5～§13|头部|固定阶段过程区|概况|销售活动|任务|业务线|团队|历史| AC-22 AC-23 AC-07 |已生成',
    'pc/opportunity/create.html|PG-OPP-CREATE|PC|销售管理|R1,R2|prd/03 §2～§4|客户|名称|唯一主业务线|销售场景|模板唯一匹配| AC-18 AC-19 AC-06 AC-17 |已生成',
    'pc/activity/list.html|PG-ACT-LIST|PC|销售管理|ALL5|prd/00 §5.2；prd/04 §3|普通活动页签|普通活动查询与纠错|不提供通用业务批量修改|AC-30|已生成',
    'pc/activity/detail.html|PG-ACT-DETAIL|PC|销售管理|ALL5|prd/00 §5.2；prd/04 §3|概况（活动事实、AI 结果、原件）|业务对象（有权关联对象、对象关系）|操作记录（操作历史、纠错前后值）|右上角返回与纠错| AC-30 AC-54 AC-24 |已生成',
    'pc/visit/list.html|PG-VISIT-LIST|PC|销售管理|ALL5|prd/00 §5.2；prd/04 §4|正式拜访页签|状态与异常筛选|拜访专用批量复核与导出|AC-31 AC-32|已生成',
    'pc/visit/detail.html|PG-VISIT-DETAIL|PC|销售管理|ALL5|prd/00 §5.2；prd/04 §4|概况内展示基础信息、执行与证据、异常与复核、补充与纠错、来源与审计、历史|顶部追加补充和纠错|AC-31 AC-32|已生成',
    /* ------------------------------------------------------------ PC 工作管理 */
    'pc/task/list.html|PG-TASK-LIST|PC|工作管理|ALL5|prd/00 §5.3；prd/04 §2|全部｜待确认｜我的｜团队|我的关系多选与时间单选|按来源与业务类型区分|批量转派|逐条结果| AC-25 AC-26 AC-09 |已生成',
    'pc/task/detail.html|PG-TASK-DETAIL|PC|工作管理|ALL5|prd/00 §5.3；prd/04 §2|任务信息|成果|日志|状态示例切换|协作记录与来源锚点|阶段任务额外展示来源商机、阶段与轮次| AC-25 AC-27 AC-09 |已生成',
    'pc/schedule/list.html|PG-SCH-LIST|PC|工作管理|ALL5|prd/00 §5.3；prd/04 §5|我的｜团队|不做批量业务操作|AC-34|已生成',
    'pc/schedule/detail.html|PG-SCH-DETAIL|PC|工作管理|ALL5|prd/00 §5.3；prd/04 §5|状态示例|日程信息|关联对象|企微同步状态|历史|AC-34 AC-35|已生成',
    'pc/report/list.html|PG-RPT-LIST|PC|工作管理|ALL5|prd/00 §5.3；prd/04 §6|全部｜团队｜我的日报|默认当天、状态不限|不做批量已读／未读|AC-36 AC-37|已生成',
    'pc/report/detail.html|PG-RPT-DETAIL|PC|工作管理|ALL5|prd/00 §5.3；prd/04 §6|状态示例|系统事实|销售补充|主管建议|阅读信息|提交后冻结、不退回、不重提| AC-36 AC-38 AC-20 AC-29 |已生成',
    /* ---------------------------------------------------------------- PC 分析 */
    /* ------------------------------------------------------------ PC 业务配置 */
    'pc/config/dict.html|PG-ADM-DICT|PC|业务配置|R3,R5|prd/06 §9|A 类配置|保存即生效并留历史|不建设配置审批与未来定时生效| AC-55 AC-28 |已生成',
    'pc/config/template.html|PG-ADM-TEMPLATE|PC|业务配置|R3,R5|prd/06 §9；prd/03 §6|B 类流程模板|草稿|校验|立即原子发布新版本|发布失败不能部分生效|历史对象继续按原版本解释|恢复旧版必须复制为新草稿|AC-56 AC-57|已生成',
    'pc/config/lead-pool.html|PG-ADM-LEADPOOL|PC|业务配置|R3,R5|prd/06 §9；prd/02 §9|A 类线索池|持有上限|保护期|停止接收|AC-55|已生成',
    'pc/config/cus-pool.html|PG-ADM-CUSPOOL|PC|业务配置|R3,R5|prd/06 §9；prd/01 §11|A 类全国公海规则|持有上限|保护期|认领与分派|最后有效关系停止后自动入池|AC-43|已生成',
    'pc/config/region.html|PG-ADM-REGION|PC|业务配置|R3,R5|prd/06 §9|A 类区域与业务线规则|外部稳定标识映射|AC-55|已生成',
    'pc/config/task-rule.html|PG-ADM-TASKRULE|PC|业务配置|R3,R5|prd/06 §9；prd/04 §2|B 类任务规则|草稿|校验|立即发布|历史对象继续按原版本解释| AC-58 AC-28 |已生成',
    'pc/config/visit-rule.html|PG-ADM-VISITRULE|PC|业务配置|R2只读,R3,R5|prd/06 §8～§9；prd/04 §3|规则列表|适用范围|生效与草稿版本| AC-59 AC-28 |已生成',
    'pc/config/visit-rule-detail.html|PG-ADM-VISITRULE-DETAIL|PC|业务配置|R2只读,R3,R5|prd/06 §8～§9|统一查看编辑|校验发布|停用|版本历史| AC-51 AC-28 |已生成',
    'pc/config/visit-rule-new.html|PG-ADM-VISITRULE-NEW|PC|业务配置|R3,R5|prd/06 §8～§9|新增草稿|结构化适用范围| AC-51 AC-28 |已生成',
    /* ------------------------------------------------------------ PC 指标配置 */
    /* ------------------------------------------------ PC Agent 配置（四页签） */
    'pc/agent/config.html|PG-ADM-AGENTCFG|PC|Agent 配置|R3,R5|prd/06 §11；prd/05 §13|能力|来源|试点范围|预生成（单页面四页签）|不得拆成四个一级页面|配置不能取消人工确认|AC-62|已生成',
    /* ------------------------------------------------------ PC 人员权限与移交 */
    'pc/people/list.html|PG-ADM-ORG|PC|人员与权限|R2,R4,R5|prd/07 §2|人员管理|用户中心同步符合条件的销售|ZR 工号认证映射|AC-65|已生成',
    'pc/permission/config.html|PG-ADM-PERM|PC|人员与权限|R5|prd/07 §3～§5|角色页面权限|数据范围|多角色取并集|保存立即生效、长期有效|不设置审批|只有 R5 可授予或撤销 R5|AC-66 AC-67|已生成',
    'pc/permission/pending.html|PG-ADM-PERMPENDING|PC|人员与权限|R2,R4,R5|prd/07 §5|权限待处理|受影响业务对象清单|失权不自动移交业务|AC-68|已生成',
    'pc/handover/list.html|PG-ADM-HANDOVER|PC|人员与权限|R2,R4,R5|prd/07 §5|待预检｜待确认｜处理中｜部分成功｜已完成｜已取消|先停用再移交|AC-68|已生成',
    'pc/people/sync-issue.html|PG-ADM-PEOPLESYNC|PC|人员与权限|R2,R4,R5|prd/07 §2|人员同步异常|工号异常不创建正式人员|AC-69|已生成',
    /* -------------------------------------------------------- PC 异常与质量 */
    'pc/exception/list.html|PG-ADM-EXC|PC|异常事项|R2,R3,R4,R5|prd/07 §6；prd/08 §9|待处理｜处理中｜已完成｜不采纳|领取为原子占用|同一对象同一类型同一时间只有一条未完成事项|AC-71|已生成',
    'pc/exception/detail.html|PG-ADM-EXC-DETAIL|PC|异常事项|R2,R3,R4,R5|prd/07 §6；prd/08 §9|不直接修改正式业务事实|必须跳转源对象使用正式动作|AC-71 AC-72|已生成',
    /* ------------------------------------------------------------ PC 知识管理 */
    'pc/knowledge/list.html|PG-ADM-KNOWLEDGE|PC|知识管理|ALL5|prd/00 §6；prd/08 §12|知识列表|发布与停用|维护权限可组合|不设固定知识管理员角色|AC-74|已生成',
    'pc/knowledge/create.html|PG-ADM-KNOWLEDGE-CREATE|PC|知识管理|ALL5|prd/00 §6；prd/08 §12|新建知识文档|保存草稿|发布范围|AC-74|已生成',
    'pc/knowledge/detail.html|PG-ADM-KNOWLEDGE-DETAIL|PC|知识管理|ALL5|prd/00 §6；prd/08 §12|详情与编辑|发布|停用|版本历史|AC-74|已生成',
    /* -------------------------------------------------------- PC 集成与同步 */
    /* -------------------------------------------------------- PC 消息投递 */
    /* ------------------------------------------------- PC AI 运行与失败治理 */
    'pc/ai/ops.html|PG-AI-OPS|PC|AI 运行记录与失败治理|R3,R5|prd/05 §12；prd/05 §13；prd/08 §2|Run ID|能力类型|状态|来源版本|耗时|错误码|重试次数|写入接口结果|必要脱敏信息|运行治理不能扩大 AI 来源全文权限|AC-77|已生成',
    /* ---------------------------------------------------------------- PC 审计 */
    /* ------------------------------------------------------ 企微 H5：首页与入口 */
    'h5/more.html|PG-HOME-TODAY|H5|首页和工作入口|ALL5|prd/00 §1.1；prd/05 §3.1|工作入口聚合（客户／联系人／线索／商机／任务／活动／拜访／日程／日报／知识／消息／瑞赢 AI）|按角色与页面权限过滤|AC-02|已生成',
    'h5/team/index.html|PG-H5-TEAM|H5|团队处理|R2,R5|prd/00 §1.1；prd/04 §2～§6|工作台单一团队处理入口|团队线索／任务／日报／拜访回源|逐项按源业务权限鉴权|AC-02|已生成',
    'h5/quicknote/index.html|PG-H5-QUICKNOTE|H5|个人速记|ALL5|prd/00 §1.1；prd/04 §3.0|语音默认|文本录入|后台转写演示|本人历史|文字编辑|原录音回听|已生成',
    'h5/message/list.html|PG-GLOBAL-MESSAGE|H5|首页和工作入口|ALL5|prd/00 §6.24B；prd/07 §7|消息列表|已读未读|来源深链|个人企微提醒设置|AC-55|已生成',
    'h5/agent/create.html|PG-AI-CREATE|H5|瑞赢 AI|R1,R2,R3|prd/05 §4|目标对象与拟写字段|证据与确定性|重名匹配|人工确认后正式创建|AI-02|已生成',
    /* -------------------------------------------------------- H5 客户和联系人 */
    'h5/customer/list.html|PG-CUS-LIST|H5|客户和联系人|ALL5|prd/01 §3|搜索|卡片列表|底部筛选抽屉|触达优先|AC-40|已生成',
    'h5/customer/detail.html|PG-CUS-DETAIL|H5|客户和联系人|ALL5|prd/01 §8～§12|概览|经营关系|联系人|客户关系网|地址|全国公海最小摘要|权限控制加修改历史|AC-41 AC-42|已生成',
    'h5/customer/create.html|PG-CUS-CREATE|H5|客户和联系人|R1,R2|prd/01 §0、§4～§7|客户与初始经营关系原子创建|负责人与区域联动|分层查重|幂等与回滚|AC-01 AC-03 CUS-N01 CUS-N02 CUS-N03 CUS-N04|已生成',
    'h5/customer/pool.html|PG-CUS-POOL|H5|客户和联系人|R1,R2,R4,R5|prd/01 §0、§9|零条有效经营关系客户|认领原子新建关系|并发首人成功|AC-42 CUS-N06 CUS-N07|已生成',
    'h5/contact/list.html|PG-CON-LIST|H5|客户和联系人|ALL5|prd/01 §13|列表|搜索| AC-47 AC-39 |已生成',
    'h5/contact/detail.html|PG-CON-DETAIL|H5|客户和联系人|ALL5|prd/01 §13／§14|概览|关联客户|销售活动|仅展示有权客户关系| AC-48 AC-39 |已生成',
    /* ---------------------------------------------------------------- H5 线索 */
    'h5/lead/list.html|PG-LEAD-LIST|H5|线索|ALL5|prd/02 §3／§9|我的｜团队｜池内|单条分派／认领／转交／退回／回收|不提供导出| AC-10 AC-11 AC-15 |已生成',
    'h5/lead/detail.html|PG-LEAD-DETAIL|H5|线索|ALL5|prd/02 §4～§8|概览|跟进记录|状态动作|培育／无效／纠错|单条整体转换入口|AC-12|已生成',
    'h5/lead/create.html|PG-LEAD-CREATE|H5|线索|R1,R2,R3|prd/02 §2|极低门槛录制|最少必填|AC-08|已生成',
    'h5/lead/convert.html|PG-LEAD-CONVERT|H5|线索|R1,R2|prd/02 §10|单条整体事务转换|一次校验|失败整体回滚| AC-13 AC-14 AC-16 |已生成',
    /* ---------------------------------------------------------------- H5 商机 */
    'h5/opportunity/list.html|PG-OPP-LIST|H5|商机|ALL5|prd/03 §14|列表|筛选|无批量业务操作|AC-21|已生成',
    'h5/opportunity/detail.html|PG-OPP-DETAIL|H5|商机|ALL5|prd/03 §5～§13|阶段过程|单条推进与回退|结束／重新激活|不展示产品、金额、竞争信息|不提供 AI 摘要|AC-22 AC-23|已生成',
    'h5/opportunity/create.html|PG-OPP-CREATE|H5|商机|R1,R2|prd/03 §2～§4|模板匹配结果|唯一主业务线与销售场景| AC-18 AC-19 AC-17 |已生成',
    /* -------------------------------------------------- H5 任务与销售活动 */
    'h5/task/list.html|PG-TASK-LIST|H5|任务与销售活动|ALL5|prd/04 §2|待确认｜我的｜团队|我的关系多选与时间单选|页头弹窗筛选|候选回源确认| AC-25 AC-09 |已生成',
    'h5/task/detail.html|PG-TASK-DETAIL|H5|任务与销售活动|ALL5|prd/04 §2|概览|完成与成果|参与人|日志| AC-25 AC-26 AC-09 |已生成',
    'h5/task/create.html|PG-TASK-CREATE|H5|任务与销售活动|R1,R2,R5|prd/04 §2|会议／拜访／其他分流|一个任务 ID|参与人|AC-53|已生成',
    'h5/task/meeting.html|PG-TASK-MEETING|H5|任务与销售活动|R1,R2,R5|prd/04 §2|会议文字上传|纪要与分工|任务成果|AC-53|已生成',
    'h5/activity/list.html|PG-ACT-LIST|H5|任务与销售活动|ALL5|prd/04 §3|时间线｜本人拜访｜本人日报同页切换|拜访投影同一 visit_id|AC-30|已生成',
    'h5/activity/detail.html|PG-ACT-DETAIL|H5|任务与销售活动|ALL5|prd/04 §3|活动信息|关联对象|内容与纪要|AI 结果|原件|AC-30|已生成',
    'h5/activity/create.html|PG-ACT-CREATE|H5|任务与销售活动|ALL5|prd/04 §3|至少关联一个有效业务对象|AC-30|已生成',
    /* -------------------------------------------------------- H5 正式拜访 */
    'h5/visit/list.html|PG-VISIT-LIST|H5|正式拜访|ALL5|prd/04 §4|我的｜团队|状态与异常筛选|AC-31|已生成',
    'h5/visit/detail.html|PG-VISIT-DETAIL|H5|正式拜访|ALL5|prd/04 §4|签到|执行|结果|证据|异常说明|签退|AC-31 AC-32|已生成',
    /* -------------------------------------------------------- H5 统一日历 */
    'h5/calendar/index.html|PG-CAL|H5|统一日程|ALL5|prd/04 §5|独立日程三状态|任务与正式拜访日历投影|线索下次跟进、商机下一步行动、商机预计成交日期只读投影|企微同步状态|仅独立日程可编辑|AC-33 AC-34|已生成',
    /* -------------------------------------------------------- H5 日报与主管处理 */
    'h5/report/daily.html|PG-RPT-DAILY|H5|日报和主管业务处理|ALL5|prd/04 §6|草稿|AI 原始底稿|销售编辑|一次提交|历史|提交后冻结不退回不重提| AC-36 AC-20 |已生成',
    'h5/report/team.html|PG-RPT-TEAM|H5|日报和主管业务处理|R2,R5|prd/04 §6|团队日报|本人阅读状态|追加建议|不做批量已读未读| AC-37 AC-38 AC-29 |已生成',
    'h5/report/detail.html|PG-RPT-DETAIL|H5|日报和主管业务处理|ALL5|prd/04 §6|系统事实|销售补充|主管建议|阅读信息|AC-36 AC-38|已生成',
    /* -------------------------------------------------------------- H5 Agent */
    'h5/agent/index.html|PG-AI-H5|H5|Agent|ALL5|prd/05 §3.1|完整助手首页|六项能力入口|线索 AI 创建试点|其余对象 AI 创建后续开放|来源核对与人工确认| AI-01 AI-06 AI-36 AI-37 |已生成',
    'h5/agent/organize.html|PG-AI-ORGANIZE|H5|Agent|ALL5|prd/05 §3～§4|沟通整理|文字输入为必需来源|大圆文档／录音／图片／会议纪要|候选生成|来源版本|权限内检索| AI-01 AI-13 AI-17 AI-18 AI-44 AI-47 |已生成',
    'h5/agent/confirm.html|PG-AI-CONFIRM|H5|Agent|ALL5|prd/05 §4|当前待确认|候选详情|字段证据与确定性|修改后确认|写入状态与幂等| AI-02 AI-03 AI-19 AI-24 AI-61 AI-62 |已生成',
    'h5/agent/pending.html|PG-AI-PENDING|H5|Agent|ALL5|prd/05 §3.1／§4|历史待处理|写入失败|失败分类|按原参数重试|已失效候选不能继续确认| AI-05 AI-34 AI-35 AI-65 |已生成',
    'h5/agent/meeting.html|PG-AI-MEETING|H5|Agent|ALL5|prd/05 §5|会议候选|人工批量确认|只生成任务候选| AI-25 AI-29 |已生成',
    'h5/agent/object.html|PG-AI-OBJECT|H5|Agent|ALL5|prd/05 §5|对象 AI|权限内知识检索|只读摘要与问答|不改写正式字段| AI-07 AI-09 AI-10 |已生成',
    'h5/agent/manager.html|PG-AI-MANAGER|H5|Agent|R2,R5|prd/05 §3.1|主管关注|候选处理统计|不代销售确认|只查看本来有权的业务正文| AI-40 AI-41 |已生成',
    /* -------------------------------------------------------- H5 知识和消息 */
    'h5/knowledge/list.html|PG-KB-LIST|H5|知识和消息|ALL5|prd/08 §12|知识搜索|仅已发布且在授权发布范围内|停用文档不进入普通搜索|AC-54|已生成',
    'h5/knowledge/detail.html|PG-KB-DETAIL|H5|知识和消息|ALL5|prd/08 §12|查看|下载|链接不扩大权限，打开时重新鉴权|AC-54|已生成'
  ];

  var FIELDS = ['path', 'contract', 'end', 'module', 'roles', 'prd', 'views', 'ac', 'status'];

  /**
   * 解析一行清单。
   *
   * 注意：views 字段自身也用「|」分隔多个视图，因此不能按位置下标取值——
   * 否则第 6 项之后的所有字段都会错位：views 只剩第一个视图，ac 会读成视图名，
   * status 会读成视图名，导致 verify() 永远认为全部页面未生成。
   * 这里从两端锚定：path…prd 是固定 6 项，ac 与 status 各占末尾一项，
   * 中间的 views 用切片取得，无论它包含多少个子视图都不会错位。
   */
  function parseRow(line) {
    var p = line.split('|');
    var o = {};
    var tail = p.length >= 3 ? p.length - 2 : p.length;
    o.path = p[0] || '';
    o.contract = p[1] || '';
    o.end = p[2] || '';
    o.module = p[3] || '';
    o.roles = p[4] || '';
    o.prd = p[5] || '';
    o.ac = p.length >= 3 ? (p[p.length - 2] || '') : '';
    o.status = p.length >= 2 ? (p[p.length - 1] || '') : '';
    o.views = p.slice(6, tail).filter(Boolean).join('|');
    return o;
  }

  var list = RAW.map(function (line) {
    var f = parseRow(line);
    var o = {};
    FIELDS.forEach(function (k) { o[k] = f[k]; });
    if (o.end === 'PC') {
      var source = o.roles === 'ALL5' ? ['R1','R2','R3'] : o.roles.split(',');
      var mapped = [];
      source.forEach(function (r) { var v = r.indexOf('R4') === 0 || r.indexOf('R5') === 0 ? 'R3' : r.replace('R2只读','R2'); if (mapped.indexOf(v) < 0) mapped.push(v); });
      o.roles = mapped.join(',');
      if (o.path === 'pc/permission/config.html') o.views = '三个人工角色|功能列表权限|按钮权限|固定数据范围说明|不配置字段明文权限';
    }
    o.roles = o.roles === 'ALL5' ? ALL5 : o.roles.split(',').map(function (r) {
      return r + ' ' + (RY.perm && RY.perm.ROLES[r] ? RY.perm.ROLES[r].name : r);
    }).join('｜');
    o.views = o.views ? o.views.split('|') : [];
    o.ac = o.ac ? o.ac.split(/\s+/).filter(Boolean) : [];
    o.inThisRound = true;
    o.note = '本轮生成范围。' + (o.ac.length ? '' : '（该页面未直接登记 AC 编号，按模块级验收追溯）');
    return o;
  });

  var byPath = {};
  list.forEach(function (e) { byPath[e.path] = e; });

  /**
   * 校验清单自身一致性：
   * - 全部条目在本轮范围内；
   * - 路径唯一；
   * - 已生成条目的路径与部署根目录一致（由静态检查脚本进一步比对实际文件）。
   */
  function verify() {
    var total = list.length;
    var generated = list.filter(function (e) { return e.status === '已生成'; }).length;
    var pending = list.filter(function (e) { return e.status !== '已生成'; }).length;
    var dup = [];
    var seen = {};
    list.forEach(function (e) {
      if (seen[e.path]) dup.push(e.path);
      seen[e.path] = true;
    });
    var outOfRound = list.filter(function (e) { return !e.inThisRound; }).map(function (e) { return e.path; });
    var h5 = list.filter(function (e) { return e.end === 'H5'; }).length;
    var pc = list.filter(function (e) { return e.end === 'PC'; }).length;
    return {
      total: total, generated: generated, pending: pending,
      h5: h5, pc: pc, dup: dup, outOfRound: outOfRound,
      ok: dup.length === 0 && outOfRound.length === 0 && pending === 0
    };
  }

  /**
   * 与「实际存在的 html 文件列表」比对，供离线静态检查脚本使用。
   * files：相对 prototype/ 的路径数组，例如 ['pc.html','pc/customer/list.html',...]
   */
  function compare(files) {
    var declared = {};
    list.forEach(function (e) { declared[e.path] = true; });
    var actual = {};
    files.forEach(function (f) { actual[f] = true; });
    var missing = list.filter(function (e) { return !actual[e.path]; }).map(function (e) { return e.path; });
    var extra = files.filter(function (f) { return !declared[f] && f !== 'architecture.html' && f.indexOf('历史/') !== 0; });
    return { missing: missing, extra: extra, ok: missing.length === 0 && extra.length === 0 };
  }

  return {
    list: list, byPath: byPath, verify: verify, compare: compare,
    FIELDS: FIELDS,
    /* 0.1 已无「不在本轮评审范围」的正式页面；保留空数组以显式表达该结论。 */
    NOT_IN_ROUND: []
  };
})();
