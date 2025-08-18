import { useState } from 'react'
import { motion } from 'framer-motion'
import { buildApiUrl } from '../config/api.js'
import { BookOpenIcon, SparklesIcon, ArrowDownTrayIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'

const StoryGeneratorPage = () => {
  const [prompt, setPrompt] = useState('')
  const [genre, setGenre] = useState('fantasy')
  const [length, setLength] = useState('short')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedStory, setGeneratedStory] = useState('')

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    
    try {
      const response = await fetch(buildApiUrl('/api/story/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, genre, length })
      })
      
      if (!response.ok) throw new Error('Failed to generate story')
      
      const data = await response.json()
      if (data.success) {
        setGeneratedStory(data.data.content)
      }
    } catch (error) {
      console.error('Story generation error:', error)
      // Handle error (e.g., show toast)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (generatedStory) {
      const blob = new Blob([generatedStory], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `generated-story.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  const handleCopy = () => {
    if (generatedStory) {
      navigator.clipboard.writeText(generatedStory)
      // Add toast notification
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Story Generator</h1>
          <p className="text-gray-400">Create stories, poems, or scripts from prompts</p>
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
            <h3 className="text-white text-lg font-bold mb-4">Describe your story</h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A young wizard discovers a hidden power..."
              className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Genre</label>
                <select 
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="fantasy">Fantasy</option>
                  <option value="scifi">Sci-Fi</option>
                  <option value="mystery">Mystery</option>
                  <option value="romance">Romance</option>
                  <option value="horror">Horror</option>
                  <option value="poetry">Poetry</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Length</label>
                <select 
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className={`w-full px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
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
                    <BookOpenIcon className="w-4 h-4" />
                    <span>Generate Story</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          {/* Generated Story */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white text-lg font-bold mb-4">Generated Story</h3>
            
            {isGenerating ? (
              <div className="h-96 bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <SparklesIcon className="w-12 h-12 text-orange-500 animate-pulse mx-auto mb-4" />
                  <p className="text-gray-400">Crafting your story...</p>
                </div>
              </div>
            ) : generatedStory ? (
              <div className="space-y-4">
                <div className="h-96 bg-gray-800 rounded-lg p-4 overflow-y-auto">
                  <pre className="text-white text-sm whitespace-pre-wrap font-sans">
                    {generatedStory}
                  </pre>
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopy}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center space-x-2"
                  >
                    <ClipboardDocumentIcon className="w-4 h-4" />
                    <span>Copy</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center space-x-2"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>Download</span>
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="h-96 bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <BookOpenIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Your generated story will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoryGeneratorPage
