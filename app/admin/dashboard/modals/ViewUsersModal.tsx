'use client';

import { useState, useEffect } from 'react';
import BaseModal from '../components/BaseModal';
import { Edit, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';
import type { Company } from '../types';

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

interface ViewUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCompany: Company | null;
  users: User[];
  onDeleteUser: (userId: string, userName: string) => void;
  onUpdateUser: (userId: string, email: string, password: string) => Promise<boolean>;
  loadUsers: (companyId: string) => void;
}

export default function ViewUsersModal({
  isOpen,
  onClose,
  selectedCompany,
  users,
  onDeleteUser,
  onUpdateUser,
  loadUsers,
}: ViewUsersModalProps) {
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (selectedCompany && isOpen) {
      loadUsers(selectedCompany.id);
    }
  }, [selectedCompany?.id, isOpen]);

  const handleEditClick = (user: User) => {
    setEditingUserId(user.id);
    setEditEmail(user.email);
    setEditPassword(user.password);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditEmail('');
    setEditPassword('');
  };

  const handleSaveEdit = async (userId: string) => {
    const success = await onUpdateUser(userId, editEmail, editPassword);
    if (success) {
      setEditingUserId(null);
      setEditEmail('');
      setEditPassword('');
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  if (!selectedCompany) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Users for ${selectedCompany.name}`}
      size="xl"
    >
      <div className="space-y-4">
        {users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No users found for this company.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email / ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Password
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {editingUserId === user.id ? (
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#9f1d35] focus:border-[#9f1d35]"
                          placeholder="Email / ID"
                        />
                      ) : (
                        <span>{user.email}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {editingUserId === user.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type={showPasswords[user.id] ? 'text' : 'password'}
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#9f1d35] focus:border-[#9f1d35]"
                            placeholder="Password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(user.id)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            {showPasswords[user.id] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs">
                            {showPasswords[user.id] ? user.password : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(user.id)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            {showPasswords[user.id] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      {editingUserId === user.id ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleSaveEdit(user.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Save"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditClick(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteUser(user.id, user.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </BaseModal>
  );
}


