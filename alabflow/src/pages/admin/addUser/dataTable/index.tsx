import React, { useEffect, useState, useCallback } from "react";
import { AuthAPI } from "../../../../_services/api/authAPI";
import AdvancedTable from "../../../../globalComponents/advancedTable";
import EditUserModal from "../../editUserModal";
import ConfirmDeleteModal from "./confirmDeleteModal";
import AddUserModal from "../../addUserModal";

const UsersTable: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);
    const authAPI = new AuthAPI();

    const fetchData = useCallback(async () => {
        try {
            const result = await authAPI.getUsersData();
            setUsers(result);
            setFilteredUsers(result);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (searchQuery === "") {
            setFilteredUsers(users);
        } else {
            setFilteredUsers(
                users.filter((user) =>
                    Object.values(user)
                        .join(" ")
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                )
            );
        }
    }, [searchQuery, users]);

    const handleRowAction = (action: string, rowData: any) => {
        if (action === "edit") {
            setUserToEdit(rowData);
            setIsEditUserModalOpen(true);
        } else if (action === "delete") {
            setUserToDelete(rowData.id);
            setIsConfirmDeleteModalOpen(true);
        }
    };

    const handleDelete = async () => {
        if (userToDelete !== null) {
            await authAPI.deleteUser(userToDelete);
            setIsConfirmDeleteModalOpen(false);
            fetchData();
        }
    };

    const columns = [
        { label: "ID", field: "id" },
        { label: "Imię", field: "name" },
        { label: "Nazwisko", field: "surname" },
        { label: "Email", field: "email" },
        { label: "Rola", field: "team.name" },
        { label: "Departament", field: "team.department.name" },
        {
            label: "Akcje",
            field: "actions",
            render: (rowData: any) => (
                <div className="flex space-x-2">
                    <button
                        type="button"
                        onClick={() => handleRowAction("edit", rowData)}
                        data-twe-ripple-init
                        data-twe-ripple-color="light"
                        className="message-btn inline-block rounded-full border border-primary bg-primary text-white p-1.5 uppercase leading-normal shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"
                            />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRowAction("delete", rowData)}
                        data-twe-ripple-init
                        data-twe-ripple-color="light"
                        className="message-btn inline-block rounded-full border border-red-500 bg-red-500 text-white p-1.5 uppercase leading-normal shadow-[0_4px_9px_-4px_rgba(255,0,0,0.3)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(255,0,0,0.5),0_4px_18px_0_rgba(255,0,0,0.3)] focus:shadow-[0_8px_9px_-4px_rgba(255,0,0,0.5),0_4px_18px_0_rgba(255,0,0,0.3)] active:shadow-[0_8px_9px_-4px_rgba(255,0,0,0.5),0_4px_18px_0_rgba(255,0,0,0.3)]"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                            />
                        </svg>
                    </button>
                </div>
            ),
        },
    ];


    return (
        <>
            <div className="mb-4">

                <button
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="transition duration-150 ease-in-out hover:bg-primary-700 hover:shadow-lg focus:bg-primary-700 bg-primary focus:shadow-lg focus:outline-none focus:ring-0 active:bg-primary-800 active:shadow-lg text-md font-medium uppercase leading-tight text-white px-4 py-2 rounded mb-2 mt-2 mr-2 ml-2 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.2),0_10px_20px_-2px_rgba(0,0,0,0.1)]"
                >
                    Dodaj użytkownika
                </button>
            </div>
            <AdvancedTable columns={columns} data={filteredUsers} onRowAction={handleRowAction} />
            <ConfirmDeleteModal
                isOpen={isConfirmDeleteModalOpen}
                onClose={() => setIsConfirmDeleteModalOpen(false)}
                onConfirm={handleDelete}
            />
            <EditUserModal
                isOpen={isEditUserModalOpen}
                onClose={() => setIsEditUserModalOpen(false)}
                userToEdit={userToEdit}
                onUserUpdated={fetchData}
            />
            <AddUserModal
                isOpen={isAddUserModalOpen}
                onClose={() => setIsAddUserModalOpen(false)}
                onUserAdded={fetchData}
            />
        </>
    );
};

export default UsersTable;
