// ============================================================
// utils/feedback.js —— 轻震动反馈（失败静默降级）
// ============================================================

function vibrate() {
  if (!wx.vibrateShort) return;
  try {
    wx.vibrateShort({ type: 'light', fail: function () { /* 设备不支持则忽略 */ } });
  } catch (e) { /* 老基础库无 type 参数，忽略 */ }
}

module.exports = { vibrate };
