import { useState, useEffect, useRef } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { 
  Send, 
  User as UserIcon, 
  Loader2, 
  ChevronLeft,
  MessageCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';

export default function ChatPage({ userProfile }: { userProfile: UserProfile | null }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initial Support Message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        senderId: 'support',
        text: 'Olá! Como podemos ajudar você hoje? Envie sua mensagem e nossa equipe entrará em contato o mais breve possível.',
        createdAt: new Date().toISOString(),
      }]);
    }
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      senderId: userProfile?.uid || 'guest',
      text: inputText,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Support mode (simulated but with real notification)
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: 'admin',
        title: 'Nova Mensagem de Suporte',
        message: `${userProfile?.displayName || 'Um usuário'} enviou uma mensagem: ${inputText.substring(0, 50)}...`,
        type: 'message',
        read: false,
        createdAt: new Date().toISOString(),
      });

      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString() + '-support',
          senderId: 'support',
          text: 'Recebemos sua mensagem. Um de nossos agentes responderá em breve via WhatsApp ou Email.',
          createdAt: new Date().toISOString(),
        }]);
        setIsTyping(false);
      }, 1500);
    } catch (error) {
      console.error("Error creating support notification:", error);
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)] flex flex-col bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <header className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors bg-blue-50 text-blue-600">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Suporte Humano
            </h1>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Online Agora</span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-gray-50/30 relative"
      >
        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { label: 'Como comprar?', icon: 'ShoppingBag' },
              { label: 'Métodos de pagamento', icon: 'CreditCard' },
              { label: 'Segurança e entrega', icon: 'Shield' },
              { label: 'Como vender?', icon: 'Store' },
            ].map((action, i) => (
              <button 
                key={i}
                onClick={() => setInputText(action.label)}
                className="p-4 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl text-left hover:border-blue-500 hover:shadow-md transition-all group"
              >
                <p className="text-xs font-bold text-gray-900 group-hover:text-blue-600">{action.label}</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">Toque para perguntar</p>
              </button>
            ))}
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === userProfile?.uid;

          return (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex items-end gap-3",
                isMe ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm",
                isMe ? "bg-green-600 text-white" : "bg-blue-600 text-white"
              )}>
                {isMe ? <UserIcon className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
              </div>
              
              <div className={cn(
                "max-w-[85%] p-4 rounded-[24px] text-sm shadow-sm relative overflow-hidden",
                isMe ? "bg-green-600 text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
              )}>
                <div className="markdown-body prose prose-sm max-w-none relative z-10">
                  <Markdown>{msg.text}</Markdown>
                </div>
                <div className={cn(
                  "flex items-center gap-1 mt-2 opacity-60",
                  isMe ? "justify-end" : "justify-start"
                )}>
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-medium">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMe && <CheckCircle2 className="w-3 h-3 ml-1" />}
                </div>
              </div>
            </motion.div>
          );
        })}
        {isTyping && (
          <div className="flex items-center gap-3 text-gray-400 text-xs font-medium px-12">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
            </div>
            <span>Suporte está digitando...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-gray-100">
        <div className="relative flex items-center gap-3">
          <input 
            type="text" 
            placeholder="Digite sua mensagem..."
            className="flex-1 pl-6 pr-14 py-4 bg-gray-50 border-none rounded-[24px] text-sm focus:ring-2 focus:ring-blue-500 transition-all"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="absolute right-2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">
          Foco em confiança e segurança • MultiVendas
        </p>
      </form>
    </div>
  );
}
