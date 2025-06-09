import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EnrichedItem } from "../../pages/flow/list/processList/flow_type";
import { AuthAPI } from "../../_services/api/authAPI/index";
import { useFlowApi } from "../../_hooks/flowAPI";

const FlowListWidget = () => {
  const [items, setItems] = useState<EnrichedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageLoaded, setPageLoaded] = useState(false);
  const { flowAPI } = useFlowApi();
  const authAPI = new AuthAPI();

  useEffect(() => {
    const handleLoad = () => {
      setPageLoaded(true);
    };

    if (document.readyState === "complete") {
      setPageLoaded(true);
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => {
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  const filterApplications = (applications: EnrichedItem[]): EnrichedItem[] => {

    // Sortowanie według daty utworzenia (od najstarszych do najnowszych)
    const sortedApplications = applications.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );


    // Ograniczenie do 6 najstarszych wniosków
    return sortedApplications.slice(0, 9);
  };

  useEffect(() => {
    if (!pageLoaded) return;

    const fetchData = async () => {
      try {
        const userResponse = await authAPI.getUserProfile();
        const applicationsResponse = await flowAPI.getApplications();

        // Pobieranie statusów z API
        const flowStatuses = await flowAPI.getFlowStatuses();
        const statusMap = flowStatuses.reduce((acc: any, status: any) => {
          acc[status.id] = status.name;
          return acc;
        }, {});

        if (Array.isArray(applicationsResponse)) {
          const enrichedApplications = applicationsResponse.map((app: EnrichedItem) => {
            const statusId = app.clientFlowStatuses?.[0]?.flowStatus?.id || null;
            const statusName = statusId ? statusMap[statusId] : "Brak statusu";

            return {
              ...app,
              flowStatus: statusName,
            };
          });


          // Filtrowanie i ograniczenie do 6 najstarszych wniosków
          const filteredItems = filterApplications(enrichedApplications);
          setItems(filteredItems);
        } else {
          throw new Error("Nieprawidłowa odpowiedź z API dla wniosków");
        }
      } catch (error) {
        console.error("Błąd podczas pobierania danych:", error);
        setError("Wystąpił błąd podczas pobierania danych. Proszę spróbować ponownie później.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pageLoaded]);


  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center space-x-2 h-24">
          <svg
            className="animate-spin h-5 w-5 text-primary-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-lg font-semibold text-primary-500">
            Ładowanie danych...
          </p>
        </div>
      );
    }

    if (error) {
      return <p className="text-red-500">{error}</p>;
    }

    if (items.length === 0) {
      return <p>Brak aktywnych wniosków do wyświetlenia.</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <div key={index} className="p-4 border rounded shadow-lg bg-white">
            <div className="text-md text-gray-600 mb-2">
              Nazwa użytkownika:{" "}
              <span className="font-bold">
                {item.user
                  ? `${item.user.name} ${item.user.surname}`
                  : "Brak danych"}
              </span>
            </div>
            <div className="text-md text-gray-600 mb-2">
              Status:{" "}
              <span className="text-blue-400 uppercase font-bold">
                {item.flowStatus || "Brak statusu"}
              </span>
            </div>
            <div className="text-md text-gray-600 mb-2">
              Nazwa klienta:{" "}
              <span className="font-bold">
                {item.rpwdlName || item.gusName || "Brak nazwy klienta"}
              </span>
            </div>
            <div className="text-md text-gray-600 mb-2">
              NIP:{" "}
              <span className="font-bold">
                {item.rpwdlNip || item.gusNIP || "Brak NIP"}
              </span>
            </div>
            <div className="text-md text-gray-600 mb-2">
              Data rozpoczęcia:{" "}
              <span className="font-bold">
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString()
                  : "Brak daty"}
              </span>
            </div>
            <div className="text-md text-gray-600">
              ID wniosku: <span className="font-bold">{item.id}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-5 rounded">
      <h2 className="text-lg font-bold uppercase text-black mb-4">
        Aktywne wnioski
      </h2>
      {renderContent()}
      {!loading && !error && items.length > 0 && (
        <div className="flex justify-center items-center mt-4">
          <Link to="/pages/activeApplicationList" className="w-1/3">
            <button className="group relative w-full overflow-hidden rounded-lg bg-white px-6 py-3 shadow-md transition-all duration-300 ease-out hover:shadow-lg">
              <span className="relative z-10 flex items-center justify-center text-lg font-semibold text-primary-700 transition-colors duration-300 group-hover:text-white">
                <span>Wyświetl listę wszystkich wniosków</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary-500 to-primary-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" />
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default FlowListWidget;
