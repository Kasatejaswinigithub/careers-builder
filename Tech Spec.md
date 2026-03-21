# Tech Spec -Careers Page Builder

## Assumptions
- Every company has a unique slug and each company's data is compleetely separte from others 
- one workspace means one company You can create your own workspace and publish your pages
- Jobs marked as "draft" are not visible to candidates only published pages are accessible and visible to candidates
- Free plan companies get basic branding features


## Architecture

### Frontend
- React with vite for fast developemnt
- Typescript for type safety
- Tailwind css for responsive user interface
- zustand for global state management
- Axios for API calls with automatic JWT
- React Router for page navigation

### Backend
Node.js with Express framework 
- Typescript
- JWT for authentication
- Mongoose for Mongodb operations
- zod for request validation
- CORS for frontend origin

### Database
- MOngodb(Docker)
- Each collection has tenantId to separate company data

### Multi-tenancy approach
- Evey document in the database has a tenantId field
- One tenant cannot access another tenants data

### Database Schema

### Tenant
- slug:unique company identifier
- name:company display name
- plan:free/pro/enterprise
- published:boolean
- branding:object containing colors.logo,banner,video URL

### User
- tenantId:reference to tenant
- email:unique per tenant
- passwordHash:bcrypt hashed password
- role:admin/recruiter/viewer

### job
- tenantId:reference to Tenant
- title,description,location
- jobType:full-time/part-time/contract/internship
- status:draft/published/closed
- salaryRange:string

### Application
- tenantId:reference to Tenant
- jobId:reference to JOB
- application-name,email,phone,linkedin
- coverLetter:text
- status:new/reviewing/shortlisted/rejected/hired

## API Endpoints
### public
- GET /api/public/:slug -get company info
- GET /api/public/:jobs -get published jobs
- POST /api/public/:slug/jobs/:jobId/apply -submit application

### protected
- POST /api/auth/login — login
- POST /api/auth/register — create workspace
- GET/PATCH /api/tenant — get and update branding
- CRUD /api/jobs — manage jobs
- GET /api/applications — view applications

## Test plan 

### Manual tests
1.Register new workspace->should create tenant and login
2.Login with wrong password->show error message
3.Create Job with status draft->should not appear on careers page
4.Create job with status published->should appear on career page
5.Apply for job->application appears in dashboard
6.Two different tenants->cannot see each others data
7.Invalid JWT token->redirects to login page 
