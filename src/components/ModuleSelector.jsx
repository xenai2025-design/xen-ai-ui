import { motion } from 'framer-motion'

const ModuleSelector = ({ modules, activeModule, setActiveModule, darkMode }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Select AI Tool</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(modules).map(([key, module]) => (
          <motion.div
            key={key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveModule(key)}
            className={`p-6 rounded-xl border cursor-pointer transition-all duration-200 ${
              activeModule === key
                ? 'bg-orange-500 border-orange-400 text-white'
                : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
            }`}
          >
            <div className="text-3xl mb-4">{module.icon}</div>
            <h3 className="text-lg font-bold mb-2">{module.name}</h3>
            <p className="text-sm opacity-80">{module.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default ModuleSelector
