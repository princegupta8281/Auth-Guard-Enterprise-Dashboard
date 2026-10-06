import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { authApi, getApiErrorMessage } from '../services/api';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const token = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await authApi.resetPassword(token, password);
      setIsSuccess(true);
      setMessage("Your password has been reset successfully. You can now log in.");
    } catch (err) {
      setError(getApiErrorMessage(err, 'The token might have expired. Please request a new reset link.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="recovery-page min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="recovery-card max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Create New Password
          </h2>
          <p className="mt-4 text-sm text-gray-600 dark:text-slate-100">
            Please enter your new password below.
          </p>
        </div>
        
        {isSuccess ? (
          <div className="rounded-xl bg-green-50 p-6 text-center border border-green-100">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-sm font-medium text-green-800 mb-2">Password Reset Successful</h3>
            <p className="text-sm text-green-700 mb-4">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {!token && (
               <div className="rounded-md bg-yellow-50 p-4 border border-yellow-100 flex items-start">
                 <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0" />
                 <div className="text-sm text-yellow-700">Missing reset token in URL.</div>
               </div>
            )}
            
            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-100">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-100 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 block w-full border-gray-300 rounded-lg py-3 px-4 border text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter new password"
                    disabled={!token}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-100 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 block w-full border-gray-300 rounded-lg py-3 px-4 border text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Confirm new password"
                    disabled={!token}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !token}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white dark:border-slate-700 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
