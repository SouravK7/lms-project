import {

  useEffect,

  useState

}

from "react";

import {

  useParams,

  useNavigate

}

from "react-router-dom";

import {

  ArrowLeft,

  Save,

  Trash2

}

from "lucide-react";

import Navbar from "../components/Navbar";

import api from "../api/axios";


function EditCoursePage() {


  const {

    id

  } = useParams();


  const navigate = useNavigate();


  const [course, setCourse] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");



  useEffect(() => {

    const fetchCourse = async () => {

      try {

        const response = await api.get(

          `/api/instructor/courses/${id}/`

        );


        setCourse(

          response.data

        );

      }

      catch {

        setError(

          "Unable to load course."

        );

      }

      finally {

        setLoading(false);

      }

    };


    fetchCourse();

  }, [id]);





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





  const handleSave = async () => {

    try {

      setSaving(true);


      const response = await api.patch(

        `/api/instructor/courses/${id}/`,

        course

      );


      setCourse(

        response.data

      );

    }

    catch {

      alert(

        "Unable to save."

      );

    }

    finally {

      setSaving(false);

    }

  };






  const handleDelete = async () => {


    const confirmed = window.confirm(

      "Delete this course?"

    );


    if (!confirmed)

      return;



    try {

      await api.delete(

        `/api/instructor/courses/${id}/`

      );


      navigate(

        "/teacher"

      );

    }

    catch {

      alert(

        "Unable to delete."

      );

    }

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




        {

        error

        &&

        <p className="error">

          {error}

        </p>

        }




        {

        course

        &&

        (

          <div className="form-card">


            <h1>

              Edit Course

            </h1>




            <label>

              Course Title

            </label>

            <input

              type="text"

              name="title"

              value={course.title}

              onChange={handleChange}

            />





            <label>

              Description

            </label>

            <textarea

              rows={6}

              name="description"

              value={course.description}

              onChange={handleChange}

            />






            <div className="checkbox-row">

                <input

                    id="published"

                    type="checkbox"

                    name="published"

                    checked={course.published}

                    onChange={handleChange}

                />


                <label htmlFor="published">

                    Published

                </label>

                </div>






            <div className="form-actions">


              <button

                onClick={handleSave}

                disabled={saving}

              >

                <Save size={18}/>

                {

                saving

                ?

                "Saving..."

                :

                "Save"

                }

              </button>






              <button

                className="danger-btn"

                onClick={handleDelete}

              >

                <Trash2 size={18}/>

                Delete

              </button>


            </div>

          </div>

        )

        }

      </div>

    </>

  );

}


export default EditCoursePage;