## overview
I used Claude (Anthropic) as an AI assistant during this project for planning, code generation, and debugging. I used it mainly to speed up development, while ensuring I understood, tested, and refined all generated code.

## phase 1-planning and architecture 
### What I did:

- Asked for tech stack suggestions
- Asked for project folder structure
- Asked how to handle multi-tenancy

### What worked well:

- Suggested using tenantId in database
- Clean and organized folder structure

### Changes I made:

- Used Zustand instead of Redux
- Simplified folder structure

## Phase 2-Backend Development
### What I did:

- Generated Mongoose models
- Created Express routes
- Added JWT authentication
- Created seed script

### What worked well:

- Good model structure with indexes
- Clean JWT authentication
- Seed script saved time

### Fixes I made:

- Updated MongoDB connection string
- Changed port (5000 → 4000)
- Fixed CORS issues


## Phase 3-Frontend

- Generated React pages (Login, Dashboard, Jobs, etc.)
- Built public careers page
- Created apply drawer
- Set up Zustand auth store

### What worked well:

- Clean UI and mobile-friendly design
- Smooth apply drawer animation
- Good auth state management

### Fixes I made:

- Fixed JSX syntax errors
- Rewrote broken template literals
- Fixed missing <a> tag bug

## Phase 4-Debugging 

### What I did:

- Debugged CORS and MongoDB issues

### What worked well:

- Helped identify errors quickly

### Fixes I made myself:

- Changed DNS to fix MongoDB Atlas
- Used Docker for local database
- Managed port conflicts manually

### Phase 5-Sample Data
- Provided with the sample jobs from spreadsheet data and convert the csv data into MOngodb seed script

## Prompts I Used 

- "Build a full stack project structure for a multi-tenant
  careers page builder using React Vite for frontend Node.js
  with Express for backend and MongoDB"

- "Create a public careers page UI with company banner about
  section job listings filters and search make it mobile
  responsive"

- "Give me the whole code now with all missing features
  including edit page preview page SEO meta tags and
  JSON-LD structured data"

### What I Learned 
- AI cannot fix local environment issues like port conflicts and DNS problems that needs manual work
- AI helped me move faster but I had to debug and fix many things myself