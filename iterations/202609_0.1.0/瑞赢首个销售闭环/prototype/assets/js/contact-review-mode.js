/* 联系人 PC 原型：单一演示账号可走查动作；正式权限规则见说明栏。 */
(function () {
  'use strict';
  if (!window.RY || !RY.perm || !RY.store) return;
  var perm = RY.perm;
  var originalCan = perm.can, originalPage = perm.page, originalGuard = perm.guard;
  var isContactPage = /\/pc\/contact\/(?:list|detail)\.html$/.test(location.pathname) || (/\/pc\/customer\/import\.html$/.test(location.pathname) && /[?&]kind=contact(?:&|$)/.test(location.search));
  if (!isContactPage) return;
  perm.canViewPlainPhone = function () { return true; };
  perm.can = function (action, obj) { return /^contact\./.test(action) ? true : originalCan(action, obj); };
  perm.page = function (key) { return /^contact\./.test(key) ? true : originalPage(key); };
  perm.guard = function (pageKey, objectType, objectId) {
    if (pageKey !== 'contact.detail') return originalGuard(pageKey, objectType, objectId);
    var contact = objectId && RY.store.find(objectType, objectId);
    if (!contact) return { ok: false, kind: 'unavailable', reason: '联系人记录不存在。' };
    if (!perm.inScope(objectType, contact)) return { ok: false, kind: 'no-permission', reason: '该联系人已不在本人负责、协作或团队客户范围内。' };
    return { ok: true };
  };
})();
