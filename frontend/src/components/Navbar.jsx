import {

  Link,

  NavLink,

  useNavigate

}

from "react-router-dom";


import {

  GraduationCap

}

from "lucide-react";


import {

  useAuth

}

from "../context/AuthContext";


import ThemeToggle from "./ThemeToggle";



function Navbar() {


  const navigate = useNavigate();


  const {

    logout,

    user

  } = useAuth();




  const handleLogout = () => {


    logout();


    navigate(

      "/login",

      {

        replace: true

      }

    );

  };





  const displayName =


    user?.first_name


    ||


    user?.username


    ||


    "Profile";





  const avatarLetter =


    user?.first_name

    ?.charAt(0)

    ?.toUpperCase()


    ||


    user?.username

    ?.charAt(0)

    ?.toUpperCase()


    ||


    "?";





  return (

    <nav className="navbar">



      <div className="navbar-left">



        <Link

          to="/dashboard"

          className="logo"

        >



          <div className="logo-icon">

            <GraduationCap size={20} />

          </div>





          <div className="logo-text">


            <h2>

              Learn Hub

            </h2>



            <span>

              Learn Smarter

            </span>


          </div>



        </Link>






        <NavLink

          to="/dashboard"

          className={({ isActive }) =>

            isActive

            ?

            "nav-link active"

            :

            "nav-link"

          }

        >

          Dashboard

        </NavLink>







        <NavLink

          to="/courses"

          className={({ isActive }) =>

            isActive

            ?

            "nav-link active"

            :

            "nav-link"

          }

        >

          Courses

        </NavLink>







        {

        user?.role === "instructor"

        &&

        (

          <NavLink

            to="/teacher"

            className={({ isActive }) =>

              isActive

              ?

              "nav-link active"

              :

              "nav-link"

            }

          >

            Instructor

          </NavLink>

        )

        }




      </div>







      <div className="navbar-right">



        <ThemeToggle />






        <NavLink

          to="/profile"

          className={({ isActive }) =>

            isActive

            ?

            "nav-profile active"

            :

            "nav-profile"

          }

        >



          <div className="nav-profile-avatar">

            {avatarLetter}

          </div>





          <span

            className="nav-profile-name"

          >

            {displayName}

          </span>



        </NavLink>








        <button

          className="logout-btn"

          onClick={handleLogout}

        >

          Logout

        </button>




      </div>




    </nav>

  );

}



export default Navbar;