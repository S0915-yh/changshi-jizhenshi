// ============================================================
// pages/detail/detail —— 档案详情页
// 流传版本 → 翻面真相 → 为什么错 → 适用条件 → 来源
// 收藏 / 分享 / 相关误区
// ============================================================
const data = require('../../utils/data.js');
const storage = require('../../utils/storage.js');
const feedback = require('../../utils/feedback.js');

const pad3 = (n) => (n < 10 ? '00' + n : (n < 100 ? '0' : '') + n);

Page({
  data: {
    m: null,
    no: '',
    revealed: false,
    fav: false,
    related: []
  },

  onLoad(query) {
    const id = Number(query.id);
    const m = data.MYTHS.find((x) => x.id === id);
    if (!m) {
      this.setData({ m: null });
      return;
    }
    // 相关误区：优先 relatedIds，不足 3 条用同科室补齐
    let related = (m.relatedIds || [])
      .map((rid) => data.MYTHS.find((x) => x.id === rid))
      .filter(Boolean);
    if (related.length < 3) {
      data.MYTHS.forEach((x) => {
        if (related.length < 3 && x.category === m.category && x.id !== m.id) {
          if (!related.some((r) => r.id === x.id)) related.push(x);
        }
      });
    }
    related = related.slice(0, 3).map((x) => ({
      id: x.id, title: x.title, category: x.category, no: pad3(x.id)
    }));
    this.setData({
      m: m,
      no: pad3(m.id),
      revealed: false,
      fav: storage.isFavorite(m.id),
      related: related
    });
    wx.setNavigationBarTitle({ title: '档案 NO.' + pad3(m.id) });
  },

  // 翻面看真相
  onReveal() {
    if (this.data.revealed) return;
    feedback.vibrate();
    this.setData({ revealed: true });
  },

  // 收藏（带轻震动与 toast 兜底）
  onFav() {
    const id = this.data.m.id;
    const nowFav = storage.toggleFavorite(id);
    feedback.vibrate();
    wx.showToast({ title: nowFav ? '已收藏' : '已取消收藏', icon: 'none', duration: 900 });
    this.setData({ fav: nowFav });
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
  },

  goBack() {
    wx.navigateBack({ fail: function () { wx.switchTab({ url: '/pages/archive/archive' }); } });
  },

  // 分享：文案克制
  onShareAppMessage() {
    const m = this.data.m;
    return {
      title: '这条常识，可能骗了你很久',
      path: '/pages/detail/detail?id=' + (m ? m.id : '')
    };
  }
});
