import React from 'react';
import { Edit2 } from 'lucide-react';
import { UserAccount, UserRole } from '../schemas';
import { StatusToggle } from './StatusToggle';

export interface UsersTableProps {
  users: UserAccount[];
  onEdit: (user: UserAccount) => void;
  onToggleStatus: (id: string) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  onEdit,
  onToggleStatus,
}) => {
  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return 'badge-pill badge-overdue';
      case 'Accountant':
        return 'badge-pill badge-pending';
      case 'User':
      default:
        return 'badge-pill badge-paid';
    }
  };

  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Login ID</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                No users found matching query.
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="navbar-avatar" style={{ width: '28px', height: '28px', fontSize: '11px' }}>
                      {u.name.charAt(0)}
                    </div>
                    <strong style={{ color: 'var(--color-text-primary)' }}>{u.name}</strong>
                  </div>
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  {u.loginId}
                </td>
                <td>{u.email}</td>
                <td>
                  <span className={getRoleBadgeClass(u.role)}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <StatusToggle
                    status={u.status}
                    onToggle={() => onToggleStatus(u.id)}
                    disabled={u.role === 'Admin' && u.loginId === 'admin_pritam'}
                  />
                </td>
                <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                  {u.createdAt}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => onEdit(u)}
                      title="Edit User"
                      style={{ padding: '5px 8px' }}
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
