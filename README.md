# Lets's Learn — Mini LMS Frontend

A professional React frontend for the Mini LMS Spring Boot backend.

## 🚀 Live Demo

🔗 **[https://development.dzt6pjgfqs25v.amplifyapp.com/](https://development.dzt6pjgfqs25v.amplifyapp.com/)**

---

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

## 🎨 UI Design — Figma Screenshots

All pages were designed in Figma before implementation. Below are the actual design references used during development.

---

### 🌐 Public Pages

#### 🏠 Home Page (Light Mode)
> Landing page with hero section, featured courses, and call-to-action

![Home Page](Figma%20Design%20of%20web%20page/1.Home_Page.png)

---

#### 🌙 Home Page (Dark Mode)
> Dark theme variant of the landing page

![Home Page Dark](Figma%20Design%20of%20web%20page/1.Home_Page_dark_view.png)

---

#### 🔍 Explore / Course Listing Page
> Browse and filter all available courses

![Explore Page](Figma%20Design%20of%20web%20page/2.Explore_page.png)

---

#### 🏆 Leaderboard Page
> Top learners ranked by points, badges, and streaks

![Leaderboard Page](Figma%20Design%20of%20web%20page/3.LeaderBoard_page.png)

---

#### 🔐 Login Page
> JWT-based user authentication

![Login Page](Figma%20Design%20of%20web%20page/4.Login_page.png)

---

#### 📝 Register / New User Page
> New user sign-up form with validation

![Register Page](Figma%20Design%20of%20web%20page/5.Register_NewUser_page.png)

---

### 🎓 Student (Logged In) Pages

#### 📊 Student Dashboard
> Overview of enrolled courses, progress, streaks, and activity

![Student Dashboard](Figma%20Design%20of%20web%20page/9.Student_Login_DashBoard_page.png)

---

#### 📚 Student — My Courses
> List of courses the student is enrolled in

![Student Courses](Figma%20Design%20of%20web%20page/10.Student_Login_Courses_page.png)

---

#### 🎯 Student — My Learning
> Active lessons, progress tracking, and resume learning

![My Learning](Figma%20Design%20of%20web%20page/11.Student_Login_MyLearning_page.png)

---

#### 📈 Student — Analytics
> Personal learning analytics, time spent, and performance graphs

![Student Analytics](Figma%20Design%20of%20web%20page/12.StudentLogin_AnalyticsPage.png)

---

#### 🥇 Student — Achievements & Badges
> Earned badges, streaks, milestones, and rewards

![Achievements](Figma%20Design%20of%20web%20page/13.Student_Login_Achievement_page.png)

---

#### 💳 Student — Payments
> Enrollment payment history and receipts

![Student Payments](Figma%20Design%20of%20web%20page/14.Student-Login_Payment-page.png)

---

#### 🔔 Student — Notifications
> Alerts, course announcements, and system updates

![Notifications](Figma%20Design%20of%20web%20page/15.Student_login_Notification.png)

---

### 👨‍🏫 Instructor Pages

#### 🖥️ Instructor Dashboard
> Overview of published courses, student enrollments, and revenue

![Instructor Dashboard](Figma%20Design%20of%20web%20page/6.InstructorLogin_Dashboard_page.png)

---

#### 📋 Instructor — My Courses
> Manage, edit, publish, and create courses

![Instructor Courses](Figma%20Design%20of%20web%20page/7.InstructorLogin_MyCourses_page.png)

---

#### 📊 Instructor — Analytics
> Revenue charts, enrollment trends, and student engagement data

![Instructor Analytics](Figma%20Design%20of%20web%20page/8.Instructor_Analytics_page.png)

---

### 🛡️ Admin Pages

#### 🔑 Admin Login View
> Admin-specific portal entry

![Admin Login](Figma%20Design%20of%20web%20page/16.Admin_Login-page.png)

---

#### 👥 Admin — User Management
> View, manage, and moderate all registered users

![User Management](Figma%20Design%20of%20web%20page/17.ADminLogin_user_page.png)

---

#### 💰 Admin — Payment Transactions
> Platform-wide transaction records and payment history

![Payment Transactions](Figma%20Design%20of%20web%20page/18.AdminLogin_PaymentTransaction_page.png)

---

#### 📊 Admin — Platform Analytics
> System-wide usage stats, active users, and platform health

![Platform Analytics](Figma%20Design%20of%20web%20page/19.AdminLogin_Platform_Analtics_page.png)

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
