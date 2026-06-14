import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";

import Navbar from "../components/Navbar";
import api from "../api/axios";

function EditQuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await api.get(`/api/instructor/quizzes/${id}/`);
        setQuiz(response.data);
      } catch {
        setError("Unable to load quiz.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  const updateQuestion = (qIndex, updater) => {
    setQuiz((current) => ({
      ...current,
      questions: current.questions.map((question, index) =>
        index === qIndex ? updater(question) : question
      ),
    }));
  };

  const handlePassScore = (event) => {
    setQuiz({
      ...quiz,
      pass_score: event.target.value,
    });
  };

  const handleQuestionChange = (qIndex, field, value) => {
    updateQuestion(qIndex, (question) => ({
      ...question,
      [field]: value,
    }));
  };

  const handleChoiceChange = (qIndex, cIndex, value) => {
    updateQuestion(qIndex, (question) => ({
      ...question,
      choices: question.choices.map((choice, index) =>
        index === cIndex
          ? {
              ...choice,
              text: value,
            }
          : choice
      ),
    }));
  };

  const setCorrectChoice = (qIndex, cIndex) => {
    updateQuestion(qIndex, (question) => ({
      ...question,
      choices: question.choices.map((choice, index) => ({
        ...choice,
        is_correct: index === cIndex,
      })),
    }));
  };

  const addQuestion = async () => {
    try {
      const response = await api.post(
        `/api/instructor/quizzes/${id}/questions/`,
        {
          text: "",
          question_type: "MCQ",
        }
      );

      setQuiz({
        ...quiz,
        questions: [...quiz.questions, response.data],
      });
    } catch {
      alert("Unable to add question.");
    }
  };

  const deleteQuestion = async (qIndex) => {
    const question = quiz.questions[qIndex];

    if (!window.confirm("Delete this question?")) {
      return;
    }

    try {
      await api.delete(`/api/instructor/questions/${question.id}/`);

      setQuiz({
        ...quiz,
        questions: quiz.questions.filter((_, index) => index !== qIndex),
      });
    } catch {
      alert("Unable to delete question.");
    }
  };

  const addChoice = async (qIndex) => {
    const question = quiz.questions[qIndex];

    try {
      const response = await api.post(
        `/api/instructor/questions/${question.id}/choices/`,
        {
          text: "",
          is_correct: question.choices.length === 0,
        }
      );

      updateQuestion(qIndex, (currentQuestion) => ({
        ...currentQuestion,
        choices: [...currentQuestion.choices, response.data],
      }));
    } catch {
      alert("Unable to add choice.");
    }
  };

  const deleteChoice = async (qIndex, cIndex) => {
    const choice = quiz.questions[qIndex].choices[cIndex];

    if (!window.confirm("Delete this choice?")) {
      return;
    }

    try {
      await api.delete(`/api/instructor/choices/${choice.id}/`);

      updateQuestion(qIndex, (question) => ({
        ...question,
        choices: question.choices.filter((_, index) => index !== cIndex),
      }));
    } catch {
      alert("Unable to delete choice.");
    }
  };

  const saveQuiz = async () => {
    try {
      setSaving(true);

      await api.patch(`/api/instructor/quizzes/${id}/`, {
        pass_score: quiz.pass_score,
      });

      for (const question of quiz.questions) {
        await api.patch(`/api/instructor/questions/${question.id}/`, {
          text: question.text,
          question_type: question.question_type,
        });

        for (const choice of question.choices) {
          await api.patch(`/api/instructor/choices/${choice.id}/`, {
            text: choice.text,
            is_correct: choice.is_correct,
          });
        }
      }

      alert("Quiz updated successfully.");
      navigate(-1);
    } catch {
      alert("Unable to save quiz.");
    } finally {
      setSaving(false);
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

      <div className="page-container instructor-form-page">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          Back
        </button>

        <h1>Edit Quiz</h1>

        <label>Pass Score</label>
        <input
          type="number"
          value={quiz.pass_score}
          onChange={handlePassScore}
        />

        {quiz.questions.map((question, qIndex) => (
          <div key={question.id} className="question-editor">
            <div className="question-top">
              <h2>Question {qIndex + 1}</h2>

              <button
                className="delete-btn"
                onClick={() => deleteQuestion(qIndex)}
              >
                <Trash2 size={18} />
              </button>
            </div>

            <textarea
              rows={3}
              value={question.text}
              onChange={(event) =>
                handleQuestionChange(qIndex, "text", event.target.value)
              }
            />

            <select
              value={question.question_type}
              onChange={(event) =>
                handleQuestionChange(
                  qIndex,
                  "question_type",
                  event.target.value
                )
              }
            >
              <option value="MCQ">MCQ</option>
              <option value="TF">True / False</option>
            </select>

            {question.choices.map((choice, cIndex) => (
              <div key={choice.id} className="choice-row">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  checked={choice.is_correct}
                  aria-label={`Mark choice ${cIndex + 1} as correct`}
                  onChange={() => setCorrectChoice(qIndex, cIndex)}
                />

                <input
                  type="text"
                  placeholder={`Choice ${cIndex + 1}`}
                  value={choice.text}
                  onChange={(event) =>
                    handleChoiceChange(qIndex, cIndex, event.target.value)
                  }
                />

                <button
                  className="delete-btn"
                  onClick={() => deleteChoice(qIndex, cIndex)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button className="secondary-btn" onClick={() => addChoice(qIndex)}>
              <Plus size={18} />
              Add Choice
            </button>
          </div>
        ))}

        <div className="editor-actions">
          <button className="secondary-btn" onClick={addQuestion}>
            <Plus size={18} />
            Add Question
          </button>

          <button onClick={saveQuiz} disabled={saving}>
            <Save size={18} />
            {saving ? "Saving..." : "Save Quiz"}
          </button>
        </div>
      </div>
    </>
  );
}

export default EditQuizPage;
