/* H5 review notes: fixed demo account, page contract in one panel, nearby rule tags. */
(function () {
  'use strict';
  if (!document.body || document.body.getAttribute('data-end') !== 'h5') return;
  var script = document.currentScript;
  var css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = script.src.replace(/js\/h5-page-notes\.js(?:\?.*)?$/, 'css/h5-page-notes.css');
  document.head.appendChild(css);
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
  function path() { return location.pathname.split('/prototype/').pop() || 'index.html'; }
  function item() { return RY.manifest && RY.manifest.byPath && RY.manifest.byPath[path()]; }
  function pageKey() {
    var p = path();
    if (p === 'index.html') return 'h5.home';
    var map = { opportunity: 'opp', calendar: 'calendar', message: 'message', knowledge: 'knowledge' };
    var parts = p.replace(/^h5\//, '').replace(/\.html$/, '').split('/');
    if (parts[0] === 'calendar') return 'h5.calendar';
    if (parts[0] === 'message') return 'h5.message';
    if (parts[0] === 'report' && parts[1] === 'detail') return 'h5.report.daily';
    if (parts[0] === 'task' && parts[1] === 'meeting') return 'h5.task.detail';
    if (parts[0] === 'visit' && parts[1] !== 'list') return 'h5.visit.detail';
    return 'h5.' + (map[parts[0]] || parts[0]) + '.' + (parts[1] === 'index' ? 'index' : parts[1]);
  }
  function contractCards() {
    return Array.prototype.filter.call(document.querySelectorAll('.ry-hcard h3'), function (h) { return h.textContent.trim() === '本页契约'; })
      .map(function (h) { return h.closest('.ry-hcard'); }).filter(Boolean);
  }
  function roleHtml() {
    var m = item(), raw = RY.perm.PAGES[pageKey()];
    var roleText = m ? m.roles : '';
    var allowed = raw || (roleText.indexOf('ALL5') >= 0 ? ['R1','R2','R3','R4','R5'] :
      ['R1','R2','R3','R4','R5'].filter(function (r) { return roleText.indexOf(r) >= 0; }));
    if (!allowed.length) allowed = ['R1','R2','R3','R4','R5'];
    var rows = [
      ['销售', allowed.indexOf('R1') >= 0, '本人负责、参与和获授权业务对象；池内与公海按成员及业务规则。'],
      ['销售主管／经理', allowed.indexOf('R2') >= 0, '增加本团队数据；主管动作进入源业务页面再校验。'],
      ['管理员（运营）', ['R3','R4','R5'].some(function (r) { return allowed.indexOf(r) >= 0; }), '可查看全部业务数据；操作仍受功能列表、按钮及业务规则约束。']
    ];
    return '<table class="h5n-roles"><thead><tr><th>正式角色</th><th>页面</th><th>数据与动作</th></tr></thead><tbody>' +
      rows.map(function (r) { return '<tr><th>' + r[0] + '</th><td>' + (r[1] ? '可进入' : '不开放') + '</td><td>' + r[2] + '</td></tr>'; }).join('') +
      '</tbody></table><p>功能列表决定页面入口；按钮、数据范围、对象状态和版本在每次动作时重新校验。当前固定演示账号为' +
      esc(RY.store.currentUser().name) + '，不提供页面内身份切换。</p>';
  }
  function contractHtml() {
    var cards = contractCards(), m = item();
    if (cards.length) return cards.map(function (card) {
      var body = card.querySelector('.ry-hcard__body');
      var copy = (body || card).cloneNode(true);
      Array.prototype.forEach.call(copy.querySelectorAll('li'), function (li) {
        var label = li.querySelector('span');
        if (label && label.textContent.trim() === '可进入角色') li.remove();
      });
      return '<div class="h5n-contract">' + copy.innerHTML + '</div>';
    }).join('');
    return '<dl><dt>页面契约</dt><dd>' + esc(m && m.contract || path()) + '</dd><dt>依据</dt><dd>' + esc(m && m.prd || '0.1 页面结构') +
      '</dd><dt>本页视图</dt><dd>' + esc(m && m.views ? m.views.join('、') : '以当前页面为准') + '</dd><dt>覆盖验收</dt><dd>' +
      esc(m && m.ac ? m.ac.join('、') : '见模块验收') + '</dd></dl>';
  }
  function openPanel() {
    closePop();
    var old = document.getElementById('ry-h5-notes'); if (old) old.remove();
    var mask = document.createElement('div'); mask.id = 'ry-h5-notes'; mask.className = 'h5n-mask';
    var m = item();
    if (path() === 'h5/customer/create.html') {
      mask.innerHTML = '<aside class="h5n-panel" role="dialog" aria-label="页面说明"><header><strong>页面说明</strong><button type="button" aria-label="关闭页面说明">×</button></header><h2>新建客户</h2>' +
        '<section class="h5n-contract-section"><table class="h5n-create-contract"><thead><tr><th>页面编号</th><th>适用端</th><th>依据</th></tr></thead><tbody><tr>' +
          '<td>' + esc(m && m.contract || 'PG-CUS-CREATE') + '</td>' +
          '<td>' + esc(m && m.end || 'H5') + '</td>' +
          '<td>' + esc(m && m.prd || 'prd/01') + '</td></tr></tbody></table>' +
          '<dl><dt>覆盖范围</dt><dd>' + esc(m && m.views ? m.views.join('、') : '客户与初始经营关系创建') + '</dd>' +
          '<dt>验收项</dt><dd>' + esc(m && m.ac ? m.ac.join('、') : '见客户模块验收') + '</dd></dl></section>' +
        '<section><h3>页面功能与规则</h3><p>创建客户主档及初始经营关系，可选填首位联系人。集团客户只提交候选；自然人不采集工商登记及首位联系人。</p><p>信用代码规范化后全库精确重复阻断；名称相同或相似时说明原因后可继续。工商查询失败仍可手工建档。客户资料有对应编辑权限时直接修改并记录前后值。</p><p>正式新建受页面及创建按钮权限控制；黄色标签仅供评审，不能证明正式服务端鉴权、唯一性和并发控制。</p></section>' +
        '<section class="h5n-section"><h3>字段要求</h3><h4>客户主体</h4><div class="h5n-table-wrap"><table class="h5n-field-table"><thead><tr><th>字段名称</th><th>字段类型</th><th>是否必填</th><th>备注</th></tr></thead><tbody><tr><td>客户类型</td><td>单选</td><td>是</td><td>集团客户、组织客户、个体工商户、自然人客户；自然人不显示工商登记和首位联系人。集团仅提交候选。</td></tr><tr><td>客户名称</td><td>文本框</td><td>是</td><td>填写正式完整名称；同名或相似时说明原因后可继续。</td></tr><tr><td>其他名称（简称／品牌名／曾用名）</td><td>文本框</td><td>否</td><td>参与搜索和疑似重复识别，不替代主名称。</td></tr><tr><td>客户来源</td><td>下拉选择</td><td>否</td><td>选项来自客户来源字典。</td></tr></tbody></table></div><h4>初始经营关系</h4><div class="h5n-table-wrap"><table class="h5n-field-table"><thead><tr><th>字段名称</th><th>字段类型</th><th>是否必填</th><th>备注</th></tr></thead><tbody><tr><td>负责人</td><td>下拉选择</td><td>是</td><td>默认创建人，可调整；选项为销售与销售主管。</td></tr><tr><td>经营区域</td><td>下拉选择</td><td>是</td><td>启用区域；负责人仅关联一个区域时自动带出，多区域时选择。</td></tr><tr><td>业务线</td><td>下拉选择</td><td>是</td><td>启用业务线；方向未明可选未明确业务线。</td></tr></tbody></table></div><h4>工商登记信息</h4><div class="h5n-table-wrap"><table class="h5n-field-table"><thead><tr><th>字段名称</th><th>字段类型</th><th>是否必填</th><th>备注</th></tr></thead><tbody><tr><td>统一社会信用代码</td><td>文本框</td><td>否</td><td>自然人不显示；规范化后全库精确相同阻断。</td></tr><tr><td>法定代表人</td><td>文本框</td><td>否</td><td>自然人不显示；可由工商查询结果带入并人工修订。</td></tr><tr><td>注册资本</td><td>文本框</td><td>否</td><td>自然人不显示；可由工商查询结果带入并人工修订。</td></tr><tr><td>成立日期</td><td>日期选择</td><td>否</td><td>自然人不显示；可由工商查询结果带入并人工修订。</td></tr><tr><td>所属行业</td><td>文本框</td><td>否</td><td>自然人不显示；可由工商查询结果带入并人工修订。</td></tr><tr><td>工商登记地址</td><td>文本框</td><td>否</td><td>自然人不显示；查询结果可带入并人工修订。</td></tr></tbody></table></div><h4>首位联系人</h4><div class="h5n-table-wrap"><table class="h5n-field-table"><thead><tr><th>字段名称</th><th>字段类型</th><th>是否必填</th><th>备注</th></tr></thead><tbody><tr><td>姓名</td><td>文本框</td><td>否</td><td>自然人不显示；填写后同步创建联系人及客户关系。</td></tr><tr><td>手机号</td><td>文本框</td><td>否</td><td>自然人不显示；与姓名一同用于疑似重复提示。</td></tr><tr><td>职务</td><td>文本框</td><td>否</td><td>自然人不显示。</td></tr></tbody></table></div><h4>备注</h4><div class="h5n-table-wrap"><table class="h5n-field-table"><thead><tr><th>字段名称</th><th>字段类型</th><th>是否必填</th><th>备注</th></tr></thead><tbody><tr><td>备注</td><td>文本域</td><td>否</td><td>记录建档背景或合作线索来源。</td></tr></tbody></table></div></section>';
      document.body.appendChild(mask);
      mask.addEventListener('click', function (e) { if (e.target === mask || e.target.closest('header button')) mask.remove(); });
      return;
    }
    mask.innerHTML = '<aside class="h5n-panel" role="dialog" aria-label="页面说明"><header><strong>页面说明</strong><button type="button" aria-label="关闭页面说明">×</button></header>' +
      '<h2>' + esc((document.title || '').split('·')[0].trim()) + '</h2>' +
      '<section><h3>页面功能</h3><p>' + esc(m && m.module || 'H5 前台业务页面') + '</p>' +
      (m && m.views ? '<ul>' + m.views.map(function (v) { return '<li>' + esc(v) + '</li>'; }).join('') + '</ul>' : '') + '</section>' +
      '<section><h3>角色与权限</h3>' + roleHtml() + '</section>' +
      '<section><h3>本页契约</h3>' + contractHtml() + '</section>' +
      '<section><h3>原型边界</h3><p>黄色标签解释页面规则；正式鉴权、并发和文件上传需由服务端执行。</p></section></aside>';
    document.body.appendChild(mask);
    mask.addEventListener('click', function (e) { if (e.target === mask || e.target.closest('header button')) mask.remove(); });
  }
  var pop;
  function closePop() { if (pop) { pop.remove(); pop = null; } }
  function shortLabel(text) {
    if (/权限|无权|身份|授权/.test(text)) return '权限规则';
    if (/范围|数据|数量|筛选/.test(text)) return '数据范围';
    if (/来源|证据|事实|推断/.test(text)) return '来源说明';
    if (/状态|逾期|待处理|已完成/.test(text)) return '状态规则';
    if (/提交|保存|确认|校验|失败/.test(text)) return '提交规则';
    if (/主管|团队/.test(text)) return '团队规则';
    return '页面规则';
  }
  function tagHint(el) {
    if (el.dataset.h5nDone || el.closest('.h5n-panel,.h5n-pop,.h5n-contract-hidden')) return;
    var text = el.textContent.trim();
    if (!text || text === '—') return;
    if (!el.classList.contains('h5-sec-note') && !el.classList.contains('ry-note') &&
        (text.length < 28 || !/权限|规则|范围|状态|逾期|候选|正式|来源|确认|保存|提交|失败|不可|不做|仅|只|需|必须|自动|按|原型/.test(text))) return;
    el.dataset.h5nDone = '1';
    el.classList.add('h5n-hidden-note');
    var badge = document.createElement('button'); badge.type = 'button'; badge.className = 'h5n-tag';
    var label = el.getAttribute('data-note-title') || shortLabel(text);
    badge.textContent = (document.querySelectorAll('.h5n-tag').length + 1) + ' ' + label;
    badge.setAttribute('aria-label', '查看' + label);
    el.parentNode.insertBefore(badge, el);
    badge.addEventListener('click', function (e) {
      e.stopPropagation(); closePop();
      var currentText = el.textContent.trim() || text;
      pop = document.createElement('div'); pop.className = 'h5n-pop';
      pop.innerHTML = '<div><b>' + esc(label) + '</b><button type="button" aria-label="关闭">×</button></div><p>' + esc(currentText) + '</p>';
      document.body.appendChild(pop);
      var r = badge.getBoundingClientRect();
      pop.style.left = Math.max(8, Math.min(r.left, innerWidth - pop.offsetWidth - 8)) + 'px';
      pop.style.top = Math.max(8, Math.min(r.bottom + 6, innerHeight - pop.offsetHeight - 8)) + 'px';
      pop.querySelector('button').addEventListener('click', closePop);
    });
  }
  var scheduled = false;
  function scan() {
    scheduled = false;
    contractCards().forEach(function (c) { c.classList.add('h5n-contract-hidden'); });
    document.querySelectorAll('.h5-sec-note,.ry-note,p.ry-hint').forEach(tagHint);
  }
  function schedule() { if (!scheduled) { scheduled = true; requestAnimationFrame(scan); } }
  document.addEventListener('click', function (e) { if (pop && !e.target.closest('.h5n-pop,.h5n-tag')) closePop(); });
  var button = document.getElementById('ry-hnotes'); if (button) button.addEventListener('click', openPanel);
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  schedule();
})();
