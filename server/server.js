const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'DeepSeek proxy', version: '1.0.0' });
});

const API_KEY = process.env.DEEPSEEK_API_KEY || '';
const API_URL = 'https://api.deepseek.com/v1/chat/completions';
const MODEL = 'deepseek-v4-flash';

app.post('/api/chat', async (req, res) => {
  try {
    const { message, characters } = req.body;
    if (!message || !characters || !Array.isArray(characters) || characters.length === 0) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const count = Math.random() < 0.4 ? 1 : 2;
    const shuffled = [...characters].sort(() => Math.random() - 0.5).slice(0, count);
    const replies = [];

    for (const char of shuffled) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + API_KEY
          },
          body: JSON.stringify({
            model: MODEL,
            messages: [
              { role: 'system', content: char.prompt },
              { role: 'user', content: message }
            ],
            temperature: 0.85,
            max_tokens: 300
          }),
          timeout: 30000
        });

        if (!response.ok) {
          console.error('API error for ' + char.name + ': ' + response.status);
          continue;
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content?.trim();
        if (reply) {
          replies.push({ charId: char.id, content: reply });
        }
      } catch (err) {
        console.error('Error calling API for ' + char.name + ':', err.message);
      }
    }

    res.json({ replies });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('DeepSeek proxy running on http://localhost:' + PORT);
});
