import React, { useState } from 'react';
import { X, Send, Headphones, Check, Sparkles, MessageSquare, ShieldCheck, User } from 'lucide-react';

interface SupportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

interface SupportMessage {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  time: string;
}

export const SupportChatModal: React.FC<SupportChatModalProps> = ({
  isOpen,
  onClose,
  userName = 'Seeker'
}) => {
  const [messages, setMessages] = useState<SupportMessage[]>([
    {
      id: 'm1',
      sender: 'agent',
      text: `Hello ${userName}! Welcome to LUMSIC 24/7 Priority Support. How can our sanctuary team assist you today?`,
      time: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: SupportMessage = {
      id: 'u_' + Date.now(),
      sender: 'user',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const agentReply: SupportMessage = {
        id: 'a_' + Date.now(),
        sender: 'agent',
        text: 'Thank you for reaching out! Your inquiry has been prioritized with Senior Priest Gabriel. Your wallet balance, transaction, and reading passes are 100% protected under our satisfaction guarantee.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, agentReply]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#0D1536] border border-indigo-900/80 rounded-none sm:rounded-3xl shadow-2xl flex flex-col h-full sm:h-[580px] max-h-screen text-white overflow-hidden">
        {/* Support Header */}
        <div className="p-4 bg-[#141E47] border-b border-indigo-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#141E47]" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Customer Support Chat</h3>
              <p className="text-[11px] text-emerald-400 font-medium">● Support Specialist Online</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 font-medium rounded-tr-xs'
                    : 'bg-[#182352] text-slate-100 border border-indigo-800/80 rounded-tl-xs'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">{m.time}</span>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 italic py-1">
              <span className="animate-pulse">Specialist is typing...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-[#0A0F26] border-t border-indigo-900/60 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-[#141E47] border border-indigo-800 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-gray-950 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4 fill-current" />
          </button>
        </form>
      </div>
    </div>
  );
};
