import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Key } from 'lucide-react';
import { authApi, getApiErrorMessage } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      await authApi.forgotPassword(email);
      setIsSuccess(true);
      setMessage('If the account exists, password reset instructions have been sent.');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="recovery-page min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="recovery-card max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <Key className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Forgot Password?
          </h2>
          <p className="mt-4 text-sm text-gray-600 dark:text-slate-100">
            No worries, we'll send you reset instructions.
          </p>
        </div>
        
        {isSuccess ? (
          <div className="rounded-xl bg-green-50 p-6 text-center border border-green-100">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-sm font-medium text-green-800 mb-2">Check your email</h3>
            <p className="text-sm text-green-700">{message}</p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-100">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
            
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-slate-100 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 block w-full border-gray-300 rounded-lg py-3 px-4 border text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white dark:border-slate-700 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>
          </form>
        )}
        
        <div className="text-center mt-6">
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 text-sm inline-flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
