# Meato - Quick Commerce Platform 🥩🛒

Meato is a modern quick commerce platform designed for rapid delivery of meat and groceries, similar to **Swiggy Instamart** or **Zepto**. It features a high-performance React frontend and a scalable Node.js Express backend.

## 📂 Project Structure

- **[`vaagai-groceries-online/`](./vaagai-groceries-online/)**: The premium frontend application built with React, Vite, Tailwind CSS, and shadcn/ui.
- **[`meato-backend-express/`](./meato-backend-express/)**: The robust backend API built with Node.js, Express, and Sequelize.

## 🚀 Quick Start

To get the entire application running locally:

### 1. Setup the Backend
```bash
cd meato-backend-express
npm install
# The backend uses SQLite by default for easy local development.
node server.js
```
The API will be available at `http://localhost:8000`.

### 2. Setup the Frontend
```bash
cd vaagai-groceries-online
npm install
npm run dev
```
The frontend will be available at `http://localhost:8080`.

## 🛠️ Key Technologies

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query.
- **Backend**: Node.js, Express, Sequelize ORM, JWT Authentication.
- **Features**: Real-time order tracking, shop management, and delivery partner dispatch.

## 👤 Admin Access
The admin panel is accessible via the `/admin` route. Please refer to the setup guide for credentials.

---
Built with ❤️ for Meato.
