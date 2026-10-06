import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Plus, Info, CheckCircle, UserRound } from 'lucide-react';
import { appointmentsApi, getApiErrorMessage } from '../services/api';

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    doctorName: '',
    appointmentDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentsApi.listForUser(user.id);
      setAppointments(res.data);
      setError('');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Appointments could not be loaded.'));
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusColor = (status) => {
    if (status === 'PENDING') return 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20';
    if (status === 'APPROVED') return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
    if (status === 'REJECTED' || status === 'CANCELLED') return 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20';
    return 'bg-slate-200 dark:bg-charcoal-700 text-slate-800 dark:text-charcoal-400 border-slate-300 dark:border-charcoal-600';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen text-slate-900 dark:text-slate-200 transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center">
          <Calendar className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
          My Appointments
        </h1>
        <p className="mt-2 text-slate-800 dark:text-charcoal-300">Schedule and manage your meetings with the administration.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Book Appointment Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#15151a]  rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 p-6 relative overflow-hidden">
            
            {/* Ambient Background Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-400/20 rounded-full blur-3xl pointer-events-none"></div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center relative z-10">
              <Plus className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
              Book New Meeting
            </h2>
            
            {message && (
              <div className={`mb-6 p-4 rounded-xl text-sm font-medium border relative z-10 ${message.includes('successfully') ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20'}`}>
                {message}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-charcoal-200 mb-2">Representative Name</label>
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    name="doctorName"
                    required
                    value={formData.doctorName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white placeholder-slate-400 dark:placeholder-charcoal-400"
                    placeholder="e.g. Dr. Smith or Admin"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-charcoal-200 mb-2">Date & Time</label>
                <input
                  type="datetime-local"
                  name="appointmentDate"
                  required
                  value={formData.appointmentDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-3 px-4 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-500 dark:bg-primary-500 dark:hover:bg-primary-400 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Booking...
                  </>
                ) : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
        
        {/* Appointments List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#15151a]  rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden h-full flex flex-col">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-charcoal-800/30">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upcoming & Past Appointments</h2>
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
                  <p className="text-lg font-medium">You haven't booked any appointments yet.</p>
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
                        <div>
                          <span className={`px-4 py-1.5 inline-flex text-sm font-bold rounded-full border ${getStatusColor(apt.status || 'PENDING')}`}>
                            {apt.status || 'PENDING'}
                          </span>
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
