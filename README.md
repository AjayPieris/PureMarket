<div align="center">

<img src="./frontend/public/logo.png" alt="PureMarket Logo" width="100" />

# PureMarket

### A Full-Stack Multi-Vendor E-Commerce Platform

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Vite](https://img.shields.io/badge/Vite-Build%20Tool-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

[🌐 Live Demo](https://your-live-url.vercel.app) &nbsp;·&nbsp; [📹 Video Walkthrough](https://youtube.com) &nbsp;·&nbsp; [🐛 Report a Bug](https://github.com/your-repo/issues)

</div>

---

## 📌 Overview

**PureMarket** is a production-ready, full-stack multi-vendor e-commerce marketplace built with the MERN stack. It supports three distinct user roles — **Customer**, **Vendor**, and **Admin** — each with a dedicated dashboard and tailored feature set. Vendors can list and manage products, customers can browse, purchase, and review items, and admins have complete oversight of the platform.

---

## ✨ Features

### 👤 Authentication & Security
- JWT-based authentication with 7-day token expiry
- Role-based access control (`customer`, `vendor`, `admin`)
- Password hashing with **bcryptjs**
- Forgot/Reset password flow via **Nodemailer** (Gmail SMTP) with secure SHA-256 hashed tokens (1-hour expiry)
- Account blocking — blocked users are denied access on login

### 🛍️ Customer
- Browse all active product listings with images, prices, and ratings
- View detailed product pages with vendor information and reviews
- Add to cart and proceed to checkout with shipping address input
- Instant **Buy Now** functionality for single-item purchases
- Track order history and status in a personal dashboard
- Leave verified reviews — only customers who have purchased a product can review it (one review per product)
- Edit or delete own reviews

### 🏪 Vendor
- Register and await admin approval before listing products
- Full product management: **Create, Read, Update, Delete (CRUD)**
- Upload up to **4 product images** via **UploadThing** (CDN-hosted)
- View orders containing their products with customer details
- Submit a store link for admin review

### 🛠️ Admin
- Real-time dashboard stats: total users, vendors, products, and platform revenue
- View all vendors with product counts; **approve or delete** vendor accounts
- View all customers with order counts; **block or unblock** any user
- Monitor and manage all platform orders with full status update control
- Override or delete any product review

### 🧾 Orders
- Full order lifecycle: `Pending → Processing → Shipped → Delivered → Cancelled`
- Automatic stock decrement on order creation
- Stock restoration on order cancellation
- Order access is strictly scoped — only the customer, admin, or a vendor whose product is in the order can view it

---

## 🗂️ Project Structure

```
PureMarket/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── adminController.js    # Admin stats, vendor & user management
│   │   ├── authController.js     # Register, login, JWT, password reset
│   │   ├── orderController.js    # Order CRUD, status management
│   │   ├── productController.js  # Product CRUD, buy now
│   │   └── reviewController.js   # Review CRUD, purchase verification
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification, role guards
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── adminRoutes.js
│   ├── uploadthing.js            # UploadThing file upload handler
│   └── server.js                 # Express app entry point
│
└── frontend/
    ├── public/
    │   └── logo.png
    ├── src/
    │   ├── api/                  # Axios API call modules
    │   ├── components/           # Reusable UI components
    │   ├── context/              # React Context (auth state)
    │   ├── pages/
    │   │   ├── home.jsx
    │   │   ├── login.jsx
    │   │   ├── register.jsx
    │   │   ├── product.jsx
    │   │   ├── ProductDetails.jsx
    │   │   ├── cart.jsx
    │   │   ├── Checkout.jsx
    │   │   ├── OrderSuccess.jsx
    │   │   ├── UserDashboard.jsx
    │   │   ├── vendor.jsx
    │   │   ├── VendorOrders.jsx
    │   │   ├── admin.jsx
    │   │   ├── ForgotPassword.jsx
    │   │   └── ResetPassword.jsx
    │   └── App.jsx
    ├── vercel.json               # SPA rewrite rules for Vercel
    └── vite.config.js
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, React Router v7, Vite, Tailwind CSS |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | JSON Web Tokens (JWT), bcryptjs |
| **File Uploads** | UploadThing (CDN) |
| **Email** | Nodemailer (Gmail SMTP) |
| **Icons** | Lucide React, React Icons, FontAwesome |
| **HTTP Client** | Axios |
| **Deployment** | Vercel (Frontend), Render / Railway (Backend) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB** database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- An **UploadThing** account for file uploads
- A **Gmail** account for transactional emails

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/puremarket.git
cd puremarket
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key

# Nodemailer (Gmail SMTP)
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password

# UploadThing
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id

# Frontend URL (for password reset emails)
FRONTEND_URL=http://localhost:5173
```

```bash
npm run dev
```

The API server will start on `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔐 API Endpoints

### Auth
| Method | Endpoint | Access |
|---|---|---|
| `POST` | `/api/auth/register` | Public |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/auth/me` | Private |
| `POST` | `/api/auth/forgot-password` | Public |
| `POST` | `/api/auth/reset-password/:token` | Public |
| `PATCH` | `/api/auth/store-link` | Vendor |

### Products
| Method | Endpoint | Access |
|---|---|---|
| `GET` | `/api/products` | Public |
| `GET` | `/api/products/:id` | Public |
| `POST` | `/api/products` | Vendor |
| `PUT` | `/api/products/:id` | Vendor (owner) |
| `DELETE` | `/api/products/:id` | Vendor (owner) |
| `POST` | `/api/products/:id/buy` | Customer |

### Orders
| Method | Endpoint | Access |
|---|---|---|
| `POST` | `/api/orders` | Customer |
| `GET` | `/api/orders/my` | Customer |
| `GET` | `/api/orders/vendor` | Vendor |
| `GET` | `/api/orders` | Admin |
| `GET` | `/api/orders/:id` | Owner / Vendor / Admin |
| `PATCH` | `/api/orders/:id/status` | Admin |

### Reviews
| Method | Endpoint | Access |
|---|---|---|
| `POST` | `/api/reviews/product/:productId` | Customer (verified purchase) |
| `GET` | `/api/reviews/product/:productId` | Public |
| `PATCH` | `/api/reviews/:id` | Owner / Admin |
| `DELETE` | `/api/reviews/:id` | Owner / Admin |

### Admin
| Method | Endpoint | Access |
|---|---|---|
| `GET` | `/api/admin/stats` | Admin |
| `GET` | `/api/admin/vendors` | Admin |
| `PATCH` | `/api/admin/vendors/:id/approve` | Admin |
| `DELETE` | `/api/admin/vendors/:id` | Admin |
| `GET` | `/api/admin/users` | Admin |
| `PATCH` | `/api/admin/users/:id/block` | Admin |

---

## 🌐 Deployment

### Frontend (Vercel)
The `frontend/vercel.json` is already configured for SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Simply connect your GitHub repo to Vercel and set the **Root Directory** to `frontend`.

### Backend
Deploy to **Render**, **Railway**, or **Fly.io**. Add all environment variables from your `.env` file to the platform's environment settings.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Made with ❤️ by **Ajay**

</div>
