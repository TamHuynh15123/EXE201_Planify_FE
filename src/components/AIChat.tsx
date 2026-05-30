import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Sparkles, User, Bot, RefreshCw } from 'lucide-react';
import { aiService, ChatMessage } from '../services/aiService';

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
}

const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose, initialMessage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMsg: ChatMessage = {
        role: 'assistant',
        content: initialMessage || 'Chào bạn! Tôi là Planify AI. Tôi có thể giúp gì cho bạn trong việc lập kế hoạch hôm nay?'
      };
      setMessages([welcomeMsg]);
    }
  }, [isOpen, initialMessage, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // FE should send at most 6 recent conversations to save bandwidth
      const history = messages.slice(-6);
      const response = await aiService.chat({ message: input, history });
      
      const assistantMsg: ChatMessage = { role: 'assistant', content: response.reply };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      const errorMsg: ChatMessage = { 
        role: 'assistant', 
        content: 'Xin lỗi, hệ thống AI đang gặp sự cố. Vui lòng thử lại sau.' 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-[32px] shadow-2xl border border-gray-100 flex flex-col z-[100] animate-in slide-in-from-bottom-4 duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-ai text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl overflow-hidden border border-white/20">
            <img src="/ai-bot.jpg" alt="AI Bot" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Planify AI</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-[10px] font-medium opacity-80">Đang trực tuyến</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-gray-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
                msg.role === 'user' ? 'bg-primary text-white' : 'bg-white shadow-sm'
              }`}>
                {msg.role === 'user' ? <User size={14} /> : <img src="/ai-bot.jpg" alt="AI Bot" className="w-full h-full object-cover" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden">
                <img src="/ai-bot.jpg" alt="AI Bot" className="w-full h-full object-cover" />
              </div>
              <div className="p-4 bg-white text-gray-400 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-2">
                <RefreshCw size={14} className="animate-spin" />
                <span className="text-xs font-medium italic">AI đang trả lời...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 bg-white border-t border-gray-100">
        <div className="relative">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Hỏi AI về lộ trình của bạn..."
            className="w-full pl-4 pr-12 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-primary/20 transition-all text-sm"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
              input.trim() && !isLoading ? 'bg-primary text-white shadow-lg' : 'text-gray-300'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-4">
          Planify AI có thể đưa ra câu trả lời chưa chính xác. Hãy kiểm tra kỹ thông tin.
        </p>
      </div>
    </div>
  );
};

export default AIChat;
