// ============================================================
// pages/index/index —— 首页「今日反转」
// 今日一张翻转大卡 + 今日三连问 + 最近收录
// ============================================================
const data = require('../../utils/data.js');
const daily = require('../../utils/daily.js');

const pad3 = (n) => (n < 10 ? '00' + n : (n < 100 ? '0' + n : '' + n));

Page({
  data: {
    dateKey: '',
    dailyMyth: null,
    dailyNo: '',
    triple: [],
    recent: []
  },

  onShow() {
    this.buildDaily();
    this.buildTriple();
    this.buildRecent();
  },

  // 今日一张：按日期稳定生成
  buildDaily() {
    const total = data.MYTHS.length;
    if (!total) return;
    const idx = daily.dailyIndex(total);
    const m = data.MYTHS[idx];
    this.setData({ dailyMyth: m, dailyNo: pad3(m.id), dateKey: daily.dateKey() });
  },

  // 今日三连问：3 题判断（流传说法→答"讹"；真相结论→答"真"）
  buildTriple() {
    const total = data.MYTHS.length;
    if (!total) return;
    const idxs = daily.tripleIndices(total);
    const types = daily.tripleTypes();
    const triple = idxs.map((i, n) => {
      const m = data.MYTHS[i];
      const showTruth = types[n] === 1;
      return {
        myth: m,
        no: pad3(m.id),
        question: showTruth ? m.truth : m.claim,
        label: showTruth ? '以下说法' : '流传说法',
        answer: showTruth ? '真' : '讹',
        choice: '',
        done: false
      };
    });
    this.setData({ triple });
  },

  // 最近收录：按编号倒序取 3 条
  buildRecent() {
    const list = data.MYTHS.slice().sort((a, b) => b.id - a.id).slice(0, 3);
    this.setData({ recent: list });
  },

  onTripleAnswer(e) {
    const idx = e.currentTarget.dataset.idx;
    const choice = e.currentTarget.dataset.choice;
    const q = this.data.triple[idx];
    if (!q || q.done) return;
    const key = 'triple[' + idx + '].choice';
    const keyDone = 'triple[' + idx + '].done';
    this.setData({ [key]: choice, [keyDone]: true });
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
  },

  goArchive() {
    wx.switchTab({ url: '/pages/archive/archive' });
  },

  goQuiz() {
    wx.switchTab({ url: '/pages/quiz/quiz' });
  },

  // 分享：文案克制
  onShareAppMessage() {
    return {
      title: '这条常识，可能骗了你很久',
      path: '/pages/index/index'
    };
  }
});
