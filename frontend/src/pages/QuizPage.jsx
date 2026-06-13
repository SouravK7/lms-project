import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import api from "../api/axios";

function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await api.get(`/api/quizzes/${id}/`);
        setQuiz(response.data);
      } catch {
        setError("Failed to load quiz.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  const handleChoice = (questionId, choiceId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: choiceId
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;

    setSubmitting(true);

    const payload = {
      answers: Object.entries(answers).map(
        ([question_id, choice_id]) => ({
          question_id: Number(question_id),
          choice_id
        })
      )
    };

    try {
      const response = await api.post(
        `/api/quizzes/${id}/submit/`,
        payload
      );

      setResult(response.data);
    } catch (error) {
      alert(
        error.response?.data?.error ||
        "Unable to submit quiz."
      );
    } finally {
      setSubmitting(false);
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

  if (error || !quiz) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <p className="error">{error || "Quiz not found."}</p>
        </div>
      </>
    );
  }

  const questions = quiz.questions || [];

  const formatScore = (score) =>
    Number(score).toLocaleString(undefined, {
      maximumFractionDigits: 1
    });

  const getQuestionTypeLabel = (type) => {
    return type === "MCQ"
      ? "Multiple Choice"
      : "True / False";
  };

  return (
    <>
      <Navbar />

      <div className="page-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <h1>Quiz</h1>

        <p className="subtitle">
          Minimum Score {Number(quiz.pass_score)}%
        </p>

        {questions.map((question, index) => (
          <div key={question.id} className="question-card">
            <h3>
              {index + 1}. {question.text}
            </h3>

            <p>{getQuestionTypeLabel(question.question_type)}</p>

            {question.choices.map((choice) => (
              <label key={choice.id} className="choice">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={choice.id}
                  checked={
                    Number(answers[question.id]) === Number(choice.id)
                  }
                  onChange={() =>
                    handleChoice(question.id, choice.id)
                  }
                />
                {choice.text}
              </label>
            ))}
          </div>
        ))}

        {!result && (
          <button
            onClick={handleSubmit}
            disabled={
              submitting ||
              Object.keys(answers).length !== questions.length
            }
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        )}

        {result && (
          <div className="result-card">
            <h2>Quiz Result</h2>

            <p>Score</p>
            <h3>{formatScore(result.score)}%</h3>

            <p>Status</p>
            <h3>{result.passed ? "Passed" : "Failed"}</h3>

            <p>
              {result.passed
                ? `Congratulations! You have passed this quiz.`
                : `You can review the lesson and try again.`}
            </p>

            <p>
              {result.passed
                ? `You scored ${formatScore(result.score)}%`
                : `Minimum score was ${Number(quiz.pass_score)}%`}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default QuizPage;