# EduSport API

This repository contains the backend API for EduSport, a school management software application. It provides endpoints for managing students, instructors, courses, library resources (books), and sports players.

## Prerequisites

Before you begin, ensure you have the following installed:
*[Node.js](https://nodejs.org/) (which includes npm)
*[MongoDB](https://www.mongodb.com/try/download/community) (or access to a MongoDB Atlas cluster)

## Installation & Setup

1.**Clone the repository:**
    ```bash
    git clone https://github.com/Fabianzkp/group9-cse341-project.git
    cd group9-cse341-project
    ```

2.**Install dependencies:**
    ```bash
    npm install
    ```

3.*Create Environment File:**
    Create a `.env` file in the root directory of the project and add the following environment variables:

    ```env
    # MongoDB Connection String
    MONGODB_URL=your_mongodb_connection_string

    # Express Session Secret
    SESSION_SECRET=your_strong_session_secret

    # GitHub OAuth Credentials
    GITHUB_CLIENT_ID=your_github_client_id
    GITHUB_CLIENT_SECRET=your_github_client_secret

    # Server URL (for OAuth callback)
    # Use http://localhost:3000 for local development
    # Use your production URL (e.g., https://group9-cse341-project.onrender.com) for deployment
    SERVER_URL=http://localhost:3000

    # Port (Optional - defaults to 3000)
    PORT=3000
    ```

    *   Replace `your_mongodb_connection_string` with your actual MongoDB connection URI.
    *   Replace `your_strong_session_secret` with a random, secure string for session management.
    *   Obtain `your_github_client_id` and `your_github_client_secret` by registering a new OAuth application on GitHub. Set the "Authorization callback URL" in your GitHub app settings to `${SERVER_URL}/auth/github/callback` (e.g., `http://localhost:3000/auth/github/callback` for local development).
    *   Set `SERVER_URL` to the base URL where your application will be running.

## Running the Application

To start the development server:

```bash
npm start
```

The server will typically run at `http://localhost:3000` (or the port specified in your `.env` file).

## API Documentation

This API uses Swagger for documentation. Once the server is running, you can access the interactive Swagger UI documentation in your browser:

* **Local:** `http://localhost:3000/api-docs`
* **Production:** `https://group9-cse341-project.onrender.com/api-docs`

The Swagger UI provides detailed information about all available endpoints, including request parameters, request bodies, and response schemas.

## Authentication

Most API endpoints require authentication. This application uses GitHub OAuth2 for user authentication.

* To log in, navigate to `/auth/github` in your browser or client application. This will redirect you to GitHub for authorization.
* Upon successful authorization, GitHub will redirect back to the application (`/auth/github/callback`), establishing an authenticated session.
* Subsequent requests to protected endpoints must include the session cookie managed by the browser or client.
* To log out, navigate to `/auth/logout`.

Endpoints under `/student`, `/instructor`, `/library`, `/player`, and `/course` are protected and require an active session.

## API Endpoints Overview

The API provides the following main resource collections:

* `/student`: Manage student data.
* `/instructor`: Manage instructor data.
* `/library`: Manage library resources (books).
* `/player`: Manage sports player data.
* `/course`: Manage course data.

Please refer to the [API Documentation](#api-documentation) (`/api-docs`) for detailed information on specific endpoints (GET, POST, PUT, DELETE), required parameters, and data models.

## Linting & Formatting

This project uses ESLint for linting and Prettier for code formatting.

* **Check for linting errors:**
    ```bash
    npm run lint
    ```
*   **Fix linting errors automatically:**
    ```bash
    npm run lint:format
    ```
*   **Format code using Prettier:**
    ```bash
    npm run format
    ```