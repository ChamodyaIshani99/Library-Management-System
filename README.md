# 📚 Library Management System — MERN Stack

A full-stack Library Management System built with **MongoDB, Express.js, React, Node.js**.

**Course:** Academic Project | SLIIT | 2025  
**Stack:** MERN (MongoDB Atlas + Express + React 18 + Node.js)

---

## 🚀 Features

### Authentication
- JWT-based login/register
- Role-based access control (Admin / Librarian)
- Protected routes, token auto-attach via Axios interceptors
- Profile update & password change

### Books (CRUD + Search)
- **Create** — Add books with ISBN, category, copies, location
- **Read** — List with pagination, full-text search, category filter
- **Update** — Edit all book details, copies auto-adjusted
- **Delete** — Soft delete (admin only)

### Members (CRUD + Search)
- **Create** — Register members with auto-generated Membership ID (LIB-00001)
- **Read** — Search by name/email/ID, filter by membership type
- **Update** — Edit member info, borrowing limits
- **Delete** — Deactivate (requires all books returned)

### Borrow Management (CRUD + Search)
- **Create** — Issue book with live book/member search autocomplete
- **Read** — Filter by status (borrowed/returned/overdue)
- **Update** — Return book, auto-calculate fines (LKR 10/day)
- **Delete** — Remove returned records (admin only)

### Dashboard
- Summary cards (Total Books, Members, Active Borrows, Overdue)
- Recent borrow activity table

---

## 📁 Project Structure

```
library-system/
├── backend/
│   ├── controllers/       # authController, bookController, memberController, borrowController
│   ├── middleware/        # auth.js (protect + authorize)
│   ├── models/            # User, Book, Member, Borrow
│   ├── routes/            # auth, books, members, borrows
│   ├── .env.example       # Environment variables template
│   ├── server.js          # Express app entry point
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── Layout/    # Navbar, Sidebar
    │   ├── context/        # AuthContext (useAuth hook)
    │   ├── pages/          # Login, Register, Dashboard, Books, Members, Borrows, Profile
    │   ├── utils/          # api.js (Axios instance + all API calls)
    │   ├── App.jsx
    │   ├── index.js
    │   └── index.css       # Global styles (CSS variables, layout, tables, modals)
    └── package.json
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/libraryDB
JWT_SECRET=your_secret_here
JWT_EXPIRE=7d
PORT=5000
```

```bash
npm run dev      # Development (nodemon)
npm start        # Production
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`  
Backend API on `http://localhost:5000`

---

## 🔐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register staff |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/updateprofile | Update profile |
| PUT | /api/auth/updatepassword | Change password |
| GET | /api/auth/logout | Logout |

### Books
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/books | Get all books (search, filter, paginate) |
| POST | /api/books | Add new book |
| GET | /api/books/:id | Get single book |
| PUT | /api/books/:id | Update book |
| DELETE | /api/books/:id | Delete book (admin) |
| GET | /api/books/stats | Book statistics |

### Members
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/members | Get all members |
| POST | /api/members | Register member |
| GET | /api/members/:id | Get member + history |
| PUT | /api/members/:id | Update member |
| DELETE | /api/members/:id | Deactivate (admin) |

### Borrows
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/borrows | Get all borrows |
| POST | /api/borrows | Issue book |
| PUT | /api/borrows/:id/return | Return book |
| GET | /api/borrows/stats | Dashboard stats |
| DELETE | /api/borrows/:id | Delete record (admin) |

---

## 🗄️ MongoDB Models

- **User** — name, email, password (bcrypt), role (admin/librarian)
- **Book** — title, author, isbn, category, totalCopies, availableCopies, location
- **Member** — name, email, membershipId (auto), membershipType, borrowingLimit, fineBalance
- **Borrow** — book ref, member ref, borrowDate, dueDate, returnDate, fineAmount

---

## 💡 Academic Notes

- **Authentication:** JWT tokens, bcrypt password hashing, role-based middleware
- **REST API:** 4 HTTP methods (GET, POST, PUT, DELETE) per resource
- **Search:** MongoDB Text Index on Books and Members
- **Pagination:** All list endpoints support `?page=&limit=`
- **Soft Delete:** Books and Members use `isActive` flag (data preserved)
- **Fine Calculation:** Automatic at return (LKR 10/overdue day)
- **React Context:** Global auth state with `useAuth` hook
- **Axios Interceptors:** Auto token attach + 401 redirect
