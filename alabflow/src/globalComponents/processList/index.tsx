import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ListTask, PlusCircleFill } from "react-bootstrap-icons";
import { useFlowApi } from "../../_hooks/flowAPI";

interface Flow {
  id: number;
  name: string;
}

const ProcessList = () => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const { flowAPI } = useFlowApi();
  const [searchInputValue, setSearchInputValue] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await flowAPI.getFlows();
        setFlows(response);
      } catch (error) {
        console.error("Błąd podczas pobierania danych:", error);
      }
    };

    fetchData();
  }, [flowAPI]);

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInputValue(event.target.value.toLowerCase());
  };

  const filteredItems = flows.filter((flow) =>
    flow.name.toLowerCase().includes(searchInputValue)
  );

  return (
    <div>
      <nav className="relative flex w-full flex-wrap items-center justify-between font-bold uppercase bg-neutral-100 py-2 text-neutral-500 shadow-lg focus:text-neutral-700 dark:bg-neutral-300 lg:py-4">
        <div className="flex w-full flex-wrap items-center justify-between px-5 mt-8">
          <div>Lista Procesów</div>
          <input
            type="text"
            value={searchInputValue}
            onChange={handleSearchInputChange}
            placeholder="Wyszukaj proces..."
            className="p-2 border border-gray-300 rounded-md shadow-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-normal normal-case"
          />
        </div>
      </nav>

      {/* Główna sekcja z kartami procesów */}
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
            >
              {/* Sekcja z tytułem i opisem */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{item.name}</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Zarządzaj wnioskami i twórz nowe dla tego procesu.
                </p>
              </div>

              {/* Sekcja z przyciskami akcji */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <Link
                  to="/pages/activeApplicationList"
                  className="text-blue-600 font-semibold hover:text-blue-800 transition-colors duration-200 flex items-center text-sm"
                >
                  <ListTask className="mr-2" />
                  Lista wniosków
                </Link>
                <Link
                  to="/flow/create"
                  className="px-5 py-2 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-transform duration-200 hover:scale-105 flex items-center text-sm"
                >
                  <PlusCircleFill className="mr-2" />
                  Nowy Wniosek
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProcessList;