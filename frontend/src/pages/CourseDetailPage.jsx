import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import api from "../api/axios";
import formatDate from "../utils/formatDate";

function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchCourse = async () => {
      try {
        setError("");
        const response = await api.get(`/api/courses/${id}/`);

        if (isMounted) {
          setCourse(response.data);
        }
      } catch {
        if (isMounted) {
          setError("Failed to load course.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCourse();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleEnroll = async () => {
    if (enrolling) return;

    try {
      setEnrolling(true);

      await api.post(`/api/courses/${id}/enroll/`);

      setCourse((prev) =>
        prev
          ? { ...prev, is_enrolled: true }
          : prev
      );
    } catch {
      alert("Unable to enroll.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <p>Loading...</p>
        </div>
      </>
    );
  }

  if (error || !course) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <p className="error">
            {error || "Course not found."}
          </p>
        </div>
      </>
    );
  }

  const lessons = course.lessons || [];

  return (
    <>
      <Navbar />

      <div className="page-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <h1>{course.title}</h1>

        <p className="subtitle">{course.description}</p>

        <div className="summary-card">
          <div>
            <p>Instructor</p>
            <h3>{course.instructor_name}</h3>
          </div>

          <div>
            <p>Created On</p>
            <h3>{formatDate(course.created_at)}</h3>
          </div>

          <div>
            <p>Lessons</p>
            <h3>{lessons.length}</h3>
          </div>
        </div>

        {course.is_enrolled ? (
          <p className="completed-badge">Enrolled</p>
        ) : (
          <div className="info-card">
            <h3>Enrollment Required</h3>
            <p>Enroll to access lessons, quizzes and AI Tutor.</p>

            <button onClick={handleEnroll} disabled={enrolling}>
              {enrolling ? "Enrolling..." : "Enroll"}
            </button>
          </div>
        )}

        <h2>Lessons</h2>

        {lessons.length === 0 && <p>No lessons available.</p>}

        {lessons.map((lesson) => (
          <div key={lesson.id} className="lesson-card">
            <h3>
              {lesson.order}. {lesson.title}
            </h3>

            <p>
              {lesson.quiz_id ? "Quiz Available" : "Lesson Only"}
            </p>

            {course.is_enrolled ? (
              <Link to={`/lessons/${lesson.id}`}>
                Open Lesson
              </Link>
            ) : (
              <p className="locked-text">Locked</p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default CourseDetailPage;