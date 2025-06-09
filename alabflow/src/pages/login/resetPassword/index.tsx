import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import { AuthAPI } from "../../../_services/api/authAPI";
import { isValidPassword } from "../../../_utils";

export default function ResetPassword() {
  const { ticket } = useParams<{ ticket: string }>();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const authApi = new AuthAPI();
  const navigate = useNavigate();

  const handlePasswordChange = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    if (!ticket) {
      setError("Token resetowania hasła nie jest poprawny.");
      setIsLoading(false);
      return;
    }

    const passwordError = isValidPassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Hasła nie są zgodne.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await authApi.changePasswordWithTicket(
        ticket,
        newPassword
      );
      if (result.status === 204) {
        navigate("/login"); // Przekierowanie do logowania
      } else {
        throw new Error("Nieoczekiwany błąd.");
      }
    } catch (error: any) {
      setError(error.message || "Wystąpił błąd podczas zmiany hasła.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#ffffff]">
      <div className="bg-gray-100 shadow-md rounded p-6 mt-10 w-1/4">
        <div className="flex items-end mb-4 justify-center">
          <img src="/logoalab.png" alt="Logo Alab" className="w-20 h-20 mr-2" />
          <h1 className="text-2xl font-bold text-[#black]">AlabFlow</h1>
        </div>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <form onSubmit={handlePasswordChange}>
          <div className="relative w-full mb-4">
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nowe hasło"
              tabIndex={1} // Priorytet Tab
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowNewPassword(!showNewPassword);
              }}
              className="absolute top-1/3 transform -translate-y-1/2 right-3 text-gray-400 hover:text-gray-500"
              tabIndex={-1} // Wyłącz Tab
            >
              {showNewPassword ? <EyeSlash /> : <Eye />}
            </button>
          </div>
          <div className="relative w-full mb-4">
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Potwierdź nowe hasło"
              tabIndex={2} // Priorytet Tab
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowConfirmPassword(!showConfirmPassword);
              }}
              className="absolute top-1/3 transform -translate-y-1/2 right-3 text-gray-400 hover:text-gray-500"
              tabIndex={-1} // Wyłącz Tab
            >
              {showConfirmPassword ? <EyeSlash /> : <Eye />}
            </button>
          </div>
          <div className="flex justify-center">
            <button
              disabled={!newPassword || !confirmPassword || isLoading}
              className={`w-150 font-bold py-2 px-4 rounded ${
                newPassword && confirmPassword && !isLoading
                  ? "bg-[#00A0E3] hover:bg-[#007CB6] text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              type="submit"
              tabIndex={3} // Priorytet Tab
            >
              Aktualizuj hasło
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
