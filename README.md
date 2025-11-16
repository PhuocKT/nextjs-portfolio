# ✨ Tracking App – Internal Task & User Management System

[![Vercel Deployment Status](https://vercel-badge-server.vercel.app/api/badge/nextjs-tracking?branch=main)](https://nextjs-tracking.vercel.app/)

> A robust internal task tracking platform designed for centralized management. It allows Administrators to monitor and assign tasks to Users, built on the powerful foundation of the Next.js App Router.

---

## 🚀 Key Features

This project evolved from a learning application into a full-fledged management system with **Role-Based Access Control (RBAC)**:

### 💼 User Management & Roles
* **Secure Authentication:** Safe login procedures using **JWT** (JSON Web Tokens) and **bcrypt** for password hashing.
* **Role-Based Access:** Only **Admins** can create new user accounts and access the comprehensive Management Dashboard. User registration is disabled.
* **User CRUD:** Administrators have full control to Create, Read, Update, and Delete user accounts.

### 📋 Task Management
* **Personal To-Do List:** Assigned users can view and work on their specific tasks.
* **Status Updates:** Users can update the status of their assigned tasks (e.g., Pending, In Progress, Completed).

### 📈 Admin Dashboard
* **Overview:** A dedicated dashboard provides a complete overview of task progress and user performance metrics.
* **Tracking & Assignment:** Admins can monitor the tasks assigned to each user and their current status.

---

## 🧰 Tech Stack & Architecture

The project utilizes a modern technology stack for high performance and scalability:

| Category | Technology/Library | Purpose |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15 (App Router)** | High performance, Server Components, and Routing. |
| **Frontend** | **React 19, TailwindCSS** | Building a responsive and flexible user interface. |
| **Database** | **MongoDB** | Flexible and scalable NoSQL database. |
| **Data Layer** | **Mongoose** | **ODM** (Object Data Modeling) for seamless interaction with MongoDB. |
| **Security** | **JWT, bcrypt/bcryptjs** | User session authentication and password hashing. |
| **UI** | **Shadcn/ui (via Radix-ui)** | High-quality, customizable UI components. |

---

## ⚙️ Getting Started

To get the project running locally, you must set up the required environment variables and start the Node.js application.

### 1. Set Up Environment Variables

Create a file named `.env.local` in the project root directory and populate it with the following variables: