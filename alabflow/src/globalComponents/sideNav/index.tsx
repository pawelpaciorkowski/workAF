// @ts-nocheck
import { ArrowDownCircleFill, Gear, House, List, PersonBoundingBox, StarFill } from "react-bootstrap-icons";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { initTWE, Ripple, Sidenav } from "tw-elements";
import { useAuth } from "../../_hooks/auth";
import { SessionCounter } from "../sessionCounter";
import { AuthAPI } from "../../_services/api/authAPI";
import UserProfilePage from "../../pages/profile";
import { EnvironmentBanner } from "../../globalComponents/EnvironmentBanner";

const DEPARTMENT_MEDICAL_REP = "sprzedaż".toLowerCase();

const ADMIN_ROLES = ["ROLE_SUPERADMIN", "ROLE_ADMINISTRATOR"];



export const SideNavComponent = () => {
  const { logout, authData } = useAuth();
  const navigate = useNavigate();
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false);
  const [userDepartment, setUserDepartment] = useState("");
  const [userName, setUserName] = useState("");
  const [userSurname, setUserSurname] = useState("");
  const isProduction = window.location.hostname === "alabflow.alab.com.pl";

  useEffect(() => {
    initTWE({ Sidenav, Ripple });
  }, []);

  useEffect(() => {
    if (!authData) {
      setUserDepartment("");
      setUserName("");
      setUserSurname("");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const api = new AuthAPI();
        const userProfileData = await api.getUserProfile();

        setUserDepartment(userProfileData?.team?.department?.name || "");
        setUserName(userProfileData?.name || "");
        setUserSurname(userProfileData?.surname || "");
      } catch (error) {
      }
    };

    fetchUserProfile();
  }, [authData]);



  const handleNewFlowClick = () => {
    navigate("/flow/create", { replace: true });
    navigate(0);
  };

  const isAdminOrSuperAdmin = () => {
    return authData?.roles?.some((role) => ADMIN_ROLES.includes(role)) || false;
  };

  const isOnlyAdministrator = () =>
    authData?.roles?.length === 1 &&
    authData?.roles?.includes("ROLE_ADMINISTRATOR");


  const canSeeNewFlow = () => {
    return userDepartment.trim().toLowerCase() === DEPARTMENT_MEDICAL_REP;

  };

  const renderNewFlow = () => (
    canSeeNewFlow() && (
      <Link to="/flow/create" className="w-1/5 lg:w-auto lg:mr-auto">
        <div
          onClick={handleNewFlowClick}
          data-twe-ripple-init
          data-twe-ripple-color="light"
          className="transition duration-150 uppercase ease-in-out hover:bg-primary-700 hover:shadow-lg focus:bg-primary-700 bg-primary rounded shadow text-md p-2 flex flex-col items-center cursor-pointer"
        >
          <span className="text-white">Nowy Wniosek</span>
        </div>
      </Link>
    )
  );

  const renderProcessSection = () => {
    if (!userDepartment) return null;

    return canSeeNewFlow() && (
      <li className="relative">
        <a className="group flex h-12 cursor-pointer items-center truncate rounded-[5px] px-6 py-4 text-[0.975rem] text-gray-300 hover:bg-white/10 focus:bg-white/10 active:bg-white/10" data-twe-sidenav-link-ref>
          <span className="mr-4"><Gear /></span>
          <span>Proces</span>
          <span className="absolute right-0 mr-[0.8rem] transition-transform duration-300 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:fill-gray-300" data-twe-sidenav-rotate-icon-ref>
            <ArrowDownCircleFill />
          </span>
        </a>
        <ul className="relative m-0 hidden list-none p-0 data-[te-collapse-show]:block" data-twe-sidenav-collapse-ref>
          <li className="relative">
            <Link to="/pages/processList" className="flex h-6 items-center truncate rounded-[5px] py-4 pl-[3.4rem] pr-6 text-[0.85rem] text-gray-300 hover:bg-white/10 focus:bg-white/10 active:bg-white/10" data-twe-sidenav-link-ref>
              Procesy
            </Link>
          </li>
        </ul>
      </li>
    );
  };



  const renderAdminSections = () => (
    isAdminOrSuperAdmin() && (
      <>

        <li className="relative">
          <a className="group flex h-12 cursor-pointer items-center truncate rounded-[5px] px-6 py-4 text-[0.975rem] text-gray-300 hover:bg-white/10 focus:bg-white/10 active:bg-white/10" data-twe-sidenav-link-ref>
            <span className="mr-4"><StarFill /></span>
            <span>Użytkownicy</span>
            <span className="absolute right-0 mr-[0.8rem] transition-transform duration-300 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:fill-gray-300" data-twe-sidenav-rotate-icon-ref>
              <ArrowDownCircleFill />
            </span>
          </a>
          <ul className="relative m-0 hidden list-none p-0 data-[te-collapse-show]:block" data-twe-sidenav-collapse-ref>
            <li className="relative">
              <Link to="/pages/addUser" className="flex h-6 items-center truncate rounded-[5px] py-4 pl-[3.4rem] pr-6 text-[0.85rem] text-gray-300 hover:bg-white/10 focus:bg-white/10 active:bg-white/10 ml-1" data-twe-sidenav-link-ref>
                Panel użytkowników
              </Link>
            </li>
          </ul>
        </li>
      </>
    )
  );

  return (
    <header>


      <nav
        id="sidenav-1"
        className="fixed left-0 top-[40px] z-[1035] h-[calc(100vh-40px)] w-60 -translate-x-full bg-zinc-800 shadow-[0_4px_12px_0_rgba(0,0,0,0.07),_0_2px_4px_rgba(0,0,0,0.05)] xl:data-[twe-sidenav-hidden='false']:translate-x-0"
        data-twe-sidenav-init
        data-twe-sidenav-hidden="false"
        data-twe-sidenav-mode-breakpoint-over="0"
        data-twe-sidenav-mode-breakpoint-side="xl"
        data-twe-sidenav-accordion="true"
      >

        <Link to="/home" className="mb-3 flex items-center justify-center py-6 outline-none">
          <img id="alab-logo" className="mr-2 w-6" src="/logoalab.png" alt="Alab Logo" draggable="false" />
          <span className="text-white font-bold text-[20px] pt-1">AlabFlow</span>
        </Link>
        <ul className="relative m-0 list-none px-[0.2rem]" data-twe-sidenav-menu-ref>
          {/* NIE pokazuj nic adminowi! */}
          {!isOnlyAdministrator() && (
            <>
              <li className="relative m-0 list-none px-[0.2rem]">
                {renderNewFlow()}
                <Link to="/home" className="group flex h-12 cursor-pointer items-center truncate rounded-[5px] px-6 py-4 text-[0.975rem] text-gray-300 hover:bg-white/10 focus:bg-white/10 active:bg-white/10" data-twe-sidenav-link-ref>
                  <span className="mr-4"><House /></span>
                  <span>Panel główny</span>
                </Link>
              </li>
              {renderAdminSections()}
            </>
          )}
          {/* Jeśli jesteś czystym adminem, wyświetl tylko użytkowników */}
          {isOnlyAdministrator() && (
            <li className="relative">
              <Link to="/pages/addUser" className="flex h-12 items-center truncate rounded-[5px] px-6 py-4 text-[0.975rem] text-gray-300 hover:bg-white/10 focus:bg-white/10 active:bg-white/10">
                <span className="mr-4"><StarFill /></span>
                <span>Panel użytkowników</span>
              </Link>
            </li>
          )}
        </ul>

      </nav>

      <nav
        id="main-navbar"
        className={`z-50 fixed left-0 right-0 flex w-full items-center justify-between bg-zinc-700 py-[0.6rem] text-gray-500 shadow-lg xl:pl-60 ${isProduction ? 'top-0' : 'top-[40px]'}`}
        data-twe-navbar-ref
      >

        <div className="flex w-full flex-wrap items-center justify-end px-4">

          <button data-twe-sidenav-toggle-ref data-twe-target="#sidenav-1" className="block border-0 bg-transparent px-2.5 text-gray-500 hover:no-underline hover:shadow-none focus:no-underline focus:shadow-none focus:outline-none focus:ring-0 xl:hidden" aria-controls="#sidenav-1" aria-haspopup="true">
            <List />
          </button>
          <ul className="relative flex items-center ml-auto">
            <SessionCounter />
            <li className="relative">
              <button
                onClick={() => setDropdownIsOpen(!dropdownIsOpen)}
                className="m-2 text-white flex items-center gap-2 focus:outline-none"
              >
                <span>{userName} {userSurname}</span>
                <PersonBoundingBox className="text-[20px]" />

              </button>

              <ul className={`absolute left-auto right-0 z-[1000] mt-1 min-w-[10rem] list-none rounded-lg bg-zinc-700 text-base shadow-lg ${!dropdownIsOpen && "hidden"}`} aria-labelledby="dropdownMenuButton1" onMouseLeave={() => setDropdownIsOpen(false)}>
                <li>
                  <Link to="pages/profile">
                    <button className="block w-full whitespace-nowrap bg-transparent px-4 py-2 text-sm font-normal text-gray-200 hover:bg-white/30">Mój profil</button>
                  </Link>
                </li>
                <li>
                  <button onClick={logout} className="block w-full whitespace-nowrap bg-transparent px-4 py-2 text-sm font-normal text-gray-200 hover:bg-white/30">Wyloguj</button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>

    </header>
  );
};