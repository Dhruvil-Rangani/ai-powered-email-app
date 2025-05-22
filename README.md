# 📬 Custom Self-Hosted Email App

A fully self-hosted, AI-powered email application built from the ground up with Next.js frontend and Node.js + Express backend, using your own domain and mail server:

> Send & receive threaded emails via IMAP/SMTP, manage tags, and chat with an AI assistant - 100% on your infrastructure.

---

## 🚀 Features

- 🔐 **User Authentication**  
  - Modern Next.js authentication with JWT
  - Beautiful login/register pages with animations
  - Secure password handling with bcrypt
  - Persistent sessions with refresh tokens
- 📥 **Modern Email Interface**
  - Clean, responsive UI built with Next.js and Tailwind CSS
  - Real-time email updates
  - Drag-and-drop compose window
  - Mobile-first design with adaptive layouts
- 📤 **Email Management**
  - Threaded conversations view
  - Compose emails with rich text
  - Attachments support
  - Email tagging and organization
- 🤖 **AI Assistant Integration**
  - AI-powered email composition
  - Smart reply suggestions
  - Email summarization
  - Context-aware responses
- 🔮 **Future Features**
  - Password reset flows
  - Email templates
  - Advanced search filters
  - Calendar integration
  - More AI automations

---

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Hook Form** - Form handling
- **Context API** - State management
- **TypeScript** - Type safety

### Backend
- **Node.js & Express** - REST API
- **Prisma** + PostgreSQL - Database & migrations
- **JWT** - Access & refresh tokens
- **bcryptjs** - Password hashing
- **node-imap** & **mailparser** - IMAP fetch & parse
- **nodemailer** - SMTP send
- **OpenAI** - AI chat integration
- **Postfix & Dovecot** - Self-hosted mail server

---

## 📁 Project Structure
```
email-app/
├── email-app-frontend/          # Next.js frontend
│   ├── src/
│   │   ├── app/                # App router pages
│   │   │   ├── login/         # Login page
│   │   │   ├── register/      # Registration page
│   │   │   ├── inbox/         # Main inbox view
│   │   │   └── layout.tsx     # Root layout
│   │   ├── components/        # Reusable components
│   │   │   ├── ComposeCard/   # Email compose window
│   │   │   ├── Navbar/        # Navigation bar
│   │   │   └── EmailList/     # Email thread list
│   │   ├── contexts/          # React contexts
│   │   │   ├── AuthContext/   # Auth state
│   │   │   └── ComposeContext/# Compose window state
│   │   └── lib/              # Utilities
│   │       └── api.ts        # API client
│   └── public/               # Static assets
│
├── email-app-backend/         # Express backend
│   ├── prisma/               # Database schema
│   ├── controllers/          # Route controllers
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   └── middleware/           # Express middleware
```

---

## 🔐 Environment Variables

### Frontend (.env.local)
```ini
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend (.env)
```ini
# Server
PORT=5000

# PostgreSQL (Prisma)
DATABASE_URL="postgresql://USER:PASS@HOST:5432/DBNAME?sslmode=require"

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES=15m
REFRESH_EXPIRES_DAYS=36500

# IMAP (incoming)
IMAP_HOST=mail.your-domain.com
IMAP_PORT=993

# SMTP (Mailjet or any SMTP)
SMTP_HOST=in-v3.mailjet.com
SMTP_PORT=587
SMTP_USER=your_mailjet_key
SMTP_PASS=your_mailjet_secret

# Virtual mailbox (Dovecot/Postfix)
VIRTUAL_DOMAIN=your-domain.com
VMAIL_ROOT=/var/mail/vhosts

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-nano
OPENAI_MAX_TOKENS=1024
```

---

## ⚙️ Getting Started

### Frontend
```bash
# Navigate to frontend directory
cd email-app-frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Backend
```bash
# Navigate to backend directory
cd email-app-backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

---

## 🎨 Frontend Features

### Authentication
- Modern login/register pages with animations
- Form validation and error handling
- Persistent authentication state
- Protected routes

### Email Interface
- Responsive inbox layout
- Drag-and-drop compose window
- Mobile-optimized design
- Real-time updates
- Threaded conversations

### Compose Window
- Floating window with drag support
- Maximize/minimize functionality
- Mobile-optimized fullscreen mode
- Rich text editor
- Attachment support

---

## 👨‍💻 Author

Built with ❤️ by [Dhruvil Rangani](https://dhruvilrangani.com)

---

## 📢 Current Status

- ✅ Frontend authentication (login/register)
- ✅ Basic email interface
- ✅ Compose window with drag support
- ✅ Mobile responsiveness
- 🚧 Email threading
- 🚧 AI integration
- 🚧 Advanced search
- 🚧 Tag management
