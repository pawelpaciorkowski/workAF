import React, { useState, useEffect } from "react";
import { User, Teams, Departments } from "../addUser/types";
import { AuthAPI } from "../../../_services/api/authAPI";
import { useFlowApi } from "../../../_hooks/flowAPI";
import GlobalModal from "../../../globalComponents/globalModal";

interface Flow {
  id: number;
  name: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit: User | null;
  onUserUpdated: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  userToEdit,
  onUserUpdated,
}) => {
  // --- Stan formData na wzór AddUserModal
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    surname: "",
    isActive: true,
    team: null as number | null,
    selectedEmployer: null as number | null,
    selectedFlow: null as number | null,
    isProcessAdministrator: false,
    department: null as number | null,
  });

  const [flows, setFlows] = useState<Flow[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [regionalManagers, setRegionalManagers] = useState<User[]>([]);
  const [isEmployerDisabled, setIsEmployerDisabled] = useState(true);

  const { flowAPI } = useFlowApi();
  const authAPI = new AuthAPI();

  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorModalContent, setErrorModalContent] = useState<React.ReactNode>("");


  // --- Załaduj dane usera do formularza przy otwarciu modala
  useEffect(() => {
    if (userToEdit) {
      setFormData({
        email: userToEdit.email || "",
        name: userToEdit.name || "",
        surname: userToEdit.surname || "",
        isActive: userToEdit.isActive ?? true,
        team: userToEdit.team?.id ?? null,
        selectedEmployer: userToEdit.user ?? null,
        selectedFlow: userToEdit.flows?.[0]?.id ?? null,
        isProcessAdministrator: userToEdit.isProcessAdministrator || false,
        department: userToEdit.team?.department?.id ?? null,
      });
    }
  }, [userToEdit]);

  // --- Ładuj flows i users na start modala
  useEffect(() => {
    if (isOpen) {
      const fetchFlows = async () => {
        try {
          const flowsData = await flowAPI.getFlows();
          setFlows(flowsData);
        } catch (error) {
          console.error("Błąd podczas ładowania przepływów pracy:", error);
        }
      };
      fetchFlows();

      const fetchUsers = async () => {
        try {
          const users = await authAPI.getUsersData();
          setUsersList(users);
          const managers = users.filter(
            (user: { team: { id: number } }) => user.team.id === 5
          );
          setRegionalManagers(managers);
        } catch (error) {
          console.error("Błąd podczas ładowania użytkowników:", error);
        }
      };
      fetchUsers();
    }
  }, [isOpen]);

  // --- Blokowanie employer przy innych niż handlowiec (team: 4)
  useEffect(() => {
    setIsEmployerDisabled(formData.team !== 4);
  }, [formData.team]);

  // --- Obsługa inputów
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      // tutaj musisz jasno powiedzieć TS-owi, że target ma 'checked'
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    if (name === "department") {
      setFormData((prev) => ({
        ...prev,
        department: value ? parseInt(value, 10) : null,
        team: null,
        selectedEmployer: null,
        selectedFlow: null,
      }));
      return;
    }


    // Zmiana team resetuje employer/flow
    if (name === "team") {
      const teamId = value ? parseInt(value, 10) : null;
      setFormData((prev) => ({
        ...prev,
        team: teamId,
        selectedEmployer: teamId === 4 ? prev.selectedEmployer : null,
        selectedFlow: null,
      }));
      return;
    }

    if (name === "selectedFlow") {
      setFormData((prev) => ({
        ...prev,
        selectedFlow: value ? parseInt(value, 10) : null,
      }));
      return;
    }

    if (name === "selectedEmployer") {
      setFormData((prev) => ({
        ...prev,
        selectedEmployer: value ? parseInt(value, 10) : null,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --- Zamykanie
  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;

    const payload = {
      email: formData.email,
      name: formData.name,
      surname: formData.surname,
      isActive: formData.isActive,
      team: formData.team,
      user: formData.team === 4 ? formData.selectedEmployer : null,
      isProcessAdministrator: formData.isProcessAdministrator,
      flows: formData.selectedFlow ? [formData.selectedFlow] : [],
    };

    try {
      await authAPI.patchUser(userToEdit.id, payload);
      onUserUpdated();
      handleClose();
    } catch (error) {
      setErrorModalContent("Błąd podczas aktualizacji użytkownika. Sprawdź wprowadzone dane.");
      setErrorModalOpen(true);
      console.error("Błąd przy aktualizacji użytkownika: ", error);
    }
  };


  if (!isOpen || !userToEdit) return null;

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-70 z-50">
        <div className="bg-white p-4 rounded shadow-lg w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3">
          <h2 className="text-xl mb-4 font-bold">Edytuj użytkownika</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Identyfikator
              </label>
              <input
                type="text"
                value={userToEdit.id}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Imię
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Nazwisko
              </label>
              <input
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Departament
              </label>
              <select
                name="department"
                value={formData.department || ""}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="" disabled>Wybierz departament</option>
                {Departments.map((dep) => (
                  <option key={dep.id} value={dep.id}>{dep.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Rola
              </label>
              <select
                name="team"
                value={formData.team || ""}
                onChange={handleInputChange}
                className="select-style shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="" disabled>Wybierz rolę</option>
                {Teams
                  .filter(team => team.department_id === formData.department)
                  .map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}

              </select>
            </div>

            {/* Przepływ pracy */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Przepływ pracy
              </label>
              <select
                name="selectedFlow"
                value={formData.selectedFlow || ""}
                onChange={handleInputChange}
                className={`select-style shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${[1, 2].includes(formData.team || 0) ? "bg-gray-200 text-gray-400" : ""
                  }`}
                disabled={[1, 2].includes(formData.team || 0) || formData.team === null}
                required={formData.team === 5}
              >
                <option value="" disabled>
                  Wybierz przepływ
                </option>
                {flows.map((flow) => (
                  <option key={flow.id} value={flow.id}>
                    {flow.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Przełożony */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Przełożony
              </label>
              <select
                name="selectedEmployer"
                value={formData.selectedEmployer || ""}
                onChange={handleInputChange}
                className={`select-style shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${formData.team !== 4 ? "bg-gray-200 text-gray-400" : ""
                  }`}
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
            </div>
            {/* Admin procesów */}
            {/* <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="isProcessAdministrator"
                name="isProcessAdministrator"
                checked={formData.isProcessAdministrator}
                onChange={handleInputChange}
                className="mr-2 leading-tight"
              />
              <label
                htmlFor="isProcessAdministrator"
                className="text-gray-700 text-sm font-bold"
              >
                Administrator procesów
              </label>
            </div> */}
            {/* Przyciski */}
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Zapisz
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 ml-2 rounded focus:outline-none focus:shadow-outline"
            >
              Anuluj
            </button>
          </form>
        </div>
      </div>
      <GlobalModal
        title="Błąd"
        content={errorModalContent}
        onConfirm={() => setErrorModalOpen(false)}
        isOpen={errorModalOpen}
        buttonType="ok"
        confirmText="OK"
      />
    </>
  );
};


export default EditUserModal;
