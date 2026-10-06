import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Fingerprint, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthStory from '../components/AuthStory';

const COPYRIGHT_YEAR = new Date().getFullYear();

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password, mfaRequired ? mfaCode : null, rememberMe);
      if (!result.success) {
        setError(result.message || 'We couldn’t sign you in. Please try again.');
        return;
      }
      if (result.mfaRequired) {
        setMfaRequired(true);
        return;
      }
      navigate('/dashboard', { replace: true });
    } catch {
      setError('We couldn’t sign you in. Please try again.');
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
            <div className="auth-kicker"><span /> PRIVATE WORKSPACE ACCESS</div>
            <h1>{mfaRequired ? 'One last check.' : 'Welcome back.'}</h1>
            <p className="auth-intro">
              {mfaRequired
                ? 'Enter the 6-digit code from your authenticator to continue.'
                : 'Your work is right where you left it. Sign in to pick up where you belong.'}
            </p>

            {error && <div className="auth-error" role="alert"><span>!</span>{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              {!mfaRequired ? (
                <>
                  <label className="auth-label" htmlFor="login-email">Email address</label>
                  <div className="auth-input-wrap">
                    <Mail size={17} aria-hidden="true" />
                    <input
                      id="login-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                      autoFocus
                      placeholder="you@company.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>

                  <div className="auth-label-row">
                    <label className="auth-label" htmlFor="login-password">Password</label>
                    <Link to="/forgot-password">Forgot password?</Link>
                  </div>
                  <div className="auth-input-wrap">
                    <LockKeyhole size={17} aria-hidden="true" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      autoComplete="current-password"
                      required
                      placeholder="Your password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                    <button
                      type="button"
                      className="password-visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  <label className="auth-remember">
                    <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
                    <span className="remember-check" aria-hidden="true" />
                    <span>Keep me signed in</span>
                  </label>
                </>
              ) : (
                <>
                  <label className="auth-label" htmlFor="mfa-code">Authentication code</label>
                  <div className="auth-input-wrap auth-code-wrap">
                    <Fingerprint size={18} aria-hidden="true" />
                    <input
                      id="mfa-code"
                      type="text"
                      name="one-time-code"
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                      autoFocus
                      placeholder="000 000"
                      value={mfaCode}
                      onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <button type="button" className="auth-back-link" onClick={() => { setMfaRequired(false); setMfaCode(''); setError(''); }}>
                    <ArrowLeft size={14} /> Back to email and password
                  </button>
                </>
              )}

              <button className="auth-submit" type="submit" disabled={isLoading}>
                {isLoading ? <span className="auth-spinner" /> : (
                  <>{mfaRequired ? 'Verify and continue' : 'Sign in to your workspace'} <ArrowRight size={17} /></>
                )}
              </button>
            </form>

            {!mfaRequired && (
              <p className="auth-register">
                New to SecurePro? <Link to="/register">Create an account <ArrowRight size={13} /></Link>
              </p>
            )}
          </div>

          <div className="auth-legal">
            <span>© {COPYRIGHT_YEAR} SecurePro</span>
            <span><LockKeyhole size={12} /> Protected sign-in</span>
          </div>
        </div>
      </section>

      <AuthStory />
    </main>
  );
};

export default Login;
