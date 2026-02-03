# MLM Backend API 🛠️

This is the backend service for the MLM Grocery Platform, built with Node.js and Express. It manages the product catalog, user authentication, orders, and administrative tasks.

## 🚀 Features

- **RESTful API**: Clean and documented endpoints for all platform needs.
- **ORM Integration**: Powered by Sequelize for flexible database management.
- **Multi-DB Support**: Optimized for SQLite (Development) and MySQL (Production).
- **Authentication**: Secure JWT-based authentication for users and administrators.
- **Middleware**: Rate limiting, security headers (Helmet), and request validation (Zod).
- **File Uploads**: Handles product and hero image uploads via Multer.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite / MySQL (via Sequelize)
- **Validation**: Zod
- **Security**: BCrypt, JWT, Helmet, CORS
- **Testing**: Jest & Supertest

## 🏁 Getting Started

### Installation

1.  **Navigate to the backend directory**:
    ```bash
    cd vaagai-backend-express
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Copy `.env.example` (if available) or create a `.env` file:
    ```env
    PORT=8000
    JWT_SECRET=your_jwt_secret
    NODE_ENV=development
    ```

4.  **Database Migration & Seeding**:
    The database syncs automatically on start. To seed the database with initial data:
    ```bash
    node seed.js
    ```

5.  **Start the server**:
    ```bash
    node server.js
    ```

The API will be live at `http://localhost:8000`.

## 🧪 Testing
Run the test suite:
```bash
npm test
```

## 📄 Documentation
API endpoints are organized by resource in the `routes/` directory. For specific logic, refer to the `controllers/` directory.
