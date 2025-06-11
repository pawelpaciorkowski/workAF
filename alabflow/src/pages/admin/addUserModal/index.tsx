import React, { useState, useEffect } from "react";
import { AuthAPI } from "../../../_services/api/authAPI";
import { User, Teams, Departments } from "../addUser/types";
import { useFlowApi } from "../../../_hooks/flowAPI";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: (user: User) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onUserAdded,
}) => {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [regionalManagers, setRegionalManagers] = useState<User[]>([]);
  const [isEmployerDisabled, setIsEmployerDisabled] = useState(true);
  const [passwordError, setPasswordError] = useState("");
  const [flows, setFlows] = useState<{ id: number; name: string }[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const { flowAPI } = useFlowApi();
  const authAPI = new AuthAPI();

  const [errors, setErrors] = useState({
    email: "",
    name: "",
    surname: "",
    password: "",
    department: "",
    team: "",
    selectedEmployer: "",
    selectedFlow: "",
  });

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    surname: "",
    password: "",
    team: null as number | null,
    selectedEmployer: null as number | null,
    department: null as number | null,
    selectedFlow: null as number | null,
  });

  const [isDisabled, setIsDisabled] = useState(true);

  const isAdminRole = formData.team === 1 || formData.team === 2;

  // Walidacja pojedynczego pola
  const validateField = (name: string, value: string | number | null) => {
    switch (name) {
      case "email":
        if (!value) return "Email jest wymagany.";
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(value as string)) return "Nieprawidłowy email.";
        return "";
      case "name":
        if (!value) return "Imię jest wymagane.";
        if (!/^[A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż -]{2,}$/.test(value as string)) return "Nieprawidłowe imię.";
        return "";
      case "surname":
        if (!value) return "Nazwisko jest wymagane.";
        if (!/^[A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż -]{2,}$/.test(value as string)) return "Nieprawidłowe nazwisko.";
        return "";
      case "password":
        if (!value) return "Hasło jest wymagane.";
        if ((value as string).length < 15) return "Hasło musi mieć co najmniej 15 znaków.";
        if (!/[a-z]/.test(value as string)) return "Hasło musi zawierać małą literę.";
        if (!/[A-Z]/.test(value as string)) return "Hasło musi zawierać dużą literę.";
        if (!/[0-9]/.test(value as string)) return "Hasło musi zawierać cyfrę.";
        if (!/[^A-Za-z0-9]/.test(value as string)) return "Hasło musi zawierać znak specjalny.";
        return "";
      case "department":
        if (!value) return "Wybierz departament.";
        return "";
      case "team":
        if (!value) return "Wybierz zespół.";
        return "";
      case "selectedEmployer":
        if (formData.team === 4 && !value) return "Przedstawiciel musi mieć przełożonego.";
        return "";
      case "selectedFlow":
        if (!isAdminRole && !value) return "Wybierz przepływ pracy.";
        return "";
      default:
        return "";
    }
  };

  // Pobieranie użytkowników i flowów
  const fetchUsers = async () => {
    try {
      const users = await authAPI.getUsersData();
      setUsersList(users);
      const regionalManagers = users.filter(
        (user: { team: { id: number } }) => user.team.id === 5
      );
      setRegionalManagers(regionalManagers);
    } catch (error) {
      console.error("Błąd podczas ładowania użytkowników:", error);
    }
  };

  const fetchFlows = async () => {
    try {
      const flowsData = await flowAPI.getFlows();
      setFlows(flowsData);
    } catch (error) {
      console.error("Błąd podczas ładowania przepływów pracy:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFlows();
      fetchUsers();
    } else {
      handleModalClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    setIsDisabled(
      !formData.email ||
      !formData.name ||
      !formData.surname ||
      !formData.password ||
      !formData.team ||
      (formData.team === 4 && !formData.selectedEmployer)
    );
    setIsEmployerDisabled(formData.team !== 4);
  }, [formData]);

  // Zmiana wartości pól
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "department") {
      setFormData((prev) => ({
        ...prev,
        department: parseInt(value, 10),
        team: null,
        selectedEmployer: null,
        selectedFlow: null,
      }));
      setErrors((prev) => ({
        ...prev,
        department: validateField("department", value),
        team: "",
        selectedEmployer: "",
        selectedFlow: "",
      }));
      return;
    }

    if (name === "selectedFlow") {
      setFormData((prev) => ({
        ...prev,
        selectedFlow: value ? parseInt(value, 10) : null,
      }));
      setErrors((prev) => ({
        ...prev,
        selectedFlow: validateField("selectedFlow", value ? parseInt(value, 10) : null),
      }));
      return;
    }

    if (name === "team") {
      const teamId = parseInt(value, 10);
      setFormData((prev) => ({
        ...prev,
        team: teamId,
        selectedEmployer: teamId === 4 ? prev.selectedEmployer : null,
      }));
      setErrors((prev) => ({
        ...prev,
        team: validateField("team", teamId),
        selectedEmployer: "",
      }));
      return;
    }

    if (name === "selectedEmployer") {
      setFormData((prev) => ({
        ...prev,
        selectedEmployer: parseInt(value, 10),
      }));
      setErrors((prev) => ({
        ...prev,
        selectedEmployer: validateField("selectedEmployer", parseInt(value, 10)),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));

    if (name === "password") {
      if (value.length > 0 && value.length < 15) {
        setPasswordError(
          "Hasło musi mieć co najmniej 15 znaków, znaki specjalne, małe i duże litery"
        );
      } else {
        setPasswordError("");
      }
    }
  };

  const handleModalClose = () => {
    setFormData({
      email: "",
      name: "",
      surname: "",
      password: "",
      team: null,
      selectedEmployer: null,
      department: null,
      selectedFlow: null,
    });
    setUsersList([]);
    setRegionalManagers([]);
    setPasswordError("");
    setErrors({
      email: "",
      name: "",
      surname: "",
      password: "",
      department: "",
      team: "",
      selectedEmployer: "",
      selectedFlow: "",
    });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Walidacja wszystkich pól przy submit
    const newErrors: any = {};
    Object.entries(formData).forEach(([key, value]) => {
      newErrors[key] = validateField(key, value);
    });
    if (formData.team === 4 && !formData.selectedEmployer) {
      newErrors.selectedEmployer = "Przedstawiciel musi mieć przełożonego.";
    }
    if (!isAdminRole && !formData.selectedFlow) {
      newErrors.selectedFlow = "Wybierz przepływ pracy.";
    }
    setErrors(newErrors);

    if (Object.values(newErrors).some(err => err)) {
      return;
    }

    const user = {
      email: formData.email,
      name: formData.name,
      surname: formData.surname,
      password: formData.password,
      team: formData.team!,
      isActive: true,
      user: formData.team === 4 ? formData.selectedEmployer : null,
      flows: formData.selectedFlow ? [formData.selectedFlow] : [],
    };



    try {
      const addedUser = await authAPI.addUser(user);
      onUserAdded(addedUser);
      handleModalClose();
    } catch (error: any) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;

        if (errorData.context && Array.isArray(errorData.context) && errorData.context.length > 0) {
          const errorMessages = [];
          for (const errorObject of errorData.context) {
            for (const field in errorObject) {
              if (Array.isArray(errorObject[field])) {
                for (const message of errorObject[field]) {
                  errorMessages.push(`${field}: ${message}`);
                }
              }
            }
          }

          if (errorMessages.length > 0) {
            setServerError(errorMessages.join(' '));
          } else {
            setServerError("Wystąpił błąd walidacji. Sprawdź poprawność danych.");
          }
        } else {
          const fallbackError = errorData.message || errorData.detail || "Wystąpił nieznany błąd serwera.";
          setServerError(fallbackError);
        }
      } else {
        setServerError("Błąd podczas dodawania użytkownika. Spróbuj ponownie.");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-4 rounded shadow-lg w-1/3">
        <h2 className="text-xl mb-4 font-bold">Dodaj użytkownika</h2>
        {serverError && (
          <div className="mb-4 text-red-600 font-semibold">
            {serverError}
          </div>
        )}

        {/* Ogólny komunikat o błędach */}
        {Object.values(errors).some(Boolean) && (
          <div className="mb-4 text-red-600 font-semibold">
            Popraw błędy w formularzu!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.email ? "border-red-500" : ""}`}
              required
            />
            {errors.email && <div className="text-xs text-red-500 mt-1">{errors.email}</div>}
          </div>

          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Imię
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.name ? "border-red-500" : ""}`}
              required
            />
            {errors.name && <div className="text-xs text-red-500 mt-1">{errors.name}</div>}
          </div>

          <div className="mb-4">
            <label htmlFor="surname" className="block text-gray-700 text-sm font-bold mb-2">
              Nazwisko
            </label>
            <input
              type="text"
              id="surname"
              name="surname"
              value={formData.surname}
              onChange={handleInputChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.surname ? "border-red-500" : ""}`}
              required
            />
            {errors.surname && <div className="text-xs text-red-500 mt-1">{errors.surname}</div>}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Hasło
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.password ? "border-red-500" : ""}`}
              required
            />
            {errors.password && <div className="text-xs text-red-500 mt-1">{errors.password}</div>}
            {passwordError && <div className="text-xs text-red-400 mt-1">{passwordError}</div>}
          </div>

          <div className="mb-4">
            <label htmlFor="department" className="block text-gray-700 text-sm font-bold mb-2">
              Departament
            </label>
            <select
              id="department"
              name="department"
              value={formData.department || ""}
              onChange={handleInputChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.department ? "border-red-500" : ""}`}
              required
            >
              <option value="" disabled>Wybierz departament</option>
              {Departments.map((dep) => (
                <option key={dep.id} value={dep.id}>{dep.name}</option>
              ))}
            </select>
            {errors.department && <div className="text-xs text-red-500 mt-1">{errors.department}</div>}
          </div>

          <div className="mb-4">
            <label htmlFor="team" className="block text-gray-700 text-sm font-bold mb-2">
              Zespół / Rola
            </label>
            <select
              id="team"
              name="team"
              value={formData.team || ""}
              onChange={handleInputChange}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.team ? "border-red-500" : ""}`}
              required
              disabled={!formData.department}
            >
              <option value="" disabled>Wybierz zespół</option>
              {Teams
                .filter(team => team.department_id === formData.department)
                .map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
            </select>
            {errors.team && <div className="text-xs text-red-500 mt-1">{errors.team}</div>}
          </div>

          {!isAdminRole && (
            <div className="mb-4">
              <label htmlFor="selectedFlow" className="block text-gray-700 text-sm font-bold mb-2">
                Przepływ pracy
              </label>
              <select
                id="selectedFlow"
                name="selectedFlow"
                value={formData.selectedFlow || ""}
                onChange={handleInputChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.selectedFlow ? "border-red-500" : ""}`}
                required
              >
                <option value="" disabled>Wybierz przepływ</option>
                {flows.map((flow) => (
                  <option key={flow.id} value={flow.id}>{flow.name}</option>
                ))}
              </select>
              {errors.selectedFlow && <div className="text-xs text-red-500 mt-1">{errors.selectedFlow}</div>}
            </div>
          )}

          <div className="relative mb-4">
            <label htmlFor="employer" className="block text-gray-700 text-sm font-bold mb-2">
              Przełożony <span className="text-gray-300">(Dyrektor regionalny)</span>
            </label>
            <select
              id="employer"
              name="selectedEmployer"
              value={formData.selectedEmployer || ""}
              onChange={handleInputChange}
              className={`select-style shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${formData.team !== 4 ? "bg-gray-200 text-gray-400" : ""
                } ${errors.selectedEmployer ? "border-red-500" : ""}`}
              disabled={isEmployerDisabled}
              required={formData.team === 4}
            >
              <option value="" disabled>
                Wybierz pracodawcę
              </option>
              {regionalManagers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.surname}
                </option>
              ))}
            </select>
            {errors.selectedEmployer && <div className="text-xs text-red-500 mt-1">{errors.selectedEmployer}</div>}
          </div>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Zapisz
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 ml-2 rounded focus:outline-none focus:shadow-outline"
          >
            Anuluj
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;

