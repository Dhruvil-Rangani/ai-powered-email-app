# 📬 Custom Self-Hosted Email App

A fully self-hosted, AI-powered email application built from the ground up in Node.js + Express, using your own domain and mail server:

> Send & receive threaded emails via IMAP/SMTP, manage tags, and chat with an AI assistant-100% on your infrastructure.

---

## 🚀 Features

- 🔐 **User Authentication**  
  - Sign up / log in with `@your-domain.com` address  
  - JWT access tokens & long-lived refresh tokens  
- 📥 **Per-User IMAP Mailboxes**  
  - Dynamic IMAP credentials stored per user  
  - Maildirs auto-created on registration for Dovecot/Postfix  
- 📤 **SMTP Send**  
  - Sends via Mailjet (or any SMTP relay)  
- 🧵 **Threaded Conversations**  
  - Groups messages by `Message-ID` / `In-Reply-To` / `References`  
- 🔎 **Search & Filter**  
  - Filter by sender, subject, full-text body & date range  
- 🏷 **Email Tagging**  
  - Add & list labels on messages via REST  
- 🤖 **AI Assistant**  
  - OpenAI-powered chat endpoint for drafting, summaries, tips  
- 🔮 **Future**  
  - Frontend UI (Next.js + Tailwind)  
  - Password-reset flows  
  - More AI automations (job-hunt reminders, workflows)

---

## 🛠 Tech Stack

- **Node.js & Express** - REST API  
- **Prisma** + PostgreSQL - database & migrations  
- **JWT** - access & refresh tokens  
- **bcryptjs** - password hashing  
- **node-imap** & **mailparser** - IMAP fetch & parse  
- **nodemailer** - SMTP send  
- **OpenAI** - AI chat integration  
- **Postfix & Dovecot** - self-hosted mail server  

---

## 📁 Project Structure

email-app-backend/
├── prisma/ # Prisma schema & migrations
│ ├── migrations/
│ └── schema.prisma
├── config/
│ ├── imap.js # dynamic IMAP client factory
│ └── smtp.js # nodemailer transporter
├── controllers/
│ ├── authController.js # signup, login, refresh, logout
│ ├── emailController.js # send/fetch emails & attachments
│ ├── aiController.js # AI chat & history
│ └── tagController.js # email tagging endpoints
├── routes/
│ ├── auth.js # /api/auth/*
│ ├── emails.js # /api/emails/*
│ ├── ai.js # /api/ai/*
│ └── tags.js # /api/tags/*
├── services/
│ ├── userService.js # createUser + Maildir setup
│ ├── imapService.js # fetchInboxEmails logic
│ ├── tagService.js # CRUD on tags
│ └── chatService.js # store & retrieve chat history
├── utility/
│ └── jwt.js # signAccess, verifyAccess, expiresAt
├── middleware/
│ └── auth.js # JWT auth middleware
├── .env.example # copy to .env and fill in
├── app.js # Express app & route mounting
└── package.json

text

---

## 🔐 Environment Variables

Copy `.env.example` → `.env` and fill in:

Server
PORT=5000

PostgreSQL (Prisma)
DATABASE_URL="postgresql://USER:PASS@HOST:5432/DBNAME?sslmode=require"

JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES=15m
REFRESH_EXPIRES_DAYS=36500

IMAP (incoming)
IMAP_HOST=mail.your-domain.com
IMAP_PORT=993

SMTP (Mailjet or any SMTP)
SMTP_HOST=in-v3.mailjet.com
SMTP_PORT=587
SMTP_USER=your_mailjet_key
SMTP_PASS=your_mailjet_secret

Virtual mailbox (Dovecot/Postfix)
VIRTUAL_DOMAIN=your-domain.com
VMAIL_ROOT=/var/mail/vhosts

OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-nano
OPENAI_MAX_TOKENS=1024

Debug
DEBUG_DATES=false

text

---

## 📬 API Endpoints

All protected endpoints require header:

Authorization: Bearer <accessToken>

text

### Auth

| Method | Route                | Body                        | Description                              |
|--------|----------------------|-----------------------------|------------------------------------------|
| POST   | /api/auth/register   | { email, password }         | Create user + mailbox + Maildir          |
| POST   | /api/auth/login      | { email, password }         | Returns { accessToken, refreshToken }    |
| POST   | /api/auth/refresh    | { refreshToken }            | Returns new accessToken                  |
| POST   | /api/auth/logout     | { refreshToken }            | Invalidate refresh token                 |

### Emails

| Method | Route                                        | Query / Body                                  | Description                        |
|--------|----------------------------------------------|------------------------------------------------|------------------------------------|
| GET    | /api/emails                                 | ?from=&subject=&body=&after=&before=&folder=   | Fetch & filter inbox threads       |
| POST   | /api/emails/send                            | { to, subject, text, html?, attachments? }     | Send email via SMTP                |
| GET    | /api/emails/:messageId/attachments/:filename| -                                              | Download a specific attachment     |

### Tags

| Method | Route                    | Body / Params             | Description                     |
|--------|--------------------------|---------------------------|---------------------------------|
| POST   | /api/tags                | { messageId, label }      | Tag an email                    |
| GET    | /api/tags/:messageId     | -                         | List tags for an email          |
| GET    | /api/tags/by/:label      | -                         | List message IDs by tag label   |

### AI Chat (rate-limited)

| Method | Route           | Body                  | Description                |
|--------|-----------------|-----------------------|----------------------------|
| POST   | /api/ai/chat    | { message, history? } | Send prompt & get AI reply |
| GET    | /api/ai/history | ?limit=               | Retrieve recent chat history|

---

## ⚙️ Getting Started

1. Clone & install
git clone https://github.com/your-org/your-repo.git
cd your-repo
npm install

2. Copy & fill in your env
cp .env.example .env

edit .env with real credentials
3. Run migrations & generate Prisma client
npx prisma migrate dev --name init
npx prisma generate

4. Start server
npm run dev

text

---

## 🧪 Quick curl Tests

Register
curl -X POST http://localhost:5000/api/auth/register
-H "Content-Type: application/json"
-d '{"email":"alice@your-domain.com","password":"Test1234!"}'

Login
curl -X POST http://localhost:5000/api/auth/login
-H "Content-Type: application/json"
-d '{"email":"alice@your-domain.com","password":"Test1234!"}'

Fetch mails
curl http://localhost:5000/api/emails
-H "Authorization: Bearer <accessToken>"

Send mail
curl -X POST http://localhost:5000/api/emails/send
-H "Authorization: Bearer <accessToken>"
-H "Content-Type: application/json"
-d '{"to":"bob@your-domain.com","subject":"Test","text":"Hello"}'

AI chat
curl -X POST http://localhost:5000/api/ai/chat
-H "Authorization: Bearer <accessToken>"
-H "Content-Type: application/json"
-d '{"message":"Draft me a polite follow-up"}'

text

---

## 👨‍💻 Author

Built with ❤️ by [Dhruvil Rangani] (https://dhruvilrangani.com)

---

## 📢 Next Up

Frontend UI (Next.js + Tailwind CSS) with inbox, compose, tagging, AI widgets, and more