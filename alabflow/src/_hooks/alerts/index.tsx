import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AlertDanger, AlertInfo, AlertSuccess, AlertWarning } from "./alertsComponents";
import { TransitionGroup, CSSTransition } from "react-transition-group";

const AlertsContext = createContext<any>({} as any)

export type AlertType = {
    type: string,
    content: string,
    errorContext?: string
    nodeRef: any,
    uuid: string
}

export const AlertsProvider = ({ children }: { children: React.ReactNode }) => {
    const [alertList, setAlerts] = useState<AlertType[]>([])

    const addAlert = (type: string, content: string, errorContext?: string) => {
        const alertObj: AlertType = {
            type: type,
            content: content,
            nodeRef: null,
            uuid: uuidv4()
        }
        if (errorContext) { alertObj.errorContext = errorContext }
        return setAlerts([...alertList, alertObj])
    }

    useEffect(() => {
        const removeOldestAlert = () => {
            if (alertList.length === 0) {
                return;
            }
            const updatedItems = [...alertList];
            updatedItems.shift();
            setAlerts(updatedItems);
        };
        const timer = setTimeout(() => {
            removeOldestAlert()
        }, 5000);
        return () => clearTimeout(timer);
    }, [alertList]);

    const value = useMemo(
        () => ({
            alertList,
            addAlert
        }),
        [alertList]
    );

    return (
        <AlertsContext.Provider value={value}>
            {children}
        </AlertsContext.Provider>
    )
};

export const useAlerts = () => {
    return useContext(AlertsContext)
};

export const AlertsComponent = () => {
    const { alertList } = useAlerts();

    const switchAlerts = (alert: AlertType) => {
        switch (alert.type) {
            case 'success':
                return <AlertSuccess ref={alert.nodeRef} alert={alert} />
            case 'warning':
                return <AlertWarning ref={alert.nodeRef} alert={alert} />
            case 'error':
                return <AlertDanger ref={alert.nodeRef} alert={alert} />
            default:
                return <AlertInfo ref={alert.nodeRef} alert={alert} />
        }
    }

    return (
        <div className={'fixed start-[48%] z-50 pt-2'}>
            <TransitionGroup component={null}>
                {alertList.map((alert: AlertType) => {
                    return (
                        <CSSTransition
                            key={alert.uuid}
                            nodeRef={alert.nodeRef}
                            timeout={500}
                            classNames="fade"
                        >
                            {switchAlerts(alert)}
                        </CSSTransition>
                    )
                })}
            </TransitionGroup>
        </div>
    )
}
