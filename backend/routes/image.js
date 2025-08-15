import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, '../public/images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

console.log('Images directory:', imagesDir);

// Hugging Face API query function
async function query(data) {
  console.log('Calling Hugging Face API with data:', JSON.stringify(data, null, 2));
  console.log('Using endpoint: https://router.huggingface.co/fal-ai/fal-ai/stable-diffusion-v35-large');
  
  const response = await fetch(
    "https://router.huggingface.co/fal-ai/fal-ai/stabilityai/stable-diffusion",
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  
  console.log('API Response status:', response.status);
  console.log('API Response headers:', Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    const errorText = await response.text();
    console.log('API Error response:', errorText);
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }
  
  const result = await response.blob();
  console.log('Received blob size:', result.size);
  return result;
}

// Generate image endpoint
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { prompt, negative_prompt = '', width = 1024, height = 1024, num_inference_steps = 50 } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    console.log('Generating image with prompt:', prompt);

    // Check if HF_TOKEN is configured
    if (!process.env.HF_TOKEN) {
      return res.status(500).json({
        success: false,
        message: 'Hugging Face API token not configured'
      });
    }

    // Call Hugging Face API with new endpoint
    const imageBlob = await query({
      sync_mode: true,
      prompt: prompt,
      negative_prompt: negative_prompt || undefined,
      width,
      height,
      num_inference_steps
    });

    // Convert blob to buffer
    const arrayBuffer = await imageBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `generated_${timestamp}.png`;
    const filepath = path.join(imagesDir, filename);

    // Save image to disk
    fs.writeFileSync(filepath, buffer);
    console.log('Image saved to:', filepath);
    console.log('File exists:', fs.existsSync(filepath));
    console.log('File size:', fs.statSync(filepath).size, 'bytes');

    // Return image URL
    const imageUrl = `/images/${filename}`;
    console.log('Returning image URL:', imageUrl);

    res.json({
      success: true,
      message: 'Image generated successfully',
      data: {
        imageUrl,
        prompt,
        timestamp
      }
    });

  } catch (error) {
    console.error('Image generation error:', error);
    
    if (error.message.includes('status: 503')) {
      return res.status(503).json({
        success: false,
        message: 'Model is currently loading. Please try again in a few moments.'
      });
    }

    if (error.message.includes('status: 429')) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please try again later.'
      });
    }

    if (error.message.includes('status: 401')) {
      return res.status(500).json({
        success: false,
        message: 'Invalid API token. Please check server configuration.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate image. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user's generated images
router.get('/history', authenticateToken, async (req, res) => {
  try {
    // For now, return empty array - you can implement database storage later
    res.json({
      success: true,
      data: {
        images: []
      }
    });
  } catch (error) {
    console.error('Image history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch image history'
    });
  }
});

export default router;
