/**
 * Generate Sample Post-Deployment Report
 *
 * This script generates a sample post-deployment report with example data.
 * It's useful for demonstrating how the monitoring system works and how to interpret the data.
 *
 * Usage: node src/scripts/generate-sample-report.js
 */

const fs = require("fs");
const path = require("path");

// Sample data for the report
const sampleData = {
  reportDate: new Date().toISOString().split("T")[0],
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  endDate: new Date().toISOString().split("T")[0],
  version: "1.0.0",
  preparedBy: "Monitoring System",

  // Performance metrics
  performance: {
    overall: "Good",
    pageLoadTimes: {
      home: { avg: 850, p90: 1200, trend: "↓" },
      lessons: { avg: 920, p90: 1350, trend: "→" },
      lessonDetail: { avg: 1050, p90: 1500, trend: "↑" },
      profile: { avg: 780, p90: 1100, trend: "↓" },
      leaderboard: { avg: 820, p90: 1200, trend: "→" },
    },
  },

  // User behavior and engagement
  userBehavior: {
    overall: "High",
    traffic: {
      totalUsers: { value: 2450, trend: "↑" },
      newUsers: { value: 820, trend: "↑" },
      returningUsers: { value: 1630, trend: "↑" },
      totalSessions: { value: 4200, trend: "↑" },
      avgSessionDuration: { value: "8m 45s", trend: "↑" },
      bounceRate: { value: "22%", trend: "↓" },
    },
  },

  // Error rates and application stability
  errors: {
    overall: "Stable",
    overview: {
      totalErrors: { value: 85, trend: "↓" },
      errorRate: { value: 2.1, trend: "↓" },
      uniqueErrorTypes: { value: 12, trend: "↓" },
      criticalErrors: { value: 3, trend: "↓" },
    },
  },

  // User feedback
  feedback: {
    overall: "Positive",
    overview: {
      totalSubmissions: { value: 210, trend: "↑" },
      averageRating: { value: 4.2, trend: "↑" },
      positivePercentage: { value: "78%", trend: "↑" },
      neutralPercentage: { value: "15%", trend: "↓" },
      negativePercentage: { value: "7%", trend: "↓" },
    },
  },

  // Security
  security: {
    overall: "No Issues",
    overview: {
      totalEvents: { value: 12, trend: "→" },
      xssAttempts: { value: 3, trend: "→" },
      suspiciousInputs: { value: 7, trend: "→" },
      authFailures: { value: 2, trend: "↓" },
    },
  },

  // Recommendations
  recommendations: {
    performance: [
      {
        title: "Optimize Lesson Detail Page Loading",
        issue:
          "The Lesson Detail page has the slowest load time and is trending upward.",
        recommendation:
          "Implement lazy loading for lesson content and optimize images.",
        impact: "Reduce load time by 20-30% and improve user experience.",
        priority: "Medium",
      },
    ],
    userExperience: [
      {
        title: "Improve Mobile Experience",
        issue:
          "Mobile users experience higher error rates and slower load times.",
        recommendation:
          "Optimize the application for mobile devices with responsive design improvements.",
        impact:
          "Improve mobile user satisfaction and reduce mobile error rates.",
        priority: "High",
      },
    ],
  },

  // Action plan
  actionPlan: [
    {
      action: "Fix Firebase Auth Errors",
      owner: "Auth Team",
      target: "2025-04-30",
      status: "In Progress",
    },
    {
      action: "Implement Mobile Optimizations",
      owner: "UI Team",
      target: "2025-05-15",
      status: "Not Started",
    },
  ],
};

// Read the report template
const templatePath = path.join(
  __dirname,
  "../../docs/post-deployment-monitoring-report.md"
);
let template = fs.readFileSync(templatePath, "utf8");

// Replace placeholders with sample data
template = template.replace("[DATE]", sampleData.reportDate);
template = template.replace("[START_DATE]", sampleData.startDate);
template = template.replace("[END_DATE]", sampleData.endDate);
template = template.replace("[VERSION]", sampleData.version);
template = template.replace("[NAME]", sampleData.preparedBy);

// Replace summary placeholders
template = template.replace(
  "[SUMMARY OF PERFORMANCE - Good/Needs Improvement/Critical Issues]",
  sampleData.performance.overall
);
template = template.replace(
  "[SUMMARY OF USER ENGAGEMENT - High/Medium/Low]",
  sampleData.userBehavior.overall
);
template = template.replace(
  "[SUMMARY OF STABILITY - Stable/Some Issues/Unstable]",
  sampleData.errors.overall
);
template = template.replace(
  "[SUMMARY OF SECURITY - No Issues/Minor Concerns/Major Vulnerabilities]",
  sampleData.security.overall
);

// Replace top recommendations
template = template.replace(
  "[TOP RECOMMENDATION]",
  sampleData.recommendations.userExperience[0].title
);
template = template.replace(
  "[SECOND RECOMMENDATION]",
  sampleData.recommendations.performance[0].title
);
template = template.replace(
  "[THIRD RECOMMENDATION]",
  "Implement Regular Security Audits"
);

// Generate the sample report
const outputPath = path.join(
  __dirname,
  "../../docs/sample-post-deployment-report.md"
);
fs.writeFileSync(outputPath, template);

console.log(`Sample report generated at: ${outputPath}`);
