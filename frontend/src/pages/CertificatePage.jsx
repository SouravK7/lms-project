import { useEffect, useState } from "react";

import {

  useParams,

  useNavigate

}

from "react-router-dom";

import {

  ArrowLeft,

  Award,

  Printer

}

from "lucide-react";

import Navbar from "../components/Navbar";

import api from "../api/axios";

import "../styles/certificate.css";


function CertificatePage() {

  const { id } = useParams();

  const navigate = useNavigate();


  const [certificate, setCertificate] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  useEffect(() => {

    const fetchCertificate = async () => {

      try {

        const response = await api.get(

          `/api/courses/${id}/certificate/`

        );

        setCertificate(

          response.data

        );

      }

      catch (error) {

        setError(

          error.response?.data?.error

          ||

          "Unable to load certificate."

        );

      }

      finally {

        setLoading(false);

      }

    };


    fetchCertificate();

  }, [id]);



  const handlePrint = () => {

    window.print();

  };



  if (loading) {

    return (

      <>

        <Navbar />

        <div className="page-container">

          Loading Certificate...

        </div>

      </>

    );

  }



  if (error) {

    return (

      <>

        <Navbar />

        <div className="page-container">


          <button

            className="back-btn"

            onClick={() => navigate(-1)}

          >

            <ArrowLeft size={18} />

            Back

          </button>


          <p className="error">

            {error}

          </p>


        </div>

      </>

    );

  }



  return (

    <>

      <Navbar />


      <div className="page-container certificate-page">


        <button

          className="back-btn no-print"

          onClick={() => navigate(-1)}

        >

          <ArrowLeft size={18} />

          Back

        </button>



        <div className="certificate-wrapper">


          <div className="certificate">


            <Award

              size={70}

              className="certificate-icon"

            />


            <p className="certificate-brand">

              LEARN HUB

            </p>


            <h1>

              Certificate

              of Completion

            </h1>


            <p className="certificate-subtitle">

              This certifies that

            </p>


            <h2>

              {

              certificate.student_name

              }

            </h2>


            <p className="certificate-subtitle">

              has successfully completed

            </p>


            <h3>

              {

              certificate.course_name

              }

            </h3>


            <div className="certificate-meta">


              <div>

                <span>

                  Completed On

                </span>


                <p>

                  {

                  certificate.completed_at

                  }

                </p>

              </div>



              <div>

                <span>

                  Certificate ID

                </span>


                <p>

                  {

                  certificate.certificate_id

                  }

                </p>

              </div>


            </div>


            <div className="certificate-footer">

              Learn Smarter

            </div>


          </div>



          <button

            className="print-btn no-print"

            onClick={handlePrint}

          >

            <Printer size={18} />

            Print Certificate

          </button>


        </div>


      </div>

    </>

  );

}


export default CertificatePage;