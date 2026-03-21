# Careers Builder

Multi-tenant careers page builder. Recruiters customize their branded page. Candidates browse and apply to jobs.

## Stack
- Frontend: React+ Vite + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: MongoDB + Mongoose (Docker)

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
## step by step user Guide

### For Recruiters

1.Go to http://localhost:5173/register
2.Enter your company name,slug,email and password
3.You will be taken to the dashboard automatically
4.click Edit page and add your brand color,logo URL,banner image URL
5.Write your About Us and Life at company sections
6.Add a culture video URL from Youtube
7.click save changes
8.click publish Now to make it live
9.Go to jobs and click on New Job and fill in the details
10.set status and save and share your careers page link with candidates

### For candidate

1.Visit the careers page URL share dbby the company
2.Read about the company and open job listings 
3.use search bar to find the jobs by title
4.use filters to narrow by location and job type 
5.click any job card to open the apply form and fill your name,email,phone and cover letter
6.click submit application


careers-v2/
├── frontend/          React + Vite app
│   └── src/
│       ├── pages/     All page components
│       ├── components/Reusable UI components
│       ├── api/       Axios API client
│       ├── store/     Zustand state management
│       └── styles/    Global CSS
├── backend/           Express API
│   └── src/
│       ├── models/    Mongoose database models
│       ├── routes/    API route definitions
│       ├── services/  Business logic
│       ├── middleware/Auth and error handling
│       └── db/        Database connection and seed
├── shared/            Shared TypeScript types
└── docker-compose.yml Local MongoDB setup