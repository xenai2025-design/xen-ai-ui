import { motion } from 'framer-motion'
import { 
  SparklesIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

const Dashboard = ({ darkMode, history }) => {
  return (
    <div className="space-y-6">
      {/* Daily Records Card - Qolaba style */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <SparklesIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-white text-xl font-bold tracking-tight">Daily Records</h3>
            <p className="text-gray-400 text-xs font-medium tracking-wide">Daily Credits</p>
          </div>
        </div>

        {/* Stats Grid - Better alignment */}
        <div className="grid grid-cols-3 gap-12">
          <div className="text-center">
            <div className="text-5xl font-black text-white mb-3 tracking-tight">4</div>
            <div className="text-orange-500 text-xs font-bold uppercase tracking-widest flex items-center justify-center">
              <span>Pending Task</span>
              <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black text-white mb-3 tracking-tight">2</div>
            <div className="text-orange-500 text-xs font-bold uppercase tracking-widest">Completed Task</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black text-white mb-3 tracking-tight">20</div>
            <div className="text-orange-500 text-xs font-bold uppercase tracking-widest">Credits Earned</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Free Plan Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white text-lg font-bold tracking-tight">Free Plan</h3>
            <div className="flex items-center space-x-1">
              <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            </div>
          </div>
          <p className="text-gray-400 text-xs font-medium tracking-wide mb-6">Daily Credits</p>
          
          <div className="flex items-center space-x-2 mb-6">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-white text-sm font-semibold tracking-wide">50 credits left</span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded-lg font-semibold text-sm tracking-wide transition-colors"
          >
            Upgrade
          </motion.button>
        </div>

        {/* Credit Utilization */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white text-lg font-bold tracking-tight mb-6">Credit Utilization</h3>
          
          {/* Table Header */}
          <div className="grid grid-cols-3 gap-4 mb-4 pb-2 border-b border-gray-800">
            <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">DATE & TIME</div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">TYPE</div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-widest text-right">QUANTITY</div>
          </div>
          
          {/* Table Rows */}
          <div className="space-y-3">
            {[
              { date: '11 Jan 2024', time: '10:24 PM', type: 'Text to Image', quantity: '-50', color: 'blue' },
              { date: '11 Jan 2024', time: '10:24 PM', type: 'Image to Image', quantity: '50', color: 'purple' },
              { date: '11 Jan 2024', time: '10:24 PM', type: 'Text to Speech', quantity: '-50', color: 'pink' }
            ].map((entry, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 py-2">
                <div className="text-sm text-gray-400">
                  <div className="font-semibold tracking-wide">{entry.date}</div>
                  <div className="text-xs font-medium tracking-wide">{entry.time}</div>
                </div>
                <div>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold tracking-wide ${
                    entry.color === 'blue' ? 'bg-blue-900/30 text-blue-400 border border-blue-800' :
                    entry.color === 'purple' ? 'bg-purple-900/30 text-purple-400 border border-purple-800' :
                    'bg-pink-900/30 text-pink-400 border border-pink-800'
                  }`}>
                    {entry.type}
                  </span>
                </div>
                <div className="text-sm text-white font-bold text-right tracking-wide">{entry.quantity}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Purchases Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-white text-lg font-bold tracking-tight mb-6">Purchases</h3>
        
        {/* Table Header */}
        <div className="grid grid-cols-6 gap-6 mb-4 pb-3 border-b border-gray-800">
          <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">DATE & TIME</div>
          <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">TYPE</div>
          <div className="text-xs text-gray-400 font-bold uppercase tracking-widest text-center">QUANTITY</div>
          <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">PAYMENT</div>
          <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">TOTAL AMOUNT</div>
          <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">RENEWS ON</div>
        </div>
        
        {/* Table Rows */}
        <div className="space-y-4">
          {[
            {
              date: '11 Jan 2024',
              time: '10:24 PM',
              type: 'Paid',
              quantity: '50',
              payment: '•••• 7741',
              amount: '$29.99',
              renewsDate: '11 Jan 2024',
              renewsTime: '10:24 PM'
            },
            {
              date: '11 Jan 2024',
              time: '10:24 PM',
              type: 'Free',
              quantity: '50',
              payment: '--',
              amount: '--',
              renewsDate: '11 Jan 2024',
              renewsTime: '10:24 PM'
            },
            {
              date: '11 Jan 2024',
              time: '10:24 PM',
              type: 'Free',
              quantity: '50',
              payment: '--',
              amount: '--',
              renewsDate: '11 Jan 2024',
              renewsTime: '10:24 PM'
            }
          ].map((purchase, index) => (
            <div key={index} className="grid grid-cols-6 gap-6 py-3 items-center">
              <div className="text-sm text-gray-400">
                <div className="font-semibold tracking-wide">{purchase.date}</div>
                <div className="text-xs font-medium tracking-wide">{purchase.time}</div>
              </div>
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                  purchase.type === 'Paid' 
                    ? 'bg-orange-900/30 text-orange-400 border border-orange-800' 
                    : 'bg-green-900/30 text-green-400 border border-green-800'
                }`}>
                  {purchase.type}
                </span>
              </div>
              <div className="text-white text-sm font-bold text-center tracking-wide">{purchase.quantity}</div>
              <div className="text-gray-400 text-sm flex items-center space-x-2">
                {purchase.type === 'Paid' && (
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="font-semibold tracking-wide">{purchase.payment}</span>
              </div>
              <div className="text-white text-sm font-bold flex items-center space-x-2 tracking-wide">
                <span>{purchase.amount}</span>
                {purchase.type === 'Paid' && (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              </div>
              <div className="text-sm text-gray-400">
                <div className="font-semibold tracking-wide">{purchase.renewsDate}</div>
                <div className="text-xs font-medium tracking-wide">{purchase.renewsTime}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
