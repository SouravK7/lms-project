import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";

function LessonPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await api.get(`/api/lessons/${id}/`);
        setLesson(response.data);
        setCompleted(response.data.is_completed);
      } catch {
        setError("Failed to load lesson.");
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [id]);

  const markComplete = async () => {
    try {
      await api.post(`/api/lessons/${id}/complete/`);
      setCompleted(true);
    } catch {
      alert("Unable to mark lesson complete.");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-container">Loading...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <p className="error">{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="page-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <h1>{lesson.title}</h1>

        <p className="subtitle">Lesson {lesson.order}</p>

        <div className="content-card">
          <h2>Lesson Content</h2>
          <p style={{ whiteSpace: "pre-wrap" }}>{lesson.content}</p>
        </div>

        <div className="action-card">
          {completed ? (
            <p>Lesson Completed</p>
          ) : (
            <button onClick={markComplete}>Mark as Completed</button>
          )}

          {lesson.quiz_id && (
            <Link to={`/quiz/${lesson.quiz_id}`}>Take Quiz</Link>
          )}
        </div>

        <div className="ai-card">
          <h3>Need help?</h3>
          <p>Ask the AI Tutor questions about this lesson.</p>
          <Link to={`/lessons/${lesson.id}/chat`}>
            Open AI Tutor Chat
          </Link>
        </div>
      </div>
    </>
  );
}

export default LessonPage;