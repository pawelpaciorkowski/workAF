import React, { useEffect, useState } from "react";
import AdvancedTable from "../../globalComponents/advancedTable";
import { Modal } from "../../pages/flow/list/processList/confirmModal";
import { ArrowClockwise } from "react-bootstrap-icons";
import { useFlowApi } from "../../_hooks/flowAPI";
import { useAuth } from "../../_hooks/auth";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';

// ### ZAKTUALIZOWANA MAPA RÓL I DEPARTAMENTÓW ###
const ROLE_TO_DEPARTMENT_MAP: { [key: string]: string } = {
  'ROLE_SALES_REPRESENTATIVE': 'Sprzedaż',
  'ROLE_SETTLEMENT': 'Rozliczenia',
  'ROLE_MEDICAL': 'Medyczny',
  'ROLE_HL7': 'HL7',
  'ROLE_LOGISTICS': 'Logistyka',
  'ROLE_SUPPLY': 'Zaopatrzenie',
  'ROLE_IT': 'IT',
  'ROLE_COMPETITION': 'Konkursy',
  'ROLE_ACCOUNTING': 'Księgowość',
};


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
  "rozliczeniowy": "text-indigo-500",
};

const renderStatusesTooltip = (statuses: any[], flowId: number) => {
  return (
    <div className="p-4 max-w-lg text-lg">
      <h2 className="text-xl font-bold mb-2">
        Status wniosku {flowId} dla departamentów:
      </h2>
      <ul className="space-y-2">
        {statuses.map((status, index) => {
          const statusName = status.flowStatus?.name || status.name || "Nieznany";
          const statusColor = statusColorMap[statusName.toLowerCase()] || "text-gray-500";

          return (
            <li key={index} className="text-lg">
              <strong className={`${statusColor}`}>
                {statusName}
              </strong>{" "}
              – {status.department?.name || "Brak departamentu"}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const determineDisplayStatus = (statuses: any[], userDepartmentId: number | null) => {
  if (!statuses || statuses.length === 0) {
    return { flowStatus: "Brak statusu", department: "Brak danych" };
  }
  const firstActiveStatus = statuses.find((s) => s.flowStatus?.isEditable);
  if (firstActiveStatus) {
    return {
      flowStatus: firstActiveStatus.flowStatus.name,
      department: firstActiveStatus.department.name,
    };
  }
  const lastStatus = statuses[statuses.length - 1];
  return {
    flowStatus: lastStatus.flowStatus.name,
    department: lastStatus.department.name,
  };
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

  const userDepartmentId = authData?.team?.department?.id ?? null;

  const canDelete =
    authData?.roles?.includes("ROLE_SUPERADMIN") ||
    authData?.department?.name === "Przedstawiciel medyczny";

  const canUserContinueFlow = (statuses: any[]): boolean => {
    if (!statuses || statuses.length === 0 || !authData?.roles) {
      return false;
    }

    const userDepartments = authData.roles.map((role: string | number) => ROLE_TO_DEPARTMENT_MAP[role]).filter(Boolean);

    if (userDepartments.length === 0) {
      return false;
    }

    const canContinue = statuses.some(status =>
      status.flowStatus?.isEditable && userDepartments.includes(status.department?.name)
    );

    return canContinue;
  };

  const mapApplications = (response: any[]) => {
    return response
      .map((item: any) => {
        const displayStatus = determineDisplayStatus(item.clientFlowStatuses, userDepartmentId);
        const canContinue = canUserContinueFlow(item.clientFlowStatuses);

        return {
          id: item.id,
          name: `${item.user.name} ${item.user.surname}`,
          flowStatus: displayStatus.flowStatus,
          department: displayStatus.department,
          createdAt: formatDate(item.createdAt),
          approverName: item.user?.user
            ? `${item.user.user.name} ${item.user.user.surname}`
            : "Brak danych",
          nip: item.rpwdlNip || item.gusNIP,
          clientName: item.rpwdlName || item.gusName,
          clientFlowStatuses: item.clientFlowStatuses,
          canContinue: canContinue,
        };
      })
      .sort((a: { createdAt: any; id: number }, b: { createdAt: string; id: number }) => {
        if (a.createdAt === b.createdAt) {
          return b.id - a.id;
        }
        return b.createdAt.localeCompare(a.createdAt);
      });
  };

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await flowAPI.getApplications();
        setApplications(mapApplications(response));
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };

    if (authData) {
      fetchApplications();
    }
  }, []);

  const refreshApps = async () => {
    try {
      const response = await flowAPI.getApplications(false, true);
      setApplications(mapApplications(response));

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

  const columns = [
    { label: "Imię i nazwisko", field: "name" },
    { label: "Status wniosku", field: "flowStatus" },
    { label: "Departament", field: "department" },
    { label: "Data utworzenia", field: "createdAt" },
    { label: "ID wniosku", field: "id" },
    { label: "NIP", field: "nip" },
    { label: "Nazwa klienta", field: "clientName" },
    {
      label: "Akcje",
      field: "actions",
      render: (rowData: any) => {
        const shouldBeDisabled = isAdminOrSuperAdmin || !rowData.canContinue;
        const tooltipContent = isAdminOrSuperAdmin
          ? "Administrator nie może kontynuować wniosku"
          : !rowData.canContinue
            ? "Wniosek oczekuje na akcję w innym dziale lub nie masz uprawnień"
            : "Kontynuuj wniosek";

        return (
          <div className="flex space-x-2">
            <Tippy content={tooltipContent} delay={[0, 0]} arrow={true} theme="light">
              <span style={{ display: "inline-block" }}>
                <button
                  type="button"
                  onClick={() => handleRowAction("continue", rowData)}
                  className={
                    "message-btn inline-block rounded-full border border-primary bg-primary text-white p-1.5 uppercase leading-normal shadow transition duration-150 ease-in-out hover:shadow-lg" +
                    (shouldBeDisabled ? " opacity-50 cursor-not-allowed" : "")
                  }
                  disabled={shouldBeDisabled}
                  tabIndex={shouldBeDisabled ? -1 : 0}
                  aria-disabled={shouldBeDisabled}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <line x1="5" y1="12" x2="19" y2="12"></line> <polyline points="12 5 19 12 12 19"></polyline> </svg>
                </button>
              </span>
            </Tippy>

            <Tippy content={renderStatusesTooltip(rowData.clientFlowStatuses, rowData.id)} interactive={true} delay={[0, 0]} arrow={true} theme="light" >
              <button type="button" className="message-btn inline-block rounded-full border border-primary bg-primary text-white p-1.5 uppercase leading-normal shadow transition duration-150 ease-in-out hover:shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <circle cx="12" cy="12" r="10"></circle> <line x1="12" y1="16" x2="12" y2="12"></line> <line x1="12" y1="8" x2="12" y2="8"></line> </svg>
              </button>
            </Tippy>

            {canDelete && (
              <Tippy content="Anuluj wniosek" delay={[0, 0]} arrow={true} theme="light">
                <button type="button" onClick={() => handleRowAction("cancel", rowData)} className="message-btn inline-block rounded-full border border-primary bg-primary text-white p-1.5 uppercase leading-normal shadow transition duration-150 ease-in-out hover:shadow-lg" >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <polyline points="3 6 5 6 21 6"></polyline> <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path> <line x1="10" y1="11" x2="10" y2="17"></line> <line x1="14" y1="11" x2="14" y2="17"></line> </svg>
                </button>
              </Tippy>
            )}
          </div>
        )
      },
    },
  ];

  return (
    <>
      <nav className="relative flex w-full flex-wrap items-center justify-between font-bold uppercase bg-neutral-100 py-2 text-neutral-500 shadow-lg lg:py-4">
        <div className="flex w-full flex-wrap items-center justify-between px-5 mt-10">
          <div className="basis-1/4">Lista aktywnych wniosków</div>
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