import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import {
  BookOpen,
  User,
  Calendar,
  ArrowRight,
  CheckCircle,
  Circle
} from "lucide-react";

import Navbar from "../components/Navbar";
import api from "../api/axios";
import formatDate from "../utils/formatDate";

function CourseListPage() {

  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [ordering, setOrdering] = useState("-created_at");


  useEffect(() => {

    const controller = new AbortController();

    setLoading(true);

    setError("");


    const timer = setTimeout(() => {

      const fetchCourses = async () => {

        try {

          const response = await api.get(

            `/api/courses/?search=${search}&ordering=${ordering}`,

            {
              signal: controller.signal
            }

          );

          setCourses(response.data);

        }

        catch (err) {

          if (

            err.name !== "CanceledError"

            &&

            err.code !== "ERR_CANCELED"

          ) {

            setError(

              "Failed to load courses."

            );

          }

        }

        finally {

          setLoading(false);

        }

      };


      fetchCourses();

    }, 300);


    return () => {

      clearTimeout(timer);

      controller.abort();

    };

  }, [search, ordering]);



  return (

    <>

      <Navbar />



      <div className="page-container">


        <div className="courses-header">

          <h1>

            Explore Courses

          </h1>


          <p className="subtitle">

            Browse courses and continue learning.

          </p>

        </div>



        <div className="course-toolbar">

          <input

            type="text"

            placeholder="Search courses..."

            value={search}

            onChange={(e) =>

              setSearch(e.target.value)

            }

          />


          <select

            value={ordering}

            onChange={(e) =>

              setOrdering(e.target.value)

            }

          >

            <option value="-created_at">

              Newest

            </option>

            <option value="created_at">

              Oldest

            </option>

            <option value="title">

              Title A-Z

            </option>

            <option value="-title">

              Title Z-A

            </option>

          </select>

        </div>



        {

        loading

        &&

        <p>

          Loading courses...

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

            <BookOpen size={70} />

            <h2>

              No Courses Found

            </h2>

            <p>

              Try changing your search.

            </p>

          </div>

        )

        }



        <div className="courses-grid">


          {

          courses.map((course) => (

            <div

              key={course.id}

              className="premium-course-card"

            >


              <div className="course-icon">

                <BookOpen size={28} />

              </div>



              <h2>

                {course.title}

              </h2>



              <p className="course-description">

                {course.description}

              </p>



              <div className="course-meta">

                <p>

                  <User size={16} />

                  {course.instructor_name}

                </p>


                <p>

                  <BookOpen size={16} />

                  {course.lesson_count}

                  {" "}

                  Lessons

                </p>


                <p>

                  <Calendar size={16} />

                  {

                  formatDate(

                    course.created_at

                  )

                  }

                </p>

              </div>



              <div className="course-footer">


                {

                course.is_enrolled

                ?

                (

                  <div className="status-badge enrolled">

                    <CheckCircle size={16} />

                    Enrolled

                  </div>

                )

                :

                (

                  <div className="status-badge">

                    <Circle size={14} />

                    Not Enrolled

                  </div>

                )

                }



                <Link

                  to={`/courses/${course.id}`}

                  className="action-btn"

                >

                  Open Course

                  <ArrowRight size={18} />

                </Link>


              </div>


            </div>

          ))

          }


        </div>


      </div>

    </>

  );

}

export default CourseListPage;