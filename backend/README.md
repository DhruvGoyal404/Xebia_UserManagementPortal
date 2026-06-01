# Backend README

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create .env file with required variables

3. Start server:
```bash
npm run dev  # with nodemon
npm start    # without nodemon
```

## Key Files

- **server.js** - Express app initialization
- **models/** - MongoDB schemas (User, RegistrationRequest)
- **controllers/** - Business logic for auth, admin, user
- **routes/** - API endpoint definitions
- **middleware/** - Authentication and authorization checks

## Features

- User registration with profile picture upload
- Admin approval workflow
- JWT-based authentication
- User account management
- Admin creation
- Dashboard statistics
