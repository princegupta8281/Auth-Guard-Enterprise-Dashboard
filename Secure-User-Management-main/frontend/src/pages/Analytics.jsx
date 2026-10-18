import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Users, Activity, FolderKanban, ListTodo, MessageSquare, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { analyticsApi, getApiErrorMessage } from '../services/api';

const defaultChartData = [
  { name: 'Mon', visits: 40, actions: 24 },
  { name: 'Tue', visits: 55, actions: 39 },
  { name: 'Wed', visits: 70, actions: 98 },
  { name: 'Thu', visits: 62, actions: 50 },
  { name: 'Fri', visits: 85, actions: 78 },
  { name: 'Sat', visits: 45, actions: 38 },
  { name: 'Sun', visits: 90, actions: 82 },
];

const Analytics = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalTasks: 0,
    totalTickets: 0,
    totalAppointments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    analyticsApi.getOverview()
      .then(({ data }) => {
        if (!active) return;
        setMetrics({
          totalUsers: data.totalUsers || 0,
          totalProjects: data.totalProjects || 0,
          totalTasks: data.totalTasks || 0,
          totalTickets: data.totalTickets || 0,
          totalAppointments: data.totalAppointments || 0,
        });
        setError('');
      })
      .catch((err) => {
        if (!active) return;
        setError(getApiErrorMessage(err, 'Unable to load real-time analytics.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const statCards = [
    { title: 'Registered Users', value: metrics.totalUsers, icon: <Users className="h-6 w-6 text-blue-500" />, trend: 'Live Database', color: 'from-blue-500/10' },
    { title: 'Active Projects', value: metrics.totalProjects, icon: <FolderKanban className="h-6 w-6 text-emerald-500" />, trend: 'Enterprise Portfolios', color: 'from-emerald-500/10' },
    { title: 'Workflow Tasks', value: metrics.totalTasks, icon: <ListTodo className="h-6 w-6 text-purple-500" />, trend: 'Active Kanban Board', color: 'from-purple-500/10' },
    { title: 'Support Tickets', value: metrics.totalTickets, icon: <MessageSquare className="h-6 w-6 text-amber-500" />, trend: 'Customer Requests', color: 'from-amber-500/10' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen text-slate-900 dark:text-slate-200 transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
          <BarChart2 className="mr-3 h-8 w-8 text-primary-600 dark:text-primary-400" />
          Analytics & Usage
        </h1>
        <p className="mt-2 text-slate-800 dark:text-charcoal-300">Real-time system telemetry, active workspace resources, and platform engagement.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#15151a] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${stat.color} to-transparent rounded-full blur-2xl group-hover:scale-125 transition-transform`}></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                  {loading ? '...' : stat.value}
                </h3>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-base-900 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
                {stat.icon}
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5 mr-1" /> {stat.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#15151a] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Weekly Telemetry Activity</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={defaultChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                <XAxis dataKey="name" stroke="#7a8296" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#7a8296" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e212b', border: '1px solid #ffffff1a', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="visits" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#15151a] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">User Operations Frequency</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={defaultChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                <XAxis dataKey="name" stroke="#7a8296" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#7a8296" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e212b', border: '1px solid #ffffff1a', borderRadius: '12px', color: '#fff' }} cursor={{ fill: '#ffffff0a' }} />
                <Bar dataKey="actions" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
