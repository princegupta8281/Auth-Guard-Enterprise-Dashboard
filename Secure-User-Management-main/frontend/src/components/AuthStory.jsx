import React from 'react';
import { Check, LockKeyhole, ShieldCheck } from 'lucide-react';

const AuthStory = () => (
  <aside className="auth-story">
    <div className="story-topline">
      <span className="story-index">01 <i /> PRIVATE BY DESIGN</span>
      <span className="story-orbit" aria-hidden="true">S<span>·</span></span>
    </div>
    <div className="story-content">
      <p className="story-eyebrow">A clearer view of your work</p>
      <h2>Good work<br />deserves <em>peace of mind.</em></h2>
      <p className="story-copy">One thoughtful space for your people, projects, and the details that matter.</p>

      <div className="story-preview" aria-label="Secure workspace preview">
        <div className="preview-top">
          <div className="preview-brand"><span /> YOUR WORKSPACE</div>
          <span className="preview-secure"><LockKeyhole size={11} /> PRIVATE</span>
        </div>
        <div className="preview-greeting">A good day to get things done.</div>
        <div className="preview-line"><span className="preview-line-icon"><Check size={13} /></span><span><b>Identity protected</b><small>Your account is secured</small></span><span className="preview-line-status">ACTIVE</span></div>
        <div className="preview-line"><span className="preview-line-icon preview-line-violet">↗</span><span><b>Your space, in sync</b><small>Everything in its right place</small></span><span className="preview-spark" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></span></div>
        <div className="preview-bottom"><span>SECURE SIGN-IN</span><span>SECUREPRO <span aria-hidden="true">✳</span></span></div>
      </div>

      <div className="story-assurance">
        <span className="assurance-icon"><ShieldCheck size={17} /></span>
        <span><strong>Security that stays out of your way.</strong><small>Thoughtful protection, built into every sign-in.</small></span>
      </div>
    </div>
    <div className="story-footer"><span>BUILT FOR PEOPLE DOING THEIR BEST WORK</span><span>EST. 2024 <i /> EVERYWHERE</span></div>
  </aside>
);

export default AuthStory;
