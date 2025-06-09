import React, { useEffect, useState } from "react";
import AdvancedTable from "../../globalComponents/advancedTable";
import { Modal } from "../../pages/flow/list/processList/confirmModal";
import { ArrowClockwise, InfoCircle, InfoCircleFill } from "react-bootstrap-icons";
import { useFlowApi } from "../../_hooks/flowAPI";
import { useAuth } from "../../_hooks/auth";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';

const formatDate = (dateString: string | number | Date) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-CA");
};

const statusColorMap: { [key: string]: string } = {
  "nowy": "text-blue-500",
  "w trakcie uzupełniania": "text-yellow-500",
  "zatwierdzony": "text-green-500",
  "odrzucony": "text-red-500",
  "w trakcie uzupełniania przez inny dział": "text-purple-500",
};


const renderStatusesTooltip = (statuses: any[], flowId: number, currentUserDepartmentUUID?: string) => {
  const filteredStatuses = statuses.filter((status) => {
    const dept = status.department;
    const statusName = (status.flowStatus?.name || status.name || "").toLowerCase();

    // Jeśli departament użytkownika = status.departamentu => pokaż wszystko
    if (dept?.uuid === currentUserDepartmentUUID) return true;

    // W przeciwnym wypadku pokazuj tylko "zatwierdzony"
    return statusName === "zatwierdzony";
  });

  return (
    <div className="p-4 max-w-lg text-lg">
      <h2 className="text-xl font-bold mb-2">
        Status wniosku {flowId} dla departamentów:
      </h2>
      <ul className="space-y-2">
        {filteredStatuses.map((status, index) => {
          const statusName = status.flowStatus?.name || status.name || "Nieznany";
          const statusColor = statusColorMap[statusName.toLowerCase()] || "text-gray-500";

          return (
            <li key={index} className="text-lg">
              <strong className={`${statusColor}`}>
                {statusName}
              </strong>{" "}
              – {status.department?.name || "Brak departamentu"}
              {status.isEditable && " (Edycyjny)"}
            </li>
          );
        })}
      </ul>
    </div>
  );
};







const ActiveApplicationList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [applications, setApplications] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFlowId, setCurrentFlowId] = useState<number | null>(null);
  const { flowAPI } = useFlowApi();
  const { authData } = useAuth();
  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    message: "",
  });

  const isAdminOrSuperAdmin = authData?.roles?.some((role: string) =>
    ["ROLE_SUPERADMIN", "ROLE_ADMINISTRATOR"].includes(role)
  );

  // Określenie uprawnień
  const canDelete =
    authData?.roles?.includes("ROLE_SUPERADMIN") ||
    authData?.department?.name === "Przedstawiciel medyczny";

  // Pobieranie danych aplikacji
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await flowAPI.getApplications();
        setApplications(
          response
            .map((item: any) => ({
              id: item.id,
              name: `${item.user.name} ${item.user.surname}`,
              flowStatus:
                item.clientFlowStatuses?.[0]?.flowStatus?.name,
              department:
                item.clientFlowStatuses?.[0]?.department?.name,
              createdAt: formatDate(item.createdAt),
              approverName: item.user?.user
                ? `${item.user.user.name} ${item.user.user.surname}`
                : "Brak danych",

              nip: item.rpwdlNip || item.gusNIP,
              clientName: item.rpwdlName || item.gusName,
              clientFlowStatuses: item.clientFlowStatuses, // zapisujemy wszystkie statusy
            }))
            .sort((a: { createdAt: any; id: number }, b: { createdAt: string; id: number }) => {
              if (a.createdAt === b.createdAt) {
                return b.id - a.id;
              }
              return b.createdAt.localeCompare(a.createdAt);
            })
        );
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };

    fetchApplications();
  }, []);

  // Odświeżanie aplikacji
  const refreshApps = async () => {
    try {
      const response = await flowAPI.getApplications(false, true);
      setApplications(
        response.map((item: any) => ({
          id: item.id,
          name: `${item.user.name} ${item.user.surname}`,
          flowStatus: item.flowStatus.name,
          department:
            item.clientFlowStatuses?.[0]?.department?.name ||
            "Brak departamentu",
          createdAt: formatDate(item.createdAt),
          approverName: item.user?.user
            ? `${item.user.user.name} ${item.user.user.surname}`
            : "Brak danych",

          nip: item.rpwdlNip || item.gusNIP,
          clientName: item.rpwdlName || item.gusName,
          clientFlowStatuses: item.clientFlowStatuses,
        }))
      );

      setInfoModal({
        isOpen: true,
        message: "Aktualizacja listy wniosków",
      });

      setTimeout(() => {
        setInfoModal({ isOpen: false, message: "" });
      }, 3000);
    } catch (error) {
      console.error("Error refreshing applications:", error);
    }
  };

  // Obsługa akcji dla wierszy tabeli (kontynuuj, anuluj)
  const handleRowAction = (action: string, rowData: any) => {
    if (action === "continue") {
      window.location.href = `/flow/continue/${rowData.id}`;
    } else if (action === "cancel") {
      setCurrentFlowId(rowData.id);
      setIsModalOpen(true);
    }
  };

  const handleCancel = async () => {
    if (currentFlowId !== null) {
      try {
        await flowAPI.deleteApplication(currentFlowId);
        setApplications((prev) =>
          prev.filter((app) => app.id !== currentFlowId)
        );
        setIsModalOpen(false);
        setCurrentFlowId(null);
      } catch (error) {
        console.error("Error canceling application:", error);
        setIsModalOpen(false);
      }
    }
  };

  // Definicja kolumn tabeli
  const columns = [
    { label: "Imię i nazwisko", field: "name" },
    { label: "Status wniosku", field: "flowStatus" },
    { label: "Departament", field: "department" },
    { label: "Data utworzenia", field: "createdAt" },
    { label: "ID wniosku", field: "id" },
    { label: "NIP", field: "nip" },
    { label: "Nazwa klienta", field: "clientName" },
    // { label: "Osoba zatwierdzająca", field: "approverName" },

    {
      label: "Akcje",
      field: "actions",
      render: (rowData: any) => (
        <div className="flex space-x-2">
          <Tippy content={isAdminOrSuperAdmin ? "Administrator nie może kontynuować wniosku" : "Kontynuuj wniosek"} delay={[0, 0]} arrow={true} theme="light">
            <span style={{ display: "inline-block" }}>
              <button
                type="button"
                onClick={() => handleRowAction("continue", rowData)}
                className={
                  "message-btn inline-block rounded-full border border-primary bg-primary text-white p-1.5 uppercase leading-normal shadow transition duration-150 ease-in-out hover:shadow-lg" +
                  (isAdminOrSuperAdmin ? " opacity-50 cursor-not-allowed" : "")
                }
                disabled={isAdminOrSuperAdmin}
                tabIndex={isAdminOrSuperAdmin ? -1 : 0}
                aria-disabled={isAdminOrSuperAdmin}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </span>
          </Tippy>

          {/* Tooltip z listą statusów */}
          <Tippy
            content={renderStatusesTooltip(rowData.clientFlowStatuses, rowData.id, authData?.department?.uuid)}

            interactive={true}
            delay={[0, 0]}
            arrow={true}
            theme="light"
          >
            <button
              type="button"
              className="message-btn inline-block rounded-full border border-primary bg-primary text-white p-1.5 uppercase leading-normal shadow transition duration-150 ease-in-out hover:shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="8"></line>
              </svg>
            </button>
          </Tippy>




          {canDelete && (
            <Tippy content="Anuluj wniosek" delay={[0, 0]} arrow={true} theme="light">
              <button
                type="button"
                onClick={() => handleRowAction("cancel", rowData)}
                className="message-btn inline-block rounded-full border border-primary bg-primary text-white p-1.5 uppercase leading-normal shadow transition duration-150 ease-in-out hover:shadow-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </Tippy>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <nav className="relative flex w-full flex-wrap items-center justify-between font-bold uppercase bg-neutral-100 py-2 text-neutral-500 shadow-lg lg:py-4">
        <div className="flex w-full flex-wrap items-center justify-between px-5">
          <div className="basis-1/4">Lista aktywnych wniosków</div>
          <div className="basis-1/9">
            <Tippy content="Odśwież listę wniosków" delay={[0, 0]} arrow={true} theme="light">
              <button
                onClick={refreshApps}
                className="transition duration-150 uppercase ease-in-out hover:bg-primary-700 hover:shadow-lg focus:bg-primary-700 bg-primary rounded shadow text-md p-2 flex items-center space-x-2 cursor-pointer justify-center text-white"
              >
                <ArrowClockwise />
                <span>Odśwież listę</span>
              </button>
            </Tippy>
          </div>
        </div>
      </nav>

      <AdvancedTable
        columns={columns}
        data={applications.filter((app) =>
          Object.values(app).some((value) =>
            typeof value === "string" || typeof value === "number"
              ? value.toString().toLowerCase().includes(searchTerm.toLowerCase())
              : false
          )
        )}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleCancel}
        backdrop="static"
      />

      {infoModal.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded shadow-lg text-center w-full max-w-3xl">
            <p className="text-lg font-bold">{infoModal.message}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ActiveApplicationList;
