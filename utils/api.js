const CHARACTERS = require('./characters.js');
const API_URL = 'https://monitormobile-production.up.railway.app/api/chat'; // 本地后端地址，部署后替换

// 随机选回复角色
function pickResponders() {
  const count = Math.random() < 0.4 ? 1 : 2;
  const shuffled = [...CHARACTERS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// 调用后端 API 获取 AI 回复
function callChatAPI(message) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API_URL,
      method: 'POST',
      data: {
        message: message,
        characters: CHARACTERS.map(c => ({ id: c.id, prompt: c.prompt, name: c.name }))
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.replies) {
          resolve(res.data.replies);
        } else {
          reject(new Error('API \u8FD4\u56DE\u5F02\u5E38: ' + JSON.stringify(res)));
        }
      },
      fail: (err) => {
        reject(err);
      },
      timeout: 30000
    });
  });
}

module.exports = {
  pickResponders,
  callChatAPI,
  CHARACTERS
};

