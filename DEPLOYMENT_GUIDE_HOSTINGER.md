# Hostinger Deployment Guide for Vaagai

This guide explains how to deploy the Vaagai Store (React Frontend + Node.js Backend) on Hostinger.

## Prerequisites
- Hostinger Business or Cloud Hosting (with Terminal/SSH access) or VPS.
- Domain name pointed to Hostinger.

---

## 1. Backend Deployment (Node.js)

### Step 1: Upload Files
Upload the `vaagai-backend-express` folder to your server (e.g., via Git clone or File Manager).

### Step 2: Install Dependencies
```bash
cd vaagai-backend-express
npm install --production
```

### Step 3: Configure Environment
Create a `.env` file in the root of `vaagai-backend-express`:
```env
PORT=8000
NODE_ENV=production
JWT_SECRET=your_long_random_secret_here
ALLOWED_ORIGINS=https://yourdomain.com
APP_URL=https://api.yourdomain.com

# Database (MySQL - Create this in Hostinger Panel)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=u123456789_vaagai
DB_USERNAME=u123456789_user
DB_PASSWORD=your_secure_password
```

### Step 4: Run Migrations & Seeds
```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### Step 5: Start with PM2
```bash
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save
```

---

## 2. Frontend Deployment (React)

### Step 1: Prepare Build
On your local machine, update `src/lib/axios.ts` to point to your production API URL:
```typescript
const api = axios.create({
    baseURL: 'https://api.yourdomain.com/api',
    // ...
});
```
Then run:
```bash
npm run build
```

### Step 2: Upload Files
Upload the contents of the `dist` folder to your public directory (e.g., `public_html/`).

### Step 3: Configure `.htaccess`
Create an `.htaccess` file in `public_html/` to handle React Router:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 3. Subdomain for API (Optional but Recommended)
If you want to host your API on `api.yourdomain.com`:
1. Create the `api` subdomain in Hostinger.
2. Setup a Reverse Proxy in Hostinger (if using VPS) or use Hostinger's Node.js selector (if using Shared/Cloud Business).
3. If using Shared Hosting (Node.js Selector), follow Hostinger's specific UI steps to link the app to the subdomain.

---

## 4. Verification Check
- [ ] Visit `yourdomain.com` - Frontend should load.
- [ ] Try logging in - Auth API should respond.
- [ ] Check images - They should load from `api.yourdomain.com/storage/...`.
