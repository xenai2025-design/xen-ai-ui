import { motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'

const HistoryPanel = ({ isOpen, onClose, history, darkMode }) => {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`fixed right-0 top-0 h-full w-80 border-l shadow-xl z-50 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-lg font-bold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Generation History
          </h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              darkMode 
                ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <XMarkIcon className="h-5 w-5" />
          </motion.button>
        </div>

        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {item.type} Generation
                </div>
                <div className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {new Date(item.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-8 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <p>No history yet</p>
            <p className="text-sm">Start creating to see your history</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default HistoryPanel
