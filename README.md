# MLM - Modern Grocery Platform 🥗

MLM is a comprehensive grocery shopping platform consisting of a React-based frontend and a Node.js Express backend. It offers a seamless shopping experience for customers and a robust management system for administrators.

## 📂 Project Structure

- **[`vaagai-groceries-online/`](./vaagai-groceries-online/)**: The frontend application built with React, Vite, Tailwind CSS, and shadcn/ui.
- **[`vaagai-backend-express/`](./vaagai-backend-express/)**: The backend API built with Node.js, Express, and Sequelize, supporting both SQLite (local) and MySQL (production).

## 🚀 Quick Start

To get the entire application running locally:

### 1. Setup the Backend
```bash
cd vaagai-backend-express
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

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query.
- **Backend**: Node.js, Express, Sequelize, JWT Authentication, SQLite/MySQL.
- **Design System**: Zepto-inspired UI with focus on performance and accessibility.

## 📖 Detailed Guides

- [Frontend Detailed README](./vaagai-groceries-online/README.md)
- [Full Setup & Production Guide](./SETUP.md)
- [Production Implementation Plan](./PRODUCTION_PLAN.md)

## 👤 Admin Access
The admin panel is accessible via the `/admin` route. Please refer to the setup guide for default credentials or check the database seeding scripts.

---
Built with ❤️ for MLM Groceries.

# Meato
