import React, { useState } from 'react';
import { Sliders, Bell, Shield, Eye, Moon, Sun, Monitor, Globe, Smartphone, Volume2, Save } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false
  });
  const [language, setLanguage] = useState('en');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen text-slate-900 dark:text-slate-200 transition-colors duration-300">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
            <Sliders className="mr-3 h-8 w-8 text-primary-600 dark:text-primary-400" />
            Application Settings
          </h1>
          <p className="mt-2 text-slate-800 dark:text-charcoal-300">Manage your workspace preferences, appearance, and notifications.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 disabled:opacity-70"
        >
          {saving ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="h-5 w-5" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Appearance Settings */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white dark:bg-[#15151a]  border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent-light/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center relative z-10">
              <Eye className="mr-3 h-5 w-5 text-primary-500" /> Appearance
            </h2>

            <div className="space-y-4 relative z-10">
              <label className="block text-sm font-semibold text-slate-700 dark:text-charcoal-200 mb-3">Theme Preference</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => theme === 'dark' && toggleTheme()}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-slate-200 dark:border-white/10 hover:border-primary-300 bg-white dark:bg-charcoal-800'}`}
                >
                  <Sun className={`h-8 w-8 ${theme === 'light' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`} />
                  <span className="text-sm font-bold">Light</span>
                </button>
                <button
                  onClick={() => theme === 'light' && toggleTheme()}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-slate-200 dark:border-white/10 hover:border-primary-300 bg-white dark:bg-charcoal-800'}`}
                >
                  <Moon className={`h-8 w-8 ${theme === 'dark' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`} />
                  <span className="text-sm font-bold">Dark</span>
                </button>
              </div>
            </div>
            
            <div className="mt-8 space-y-4 relative z-10">
              <label className="block text-sm font-semibold text-slate-700 dark:text-charcoal-200">Language & Region</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white appearance-none"
                >
                  <option value="en">English (US)</option>
                  <option value="hi">Hindi (India)</option>
                  <option value="es">Spanish (ES)</option>
                  <option value="fr">French (FR)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Security */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-[#15151a]  border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
              <Bell className="mr-3 h-5 w-5 text-primary-500" /> Notifications
            </h2>
            
            <div className="space-y-4">
              {[
                { id: 'email', title: 'Email Notifications', desc: 'Receive daily summaries and critical alerts via email.', icon: <Monitor className="h-5 w-5 text-slate-400" /> },
                { id: 'push', title: 'Push Notifications', desc: 'Real-time alerts in your browser when you are online.', icon: <Volume2 className="h-5 w-5 text-slate-400" /> },
                { id: 'sms', title: 'SMS Alerts', desc: 'Important security alerts sent directly to your phone.', icon: <Smartphone className="h-5 w-5 text-slate-400" /> },
              ].map((item) => (
                <div key={item.id} className="flex items-start justify-between p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-charcoal-800/30 hover:bg-slate-100 dark:hover:bg-charcoal-800 transition-colors">
                  <div className="flex gap-4">
                    <div className="mt-1">{item.icon}</div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                      <p className="text-sm text-slate-800 dark:text-charcoal-400 mt-1">{item.desc}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifications[item.id]}
                      onChange={() => setNotifications({ ...notifications, [item.id]: !notifications[item.id] })}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-charcoal-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-charcoal-600 peer-checked:bg-primary-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#15151a]  border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
              <Shield className="mr-3 h-5 w-5 text-emerald-500" /> Privacy & Data
            </h2>
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-400">
              <h4 className="font-bold mb-1 flex items-center">Data Collection</h4>
              <p className="text-sm opacity-90">We collect minimal telemetry to improve your experience. You can opt out at any time. Refer to your profile page for Two-Factor Authentication and password settings.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;

