# GDG DevFest Gandhinagar - AI Content Moderation Tool

This project is a **Next.js application** for content moderation at GDG DevFest Gandhinagar.  
It uses **Google Gemini LLM API** for text analysis and **NextAuth + Prisma** for authentication & authorization.  

Users can sign in with Google, enter content for moderation, and get structured results on:

- ✅ Code of Conduct violations  
- 🚫 NSFW / inappropriate material  
- ⚠️ Spam / low-quality / controversial content  

Moderation results are stored in a database (via Prisma ORM).

---

## 🚀 Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
```

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Now open [http://localhost:3000](http://localhost:3000).

---

## ⚙️ Environment Variables (`.env.local`)

You’ll need to configure the following environment variables at the root of your project:

```env
# === App Configuration ===
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key # generate with: openssl rand -base64 32

# === Google OAuth (for NextAuth) ===
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# === Database ===
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME

# === Gemini API Key ===
GEMINI_API_KEY=your-gemini-api-key
```

👉 **Important:**  
- Replace placeholders with your actual values.  
- Generate OAuth credentials from Google Cloud (for NextAuth).  
- Get your **Gemini API key** from [Google AI Studio](https://aistudio.google.com/).

---

## 📝 Customizing Moderation Prompt

The moderation rules are **not hardcoded inside the API route anymore**.  
Instead, they are extracted into a separate utility:

### Moderation Prompt Configuration

1. Copy `utils/moderationPrompt.sample.js` to `utils/moderationPrompt.js`
2. Customize the prompt content for your specific event/organization
3. Update the event name and moderation rules as needed

**`utils/moderationPrompt.js`**

➡️ To **update how content is analyzed**, just edit `utils/moderationPrompt.js`.  
No need to modify your API or frontend — changes apply globally.

---

## 🖼️ Frontend Flow

- On visiting the app:
  - If **not signed in** → Google Sign-In button  
  - If **signed in but unauthorized** → Unauthorized Page  
  - If **signed in and authorized** →  
    - Enter text in moderation form  
    - Results show status → Approved / Flagged / Blocked  
    - Feedback explains the decision briefly  
    - History & Admin dashboard are accessible  

---

## 🔌 Tech Stack

- [Next.js 14 (App Router)](https://nextjs.org/)  
- [NextAuth.js](https://next-auth.js.org/) (Google OAuth)  
- [Prisma ORM](https://www.prisma.io/) (PostgreSQL DB)  
- [Google Gemini API](https://ai.google.dev/) (Text analysis LLM)  
- [Tailwind CSS](https://tailwindcss.com/) (UI styling)  

---

## 📦 Database Schema (Prisma)

Run migrations with:

```bash
npx prisma migrate dev
```

---

## ✅ Deployment

The easiest way is on **Vercel**.  

Make sure to add all `.env` variables in your **Vercel project settings**.

---

## 🙌 Contribution

Pull requests are welcome — whether it’s refining **prompt tuning**, improving **frontend UX**, or evolving the **moderation rules**.

---

## 🔒 Notes

- This tool is **only** for GDG DevFest moderation.  
- Please **don’t misuse the API** or bypass the checks.  
- Prompt customization lives at → `utils/moderationPrompt.js`.  
