import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase-config";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  Timestamp,
} from "firebase/firestore";

// CSS styles for the dashboard
const styles = {
  container: {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#2c3e50",
  },
  dateSelector: {
    padding: "8px 12px",
    borderRadius: "4px",
    border: "1px solid #ddd",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  metricCard: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    padding: "20px",
  },
  metricTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#7f8c8d",
    marginBottom: "10px",
  },
  metricValue: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#2c3e50",
  },
  metricTrend: {
    fontSize: "14px",
    marginTop: "5px",
  },
  trendUp: {
    color: "#27ae60",
  },
  trendDown: {
    color: "#e74c3c",
  },
  trendNeutral: {
    color: "#7f8c8d",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: "30px",
    marginBottom: "15px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  },
  tableHeader: {
    backgroundColor: "#f8f9fa",
    textAlign: "left",
    padding: "12px 15px",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#2c3e50",
    borderBottom: "1px solid #ddd",
  },
  tableCell: {
    padding: "12px 15px",
    borderBottom: "1px solid #ddd",
    fontSize: "14px",
  },
  errorRow: {
    backgroundColor: "#fff8f8",
  },
  feedbackRow: {
    backgroundColor: (rating) =>
      rating <= 2 ? "#fff8f8" : rating >= 4 ? "#f8fff8" : "white",
  },
  badge: {
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  errorBadge: {
    backgroundColor: "#ffecec",
    color: "#e74c3c",
  },
  warningBadge: {
    backgroundColor: "#fff9ec",
    color: "#f39c12",
  },
  infoBadge: {
    backgroundColor: "#ecf8ff",
    color: "#3498db",
  },
  successBadge: {
    backgroundColor: "#ecffec",
    color: "#27ae60",
  },
  loadingSpinner: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "50px 0",
  },
  noData: {
    textAlign: "center",
    padding: "30px",
    color: "#7f8c8d",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  },
  refreshButton: {
    padding: "8px 16px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    marginLeft: "10px",
  },
};

const MonitoringDashboard = () => {
  // State variables
  const [timeRange, setTimeRange] = useState("24h"); // 24h, 7d, 30d
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pageViews: 0,
    avgSessionDuration: 0,
    errorRate: 0,
    avgResponseTime: 0,
    userSatisfaction: 0,
  });
  const [errors, setErrors] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [securityEvents, setSecurityEvents] = useState([]);

  // Calculate the timestamp for the selected time range
  const getTimeRangeTimestamp = () => {
    const now = new Date();
    switch (timeRange) {
      case "24h":
        return Timestamp.fromDate(
          new Date(now.getTime() - 24 * 60 * 60 * 1000)
        );
      case "7d":
        return Timestamp.fromDate(
          new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        );
      case "30d":
        return Timestamp.fromDate(
          new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        );
      default:
        return Timestamp.fromDate(
          new Date(now.getTime() - 24 * 60 * 60 * 1000)
        );
    }
  };

  // Fetch data from Firestore
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const startTime = getTimeRangeTimestamp();

      // Fetch analytics data
      const analyticsQuery = query(
        collection(db, "analytics"),
        where("serverTimestamp", ">=", startTime),
        orderBy("serverTimestamp", "desc")
      );
      const analyticsSnapshot = await getDocs(analyticsQuery);
      const analyticsData = analyticsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Calculate metrics from analytics data
      const pageViews = analyticsData.filter(
        (item) => item.type === "pageview"
      ).length;

      // Get unique users (by sessionId)
      const sessionIds = new Set();
      analyticsData.forEach((item) => {
        if (item.sessionId) {
          sessionIds.add(item.sessionId);
        }
      });
      const totalUsers = sessionIds.size;

      // Calculate active users (users with activity in the last 24 hours)
      const last24Hours = Timestamp.fromDate(
        new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
      const activeSessionIds = new Set();
      analyticsData.forEach((item) => {
        if (item.sessionId && item.serverTimestamp >= last24Hours) {
          activeSessionIds.add(item.sessionId);
        }
      });
      const activeUsers = activeSessionIds.size;

      // Calculate average session duration
      let totalDuration = 0;
      let sessionCount = 0;
      analyticsData.forEach((item) => {
        if (item.type === "session_end" && item.duration) {
          totalDuration += item.duration;
          sessionCount++;
        }
      });
      const avgSessionDuration =
        sessionCount > 0 ? totalDuration / sessionCount / 1000 : 0; // in seconds

      // Fetch error data
      const errorsQuery = query(
        collection(db, "errors"),
        where("serverTimestamp", ">=", startTime),
        orderBy("serverTimestamp", "desc"),
        limit(100)
      );
      const errorsSnapshot = await getDocs(errorsQuery);
      const errorsData = errorsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Calculate error rate (errors per 1000 pageviews)
      const errorRate =
        pageViews > 0 ? (errorsData.length / pageViews) * 1000 : 0;

      // Fetch performance data (if available)
      let avgResponseTime = 0;
      const performanceData = analyticsData.filter(
        (item) =>
          item.type === "performance" && item.name === "api-response-time"
      );
      if (performanceData.length > 0) {
        const totalResponseTime = performanceData.reduce(
          (sum, item) => sum + item.value,
          0
        );
        avgResponseTime = totalResponseTime / performanceData.length;
      }

      // Fetch feedback data
      const feedbackQuery = query(
        collection(db, "feedback"),
        where("serverTimestamp", ">=", startTime),
        orderBy("serverTimestamp", "desc"),
        limit(100)
      );
      const feedbackSnapshot = await getDocs(feedbackQuery);
      const feedbackData = feedbackSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Calculate user satisfaction (average rating)
      let totalRating = 0;
      let ratingCount = 0;
      feedbackData.forEach((item) => {
        if (item.rating) {
          totalRating += parseInt(item.rating);
          ratingCount++;
        }
      });
      const userSatisfaction = ratingCount > 0 ? totalRating / ratingCount : 0;

      // Fetch security events
      const securityQuery = query(
        collection(db, "security_events"),
        where("serverTimestamp", ">=", startTime),
        orderBy("serverTimestamp", "desc"),
        limit(100)
      );
      const securitySnapshot = await getDocs(securityQuery);
      const securityData = securitySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Update state with fetched data
      setMetrics({
        totalUsers,
        activeUsers,
        pageViews,
        avgSessionDuration,
        errorRate,
        avgResponseTime,
        userSatisfaction,
      });

      setErrors(errorsData);
      setFeedback(feedbackData);
      setSecurityEvents(securityData);
    } catch (error) {
      console.error("Error fetching monitoring data:", error);
      // You might want to show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when component mounts or time range changes
  useEffect(() => {
    fetchData();
  }, [timeRange]);

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  // Format duration in seconds to minutes and seconds
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Render loading spinner
  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Monitoring Dashboard</h1>
        </div>
        <div style={styles.loadingSpinner}>
          <p>Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Monitoring Dashboard</h1>
        <div>
          <select
            style={styles.dateSelector}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button style={styles.refreshButton} onClick={fetchData}>
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <div style={styles.metricTitle}>Total Users</div>
          <div style={styles.metricValue}>{metrics.totalUsers}</div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricTitle}>Active Users (24h)</div>
          <div style={styles.metricValue}>{metrics.activeUsers}</div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricTitle}>Page Views</div>
          <div style={styles.metricValue}>{metrics.pageViews}</div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricTitle}>Avg. Session Duration</div>
          <div style={styles.metricValue}>
            {formatDuration(metrics.avgSessionDuration)}
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricTitle}>Error Rate</div>
          <div style={styles.metricValue}>
            {metrics.errorRate.toFixed(2)}/1000 views
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricTitle}>Avg. Response Time</div>
          <div style={styles.metricValue}>
            {metrics.avgResponseTime.toFixed(0)} ms
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricTitle}>User Satisfaction</div>
          <div style={styles.metricValue}>
            {metrics.userSatisfaction.toFixed(1)}/5.0
          </div>
        </div>
      </div>

      {/* Recent Errors */}
      <h2 style={styles.sectionTitle}>Recent Errors</h2>
      {errors.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Time</th>
              <th style={styles.tableHeader}>Type</th>
              <th style={styles.tableHeader}>Message</th>
              <th style={styles.tableHeader}>URL</th>
            </tr>
          </thead>
          <tbody>
            {errors.slice(0, 10).map((error) => (
              <tr
                key={error.id}
                style={{ ...styles.tableCell, ...styles.errorRow }}
              >
                <td style={styles.tableCell}>
                  {formatDate(error.serverTimestamp)}
                </td>
                <td style={styles.tableCell}>
                  <span style={{ ...styles.badge, ...styles.errorBadge }}>
                    {error.type || "Unknown"}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  {error.message || "No message"}
                </td>
                <td style={styles.tableCell}>{error.url || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={styles.noData}>No errors recorded in this time period.</div>
      )}

      {/* Recent Feedback */}
      <h2 style={styles.sectionTitle}>Recent User Feedback</h2>
      {feedback.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Time</th>
              <th style={styles.tableHeader}>Rating</th>
              <th style={styles.tableHeader}>Feedback</th>
              <th style={styles.tableHeader}>Contact</th>
            </tr>
          </thead>
          <tbody>
            {feedback.slice(0, 10).map((item) => {
              const rating = parseInt(item.rating) || 0;
              return (
                <tr
                  key={item.id}
                  style={{
                    ...styles.tableCell,
                    backgroundColor:
                      rating <= 2
                        ? "#fff8f8"
                        : rating >= 4
                        ? "#f8fff8"
                        : "white",
                  }}
                >
                  <td style={styles.tableCell}>
                    {formatDate(item.serverTimestamp)}
                  </td>
                  <td style={styles.tableCell}>
                    <span
                      style={{
                        ...styles.badge,
                        ...(rating <= 2
                          ? styles.errorBadge
                          : rating === 3
                          ? styles.warningBadge
                          : styles.successBadge),
                      }}
                    >
                      {rating}/5
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    {item.feedback || "No comment"}
                  </td>
                  <td style={styles.tableCell}>{item.email || "Anonymous"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div style={styles.noData}>
          No feedback recorded in this time period.
        </div>
      )}

      {/* Security Events */}
      <h2 style={styles.sectionTitle}>Security Events</h2>
      {securityEvents.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Time</th>
              <th style={styles.tableHeader}>Type</th>
              <th style={styles.tableHeader}>Details</th>
              <th style={styles.tableHeader}>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {securityEvents.slice(0, 10).map((event) => (
              <tr
                key={event.id}
                style={{ ...styles.tableCell, backgroundColor: "#fff8f8" }}
              >
                <td style={styles.tableCell}>
                  {formatDate(event.serverTimestamp)}
                </td>
                <td style={styles.tableCell}>
                  <span style={{ ...styles.badge, ...styles.errorBadge }}>
                    {event.type || "Unknown"}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  {event.value
                    ? `Value: ${event.value}`
                    : event.element
                    ? `Element: ${event.element}`
                    : event.url
                    ? `URL: ${event.url}`
                    : "No details"}
                </td>
                <td style={styles.tableCell}>{event.clientIp || "Unknown"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={styles.noData}>
          No security events recorded in this time period.
        </div>
      )}
    </div>
  );
};

export default MonitoringDashboard;
