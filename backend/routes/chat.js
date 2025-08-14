import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Chat endpoint
router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a non-empty string'
      });
    }

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
        'X-Title': 'Xen AI'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are Xen AI, a helpful AI assistant. Be concise, friendly, and informative in your responses. Keep responses under 500 words unless specifically asked for longer content.'
          },
          {
            role: 'user',
            content: message.trim()
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      console.error('OpenRouter API error:', response.status, response.statusText);
      return res.status(500).json({
        success: false,
        message: 'Failed to get response from AI service'
      });
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid response from OpenRouter:', data);
      return res.status(500).json({
        success: false,
        message: 'Invalid response from AI service'
      });
    }

    res.json({
      success: true,
      data: {
        message: data.choices[0].message.content,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
