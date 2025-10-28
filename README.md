# 🌟 Next.js Portfolio

A personal learning project built with **Next.js 14 (App Router)**, demonstrating modern React practices and real-world project structure.

This project includes multiple small apps — such as a **To-Do App** with full CRUD operations — to help practice and understand how Next.js works.

---

## 🚀 Features

### 🗂️ To-Do App
- Built with **Next.js**, **TypeScript**, and **TailwindCSS**
- Supports full **CRUD** operations using a fake database (**JSON Server**)
- Local and server state synchronization
- Priority-based task sorting (`Low`, `Medium`, `High`)
- Search and filter by task name or priority
- Animated UI with toast notifications (via `react-hot-toast`)

---

## 🧰 Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **TailwindCSS**
- **JSON Server** (Fake REST API)
- **React Hot Toast** (Notification)
- **ESLint + Prettier** (Code quality)

---

## ⚙️ Getting Started

### 1️⃣ Install dependencies
```bash
npm install
2️⃣ Run the development server

    npm run dev
    The app will be available at http://localhost:3000

3️⃣ Start the fake API server

npx json-server --watch db.json --port 3001
Make sure db.json exists at the project root.
Example db.json:

{
  "todos": []
}
🧑‍💻 Development Structure

src/
 ├─ app/
 │   ├─ page.tsx              → Home page
 │   ├─ projects/
 │   │   └─ todoapp/
 │   │        └─ page.tsx     → To-Do App page
 │   └─ globals.css           → Global styles
 ├─ components/               → (optional shared UI)
 ├─ public/                   → static assets (images, icons)
 └─ db.json                   → JSON Server database