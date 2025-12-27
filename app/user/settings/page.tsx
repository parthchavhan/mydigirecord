'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, User, Key, Mail, Trash2, X } from 'lucide-react';
import { getAuth, logout } from '@/app/actions/auth';
import { getUserById, updateUserPassword, updateUserEmail, updateUserName, deleteUserAccount } from '@/app/actions/user';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'account'>('account');
  
  // Account settings states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showChangeUserId, setShowChangeUserId] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUserId, setNewUserId] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const auth = await getAuth();
        if (!auth || auth.role !== 'user' || !auth.userId) {
          router.push('/user/login');
          return;
        }

        const result = await getUserById(auth.userId);
        if (result.success && result.user) {
          setUser(result.user);
          setNewEmail(result.user.email);
          setNewUserId(result.user.id);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const result = await updateUserPassword(user.id, currentPassword, newPassword);
    if (result.success) {
      toast.success('Password updated successfully!');
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error(result.error || 'Failed to update password');
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const result = await updateUserEmail(user.id, newEmail, user.companyId);
    if (result.success) {
      toast.success('Email updated successfully!');
      setShowChangeEmail(false);
      const updatedResult = await getUserById(user.id);
      if (updatedResult.success && updatedResult.user) {
        setUser(updatedResult.user);
      }
    } else {
      toast.error(result.error || 'Failed to update email');
    }
  };

  const handleChangeUserId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Note: In a real app, changing user ID would require more complex logic
    // For now, we'll just show a message that this feature requires admin approval
    toast.error('Changing User ID requires admin approval. Please contact support.');
    setShowChangeUserId(false);
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (deleteConfirm !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    const result = await deleteUserAccount(user.id);
    if (result.success) {
      toast.success('Account deleted successfully!');
      await logout();
      router.push('/');
    } else {
      toast.error(result.error || 'Failed to delete account');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <main className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
              <Settings className="w-8 h-8 text-[#9f1d35]" />
              <span>Settings</span>
            </h1>
            <p className="text-gray-600 mt-2">Manage your account settings</p>
          </div>

          {/* Section Tabs */}
          <div className="flex space-x-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveSection('account')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeSection === 'account'
                  ? 'text-[#9f1d35] border-b-2 border-[#9f1d35]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Account Settings
            </button>
          </div>

          {/* Account Settings */}
          {activeSection === 'account' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Account Settings</span>
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {/* Change User ID */}
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-900">Change User ID</h3>
                    <p className="text-sm text-gray-600">Update your user identification</p>
                  </div>
                  <button
                    onClick={() => setShowChangeUserId(true)}
                    className="px-4 py-2 bg-[#9f1d35] text-white rounded-lg hover:bg-[#8a1a2e] transition-colors"
                  >
                    Change
                  </button>
                </div>

                {/* Change Password */}
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-900">Change Password</h3>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </div>
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="px-4 py-2 bg-[#9f1d35] text-white rounded-lg hover:bg-[#8a1a2e] transition-colors"
                  >
                    Change
                  </button>
                </div>

                {/* Change Email ID */}
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-900">Change Email ID</h3>
                    <p className="text-sm text-gray-600">Update your email address</p>
                  </div>
                  <button
                    onClick={() => setShowChangeEmail(true)}
                    className="px-4 py-2 bg-[#9f1d35] text-white rounded-lg hover:bg-[#8a1a2e] transition-colors"
                  >
                    Change
                  </button>
                </div>

                {/* Subscription Plan */}
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-900">Subscription Plan</h3>
                    <p className="text-sm text-gray-600">View your current subscription</p>
                  </div>
                  <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
                    Basic Plan
                  </span>
                </div>

                {/* Stop Subscription */}
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-900">Stop Subscription</h3>
                    <p className="text-sm text-gray-600">Cancel your subscription</p>
                  </div>
                  <button
                    onClick={() => toast('Subscription cancellation feature coming soon', { icon: 'ℹ️' })}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Stop
                  </button>
                </div>

                {/* Delete Account */}
                <div className="flex items-center justify-between py-4">
                  <div>
                    <h3 className="font-medium text-red-600">Delete Account</h3>
                    <p className="text-sm text-gray-600">Permanently delete your account</p>
                  </div>
                  <button
                    onClick={() => setShowDeleteAccount(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}


          {/* Modals */}
          {showChangePassword && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Change Password</h3>
                  <button onClick={() => setShowChangePassword(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowChangePassword(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-[#9f1d35] text-white rounded-lg hover:bg-[#8a1a2e]"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showChangeEmail && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Change Email</h3>
                  <button onClick={() => setShowChangeEmail(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleChangeEmail} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Email</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowChangeEmail(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-[#9f1d35] text-white rounded-lg hover:bg-[#8a1a2e]"
                    >
                      Update Email
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showChangeUserId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Change User ID</h3>
                  <button onClick={() => setShowChangeUserId(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleChangeUserId} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New User ID</label>
                    <input
                      type="text"
                      value={newUserId}
                      onChange={(e) => setNewUserId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9f1d35] focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowChangeUserId(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-[#9f1d35] text-white rounded-lg hover:bg-[#8a1a2e]"
                    >
                      Request Change
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showDeleteAccount && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-red-600">Delete Account</h3>
                  <button onClick={() => setShowDeleteAccount(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    This action cannot be undone. All your data will be permanently deleted.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type <span className="font-bold">DELETE</span> to confirm
                    </label>
                    <input
                      type="text"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="DELETE"
                      required
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowDeleteAccount(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
    </main>
  );
}

