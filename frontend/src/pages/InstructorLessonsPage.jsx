import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileQuestion, Pencil, Plus } from "lucide-react";

import Navbar from "../components/Navbar";
import api from "../api/axios";

function InstructorLessonsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingQuizFor, setCreatingQuizFor] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await api.get(`/api/instructor/courses/${id}/lessons/`);
        setLessons(response.data);
      } catch {
        setError("Unable to load lessons.");
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [id]);

  const createQuiz = async (lesson) => {
    try {
      setCreatingQuizFor(lesson.id);

      const response = await api.post("/api/instructor/quizzes/", {
        lesson: lesson.id,
        pass_score: 60,
      });

      navigate(`/teacher/quiz/${response.data.id}/edit`);
    } catch {
      alert("Unable to create quiz.");
    } finally {
      setCreatingQuizFor(null);
    }
  };

  return (
    <>
      <Navbar />

      <div className="page-container instructor-page">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="instructor-header">
          <div>
            <h1>Lessons</h1>
            <p>Manage lesson content and quizzes.</p>
          </div>
        </div>

        {loading && <p>Loading...</p>}

        {error && <p className="error">{error}</p>}

        {!loading && lessons.length === 0 && (
          <div className="empty-state">
            <FileQuestion size={70} />
            <h2>No Lessons Yet</h2>
            <p>Add lessons before creating quizzes.</p>
          </div>
        )}

        {lessons.map((lesson) => (
          <div key={lesson.id} className="instructor-course-card">
            <div className="course-top">
              <div>
                <h2>
                  {lesson.order}. {lesson.title}
                </h2>
                <p>{lesson.quiz_id ? "Quiz attached" : "No quiz yet"}</p>
              </div>
            </div>

            <div className="course-actions">
              <Link
                to={`/teacher/lesson/${lesson.id}/edit`}
                className="action-btn"
              >
                <Pencil size={18} />
                Edit Lesson
              </Link>

              {lesson.quiz_id ? (
                <Link
                  to={`/teacher/quiz/${lesson.quiz_id}/edit`}
                  className="action-btn secondary-btn"
                >
                  <FileQuestion size={18} />
                  Edit Quiz
                </Link>
              ) : (
                <button
                  className="secondary-btn"
                  disabled={creatingQuizFor === lesson.id}
                  onClick={() => createQuiz(lesson)}
                >
                  <Plus size={18} />
                  {creatingQuizFor === lesson.id ? "Creating..." : "Add Quiz"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default InstructorLessonsPage;
