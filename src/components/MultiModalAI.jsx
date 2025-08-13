import { useState } from 'react'
import { motion } from 'framer-motion'
import Header from './Header'
import Dashboard from './Dashboard'
import ImageGenerationPage from './ImageGenerationPage'
import VideoGenerationPage from './VideoGenerationPage'
import ContentWritingPage from './ContentWritingPage'
import VoiceSynthesisPage from './VoiceSynthesisPage'
import HistoryPanel from './HistoryPanel'

const MultiModalAI = () => {
  const [darkMode, setDarkMode] = useState(true)
  const [activeModule, setActiveModule] = useState('image')
  const [activeTab, setActiveTab] = useState('overview')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [history, setHistory] = useState([])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const modules = {
    image: {
      name: 'Image Generation',
      icon: '🎨',
      description: 'Create stunning images from text descriptions'
    },
    video: {
      name: 'Video Creation',
      icon: '🎬',
      description: 'Generate videos from prompts and scripts'
    },
    content: {
      name: 'Content Writing',
      icon: '✍️',
      description: 'Write articles, blogs, and marketing copy'
    },
    voice: {
      name: 'Voice Synthesis',
      icon: '🎤',
      description: 'Convert text to natural-sounding speech'
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <div className="flex">
        {/* Sidebar - Qolaba style */}
        <aside className="w-64 min-h-screen bg-black border-r border-gray-800">
          <div className="py-6">
            {/* Navigation Menu */}
            <nav className="px-4 space-y-1">
              {/* Dashboard */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === 'overview'
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                <span className="font-medium text-sm tracking-wide">Dashboard</span>
              </motion.button>

              {/* Community wall */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 text-gray-400 hover:bg-gray-900 hover:text-white"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-sm tracking-wide">Community wall</span>
              </motion.button>

              {/* AI Tools Section */}
              <div className="pt-8">
                <div className="text-xs font-bold uppercase tracking-widest mb-4 text-gray-500 px-4">
                  AI Tools
                </div>
                
                {Object.entries(modules).map(([key, module]) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      setActiveModule(key)
                      setActiveTab('generate')
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeModule === key && activeTab === 'generate'
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{module.icon}</span>
                    <span className="font-medium text-sm tracking-wide">{module.name}</span>
                  </motion.button>
                ))}
              </div>

              {/* Upcoming Features */}
              <div className="pt-8 pb-8">
                <div className="text-xs font-bold uppercase tracking-widest mb-4 text-gray-500 px-4">
                  Upcoming Features
                </div>
                {[
                  { icon: '🎵', name: 'Music Creation' },
                  { icon: '📊', name: 'Stock Footage' },
                  { icon: '📰', name: 'AI News letter' }
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-500"
                  >
                    <span className="text-lg opacity-50">{feature.icon}</span>
                    <span className="font-medium text-sm">{feature.name}</span>
                  </div>
                ))}
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-black min-h-screen">
          <div className="p-8">
            
            {/* Top Navigation Tabs - Qolaba style */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex space-x-1 bg-gray-900 p-1 rounded-lg">
                  {[
                    { id: 'overview', name: 'Overview' },
                    { id: 'profile', name: 'Profile' },
                    { id: 'history', name: 'History' }
                  ].map((tab) => (
                    <motion.button
                      key={tab.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2.5 rounded-md font-semibold text-sm tracking-wide transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <span>{tab.name}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Create Organisation Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm tracking-wide transition-colors flex items-center space-x-2"
                >
                  <span className="text-lg font-bold">+</span>
                  <span>Create Organisation</span>
                </motion.button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <Dashboard darkMode={darkMode} history={history} />
            )}
            
            {activeTab === 'generate' && activeModule === 'image' && (
              <ImageGenerationPage />
            )}
            
            {activeTab === 'generate' && activeModule === 'video' && (
              <VideoGenerationPage />
            )}
            
            {activeTab === 'generate' && activeModule === 'content' && (
              <ContentWritingPage />
            )}
            
            {activeTab === 'generate' && activeModule === 'voice' && (
              <VoiceSynthesisPage />
            )}
            
            {activeTab === 'profile' && (
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-white mb-4">Profile</h2>
                <p className="text-gray-400">Profile management coming soon</p>
              </div>
            )}
            
            {activeTab === 'history' && (
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-white mb-4">History</h2>
                <p className="text-gray-400">Generation history coming soon</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default MultiModalAI
