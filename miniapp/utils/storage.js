// ============================================================
// utils/storage.js —— 收藏 / 答题统计（wx.setStorageSync 本地存储）
// 所有写入均带异常兜底，存储失败时降级为内存态。
// ============================================================

const KEY_FAV = 'csjzs_favorites';
const KEY_STATS = 'csjzs_stats';

let memFav = null;   // 内存降级：收藏
let memStats = null; // 内存降级：统计

function readJSON(key, fallback) {
  try {
    const v = wx.getStorageSync(key);
    if (v === '' || v === null || v === undefined) return fallback;
    if (typeof v === 'string') return JSON.parse(v);
    return v;
  } catch (e) {
    return fallback;
  }
}

function writeJSON(key, val) {
  try {
    wx.setStorageSync(key, val);
    return true;
  } catch (e) {
    return false;
  }
}

// ---------- 收藏 ----------

function getFavorites() {
  if (memFav) return memFav.slice();
  const v = readJSON(KEY_FAV, []);
  memFav = Array.isArray(v) ? v : [];
  return memFav.slice();
}

function isFavorite(id) {
  return getFavorites().indexOf(id) !== -1;
}

// 返回切换后的收藏状态：true=已收藏
function toggleFavorite(id) {
  const list = getFavorites();
  const i = list.indexOf(id);
  if (i === -1) {
    list.unshift(id);
  } else {
    list.splice(i, 1);
  }
  memFav = list;
  writeJSON(KEY_FAV, list);
  return i === -1;
}

// ---------- 答题统计 ----------

function getStats() {
  if (memStats) return Object.assign({}, memStats);
  const v = readJSON(KEY_STATS, { answered: 0, correct: 0, best: 0, rounds: 0 });
  memStats = {
    answered: Number(v.answered) || 0,
    correct: Number(v.correct) || 0,
    best: Number(v.best) || 0,
    rounds: Number(v.rounds) || 0
  };
  return Object.assign({}, memStats);
}

function recordAnswer(correct) {
  const s = getStats();
  s.answered += 1;
  if (correct) s.correct += 1;
  memStats = s;
  writeJSON(KEY_STATS, s);
}

function recordRound(score) {
  const s = getStats();
  s.rounds += 1;
  if (score > s.best) s.best = score;
  memStats = s;
  writeJSON(KEY_STATS, s);
}

// ---------- 清空（"我的"页主动触发，页面层需先弹确认框） ----------

function clearAll() {
  memFav = [];
  memStats = null;
  try { wx.removeStorageSync(KEY_FAV); } catch (e) { /* 忽略 */ }
  try { wx.removeStorageSync(KEY_STATS); } catch (e) { /* 忽略 */ }
}

module.exports = {
  getFavorites, isFavorite, toggleFavorite,
  getStats, recordAnswer, recordRound, clearAll
};
