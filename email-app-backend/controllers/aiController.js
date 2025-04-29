const OpenAI = require('openai');
const { saveChat, getHistory } = require('../services/chatService');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/ai/chat  { message:"...", history:10 }
exports.chat = async (req, res) => {
  const userId = req.user?.id || null;           // plug in auth later
  const userMsg = req.body.message?.trim();

  if (!userMsg) return res.status(400).json({ error: 'message required' });

  // 1️⃣  store user message
  await saveChat('user', userMsg, userId);

  // 2️⃣  assemble context
  const history = await getHistory(req.body.history ?? 10, userId);
  const messages = history.map(m => ({ role: m.role, content: m.content }));
  messages.push({ role: 'user', content: userMsg });

  // 3️⃣  call OpenAI (gpt-4.1-nano by default)
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages,
    });

    const assistantReply = completion.choices[0].message.content.trim();

    // 4️⃣ store assistant reply
    await saveChat('assistant', assistantReply, userId);

    res.json({ reply: assistantReply });
  } catch (err) {
    console.error('OpenAI error', err);
    res.status(500).json({ error: 'AI request failed' });
  }
};

// GET /api/ai/history?limit=20
exports.history = async (req, res) => {
  const limit = parseInt(req.query.limit ?? '20', 10);
  const userId = null;
  const history = await getHistory(limit, userId);
  res.json(history);
};
