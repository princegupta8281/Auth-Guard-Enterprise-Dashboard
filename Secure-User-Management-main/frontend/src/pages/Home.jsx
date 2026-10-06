import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Fingerprint,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="hero-grain" aria-hidden="true" />
        <div className="landing-nav">
          <Link className="auth-brand landing-brand" to="/" aria-label="SecurePro home">
            <span className="brand-symbol"><ShieldCheck size={19} strokeWidth={2.2} /></span>
            <span className="brand-wordmark">secure<span>pro</span></span>
          </Link>
          <nav aria-label="Main menu" className="landing-nav-links">
            <a href="#approach">Our approach</a>
            <a href="#capabilities">Capabilities</a>
          </nav>
          <div className="landing-nav-actions">
            {user ? (
              <Link className="landing-nav-login" to="/dashboard">Open workspace <ArrowUpRight size={15} /></Link>
            ) : (
              <>
                <Link className="landing-nav-login" to="/login">Sign in</Link>
                <Link className="landing-nav-cta" to="/register">Get started <ArrowRight size={15} /></Link>
              </>
            )}
          </div>
        </div>

        <div className="hero-layout">
          <div className="hero-copy">
            <div className="landing-eyebrow"><span className="eyebrow-star">✳</span> PEOPLE FIRST. PRIVATE ALWAYS.</div>
            <h1>Make room for<br />your <em>best work.</em></h1>
            <p className="hero-description">A more considered way to manage your people, appointments, and everyday work—held together by security you don’t have to think about.</p>
            <div className="hero-actions">
              {user ? (
                <Link to="/dashboard" className="hero-primary">Go to your workspace <ArrowRight size={17} /></Link>
              ) : (
                <>
                  <Link to="/register" className="hero-primary">Create your workspace <ArrowRight size={17} /></Link>
                  <Link to="/login" className="hero-secondary">I already have an account</Link>
                </>
              )}
            </div>
            <div className="hero-proof"><span className="proof-avatars"><i>✳</i></span><span>One thoughtful space. Yours from day one.</span></div>
          </div>

          <div className="hero-art" aria-label="Illustration of a secure workspace">
            <div className="art-orbit art-orbit-one" />
            <div className="art-orbit art-orbit-two" />
            <span className="art-asterisk" aria-hidden="true">✳</span>
            <div className="workspace-card">
              <div className="workspace-card-head">
                <div><span className="workspace-card-kicker">YOUR PERSONAL WORKSPACE</span><strong>A little more in sync.</strong></div>
                <span className="workspace-card-menu">···</span>
              </div>
              <div className="workspace-card-status"><span><ShieldCheck size={15} /> PROTECTED SIGN-IN</span><span className="status-live-dot" /></div>
              <div className="workspace-card-row">
                <span className="card-icon icon-lime"><UsersRound size={17} /></span>
                <span><b>Your people</b><small>A home for the important details</small></span>
                <ArrowUpRight size={15} className="row-arrow" />
              </div>
              <div className="workspace-card-row">
                <span className="card-icon icon-peach"><CalendarDays size={17} /></span>
                <span><b>Your time</b><small>Appointments, without the back-and-forth</small></span>
                <ArrowUpRight size={15} className="row-arrow" />
              </div>
              <div className="workspace-card-row">
                <span className="card-icon icon-lavender"><Fingerprint size={17} /></span>
                <span><b>Your peace of mind</b><small>Private by design, every day</small></span>
                <span className="row-check"><Check size={12} /></span>
              </div>
              <div className="workspace-card-foot"><span><LockKeyhole size={11} /> BUILT AROUND YOUR ACCOUNT</span><span>MADE FOR YOUR WORK <Sparkles size={11} /></span></div>
            </div>
            <div className="floating-note note-top"><span className="note-check"><Check size={13} /></span><span><b>All yours.</b><small>Always protected.</small></span></div>
            <div className="floating-note note-bottom"><span className="note-lock"><LockKeyhole size={15} /></span><span><b>Private by design</b><small>Not an afterthought.</small></span><ArrowDownRight size={15} className="note-arrow" /></div>
            <span className="art-caption">A workspace that feels like yours. <span>01 / 03</span></span>
          </div>
        </div>
        <div className="hero-bottomline"><span>DESIGNED WITH INTENTION <i /> BUILT TO KEEP YOUR WORK YOURS</span><a href="#approach">A closer look <ArrowDownRight size={14} /></a></div>
      </section>

      <section className="landing-manifesto" id="approach">
        <div className="manifesto-index"><span>01</span><i /> THE THOUGHT BEHIND IT</div>
        <div className="manifesto-content">
          <h2>Less managing the tools.<br /><em>More room for the people.</em></h2>
          <p>Good software doesn’t ask for your attention. It gives some back. SecurePro brings the everyday pieces of your workspace into one considered place, with care for the people and information inside it.</p>
          <Link to={user ? '/dashboard' : '/register'} className="text-link">{user ? 'Return to your workspace' : 'Find your footing'} <ArrowRight size={15} /></Link>
        </div>
        <div className="manifesto-mark" aria-hidden="true">S<span>✳</span></div>
      </section>

      <section className="capabilities" id="capabilities">
        <div className="capabilities-head">
          <div><div className="landing-eyebrow"><span className="eyebrow-star">✳</span> THE DETAILS, SORTED</div><h2>Everything has<br />its <em>right place.</em></h2></div>
          <p>Thoughtful tools for the parts of work that deserve a little more care.</p>
        </div>
        <div className="capability-grid">
          <article className="capability-card capability-card-featured">
            <span className="capability-number">01 / PEOPLE</span>
            <span className="capability-icon"><UsersRound size={20} /></span>
            <h3>People, not records.</h3>
            <p>Profiles, permissions, and the details that help your team work well together—kept in one secure place.</p>
            <Link to={user ? '/profile' : '/register'} aria-label="Explore people management"><ArrowUpRight size={18} /></Link>
            <div className="capability-decoration" aria-hidden="true"><span /><span /><span /></div>
          </article>
          <article className="capability-card">
            <span className="capability-number">02 / SECURITY</span>
            <span className="capability-icon capability-icon-peach"><ShieldCheck size={20} /></span>
            <h3>Quietly secure.</h3>
            <p>Verification, multi-factor authentication, and a clear audit trail. Protection woven into the everyday.</p>
            <Link to={user ? '/settings' : '/login'} aria-label="Explore account security"><ArrowUpRight size={18} /></Link>
          </article>
          <article className="capability-card">
            <span className="capability-number">03 / YOUR TIME</span>
            <span className="capability-icon capability-icon-lavender"><CalendarDays size={20} /></span>
            <h3>Time, well kept.</h3>
            <p>Keep appointments and conversations close, so the small logistics never take over the big picture.</p>
            <Link to={user ? '/appointments' : '/register'} aria-label="Explore appointment management"><ArrowUpRight size={18} /></Link>
          </article>
        </div>
      </section>

      <section className="landing-closing">
        <div className="closing-mark" aria-hidden="true">✳</div>
        <p>A GOOD PLACE TO BEGIN</p>
        <h2>Let’s make work<br /><em>a little more yours.</em></h2>
        <Link to={user ? '/dashboard' : '/register'} className="hero-primary">{user ? 'Open your workspace' : 'Create your workspace'} <ArrowRight size={16} /></Link>
        <div className="closing-foot"><span>SECUREPRO <span aria-hidden="true">✳</span></span><span>MADE WITH CARE. HELD WITH CARE.</span></div>
      </section>
    </div>
  );
};

export default Home;
