'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

export default function ChatWidget() {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (message.trim()) {
      console.log('Mensaje:', message)
      // Aquí irá la lógica para enviar al backend
      setMessage('')
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xl">🤖</span>
          </div>

          {/* Input */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Pregúntame sobre propiedades... Ej: 'Depas en Miraflores bajo $1500'"
            className="flex-1 px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700 placeholder:text-gray-400"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSend()
              }
            }}
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl flex items-center justify-center transition-all disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Helper text */}
        <p className="text-xs text-gray-400 mt-2 ml-14">
          Presiona <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">Enter</kbd> para enviar
        </p>
      </div>
    </div>
  )
}