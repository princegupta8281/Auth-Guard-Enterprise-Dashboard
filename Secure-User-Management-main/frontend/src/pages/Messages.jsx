import React, { useState } from 'react';
import { MessageSquare, Send, Search, MoreVertical, Phone, Video } from 'lucide-react';

const Messages = () => {
  const [activeChat, setActiveChat] = useState(1);
  const [newMessage, setNewMessage] = useState('');

  const contacts = [
    { id: 1, name: 'Support Team', role: 'Admin', avatar: 'ST', unread: 2, lastMsg: 'We have updated your ticket status.', time: '10:42 AM' },
    { id: 2, name: 'Alex Johnson', role: 'Developer', avatar: 'AJ', unread: 0, lastMsg: 'Can you review the latest pull request?', time: 'Yesterday' },
    { id: 3, name: 'System Notifications', role: 'Bot', avatar: 'SN', unread: 5, lastMsg: 'Your account login was successful from a new IP.', time: 'Monday' },
  ];

  const messages = [
    { id: 1, text: 'Hello! How can we help you today?', sender: 'them', time: '10:30 AM' },
    { id: 2, text: 'I am having an issue with my recent appointment booking.', sender: 'me', time: '10:32 AM' },
    { id: 3, text: 'We have updated your ticket status. Please check the support desk.', sender: 'them', time: '10:42 AM' },
  ];

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    // Mock send
    setNewMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 h-[calc(100vh-4rem)] flex flex-col text-slate-900 dark:text-slate-200 transition-colors duration-300">
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
          <MessageSquare className="mr-3 h-8 w-8 text-primary-600 dark:text-primary-400" />
          Messages
        </h1>
        <p className="mt-2 text-slate-800 dark:text-charcoal-300">Connect with your team and support agents.</p>
      </div>

      <div className="flex-1 bg-white dark:bg-[#15151a]  border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-0">
        
        {/* Sidebar */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 flex flex-col bg-slate-50/50 dark:bg-charcoal-800/30">
          <div className="p-4 border-b border-slate-200 dark:border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm dark:text-white transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setActiveChat(contact.id)}
                className={`p-4 border-b border-slate-100 dark:border-white/5 cursor-pointer transition-colors flex items-center gap-3 ${activeChat === contact.id ? 'bg-primary-500/10 dark:bg-primary-500/20' : 'hover:bg-slate-100 dark:hover:bg-charcoal-700/50'}`}
              >
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary-600 to-accent-dark flex items-center justify-center text-white font-bold shadow-md">
                    {contact.avatar}
                  </div>
                  {contact.unread > 0 && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white dark:border-charcoal-900 flex items-center justify-center text-[10px] text-white font-bold">
                      {contact.unread}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{contact.name}</h4>
                    <span className="text-xs font-medium text-slate-800 dark:text-charcoal-400">{contact.time}</span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-charcoal-300 truncate">{contact.lastMsg}</p>
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
                ST
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Support Team</h3>
                <p className="text-xs text-emerald-500 font-medium">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <button className="hover:text-primary-500 transition-colors"><Phone className="h-5 w-5" /></button>
              <button className="hover:text-primary-500 transition-colors"><Video className="h-5 w-5" /></button>
              <button className="hover:text-primary-500 transition-colors"><MoreVertical className="h-5 w-5" /></button>
            </div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div className="text-center text-xs font-medium text-slate-400 dark:text-charcoal-500 my-4">Today</div>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${msg.sender === 'me' ? 'bg-primary-600 text-white rounded-tr-sm' : 'bg-slate-100 dark:bg-charcoal-800 text-slate-800 dark:text-white rounded-tl-sm border border-slate-200 dark:border-white/5'}`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-800 dark:text-charcoal-400 mt-1 font-medium px-1">{msg.time}</span>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-charcoal-800/30">
            <form onSubmit={handleSend} className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
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

