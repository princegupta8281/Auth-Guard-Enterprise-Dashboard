import React, { useState, useEffect, useMemo } from 'react';
import { adminApi, getApiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Activity, Search, ArrowUpDown, Filter } from 'lucide-react';

const AuditLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchLogs = async (pageNumber) => {
    setLoading(true);
    try {
      const response = await adminApi.auditLogs({ page: pageNumber, size: 50 }); // fetched more for client side filter/sort demonstration
      setLogs(response.data.content);
      setTotalPages(response.data.totalPages);
      setPage(pageNumber);
      setError('');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Audit logs could not be loaded.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(0);
  }, []);

  const getActionColor = (action) => {
    if (action.includes('LOGIN')) return 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
    if (action.includes('UPDATE') || action.includes('RESET')) return 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20';
    if (action.includes('REGISTER')) return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
    if (action.includes('DELETE') || action.includes('FAIL')) return 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20';
    return 'bg-slate-200 dark:bg-charcoal-700 text-slate-800 dark:text-charcoal-400 border-slate-300 dark:border-charcoal-600';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString();
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedLogs = useMemo(() => {
    let result = logs.filter((log) => {
      const matchesSearch = [log.action, log.email, log.details]
        .some((value) => String(value || '').toLowerCase().includes(search.trim().toLowerCase()));
      const matchesFilter = actionFilter === 'ALL' || log.action.includes(actionFilter);
      return matchesSearch && matchesFilter;
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return result;
  }, [logs, search, actionFilter, sortConfig]);

  const uniqueActions = useMemo(() => {
    const actions = new Set(logs.map(log => log.action.split('_')[0])); // group somewhat by prefix
    return ['ALL', ...Array.from(actions)];
  }, [logs]);

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen text-slate-900 dark:text-slate-200 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <Activity className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
            System Audit Logs
          </h1>
          <p className="mt-2 text-slate-800 dark:text-charcoal-300">Monitor system activity, user logins, and security events.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#15151a]  border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden mb-6">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-charcoal-800/30">
          
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs by user, action, or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white placeholder-slate-400 dark:placeholder-charcoal-400"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="h-5 w-5 text-slate-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full sm:w-auto bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white transition-all appearance-none"
            >
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="m-6 p-4 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => fetchLogs(page)} className="font-bold underline hover:text-red-700 dark:hover:text-red-300">
              Try again
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-charcoal-800/50 border-b border-slate-200 dark:border-white/10">
                <th className="px-6 py-4 font-semibold text-slate-800 dark:text-charcoal-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-charcoal-700/50 transition-colors" onClick={() => requestSort('timestamp')}>
                  <div className="flex items-center gap-2">Timestamp <ArrowUpDown className="h-4 w-4" /></div>
                </th>
                <th className="px-6 py-4 font-semibold text-slate-800 dark:text-charcoal-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-charcoal-700/50 transition-colors" onClick={() => requestSort('action')}>
                  <div className="flex items-center gap-2">Action <ArrowUpDown className="h-4 w-4" /></div>
                </th>
                <th className="px-6 py-4 font-semibold text-slate-800 dark:text-charcoal-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-charcoal-700/50 transition-colors" onClick={() => requestSort('email')}>
                  <div className="flex items-center gap-2">User <ArrowUpDown className="h-4 w-4" /></div>
                </th>
                <th className="px-6 py-4 font-semibold text-slate-800 dark:text-charcoal-200">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    <p className="mt-4 text-slate-800 dark:text-charcoal-400">Loading audit logs...</p>
                  </td>
                </tr>
              ) : filteredAndSortedLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-800 dark:text-charcoal-400">
                    No logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredAndSortedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-charcoal-800/40 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-charcoal-300">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                      {log.email || 'System Account'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-800 dark:text-charcoal-300 truncate max-w-xs sm:max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-charcoal-800/30">
            <p className="text-sm text-slate-800 dark:text-charcoal-300">
              Showing page <span className="font-bold text-slate-900 dark:text-white">{page + 1}</span> of <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchLogs(page - 1)}
                disabled={page === 0}
                className="px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-charcoal-800 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-charcoal-700 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                Previous
              </button>
              <button
                onClick={() => fetchLogs(page + 1)}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-charcoal-800 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-charcoal-700 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
