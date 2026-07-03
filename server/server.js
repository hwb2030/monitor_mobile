const GIT_COMMIT = 'de47ccc';
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const https = require('https');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'DeepSeek proxy', version: '1.0.0' });
});

const API_KEY = process.env.DEEPSEEK_API_KEY || '';
const API_URL = 'https://api.deepseek.com/v1/chat/completions';
const MODEL = 'deepseek-chat';

const httpsAgent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: true
});

app.get('/debug', (req, res) => {
  res.json({
    hasApiKey: !!API_KEY,
    keyLength: API_KEY.length,
    keyPrefix: API_KEY.substring(0, 10),
    apiUrl: API_URL,
    model: MODEL
  });
});

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
        if (!char || !char.id || !char.prompt) continue;

        const systemPrompt = '[' + char.name + '] ' + char.prompt;

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + API_KEY
          },
          body: JSON.stringify({
            model: MODEL,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            temperature: 0.85,
            max_tokens: 300
          }),
          agent: httpsAgent,
          timeout: 30000
        });

        if (!response.ok) {
          const errBody = await response.json();
          console.error('DeepSeek error ' + response.status + ': ' + errBody);
          continue;
        }

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
          const reply = data.choices[0].message && data.choices[0].message.content ? data.choices[0].message.content.trim() : '';
          if (reply) {
            replies.push({ charId: char.id, content: reply });
          }
        }
      } catch (err) {
        console.error('Error for ' + (char ? char.name : 'unknown') + ':', err.message);
      }
    }

    res.json({ replies: replies });
  } catch (err) {
    console.error('Top-level error:', err.message);
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('DeepSeek proxy running on http://localhost:' + PORT);
});


