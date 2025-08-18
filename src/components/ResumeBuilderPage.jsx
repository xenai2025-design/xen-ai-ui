import { useState } from 'react'
import { motion } from 'framer-motion'
import { buildApiUrl } from '../config/api.js'
import { DocumentTextIcon, SparklesIcon, ArrowDownTrayIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'

const ResumeBuilderPage = () => {
  const [userInput, setUserInput] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [format, setFormat] = useState('resume')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResume, setGeneratedResume] = useState('')

  const handleGenerate = async () => {
    if (!userInput.trim()) return
    
    setIsGenerating(true)
    
    try {
      const response = await fetch(buildApiUrl('/api/resume/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput, jobDescription, format })
      })
      
      if (!response.ok) throw new Error('Failed to generate resume')
      
      const data = await response.json()
      if (data.success) {
        setGeneratedResume(data.data.content)
      }
    } catch (error) {
      console.error('Resume generation error:', error)
      // Handle error
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (generatedResume) {
      const blob = new Blob([generatedResume], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `generated-${format}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  const handleCopy = () => {
    if (generatedResume) {
      navigator.clipboard.writeText(generatedResume)
      // Add toast
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Resume Builder</h1>
          <p className="text-gray-400">Generate professional resumes or cover letters</p>
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
          {/* User Input */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white text-lg font-bold mb-4">Your experience and skills</h3>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="5 years as software developer, skilled in JavaScript, React..."
              className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Job Description */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white text-lg font-bold mb-4">Job description (optional)</h3>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Seeking a full-stack developer with experience in..."
              className="w-full h-24 bg-gray-800 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Settings */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white text-lg font-bold mb-4">Format</h3>
            <select 
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="resume">Resume</option>
              <option value="coverletter">Cover Letter</option>
            </select>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={!userInput.trim() || isGenerating}
              className={`w-full mt-4 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                !userInput.trim() || isGenerating
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
                  <span>Generate {format === 'resume' ? 'Resume' : 'Cover Letter'}</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          {/* Generated Resume */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white text-lg font-bold mb-4">Generated {format === 'resume' ? 'Resume' : 'Cover Letter'}</h3>
            
            {isGenerating ? (
              <div className="h-96 bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <SparklesIcon className="w-12 h-12 text-orange-500 animate-pulse mx-auto mb-4" />
                  <p className="text-gray-400">Building your {format}...</p>
                </div>
              </div>
            ) : generatedResume ? (
              <div className="space-y-4">
                <div className="h-96 bg-gray-800 rounded-lg p-4 overflow-y-auto">
                  <pre className="text-white text-sm whitespace-pre-wrap font-sans">
                    {generatedResume}
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
                  <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Your generated {format} will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResumeBuilderPage
