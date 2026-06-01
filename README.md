# User Management Portal

Full-stack user management system with admin approval workflow and Cloudinary-backed profile pictures.

**Live:**
- Frontend: https://xebia.dhruvgoyal.tech
- Backend: https://xebia-user-management-portal.vercel.app

**Repo:** https://github.com/DhruvGoyal404/Xebia_UserManagementPortal

---

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Atlas), JWT, bcryptjs, Cloudinary
- **Frontend:** React 18 (CRA), React Router, Context API, Axios
- **Deployment:** Vercel (separate projects for backend and frontend)

---

## Features

- **Users:** Register → Pending → Admin Approval → Login → Dashboard
- **Admins:** Approve/reject requests, manage users (activate/deactivate), create new admins
- **Profile pics:** Uploaded to Cloudinary on registration, URL stored in MongoDB
- **Theming:** Light / dark mode toggle with localStorage persistence
- **Auth:** JWT-based with route guards (Protected + Guest routes) and 401 auto-logout

---

## Local Development

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in real values
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# create .env.local with: REACT_APP_API_URL=http://localhost:5000
npm start
```

---

## Environment Variables

### Backend `.env`
```env
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=replace_with_a_long_random_string

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

PORT=5000
NODE_ENV=production
```

### Frontend `.env.local` (dev)
```env
REACT_APP_API_URL=http://localhost:5000
```

For production (Vercel), set `REACT_APP_API_URL` to your deployed backend URL in the frontend project's environment variables.

---

## Cloudinary Setup

1. Create a free account at https://cloudinary.com
2. Dashboard → copy `Cloud Name`, `API Key`, `API Secret`
3. Add these as env vars in:
   - Local `backend/.env`
   - Vercel backend project → Settings → Environment Variables

Profile pictures are uploaded to the folder `user-management/profile-pics` and stored with `width: 400, height: 400, crop: 'fill', gravity: 'face'` transformation. Returned `secure_url` is saved on the `User.profilePic` field.

---

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

---

## Deployment (Vercel — two separate projects)

Both projects deploy from the same GitHub repo, with different **Root Directory** settings.

**Backend project**
- Root Directory: `backend`
- Framework Preset: Other
- Env vars: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

**Frontend project**
- Root Directory: `frontend`
- Framework Preset: Create React App
- Env vars: `REACT_APP_API_URL` (the deployed backend URL, no trailing slash)

**MongoDB Atlas:** Network Access → add `0.0.0.0/0` to allow Vercel serverless functions.

---

## Notes

- Passwords are hashed with bcryptjs (salt rounds 10)
- JWT tokens expire after 7 days
- Profile pictures persist on Cloudinary — no local disk writes (Vercel serverless has no persistent filesystem)
- CORS is currently open to all origins (tighten in `backend/server.js` for production hardening)
- First admin must be seeded manually in MongoDB (chicken-and-egg with `/api/admin/create-admin`)

---

Made by Dhruv Goyal
