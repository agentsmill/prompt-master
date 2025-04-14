# Mistrz Promptów - Deployment Guide

This document outlines the deployment process for the "Mistrz Promptów" application, focusing on GitHub Pages deployment and Firebase integration.

## Deployment Overview

The deployment strategy for "Mistrz Promptów" involves:

1. **GitHub Repository**: Source code management and version control
2. **GitHub Pages**: Static site hosting for the client application
3. **Firebase Services**: Backend services for authentication, database, and functions

This approach leverages free or low-cost hosting options while providing a robust infrastructure for the application.

## Prerequisites

Before deployment, ensure you have:

1. **GitHub Account**: For repository hosting and GitHub Pages
2. **Firebase Account**: For backend services
3. **Firebase Project**: Set up with Firestore, Authentication, and Functions
4. **Node.js and npm**: For build tools and dependencies
5. **Git**: For version control

## Environment Setup

### Local Development Environment

1. **Clone Repository**:

   ```bash
   git clone https://github.com/your-username/mistrz-promptow.git
   cd mistrz-promptow
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file for local development:

   ```
   FIREBASE_API_KEY=your-api-key
   FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your-messaging-id
   FIREBASE_APP_ID=your-app-id
   FIREBASE_MEASUREMENT_ID=G-your-measurement-id
   ```

4. **Configure Firebase**:
   Update `firebase-config.js` to use environment variables:
   ```javascript
   const firebaseConfig = {
     apiKey: process.env.FIREBASE_API_KEY,
     authDomain: process.env.FIREBASE_AUTH_DOMAIN,
     projectId: process.env.FIREBASE_PROJECT_ID,
     storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
     messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
     appId: process.env.FIREBASE_APP_ID,
     measurementId: process.env.FIREBASE_MEASUREMENT_ID,
   };
   ```

### Firebase Project Setup

1. **Create Firebase Project**:

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard

2. **Enable Authentication**:

   - In Firebase Console, go to "Authentication"
   - Click "Get started"
   - Enable Email/Password authentication
   - (Optional) Enable other authentication methods as needed

3. **Set Up Firestore Database**:

   - In Firebase Console, go to "Firestore Database"
   - Click "Create database"
   - Start in production mode
   - Choose a location close to your target audience

4. **Deploy Firestore Security Rules**:
   - Install Firebase CLI:
     ```bash
     npm install -g firebase-tools
     ```
   - Login to Firebase:
     ```bash
     firebase login
     ```
   - Initialize Firebase in your project:
     ```bash
     firebase init
     ```
   - Select Firestore and other services you need
   - Deploy security rules:
     ```bash
     firebase deploy --only firestore:rules
     ```

## Build Configuration

### Build Process Setup

1. **Create Build Script**:
   Add to `package.json`:

   ```json
   "scripts": {
     "build": "webpack --mode production",
     "build:dev": "webpack --mode development",
     "start": "webpack serve --mode development"
   }
   ```

2. **Configure Webpack**:
   Create `webpack.config.js`:

   ```javascript
   const path = require("path");
   const HtmlWebpackPlugin = require("html-webpack-plugin");
   const Dotenv = require("dotenv-webpack");
   const CopyPlugin = require("copy-webpack-plugin");

   module.exports = (env, argv) => {
     const isProduction = argv.mode === "production";

     return {
       entry: "./src/index.js",
       output: {
         path: path.resolve(__dirname, "dist"),
         filename: "[name].[contenthash].js",
         clean: true,
       },
       module: {
         rules: [
           {
             test: /\.js$/,
             exclude: /node_modules/,
             use: {
               loader: "babel-loader",
               options: {
                 presets: ["@babel/preset-env"],
               },
             },
           },
           {
             test: /\.css$/,
             use: ["style-loader", "css-loader"],
           },
           {
             test: /\.(png|svg|jpg|jpeg|gif)$/i,
             type: "asset/resource",
           },
         ],
       },
       plugins: [
         new HtmlWebpackPlugin({
           template: "./src/index.html",
           filename: "index.html",
         }),
         new Dotenv({
           systemvars: isProduction, // Use system environment variables in production
         }),
         new CopyPlugin({
           patterns: [
             { from: "public", to: "" }, // Copy static assets
           ],
         }),
       ],
       devServer: {
         static: {
           directory: path.join(__dirname, "dist"),
         },
         compress: true,
         port: 3000,
         hot: true,
       },
       optimization: {
         splitChunks: {
           chunks: "all",
         },
       },
       performance: {
         hints: isProduction ? "warning" : false,
       },
     };
   };
   ```

3. **Install Build Dependencies**:
   ```bash
   npm install --save-dev webpack webpack-cli webpack-dev-server html-webpack-plugin dotenv-webpack copy-webpack-plugin babel-loader @babel/core @babel/preset-env style-loader css-loader
   ```

### Environment-Specific Configuration

1. **Development Environment**:

   - Uses local `.env` file
   - Enables hot module replacement
   - Provides source maps for debugging

2. **Production Environment**:
   - Uses GitHub repository secrets
   - Optimizes and minifies code
   - Implements caching strategies

## GitHub Pages Deployment

### Repository Setup

1. **Create GitHub Repository**:

   - Go to [GitHub](https://github.com)
   - Create a new repository named `mistrz-promptow`
   - Push your local code to the repository

2. **Configure GitHub Secrets**:
   - Go to repository Settings > Secrets and variables > Actions
   - Add the following secrets:
     - `FIREBASE_API_KEY`
     - `FIREBASE_AUTH_DOMAIN`
     - `FIREBASE_PROJECT_ID`
     - `FIREBASE_STORAGE_BUCKET`
     - `FIREBASE_MESSAGING_SENDER_ID`
     - `FIREBASE_APP_ID`
     - `FIREBASE_MEASUREMENT_ID`

### GitHub Actions Workflow

1. **Create Workflow File**:
   Create `.github/workflows/deploy.yml`:

   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [main]
     workflow_dispatch:

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v3

         - name: Set up Node.js
           uses: actions/setup-node@v3
           with:
             node-version: 16
             cache: "npm"

         - name: Install dependencies
           run: npm ci

         - name: Build
           run: npm run build
           env:
             FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
             FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
             FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
             FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
             FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
             FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}
             FIREBASE_MEASUREMENT_ID: ${{ secrets.FIREBASE_MEASUREMENT_ID }}

         - name: Deploy to GitHub Pages
           uses: JamesIves/github-pages-deploy-action@v4
           with:
             folder: dist
             branch: gh-pages
   ```

2. **Enable GitHub Pages**:
   - Go to repository Settings > Pages
   - Set Source to "Deploy from a branch"
   - Select the `gh-pages` branch and `/` (root) folder
   - Click Save

### Custom Domain (Optional)

1. **Configure Custom Domain**:

   - Go to repository Settings > Pages
   - Under "Custom domain", enter your domain name
   - Click Save

2. **DNS Configuration**:
   - Add a CNAME record at your domain registrar:
     - Name: `www` or subdomain of your choice
     - Value: `your-username.github.io`
   - For apex domain, add A records pointing to GitHub Pages IP addresses

## Firebase Integration

### Firebase Hosting Configuration (Alternative to GitHub Pages)

1. **Initialize Firebase Hosting**:

   ```bash
   firebase init hosting
   ```

2. **Configure Firebase Hosting**:
   Update `firebase.json`:

   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ],
       "headers": [
         {
           "source": "**/*.@(js|css)",
           "headers": [
             {
               "key": "Cache-Control",
               "value": "max-age=31536000"
             }
           ]
         },
         {
           "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
           "headers": [
             {
               "key": "Cache-Control",
               "value": "max-age=31536000"
             }
           ]
         },
         {
           "source": "404.html",
           "headers": [
             {
               "key": "Cache-Control",
               "value": "max-age=300"
             }
           ]
         }
       ]
     }
   }
   ```

3. **Deploy to Firebase Hosting**:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

### Firebase Functions (Optional)

1. **Initialize Firebase Functions**:

   ```bash
   firebase init functions
   ```

2. **Create Admin Functions**:
   Create `functions/index.js`:

   ```javascript
   const functions = require("firebase-functions");
   const admin = require("firebase-admin");
   admin.initializeApp();

   // Set admin role for a user
   exports.setAdminRole = functions.https.onCall((data, context) => {
     // Check if request is made by an admin
     if (!context.auth.token.admin) {
       return {
         error:
           "Request not authorized. User must be an admin to fulfill request.",
       };
     }

     const email = data.email;

     return admin
       .auth()
       .getUserByEmail(email)
       .then((user) => {
         return admin.auth().setCustomUserClaims(user.uid, { admin: true });
       })
       .then(() => {
         return { result: `Success! ${email} has been made an admin.` };
       })
       .catch((err) => {
         return { error: err.message };
       });
   });

   // Update leaderboard
   exports.updateLeaderboard = functions.firestore
     .document("user_progress/{progressId}")
     .onWrite((change, context) => {
       // Get the updated document
       const newValue = change.after.data();

       if (!newValue) {
         return null; // Document was deleted
       }

       const userId = newValue.userId;

       // Get all progress documents for this user
       return admin
         .firestore()
         .collection("user_progress")
         .where("userId", "==", userId)
         .get()
         .then((snapshot) => {
           let totalScore = 0;
           let completedLessons = 0;

           snapshot.forEach((doc) => {
             const data = doc.data();
             totalScore += data.score || 0;
             if (data.completed) {
               completedLessons++;
             }
           });

           // Get user display name
           return admin
             .firestore()
             .collection("users")
             .doc(userId)
             .get()
             .then((userDoc) => {
               const userData = userDoc.data();
               const displayName = userData.displayName || "Anonymous";

               // Update leaderboard entry
               return admin
                 .firestore()
                 .collection("leaderboard")
                 .doc(userId)
                 .set({
                   userId,
                   displayName,
                   totalScore,
                   completedLessons,
                   lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                 });
             });
         });
     });
   ```

3. **Deploy Firebase Functions**:
   ```bash
   firebase deploy --only functions
   ```

## Offline Capabilities

### Service Worker Setup

1. **Create Service Worker**:
   Create `src/service-worker.js`:

   ```javascript
   const CACHE_NAME = "mistrz-promptow-v1";
   const STATIC_ASSETS = [
     "/",
     "/index.html",
     "/main.js",
     "/styles.css",
     // Add other static assets
   ];

   // Install event - cache static assets
   self.addEventListener("install", (event) => {
     event.waitUntil(
       caches.open(CACHE_NAME).then((cache) => {
         return cache.addAll(STATIC_ASSETS);
       })
     );
   });

   // Activate event - clean up old caches
   self.addEventListener("activate", (event) => {
     event.waitUntil(
       caches.keys().then((cacheNames) => {
         return Promise.all(
           cacheNames
             .filter((cacheName) => {
               return cacheName !== CACHE_NAME;
             })
             .map((cacheName) => {
               return caches.delete(cacheName);
             })
         );
       })
     );
   });

   // Fetch event - serve from cache, then network
   self.addEventListener("fetch", (event) => {
     // Skip for Firebase API requests
     if (
       event.request.url.includes("firebaseio.com") ||
       event.request.url.includes("googleapis.com")
     ) {
       return;
     }

     event.respondWith(
       caches.match(event.request).then((response) => {
         if (response) {
           return response;
         }

         return fetch(event.request).then((response) => {
           // Don't cache non-successful responses
           if (
             !response ||
             response.status !== 200 ||
             response.type !== "basic"
           ) {
             return response;
           }

           // Clone the response
           const responseToCache = response.clone();

           caches.open(CACHE_NAME).then((cache) => {
             cache.put(event.request, responseToCache);
           });

           return response;
         });
       })
     );
   });

   // Background sync for offline operations
   self.addEventListener("sync", (event) => {
     if (event.tag === "sync-user-progress") {
       event.waitUntil(syncUserProgress());
     }
   });

   // Function to sync user progress
   async function syncUserProgress() {
     try {
       const db = await openIndexedDB();
       const pendingItems = await getPendingItems(db);

       for (const item of pendingItems) {
         try {
           // Attempt to sync with server
           await syncItemWithServer(item);

           // Mark as synced
           await markItemAsSynced(db, item.id);
         } catch (error) {
           console.error("Failed to sync item:", error);
         }
       }
     } catch (error) {
       console.error("Sync failed:", error);
     }
   }

   // Helper functions for IndexedDB operations
   function openIndexedDB() {
     return new Promise((resolve, reject) => {
       const request = indexedDB.open("MistrzPromptowDB", 1);

       request.onerror = () => reject(request.error);
       request.onsuccess = () => resolve(request.result);

       request.onupgradeneeded = (event) => {
         const db = event.target.result;
         if (!db.objectStoreNames.contains("pendingSync")) {
           db.createObjectStore("pendingSync", { keyPath: "id" });
         }
       };
     });
   }

   function getPendingItems(db) {
     return new Promise((resolve, reject) => {
       const transaction = db.transaction(["pendingSync"], "readonly");
       const store = transaction.objectStore("pendingSync");
       const request = store.getAll();

       request.onerror = () => reject(request.error);
       request.onsuccess = () => resolve(request.result);
     });
   }

   function markItemAsSynced(db, id) {
     return new Promise((resolve, reject) => {
       const transaction = db.transaction(["pendingSync"], "readwrite");
       const store = transaction.objectStore("pendingSync");
       const request = store.delete(id);

       request.onerror = () => reject(request.error);
       request.onsuccess = () => resolve();
     });
   }

   function syncItemWithServer(item) {
     // Implementation depends on your API
     return fetch("/api/sync", {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify(item),
     }).then((response) => {
       if (!response.ok) {
         throw new Error("Sync failed");
       }
       return response.json();
     });
   }
   ```

2. **Register Service Worker**:
   Add to `src/index.js`:

   ```javascript
   if ("serviceWorker" in navigator) {
     window.addEventListener("load", () => {
       navigator.serviceWorker
         .register("/service-worker.js")
         .then((registration) => {
           console.log(
             "Service Worker registered with scope:",
             registration.scope
           );
         })
         .catch((error) => {
           console.error("Service Worker registration failed:", error);
         });
     });
   }
   ```

3. **Configure Webpack for Service Worker**:
   Update `webpack.config.js` to copy the service worker file:
   ```javascript
   new CopyPlugin({
     patterns: [
       { from: 'public', to: '' },
       { from: 'src/service-worker.js', to: 'service-worker.js' },
     ],
   }),
   ```

### Manifest File for PWA

1. **Create Web App Manifest**:
   Create `public/manifest.json`:

   ```json
   {
     "name": "Mistrz Promptów",
     "short_name": "Mistrz Promptów",
     "description": "Interaktywny Trening Prompt Engineeringu",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#2c3e50",
     "theme_color": "#2c3e50",
     "icons": [
       {
         "src": "/icons/icon-192x192.png",
         "sizes": "192x192",
         "type": "image/png"
       },
       {
         "src": "/icons/icon-512x512.png",
         "sizes": "512x512",
         "type": "image/png"
       }
     ]
   }
   ```

2. **Add Manifest to HTML**:
   Add to `src/index.html`:
   ```html
   <link rel="manifest" href="/manifest.json" />
   <meta name="theme-color" content="#2c3e50" />
   ```

## Post-Deployment Verification

### Deployment Checklist

1. **Functionality Testing**:

   - Test all core features
   - Verify Firebase integration
   - Check authentication flows
   - Test offline capabilities

2. **Performance Testing**:

   - Run Lighthouse audit
   - Check page load times
   - Verify asset optimization
   - Test on various devices and connections

3. **Security Testing**:
   - Verify HTTPS is enforced
   - Check Firestore security rules
   - Test authentication security
   - Verify data encryption

### Monitoring Setup

1. **Firebase Analytics**:

   - Add Firebase Analytics to track user behavior
   - Set up custom events for key interactions
   - Configure conversion tracking

2. **Error Monitoring**:

   - Implement error logging
   - Set up alerts for critical errors
   - Monitor performance issues

3. **User Feedback**:
   - Add feedback mechanism
   - Monitor user-reported issues
   - Track feature requests

## Maintenance and Updates

### Update Process

1. **Development Workflow**:

   - Develop and test locally
   - Push changes to GitHub
   - GitHub Actions automatically deploys to GitHub Pages

2. **Version Management**:

   - Use semantic versioning
   - Update cache version in service worker
   - Document changes in release notes

3. **Database Migrations**:
   - Plan for data structure changes
   - Implement migration scripts
   - Test migrations thoroughly

### Backup Strategy

1. **Regular Backups**:

   - Export Firestore data regularly
   - Back up Firebase Authentication users
   - Store backups securely

2. **Disaster Recovery**:
   - Document recovery procedures
   - Test recovery process
   - Maintain backup restoration scripts

## Conclusion

This deployment guide provides a comprehensive approach to deploying the "Mistrz Promptów" application to GitHub Pages with Firebase integration. By following this guide, you can ensure a smooth deployment process and maintain a robust, secure, and performant application.

The deployment strategy leverages free or low-cost hosting options while providing all the necessary functionality for the application, including authentication, database, and offline capabilities.
