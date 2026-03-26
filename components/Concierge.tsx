
import React, { useState, useRef, useEffect } from 'react';
import { chatWithConcierge } from '../services/geminiService';
import { Message, UserRecord, Session } from '../types';

interface ConciergeProps {
  currentUser: UserRecord | null;
  ADMIN_EMAIL: string;
  isCloudActive: boolean;
  handleGoogleAuth: () => void;
  sessions: Session[];
  addSession: (session: Session) => Promise<void>;
}

export const Concierge: React.FC<ConciergeProps> = ({ 
  currentUser, 
  ADMIN_EMAIL, 
  isCloudActive, 
  handleGoogleAuth, 
  sessions, 
  addSession 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Greetings. I am the gyaan.one Concierge. How may I assist your learning journey today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await chatWithConcierge(messages, userMsg);
      setMessages(prev => [...prev, { role: 'model', text: response || 'I apologize, I am having trouble connecting.' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: 'Something went wrong. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-[#1A2238] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-[60] group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      </button>

      <div className={`fixed inset-y-0 right-0 w-full md:w-[400px] bg-white shadow-2xl z-[70] transform transition-transform duration-500 ease-in-out border-l border-gray-100 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-[#FDFBF7]">
          <div>
            <h2 className="font-playfair text-xl font-bold text-[#1A2238]">Concierge</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">gyaan.one Study Assistant</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-[#1A2238]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-white/50">
          {/* Admin Quick Actions */}
          {(currentUser?.isAdmin || currentUser?.email?.toLowerCase() === ADMIN_EMAIL) && (
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl mb-4">
              <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest mb-2">Admin Quick Actions</p>
              <button 
                onClick={async () => {
                  if (!isCloudActive) {
                    setMessages(prev => [...prev, { role: 'model', text: 'You are in Local Preview Mode. Please sign in with Google to sync changes globally.' }]);
                    handleGoogleAuth();
                    return;
                  }
                  try {
                    for (const s of sessions) {
                      await addSession(s);
                    }
                    setMessages(prev => [...prev, { role: 'model', text: 'Cloud Sync Complete. All devices will now see the latest curriculum.' }]);
                  } catch (e) {
                    setMessages(prev => [...prev, { role: 'model', text: 'Sync failed. Please check your connection.' }]);
                  }
                }}
                className="w-full bg-emerald-600 text-white py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"></path></svg>
                Sync Now
              </button>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-[#1A2238] text-white rounded-tr-none' 
                  : 'bg-gray-50 text-gray-700 border border-gray-100 rounded-tl-none'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none border border-gray-100 flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#7FB5B5] rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-[#7FB5B5] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-[#7FB5B5] rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-gray-50">
          <div className="flex gap-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Inquire..."
              className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7FB5B5]/20 focus:border-[#7FB5B5] transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading}
              className="bg-[#1A2238] text-white px-4 rounded-xl hover:bg-[#7FB5B5] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};