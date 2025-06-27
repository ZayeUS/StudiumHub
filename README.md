# SoftwareTemplate: The Modern SaaS Boilerplate

**SoftwareTemplate** is a production-ready foundation for building modern, scalable, and user-centric SaaS applications. Designed to save you hundreds of hours of development time, this template comes pre-configured with a robust suite of essential features, allowing you to bypass repetitive setup and focus directly on your unique business logic.

Whether you're launching a sophisticated project dashboard, an exclusive client portal, or any application demanding robust user management and monetization, **SoftwareTemplate** provides a powerful, opinionated, and developer-friendly foundation engineered for speed and future growth.

  \#\# Core Features

  * **Full Authentication Flow:** Secure sign-up, login, and password reset functionality powered by **Firebase Authentication**.
  * **User Profile Management:** Users can update their personal information and upload a profile avatar, with image handling managed by **Cloudinary**.
  * **Subscription & Billing Integration:**
      * Dynamic, database-driven pricing plans.
      * Seamless integration with **Stripe** for one-time payments and recurring subscriptions.
      * Backend webhooks to keep subscription statuses in sync.
  * **Polished Onboarding Experience:** A multi-step user onboarding wizard that guides new users through profile creation and plan selection for a smooth first-run experience.
  * **Modern, Responsive UI:** A sleek and professional user interface built with **Material-UI** and enhanced with subtle animations from **Framer Motion**.
      * **Light & Dark Mode:** Beautiful, theme-aware components that look great in any mode.
      * **Collapsible Sidebar:** A smart sidebar with an avatar display that saves screen space while remaining intuitive.
  * **Secure & Scalable Backend:**
      * A robust **Express.js** API with clear routing and middleware.
      * **PostgreSQL** database powered by Neon for reliable and scalable data persistence.
      * **Soft Deletes & Audit Logging:** Built-in best practices for data integrity and security.
  * **Developer-Focused:**
      * Clean, well-structured codebase with a logical separation of concerns.
      * Pre-configured with **Vite** for a lightning-fast development environment.
      * Code quality enforced by **ESLint**.

## Tech Stack

### Frontend

  * **Framework:** React 18
  * **Build Tool:** Vite
  * **UI Components:** Material-UI (MUI) v5
  * **Animations:** Framer Motion
  * **State Management:** Zustand
  * **HTTP Client:** Axios
  * **Routing:** React Router v6

### Backend

  * **Framework:** Express.js
  * **Database:** PostgreSQL (with `pg` driver)
  * **Authentication:** Firebase Admin SDK
  * **Payments:** Stripe
  * **File Storage:** Cloudinary
  * **Email:** SendGrid (via `@sendgrid/mail`)

## Getting Started

Follow these steps to get your local development environment set up and running.

### 1\. Prerequisites

  * Node.js (v18 or later)
  * npm or yarn
  * A PostgreSQL database (You can get a free one from [Neon](https://neon.tech/))
  * A Firebase project
  * A Stripe account
  * A Cloudinary account

### 2\. Fork & Clone

First, fork this repository to your own GitHub account, then clone it to your local machine:

```bash
git clone https://github.com/your-username/SoftwareTemplate.git
cd SoftwareTemplate
```

### 3\. Install Dependencies

Install all the necessary packages for both the root project and the backend.

```bash
npm install
```

### 4\. Environment Variables

This project requires two `.env` files for configuration: one for the frontend and one for the backend.

#### Frontend (`.env` file in the root directory):

Create a file named `.env` in the root of the project and add your Firebase client-side keys and the backend API URL.

```
# Firebase Client-Side Keys
VITE_FIREBASE_API_KEY="your_firebase_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain"
VITE_FIREBASE_PROJECT_ID="your_firebase_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_firebase_messaging_sender_id"
VITE_FIREBASE_APP_ID="your_firebase_app_id"

# Backend API URL
VITE_API_BASE_URL="http://localhost:5000/api"

# Stripe
VITE_STRIPE_PAYMENT_LINK="your_stripe_payment_link"
```

#### Backend (`.env` file inside the `src/backend` directory):

Create a file named `.env` inside `src/backend` and add your secret keys and database connection string.

```
# Server Configuration
PORT=5000
CORS_ORIGIN="http://localhost:5173"

# Database
DATABASE_URL="your_postgresql_connection_string"

# Firebase Admin SDK (Service Account)
FIREBASE_PROJECT_ID="your_firebase_project_id"
FIREBASE_CLIENT_EMAIL="your_firebase_client_email"
FIREBASE_PRIVATE_KEY="your_firebase_private_key"

# Stripe
STRIPE_SECRET_KEY="your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

# SendGrid (for emails)
SENDGRID_API_KEY="your_sendgrid_api_key"
FROM_EMAIL="your_verified_sender_email"
```

### 5\. Database Setup

Connect to your PostgreSQL database and run the schema script to create all the necessary tables.

```sql
-- file: src/backend/database.sql
-- (Execute the contents of this file in your database client)
```

### 6\. Run the Application

You can start both the frontend development server and the backend server concurrently.

```bash
npm run dev
```

Your application should now be running\!

  * **Frontend:** `http://localhost:5173`
  * **Backend API:** `http://localhost:5000`

## Project Structure

The project is organized with a clear separation between the frontend and backend code within the `src` directory.

```
/src
├── backend/
│   ├── routes/         # API route definitions
│   ├── middlewares/    # Custom Express middleware (e.g., authentication)
│   ├── utils/          # Utility functions (Stripe, Cloudinary, etc.)
│   ├── templates/      # HTML email templates
│   ├── db.js           # Database connection pool
│   ├── database.sql    # The complete database schema
│   └── server.js       # The main Express server entry point
│
└── frontend/
    ├── components/     # Reusable React components (navigation, loaders, etc.)
    ├── pages/          # Page-level components for different routes
    │   ├── Authenticated/
    │   └── Non-Authenticated/
    ├── store/          # Zustand store for global state management
    ├── styles/         # Global theme and styling configuration
    ├── utils/          # Frontend utility functions (e.g., API helpers)
    └── App.jsx         # Main application component with routing
```