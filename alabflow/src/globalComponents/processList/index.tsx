import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus } from "react-bootstrap-icons";
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
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInputValue(event.target.value.toLowerCase());
  };

  const filteredItems = flows.filter((flow) =>
    flow.name.toLowerCase().includes(searchInputValue)
  );

  return (
    <div>
      {/* Górny pasek pozostaje bez zmian */}
      <nav className="relative flex w-full flex-wrap items-center justify-between font-bold uppercase bg-neutral-100 py-2 text-neutral-500 shadow-lg focus:text-neutral-700 dark:bg-neutral-300 lg:py-4">
        <div className="flex w-full flex-wrap items-center justify-between px-5">
          <div>Lista Procesów</div>
          <input
            type="text"
            value={searchInputValue}
            onChange={handleSearchInputChange}
            placeholder="Wyszukaj proces..."
            className="p-3 border border-gray-300 rounded-lg shadow-md w-full max-w-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          />
        </div>
      </nav>

      {/* Kafelki */}
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-blue-500"
            >
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.name}</h3>
                <div className="flex space-x-4">
                  <Link
                    to="/pages/activeApplicationList"
                    className="flex-1 text-center px-6 py-3 bg-blue-600 text-white rounded-md text-lg hover:bg-blue-700 transition-colors duration-300"
                  >
                    Lista wniosków
                  </Link>
                  <Link
                    to="/flow/create"
                    className="flex-1 text-center px-6 py-3 bg-green-600 text-white rounded-md text-lg hover:bg-green-700 transition-colors duration-300"
                  >
                    Nowy Wniosek
                  </Link>

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProcessList;
