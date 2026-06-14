import {

  useEffect,

  useState

} from "react";

import {

  useNavigate

} from "react-router-dom";

import {

  ArrowLeft,

  Pencil,

  Lock,

  Save,

  X

} from "lucide-react";

import Navbar from "../components/Navbar";

import api from "../api/axios";



function ProfilePage() {


  const navigate = useNavigate();


  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);


  const [editingProfile, setEditingProfile] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);


  const [success, setSuccess] = useState("");

  const [errors, setErrors] = useState({});


  const [profile, setProfile] = useState({

    first_name: "",

    last_name: "",

    username: "",

    email: "",

    role: "",

    bio: ""

  });


  const [passwordData, setPasswordData] = useState({

    current_password: "",

    new_password: "",

    confirm_password: ""

  });




  useEffect(() => {


    const fetchProfile = async () => {


      try {


        const response = await api.get(

          "/api/auth/profile/"

        );


        setProfile(

          response.data

        );

      }


      catch {


        setErrors({

          general:

          "Unable to load profile."

        });

      }


      finally {


        setLoading(false);

      }

    };


    fetchProfile();

  }, []);





  const handleProfileChange = (e) => {

    setProfile({

      ...profile,

      [e.target.name]:

      e.target.value

    });

  };





  const handlePasswordChange = (e) => {

    setPasswordData({

      ...passwordData,

      [e.target.name]:

      e.target.value

    });

  };






  const saveProfile = async () => {


    try {


      setSaving(true);

      setErrors({});

      setSuccess("");


      await api.patch(

        "/api/auth/profile/",

        {

          email:

          profile.email,

          bio:

          profile.bio

        }

      );


      setSuccess(

        "Profile updated successfully."

      );


      setEditingProfile(false);

    }


    catch (error) {


      setErrors(

        error.response?.data || {}

      );

    }


    finally {


      setSaving(false);

    }

  };







  const changePassword = async () => {


    try {


      setChangingPassword(true);

      setErrors({});

      setSuccess("");


      await api.post(

        "/api/auth/change-password/",

        passwordData

      );


      setPasswordData({

        current_password: "",

        new_password: "",

        confirm_password: ""

      });


      setShowPasswordForm(false);


      setSuccess(

        "Password changed successfully."

      );

    }


    catch (error) {


      setErrors(

        error.response?.data || {}

      );

    }


    finally {


      setChangingPassword(false);

    }

  };





  if (loading) {


    return (

      <>

        <Navbar />


        <div className="page-container">

          Loading...

        </div>

      </>

    );

  }




  const displayName =

    `${

    profile.first_name || ""

    }

    ${

    profile.last_name || ""

    }`

    .trim()

    ||

    profile.username;



  const avatarLetter =

    profile.first_name

    ?.charAt(0)

    ?.toUpperCase()

    ||

    profile.username

    ?.charAt(0)

    ?.toUpperCase();





  return (

    <>

      <Navbar />



      <div className="page-container profile-page">



        <button

          className="back-btn"

          onClick={() => navigate(-1)}

        >

          <ArrowLeft size={18} />

          Back

        </button>





        <div className="profile-header">


          <div className="profile-avatar">

            {avatarLetter}

          </div>



          <h1>

            {displayName}

          </h1>



          <p>

            {

            profile.role

            ?

            profile.role

            .charAt(0)

            .toUpperCase()

            +

            profile.role

            .slice(1)

            :

            ""

            }

          </p>



        </div>






        {

        success

        &&

        <p className="success">

          {success}

        </p>

        }



        {

        errors.general

        &&

        <p className="error">

          {errors.general}

        </p>

        }







        <div className="profile-card">


          <label>

            First Name

          </label>

          <input

            value={profile.first_name}

            disabled

          />





          <label>

            Last Name

          </label>

          <input

            value={profile.last_name}

            disabled

          />





          <label>

            Username

          </label>

          <input

            value={profile.username}

            disabled

          />





          <label>

            Email

          </label>

          <input

            name="email"

            value={profile.email}

            disabled={!editingProfile}

            onChange={handleProfileChange}

          />





          <label>

            Bio

          </label>

          <textarea

            rows={5}

            name="bio"

            maxLength={300}

            value={profile.bio || ""}

            disabled={!editingProfile}

            onChange={handleProfileChange}

          />





          {

          editingProfile

          ?

          (

            <div className="profile-actions">


              <button

                className="secondary-btn"

                onClick={() =>

                  setEditingProfile(false)

                }

              >

                <X size={18} />

                Cancel

              </button>





              <button

                onClick={saveProfile}

                disabled={saving}

              >

                <Save size={18} />

                {

                saving

                ?

                "Saving..."

                :

                "Save"

                }

              </button>


            </div>

          )

          :

          (

            <div className="profile-actions">


              <button

                onClick={() =>

                  setEditingProfile(true)

                }

              >

                <Pencil size={18} />

                Edit Profile

              </button>





              <button

                className="secondary-btn"

                onClick={() =>

                  setShowPasswordForm(

                    !showPasswordForm

                  )

                }

              >

                <Lock size={18} />

                Change Password

              </button>


            </div>

          )

          }


        </div>






        {

        showPasswordForm

        &&

        (

          <div className="password-card">


            <h2>

              Change Password

            </h2>





            <input

              type="password"

              name="current_password"

              placeholder="Current Password"

              value={

                passwordData

                .current_password

              }

              onChange={

                handlePasswordChange

              }

            />





            <input

              type="password"

              name="new_password"

              placeholder="New Password"

              value={

                passwordData

                .new_password

              }

              onChange={

                handlePasswordChange

              }

            />





            <input

              type="password"

              name="confirm_password"

              placeholder="Confirm Password"

              value={

                passwordData

                .confirm_password

              }

              onChange={

                handlePasswordChange

              }

            />





            <button

              onClick={changePassword}

              disabled={changingPassword}

            >

              {

              changingPassword

              ?

              "Changing..."

              :

              "Update Password"

              }

            </button>


          </div>

        )

        }


      </div>


    </>

  );

}


export default ProfilePage;