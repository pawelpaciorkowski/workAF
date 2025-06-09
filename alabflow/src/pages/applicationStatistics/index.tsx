import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useFlowApi } from "../../_hooks/flowAPI";

ChartJS.register(ArcElement, Tooltip, Legend);

const ApplicationStatistics: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { flowAPI } = useFlowApi();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const applications = await flowAPI.getAllApplications();

        if (!applications || !Array.isArray(applications)) {
          throw new Error("API zwróciło nieprawidłowy format danych");
        }

        const data = processStatisticsData(applications);
        setChartData(data);
      } catch (err) {
        console.error("Błąd pobierania danych:", err);
        setError("Nie udało się załadować danych");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const processStatisticsData = (applications: any[]) => {
    const statusCounts: Record<string, number> = {};

    applications.forEach((app) => {
      // Pobieramy nazwę statusu z zagnieżdżonego obiektu flowStatus
      const status = app.clientFlowStatuses[0].flowStatus.name;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          label: "Liczba wniosków",
          data: Object.values(statusCounts),
          backgroundColor: [
            "#4CAF50",
            "#2196F3",
            "#FF9800",
            "#F44336",
            "#9C27B0",
          ],
        },
      ],
    };
  };

  if (isLoading) {
    return <div className="flex items-center justify-center space-x-2 h-24">
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
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  // Oblicz łączną liczbę wniosków
  const totalApplications = chartData
    ? chartData.datasets[0].data.reduce(
      (sum: number, current: number) => sum + current,
      0
    )
    : 0;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-2">
        Statystyki Wniosków
      </h2>
      <p className="text-center mb-6 text-gray-600">
        Kliknij na status w legendzie, aby ukryć lub wyświetlić dany segment wykresu.
      </p>
      {chartData ? (
        <div className="bg-white p-6 rounded-lg shadow-md flex justify-center">
          <div style={{ width: "500px", height: "500px" }}>
            <Pie
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                    labels: {
                      font: {
                        size: 18,
                      },
                    },
                  },
                  tooltip: {
                    backgroundColor: "#fff",
                    titleColor: "#000",
                    bodyColor: "#000",
                    bodyFont: {
                      size: 16,
                    },
                    titleFont: {
                      size: 18,
                      weight: "bold",
                    },
                    borderWidth: 1,
                    borderColor: "#ccc",
                    padding: 10,
                  },
                },
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>
      ) : (
        <p className="text-center">Brak danych do wyświetlenia</p>
      )}
      <p className="text-center mt-4 font-semibold">
        Łączna liczba wniosków: {totalApplications}
      </p>
    </div>
  );
};

export default ApplicationStatistics;
