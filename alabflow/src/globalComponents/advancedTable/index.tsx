import React, { useState, useMemo } from "react";

interface Column {
  label: string;
  field: string;
  render?: (rowData: any, rowIndex: number) => JSX.Element;
}

interface AdvancedTableProps {
  columns: Column[];
  data: any[];
  onRowAction?: (action: string, rowData: any) => void;
}

const AdvancedTable: React.FC<AdvancedTableProps> = ({
  columns,
  data,
  onRowAction,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    field: string;
    direction: "asc" | "desc";
  } | null>(null);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((row) =>
      columns.some((column) => {
        const value = column.field
          .split(".")
          .reduce((acc, key) => acc[key], row);
        return value
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      })
    );
  }, [searchTerm, data, columns]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    const { field, direction } = sortConfig;

    return [...filteredData].sort((a, b) => {
      const aValue = field.split(".").reduce((acc, key) => acc[key], a);
      const bValue = field.split(".").reduce((acc, key) => acc[key], b);

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [sortConfig, filteredData]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  const handleSort = (field: string) => {
    setSortConfig((prev) => {
      if (!prev || prev.field !== field) {
        return { field, direction: "asc" };
      }
      return {
        field,
        direction: prev.direction === "asc" ? "desc" : "asc",
      };
    });
  };

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  return (
    <div>
      {/* Search Input */}
      <div className="flex justify-center mb-4">
        <input
          type="text"
          placeholder="Szukaj..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 w-5/6 mr-3 ml-3 mt-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 hover:border-gray-300 justify-center items-center"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse w-full text-left">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.field}
                  className="border px-4 py-2 cursor-pointer"
                  onClick={() => handleSort(column.field)}
                >
                  {column.label}
                  {sortConfig?.field === column.field && (
                    <span className="ml-2">
                      {sortConfig.direction === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="border px-4 py-2">
                    {column.render
                      ? column.render(row, rowIndex)
                      : column.field
                        .split(".")
                        .reduce((acc, key) => acc[key], row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 ml-2">
        <div>
          <span>Wierszy na stronę: </span>
          <select
            value={rowsPerPage}
            onChange={(e) =>
              setRowsPerPage(
                e.target.value === "all" ? data.length : Number(e.target.value)
              )
            }
            className="p-1 border border-gray-300 rounded"
          >
            {[10, 20, 50, 200].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}

          </select>
        </div>

        <div className="flex items-center space-x-2 mr-2">
          {/* Przycisk przejścia do pierwszej strony */}
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {/* Ikona << */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7M19 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Przycisk przejścia do poprzedniej strony */}
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <span>
            Strona {currentPage} z {totalPages}
          </span>

          {/* Przycisk przejścia do następnej strony */}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="p-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Przycisk przejścia do ostatniej strony */}
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {/* Ikona >> */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdvancedTable;
