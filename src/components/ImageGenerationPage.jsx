import { useState } from 'react'
import { motion } from 'framer-motion'
import { PhotoIcon, SparklesIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'

const ImageGenerationPage = () => {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    
    // Simulate API call
    setTimeout(() => {
      setGeneratedImage('https://via.placeholder.com/512x512/3B82F6/FFFFFF?text=Generated+Image')
      setIsGenerating(false)
    }, 3000)
  }

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a')
      link.href = generatedImage
      link.download = 'generated-image.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Image Generation</h1>
          <p className="text-gray-400">Create stunning images from text descriptions</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <span className="text-orange-400 text-sm font-semibold">50 credits left</span>
        </div>
      </div>

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
              placeholder="A futuristic cityscape with neon lights and flying cars..."
              className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            
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
            <h3 className="text-white text-lg font-bold mb-4">Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Image Size</label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="512x512">512x512</option>
                  <option value="1024x1024">1024x1024</option>
                  <option value="1024x768">1024x768</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Style</label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="realistic">Realistic</option>
                  <option value="artistic">Artistic</option>
                  <option value="cartoon">Cartoon</option>
                  <option value="abstract">Abstract</option>
                </select>
              </div>
            </div>
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
                  <p className="text-gray-400">Creating your masterpiece...</p>
                </div>
              </div>
            ) : generatedImage ? (
              <div className="space-y-4">
                <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                  <img 
                    src={generatedImage} 
                    alt="Generated" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownload}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>Download Image</span>
                </motion.button>
              </div>
            ) : (
              <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <PhotoIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Your generated image will appear here</p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Generations */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white text-lg font-bold mb-4">Recent Generations</h3>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center">
                  <PhotoIcon className="w-8 h-8 text-gray-600" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageGenerationPage 