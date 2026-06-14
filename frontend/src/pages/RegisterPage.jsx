import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios";


function RegisterPage() {

  const navigate = useNavigate();


  const [firstName, setFirstName] = useState("");

  const [lastName, setLastName] = useState("");

  const [username, setUsername] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [password2, setPassword2] = useState("");

  const [bio, setBio] = useState("");


  const [error, setError] = useState("");

  const [submitting, setSubmitting] = useState(false);




  const handleSubmit = async (e) => {

    e.preventDefault();


    if (submitting) return;


    setSubmitting(true);

    setError("");


    try {

      await api.post(

        "/api/auth/register/",

        {

          first_name: firstName,

          last_name: lastName,

          username,

          email,

          password,

          password2,

          bio,

        }

      );


      navigate("/login");

    }

    catch (error) {

      const data = error.response?.data;


      if (

        data

        &&

        typeof data === "object"

      ) {

        const messages = Object

          .values(data)

          .flat()

          .map(

            (msg) =>

              Array.isArray(msg)

              ?

              msg[0]

              :

              msg

          )

          .join(" ");


        setError(

          messages ||

          "Registration failed."

        );

      }

      else {

        setError(

          "Registration failed."

        );

      }

    }

    finally {

      setSubmitting(false);

    }

  };





  const handleChange =

    (setter) =>

    (e) => {

      setter(

        e.target.value

      );

      setError("");

    };





  return (

    <div className="auth-container">


      <div className="auth-card">


        <h1>

          Learn Hub

        </h1>



        <p>

          Create your account

        </p>





        <form

          onSubmit={handleSubmit}

        >



          <label>

            First Name

          </label>

          <input

            type="text"

            value={firstName}

            onChange={

              handleChange(

                setFirstName

              )

            }

            required

          />





          <label>

            Last Name

          </label>

          <input

            type="text"

            value={lastName}

            onChange={

              handleChange(

                setLastName

              )

            }

          />





          <label>

            Username

          </label>

          <input

            type="text"

            value={username}

            onChange={

              handleChange(

                setUsername

              )

            }

            required

          />





          <label>

            Email

          </label>

          <input

            type="email"

            value={email}

            onChange={

              handleChange(

                setEmail

              )

            }

            required

          />





          <label>

            Password

          </label>

          <input

            type="password"

            value={password}

            onChange={

              handleChange(

                setPassword

              )

            }

            required

          />





          <label>

            Confirm Password

          </label>

          <input

            type="password"

            value={password2}

            onChange={

              handleChange(

                setPassword2

              )

            }

            required

          />





          <label>

            Bio

          </label>

          <textarea

            rows={3}

            maxLength={300}

            value={bio}

            onChange={

              handleChange(

                setBio

              )

            }

            placeholder="Tell us a little about yourself"

          />





          <p className="counter">

            {bio.length}/300

          </p>





          {

          error

          &&

          (

            <p className="error">

              {error}

            </p>

          )

          }





          <button

            type="submit"

            disabled={submitting}

          >

            {

            submitting

            ?

            "Creating..."

            :

            "Create Account"

            }

          </button>


        </form>





        <p className="auth-switch">

          Already have an account?

          {" "}

          <Link to="/login">

            Login

          </Link>

        </p>



      </div>


    </div>

  );

}


export default RegisterPage;