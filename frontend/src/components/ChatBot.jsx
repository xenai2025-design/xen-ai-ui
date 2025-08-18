import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PaperAirplaneIcon, 
  SparklesIcon, 
  MicrophoneIcon, 
  SpeakerWaveIcon, 
  ClipboardDocumentIcon, 
  CheckIcon,
  MagnifyingGlassIcon,
  NewspaperIcon,
  UserGroupIcon,
  PaperClipIcon,
  ChevronDownIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://fxqm8v270a.execute-api.us-east-1.amazonaws.com/dev/api';

// Code Block Component with Copy functionality
const CodeBlock = ({ code, language = 'text' }) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  return (
    <div className="relative bg-gray-900 border border-gray-700 rounded-lg my-2">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <span className="text-xs text-gray-400 font-medium">{language}</span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={copyToClipboard}
          className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded transition-colors"
        >
          {copied ? (
            <>
              <CheckIcon className="w-3 h-3" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <ClipboardDocumentIcon className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </motion.button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-gray-100 font-mono">{code}</code>
      </pre>
    </div>
  )
}

// Function to parse message content and render code blocks
const parseMessageContent = (content) => {
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g
  const inlineCodeRegex = /`([^`]+)`/g
  
  let lastIndex = 0
  const elements = []
  let match

  // Handle code blocks
  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const textBefore = content.slice(lastIndex, match.index)
      if (textBefore.trim()) {
        elements.push(
          <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
            {renderTextWithInlineCode(textBefore)}
          </span>
        )
      }
    }

    // Add code block
    const language = match[1] || 'text'
    const code = match[2].trim()
    elements.push(
      <CodeBlock key={`code-${match.index}`} code={code} language={language} />
    )

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < content.length) {
    const remainingText = content.slice(lastIndex)
    elements.push(
      <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
        {renderTextWithInlineCode(remainingText)}
      </span>
    )
  }

  return elements.length > 0 ? elements : [<span key="content" className="whitespace-pre-wrap">{content}</span>]
}

// Function to render text with inline code
const renderTextWithInlineCode = (text) => {
  const inlineCodeRegex = /`([^`]+)`/g
  const parts = []
  let lastIndex = 0
  let match

  while ((match = inlineCodeRegex.exec(text)) !== null) {
    // Add text before inline code
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    // Add inline code
    parts.push(
      <code key={`inline-${match.index}`} className="bg-gray-700 px-1 py-0.5 rounded text-sm font-mono">
        {match[1]}
      </code>
    )

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

// Copy Message Button Component
const CopyMessageButton = ({ content }) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy message:', err)
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={copyToClipboard}
      className="text-gray-400 hover:text-orange-400 transition-colors p-1"
      title="Copy message"
    >
      {copied ? (
        <CheckIcon className="w-3 h-3" />
      ) : (
        <ClipboardDocumentIcon className="w-3 h-3" />
      )}
    </motion.button>
  )
}

const ChatBot = () => {
  const { isAuthenticated, user } = useAuth()
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [selectedModel, setSelectedModel] = useState('GPT-4')
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)
  const speechSynthesisRef = useRef(null)

  // Available AI models
  const availableModels = [
    { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
    { id: 'claude-3', name: 'Claude 3', description: 'Anthropic\'s latest' },
    { id: 'gemini-pro', name: 'Gemini Pro', description: 'Google\'s advanced model' }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Close model dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showModelDropdown && !event.target.closest('.model-dropdown')) {
        setShowModelDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showModelDropdown])

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInputValue(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      
      speechSynthesisRef.current = utterance
      window.speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    // Show chat interface after first message
    setShowChat(true)

    // Set current chat ID if not already set (for new chats)
    if (!currentChatId) {
      setCurrentChatId(Date.now().toString())
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage.content
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to get AI response')
      }

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: data.data.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error calling chat API:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleActionClick = (action) => {
    setInputValue(`${action}: `)
    textareaRef.current?.focus()
  }

  const formatTime = (timestamp) => {
    // Ensure timestamp is a Date object
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Load chat history for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      loadChatHistory()
    }
  }, [isAuthenticated, user])

  // Save chat to history when messages change (for authenticated users)
  useEffect(() => {
    if (isAuthenticated && messages.length > 0 && currentChatId) {
      saveChatToHistory()
    }
  }, [messages, isAuthenticated, currentChatId])

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setChatHistory(data.data || [])
        }
      } else {
        // Fallback to localStorage if API fails
        const savedHistory = localStorage.getItem(`chatHistory_${user.id}`)
        if (savedHistory) {
          setChatHistory(JSON.parse(savedHistory))
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
      // Fallback to localStorage if API fails
      try {
        const savedHistory = localStorage.getItem(`chatHistory_${user.id}`)
        if (savedHistory) {
          setChatHistory(JSON.parse(savedHistory))
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError)
      }
    }
  }

  const saveChatToHistory = async () => {
    if (!isAuthenticated || messages.length === 0) return

    const chatData = {
      id: currentChatId,
      title: messages[0]?.content?.substring(0, 50) + '...' || 'New Chat',
      messages: messages,
      model: selectedModel,
      timestamp: new Date(),
      userId: user.id
    }

    try {
      const response = await fetch(`${API_BASE_URL}/chat/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(chatData)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Update local state with the saved chat
          const updatedHistory = chatHistory.filter(chat => chat.id !== currentChatId)
          updatedHistory.unshift(chatData)
          setChatHistory(updatedHistory.slice(0, 50)) // Keep only last 50 chats
        }
      } else {
        // Fallback to localStorage if API fails
        const updatedHistory = chatHistory.filter(chat => chat.id !== currentChatId)
        updatedHistory.unshift(chatData)
        const limitedHistory = updatedHistory.slice(0, 50)
        setChatHistory(limitedHistory)
        localStorage.setItem(`chatHistory_${user.id}`, JSON.stringify(limitedHistory))
      }
    } catch (error) {
      console.error('Error saving chat history:', error)
      // Fallback to localStorage if API fails
      const updatedHistory = chatHistory.filter(chat => chat.id !== currentChatId)
      updatedHistory.unshift(chatData)
      const limitedHistory = updatedHistory.slice(0, 50)
      setChatHistory(limitedHistory)
      localStorage.setItem(`chatHistory_${user.id}`, JSON.stringify(limitedHistory))
    }
  }

  const startNewChat = () => {
    setMessages([])
    setShowChat(false)
    setCurrentChatId(Date.now().toString())
    setInputValue('')
  }

  const loadChatFromHistory = (chat) => {
    setMessages(chat.messages)
    setSelectedModel(chat.model)
    setCurrentChatId(chat.id)
    setShowChat(true)
  }

  const handleModelSelect = (model) => {
    setSelectedModel(model.name)
    setShowModelDropdown(false)
  }

  // Grok-style interface when no chat history
  if (!showChat) {
    return (
      <div className="flex flex-col h-full bg-black">
        {/* Header with New Chat and Model Selection for authenticated users */}
        {isAuthenticated && (
          <div className="border-b border-gray-800 p-4">
            <div className="flex items-center justify-between">
              {/* New Chat Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startNewChat}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
              >
                <PlusIcon className="w-4 h-4" />
                <span className="text-sm font-medium">New Chat</span>
              </motion.button>

              {/* Model Selection Dropdown */}
              <div className="relative model-dropdown">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
                >
                  <SparklesIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{selectedModel}</span>
                  <ChevronDownIcon className="w-3 h-3" />
                </motion.button>

                {/* Model Dropdown */}
                <AnimatePresence>
                  {showModelDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50"
                    >
                      <div className="p-2">
                        {availableModels.map((model) => (
                          <motion.button
                            key={model.id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleModelSelect(model)}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                              selectedModel === model.name
                                ? 'bg-orange-500 text-white'
                                : 'hover:bg-gray-700 text-gray-300'
                            }`}
                          >
                            <div className="font-medium text-sm">{model.name}</div>
                            <div className="text-xs text-gray-400 mt-1">{model.description}</div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Layout - ChatGPT Style */}
        <div className="flex-1 flex">
          {/* Left Sidebar - Recent Chats (ChatGPT Style) */}
          {isAuthenticated && chatHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="w-64 border-r border-gray-800 p-3 overflow-y-auto"
            >
              <h2 className="text-sm font-semibold text-white mb-3 px-2">Recent Chats</h2>
              <div className="space-y-1">
                {chatHistory.slice(0, 20).map((chat) => (
                  <motion.button
                    key={chat.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => loadChatFromHistory(chat)}
                    className="w-full text-left p-2 bg-gray-900 hover:bg-gray-800 rounded-md transition-colors group flex items-center space-x-2"
                  >
                    <ChatBubbleLeftRightIcon className="w-3 h-3 text-orange-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-white font-medium truncate group-hover:text-orange-400 transition-colors">
                        {chat.title.replace('...', '')}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Center Content Area */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
            {/* Welcome Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
                How can I help you today?
              </h1>
              <p className="text-gray-400 text-lg">
                Ask me anything, and I'll do my best to assist you.
              </p>
            </motion.div>

            {/* Main Input Area */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-4xl"
            >
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What do you want to know?"
                  disabled={isLoading}
                  className="w-full bg-gray-900 border border-gray-700 rounded-2xl px-6 py-4 pl-14 pr-24 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-lg min-h-[64px] max-h-40"
                  rows={1}
                  style={{
                    height: 'auto',
                    minHeight: '64px'
                  }}
                  onInput={(e) => {
                    e.target.style.height = 'auto'
                    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
                  }}
                />
                
                {/* Attachment Button */}
                <button
                  type="button"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors"
                  title="Attach file"
                >
                  <PaperClipIcon className="w-5 h-5" />
                </button>
                
                {/* Voice Input Button - Fixed position */}
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  disabled={isLoading}
                  className={`absolute right-16 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  <MicrophoneIcon className="w-5 h-5" />
                </button>
                
                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <PaperAirplaneIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              </form>
            </motion.div>

            {/* Action Buttons - Removed Create Images */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-4 mt-8"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleActionClick('Search')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                <span className="text-sm font-medium">DeepSearch</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleActionClick('Latest news about')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
              >
                <NewspaperIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Latest News</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleActionClick('Act as')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
              >
                <UserGroupIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Personas</span>
                <ChevronDownIcon className="w-3 h-3" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  // Chat interface (existing functionality)
  return (
    <div className="flex flex-col h-full bg-black">
      {/* Chat Header - Only show for authenticated users */}
      {isAuthenticated && (
        <div className="border-b border-gray-800 p-4">
          <div className="flex items-center justify-between">
            {/* New Chat Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startNewChat}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
            >
              <PlusIcon className="w-4 h-4" />
              <span className="text-sm font-medium">New Chat</span>
            </motion.button>

            {/* Model Selection Dropdown */}
            <div className="relative model-dropdown">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
              >
                <SparklesIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{selectedModel}</span>
                <ChevronDownIcon className="w-3 h-3" />
              </motion.button>

              {/* Model Dropdown */}
              <AnimatePresence>
                {showModelDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50"
                  >
                    <div className="p-2">
                      {availableModels.map((model) => (
                        <motion.button
                          key={model.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleModelSelect(model)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedModel === model.name
                              ? 'bg-orange-500 text-white'
                              : 'hover:bg-gray-700 text-gray-300'
                          }`}
                        >
                          <div className="font-medium text-sm">{model.name}</div>
                          <div className="text-xs text-gray-400 mt-1">{model.description}</div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-3xl ${message.type === 'user' ? 'ml-12' : 'mr-12'}`}>
                <div className="flex items-start space-x-3">
                  {message.type === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <SparklesIcon className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.type === 'user' 
                        ? 'bg-orange-500 text-white ml-auto' 
                        : 'bg-gray-800 text-white border border-gray-700'
                    }`}>
                      <div className="text-sm leading-relaxed">
                        {message.type === 'assistant' ? parseMessageContent(message.content) : (
                          <span className="whitespace-pre-wrap">{message.content}</span>
                        )}
                      </div>
                    </div>
                    <div className={`flex items-center justify-between mt-1 ${
                      message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}>
                      <div className={`text-xs text-gray-500 ${
                        message.type === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        {formatTime(message.timestamp)}
                      </div>
                      {message.type === 'assistant' && (
                        <div className="flex items-center space-x-1">
                          <CopyMessageButton content={message.content} />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => speakText(message.content)}
                            disabled={isSpeaking}
                            className="text-gray-400 hover:text-orange-400 transition-colors p-1"
                            title="Speak message"
                          >
                            <SpeakerWaveIcon className="w-3 h-3" />
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>

                  {message.type === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">U</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="max-w-3xl mr-12">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800 p-6">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 pr-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none min-h-[48px] max-h-32"
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '48px'
                }}
                onInput={(e) => {
                  const currentScrollTop = document.documentElement.scrollTop || document.body.scrollTop
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
                  document.documentElement.scrollTop = document.body.scrollTop = currentScrollTop
                }}
              />
              
              {/* Voice Input Button - Fixed position */}
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                disabled={isLoading}
                className={`absolute right-12 bottom-2 p-2 rounded-lg transition-colors ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                <MicrophoneIcon className="w-4 h-4" />
              </button>
              
              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 bottom-2 p-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </div>
            
            {/* Stop Speaking Button */}
            {isSpeaking && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopSpeaking}
                className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                title="Stop speaking"
              >
                <SpeakerWaveIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Stop</span>
              </motion.button>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>Powered by Xen AI</span>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatBot
