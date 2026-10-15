/* 联系人多联系方式：兼容既有单值字段，第一条作为主要联系方式。 */
(function () {
  'use strict';
  var api = {};
  api.values = function (c, kind) {
    var key = kind === 'phone' ? 'phones' : 'wechats';
    var legacy = kind === 'phone' ? c.phonePlain : c.wechat;
    return Array.isArray(c[key]) ? c[key].filter(Boolean) : (legacy ? [legacy] : []);
  };
  api.parse = function (raw) {
    var seen = {}, out = [];
    String(raw || '').split(/[\r\n,，;；]+/).forEach(function (x) {
      x = x.trim(); if (x && !seen[x]) { seen[x] = true; out.push(x); }
    });
    return out;
  };
  api.fields = function (c) {
    return '<div class="ry-field"><label>手机号（每行一个，首行为主要号码）</label><textarea class="ry-input" name="phones" rows="3" placeholder="每行填写一个手机号">' + RY.ui.esc(api.values(c, 'phone').join('\n')) + '</textarea></div>' +
      '<div class="ry-field"><label>微信号（每行一个，首行为主要微信号）</label><textarea class="ry-input" name="wechats" rows="3" placeholder="每行填写一个微信号">' + RY.ui.esc(api.values(c, 'wechat').join('\n')) + '</textarea></div>';
  };
  api.read = function (el) {
    var phones = api.parse(el.querySelector('[name="phones"]').value);
    var wechats = api.parse(el.querySelector('[name="wechats"]').value);
    return { ok: true, phones: phones, wechats: wechats };
  };
  api.save = function (c, data) {
    c.phones = data.phones.slice(); c.wechats = data.wechats.slice();
    c.phonePlain = c.phones[0] || ''; c.phone = c.phonePlain ? c.phonePlain.slice(0, 3) + '****' + c.phonePlain.slice(-4) : '';
    c.wechat = c.wechats[0] || '';
  };
  RY.contactChannels = api;
})();
