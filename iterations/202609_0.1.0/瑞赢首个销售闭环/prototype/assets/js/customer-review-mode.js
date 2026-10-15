/* 客户 PC 原型评审：单一演示账号可走查页面动作；正式权限口径见说明栏。
 * 仅在 customer/*.html 引入，离开页面后不保留任何权限覆盖。
 */
(function () {
  'use strict';
  if (!window.RY || !RY.perm || !RY.store) return;
  var perm = RY.perm;
  var originalCan = perm.can;
  var originalPage = perm.page;
  var originalGuard = perm.guard;
  var allowed = /^(?:customer\.|customerNetwork\.|relation\.|pool\.|contact\.create$|opp\.create$)/;
  perm.can = function (action, obj) {
    return allowed.test(action) ? true : originalCan(action, obj);
  };
  perm.page = function (key) {
    return /^customer\./.test(key) ? true : originalPage(key);
  };
  perm.guard = function (pageKey, objectType, objectId) {
    if (pageKey !== 'customer.detail') return originalGuard(pageKey, objectType, objectId);
    if (!objectId || !RY.store.find(objectType, objectId)) return { ok: false, kind: 'unavailable', reason: '客户记录不存在。' };
    return { ok: true };
  };
})();
