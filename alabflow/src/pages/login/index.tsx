import { useEffect, useState } from "react";
import { useAuth } from "../../_hooks/auth";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import { isValidEmail } from "../../_utils";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, resetPassword: resetUserPassword } = useAuth();
  const [message, setMessage] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailLocked, setIsEmailLocked] = useState(false);
  const [isFirefox, setIsFirefox] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isOpera, setIsOpera] = useState(false);
  const [isBrave, setIsBrave] = useState(false);


  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes("firefox")) {
      setIsFirefox(true);
    }

    if (userAgent.includes("safari") && !userAgent.includes("chrome")) {
      setIsSafari(true);
    }

    if (userAgent.includes("opr") || userAgent.includes("opera")) {
      setIsOpera(true);
    }

    if (userAgent.includes("brave")) {
      setIsBrave(true);
    }
  }, []);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Zawsze czyść poprzednie błędy przed nową próbą

    if (!isValidEmail(email)) {
      setError("Podaj poprawny adres e-mail.");
      setIsLoading(false);
      return;
    }

    if (email === "" || password === "") {
      setError("Proszę wprowadzić e-mail i hasło.");
      setIsLoading(false);
      return;
    }

    try {
      await login({ email, password });
      window.location.reload();
    } catch (error: any) {
      // === NOWA, PRECYZYJNA OBSŁUGA BŁĘDÓW ===

      // Sprawdzamy, czy istnieje odpowiedź od serwera z danymi błędu
      if (error.response && error.response.data) {
        const errorData = error.response.data; // np. { code: 401, message: "Nieprawidłowe dane." }

        // Sprawdzamy, czy odpowiedź ma oczekiwaną strukturę
        if (errorData.code && errorData.message) {

          // Używamy `switch` na kodzie błędu
          switch (errorData.code) {
            case 401: // Błąd autoryzacji
              if (errorData.message === "Nieprawidłowe dane.") {
                setError("Nieprawidłowy e-mail lub hasło. Spróbuj ponownie.");
              } else {
                // Jeśli dla kodu 401 przyjdzie inna wiadomość, wyświetl ją
                setError(errorData.message);
              }
              break;

            // Tutaj możesz dodać obsługę innych kodów błędów w przyszłości
            case 403:
              setError("Brak uprawnień. Skontaktuj się z administratorem.");
              break;

            case 500:
              setError("Wystąpił błąd serwera. Spróbuj ponownie później.");
              break;
            case 503:
              setError("Serwis jest niedostępny. Spróbuj ponownie później.");
              break;
            case 400:
              setError("Błędne żądanie. Sprawdź dane i spróbuj ponownie.");
              break;
            case 429:
              setError("Zbyt wiele prób logowania. Spróbuj ponownie później.");
              break;
            case 404:
              setError("Nie znaleziono użytkownika o podanym e-mailu.");
              break;

            default:
              setError(`Wystąpił błąd serwera (kod: ${errorData.code}). Spróbuj ponownie.`);
              break;
          }
        } else {
          // Fallback, jeśli struktura błędu jest inna niż oczekiwana
          setError("Otrzymano nieoczekiwaną odpowiedź od serwera.");
        }
      } else {
        // Fallback na wypadek problemów z siecią
        setError("Błąd połączenia. Sprawdź internet i spróbuj ponownie.");
      }
    }
    setIsLoading(false);
  };

  const handlePasswordReset = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!isValidEmail(email)) {
      setMessage("Podaj poprawny adres email.");
      setIsLoading(false);
      return;
    }

    setIsEmailLocked(true);

    try {
      const result = await resetUserPassword(email);
      if (result) {
        setMessage(
          "Proszę sprawdzić swoją skrzynkę e-mail w celu zresetowania hasła."
        );
      } else {
        setMessage(
          "Proszę sprawdzić swoją skrzynkę e-mail. Znajdziesz tam link do zresetowania hasła."
        );
      }
    } catch (error) {
      setMessage("Wystąpił błąd podczas resetowania hasła. Spróbuj ponownie.");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#ffffff]">
      <div className="bg-gray-100 shadow-xl rounded p-6 mt-10 w-1/4">
        <div className="flex items-end mb-4 justify-center">
          <img src="/logoalab.png" alt="Logo Alab" className="w-20 h-20 mr-2" />
          <h1 className="text-2xl font-bold text-[#black]">AlabFlow</h1>
        </div>

        {isFirefox ? (
          <div className="mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded text-center">
            <strong>Uwaga:</strong> Twoja przeglądarka (<b>Firefox</b>) nie jest wspierana. <br />
            Zalecamy użycie <b>Google Chrome</b>.
          </div>
        ) : (
          <>
            {(isSafari || isOpera || isBrave) && (
              <div className="mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
                <strong>Uwaga:</strong> Twoja przeglądarka (
                {isSafari && "Safari"}
                {isOpera && "Opera"}
                {isBrave && "Brave"}
                ) nie jest wspierana. Zalecamy użycie <b>Google Chrome</b>.
              </div>
            )}

            {error && <div className="mb-4 text-red-600">{error}</div>}

            {isResetMode ? (
              <>
                {!message ? (
                  <>
                    {message && <div className="mb-4 text-blue-600">{message}</div>}
                    <form onSubmit={handleLogin}>
                      <input
                        className="w-full mb-4 p-2 border border-gray-300 rounded bg-white text-center"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Wpisz swój adres email"
                        disabled={true}
                      />
                      <div className="flex justify-center">
                        <button
                          disabled={isLoading}
                          className="w-150 bg-[#00A0E3] hover:bg-[#007CB6] text-white font-bold py-2 px-4 rounded"
                          onClick={handlePasswordReset}
                          type="button"
                        >
                          Zresetuj hasło
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="mb-4 text-blue-600 text-lg">{message}</div>
                    <button
                      className="w-150 bg-[#00A0E3] hover:bg-[#007CB6] text-white font-bold py-2 px-4 rounded"
                      onClick={() => {
                        setIsResetMode(!isResetMode);
                        window.location.href = "/login";
                      }}
                      disabled={isLoading}
                    >
                      Powrót do logowania
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <form onSubmit={handleLogin}>
                  <input
                    className="w-full mb-4 p-2 border border-gray-300 rounded"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Podaj swój e-mail"
                  />
                  <div className="relative w-full mb-6 border border-gray-300 rounded">
                    <input
                      className="w-full p-2 pl-3 pr-10"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Hasło"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setShowPassword(!showPassword);
                      }}
                      className="absolute top-1/2 transform -translate-y-1/2 right-3 text-gray-400 hover:text-gray-500"
                      type="button"
                    >
                      {showPassword ? <EyeSlash /> : <Eye />}
                    </button>
                  </div>

                  <div className="flex justify-center">
                    <button
                      disabled={!email || !password || isLoading}
                      className={`w-150 font-bold py-2 px-4 rounded shadow-md ${email && password && !isLoading
                        ? "bg-[#00A0E3] hover:bg-[#007CB6] text-white transform hover:scale-105 transition-transform duration-500"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed "
                        }`}
                      type="submit"
                    >
                      Zaloguj się
                    </button>
                  </div>
                </form>
              </>
            )}

            <div className="flex justify-center mt-2 text-center">
              {!message && (
                <button
                  className="text-gray-400 hover:text-gray-500 text-center"
                  onClick={() => {
                    if (!isValidEmail(email)) {
                      setError(
                        "Wprowadzony adres e-mail jest niepoprawny. Upewnij się, że zawiera znak '@'."
                      );
                    } else {
                      setError("");
                      setIsResetMode(!isResetMode);
                    }
                  }}
                  disabled={isLoading}
                >
                  {isResetMode ? "Anuluj" : "Zapomniałem hasła"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

}