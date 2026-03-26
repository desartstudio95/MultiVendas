import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, where, limit } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Message, UserProfile } from '../types';
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Sparkles, 
  Loader2, 
  ChevronLeft,
  Search,
  MessageCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';

export default function ChatPage({ userProfile }: { userProfile: UserProfile | null }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatMode, setChatMode] = useState<'support' | 'ai'>('ai');
  const scrollRef = useRef<HTMLDivElement>(null);

  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showLanding]);

  // Initial AI Message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        senderId: 'ai',
        text: 'Olá! Sou o assistente inteligente do Linka Mais. Como posso ajudar você hoje? Posso tirar dúvidas sobre produtos, pagamentos ou como vender na nossa plataforma.',
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

    if (chatMode === 'ai') {
      try {
        const ai = new GoogleGenAI({ apiKey: (process.env as any).GEMINI_API_KEY });
        const chat = ai.chats.create({
          model: "gemini-3-flash-preview",
          config: {
            systemInstruction: "Você é o assistente oficial da MultiVendas, uma loja virtual moderna em Moçambique. Seu tom é profissional, amigável, confiável e tecnológico. Você ajuda usuários a entender como a loja funciona, tira dúvidas sobre categorias (Carros, Moda, Eletrônicos, etc.), pagamentos (M-Pesa, e-Mola) e segurança. A MultiVendas é a única vendedora da plataforma. Se o usuário quiser comprar algo, ele deve entrar em contato com a equipe.",
          },
        });

        // Maintain history for Gemini
        const history = messages.map(m => ({
          role: m.senderId === 'ai' ? 'model' : 'user',
          parts: [{ text: m.text }]
        }));

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            ...history,
            { role: 'user', parts: [{ text: inputText }] }
          ],
        });

        const aiResponse = {
          id: Date.now().toString() + '-ai',
          senderId: 'ai',
          text: response.text || 'Desculpe, tive um problema ao processar sua mensagem.',
          createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, aiResponse]);
      } catch (error) {
        console.error("AI Chat Error:", error);
        setMessages(prev => [...prev, {
          id: Date.now().toString() + '-error',
          senderId: 'ai',
          text: 'Ops! Estou com dificuldades técnicas agora. Por favor, tente novamente em instantes.',
          createdAt: new Date().toISOString(),
        }]);
      } finally {
        setIsTyping(false);
      }
    } else {
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
            text: 'Obrigado por entrar em contato com o suporte humano. Um de nossos agentes responderá em breve via WhatsApp ou Email.',
            createdAt: new Date().toISOString(),
          }]);
          setIsTyping(false);
        }, 1500);
      } catch (error) {
        console.error("Error creating support notification:", error);
        setIsTyping(false);
      }
    }
  };

  if (showLanding) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Centro de Mensagens</h1>
          <p className="text-gray-500 font-medium">Como você gostaria de ser atendido hoje?</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.button
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setChatMode('ai'); setShowLanding(false); }}
            className="p-8 bg-white rounded-[40px] border border-gray-100 shadow-sm text-left space-y-6 group hover:border-green-500 transition-all"
          >
            <div className="w-16 h-16 bg-green-50 rounded-3xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Assistente IA</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Respostas instantâneas sobre produtos, pagamentos e como usar o Linka Mais.
              </p>
            </div>
            <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
              <span>Iniciar Conversa</span>
              <ChevronLeft className="w-4 h-4 rotate-180" />
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setChatMode('support'); setShowLanding(false); }}
            className="p-8 bg-white rounded-[40px] border border-gray-100 shadow-sm text-left space-y-6 group hover:border-blue-500 transition-all"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <MessageCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Suporte Humano</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Fale com um de nossos agentes para resolver problemas específicos ou denúncias.
              </p>
            </div>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
              <span>Abrir Chamado</span>
              <ChevronLeft className="w-4 h-4 rotate-180" />
            </div>
          </motion.button>
        </div>

        <div className="bg-gray-100 p-8 rounded-[40px] text-center space-y-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-gray-900 font-bold">Histórico de Conversas</p>
            <p className="text-sm text-gray-500">Suas conversas anteriores ficarão salvas aqui para consulta.</p>
          </div>
          <button className="text-green-600 font-bold text-sm hover:underline">Ver Histórico Completo</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)] flex flex-col bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <header className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowLanding(true)}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
            chatMode === 'ai' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
          )}>
            {chatMode === 'ai' ? <Sparkles className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {chatMode === 'ai' ? 'Assistente Inteligente' : 'Suporte Humano'}
            </h1>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Online Agora</span>
            </div>
          </div>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setChatMode('ai')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
              chatMode === 'ai' ? "bg-white text-green-600 shadow-sm" : "text-gray-500"
            )}
          >
            IA
          </button>
          <button 
            onClick={() => setChatMode('support')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
              chatMode === 'support' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
            )}
          >
            Suporte
          </button>
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
                className="p-4 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl text-left hover:border-green-500 hover:shadow-md transition-all group"
              >
                <p className="text-xs font-bold text-gray-900 group-hover:text-green-600">{action.label}</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">Toque para perguntar</p>
              </button>
            ))}
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === userProfile?.uid;
          const isAI = msg.senderId === 'ai';

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
                isMe ? "bg-green-600 text-white" : isAI ? "bg-white text-green-600" : "bg-blue-600 text-white"
              )}>
                {isMe ? <UserIcon className="w-4 h-4" /> : isAI ? <Sparkles className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
              </div>
              
              <div className={cn(
                "max-w-[85%] p-4 rounded-[24px] text-sm shadow-sm relative overflow-hidden",
                isMe ? "bg-green-600 text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
              )}>
                {isAI && (
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Sparkles className="w-8 h-8" />
                  </div>
                )}
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
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></span>
            </div>
            <span>{chatMode === 'ai' ? 'IA está processando...' : 'Suporte está digitando...'}</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-gray-100">
        <div className="relative flex items-center gap-3">
          <input 
            type="text" 
            placeholder="Digite sua mensagem..."
            className="flex-1 pl-6 pr-14 py-4 bg-gray-50 border-none rounded-[24px] text-sm focus:ring-2 focus:ring-green-500 transition-all"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="absolute right-2 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 disabled:opacity-50 transition-all shadow-lg shadow-green-100"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">
          Foco em confiança e segurança • Linka Mais
        </p>
      </form>
    </div>
  );
}
