/* ==========================================================================
 * 瑞赢 0.1 · PC 原型共享样例事实（demo-data.js）
 * --------------------------------------------------------------------------
 * 职责：集中保存三个业务模块共用的初始样例对象与字典，只提供只读种子数据。
 *       不做跨页持久化（见 prototype-store.js），不做业务页面渲染。
 *
 * 依据：prd/00-产品结构与页面清单.md、prd/01、prd/02、prd/03、
 *       assets/business-object-model.md、assets/state-machine.md。
 *
 * 约束：
 *  - 全部为合成脱敏数据，不含真实客户、联系人、手机号、凭证或生产接口地址。
 *  - 客户、联系人、客户关系网、经营关系、线索、商机共用同一份事实，三个模块不得各自维护矛盾数据。
 *  - 文档内存在枚举差异处按模块 PRD 收口（详见 CHANGELOG「已知文档差异」）。
 * ========================================================================== */
window.RY = window.RY || {};

RY.seed = (function () {
  'use strict';

  var META = {
    iteration: '202609_0.1.0',
    product: '瑞赢',
    demoDate: '2026-09-21',
    storeKey: 'ry.pc.demo.v3'
  };

  /* ---------------------------------------------------------------- 组织基础 */

  var regions = [
    { code: 'RG-EAST', name: '华东区域' },
    { code: 'RG-SOUTH', name: '华南区域' },
    { code: 'RG-NORTH', name: '华北区域' }
  ];

  var businessLines = [
    { code: 'BL-UNSPECIFIED', name: '未明确业务线', status: '启用', placeholder: true },
    { code: 'BL-CE', name: '车电业务线', status: '启用' },
    { code: 'BL-CW', name: '车务业务线', status: '启用' },
    { code: 'BL-XNY', name: '新能源业务线', status: '启用' },
    { code: 'BL-JR', name: '金融科技业务线', status: '停用' }
  ];

  var scenarios = [
    { code: 'SC-STD', name: '标准销售', businessLine: 'BL-CE' },
    { code: 'SC-PROJ', name: '项目制', businessLine: 'BL-CE' },
    { code: 'SC-STD-X', name: '标准销售', businessLine: 'BL-XNY' },
    { code: 'SC-PROJ-X', name: '项目制', businessLine: 'BL-XNY' },
    { code: 'SC-RW', name: '入围', businessLine: 'BL-XNY' },
    { code: 'SC-STD-W', name: '标准销售', businessLine: 'BL-CW' },
    { code: 'SC-PROJ-W', name: '项目制', businessLine: 'BL-CW' }
  ];

  var dicts = {
    customerType: ['集团客户', '组织客户', '个体工商户', '自然人客户'],
    customerStatus: ['正常'],
    customerValue: ['战略', '重点', '普通', '机会'],
    addressType: ['注册地址', '办公地址', '经营地址', '项目／服务地址'],
    contactRole: ['决策', '影响', '使用', '采购', '技术', '财务', '其他'],
    customerNetworkType: ['集团关系', '总分关系', '上游', '下游'],
    operateStatus: ['有效', '停止经营'],
    leadStatus: ['待处理', '跟进中', '已转化', '无效'],
    leadPoolStatus: ['启用', '停止接收', '停用'],
    leadSource: ['市场活动', '转介绍', '销售挖掘', '外部名单', '纷享销客迁移', '其他'],
    leadInvalidReason: ['无需求', '联系不上', '重复线索', '信息错误', '不属于目标业务', '对方明确拒绝', '竞品已签', '其他'],
    recordSource: ['人工录入', '批量导入', '受控试迁移'],
    unifiedStage: ['机会确认', '需求确认', '方案验证', '报价与审批', '商务与合同'],
    oppProcessStatus: ['进行中', '已结束'],
    oppCloseResult: ['赢单', '输单', '关闭'],
    wonBasis: ['合同', '订单', '采购确认', '入围／框架确认', '其他'],
    lostReason: ['竞争对手', '价格', '产品／方案不匹配', '客户预算', '客户选择其他', '其他'],
    stopReason: ['客户取消', '我方停止', '重复', '误报', '其他'],
    teamRole: ['协同销售', '方案', '产品', '交付', '法务', '财务', '其他'],
    poolReleaseReason: ['客户已无合作意向', '业务线不再开展', '客户主体发生变化', '其他'],
    jobType: ['批量处理', '导入', '导出'],
    jobStatus: ['待执行', '处理中', '已完成', '部分成功', '失败'],
    exceptionStatus: ['待处理', '处理中', '已完成', '不采纳']
  };

  /* ------------------------------------------------------------------ 用户 */

  var users = [
    { id: 'U-001', name: '张岚', empNo: 'E21001', role: 'R1', region: ['RG-EAST'], businessLine: ['BL-CE', 'BL-CW'], dept: '华东大区·一线销售' },
    { id: 'U-002', name: '陈默', empNo: 'E21002', role: 'R1', region: ['RG-EAST', 'RG-SOUTH'], businessLine: ['BL-CE', 'BL-XNY'], dept: '华东大区·一线销售' },
    { id: 'U-003', name: '王栩', empNo: 'E21003', role: 'R2', region: ['RG-EAST'], businessLine: ['BL-CE', 'BL-CW', 'BL-XNY'], dept: '华东大区·销售主管' },
    { id: 'U-004', name: '李澄', empNo: 'E21004', role: 'R3', region: ['RG-EAST', 'RG-SOUTH'], businessLine: ['BL-CE', 'BL-CW', 'BL-XNY'], dept: '销售运营' },
    { id: 'U-005', name: '周珂', empNo: 'E21005', role: 'R4', region: ['RG-EAST', 'RG-SOUTH'], businessLine: ['BL-CE', 'BL-CW', 'BL-XNY'], dept: '客户数据管理' },
    { id: 'U-006', name: '郑一', empNo: 'E21006', role: 'R5', region: ['RG-EAST', 'RG-SOUTH', 'RG-NORTH'], businessLine: ['BL-CE', 'BL-CW', 'BL-XNY'], dept: '系统管理' }
  ];

  /* ---------------------------------------------------------------- 客户主档 */

  var customers = [
    {
      id: 'CUS-202609-0001', name: '上海远驰汽车科技有限公司', alias: '远驰科技',
      type: '组织客户', status: '正常', identity: '已核验',
      creditCode: '91310115MA1K3XY07T', creditMissing: false,
      value: '战略', valueReview: '已复核', valueAdjustedAt: '2026-08-28', valueReviewer: '王栩',
      legalPerson: '赵敏', regCapital: '5,000 万元', foundDate: '2016-04-12', industry: '汽车零部件及配件制造',
      businessScope: '汽车电子零部件研发、生产与销售；新能源汽车电附件销售。',
      source: '线索转换', remark: '车电业务线核心客户，2026 年进入年度框架采购洽谈。',
      createdAt: '2026-05-11 10:24', updatedAt: '2026-09-18 16:40',
      industrySource: '工商查询服务', industryQueriedAt: '2026-09-18 16:38', industryState: '正常成功',
      contactsCount: 2, oppsCount: 2
    },
    {
      id: 'CUS-202609-0002', name: '广州盈川新能源集团有限公司', alias: '盈川集团',
      type: '集团客户', status: '正常', identity: '已核验',
      creditCode: '91440101MA9UYX2K3L', creditMissing: false,
      value: '重点', valueReview: '已复核', valueAdjustedAt: '2026-08-19', valueReviewer: '王栩',
      legalPerson: '刘维', regCapital: '20,000 万元', foundDate: '2013-09-02', industry: '新能源产业投资',
      businessScope: '新能源产业投资与运营；新能源汽车充电设施建设。',
      source: '销售挖掘', remark: '集团客户，成员主体分别评定价值，集团等级不继承。',
      createdAt: '2026-04-02 09:10', updatedAt: '2026-09-16 11:02',
      industrySource: '工商查询服务', industryQueriedAt: '2026-09-16 10:58', industryState: '正常成功',
      contactsCount: 1, oppsCount: 1
    },
    {
      id: 'CUS-202609-0003', name: '上海栖达汽车服务部', alias: '',
      type: '个体工商户', status: '正常', identity: '未核验',
      creditCode: '', creditMissing: true,
      value: '', valueReview: '', valueAdjustedAt: '', valueReviewer: '',
      legalPerson: '孙倩', regCapital: '', foundDate: '2019-06-20', industry: '汽车修理与维护',
      businessScope: '汽车维修、保养服务。',
      source: '线索转换', remark: '暂缺统一社会信用代码，已生成异常事项，不阻断经营。',
      createdAt: '2026-08-30 14:05', updatedAt: '2026-09-12 09:31',
      industrySource: '工商查询服务', industryQueriedAt: '2026-08-30 14:02', industryState: '未找到',
      contactsCount: 1, oppsCount: 0
    },
    {
      id: 'CUS-202609-0004', name: '苏州弘远车务有限公司', alias: '弘远车务',
      type: '组织客户', status: '正常', identity: '需复核',
      creditCode: '91320505MA1MT8Q21R', creditMissing: false,
      value: '普通', valueReview: '待复核', valueAdjustedAt: '2026-09-15', valueReviewer: '',
      legalPerson: '陈默', regCapital: '1,200 万元', foundDate: '2018-03-08', industry: '汽车租赁',
      businessScope: '汽车租赁；二手车经纪；道路救援服务。',
      source: '线索转换', remark: '名称近期发生工商变更，资料差异待人工核对。',
      createdAt: '2026-06-18 15:22', updatedAt: '2026-09-15 10:12',
      industrySource: '工商查询服务', industryQueriedAt: '2026-09-15 10:05', industryState: '有差异',
      contactsCount: 1, oppsCount: 1
    },
    {
      id: 'CUS-202609-0005', name: '王建国', alias: '',
      type: '自然人客户', status: '正常', identity: '未核验',
      creditCode: '', creditMissing: false,
      value: '机会', valueReview: '已复核', valueAdjustedAt: '2026-07-30', valueReviewer: '王栩',
      legalPerson: '', regCapital: '', foundDate: '', industry: '',
      businessScope: '',
      source: '销售挖掘', remark: '个人身份交易；0.1 不采集完整身份证号。',
      createdAt: '2026-07-30 11:40', updatedAt: '2026-07-30 11:40',
      industrySource: '', industryQueriedAt: '', industryState: '未查询',
      contactsCount: 0, oppsCount: 0
    },
    {
      id: 'CUS-202609-0006', name: '上海远驰汽车科技（上海）有限公司', alias: '',
      type: '组织客户', status: '正常', identity: '未核验',
      creditCode: '91310115MA1K3XY07T', creditMissing: false,
      value: '', valueReview: '', valueAdjustedAt: '', valueReviewer: '',
      legalPerson: '赵敏', regCapital: '5,000 万元', foundDate: '2016-04-12', industry: '汽车零部件及配件制造',
      businessScope: '', source: '人工录入',
      remark: '新建客户示例。',
      createdAt: '2026-08-14 09:02', updatedAt: '2026-09-05 14:20',
      industrySource: '', industryQueriedAt: '', industryState: '未查询',
      contactsCount: 0, oppsCount: 0
    },
    {
      id: 'CUS-202609-0007', name: '杭州齐远汽车科技有限公司', alias: '齐远科技',
      type: '组织客户', status: '正常', identity: '已核验',
      creditCode: '91330106MA2GXQ8B5N', creditMissing: false,
      value: '', valueReview: '', valueAdjustedAt: '', valueReviewer: '',
      legalPerson: '孙倩', regCapital: '800 万元', foundDate: '2021-11-05', industry: '汽车零部件及配件制造',
      businessScope: '汽车零部件研发与销售；汽车后市场服务。',
      source: '人工录入', remark: '原有经营关系全部停止，当前在全国公海待分配。',
      createdAt: '2026-07-02 10:18', updatedAt: '2026-09-10 09:00',
      industrySource: '工商查询服务', industryQueriedAt: '2026-09-10 08:58', industryState: '正常成功',
      contactsCount: 1, oppsCount: 1
    },
    {
      id: 'CUS-202609-0008', name: '广州盈川新能源科技有限公司', alias: '',
      type: '组织客户', status: '正常', identity: '未核验',
      creditCode: '91440101MA9W1Q4T6P', creditMissing: false,
      value: '普通', valueReview: '待复核', valueAdjustedAt: '2026-08-22', valueReviewer: '',
      legalPerson: '刘维', regCapital: '3,000 万元', foundDate: '2019-02-14', industry: '电气机械和器材制造',
      businessScope: '新能源汽车电附件销售；充电桩制造。',
      source: '销售挖掘', remark: '盈川集团成员主体，价值单独评定，集团等级不继承。',
      createdAt: '2026-05-20 13:36', updatedAt: '2026-08-22 15:10',
      industrySource: '工商查询服务', industryQueriedAt: '2026-08-22 15:05', industryState: '正常成功',
      contactsCount: 0, oppsCount: 0
    },
    {
      id: 'CUS-202609-0009', name: '宁波启途汽车电子有限公司', alias: '启途电子',
      type: '组织客户', status: '正常', identity: '已核验', creditCode: '91330212MA2DEMO91X', creditMissing: false,
      value: '重点', valueReview: '已复核', valueAdjustedAt: '2026-09-08', valueReviewer: '王栩',
      legalPerson: '林晨', regCapital: '2,000 万元', foundDate: '2020-03-18', industry: '汽车电子', businessScope: '车载电子系统研发与销售。',
      source: '销售挖掘', remark: '演示「我协作的」客户。', createdAt: '2026-08-12 09:30', updatedAt: '2026-09-19 14:20',
      industrySource: '工商查询服务', industryQueriedAt: '2026-09-18 09:00', industryState: '正常成功', contactsCount: 1, oppsCount: 1
    },
    {
      id: 'CUS-202609-0010', name: '深圳驰绿能源科技有限公司', alias: '驰绿能源',
      type: '组织客户', status: '正常', identity: '未核验', creditCode: '91440300MA5DEMO10P', creditMissing: false,
      value: '普通', valueReview: '待复核', valueAdjustedAt: '2026-09-17', valueReviewer: '',
      legalPerson: '张可', regCapital: '1,500 万元', foundDate: '2021-06-09', industry: '新能源设备', businessScope: '充换电设备研发与运营。',
      source: '线索转换', remark: '演示「我协作的」与团队范围客户。', createdAt: '2026-09-02 11:10', updatedAt: '2026-09-20 10:15',
      industrySource: '工商查询服务', industryQueriedAt: '2026-09-17 16:20', industryState: '正常成功', contactsCount: 1, oppsCount: 0
    },
    {
      id: 'CUS-202609-0011', name: '无锡诺行车务服务有限公司', alias: '诺行车务',
      type: '组织客户', status: '正常', identity: '已核验', creditCode: '91320214MA2DEMO11R', creditMissing: false,
      value: '机会', valueReview: '待复核', valueAdjustedAt: '2026-09-19', valueReviewer: '',
      legalPerson: '周帆', regCapital: '600 万元', foundDate: '2022-01-21', industry: '汽车服务', businessScope: '企业车队维保与车务运营。',
      source: '人工录入', remark: '演示「我负责的」新增客户。', createdAt: '2026-09-19 09:40', updatedAt: '2026-09-21 15:30',
      industrySource: '工商查询服务', industryQueriedAt: '2026-09-19 09:38', industryState: '正常成功', contactsCount: 0, oppsCount: 0
    },
    {
      id: 'CUS-202609-0012', name: '中瑞数科演示客户', alias: '中瑞数科',
      type: '组织客户', status: '正常', identity: '已核验', creditCode: '91310000DEMO0012XR', creditMissing: false,
      value: '重点', valueReview: '待复核', valueAdjustedAt: '2026-09-20', valueReviewer: '',
      legalPerson: '李明', regCapital: '5,000 万元', foundDate: '2020-05-18', industry: '软件和信息技术服务',
      businessScope: '数字化平台研发；企业信息化咨询；数据服务与智能应用实施。',
      source: '人工录入', remark: '客户模块全量页签演示数据，用于联合评审与回归验收。',
      createdAt: '2026-09-18 09:30', updatedAt: '2026-09-22 11:30',
      industrySource: '工商查询服务', industryQueriedAt: '2026-09-22 11:20', industryState: '正常成功',
      contactsCount: 1, oppsCount: 1
    }
  ];

  /* --------------------------------------------------------- 客户价值变更历史 */

  var valueHistory = [
    { id: 'VH-0001', customerId: 'CUS-202609-0001', action: '设置', from: '', to: '战略', reason: '集团级战略供应商，年度框架采购规模明确', operator: '张岚', at: '2026-06-01 09:20' },
    { id: 'VH-0002', customerId: 'CUS-202609-0001', action: '复核确认', from: '战略', to: '战略', reason: '同意销售判断', operator: '王栩', at: '2026-08-28 10:05' },
    { id: 'VH-0003', customerId: 'CUS-202609-0004', action: '调整', from: '机会', to: '普通', reason: '合作体量上升，调整为公司级普通客户', operator: '张岚', at: '2026-09-15 10:12' },
    { id: 'VH-0004', customerId: 'CUS-202609-0002', action: '复核确认', from: '重点', to: '重点', reason: '集团层面战略匹配度高', operator: '王栩', at: '2026-08-19 16:30' }
    ,{ id: 'VH-0005', customerId: 'CUS-202609-0012', action: '调整', from: '普通', to: '重点', reason: '数字化项目已进入方案验证，提升客户价值等级', operator: '张岚', at: '2026-09-20 14:10' }
  ];

  /* ------------------------------------------------------------------ 地址 */

  var addresses = [
    { id: 'ADR-202609-0001', ownerType: '客户', ownerId: 'CUS-202609-0001', type: '注册地址', region: '上海市·上海市·浦东新区', detail: '金桥路 1288 号 A 座 12 层', source: '工商查询服务', createdAt: '2026-05-11 10:24' },
    { id: 'ADR-202609-0002', ownerType: '客户', ownerId: 'CUS-202609-0001', type: '办公地址', region: '上海市·上海市·浦东新区', detail: '金桥路 1288 号 A 座 15 层', source: '销售核实', createdAt: '2026-05-12 09:30' },
    { id: 'ADR-202609-0003', ownerType: '客户', ownerId: 'CUS-202609-0001', type: '经营地址', region: '上海市·上海市·浦东新区', detail: '金桥路 1288 号 B 座 1 层展厅', source: '销售核实', createdAt: '2026-05-12 09:32' },
    { id: 'ADR-202609-0004', ownerType: '客户', ownerId: 'CUS-202609-0001', type: '项目／服务地址', region: '上海市·上海市·嘉定区', detail: '安亭镇曹安公路 4800 号厂区', source: '客户提供', createdAt: '2026-07-08 14:00' },
    { id: 'ADR-202609-0005', ownerType: '客户', ownerId: 'CUS-202609-0002', type: '注册地址', region: '广东省·广州市·天河区', detail: '珠江新城华夏路 30 号 21 层', source: '工商查询服务', createdAt: '2026-04-02 09:10' },
    { id: 'ADR-202609-0006', ownerType: '客户', ownerId: 'CUS-202609-0004', type: '办公地址', region: '江苏省·苏州市·工业园区', detail: '苏惠路 98 号 6 幢 3 层', source: '销售核实', createdAt: '2026-06-18 15:24' },
    { id: 'ADR-202609-0007', ownerType: '客户', ownerId: 'CUS-202609-0003', type: '经营地址', region: '上海市·上海市·闵行区', detail: '莘庄镇莘松路 385 号', source: '销售核实', createdAt: '2026-08-30 14:08' },
    { id: 'ADR-202609-0010', ownerType: '联系人', ownerId: 'CON-202609-0001', type: '联系地址', region: '上海市·上海市·浦东新区', detail: '金桥路 1288 号 A 座 12 层', source: '销售核实', createdAt: '2026-06-03 11:20' }
    ,{ id: 'ADR-202609-0011', ownerType: '客户', ownerId: 'CUS-202609-0012', type: '注册地址', region: '上海市·上海市·徐汇区', detail: '宜山路 700 号中瑞数字大厦 18 层', source: '工商查询服务', createdAt: '2026-09-18 09:30' },
    { id: 'ADR-202609-0012', ownerType: '客户', ownerId: 'CUS-202609-0012', type: '办公地址', region: '上海市·上海市·徐汇区', detail: '桂林路 406 号创新中心 6 号楼', source: '销售核实', createdAt: '2026-09-19 10:10' }
  ];

  /* ---------------------------------------------------------------- 联系人 */

  var contacts = [
    { id: 'CON-202609-0001', name: '赵敏', phone: '138****6021', phonePlain: '13800006021', phones: ['13800006021', '13900006022'], wechat: 'zhaomin_auto', wechats: ['zhaomin_auto', 'zhaomin_work'], email: 'zhaomin@example-demo.com', title: '采购总监', org: '上海远驰汽车科技有限公司', addressId: 'ADR-202609-0010', createdAt: '2026-05-11 10:30', lastContactAt: '2026-09-18 15:00' },
    { id: 'CON-202609-0002', name: '孙倩', phone: '139****3388', phonePlain: '13900003388', wechat: '', email: 'sunqian@example-demo.com', title: '财务经理', org: '上海远驰汽车科技有限公司', addressId: '', createdAt: '2026-06-03 11:05', lastContactAt: '2026-09-12 10:20' },
    { id: 'CON-202609-0003', name: '刘维', phone: '137****9910', phonePlain: '13700009910', wechat: 'liuwei_tech', email: '', title: '技术负责人', org: '苏州弘远车务有限公司', addressId: '', createdAt: '2026-06-18 15:30', lastContactAt: '2026-09-15 09:40' },
    { id: 'CON-202609-0004', name: '周敏', phone: '136****7742', phonePlain: '13600007742', wechat: '', email: '', title: '运营负责人', org: '杭州齐远汽车科技有限公司', addressId: '', createdAt: '2026-07-02 10:40', lastContactAt: '2026-08-20 14:10' }
    ,{ id: 'CON-202609-0005', name: '陈思远', phone: '135****2816', phonePlain: '13500002816', wechat: 'chensiyuan_demo', email: 'chensiyuan@example-demo.com', title: '数字化项目总监', org: '中瑞数科演示客户', addressId: '', createdAt: '2026-09-18 10:00', lastContactAt: '2026-09-22 10:30' }
  ];

  var contactRelations = [
    { id: 'CR-0001', contactId: 'CON-202609-0001', customerId: 'CUS-202609-0001', roles: ['决策', '采购'], dept: '采购中心', title: '采购总监', primary: true, status: '有效', from: '2026-05-11' },
    { id: 'CR-0002', contactId: 'CON-202609-0001', customerId: 'CUS-202609-0007', roles: ['影响'], dept: '总经理办公室', title: '顾问', primary: false, status: '有效', from: '2026-08-06' },
    { id: 'CR-0003', contactId: 'CON-202609-0002', customerId: 'CUS-202609-0001', roles: ['财务'], dept: '财务部', title: '财务经理', primary: false, status: '有效', from: '2026-06-03' },
    { id: 'CR-0004', contactId: 'CON-202609-0003', customerId: 'CUS-202609-0004', roles: ['技术', '影响'], dept: '技术部', title: '技术负责人', primary: true, status: '有效', from: '2026-06-18' },
    { id: 'CR-0005', contactId: 'CON-202609-0004', customerId: 'CUS-202609-0007', roles: ['使用'], dept: '运营部', title: '运营负责人', primary: true, status: '失效', from: '2026-07-02', to: '2026-08-20' }
    ,{ id: 'CR-0006', contactId: 'CON-202609-0005', customerId: 'CUS-202609-0012', roles: ['决策', '技术'], dept: '数字化中心', title: '数字化项目总监', primary: true, status: '有效', from: '2026-09-18' }
  ];

  /* ------------------------------------------------------------ 客户关系网 */

  var customerNetworks = [
    { id: 'CREL-202609-0001', sourceId: 'CUS-202609-0002', targetId: 'CUS-202609-0008', type: '集团关系', label: '集团总部', note: '盈川集团与成员企业的关系说明。', operator: '周珂', updatedAt: '2026-05-20 13:40' },
    { id: 'CREL-202609-0002', sourceId: 'CUS-202609-0001', targetId: 'CUS-202609-0004', type: '总分关系', label: '总公司', note: '弘远车务为远驰在苏州的分支机构。', operator: '周珂', updatedAt: '2026-07-11 09:15' },
    { id: 'CREL-202609-0003', sourceId: 'CUS-202609-0002', targetId: 'CUS-202609-0012', type: '集团关系', label: '集团总部', note: '中瑞数科与盈川集团的集团成员关系，具体控制背景见内部核验材料。', operator: '周珂', updatedAt: '2026-09-18 11:00' },
    { id: 'CREL-202609-0004', sourceId: 'CUS-202609-0012', targetId: 'CUS-202609-0001', type: '上游', label: '服务商', note: '远驰为中瑞数科数字化项目提供车辆数据服务。', operator: '周珂', updatedAt: '2026-09-20 10:30' },
    { id: 'CREL-202609-0005', sourceId: 'CUS-202609-0012', targetId: 'CUS-202609-0010', type: '下游', label: '渠道商', note: '驰绿能源负责华南渠道推广与线索转介。', operator: '周珂', updatedAt: '2026-09-21 15:20' }
  ];

  /* --------------------------------------------- 客户—区域—业务线经营关系 CBL */

  var businessRelations = [
    { id: 'CBL-202609-0001', customerId: 'CUS-202609-0001', customerName: '上海远驰汽车科技有限公司', region: 'RG-EAST', businessLine: 'BL-CE', status: '有效', owner: 'U-001', collaborators: ['U-002'], poolRecordId: '', protectUntil: '', lastActivityAt: '2026-09-18', createdAt: '2026-06-01' },
    { id: 'CBL-202609-0002', customerId: 'CUS-202609-0001', customerName: '上海远驰汽车科技有限公司', region: 'RG-EAST', businessLine: 'BL-CW', status: '有效', owner: 'U-002', collaborators: [], poolRecordId: '', protectUntil: '', lastActivityAt: '2026-09-12', createdAt: '2026-06-10' },
    { id: 'CBL-202609-0003', customerId: 'CUS-202609-0002', customerName: '广州盈川新能源集团有限公司', region: 'RG-EAST', businessLine: 'BL-XNY', status: '有效', owner: 'U-002', collaborators: ['U-001'], poolRecordId: '', protectUntil: '', lastActivityAt: '2026-09-16', createdAt: '2026-05-08' },
    { id: 'CBL-202609-0004', customerId: 'CUS-202609-0002', customerName: '广州盈川新能源集团有限公司', region: 'RG-SOUTH', businessLine: 'BL-CW', status: '停止经营', owner: '', collaborators: [], poolRecordId: '', protectUntil: '', lastActivityAt: '2026-08-02', createdAt: '2026-05-08' },
    { id: 'CBL-202609-0005', customerId: 'CUS-202609-0004', customerName: '苏州弘远车务有限公司', region: 'RG-EAST', businessLine: 'BL-CW', status: '停止经营', owner: '', collaborators: [], poolRecordId: '', protectUntil: '', lastActivityAt: '2026-08-30', createdAt: '2026-06-18' },
    { id: 'CBL-202609-0006', customerId: 'CUS-202609-0007', customerName: '杭州齐远汽车科技有限公司', region: 'RG-EAST', businessLine: 'BL-XNY', status: '停止经营', owner: '', collaborators: [], poolRecordId: '', protectUntil: '', lastActivityAt: '2026-08-20', createdAt: '2026-07-02' },
    { id: 'CBL-202609-0008', customerId: 'CUS-202609-0005', customerName: '王建国', region: 'RG-EAST', businessLine: 'BL-CE', status: '有效', owner: 'U-001', collaborators: [], poolRecordId: '', protectUntil: '', lastActivityAt: '2026-09-05', createdAt: '2026-09-05' },
    { id: 'CBL-202609-0007', customerId: 'CUS-202609-0003', customerName: '上海栖达汽车服务部', region: 'RG-EAST', businessLine: 'BL-CW', status: '有效', owner: 'U-001', collaborators: [], poolRecordId: '', protectUntil: '2026-09-24', lastActivityAt: '2026-09-12', createdAt: '2026-09-17' },
    { id: 'CBL-202609-0009', customerId: 'CUS-202609-0009', customerName: '宁波启途汽车电子有限公司', region: 'RG-EAST', businessLine: 'BL-CE', status: '有效', owner: 'U-002', collaborators: ['U-001'], poolRecordId: '', protectUntil: '', lastActivityAt: '2026-09-19', createdAt: '2026-08-12' },
    { id: 'CBL-202609-0010', customerId: 'CUS-202609-0010', customerName: '深圳驰绿能源科技有限公司', region: 'RG-SOUTH', businessLine: 'BL-XNY', status: '有效', owner: 'U-002', collaborators: ['U-001'], poolRecordId: '', protectUntil: '', lastActivityAt: '2026-09-20', createdAt: '2026-09-02' },
    { id: 'CBL-202609-0011', customerId: 'CUS-202609-0011', customerName: '无锡诺行车务服务有限公司', region: 'RG-EAST', businessLine: 'BL-CW', status: '有效', owner: 'U-001', collaborators: [], poolRecordId: '', protectUntil: '', lastActivityAt: '2026-09-21', createdAt: '2026-09-19' },
    { id: 'CBL-202609-0012', customerId: 'CUS-202609-0008', customerName: '广州盈川新能源科技有限公司', region: 'RG-SOUTH', businessLine: 'BL-XNY', status: '有效', owner: 'U-002', collaborators: [], poolRecordId: '', protectUntil: '', lastActivityAt: '2026-09-18', createdAt: '2026-05-20' }
    ,{ id: 'CBL-202609-0013', customerId: 'CUS-202609-0012', customerName: '中瑞数科演示客户', region: 'RG-EAST', businessLine: 'BL-CE', status: '有效', owner: 'U-001', collaborators: ['U-002'], poolRecordId: '', protectUntil: '', lastActivityAt: '2026-09-22', createdAt: '2026-09-18' }
    ,{ id: 'CBL-H5-0001', customerId: 'CUS-202609-0012', customerName: '中瑞数科演示客户', region: 'RG-EAST', businessLine: 'BL-CW', status: '有效', owner: 'U-003', collaborators: [], poolRecordId: '', protectUntil: '', lastActivityAt: '2026-10-11', createdAt: '2026-10-11' }
  ];

  /* ------------------------------------------- 全国公海占用记录 CPH（唯一池） */

  var poolRecords = [
    { id: 'CPH-202609-0001', customerId: 'CUS-202609-0007', customerName: '杭州齐远汽车科技有限公司', customerType: '组织客户', customerValue: '', status: '有效', entryAt: '2026-09-10 09:00', entryReason: '最后一条有效经营关系停止', entryNote: '原负责人转岗', lastActivityAt: '2026-08-20', claimable: true, previousRelationIds: ['CBL-202609-0006'] },
    { id: 'CPH-202609-0002', customerId: 'CUS-202609-0004', customerName: '苏州弘远车务有限公司', customerType: '组织客户', customerValue: '', status: '有效', entryAt: '2026-08-30 15:20', entryReason: '最后一条有效经营关系停止', entryNote: '续约经营结束', lastActivityAt: '2026-08-30', claimable: true, previousRelationIds: ['CBL-202609-0005'] }
  ];

  /* ---------------------------------------------------------------- 线索池 */

  var leadPools = [
    { id: 'LP-01', code: 'POOL-CE', name: '车电线索池', status: '启用', members: ['U-001', 'U-002'], allowClaim: true, holdLimit: 20, protectEnabled: true, protectDays: 7, returnEnabled: true, returnPool: 'POOL-CE' },
    { id: 'LP-02', code: 'POOL-XNY', name: '新能源线索池', status: '启用', members: ['U-002', 'U-001'], allowClaim: true, holdLimit: 15, protectEnabled: true, protectDays: 14, returnEnabled: true, returnPool: 'POOL-XNY' },
    { id: 'LP-03', code: 'POOL-CW', name: '车务线索池', status: '停止接收', members: ['U-001'], allowClaim: false, holdLimit: 10, protectEnabled: false, protectDays: 0, returnEnabled: false, returnPool: '' }
  ];

  /* ------------------------------------------------------------------ 线索 */

  var leads = [
    {
      id: 'LED-202609-0137', raw: '远驰科技二期车电项目，客户计划 10 月启动选型，预算区间待确认，赵敏为对接人。',
      source: '市场活动', sourceRecord: '人工录入', status: '跟进中',
      customerId: 'CUS-202609-0001', contactId: 'CON-202609-0001', phone: '13800006021',
      contactName: '赵敏', salesRegionProvince: '上海市', salesRegionCity: '上海市',
      candidateLines: ['BL-CE'], candidateProducts: [],
      currentPool: '', sourcePool: 'POOL-CE', owner: 'U-001',
      protectUntil: '2026-09-27 22:00', nextAction: '提交一版技术方案初稿并约现场交流', nextFollowUp: '2026-09-23 10:00', lastFollowUpAt: '2026-09-18 15:00',
      createdAt: '2026-09-14 09:20', createdBy: 'U-001'
    },
    {
      id: 'LED-202609-0138', raw: '盈川新能源集采咨询，来自老客户转介绍，尚未确认具体采购主体。',
      source: '转介绍', sourceRecord: '人工录入', status: '待处理',
      customerId: '', contactId: '', phone: '',
      contactName: '周先生', salesRegionProvince: '广东省', salesRegionCity: '广州市',
      candidateLines: ['BL-XNY'], candidateProducts: [],
      currentPool: 'POOL-XNY', sourcePool: '', owner: '',
      protectUntil: '', nextAction: '', nextFollowUp: '', lastFollowUpAt: '',
      createdAt: '2026-09-19 11:05', createdBy: 'U-002'
    },
    {
      id: 'LED-202609-0139', raw: '栖达服务部计划新增两个服务点，需求时间未明确，需等对方年度预算。',
      source: '销售挖掘', sourceRecord: '人工录入', status: '跟进中',
      customerId: 'CUS-202609-0003', contactId: '', phone: '',
      salesRegionProvince: '上海市', salesRegionCity: '上海市',
      candidateLines: ['BL-CW'], candidateProducts: [],
      currentPool: '', sourcePool: 'POOL-CW', owner: 'U-002',
      protectUntil: '', nextAction: '确认客户年度预算及服务点启动时间', nextFollowUp: '2026-10-15 10:00', lastFollowUpAt: '2026-08-30 14:20',
      createdAt: '2026-08-30 14:10', createdBy: 'U-002'
    },
    {
      id: 'LED-202609-0140', raw: '某汽车城车务合作线索，与既有线索指向同一主体。',
      source: '外部名单', sourceRecord: '批量导入', status: '无效',
      customerId: '', contactId: '', phone: '',
      candidateLines: ['BL-CW'], candidateProducts: [],
      currentPool: '', sourcePool: '', owner: 'U-001',
      protectUntil: '', nextAction: '', nextFollowUp: '', lastFollowUpAt: '',
      invalidReason: '重复线索', duplicateOf: 'LED-202609-0137',
      createdAt: '2026-08-21 16:40', createdBy: 'U-001'
    },
    {
      id: 'LED-202609-0141', raw: '弘远车务续约信号，明确车务业务线年度续约，已完成转换。',
      source: '纷享销客迁移', sourceRecord: '受控试迁移', status: '已转化',
      customerId: 'CUS-202609-0004', contactId: 'CON-202609-0003', phone: '13700009910',
      contactName: '刘维', salesRegionProvince: '江苏省', salesRegionCity: '苏州市',
      candidateLines: ['BL-CW'], candidateProducts: [],
      currentPool: '', sourcePool: 'POOL-CW', owner: 'U-001',
      protectUntil: '', nextAction: '', nextFollowUp: '', lastFollowUpAt: '2026-07-20 10:00',
      convertAt: '2026-07-22 09:30', convertBy: 'U-001',
      convertTargets: ['CUS-202609-0004', 'CON-202609-0003', 'OPP-202609-0045'],
      createdAt: '2026-07-18 09:00', createdBy: 'U-001'
    }
  ];

  /* -------------------------------------------------- 流程模板与统一阶段库 */

  var unifiedStages = ['机会确认', '需求确认', '方案验证', '报价与审批', '商务与合同'];

  var templates = [
    {
      code: 'TPL-CE-STD', version: 'v3', name: '车电业务线·标准销售流程',
      businessLine: 'BL-CE', scene: 'SC-STD', status: '生效', publishedAt: '2026-08-01 10:00', stagnantDays: 14,
      stages: [
        { code: 'ST-CE-01', name: '商机资格确认', unified: '机会确认', requiredFields: [], requiredTasks: [], tasks: [] },
        { code: 'ST-CE-02', name: '客户需求初访', unified: '需求确认', requiredFields: ['CF-BUDGET'], requiredTasks: [], tasks: [] },
        { code: 'ST-CE-03', name: '需求范围确认', unified: '需求确认', requiredFields: [], requiredTasks: ['T-需求范围确认书'], tasks: [{ title: '输出需求范围确认书', desc: '与客户确认需求边界并留存过程记录', must: true, dueDays: 5 }] },
        { code: 'ST-CE-04', name: '方案交流', unified: '方案验证', requiredFields: [], requiredTasks: [], tasks: [{ title: '组织方案交流会议', desc: '完成一次方案讲解并记录客户反馈', must: false, dueDays: 7 }] },
        { code: 'ST-CE-05', name: '报价提交', unified: '报价与审批', requiredFields: ['CF-PURCHASE-MODE'], requiredTasks: [], tasks: [] },
        { code: 'ST-CE-06', name: '内部审批', unified: '报价与审批', requiredFields: [], requiredTasks: [], tasks: [{ title: '提交内部价格审批', desc: '按公司价格审批流程提交', must: true, dueDays: 3 }] },
        { code: 'ST-CE-07', name: '商务谈判', unified: '商务与合同', requiredFields: [], requiredTasks: [], tasks: [] },
        { code: 'ST-CE-08', name: '合同签署', unified: '商务与合同', requiredFields: [], requiredTasks: [], tasks: [] }
      ]
    },
    {
      code: 'TPL-XNY-PROJ', version: 'v2', name: '新能源业务线·项目制流程',
      businessLine: 'BL-XNY', scene: 'SC-PROJ-X', status: '生效', publishedAt: '2026-07-15 09:00', stagnantDays: 21,
      stages: [
        { code: 'ST-XNY-01', name: '商机资格确认', unified: '机会确认', requiredFields: [], requiredTasks: [], tasks: [] },
        { code: 'ST-XNY-02', name: '需求范围确认', unified: '需求确认', requiredFields: [], requiredTasks: [], tasks: [{ title: '输出项目需求清单', desc: '形成客户确认的需求清单', must: true, dueDays: 7 }] },
        { code: 'ST-XNY-03', name: '产品测试／验证（POC）', unified: '方案验证', requiredFields: [], requiredTasks: [], tasks: [{ title: '完成 POC 验证报告', desc: '记录验证结论与遗留问题', must: true, dueDays: 15 }] },
        { code: 'ST-XNY-04', name: '投标／采购响应', unified: '方案验证', requiredFields: [], requiredTasks: [], tasks: [] },
        { code: 'ST-XNY-05', name: '报价提交', unified: '报价与审批', requiredFields: ['CF-BUDGET'], requiredTasks: [], tasks: [] },
        { code: 'ST-XNY-06', name: '商务谈判', unified: '商务与合同', requiredFields: [], requiredTasks: [], tasks: [] },
        { code: 'ST-XNY-07', name: '合同签署', unified: '商务与合同', requiredFields: [], requiredTasks: [], tasks: [] }
      ]
    },
    {
      code: 'TPL-CE-PROJ', version: 'v1', name: '车电业务线·项目制流程',
      businessLine: 'BL-CE', scene: 'SC-PROJ', status: '生效', publishedAt: '2026-08-20 14:00', stagnantDays: 14,
      stages: [
        { code: 'ST-CEP-01', name: '商机资格确认', unified: '机会确认', requiredFields: [], requiredTasks: [], tasks: [] },
        { code: 'ST-CEP-02', name: '需求范围确认', unified: '需求确认', requiredFields: [], requiredTasks: [], tasks: [] },
        { code: 'ST-CEP-03', name: '投标／采购响应', unified: '方案验证', requiredFields: [], requiredTasks: [], tasks: [{ title: '完成投标文件提交', desc: '按客户要求提交投标响应文件', must: true, dueDays: 10 }] },
        { code: 'ST-CEP-04', name: '报价提交', unified: '报价与审批', requiredFields: [], requiredTasks: [], tasks: [] },
        { code: 'ST-CEP-05', name: '商务谈判', unified: '商务与合同', requiredFields: [], requiredTasks: [], tasks: [] }
      ]
    },
    {
      code: 'TPL-CW-STD', version: 'v1', name: '车务业务线·标准销售流程',
      businessLine: 'BL-CW', scene: 'SC-STD-W', status: '生效', publishedAt: '2026-06-01 09:00', stagnantDays: 14,
      stages: [
        { code: 'ST-CW-01', name: '商机资格确认', unified: '机会确认', requiredFields: [], requiredTasks: [], tasks: [] },
        { code: 'ST-CW-02', name: '客户需求初访', unified: '需求确认', requiredFields: [], requiredTasks: [], tasks: [] },
        { code: 'ST-CW-03', name: '方案交流', unified: '方案验证', requiredFields: [], requiredTasks: [], tasks: [] },
        { code: 'ST-CW-04', name: '报价提交', unified: '报价与审批', requiredFields: [], requiredTasks: [], tasks: [] }
      ]
    },
    {
      code: 'TPL-XNY-IN', version: 'v1', name: '新能源业务线·入围流程',
      businessLine: 'BL-XNY', scene: 'SC-RW', status: '生效', publishedAt: '2026-07-01 09:00', stagnantDays: 21,
      stages: [
        { code: 'ST-IN-01', name: '供应商入围申请', unified: '机会确认', requiredFields: [], requiredTasks: [], tasks: [] },
        { code: 'ST-IN-02', name: '入围评审／结果', unified: '需求确认', requiredFields: [], requiredTasks: [], tasks: [] },
        { code: 'ST-IN-03', name: '报价提交', unified: '报价与审批', requiredFields: [], requiredTasks: [], tasks: [] }
      ]
    },
    {
      code: 'TPL-XNY-STD', version: 'v1', name: '新能源业务线·标准销售流程',
      businessLine: 'BL-XNY', scene: 'SC-STD-X', status: '停用', publishedAt: '2026-05-01 09:00', stagnantDays: 14,
      stages: [
        { code: 'ST-XS-01', name: '商机资格确认', unified: '机会确认', requiredFields: [], requiredTasks: [], tasks: [] },
        { code: 'ST-XS-02', name: '客户需求初访', unified: '需求确认', requiredFields: [], requiredTasks: [], tasks: [] }
      ]
    }
  ];

  /* -------------------------------------------------------- 商机自定义字段 */

  var customFields = [
    { code: 'CF-BUDGET', name: '客户预算区间', type: '单选', businessLines: [], status: '启用', options: [
      { code: 'B1', name: '100 万以下' }, { code: 'B2', name: '100–500 万' }, { code: 'B3', name: '500–1000 万' }, { code: 'B4', name: '1000 万以上' }
    ] },
    { code: 'CF-PURCHASE-MODE', name: '采购方式', type: '单选', businessLines: [], status: '启用', options: [
      { code: 'P1', name: '直接采购' }, { code: 'P2', name: '招标采购' }, { code: 'P3', name: '框架协议' }
    ] },
    { code: 'CF-PROJECT-NO', name: '客户内部项目编号', type: '单行文本', businessLines: [], status: '启用', options: [] },
    { code: 'CF-ONLINE-ROWS', name: '预计上线条数', type: '数字', businessLines: ['BL-XNY'], status: '启用', options: [] }
  ];

  /* ------------------------------------------------------------------ 商机 */

  var opportunities = [
    {
      id: 'OPP-202609-0042', name: '远驰科技 2026 年度车电框架采购', customerId: 'CUS-202609-0001', salesRegionProvince: '上海市', salesRegionCity: '上海市',
      owner: 'U-001', processStatus: '进行中', templateCode: 'TPL-CE-STD', templateVersion: 'v3',
      currentStageCode: 'ST-CE-02', predictedClose: '2026-11-30',
      nextAction: '安排需求范围确认会议', nextActionAt: '2026-09-24',
      lines: [
        { code: 'OBL-0001', businessLine: 'BL-CE', role: '主业务线', scene: 'SC-STD', scope: '车电零部件年度框架供货', status: '当前参与' },
        { code: 'OBL-0002', businessLine: 'BL-CW', role: '协同业务线', scene: '', scope: '配套车务服务随框架一并洽谈', status: '当前参与' }
      ],
      team: [
        { userId: 'U-001', role: '主负责人' },
        { userId: 'U-002', role: '协同销售' },
        { userId: 'U-004', role: '方案' }
      ],
      custom: { 'CF-BUDGET': 'B3', 'CF-PURCHASE-MODE': 'P2', 'CF-PROJECT-NO': 'YCH-2026-EE-1102' },
      stageHistory: [
        { from: '', to: 'ST-CE-01', at: '2026-08-06 10:12', by: 'U-001', note: '创建商机，自动进入首个详细阶段' },
        { from: 'ST-CE-01', to: 'ST-CE-02', at: '2026-09-12 14:30', by: 'U-001', note: '预计成交时间已补齐，推进至客户需求初访' }
      ],
      stageEnteredAt: '2026-09-12 14:30',
      source: '来源线索 LED-202609-0137',
      closeResult: '', closeBasis: '', closeReason: '', closeNote: '', closedAt: '', closedBy: '',
      createdAt: '2026-08-06 10:12', updatedAt: '2026-09-12 14:30'
    },
    {
      id: 'OPP-202609-0043', name: '盈川新能源集采项目', customerId: 'CUS-202609-0002', salesRegionProvince: '广东省', salesRegionCity: '广州市',
      owner: 'U-002', processStatus: '进行中', templateCode: 'TPL-XNY-PROJ', templateVersion: 'v2',
      currentStageCode: 'ST-XNY-03', predictedClose: '2026-12-20',
      nextAction: '等待客户预算批复', nextActionAt: '2026-10-15',
      sleepReason: '客户年度预算未批复，项目暂缓', sleepReviewAt: '2026-10-15', sleepAt: '2026-09-08 09:40', sleepBy: 'U-002',
      lines: [
        { code: 'OBL-0003', businessLine: 'BL-XNY', role: '主业务线', scene: 'SC-PROJ-X', scope: '充电设施集采与 POC 验证', status: '当前参与' }
      ],
      team: [{ userId: 'U-002', role: '主负责人' }, { userId: 'U-003', role: '交付' }],
      custom: { 'CF-BUDGET': 'B4', 'CF-ONLINE-ROWS': '120' },
      stageHistory: [
        { from: '', to: 'ST-XNY-01', at: '2026-06-20 09:00', by: 'U-002', note: '创建商机' },
        { from: 'ST-XNY-01', to: 'ST-XNY-02', at: '2026-07-08 10:20', by: 'U-002', note: '' },
        { from: 'ST-XNY-02', to: 'ST-XNY-03', at: '2026-08-14 15:00', by: 'U-002', note: '进入 POC 验证' },
        { from: 'ST-XNY-03', to: 'ST-XNY-03', at: '2026-09-08 09:40', by: 'U-002', note: '休眠：客户年度预算未批复' }
      ],
      stageEnteredAt: '2026-08-14 15:00',
      source: '直接创建',
      closeResult: '', closeBasis: '', closeReason: '', closeNote: '', closedAt: '', closedBy: '',
      createdAt: '2026-06-20 09:00', updatedAt: '2026-09-08 09:40'
    },
    {
      id: 'OPP-202609-0044', name: '齐远科技车务试点合作', customerId: 'CUS-202609-0007', salesRegionProvince: '浙江省', salesRegionCity: '杭州市',
      owner: 'U-001', processStatus: '进行中', templateCode: 'TPL-CW-STD', templateVersion: 'v1',
      currentStageCode: 'ST-CW-01', predictedClose: '',
      nextAction: '补齐预计成交时间', nextActionAt: '',
      lines: [{ code: 'OBL-0004', businessLine: 'BL-CW', role: '主业务线', scene: 'SC-STD-W', scope: '车务试点服务', status: '当前参与' }],
      team: [{ userId: 'U-001', role: '主负责人' }],
      custom: {},
      stageHistory: [{ from: '', to: 'ST-CW-01', at: '2026-09-11 11:20', by: 'U-001', note: '创建商机' }],
      stageEnteredAt: '2026-09-11 11:20',
      source: '直接创建',
      closeResult: '', closeBasis: '', closeReason: '', closeNote: '', closedAt: '', closedBy: '',
      createdAt: '2026-09-11 11:20', updatedAt: '2026-09-11 11:20'
    },
    {
      id: 'OPP-202609-0045', name: '弘远车务年度续约', customerId: 'CUS-202609-0004',
      owner: 'U-001', processStatus: '进行中', templateCode: 'TPL-CW-STD', templateVersion: 'v1',
      currentStageCode: 'ST-CW-03', predictedClose: '2026-08-31',
      nextAction: '', nextActionAt: '',
      lines: [{ code: 'OBL-0005', businessLine: 'BL-CW', role: '主业务线', scene: 'SC-STD-W', scope: '车务服务年度续约', status: '当前参与' }],
      team: [{ userId: 'U-001', role: '主负责人' }],
      custom: {},
      stageHistory: [
        { from: '', to: 'ST-CW-01', at: '2026-07-22 09:30', by: 'U-001', note: '由线索 LED-202609-0141 转换创建' },
        { from: 'ST-CW-01', to: 'ST-CW-02', at: '2026-07-30 10:00', by: 'U-001', note: '' },
        { from: 'ST-CW-02', to: 'ST-CW-03', at: '2026-08-08 14:00', by: 'U-001', note: '' }
      ],
      stageEnteredAt: '2026-08-08 14:00',
      source: '来源线索 LED-202609-0141',
      closeResult: '输单', closeBasis: '', closeReason: '价格', closeNote: '客户选择更低报价的竞争对手', closedAt: '2026-08-26 16:10', closedBy: 'U-001',
      createdAt: '2026-07-22 09:30', updatedAt: '2026-08-26 16:10'
    },
    {
      id: 'OPP-202609-0046', name: '中瑞数科智能销售平台项目', customerId: 'CUS-202609-0012',
      owner: 'U-001', processStatus: '进行中', templateCode: 'TPL-CE-STD', templateVersion: 'v3',
      currentStageCode: 'ST-CE-03', predictedClose: '2026-12-18',
      nextAction: '确认方案验证范围与数据接口清单', nextActionAt: '2026-09-26',
      lines: [{ code: 'OBL-0006', businessLine: 'BL-CE', role: '主业务线', scene: 'SC-STD', scope: '智能销售平台与数字化销售流程建设', status: '当前参与' }],
      team: [{ userId: 'U-001', role: '主负责人' }, { userId: 'U-002', role: '协同销售' }],
      custom: { 'CF-BUDGET': 'B3', 'CF-PURCHASE-MODE': 'P2', 'CF-PROJECT-NO': 'ZR-DIGITAL-2026-01' },
      stageHistory: [
        { from: '', to: 'ST-CE-01', at: '2026-09-18 14:00', by: 'U-001', note: '基于客户数字化需求创建商机' },
        { from: 'ST-CE-01', to: 'ST-CE-02', at: '2026-09-19 15:30', by: 'U-001', note: '已完成首次需求访谈' },
        { from: 'ST-CE-02', to: 'ST-CE-03', at: '2026-09-22 10:30', by: 'U-001', note: '进入需求范围确认' }
      ],
      stageEnteredAt: '2026-09-22 10:30', source: '直接创建',
      closeResult: '', closeBasis: '', closeReason: '', closeNote: '', closedAt: '', closedBy: '',
      createdAt: '2026-09-18 14:00', updatedAt: '2026-09-22 10:30'
    }
  ];

  /* ---------------------------------------------------------------- 阶段任务 */

  var stageTasks = [
    { id: 'TSK-202609-0051', oppId: 'OPP-202609-0042', templateVersion: 'TPL-CE-STD-v3', stageCode: 'ST-CE-02', title: '输出需求范围确认书', desc: '与客户确认需求边界并留存过程记录', must: true, due: '2026-09-17 23:59', status: '已完成', owner: 'U-001', generatedBy: '阶段进入事件 ST-CE-02 / 2026-09-12', enteredAt: '2026-09-12 14:30', assigneeChanged: false },
    { id: 'TSK-202609-0052', oppId: 'OPP-202609-0043', templateVersion: 'TPL-XNY-PROJ-v2', stageCode: 'ST-XNY-02', title: '输出项目需求清单', desc: '形成客户确认的需求清单', must: true, due: '2026-07-15 23:59', status: '已完成', owner: 'U-002', generatedBy: '阶段进入事件 ST-XNY-02 / 2026-07-08', enteredAt: '2026-07-08 10:20', assigneeChanged: false },
    { id: 'TSK-202609-0053', oppId: 'OPP-202609-0043', templateVersion: 'TPL-XNY-PROJ-v2', stageCode: 'ST-XNY-03', title: '完成 POC 验证报告', desc: '记录验证结论与遗留问题', must: true, due: '2026-08-29 23:59', status: '进行中', owner: 'U-002', generatedBy: '阶段进入事件 ST-XNY-03 / 2026-08-14', enteredAt: '2026-08-14 15:00', assigneeChanged: false, overdue: true },
    { id: 'TSK-202609-0054', oppId: 'OPP-202609-0043', templateVersion: 'TPL-XNY-PROJ-v2', stageCode: 'ST-XNY-03', title: '组织方案交流会议', desc: '完成一次方案讲解并记录客户反馈', must: false, due: '2026-08-21 23:59', status: '已失效', owner: 'U-002', generatedBy: '阶段进入事件 ST-XNY-03 / 2026-08-14', enteredAt: '2026-08-14 15:00', assigneeChanged: false }
  ];

  /* -------------------------------------------------- 销售活动（只读投影用） */

  var activities = [
    { id: 'ACT-202609-0088', type: '会议', at: '2026-09-18 15:00', summary: '与赵敏确认二期项目选型节奏，客户要求 10 月前提交方案初稿。', customerId: 'CUS-202609-0001', leadId: 'LED-202609-0137', oppId: 'OPP-202609-0042', actor: 'U-001' },
    { id: 'ACT-202609-0079', type: '电话', at: '2026-09-12 10:20', summary: '与孙倩核对框架采购付款条件。', customerId: 'CUS-202609-0001', leadId: '', oppId: 'OPP-202609-0042', actor: 'U-001' },
    { id: 'ACT-202609-0061', type: '消息', at: '2026-09-15 09:40', summary: '刘维反馈续约报价高于预算，需要重新测算。', customerId: 'CUS-202609-0004', leadId: 'LED-202609-0141', oppId: 'OPP-202609-0045', actor: 'U-001' },
    {
      id: 'ACT-202609-0090', type: '会议', channel: '会议', at: '2026-09-22 10:30', actor: 'U-001',
      summary: '与陈思远确认智能销售平台一期范围，下一步补充数据接口清单和验证口径。',
      customerId: 'CUS-202609-0012', leadId: '', oppId: 'OPP-202609-0046',
      target: '陈思远（信息化负责人）', request: '先明确一期试点范围与数据接口边界。',
      agreement: '先验证客户与商机基础数据，再评估后续自动化能力。',
      nextAction: '补充数据接口清单和验证口径，约定下次评审时间。', origin: '手工录入（演示）',
      aiResult: { '沟通要点': '一期先覆盖客户与商机数据验证。', '待核验事项': '接口字段清单需客户技术团队确认。' },
      evidence: [{ id: 'FILE-ACT-DEMO-01', name: '一期范围会议纪要（演示）.pdf', size: '248 KB', at: '2026-09-22 11:05' }],
      corrections: [{
        at: '2026-09-22 11:20', by: 'U-001', reason: '会后核对纪要，明确下一步交付内容。',
        before: { channel: '会议', target: '陈思远（信息化负责人）', content: '与陈思远确认智能销售平台一期范围，下一步补充数据接口清单和验证口径。', nextAction: '整理一期需求清单。' },
        after: { channel: '会议', target: '陈思远（信息化负责人）', content: '与陈思远确认智能销售平台一期范围，下一步补充数据接口清单和验证口径。', nextAction: '补充数据接口清单和验证口径，约定下次评审时间。' }
      }],
      history: [
        { at: '2026-09-22 10:45', actor: '张岚', action: '创建销售活动', note: '记录一期范围沟通。' },
        { at: '2026-09-22 11:20', actor: '张岚', action: '纠错', note: '会后核对纪要，明确下一步交付内容。' }
      ]
    }
  ];

  /* 全局异常能力仍供其他模块使用；客户资料不再生成治理事项。 */
  var exceptions = [];

  /* ------------------------------------------------------------ 处理记录 */

  var jobs = [
    {
      id: 'JOB-202609-0001', type: '批量处理', action: '批量转交线索', object: '线索', status: '部分成功',
      submittedAt: '2026-09-19 16:20', operator: 'U-001', total: 12, success: 10, failed: 2,
      expiresAt: '2026-09-26 16:20', processId: 'BATCH-202609-19-0021',
      items: [
        { key: 'LED-202609-0137', name: '远驰科技二期车电项目', result: '成功', reason: '' },
        { key: 'LED-202609-0138', name: '盈川新能源集采咨询', result: '成功', reason: '' },
        { key: 'LED-202609-0139', name: '栖达服务部新增服务点', result: '成功', reason: '' },
        { key: 'LED-202609-0140', name: '某汽车城车务合作线索', result: '失败', reason: '对象已处于终态，允许动作不符合' },
        { key: 'LED-202609-0141', name: '弘远车务续约信号', result: '失败', reason: '目标销售缺该业务线数据范围' }
      ]
    },
    {
      id: 'JOB-202609-0002', type: '导入', action: '线索固定模板导入', object: '线索', status: '部分成功',
      submittedAt: '2026-09-20 10:05', operator: 'U-001', total: 20, success: 17, failed: 3,
      expiresAt: '2026-09-27 10:05', sourceFile: '线索导入模板_20260920.csv', processId: 'IMP-202609-20-0007',
      items: [
        { key: '第 4 行', name: '—', result: '失败', reason: '缺来源，模板必填项未通过校验' },
        { key: '第 9 行', name: '—', result: '失败', reason: '负责人与目录池同时填写，必须且只能有一个' },
        { key: '第 17 行', name: 'LED-202609-0138', result: '失败', reason: '命中技术幂等键（相同来源系统＋外部记录 ID），不重复创建' }
      ]
    },
    {
      id: 'JOB-202609-0003', type: '导出', action: '客户列表导出', object: '客户', status: '已完成',
      submittedAt: '2026-09-20 15:40', operator: 'U-001', total: 6, success: 6, failed: 0,
      expiresAt: '2026-09-27 15:40', fileName: '客户列表_20260920.xlsx', processId: 'EXP-202609-20-0011',
      fields: ['客户编号', '客户名称', '客户类型', '记录状态', '价值分级'],
      items: []
    },
    {
      id: 'JOB-202609-0004', type: '批量处理', action: '批量转派商机主负责人', object: '商机', status: '处理中',
      submittedAt: '2026-09-21 09:12', operator: 'U-003', total: 3, success: 0, failed: 0,
      expiresAt: '2026-09-28 09:12', processId: 'BATCH-202609-21-0003', items: []
    }
  ];

  /* ------------------------------------------------------------ 站内消息 */

  var messages = [
    { id: 'MSG-202609-0201', event: '公海分派', title: '你获得一条全国公海经营权', body: '杭州齐远汽车科技有限公司（华东区域／新能源业务线）已分派给你，保护期至 2026-09-28。', at: '2026-09-21 08:40', read: false, link: 'pc/customer/detail.html?id=CUS-202609-0007&from=message' },
    { id: 'MSG-202609-0200', event: '异步批量结果', title: '批量转交线索部分成功', body: '共 12 条，成功 10 条，失败 2 条。可在处理记录中只重试失败项。', at: '2026-09-19 16:21', read: false, link: 'pc/processing/detail.html?id=JOB-202609-0001&from=message' },
    { id: 'MSG-202609-0195', event: '异常事项提交', title: '客户资料变更申请已提交', body: '苏州弘远车务有限公司的名称与注册地址变更申请已提交客户数据管理处理。', at: '2026-09-15 10:20', read: true, link: 'pc/customer/detail.html?id=CUS-202609-0004&from=message#governance' }
  ];

  /* =================================================================== 04 任务 */

  /* 正式任务 3 主状态（assets/state-machine.md §6）：待处理／已完成／已取消。
     逾期是依据截止时间派生的时间标识，不落库为状态；任务只保留截止时间，不建「延期中」状态。
     来源 4 类：自建任务／主管指派／沟通提炼／规则生成（阶段生成是规则生成子类，不扩大前台枚举）。 */
  var tasks = [
    {
      id: 'TSK-202609-0091', name: '补齐远驰科技车电业务线年度框架报价资料',
      source: '主管指派', bizType: '商机推进', owner: 'U-001', collaborators: ['U-002'],
      needAccept: false, acceptor: '', acceptorRule: '',
      status: '待处理', dueAt: '2026-09-25 18:00', doneAt: '',
      related: { type: '商机', id: 'OPP-202609-0042', name: '远驰科技车电业务线年度框架' },
      flowSnapshot: { needAccept: false, acceptor: '', ruleCode: 'TR-ASSIGN-V1', ruleVersion: 'V1', frozenAt: '2026-09-18 09:10' },
      stageTask: false, ruleVersion: '', createdAt: '2026-09-18 09:10', createdBy: 'U-003',
      collabRecords: [{ at: '2026-09-19 14:20', by: 'U-002', note: '已整理客户去年框架价格与新年度采购量，等待责任人合并报价材料。' }],
      history: [{ at: '2026-09-18 09:10', actor: '王栩', action: '主管指派创建', from: '', to: '待处理' }, { at: '2026-09-19 08:50', actor: '张岚', action: '查看任务', from: '待处理', to: '待处理' }]
    },
    {
      id: 'TSK-202609-0092', name: '阶段任务：完成客户需求初访纪要',
      source: '规则生成', bizType: '阶段任务', owner: 'U-001', collaborators: [],
      needAccept: false, acceptor: '', acceptorRule: '',
      status: '待处理', dueAt: '2026-09-26 18:00', doneAt: '',
      related: { type: '商机', id: 'OPP-202609-0042', name: '远驰科技车电业务线年度框架' },
      flowSnapshot: { needAccept: false, acceptor: '', ruleCode: 'TR-STAGE-V1', ruleVersion: 'V1', frozenAt: '2026-09-16 10:00' },
      stageTask: true, stageCode: 'ST-CE-02', stageRound: 1, ruleVersion: 'TPL-CE-STD-V3',
      createdAt: '2026-09-16 10:00', createdBy: '系统',
      history: [{ at: '2026-09-16 10:00', actor: '系统', action: '进入详细阶段生成阶段任务', from: '', to: '待处理' }]
    },
    {
      id: 'TSK-202609-0093', name: '整理栖达车务续约报价单',
      source: '自建任务', bizType: '客户跟进', owner: 'U-001', collaborators: [],
      needAccept: false, acceptor: '', acceptorRule: '',
      status: '已完成', dueAt: '2026-09-21 18:00', doneAt: '2026-09-20 16:40',
      result: '已整理续约报价单：基础服务费、车辆规模折扣和年度服务范围已汇总，已完成。',
      related: { type: '客户', id: 'CUS-202609-0003', name: '上海栖达汽车服务部' },
      flowSnapshot: { needAccept: false, acceptor: '', ruleCode: 'TR-SELF-V1', ruleVersion: 'V1', frozenAt: '2026-09-15 09:00' },
      stageTask: false, ruleVersion: '', createdAt: '2026-09-15 09:00', createdBy: 'U-001',
      history: [{ at: '2026-09-15 09:00', actor: '张岚', action: '自建任务', from: '', to: '待处理' }, { at: '2026-09-20 16:40', actor: '张岚', action: '完成任务', from: '待处理', to: '已完成' }]
    },
    {
      id: 'TSK-202609-0094', name: '盈川新能源集采线索首次电话接触',
      source: '沟通提炼', bizType: '线索跟进', owner: 'U-002', collaborators: [],
      needAccept: false, acceptor: '', acceptorRule: '',
      status: '已完成', dueAt: '2026-09-19 18:00', doneAt: '2026-09-19 15:20',
      related: { type: '线索', id: 'LED-202609-0138', name: '' },
      flowSnapshot: { needAccept: false, acceptor: '', ruleCode: 'TR-AI-V1', ruleVersion: 'V1', frozenAt: '2026-09-18 14:00' },
      stageTask: false, ruleVersion: '', sourceActivityId: 'ACT-202609-0101',
      createdAt: '2026-09-18 14:00', createdBy: '陈默',
      history: [{ at: '2026-09-18 14:00', actor: '陈默', action: '沟通提炼候选确认', from: '', to: '待处理' }, { at: '2026-09-19 15:20', actor: '陈默', action: '完成任务', from: '待处理', to: '已完成' }]
    },
    {
      id: 'TSK-202609-0095', name: '补充弘远车务客户关系备注',
      source: '主管指派', bizType: '客户维护', owner: 'U-002', collaborators: [],
      needAccept: false, acceptor: '', acceptorRule: '',
      status: '已取消', dueAt: '2026-09-23 18:00', doneAt: '',
      related: { type: '客户', id: 'CUS-202609-0004', name: '苏州弘远车务有限公司' },
      flowSnapshot: { needAccept: false, acceptor: '', ruleCode: 'TR-ASSIGN-V1', ruleVersion: 'V1', frozenAt: '2026-09-17 11:00' },
      stageTask: false, ruleVersion: '', rejectReason: '该客户已不在本人经营范围内，请改派区域负责人',
      createdAt: '2026-09-17 11:00', createdBy: 'U-003',
      history: [{ at: '2026-09-17 11:00', actor: '王栩', action: '主管指派创建', from: '', to: '待处理' }, { at: '2026-09-18 09:30', actor: '陈默', action: '创建人取消任务', from: '待处理', to: '已取消' }]
    },
    {
      id: 'TSK-202609-0096', name: '阶段任务：确认商务条款与合同主体',
      source: '规则生成', bizType: '阶段任务', owner: 'U-002', collaborators: ['U-001'],
      needAccept: false, acceptor: '', acceptorRule: '',
      status: '已取消', dueAt: '2026-10-08 18:00', doneAt: '',
      related: { type: '商机', id: 'OPP-202609-0042', name: '远驰科技车电业务线年度框架' },
      flowSnapshot: { needAccept: false, acceptor: '', ruleCode: 'TR-STAGE-V1', ruleVersion: 'V1', frozenAt: '2026-09-20 09:00' },
      stageTask: true, stageCode: 'ST-CE-05', stageRound: 2, ruleVersion: 'TPL-CE-STD-V3',
      invalidReason: '流程上下文变化（阶段回退）后该阶段任务不再适用，由系统置为已取消',
      createdAt: '2026-09-20 09:00', createdBy: '系统',
      history: [{ at: '2026-09-20 09:00', actor: '系统', action: '进入详细阶段生成阶段任务', from: '', to: '待处理' }, { at: '2026-09-21 09:30', actor: '系统', action: '上下文变化置为已取消', from: '待处理', to: '已取消' }]
    },
    {
      id: 'TSK-202609-0097', name: '远驰科技嘉定厂区现场踏勘',
      source: '自建任务', bizType: '客户跟进', owner: 'U-001', collaborators: [],
      needAccept: false, acceptor: '', acceptorRule: '',
      status: '已取消', dueAt: '2026-09-22 18:00', doneAt: '',
      related: { type: '客户', id: 'CUS-202609-0001', name: '上海远驰汽车科技有限公司' },
      flowSnapshot: { needAccept: false, acceptor: '', ruleCode: 'TR-SELF-V1', ruleVersion: 'V1', frozenAt: '2026-09-16 08:00' },
      stageTask: false, ruleVersion: '', cancelReason: '客户临时调整窗口期，改由下周正式拜访承接',
      createdAt: '2026-09-16 08:00', createdBy: 'U-001',
      history: [{ at: '2026-09-16 08:00', actor: '张岚', action: '自建任务', from: '', to: '待处理' }, { at: '2026-09-21 17:10', actor: '张岚', action: '取消任务', from: '待处理', to: '已取消' }]
    },
    {
      id: 'TSK-202609-0098', name: '演示：核对远驰科技报价资料',
      source: '主管指派', bizType: '商机推进', owner: 'U-001', collaborators: [],
      needAccept: false, acceptor: '', acceptorRule: '',
      status: '待处理', dueAt: '2026-09-29 18:00', doneAt: '',
      related: { type: '商机', id: 'OPP-202609-0042', name: '远驰科技车电业务线年度框架' },
      flowSnapshot: { needAccept: false, acceptor: '', ruleCode: 'TR-ASSIGN-V1', ruleVersion: 'V1', frozenAt: '2026-09-22 10:00' },
      stageTask: false, ruleVersion: '', createdAt: '2026-09-22 10:00', createdBy: 'U-003',
      history: [{ at: '2026-09-22 10:00', actor: '王栩', action: '主管指派创建', from: '', to: '待处理' }]
    }
  ];

  /* PC 任务列表走查样例：随当前日期定位今日、本周和逾期，不覆盖已有业务记录。 */
  function taskExampleDate(offset) {
    var d = new Date(); d.setHours(18, 0, 0, 0); d.setDate(d.getDate() + offset);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + ' 18:00';
  }
  function calendarExampleDate(offset, hour, minute) {
    var d = new Date(); d.setHours(hour || 9, minute || 0, 0, 0); d.setDate(d.getDate() + offset);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') +
      ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  [
    ['PC-001', '确认远驰科技年度采购需求清单', 'U-001', 'U-003', '待确认', 0, '主管指派', '商机推进', 'U-003'],
    ['PC-002', '整理栖达车务服务续约报价', 'U-001', 'U-001', '待处理', 0, '自建任务', '客户跟进', ''],
    ['PC-003', '完成弘远车务客户回访纪要', 'U-002', 'U-003', '待处理', 2, '主管指派', '客户跟进', ''],
    ['PC-004', '补充远驰科技方案评审材料', 'U-001', 'U-003', '待处理', -2, '主管指派', '商机推进', ''],
    ['PC-005', '复核远驰科技价格测算结论', 'U-001', 'U-003', '已完成', 0, '主管指派', '商机推进', 'U-003'],
    ['PC-006', '安排团队周度客户机会复盘', 'U-003', 'U-003', '待处理', 0, '自建任务', '会议任务', ''],
    ['PC-007', '汇总团队重点商机下一步动作', 'U-003', 'U-003', '待处理', 3, '自建任务', '商机推进', ''],
    ['PC-008', '核对任务规则发布记录', 'U-006', 'U-006', '待处理', 0, '自建任务', '其他', ''],
    ['PC-009', '整理跨团队任务配置核查结果', 'U-006', 'U-006', '待处理', 2, '自建任务', '其他', ''],
    ['PC-010', '复核任务配置问题修正', 'U-002', 'U-006', '已完成', -1, '主管指派', '其他', 'U-006'],
    ['PC-011', '复查已逾期客户资料补录', 'U-006', 'U-006', '待处理', -2, '自建任务', '客户维护', ''],
    ['PC-012', '提交团队客户回访安排', 'U-003', 'U-003', '待处理', -1, '自建任务', '客户跟进', ''],
    ['PC-013', '核对远驰科技项目会议资料', 'U-001', 'U-001', '待处理', 1, '自建任务', '会议任务', '']
  ].forEach(function (x) {
    var createdAt = taskExampleDate(-4), dueAt = taskExampleDate(x[5]);
    tasks.push({ id: 'TSK-' + x[0], name: x[1], owner: x[2], createdBy: x[3], status: x[4],
      dueAt: dueAt, startAt: x[0] === 'PC-006' ? calendarExampleDate(0, 14, 0) : '',
      createdAt: createdAt, doneAt: x[4] === '已完成' ? taskExampleDate(-1) : '',
      source: x[6], bizType: x[7], collaborators: [], needAccept: false, acceptor: '',
      acceptorRule: x[8] ? '创建时指定验收人' : '无需验收',
      result: x[4] === '已完成' ? '已完成材料整理并提交复核，关键结论和附件已完成人确认。' : '',
      related: { type: '', id: '', name: '' }, flowSnapshot: { needAccept: false, acceptor: '', ruleCode: 'TR-PC-EXAMPLE', ruleVersion: 'V1', frozenAt: createdAt },
      stageTask: false, ruleVersion: '', pcReviewExample: true,
      history: [{ at: createdAt, actor: '系统样例', action: '创建任务', from: '', to: x[4] }] });
  });

  /* H5 列表走查：固定演示账号 U-003 可见；覆盖主要状态、来源、逾期与长标题。 */
  [
    ['H5-001', '与远驰科技、华东项目组及产品团队核对年度框架报价范围、交付节点和采购确认材料', '待处理', 0, '主管指派', '商机推进'],
    ['H5-002', '准备团队客户机会周会纪要', '待处理', 2, '自建任务', '会议任务'],
    ['H5-003', '整理华东团队本周客户拜访要点', '已完成', -1, '自建任务', '客户维护'],
    ['H5-004', '整理客户沟通中识别的采购需求与下一步动作', '待处理', 1, '沟通提炼', '客户跟进'],
    ['H5-005', '按商机阶段要求准备方案评审材料', '待处理', 3, '规则生成', '阶段任务'],
    ['H5-006', '更新远驰客户下一轮拜访安排', '已取消', 2, '主管指派', '客户维护'],
    ['H5-007', '归档客户回访结果并补充联系人记录', '已完成', -2, '沟通提炼', '客户跟进'],
    ['H5-008', '准备客户报价沟通会议材料', '待处理', 4, '自建任务', '客户跟进']
  ].forEach(function (x) {
    var dueAt = taskExampleDate(x[3]), createdAt = taskExampleDate(-3);
    tasks.push({ id: 'TSK-' + x[0], name: x[1], owner: 'U-003', createdBy: 'U-003',
      status: x[2], dueAt: dueAt, startAt: x[0] === 'H5-002' ? calendarExampleDate(2, 14, 0) : '',
      doneAt: x[2] === '已完成' ? taskExampleDate(-1) : '',
      source: x[4], bizType: x[5], collaborators: ['U-003'],
      result: x[2] === '已完成' ? '要点已整理并同步给团队。' : '',
      cancelReason: x[2] === '已取消' ? '客户项目计划调整，本次安排取消。' : '',
      related: { type: '客户', id: 'CUS-202609-0001', name: '上海远驰汽车科技有限公司' },
      flowSnapshot: { ruleCode: 'TR-H5-DEMO', ruleVersion: 'V1', frozenAt: createdAt },
      stageTask: x[5] === '阶段任务', createdAt: createdAt,
      history: [{ at: createdAt, actor: '王栩', action: x[2] === '已取消' ? '创建后取消任务' : '创建任务', from: '', to: x[2] }] });
  });
  tasks.push({ id: 'TSK-H5-009', name: '配合张岚核对远驰科技客户需求清单', owner: 'U-001', createdBy: 'U-001',
    status: '待处理', dueAt: taskExampleDate(1), doneAt: '', source: '自建任务', bizType: '客户跟进',
    collaborators: ['U-003'], result: '',
    related: { type: '客户', id: 'CUS-202609-0001', name: '上海远驰汽车科技有限公司' },
    flowSnapshot: { ruleCode: 'TR-H5-DEMO', ruleVersion: 'V1', frozenAt: taskExampleDate(-2) },
    stageTask: false, createdAt: taskExampleDate(-2),
    history: [{ at: taskExampleDate(-2), actor: '张岚', action: '创建任务并邀请参与人', from: '', to: '待处理' }] });

  /* ============================================== 04 销售活动（ACT-）与正式拜访（VH-） */

  /* 正式拜访 5 主状态：计划中／进行中／已完成／已取消／未到访；
     异常状态独立：待复核／待补充／已复核 —— 异常不自动改变拜访主状态。 */
  var visits = [
    {
      id: 'VH-202609-0001', customerId: 'CUS-202609-0001',
      owner: 'U-001', type: '实地拜访', status: '已完成', exception: '已复核', reviewStatus: '已复核',
      planAt: '2026-09-18 14:00', planSnapshotAt: '2026-09-18 13:52',
      addressSnapshot: { region: '上海市·上海市·浦东新区', detail: '金桥路 1288 号 B 座 1 层展厅', lat: 31.2569, lng: 121.5902 },
      checkInAt: '2026-09-18 13:58', checkInLoc: { lat: 31.2569, lng: 121.5902, addr: '金桥路 1288 号 B 座', acc: 22 },
      checkOutAt: '2026-09-18 16:05', checkOutLoc: { lat: 31.2571, lng: 121.5905, addr: '金桥路 1288 号 B 座', acc: 26 },
      summary: {
        object: '采购总监赵敏、技术负责人刘维', chain: '赵敏决策、刘维技术把关、孙倩付款',
        demand: '希望在 10 月完成选型，关注交付周期与售后响应', concern: '对跨区域交付能力有顾虑',
        budget: '预算区间待客户内部审批后确认', timeline: '10 月选型，12 月完成签约',
        decision: '采购中心提报、总经理审批', competitor: '已知两家同类供应商参与',
        agreement: '先提交技术方案初稿，再安排现场交流', support: '需要方案团队协助出初稿',
        nextStep: '9 月 23 日前提交技术方案初稿并约现场交流'
      },
      nextStep: '9 月 23 日前提交技术方案初稿并约现场交流',
      evidence: [{ id: 'FILE-0001', name: '现场交流合影.jpg', size: '1.2 MB', at: '2026-09-18 15:40' }],
      exceptionDetail: '签到定位精度 22 米，处于规则阈值边界，系统标记待复核',
      review: { by: 'U-003', at: '2026-09-19 10:20', result: '已复核', reason: '定位精度在可接受范围内，拜访结果与活动记录一致', ruleVersion: 'VR-V1' },
      note: '', history: [
        { at: '2026-09-16 10:00', actor: '张岚', action: '创建正式拜访', from: '', to: '计划中' },
        { at: '2026-09-18 13:58', actor: '张岚', action: '签到并冻结计划快照', from: '计划中', to: '进行中' },
        { at: '2026-09-18 16:05', actor: '张岚', action: '签退并提交拜访总结', from: '进行中', to: '已完成' },
        { at: '2026-09-19 10:20', actor: '王栩', action: '异常复核', from: '待复核', to: '已复核' }
      ]
    },
    {
      id: 'VH-202609-0002', customerId: 'CUS-202609-0003',
      owner: 'U-001', type: '实地拜访', status: '已完成', exception: '待复核', reviewStatus: '待复核',
      planAt: '2026-09-20 10:00', planSnapshotAt: '2026-09-20 09:58',
      addressSnapshot: { region: '上海市·上海市·闵行区', detail: '莘庄镇莘松路 385 号', lat: 31.1120, lng: 121.3812 },
      checkInAt: '', checkInLoc: null,
      checkOutAt: '2026-09-20 11:30', checkOutLoc: { lat: 31.1120, lng: 121.3812, addr: '莘庄镇莘松路 385 号', acc: 40 },
      summary: {
        object: '运营负责人', chain: '运营负责人直接决策', demand: '续约前希望调整服务响应条款', concern: '上次服务响应超时',
        budget: '续约金额维持原区间', timeline: '10 月完成续约', decision: '运营负责人签字后总部备案',
        competitor: '暂无', agreement: '先出续约报价单', support: '无', nextStep: '提交续约报价单'
      },
      nextStep: '提交续约报价单',
      evidence: [], checkInIssue: '签到失败', exceptionDetail: '现场信号弱导致定位失败，销售已填写原因并继续进行',
      exceptionNoteBy: 'U-001', exceptionNoteAt: '2026-09-20 10:02',
      exceptionReason: '现场信号弱，定位服务不可用；经客户确认已在现场，随后按约定完成拜访',
      review: { by: '', at: '', result: '', reason: '', ruleVersion: 'VR-V1' },
      note: '', history: [
        { at: '2026-09-17 15:00', actor: '张岚', action: '创建正式拜访', from: '', to: '计划中' },
        { at: '2026-09-20 10:02', actor: '张岚', action: '定位失败填写原因继续', from: '计划中', to: '进行中' },
        { at: '2026-09-20 11:30', actor: '张岚', action: '签退并提交拜访总结', from: '进行中', to: '已完成' }
      ]
    },
    {
      id: 'VH-202609-0003', customerId: 'CUS-202609-0002',
      owner: 'U-002', type: '实地拜访', status: '计划中', exception: '', reviewStatus: '',
      planAt: '2026-09-24 09:30', planSnapshotAt: '',
      addressSnapshot: { region: '广东省·广州市·天河区', detail: '珠江新城华夏路 30 号 21 层' },
      checkInAt: '', checkInLoc: null, checkOutAt: '', checkOutLoc: null,
      summary: null, nextStep: '', evidence: [], exceptionDetail: '', review: { by: '', at: '', result: '', reason: '', ruleVersion: 'VR-V1' },
      note: '', history: [{ at: '2026-09-19 16:20', actor: '陈默', action: '创建正式拜访', from: '', to: '计划中' }]
    },
    {
      id: 'VH-202609-0004', customerId: 'CUS-202609-0007',
      owner: 'U-001', type: '实地拜访', status: '未到访', exception: '', reviewStatus: '',
      planAt: '2026-09-12 15:00', planSnapshotAt: '',
      addressSnapshot: { region: '浙江省·杭州市·滨江区', detail: '江南大道 588 号 8 层' },
      checkInAt: '', checkInLoc: null, checkOutAt: '', checkOutLoc: null,
      summary: null, nextStep: '', evidence: [], exceptionDetail: '', review: { by: '', at: '', result: '', reason: '', ruleVersion: 'VR-V1' },
      note: '客户临时取消，未开展拜访', history: [
        { at: '2026-09-10 09:00', actor: '张岚', action: '创建正式拜访', from: '', to: '计划中' },
        { at: '2026-09-12 18:00', actor: '张岚', action: '标记未到访', from: '计划中', to: '未到访' }
      ]
    }
  ];
  visits.push({ id: 'VH-H5-0001', customerId: 'CUS-202609-0001', owner: 'U-003', type: '实地拜访',
    status: '计划中', exception: '', reviewStatus: '', planAt: calendarExampleDate(0, 14, 0), planSnapshotAt: '',
    addressSnapshot: { region: '上海市·浦东新区', detail: '金桥路 1288 号 B 座', lat: 31.2569, lng: 121.5902 },
    checkInAt: '', checkInLoc: null, checkOutAt: '', checkOutLoc: null,
    summary: null, nextStep: '', evidence: [], exceptionDetail: '',
    review: { by: '', at: '', result: '', reason: '', ruleVersion: 'VR-V1' },
    note: 'H5 快捷签到演示', history: [{ at: taskExampleDate(-1), actor: '王栩', action: '创建正式拜访', from: '', to: '计划中' }] });
  visits.push({ id: 'VH-H5-0002', customerId: 'CUS-202609-0012', owner: 'U-003', type: '实地拜访',
    status: '进行中', exception: '', reviewStatus: '', planAt: calendarExampleDate(-1, 10, 0), planSnapshotAt: calendarExampleDate(-1, 9, 52),
    addressSnapshot: { region: '上海市·浦东新区', detail: '张江科学城会议中心' },
    checkInAt: calendarExampleDate(-1, 9, 56), checkInLoc: { lat: 31.205, lng: 121.602, addr: '张江科学城会议中心', acc: 18 },
    checkOutAt: '', checkOutLoc: null, summary: null, nextStep: '核对试点范围与接口字段', evidence: [], exceptionDetail: '',
    review: { by: '', at: '', result: '', reason: '', ruleVersion: '' }, note: 'H5 拜访进行中示例',
    history: [{ at: calendarExampleDate(-2, 16, 20), actor: '王栩', action: '创建正式拜访', from: '', to: '计划中' },
      { at: calendarExampleDate(-1, 9, 56), actor: '王栩', action: '签到', from: '计划中', to: '进行中' }] });
  visits.push({ id: 'VH-H5-0003', customerId: 'CUS-202609-0001', owner: 'U-003', type: '实地拜访',
    status: '已完成', exception: '', reviewStatus: '', planAt: calendarExampleDate(-4, 14, 0), planSnapshotAt: calendarExampleDate(-4, 13, 55),
    addressSnapshot: { region: '上海市·浦东新区', detail: '金桥路 1288 号 B 座' },
    checkInAt: calendarExampleDate(-4, 13, 58), checkInLoc: { lat: 31.2569, lng: 121.5902, addr: '金桥路 1288 号 B 座', acc: 20 },
    checkOutAt: calendarExampleDate(-4, 15, 36), checkOutLoc: { lat: 31.2571, lng: 121.5905, addr: '金桥路 1288 号 B 座', acc: 24 },
    summary: { object: '采购与技术团队', chain: '采购经理提出需求，技术负责人核对方案',
      demand: '补齐交付时间和售后响应说明', concern: '担心跨区域交付周期偏长',
      budget: '预算仍待采购委员会确认', timeline: '本月完成方案评审', decision: '采购委员会审议后确定',
      competitor: '客户仍在比较两家供应商', agreement: '确认下一轮方案评审范围',
      support: '需要方案团队补充服务承诺', nextStep: '提交更新后的方案说明' },
    nextStep: '提交更新后的方案说明', evidence: [], exceptionDetail: '',
    review: { by: '', at: '', result: '', reason: '', ruleVersion: '' },
    note: 'H5 已完成拜访示例', history: [{ at: calendarExampleDate(-5, 11, 0), actor: '王栩', action: '创建正式拜访', from: '', to: '计划中' },
      { at: calendarExampleDate(-4, 13, 58), actor: '王栩', action: '签到', from: '计划中', to: '进行中' },
      { at: calendarExampleDate(-4, 15, 36), actor: '王栩', action: '签退并提交总结', from: '进行中', to: '已完成' }] });

  /* ==================================================== 04 统一日程（独立日程 SCH-） */
  /* 3 主状态仅独立日程维护：有效／已取消／已删除。转任务用派生字段，不新增「已转换」主状态。 */
  var schedules = [
    {
      id: 'SCH-202609-0001', title: '远驰科技技术方案现场交流', owner: 'U-001', type: '客户约访',
      startAt: '2026-09-23 14:00', endAt: '2026-09-23 16:00', status: '有效',
      related: { type: '客户', id: 'CUS-202609-0001', name: '上海远驰汽车科技有限公司' }, note: '需方案团队一名同事同行',
      isConverted: false, convertedTaskId: '', convertedAt: '', convertedBy: '',
      wecomSync: { status: '成功', at: '2026-09-19 10:00', externalId: 'WX-SCH-88213', failReason: '', retryCount: 0 },
      history: [{ at: '2026-09-19 09:50', actor: '张岚', action: '创建独立日程', from: '', to: '有效' }, { at: '2026-09-19 10:00', actor: '系统', action: '企微日程同步成功', from: '', to: '' }]
    },
    {
      id: 'SCH-202609-0002', title: '华东大区周经营例会', owner: 'U-003', type: '内部会议',
      startAt: '2026-09-22 09:00', endAt: '2026-09-22 10:30', status: '有效',
      related: { type: '', id: '', name: '' }, note: '销售全员参加',
      isConverted: false, convertedTaskId: '', convertedAt: '', convertedBy: '',
      wecomSync: { status: '失败', at: '2026-09-20 09:00', externalId: '', failReason: '企微日历接口超时（第 3 次重试仍失败）', retryCount: 3 },
      history: [{ at: '2026-09-20 08:40', actor: '王栩', action: '创建独立日程', from: '', to: '有效' }, { at: '2026-09-20 09:00', actor: '系统', action: '企微日程同步失败', from: '', to: '' }]
    },
    {
      id: 'SCH-202609-0003', title: '整理弘远车务续约材料', owner: 'U-001', type: '个人安排',
      startAt: '2026-09-24 09:00', endAt: '2026-09-24 10:00', status: '有效',
      related: { type: '客户', id: 'CUS-202609-0004', name: '苏州弘远车务有限公司' }, note: '',
      isConverted: true, convertedTaskId: 'TSK-202609-0093', convertedAt: '2026-09-15 08:50', convertedBy: 'U-001',
      wecomSync: { status: '未同步', at: '', externalId: '', failReason: '', retryCount: 0 },
      history: [{ at: '2026-09-14 17:00', actor: '张岚', action: '创建独立日程', from: '', to: '有效' }, { at: '2026-09-15 08:50', actor: '张岚', action: '转为任务（派生字段）', from: '', to: '有效' }]
    },
    {
      id: 'SCH-202609-0004', title: '盈川新能源预热沟通（已取消）', owner: 'U-002', type: '客户约访',
      startAt: '2026-09-19 15:00', endAt: '2026-09-19 16:00', status: '已取消',
      related: { type: '客户', id: 'CUS-202609-0002', name: '广州盈川新能源集团有限公司' }, note: '客户临时改期',
      isConverted: false, convertedTaskId: '', convertedAt: '', convertedBy: '',
      wecomSync: { status: '已取消', at: '2026-09-18 17:30', externalId: 'WX-SCH-88190', failReason: '', retryCount: 0 },
      history: [{ at: '2026-09-16 11:00', actor: '陈默', action: '创建独立日程', from: '', to: '有效' }, { at: '2026-09-18 17:30', actor: '陈默', action: '取消日程', from: '有效', to: '已取消' }]
    },
    {
      id: 'SCH-202609-0005', title: '演示：已删除的客户约访', owner: 'U-001', type: '客户约访',
      startAt: '2026-09-18 10:00', endAt: '2026-09-18 11:00', status: '已删除',
      related: { type: '客户', id: 'CUS-202609-0001', name: '上海远驰汽车科技有限公司' }, note: '演示软删除留痕',
      isConverted: false, convertedTaskId: '', convertedAt: '', convertedBy: '', deleteReason: '与正式拜访计划重复，删除独立日程',
      wecomSync: { status: '已取消', at: '2026-09-17 18:00', externalId: 'WX-SCH-88188', failReason: '', retryCount: 0 },
      history: [{ at: '2026-09-16 10:00', actor: '张岚', action: '创建独立日程', from: '', to: '有效' }, { at: '2026-09-17 18:00', actor: '张岚', action: '删除日程', from: '有效', to: '已删除', reason: '与正式拜访计划重复' }]
    },
    {
      id: 'SCH-202609-0006', title: '演示：已取消的方案讨论日程', owner: 'U-001', type: '内部会议',
      startAt: '2026-09-19 10:00', endAt: '2026-09-19 11:00', status: '已取消',
      related: { type: '', id: '', name: '' }, note: '演示取消后保留记录', cancelReason: '方案团队调整讨论时间',
      isConverted: false, convertedTaskId: '', convertedAt: '', convertedBy: '',
      wecomSync: { status: '已取消', at: '2026-09-18 18:00', externalId: '', failReason: '', retryCount: 0 },
      history: [{ at: '2026-09-18 09:00', actor: '张岚', action: '创建独立日程', from: '', to: '有效' }, { at: '2026-09-18 18:00', actor: '张岚', action: '取消日程', from: '有效', to: '已取消', reason: '方案团队调整讨论时间' }]
    }
  ];
  /* H5 日历走查演示：日期随当前日期滚动，真实日历源数据模型，不代表真实会议或安排。 */
  [
    ['SCH-H5-CAL-0001', '演示：华东团队销售例会', 0, 9, 30, 10, 15, '内部会议'],
    ['SCH-H5-CAL-0002', '演示：整理客户方案资料', 0, 16, 30, 17, 15, '个人安排'],
    ['SCH-H5-CAL-0003', '演示：客户需求范围沟通', 3, 15, 0, 16, 0, '客户约访']
  ].forEach(function(x) {
    schedules.push({ id:x[0], title:x[1], owner:'U-003', type:x[7],
      startAt:calendarExampleDate(x[2],x[3],x[4]), endAt:calendarExampleDate(x[2],x[5],x[6]), status:'有效',
      related:{ type:x[7]==='客户约访'?'客户':'', id:x[7]==='客户约访'?'CUS-202609-0001':'', name:x[7]==='客户约访'?'上海远驰汽车科技有限公司':'' },
      note:'日历页面演示数据，不代表实际业务安排。', demoOnly:true,
      isConverted:false, convertedTaskId:'', convertedAt:'', convertedBy:'',
      wecomSync:{ status:'未同步', at:'', externalId:'', failReason:'', retryCount:0 },
      history:[{ at:calendarExampleDate(-1,16,0), actor:'演示数据', action:'创建 H5 日程演示数据', from:'', to:'有效' }] });
  });

  /* ============================================== 04 日报 RPT-（草稿 → 已提交，终端） */
  /* 三层模型：首次 AI 原始底稿 → 当前工作草稿 → 正式提交版本。提交后冻结，不退回、不重提。 */
  var reports = [
    {
      id: 'RPT-202609-0001', userId: 'U-001', date: '2026-09-20', status: '已提交',
      aiDraft: '今日完成远驰科技车电业务线年度框架需求初访，客户关注交付周期；新增线索 1 条；完成阶段任务 1 项。',
      draftBody: '今日完成远驰科技车电业务线年度框架需求初访，客户关注跨区域交付周期与售后响应，已约定 9 月 23 日提交技术方案初稿。新增线索 1 条（盈川新能源集采咨询）。完成阶段任务 1 项。明日计划：整理技术方案初稿。',
      submittedBody: '今日完成远驰科技车电业务线年度框架需求初访，客户关注跨区域交付周期与售后响应，已约定 9 月 23 日提交技术方案初稿并安排现场交流。新增线索 1 条（盈川新能源集采咨询）。完成阶段任务 1 项。待协助事项：需要方案团队协助出技术方案初稿。明日计划：整理技术方案初稿，跟进栖达车务续约报价。',
      facts: {
        customers: [{ id: 'CUS-202609-0001', name: '上海远驰汽车科技有限公司', change: '新增有效经营关系活动' }],
        leads: [{ id: 'LED-202609-0138', name: '盈川新能源集采咨询', change: '新建' }],
        opportunities: [{ id: 'OPP-202609-0042', name: '远驰科技车电业务线年度框架', change: '推进至需求确认' }],
        activities: [{ id: 'ACT-202609-0102', name: '客户面访：远驰科技', change: '新增' }],
        visits: [{ id: 'VH-202609-0001', name: '远驰·浦东金桥店 实地拜访', change: '已完成' }],
        tasks: [{ id: 'TSK-202609-0092', name: '阶段任务：完成客户需求初访纪要', change: '进行中' }]
      },
      sources: [{ type: '销售活动', id: 'ACT-202609-0102' }, { type: '正式拜访', id: 'VH-202609-0001' }, { type: '线索', id: 'LED-202609-0138' }],
      submittedAt: '2026-09-20 20:15', submitIdem: 'RPT-202609-0001-20260920-1',
      readBy: { 'U-003': { read: true, at: '2026-09-21 08:40', unreadAt: '' } },
      advices: [{ id: 'ADV-0001', by: 'U-003', at: '2026-09-21 08:45', text: '技术方案初稿请同步给方案团队预审，避免 23 日现场反复。' }],
      history: [{ at: '2026-09-20 18:00', actor: '系统', action: '生成 AI 原始底稿', from: '', to: '' }, { at: '2026-09-20 20:15', actor: '张岚', action: '一次提交并冻结快照', from: '草稿', to: '已提交' }]
    },
    {
      id: 'RPT-202609-0002', userId: 'U-002', date: '2026-09-20', status: '已提交',
      aiDraft: '今日完成盈川新能源集采线索首次电话接触，客户尚未确认采购主体。',
      draftBody: '今日完成盈川新能源集采线索首次电话接触，客户尚未确认具体采购主体，来源为老客户转介绍。已约定下周再次沟通以确认主体与预算。',
      submittedBody: '今日完成盈川新能源集采线索首次电话接触，客户尚未确认具体采购主体，来源为老客户转介绍。已约定下周再次沟通以确认主体与预算。明日计划：确认采购主体后判断是否具备转换为商机的条件。',
      facts: {
        customers: [], leads: [], opportunities: [],
        activities: [{ id: 'ACT-202609-0101', name: '电话沟通：盈川新能源集采咨询', change: '新增' }],
        visits: [], tasks: [{ id: 'TSK-202609-0094', name: '盈川新能源集采线索首次电话接触', change: '已完成' }]
      },
      sources: [{ type: '销售活动', id: 'ACT-202609-0101' }],
      submittedAt: '2026-09-20 21:02', submitIdem: 'RPT-202609-0002-20260920-1',
      readBy: { 'U-003': { read: false, at: '', unreadAt: '' } },
      advices: [],
      history: [{ at: '2026-09-20 18:00', actor: '系统', action: '生成 AI 原始底稿', from: '', to: '' }, { at: '2026-09-20 21:02', actor: '陈默', action: '一次提交并冻结快照', from: '草稿', to: '已提交' }]
    },
    {
      id: 'RPT-202609-0003', userId: 'U-001', date: '2026-09-21', status: '草稿',
      aiDraft: '今日完成栖达车务续约报价单整理，提交验收；远驰科技现场踏勘任务已取消。',
      draftBody: '今日业务事实\n• 客户：上海栖达汽车服务部（续约报价资料已整理并提交验收）\n• 任务：整理栖达车务续约报价单（提交验收）\n• 任务：远驰科技嘉定厂区现场踏勘（已取消，待重新约定时间）\n\n工作总结\n已完成栖达车务续约报价资料整理，等待客户确认报价细节。远驰科技现场踏勘因时间冲突取消，需与客户重新约定。明日计划：跟进报价反馈并确认踏勘日期。',
      draftSeeded: true,
      submittedBody: '',
      facts: {
        customers: [{ id: 'CUS-202609-0003', name: '上海栖达汽车服务部', change: '任务提交验收' }],
        leads: [], opportunities: [],
        activities: [], visits: [],
        tasks: [{ id: 'TSK-202609-0093', name: '整理栖达车务续约报价单', change: '提交验收' }, { id: 'TSK-202609-0097', name: '远驰科技嘉定厂区现场踏勘', change: '已取消' }]
      },
      sources: [{ type: '客户', id: 'CUS-202609-0003' }, { type: '任务', id: 'TSK-202609-0093' }, { type: '任务', id: 'TSK-202609-0097' }],
      submittedAt: '', submitIdem: '',
      readBy: {}, advices: [],
      history: [{ at: '2026-09-21 18:00', actor: '系统', action: '生成 AI 原始底稿', from: '', to: '' }]
    },
    {
      id: 'RPT-202609-0004', userId: 'U-002', date: '2026-09-21', status: '草稿',
      aiDraft: '今日跟进盈川新能源集采需求，客户尚待确认采购主体；继续整理项目需求清单。',
      draftBody: '今日业务事实\n• 客户：广州盈川新能源集团有限公司（沟通集采需求范围）\n• 商机：盈川新能源集采项目（整理需求清单）\n\n工作总结\n已与盈川新能源沟通采购范围，待对方确认采购主体和预算口径。项目需求清单已完成初稿，仍需与客户核对。明日计划：补齐采购主体信息，复核需求清单并确认下一次沟通时间。',
      draftSeeded: true, submittedBody: '',
      facts: {
        customers: [{ id: 'CUS-202609-0002', name: '广州盈川新能源集团有限公司', change: '沟通集采需求范围' }],
        leads: [], opportunities: [{ id: 'OPP-202609-0043', name: '盈川新能源集采项目', change: '整理需求清单' }],
        activities: [], visits: [], tasks: []
      },
      sources: [{ type: '客户', id: 'CUS-202609-0002' }, { type: '商机', id: 'OPP-202609-0043' }],
      submittedAt: '', submitIdem: '', readBy: {}, advices: [],
      history: [{ at: '2026-09-21 18:00', actor: '系统', action: '生成 AI 原始底稿', from: '', to: '草稿' }]
    }
  ];

  /* ==================================================== 05 Agent 运行与候选 */
  /* 候选主状态：待确认／已确认／已忽略／已失效；写入状态独立：未写入／写入中／写入成功／写入失败。 */
  var agentRuns = [
    { id: 'RUN-202609-0001', ability: '沟通整理', origin: '文字输入', userId: 'U-001', serviceIdentity: 'SVC-ACT-DRAFT', status: '成功', startedAt: '2026-09-20 19:40', finishedAt: '2026-09-20 19:41', durationMs: 8420, errorCode: '', retryCount: 0, candidateCount: 2, knowledgeRefs: [] },
    { id: 'RUN-202609-0002', ability: '沟通整理', origin: '大圆企微文档', userId: 'U-001', serviceIdentity: 'SVC-ACT-DRAFT', status: '成功', startedAt: '2026-09-18 16:10', finishedAt: '2026-09-18 16:12', durationMs: 11260, errorCode: '', retryCount: 0, candidateCount: 3, knowledgeRefs: [] },
    { id: 'RUN-202609-0003', ability: '日报底稿', origin: '系统预生成', userId: 'U-001', serviceIdentity: 'SVC-PREGEN', status: '成功', startedAt: '2026-09-21 18:00', finishedAt: '2026-09-21 18:01', durationMs: 6210, errorCode: '', retryCount: 0, candidateCount: 0, knowledgeRefs: [] },
    { id: 'RUN-202609-0004', ability: '沟通整理', origin: '录音文件', userId: 'U-002', serviceIdentity: 'SVC-ACT-DRAFT', status: '失败', startedAt: '2026-09-19 11:20', finishedAt: '2026-09-19 11:21', durationMs: 3010, errorCode: 'ASR_TIMEOUT', errorMessage: '语音转写服务超时，未生成候选；销售可改用手工录入', retryCount: 2, candidateCount: 0, knowledgeRefs: [] },
    { id: 'RUN-202609-0005', ability: '对象 AI 摘要', origin: '有权正式对象', userId: 'U-001', serviceIdentity: 'SVC-OBJ-AI', status: '成功', startedAt: '2026-09-21 09:15', finishedAt: '2026-09-21 09:15', durationMs: 3120, errorCode: '', retryCount: 0, candidateCount: 0, knowledgeRefs: [{ type: '瑞赢知识', id: 'KB-202609-0002', version: 'V2' }] }
  ];

  var agentCandidates = [
    {
      id: 'CAND-202609-0001', runId: 'RUN-202609-0001', kind: '候选销售活动', status: '待确认', writeStatus: '未写入',
      origin: '文字输入', owner: 'U-001', age: '当前',
      sourceVersion: '文字输入 2026-09-20 19:38（本次原始输入）',
      sourceRef: { type: '线索', id: 'LED-202609-0138', name: '盈川新能源集采咨询' },
      aiSuggestion: {
        '沟通方式': '电话沟通', '沟通对象': '盈川新能源集采联系人', '沟通时间': '2026-09-20 19:20',
        '沟通内容': '客户咨询新能源集采范围，尚未确认采购主体', '客户诉求': '确认集采能否覆盖其子公司',
        '共识与承诺': '下周再次沟通确认主体与预算', '下一步动作': '确认采购主体后判断转换条件'
      },
      finalValue: null, diff: '',
      fieldEvidence: [
        { k: '沟通方式', certainty: '事实', evidence: '“今天下午电话联系了对方”' },
        { k: '沟通对象', certainty: '推断', evidence: '原文只出现“对方”，按关联线索推断为线索联系人' },
        { k: '预算金额', certainty: '缺失', evidence: '原文未提及' }
      ],
      relatedObjects: [{ type: '线索', id: 'LED-202609-0138' }],
      confirmedBy: '', confirmedAt: '', writtenObjectId: '', writtenAt: '',
      idemKey: 'IDEM-CAND-202609-0001', failReason: '', failKind: '',
      createdAt: '2026-09-20 19:41'
    },
    {
      id: 'CAND-202609-0002', runId: 'RUN-202609-0001', kind: '候选任务', status: '待确认', writeStatus: '未写入',
      origin: '文字输入', owner: 'U-001', age: '当前',
      sourceVersion: '文字输入 2026-09-20 19:38（本次原始输入）',
      sourceRef: { type: '线索', id: 'LED-202609-0138', name: '盈川新能源集采咨询' },
      aiSuggestion: { '任务名称': '确认盈川新能源集采采购主体', '截止时间': '2026-09-25 18:00', '业务类型': '线索跟进', '下一步动作': '电话确认采购主体与预算区间' },
      finalValue: null, diff: '',
      fieldEvidence: [
        { k: '任务名称', certainty: '事实', evidence: '“下周再联系确认主体”' },
        { k: '截止时间', certainty: '推断', evidence: '按“下周”推断为 9 月 25 日' }
      ],
      relatedObjects: [{ type: '线索', id: 'LED-202609-0138' }],
      confirmedBy: '', confirmedAt: '', writtenObjectId: '', writtenAt: '',
      idemKey: 'IDEM-CAND-202609-0002', failReason: '', failKind: '',
      createdAt: '2026-09-20 19:41'
    },
    {
      id: 'CAND-202609-0003', runId: 'RUN-202609-0002', kind: '候选销售活动', status: '已确认', writeStatus: '写入成功',
      origin: '大圆企微文档', owner: 'U-001', age: '当前',
      sourceVersion: '大圆企微文档《远驰科技 9·18 现场沟通》v3（2026-09-18 16:05）',
      sourceRef: { type: '客户', id: 'CUS-202609-0001', name: '上海远驰汽车科技有限公司' },
      aiSuggestion: { '沟通方式': '客户面访', '沟通对象': '赵敏、刘维', '沟通内容': '讨论年度框架合作范围与交付节奏', '下一步动作': '提交技术方案初稿' },
      finalValue: { '沟通方式': '客户面访', '沟通对象': '赵敏、刘维', '沟通内容': '讨论年度框架合作范围与交付节奏，客户关注跨区域交付能力', '下一步动作': '9 月 23 日前提交技术方案初稿' },
      diff: '沟通内容补充了客户对跨区域交付能力的关注；下一步动作补充了时间要求',
      fieldEvidence: [
        { k: '沟通对象', certainty: '事实', evidence: '大圆文档第 2 段出席人名单' },
        { k: '沟通内容', certainty: '事实', evidence: '大圆文档第 4 段议题记录' }
      ],
      relatedObjects: [{ type: '客户', id: 'CUS-202609-0001' }, { type: '商机', id: 'OPP-202609-0042' }],
      confirmedBy: 'U-001', confirmedAt: '2026-09-18 16:20', writtenObjectId: 'ACT-202609-0102', writtenAt: '2026-09-18 16:20',
      idemKey: 'IDEM-CAND-202609-0003', failReason: '', failKind: '',
      createdAt: '2026-09-18 16:12'
    },
    {
      id: 'CAND-202609-0004', runId: 'RUN-202609-0002', kind: '候选任务', status: '已确认', writeStatus: '写入失败',
      origin: '大圆企微文档', owner: 'U-001', age: '当前',
      sourceVersion: '大圆企微文档《远驰科技 9·18 现场沟通》v3（2026-09-18 16:05）',
      sourceRef: { type: '商机', id: 'OPP-202609-0042', name: '远驰科技车电业务线年度框架' },
      aiSuggestion: { '任务名称': '提交远驰科技技术方案初稿', '截止时间': '2026-09-23 18:00', '业务类型': '商机推进', '责任人': '张岚' },
      finalValue: { '任务名称': '提交远驰科技技术方案初稿', '截止时间': '2026-09-23 18:00', '业务类型': '商机推进', '责任人': '张岚' },
      diff: '',
      fieldEvidence: [{ k: '任务名称', certainty: '事实', evidence: '大圆文档待办事项第 1 条' }],
      relatedObjects: [{ type: '商机', id: 'OPP-202609-0042' }],
      confirmedBy: 'U-001', confirmedAt: '2026-09-18 16:22', writtenObjectId: '', writtenAt: '',
      idemKey: 'IDEM-CAND-202609-0004',
      failReason: '验收入无法唯一解析：候选任务需验收，但责任人张岚的唯一主直属主管未配置',
      failKind: '业务异常（不可自动重试）',
      createdAt: '2026-09-18 16:12'
    },
    {
      id: 'CAND-202609-0005', runId: 'RUN-202609-0002', kind: '候选销售活动', status: '已失效', writeStatus: '未写入',
      origin: '大圆企微文档', owner: 'U-001', age: '当前',
      sourceVersion: '大圆企微文档《远驰科技 9·18 现场沟通》v2（2026-09-18 15:40）',
      sourceRef: { type: '客户', id: 'CUS-202609-0001', name: '上海远驰汽车科技有限公司' },
      aiSuggestion: { '沟通方式': '客户面访', '沟通内容': '讨论年度框架合作范围（早期版本摘录）' },
      finalValue: null, diff: '',
      fieldEvidence: [{ k: '沟通内容', certainty: '事实', evidence: '大圆文档 v2 第 3 段' }],
      relatedObjects: [{ type: '客户', id: 'CUS-202609-0001' }],
      confirmedBy: '', confirmedAt: '', writtenObjectId: '', writtenAt: '',
      idemKey: 'IDEM-CAND-202609-0005',
      invalidReason: '来源版本已更新（v2 → v3），原候选失效并按新版本另建候选 CAND-202609-0003',
      failReason: '', failKind: '',
      createdAt: '2026-09-18 15:45'
    },
    {
      id: 'CAND-202609-0006', runId: 'RUN-202609-0002', kind: '候选任务', status: '待确认', writeStatus: '未写入',
      origin: '会议纪要', owner: 'U-001', age: '历史待处理',
      sourceVersion: '会议纪要《远驰科技周例会》2026-09-11',
      sourceRef: { type: '客户', id: 'CUS-202609-0001', name: '上海远驰汽车科技有限公司' },
      aiSuggestion: { '任务名称': '汇总竞品服务响应对比材料', '截止时间': '2026-09-18 18:00', '业务类型': '客户跟进', '责任人': '张岚' },
      finalValue: null, diff: '',
      fieldEvidence: [{ k: '任务名称', certainty: '事实', evidence: '会议纪要决议第 3 条' }],
      relatedObjects: [{ type: '客户', id: 'CUS-202609-0001' }],
      meetingBatch: 'MTG-202609-0001', meetingTitle: '远驰科技周例会',
      confirmedBy: '', confirmedAt: '', writtenObjectId: '', writtenAt: '',
      idemKey: 'IDEM-CAND-202609-0006', failReason: '', failKind: '',
      createdAt: '2026-09-11 17:20'
    },
    {
      id: 'CAND-202609-0007', runId: 'RUN-202609-0002', kind: '候选任务', status: '已忽略', writeStatus: '未写入',
      origin: '会议纪要', owner: 'U-001', age: '历史待处理',
      sourceVersion: '会议纪要《远驰科技周例会》2026-09-11',
      sourceRef: { type: '客户', id: 'CUS-202609-0001', name: '上海远驰汽车科技有限公司' },
      aiSuggestion: { '任务名称': '预约客户参观工厂', '截止时间': '2026-09-20 18:00', '业务类型': '客户跟进' },
      finalValue: null, diff: '',
      fieldEvidence: [{ k: '任务名称', certainty: '推断', evidence: '会议中提到“以后可以来看看”，未形成决议' }],
      relatedObjects: [],
      meetingBatch: 'MTG-202609-0001', meetingTitle: '远驰科技周例会',
      confirmedBy: '', confirmedAt: '', writtenObjectId: '', writtenAt: '',
      idemKey: 'IDEM-CAND-202609-0007', ignoreReason: '会议未形成决议，不需要创建任务',
      failReason: '', failKind: '',
      createdAt: '2026-09-11 17:20'
    },
    {
      id: 'CAND-202609-0008', runId: 'RUN-202609-0002', kind: '候选销售活动', status: '已确认', writeStatus: '写入成功',
      origin: '文字输入', owner: 'U-002', age: '当前',
      sourceVersion: '文字输入 2026-09-19 11:05（本次原始输入）',
      sourceRef: { type: '线索', id: 'LED-202609-0138', name: '盈川新能源集采咨询' },
      aiSuggestion: { '沟通方式': '电话沟通', '沟通对象': '盈川新能源集采联系人', '沟通内容': '首次接触，确认集采范围与主体', '下一步动作': '确认采购主体' },
      finalValue: { '沟通方式': '电话沟通', '沟通对象': '盈川新能源集采联系人', '沟通内容': '首次接触，确认集采范围与主体，客户尚未确定采购主体', '下一步动作': '确认采购主体' },
      diff: '沟通内容补充“客户尚未确定采购主体”',
      fieldEvidence: [{ k: '沟通方式', certainty: '事实', evidence: '“打了电话”' }],
      relatedObjects: [{ type: '线索', id: 'LED-202609-0138' }],
      confirmedBy: 'U-002', confirmedAt: '2026-09-19 11:18', writtenObjectId: 'ACT-202609-0101', writtenAt: '2026-09-19 11:18',
      idemKey: 'IDEM-CAND-202609-0008', failReason: '', failKind: '',
      createdAt: '2026-09-19 11:10'
    },
    {
      id: 'CAND-H5-TASK-001', runId: 'RUN-H5-TASK-001', kind: '候选任务', status: '待确认', writeStatus: '未写入',
      origin: '文字输入', owner: 'U-003', age: '当前',
      sourceVersion: '客户沟通记录（本次原始输入）',
      sourceRef: { type: '客户', id: 'CUS-202609-0001', name: '上海远驰汽车科技有限公司' },
      aiSuggestion: { '任务名称': '核对远驰科技报价反馈并明确下一步评审时间', '截止时间': taskExampleDate(2), '业务类型': '客户跟进', '责任人': 'U-003' },
      finalValue: null, diff: '',
      fieldEvidence: [
        { k: '任务名称', certainty: '事实', evidence: '沟通记录提到“核对报价反馈并确认评审时间”' },
        { k: '截止时间', certainty: '推断', evidence: '按“这周内”推断，需人工核对具体日期' },
        { k: '责任人', certainty: '事实', evidence: '沟通记录由王栩发起' }
      ],
      relatedObjects: [{ type: '客户', id: 'CUS-202609-0001', name: '上海远驰汽车科技有限公司' }],
      confirmedBy: '', confirmedAt: '', writtenObjectId: '', writtenAt: '',
      idemKey: 'IDEM-CAND-H5-TASK-001', failReason: '', failKind: '',
      createdAt: taskExampleDate(-1)
    },
    {
      id: 'CAND-H5-TASK-002', runId: 'RUN-H5-TASK-002', kind: '候选任务', status: '待确认', writeStatus: '未写入',
      origin: '会议纪要', owner: 'U-003', age: '历史待处理',
      sourceVersion: '远驰科技机会周会纪要（评审样例）',
      sourceRef: { type: '客户', id: 'CUS-202609-0001', name: '上海远驰汽车科技有限公司' },
      aiSuggestion: { '任务名称': '补充远驰科技方案评审资料', '截止时间': taskExampleDate(4), '业务类型': '商机推进', '责任人': 'U-003' },
      finalValue: null, diff: '',
      fieldEvidence: [{ k: '任务名称', certainty: '事实', evidence: '会议纪要决议要求补充评审资料' }],
      relatedObjects: [{ type: '客户', id: 'CUS-202609-0001', name: '上海远驰汽车科技有限公司' }],
      confirmedBy: '', confirmedAt: '', writtenObjectId: '', writtenAt: '',
      idemKey: 'IDEM-CAND-H5-TASK-002', failReason: '', failKind: '',
      createdAt: taskExampleDate(-8)
    },
    {
      id: 'CAND-PC-TASK-001', runId: 'RUN-PC-TASK-001', kind: '候选任务', status: '待确认', writeStatus: '未写入',
      origin: '会议纪要', owner: 'U-006', age: '当前',
      sourceVersion: '远驰科技方案评审会议纪要（PC 演示样例）',
      sourceRef: { type: '商机', id: 'OPP-202609-0042', name: '远驰科技车电业务线年度框架' },
      aiSuggestion: { '任务名称': '跟进远驰科技方案评审意见', '截止时间': taskExampleDate(3), '业务类型': '商机推进', '责任人': 'U-001' },
      finalValue: null, diff: '',
      fieldEvidence: [
        { k: '任务名称', certainty: '事实', evidence: '会议纪要明确提出跟进方案评审意见' },
        { k: '截止时间', certainty: '推断', evidence: '按会议中“本周内”推算，需人工核对' }
      ],
      relatedObjects: [{ type: '商机', id: 'OPP-202609-0042', name: '远驰科技车电业务线年度框架' }],
      confirmedBy: '', confirmedAt: '', writtenObjectId: '', writtenAt: '',
      idemKey: 'IDEM-CAND-PC-TASK-001', failReason: '', failKind: '',
      createdAt: taskExampleDate(-1)
    },
    {
      id: 'CAND-PC-TASK-002', runId: 'RUN-PC-TASK-002', kind: '候选任务', status: '待确认', writeStatus: '未写入',
      origin: '文字输入', owner: 'U-006', age: '当前', sourceVersion: '客户跟进记录（本次原始输入）',
      sourceRef: { type: '客户', id: 'CUS-202609-0002', name: '广州盈川新能源集团有限公司' },
      aiSuggestion: { '任务名称': '确认盈川新能源年度采购排期', '截止时间': taskExampleDate(2), '业务类型': '客户跟进', '责任人': 'U-002' },
      finalValue: null, diff: '',
      fieldEvidence: [{ k: '任务名称', certainty: '事实', evidence: '原文明确要求跟进年度采购排期' }, { k: '截止时间', certainty: '事实', evidence: '原文明确约定两天内答复' }],
      relatedObjects: [{ type: '客户', id: 'CUS-202609-0002', name: '广州盈川新能源集团有限公司' }],
      confirmedBy: '', confirmedAt: '', writtenObjectId: '', writtenAt: '',
      idemKey: 'IDEM-CAND-PC-TASK-002', failReason: '', failKind: '', createdAt: taskExampleDate(-1)
    },
    {
      id: 'CAND-PC-TASK-003', runId: 'RUN-PC-TASK-003', kind: '候选任务', status: '待确认', writeStatus: '未写入',
      origin: '大圆企微文档', owner: 'U-006', age: '当前', sourceVersion: '启途汽车项目沟通纪要（评审样例）',
      sourceRef: { type: '客户', id: 'CUS-202609-0009', name: '宁波启途汽车电子有限公司' },
      aiSuggestion: { '任务名称': '整理启途汽车试点方案问题清单', '截止时间': '', '业务类型': '商机推进', '责任人': 'U-001' },
      finalValue: null, diff: '',
      fieldEvidence: [{ k: '任务名称', certainty: '事实', evidence: '文档列出需要整理的问题项' }, { k: '截止时间', certainty: '缺失', evidence: '文档未给出明确完成时间，确认前须补齐' }],
      relatedObjects: [{ type: '客户', id: 'CUS-202609-0009', name: '宁波启途汽车电子有限公司' }],
      confirmedBy: '', confirmedAt: '', writtenObjectId: '', writtenAt: '',
      idemKey: 'IDEM-CAND-PC-TASK-003', failReason: '', failKind: '', createdAt: taskExampleDate(-2)
    },
    {
      id: 'CAND-PC-TASK-004', runId: 'RUN-PC-TASK-004', kind: '候选任务', status: '待确认', writeStatus: '未写入',
      origin: '会议纪要', owner: 'U-006', age: '历史待处理', sourceVersion: '新能源业务线项目周会纪要（评审样例）',
      sourceRef: { type: '商机', id: 'OPP-202609-0043', name: '盈川新能源项目' },
      aiSuggestion: { '任务名称': '补充盈川新能源 POC 验证材料', '截止时间': taskExampleDate(-2), '业务类型': '商机推进', '责任人': 'U-002' },
      finalValue: null, diff: '',
      fieldEvidence: [{ k: '任务名称', certainty: '事实', evidence: '周会决议提出补充 POC 验证材料' }, { k: '截止时间', certainty: '推断', evidence: '会议仅说尽快完成；原建议时间已过，需人工重定' }],
      relatedObjects: [{ type: '商机', id: 'OPP-202609-0043', name: '盈川新能源项目' }],
      confirmedBy: '', confirmedAt: '', writtenObjectId: '', writtenAt: '',
      idemKey: 'IDEM-CAND-PC-TASK-004', failReason: '', failKind: '', createdAt: taskExampleDate(-7)
    },
    {
      id: 'CAND-PC-TASK-005', runId: 'RUN-PC-TASK-005', kind: '候选任务', status: '待确认', writeStatus: '未写入',
      origin: '录音文件', owner: 'U-006', age: '当前', sourceVersion: '客户电话沟通转写（评审样例）',
      sourceRef: { type: '客户', id: 'CUS-202609-0010', name: '深圳驰绿能源科技有限公司' },
      aiSuggestion: { '任务名称': '向驰绿能源发送交付案例', '截止时间': taskExampleDate(1), '业务类型': '客户跟进', '责任人': 'U-001' },
      finalValue: null, diff: '',
      fieldEvidence: [{ k: '任务名称', certainty: '事实', evidence: '通话中明确承诺发送交付案例' }, { k: '截止时间', certainty: '推断', evidence: '通话只说“明天发”，需确认具体时间' }],
      relatedObjects: [{ type: '客户', id: 'CUS-202609-0010', name: '深圳驰绿能源科技有限公司' }],
      confirmedBy: '', confirmedAt: '', writtenObjectId: '', writtenAt: '',
      idemKey: 'IDEM-CAND-PC-TASK-005', failReason: '', failKind: '', createdAt: taskExampleDate(-1)
    }
  ];

  /* ==================================================== 08 知识文档 KB- */

  var knowledge = [
    {
      id: 'KB-202609-0001', code: 'KB-PROD-CE', title: '车电业务线标准销售作业指引', version: 'V3', status: '已发布',
      scope: '指定业务线：车电业务线', allowDownload: true, allowShare: true, owner: 'U-004',
      publishedAt: '2026-08-20 10:00', summary: '车电业务线从线索到签约的标准动作、阶段任务与交付要点。',
      body: '一、适用范围\n车电业务线全部标准销售场景。\n\n二、关键动作\n1. 线索阶段：确认采购主体与预算区间，判断是否具备转换条件。\n2. 商机阶段：进入「机会确认」后必须补齐预计成交时间，方可推进至「需求确认」。\n3. 方案验证：提交技术方案初稿并完成客户需求初访纪要。\n\n三、常见问题\n客户对跨区域交付能力有顾虑时，应先提供交付案例与售后响应承诺。',
      history: [{ version: 'V1', at: '2026-05-10', by: '李澄', note: '首次发布' }, { version: 'V2', at: '2026-07-02', by: '李澄', note: '补充阶段门槛说明' }, { version: 'V3', at: '2026-08-20', by: '李澄', note: '补充跨区域交付应答口径' }]
    },
    {
      id: 'KB-202609-0002', code: 'KB-OPP-GATE', title: '商机阶段门槛与阶段任务说明', version: 'V2', status: '已发布',
      scope: '全员', allowDownload: true, allowShare: false, owner: 'U-004',
      publishedAt: '2026-09-01 09:30', summary: '五统一阶段、详细阶段门槛、阶段任务生成与失效口径。',
      body: '一、统一阶段\n机会确认 → 需求确认 → 方案验证 → 报价与审批 → 商务与合同。\n\n二、门槛\n0.1 只支持两类门槛：必填字段、必须完成阶段任务。不支持条件免办或主管绕过。\n预计成交时间是系统固定门槛，任何模板和角色都不能关闭。\n\n三、阶段任务\n进入详细阶段后按冻结模板直接生成正式任务。必做任务只有「已完成」满足门槛。因上下文变化不再适用时由系统置为「已失效」。',
      history: [{ version: 'V1', at: '2026-06-15', by: '李澄', note: '首次发布' }, { version: 'V2', at: '2026-09-01', by: '李澄', note: '同步预计成交时间门槛为系统固定门槛' }]
    },
    {
      id: 'KB-202609-0003', code: 'KB-CUS-DUP', title: '客户建档查重与资料维护口径', version: 'V1', status: '已发布',
      scope: '指定角色：R1、R2、R4', allowDownload: false, allowShare: false, owner: 'U-005',
      publishedAt: '2026-09-10 14:00', summary: '分层查重、待治理数据质量标签、资料权限控制与修改历史。',
      body: '一、分层查重\n统一社会信用代码规范化后全库精确相同必须阻断；客户名称相同或高度相似只做强提示，说明后可继续创建。\n\n二、资料维护\n客户资料按编辑权限控制；有权限者直接修改并立即生效，无权限者只读。\n\n三、修改历史\n客户字段修改统一记录修改时间、修改人、修改字段、修改前内容和修改后内容。',
      history: [{ version: 'V1', at: '2026-09-10', by: '周珂', note: '首次发布' }]
    },
    {
      id: 'KB-202609-0004', code: 'KB-VISIT-RULE', title: '正式拜访执行与异常说明指引', version: 'V1', status: '已发布',
      scope: '指定业务线：车电业务线、新能源业务线', allowDownload: true, allowShare: true, owner: 'U-004',
      publishedAt: '2026-09-12 11:00', summary: '签到签退、完成门槛、定位失败与异常复核口径。',
      body: '一、完成门槛\n有效签到或已说明的异常签到 + 签退 + 拜访总结。图片和附件不作为完成阻断项。\n\n二、定位失败\n定位服务不可用时允许填写原因后继续，不采集连续轨迹，不自动认定无效。\n\n三、异常复核\n异常状态（待复核／待补充／已复核）与拜访主状态独立。批量复核只允许同规则版本、同结论且无需销售补充的记录。',
      history: [{ version: 'V1', at: '2026-09-12', by: '李澄', note: '首次发布' }]
    },
    {
      id: 'KB-202609-0005', code: 'KB-RPT-GUIDE', title: '日报提交与主管建议口径', version: 'V1', status: '草稿',
      scope: '全员', allowDownload: false, allowShare: false, owner: 'U-004',
      publishedAt: '', summary: '日报三层模型、提交冻结与主管建议只追加。',
      body: '一、三层模型\n首次 AI 原始底稿 → 当前工作草稿 → 正式提交版本。\n\n二、提交\n提交时冻结正文、事实快照和来源；提交后不退回、不重提、不编辑。同一人员与同一日期始终只有一份当前草稿。\n\n三、主管建议\n建议只追加，发布后不得编辑、删除或撤回；新建议不重置他人阅读状态。',
      history: [{ version: '草稿', at: '2026-09-21', by: '李澄', note: '创建草稿' }]
    },
    {
      id: 'KB-202609-0006', code: 'KB-OLD-LEAD', title: '线索池旧版分配规则（已停用）', version: 'V1', status: '已停用',
      scope: '全员', allowDownload: false, allowShare: false, owner: 'U-004',
      publishedAt: '2026-04-01 09:00', deactivatedAt: '2026-08-15 09:00',
      summary: '旧版按区域池分配线索的做法，已停用，不再作为 Agent 新回答来源。',
      body: '（已停用）旧版按区域池与池优先级分配线索，含自动路由与默认池回退。该做法已退出 0.1 有效规则，停用后不进入普通搜索，也不作为 Agent 新回答的知识来源。',
      history: [{ version: 'V1', at: '2026-04-01', by: '李澄', note: '首次发布' }, { version: 'V1', at: '2026-08-15', by: '李澄', note: '停用' }]
    }
  ];

  /* ==================================================== 07/08 消息模板与投递 */

  var messageTemplates = [
    { id: 'MT-001', code: 'MSG-TASK-ASSIGN', name: '主管指派任务', title: '你有一条新的指派任务', body: '${责任人}，${指派人} 于 ${时间} 指派任务「${任务名称}」，截止 ${截止时间}。', vars: ['责任人', '指派人', '时间', '任务名称', '截止时间'], event: '主管指派任务', wecom: true, status: '启用' },
    { id: 'MT-002', code: 'MSG-TASK-DUE', name: '任务即将到期', title: '任务即将到期提醒', body: '任务「${任务名称}」将于 ${截止时间} 到期，请及时处理。', vars: ['任务名称', '截止时间'], event: '任务进入提醒窗口', wecom: true, status: '启用' },
    { id: 'MT-004', code: 'MSG-RPT-ADVICE', name: '日报新增主管建议', title: '你的日报有一条新的主管建议', body: '${日期} 日报新增主管建议，请查看。', vars: ['日期'], event: '日报新增建议', wecom: false, status: '启用' },
    { id: 'MT-005', code: 'MSG-VISIT-EXC', name: '拜访异常待复核', title: '有拜访异常待复核', body: '${负责人} 的拜访（${客户}）命中规则「${规则}」，待复核。', vars: ['负责人', '客户', '规则'], event: '拜访异常进入待复核', wecom: true, status: '启用' },
    { id: 'MT-006', code: 'MSG-EXPORT-DONE', name: '异步导出完成', title: '导出任务${结果}', body: '你发起的导出「${任务名称}」已${结果}，请在处理记录中领取，文件保留 7 天。', vars: ['任务名称', '结果'], event: '异步导出完成或失败', wecom: false, status: '启用' },
    { id: 'MT-007', code: 'MSG-CONFIG-FAIL', name: '配置发布失败', title: '配置发布失败', body: '${配置名称} 发布失败：${原因}。旧版本继续生效，草稿已保留。', vars: ['配置名称', '原因'], event: 'B 类配置或指标发布失败', wecom: true, status: '启用' },
    { id: 'MT-008', code: 'MSG-EXC-ASSIGN', name: '异常事项待处理', title: '有新的异常事项待处理', body: '${对象} 产生异常事项「${类型}」，请领取处理。', vars: ['对象', '类型'], event: '创建统一异常事项', wecom: true, status: '启用' }
  ];

  var messageDeliveries = [
    { id: 'MD-0001', msgId: 'MSG-202609-0291', event: '主管指派任务', receiver: 'U-001', receiverSnapshot: '张岚', channel: '站内', template: 'MSG-TASK-ASSIGN', target: { type: '任务', id: 'TSK-202609-0091' }, idemKey: 'MSG-TSK-202609-0091-ASSIGN-V1', deliveryStatus: '成功', readStatus: '已读', retryCount: 0, failReason: '', at: '2026-09-18 09:10', readAt: '2026-09-18 09:30' },
    { id: 'MD-0002', msgId: 'MSG-202609-0292', event: '主管指派任务', receiver: 'U-001', receiverSnapshot: '张岚', channel: '企业微信', template: 'MSG-TASK-ASSIGN', target: { type: '任务', id: 'TSK-202609-0091' }, idemKey: 'MSG-TSK-202609-0091-ASSIGN-V1', deliveryStatus: '成功', readStatus: '未读', retryCount: 1, failReason: '', at: '2026-09-18 09:10', readAt: '' },
    { id: 'MD-0003', msgId: 'MSG-202609-0301', event: '拜访异常进入待复核', receiver: 'U-003', receiverSnapshot: '王栩', channel: '站内', template: 'MSG-VISIT-EXC', target: { type: '正式拜访', id: 'VH-202609-0002' }, idemKey: 'MSG-VH-202609-0002-EXC-V1', deliveryStatus: '成功', readStatus: '未读', retryCount: 0, failReason: '', at: '2026-09-20 11:31', readAt: '' },
    { id: 'MD-0004', msgId: 'MSG-202609-0302', event: '拜访异常进入待复核', receiver: 'U-003', receiverSnapshot: '王栩', channel: '企业微信', template: 'MSG-VISIT-EXC', target: { type: '正式拜访', id: 'VH-202609-0002' }, idemKey: 'MSG-VH-202609-0002-EXC-V1', deliveryStatus: '失败', readStatus: '未读', retryCount: 3, failReason: '企业微信接口返回 45009：接口调用超过限制', at: '2026-09-20 11:31', readAt: '' },
    { id: 'MD-0005', msgId: 'MSG-202609-0310', event: '日报新增建议', receiver: 'U-001', receiverSnapshot: '张岚', channel: '站内', template: 'MSG-RPT-ADVICE', target: { type: '日报', id: 'RPT-202609-0001' }, idemKey: 'MSG-RPT-202609-0001-ADV-V1', deliveryStatus: '成功', readStatus: '未读', retryCount: 0, failReason: '', at: '2026-09-21 08:45', readAt: '' },
    { id: 'MD-0006', msgId: 'MSG-202609-0315', event: '异步导出完成', receiver: 'U-002', receiverSnapshot: '王栩', channel: '站内', template: 'MSG-EXPORT-DONE', target: { type: '处理记录', id: 'JOB-202609-0011' }, idemKey: 'MSG-JOB-202609-0011-DONE-V1', deliveryStatus: '成功', readStatus: '已读', retryCount: 0, failReason: '', at: '2026-09-21 10:40', readAt: '2026-09-21 11:00' },
    { id: 'MD-0007', msgId: 'MSG-202609-0320', event: '客户合并失效', receiver: 'U-001', receiverSnapshot: '张岚', channel: '站内', template: 'MSG-TASK-ASSIGN', target: { type: '客户', id: 'CUS-202609-0006' }, idemKey: 'MSG-CUS-202609-0006-MERGE-V1', deliveryStatus: '待发送', readStatus: '未读', retryCount: 0, failReason: '', at: '2026-09-21 15:00', readAt: '' }
  ];

  /* ==================================================== 08 集成与同步 */

  var externalSystems = [
    { id: 'EXT-001', name: '公司用户中心', env: '生产', owner: 'U-006', serviceIdentity: 'SVC-UC-SYNC', capability: '组织与人员事件读取、销售准入资格', direction: '读入', mappingReleasable: false, status: '启用', health: '正常', lastHealthAt: '2026-09-21 20:00', note: '组织、人员与销售准入资格事实源；工号缺失／冲突／格式异常不创建正式人员' },
    { id: 'EXT-002', name: '企业微信认证', env: '生产', owner: 'U-006', serviceIdentity: 'SVC-WECOM-AUTH', capability: '消费公司既有 ZR 工号认证结果', direction: '读入', mappingReleasable: false, status: '启用', health: '正常', lastHealthAt: '2026-09-21 20:00', note: '不建设绑定、改绑或人工身份映射；未绑定或认证失效时拒绝登录' },
    { id: 'EXT-003', name: '企业微信日程', env: '生产', owner: 'U-006', serviceIdentity: 'SVC-WECOM-CAL', capability: '独立日程与正式拜访的受限双向同步（白名单字段）', direction: '受限双向', mappingReleasable: true, status: '启用', health: '降级', lastHealthAt: '2026-09-21 19:30', note: '企微取消外部日程不能自动取消正式拜访；API 不支持完整双向时降级为单向同步' },
    { id: 'EXT-004', name: '大圆（在线文档）', env: '生产', owner: 'U-004', serviceIdentity: 'SVC-DAYUAN-READ', capability: '读取瑞赢可读的企微文档，作为 Agent 输入与证据', direction: '读入', mappingReleasable: true, status: '启用', health: '正常', lastHealthAt: '2026-09-21 18:00', note: '能力尚待技术验证；大圆文档不直接成为瑞赢正式业务事实' },
    { id: 'EXT-005', name: 'Coze（私有化）', env: '生产', owner: 'U-006', serviceIdentity: 'SVC-COZE-ORCH', capability: '模型、Prompt、Agent／Workflow、知识检索流程与 AI 工具编排', direction: '能力提供方', mappingReleasable: false, status: '启用', health: '正常', lastHealthAt: '2026-09-21 20:00', note: '不得绕过瑞赢候选与人工确认直接写 CRM' },
    { id: 'EXT-006', name: '业务线管理系统', env: '生产', owner: 'U-004', serviceIdentity: 'SVC-BL-READ', capability: '公司业务线与产品定义的稳定引用', direction: '读入', mappingReleasable: true, status: '启用', health: '异常', lastHealthAt: '2026-09-21 16:10', note: '主业务线与场景多匹配／缺失／服务异常均阻断商机创建，不使用通用模板兜底' },
    { id: 'EXT-007', name: '统一文件存储', env: '生产', owner: 'U-006', serviceIdentity: 'SVC-FILE-RW', capability: '录音、图片和文件的原件存储', direction: '读写', mappingReleasable: true, status: '启用', health: '正常', lastHealthAt: '2026-09-21 20:00', note: '已有原件不重复存储；Agent 只保存文件 ID 与当次解析版本' },
    { id: 'EXT-008', name: '公司知识库', env: '生产', owner: 'U-004', serviceIdentity: 'SVC-KB-READ', capability: '公司级知识原件、版本、审批与源权限引用', direction: '读入', mappingReleasable: false, status: '启用', health: '正常', lastHealthAt: '2026-09-21 20:00', note: '公司级知识事实源；瑞赢文档与公司知识引用必须标明各自事实源' },
    { id: 'EXT-009', name: '企微消息提醒渠道', env: '生产', owner: 'U-006', serviceIdentity: 'SVC-WECOM-MSG', capability: '白名单重要事件的额外提醒推送', direction: '写出', mappingReleasable: true, status: '启用', health: '降级', lastHealthAt: '2026-09-21 19:00', note: '用户不能自行配置企微事件；投递失败不回滚来源业务' }
  ];

  var syncJobs = [
    { id: 'SYNC-202609-0001', system: '企业微信日程', object: '独立日程', objectId: 'SCH-202609-0002', direction: '瑞赢 → 企微', externalId: '', idemKey: 'SYNC-SCH-202609-0002-V1', status: '失败', executedAt: '2026-09-20 09:00', lastSuccessAt: '2026-09-18 10:00', failReason: '企微日历接口超时', retryCount: 3, maxRetry: 3, exceptionId: 'EXC-202609-0002' },
    { id: 'SYNC-202609-0002', system: '企业微信日程', object: '独立日程', objectId: 'SCH-202609-0001', direction: '瑞赢 → 企微', externalId: 'WX-SCH-88213', idemKey: 'SYNC-SCH-202609-0001-V1', status: '成功', executedAt: '2026-09-19 10:00', lastSuccessAt: '2026-09-19 10:00', failReason: '', retryCount: 0, maxRetry: 3, exceptionId: '' },
    { id: 'SYNC-202609-0003', system: '公司用户中心', object: '人员', objectId: 'PSY-0001', direction: '用户中心 → 瑞赢', externalId: 'UC-EVT-77120', idemKey: 'SYNC-PERSON-U-00X-V1', status: '失败', executedAt: '2026-09-21 08:00', lastSuccessAt: '2026-09-20 08:00', failReason: '工号格式异常，无法唯一匹配身份', retryCount: 1, maxRetry: 3, exceptionId: '' },
    { id: 'SYNC-202609-0004', system: '业务线管理系统', object: '业务线', objectId: 'BL-JR', direction: '业务线系统 → 瑞赢', externalId: 'EXT-BL-JR', idemKey: 'SYNC-BL-JR-V2', status: '成功', executedAt: '2026-09-15 03:00', lastSuccessAt: '2026-09-15 03:00', failReason: '', retryCount: 0, maxRetry: 3, exceptionId: '' },
    { id: 'SYNC-202609-0005', system: '大圆（在线文档）', object: 'Agent 输入来源', objectId: 'RUN-202609-0002', direction: '大圆 → 瑞赢', externalId: 'DY-DOC-55231', idemKey: 'SYNC-RUN-202609-0002-V3', status: '成功', executedAt: '2026-09-18 16:10', lastSuccessAt: '2026-09-18 16:10', failReason: '', retryCount: 0, maxRetry: 3, exceptionId: '' },
    { id: 'SYNC-202609-0006', system: '企业微信日程', object: '正式拜访', objectId: 'VH-202609-0003', direction: '瑞赢 → 企微', externalId: '', idemKey: 'SYNC-VH-202609-0003-V1', status: '待处理', executedAt: '', lastSuccessAt: '', failReason: '', retryCount: 0, maxRetry: 3, exceptionId: '' }
  ];

  var peopleSyncIssues = [
    { id: 'PSY-0001', empNo: 'E21017', name: '（未创建）', event: '用户中心人员事件', issue: '工号格式异常', detail: '收到的工号为 "e21017 "，含空格且前缀小写，不匹配公司 ZR 工号格式；身份无法唯一匹配', status: '待处理', at: '2026-09-21 08:00', note: '异常工号不创建正式人员；需用户中心侧修正后重新推送' },
    { id: 'PSY-0002', empNo: 'E21022', name: '（未创建）', event: '用户中心人员事件', issue: '工号冲突', detail: '同一工号先后推送两个不同的企微身份，无法唯一匹配', status: '待处理', at: '2026-09-20 09:12', note: '异常工号不创建正式人员' },
    { id: 'PSY-0003', empNo: 'E21009', name: '孙迪', event: '企微认证结果', issue: '认证失效', detail: '企微侧认证状态为失效，登录被拒绝', status: '处理中', at: '2026-09-19 14:00', note: 'R5 只能查看认证状态与错误原因，不能修改外部认证事实' }
  ];

  var permissionPending = [
    {
      id: 'PP-0001', userId: 'U-002', userName: '陈默', trigger: '组织调整', at: '2026-09-20 10:00',
      detail: '销售资格范围变化：原华东区域 + 华南区域 → 仅保留华东区域',
      stoppedScope: '华南区域数据范围（RG-SOUTH）', keptScope: '华东区域数据范围（RG-EAST）、车电与新能源业务线',
      status: '待处理', affected: [
        { type: '客户经营关系', id: 'CBL-202609-0004', name: '广州盈川新能源集团 · 华南区域／车务业务线' },
        { type: '线索', id: 'LED-202609-0139', name: '华南汽车服务集团集采意向' }
      ],
      note: '不自动授予新范围；不自动完成业务移交；仅停止受影响旧范围并保留未变化范围'
    },
    {
      id: 'PP-0002', userId: 'U-001', userName: '张岚', trigger: '主管配置变化', at: '2026-09-21 09:30',
      detail: '唯一主直属主管配置变化，影响需验收任务的验收人解析',
      stoppedScope: '—', keptScope: '全部现有数据范围',
      status: '处理中', affected: [{ type: '任务', id: 'TSK-202609-0093', name: '整理栖达车务续约报价单' }],
      note: '仅影响验收人解析，不改变数据范围'
    }
  ];

  var handovers = [
    {
      id: 'HO-0001', userId: 'U-002', userName: '陈默', empNo: 'E21002', reason: '人员离岗',
      at: '2026-09-21 09:00', status: '待确认', precheckAt: '2026-09-21 09:05',
      items: [
        { type: '客户经营责任', id: 'CBL-202609-0002', name: '上海远驰汽车科技 · 华东／车务业务线', receiver: 'U-001', result: '', note: '' },
        { type: '客户经营责任', id: 'CBL-202609-0003', name: '广州盈川新能源集团 · 华东／新能源业务线', receiver: 'U-001', result: '', note: '含协作人张岚，可直接承接' },
        { type: '未结线索', id: 'LED-202609-0138', name: '盈川新能源集采咨询（待处理）', receiver: 'U-001', result: '', note: '需接收人具备新能源业务线资格' },
        { type: '未关闭商机', id: 'OPP-202609-0042', name: '远驰科技车电业务线年度框架', receiver: '', result: '', note: '无合适接收人时保持待移交，不自动进入公海' },
        { type: '未完成任务', id: 'TSK-202609-0094', name: '盈川新能源集采线索首次电话接触', receiver: 'U-001', result: '', note: '' },
        { type: '待验收任务', id: 'TSK-202609-0095', name: '补充弘远车务客户关系备注', receiver: 'U-003', result: '', note: '已拒绝状态不计入待办' }
      ],
      note: '先立即停用，再处理移交；不能等待移交完成或为移交重新启用账号。历史事实保留原人员和工号。'
    },
    {
      id: 'HO-0002', userId: 'U-005', userName: '周珂', empNo: 'E21005', reason: '资格失效',
      at: '2026-09-18 16:00', status: '部分成功', precheckAt: '2026-09-18 16:05',
      items: [
        { type: '客户经营责任', id: 'CBL-202609-0005', name: '苏州弘远车务 · 华东／车务业务线', receiver: 'U-001', result: '成功', note: '' },
        { type: '未完成任务', id: 'TSK-202609-0096', name: '阶段任务：确认商务条款与合同主体', receiver: 'U-001', result: '失败', note: '源任务已失效，移交失败' }
      ],
      note: '执行支持部分成功和失败重试，成功项不重复；历史责任保留'
    }
  ];

  /* ==================================================== 07/08 异常事项与数据质量 */

  var qualityRules = [
    { id: 'QR-001', code: 'QR-CUS-COMPLETE', name: '客户关键字段完整性', type: '完整度缺失', version: 'V1', status: '启用', scope: '客户主档', threshold: '统一社会信用代码、客户名称、主体类型、注册地址', lastRunAt: '2026-09-21 02:00', hitCount: 1, note: '组织客户与个体工商户允许暂缺信用代码，缺失生成治理类异常但不阻断经营' },
    { id: 'QR-002', code: 'QR-CUS-DUP', name: '客户疑似重复', type: '疑似重复', version: 'V1', status: '启用', scope: '客户主档', threshold: '规范化名称完全一致或信用代码精确相同', lastRunAt: '2026-09-21 02:00', hitCount: 1, note: '精确重复阻断创建；疑似重复仅提示' },
    { id: 'QR-003', code: 'QR-OPP-KEY', name: '商机关键字段完整性', type: '完整度缺失', version: 'V1', status: '启用', scope: '商机', threshold: '客户、商机名称、主业务线、销售场景、预计成交时间（离开机会确认前）', lastRunAt: '2026-09-21 02:00', hitCount: 1, note: '' },
    { id: 'QR-004', code: 'QR-SYNC-MAP', name: '关键映射缺失', type: '关键映射缺失', version: 'V1', status: '启用', scope: '集成与同步', threshold: '外部系统稳定标识与瑞赢对象映射缺失', lastRunAt: '2026-09-21 02:00', hitCount: 1, note: '' },
    { id: 'QR-005', code: 'QR-SYNC-ERR', name: '同步异常', type: '同步异常', version: 'V2', status: '启用', scope: '集成与同步', threshold: '同步任务失败超过自动重试上限', lastRunAt: '2026-09-21 02:00', hitCount: 2, note: 'V2 默认只用于后续检测；历史数据重检由 R3／R5 手工发起' }
  ];

  var qualityIssues = [
    { id: 'QI-0001', ruleCode: 'QR-CUS-COMPLETE', ruleVersion: 'V1', type: '完整度缺失', objectType: '客户', objectId: 'CUS-202609-0003', objectName: '上海栖达汽车服务部', missingFields: ['统一社会信用代码'], resultStatus: '当前存在', detectedAt: '2026-09-21 02:00', exceptionId: 'EXC-202609-0001', ignoredReason: '', note: '个体工商户，允许暂缺信用代码；不阻断经营' },
    { id: 'QI-0002', ruleCode: 'QR-CUS-DUP', ruleVersion: 'V1', type: '疑似重复', objectType: '客户', objectId: 'CUS-202609-0006', objectName: '上海远驰汽车科技（上海）', missingFields: [], resultStatus: '已消除', detectedAt: '2026-09-10 02:00', exceptionId: '', ignoredReason: '', note: '人工核对后问题消除' },
    { id: 'QI-0003', ruleCode: 'QR-OPP-KEY', ruleVersion: 'V1', type: '完整度缺失', objectType: '商机', objectId: 'OPP-202609-0043', objectName: '栖达车务续约二期', missingFields: ['预计成交时间'], resultStatus: '当前存在', detectedAt: '2026-09-21 02:00', exceptionId: '', ignoredReason: '', note: '商机仍处于「机会确认」，离开该阶段前必须补齐；当前不阻断' },
    { id: 'QI-0004', ruleCode: 'QR-SYNC-MAP', ruleVersion: 'V1', type: '关键映射缺失', objectType: '独立日程', objectId: 'SCH-202609-0002', objectName: '华东大区周经营例会', missingFields: ['外部系统稳定标识'], resultStatus: '当前存在', detectedAt: '2026-09-21 02:00', exceptionId: 'EXC-202609-0002', ignoredReason: '', note: '同步失败导致未建立外部映射' },
    { id: 'QI-0005', ruleCode: 'QR-SYNC-ERR', ruleVersion: 'V2', type: '同步异常', objectType: '独立日程', objectId: 'SCH-202609-0002', objectName: '华东大区周经营例会', missingFields: [], resultStatus: '当前存在', detectedAt: '2026-09-21 02:00', exceptionId: 'EXC-202609-0002', ignoredReason: '', note: '' },
    { id: 'QI-0006', ruleCode: 'QR-CUS-COMPLETE', ruleVersion: 'V1', type: '完整度缺失', objectType: '客户', objectId: 'CUS-202609-0005', objectName: '王建国', missingFields: [], resultStatus: '已忽略', detectedAt: '2026-09-06 02:00', exceptionId: '', ignoredReason: '自然人客户按最小范围采集，不要求信用代码', note: '' }
  ];

  /* ==================================================== 06 管理分析 24 个正式指标 */
  /* 指标编码不可修改；当前仅一个生效版本；未知／不可计算／无分母显示「—」，只有确定为零显示 0。 */
  var metrics = [
    { code: 'MET-CUS-TOTAL', name: '客户总数', theme: '客户经营', type: '当前状态', unit: '个', formula: '当前权限和筛选范围内有效客户数（按客户 ID 去重）', timeField: '数据截止时间', source: '客户主档', filter: '当前有权客户', dedupe: '按客户 ID', scopeField: '当前归属（区域／业务线／负责人）', refresh: '30 分钟', drill: '客户模板', owner: 'U-004', version: 'V1', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00' },
    { code: 'MET-CUS-NEW', name: '新增客户数', theme: '客户经营', type: '发生型', unit: '个', formula: '周期内首次创建的有效客户数', timeField: '业务事件时间（首次创建）', source: '客户主档', filter: '当前有权客户', dedupe: '按客户 ID', scopeField: '事件发生时组织／负责人快照', refresh: '30 分钟', drill: '客户模板', owner: 'U-004', version: 'V1', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00' },
    { code: 'MET-CUS-OPERATING', name: '当前经营客户数', theme: '客户经营', type: '当前状态', unit: '个', formula: '当前至少一条有效经营关系的客户数', timeField: '数据截止时间', source: '客户主档＋经营关系', filter: '经营关系状态＝有效', dedupe: '按客户 ID', scopeField: '当前归属', refresh: '30 分钟', drill: '客户模板＋经营关系', owner: 'U-004', version: 'V1', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00' },
    { code: 'MET-CUS-NEWREL', name: '新增经营关系客户数', theme: '客户经营', type: '发生型', unit: '个', formula: '周期内至少新建一条有效经营关系的客户数', timeField: '业务事件时间（新建经营关系）', source: '客户主档＋经营关系', filter: '经营关系状态＝有效', dedupe: '周期内按客户 ID', scopeField: '事件发生时快照', refresh: '30 分钟', drill: '客户模板＋经营关系', owner: 'U-004', version: 'V1', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00' },
    { code: 'MET-OPP-TOTAL', name: '商机总数', theme: '商机推进', type: '当前状态', unit: '个', formula: '当前有效商机数，含进行中和已结束', timeField: '数据截止时间', source: '商机', filter: '无', dedupe: '按商机 ID', scopeField: '当前归属', refresh: '30 分钟', drill: '商机模板', owner: 'U-004', version: 'V1', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00' },
    { code: 'MET-OPP-NEW', name: '新增商机数', theme: '商机推进', type: '发生型', unit: '个', formula: '周期内新创建商机数', timeField: '业务事件时间（创建）', source: '商机', filter: '无', dedupe: '按商机 ID', scopeField: '事件发生时快照', refresh: '30 分钟', drill: '商机模板', owner: 'U-004', version: 'V1', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00' },
    { code: 'MET-OPP-OPEN', name: '推进中商机数', theme: '商机推进', type: '当前状态', unit: '个', formula: '当前进行中商机数', timeField: '数据截止时间', source: '商机', filter: '过程状态＝进行中', dedupe: '按商机 ID', scopeField: '当前归属', refresh: '30 分钟', drill: '商机模板', owner: 'U-004', version: 'V1', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00' },
    { code: 'MET-OPP-STAGE', name: '阶段分布', theme: '商机推进', type: '当前状态', unit: '个', formula: '推进中商机按五个统一阶段统计数量和占比', timeField: '数据截止时间', source: '商机', filter: '过程状态＝进行中', dedupe: '按商机 ID', scopeField: '当前归属', refresh: '30 分钟', drill: '分布指标按所点分类进入', owner: 'U-004', version: 'V1', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00' },
    { code: 'MET-OPP-CLOSED', name: '已结束商机数', theme: '商机结果', type: '发生型', unit: '个', formula: '周期内发生正式结束结果事件的商机数', timeField: '原业务结束时间', source: '商机', filter: '关闭结果∈赢单／输单／关闭', dedupe: '按商机 ID', scopeField: '事件发生时快照', refresh: '30 分钟', drill: '商机模板＋最终结果时间', owner: 'U-004', version: 'V1', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00' },
    { code: 'MET-OPP-WON', name: '赢单商机数', theme: '商机结果', type: '发生型', unit: '个', formula: '周期内当前确认正式结果为赢单的商机数', timeField: '原业务结束时间', source: '商机', filter: '关闭结果＝赢单', dedupe: '按商机 ID', scopeField: '事件发生时快照', refresh: '30 分钟', drill: '商机模板＋最终结果时间', owner: 'U-004', version: 'V1', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00' },
    { code: 'MET-OPP-LOST', name: '输单商机数', theme: '商机结果', type: '发生型', unit: '个', formula: '周期内当前确认正式结果为输单的商机数', timeField: '原业务结束时间', source: '商机', filter: '关闭结果＝输单', dedupe: '按商机 ID', scopeField: '事件发生时快照', refresh: '30 分钟', drill: '商机模板＋最终结果时间', owner: 'U-004', version: 'V1', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00' },
    { code: 'MET-OPP-WINRATE', name: '赢单率', theme: '商机结果', type: '发生型', unit: '%', formula: '赢单 ÷（赢单 + 输单）；关闭不进入分母', timeField: '原业务结束时间', source: '商机', filter: '分母不含关闭', dedupe: '按商机 ID', scopeField: '事件发生时快照', refresh: '30 分钟', drill: '比率指标展示完整分母并区分符合／不符合', owner: 'U-004', version: 'V1', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00' },
    { code: 'MET-TSK-SHOULD', name: '应完成任务数', theme: '执行闭环', type: '发生型', unit: '个', formula: '有效截止时间落在周期内的正式任务数', timeField: '任务有效截止时间', source: '任务', filter: '排除已取消／已失效', dedupe: '按任务 ID', scopeField: '事件发生时快照', refresh: '30 分钟', drill: '任务模板＋原／有效截止时间、实际完成时间、是否逾期完成', owner: 'U-004', version: 'V1', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00' },
    { code: 'MET-TSK-DONE', name: '已完成任务数', theme: '执行闭环', type: '发生型', unit: '个', formula: '应完成任务中截至数据截止时间已完成的任务数', timeField: '任务有效截止时间', source: '任务', filter: '状态＝已完成', dedupe: '按任务 ID', scopeField: '事件发生时快照', refresh: '30 分钟', drill: '任务模板', owner: 'U-004', version: 'V1', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00' },
    { code: 'MET-TSK-RATE', name: '任务完成率', theme: '执行闭环', type: '发生型', unit: '%', formula: '已完成任务 ÷ 应完成任务；只回答最终是否完成，逾期后完成仍计完成', timeField: '任务有效截止时间（延期通过后用新有效截止时间）', source: '任务', filter: '排除已取消／已失效', dedupe: '按任务 ID', scopeField: '事件发生时快照', refresh: '30 分钟', drill: '任务模板＋逾期完成标记', owner: 'U-004', version: 'V1', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00' },
    { code: 'MET-RPT-RATE', name: '日报提交率', theme: '执行闭环', type: '发生型', unit: '%', formula: '已提交单元 ÷ 应提交单元；最小统计单元＝人员 × 应提交日期', timeField: '应提交日期', source: '日报', filter: '草稿不计提交', dedupe: '人员 × 应提交日期', scopeField: '事件发生时快照', refresh: '30 分钟', drill: '日报模板（日期、人员、团队、应提交状态、提交状态、提交时间）', owner: 'U-004', version: 'V1', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00' },
    { code: 'MET-OPP-STALL', name: '停滞商机数', theme: '时效异常', type: '当前状态', unit: '个', formula: '超过绑定流程版本当前阶段阈值、未发生有效推进且进行中商机数', timeField: '数据截止时间；计时起点＝max(进入当前阶段时间, 当前阶段内最后有效推进时间)', source: '商机＋流程模板', filter: '过程状态＝进行中且停滞天数 > 阈值', dedupe: '按商机 ID', scopeField: '当前归属', refresh: '30 分钟', drill: '商机模板＋停滞天数、停滞阈值、最后有效推进时间、规则版本', owner: 'U-004', version: 'V1', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00' },
    { code: 'MET-TSK-SOON', name: '即将到期任务数', theme: '时效异常', type: '当前状态', unit: '个', formula: '当前未完成、尚未逾期且进入当前提醒窗口的任务数', timeField: '数据截止时间；窗口＝数据截止时间 < 有效截止时间 ≤ 数据截止时间 + 当前提醒窗口', source: '任务', filter: '状态＝待处理', dedupe: '按任务 ID', scopeField: '当前归属', refresh: '30 分钟', drill: '任务模板', owner: 'U-004', version: 'V1', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00' },
    { code: 'MET-TSK-OVERDUE', name: '已逾期任务数', theme: '时效异常', type: '当前状态', unit: '个', formula: '有效截止时间早于数据截止时间且当前未完成的任务数', timeField: '数据截止时间', source: '任务', filter: '状态＝待处理', dedupe: '按任务 ID', scopeField: '当前归属', refresh: '30 分钟', drill: '任务模板＋逾期时长', owner: 'U-004', version: 'V1', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00' },
    { code: 'MET-TSK-OVDRATE', name: '逾期任务率', theme: '时效异常', type: '当前状态', unit: '%', formula: '当前逾期未完成任务 ÷ 当前未完成且有有效截止时间任务', timeField: '数据截止时间；不受时间范围控制，受区域、团队、负责人、业务线筛选影响', source: '任务', filter: '分母＝当前未完成且有有效截止时间', dedupe: '按任务 ID', scopeField: '当前归属', refresh: '30 分钟', drill: '任务模板＋判定与不符合原因', owner: 'U-004', version: 'V1', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00' },
    { code: 'MET-CUS-COMPLETE', name: '客户关键字段完整率', theme: '数据质量', type: '当前状态', unit: '%', formula: '当前关键字段完整的有效客户 ÷ 当前有效客户', timeField: '数据截止时间', source: '客户主档', filter: '当前有权客户', dedupe: '按客户 ID', scopeField: '当前归属', refresh: '30 分钟', drill: '客户模板＋缺失字段', owner: 'U-004', version: 'V1', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00' },
    { code: 'MET-OPP-COMPLETE', name: '商机关键字段完整率', theme: '数据质量', type: '当前状态', unit: '%', formula: '当前关键字段完整的有效商机 ÷ 当前有效商机', timeField: '数据截止时间', source: '商机', filter: '无', dedupe: '按商机 ID', scopeField: '当前归属', refresh: '30 分钟', drill: '商机模板＋缺失字段', owner: 'U-004', version: 'V1', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00' },
    { code: 'MET-CUS-MISSING', name: '客户缺失数据数', theme: '数据质量', type: '当前状态', unit: '个', formula: '当前至少缺失一个适用关键字段的有效客户数；一个对象缺多个字段仍只计一个对象', timeField: '数据截止时间', source: '客户主档', filter: '当前有权客户', dedupe: '按客户 ID', scopeField: '当前归属', refresh: '30 分钟', drill: '客户模板＋缺失字段', owner: 'U-004', version: 'V1', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00' },
    { code: 'MET-OPP-MISSING', name: '商机缺失数据数', theme: '数据质量', type: '当前状态', unit: '个', formula: '当前至少缺失一个适用关键字段的有效商机数', timeField: '数据截止时间', source: '商机', filter: '无', dedupe: '按商机 ID', scopeField: '当前归属', refresh: '30 分钟', drill: '商机模板＋缺失字段', owner: 'U-004', version: 'V1', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00' }
  ];

  var metricVersions = [
    { id: 'MV-001', code: 'MET-OPP-WINRATE', version: 'V1', status: '历史', publishedAt: '2026-06-01 09:00', effectiveAt: '2026-06-01 09:00', retiredAt: '2026-09-01 09:00', publisher: '李澄', change: '首次发布：赢单率＝赢单 ÷（赢单 + 输单）', note: '' },
    { id: 'MV-002', code: 'MET-OPP-WINRATE', version: 'V2', status: '生效', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00', retiredAt: '', publisher: '李澄', change: '明确关闭不进入分母；导出增加「指标判定：符合／不符合」', note: '发布成功时间即新版本生效时间；历史不自动重算' },
    { id: 'MV-003', code: 'MET-TSK-RATE', version: 'V1', status: '生效', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00', retiredAt: '', publisher: '李澄', change: '首次发布：按有效截止时间归属周期，逾期后完成仍计完成', note: '' },
    { id: 'MV-004', code: 'MET-RPT-RATE', version: 'V1', status: '生效', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00', retiredAt: '', publisher: '李澄', change: '首次发布：以人员×应提交日期为最小单元，单日展示人数、跨日展示人次', note: '' },
    { id: 'MV-005', code: 'MET-CUS-COMPLETE', version: 'V1', status: '生效', publishedAt: '2026-09-01 09:00', effectiveAt: '2026-09-01 09:00', retiredAt: '', publisher: '李澄', change: '首次发布：当前关键字段完整的有效客户 ÷ 当前有效客户', note: '' }
  ];

  /* ==================================================== 06 业务配置（A/B 类） */

  var cusPoolRule = {
    code: 'CFG-CUS-POOL', name: '全国公海规则', category: 'A 类', fixed: true,
    claimActions: { '认领': true, '分派': true },
    holdLimit: 30, holdLimitNote: '主管默认不能突破',
    protectEnabled: true, protectDays: 30, protectNote: '保护期只在从公海分派或认领成功时生成，以服务端事务时间起算；活动不自动续期，到期不自动回收',
    recycleMode: '最后一条有效经营关系停止后自动入池', recycleNote: '不提供主动释放或主管回收入口',
    history: [{ at: '2026-06-01 09:00', by: '李澄', action: '首次配置', from: '', to: '持有上限 30、保护期 30 天', reason: '' }, { at: '2026-09-12 10:00', by: '李澄', action: '修改持有上限', from: '持有上限 20', to: '持有上限 30', reason: '试点区域销售人均有效经营关系数上升' }]
  };

  var regionRules = [
    { code: 'RG-EAST', name: '华东区域', externalCode: 'EXT-RG-EAST', crmMapping: 'RG-EAST', scope: '全部业务线', status: '启用', history: [{ at: '2026-05-01 09:00', by: '李澄', action: '首次配置', from: '', to: '启用', reason: '' }] },
    { code: 'RG-SOUTH', name: '华南区域', externalCode: 'EXT-RG-SOUTH', crmMapping: 'RG-SOUTH', scope: '全部业务线', status: '启用', history: [{ at: '2026-05-01 09:00', by: '李澄', action: '首次配置', from: '', to: '启用', reason: '' }] },
    { code: 'RG-NORTH', name: '华北区域', externalCode: 'EXT-RG-NORTH', crmMapping: 'RG-NORTH', scope: '全部业务线', status: '启用', history: [{ at: '2026-05-01 09:00', by: '李澄', action: '首次配置', from: '', to: '启用', reason: '' }] }
  ];

  var taskRules = [
    {
      id: 'TR-001', code: 'TR-ASSIGN-V1', name: '主管指派任务来源规则', category: 'B 类', version: 'V1', status: '生效', scope: '全部业务线',
      sourceRule: '主管指派', needAccept: false, rejectAllowed: false, acceptRule: '指派后直接待处理',
      flowProps: '填写成果后由负责人直接完成', dueRule: '指派时必填截止时间', remindRule: '进入当前提醒窗口时提醒（窗口参数见管理参数）', acceptorRule: '',
      publishedAt: '2026-06-01 09:00', publisher: '李澄',
      history: [{ version: 'V1', at: '2026-06-01 09:00', by: '李澄', action: '立即发布', note: '首次发布' }]
    },
    {
      id: 'TR-002', code: 'TR-STAGE-V1', name: '阶段任务生成规则', category: 'B 类', version: 'V1', status: '生效', scope: '全部业务线',
      sourceRule: '规则生成（阶段生成）', needAccept: false, rejectAllowed: false, acceptRule: '直接进入待处理',
      flowProps: '负责人直接完成', dueRule: '按阶段模板偏移生成截止时间', remindRule: '同意图',
      acceptorRule: '',
      publishedAt: '2026-06-01 09:00', publisher: '李澄',
      history: [{ version: 'V1', at: '2026-06-01 09:00', by: '李澄', action: '立即发布', note: '首次发布' }]
    },
    {
      id: 'TR-003', code: 'TR-SELF-V1', name: '自建任务默认规则', category: 'B 类', version: 'V1', status: '生效', scope: '全部业务线',
      sourceRule: '自建任务', needAccept: false, rejectAllowed: false, acceptRule: '直接进入待处理',
      flowProps: '默认负责人直接完成', dueRule: '创建人填写', remindRule: '同意图', acceptorRule: '',
      publishedAt: '2026-06-01 09:00', publisher: '李澄',
      history: [{ version: 'V1', at: '2026-06-01 09:00', by: '李澄', action: '立即发布', note: '首次发布' }]
    },
    {
      id: 'TR-004', code: 'TR-AI-V1', name: '沟通提炼任务规则', category: 'B 类', version: 'V1', status: '生效', scope: '全部业务线',
      sourceRule: '沟通提炼', needAccept: false, rejectAllowed: false, acceptRule: '候选确认后进入待处理',
      flowProps: '默认负责人直接完成；必须关联来源销售活动', dueRule: '候选确认时填写', remindRule: '同意图', acceptorRule: '',
      publishedAt: '2026-06-01 09:00', publisher: '李澄',
      history: [{ version: 'V1', at: '2026-06-01 09:00', by: '李澄', action: '立即发布', note: '首次发布' }]
    },
    {
      id: 'TR-005', code: 'TR-ASSIGN-V2', name: '主管指派任务来源规则（草稿）', category: 'B 类', version: 'V2（草稿）', status: '草稿', scope: '全部业务线',
      sourceRule: '主管指派', needAccept: false, rejectAllowed: false, acceptRule: '指派后直接待处理',
      flowProps: '负责人直接完成；创建人可改期或取消', dueRule: '指派时必填截止时间', remindRule: '进入提醒窗口后提醒 2 次', acceptorRule: '',
      publishedAt: '', publisher: '李澄',
      history: [{ version: 'V2（草稿）', at: '2026-09-21 15:00', by: '李澄', action: '保存草稿', note: '待校验后发布' }]
    }
  ];

  var visitRules = [
    {
      id: 'VR-001', code: 'VR-V1', familyCode: 'VR', name: '正式拜访真实性规则', category: 'B 类', version: 'V1', status: '生效', scope: '全部业务线、全部拜访类型', scopeSpec: { businessLines: [], regions: [], users: [], visitTypes: [] },
      radius: 500, accuracy: 50, duration: 10, imageRequired: false,
      checkRule: '签到半径 500 米、定位精度 ≤50 米、最短停留 10 分钟；图片不作为完成阻断项',
      exceptionRule: '定位异常或命中规则时标记待复核，允许说明原因继续，不采集连续轨迹，不自动认定无效',
      publishedAt: '2026-06-01 09:00', publisher: '李澄',
      history: [{ version: 'V1', at: '2026-06-01 09:00', by: '李澄', action: '立即发布', note: '首次发布' }]
    },
    {
      id: 'VR-002', code: 'VR-CE-V2', familyCode: 'VR-CE', name: '车电业务线拜访真实性规则（草稿）', category: 'B 类', version: 'V2（草稿）', status: '草稿', scope: '车电业务线', scopeSpec: { businessLines: ['BL-CE'], regions: [], users: [], visitTypes: [] },
      radius: 300, accuracy: 30, duration: 15, imageRequired: true,
      checkRule: '签到半径 300 米、定位精度 ≤30 米、最短停留 15 分钟、需上传现场图片',
      exceptionRule: '同 V1', publishedAt: '', publisher: '李澄',
      history: [{ version: 'V2（草稿）', at: '2026-09-20 17:00', by: '李澄', action: '保存草稿', note: '待校验后发布' }]
    }
  ];

  var agentConfig = {
    code: 'CFG-AGENT', name: 'Agent 配置', fixed: true,
    abilities: [
      { code: 'AB-ORG', name: '沟通整理', requiredSources: ['文字输入'], optionalSources: ['大圆企微文档', '录音文件', '图片文件', '会议纪要'], scopeRequired: true, pregen: false, enabled: true, note: '核心阻断输入为文字／粘贴' },
      { code: 'AB-MTG', name: '会议任务确认', requiredSources: ['会议纪要'], optionalSources: ['大圆企微文档'], scopeRequired: true, pregen: false, enabled: true, note: '只能生成任务候选，支持人工批量确认' },
      { code: 'AB-OBJ', name: '对象 AI', requiredSources: ['有权正式对象'], optionalSources: ['瑞赢知识'], scopeRequired: true, pregen: false, enabled: true, note: '只读摘要与问答，不写正式字段' },
      { code: 'AB-RPT', name: '日报底稿', requiredSources: ['有权正式对象'], optionalSources: [], scopeRequired: true, pregen: true, enabled: true, note: '固定时间预生成、不主动推送' },
      { code: 'AB-MGR', name: '主管关注', requiredSources: ['有权正式对象'], optionalSources: [], scopeRequired: true, pregen: true, enabled: true, note: '固定时间预生成、不主动推送' },
      { code: 'AB-TODAY', name: '今日预计处理任务总结', requiredSources: ['有权正式对象'], optionalSources: [], scopeRequired: true, pregen: true, enabled: true, note: '固定时间预生成、不主动推送' }
    ],
    sources: [
      { code: 'SRC-TEXT', name: '文字输入', kind: '必需', enabled: true, note: '核心阻断输入，其他来源不可用时仍可用' },
      { code: 'SRC-DAYUAN', name: '大圆企微文档', kind: '可选', enabled: true, note: '能力尚待技术验证；不直接成为正式业务事实' },
      { code: 'SRC-AUDIO', name: '录音文件', kind: '可选', enabled: true, note: '音频转写；失败降级为手工录入' },
      { code: 'SRC-IMAGE', name: '图片文件', kind: '可选', enabled: true, note: '' },
      { code: 'SRC-MEETING', name: '会议纪要', kind: '必需', enabled: true, note: '会议任务确认为必需来源' },
      { code: 'SRC-OBJECT', name: '有权正式对象', kind: '必需', enabled: true, note: '对象 AI、日报底稿与预生成能力必需' },
      { code: 'SRC-KB', name: '瑞赢知识', kind: '可选', enabled: true, note: '只检索已发布且当前用户有权访问的版本' },
      { code: 'SRC-PHONE', name: '工作手机自动采集', kind: '未接入', enabled: false, note: '工作手机彻底退出 0.1，不进入本期' }
    ],
    pilots: [
      { code: 'PLT-EAST', name: '华东区域试点', userCount: 2, users: ['U-001', 'U-002'], blockedUsers: [] },
      { code: 'PLT-SOUTH', name: '华南区域试点', userCount: 0, users: [], blockedUsers: [{ id: 'U-007', name: '（未创建）', reason: '缺新能源业务线数据范围，无法启用' }] }
    ],
    pregen: [
      { code: 'PG-TODAY', name: '今日预计处理任务总结', ability: 'AB-TODAY', at: '08:30', owner: 'SVC-PREGEN', enabled: true, lastRunAt: '2026-09-21 08:30' },
      { code: 'PG-MGR', name: '主管关注摘要', ability: 'AB-MGR', at: '08:45', owner: 'SVC-PREGEN', enabled: true, lastRunAt: '2026-09-21 08:45' },
      { code: 'PG-RPT', name: '日报底稿', ability: 'AB-RPT', at: '18:00', owner: 'SVC-PREGEN', enabled: true, lastRunAt: '2026-09-21 18:00' }
    ],
    historyBacklogDays: 7,
    history: [{ at: '2026-06-01 09:00', by: '李澄', action: '首次配置', from: '', to: '启用沟通整理、会议任务确认、对象 AI、日报底稿、主管关注、今日总结', reason: '' }, { at: '2026-09-15 10:00', by: '李澄', action: '关闭来源', from: '工作手机自动采集：启用', to: '工作手机自动采集：关闭', reason: '工作手机彻底退出 0.1' }]
  };

  /* ============================================================== 其他治理数据 */

  /* -------------------------------------------------------------- 审计摘要 */

  var audits = [
    { id: 'AUD-0001', at: '2026-09-18 16:40', actor: '张岚', source: 'PC', objectType: '客户', objectId: 'CUS-202609-0001', action: '普通字段编辑', result: '成功', from: '备注：—', to: '备注：车电业务线核心客户…' },
    { id: 'AUD-0002', at: '2026-09-15 10:20', actor: '张岚', source: 'PC', objectType: '客户', objectId: 'CUS-202609-0004', action: '提交高影响资料变更', result: '成功', from: '客户名称：苏州弘远车务有限公司', to: '客户名称：苏州弘远汽车服务有限公司' },
    { id: 'AUD-0003', at: '2026-09-10 09:00', actor: '王栩', source: 'PC', objectType: '客户经营关系', objectId: 'CBL-202609-0006', action: '停止最后一条有效经营关系', result: '成功', from: '有效｜主负责人：陈默', to: '停止经营｜客户已自动进入全国公海' },
    { id: 'AUD-0004', at: '2026-09-12 14:30', actor: '张岚', source: 'PC', objectType: '商机', objectId: 'OPP-202609-0042', action: '阶段推进', result: '成功', from: '详细阶段：商机资格确认', to: '详细阶段：客户需求初访' },
    { id: 'AUD-0005', at: '2026-09-18 09:30', actor: '张岚', source: 'PC', objectType: '客户', objectId: 'CUS-202609-0012', action: '新建客户及初始经营关系', result: '成功', from: '—', to: '中瑞数科演示客户｜华东区域｜车电业务线｜主负责人：张岚' },
    { id: 'AUD-0006', at: '2026-09-22 11:00', actor: '周珂', source: 'PC', objectType: '客户', objectId: 'CUS-202609-0012', action: '修改字段·注册地址', result: '成功', from: '上海市徐汇区宜山路 680 号', to: '上海市徐汇区宜山路 700 号中瑞数字大厦 18 层' }
  ];

  /* 阶段生成属于规则生成正式任务；种子也只交付 tasks 一份对象集合。 */
  stageTasks.forEach(function (t) {
    var linked = opportunities.filter(function (o) { return o.id === t.oppId; })[0];
    tasks.unshift(Object.assign({}, t, {
      name: t.title, source: '规则生成', bizType: '阶段任务', stageTask: true, systemGenerated: true,
      collaborators: [], needAccept: false, acceptor: '',
      dueAt: t.due, doneAt: t.status === '已完成' ? t.enteredAt : '',
      related: { type: '商机', id: t.oppId, name: linked ? linked.name : t.oppId },
      flowSnapshot: { needAccept: false, acceptor: '', ruleCode: 'TR-STAGE-V1', ruleVersion: 'V1', frozenAt: t.enteredAt },
      ruleVersion: t.templateVersion, stageRound: 1, createdAt: t.enteredAt, createdBy: '系统',
      history: [{ at: t.enteredAt, actor: '系统', action: '阶段进入生成正式任务', from: '', to: t.status }]
    }));
  });

  return {
    meta: META, regions: regions, businessLines: businessLines, scenarios: scenarios, dicts: dicts,
    users: users, customers: customers, valueHistory: valueHistory, addresses: addresses,
    contacts: contacts, contactRelations: contactRelations, customerNetworks: customerNetworks,
    businessRelations: businessRelations, poolRecords: poolRecords, leadPools: leadPools, leads: leads,
    unifiedStages: unifiedStages, templates: templates, customFields: customFields,
    opportunities: opportunities, activities: activities,
    exceptions: exceptions, jobs: jobs, messages: messages, audits: audits,
    /* 04 任务、活动、拜访、日程、日报 */
    tasks: tasks, visits: visits, schedules: schedules, reports: reports,
    /* 05 Agent 运行与候选 */
    agentRuns: agentRuns, agentCandidates: agentCandidates,
    /* 08 知识与消息 */
    knowledge: knowledge, messageTemplates: messageTemplates, messageDeliveries: messageDeliveries,
    /* 08 集成与同步、人员同步异常 */
    externalSystems: externalSystems, syncJobs: syncJobs, peopleSyncIssues: peopleSyncIssues,
    /* 07 权限待处理与人员移交 */
    permissionPending: permissionPending, handovers: handovers,
    /* 07/08 异常事项与数据质量 */
    qualityRules: qualityRules, qualityIssues: qualityIssues,
    /* 06 指标、指标版本、业务配置与 Agent 配置 */
    metrics: metrics, metricVersions: metricVersions,
    cusPoolRule: cusPoolRule, regionRules: regionRules, taskRules: taskRules,
    visitRules: visitRules, agentConfig: agentConfig
  };
})();

/* 深拷贝种子数据，避免调用方污染初始事实。 */
RY.cloneSeed = function () {
  return JSON.parse(JSON.stringify(RY.seed));
};
