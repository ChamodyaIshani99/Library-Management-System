import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { membersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const MEMBERSHIP_TYPES = ['Standard', 'Premium', 'Student', 'Senior'];

const emptyForm = {
  name: '', email: '', phone: '', address: '',
  membershipType: 'Standard', borrowingLimit: 3
};

function MemberModal({ member, onClose, onSave }) {
  const [form, setForm] = useState(member ? { ...member } : { ...emptyForm });
  const [loading, setLoading] = useState(false);
  const isEdit = !!member;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await membersAPI.update(member._id, form);
        toast.success('Member updated');
      } else {
        await membersAPI.create(form);
        toast.success('Member registered');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{isEdit ? 'Edit Member' : 'Register New Member'}</span>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input name="name" className="form-control" value={form.name} onChange={handleChange} required placeholder="Member's full name" />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} required placeholder="member@email.com" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input name="phone" className="form-control" value={form.phone} onChange={handleChange} placeholder="+94 71 234 5678" />
              </div>
              <div className="form-group">
                <label className="form-label">Membership Type</label>
                <select name="membershipType" className="form-control" value={form.membershipType} onChange={handleChange}>
                  {MEMBERSHIP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input name="address" className="form-control" value={form.address} onChange={handleChange} placeholder="Home address" />
            </div>
            <div className="form-group">
              <label className="form-label">Borrowing Limit</label>
              <input name="borrowingLimit" type="number" min="1" max="10" className="form-control" value={form.borrowingLimit} onChange={handleChange} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Member' : 'Register Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Members() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [membershipType, setMembershipType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState({ open: false, member: null });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await membersAPI.getAll({ search, membershipType, page, limit: 10 });
      setMembers(data.data);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  }, [search, membershipType, page]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);
  useEffect(() => { setPage(1); }, [search, membershipType]);

  const handleDelete = async (id) => {
    try {
      await membersAPI.delete(id);
      toast.success('Member deactivated');
      setDeleteConfirm(null);
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot deactivate member');
    }
  };

  const isMembershipExpired = (date) => new Date(date) < new Date();

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Members</h2>
          <p>{total} registered members</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ open: true, member: null })}>
          + Register Member
        </button>
      </div>

      <div className="card">
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="search-bar">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input className="search-input" placeholder="Search by name, email, membership ID..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-control" style={{ width: '180px' }} value={membershipType} onChange={e => setMembershipType(e.target.value)}>
              <option value="">All Types</option>
              {MEMBERSHIP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {(search || membershipType) && (
              <button className="btn btn-outline" onClick={() => { setSearch(''); setMembershipType(''); }}>Clear</button>
            )}
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Membership ID</th>
                <th>Type</th>
                <th>Borrows</th>
                <th>Fine Balance</th>
                <th>Membership Ends</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="loading-cell"><div className="spinner" style={{ margin: '0 auto' }}></div></td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan="8">
                  <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <h3>No members found</h3>
                  </div>
                </td></tr>
              ) : members.map(m => (
                <tr key={m._id}>
                  <td>
                    <div style={{ fontWeight: '500' }}>{m.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.email}</div>
                    {m.phone && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.phone}</div>}
                  </td>
                  <td><code style={{ fontSize: '12px', background: 'var(--bg)', padding: '2px 8px', borderRadius: '4px', fontWeight: '600', color: 'var(--primary)' }}>{m.membershipId}</code></td>
                  <td><span className="badge badge-info">{m.membershipType}</span></td>
                  <td>
                    <span style={{ fontWeight: '500', color: m.currentBorrows > 0 ? 'var(--warning)' : 'inherit' }}>
                      {m.currentBorrows} / {m.borrowingLimit}
                    </span>
                  </td>
                  <td>
                    {m.fineBalance > 0 ? (
                      <span className="badge badge-danger">LKR {m.fineBalance}</span>
                    ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td>
                    <span style={{ color: isMembershipExpired(m.membershipEnd) ? 'var(--danger)' : 'var(--success)', fontSize: '12px' }}>
                      {new Date(m.membershipEnd).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${m.isActive ? 'badge-success' : 'badge-gray'}`}>{m.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn-icon" title="Edit" onClick={() => setModal({ open: true, member: m })}>✏️</button>
                      {user?.role === 'admin' && (
                        <button className="btn-icon" title="Deactivate" onClick={() => setDeleteConfirm(m)}>🗑️</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">Page {page} of {totalPages}</span>
            <div className="pagination-controls">
              <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
            </div>
          </div>
        )}
      </div>

      {modal.open && (
        <MemberModal member={modal.member} onClose={() => setModal({ open: false, member: null })} onSave={() => { setModal({ open: false, member: null }); fetchMembers(); }} />
      )}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <span className="modal-title">Deactivate Member</span>
              <button className="close-btn" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Deactivate <strong>{deleteConfirm.name}</strong>? They must return all books first.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm._id)}>Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
