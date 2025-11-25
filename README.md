 # Menu Makers - Portfolio Website

A modern, responsive portfolio website showcasing the full-stack development capabilities of the Menu Makers team.

## Team Members

- **Jatinder Kaur** - Team Lead & Project Coordinator
- **Mansi Keer** - UI/UX Designer  
- **Madhusudan Mainali** - Documentation & Quality Assurance Specialist
- **Ramesh Kumawat** - Technical Lead & Developer

## Features

- 🎨 Modern, responsive design with glassmorphism effects
- 👥 Individual team member portfolios
- 📱 Mobile-first approach with cross-device compatibility
- 💾 SQLite database integration for client inquiries
- 📧 Contact form with email notifications
- 🔐 Secure admin dashboard with authentication
- 📊 Real-time inquiry management and tracking
- 🔒 Security features and rate limiting
- ⚡ Fast loading and optimized performance
- 📋 Professional admin interface for client management

## Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript (ES6+)
- Responsive design with CSS Grid and Flexbox
- Modern animations and transitions

**Backend:**
- Node.js with Express.js
- SQLite database for lightweight data storage
- RESTful API design
- Admin authentication system

**Features:**
- Contact form with database storage
- Admin dashboard for inquiry management
- Email notifications via Nodemailer
- Security middleware (Helmet, CORS, Rate Limiting)
- Environment configuration
- Real-time inquiry tracking and status updates

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   PORT=3000
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your-secure-password
   SESSION_SECRET=your-session-secret
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open your browser and visit:
   - Main website: `http://localhost:3000`
   - Admin login: `http://localhost:3000/login`
   - Admin dashboard: `http://localhost:3000/admin`

## Project Structure

```
menu-makers/
├── public/
│   ├── css/
│   │   ├── admin.css
│   │   └── login.css
│   ├── js/
│   ├── images/
│   ├── index.html
│   ├── admin.html
│   └── login.html
├── client_inquiries.db (SQLite database)
├── server.js
├── package.json
├── .env
└── README.md
```

## Admin Features

The project includes a comprehensive admin dashboard with:

- 📊 **Statistics Dashboard** - View inquiry counts and metrics
- 📋 **Inquiry Management** - Browse, filter, and search client inquiries
- 📧 **Email Integration** - Reply to clients directly from the dashboard
- 🏷️ **Status Tracking** - Mark inquiries as responded or pending
- 👥 **Team Assignment** - Assign inquiries to specific team members
- 🔍 **Advanced Filtering** - Filter by status, team member, or search terms
- 📱 **Responsive Design** - Works on all devices
- 🔄 **Auto Refresh** - Real-time updates every 30 seconds

## Admin Access

To access the admin dashboard:

1. Visit `/login` on your deployed site
2. Use the credentials set in your `.env` file:
   - Username: Set via `ADMIN_USERNAME`
   - Password: Set via `ADMIN_PASSWORD`
3. After successful login, you'll be redirected to the admin dashboard

## Deployment Options

### Option 1: Vercel Deployment (FREE & Recommended) 🚀

**Easy One-Click Deployment:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Menu-Makers/menu-makers-portfolio)

**Manual Vercel Setup:**
1. Sign up at [Vercel.com](https://vercel.com) (FREE)
2. Connect your GitHub account
3. Import this repository: `Menu-Makers/menu-makers-portfolio`
4. Add environment variables in Vercel dashboard:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your-secure-password
   SESSION_SECRET=your-random-secret-string
   ```
5. Deploy! ✨

**Features that work on Vercel:**
- ✅ Beautiful portfolio website
- ✅ Contact form with email notifications
- ✅ Responsive design and animations
- ✅ Fast global CDN
- ✅ Automatic HTTPS
- ✅ Serverless functions

### Option 2: GitHub Actions Auto-Deploy
Set up these secrets in GitHub repository settings:
- `VERCEL_TOKEN` (from Vercel dashboard)
- `VERCEL_ORG_ID` (from Vercel dashboard)
- `VERCEL_PROJECT_ID` (from Vercel dashboard)
- `EMAIL_USER`, `EMAIL_PASS`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SESSION_SECRET`

Push to `main` branch → automatic deployment!

- **Railway** - `railway deploy` (Modern, easy deployment)
- **Heroku** - Full-stack deployment with SQLite
- **Render** - Free tier available for full-stack apps
- **DigitalOcean App Platform** - Professional deployment
- **Vercel** - Configure for Node.js backend support

### Option 2: Static Frontend Only (GitHub Pages)
To deploy only the frontend to GitHub Pages:

1. The contact form will be display-only (no backend functionality)
2. Admin dashboard will not be functional without backend
3. Only the portfolio showcase will work

**GitHub Pages Setup:**
```bash
# Push to GitHub
git remote add origin https://github.com/Menu-Makers/menu-makers-portfolio.git
git branch -M main
git push -u origin main

# Enable GitHub Pages in repository settings
# Choose: Deploy from a branch → main → / (root)
```

**Live Demo:** https://menu-makers.github.io/menu-makers-portfolio/

**Note:** The GitHub Pages version will show the portfolio website but contact form and admin features require the full-stack deployment.

### Option 3: Hybrid Deployment
- Frontend: GitHub Pages (static portfolio)
- Backend: Railway/Heroku (API endpoints)
- Configure CORS for cross-origin requests

### Environment Variables for Production

Make sure to set these environment variables on your hosting platform:
- `PORT` (usually auto-assigned)
- `EMAIL_USER` (Gmail address for notifications)
- `EMAIL_PASS` (Gmail app password)
- `ADMIN_USERNAME` (admin dashboard username)
- `ADMIN_PASSWORD` (admin dashboard password)
- `SESSION_SECRET` (random string for session security)

## Contact

For inquiries about our development services, please use the contact form on our website.

---

© 2025 Menu Makers Team. All rights reserved.
