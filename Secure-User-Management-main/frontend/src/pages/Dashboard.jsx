import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CircleHelp,
  Clock3,
  Fingerprint,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { appointmentsApi, getApiErrorMessage, ticketsApi } from '../services/api';

const formatDate = (value) => {
  if (!value) return 'Date to be confirmed';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date to be confirmed';
  return new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
};

const getAppointmentTimestamp = (value) => {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
};

const getAppointmentCalendarLabel = (value, options) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat('en', options).format(date);
};

const DASHBOARD_NOW = new Date();
const DASHBOARD_DATE_LABEL = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(DASHBOARD_NOW);
const GREETING = DASHBOARD_NOW.getHours() < 12 ? 'Good morning' : DASHBOARD_NOW.getHours() < 18 ? 'Good afternoon' : 'Good evening';

const Dashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [ticketsError, setTicketsError] = useState('');
  const [appointmentsRetry, setAppointmentsRetry] = useState(0);
  const [ticketsRetry, setTicketsRetry] = useState(0);
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'there';

  useEffect(() => {
    let active = true;
    appointmentsApi.listForUser(user.id).then((response) => {
      if (!Array.isArray(response.data)) throw new Error('The appointments response was not a list.');
      if (!active) return;
      setAppointments(response.data);
      setAppointmentsError('');
      setAppointmentsLoading(false);
    }).catch((error) => {
      if (!active) return;
      setAppointmentsError(getApiErrorMessage(error, 'Your appointments could not be loaded.'));
      setAppointmentsLoading(false);
    });
    return () => { active = false; };
  }, [user.id, appointmentsRetry]);

  useEffect(() => {
    let active = true;
    ticketsApi.getUserTickets().then((response) => {
      if (!Array.isArray(response.data)) throw new Error('The support response was not a list.');
      if (!active) return;
      setTickets(response.data);
      setTicketsError('');
      setTicketsLoading(false);
    }).catch((error) => {
      if (!active) return;
      setTicketsError(getApiErrorMessage(error, 'Your support requests could not be loaded.'));
      setTicketsLoading(false);
    });
    return () => { active = false; };
  }, [ticketsRetry]);

  const upcomingAppointments = useMemo(
    () => [...appointments]
      .filter((appointment) => {
        const timestamp = getAppointmentTimestamp(appointment.appointmentDate);
        return timestamp !== null && timestamp >= DASHBOARD_NOW.getTime()
          && !['REJECTED', 'CANCELLED'].includes(appointment.status);
      })
      .sort((a, b) => getAppointmentTimestamp(a.appointmentDate) - getAppointmentTimestamp(b.appointmentDate))
      .slice(0, 3),
    [appointments],
  );
  const openTickets = useMemo(
    () => tickets.filter((ticket) => !['CLOSED', 'RESOLVED'].includes(ticket.status)).length,
    [tickets],
  );
  const pendingAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.status === 'PENDING').length,
    [appointments],
  );

  return (
    <div className="dashboard-page">
      <div className="dash-overline"><span className="dash-overline-mark">✳</span> YOUR PERSONAL WORKSPACE <span className="dash-overline-line" /></div>
      <section className="dash-welcome">
        <div>
          <p className="dash-date">{DASHBOARD_DATE_LABEL}</p>
          <h1>{GREETING}, <em>{firstName}.</em></h1>
          <p className="dash-welcome-copy">A little space to take stock, and get on with what matters.</p>
        </div>
        <Link className="dash-profile-link" to="/profile">
          <span className="dash-profile-avatar">{user?.name?.trim()?.charAt(0)?.toUpperCase() || 'U'}</span>
          <span><small>YOUR ACCOUNT</small><strong>{user?.role === 'ADMIN' ? 'Administrator' : 'Personal workspace'}</strong></span>
          <ArrowUpRight size={16} />
        </Link>
      </section>

      <section className="dash-security-banner">
        <div className="security-banner-icon"><ShieldCheck size={20} /></div>
        <div className="security-banner-copy"><strong>Your account is in good hands.</strong><span>You’re signed in to your personal workspace.</span></div>
        <span className="security-banner-status"><i /> PROTECTED</span>
        <Link to="/settings" aria-label="Review your security settings"><ArrowUpRight size={17} /></Link>
      </section>

      <div className="dash-metrics">
        <article className="dash-metric-card">
          <div className="metric-card-head"><span className="metric-icon metric-icon-lime"><CalendarDays size={18} /></span><span className="metric-card-label">IN YOUR CALENDAR</span></div>
          {appointmentsLoading ? <span className="metric-value metric-loading" aria-label="Loading appointments" /> : <strong className="metric-value">{appointmentsError ? '—' : appointments.length.toString().padStart(2, '0')}</strong>}
          <span className="metric-foot">{appointmentsError ? 'Could not load appointments' : `${pendingAppointments} awaiting confirmation`}</span>
          <Link to="/appointments">Open calendar <ArrowRight size={13} /></Link>
        </article>
        <article className="dash-metric-card">
          <div className="metric-card-head"><span className="metric-icon metric-icon-peach"><CircleHelp size={18} /></span><span className="metric-card-label">HERE TO HELP</span></div>
          {ticketsLoading ? <span className="metric-value metric-loading" aria-label="Loading support requests" /> : <strong className="metric-value">{ticketsError ? '—' : openTickets.toString().padStart(2, '0')}</strong>}
          <span className="metric-foot">{ticketsError ? 'Could not load support requests' : 'Open support requests'}</span>
          <Link to="/tickets">Visit support <ArrowRight size={13} /></Link>
        </article>
        <article className="dash-metric-card dash-metric-feature">
          <div className="feature-dots" aria-hidden="true"><i /><i /><i /></div>
          <span className="metric-card-label">THE LITTLE THINGS</span>
          <strong className="feature-title">One less thing<br />to worry about.</strong>
          <span className="feature-copy">Your profile and preferences, just the way you left them.</span>
          <Link to="/profile">Take a look <ArrowRight size={13} /></Link>
        </article>
      </div>

      <div className="dash-section-heading">
        <div><span className="section-kicker">YOUR WEEK, AT A GLANCE</span><h2>The things on your mind.</h2></div>
        <span className="section-spark">A little clarity goes a long way <Sparkles size={14} /></span>
      </div>

      <div className="dash-content-grid">
        <section className="dash-list-card">
          <div className="list-card-heading">
            <div><span className="list-card-icon list-card-icon-lime"><CalendarDays size={17} /></span><span><strong>Coming up</strong><small>Your appointments</small></span></div>
            <Link to="/appointments" aria-label="View all appointments"><ArrowUpRight size={17} /></Link>
          </div>
          {appointmentsLoading ? (
            <div className="dash-loading-list"><span /><span /><span /></div>
          ) : appointmentsError ? (
            <div className="dash-empty-state dash-load-error"><p>{appointmentsError}</p><button type="button" onClick={() => { setAppointmentsLoading(true); setAppointmentsError(''); setAppointmentsRetry((retry) => retry + 1); }}><RefreshCw size={14} /> Try again</button></div>
          ) : upcomingAppointments.length ? (
            <div className="dash-appointment-list">
              {upcomingAppointments.map((appointment) => {
                const dateLabel = getAppointmentCalendarLabel(appointment.appointmentDate, { day: '2-digit' });
                const monthLabel = getAppointmentCalendarLabel(appointment.appointmentDate, { month: 'short' });
                return (
                  <article className="dash-appointment-row" key={appointment.id}>
                    <span className="appointment-date-block"><strong>{dateLabel || '—'}</strong><small>{monthLabel?.toUpperCase() || 'TBD'}</small></span>
                    <span className="appointment-detail"><strong>{appointment.doctorName || 'Appointment'}</strong><small><Clock3 size={12} /> {formatDate(appointment.appointmentDate)}</small></span>
                    <span className={`appointment-status status-${(appointment.status || 'pending').toLowerCase()}`}>{appointment.status || 'PENDING'}</span>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="dash-empty-state"><span className="empty-state-icon"><CalendarDays size={19} /></span><strong>A little room in your calendar.</strong><p>Your upcoming appointments will find a home here.</p><Link to="/appointments">Plan a visit <ArrowRight size={14} /></Link></div>
          )}
          <Link className="list-card-footer" to="/appointments">Go to appointments <ArrowRight size={14} /></Link>
        </section>

        <section className="dash-list-card">
          <div className="list-card-heading">
            <div><span className="list-card-icon list-card-icon-peach"><Fingerprint size={17} /></span><span><strong>Your support</strong><small>A friendly hand, when needed</small></span></div>
            <Link to="/tickets" aria-label="View support requests"><ArrowUpRight size={17} /></Link>
          </div>
          {ticketsLoading ? (
            <div className="dash-loading-list"><span /><span /><span /></div>
          ) : ticketsError ? (
            <div className="dash-empty-state dash-load-error"><p>{ticketsError}</p><button type="button" onClick={() => { setTicketsLoading(true); setTicketsError(''); setTicketsRetry((retry) => retry + 1); }}><RefreshCw size={14} /> Try again</button></div>
          ) : tickets.length ? (
            <div className="dash-ticket-list">
              {tickets.slice(0, 3).map((ticket) => (
                <Link to="/tickets" className="dash-ticket-row" key={ticket.id}>
                  <span className={`ticket-priority-dot priority-${(ticket.priority || 'low').toLowerCase()}`} />
                  <span className="ticket-detail"><strong>{ticket.title}</strong><small>Request #{ticket.id} <i /> {ticket.status?.replaceAll('_', ' ') || 'OPEN'}</small></span>
                  <ArrowUpRight size={15} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="dash-empty-state"><span className="empty-state-icon"><Check size={19} /></span><strong>Nothing waiting on you.</strong><p>If you need us, we’re only a note away.</p><Link to="/tickets">Visit support <ArrowRight size={14} /></Link></div>
          )}
          <Link className="list-card-footer" to="/tickets">Visit the helpdesk <ArrowRight size={14} /></Link>
        </section>
      </div>

      <div className="dash-closing-note"><Fingerprint size={15} /><span>A private place for your work. <strong>Always.</strong></span><span className="closing-note-right">MADE WITH CARE <span>✳</span></span></div>
    </div>
  );
};

export default Dashboard;
