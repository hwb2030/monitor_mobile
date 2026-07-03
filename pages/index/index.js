
const CHARACTERS = require('../../utils/characters.js');
const api = require('../../utils/api.js');

Page({
  data: {
    characters: CHARACTERS,
    messages: [],
    inputValue: '',
    isProcessing: false,
    showTyping: false,
    scrollToId: 'bottom'
  },

  onLoad: function() {
    this.addSystemMsg('\u{1f4ac} \u6b22\u8fce\u6765\u5230\u604b\u4e0e\u6df1\u7a7a AI \u804a\u5929\u7fa4\uff01\u53d1\u9001\u6d88\u606f\u6216\u70b9\u51fb\u300c\u81ea\u52a8\u804a\u5929\u300d\u5f00\u59cb~');
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
      name: '\u{1f9d1} \u73a9\u5bb6',
      emoji: '\u{1f9d1}',
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
      this.addSystemMsg('\u26a0\ufe0f \u7f51\u7edc\u9519\u8bef\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5');
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
