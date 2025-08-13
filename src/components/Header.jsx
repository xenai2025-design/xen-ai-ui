import { motion } from 'framer-motion'
import { 
  SunIcon, 
  MoonIcon
} from '@heroicons/react/24/outline'

const Header = ({ darkMode, toggleDarkMode }) => {
  return (
    <header className="bg-black border-b border-gray-800 h-16">
      <div className="px-6 h-full">
        <div className="flex items-center justify-between h-full">
          
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3">
              {/* Qolaba-style logo */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg transform rotate-45"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-sm transform -rotate-45"></div>
                  </div>
                </div>
                <span className="text-white text-xl font-bold tracking-tight">
                  Xen-Ai
                </span>
              </div>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            
            {/* Credits Display - Qolaba style */}
            <div className="flex items-center space-x-2 bg-gray-900 px-3 py-2 rounded-lg border border-gray-700">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-orange-400 text-xs font-semibold tracking-wide">50 left</span>
            </div>

            {/* Search Icon */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              {darkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </motion.button>

            {/* User Profile - Qolaba style */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                M
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
