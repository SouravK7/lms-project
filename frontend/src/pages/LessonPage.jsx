import { useEffect, useState } from "react";

import {
  Link,
  useParams,
  useNavigate
} from "react-router-dom";

import {

  ArrowLeft,

  CheckCircle,

  FileQuestion,

  Bot,

  Check

} from "lucide-react";

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

        const response = await api.get(

          `/api/lessons/${id}/`

        );

        setLesson(response.data);

        setCompleted(

          response.data.is_completed

        );

      }

      catch {

        setError(

          "Failed to load lesson."

        );

      }

      finally {

        setLoading(false);

      }

    };


    fetchLesson();

  }, [id]);


  const markComplete = async () => {

    try {

      await api.post(

        `/api/lessons/${id}/complete/`

      );

      setCompleted(true);

    }

    catch {

      alert(

        "Unable to mark lesson complete."

      );

    }

  };


  if (loading) {

    return (

      <>

        <Navbar />

        <div className="page-container">

          Loading...

        </div>

      </>

    );

  }


  if (error || !lesson) {

    return (

      <>

        <Navbar />

        <div className="page-container">

          <p className="error">

            {error || "Lesson not found."}

          </p>

        </div>

      </>

    );

  }


  return (

    <>

      <Navbar />


      <div className="page-container lesson-page">


        <button

          className="back-btn"

          onClick={() => navigate(-1)}

        >

          <ArrowLeft size={18} />

          Back

        </button>



        <div className="lesson-header">

          <span className="lesson-number">

            Lesson {lesson.order}

          </span>


          <h1>

            {lesson.title}

          </h1>

        </div>



        {

        lesson.video_url

        &&

        (

          <div className="video-card">

            <video

              controls

              src={lesson.video_url}

            />

          </div>

        )

        }



        <div className="lesson-content-card">

          <div className="content-divider" />



          <p className="lesson-content">

            {lesson.content}

          </p>

        </div>



        <div className="status-card">


          <h3>

            Progress

          </h3>


          {

          completed

          ?

          (

            <div className="lesson-completed">

              <CheckCircle size={20} />

              Completed

            </div>

          )

          :

          (

            <button

              className="complete-btn"

              onClick={markComplete}

            >

              <Check size={18} />

              Mark as Completed

            </button>

          )

          }


        </div>




        <div className="lesson-actions">


          {

          lesson.quiz_id

          &&

          (

            <div className="action-card">

              <div className="action-icon">

                <FileQuestion size={28} />

              </div>


              <h3>

                Quiz

              </h3>


              <p>

                Test your understanding

                of this lesson.

              </p>


              <Link

                className="action-btn"

                to={`/quiz/${lesson.quiz_id}`}

              >

                Take Quiz

              </Link>

            </div>

          )

          }



          <div className="action-card ai-card">

            <div className="action-icon">

              <Bot size={28} />

            </div>


            <h3>

              AI Tutor

            </h3>


            <p>

              Ask questions and

              get explanations instantly.

            </p>


            <Link

              className="action-btn"

              to={`/lessons/${lesson.id}/chat`}

            >

              Open Chat

            </Link>

          </div>


        </div>


      </div>

    </>

  );

}


export default LessonPage;