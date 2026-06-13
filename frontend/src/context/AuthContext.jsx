import { createContext, useContext, useState } from "react";

const AuthContext = createContext();


export function AuthProvider({ children }) {

    const [accessToken, setAccessToken] = useState(
        localStorage.getItem("access")
    );

    const [refreshToken, setRefreshToken] = useState(
        localStorage.getItem("refresh")
    );


    const login = (access, refresh) => {

        localStorage.setItem("access", access);

        localStorage.setItem("refresh", refresh);

        setAccessToken(access);

        setRefreshToken(refresh);
    };


    const logout = () => {

        localStorage.removeItem("access");

        localStorage.removeItem("refresh");

        setAccessToken(null);

        setRefreshToken(null);
    };


    const value = {

        accessToken,

        refreshToken,

        login,

        logout,

        isAuthenticated: !!accessToken,
    };


    return (

        <AuthContext.Provider value={value}>

            {children}

        </AuthContext.Provider>

    );
}



export function useAuth() {

    return useContext(AuthContext);

}