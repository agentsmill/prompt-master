# Deployment Guide for Mistrz Promptów

## Introduction

This guide provides step-by-step instructions for deploying the Mistrz Promptów application on GitHub Pages. We've set up both manual and automated deployment options for flexibility.

## Prerequisites

- A GitHub account
- Git installed on your local machine
- The Mistrz Promptów repository cloned to your local machine
- Node.js and npm installed

## Automated Deployment with GitHub Actions

The repository is configured with a CI/CD pipeline using GitHub Actions that automatically builds, tests, and deploys the application to GitHub Pages whenever changes are pushed to the main branch.

### How It Works

1. When code is pushed to the `main` branch, the GitHub Actions workflow is triggered
2. The workflow runs all tests to ensure code quality
3. If tests pass, the application is built for production
4. The built application is automatically deployed to GitHub Pages

### Viewing the Deployment Status

1. **Open GitHub Repository**: Go to your repository on GitHub
2. **Actions Tab**: Click on the "Actions" tab to see the status of the workflow
3. **View Logs**: Click on a specific workflow run to view detailed logs

## Manual Deployment

If you prefer to deploy manually, you can use the npm scripts we've set up.

### Option 1: Using npm deploy script

1. **Navigate to the Repository**: Open the terminal and navigate to the root directory of your cloned repository.

   ```bash
   cd path/to/mistrz-promptow
   ```

2. **Install Dependencies**: Make sure all dependencies are installed.

   ```bash
   npm install
   ```

3. **Deploy to GitHub Pages**: Run the deploy script which will build and deploy the application.

   ```bash
   npm run deploy
   ```

   This script:

   - Builds the application for production
   - Pushes the built files to the `gh-pages` branch
   - Makes the application available on GitHub Pages

### Option 2: Manual Build and Deploy

1. **Build the Application**: Run the following command to build the application for production.

   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages**: Use the gh-pages branch.
   ```bash
   git checkout --orphan gh-pages
   git rm -rf .
   cp -r dist/* .
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

## GitHub Pages Configuration

1. **Open GitHub Repository**: Go to your repository on GitHub
2. **Settings**: Navigate to the "Settings" tab
3. **Pages**: Click on "Pages" in the left sidebar
4. **Source**: Ensure the source is set to "Deploy from a branch" and the branch is set to `gh-pages`
5. **Save**: Your settings should be automatically saved

## Accessing the Application

Once the deployment is complete, your application will be accessible at:
`https://your-username.github.io/mistrz-promptow`

## Environment Variables

For the application to function correctly in production, make sure to:

1. Set up the required environment variables in your GitHub repository:

   - Go to Settings > Secrets and variables > Actions
   - Add repository secrets for any sensitive information (like Firebase API keys)

2. Update the `.env.example` file with any new environment variables your application needs

## Troubleshooting

- **Page Not Found**: Ensure the `gh-pages` branch exists and is set as the source in GitHub Pages settings
- **Build Errors**: Check the console output or GitHub Actions logs for any errors during the build process
- **Firebase Connection Issues**: Verify that your Firebase configuration is correctly set up for production

## Continuous Integration

The CI/CD pipeline runs the following checks:

- Unit tests
- Integration tests
- Build verification

If any of these checks fail, the deployment will not proceed. Fix the issues and push again to trigger a new deployment.

## Contact

For questions or feedback about deployment, please refer to the project documentation or open an issue in the GitHub repository.
