import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { booksAPI, membersAPI, borrowsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ books: 0, members: 0, activeBorrows: 0, overdue: 0 });
  const [recentBorrows, setRecentBorrows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookRes, memberRes, borrowRes, borrowStats] = await Promise.all([
          booksAPI.getStats(),
          membersAPI.getAll({ limit: 1 }),
          borrowsAPI.getAll({ limit: 5 }),
          borrowsAPI.getStats()
        ]);

        setStats({
          books: bookRes.data.data.total,
          members: memberRes.data.total,
          activeBorrows: borrowStats.data.data.activeBorrows,
          overdue: borrowStats.data.data.overdueBorrows
        });
        setRecentBorrows(borrowRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { icon: '📚', label: 'Total Books', value: stats.books, colorClass: 'blue', link: '/books' },
    { icon: '👥', label: 'Members', value: stats.members, colorClass: 'green', link: '/members' },
    { icon: '🔄', label: 'Active Borrows', value: stats.activeBorrows, colorClass: 'amber', link: '/borrows?status=borrowed' },
    { icon: '⚠️', label: 'Overdue', value: stats.overdue, colorClass: 'red', link: '/borrows?status=overdue' }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
          <p>Here's what's happening in your library today.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/books" className="btn btn-outline">+ Add Book</Link>
          <Link to="/borrows" className="btn btn-primary">Issue Book</Link>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
      ) : (
        <>
          <div className="stats-grid">
            {statCards.map((s, i) => (
              <Link to={s.link} key={i} style={{ textDecoration: 'none' }}>
                <div className="stat-card">
                  <div className={`stat-icon ${s.colorClass}`}>{s.icon}</div>
                  <div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Borrow Activities</span>
              <Link to="/borrows" className="btn btn-outline btn-sm">View All</Link>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Member</th>
                    <th>Borrow Date</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBorrows.length === 0 ? (
                    <tr><td colSpan="5" className="loading-cell">No borrow records yet.</td></tr>
                  ) : recentBorrows.map(b => (
                    <tr key={b._id}>
                      <td>
                        <div style={{ fontWeight: '500' }}>{b.book?.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.book?.author}</div>
                      </td>
                      <td>
                        <div>{b.member?.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.member?.membershipId}</div>
                      </td>
                      <td>{new Date(b.borrowDate).toLocaleDateString()}</td>
                      <td>
                        <span style={{ color: new Date(b.dueDate) < new Date() && b.status === 'borrowed' ? 'var(--danger)' : 'inherit' }}>
                          {new Date(b.dueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${b.status === 'returned' ? 'badge-success' : b.status === 'overdue' ? 'badge-danger' : 'badge-warning'}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
