import { useEffect, useState } from "react";

import {

  useNavigate,

  useParams

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


function EditLessonPage() {

  const { id } = useParams();

  const navigate = useNavigate();


  const [lesson,setLesson] = useState(null);

  const [loading,setLoading] = useState(true);

  const [saving,setSaving] = useState(false);

  const [error,setError] = useState("");



  useEffect(()=>{

    const fetchLesson = async()=>{

      try{

        const response = await api.get(

          `/api/instructor/lessons/${id}/`

        );

        setLesson(response.data);

      }

      catch{

        setError(

          "Unable to load lesson."

        );

      }

      finally{

        setLoading(false);

      }

    };


    fetchLesson();

  },[id]);





  const handleChange=(e)=>{

    setLesson({

      ...lesson,

      [e.target.name]:

      e.target.value

    });

  };





  const handleSave=async()=>{

    try{

      setSaving(true);


      const response=

      await api.patch(

        `/api/instructor/lessons/${id}/`,

        lesson

      );


      setLesson(

        response.data

      );


      alert(

        "Lesson updated."

      );

    }

    catch{

      alert(

        "Unable to save."

      );

    }

    finally{

      setSaving(false);

    }

  };






  const handleDelete=async()=>{


    const confirmed=

    window.confirm(

      "Delete lesson?"

    );


    if(!confirmed)

      return;



    try{

      await api.delete(

        `/api/instructor/lessons/${id}/`

      );


      navigate(

        "/teacher"

      );

    }

    catch{

      alert(

        "Unable to delete."

      );

    }

  };






  if(loading){

    return(

      <>

      <Navbar/>

      <div className="page-container">

        Loading...

      </div>

      </>

    );

  }




  return(

    <>

    <Navbar/>


    <div className="page-container">


      <button

        className="back-btn"

        onClick={()=>navigate(-1)}

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

      lesson

      &&

      (

      <div className="form-card">


        <h1>

          Edit Lesson

        </h1>





        <label>

          Lesson Title

        </label>

        <input

          type="text"

          name="title"

          value={lesson.title}

          onChange={handleChange}

        />






        <label>

          Lesson Order

        </label>

        <input

          type="number"

          name="order"

          value={lesson.order}

          onChange={handleChange}

        />






        <label>

          Video URL

        </label>

        <input

          type="text"

          name="video_url"

          value={lesson.video_url||""}

          onChange={handleChange}

        />







        <label>

          Content

        </label>

        <textarea

          rows={12}

          name="content"

          value={lesson.content}

          onChange={handleChange}

        />







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


export default EditLessonPage;