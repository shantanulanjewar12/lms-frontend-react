# Lets's Learn — Mini LMS Frontend

A professional React frontend for the Mini LMS Spring Boot backend.

## Tech Stack
- **React 18** + **Vite**
- **React Router v6** — client-side routing
- **Zustand** — auth + theme state (persisted to localStorage)
- **Axios** — API client with JWT interceptors
- **Tailwind CSS** — utility styling
- **Lucide React** — icons
- **React Hot Toast** — notifications
- **Fonts**: Syne (headings), DM Sans (body), JetBrains Mono (code)

## Pages
| Route | Page | Access |
|---|---|---|
| `/` | Home | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/courses` | Course Listing | Public |
| `/courses/:id` | Course Detail | Public |
| `/dashboard` | Role-based Dashboard | Auth |
| `/profile` | User Profile | Auth |
| `/my-learning` | My Enrollments | Student |
| `/learn/:courseId` | Lesson Player | Auth |
| `/instructor/courses` | Manage Courses | Instructor |
| `/instructor/courses/new` | Create Course | Instructor |
| `/instructor/courses/:id/edit` | Edit Course + Lessons | Instructor |
| `/admin/users` | User Management | Admin |
| `/admin/payments` | Payment Transactions | Admin |

## Features
- 🌙 **Dark / Light mode** — toggle in navbar, persisted across sessions
- 🔐 JWT authentication with auto-refresh and redirect on 401
- 🎨 Role-based UI — Student / Instructor / Admin dashboards
- 📱 Fully responsive (mobile-first)
- ✨ Animations — fade-up, float, gradient shifts
- 🏆 Badges, streaks, leaderboard for students
- 📊 Analytics dashboards for instructors
- 💳 Payment history + admin transaction views

---

## Setup Instructions

### Prerequisites
- Node.js **18+** (LTS recommended)
- npm **9+**
- Backend running at `http://localhost:8080`

---

### Step 1 — Install VS Code Extensions (recommended)
Open VS Code, go to Extensions (Ctrl+Shift+X) and install:
- **ESLint**
- **Prettier**
- **Tailwind CSS IntelliSense**
- **ES7+ React/Redux/React-Native snippets**

---

### Step 2 — Open in VS Code
```bash
# If you have the zip, extract it first, then:
code mini-lms-frontend
```
Or: File → Open Folder → select `mini-lms-frontend`

---

### Step 3 — Install Dependencies
Open the VS Code terminal (Ctrl+` or View → Terminal):
```bash
npm install
```
This installs all packages from `package.json`. Wait for it to complete (~1-2 min).

---

### Step 4 — Start the Backend
Make sure your Spring Boot backend is running:
```bash
# In the backend project folder:
mvn spring-boot:run
```
Backend must be at `http://localhost:8080`.

---

### Step 5 — Run the Frontend
```bash
npm run dev
```
Open your browser at: **http://localhost:3000**

The Vite dev server proxies all `/api` requests to `http://localhost:8080`.

---

### Step 6 — Build for Production
```bash
npm run build
```
Output is in the `dist/` folder. Deploy to Vercel, Netlify, or any static host.

---

## Dark Mode
- Click the ☀️/🌙 button in the top-right navbar
- The choice is saved to localStorage and persists on reload

## API Configuration
The API base URL is configured in `vite.config.js` via the proxy:
```js
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  }
}
```
For production, set `VITE_API_URL` in a `.env` file and update `src/api/index.js`.

## Environment Variables (optional)
Create a `.env` file in the root:
```
VITE_APP_TITLE=LetsLearn
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `npm install` fails | Ensure Node 18+: `node -v` |
| Blank page / 404 | Check backend is running at port 8080 |
| Login works but redirects to login again | Clear localStorage and retry |
| CORS errors in console | Add CORS config to Spring Boot SecurityConfig |
| Styles not loading | Run `npm install` again, restart dev server |

### Add CORS to Spring Boot (if needed)
In `SecurityConfig.java`, add before `.build()`:
```java
.cors(cors -> cors.configurationSource(request -> {
    var config = new org.springframework.web.cors.CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:3000"));
    config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    return config;
}))
```
