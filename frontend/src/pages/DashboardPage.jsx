import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

function DashboardPage() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await api.get("/api/myprogress/");
        setProgress(response.data || []);
      } catch {
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const enrolledCount = progress.length;

  return (
    <>
      <Navbar />

      <div className="page-container">
        <h1>Dashboard</h1>

        <p className="subtitle">
          Track your learning progress
        </p>

        {/* Summary */}
        {!loading && (
          <div className="summary-card">
            <p>Enrolled Courses</p>
            <h2>{enrolledCount}</h2>
          </div>
        )}

        {/* Loading */}
        {loading && <p>Loading...</p>}

        {/* Error */}
        {error && <p className="error">{error}</p>}

        {/* Empty state */}
        {!loading && enrolledCount === 0 && (
          <p>
            You haven't enrolled in any courses yet.
          </p>
        )}

        {/* Progress list */}
        {progress.map((course) => (
          <div
            key={course.course_id}
            className="progress-card"
          >
            <h2>{course.course}</h2>

            <p>
              {course.completed_lessons} / {course.total_lessons} Lessons
            </p>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${course.percent_complete}%`
                }}
              />
            </div>

            <p className="progress-text">
              {course.percent_complete}% Complete
            </p>

            {/* FIXED BUG HERE */}
            {course.percent_complete === 100 && (
              <p className="completed-badge">
                Completed
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default DashboardPage;