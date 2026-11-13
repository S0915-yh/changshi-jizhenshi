// ============================================================
// utils/daily.js —— 每日一题 / 今日三连问：按日期稳定生成
// 同一天任何时刻打开，结果一致；跨天自然轮换。
// ============================================================

// 一年中的第几天（本地时区）
function dayOfYear(date) {
  const d = date || new Date();
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

// 今日日期 key，如 2026-11-13
function dateKey() {
  const d = new Date();
  const p = (n) => (n < 10 ? '0' + n : '' + n);
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

// 每日一条的档案下标：day % total
function dailyIndex(total) {
  return dayOfYear() % total;
}

// 三个互不重复的下标：由日期确定性推导（线性同余展开后去重）
function tripleIndices(total) {
  if (total <= 0) return [];
  const d = dayOfYear();
  const raw = [];
  let a = (d * 7 + 3) % total;
  for (let i = 0; i < 3 && i < total; i++) {
    while (raw.indexOf(a) !== -1) a = (a + 1) % total;
    raw.push(a);
    a = (a + 11) % total;
  }
  return raw;
}

// 三连问中每题的题型：0=展示流传说法(答:讹) 1=展示真相结论(答:真)
// 由日期决定，保证同一天稳定且有区分度
function tripleTypes() {
  const d = dayOfYear();
  return [(d + 0) % 2, (d + 1) % 2, (d + 2) % 2];
}

module.exports = { dayOfYear, dateKey, dailyIndex, tripleIndices, tripleTypes };
