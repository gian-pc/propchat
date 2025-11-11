'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, MessageSquare, X } from 'lucide-react' 
import { api, ChatResponse, PropertyFilters } from '@/services/api'

interface ChatMessage {
  id: number;
  role: 'user' | 'bot';
  content: string;
  filters?: PropertyFilters | null;
}

interface ChatWidgetProps {
    onFiltersExtracted: (filters: PropertyFilters) => void;
}

export default function ChatWidget({ onFiltersExtracted }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: 'bot',
      content: "¡Hola! Soy tu asistente experto en bienes raíces. ¿En qué tipo de propiedad o búsqueda te puedo ayudar hoy?"
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
    };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    
    try {
      const result: ChatResponse = await api.sendChatMessage(userMessage.content);
      
      if (result.filters) {
          onFiltersExtracted(result.filters);
      }
      
      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'bot',
        content: result.response,
        filters: result.filters,
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'bot',
        content: 'Lo siento, hubo un error al procesar tu mensaje.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  // --- Renderizado (Botón Cerrado) ---

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        // Posicionamos en la esquina inferior izquierda del mapa
        className="absolute bottom-6 left-6 z-10 w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="Abrir chat"
      >
        <MessageSquare className="w-8 h-8" />
      </button>
    );
  }

  // --- Renderizado (Ventana Abierta - TAMAÑO CORREGIDO) ---
  return (
    // max-w-xl (Ancho)
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-[95%] max-w-xl">
      <div 
        // h-[50vh] y max-h-[550px] (Altura)
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col h-[50vh] max-h-[550px]"
      >
        
        {/* Header del Chat */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Asistente PropChat</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Cerrar chat"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Área de Mensajes (con scroll) */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              {/* Avatar del Bot */}
              {msg.role === 'bot' && (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">🤖</span>
                </div>
              )}

              {/* Burbuja de Mensaje */}
              <div
                className={`flex-1 max-w-[80%] p-3 rounded-xl ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
          {/* Div invisible para el auto-scroll */}
          <div ref={messagesEndRef} />
        </div>

        {/* Área del Input (fija abajo) */}
        <div className="p-4 border-t bg-white rounded-b-2xl">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700 placeholder:text-gray-400"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleSend()
                }
              }}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl flex items-center justify-center transition-all disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}