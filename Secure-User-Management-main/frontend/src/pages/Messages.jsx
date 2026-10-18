import React, { useState } from 'react';
import { MessageSquare, Send, Search, MoreVertical, Phone, Video, Bot, CheckCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const initialConversations = {
  1: [
    { id: 1, text: 'Hello! Welcome to SecurePro support. How can we help you today?', sender: 'them', time: '10:30 AM' },
    { id: 2, text: 'I am checking the status of our upcoming sprint deployments.', sender: 'me', time: '10:32 AM' },
    { id: 3, text: 'Everything is currently running smoothly across all microservices!', sender: 'them', time: '10:42 AM' },
  ],
  2: [
    { id: 1, text: 'Hey, did you get a chance to review the latest API integration PR?', sender: 'them', time: 'Yesterday' },
    { id: 2, text: 'Yes, just reviewed it! All 34 tests passed cleanly.', sender: 'me', time: 'Yesterday' },
  ],
  3: [
    { id: 1, text: 'Security Notice: Successful administrator session initialized.', sender: 'them', time: 'Monday' },
    { id: 2, text: 'Two-factor TOTP verification was confirmed successfully.', sender: 'them', time: 'Monday' },
  ]
};

const contactsList = [
  { id: 1, name: 'Support Team', role: 'Support Agent', avatar: 'ST', lastMsg: 'Everything is running smoothly...', time: '10:42 AM', online: true },
  { id: 2, name: 'Alex Johnson', role: 'Staff Engineer', avatar: 'AJ', lastMsg: 'All 34 tests passed cleanly.', time: 'Yesterday', online: true },
  { id: 3, name: 'System Notifications', role: 'Automated Bot', avatar: 'SN', lastMsg: 'Security Notice: Successful session...', time: 'Monday', online: false },
];

const Messages = () => {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState(1);
  const [conversations, setConversations] = useState(initialConversations);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const activeContact = contactsList.find(c => c.id === activeChat) || contactsList[0];
  const messages = conversations[activeChat] || [];

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMsg = {
      id: Date.now(),
      text: newMessage.trim(),
      sender: 'me',
      time: new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date()),
    };

    setConversations(prev => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), userMsg]
    }));
    setNewMessage('');

    // Simulated responsive reply
    setIsTyping(true);
    setTimeout(() => {
      const replies = [
        "Got it! Thanks for the update.",
        "Understood. Our team will verify this right away.",
        "Thanks for letting us know! All checks are verified.",
        "Acknowledged. We'll update the workspace logs accordingly."
      ];
      const botReply = {
        id: Date.now() + 1,
        text: replies[Math.floor(Math.random() * replies.length)],
        sender: 'them',
        time: new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date()),
      };

      setConversations(prev => ({
        ...prev,
        [activeChat]: [...(prev[activeChat] || []), botReply]
      }));
      setIsTyping(false);
    }, 1200);
  };

  const filteredContacts = contactsList.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 h-[calc(100vh-4rem)] flex flex-col text-slate-900 dark:text-slate-200 transition-colors duration-300">
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
          <MessageSquare className="mr-3 h-8 w-8 text-primary-600 dark:text-primary-400" />
          Messages & Direct Channels
        </h1>
        <p className="mt-2 text-slate-800 dark:text-charcoal-300">Direct real-time communications with support and engineering teams.</p>
      </div>

      <div className="flex-1 bg-white dark:bg-[#15151a] border border-slate-200 dark:border-white/10 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-0">
        
        {/* Sidebar */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 flex flex-col bg-slate-50/50 dark:bg-charcoal-800/30">
          <div className="p-4 border-b border-slate-200 dark:border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm dark:text-white transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setActiveChat(contact.id)}
                className={`p-4 border-b border-slate-100 dark:border-white/5 cursor-pointer transition-colors flex items-center gap-3 ${activeChat === contact.id ? 'bg-primary-500/10 dark:bg-primary-500/20' : 'hover:bg-slate-100 dark:hover:bg-charcoal-700/50'}`}
              >
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary-600 to-accent-dark flex items-center justify-center text-white font-bold shadow-md">
                    {contact.avatar}
                  </div>
                  {contact.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-charcoal-900"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{contact.name}</h4>
                    <span className="text-[11px] text-slate-400 font-medium">{contact.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{contact.lastMsg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-charcoal-900/40">
          <div className="h-16 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-6 bg-slate-50/50 dark:bg-charcoal-800/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary-600 to-accent-dark flex items-center justify-center text-white font-bold shadow-md">
                {activeContact.avatar}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{activeContact.name}</h3>
                <p className="text-xs text-emerald-500 font-medium">{activeContact.role} · Active</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <button className="hover:text-primary-500 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"><Phone className="h-4 w-4" /></button>
              <button className="hover:text-primary-500 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"><Video className="h-4 w-4" /></button>
            </div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <div className="text-center text-xs font-semibold text-slate-400 dark:text-charcoal-500 my-2">Workspace Channel Active</div>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${msg.sender === 'me' ? 'bg-primary-600 text-white rounded-tr-sm' : 'bg-slate-100 dark:bg-charcoal-800 text-slate-800 dark:text-white rounded-tl-sm border border-slate-200 dark:border-white/5'}`}>
                  {msg.text}
                </div>
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="text-[10px] text-slate-400 font-medium">{msg.time}</span>
                  {msg.sender === 'me' && <CheckCheck className="h-3 w-3 text-primary-500" />}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                <div className="h-2 w-2 rounded-full bg-primary-500 animate-ping"></div>
                {activeContact.name} is typing...
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-charcoal-800/30">
            <form onSubmit={handleSend} className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message ${activeContact.name}...`}
                className="flex-1 bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none text-sm dark:text-white transition-all shadow-sm"
              />
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-500 text-white p-3 rounded-xl shadow-lg shadow-primary-500/20 transition-all flex-shrink-0"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Messages;
