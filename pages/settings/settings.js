const CHARACTERS = require('../../utils/characters.js');

Page({
  data: {
    characters: CHARACTERS,
    selectedCharId: CHARACTERS.length > 0 ? CHARACTERS[0].id : '',
    promptText: ''
  },

  onLoad: function() {
    if (this.data.characters.length > 0) {
      const first = this.data.characters[0];
      this.setData({
        selectedCharId: first.id,
        promptText: first.prompt
      });
    }
    wx.setStorageSync('characters', CHARACTERS);
  },

  selectChar: function(e) {
    const id = e.currentTarget.dataset.id;
    const char = this.data.characters.find(c => c.id === id);
    if (char) {
      this.setData({
        selectedCharId: id,
        promptText: char.prompt
      });
    }
  },

  onPromptInput: function(e) {
    this.setData({ promptText: e.detail.value });
  },

  saveSettings: function() {
    const chars = this.data.characters.map(c => {
      if (c.id === this.data.selectedCharId) {
        return { ...c, prompt: this.data.promptText };
      }
      return c;
    });
    wx.setStorageSync('characters', chars);
    wx.showToast({ title: '保存成功', icon: 'success' });
    wx.navigateBack();
  },

  closeSettings: function() {
    wx.navigateBack();
  }
});
