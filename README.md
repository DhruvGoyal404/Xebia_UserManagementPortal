# User Management Portal 🚀

Full-stack user management system with admin approval workflow.

## Quick Start

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

## Features

**Users:** Register → Pending → Admin Approval → Login → Dashboard

**Admins:** Approve requests, manage users, activate/deactivate accounts, create admins

## Tech Stack

- **Backend:** Node.js, Express, MongoDB, JWT, bcryptjs
- **Frontend:** React 18, React Router, Context API, Axios
- **Deployment:** Vercel (both)

## Environment Variables

**Backend (.env):**
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=production
```

**Frontend (.env.production):**
```env
REACT_APP_API_URL=https://your-backend-url.vercel.app
```

## API Endpoints

| Endpoint | Method | Auth |
|----------|--------|------|
| `/api/auth/register` | POST | No |
| `/api/auth/login` | POST | No |
| `/api/admin/pending-requests` | GET | Admin |
| `/api/admin/approve-request/:id` | POST | Admin |
| `/api/admin/reject-request/:id` | POST | Admin |
| `/api/admin/all-users` | GET | Admin |
| `/api/admin/toggle-user-status/:id` | POST | Admin |
| `/api/admin/create-admin` | POST | Admin |
| `/api/admin/dashboard-stats` | GET | Admin |
| `/api/user/profile` | GET | User |
| `/api/user/update-profile` | PUT | User |

## Deployment

**Vercel (Recommended):**
1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables
4. Deploy (auto on push)

See docs for detailed instructions.

## Notes

- Passwords: hashed with bcryptjs
- JWT: 7-day expiry
- File uploads: development only (use S3/Cloudinary for production)
- CORS: enabled for all origins

## Support

For issues, check `.env` variables and verify MongoDB connection.

---

**Made with ❤️**
