import React from "react";
import UsersTable from "./dataTable";

const UserList: React.FC = () => {
  
  return (
    <div>
      <nav className="relative flex w-full flex-wrap items-center justify-between font-bold uppercase bg-neutral-100 py-2 text-neutral-500 shadow-lg focus:text-neutral-700 dark:bg-neutral-300 lg:py-4">
        <div className="flex w-full flex-wrap items-center justify-between px-5">
          <div>Lista użytkowników</div>
        </div>
      </nav>
      <UsersTable />

    </div>
  );
};

export default UserList;
