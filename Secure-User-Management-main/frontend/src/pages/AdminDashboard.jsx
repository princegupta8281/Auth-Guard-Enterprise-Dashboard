import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Users, Key, Settings, Check, X, ShieldCheck, Search, Trash2, UserCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi, getApiErrorMessage } from '../services/api';

const initialPermissions = [
  'View Users', 'Edit Users', 'Delete Users', 
  'Manage Roles', 'View Audit Logs', 'System Settings', 
  'Manage Billing'
];

const initialRoles = [
  { name: 'Super Admin', color: 'text-primary-500 bg-primary-500/10 border-primary-500/20', icon: <ShieldCheck className="h-5 w-5 text-primary-500" />, perms: [true, true, true, true, true, true, true] },
  { name: 'Manager', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: <Users className="h-5 w-5 text-emerald-500" />, perms: [true, true, false, false, true, false, false] },
  { name: 'Editor', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: <Key className="h-5 w-5 text-amber-500" />, perms: [true, true, false, false, false, false, false] },
  { name: 'Viewer', color: 'text-slate-700 bg-slate-500/10 border-slate-500/20', icon: <Settings className="h-5 w-5 text-slate-700" />, perms: [true, false, false, false, false, false, false] },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('rbac');
  const [roles, setRoles] = useState(initialRoles);
  const [rbacMessage, setRbacMessage] = useState('');

  // User Management state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async (pageNumber = 0, searchQuery = '') => {
    setLoadingUsers(true);
    setUserError('');
    try {
      const { data } = await adminApi.usersPage({
        page: pageNumber,
        size: 10,
        search: searchQuery.trim(),
        sortBy: 'id',
        direction: 'asc'
      });
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 1);
      setPage(pageNumber);
    } catch (err) {
      setUserError(getApiErrorMessage(err, 'Failed to load user directory.'));
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers(0, search);
    }
  }, [activeTab, fetchUsers, search]);

  const handleRoleToggle = (roleIdx, permIdx) => {
    setRoles(prev => {
      const next = [...prev];
      const roleCopy = { ...next[roleIdx], perms: [...next[roleIdx].perms] };
      roleCopy.perms[permIdx] = !roleCopy.perms[permIdx];
      next[roleIdx] = roleCopy;
      return next;
    });
    setRbacMessage('Permission updated successfully.');
    setTimeout(() => setRbacMessage(''), 3000);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminApi.updateUserRole(userId, newRole);
      setUserSuccess(`User role updated to ${newRole}`);
      setTimeout(() => setUserSuccess(''), 3000);
      fetchUsers(page, search);
    } catch (err) {
      setUserError(getApiErrorMessage(err, 'Could not update user role.'));
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) return;
    try {
      await adminApi.deleteUser(userId);
      setUserSuccess(`User "${userName}" was deleted.`);
      setTimeout(() => setUserSuccess(''), 3000);
      fetchUsers(page, search);
    } catch (err) {
      setUserError(getApiErrorMessage(err, 'Could not delete user.'));
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-200">
      
      <div className="mb-10">
        <h1 className="font-display text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Admin Control Center
        </h1>
        <p className="mt-2 text-lg text-slate-800 dark:text-slate-200 font-medium">
          Manage roles, system permissions, and company user accounts.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-white/10 mb-8 pb-4">
        <button 
          onClick={() => setActiveTab('rbac')}
          className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'rbac' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-100 dark:bg-base-900 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-base-800'}`}
        >
          RBAC Matrix
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-100 dark:bg-base-900 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-base-800'}`}
        >
          User Management
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'rbac' ? (
          <motion.div 
            key="rbac"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white dark:bg-[#15151a] border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-bento"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <Shield className="h-6 w-6 text-primary-500" />
                  Role-Based Access Control
                </h2>
                <p className="text-sm text-slate-800 dark:text-slate-200 mt-1">Click any matrix cell to configure granular permissions for that role.</p>
              </div>
              {rbacMessage && (
                <div className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {rbacMessage}
                </div>
              )}
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
                  {initialPermissions.map((perm, i) => (
                    <tr key={perm} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="py-4 px-4 text-sm font-bold text-slate-700 dark:text-slate-100">
                        {perm}
                      </td>
                      {roles.map((r, roleIdx) => (
                        <td key={roleIdx} className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleRoleToggle(roleIdx, i)}
                            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                            title={`Toggle ${perm} for ${r.name}`}
                          >
                            {r.perms[i] ? (
                              <Check className="h-5 w-5 text-emerald-500 mx-auto cursor-pointer" />
                            ) : (
                              <X className="h-5 w-5 text-slate-300 dark:text-slate-700 mx-auto cursor-pointer" />
                            )}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="users"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white dark:bg-[#15151a] border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-bento"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary-500" />
                  User Directory
                </h2>
                <p className="text-sm text-slate-800 dark:text-slate-200 mt-1">Manage all registered accounts, change roles, or remove access.</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-base-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fetchUsers(page, search)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-base-900 transition-colors"
                  title="Refresh users"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingUsers ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {userSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 text-sm font-semibold flex items-center gap-2">
                <Check className="h-4 w-4" /> {userSuccess}
              </div>
            )}

            {userError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/20 text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> {userError}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">Loading user directory...</td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">No users found.</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary-600 to-accent-dark flex items-center justify-center text-white font-bold text-sm shadow-sm">
                              {u.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-300">{u.email}</td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                            <UserCheck className="h-3 w-3" /> Active
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={u.role || 'USER'}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="px-3 py-1 bg-slate-50 dark:bg-base-900 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-bold outline-none cursor-pointer"
                          >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-100 dark:border-white/5">
                <button
                  disabled={page === 0}
                  onClick={() => fetchUsers(page - 1, search)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-white/10 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-base-900 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm font-medium text-slate-500">Page {page + 1} of {totalPages}</span>
                <button
                  disabled={page + 1 >= totalPages}
                  onClick={() => fetchUsers(page + 1, search)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-white/10 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-base-900 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
