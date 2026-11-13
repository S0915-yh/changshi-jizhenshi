// ============================================================
// pages/mine/mine —— 我的档案
// 收藏列表、答题统计、关于与免责声明、清除本地数据
// ============================================================
const data = require('../../utils/data.js');
const storage = require('../../utils/storage.js');
const feedback = require('../../utils/feedback.js');

Page({
  data: {
    favs: [],
    stats: { answered: 0, correct: 0, best: 0, rounds: 0 }
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const ids = storage.getFavorites();
    const favs = ids
      .map((id) => data.MYTHS.find((m) => m.id === id))
      .filter(Boolean)
      .map((m) => ({
        id: m.id,
        no: (m.id < 10 ? '00' : (m.id < 100 ? '0' : '')) + m.id,
        title: m.title,
        category: m.category,
        mythScore: m.mythScore
      }));
    this.setData({ favs: favs, stats: storage.getStats() });
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
  },

  goArchive() {
    wx.switchTab({ url: '/pages/archive/archive' });
  },

  onUnfav(e) {
    const id = e.currentTarget.dataset.id;
    storage.toggleFavorite(id);
    feedback.vibrate();
    wx.showToast({ title: '已取消收藏', icon: 'none', duration: 900 });
    this.refresh();
  },

  // 清除本地数据：必须先确认
  onClear() {
    wx.showModal({
      title: '清除本地数据',
      content: '将删除收藏与答题记录，无法恢复。确定继续吗？',
      confirmText: '清除',
      confirmColor: '#C33A2E',
      success: (res) => {
        if (res.confirm) {
          storage.clearAll();
          this.refresh();
          wx.showToast({ title: '已清除', icon: 'none', duration: 900 });
        }
      }
    });
  },

  onShareAppMessage() {
    return {
      title: '这条常识，可能骗了你很久',
      path: '/pages/index/index'
    };
  }
});
