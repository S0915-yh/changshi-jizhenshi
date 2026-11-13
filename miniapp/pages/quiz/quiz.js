// ============================================================
// pages/quiz/quiz —— 答题「拆弹挑战」
// 随机抽 5 题判断题：一半展示流传说法（答"讹"），
// 一半展示真相结论（答"真"），保证挑战有难度。
// 答错不羞辱，用"原来如此"式解释。
// ============================================================
const data = require('../../utils/data.js');
const storage = require('../../utils/storage.js');
const feedback = require('../../utils/feedback.js');

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

const RESULT_TITLES = ['一颗没拆掉', '差一颗', '拆弹中段位', '手法干净', '全数拆除'];

Page({
  data: {
    stage: 'intro', // intro | qa | verdict | result
    questions: [],
    cur: 0,
    correctCount: 0,
    choice: '',
    isCorrect: false,
    stats: { answered: 0, correct: 0, best: 0, rounds: 0 }
  },

  onShow() {
    this.setData({ stats: storage.getStats() });
  },

  start() {
    const picked = shuffle(data.MYTHS).slice(0, 5);
    // 题型交替：偶数位展示"流传说法"（答：讹），奇数位展示"真相结论"（答：真）
    const questions = picked.map((m, i) => {
      const showTruth = i % 2 === 1;
      return {
        id: m.id,
        question: showTruth ? m.truth : m.claim,
        label: showTruth ? '以下说法' : '流传说法',
        answer: showTruth ? '真' : '讹',
        truth: m.truth,
        why: m.whyWrong[0],
        source: m.sourceName,
        quote: m.quote
      };
    });
    this.setData({
      questions: questions,
      cur: 0,
      correctCount: 0,
      choice: '',
      stage: 'qa'
    });
  },

  onAnswer(e) {
    if (this.data.stage !== 'qa') return;
    const choice = e.currentTarget.dataset.choice;
    const q = this.data.questions[this.data.cur];
    const isCorrect = choice === q.answer;
    feedback.vibrate();
    storage.recordAnswer(isCorrect);
    this.setData({
      choice: choice,
      isCorrect: isCorrect,
      correctCount: this.data.correctCount + (isCorrect ? 1 : 0),
      stage: 'verdict'
    });
  },

  next() {
    if (this.data.cur >= this.data.questions.length - 1) {
      const score = this.data.correctCount;
      storage.recordRound(score);
      this.setData({ stage: 'result', stats: storage.getStats() });
    } else {
      this.setData({ cur: this.data.cur + 1, choice: '', stage: 'qa' });
    }
  },

  retry() {
    this.start();
  },

  goArchive() {
    wx.switchTab({ url: '/pages/archive/archive' });
  },

  onShareAppMessage() {
    return {
      title: '这条常识，可能骗了你很久',
      path: '/pages/quiz/quiz'
    };
  }
});
