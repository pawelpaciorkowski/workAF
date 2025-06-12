import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../auth';
import React from "react";
import { AlertsComponent } from "../alerts";
import { SideNavComponent } from '../../globalComponents/sideNav';

export const ProtectRoutes = () => {
    const { authData } = useAuth();

    return (authData.token
        ?
        <>
            <SideNavComponent />
            <main className="xl:ml-60 mt-main-nav">
                <div>
                    <AlertsComponent />
                    <Outlet />
                </div>

            </main>
            <footer className="w-full bg-gray-100 border-t border-gray-300 mt-4">
                <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-center items-center text-sm text-gray-600">
                    <span>&copy; {new Date().getFullYear()} AlabFlow. Wszelkie prawa zastrzeżone. </span>

                </div>
            </footer>

        </>
        : <Navigate to='/login' />)
};
