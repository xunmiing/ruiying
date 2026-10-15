/* 线索整条转换：PC/H5 共用的事务表单契约。 */
(function () {
  'use strict';
  var R = window.RY;
  R.leadConvertFlow = function (kind) {
    var ui = R.ui, S = R.store, P = R.perm, D = S.all('dicts');
    var id = ui.q('id') || (kind === 'pc' ? 'LED-202609-0137' : '');
    var from = ui.q('from') || 'list';
    var isDemo = kind === 'pc' && id === 'LED-DEMO-PC' && ui.q('demo') === '1';
    var lead = isDemo ? { id: id, raw: '远驰科技二期车电项目：客户计划十月选型，方案和预算仍待核实。', status: '跟进中', owner: 'U-001', candidateLines: ['BL-CE'] } : id && S.lead(id);
    var host = ui.qs(kind === 'pc' ? '#cv-form' : '#xc-host');
    var rows = [blank()];
    function blank() { return { name: '', owner: '', line: '', scene: '', close: '', scope: '', customerMode: 'link', customerId: '', reuseIndex: '', customer: {}, dupReason: '', contactMode: 'none', contactId: '', contact: {}, contactRoles: [] }; }
    function opts(items, value, label) { return items.map(function (x) { return { value: value(x), label: label(x) }; }); }
    function users() { return opts(S.all('users').filter(function (x) { return x.role === 'R1' || x.role === 'R2'; }), function (x) { return x.id; }, function (x) { return x.name; }); }
    function lines() { return opts(S.all('businessLines').filter(function (x) { return x.status === '启用'; }), function (x) { return x.code; }, function (x) { return x.name; }); }
    function regions() { return opts(S.activeRegions(), function (x) { return x.code; }, function (x) { return x.name; }); }
    function customers() { return opts(S.all('customers').filter(function (x) { return x.status === '正常' && P.inScope('customer', x); }), function (x) { return x.id; }, function (x) { return x.name + '（' + x.id + '）'; }); }
    function contacts() { return opts(S.all('contacts').filter(function (x) { return P.inScope('contact', x); }), function (x) { return x.id; }, function (x) { return x.name + '（' + x.id + '）'; }); }
    function field(name, label, content, required) { return ui.field(label, content, '', !!required); }
    function q(card, name) { return card.querySelector('[name="' + name + '"]'); }
    function val(card, name) { var x = card.querySelector('[name="' + name + '"]:checked') || q(card, name); return x ? x.value.trim() : ''; }
    function back() { return kind === 'pc' ? 'detail.html?id=' + encodeURIComponent(id) + (isDemo ? '&demo=1' : '') + '&from=' + encodeURIComponent(from) : R.nav.href('h5/lead/detail.html?id=' + encodeURIComponent(id) + '&from=' + encodeURIComponent(from)); }

    if (kind === 'pc') {
      R.nav.shell({ nav: 'lead.list', title: '线索整条转换', subtitle: '每条新商机分别选择客户；全部成功后线索才进入已转化。',
        crumbs: [{ label: '线索', href: 'pc/lead/list.html' }, { label: id }], actions: '<a class="ry-btn" href="' + back() + '">返回线索详情</a>' });
    } else {
      R.nav.h5shell({ title: '线索整条转换', sub: id, back: 'h5/lead/detail.html?id=' + encodeURIComponent(id), nav: 'lead', tabbar: false });
    }
    if (!lead || (!isDemo && !P.can('lead.convert', lead)) || lead.status === '已转化' || lead.status === '无效') {
      var msg = !lead ? '线索不存在或已不在你的数据范围内。' : lead.status === '已转化' || lead.status === '无效' ? '该线索当前为终态，不能发起转换。' : '当前账号没有该线索的转换权限。';
      (kind === 'pc' ? ui.qs('#cv-guard') : host).innerHTML = ui.banner(ui.esc(msg), 'danger') + '<a class="ry-btn" href="' + back() + '">返回线索详情</a>';
      return;
    }
    if (kind === 'pc') {
      ui.qs('#cv-body').style.display = '';
      ui.qs('#cv-lead').innerHTML = ui.banner('线索 <b>' + ui.esc(lead.id) + '</b>　' + ui.esc(String(lead.raw || '').slice(0, 90)) + (isDemo ? '　' + ui.tag('演示预览', 'brand') : ''), 'brand');
    }
    rows[0].name = String(lead.raw || '').slice(0, 18);
    rows[0].owner = lead.owner || S.currentUser().id;
    rows[0].line = (lead.candidateLines || [])[0] || '';

    function customerFields(o, i) {
      var reusable = rows.slice(0, i).map(function (prior, index) { return { prior: prior, index: index }; }).filter(function (x) { return x.prior.customerMode === 'create'; });
      var h = '<div class="ry-actions-row"><label class="ry-check"><input type="radio" name="customerMode' + i + '" value="link"' + (o.customerMode === 'link' ? ' checked' : '') + '> 关联已有客户</label> ' +
        '<label class="ry-check"><input type="radio" name="customerMode' + i + '" value="create"' + (o.customerMode === 'create' ? ' checked' : '') + '> 新建客户</label>' +
        (reusable.length ? ' <label class="ry-check"><input type="radio" name="customerMode' + i + '" value="reuse"' + (o.customerMode === 'reuse' ? ' checked' : '') + '> 复用本次新建客户</label>' : '') + '</div>';
      if (o.customerMode === 'reuse') return h + field('reuseIndex', '选择前面新建的客户', ui.select('reuseIndex', reusable.map(function (x) { return { value: String(x.index), label: '商机 ' + (x.index + 1) + '：' + (x.prior.customer.name || '未命名客户') }; }), o.reuseIndex), true);
      if (o.customerMode === 'link') return h + field('customerId', '选择客户', ui.select('customerId', [{ value: '', label: '请选择' }].concat(customers()), o.customerId), true);
      var c = o.customer || {};
      return h + ui.grid2(field('name', '客户名称', ui.input('cName', c.name || '', '与工商登记一致'), true), field('type', '主体类型', ui.select('cType', D.customerType, c.type || '组织客户'), true)) +
        ui.grid2(field('credit', '统一社会信用代码', ui.input('cCredit', c.creditCode || '', '可留空')), field('alias', '客户别名', ui.input('cAlias', c.alias || '', '可留空'))) +
        ui.grid2(field('owner', '初始经营关系主负责人', ui.select('cOwner', users(), c.owner || S.currentUser().id), true), field('region', '所属区域', ui.select('cRegion', regions(), c.region || ''), true)) +
        ui.grid2(field('line', '经营业务线', ui.select('cLine', lines(), c.businessLine || o.line), true), field('dup', '查重说明', ui.input('cDupReason', o.dupReason || '', '名称相似时填写'))) +
        (kind === 'pc' ? '' : '<p class="ry-hint">新客户与初始经营关系同事务创建；相同信用代码阻断，名称相似需填写查重说明。</p>');
    }
    function contactFields(o, i) {
      var h = '<div class="ry-actions-row">' + ['none', 'link', 'create'].map(function (m, n) {
        return '<label class="ry-check"><input type="radio" name="contactMode' + i + '" value="' + m + '"' + (o.contactMode === m ? ' checked' : '') + '> ' + ['不关联', '关联已有', '新建联系人'][n] + '</label>';
      }).join(' ') + '</div>';
      if (o.contactMode === 'none') return h;
      var c = o.contact || {};
      h += o.contactMode === 'link' ? field('contactId', '选择联系人', ui.select('contactId', [{ value: '', label: '请选择' }].concat(contacts()), o.contactId), true) :
        ui.grid2(field('name', '联系人姓名', ui.input('ctName', c.name || '', ''), true), field('phone', '正式联系人手机号', ui.input('ctPhone', c.phone || '', '可留空'))) +
        ui.grid2(field('title', '职务', ui.input('ctTitle', c.title || '', '')), field('dept', '部门', ui.input('ctDept', c.dept || '', '')));
      h += field('roles', '该客户下的联系人角色', '<div class="ry-actions-row">' + D.contactRole.map(function (r) {
        return '<label class="ry-check"><input type="checkbox" name="ctRole" value="' + ui.esc(r) + '"' + ((o.contactRoles || []).indexOf(r) >= 0 ? ' checked' : '') + '> ' + ui.esc(r) + '</label>';
      }).join('') + '</div>', true);
      return h;
    }
    function card(o, i) {
      var scenes = o.line ? S.scenarioOptions(o.line) : [];
      return '<section class="' + (kind === 'pc' ? 'cv-step' : 'xc-step') + '" data-convert-row="' + i + '"><div class="' + (kind === 'pc' ? 'cv-step__h' : 'xc-step__h') + '"><b>商机 ' + (i + 1) + '</b>' +
        (rows.length > 1 ? '<button class="ry-btn ry-btn--sm" type="button" data-remove="' + i + '">删除</button>' : '') + '</div><div class="' + (kind === 'pc' ? 'cv-step__b' : '') + '">' +
        field('name', '商机名称', ui.input('oName', o.name, ''), true) +
        ui.grid2(field('owner', '商机主负责人', ui.select('oOwner', users(), o.owner), true), field('line', '主业务线', ui.select('oLine', [{ value: '', label: '请选择' }].concat(lines()), o.line), true)) +
        field('scene', '销售场景', ui.select('oScene', [{ value: '', label: '请选择' }].concat(opts(scenes, function (s) { return s.code; }, function (s) { return s.name; })), o.scene), true) +
        ui.grid2(field('close', '预计成交时间', ui.input('oClose', o.close, 'YYYY-MM-DD')), field('scope', '本次范围说明', ui.input('oScope', o.scope, '可留空'))) +
        '<h4>该商机的客户</h4>' + customerFields(o, i) + '<h4>该客户的联系人</h4>' + contactFields(o, i) + '</div></section>';
    }
    function collect() {
      host.querySelectorAll('[data-convert-row]').forEach(function (card) {
        var i = Number(card.getAttribute('data-convert-row')), o = rows[i];
        o.name = val(card, 'oName'); o.owner = val(card, 'oOwner'); o.line = val(card, 'oLine'); o.scene = val(card, 'oScene');
        o.close = val(card, 'oClose'); o.scope = val(card, 'oScope');
        o.customerMode = val(card, 'customerMode' + i) || o.customerMode;
        o.contactMode = val(card, 'contactMode' + i) || o.contactMode;
        if (o.customerMode === 'link') o.customerId = val(card, 'customerId');
        else if (o.customerMode === 'reuse') o.reuseIndex = val(card, 'reuseIndex');
        else { o.customer = { name: val(card, 'cName'), type: val(card, 'cType'), creditCode: val(card, 'cCredit'), alias: val(card, 'cAlias'), owner: val(card, 'cOwner'), region: val(card, 'cRegion'), businessLine: val(card, 'cLine') }; o.dupReason = val(card, 'cDupReason'); }
        if (o.contactMode === 'link') o.contactId = val(card, 'contactId');
        else if (o.contactMode === 'create') o.contact = { name: val(card, 'ctName'), phone: val(card, 'ctPhone'), title: val(card, 'ctTitle'), dept: val(card, 'ctDept') };
        o.contactRoles = Array.from(card.querySelectorAll('[name="ctRole"]:checked')).map(function (x) { return x.value; });
      });
    }
    function problems() {
      var errors = [];
      rows.forEach(function (o, i) {
        var tag = '商机 ' + (i + 1) + '：';
        if (!o.name || !o.owner || !o.line || !o.scene) errors.push(tag + '名称、主负责人、主业务线和销售场景必填。');
        var owner = o.owner && S.user(o.owner);
        if (owner && (owner.businessLine || []).length && (owner.businessLine || []).indexOf(o.line) < 0) errors.push(tag + '主负责人不在该业务线的承接范围内。');
        if (o.line && o.scene && S.matchTemplate(o.line, o.scene).state !== 'ok') errors.push(tag + '没有唯一生效流程模板。');
        if (o.customerMode === 'link' && !o.customerId) errors.push(tag + '请选择客户。');
        if (o.customerMode === 'link' && o.customerId && (!S.customer(o.customerId) || S.customer(o.customerId).status !== '正常')) errors.push(tag + '所选客户已失效，请重新选择。');
        if (o.customerMode === 'reuse' && (!/^\d+$/.test(o.reuseIndex) || Number(o.reuseIndex) >= i || rows[Number(o.reuseIndex)].customerMode !== 'create')) errors.push(tag + '请选择前面已新建的客户。');
        if (o.customerMode === 'create') {
          if (!o.customer.name || !o.customer.owner || !o.customer.region || !o.customer.businessLine) errors.push(tag + '新客户名称及初始经营关系信息必填。');
          var credit = String(o.customer.creditCode || '').replace(/[\s-]/g, '').toUpperCase();
          var duplicate = S.all('customers');
          if (credit && duplicate.some(function (c) { return String(c.creditCode || '').replace(/[\s-]/g, '').toUpperCase() === credit; })) errors.push(tag + '统一社会信用代码已存在，请关联已有客户。');
          if (o.customer.name && duplicate.some(function (c) { return c.name === o.customer.name || c.name.indexOf(o.customer.name) >= 0 || o.customer.name.length > 3 && o.customer.name.indexOf(c.name) >= 0; }) && !o.dupReason) errors.push(tag + '客户名称与已有客户相似，请填写查重说明或关联已有客户。');
        }
        if (o.contactMode === 'link' && !o.contactId || o.contactMode === 'create' && !o.contact.name) errors.push(tag + '请补齐联系人。');
        if (o.contactMode !== 'none' && !o.contactRoles.length) errors.push(tag + '请选择联系人角色。');
      });
      return errors;
    }
    function payload() {
      return { fromStatus: lead.status, opportunities: rows.map(function (o) {
        return { name: o.name, owner: o.owner, businessLine: o.line, scene: o.scene, predictedClose: o.close, scope: o.scope,
          customerMode: o.customerMode, customerId: o.customerId, reuseIndex: o.reuseIndex, customer: o.customer, dupReason: o.dupReason,
          contactMode: o.contactMode, contactId: o.contactId, contact: Object.assign({}, o.contact, { roles: o.contactRoles }), contactRoles: o.contactRoles };
      }) };
    }
    function render() {
      host.innerHTML = (kind === 'pc' ? '' : ui.banner('一条线索可创建多条商机，每条商机分别选择客户和联系人。提交前一次校验；任一步失败则整条转换不生效。', 'brand')) +
        rows.map(card).join('') + '<div class="ry-actions-row"><button class="ry-btn" type="button" id="convert-add">＋ 新增商机</button>' +
        '<button class="ry-btn" type="button" id="convert-check">检查全部</button>' + (isDemo ? '' : '<button class="ry-btn ry-btn--primary" type="button" id="convert-submit">提交整条转换</button>') + '</div><div id="convert-message"></div>';
      host.querySelectorAll('[name^="customerMode"], [name^="contactMode"], [name="oLine"]').forEach(function (x) {
        x.addEventListener('change', function () { collect(); if (x.name === 'oLine') rows[Number(x.closest('[data-convert-row]').getAttribute('data-convert-row'))].scene = ''; render(); });
      });
      host.querySelectorAll('[data-remove]').forEach(function (x) { x.addEventListener('click', function () { collect(); rows.splice(Number(x.getAttribute('data-remove')), 1); render(); }); });
      host.querySelector('#convert-add').addEventListener('click', function () { collect(); var o = blank(); o.owner = lead.owner || S.currentUser().id; o.line = (lead.candidateLines || [])[0] || ''; rows.push(o); render(); });
      host.querySelector('#convert-check').addEventListener('click', function () { collect(); show(problems()); });
      if (!isDemo) host.querySelector('#convert-submit').addEventListener('click', function () {
        collect(); var errors = problems(); if (errors.length) { show(errors); return; }
        var result = S.convertLead(id, payload());
        if (!result.ok) { show(result.errors || [result.reason]); return; }
        if (kind === 'pc') window.location.href = 'convert-result.html?id=' + encodeURIComponent(id) + '&from=' + encodeURIComponent(from);
        else host.innerHTML = ui.banner('整条转换成功：已创建 ' + result.result.opportunities.length + ' 条商机，线索进入已转化。', 'brand') +
          result.result.opportunities.map(function (opp) {
            var customer = S.customer(opp.customerId);
            return '<div class="xc-step"><a href="' + R.nav.href('h5/opportunity/detail.html?id=' + encodeURIComponent(opp.id)) + '"><b>' + ui.esc(opp.name) + '</b></a>' +
              '<p class="ry-hint">关联客户：' + ui.esc(customer ? customer.name : opp.customerId) + '</p></div>';
          }).join('') + '<a class="ry-btn ry-btn--primary" href="' + back() + '">查看线索详情</a>';
      });
    }
    function show(errors) {
      host.querySelector('#convert-message').innerHTML = errors.length ? ui.banner(errors.map(ui.esc).join('<br>'), 'danger') : ui.banner('页面检查通过。', 'brand');
    }
    render();
  };
})();
