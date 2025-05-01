const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const emailRoutes = require('./routes/emails');
const aiRoutes = require('./routes/ai');
const authRoutes = require('./routes/auth');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());


const { authenticate } = require('./middleware/auth');
app.use('/api/auth', authRoutes);
app.use('/api/emails',authenticate, emailRoutes);
app.use('/api/ai',authenticate, aiRoutes);

app.get('/test', (req, res) => {
    res.send('✅ Backend is live!');
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
