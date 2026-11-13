// ============================================================
// pages/archive/archive —— 档案馆「误区档案」
// 分类筛选、搜索、按误区指数排序、左滑/长按收藏、分批渲染
// ============================================================
const data = require('../../utils/data.js');
const storage = require('../../utils/storage.js');
const feedback = require('../../utils/feedback.js');

const BATCH = 12; // 每批渲染条数

const pad3 = (n) => (n < 10 ? '00' + n : (n < 100 ? '0' + n : '' + n));

Page({
  data: {
    cats: ['全部'].concat(data.CATEGORIES || []),
    activeCat: '全部',
    keyword: '',
    sortMode: 'score', // 'score'=按误区指数降序, 'id'=按编号升序
    all: [],    // 过滤排序后的完整结果
    shown: [],  // 当前渲染批次
    total: 0,
    favCount: 0
  },

  onLoad() {
    this.rebuild();
  },

  onShow() {
    // 收藏状态可能被详情页修改，返回时刷新
    const favs = storage.getFavorites();
    this.setData({
      favCount: favs.length,
      all: this.data.all.map((m) => Object.assign({}, m, { fav: favs.indexOf(m.id) !== -1 }))
    });
    this.reapplyShown();
  },

  rebuild() {
    const favs = storage.getFavorites();
    const kw = (this.data.keyword || '').trim().toLowerCase();
    let list = data.MYTHS.filter((m) => {
      if (this.data.activeCat !== '全部' && m.category !== this.data.activeCat) return false;
      if (!kw) return true;
      return (m.title + m.claim + m.quote + m.truth + m.category).toLowerCase().indexOf(kw) !== -1;
    });
    list = list.map((m) => ({
      id: m.id,
      title: m.title,
      claim: m.claim,
      category: m.category,
      mythScore: m.mythScore,
      no: pad3(m.id),
      fav: favs.indexOf(m.id) !== -1
    }));
    if (this.data.sortMode === 'score') {
      list.sort((a, b) => b.mythScore - a.mythScore || a.id - b.id);
    } else {
      list.sort((a, b) => a.id - b.id);
    }
    this.setData({ all: list, total: list.length });
    this.reapplyShown(true);
  },

  // 分批渲染：重置或追加
  reapplyShown(reset) {
    const n = reset ? BATCH : this.data.shown.length + BATCH;
    this.setData({ shown: this.data.all.slice(0, n) });
  },

  onReachBottom() {
    if (this.data.shown.length < this.data.total) {
      this.reapplyShown();
    }
  },

  onCatTap(e) {
    this.setData({ activeCat: e.currentTarget.dataset.cat });
    this.rebuild();
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
    this.rebuild();
  },

  onSortToggle() {
    feedback.vibrate();
    this.setData({ sortMode: this.data.sortMode === 'score' ? 'id' : 'score' });
    this.rebuild();
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
  },

  // 左滑收藏：touchstart/touchend 计算 delta
  onTouchStart(e) {
    this._sx = e.touches[0].clientX;
    this._sy = e.touches[0].clientY;
  },

  onTouchEnd(e) {
    if (typeof this._sx !== 'number') return;
    const dx = e.changedTouches[0].clientX - this._sx;
    const dy = e.changedTouches[0].clientY - this._sy;
    this._sx = null;
    if (dx < -60 && Math.abs(dy) < 40) {
      this.toggleFav(e);
    }
  },

  onLongPress(e) {
    this.toggleFav(e);
  },

  toggleFav(e) {
    const id = e.currentTarget.dataset.id;
    const favs = storage.getFavorites();
    const nowFav = storage.toggleFavorite(id);
    feedback.vibrate();
    wx.showToast({ title: nowFav ? '已收藏' : '已取消收藏', icon: 'none', duration: 900 });
    const all = this.data.all.map((m) => (m.id === id ? Object.assign({}, m, { fav: nowFav }) : m));
    this.setData({ all, favCount: favs.length + (nowFav ? 1 : -1) });
    this.reapplyShown();
  },

  onShareAppMessage() {
    return {
      title: '这条常识，可能骗了你很久',
      path: '/pages/archive/archive'
    };
  }
});
