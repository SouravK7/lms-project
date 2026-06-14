import { useState } from "react";

import {

  useNavigate

}

from "react-router-dom";

import {

  ArrowLeft,

  Save

}

from "lucide-react";

import Navbar from "../components/Navbar";

import api from "../api/axios";


function CreateCoursePage() {

  const navigate = useNavigate();


  const [course, setCourse] = useState({

    title: "",

    description: "",

    published: false

  });


  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");



  const handleChange = (e) => {

    const {

      name,

      value,

      type,

      checked

    } = e.target;


    setCourse({

      ...course,

      [name]:

      type === "checkbox"

      ?

      checked

      :

      value

    });

  };



  const handleSubmit = async (e) => {

    e.preventDefault();


    try {

      setLoading(true);

      setError("");


      const response = await api.post(

        "/api/instructor/courses/",

        course

      );


      navigate(

        `/teacher/course/${response.data.id}/edit`

      );

    }

    catch {

      setError(

        "Unable to create course."

      );

    }

    finally {

      setLoading(false);

    }

  };



  return (

    <>

      <Navbar />


      <div className="page-container">


        <button

          className="back-btn"

          onClick={() => navigate(-1)}

        >

          <ArrowLeft size={18}/>

          Back

        </button>



        <div className="form-card">


          <h1>

            Create Course

          </h1>


          <p>

            Create a new course for Learn Hub.

          </p>



          {

          error

          &&

          <p className="error">

            {error}

          </p>

          }



          <form onSubmit={handleSubmit}>


            <label>

              Course Title

            </label>

            <input

              type="text"

              name="title"

              value={course.title}

              onChange={handleChange}

              required

            />




            <label>

              Description

            </label>

            <textarea

              rows={6}

              name="description"

              value={course.description}

              onChange={handleChange}

              required

            />





            <label className="checkbox-row">

              <input

                type="checkbox"

                name="published"

                checked={course.published}

                onChange={handleChange}

              />

              Publish immediately

            </label>





            <button

              type="submit"

              disabled={loading}

            >

              <Save size={18}/>

              {

              loading

              ?

              "Creating..."

              :

              "Create Course"

              }

            </button>


          </form>

        </div>

      </div>

    </>

  );

}

export default CreateCoursePage;