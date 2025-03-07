const express = require('express');
const cors = require('cors');
const { Anthropic } = require('@anthropic-ai/sdk');

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: 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,
});

app.post('/api/chat', async (req, res) => {
  try {
    const response = await anthropic.messages.create(req.body);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Proxy server running on port 3000');
}); 