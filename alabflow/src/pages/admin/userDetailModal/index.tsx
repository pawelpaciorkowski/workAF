// UserDetailModal.tsx
import React from "react";
import { User } from "../addUser/types";


interface UserDetailModalProps {
  user: User | null;
  onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => {

  if (!user) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-10">
      <div className="bg-white p-4 rounded shadow-lg w-1/3">
        <h2 className="text-xl mb-4 font-bold">Informacje o użytkowniku</h2>
        <p>
          <strong>Imię i Nazwisko:</strong> {user.name} {user.surname}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Rola:</strong> {user.team.name}
        </p>

        {/* jesli user jest przedstawicielem handlowym wtedy wyswietl dyrektora 
          ToDo: zrobic to w backendzie i wtedy wyswietlić tutaj*/}
        {user.team.id === 4 && (
          <p>
            <strong>Pracodawca:</strong> {user.name} {user.surname}
          </p>
        )}

        {/* jesli user jest administratorem procesu wtedy wyswietl taka informacje (kazdy moze byc administratorem procesu)
            ToDO: zrobic to w backendzie i wtedy wyswietlić tutaj
        */}
        {user.isProcessAdministrator === true && (
          <p>
            <strong>Administrator procesu:</strong> {user.name} {user.surname}
          </p>
        )}



        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-red-300 text-white px-2 py-1 mt-2 rounded hover:bg-red-500 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.2),0_10px_20px_-2px_rgba(0,0,0,0.1)]"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
