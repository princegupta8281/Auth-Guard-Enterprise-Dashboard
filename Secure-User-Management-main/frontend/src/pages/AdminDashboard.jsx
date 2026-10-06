import React, { useState } from 'react';
import { Shield, Users, Key, Settings, Check, X, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const permissions = [
  'View Users', 'Edit Users', 'Delete Users', 
  'Manage Roles', 'View Audit Logs', 'System Settings', 
  'Manage Billing'
];

const roles = [
  { name: 'Super Admin', color: 'text-primary-500 bg-primary-500/10 border-primary-500/20', icon: <ShieldCheck className="h-5 w-5 text-primary-500" />, perms: [true, true, true, true, true, true, true] },
  { name: 'Manager', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: <Users className="h-5 w-5 text-emerald-500" />, perms: [true, true, false, false, true, false, false] },
  { name: 'Editor', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: <Key className="h-5 w-5 text-amber-500" />, perms: [true, true, false, false, false, false, false] },
  { name: 'Viewer', color: 'text-slate-700 bg-slate-500/10 border-slate-500/20', icon: <Settings className="h-5 w-5 text-slate-700" />, perms: [true, false, false, false, false, false, false] },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('rbac');

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-200">
      
      <div className="mb-10">
        <h1 className="font-display text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Admin Control Center
        </h1>
        <p className="mt-2 text-lg text-slate-800 dark:text-slate-200 font-medium">
          Manage roles, permissions, and system configurations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-white/10 mb-8 pb-4">
        <button className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'rbac' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-100 dark:bg-base-900 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-base-800'}`}>
          RBAC Matrix
        </button>
        <button className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-100 dark:bg-base-900 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-base-800'}`}>
          User Management
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#15151a] border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-bento"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary-500" />
              Role-Based Access Control
            </h2>
            <p className="text-sm text-slate-800 dark:text-slate-200 mt-1">Configure granular permissions for each role.</p>
          </div>
          <button className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-md hover:scale-105 transition-transform">
            Add New Role
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10">
                <th className="py-4 px-4 font-bold text-slate-800 dark:text-slate-100 w-1/3">Permissions</th>
                {roles.map(r => (
                  <th key={r.name} className="py-4 px-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      {r.icon}
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${r.color}`}>{r.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {permissions.map((perm, i) => (
                <tr key={perm} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="py-4 px-4 text-sm font-bold text-slate-700 dark:text-slate-100">
                    {perm}
                  </td>
                  {roles.map((r, roleIdx) => (
                    <td key={roleIdx} className="py-4 px-4 text-center">
                      {r.perms[i] ? (
                        <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-slate-300 dark:text-slate-700 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
