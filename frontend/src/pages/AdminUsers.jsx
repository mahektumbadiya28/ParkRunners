import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import Badge from '../components/ui/Badge';
import API from '../services/api';
import toast from 'react-hot-toast';

const roleVariant = { car_owner: 'info', space_provider: 'purple', valet_driver: 'warning', admin: 'danger' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data.data || []);
    } catch (e) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAction = async (id, action) => {
    try {
      await API.patch(`/admin/users/${id}/kyc`, { status: action });
      toast.success(`User ${action} successfully`);
      fetchUsers(); // Refresh list
    } catch (e) {
      toast.error(e.response?.data?.message || 'Action failed');
    }
  };

  const filtered = users.filter(u =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search users by name or email…"
          className="input-premium text-sm px-4 max-w-sm"
        />
      </div>
      <div className="card-premium overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-14 w-full" />)}</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-left">
                <th className="p-4 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">User</th>
                <th className="p-4 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider hidden sm:table-cell">Email</th>
                <th className="p-4 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">Role</th>
                <th className="p-4 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u._id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-card-hover)] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.fullName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="font-semibold text-[var(--text-primary)]">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="p-4 text-[var(--text-muted)] hidden sm:table-cell">{u.email}</td>
                  <td className="p-4">
                    <Badge variant={roleVariant[u.role] || 'default'}>{u.role}</Badge>
                    {(u.role === 'valet_driver' || u.role === 'space_provider') && (
                      <span className="ml-2 text-[10px] text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">KYC PENDING</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {(u.role === 'valet_driver' || u.role === 'space_provider') ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleAction(u._id, 'approved')} className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors" title="Approve KYC">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleAction(u._id, 'rejected')} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Reject KYC">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[var(--text-muted)] text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
