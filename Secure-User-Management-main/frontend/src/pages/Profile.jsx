import React, { useEffect, useState } from 'react';
import { Camera, Check, KeyRound, Mail, Shield, UserRound, Smartphone, SmartphoneNfc, Fingerprint, Monitor, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthenticatedImage from '../components/AuthenticatedImage';
import { getApiErrorMessage, usersApi } from '../services/api';

const fieldClass = 'mt-1 block w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-charcoal-800 px-4 py-3 text-sm text-slate-900 dark:text-white shadow-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-primary-500 disabled:bg-slate-50 dark:disabled:bg-charcoal-900/50 disabled:text-slate-800 dark:text-slate-100';

const MfaSection = ({ user, setNotice, refreshProfile }) => {
  const [setupData, setSetupData] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const startSetup = async () => {
    setIsLoading(true);
    setNotice(null);
    try {
      const { data } = await usersApi.mfaSetup();
      setSetupData(data);
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Could not start MFA setup.') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setNotice(null);
    try {
      await usersApi.mfaEnable(mfaCode);
      await refreshProfile();
      setSetupData(null);
      setMfaCode('');
      setNotice({ type: 'success', text: 'Two-factor authentication enabled successfully!' });
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Invalid code. Try again.') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setNotice(null);
    try {
      await usersApi.mfaDisable(mfaCode);
      await refreshProfile();
      setMfaCode('');
      setNotice({ type: 'success', text: 'Two-factor authentication disabled.' });
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Invalid code. Try again.') });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-white dark:bg-[#15151a]  border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-6 sm:p-8 h-fit mt-6">
      <div className="flex items-start gap-4 pb-6 border-b border-slate-100 dark:border-white/10/50">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-sm ${user.mfaEnabled ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
          {user.mfaEnabled ? <SmartphoneNfc className="h-6 w-6" /> : <Smartphone className="h-6 w-6" />}
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Two-Factor Authentication</h2>
          <p className="mt-1 text-sm font-medium leading-5 text-slate-800 dark:text-slate-100">
            {user.mfaEnabled 
              ? 'Your account is currently protected with 2FA.'
              : 'Add an extra layer of security to your account.'}
          </p>
        </div>
      </div>

      {!user.mfaEnabled && !setupData && (
        <div className="mt-6">
          <button
            onClick={startSetup}
            disabled={isLoading}
            className="w-full flex justify-center items-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
          >
            {isLoading ? 'Loading...' : 'Set up 2FA'}
          </button>
        </div>
      )}

      {setupData && (
        <form onSubmit={handleEnable} className="mt-6 space-y-5">
          <div className="text-sm text-slate-700 dark:text-slate-100 bg-slate-50 dark:bg-charcoal-900 p-4 rounded-xl border border-slate-100 dark:border-white/10">
            <p className="font-semibold mb-2">1. Scan this QR code with your authenticator app.</p>
            <div className="flex justify-center bg-white dark:bg-charcoal-800 p-2 rounded-lg border border-slate-200 dark:border-white/10 w-fit mx-auto">
              <img src={setupData.qrCodeUri} alt="QR Code" className="w-32 h-32" />
            </div>
            <p className="mt-3 text-xs text-center text-slate-800 dark:text-slate-100 break-all">Secret: {setupData.secret}</p>
          </div>
          
          <div>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-100 mb-1 block">2. Enter the 6-digit code</label>
            <input
              type="text"
              required
              maxLength={6}
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              className={fieldClass}
              placeholder="000000"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSetupData(null)}
              className="flex-1 rounded-xl bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-white/10 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:bg-charcoal-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || mfaCode.length < 6}
              className="flex-1 rounded-xl bg-primary-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/30 hover:bg-primary-500 disabled:opacity-60"
            >
              {isLoading ? 'Verifying...' : 'Enable 2FA'}
            </button>
          </div>
        </form>
      )}

      {user.mfaEnabled && (
        <form onSubmit={handleDisable} className="mt-6 space-y-5">
          <p className="text-sm text-slate-800 dark:text-slate-100">
            To disable 2FA, please verify your identity by entering an authentication code.
          </p>
          <div>
            <input
              type="text"
              required
              maxLength={6}
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              className={fieldClass}
              placeholder="Enter 6-digit code"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || mfaCode.length < 6}
            className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/30 transition-all hover:bg-red-500 hover:-translate-y-0.5 disabled:opacity-60"
          >
            {isLoading ? 'Disabling...' : 'Disable 2FA'}
          </button>
        </form>
      )}
    </section>
  );
};

const Profile = () => {
  const { user, refreshProfile } = useAuth();
  const [form, setForm] = useState({ name: '', email: '' });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    setForm({ name: user?.name || '', email: user?.email || '' });
  }, [user?.name, user?.email]);

  if (!user) {
    return null;
  }

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setNotice(null);

    try {
      await usersApi.updateProfile(form);
      await refreshProfile();
      setIsEditing(false);
      setNotice({ type: 'success', text: 'Your profile has been updated.' });
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Your profile could not be updated.') });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setNotice({ type: 'error', text: 'Choose an image file to update your profile photo.' });
      return;
    }

    setIsUploading(true);
    setNotice(null);
    try {
      await usersApi.uploadProfileImage(file);
      await refreshProfile();
      setNotice({ type: 'success', text: 'Your profile photo has been updated.' });
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'The profile photo could not be uploaded.') });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setNotice(null);

    if (passwords.newPassword !== passwords.confirmPassword) {
      setNotice({ type: 'error', text: 'The new passwords do not match.' });
      return;
    }

    setIsChangingPassword(true);
    try {
      await usersApi.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setNotice({ type: 'success', text: 'Your password has been changed.' });
    } catch (error) {
      setNotice({ type: 'error', text: getApiErrorMessage(error, 'Your password could not be changed.') });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleProfileChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handlePasswordInput = (event) => {
    setPasswords((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  return (
    <div className="min-h-full relative overflow-hidden bg-slate-50 dark:bg-charcoal-900">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-semibold mb-3 shadow-sm">
            <UserRound className="h-4 w-4" />
            <span>Account Settings</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Your profile</h1>
          <p className="mt-2 text-base text-slate-800 dark:text-slate-100">Keep your personal details and sign-in information up to date.</p>
        </header>

        {notice && (
          <div
            role="status"
            className={`mb-6 rounded-2xl border px-5 py-4 text-sm font-medium  shadow-sm ${
              notice.type === 'success'
                ? 'border-emerald-200/50 bg-emerald-50/80 text-emerald-900'
                : 'border-red-200/50 bg-red-50/80 text-red-900'
            }`}
          >
            {notice.text}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
          <section className="bg-white dark:bg-[#15151a]  border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="flex flex-col gap-6 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-charcoal-800/30 p-6 sm:flex-row sm:items-center">
              <div className="relative h-24 w-24 shrink-0 group">
                {user.profileImage ? (
                  <AuthenticatedImage
                    path={user.profileImage}
                    alt={`${user.name}'s profile`}
                    className="h-24 w-24 rounded-2xl border-2 border-white dark:border-white/10 shadow-md object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-white dark:border-white/10 bg-primary-50 shadow-md text-3xl font-extrabold text-primary-700 transition-transform group-hover:scale-105">
                    {user.name?.trim().charAt(0).toUpperCase() || <UserRound className="h-10 w-10" />}
                  </div>
                )}
                <label
                  htmlFor="profile-photo"
                  className="absolute -bottom-3 -right-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border-2 border-white dark:border-white/10 bg-slate-900 text-white shadow-lg transition-all hover:bg-primary-600 hover:scale-110"
                  title="Change profile photo"
                >
                  {isUploading
                    ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white dark:border-white/10 border-t-transparent" />
                    : <Camera className="h-5 w-5" />}
                </label>
                <input
                  id="profile-photo"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </div>
              <div className="min-w-0 flex-1 pt-2 sm:pt-0 sm:pl-2">
                <h2 className="truncate text-2xl font-extrabold text-slate-900 dark:text-white">{user.name}</h2>
                <p className="mt-1 truncate text-sm font-medium text-slate-800 dark:text-slate-100">{user.email}</p>
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-100/80 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-100 border border-slate-200 dark:border-white/10/50">
                  <Shield className="h-4 w-4 text-primary-500" />
                  {user.role}
                </p>
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-6 p-6 sm:p-8">
              <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-white/10/50">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Personal details</h2>
                  <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">These details are used on your account.</p>
                </div>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-charcoal-800 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-100 shadow-sm transition-all hover:bg-slate-50 dark:bg-charcoal-900 hover:border-slate-300 hover:shadow"
                  >
                    Edit details
                  </button>
                )}
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="profile-name" className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-100 mb-1">
                    <UserRound className="h-4 w-4 text-slate-400" /> Full name
                  </label>
                  <input
                    id="profile-name"
                    name="name"
                    autoComplete="name"
                    required
                    value={form.name}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label htmlFor="profile-email" className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-100 mb-1">
                    <Mail className="h-4 w-4 text-slate-400" /> Email address
                  </label>
                  <input
                    id="profile-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className={fieldClass}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ name: user.name || '', email: user.email || '' });
                      setIsEditing(false);
                    }}
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-charcoal-800 px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-100 shadow-sm transition-all hover:bg-slate-50 dark:bg-charcoal-900 hover:border-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-500 dark:bg-primary-500 dark:hover:bg-primary-400 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-500/20 transition-all hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 disabled:transform-none"
                  >
                    {isSaving ? (
                      <span className="flex items-center">
                        <div className="h-4 w-4 border-2 border-white dark:border-white/10 border-t-transparent rounded-full animate-spin mr-2"></div>
                        Saving...
                      </span>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Save changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </section>

          <div className="space-y-6">
            <section className="bg-white dark:bg-[#15151a]  border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-6 sm:p-8 h-fit">
            <div className="flex items-start gap-4 pb-6 border-b border-slate-100 dark:border-white/10/50">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
                <KeyRound className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Change password</h2>
                <p className="mt-1 text-sm font-medium leading-5 text-slate-800 dark:text-slate-100">Use your current password to set a new one.</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="mt-6 space-y-5">
              <div>
                <label htmlFor="current-password" className="text-sm font-bold text-slate-700 dark:text-slate-100 mb-1 block">Current password</label>
                <input
                  id="current-password"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength={6}
                  value={passwords.currentPassword}
                  onChange={handlePasswordInput}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="new-password" className="text-sm font-bold text-slate-700 dark:text-slate-100 mb-1 block">New password</label>
                <input
                  id="new-password"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={passwords.newPassword}
                  onChange={handlePasswordInput}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="text-sm font-bold text-slate-700 dark:text-slate-100 mb-1 block">Confirm new password</label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={passwords.confirmPassword}
                  onChange={handlePasswordInput}
                  className={fieldClass}
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full flex justify-center items-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 disabled:transform-none"
                >
                  {isChangingPassword ? (
                    <span className="flex items-center">
                      <div className="h-4 w-4 border-2 border-white dark:border-white/10 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Updating...
                    </span>
                  ) : 'Update password'}
                </button>
              </div>
            </form>
          </section>
          
            {/* MFA Section */}
            <MfaSection user={user} setNotice={setNotice} refreshProfile={refreshProfile} />

      <section className="bg-white dark:bg-[#15151a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-6 sm:p-8 h-fit mt-6">
        <div className="flex items-start gap-4 pb-6 border-b border-slate-100 dark:border-white/10">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-primary-50 text-primary-600 border-primary-100 shadow-sm">
            <Fingerprint className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Passkeys (WebAuthn)</h2>
            <p className="mt-1 text-sm font-medium leading-5 text-slate-800 dark:text-slate-100">
              Sign in securely with your fingerprint, face, or screen lock.
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-[#111115]">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-slate-400" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">MacBook Pro (Touch ID)</p>
                <p className="text-xs text-slate-700">Added on Oct 1, 2026</p>
              </div>
            </div>
            <button className="text-red-500 text-xs font-bold hover:underline">Remove</button>
          </div>
          <button className="w-full flex justify-center items-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/20 transition-all hover:-translate-y-0.5">
            <Plus className="h-4 w-4" /> Add a Passkey
          </button>
        </div>
      </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
