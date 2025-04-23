# 📬 Dhruvil's Custom Email App

A fully self-hosted email application built from scratch using Node.js, Express, IMAP, and SMTP — powered by your own domain: `dev@dhruvilrangani.com`.

> ✨ Send, receive, and thread emails using your own infrastructure — no Gmail, no third-party inbox needed!

---

## 🚀 Features

- ✅ **Send emails** using Mailjet SMTP with full tracking
- ✅ **Receive emails** using IMAP directly from your mail server
- ✅ **Threaded conversations** grouped by `Message-ID`, `In-Reply-To`, and `References`
- ✅ **Search and filter** emails by subject and sender
- ✅ **View latest messages first** (sorted by date descending)
- ✅ **Backend API** with REST endpoints to fetch/send mail
- 🔐 **Secure setup** with SSL certs via Let's Encrypt
- 🔌 **Supports integration with Thunderbird & other clients**

### 🔮 Future Scope

- ✍️ AI-assisted email writing
- 🧠 Job tracking automation
- 📚 Email tagging and folder support

---

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- `nodemailer` for SMTP
- `node-imap` for IMAP access
- `mailparser` for parsing email content
- `dotenv` for configuration

**Email Server:**
- Postfix (SMTP relay)
- Dovecot (IMAP server)
- Mailjet (SMTP service for sending)

**Infrastructure:**
- Hetzner Cloud (Ubuntu 22.04)
- Domain from GoDaddy
- SSL via Certbot + Let's Encrypt

---

## 📁 Project Structure

email-app-backend/ ├── config/ # SMTP & IMAP setup │ ├── smtp.js │ └── imap.js ├── controllers/ # Route handlers │ └── emailController.js ├── routes/ # Express routes │ └── emails.js ├── services/ # Business logic (IMAP/SMTP helpers) │ ├── imapService.js │ └── smtpService.js ├── .env # Environment variables (not committed) └── app.js # Main entry point

yaml
Copy
Edit

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000

# IMAP (incoming)
EMAIL_USER=dev@dhruvilrangani.com
EMAIL_PASS=your-imap-password
IMAP_HOST=mail.dhruvilrangani.com
IMAP_PORT=993

# SMTP (Mailjet)
SMTP_HOST=in-v3.mailjet.com
SMTP_PORT=587
SMTP_USER=your-mailjet-api-key
SMTP_PASS=your-mailjet-secret-key
📬 API Endpoints

Method	Route	Description
POST	/api/emails/send	Send a new email
GET	/api/emails/inbox	Fetch inbox with thread grouping
GET	/api/emails/search	Search inbox by subject/sender
💡 Motivation
I built this app to:

🚀 Explore the fundamentals of email infrastructure (SMTP, IMAP, SSL, DNS)

💻 Run my own inbox with full control using dev@dhruvilrangani.com

🧱 Build real-world backend systems using Node.js

🤖 Add AI-powered job application assistance (coming soon)

👨‍💻 Author
Built with ❤️ by Dhruvil Rangani

📢 Coming Soon: Frontend UI
The frontend (Next.js + Tailwind CSS) will include:

📥 Rich inbox UI with thread view

📝 Compose email interface

🔍 Search, tagging, and filters

🤖 AI tools like recruiter email suggestions and cover letter generation
 
