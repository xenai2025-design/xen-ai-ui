import { useState } from 'react'
import { motion } from 'framer-motion'
import { VideoCameraIcon, SparklesIcon, ArrowDownTrayIcon, PlayIcon } from '@heroicons/react/24/outline'

const VideoGenerationPage = () => {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVideo, setGeneratedVideo] = useState(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    
    // Simulate API call
    setTimeout(() => {
      setGeneratedVideo('https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4')
      setIsGenerating(false)
    }, 5000) // Longer generation time for videos
  }

  const handleDownload = () => {
    if (generatedVideo) {
      const link = document.createElement('a')
      link.href = generatedVideo
      link.download = 'generated-video.mp4'
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
          <h1 className="text-2xl font-bold text-white mb-2">Video Generation</h1>
          <p className="text-gray-400">Create stunning videos from text descriptions</p>
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
            <h3 className="text-white text-lg font-bold mb-4">Describe your video</h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A cinematic scene of a spaceship traveling through a colorful nebula..."
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
                    <VideoCameraIcon className="w-4 h-4" />
                    <span>Generate Video</span>
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
                <label className="block text-gray-400 text-sm font-medium mb-2">Video Duration</label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="5">5 seconds</option>
                  <option value="10">10 seconds</option>
                  <option value="15">15 seconds</option>
                  <option value="30">30 seconds</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Resolution</label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                  <option value="4k">4K</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Style</label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="cinematic">Cinematic</option>
                  <option value="realistic">Realistic</option>
                  <option value="artistic">Artistic</option>
                  <option value="animated">Animated</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          {/* Generated Video */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white text-lg font-bold mb-4">Generated Video</h3>
            
            {isGenerating ? (
              <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <SparklesIcon className="w-12 h-12 text-orange-500 animate-pulse mx-auto mb-4" />
                  <p className="text-gray-400">Creating your cinematic masterpiece...</p>
                  <p className="text-gray-500 text-sm mt-2">This may take a few minutes</p>
                </div>
              </div>
            ) : generatedVideo ? (
              <div className="space-y-4">
                <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden relative">
                  <video 
                    src={generatedVideo} 
                    controls
                    className="w-full h-full object-cover"
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="bg-black bg-opacity-50 rounded-full p-3">
                      <PlayIcon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownload}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>Download Video</span>
                </motion.button>
              </div>
            ) : (
              <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <VideoCameraIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Your generated video will appear here</p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Generations */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white text-lg font-bold mb-4">Recent Generations</h3>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                  <VideoCameraIcon className="w-8 h-8 text-gray-600" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoGenerationPage 