import { motion } from 'framer-motion';

export function ChatPreview() {
  return (
    <div className="w-full max-w-md relative pb-10 font-sans">
      
      {/* Sarah's Bubble */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="flex justify-start mb-6 relative"
      >
        <div 
          className="rounded-[14px] px-5 py-4 w-[340px]"
          style={{ 
            background: 'rgba(255, 255, 255, 0.03)', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-700">
                <img src="https://i.pravatar.cc/100?img=5" alt="Sarah" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-white">Sarah</span>
                <span className="text-[10px] text-gray-500 font-medium">Design Lead</span>
              </div>
            </div>
            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">10:14 AM</span>
          </div>
          
          <p className="text-[12px] text-gray-300 leading-relaxed mt-2.5">
            The new authentication flow looks incredibly sharp.<br />
            Pushing the final assets to the repo now.
          </p>
        </div>

        {/* Small cyan dot below the bubble to the left */}
        <div 
          className="absolute -bottom-2 left-6 w-[7px] h-[7px] rounded-full"
          style={{ background: '#00e5a0', boxShadow: '0 0 8px #00e5a0' }}
        />
      </motion.div>

      {/* Your Bubble */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="flex justify-end mb-6"
      >
        <div 
          className="rounded-[14px] px-5 py-4 w-[300px]"
          style={{ 
            background: '#042a22',
            border: '1px solid rgba(0, 229, 160, 0.1)',
            boxShadow: '0 8px 30px rgba(0, 229, 160, 0.05)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">10:26 AM</span>
            <span className="text-[11px] font-semibold text-white">You</span>
          </div>
          
          <p className="text-[12px] text-white leading-relaxed text-right">
            Perfect. I'll tie in the webhook logic and we're ready for staging. 🚀
          </p>
        </div>
      </motion.div>

      {/* Typing Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="flex justify-start relative"
      >
        <div 
          className="rounded-2xl px-4 py-3 flex items-center gap-3 w-fit"
          style={{ 
            background: 'rgba(255, 255, 255, 0.03)', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
          }}
        >
          <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-700">
            <img src="https://i.pravatar.cc/100?img=11" alt="John" className="w-full h-full object-cover grayscale opacity-70" />
          </div>
          <div className="flex gap-[3px] opacity-70">
            <div className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          </div>
        </div>
      </motion.div>

    </div>
  );
}
