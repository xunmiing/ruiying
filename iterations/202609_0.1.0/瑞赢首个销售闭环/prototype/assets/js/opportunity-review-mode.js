/* 商机 PC 原型评审：单一演示账号可走查动作，正式权限见说明栏。 */
(function () {
  'use strict';
  if (!window.RY || !RY.perm || !RY.store) return;
  var perm = RY.perm;
  var originalCan = perm.can;
  var originalPage = perm.page;
  var originalGuard = perm.guard;
  perm.can = function (action, obj) {
    return /^opp\./.test(action) ? true : originalCan(action, obj);
  };
  perm.page = function (key) {
    return /^opp\./.test(key) ? true : originalPage(key);
  };
  perm.guard = function (pageKey, objectType, objectId) {
    if (pageKey !== 'opp.detail') return originalGuard(pageKey, objectType, objectId);
    if (!objectId || !RY.store.find(objectType, objectId)) return { ok: false, kind: 'unavailable', reason: '商机不存在。' };
    return { ok: true };
  };
})();
