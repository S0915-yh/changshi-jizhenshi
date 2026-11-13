// ============================================================
// components/truth-card —— 可 3D 翻转的「档案卡」
// 正面：档案编号 + 卷宗名 + 流传说法；背面：真相结论 + 档案批注
// 翻牌 320ms；触发 flip 事件；自带轻震动反馈。
// ============================================================
const feedback = require('../../utils/feedback.js');

Component({
  properties: {
    // 卷宗对象：{ id, title, claim, truth, quote, category, mythScore }
    myth: {
      type: Object,
      value: {}
    },
    // 初始是否已翻开
    startFlipped: {
      type: Boolean,
      value: false
    }
  },

  data: {
    flipped: false
  },

  lifetimes: {
    attached() {
    if (this.data.startFlipped) {
        this.setData({ flipped: true });
      }
    }
  },

  methods: {
    onToggle() {
      feedback.vibrate();
      this.setData({ flipped: !this.data.flipped });
      this.triggerEvent('flip', { id: this.data.myth.id, flipped: !this.data.flipped });
    }
  }
});
