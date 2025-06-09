import apiInstance from "../common";

export class AuthAPI {
  private getToken(): string | null {
    const authData = localStorage.getItem("authData");
    return authData ? JSON.parse(authData).token : null;
  }

  async loginUser(email: string, password: string) {
    try {
      const response = await apiInstance.post("login", { email, password });
      const userData = response.data;

      // Pobierz departamenty
      const departmentsResponse = await apiInstance.get("departments", {
        headers: { Authorization: `Bearer ${userData.token}` },
      });

      return {
        ...userData,
        departments: departmentsResponse.data, // Dodanie departamentów do danych użytkownika
      };
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const response = await apiInstance.post("token/refresh", {
        refresh_token: refreshToken,
      });
      return response.data;
    } catch (error) {
      console.error("Error refresh token", error);
      throw error;
    }
  }

  async resetPassword(email: string) {
    try {
      const response = await apiInstance.post("/user/reset", { email });
      return response.data;
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  }

  async getUsersData() {
    const token = this.getToken();
    if (!token) {
      throw new Error("Token nie jest dostępny");
    }

    try {
      const response = await apiInstance.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Błąd podczas pobierania danych użytkownika:", error);
      throw error;
    }
  }

  async getUserProfile() {
    const token = this.getToken();
    if (!token) {
      throw new Error("Token nie jest dostępny");
    }

    try {
      const response = await apiInstance.get("/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Błąd podczas pobierania profilu użytkownika:", error);
      throw error;
    }
  }

  async addUser(user: {
    email: string;
    name: string;
    surname: string;
    password: string;
    team: number;
    isActive: boolean;
  }) {
    const token = this.getToken();

    if (!token) {
      throw new Error("Token nie jest dostępny");
    }
    try {
      const response = await apiInstance.post("/user", user, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async changePasswordWithTicket(
    ticket: string,
    newPassword: string
  ): Promise<any> {
    try {
      return await apiInstance.post(`/user/reset/${ticket}`, {
        password: newPassword,
      });
    } catch (error) {
      console.error("Błąd podczas zmiany hasła z użyciem ticketu:", error);
      throw error;
    }
  }

  async deleteUser(id: number) {
    const token = this.getToken();

    if (!token) {
      throw new Error("Token nie jest dostępny");
    }

    try {
      const response = await apiInstance.delete(`/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Błąd podczas usuwania użytkownika:", error);
      throw error;
    }
  }


  async patchUser(id: number, userData: any) {
    const token = this.getToken();

    if (!token) {
      throw new Error("Token nie jest dostępny");
    }

    try {
      const response = await apiInstance.patch(`/user/${id}`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Błąd podczas aktualizacji danych użytkownika:", error);
      throw error;
    }
  }

  async getDepartments(token: string) {
    try {
      const response = await apiInstance.get("departments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw error;
    }
  }
}
