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
  FolderKanban,
  ListTodo
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { appointmentsApi, getApiErrorMessage, ticketsApi, projectsApi, tasksApi } from '../services/api';

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
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);

  const [appointmentsError, setAppointmentsError] = useState('');
  const [ticketsError, setTicketsError] = useState('');
  const [projectsError, setProjectsError] = useState('');
  const [tasksError, setTasksError] = useState('');

  const [retry, setRetry] = useState(0);
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'there';

  useEffect(() => {
    let active = true;
    
    // Fetch Appointments
    appointmentsApi.listForUser(user.id).then((response) => {
      if (!active) return;
      setAppointments(Array.isArray(response.data) ? response.data : []);
      setAppointmentsError('');
    }).catch((error) => {
      if (!active) return;
      setAppointmentsError('Could not load appointments.');
    }).finally(() => active && setAppointmentsLoading(false));

    // Fetch Tickets
    ticketsApi.getUserTickets().then((response) => {
      if (!active) return;
      setTickets(Array.isArray(response.data) ? response.data : []);
      setTicketsError('');
    }).catch((error) => {
      if (!active) return;
      setTicketsError('Could not load support requests.');
    }).finally(() => active && setTicketsLoading(false));

    // Fetch Projects
    projectsApi.list().then((response) => {
      if (!active) return;
      setProjects(Array.isArray(response.data) ? response.data : []);
      setProjectsError('');
    }).catch((error) => {
      if (!active) return;
      setProjectsError('Could not load projects.');
    }).finally(() => active && setProjectsLoading(false));

    // Fetch Tasks
    tasksApi.list().then((response) => {
      if (!active) return;
      setTasks(Array.isArray(response.data) ? response.data : []);
      setTasksError('');
    }).catch((error) => {
      if (!active) return;
      setTasksError('Could not load tasks.');
    }).finally(() => active && setTasksLoading(false));

    return () => { active = false; };
  }, [user.id, retry]);

  const upcomingAppointments = useMemo(
    () => [...appointments]
      .filter((a) => getAppointmentTimestamp(a.appointmentDate) !== null && getAppointmentTimestamp(a.appointmentDate) >= DASHBOARD_NOW.getTime() && !['REJECTED', 'CANCELLED'].includes(a.status))
      .sort((a, b) => getAppointmentTimestamp(a.appointmentDate) - getAppointmentTimestamp(b.appointmentDate))
      .slice(0, 3),
    [appointments],
  );
  
  const openTickets = useMemo(() => tickets.filter((t) => !['CLOSED', 'RESOLVED'].includes(t.status)).length, [tickets]);
  const pendingAppointments = useMemo(() => appointments.filter((a) => a.status === 'PENDING').length, [appointments]);
  const activeProjects = useMemo(() => projects.filter((p) => !['COMPLETED'].includes(p.status)).length, [projects]);
  const activeTasks = useMemo(() => tasks.filter((t) => !['done'].includes(t.columnId)).length, [tasks]);

  return (
    <div className="dashboard-page">
      <div className="dash-overline"><span className="dash-overline-mark">✳</span> ENTERPRISE COMMAND CENTER <span className="dash-overline-line" /></div>
      <section className="dash-welcome">
        <div>
          <p className="dash-date">{DASHBOARD_DATE_LABEL}</p>
          <h1>{GREETING}, <em>{firstName}.</em></h1>
          <p className="dash-welcome-copy">A comprehensive view of your active projects, tasks, and schedule.</p>
        </div>
        <Link className="dash-profile-link" to="/profile">
          <span className="dash-profile-avatar">{user?.name?.trim()?.charAt(0)?.toUpperCase() || 'U'}</span>
          <span><small>YOUR ACCOUNT</small><strong>{user?.role === 'ADMIN' ? 'Administrator' : 'Workspace Member'}</strong></span>
          <ArrowUpRight size={16} />
        </Link>
      </section>

      <section className="dash-security-banner">
        <div className="security-banner-icon"><ShieldCheck size={20} /></div>
        <div className="security-banner-copy"><strong>Enterprise-grade security is active.</strong><span>You’re signed in to your secured environment.</span></div>
        <span className="security-banner-status"><i /> PROTECTED</span>
        <Link to="/settings" aria-label="Review your security settings"><ArrowUpRight size={17} /></Link>
      </section>

      <div className="dash-metrics" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <article className="dash-metric-card">
          <div className="metric-card-head"><span className="metric-icon metric-icon-lime"><FolderKanban size={18} /></span><span className="metric-card-label">ACTIVE PROJECTS</span></div>
          {projectsLoading ? <span className="metric-value metric-loading" /> : <strong className="metric-value">{projectsError ? '—' : activeProjects.toString().padStart(2, '0')}</strong>}
          <span className="metric-foot">{projectsError ? 'Could not load projects' : 'Projects currently in progress'}</span>
          <Link to="/projects">View projects <ArrowRight size={13} /></Link>
        </article>
        
        <article className="dash-metric-card">
          <div className="metric-card-head"><span className="metric-icon metric-icon-peach"><ListTodo size={18} /></span><span className="metric-card-label">PENDING TASKS</span></div>
          {tasksLoading ? <span className="metric-value metric-loading" /> : <strong className="metric-value">{tasksError ? '—' : activeTasks.toString().padStart(2, '0')}</strong>}
          <span className="metric-foot">{tasksError ? 'Could not load tasks' : 'Tasks awaiting completion'}</span>
          <Link to="/tasks">View tasks <ArrowRight size={13} /></Link>
        </article>

        <article className="dash-metric-card">
          <div className="metric-card-head"><span className="metric-icon metric-icon-lavender"><CalendarDays size={18} /></span><span className="metric-card-label">UPCOMING</span></div>
          {appointmentsLoading ? <span className="metric-value metric-loading" /> : <strong className="metric-value">{appointmentsError ? '—' : appointments.length.toString().padStart(2, '0')}</strong>}
          <span className="metric-foot">{appointmentsError ? 'Could not load appointments' : `${pendingAppointments} awaiting confirmation`}</span>
          <Link to="/appointments">Open calendar <ArrowRight size={13} /></Link>
        </article>

        <article className="dash-metric-card dash-metric-feature">
          <div className="feature-dots" aria-hidden="true"><i /><i /><i /></div>
          <span className="metric-card-label">SUPPORT TEAM</span>
          <strong className="feature-title">We've got your<br />back.</strong>
          <span className="feature-copy">Access the enterprise IT helpdesk instantly.</span>
          <Link to="/tickets">Visit support <ArrowRight size={13} /></Link>
        </article>
      </div>

      <div className="dash-section-heading">
        <div><span className="section-kicker">MISSION CONTROL</span><h2>Your Activity Overview</h2></div>
        <button type="button" onClick={() => setRetry(r => r + 1)} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"><RefreshCw size={12} /> Refresh Data</button>
      </div>

      <div className="dash-content-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        
        {/* Projects Card */}
        <section className="dash-list-card">
          <div className="list-card-heading">
            <div><span className="list-card-icon list-card-icon-lime"><FolderKanban size={17} /></span><span><strong>Recent Projects</strong><small>High-priority initiatives</small></span></div>
            <Link to="/projects"><ArrowUpRight size={17} /></Link>
          </div>
          {projectsLoading ? <div className="dash-loading-list"><span /><span /><span /></div> : projectsError ? <div className="dash-empty-state dash-load-error"><p>{projectsError}</p></div> : projects.length ? (
            <div className="dash-ticket-list">
              {projects.slice(0, 3).map((project) => (
                <Link to="/projects" className="dash-ticket-row" key={project.id}>
                  <span className={`ticket-priority-dot priority-high`} />
                  <span className="ticket-detail"><strong>{project.name}</strong><small>{project.status.replaceAll('_', ' ')} <i /> Due: {project.dueDate || 'TBD'}</small></span>
                  <ArrowUpRight size={15} />
                </Link>
              ))}
            </div>
          ) : <div className="dash-empty-state"><span className="empty-state-icon"><FolderKanban size={19} /></span><strong>No active projects.</strong><Link to="/projects">Create one <ArrowRight size={14} /></Link></div>}
          <Link className="list-card-footer" to="/projects">View all projects <ArrowRight size={14} /></Link>
        </section>

        {/* Appointments Card */}
        <section className="dash-list-card">
          <div className="list-card-heading">
            <div><span className="list-card-icon list-card-icon-peach"><CalendarDays size={17} /></span><span><strong>Coming up</strong><small>Your appointments</small></span></div>
            <Link to="/appointments"><ArrowUpRight size={17} /></Link>
          </div>
          {appointmentsLoading ? <div className="dash-loading-list"><span /><span /><span /></div> : appointmentsError ? <div className="dash-empty-state dash-load-error"><p>{appointmentsError}</p></div> : upcomingAppointments.length ? (
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
          ) : <div className="dash-empty-state"><span className="empty-state-icon"><CalendarDays size={19} /></span><strong>A little room in your calendar.</strong><Link to="/appointments">Plan a visit <ArrowRight size={14} /></Link></div>}
          <Link className="list-card-footer" to="/appointments">Go to appointments <ArrowRight size={14} /></Link>
        </section>
      </div>

      <div className="dash-closing-note"><Fingerprint size={15} /><span>A private place for your work. <strong>Always.</strong></span><span className="closing-note-right">ENTERPRISE EDITION <span>✳</span></span></div>
    </div>
  );
};

export default Dashboard;
