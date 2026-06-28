import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { booksAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Children', 'Academic', 'Reference', 'Other'];

const emptyForm = {
  title: '', author: '', isbn: '', category: 'Other',
  description: '', publisher: '', publishedYear: '', totalCopies: 1, location: ''
};

function BookModal({ book, onClose, onSave }) {
  const [form, setForm] = useState(book ? { ...book, publishedYear: book.publishedYear || '' } : { ...emptyForm });
  const [loading, setLoading] = useState(false);
  const isEdit = !!book;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await booksAPI.update(book._id, form);
        toast.success('Book updated successfully');
      } else {
        await booksAPI.create(form);
        toast.success('Book added to catalog');
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
      <div className="modal modal-lg">
        <div className="modal-header">
          <span className="modal-title">{isEdit ? 'Edit Book' : 'Add New Book'}</span>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input name="title" className="form-control" value={form.title} onChange={handleChange} required placeholder="Book title" />
              </div>
              <div className="form-group">
                <label className="form-label">Author *</label>
                <input name="author" className="form-control" value={form.author} onChange={handleChange} required placeholder="Author name" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">ISBN *</label>
                <input name="isbn" className="form-control" value={form.isbn} onChange={handleChange} required placeholder="978-..." />
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select name="category" className="form-control" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Publisher</label>
                <input name="publisher" className="form-control" value={form.publisher} onChange={handleChange} placeholder="Publisher name" />
              </div>
              <div className="form-group">
                <label className="form-label">Published Year</label>
                <input name="publishedYear" type="number" className="form-control" value={form.publishedYear} onChange={handleChange} placeholder="2024" />
              </div>
              <div className="form-group">
                <label className="form-label">Total Copies *</label>
                <input name="totalCopies" type="number" min="1" className="form-control" value={form.totalCopies} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Shelf Location</label>
              <input name="location" className="form-control" value={form.location} onChange={handleChange} placeholder="e.g. A-1, Floor 2" />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-control" value={form.description} onChange={handleChange} rows="3" placeholder="Brief description..." style={{ resize: 'vertical' }} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Book' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Books() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState({ open: false, book: null });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await booksAPI.getAll({ search, category, page, limit: 10 });
      setBooks(data.data);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  }, [search, category, page]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  useEffect(() => { setPage(1); }, [search, category]);

  const handleDelete = async (id) => {
    try {
      await booksAPI.delete(id);
      toast.success('Book removed from catalog');
      setDeleteConfirm(null);
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Book Catalog</h2>
          <p>{total} books in collection</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ open: true, book: null })}>
          + Add Book
        </button>
      </div>

      <div className="card">
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="search-bar">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                placeholder="Search by title, author, ISBN..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="form-control" style={{ width: '180px' }} value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {(search || category) && (
              <button className="btn btn-outline" onClick={() => { setSearch(''); setCategory(''); }}>
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Book Details</th>
                <th>ISBN</th>
                <th>Category</th>
                <th>Copies</th>
                <th>Available</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="loading-cell"><div className="spinner" style={{ margin: '0 auto' }}></div></td></tr>
              ) : books.length === 0 ? (
                <tr><td colSpan="7">
                  <div className="empty-state">
                    <div className="empty-icon">📚</div>
                    <h3>No books found</h3>
                    <p>Try adjusting your search or add a new book.</p>
                  </div>
                </td></tr>
              ) : books.map(b => (
                <tr key={b._id}>
                  <td>
                    <div style={{ fontWeight: '500', color: 'var(--primary)' }}>{b.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.author} {b.publishedYear ? `• ${b.publishedYear}` : ''}</div>
                  </td>
                  <td><code style={{ fontSize: '12px', background: 'var(--bg)', padding: '2px 6px', borderRadius: '4px' }}>{b.isbn}</code></td>
                  <td><span className="badge badge-primary">{b.category}</span></td>
                  <td>{b.totalCopies}</td>
                  <td>
                    <span className={`badge ${b.availableCopies > 0 ? 'badge-success' : 'badge-danger'}`}>
                      {b.availableCopies} / {b.totalCopies}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.location || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn-icon" title="Edit" onClick={() => setModal({ open: true, book: b })}>✏️</button>
                      {user?.role === 'admin' && (
                        <button className="btn-icon" title="Delete" onClick={() => setDeleteConfirm(b)} style={{ color: 'var(--danger)' }}>🗑️</button>
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
            <span className="pagination-info">Showing page {page} of {totalPages} ({total} books)</span>
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
        <BookModal book={modal.book} onClose={() => setModal({ open: false, book: null })} onSave={() => { setModal({ open: false, book: null }); fetchBooks(); }} />
      )}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <span className="modal-title">Confirm Delete</span>
              <button className="close-btn" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to remove <strong>{deleteConfirm.title}</strong> from the catalog?</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' }}>This action can be undone by an admin.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm._id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
