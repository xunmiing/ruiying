/* ==========================================================================
 * 瑞赢 0.1 · 原型外壳（navigation.js）
 * --------------------------------------------------------------------------
 * 职责：
 *   PC —— 渲染统一 PC 外壳：左侧五组导航、顶部全局入口（搜索、消息、处理记录、
 *         用户头像）、面包屑与页面标题区。
 *   H5 —— 渲染企业微信 H5 外壳：顶部条、底部五个高频入口、页面说明。
 *
 * 说明：PC 只有一个统一入口与一套导航，不再区分销售端／主管端／配置端。
 *       H5 与 PC 共用同一业务事实、权限与数据范围，只是执行端不同。
 *       所有相对路径由 data-root 统一解析，保证页面能通过本地 file:// 直接打开。
 * ========================================================================== */
window.RY = window.RY || {};

RY.nav = (function () {
  'use strict';

  var ui = function () { return RY.ui; };

  function root() {
    var a = document.body.getAttribute('data-root');
    return a === null ? '' : a;
  }

  function href(path) { return root() + path; }

  function go(path) { window.location.href = href(path); }

  function isH5() { return document.body.getAttribute('data-end') === 'h5'; }

  /* ====================================================== PC 左侧导航 */

  function navItem(it, activeKey, extraClass) {
    var cls = 'ry-nav__item' + (extraClass ? ' ' + extraClass : '');
    if (it.disabled) {
      return '<span class="' + cls + ' is-off" title="不在 0.1 范围内">' + ui().esc(it.name) + '<i class="ry-nav__off">不在 0.1 范围</i></span>';
    }
    if (it.allowed === false) {
      return '<span class="' + cls + ' is-off" title="当前身份无该页面权限">' + ui().esc(it.name) + '<i class="ry-nav__off">无页面权限</i></span>';
    }
    return '<a class="' + cls + (it.key === activeKey ? ' is-on' : '') + '" href="' + href(it.href) + '">' + ui().esc(it.name) + '</a>';
  }

  function sideOpen(key, fallback) {
    try {
      var saved = localStorage.getItem('ry.pc.nav.' + key);
      return saved === null ? fallback : saved === 'open';
    } catch (e) { return fallback; }
  }

  function sideToggle(key, name, body, open, active, level) {
    var id = 'ry-nav-panel-' + key;
    return '<div class="ry-nav__fold ry-nav__fold--' + level + (active ? ' has-active' : '') + '">' +
      '<button type="button" class="ry-nav__toggle" data-nav-toggle="' + key + '" aria-controls="' + id + '" aria-expanded="' + (open ? 'true' : 'false') + '">' +
      '<span class="ry-nav__toggle-label">' + ui().esc(name) + '</span><span class="ry-nav__chevron" aria-hidden="true"></span></button>' +
      '<div class="ry-nav__fold-body" id="' + id + '"' + (open ? '' : ' hidden') + '>' + body + '</div></div>';
  }

  function sideHtml(activeKey) {
    var tree = RY.perm.visibleNav();
    var groups = tree.map(function (g) {
      var body;
      if (g.groups) {
        var groupActive = false;
        body = g.groups.map(function (gr, index) {
          var active = gr.items.some(function (i) { return i.key === activeKey; });
          groupActive = groupActive || active;
          if (gr.items.length === 1) return navItem(gr.items[0], activeKey, 'ry-nav__system-link');
          var key = g.key + '-' + index;
          var open = active || sideOpen(key, false);
          return sideToggle(key, gr.name, gr.items.map(function (i) { return navItem(i, activeKey, 'ry-nav__system-child'); }).join(''), open, active, 'sub');
        }).join('');
        body = sideToggle(g.key, g.name, body, groupActive || sideOpen(g.key, false), groupActive, 'group');
      } else {
        body = g.items.map(function (i) { return navItem(i, activeKey); }).join('');
      }
      return '<div class="ry-nav__group' + (g.allowed === false ? ' is-off' : '') + '">' +
        (g.groups ? '' : '<div class="ry-nav__title">' + ui().esc(g.name) + '</div>') + body + '</div>';
    }).join('');

    var u = RY.store.currentUser();
    return '<div class="ry-brand"><span class="ry-brand__mark">瑞</span>' +
        '<span class="ry-brand__txt"><b>瑞赢</b><i>0.1 联合评审原型</i></span></div>' +
      '<nav class="ry-nav">' + groups + '</nav>' +
      '<div class="ry-side__foot">' +
        '<div class="ry-side__user"><b>' + ui().esc(u.name) + '</b><span>原型演示 · ' + ui().esc(u.dept) + '</span></div>' +
        '<p class="ry-side__note">原型仅用于评审页面结构与业务规则表达，不代表生产实现或技术承诺。</p>' +
      '</div>';
  }

  /* ====================================================== PC 顶部入口 */

  function topHtml() {
    var q = ui().q('q') || '';
    var currentId = RY.store.currentUser().id;
    var unread = RY.store.arr('messages').filter(function (m) { return (!m.receiver || m.receiver === currentId) && !m.read; }).length;
    var pending = RY.store.arr('jobs').filter(function (j) { return j.status === '处理中' || j.status === '部分成功'; }).length;
    return '<div class="ry-top__left">' +
        '<a class="ry-top__home" href="' + href('pc.html') + '">工作台首页</a>' +
      '</div>' +
      '<form class="ry-search" id="ry-topsearch" action="' + href('pc/search.html') + '" method="get">' +
        '<input type="search" name="q" placeholder="全局搜索：客户 / 联系人 / 线索 / 商机 / 任务 / 正式拜访 / 日报 / 知识" value="' + ui().esc(q) + '">' +
        '<button type="submit" class="ry-search__btn">搜索</button>' +
      '</form>' +
      '<div class="ry-top__right">' +
        '<details class="ry-top__overview"><summary>整体说明</summary><nav aria-label="整体说明">' +
          '<a href="' + href('architecture.html#rules') + '">整体规则</a>' +
          '<a href="' + href('architecture.html#flow') + '">功能流程图</a>' +
          '<a href="' + href('architecture.html#functions') + '">功能架构图</a>' +
          '<a href="' + href('architecture.html#panorama') + '">功能全景图</a>' +
          '<a href="' + href('architecture.html#objects') + '">业务对象模型</a>' +
          '<a href="' + href('architecture.html#module-flows') + '">模块业务流程图</a>' +
        '</nav></details>' +
        '<a class="ry-top__link" href="' + href('index.html') + '">企微 H5</a>' +
        '<a class="ry-top__link" href="' + href('pc/message/list.html') + '">消息' + (unread ? '<i class="ry-badge">' + unread + '</i>' : '') + '</a>' +
        '<a class="ry-top__link" href="' + href('pc/processing/list.html') + '">处理记录' + (pending ? '<i class="ry-badge">' + pending + '</i>' : '') + '</a>' +
        '<span class="ry-avatar" title="当前演示账号">' + ui().esc(RY.store.currentUser().name.slice(0, 1)) + '</span>' +
      '</div>';
  }

  /* ====================================================== PC 页面标题 */

  function headHtml(cfg) {
    var crumbs = (cfg.crumbs || []).map(function (c, i) {
      var last = i === (cfg.crumbs.length - 1);
      return last ? '<span>' + ui().esc(c.label) + '</span>'
        : '<a href="' + href(c.href || 'pc.html') + '">' + ui().esc(c.label) + '</a><i>›</i>';
    }).join('');
    return '<div class="ry-head__main">' +
        '<div class="ry-crumbs">' + crumbs + '</div>' +
        '<h1 class="ry-title">' + ui().esc(cfg.title || '') +
          (cfg.titleNote ? '<span class="ry-title__note">' + ui().esc(cfg.titleNote) + '</span>' : '') + '</h1>' +
        (cfg.subtitle ? '<p class="ry-subtitle">' + cfg.subtitle + '</p>' : '') +
      '</div>' +
      '<div class="ry-head__actions" id="ry-head-actions">' + (cfg.actions || '') + '</div>';
  }

  function shell(cfg) {
    var s = ui().qs('#ry-side'), t = ui().qs('#ry-top'), h = ui().qs('#ry-head');
    if (s) {
      s.innerHTML = sideHtml(cfg.nav || '');
      s.querySelectorAll('[data-nav-toggle]').forEach(function (button) {
        button.addEventListener('click', function () {
          var body = document.getElementById(button.getAttribute('aria-controls'));
          var open = button.getAttribute('aria-expanded') !== 'true';
          button.setAttribute('aria-expanded', open ? 'true' : 'false');
          body.hidden = !open;
          try { localStorage.setItem('ry.pc.nav.' + button.getAttribute('data-nav-toggle'), open ? 'open' : 'closed'); } catch (e) { /* 仍可在当前页折叠 */ }
        });
      });
    }
    if (t) t.innerHTML = topHtml();
    if (h) h.innerHTML = headHtml(cfg);
    bindGlobal();
    ui().bindDenied(document.body);
    document.title = (cfg.title ? cfg.title + ' · ' : '') + '瑞赢 0.1 PC 原型';
  }

  /* ====================================================== H5 外壳 */

  /* M01–M27 前台结构的五个一级入口。CRM 对象从工作台快捷入口进入。 */
  var H5_TABS = [
    { key: 'home', name: '工作台', href: 'index.html', page: 'h5.home' },
    { key: 'task', name: '任务', href: 'h5/task/list.html', page: 'h5.task.list' },
    { key: 'calendar', name: '日程', href: 'h5/calendar/index.html', page: 'h5.calendar' },
    { key: 'activity', name: '互动', href: 'h5/activity/list.html', page: 'h5.activity.list' },
    { key: 'knowledge', name: '知识库', href: 'h5/knowledge/list.html', page: 'h5.knowledge.list' }
  ];

  function tabbarHtml(activeKey) {
    return H5_TABS.map(function (t) {
      var allowed = RY.perm.page(t.page);
      if (!allowed) {
        return '<span class="ry-tabbar__it is-off" title="当前身份无该页面权限">' + ui().esc(t.name) + '</span>';
      }
      return '<a class="ry-tabbar__it' + (t.key === activeKey ? ' is-on' : '') + '" href="' + href(t.href) + '">' + ui().esc(t.name) + '</a>';
    }).join('');
  }

  /**
   * 渲染 H5 页面外壳。
   * cfg = { title, sub, back, nav, actions, tabbar, flush }
   */
  function h5shell(cfg) {
    var bar = ui().qs('#ry-hbar');
    if (bar) {
      var back = cfg.back === false ? '<span class="ry-bar__back is-off"></span>'
        : '<a class="ry-bar__back" href="' + (cfg.back ? href(cfg.back) : 'javascript:history.back()') + '" aria-label="返回">‹</a>';
      bar.innerHTML = back +
        '<div class="ry-bar__main"><div class="ry-bar__title">' + ui().esc(cfg.title || '') + '</div>' +
        (cfg.sub ? '<div class="ry-bar__sub">' + ui().esc(cfg.sub) + '</div>' : '') + '</div>' +
        '<div class="ry-bar__acts">' + (cfg.actions || '') +
          '<button class="ry-bar__ico" id="ry-hnotes" title="页面说明" aria-label="打开页面说明">说明</button></div>';
    }
    if (!ui().qs('#ry-pc-jump')) {
      var pcJump = document.createElement('a');
      pcJump.id = 'ry-pc-jump';
      pcJump.className = 'ry-btn ry-pc-jump';
      pcJump.href = href('pc.html');
      pcJump.textContent = '跳转 PC 原型';
      document.body.appendChild(pcJump);
    }
    var tb = ui().qs('#ry-htabs');
    if (tb) {
      if (cfg.tabbar === false) tb.style.display = 'none';
      else tb.innerHTML = tabbarHtml(cfg.nav || '');
    }
    if (RY.perm.page('h5.agent.index') && !ui().qs('#ry-ai-float')) {
      var helper = document.createElement('button');
      helper.id = 'ry-ai-float';
      helper.type = 'button';
      helper.textContent = '🤖';
      helper.setAttribute('aria-label', '打开完整瑞赢 AI 助手');
      helper.style.cssText = 'position:fixed;right:max(14px,calc(50vw - 201px));bottom:' + (cfg.tabbar === false ? '18px' : '78px') +
        ';z-index:30;width:46px;height:46px;border-radius:50%;border:0;background:#176c86;color:white;font-size:23px;line-height:1;box-shadow:0 6px 18px rgba(0,0,0,.18);cursor:pointer';
      document.body.appendChild(helper);
      helper.addEventListener('click', function () {
        try { sessionStorage.setItem('ry_ai_return', location.href); } catch (e) { /* 仍可从更多页返回 */ }
        go('h5/agent/index.html?from=float');
      });
    }
    if (RY.perm.page('h5.quicknote') && !ui().qs('#ry-note-float') &&
        location.pathname.indexOf('/h5/quicknote/') < 0) {
      var note = document.createElement('button');
      note.id = 'ry-note-float';
      note.type = 'button';
      note.textContent = '速记';
      note.setAttribute('aria-label', '打开个人速记');
      note.style.cssText = 'position:fixed;right:max(14px,calc(50vw - 201px));bottom:' + (cfg.tabbar === false ? '74px' : '134px') +
        ';z-index:30;width:46px;height:46px;border-radius:50%;border:0;background:#f2a94a;color:#27323a;font:600 14px sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.18);cursor:pointer';
      document.body.appendChild(note);
      note.addEventListener('click', function () { go('h5/quicknote/index.html'); });
    }
    if (!window.__ryFloatsKeyboardBound) {
      window.__ryFloatsKeyboardBound = true;
      document.addEventListener('focusin', function (e) {
        if (/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) ['ry-ai-float', 'ry-note-float'].forEach(function (id) {
          var el = document.getElementById(id); if (el) el.style.display = 'none';
        });
      });
      document.addEventListener('focusout', function () {
        setTimeout(function () { ['ry-ai-float', 'ry-note-float'].forEach(function (id) {
          var el = document.getElementById(id); if (el) el.style.display = '';
        }); }, 120);
      });
    }
    bindGlobal();
    ui().bindDenied(document.body);
    document.title = (cfg.title ? cfg.title + ' · ' : '') + '瑞赢 0.1 企微 H5 原型';
  }

  /* H5 页面说明与规则标签在独立脚本中绑定；不提供评审身份切换。 */
  function bindGlobal() {
    if (!isH5() || document.getElementById('ry-h5-notes-script')) return;
    var script = document.createElement('script');
    script.id = 'ry-h5-notes-script';
    script.src = href('assets/js/h5-page-notes.js');
    document.body.appendChild(script);
  }

  /* ====================================================== 交互小件 */

  /** 页内 Tab：以 hash 定位，便于直接打开指定视图。 */
  function tabs(id, items, onChange) {
    var cur = ui().hash() || items[0].key;
    var host = ui().qs('#' + id);
    if (!host) return cur;
    host.innerHTML = items.map(function (t) {
      return '<a class="ry-tab' + (t.key === cur ? ' is-on' : '') + '" href="#' + t.key + '" data-tab="' + t.key + '">' +
        ui().esc(t.name) + (t.count !== undefined && t.count !== null ? '<i>' + t.count + '</i>' : '') + '</a>';
    }).join('');
    function apply(key) {
      ui().qsa('[data-tab]', host).forEach(function (a) { a.classList.toggle('is-on', a.getAttribute('data-tab') === key); });
      if (onChange) onChange(key);
    }
    host.addEventListener('click', function (e) {
      var a = e.target.closest('[data-tab]');
      if (!a) return;
      e.preventDefault();
      var k = a.getAttribute('data-tab');
      if (window.history && window.history.replaceState) window.history.replaceState(null, '', '#' + k);
      else window.location.hash = k;
      apply(k);
    });
    window.addEventListener('hashchange', function () { apply(ui().hash() || items[0].key); });
    apply(cur);
    return cur;
  }

  /** 列表筛选区：折叠/展开，筛选条件保存在 sessionStorage，返回列表时恢复。 */
  function bindFilterToggle(btnSel, boxSel) {
    var b = ui().qs(btnSel), box = ui().qs(boxSel);
    if (!b || !box) return;
    b.addEventListener('click', function () {
      box.classList.toggle('is-open');
      b.textContent = box.classList.contains('is-open') ? '收起筛选' : '更多筛选';
    });
  }

  /** H5 底部抽屉（筛选、更多动作、选择器）。 */
  function sheet(opts) {
    var id = 'ry-sheet';
    var old = ui().qs('#' + id);
    if (old) old.parentNode.removeChild(old);
    var host = document.createElement('div');
    host.id = id;
    host.className = 'ry-mask ry-mask--h5 is-in';
    host.innerHTML = '<div class="ry-sheet"><span class="ry-sheet__grip"></span>' +
      '<div class="ry-layer__head"><b>' + ui().esc(opts.title || '') + '</b>' +
      (opts.sub ? '<span class="ry-layer__sub">' + ui().esc(opts.sub) + '</span>' : '') + '</div>' +
      '<div class="ry-layer__body">' + (opts.body || '') + '</div>' +
      '<div class="ry-layer__foot">' + (opts.footer || '<button class="ry-btn" data-close>关闭</button>') + '</div></div>';
    document.body.appendChild(host);
    host.addEventListener('click', function (e) { if (e.target === host || e.target.closest('[data-close]')) close(); });
    function close() { if (host.parentNode) host.parentNode.removeChild(host); }
    if (opts.onOpen) opts.onOpen(host, close);
    return { el: host, close: close };
  }

  return {
    root: root, href: href, go: go, isH5: isH5,
    shell: shell, h5shell: h5shell,
    tabs: tabs, bindFilterToggle: bindFilterToggle, sheet: sheet,
    sideHtml: sideHtml, topHtml: topHtml, tabbarHtml: tabbarHtml, H5_TABS: H5_TABS
  };
})();
