Firestore Local Setup Guide
Overview

This document explains how team members can set up and verify the Firestore backend locally for the Unified Activity Tracker project.

The backend uses:

Firebase Firestore
Firebase Admin SDK
Node.js

This setup is for local development only. Sensitive files such as service account keys must not be committed to GitHub.

**1. Prerequisites**

Before starting, make sure you have:

Node.js installed
npm installed
Access to the GitHub repository
Access to the Firebase project
A valid Firebase service account key file


**2. Clone the Repository**

Clone the project from GitHub:

git clone <repo-url>
cd <repo-folder>

Then navigate to the backend server folder if applicable:

cd web-app/backend/server


**3. Install Dependencies**

Install the required backend packages:

npm install

This will install dependencies such as:

firebase-admin
dotenv


**4. Required Environment Variables**

Create a .env file in the backend server root.

Example:

GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
FIREBASE_PROJECT_ID=bts530database


Variable Descriptions

GOOGLE_APPLICATION_CREDENTIALS
Path to the Firebase service account key file
FIREBASE_PROJECT_ID
The Firebase project ID


**5. Service Account Key Setup**

Each team member must place a valid Firebase service account key in the backend server root.

Expected filename:

serviceAccountKey.json

**Important**
Do not commit this file to GitHub
Make sure .gitignore includes:

serviceAccountKey.json
.env
node_modules
