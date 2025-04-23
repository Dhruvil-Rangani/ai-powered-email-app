const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const emailRoutes = require('./routes/emails');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/emails', emailRoutes);

app.get('/test', (req, res) => {
    res.send('✅ Backend is live!');
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
