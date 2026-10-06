import React from 'react';
import { BarChart2, TrendingUp, Users, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const data = [
  { name: 'Mon', visits: 4000, actions: 2400 },
  { name: 'Tue', visits: 3000, actions: 1398 },
  { name: 'Wed', visits: 2000, actions: 9800 },
  { name: 'Thu', visits: 2780, actions: 3908 },
  { name: 'Fri', visits: 1890, actions: 4800 },
  { name: 'Sat', visits: 2390, actions: 3800 },
  { name: 'Sun', visits: 3490, actions: 4300 },
];

const Analytics = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen text-slate-900 dark:text-slate-200 transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
          <BarChart2 className="mr-3 h-8 w-8 text-primary-600 dark:text-primary-400" />
          Analytics & Usage
        </h1>
        <p className="mt-2 text-slate-800 dark:text-charcoal-300">Monitor your account activity and platform engagement.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Total Logins', value: '1,284', icon: <Activity className="h-6 w-6 text-emerald-500" />, trend: '+12.5%' },
          { title: 'Active Sessions', value: '4', icon: <Users className="h-6 w-6 text-blue-500" />, trend: 'Stable' },
          { title: 'Engagement Score', value: '94/100', icon: <TrendingUp className="h-6 w-6 text-primary-500" />, trend: '+5.2%' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#15151a]  border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl group-hover:bg-primary-500/20 transition-all"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-charcoal-300 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
              </div>
              <div className="p-3 bg-white dark:bg-charcoal-800 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
                {stat.icon}
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4 mr-1" /> {stat.trend} this week
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#15151a]  border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Weekly Activity</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                <XAxis dataKey="name" stroke="#7a8296" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#7a8296" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e212b', border: '1px solid #ffffff1a', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="visits" stroke="#da5b7e" strokeWidth={3} dot={{ r: 4, fill: '#da5b7e', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#15151a]  border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Interactions Over Time</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                <XAxis dataKey="name" stroke="#7a8296" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#7a8296" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e212b', border: '1px solid #ffffff1a', borderRadius: '12px', color: '#fff' }} cursor={{ fill: '#ffffff0a' }} />
                <Bar dataKey="actions" fill="#6e7fd4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

