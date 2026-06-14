import { useEffect, useState } from "react";

import {

  Link

} from "react-router-dom";

import {

  Plus,

  BookOpen,

  Users,

  Pencil,

  ListOrdered,

  FileQuestion,

  Eye,

  EyeOff

}

from "lucide-react";

import Navbar from "../components/Navbar";

import api from "../api/axios";


function InstructorDashboard() {


  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");



  useEffect(() => {

    const fetchCourses = async () => {

      try {

        const response = await api.get(

          "/api/instructor/courses/"

        );


        setCourses(

          response.data

        );

      }

      catch {

        setError(

          "Unable to load instructor dashboard."

        );

      }

      finally {

        setLoading(false);

      }

    };


    fetchCourses();

  }, []);





  const togglePublish = async (

    course

  ) => {


    try {


      const response = await api.patch(

        `/api/instructor/courses/${course.id}/`,

        {

          published:

          !course.published

        }

      );



      setCourses(

        prev =>

          prev.map(c =>

            c.id === course.id

            ?

            response.data

            :

            c

          )

      );


    }

    catch {

      alert(

        "Unable to update course."

      );

    }

  };





  return (

    <>

      <Navbar />


      <div className="page-container instructor-page">


        <div className="instructor-header">


          <div>


            <h1>

              Instructor Dashboard

            </h1>


            <p>

              Manage your courses,

              lessons and quizzes.

            </p>


          </div>





          <Link

            to="/teacher/course/create"

            className="action-btn"

          >

            <Plus size={18}/>

            Create Course

          </Link>


        </div>






        {

        loading

        &&

        <p>

          Loading...

        </p>

        }






        {

        error

        &&

        <p className="error">

          {error}

        </p>

        }







        {

        !loading

        &&

        courses.length === 0

        &&

        (

          <div className="empty-state">


            <BookOpen size={70}/>


            <h2>

              No Courses Yet

            </h2>


            <p>

              Create your first course

              and start teaching.

            </p>


          </div>

        )

        }









        {

        courses.map(

          (course) => (

          <div

            key={course.id}

            className="instructor-course-card"

          >



            <div className="course-top">


              <div>


                <h2>

                  {course.title}

                </h2>


                <p>

                  {

                  course.published

                  ?

                  "Published"

                  :

                  "Draft"

                  }

                </p>


              </div>



              <span

                className={

                  course.published

                  ?

                  "status-badge published"

                  :

                  "status-badge draft"

                }

              >

                {

                course.published

                ?

                "Live"

                :

                "Draft"

                }

              </span>


            </div>






            <div className="course-stats">


              <div>

                <BookOpen size={18}/>

                <span>

                    {course.lesson_count}

                    {" "}

                    Lessons

                </span>

                </div>


                <div>

                <Users size={18}/>

                <span>

                    {course.student_count}

                    {" "}

                    Students

                </span>

                </div>


            </div>






            <div className="course-actions">


              <Link

                to={

                `/teacher/course/${course.id}/edit`

                }

                className="action-btn"

              >

                <Pencil size={18}/>

                Edit

              </Link>






              <Link

                to={

                `/teacher/course/${course.id}/lessons`

                }

                className="action-btn secondary-btn"

              >

                <ListOrdered size={18}/>

                Lessons

              </Link>





              <Link

                to={

                `/teacher/course/${course.id}/lessons`

                }

                className="action-btn secondary-btn"

              >

                <FileQuestion size={18}/>

                Quizzes

              </Link>







              <button

                className="secondary-btn"

                onClick={()=>

                  togglePublish(course)

                }

              >

                {

                course.published

                ?

                <>

                  <EyeOff size={18}/>

                  Unpublish

                </>

                :

                <>

                  <Eye size={18}/>

                  Publish

                </>

                }

              </button>



            </div>

          </div>

        ))

        }


      </div>

    </>

  );

}


export default InstructorDashboard;
