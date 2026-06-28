import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { borrowsAPI, booksAPI, membersAPI } from '../utils/api';

function BorrowModal({ onClose, onSave }) {
  const [form, setForm] = useState({ bookId: '', memberId: '', dueDate: '', notes: '' });
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [bookSearch, setBookSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bookSearch.length > 1) {
      booksAPI.getAll({ search: bookSearch, available: 'true', limit: 8 })
        .then(r => setBooks(r.data.data)).catch(() => {});
    } else setBooks([]);
  }, [bookSearch]);

  useEffect(() => {
    if (memberSearch.length > 1) {
      membersAPI.getAll({ search: memberSearch, limit: 8 })
        .then(r => setMembers(r.data.data)).catch(() => {});
    } else setMembers([]);
  }, [memberSearch]);

  const defaultDue = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bookId || !form.memberId) return toast.error('Select a book and a member');
    setLoading(true);
    try {
      await borrowsAPI.borrow({ ...form, dueDate: form.dueDate || defaultDue });
      toast.success('Book issued successfully');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Issue failed');
    } finally {
      setLoading(false);
    }
  };

  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <span className="modal-title">Issue Book to Member</span>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Book search */}
            <div className="form-group">
              <label className="form-label">Search Book *</label>
              <input className="form-control" placeholder="Type book title, author or ISBN..." value={bookSearch} onChange={e => { setBookSearch(e.target.value); setSelectedBook(null); setForm(f => ({ ...f, bookId: '' })); }} />
              {selectedBook ? (
                <div style={{ marginTop: '8px', padding: '10px', background: 'var(--bg)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{selectedBook.title}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}> by {selectedBook.author}</span>
                    <span className="badge badge-success" style={{ marginLeft: '8px' }}>{selectedBook.availableCopies} available</span>
                  </div>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => { setSelectedBook(null); setForm(f => ({ ...f, bookId: '' })); setBookSearch(''); }}>Change</button>
                </div>
              ) : books.length > 0 && (
                <div style={{ border: '1px solid var(--border)', borderRadius: '8px', marginTop: '4px', overflow: 'hidden' }}>
                  {books.map(b => (
                    <div key={b._id} onClick={() => { setSelectedBook(b); setForm(f => ({ ...f, bookId: b._id })); setBookSearch(b.title); setBooks([]); }}
                      style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                      <div>
                        <div style={{ fontWeight: '500' }}>{b.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.author} • {b.isbn}</div>
                      </div>
                      <span className="badge badge-success">{b.availableCopies} left</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Member search */}
            <div className="form-group">
              <label className="form-label">Search Member *</label>
              <input className="form-control" placeholder="Type member name, email or ID..." value={memberSearch} onChange={e => { setMemberSearch(e.target.value); setSelectedMember(null); setForm(f => ({ ...f, memberId: '' })); }} />
              {selectedMember ? (
                <div style={{ marginTop: '8px', padding: '10px', background: 'var(--bg)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{selectedMember.name}</strong>
                    <code style={{ marginLeft: '8px', fontSize: '12px' }}>{selectedMember.membershipId}</code>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginLeft: '8px' }}>{selectedMember.currentBorrows}/{selectedMember.borrowingLimit} borrows</span>
                  </div>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => { setSelectedMember(null); setForm(f => ({ ...f, memberId: '' })); setMemberSearch(''); }}>Change</button>
                </div>
              ) : members.length > 0 && (
                <div style={{ border: '1px solid var(--border)', borderRadius: '8px', marginTop: '4px', overflow: 'hidden' }}>
                  {members.map(m => (
                    <div key={m._id} onClick={() => { setSelectedMember(m); setForm(f => ({ ...f, memberId: m._id })); setMemberSearch(m.name); setMembers([]); }}
                      style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                      <div>
                        <div style={{ fontWeight: '500' }}>{m.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.membershipId} • {m.email}</div>
                      </div>
                      <span className="badge badge-gray">{m.currentBorrows}/{m.borrowingLimit}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-control" value={form.dueDate || defaultDue} min={new Date().toISOString().split('T')[0]} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <input className="form-control" placeholder="Optional notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !form.bookId || !form.memberId}>
              {loading ? 'Issuing...' : 'Issue Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Borrows() {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [returningId, setReturningId] = useState(null);

  const fetchBorrows = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await borrowsAPI.getAll({ status, page, limit: 10 });
      setBorrows(data.data);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load borrows');
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => { fetchBorrows(); }, [fetchBorrows]);
  useEffect(() => { setPage(1); }, [status]);

  const handleReturn = async (id) => {
    setReturningId(id);
    try {
      const { data } = await borrowsAPI.return(id);
      toast.success(data.message || 'Book returned successfully');
      fetchBorrows();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Return failed');
    } finally {
      setReturningId(null);
    }
  };

  const isOverdue = (b) => b.status === 'borrowed' && new Date(b.dueDate) < new Date();

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Borrow Records</h2>
          <p>{total} total records</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          📤 Issue Book
        </button>
      </div>

      <div className="card">
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { label: 'All', value: '' },
              { label: '🔄 Borrowed', value: 'borrowed' },
              { label: '✅ Returned', value: 'returned' },
              { label: '⚠️ Overdue', value: 'overdue' }
            ].map(f => (
              <button key={f.value} className={`btn ${status === f.value ? 'btn-primary' : 'btn-outline'} btn-sm`}
                onClick={() => setStatus(f.value)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Member</th>
                <th>Issued By</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Fine</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" className="loading-cell"><div className="spinner" style={{ margin: '0 auto' }}></div></td></tr>
              ) : borrows.length === 0 ? (
                <tr><td colSpan="9">
                  <div className="empty-state">
                    <div className="empty-icon">🔄</div>
                    <h3>No borrow records found</h3>
                  </div>
                </td></tr>
              ) : borrows.map(b => (
                <tr key={b._id} style={{ background: isOverdue(b) ? '#fff5f5' : '' }}>
                  <td>
                    <div style={{ fontWeight: '500' }}>{b.book?.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.book?.isbn}</div>
                  </td>
                  <td>
                    <div>{b.member?.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.member?.membershipId}</div>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.issuedBy?.name}</td>
                  <td style={{ fontSize: '12px' }}>{new Date(b.borrowDate).toLocaleDateString()}</td>
                  <td>
                    <span style={{ fontSize: '12px', color: isOverdue(b) ? 'var(--danger)' : 'inherit', fontWeight: isOverdue(b) ? '600' : 'normal' }}>
                      {new Date(b.dueDate).toLocaleDateString()}
                      {isOverdue(b) && <span style={{ display: 'block', fontSize: '10px' }}>OVERDUE</span>}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {b.returnDate ? new Date(b.returnDate).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    {b.fineAmount > 0 ? <span className="badge badge-danger">LKR {b.fineAmount}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td>
                    <span className={`badge ${b.status === 'returned' ? 'badge-success' : isOverdue(b) ? 'badge-danger' : 'badge-warning'}`}>
                      {isOverdue(b) && b.status === 'borrowed' ? 'overdue' : b.status}
                    </span>
                  </td>
                  <td>
                    {b.status === 'borrowed' && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleReturn(b._id)}
                        disabled={returningId === b._id}
                      >
                        {returningId === b._id ? '...' : '↩ Return'}
                      </button>
                    )}
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

      {showModal && <BorrowModal onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); fetchBorrows(); }} />}
    </div>
  );
}
