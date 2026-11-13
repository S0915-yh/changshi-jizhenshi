// ============================================================
// app.js —— 常识急诊室 · 应用入口
// ============================================================
App({
  onLaunch() {
    // 无后端、无登录、无网络依赖；仅做一次本地数据自检
    try {
      const data = require('./utils/data.js');
      this.globalData.total = data.MYTHS.length;
      this.globalData.categories = data.CATEGORIES;
    } catch (e) {
      this.globalData.total = 0;
      this.globalData.categories = [];
    }
  },
  globalData: {
    total: 0,
    categories: []
  }
});
