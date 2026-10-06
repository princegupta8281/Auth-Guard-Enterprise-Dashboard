import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Moon, ShieldCheck, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="public-header">
      <Link className="auth-brand" to="/" aria-label="SecurePro home">
        <span className="brand-symbol"><ShieldCheck size={19} strokeWidth={2.2} /></span>
        <span className="brand-wordmark">secure<span>pro</span></span>
      </Link>
      <div className="public-header-actions">
        <Link to="/login"><ArrowLeft size={14} /> Back to sign in</Link>
        <button type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
