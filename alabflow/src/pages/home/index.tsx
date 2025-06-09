import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PersonFill,
  QuestionCircleFill,
  FileEarmarkTextFill,
  IconProps,
  FileEarmarkBarGraphFill,
  FileEarmarkPlusFill
} from "react-bootstrap-icons";
import FlowListWidget from "../../globalComponents/flowListWidget";
import { useAuth } from "../../_hooks/auth";
import ApplicationStatistics from "../applicationStatistics";
import { AuthAPI } from "../../_services/api/authAPI";

const DEPARTMENT_MEDICAL_REP = "sprzedaż";

interface WaveEffectTileProps {
  to: string;
  bgColor: string;
  hoverBgColor: string;
  waveColor: string;
  icon: React.ComponentType<IconProps>;
  text: string;
  onClick?: () => void;
}

const WaveEffectTile: React.FC<WaveEffectTileProps> = ({
  to,
  bgColor,
  hoverBgColor,
  waveColor,
  icon: Icon,
  text,
  onClick,
}) => (
  <Link to={to} onClick={onClick ? (e) => { e.preventDefault(); onClick(); } : undefined}>
    <div
      className={`group relative overflow-hidden rounded-lg ${bgColor} ${hoverBgColor} p-6 flex flex-col items-center cursor-pointer transition-all duration-300 ease-out shadow-md hover:shadow-lg`}
    >
      <span className="relative z-10 flex flex-col items-center justify-center transition-colors duration-300 group-hover:text-white">
        <Icon className="text-3xl mb-4" />
        <span className="font-bold">{text}</span>
      </span>
      <span
        className={`absolute top-0 left-0 w-full h-full ${waveColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out`}
      />
      <span className="absolute top-0 left-0 w-full h-full">
        <span className="absolute top-0 left-[-100%] w-full h-full bg-white opacity-30 transform rotate-45 transition-all duration-1000 ease-out group-hover:left-[100%]" />
        <span className="absolute top-0 left-[-100%] w-full h-full bg-white opacity-30 transform rotate-45 transition-all duration-1000 ease-out delay-150 group-hover:left-[100%]" />
        <span className="absolute top-0 left-[-100%] w-full h-full bg-white opacity-30 transform rotate-45 transition-all duration-1000 ease-out delay-300 group-hover:left-[100%]" />
      </span>
    </div>
  </Link>
);


const Home: React.FC = () => {
  const { authData } = useAuth();
  const [userDepartment, setUserDepartment] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ZAWSZE użyj hooków na górze!
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const api = new AuthAPI();
        const userProfileData = await api.getUserProfile();
        setUserDepartment(userProfileData?.team?.department?.name.toLowerCase() || "");
      } catch (error) {
        console.error("Błąd pobierania profilu użytkownika:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const isOnlyAdministrator = () =>
    authData?.roles?.length === 1 && authData?.roles?.includes("ROLE_ADMIN");

  useEffect(() => {
    if (isOnlyAdministrator()) {
      navigate("/pages/addUser", { replace: true });
    }
  }, [authData, navigate])



  const isMedicalRepresentative = () => userDepartment === DEPARTMENT_MEDICAL_REP;
  const isAdminOrSuperAdmin = () => authData?.roles?.some((role: string) =>
    ["ROLE_SUPERADMIN", "ROLE_ADMINISTRATOR"].includes(role)
  );



  const tiles = useMemo(() => {
    if (loading) return [];
    let tileList = [];
    if (isOnlyAdministrator()) {
      return [
        <WaveEffectTile
          key="users"
          to="/pages/addUser"
          bgColor="bg-indigo-200"
          hoverBgColor="hover:bg-indigo-300"
          waveColor="bg-gradient-to-r from-indigo-400 to-indigo-600"
          icon={PersonFill}
          text="Użytkownicy"
        />
      ];
    }

    if (isMedicalRepresentative()) {
      tileList.push(
        <WaveEffectTile key="processes" to="/pages/processList" bgColor="bg-cyan-200" hoverBgColor="hover:bg-cyan-300" waveColor="bg-gradient-to-r from-cyan-400 to-cyan-600" icon={FileEarmarkTextFill} text="Procesy" />
      );
    }
    if (isAdminOrSuperAdmin()) {
      tileList.push(
        <WaveEffectTile key="users" to="/pages/addUser" bgColor="bg-indigo-200" hoverBgColor="hover:bg-indigo-300" waveColor="bg-gradient-to-r from-indigo-400 to-indigo-600" icon={PersonFill} text="Użytkownicy" />
      );
    }
    if (isMedicalRepresentative()) {
      tileList.push(
        <WaveEffectTile
          key="new-request"
          to="/flow/create"
          bgColor="bg-green-200"
          hoverBgColor="hover:bg-green-300"
          waveColor="bg-gradient-to-r from-green-400 to-green-600"
          icon={FileEarmarkPlusFill}
          text="Nowy Wniosek"
          onClick={() => window.location.href = "/flow/create"}
        />

      );
    }

    tileList.push(
      <WaveEffectTile key="my-requests" to="/pages/activeApplicationList" bgColor="bg-pink-200" hoverBgColor="hover:bg-pink-300" waveColor="bg-gradient-to-r from-pink-400 to-pink-600" icon={FileEarmarkBarGraphFill} text="Moje Wnioski" />
    );

    tileList.push(
      <WaveEffectTile key="help" to="/pages/faq" bgColor="bg-yellow-200" hoverBgColor="hover:bg-yellow-300" waveColor="bg-gradient-to-r from-yellow-400 to-yellow-600" icon={QuestionCircleFill} text="Pomoc" />
    );

    return tileList;
  }, [userDepartment, authData, loading]);

  const gridClass = useMemo(() => {
    const length = tiles.length;
    if (length === 3) return "grid-cols-3";
    if (length === 2) return "grid-cols-2";
    if (length === 5) return "grid-cols-3 md:grid-cols-2";
    return "grid-cols-2 md:grid-cols-2";
  }, [tiles]);

  return (
    <>
      <nav className="relative flex w-full flex-wrap items-center justify-between font-bold uppercase bg-neutral-100 py-2 text-neutral-500 shadow-lg focus:text-neutral-700 dark:bg-neutral-300 lg:py-4">
        <div className="flex w-full flex-wrap items-center justify-between px-5">
          <div>Panel główny</div>
        </div>
      </nav>

      {loading ? (
        <div className="flex justify-center items-center h-40">
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
        </div>
      ) : (
        <div className={`grid ${gridClass} gap-4 m-5 mb-5`}>
          {tiles}
        </div>
      )}

      <div className="p-2 mr-5 ml-5 bg-white-200 hover:bg-white-300 rounded-md shadow-[0_2px_15px_-3px_rgba(0,0,0,0.2),0_10px_20px_-2px_rgba(0,0,0,0.1)]">
        <FlowListWidget />
      </div>
      <div className="p-2 mr-5 ml-5 bg-white-200 hover:bg-white-300 rounded-md shadow-[0_2px_15px_-3px_rgba(0,0,0,0.2),0_10px_20px_-2px_rgba(0,0,0,0.1)]">
        <ApplicationStatistics />
      </div>
    </>
  );
};

export default Home;

