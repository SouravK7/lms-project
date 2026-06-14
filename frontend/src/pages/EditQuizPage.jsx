import { useEffect, useState } from "react";

import {

  useParams,

  useNavigate

}

from "react-router-dom";

import {

  ArrowLeft,

  Plus,

  Trash2,

  Save

}

from "lucide-react";

import Navbar from "../components/Navbar";

import api from "../api/axios";


function EditQuizPage() {


  const { id } = useParams();

  const navigate = useNavigate();


  const [quiz,setQuiz] = useState(null);

  const [loading,setLoading] = useState(true);

  const [saving,setSaving] = useState(false);

  const [error,setError] = useState("");



  useEffect(()=>{


    const fetchQuiz = async()=>{


      try{

        const response = await api.get(

          `/api/quizzes/${id}/`

        );


        setQuiz(

          response.data

        );

      }

      catch{

        setError(

          "Unable to load quiz."

        );

      }

      finally{

        setLoading(false);

      }

    };


    fetchQuiz();


  },[id]);





  const handlePassScore=(e)=>{

    setQuiz({

      ...quiz,

      pass_score:e.target.value

    });

  };





  const handleQuestionChange=(

    index,

    field,

    value

  )=>{


    const updated=[

      ...quiz.questions

    ];


    updated[index][field]=value;


    setQuiz({

      ...quiz,

      questions:updated

    });

  };





  const handleChoiceChange=(

    qIndex,

    cIndex,

    value

  )=>{


    const updated=[

      ...quiz.questions

    ];


    updated[qIndex]

    .choices[cIndex]

    .text=value;


    setQuiz({

      ...quiz,

      questions:updated

    });

  };





  const setCorrectChoice=(

    qIndex,

    cIndex

  )=>{


    const updated=[

      ...quiz.questions

    ];


    updated[qIndex]

    .choices

    .forEach((choice,index)=>{

      choice.is_correct=

      index===cIndex;

    });


    setQuiz({

      ...quiz,

      questions:updated

    });

  };






  const addQuestion=()=>{


    setQuiz({

      ...quiz,

      questions:[

        ...quiz.questions,

        {

          text:"",

          question_type:"MCQ",

          choices:[

            {

              text:"",

              is_correct:true

            },

            {

              text:"",

              is_correct:false

            }

          ]

        }

      ]

    });

  };






  const addChoice=(qIndex)=>{


    const updated=[

      ...quiz.questions

    ];


    updated[qIndex]

    .choices

    .push({

      text:"",

      is_correct:false

    });


    setQuiz({

      ...quiz,

      questions:updated

    });

  };







  const deleteQuestion=(index)=>{


    const updated=[

      ...quiz.questions

    ];


    updated.splice(

      index,

      1

    );


    setQuiz({

      ...quiz,

      questions:updated

    });

  };








  const saveQuiz=async()=>{


    try{


      setSaving(true);


      await api.patch(

        `/api/instructor/quizzes/${id}/`,

        quiz

      );


      alert(

        "Quiz updated successfully."

      );


      navigate(-1);


    }

    catch{


      alert(

        "Unable to save quiz."

      );

    }

    finally{


      setSaving(false);

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




  if(error){

    return(

      <>

      <Navbar/>

      <div className="page-container">

        <p className="error">

          {error}

        </p>

      </div>

      </>

    );

  }






  return (

    <>

      <Navbar/>


      <div className="page-container instructor-form-page">



        <button

          className="back-btn"

          onClick={()=>navigate(-1)}

        >

          <ArrowLeft size={18}/>

          Back

        </button>





        <h1>

          Edit Quiz

        </h1>





        <label>

          Pass Score

        </label>


        <input

          type="number"

          value={quiz.pass_score}

          onChange={handlePassScore}

        />








        {

        quiz.questions.map(

          (question,qIndex)=>(


          <div

            key={qIndex}

            className="question-editor"

          >



            <div className="question-top">


              <h2>

                Question

                {qIndex+1}

              </h2>



              <button

                className="delete-btn"

                onClick={()=>

                deleteQuestion(qIndex)

                }

              >

                <Trash2 size={18}/>

              </button>


            </div>






            <textarea

              rows={3}

              value={question.text}

              onChange={(e)=>

              handleQuestionChange(

                qIndex,

                "text",

                e.target.value

              )

              }

            />






            <select

              value={

                question.question_type

              }

              onChange={(e)=>

              handleQuestionChange(

                qIndex,

                "question_type",

                e.target.value

              )

              }

            >

              <option value="MCQ">

                MCQ

              </option>

              <option value="TF">

                True / False

              </option>

            </select>







            {

            question.choices.map(

            (choice,cIndex)=>(


            <div

              key={cIndex}

              className="choice-row"

            >



              <input

                type="radio"

                checked={

                  choice.is_correct

                }

                onChange={()=>

                setCorrectChoice(

                  qIndex,

                  cIndex

                )

                }

              />




              <input

                type="text"

                value={choice.text}

                onChange={(e)=>

                handleChoiceChange(

                  qIndex,

                  cIndex,

                  e.target.value

                )

                }

              />


            </div>

            ))

            }






            <button

              className="secondary-btn"

              onClick={()=>

              addChoice(qIndex)

              }

            >

              <Plus size={18}/>

              Add Choice

            </button>


          </div>

        ))

        }








        <div className="editor-actions">


          <button

            className="secondary-btn"

            onClick={addQuestion}

          >

            <Plus size={18}/>

            Add Question

          </button>





          <button

            onClick={saveQuiz}

            disabled={saving}

          >

            <Save size={18}/>

            {

            saving

            ?

            "Saving..."

            :

            "Save Quiz"

            }

          </button>


        </div>


      </div>

    </>

  );

}


export default EditQuizPage;