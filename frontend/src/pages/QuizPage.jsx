import { useEffect, useState } from "react";

import {

  ArrowLeft,

  ChevronLeft,

  ChevronRight,

  Check,

  RotateCcw,

  Trophy,

  CircleX,

  CheckCircle2,

  XCircle

} from "lucide-react";

import {

  useParams,

  useNavigate

} from "react-router-dom";

import Navbar from "../components/Navbar";

import api from "../api/axios";


function QuizPage() {

  const { id } = useParams();

  const navigate = useNavigate();


  const [quiz, setQuiz] = useState(null);

  const [answers, setAnswers] = useState({});

  const [currentQuestion, setCurrentQuestion] = useState(0);


  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");


  useEffect(() => {

    const fetchQuiz = async () => {

      try {

        const response = await api.get(

          `/api/quizzes/${id}/`

        );

        setQuiz(response.data);

      }

      catch {

        setError(

          "Failed to load quiz."

        );

      }

      finally {

        setLoading(false);

      }

    };


    fetchQuiz();

  }, [id]);



  const handleChoice = (

    questionId,

    choiceId

  ) => {

    setAnswers((prev) => ({

      ...prev,

      [questionId]: choiceId

    }));

  };



  const handleSubmit = async () => {

    if (submitting) return;


    setSubmitting(true);


    const payload = {

      answers:

      Object.entries(

        answers

      ).map(

        ([question_id, choice_id]) => ({

          question_id:

          Number(question_id),

          choice_id

        })

      )

    };


    try {

      const response = await api.post(

        `/api/quizzes/${id}/submit/`,

        payload

      );


      setResult(

        response.data

      );

    }

    catch(error){

      alert(

        error.response?.data?.error

        ||

        "Unable to submit."

      );

    }

    finally{

      setSubmitting(false);

    }

  };



  const handleRetake = () => {

    setAnswers({});

    setResult(null);

    setCurrentQuestion(0);

  };



  if (loading) {

    return (

      <>

        <Navbar/>

        <div className="page-container">

          Loading...

        </div>

      </>

    );

  }



  if (error || !quiz) {

    return (

      <>

        <Navbar/>

        <div className="page-container">

          <p className="error">

            {

            error

            ||

            "Quiz not found."

            }

          </p>

        </div>

      </>

    );

  }



  const questions = quiz.questions || [];

  const question = questions[currentQuestion];

  const selectedAnswer =

    answers[question.id];


  const progress =

    (

      (

        currentQuestion + 1

      )

      /

      questions.length

    )

    *

    100;


  const isLastQuestion =

    currentQuestion

    ===

    questions.length - 1;


  const isQuizComplete =

    Object.keys(

      answers

    ).length

    ===

    questions.length;



  if(result){

    return(

      <>

        <Navbar/>


        <div className="page-container quiz-page">


          <div className="result-card">


            {

            result.passed

            ?

            (

              <Trophy

                size={72}

                className="result-icon result-pass-icon"

              />

            )

            :

            (

              <CircleX

                size={72}

                className="result-icon result-fail-icon"

              />

            )

            }


            <h1>

              Quiz Completed

            </h1>


            <h2>

              {

              Number(

                result.score

              )

              .toFixed(1)

              }

              %

            </h2>


            <p

              className={

                result.passed

                ?

                "result-pass"

                :

                "result-fail"

              }

            >

              {

              result.passed

              ?

              "PASSED"

              :

              "FAILED"

              }

            </p>


            <p>

              {result.correct}

              {" / "}

              {result.total}

              {" "}

              Correct Answers

            </p>


            <p className="result-text">

              {

              result.passed

              ?

              "You have successfully completed this quiz."

              :

              "Review the lesson and try again."

              }

            </p>



            <div className="review-list">

              {

              result.review.map(

                (item,index)=>(

                <div

                  key={index}

                  className="review-card"

                >


                  <div className="review-top">


                    {

                    item.is_correct

                    ?

                    (

                      <CheckCircle2

                        size={22}

                        className="review-correct"

                      />

                    )

                    :

                    (

                      <XCircle

                        size={22}

                        className="review-wrong"

                      />

                    )

                    }


                    <h3>

                      {item.question}

                    </h3>


                  </div>



                  <p>

                    <strong>

                      Your Answer:

                    </strong>

                    {" "}

                    {item.user_answer}

                  </p>



                  <p>

                    <strong>

                      Correct Answer:

                    </strong>

                    {" "}

                    {item.correct_answer}

                  </p>


                </div>

              ))

              }

            </div>



            <div className="result-actions">


              <button

                onClick={handleRetake}

              >

                <RotateCcw size={18}/>

                Retake Quiz

              </button>



              <button

                className="secondary-btn"

                onClick={()=>

                  navigate(-1)

                }

              >

                <ArrowLeft size={18}/>

                Back

              </button>


            </div>


          </div>


        </div>

      </>

    );

  }



  return (

    <>

      <Navbar/>


      <div className="page-container">


        <button

          className="back-btn"

          onClick={()=>

            navigate(-1)

          }

        >

          <ArrowLeft size={18}/>

          Back

        </button>



        <h1>

          Quiz

        </h1>


        <p className="subtitle">

          Minimum Score

          {" "}

          {

          Number(

            quiz.pass_score

          )

          }

          %

        </p>



        <div className="quiz-progress">

          <div

            className="quiz-progress-fill"

            style={{

              width:

              `${progress}%`

            }}

          />

        </div>



        <p className="question-counter">

          Question

          {" "}

          {currentQuestion+1}

          {" of "}

          {questions.length}

        </p>



        <div className="question-card">


          <h2>

            {question.text}

          </h2>



          {

          question.choices.map(

            (choice)=>{


            const selected=

            Number(

              selectedAnswer

            )

            ===

            Number(

              choice.id

            );


            return(

              <div

                key={choice.id}

                className={

                  selected

                  ?

                  "option-tile selected"

                  :

                  "option-tile"

                }

                onClick={()=>

                  handleChoice(

                    question.id,

                    choice.id

                  )

                }

              >

                <span>

                  {choice.text}

                </span>


                {

                selected

                &&

                <Check size={20}/>

                }


              </div>

            )

          })

          }


        </div>



        <div className="quiz-nav">


          <button

            onClick={()=>

            setCurrentQuestion(

              prev=>prev-1

            )

            }

            disabled={

              currentQuestion===0

            }

          >

            <ChevronLeft size={18}/>

            Previous

          </button>



          {

          isLastQuestion

          ?

          (

            <button

              onClick={handleSubmit}

              disabled={

                submitting

                ||

                !isQuizComplete

              }

            >

              {

              submitting

              ?

              "Submitting..."

              :

              "Submit Quiz"

              }

            </button>

          )

          :

          (

            <button

              onClick={()=>

              setCurrentQuestion(

                prev=>prev+1

              )

              }

              disabled={

                !selectedAnswer

              }

            >

              Next

              <ChevronRight size={18}/>

            </button>

          )

          }


        </div>


      </div>

    </>

  );

}

export default QuizPage;