import { useState } from 'react'
import { motion } from 'framer-motion'
import Header from './Header'
import Dashboard from './Dashboard'
import ImageGenerationPage from './ImageGenerationPage'
import VideoGenerationPage from './VideoGenerationPage'
import ContentWritingPage from './ContentWritingPage'
import VoiceSynthesisPage from './VoiceSynthesisPage'
import HistoryPanel from './HistoryPanel'
import LoginModal from './LoginModal'
import ChatBot from './ChatBot'
import { useAuth } from '../context/AuthContext'

const MultiModalAI = () => {
  const [darkMode, setDarkMode] = useState(true)
  const [activeModule, setActiveModule] = useState('image')
  const [activeTab, setActiveTab] = useState('chat')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [history, setHistory] = useState([])
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  
  const { isAuthenticated } = useAuth()

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const handleFeatureClick = (moduleKey, tabName = 'generate') => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true)
      return
    }
    setActiveModule(moduleKey)
    setActiveTab(tabName)
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

      <div className="flex relative">
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Mobile Responsive with Overlay */}
        <aside className={`
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0
          ${isMenuCollapsed ? 'md:w-16' : 'md:w-64'} 
          fixed md:relative
          w-64 min-h-screen bg-black border-r border-gray-800 
          transition-all duration-300 z-50
        `}>
          <div className="py-6">
            {/* Menu Toggle Button */}
            <div className="px-4 mb-6 flex justify-between items-center">
              {/* Desktop Collapse Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuCollapsed(!isMenuCollapsed)}
                className="hidden md:flex w-full items-center justify-center p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuCollapsed ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
                {!isMenuCollapsed && <span className="ml-2 font-medium text-sm">Collapse Menu</span>}
              </motion.button>

              {/* Mobile Close Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 ml-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* Navigation Menu */}
            <nav className="px-4 space-y-1">
              {/* Chat */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setActiveTab('chat')}
                className={`w-full flex items-center ${isMenuCollapsed && !isMobileMenuOpen ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === 'chat'
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                }`}
                title={isMenuCollapsed ? 'AI Chat' : ''}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                {(!isMenuCollapsed || isMobileMenuOpen) && <span className="font-medium text-sm tracking-wide">AI Chat</span>}
              </motion.button>

              {/* AI Tools Section */}
              <div className="pt-8">
                {(!isMenuCollapsed || isMobileMenuOpen) && (
                  <div className="text-xs font-bold uppercase tracking-widest mb-4 text-gray-500 px-4">
                    AI Tools
                  </div>
                )}
                
                {Object.entries(modules).map(([key, module]) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleFeatureClick(key)}
                    className={`w-full flex items-center ${isMenuCollapsed && !isMobileMenuOpen ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeModule === key && activeTab === 'generate'
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                    }`}
                    title={isMenuCollapsed ? module.name : ''}
                  >
                    {isMenuCollapsed ? (
                      <div className="relative">
                        <span className="text-sm sm:text-lg">{module.icon}</span>
                        {!isAuthenticated && (
                          <div className="absolute -top-1 -right-1">
                            <svg className="w-2 h-2 sm:w-3 sm:h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{module.icon}</span>
                          <span className="font-medium text-sm tracking-wide">{module.name}</span>
                        </div>
                        {!isAuthenticated && (
                          <div className="flex items-center space-x-1">
                            <svg className="w-2 h-2 sm:w-3 sm:h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Upcoming Features - Only show when expanded */}
              {(!isMenuCollapsed || isMobileMenuOpen) && (
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
              )}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-black min-h-screen">
          {/* Mobile Menu Button */}
          <div className="md:hidden p-4 border-b border-gray-800">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>
          </div>

          <div className="p-4 md:p-6 lg:p-8">
            
            {/* Tab Content */}
            {activeTab === 'chat' && (
              <GuestDashboard />
            )}
            
            {activeTab === 'overview' && (
              isAuthenticated ? (
                <Dashboard darkMode={darkMode} history={history} />
              ) : (
                <GuestDashboard />
              )
            )}
            
            {activeTab === 'generate' && activeModule === 'image' && isAuthenticated && (
              <ImageGenerationPage />
            )}
            
            {activeTab === 'generate' && activeModule === 'video' && isAuthenticated && (
              <VideoGenerationPage />
            )}
            
            {activeTab === 'generate' && activeModule === 'content' && isAuthenticated && (
              <ContentWritingPage />
            )}
            
            {activeTab === 'generate' && activeModule === 'voice' && isAuthenticated && (
              <VoiceSynthesisPage />
            )}
            
            {activeTab === 'profile' && (
              isAuthenticated ? (
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold text-white mb-4">Profile</h2>
                  <p className="text-gray-400">Profile management coming soon</p>
                </div>
              ) : (
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold text-white mb-4">Profile</h2>
                  <p className="text-gray-400 mb-6">Sign in to access your profile</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsLoginModalOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    Sign In
                  </motion.button>
                </div>
              )
            )}
            
            {activeTab === 'history' && (
              isAuthenticated ? (
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold text-white mb-4">History</h2>
                  <p className="text-gray-400">Generation history coming soon</p>
                </div>
              ) : (
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold text-white mb-4">History</h2>
                  <p className="text-gray-400 mb-6">Sign in to view your generation history</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsLoginModalOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    Sign In
                  </motion.button>
                </div>
              )
            )}
          </div>
        </main>
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </div>
  )
}

// Guest Dashboard Component
const GuestDashboard = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  return (
    <>
      <div className="space-y-6">
        {/* Main Chat Interface - Perplexity.ai style */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden" style={{ height: '600px' }}>
          <div className="h-full">
            <ChatBot />
          </div>
        </div>

        {/* Premium Features Preview */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Unlock Premium AI Tools</h3>
            <p className="text-gray-300">Sign in to access advanced features and unlimited usage</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                icon: '🎨',
                title: 'Image Generation',
                description: 'Create stunning visuals',
                color: 'from-blue-500 to-purple-500'
              },
              {
                icon: '🎬',
                title: 'Video Creation',
                description: 'Generate dynamic videos',
                color: 'from-green-500 to-teal-500'
              },
              {
                icon: '✍️',
                title: 'Content Writing',
                description: 'Professional copywriting',
                color: 'from-yellow-500 to-orange-500'
              },
              {
                icon: '🎤',
                title: 'Voice Synthesis',
                description: 'Natural speech generation',
                color: 'from-pink-500 to-red-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 sm:p-4 text-center cursor-pointer"
                onClick={() => setIsLoginModalOpen(true)}
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center text-lg sm:text-xl mb-2 sm:mb-3 mx-auto`}>
                  {feature.icon}
                </div>
                <h4 className="text-white font-semibold text-xs sm:text-sm mb-1">{feature.title}</h4>
                <p className="text-gray-400 text-xs mb-2 sm:mb-3 hidden sm:block">{feature.description}</p>
                <div className="flex items-center justify-center space-x-1 text-orange-400">
                  <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium">Premium</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsLoginModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
            >
              Sign In to Unlock All Features
            </motion.button>
          </div>
        </div>
      </div>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  )
}

export default MultiModalAI
