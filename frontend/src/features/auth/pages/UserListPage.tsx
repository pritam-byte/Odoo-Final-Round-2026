import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Check, RefreshCw } from 'lucide-react';
import { UserAccount, UserRole } from '../schemas';
import { getAllUsers, fetchUsersApi, updateUserAccount, toggleUserStatus, triggerPasswordReset } from '../api';
import { UsersTable } from '../components/UsersTable';
import { UserEditModal } from '../components/UserEditModal';

export interface UserListPageProps {
  onNavigateToCreate: () => void;
}

export const UserListPage: React.FC<UserListPageProps> = ({ onNavigateToCreate }) => {
  const [users, setUsers] = useState<UserAccount[]>(() => getAllUsers());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  const loadUsersFromBackend = async () => {
    const liveUsers = await fetchUsersApi();
    setUsers(liveUsers);
  };

  useEffect(() => {
    loadUsersFromBackend();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleToggleStatus = async (id: string) => {
    const res = toggleUserStatus(id);
    if (res.success) {
      await loadUsersFromBackend();
      showToast(res.message);
    }
  };

  const handleResetPassword = (id: string) => {
    const res = triggerPasswordReset(id);
    if (res.success) {
      showToast(res.message);
    }
  };

  const handleSaveUser = async (updatedData: { name: string; email: string; role: UserRole; status: 'Active' | 'Inactive' }) => {
    if (!selectedUser) return;
    const res = await updateUserAccount(selectedUser.id, updatedData);
    if (res.success) {
      await loadUsersFromBackend();
      setSelectedUser(null);
      showToast(res.message);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.loginId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 3000,
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          <Check size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="content-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="page-title">User Management</h1>
            <span className="badge-pill badge-overdue" style={{ fontSize: '11px', padding: '2px 8px' }}>
              Admin Exclusive
            </span>
          </div>
          <p className="page-subtitle">
            Configure system accounts, assign roles (User / Accountant / Admin), and manage access permissions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={loadUsersFromBackend}
            className="btn btn-outline"
            style={{ gap: '6px' }}
            title="Refresh list from PostgreSQL database"
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToCreate}
            className="btn btn-primary"
            style={{ gap: '8px' }}
          >
            <UserPlus size={16} />
            <span>+ New User</span>
          </button>
        </div>
      </div>

      <div className="card-panel" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--color-bg)', padding: '4px', borderRadius: 'var(--radius-sm)' }}>
            {(['ALL', 'Admin', 'Accountant', 'User'] as const).map((tab) => {
              const isSelected = roleFilter === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setRoleFilter(tab)}
                  className={`btn btn-sm ${isSelected ? 'btn-outline' : 'btn-ghost'}`}
                  style={{
                    boxShadow: isSelected ? 'var(--shadow-subtle)' : 'none',
                    fontWeight: isSelected ? 700 : 500,
                  }}
                >
                  {tab === 'ALL' ? 'All Roles' : tab}
                </button>
              );
            })}
          </div>

          <div className="search-bar-wrapper">
            <div className="search-bar-icon">
              <Search size={15} strokeWidth={1.75} />
            </div>
            <input
              type="text"
              className="search-bar-input"
              placeholder="Search by name, login ID, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '280px' }}
            />
          </div>
        </div>
      </div>

      <div className="card-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <UsersTable
          users={filteredUsers}
          onEdit={(u) => setSelectedUser(u)}
          onToggleStatus={handleToggleStatus}
          onResetPassword={handleResetPassword}
        />
      </div>

      {selectedUser && (
        <UserEditModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
};

export default UserListPage;
