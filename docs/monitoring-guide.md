# Monitoring Guide for Mistrz Promptów

This document provides a comprehensive guide to the monitoring system implemented for the Mistrz Promptów application. It covers the monitoring setup, available tools, how to access the monitoring dashboard, and how to interpret the collected data.

## Table of Contents

1. [Overview](#overview)
2. [Monitoring Components](#monitoring-components)
3. [Accessing the Monitoring Dashboard](#accessing-the-monitoring-dashboard)
4. [Key Metrics](#key-metrics)
5. [Error Tracking](#error-tracking)
6. [User Feedback Collection](#user-feedback-collection)
7. [Security Monitoring](#security-monitoring)
8. [Generating Reports](#generating-reports)
9. [Troubleshooting](#troubleshooting)

## Overview

The monitoring system for Mistrz Promptów is designed to track application performance, user behavior, errors, and security events. It provides real-time insights into how the application is performing and how users are interacting with it. This information is crucial for identifying issues, making improvements, and ensuring a positive user experience.

The monitoring system consists of:

- Client-side monitoring (performance, errors, user behavior)
- Server-side API endpoints for collecting monitoring data
- A monitoring dashboard for visualizing the data
- A reporting system for generating post-deployment reports

## Monitoring Components

### Client-Side Monitoring

The client-side monitoring is implemented in `src/monitoring/monitoring-setup.js`. It includes:

1. **Performance Monitoring**

   - Page load times
   - Core Web Vitals (CLS, FID, FCP, LCP, TTFB)
   - Custom performance measurements

2. **Error Monitoring**

   - Uncaught JavaScript errors
   - Unhandled promise rejections
   - API errors

3. **User Behavior Tracking**

   - Page views
   - Click events
   - Form submissions
   - Session tracking

4. **User Feedback Collection**

   - In-app feedback form
   - User ratings

5. **Security Monitoring**
   - XSS attempt detection
   - Suspicious input detection
   - CSRF token validation

### Server-Side API Endpoints

The server-side API endpoints are implemented in `src/api/monitoring-api.js`. They include:

1. `/api/analytics` - For collecting analytics data
2. `/api/errors` - For collecting error logs
3. `/api/feedback` - For collecting user feedback
4. `/api/security` - For collecting security events

### Monitoring Dashboard

The monitoring dashboard is implemented in `src/components/admin/MonitoringDashboard.js`. It provides a visual interface for viewing and analyzing the collected data.

## Accessing the Monitoring Dashboard

The monitoring dashboard is accessible only to administrators. To access it:

1. Log in with an administrator account (email must match `REACT_APP_ADMIN_EMAIL` in the environment variables)
2. Navigate to `/admin/monitoring`

## Key Metrics

The monitoring dashboard displays the following key metrics:

### Performance Metrics

- **Total Users**: The total number of unique users who have accessed the application
- **Active Users (24h)**: The number of unique users who have accessed the application in the last 24 hours
- **Page Views**: The total number of page views
- **Avg. Session Duration**: The average time users spend in a session
- **Error Rate**: The number of errors per 1000 page views
- **Avg. Response Time**: The average time it takes for API endpoints to respond
- **User Satisfaction**: The average rating from user feedback (out of 5)

### User Behavior Metrics

The dashboard also provides insights into user behavior, including:

- Most visited pages
- User flow through the application
- Feature usage
- User retention

## Error Tracking

The error tracking system captures various types of errors:

- **Uncaught Errors**: JavaScript errors that are not caught by try-catch blocks
- **API Errors**: Errors that occur when making API requests
- **Fetch Errors**: Errors that occur when using the fetch API

Each error is logged with:

- Error type
- Error message
- Stack trace (if available)
- URL where the error occurred
- Timestamp
- User agent
- Client IP address

## User Feedback Collection

The user feedback collection system allows users to provide feedback directly within the application. The feedback includes:

- Rating (1-5)
- Text feedback
- Email (optional)
- URL where the feedback was submitted
- Timestamp

This feedback is valuable for understanding user satisfaction and identifying areas for improvement.

## Security Monitoring

The security monitoring system tracks potential security threats, including:

- **XSS Attempts**: Potential cross-site scripting attacks
- **Suspicious Inputs**: Form inputs that match known attack patterns
- **Missing CSRF Tokens**: Requests that should include CSRF tokens but don't

Each security event is logged with:

- Event type
- Event details
- URL
- Timestamp
- User agent
- Client IP address

## Generating Reports

The monitoring system includes a template for generating post-deployment reports. To generate a report:

1. Access the monitoring dashboard
2. Select the time period for the report
3. Click the "Generate Report" button
4. The report will be generated as a Markdown file based on the template in `docs/post-deployment-monitoring-report.md`

The report includes:

- Executive summary
- Performance metrics
- User behavior and engagement analysis
- Error rates and application stability
- User feedback analysis
- Security and vulnerability assessment
- Recommendations for improvement
- Next steps and action plan

## Troubleshooting

If you encounter issues with the monitoring system, check the following:

1. **No data in the dashboard**:

   - Ensure the monitoring system is initialized in `App.js`
   - Check that the Firebase configuration is correct
   - Verify that the Firestore collections exist

2. **Errors not being logged**:

   - Check the browser console for any errors in the monitoring setup
   - Verify that the error monitoring is properly initialized

3. **Performance metrics not being collected**:

   - Ensure the web-vitals package is installed
   - Check that the performance monitoring is properly initialized

4. **User feedback not being collected**:
   - Verify that the feedback form is properly displayed
   - Check that the feedback API endpoint is working

For more detailed troubleshooting, check the browser console for any errors related to the monitoring system.

---

## Additional Resources

- [Web Vitals Documentation](https://web.dev/vitals/)
- [Firebase Analytics Documentation](https://firebase.google.com/docs/analytics)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
