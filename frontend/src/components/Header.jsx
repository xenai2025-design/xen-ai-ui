import { motion } from 'framer-motion'
import { 
  SunIcon, 
  MoonIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import LoginModal from './LoginModal'

const Header = ({ darkMode, toggleDarkMode }) => {
  const { user, logout, isAuthenticated } = useAuth()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const handleLogout = () => {
    logout()
  }

  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    } else if (user?.username) {
      return user.username[0].toUpperCase()
    }
    return 'U'
  }
  return (
    <>
      <header className="bg-black border-b border-gray-800 h-14 sm:h-16">
        <div className="px-3 sm:px-4 md:px-6 h-full">
          <div className="flex items-center justify-between h-full">
            
            {/* Logo and Title */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Qolaba-style logo */}
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="relative">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg transform rotate-45"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-sm transform -rotate-45"></div>
                    </div>
                  </div>
                  <span className="text-white text-lg sm:text-xl font-bold tracking-tight">
                    Xen AI
                  </span>
                </div>
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
              
              {/* Credits Display - Only for authenticated users */}
              {isAuthenticated && (
                <div className="hidden sm:flex items-center space-x-2 bg-gray-900 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-700">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-orange-400 text-xs font-semibold tracking-wide">50 left</span>
                </div>
              )}

              {/* Search Icon - Hidden on mobile */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:block p-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </motion.button>

              {/* Theme Toggle - Hidden on mobile */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDarkMode}
                className="hidden sm:block p-2 text-gray-400 hover:text-white transition-colors"
              >
                {darkMode ? (
                  <SunIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <MoonIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </motion.button>

              {/* Conditional User Section */}
              {isAuthenticated ? (
                /* Authenticated User Profile */
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                      {getUserInitials()}
                    </div>
                    <div className="hidden md:block">
                      <p className="text-white text-sm font-medium">
                        {user?.first_name && user?.last_name 
                          ? `${user.first_name} ${user.last_name}`
                          : user?.username || 'User'
                        }
                      </p>
                      <p className="text-gray-400 text-xs">{user?.email}</p>
                    </div>
                  </motion.div>

                  {/* Logout Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="p-1.5 sm:p-2 text-gray-400 hover:text-red-400 transition-colors"
                    title="Logout"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </motion.button>
                </div>
              ) : (
                /* Guest User Login Button */
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsLoginModalOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm tracking-wide transition-colors flex items-center space-x-1 sm:space-x-2"
                >
                  <span>Login</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  )
}

export default Header
