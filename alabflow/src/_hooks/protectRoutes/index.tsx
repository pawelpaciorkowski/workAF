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
                <footer className={'sticky'}>
                    <div className={'p-3'}>
                        <div
                            className="block w-full rounded-lg bg-white text-left shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
                            <div className="p-3">
                                <p className="text-base text-neutral-600">
                                    AlabFlow - stopka
                                </p>
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </>
        : <Navigate to='/login' />)
};
