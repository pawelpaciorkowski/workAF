// w pliku: src/_hooks/flowAPI/index.tsx

import React, { createContext, useContext, useMemo, useState } from 'react';
import { useAuth } from "../auth";
import { useAlerts } from "../alerts";
import { FlowAPI } from "../../_services/api/flowAPI";
import { AxiosResponse } from "axios";

const FlowApiContext = createContext<any>({} as any)

export const FlowApiProvider = ({ children }: { children: React.ReactNode }) => {
    const { authData, refreshToken } = useAuth();
    const { addAlert } = useAlerts();
    const [flowData, setFlowData] = useState<any>(null)
    const [flowClientGroups, setFlowClientGroups] = useState<any>([]);

    const flowAPI = useMemo(() => {
        return new FlowAPI(authData, refreshToken, addAlert);
    }, [authData, refreshToken, addAlert]);

    // --- POCZĄTEK ZMIAN: Nowa funkcja do czyszczenia cache ---
    const invalidateApplicationsCache = () => {
        console.log("Czyszczenie pamięci podręcznej dla listy wniosków...");
        sessionStorage.removeItem("flowData");
    };
    // --- KONIEC ZMIAN ---

    const getFlowClientGroups = () => {
        if (flowClientGroups.length === 0) {
            flowAPI.getClientGroups().then((r: AxiosResponse) => {
                if (r.statusText === "OK") {
                    setFlowClientGroups(r.data);
                }
            });
        }
    }

    const value = useMemo(
        () => {
            return {
                flowData,
                setFlowData,
                flowAPI,
                flowClientGroups,
                getFlowClientGroups,
                invalidateApplicationsCache // <-- Udostępniamy funkcję globalnie
            }
        },
        [flowData, flowAPI, flowClientGroups]
    );

    return (
        <FlowApiContext.Provider value={value}>
            {children}
        </FlowApiContext.Provider>
    )
};

export const useFlowApi = () => {
    return useContext(FlowApiContext)
};