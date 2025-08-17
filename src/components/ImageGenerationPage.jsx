import { useState } from 'react'
import { motion } from 'framer-motion'
import { PhotoIcon, SparklesIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'

const ImageGenerationPage = () => {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [error, setError] = useState('')
  const [imageSize, setImageSize] = useState('1024x1024')
  const [steps, setSteps] = useState(50)
  
  const { token } = useAuth()

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    setError('')
    
    try {
      const [width, height] = imageSize.split('x').map(Number)
      
      const response = await fetch('https://fxqm8v270a.execute-api.us-east-1.amazonaws.com/dev/api/image/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          negative_prompt: negativePrompt.trim(),
          width,
          height,
          num_inference_steps: steps
        })
      })

      const data = await response.json()
      console.log('API Response:', data)

      if (data.success) {
        const imageUrl = `http://localhost:5000${data.data.imageUrl}`
        console.log('Setting image URL:', imageUrl)
        setGeneratedImage(imageUrl)
      } else {
        setError(data.message || 'Failed to generate image')
      }
    } catch (err) {
      console.error('Image generation error:', err)
      setError('Failed to generate image. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (generatedImage) {
      try {
        // Fetch the image as blob to handle CORS properly
        const response = await fetch(generatedImage)
        const blob = await response.blob()
        
        // Create object URL and download
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `generated-image-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Clean up object URL
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Download failed:', error)
        // Fallback to direct link
        const link = document.createElement('a')
        link.href = generatedImage
        link.download = `generated-image-${Date.now()}.png`
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">AI Image Generation</h1>
          <p className="text-gray-400">Create stunning images with Stable Diffusion XL</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-green-400 text-sm font-semibold">Stable Diffusion XL</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Prompt Input */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white text-lg font-bold mb-4">Describe your image</h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic cityscape with neon lights and flying cars, highly detailed, 8k resolution, photorealistic..."
              className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            
            <div className="mt-4">
              <label className="block text-gray-400 text-sm font-medium mb-2">Negative Prompt (Optional)</label>
              <textarea
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="blurry, low quality, distorted, ugly..."
                className="w-full h-20 bg-gray-800 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <span className="text-gray-400 text-sm">{prompt.length}/1000 characters</span>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center space-x-2 ${
                  !prompt.trim() || isGenerating
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {isGenerating ? (
                  <>
                    <SparklesIcon className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <PhotoIcon className="w-4 h-4" />
                    <span>Generate Image</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white text-lg font-bold mb-4">Generation Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Image Size</label>
                <select 
                  value={imageSize}
                  onChange={(e) => setImageSize(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="512x512">512x512 (Fast)</option>
                  <option value="768x768">768x768 (Balanced)</option>
                  <option value="1024x1024">1024x1024 (High Quality)</option>
                  <option value="1024x768">1024x768 (Landscape)</option>
                  <option value="768x1024">768x1024 (Portrait)</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Inference Steps: {steps}
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={steps}
                  onChange={(e) => setSteps(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Fast (20)</span>
                  <span>Balanced (50)</span>
                  <span>High Quality (100)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <h4 className="text-blue-400 font-semibold mb-2">💡 Pro Tips</h4>
            <ul className="text-blue-300 text-sm space-y-1">
              <li>• Be specific and descriptive in your prompts</li>
              <li>• Add quality terms like "highly detailed", "8k", "photorealistic"</li>
              <li>• Use negative prompts to avoid unwanted elements</li>
              <li>• Higher steps = better quality but slower generation</li>
            </ul>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          {/* Generated Image */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white text-lg font-bold mb-4">Generated Image</h3>
            
            {isGenerating ? (
              <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <SparklesIcon className="w-12 h-12 text-orange-500 animate-pulse mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Creating your masterpiece...</p>
                  <p className="text-gray-500 text-sm">This may take 30-60 seconds</p>
                </div>
              </div>
            ) : generatedImage ? (
              <div className="space-y-4">
                <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                  <img 
                    src={generatedImage} 
                    alt="Generated" 
                    className="w-full h-full object-cover"
                    onLoad={() => console.log('Image loaded successfully:', generatedImage)}
                    onError={(e) => {
                      console.error('Image failed to load:', generatedImage, e)
                      setError('Failed to load generated image')
                    }}
                  />
                </div>
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center space-x-2"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>Download</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerate}
                    disabled={!prompt.trim()}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center space-x-2"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    <span>Generate Again</span>
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <PhotoIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">Your generated image will appear here</p>
                  <p className="text-sm text-gray-500">Enter a prompt and click Generate to start</p>
                </div>
              </div>
            )}
          </div>

          {/* Model Info */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white text-lg font-bold mb-4">Model Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Model:</span>
                <span className="text-white">Stable Diffusion XL Base 1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Provider:</span>
                <span className="text-white">Hugging Face</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Resolution:</span>
                <span className="text-white">{imageSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Steps:</span>
                <span className="text-white">{steps}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageGenerationPage
