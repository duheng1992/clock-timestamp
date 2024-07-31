export function setStorage(store, callback) {
  chrome.storage.local.set({ 'clock-timestamp-default': store }, function () {
    callback && callback();
  });
}

export function getStorage(callback) {
  chrome.storage.local.get('clock-timestamp-default', function (item) {
    callback && callback(item);
  });
}
