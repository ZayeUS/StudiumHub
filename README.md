

# SoftwareTemplate B2B: A Modern SaaS Boilerplate

**SoftwareTemplate B2B** is a production-ready foundation for building modern, scalable, and user-centric B2B SaaS applications. This boilerplate is engineered to save hundreds of hours of development time by providing a robust suite of pre-configured, essential features. It allows developers to bypass repetitive setup and focus directly on building their unique business logic.

This project is built on a modern, decoupled architecture, using **Firebase** for identity management and a powerful **Node.js (Express)** backend with a **PostgreSQL** database for core application logic.

-----

## Core Features

  * **Full Authentication Flow:** Secure sign-up, login, password reset, and Google Sign-In functionality powered by **Firebase Authentication**. The system is designed to gracefully handle account conflicts (e.g., email already exists).
  * **Organization & Team Management:**
      * Multi-user organizations with role-based access control (`admin`, `member`).
      * Admins can invite new members to their organization via secure, expiring email links.
      * Admins can manage team member roles directly from the organization dashboard.
  * **Secure File Uploads:** A highly secure and scalable file upload system using **Amazon S3 Presigned URLs**. This ensures files are uploaded directly to S3, bypassing the backend server, and that all buckets are private and encrypted by default.
  * **Subscription & Billing Integration:** Seamless integration with **Stripe** for recurring subscriptions, managed via backend logic to keep subscription statuses in sync with the application.
  * **Polished Onboarding Experience:** A multi-step user onboarding wizard with a refined two-column layout on desktop, guiding new users through profile creation and plan selection.
  * **Modern, Responsive UI:**
      * A sleek and professional user interface built with **shadcn/ui** and styled with **Tailwind CSS**.
      * **Light & Dark Mode:** A professionally designed, high-contrast slate theme that is easy on the eyes and fully theme-aware.
      * Includes a collapsible sidebar for efficient navigation on authenticated pages.
  * **Robust & Scalable Backend:**
      * A well-structured **Express.js** API with clear routing and middleware.
      * **PostgreSQL** database for reliable and scalable data persistence.
      * **Database Transactions** are used for critical operations (like user creation) to ensure data integrity and prevent inconsistent states.
  * **Developer-Focused:**
      * Clean, well-structured codebase with a logical separation between frontend and backend.
      * Pre-configured with **Vite** for a lightning-fast development environment.
      * Code quality is enforced by **ESLint**.

-----

## Tech Stack

### Frontend

  * **Framework:** React 18
  * **Build Tool:** Vite
  * **UI Components:** shadcn/ui
  * **Styling:** Tailwind CSS
  * **Animations:** Framer Motion
  * **State Management:** Zustand
  * **Routing:** React Router v6

### Backend

  * **Framework:** Express.js
  * **Database:** PostgreSQL (with `pg` driver)
  * **Authentication:** Firebase Admin SDK
  * **Payments:** Stripe
  * **File Storage:** Amazon S3
  * **Email:** SendGrid

-----

## Getting Started

### 1\. Prerequisites

  * Node.js (v18 or later)
  * An Amazon S3 bucket with an associated IAM user.
  * A PostgreSQL database.
  * A Firebase project.
  * A Stripe account.
  * A SendGrid account (for sending email invitations).

### 2\. Installation

Clone the repository and install the necessary dependencies:

```bash
git clone https://github.com/your-username/SoftwareTemplateB2b.git
cd SoftwareTemplateB2b
npm install
```

### 3\. Environment Variables

This project requires two `.env` files for configuration.

#### Frontend (`.env` file in the root directory):

Create this file and add your Firebase client-side keys.

```
# Firebase Client-Side Keys
VITE_FIREBASE_API_KEY="your_firebase_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain"
VITE_FIREBASE_PROJECT_ID="your_firebase_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_firebase_Messaginger_id"
VITE_FIREBASE_APP_ID="your_firebase_app_id"

# Backend API URL
VITE_API_BASE_URL="http://localhost:5000/api"

# Stripe
VITE_STRIPE_PAYMENT_LINK="your_stripe_payment_link"
```

#### Backend (`.env` file inside the `src/backend` directory):

Create this file and add your secret keys and database connection string.

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

# Amazon S3 (for file uploads)
AWS_REGION="your_aws_region"
AWS_ACCESS_KEY_ID="your_iam_user_access_key"
AWS_SECRET_ACCESS_KEY="your_iam_user_secret_key"
S3_BUCKET_NAME="your_s3_bucket_name"

# SendGrid (for emails)
SENDGRID_API_KEY="your_sendgrid_api_key"
FROM_EMAIL="your_verified_sender_email"
```

### 4\. Database Setup

Connect to your PostgreSQL database and execute the entire contents of the `src/backend/database.sql` file. This will create all the necessary tables, relationships, and constraints.

### 5\. Run the Application

You can start both the frontend development server and the backend server concurrently with a single command:

```bash
npm run dev
```

Your application will be running at:

  * **Frontend:** `http://localhost:5173`
  * **Backend API:** `http://localhost:5000`

-----

## Project Structure

The project is organized with a clear separation between the frontend and backend code within the `src` directory.

```
/src
├── backend/
│   ├── routes/         # API route definitions (users, profiles, organizations, etc.)
│   ├── middlewares/    # Custom Express middleware (authentication, role checks)
│   ├── utils/          # Utility functions (S3, Stripe, audit logging)
│   ├── templates/      # HTML email templates
│   ├── db.js           # Database connection pool configuration
│   ├── database.sql    # The complete database schema
│   └── server.js       # The main Express server entry point
│
└── frontend/
    ├── components/     # Reusable React components (navigation, protected routes)
    ├── pages/          # Page-level components for different routes
    │   ├── Authenticated/
    │   └── Non-Authenticated/
    ├── store/          # Zustand store for global state management (userStore.js)
    ├── hooks/          # Custom React hooks (useDirectUpload.js)
    └── App.jsx         # Main application component with routing logic
```# StudiumHub
