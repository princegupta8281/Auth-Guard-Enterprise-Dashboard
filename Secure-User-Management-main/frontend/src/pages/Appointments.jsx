import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Plus, Info, CheckCircle, UserRound, X, Check, AlertCircle } from 'lucide-react';
import { appointmentsApi, getApiErrorMessage } from '../services/api';

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewAll, setViewAll] = useState(false);
  const [formData, setFormData] = useState({
    doctorName: '',
    appointmentDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (viewAll && user?.role === 'ADMIN') {
        res = await appointmentsApi.listAll();
      } else {
        res = await appointmentsApi.listForUser(user.id);
      }
      setAppointments(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Appointments could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role, viewAll]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    
    try {
      const payload = {
        doctorName: formData.doctorName,
        appointmentDate: formData.appointmentDate,
        status: 'PENDING'
      };
      await appointmentsApi.createForUser(user.id, payload);
      setMessage('Appointment booked successfully!');
      setFormData({ doctorName: '', appointmentDate: '' });
      fetchAppointments();
    } catch (err) {
      setMessage(getApiErrorMessage(err, 'Failed to book appointment.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentsApi.cancel(id);
      setMessage('Appointment cancelled successfully.');
      setTimeout(() => setMessage(''), 3000);
      fetchAppointments();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to cancel appointment.'));
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await appointmentsApi.updateStatus(id, newStatus);
      setMessage(`Appointment marked as ${newStatus}.`);
      setTimeout(() => setMessage(''), 3000);
      fetchAppointments();
    } catch (err) {
      setError(getApiErrorMessage(err, `Failed to update status to ${newStatus}.`));
    }
  };

  const getStatusColor = (status) => {
    if (status === 'PENDING') return 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20';
    if (status === 'APPROVED') return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
    if (status === 'REJECTED' || status === 'CANCELLED') return 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20';
    return 'bg-slate-200 dark:bg-charcoal-700 text-slate-800 dark:text-charcoal-400 border-slate-300 dark:border-charcoal-600';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen text-slate-900 dark:text-slate-200 transition-colors duration-300">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center">
            <Calendar className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
            Appointments
          </h1>
          <p className="mt-2 text-slate-800 dark:text-charcoal-300">Schedule, review, and manage meetings with the administration.</p>
        </div>

        {user?.role === 'ADMIN' && (
          <div className="flex rounded-xl bg-slate-100 dark:bg-base-900 p-1 border border-slate-200 dark:border-white/10">
            <button
              onClick={() => setViewAll(false)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${!viewAll ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}
            >
              My Appointments
            </button>
            <button
              onClick={() => setViewAll(true)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewAll ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}
            >
              All Appointments (Admin)
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Book Appointment Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#15151a] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
              <Plus className="h-5 w-5 mr-2 text-primary-500" />
              Book New Meeting
            </h2>
            
            {message && (
              <div className="mb-6 p-4 rounded-xl bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 text-primary-700 dark:text-primary-300 text-sm font-semibold flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-charcoal-200 mb-2">
                  Specialist / Host Name
                </label>
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    name="doctorName"
                    required
                    value={formData.doctorName}
                    onChange={handleInputChange}
                    placeholder="e.g. Dr. Aris Thorne"
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm dark:text-white transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-charcoal-200 mb-2">
                  Date and Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="datetime-local"
                    name="appointmentDate"
                    required
                    value={formData.appointmentDate}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm dark:text-white transition-all"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-primary-600 hover:bg-primary-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center disabled:opacity-70"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </form>
          </div>
        </div>
        
        {/* Appointments List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#15151a] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden h-full flex flex-col">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-charcoal-800/30">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {viewAll ? 'All Organization Appointments' : 'Your Scheduled Appointments'}
              </h2>
            </div>
            
            <div className="p-0 flex-1 overflow-y-auto">
              {error && (
                <div className="m-6 p-4 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-between">
                  <span>{error}</span>
                  <button type="button" onClick={fetchAppointments} className="font-bold underline hover:text-amber-700 dark:hover:text-amber-300">
                    Try again
                  </button>
                </div>
              )}
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
                </div>
              ) : appointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-800 dark:text-charcoal-400">
                  <Calendar className="h-16 w-16 text-slate-300 dark:text-charcoal-600 mb-4" />
                  <p className="text-lg font-medium">No appointments found.</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-200 dark:divide-white/5">
                  {appointments.map((apt) => (
                    <li key={apt.id} className="p-6 hover:bg-slate-50 dark:hover:bg-charcoal-800/40 transition-colors group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{apt.doctorName}</h3>
                          <div className="flex items-center text-sm font-medium text-slate-800 dark:text-charcoal-300">
                            <Clock className="h-4 w-4 mr-2 text-primary-500" />
                            {apt.appointmentDate}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-4 py-1.5 inline-flex text-xs font-bold rounded-full border ${getStatusColor(apt.status || 'PENDING')}`}>
                            {apt.status || 'PENDING'}
                          </span>

                          {/* Admin Controls */}
                          {user?.role === 'ADMIN' && apt.status === 'PENDING' && (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(apt.id, 'APPROVED')}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                              >
                                <Check size={13} /> Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(apt.id, 'REJECTED')}
                                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                              >
                                <X size={13} /> Reject
                              </button>
                            </div>
                          )}

                          {/* User Cancel Action */}
                          {apt.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => handleCancel(apt.id)}
                              className="px-3 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-base-900 dark:hover:bg-base-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-all"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Appointments;
