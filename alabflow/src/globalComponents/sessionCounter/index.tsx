import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../_hooks/auth";
import  jwtDecode  from "jwt-decode";
import { ModalSession } from "./modalSession";

interface Props {
    sessionLength?: number;
}

 export const SessionCounter: React.FC<Props> = ({ sessionLength }) => {
    const { authData, logout, refreshToken } = useAuth();
    // Stan do przechowywania pozostałego czasu sesji
    const [remainingTime, setRemainingTime] = useState(0);
    const [isModalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        // Dekoduj token, aby uzyskać czas wygaśnięcia
        const decodedToken: any = jwtDecode(authData.token);
        const expirationTimeInSeconds = decodedToken.exp;
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);
        setRemainingTime(expirationTimeInSeconds - currentTimeInSeconds);
    }, [authData]);

    const handleSessionEnd = useCallback(() => {
        logout();
    }, [logout]);

    useEffect(() => {
        // Funkcja odliczająca czas sesji
        const timer = setInterval(() => {
            setRemainingTime((prevTime) => prevTime - 1);

            if (remainingTime <= 60 && !isModalOpen) {
                setModalOpen(true);
            }

            // Sprawdzanie czy czas jest mniejszy lub równy 0, jeśli tak to kończ sesję
            if (remainingTime <= 0) {
                handleSessionEnd();
                clearInterval(timer);
            }
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, [handleSessionEnd, isModalOpen, remainingTime]);

    const handleCloseModal = () => {
        handleSessionEnd();
        setModalOpen(false);
    };

    const handleConfirmModal = () => {
        refreshToken();
        setModalOpen(false);
    };

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${
            remainingSeconds < 10 ? "0" : ""
        }${remainingSeconds}`;
    };

    return (
        <>
            <span className="text-white p-2">{formatTime(remainingTime)}</span>
            <ModalSession
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmModal}
            />
        </>
    );
};


