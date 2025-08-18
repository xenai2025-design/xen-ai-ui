import { useState } from 'react'
import { motion } from 'framer-motion'
import { buildApiUrl } from '../config/api.js'
import { DocumentTextIcon, SparklesIcon, ArrowDownTrayIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'

const ContentWritingPage = () => {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [contentType, setContentType] = useState('article')
  const [tone, setTone] = useState('professional')
  const [contentLength, setContentLength] = useState('medium') // Renamed to avoid conflict with JS length

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    
    try {
      const response = await fetch(buildApiUrl('/api/content/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, contentType, tone, length: contentLength })
      })
      
      if (!response.ok) throw new Error('Failed to generate content')
      
      const data = await response.json()
      if (data.success) {
        setGeneratedContent(data.data.content)
      }
    } catch (error) {
      console.error('Content generation error:', error)
      // Handle error (e.g., show toast)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (generatedContent) {
      const blob = new Blob([generatedContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `generated-content-${contentType}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  const handleCopy = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent)
      // You could add a toast notification here
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Content Writing</h1>
          <p className="text-gray-400">Generate high-quality written content from text prompts</p>
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
            <h3 className="text-white text-lg font-bold mb-4">Describe your content</h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Write a blog post about the benefits of artificial intelligence in modern business..."
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
                    <DocumentTextIcon className="w-4 h-4" />
                    <span>Generate Content</span>
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
                <label className="block text-gray-400 text-sm font-medium mb-2">Content Type</label>
                <select 
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="article">Article</option>
                  <option value="blog">Blog Post</option>
                  <option value="email">Email</option>
                  <option value="social">Social Media Post</option>
                  <option value="product">Product Description</option>
                  <option value="story">Story</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Tone</label>
                <select 
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="friendly">Friendly</option>
                  <option value="formal">Formal</option>
                  <option value="creative">Creative</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Length</label>
                <select 
                  value={contentLength}
                  onChange={(e) => setContentLength(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="short">Short (100-200 words)</option>
                  <option value="medium">Medium (300-500 words)</option>
                  <option value="long">Long (600-1000 words)</option>
                  <option value="extended">Extended (1000+ words)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          {/* Generated Content */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white text-lg font-bold mb-4">Generated Content</h3>
            
            {isGenerating ? (
              <div className="h-96 bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <SparklesIcon className="w-12 h-12 text-orange-500 animate-pulse mx-auto mb-4" />
                  <p className="text-gray-400">Crafting your content...</p>
                </div>
              </div>
            ) : generatedContent ? (
              <div className="space-y-4">
                <div className="h-96 bg-gray-800 rounded-lg p-4 overflow-y-auto">
                  <pre className="text-white text-sm whitespace-pre-wrap font-sans">
                    {generatedContent}
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
                    <span>Copy to Clipboard</span>
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
                  <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Your generated content will appear here</p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Generations */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white text-lg font-bold mb-4">Recent Generations</h3>
            <div className="space-y-3">
              {[
                { title: 'AI in Business', type: 'Article', date: '2 hours ago' },
                { title: 'Marketing Tips', type: 'Blog', date: '1 day ago' },
                { title: 'Product Launch', type: 'Email', date: '2 days ago' },
                { title: 'Social Campaign', type: 'Social', date: '3 days ago' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-white text-sm font-medium">{item.title}</p>
                      <p className="text-gray-400 text-xs">{item.type} • {item.date}</p>
                    </div>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContentWritingPage 