import { UserProvider } from './auth';
import React from "react";
import {FlowApiProvider} from "./flowAPI";
import {AlertsProvider} from "./alerts";

const AppProvider = ({ children } : { children: React.ReactNode }) => (
    <>
        <UserProvider>
            <AlertsProvider>
            <FlowApiProvider>
                { children }
            </FlowApiProvider>
            </AlertsProvider>
        </UserProvider>
    </>
);

export default AppProvider;
