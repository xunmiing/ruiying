/* Prototype-only binary storage for knowledge attachments. Browser IndexedDB keeps
 * selected files across reloads; production upload, scanning and access checks
 * remain server responsibilities. */
(function () {
  'use strict';
  function open() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) return reject(new Error('当前浏览器不支持本地附件存储'));
      var request = indexedDB.open('ry-knowledge-attachments', 1);
      request.onupgradeneeded = function () {
        if (!request.result.objectStoreNames.contains('files')) request.result.createObjectStore('files');
      };
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(request.error || new Error('本地附件存储不可用')); };
    });
  }
  function put(key, file) {
    return open().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('files', 'readwrite');
        tx.objectStore('files').put(file, key);
        tx.oncomplete = function () { db.close(); resolve(); };
        tx.onerror = function () { db.close(); reject(tx.error || new Error('附件保存失败')); };
      });
    });
  }
  function get(key) {
    return open().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('files', 'readonly');
        var request = tx.objectStore('files').get(key);
        request.onsuccess = function () { db.close(); resolve(request.result || null); };
        request.onerror = function () { db.close(); reject(request.error || new Error('附件读取失败')); };
      });
    });
  }
  function saveFiles(docId, files) {
    var selected = Array.prototype.slice.call(files || []);
    var saved = [];
    return selected.reduce(function (chain, file) {
      return chain.then(function () {
        var id = docId + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
        return put(id, file).then(function () {
          saved.push({ id: id, name: file.name, type: file.type || 'application/octet-stream', size: file.size });
        });
      });
    }, Promise.resolve()).then(function () { return saved; });
  }
  function download(meta) {
    return get(meta.id).then(function (file) {
      if (!file) throw new Error('本地附件内容不可用，请重新上传');
      var url = URL.createObjectURL(file);
      var a = document.createElement('a');
      a.href = url; a.download = meta.name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
    });
  }
  window.RYKnowledgeFiles = { saveFiles: saveFiles, download: download };
})();
