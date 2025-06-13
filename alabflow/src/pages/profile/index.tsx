import React, { useState, useEffect } from "react";
import { AuthAPI } from "../../_services/api/authAPI";
import { PersonCircle } from "react-bootstrap-icons";

const UserProfile = ({ user }: { user: any }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mx-auto mt-4">
      <div className="text-center">
        <PersonCircle className="text-8xl text-blue-500 mx-auto" />
        <div className="mt-4 p-4 border border-gray-300 rounded-md w-11/12 md:w-2/3 lg:w-1/2 xl:w-1/3 mx-auto shadow-lg">
          <div className="my-2">
            <label className="block font-semibold text-gray-600">ID:</label>
            <p className="text-gray-600">{user.id}</p>
          </div>
          <div className="my-2">
            <label className="block font-semibold text-gray-600">Imię:</label>
            <p className="text-gray-600">{user.name}</p>
          </div>
          <div className="my-2">
            <label className="block font-semibold text-gray-600">
              Nazwisko:
            </label>
            <p className="text-gray-600">{user.surname}</p>
          </div>
          <div className="my-2">
            <label className="block font-semibold text-gray-600">Rola:</label>
            <p className="text-gray-600">{user.roles}</p>
          </div>
          <div className="my-2">
            <label className="block font-semibold text-gray-600">Departament:</label>
            <p className="text-gray-600">{user.team.department.name}</p>
          </div>
          <div className="my-2">
            <label className="block font-semibold text-gray-600">Email:</label>
            <p className="text-gray-600">{user.email}</p>
          </div>

        </div>
      </div>
    </div>
  );
};

const UserProfilePage = () => {
  const [user, setUser] = useState({
    id: "",
    name: "",
    surname: "",
    roles: "",
    email: "",
    team: {
      id: "",
      name: "",
      department: {
        id: "",
        name: "",
        uuid: "",
      }
    },
  });

  const authAPI = new AuthAPI();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userProfileData = await authAPI.getUserProfile();
        setUser({
          id: userProfileData.id.toString(),
          name: userProfileData.name,
          surname: userProfileData.surname,
          roles: userProfileData.team.name,
          email: userProfileData.email,
          team: {
            id: userProfileData.team.id.toString(),
            name: userProfileData.team.name,
            department: {
              id: userProfileData.team.department.id.toString(),
              name: userProfileData.team.department.name,
              uuid: userProfileData.team.department.uuid,
            },
          },
        });
      } catch (error) {
        console.error("Błąd podczas pobierania danych użytkownika:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4">
      <UserProfile user={user} />
    </div>
  );
};

export default UserProfilePage;
