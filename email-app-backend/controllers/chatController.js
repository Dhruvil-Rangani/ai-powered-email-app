// controllers/chatController.js
const OpenAI = require('openai');
const { saveChat, getHistory } = require('../services/chatService');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/ai/chat
exports.chat = async (req, res) => {
  const userId = req.user.id;             // from auth middleware
  const userMsg = (req.body.message || '').trim();
  if (!userMsg) return res.status(400).json({ error: 'message required' });

  // 1) store user message
  await saveChat('user', userMsg, userId);

  // 2) assemble context
  const historyCount = Number(req.body.history) || 10;
  const history = await getHistory(historyCount, userId);
  const messages = history.map(m => ({ role: m.role, content: m.content }));
  messages.push({ role: 'user', content: userMsg });

  // 3) call OpenAI
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages,
      max_tokens: Number(process.env.OPENAI_MAX_TOKENS) || 1024,
      temperature: 0.7,
    });

    const assistantReply = completion.choices[0].message.content.trim();

    // 4) store assistant reply
    await saveChat('assistant', assistantReply, userId);

    res.json({ reply: assistantReply });
  } catch (err) {
    console.error('OpenAI error', err);
    res.status(500).json({ error: 'AI request failed', details: err.message });
  }
};

// GET /api/ai/history?limit=20
exports.history = async (req, res) => {
  const userId = req.user.id;
  const limit  = Number(req.query.limit) || 20;
  try {
    const history = await getHistory(limit, userId);
    res.json(history);
  } catch (err) {
    console.error('History fetch error', err);
    res.status(500).json({ error: 'Failed to fetch history', details: err.message });
  }
};
