# SoftwareTemplate

## Project Overview

**SoftwareTemplate** is a starter template designed to help developers quickly build MVPs (Minimum Viable Products) without worrying about common authentication, user management, and role-based access control (RBAC). It provides a pre-configured system for **user authentication (Sign Up / Login)**, **role-based access control (RBAC)**, and **database integration** to streamline the development process. By using **SoftwareTemplate**, you can focus on building the core features of your product while leaving the essential infrastructure to the template.

Whether you're building a project dashboard, admin panel, or any application that requires user management, **SoftwareTemplate** gives you a robust foundation to get started in no time.

### Key Features:
- **Authentication**: User sign-up and login using **Firebase Authentication**.
- **Role-Based Access Control**: Assign different roles to users (admin, user, etc.) and restrict access to certain parts of the app based on the user role.
- **Database Integration**: Built-in integration with **Neon** (PostgreSQL) to store user data and handle business logic.
- **Frontend and Backend Structure**: A clean separation between the frontend (React) and backend (Express), making it easy to scale and manage the app.
- **API Integration**: Ready-made routes for user management, authentication, and more, powered by **Express**.
- **Pre-configured for MVPs**: Quickly adapt the template for new projects by focusing only on your unique business logic.

With **SoftwareTemplate**, you can skip the repetitive tasks of setting up login systems, role management, and databases, giving you more time to focus on what matters: building your product.

---

## Tech Stack

- **Frontend:**
  - **React**: A modern JavaScript library for building user interfaces. The template uses **React** to manage dynamic, state-driven UI components.
  - **Vite**: A fast build tool that provides an optimized development environment, speeding up the build and hot-reloading process.
  - **Material UI**: A React component library for building a sleek, modern UI with pre-styled components.
  - **Framer Motion**: Adds animations and transitions to the app for a smooth user experience.
  - **Formik & Yup**: Handles form state management and validation, making it easy to manage user inputs and display form errors.
  
- **Backend:**
  - **Express**: A minimal and flexible Node.js web application framework used to handle server-side logic, routing, and API calls.
  - **Firebase Authentication**: Used for user authentication, allowing users to securely sign up and log in via email/password.
  - **Neon (PostgreSQL)**: A cloud-based PostgreSQL service used to store user and app data. This project uses **pg** (PostgreSQL) for querying the database.
  - **Axios**: A promise-based HTTP client to make requests from the frontend to the backend, allowing easy interaction between React and Express.

- **Development Tools:**
  - **Vite**: A modern, fast development build tool that supports React development.
  - **Prettier**: Code formatter (optional but recommended) for automatic formatting to maintain code consistency.

- **Hosting:**
  - **Vercel**: The project is hosted on **Vercel** for easy deployment of both the frontend and backend. Vercel provides automatic scaling, zero-config deployment, and easy integration with the frontend.

---

## Getting Started

### 1. Fork the Repository
To begin working on your own version of the project, **fork** this repository to your own GitHub account:
- Go to the repository page and click the **Fork** button in the upper-right corner of the page.
- Clone your forked repository to your local machine.

### 2. Install Dependencies
Run `npm install` to install all dependencies.

### 3. Environmental Variables
## `.env` File Configuration

To run this project locally, you'll need to configure the environment variables for both the frontend and backend. Here’s what you need to include in your `.env` file for both parts of the project.



## Create a `.env` file in the `backend` folder and include the following variables:


DATABASE_URL=your_neon_database_url

FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key


CORS_ORIGIN=http://localhost:5173 # Frontend URL, change if deploying elsewhere 

## Create a `.env` file in the `root` folder and include the following variables:


VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id


VITE_API_BASE_URL=http://localhost:5000/api # Adjust if backend runs on a different port

### 4. Database Design

- Look inside the `Backend` folder and check `database.sql`.
  
#### Neon
- Create an account in Neon and insert those queries.

#### Connection
- Copy your database URL from Neon and paste it into your backend `.env` file in the `databaseURL` variable.

### 5. Running the Software

#### Frontend
- In your terminal, type:
  npm run dev

  #### backend
- In your terminal, type:
  "cd src/backend"
  "node server.js
