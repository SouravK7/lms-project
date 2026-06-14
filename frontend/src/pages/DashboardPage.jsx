import { useEffect, useState } from "react";

import {

  BookOpen,

  CheckCircle,

  Trophy,

  ArrowRight,

  Award

}

from "lucide-react";

import {

  Link

}

from "react-router-dom";

import Navbar from "../components/Navbar";

import api from "../api/axios";


function DashboardPage() {

  const [progress, setProgress] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  useEffect(() => {

    const fetchProgress = async () => {

      try {

        const response = await api.get(

          "/api/myprogress/"

        );


        setProgress(

          response.data || []

        );

      }

      catch {

        setError(

          "Failed to load dashboard."

        );

      }

      finally {

        setLoading(false);

      }

    };


    fetchProgress();

  }, []);



  const enrolledCourses = progress.length;


  const lessonsCompleted = progress.reduce(

    (total, course) =>

      total + course.completed_lessons,

    0

  );


  const completedCourses = progress.filter(

    course => course.completed

  ).length;



  return (

    <>

      <Navbar />


      <div className="page-container dashboard-page">


        <div className="dashboard-header">


          <h1>

            👋 Welcome Back

          </h1>


          <p className="subtitle">

            Continue learning and track your progress.

          </p>


        </div>




        {

        loading

        &&

        (

          <p>

            Loading dashboard...

          </p>

        )

        }




        {

        error

        &&

        (

          <p className="error">

            {error}

          </p>

        )

        }




        {

        !loading

        &&

        !error

        &&

        (

          <>


            <div className="stats-grid">


              <div className="stat-card">

                <BookOpen size={32} />

                <h3>

                  Courses

                </h3>

                <p>

                  {enrolledCourses}

                </p>

              </div>



              <div className="stat-card">

                <CheckCircle size={32} />

                <h3>

                  Lessons

                </h3>

                <p>

                  {lessonsCompleted}

                </p>

              </div>



              <div className="stat-card">

                <Trophy size={32} />

                <h3>

                  Completed

                </h3>

                <p>

                  {completedCourses}

                </p>

              </div>


            </div>





            <div className="dashboard-section">

              <h2>

                Your Courses

              </h2>

            </div>





            {

            progress.length === 0

            ?

            (

              <div className="empty-state">


                <BookOpen size={70} />


                <h2>

                  No Courses Yet

                </h2>


                <p>

                  Enroll in a course

                  to start learning.

                </p>



                <Link

                  to="/courses"

                  className="action-btn"

                >

                  Browse Courses

                  <ArrowRight size={18} />

                </Link>


              </div>

            )

            :

            (

              progress.map((course) => (


                <div

                  key={course.course_id}

                  className="dashboard-course-card"

                >



                  <div>


                    <h2>

                      {course.course}

                    </h2>



                    <p className="lesson-count">


                      {course.completed_lessons}

                      {" / "}

                      {course.total_lessons}

                      {" "}

                      Lessons


                    </p>


                  </div>





                  {

                  course.completed

                  &&

                  (

                    <span className="completed-badge">

                      Completed

                    </span>

                  )

                  }






                  <div className="progress-bar">


                    <div

                      className="progress-fill"

                      style={{

                        width:

                        `${course.percent_complete}%`

                      }}

                    />


                  </div>






                  <div className="course-card-footer">


                    <p>

                      {course.percent_complete}

                      % Complete

                    </p>





                    <div className="dashboard-actions">


                      <Link

                        to={`/courses/${course.course_id}`}

                        className="action-btn"

                      >

                        View Course

                        <ArrowRight size={18} />

                      </Link>





                      {

                      course.completed

                      &&

                      (

                        <Link

                          to={`/certificate/${course.course_id}`}

                          className="action-btn secondary-btn"

                        >

                          <Award size={18} />

                          Certificate

                        </Link>

                      )

                      }


                    </div>


                  </div>


                </div>


              ))

            )

            }


          </>

        )

        }


      </div>


    </>

  );

}


export default DashboardPage;