import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { AuthUser } from "../../_types";
import { AuthAPI } from "../../_services/api/authAPI";

const UserContext = createContext<any>({} as any);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [authData, setAuthData] = useState<AuthUser>(
    localStorage.getItem("authData")
      ? JSON.parse(localStorage.getItem("authData") || "")
      : {}
  );
  const [departments, setDepartments] = useState<any[]>([]); // Stan dla departamentów
  const authApi = new AuthAPI();

  // Zapisanie authData w localStorage
  useEffect(() => {
    if (
      authData &&
      Object.keys(authData).length > 0 &&
      authData.token.length > 0
    ) {
      localStorage.setItem("authData", JSON.stringify(authData));
    }
  }, [authData]);

  // Wylogowanie użytkownika po wygaśnięciu tokena
  useEffect(() => {
    if (authData.exp) {
      const nowTimestamp = new Date();
      const expireTimestamp = new Date(authData.exp * 1000);
      if (expireTimestamp <= nowTimestamp) {
        logout();
      }
    }
  });

  // Funkcja logowania
  const login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    try {
      const res = await authApi.loginUser(email, password); // Logowanie
      const jwtDecoded: AuthUser = jwtDecode(res.token);
      jwtDecoded.token = res.token;
      jwtDecoded.refreshToken = res.refresh_token;

      // Pobranie departamentów i zapisanie ich w stanie
      setDepartments(res.departments);

      setAuthData(jwtDecoded);
      navigate("/home");
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  };

  // Funkcja wylogowania
  const logout = () => {
    localStorage.removeItem("authData");
    setAuthData({
      exp: 0,
      iat: 0,
      roles: [],
      token: "",
      username: "",
      refreshToken: "",
    });
    setDepartments([]); // Wyczyszczenie departamentów
    navigate("/login");
  };

  // Odświeżenie tokena
  const refreshToken = async () => {
    try {
      const refreshedAuthData = await authApi.refreshToken(authData.refreshToken);
      const jwtDecoded: AuthUser = jwtDecode(refreshedAuthData.token);
      jwtDecoded.token = refreshedAuthData.token;
      jwtDecoded.refreshToken = refreshedAuthData.refresh_token;
      setAuthData(jwtDecoded);
    } catch (error) {
      console.error("Error during token refresh:", error);
      logout();
    }
  };

  // Resetowanie hasła
  const resetPassword = async (email: string) => {
    try {
      await authApi.resetPassword(email);
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  };

  // Udostępnienie wartości w kontekście
  const value = useMemo(
    () => ({
      authData,
      departments, 
      refreshToken,
      login,
      logout,
      resetPassword,
    }),
    [authData, departments]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useAuth = () => {
  return useContext(UserContext);
};
