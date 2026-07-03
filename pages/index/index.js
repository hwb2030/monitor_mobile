const CHARACTERS = require('../../utils/characters.js');

const api = require('../../utils/api.js');



Page({

  data: {

    characters: CHARACTERS,

    messages: [],

    inputValue: '',

    isProcessing: false,

    isAutoChatting: false,

    showTyping: false,

    scrollToId: 'bottom'

  },



  onLoad: function() {

    this.addSystemMsg('💬 欢迎来到恋与深空 AI 聊天群！发送消息或点击「自动聊天」开始~');

  },



  onInput: function(e) {

    this.setData({ inputValue: e.detail.value });

  },



  onSend: function() {

    const text = this.data.inputValue ? this.data.inputValue.trim() : '';

    if (!text || this.data.isProcessing) return;

    this.sendMessage(text);

  },



  sendMessage: async function(text) {

    this.setData({ inputValue: '', isProcessing: true });

    this.addPlayerMsg(text);

    this.scrollToBottom();

    await this.getAIReplies(text);

    this.setData({ isProcessing: false });

  },



  addPlayerMsg: function(content) {

    const time = this.getTime();

    const msg = {

      id: Date.now() + Math.random(),

      type: 'message',

      role: 'player',

      name: '🧑 玩家',

      emoji: '🧑',

      content: content,

      time: time

    };

    this.setData({ messages: [...this.data.messages, msg] });

  },



  addAIMsg: function(charId, content) {

    const char = CHARACTERS.find(c => c.id === charId);

    if (!char) return;

    const time = this.getTime();

    const msg = {

      id: Date.now() + Math.random(),

      type: 'message',

      role: 'ai',

      name: char.emoji + ' ' + char.name,

      emoji: char.emoji,

      color: char.color,

      bgColor: char.bgColor,

      content: content,

      time: time

    };

    this.setData({ messages: [...this.data.messages, msg] });

    this.scrollToBottom();

  },



  addSystemMsg: function(text) {

    const msg = { id: Date.now(), type: 'system', content: text };

    this.setData({ messages: [...this.data.messages, msg] });

    this.scrollToBottom();

  },



  getAIReplies: async function(userText) {

    this.setData({ showTyping: true });

    this.scrollToBottom();

    try {

      const replies = await api.callChatAPI(userText);

      this.setData({ showTyping: false });

      if (replies && replies.length > 0) {

        for (const reply of replies) {

          await this.sleep(1000 + Math.random() * 2000);

          this.addAIMsg(reply.charId, reply.content);

        }

      }

    } catch (err) {

      this.setData({ showTyping: false });

      console.error('API error:', err);

      this.addSystemMsg('⚠️ 网络错误，请稍后重试');

    }

  },



  goToSettings: function() {

    wx.navigateTo({ url: '/pages/settings/settings' });

  },



  autoChatTimer: null,



  onAutoChat: function() {

    if (this.data.isAutoChatting) {

      this.setData({ isAutoChatting: false });

      if (this.autoChatTimer) {

        clearTimeout(this.autoChatTimer);

        this.autoChatTimer = null;

      }

      return;

    }

    this.setData({ isAutoChatting: true });

    this.autoChatLoop();

  },



  autoChatLoop: async function() {
    if (!this.data.isAutoChatting) return;
    // AI agents auto-trigger conversation without player sending a message
    const topics = ['大家今天在做什么呢？', '今天天气真好啊~', '你们有什么有趣的事要分享吗？', '有人在吗？想聊聊天~'];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    await this.triggerAutoAIChat(topic);
    await this.sleep(8000 + Math.random() * 5000);
    if (this.data.isAutoChatting) {
      this.autoChatTimer = setTimeout(() => this.autoChatLoop(), 3000);
    }
  },



  triggerAutoAIChat: async function(topic) {

    this.setData({ showTyping: true });

    this.scrollToBottom();

    try {

      const replies = await api.callChatAPI(topic);

      this.setData({ showTyping: false });

      if (replies && replies.length > 0) {

        for (const reply of replies) {

          await this.sleep(1000 + Math.random() * 2000);

          this.addAIMsg(reply.charId, reply.content);

        }

      }

    } catch (err) {

      this.setData({ showTyping: false });

      console.error('Auto chat API error:', err);

    }

  },



  scrollToBottom: function() {

    setTimeout(() => {

      this.setData({ scrollToId: 'bottom' });

    }, 100);

  },



  getTime: function() {

    const d = new Date();

    const h = String(d.getHours()).padStart(2, '0');

    const m = String(d.getMinutes()).padStart(2, '0');

    return h + ':' + m;

  },



  sleep: function(ms) {

    return new Promise(resolve => setTimeout(resolve, ms));

  }

});

