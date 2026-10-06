import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { ticketsApi } from '../services/api';
import { MessageSquare, Plus, Clock, CheckCircle2, ChevronRight, X, Search, ArrowUpDown, Filter } from 'lucide-react';

const Tickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(null);
  
  const [newTicket, setNewTicket] = useState({ title: '', description: '', priority: 'LOW' });
  const [newMessage, setNewMessage] = useState('');
  
  // Sorting and Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await ticketsApi.getUserTickets();
      setTickets(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await ticketsApi.createTicket(newTicket);
      setIsCreating(false);
      setNewTicket({ title: '', description: '', priority: 'LOW' });
      fetchTickets();
    } catch (e) {
      console.error(e);
    }
  };

  const openTicket = async (ticket) => {
    setSelectedTicket(ticket);
    try {
      const res = await ticketsApi.getTicket(ticket.id);
      setTicketDetails(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await ticketsApi.addMessage(selectedTicket.id, { message: newMessage });
      setNewMessage('');
      openTicket(selectedTicket);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      await ticketsApi.updateStatus(selectedTicket.id, status);
      openTicket(selectedTicket);
      fetchTickets();
    } catch (e) {
      console.error(e);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'CRITICAL': return 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20';
      case 'HIGH': return 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20';
      case 'MEDIUM': return 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20';
      default: return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'CLOSED': return 'bg-slate-200 dark:bg-charcoal-700 text-slate-800 dark:text-charcoal-400 border-slate-300 dark:border-charcoal-600';
      case 'RESOLVED': return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
      case 'IN_PROGRESS': return 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
      default: return 'bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-500/20';
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedTickets = useMemo(() => {
    let filterableTickets = tickets.filter(ticket => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) || ticket.id.toString().includes(searchTerm);
      const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortConfig.key) {
      filterableTickets.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return filterableTickets;
  }, [tickets, searchTerm, statusFilter, sortConfig]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen text-slate-900 dark:text-slate-200 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <MessageSquare className="mr-3 h-8 w-8 text-primary-600 dark:text-primary-400" />
            Support Helpdesk
          </h1>
          <p className="mt-2 text-slate-800 dark:text-charcoal-300">Manage and track your support requests.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-primary-600 hover:bg-primary-500 dark:bg-primary-500 dark:hover:bg-primary-400 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 flex items-center"
        >
          <Plus className="mr-2 h-5 w-5" /> New Ticket
        </button>
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Ticket</h2>
              <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-100 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={newTicket.title}
                  onChange={e => setNewTicket({...newTicket, title: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-charcoal-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="Brief summary of the issue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-100 mb-1">Priority</label>
                <select
                  value={newTicket.priority}
                  onChange={e => setNewTicket({...newTicket, priority: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-charcoal-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                >
                  <option value="LOW">Low - General inquiry</option>
                  <option value="MEDIUM">Medium - Non-critical issue</option>
                  <option value="HIGH">High - Core functionality impaired</option>
                  <option value="CRITICAL">Critical - System down</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-100 mb-1">Description</label>
                <textarea
                  required
                  rows="4"
                  value={newTicket.description}
                  onChange={e => setNewTicket({...newTicket, description: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-charcoal-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none transition-all"
                  placeholder="Please provide details about the issue..."
                ></textarea>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-bold py-2.5 rounded-xl transition-colors shadow-lg">
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTicket && ticketDetails ? (
        <div className="bg-white/60 dark:bg-charcoal-800/40 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/40 dark:border-white/5 flex justify-between items-start bg-white dark:bg-black/20">
            <div>
              <button onClick={() => setSelectedTicket(null)} className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-bold mb-4 flex items-center transition-colors">
                &larr; Back to all tickets
              </button>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">{ticketDetails.title}</h2>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className={`px-2.5 py-1 rounded-full border text-xs font-bold ${getStatusColor(ticketDetails.status)}`}>
                  {ticketDetails.status}
                </span>
                <span className={`px-2.5 py-1 rounded-full border text-xs font-bold ${getPriorityColor(ticketDetails.priority)}`}>
                  {ticketDetails.priority}
                </span>
                <span className="text-slate-800 dark:text-charcoal-400 flex items-center font-medium bg-white/50 dark:bg-charcoal-900/50 px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/5">
                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                  {new Date(ticketDetails.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
            {user.role === 'ADMIN' && (
              <div className="flex gap-2">
                <select 
                  className="bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 dark:text-white outline-none shadow-sm cursor-pointer hover:border-primary-500 transition-colors"
                  value={ticketDetails.status}
                  onChange={e => handleStatusUpdate(e.target.value)}
                >
                  <option value="OPEN">Set Open</option>
                  <option value="IN_PROGRESS">Set In Progress</option>
                  <option value="RESOLVED">Set Resolved</option>
                  <option value="CLOSED">Set Closed</option>
                </select>
              </div>
            )}
          </div>
          
          <div className="p-6 bg-slate-50/50 dark:bg-transparent">
            <div className="space-y-6 mb-6">
              {/* Original Issue */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-500/20 border border-primary-200 dark:border-primary-500/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold shrink-0 shadow-sm">
                  {ticketDetails.userName.charAt(0)}
                </div>
                <div className="flex-1 bg-white dark:bg-charcoal-800/80 border border-slate-100 dark:border-white/5 rounded-3xl rounded-tl-none p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-slate-900 dark:text-white">{ticketDetails.userName}</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-charcoal-400">Original Post</span>
                  </div>
                  <p className="text-slate-700 dark:text-charcoal-200 whitespace-pre-wrap text-sm leading-relaxed">{ticketDetails.description}</p>
                </div>
              </div>

              {/* Messages */}
              {ticketDetails.messages?.map(msg => (
                <div key={msg.id} className={`flex gap-4 ${msg.senderRole === 'ADMIN' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-sm border ${
                    msg.senderRole === 'ADMIN' 
                      ? 'bg-accent-light/20 border-accent-light/30 text-accent-dark dark:text-accent-light' 
                      : 'bg-primary-100 dark:bg-primary-500/20 border-primary-200 dark:border-primary-500/30 text-primary-700 dark:text-primary-400'
                  }`}>
                    {msg.senderName.charAt(0)}
                  </div>
                  <div className={`flex-1 bg-white dark:bg-charcoal-800/80 border border-slate-100 dark:border-white/5 rounded-3xl p-5 shadow-sm ${
                    msg.senderRole === 'ADMIN' ? 'rounded-tr-none dark:border-accent-light/20 border-accent-light/40' : 'rounded-tl-none'
                  }`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {msg.senderName}
                        {msg.senderRole === 'ADMIN' && <span className="bg-accent-dark dark:bg-accent-light text-white dark:text-charcoal-900 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">Support</span>}
                      </span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-charcoal-400">{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-700 dark:text-charcoal-200 whitespace-pre-wrap text-sm leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {ticketDetails.status !== 'CLOSED' && (
              <form onSubmit={handleReply} className="mt-8 border-t border-slate-200 dark:border-white/5 pt-6">
                <textarea
                  rows="3"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type your reply here..."
                  className="w-full bg-white dark:bg-charcoal-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none mb-4 shadow-inner transition-all"
                ></textarea>
                <div className="flex justify-end">
                  <button type="submit" disabled={!newMessage.trim()} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-6 py-2.5 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 transition-colors shadow-lg">
                    Send Reply
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white/60 dark:bg-charcoal-800/40 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-3xl shadow-xl overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-white/40 dark:border-white/5 bg-white dark:bg-charcoal-900/30 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500 text-slate-400 dark:text-charcoal-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Search tickets by ID or subject..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-charcoal-900/50 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="h-4 w-4 text-slate-800 dark:text-charcoal-400" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-white dark:bg-charcoal-900/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none shadow-sm cursor-pointer hover:border-primary-500 transition-all"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-10 text-center text-slate-800 dark:text-charcoal-400 font-medium animate-pulse">Loading tickets...</div>
            ) : filteredAndSortedTickets.length === 0 ? (
              <div className="p-16 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-primary-50 dark:bg-primary-500/10 rounded-3xl flex items-center justify-center mb-6 border border-primary-100 dark:border-primary-500/20 shadow-inner">
                  <CheckCircle2 className="w-10 h-10 text-primary-500 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">No tickets found</h3>
                <p className="text-slate-800 dark:text-charcoal-300 font-medium">Everything looks clear. Adjust your filters or open a new ticket.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-charcoal-900/50 border-b border-white/40 dark:border-white/5 text-xs uppercase tracking-wider text-slate-800 dark:text-charcoal-400">
                    <th className="px-6 py-4 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" onClick={() => requestSort('id')}>
                      <div className="flex items-center gap-1">Ticket ID <ArrowUpDown className="w-3 h-3" /></div>
                    </th>
                    <th className="px-6 py-4 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" onClick={() => requestSort('title')}>
                      <div className="flex items-center gap-1">Subject <ArrowUpDown className="w-3 h-3" /></div>
                    </th>
                    <th className="px-6 py-4 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" onClick={() => requestSort('status')}>
                      <div className="flex items-center gap-1">Status <ArrowUpDown className="w-3 h-3" /></div>
                    </th>
                    <th className="px-6 py-4 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" onClick={() => requestSort('priority')}>
                      <div className="flex items-center gap-1">Priority <ArrowUpDown className="w-3 h-3" /></div>
                    </th>
                    <th className="px-6 py-4 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" onClick={() => requestSort('createdAt')}>
                      <div className="flex items-center gap-1">Created <ArrowUpDown className="w-3 h-3" /></div>
                    </th>
                    <th className="px-6 py-4 text-right font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40 dark:divide-white/5">
                  {filteredAndSortedTickets.map(t => (
                    <tr 
                      key={t.id} 
                      onClick={() => openTicket(t)}
                      className="hover:bg-white/50 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-charcoal-400">#{t.id}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{t.title}</p>
                        {user.role === 'ADMIN' && <p className="text-xs text-slate-800 dark:text-charcoal-400 mt-0.5">By {t.userName}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border inline-block ${getStatusColor(t.status)}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wide border inline-block ${getPriorityColor(t.priority)}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-800 dark:text-charcoal-400 font-medium">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-charcoal-700 text-slate-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-500/20 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-all">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
