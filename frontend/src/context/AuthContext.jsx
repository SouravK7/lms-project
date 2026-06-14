import {

  createContext,

  useContext,

  useEffect,

  useState

} from "react";

import api from "../api/axios";


const AuthContext = createContext();



export function AuthProvider({ children }) {


  const [accessToken, setAccessToken] = useState(

    localStorage.getItem("access")

  );


  const [refreshToken, setRefreshToken] = useState(

    localStorage.getItem("refresh")

  );


  const [user, setUser] = useState(null);





  useEffect(() => {

    const fetchProfile = async () => {

      if (!accessToken) {

        setUser(null);

        return;

      }


      try {

        const response = await api.get(

          "/api/auth/profile/"

        );

        setUser(response.data);

      }

      catch {

        setUser(null);

      }

    };


    fetchProfile();

  }, [accessToken]);






  const login = (access, refresh) => {

    localStorage.setItem(

      "access",

      access

    );


    localStorage.setItem(

      "refresh",

      refresh

    );


    setAccessToken(access);

    setRefreshToken(refresh);

  };






  const logout = () => {

    localStorage.removeItem("access");

    localStorage.removeItem("refresh");


    setAccessToken(null);

    setRefreshToken(null);

    setUser(null);

  };





  return (

    <AuthContext.Provider

      value={{

        accessToken,

        refreshToken,

        user,

        login,

        logout,

        isAuthenticated:

          Boolean(accessToken),

      }}

    >

      {children}

    </AuthContext.Provider>

  );

}



export const useAuth = () =>

  useContext(AuthContext);