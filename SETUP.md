# Vaagai Grocery Application Setup Guide

## Prerequisites
- Node.js 18+ and npm
- SQL Database (MySQL/MariaDB/SQLite)

## Backend Setup (Node.js Express)

1. **Navigate to the backend directory:**
   ```bash
   cd vaagai-backend-express
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   - The `.env` file is already pre-configured for SQLite (for testing).
   - For Production (MySQL):
     - Update `.env`:
       ```env
       DB_CONNECTION=mysql
       DB_HOST=127.0.0.1
       DB_USERNAME=root
       DB_PASSWORD=your_password
       DB_DATABASE=vaagai_db
       ```

4. **Run the Server:**
   ```bash
   node server.js
   ```
   The backend will run at `http://localhost:8000`.
   Database tables will auto-sync on start.

## Frontend Setup (React + Vite)

1. **Navigate to the frontend directory:**
   ```bash
   cd vaagai-groceries-online
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```
   The frontend will run at `http://localhost:8080` (or similar).

## Features
- **Public Shop**: Browse categories, products, cart, checkout.
- **Admin Dashboard**: Analytics, order management, catalog management.
