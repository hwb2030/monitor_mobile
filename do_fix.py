with open('pages/index/index.wxml','r',encoding='utf-8') as f:
    text = f.read()
text = text.replace('\u003e\u003e \u8bbe\u7f6e', '\u2699\ufe0f \u8bbe\u7f6e')
text = text.replace('? \u505c\u6b62', '\u23f9 \u505c\u6b62')
text = text.replace('\u003e\u003e \u81ea\u52a8\u804a\u5929', '\U0001f504 \u81ea\u52a8\u804a\u5929')
with open('pages/index/index.wxml','w',encoding='utf-8') as f:
    f.write(text)
print('WXML done')
