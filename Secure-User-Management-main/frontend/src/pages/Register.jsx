import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react';
import AuthStory from '../components/AuthStory';
import { useAuth } from '../context/AuthContext';

const COPYRIGHT_YEAR = new Date().getFullYear();

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Those passwords don’t match. Give them another try.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await register(formData.name, formData.email, formData.password);
      if (result.success) setSuccess(true);
      else setError(result.message || 'We couldn’t create your account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-panel-inner">
          <Link className="auth-brand" to="/" aria-label="SecurePro home">
            <span className="brand-symbol"><ShieldCheck size={19} strokeWidth={2.2} /></span>
            <span className="brand-wordmark">secure<span>pro</span></span>
          </Link>
          <div className="auth-form-wrap">
            <div className="auth-kicker"><span /> A SPACE THAT’S YOURS</div>
            {success ? (
              <div className="auth-success" role="status">
                <span className="auth-success-icon"><CheckCircle2 size={23} /></span>
                <h1>You’re in good hands.</h1>
                <p>Your account is on its way. Check your inbox for a verification link, then come back to sign in.</p>
                <Link className="auth-submit auth-success-link" to="/login">Continue to sign in <ArrowRight size={16} /></Link>
              </div>
            ) : (
              <>
                <h1>A good place to start.</h1>
                <p className="auth-intro">Make a little space for your people and the work you care about.</p>
                {error && <div className="auth-error" role="alert"><span>!</span>{error}</div>}
                <form className="auth-form" onSubmit={handleSubmit}>
                  <label className="auth-label" htmlFor="register-name">Your name</label>
                  <div className="auth-input-wrap">
                    <UserRound size={17} aria-hidden="true" />
                    <input id="register-name" name="name" type="text" autoComplete="name" required maxLength={100} placeholder="How should we address you?" value={formData.name} onChange={handleChange} />
                  </div>

                  <label className="auth-label auth-label-spaced" htmlFor="register-email">Email address</label>
                  <div className="auth-input-wrap">
                    <Mail size={17} aria-hidden="true" />
                    <input id="register-email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" value={formData.email} onChange={handleChange} />
                  </div>

                  <label className="auth-label auth-label-spaced" htmlFor="register-password">Create a password</label>
                  <div className="auth-input-wrap">
                    <LockKeyhole size={17} aria-hidden="true" />
                    <input id="register-password" name="password" type="password" autoComplete="new-password" required placeholder="Choose a password" value={formData.password} onChange={handleChange} />
                  </div>

                  <label className="auth-label auth-label-spaced" htmlFor="register-confirm-password">Confirm password</label>
                  <div className="auth-input-wrap">
                    <LockKeyhole size={17} aria-hidden="true" />
                    <input id="register-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required placeholder="Enter it once more" value={formData.confirmPassword} onChange={handleChange} />
                  </div>

                  <button className="auth-submit" type="submit" disabled={isLoading}>
                    {isLoading ? <span className="auth-spinner" /> : <>Create your account <ArrowRight size={17} /></>}
                  </button>
                </form>
                <p className="auth-register">Already have an account? <Link to="/login">Sign in <ArrowRight size={13} /></Link></p>
              </>
            )}
          </div>
          <div className="auth-legal"><span>© {COPYRIGHT_YEAR} SecurePro</span><span><LockKeyhole size={12} /> Protected sign-in</span></div>
        </div>
      </section>
      <AuthStory />
    </main>
  );
};

export default Register;
