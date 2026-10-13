# Student Data and Placement Analysis System

Matches the synopsis (BCS 753): Node.js/Express backend, MySQL database,
HTML/CSS/JS frontend, with an admin (Placement Coordinator) role and a
student role.

## Project layout

```
sql/        schema.sql, seed.sql          — run these first
backend/    Express API against MySQL     — build this second
frontend/   Plain HTML/CSS/JS pages       — currently on mock data,
                                            not yet wired to the API
```

## 1. Database

```bash
mysql -u root -p < sql/schema.sql
mysql -u root -p < sql/seed.sql
```

This creates `student_placement_db` with Students, Companies,
Placement_Drives, Drive_Eligible_Branches, Placement_Records and Users,
and loads the same sample students/companies/drives the frontend
prototype was built against.

## 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # then fill in your MySQL password and a JWT secret
npm run seed:users        # creates the coordinator login + one login per student
npm run dev                # or: npm start
```

The API listens on `http://localhost:5000` by default. Check it's up:

```bash
curl http://localhost:5000/api/health
```

Login credentials after seeding:
- **Coordinator**: username/password from `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `.env`
- **Student**: username = roll number, password = roll number (e.g. `2302300100153` / `2302300100153`)

### API reference

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/login` | public | returns a JWT + role |
| GET | `/api/students` | admin | list, with `?branch=&minCgpa=&maxBacklogs=` filters |
| POST | `/api/students` | admin | add a student |
| PUT/DELETE | `/api/students/:rollNo` | admin | edit / remove a student |
| GET | `/api/students/:rollNo` | own record or admin | one student's profile |
| GET | `/api/students/:rollNo/eligible-drives` | own record or admin | drives that student qualifies for |
| GET | `/api/companies` | any signed-in user | list companies |
| POST | `/api/companies` | admin | add a company |
| GET | `/api/drives` | any signed-in user | list drives with eligibility + branches |
| POST | `/api/drives` | admin | schedule a drive |
| GET | `/api/drives/:driveId/eligible-students` | admin | who qualifies for a given drive |
| GET/POST | `/api/placements` | admin | list / record an outcome |
| GET | `/api/analytics/summary` | admin | headline numbers |
| GET | `/api/analytics/branch-wise` | admin | placement % per branch |
| GET | `/api/analytics/company-wise` | admin | offers made per company |
| GET | `/api/analytics/package-distribution` | admin | CTC bucketed counts |
| GET | `/api/analytics/year-wise` | admin | placements per year |

## 3. Frontend

The `frontend/` folder is a working prototype (login, student dashboard,
admin dashboard) built against an in-browser mock data layer
(`frontend/js/data.js`), so it can be clicked through before the backend
exists. The next step is replacing `data.js`'s functions with `fetch()`
calls to the API above and storing the JWT from `/api/auth/login` in
`sessionStorage` — happy to do that pass once the backend is confirmed
working against your MySQL instance.

To preview the current prototype on its own, just open
`frontend/index.html` in a browser — no server needed yet.
