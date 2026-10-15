/* ==========================================================================
 * 瑞赢 0.1 · PC 原型公共交互（common-actions.js）
 * --------------------------------------------------------------------------
 * 只承载真正跨页复用的能力：反馈提示、抽屉、弹窗、确认、统一状态表达、
 * 异步处理与部分成功、批量选择、分页、字段展示与脱敏、弱网与并发提示。
 *
 * 不承载任何具体业务页面的渲染逻辑（页面渲染保留在各 HTML 的 <script> 内）。
 * ========================================================================== */
window.RY = window.RY || {};

RY.ui = (function () {
  'use strict';

  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function q(name) {
    var v = null;
    try {
      var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.search);
      if (m) v = decodeURIComponent(m[1].replace(/\+/g, ' '));
    } catch (e) { v = null; }
    return v;
  }

  function hash() {
    return (window.location.hash || '').replace(/^#/, '');
  }

  /* ---------------------------------------------------------------- 提示 */

  function toast(msg, type) {
    var host = qs('#ry-toast');
    if (!host) {
      host = document.createElement('div');
      host.id = 'ry-toast';
      host.className = 'ry-toast-host';
      document.body.appendChild(host);
    }
    var el = document.createElement('div');
    el.className = 'ry-toast ry-toast--' + (type || 'info');
    el.innerHTML = '<span>' + esc(msg) + '</span>';
    host.appendChild(el);
    setTimeout(function () { el.classList.add('is-in'); }, 10);
    setTimeout(function () {
      el.classList.remove('is-in');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 260);
    }, 3200);
  }

  function banner(text, tone, actions) {
    return '<div class="ry-banner ry-banner--' + (tone || 'info') + '">' +
      '<div class="ry-banner__body">' + text + '</div>' +
      (actions ? '<div class="ry-banner__actions">' + actions + '</div>' : '') +
      '</div>';
  }

  /* ------------------------------------------------------------ 抽屉/弹窗 */

  var stack = [];

  function layer(html, opts) {
    var mask = document.createElement('div');
    mask.className = 'ry-mask';
    mask.innerHTML = html;
    document.body.appendChild(mask);
    document.body.classList.add('ry-locked');
    requestAnimationFrame(function () { mask.classList.add('is-in'); });
    stack.push({ el: mask, onClose: opts && opts.onClose });
    mask.addEventListener('click', function (e) {
      if (e.target === mask && !(opts && opts.sticky)) close();
    });
    qsa('[data-close]', mask).forEach(function (b) { b.addEventListener('click', function () { close(); }); });
    return mask;
  }

  function close() {
    var top = stack.pop();
    if (!top) return;
    top.el.classList.remove('is-in');
    document.body.classList.remove('ry-locked');
    setTimeout(function () { if (top.el.parentNode) top.el.parentNode.removeChild(top.el); }, 220);
    if (top.onClose) top.onClose();
  }

  function closeAll() { while (stack.length) close(); }

  function drawer(o) {
    var el = layer(
      '<aside class="ry-drawer ry-drawer--' + (o.size || 'md') + '" role="dialog" aria-modal="true">' +
        '<header class="ry-layer__head">' +
          '<div><h3>' + esc(o.title) + '</h3>' + (o.subtitle ? '<p class="ry-layer__sub">' + o.subtitle + '</p>' : '') + '</div>' +
          '<button class="ry-iconbtn" data-close aria-label="关闭">✕</button>' +
        '</header>' +
        '<div class="ry-layer__body">' + o.body + '</div>' +
        (o.footer ? '<footer class="ry-layer__foot">' + o.footer + '</footer>' : '') +
      '</aside>', o);
    if (o.onOpen) o.onOpen(el);
    return el;
  }

  function modal(o) {
    var el = layer(
      '<div class="ry-modal ry-modal--' + (o.size || 'md') + '" role="dialog" aria-modal="true">' +
        '<header class="ry-layer__head">' +
          '<div><h3>' + esc(o.title) + '</h3>' + (o.subtitle ? '<p class="ry-layer__sub">' + o.subtitle + '</p>' : '') + '</div>' +
          '<button class="ry-iconbtn" data-close aria-label="关闭">✕</button>' +
        '</header>' +
        '<div class="ry-layer__body">' + o.body + '</div>' +
        (o.footer ? '<footer class="ry-layer__foot">' + o.footer + '</footer>' : '') +
      '</div>', o);
    if (o.onOpen) o.onOpen(el);
    return el;
  }

  function confirm(o) {
    return modal({
      title: o.title || '请确认',
      size: 'sm',
      body: '<div class="ry-confirm">' + (o.message || '') + '</div>' +
        (o.requireReason ? '<label class="ry-field"><span class="ry-field__label">' + esc(o.reasonLabel || '原因') + '<i class="ry-req">必填</i></span>' +
          '<textarea id="ry-confirm-reason" class="ry-input" rows="3" placeholder="' + esc(o.reasonPlaceholder || '请填写原因，将写入审计') + '"></textarea></label>' : ''),
      footer: '<button class="ry-btn" data-close>取消</button>' +
        '<button class="ry-btn ry-btn--' + (o.danger ? 'danger' : 'primary') + '" id="ry-confirm-ok">' + esc(o.confirmText || '确认') + '</button>',
      sticky: true,
      onOpen: function (el) {
        qs('#ry-confirm-ok', el).addEventListener('click', function () {
          if (o.requireReason) {
            var v = qs('#ry-confirm-reason', el).value.trim();
            if (!v) { toast('请填写原因后再提交。', 'warn'); return; }
            if (o.onConfirm) o.onConfirm(v);
          } else if (o.onConfirm) o.onConfirm();
          close();
        });
      }
    });
  }

  /* ---------------------------------------------------------- 统一状态表达 */

  var STATE_MAP = {
    'no-permission': { icon: '🔒', title: '没有访问权限', tone: 'warn' },
    'unavailable': { icon: '⛔', title: '对象不可用', tone: 'warn' },
    'version-conflict': { icon: '⚠️', title: '数据版本冲突', tone: 'warn' },
    'processing': { icon: '⏳', title: '正在异步处理', tone: 'info' },
    'partial-success': { icon: '◑', title: '部分成功', tone: 'warn' },
    'weak-network': { icon: '📶', title: '网络不稳定', tone: 'warn' },
    'service-error': { icon: '🔌', title: '外部服务暂时不可用', tone: 'danger' },
    'empty': { icon: '🗂', title: '暂无数据', tone: 'muted' }
  };

  function stateCard(kind, o) {
    o = o || {};
    var m = STATE_MAP[kind] || STATE_MAP.empty;
    return '<div class="ry-state ry-state--' + m.tone + '">' +
      '<div class="ry-state__icon">' + m.icon + '</div>' +
      '<h2 class="ry-state__title">' + esc(o.title || m.title) + '</h2>' +
      '<div class="ry-state__body">' + (o.body || '') + '</div>' +
      (o.extra || '') +
      (o.actions ? '<div class="ry-state__actions">' + o.actions + '</div>' : '') +
      '</div>';
  }

  /** 渲染一个页面级状态，替换指定容器内容。对象名、摘要、数量在无权限时一律不展示。 */
  function renderState(hostSel, kind, o) {
    var host = typeof hostSel === 'string' ? qs(hostSel) : hostSel;
    if (host) host.innerHTML = stateCard(kind, o);
  }

  function empty(text, actions) {
    return stateCard('empty', { body: '<p>' + esc(text || '当前筛选条件下没有数据。') + '</p>', actions: actions });
  }

  /* ------------------------------------------------------ 异步处理与结果 */

  /** 统一的异步处理抽屉：提交后先「处理中」，完成后展示结果并可进入处理记录。 */
  function asyncRun(o) {
    var steps = o.total || 0;
    var el = drawer({
      title: o.title || '正在处理',
      subtitle: '批量、导入、导出均为异步处理，提交后可在处理记录中查看进度与结果。',
      size: 'sm',
      sticky: true,
      body: '<div class="ry-progress" id="ry-pp">' +
        '<div class="ry-progress__bar"><i id="ry-pp-bar" style="width:8%"></i></div>' +
        '<p class="ry-progress__text" id="ry-pp-text">正在逐项预检与执行…</p>' +
        '<ul class="ry-progress__list">' +
          '<li>处理编号：<code>' + esc(o.processId || '处理中生成') + '</code></li>' +
          '<li>共计 <b>' + steps + '</b> 条，逐项执行，单项失败不影响其他项</li>' +
          '<li>已成功项不会重复执行</li>' +
        '</ul>' +
        '</div>',
      footer: '<button class="ry-btn" id="ry-pp-bg">转到后台处理</button>'
    });
    var bar = qs('#ry-pp-bar', el), text = qs('#ry-pp-text', el);
    var pct = 8;
    var timer = setInterval(function () {
      pct = Math.min(96, pct + 17);
      if (bar) bar.style.width = pct + '%';
      if (text && pct > 55) text.textContent = '正在执行并回写结果…';
    }, 260);
    qs('#ry-pp-bg', el).addEventListener('click', function () {
      toast('已转到后台处理，可在「处理记录」查看结果。', 'info');
      close();
    });
    setTimeout(function () {
      clearInterval(timer);
      if (bar) bar.style.width = '100%';
      close();
      if (o.onDone) o.onDone();
    }, 1500);
  }

  /** 处理结果视图（处理记录详情、批次结果共用）。 */
  function jobResult(job) {
    var sum = '<div class="ry-jobsum">' +
      '<div class="ry-jobsum__item"><b>' + job.total + '</b><span>总数</span></div>' +
      '<div class="ry-jobsum__item ry-ok"><b>' + job.success + '</b><span>成功</span></div>' +
      '<div class="ry-jobsum__item ry-bad"><b>' + job.failed + '</b><span>失败</span></div>' +
      '</div>';
    if (!job.items || !job.items.length) {
      return sum + '<p class="ry-hint">该批次没有逐项明细，或明细尚未回写完成。</p>';
    }
    var rows = job.items.map(function (it) {
      return '<tr><td><code>' + esc(it.key) + '</code></td><td>' + esc(it.name) + '</td>' +
        '<td><span class="ry-tag ry-tag--' + (it.result === '成功' ? 'ok' : it.result === '失败' ? 'bad' : 'muted') + '">' + esc(it.result) + '</span></td>' +
        '<td class="ry-muted">' + esc(it.reason || '—') + '</td></tr>';
    }).join('');
    return sum +
      '<table class="ry-table ry-table--tight"><thead><tr><th>对象／行号</th><th>名称</th><th>结果</th><th>失败原因</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      (job.failed > 0 ? '<div class="ry-actions-row"><button class="ry-btn ry-btn--primary" onclick="RY.ui.retryJob(\'' + job.id + '\')">只重试失败项（' + job.failed + ' 项）</button>' +
        '<span class="ry-hint">重试按原批次参数执行并重新校验，已成功项不会重复执行。</span></div>' : '');
  }

  function retryJob(jobId) {
    var nj = RY.store.retryFailed(jobId);
    if (!nj) { toast('未找到可重试的失败项。', 'warn'); return; }
    toast('已提交重试：' + nj.action, 'success');
    setTimeout(function () { window.location.href = RY.nav.href('pc/processing/detail.html?id=' + nj.id + '&from=retry'); }, 600);
  }

  /* ------------------------------------------------------ 版本冲突 / 弱网 */

  function versionConflict(o) {
    o = o || {};
    return modal({
      title: '数据版本冲突',
      subtitle: '并发提示：提交前的对象版本已变化，你的修改未被采纳。',
      size: 'sm',
      body: '<div class="ry-conflict">' +
        '<p>' + (o.message || '该对象在你编辑期间已被其他人修改。为避免覆盖他人修改，本次提交已拒绝。') + '</p>' +
        '<ul class="ry-kv">' +
          '<li><span>对象</span><b>' + esc(o.objectLabel || '—') + '</b></li>' +
          '<li><span>你读取的版本</span><b>' + esc(o.readVersion || '2026-09-20 16:12 · v12') + '</b></li>' +
          '<li><span>当前版本</span><b>' + esc(o.nowVersion || '2026-09-21 09:05 · v13') + '</b></li>' +
          '<li><span>最近修改人</span><b>' + esc(o.by || '王栩（销售主管）') + '</b></li>' +
        '</ul>' +
        '<p class="ry-hint">处理方式：重新加载最新数据后再修改；系统不会自动合并，也不会以你的版本覆盖最新版本。</p>' +
        '</div>',
      footer: '<button class="ry-btn" data-close>保留我的输入</button>' +
        '<button class="ry-btn ry-btn--primary" id="ry-reload">加载最新并放弃我的修改</button>',
      onOpen: function (el) {
        qs('#ry-reload', el).addEventListener('click', function () {
          close();
          toast('已加载最新数据。', 'info');
          if (o.onReload) o.onReload();
        });
      }
    });
  }

  /** 弱网恢复：首次提交失败，重试成功后继续。用于演示不丢输入、可重试。 */
  function submitWithRecovery(o) {
    if (RY.perm.flag('weakNetwork') && !o._retried) {
      modal({
        title: '提交未完成',
        size: 'sm',
        body: '<p>网络不稳定，本次提交未送达服务端。<b>你填写的内容已完整保留在当前页面</b>，不会丢失。</p>' +
          '<p class="ry-hint">可直接重试；重试按相同参数提交，具备幂等保护，不会重复创建对象。</p>',
        footer: '<button class="ry-btn" data-close>稍后再试</button><button class="ry-btn ry-btn--primary" id="ry-retry">立即重试</button>',
        onOpen: function (el) {
          qs('#ry-retry', el).addEventListener('click', function () {
            close();
            var o2 = Object.assign({}, o); o2._retried = true;
            submitWithRecovery(o2);
          });
        }
      });
      return;
    }
    o.onSubmit();
  }

  /* ---------------------------------------------------------------- 列表 */

  function pager(total, page, size, onChangeName) {
    var pages = Math.max(1, Math.ceil(total / size));
    var btns = '';
    for (var i = 1; i <= pages; i++) {
      if (pages > 7 && i > 2 && i < pages - 1 && Math.abs(i - page) > 1) {
        if (i === 3) btns += '<span class="ry-page__gap">…</span>';
        continue;
      }
      btns += '<button class="ry-page__btn' + (i === page ? ' is-on' : '') + '" data-pg="' + i + '">' + i + '</button>';
    }
    return '<div class="ry-pager" data-total="' + total + '" data-size="' + size + '">' +
      '<span class="ry-pager__sum">共 ' + total + ' 条 / 第 ' + page + ' 页，共 ' + pages + ' 页</span>' +
      '<span class="ry-pager__nav">' +
        '<button class="ry-page__btn" data-pg="' + (page - 1) + '"' + (page <= 1 ? ' disabled' : '') + '>上一页</button>' +
        btns +
        '<button class="ry-page__btn" data-pg="' + (page + 1) + '"' + (page >= pages ? ' disabled' : '') + '>下一页</button>' +
      '</span></div>';
  }

  function bindPager(rootSel, onChange) {
    var root = qs(rootSel);
    if (!root) return;
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pg]');
      if (!b || b.disabled) return;
      onChange(parseInt(b.getAttribute('data-pg'), 10));
    });
  }

  /**
   * 批量选择：白名单语义。
   * 当前页 / 全部筛选结果 / 跨页已选 三种范围，上限 100，超出必须收窄，绝不静默截断。
   */
  function selectionBar(o) {
    return '<div class="ry-selbar" id="' + o.id + '">' +
      '<label class="ry-check"><input type="checkbox" id="' + o.id + '-all"><span>本页全选</span></label>' +
      '<span class="ry-selbar__sep"></span>' +
      '<span class="ry-selbar__info" id="' + o.id + '-info">尚未选择</span>' +
      '<button class="ry-btn ry-btn--sm" data-sel-range="page">选择本页</button>' +
      '<button class="ry-btn ry-btn--sm" data-sel-range="filtered">选择全部筛选结果（' + (o.filteredTotal || 0) + '）</button>' +
      (o.crossPageCount ? '<button class="ry-btn ry-btn--sm" data-sel-range="cross">恢复跨页已选（' + o.crossPageCount + '）</button>' : '') +
      '<button class="ry-btn ry-btn--sm" data-sel-range="clear">清空选择</button>' +
      '<span class="ry-selbar__limit">单次批量上限 100 条，超出请先收窄条件</span>' +
      '</div>';
  }

  var SEL = {};
  function bindSelection(o) {
    var root = qs('#' + o.id);
    if (!root) return;
    SEL[o.key] = SEL[o.key] || { ids: RY.store.selection(o.key) };
    function refresh() {
      RY.store.selection(o.key, SEL[o.key].ids.slice());
      var info = qs('#' + o.id + '-info');
      var n = SEL[o.key].ids.length;
      if (info) {
        info.innerHTML = n === 0 ? '尚未选择' : '已选 <b>' + n + '</b> 条' +
          (o.crossPageCount ? '（含跨页已选 ' + o.crossPageCount + ' 条）' : '');
        info.classList.toggle('is-over', n > 100);
      }
      if (qsa('[data-sel-range]', root).length) {
        qsa('[data-sel-range="cross"]', root).forEach(function () { });
      }
      if (o.onChange) o.onChange(SEL[o.key].ids.slice());
    }
    function addRange(ids) {
      var merged = SEL[o.key].ids.slice();
      ids.forEach(function (id) { if (merged.indexOf(id) === -1) merged.push(id); });
      if (merged.length > 100) {
        toast('已选 ' + merged.length + ' 条，超过单次上限 100 条。请先收窄筛选条件，系统不会自动截断。', 'warn');
        return;
      }
      SEL[o.key].ids = merged;
      refresh();
    }
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-sel-range]');
      if (!b) return;
      var range = b.getAttribute('data-sel-range');
      if (range === 'page') addRange(o.pageIds || []);
      if (range === 'filtered') {
        if ((o.filteredTotal || 0) > 100) {
          modal({
            title: '选择范围超过单次上限',
            size: 'sm',
            body: '<p>当前筛选结果共 <b>' + o.filteredTotal + '</b> 条，超过单次批量上限 <b>100</b> 条。</p>' +
              '<p>系统不会自动截断为前 100 条。请收窄筛选条件（例如按区域、业务线、状态或时间范围）后重新选择。</p>' +
              '<p class="ry-hint">需要处理更大范围时，请分组、分批提交，每批不超过 100 条。</p>',
            footer: '<button class="ry-btn ry-btn--primary" data-close>我知道了</button>'
          });
          return;
        }
        addRange(o.filteredIds || []);
      }
      if (range === 'cross') addRange(RY.store.selection(o.key));
      if (range === 'clear') { SEL[o.key].ids = []; refresh(); if (o.onChange) o.onChange([]); }
    });
    var all = qs('#' + o.id + '-all');
    if (all) {
      all.addEventListener('change', function () {
        if (all.checked) addRange(o.pageIds || []);
        else {
          var pageSet = o.pageIds || [];
          SEL[o.key].ids = SEL[o.key].ids.filter(function (id) { return pageSet.indexOf(id) === -1; });
          refresh();
        }
      });
    }
    SEL[o.key].refresh = refresh;
    refresh();
  }

  function selected(key) { return (SEL[key] && SEL[key].ids) || RY.store.selection(key); }
  function syncSel(key, ids) { SEL[key] = SEL[key] || {}; SEL[key].ids = ids.slice(); if (SEL[key].refresh) SEL[key].refresh(); }

  /* ---------------------------------------------------------- 字段与标签 */

  function tag(text, tone) {
    return '<span class="ry-tag ry-tag--' + (tone || 'muted') + '">' + esc(text) + '</span>';
  }

  var STATUS_TONE = {
    '正常': 'ok', '有效': 'ok', '启用': 'ok', '已核验': 'ok', '已复核': 'ok', '已转化': 'ok', '赢单': 'ok', '已完成': 'ok', '成功': 'ok',
    '待处理': 'warn', '待确认': 'warn', '待验收': 'warn', '跟进中': 'info', '待治理': 'warn', '待复核': 'warn', '需复核': 'warn',
    '停止接收': 'warn', '停止经营': 'muted', '待启用': 'warn', '处理中': 'info', '进行中': 'info', '待完成': 'info', '部分成功': 'warn',
    '停用': 'muted', '无效': 'muted', '已失效': 'muted', '已取消': 'muted', '输单': 'bad', '关闭': 'bad', '失败': 'bad', '未核验': 'muted', '不采纳': 'muted'
  };

  function statusTag(v) { return tag(v, STATUS_TONE[v] || 'muted'); }

  function valueTag(v) {
    var tone = v === '战略' ? 'bad' : v === '重点' ? 'warn' : v === '机会' ? 'info' : 'muted';
    return tag(v || '未分级', tone);
  }

  function masked(plain, label) {
    /* PC 0.1：有对象查看权限即展示完整业务字段；H5 留待单独更新。 */
    if (/\/(?:pc\/|pc\.html(?:$|[?#]))/.test(location.pathname)) return '<span>' + esc(plain) + '</span>';
    return '<span class="ry-masked"><span class="ry-masked__v" data-plain="' + esc(plain) + '" data-label="' + esc(label || '') + '">••••••••</span>' +
      '<button class="ry-inline-btn" data-reveal="1">查看明文</button></span>';
  }

  function bindMasked(root) {
    var host = typeof root === 'string' ? qs(root) : root;
    if (!host) return;
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-reveal]');
      if (!b) return;
      if (!RY.perm.canViewPlainPhone()) {
        modal({
          title: '没有查看明文的权限',
          size: 'sm',
          body: '<p>联系人敏感信息明文查看属于字段级授权动作，当前账号未获授权。</p>' +
            '<p class="ry-hint">' + esc(RY.perm.whyNot('contact.plain') || '请联系系统管理员申请字段级授权。') + '</p>' +
            '<p class="ry-hint">导出同样属于独立授权动作；获得明文查看权限也不等于获得导出权限。</p>',
          footer: '<button class="ry-btn ry-btn--primary" data-close>我知道了</button>'
        });
        return;
      }
      var v = b.parentNode.querySelector('.ry-masked__v');
      if (v.classList.contains('is-plain')) {
        v.textContent = '••••••••';
        v.classList.remove('is-plain');
        b.textContent = '查看明文';
      } else {
        v.textContent = v.getAttribute('data-plain');
        v.classList.add('is-plain');
        b.textContent = '隐藏';
        RY.store.audit('联系人', v.getAttribute('data-label') || '—', '查看敏感信息明文', '脱敏', '明文（已留痕）');
      }
    });
  }

  function kv(list) {
    return '<ul class="ry-kv">' + list.map(function (x) {
      return '<li><span>' + esc(x[0]) + '</span><b>' + (x[1] === null || x[1] === undefined || x[1] === '' ? '—' : x[1]) + '</b></li>';
    }).join('') + '</ul>';
  }

  function field(label, control, hint, required) {
    return '<label class="ry-field"><span class="ry-field__label">' + esc(label) +
      (required ? '<i class="ry-req">必填</i>' : '') + '</span>' + control +
      (hint ? '<span class="ry-field__hint">' + hint + '</span>' : '') + '</label>';
  }

  function input(name, value, placeholder, type) {
    return '<input class="ry-input" name="' + name + '" type="' + (type || 'text') + '" value="' + esc(value || '') + '" placeholder="' + esc(placeholder || '') + '">';
  }

  function select(name, options, value) {
    return '<select class="ry-input" name="' + name + '">' + options.map(function (o) {
      var v = typeof o === 'string' ? o : o.value;
      var t = typeof o === 'string' ? o : o.label;
      return '<option value="' + esc(v) + '"' + (String(v) === String(value || '') ? ' selected' : '') + '>' + esc(t) + '</option>';
    }).join('') + '</select>';
  }

  function textarea(name, value, placeholder, rows) {
    return '<textarea class="ry-input" name="' + name + '" rows="' + (rows || 3) + '" placeholder="' + esc(placeholder || '') + '">' + esc(value || '') + '</textarea>';
  }

  /** 两列/三列表单栅格：只做排版，不承载业务字段语义。 */
  function grid2(a, b) { return '<div class="ry-grid2">' + a + b + '</div>'; }
  function grid3(a, b, c) { return '<div class="ry-grid3">' + a + b + c + '</div>'; }

  function formValues(root) {
    var out = {};
    qsa('[name]', root).forEach(function (el) {
      if (el.type === 'checkbox') { out[el.name] = el.checked; return; }
      if (el.type === 'radio') { if (el.checked) out[el.name] = el.value; return; }
      out[el.name] = el.value;
    });
    return out;
  }

  function personPicker() {
    return '<div class="ry-person-picker">' +
      '<div class="ry-person-picker__selected" data-person-selected>未选择参与人</div>' +
      '<input class="ry-input" type="search" data-person-query placeholder="搜索姓名、部门、工号或人员编号" aria-label="查询公司人员">' +
      '<div class="ry-person-picker__results" data-person-results>输入关键词查询公司人员，可选择多人</div>' +
      '</div>';
  }

  function bindPersonPicker(root, people, ownerValue) {
    var selected = [];
    var query = qs('[data-person-query]', root);
    var selectedHost = qs('[data-person-selected]', root);
    var resultsHost = qs('[data-person-results]', root);
    function owner() { return typeof ownerValue === 'function' ? ownerValue() : ownerValue; }
    function updateSelected() {
      var ownerId = owner();
      selected = selected.filter(function (id) { return id !== ownerId; });
      selectedHost.innerHTML = selected.length ? selected.map(function (id) {
        var person = people.find(function (x) { return x.id === id; });
        return '<span class="ry-person-picker__chip">' + esc(person ? person.name : id) +
          '<button type="button" data-person-remove="' + esc(id) + '" aria-label="移除' + esc(person ? person.name : id) + '">×</button></span>';
      }).join('') : '未选择参与人';
    }
    function updateResults() {
      var needle = query.value.trim().toLocaleLowerCase();
      if (!needle) { resultsHost.textContent = '输入关键词查询公司人员，可选择多人'; return; }
      var matches = people.filter(function (x) {
        return x.id !== owner() && [x.name, x.dept, x.empNo, x.id].some(function (v) {
          return String(v || '').toLocaleLowerCase().indexOf(needle) >= 0;
        });
      });
      resultsHost.innerHTML = matches.length ? matches.slice(0, 20).map(function (x) {
        var picked = selected.indexOf(x.id) >= 0;
        return '<button type="button" class="ry-person-picker__result' + (picked ? ' is-selected' : '') +
          '" data-person-id="' + esc(x.id) + '" aria-pressed="' + picked + '"><b>' + esc(x.name) +
          '</b><small>' + esc(x.dept || '') + ' · ' + esc(x.empNo || x.id) + '</small><span>' + (picked ? '已选' : '选择') + '</span></button>';
      }).join('') + (matches.length > 20 ? '<p>结果较多，请输入更完整的关键词</p>' : '') : '未找到匹配人员';
    }
    query.addEventListener('input', updateResults);
    root.addEventListener('click', function (e) {
      var remove = e.target.closest('[data-person-remove]');
      var result = e.target.closest('[data-person-id]');
      var id = remove && remove.getAttribute('data-person-remove') || result && result.getAttribute('data-person-id');
      if (!id) return;
      var at = selected.indexOf(id);
      if (at >= 0) selected.splice(at, 1);
      else if (!remove && id !== owner()) selected.push(id);
      updateSelected(); updateResults();
    });
    updateSelected(); updateResults();
    return { values: function () { return selected.slice(); }, syncOwner: function () { updateSelected(); updateResults(); } };
  }

  function section(title, body, extra) {
    return '<section class="ry-card"><header class="ry-card__head"><h3>' + esc(title) + '</h3>' +
      (extra ? '<div class="ry-card__extra">' + extra + '</div>' : '') + '</header>' +
      '<div class="ry-card__body">' + body + '</div></section>';
  }

  function noPermInline(action, label) {
    return '<span class="ry-noperm" title="' + esc(RY.perm.whyNot(action)) + '">' + esc(label) + '<i>无权限</i></span>';
  }

  /** 统一的按钮渲染：无权限时保留入口与原因，不以隐藏代替权限表达。 */
  function actionBtn(action, label, attrs, cls) {
    var ok = RY.perm.can(action);
    var reason = RY.perm.whyNot(action);
    return '<button class="ry-btn ' + (cls || '') + '" data-action="' + action + '"' +
      (attrs || '') + (ok ? '' : ' data-denied="1" title="' + esc(reason) + '"') + '>' +
      esc(label) + (ok ? '' : '<i class="ry-btn__lock">无权限</i>') + '</button>';
  }

  function bindDenied(root) {
    var host = typeof root === 'string' ? qs(root) : root;
    if (!host || host.__ryDeniedBound) return;
    host.__ryDeniedBound = true;
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-denied]');
      if (!b) return;
      e.preventDefault();
      e.stopPropagation();
      var action = b.getAttribute('data-action');
      modal({
        title: '该动作当前不可执行',
        size: 'sm',
        body: '<p>' + esc(RY.perm.whyNot(action) || '当前角色或对象状态不允许该动作。') + '</p>' +
          '<p class="ry-hint">权限由「角色页面权限 ∩ 动作权限 ∩ 数据范围 ∩ 字段规则 ∩ 当前对象状态」共同决定；再次进入本页面时会重新鉴权。</p>',
        footer: '<button class="ry-btn ry-btn--primary" data-close>我知道了</button>'
      });
    });
  }

  function relTime(t) { return t || '—'; }

  /** 面包屑与返回：返回列表时恢复筛选、排序与页码。 */
  function backLink(href, label) {
    return '<a class="ry-back" href="' + href + '">← ' + esc(label || '返回列表') + '</a>';
  }

  return {
    esc: esc, qs: qs, qsa: qsa, q: q, hash: hash,
    toast: toast, banner: banner,
    drawer: drawer, modal: modal, confirm: confirm, close: close, closeAll: closeAll,
    stateCard: stateCard, renderState: renderState, empty: empty,
    asyncRun: asyncRun, jobResult: jobResult, retryJob: retryJob,
    versionConflict: versionConflict, submitWithRecovery: submitWithRecovery,
    pager: pager, bindPager: bindPager, selectionBar: selectionBar, bindSelection: bindSelection,
    selected: selected, syncSel: syncSel,
    tag: tag, statusTag: statusTag, valueTag: valueTag, masked: masked, bindMasked: bindMasked,
    kv: kv, field: field, input: input, select: select, textarea: textarea, grid2: grid2, grid3: grid3,
    formValues: formValues, personPicker: personPicker, bindPersonPicker: bindPersonPicker,
    section: section, noPermInline: noPermInline, actionBtn: actionBtn, bindDenied: bindDenied,
    relTime: relTime, backLink: backLink
  };
})();
