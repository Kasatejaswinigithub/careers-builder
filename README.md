# Careers Builder

Multi-tenant careers page builder. Recruiters customize their branded page. Candidates browse and apply to jobs.

## Stack
- Frontend: React 18 + Vite + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: MongoDB + Mongoose (Docker or Atlas)

## Quick Start

### 1. Install
```bash
npm install
```

### 2. Start MongoDB
```bash
docker-compose up -d
```

### 3. Configure environment
The default `backend/.env` works out of the box with Docker MongoDB.

### 4. Seed demo data
```bash
npm run seed
```

### 5. Run
```bash
npm run dev
```

## URLs
- Frontend:       http://localhost:5173
- Backend:        http://localhost:4000
- Public page:    http://localhost:5173/acme/careers
- Dashboard:      http://localhost:5173/dashboard

## Demo login
- Slug: acme
- Email: admin@acme.com
- Password: password123
