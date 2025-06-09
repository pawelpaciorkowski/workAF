import React from "react";

export const EnvironmentBanner = () => {
    const port = window.location.port;

    let label = "";
    let bannerStyle: React.CSSProperties = {
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
        width: "100%",
        padding: "0.5rem",
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    };

    switch (port) {
        case "3000":
            label = "Korzystasz z aplikacji w wersji testowej";
            bannerStyle.backgroundColor = "#f97316";
            break;
        case "8888":
            label = "Korzystasz z aplikacji w wersji testowej";
            bannerStyle.backgroundColor = "#f97316";
            break;
        case "8880":
            label = "Korzystasz z aplikacji w wersji stabilnej";
            bannerStyle.backgroundColor = "#2563eb";
            break;
        default:
            label = "Korzystasz z aplikacji produkcyjnej";
            bannerStyle.backgroundColor = "#16a34a";
            break;
    }

    return (
        <div style={bannerStyle}>
            {label}
        </div>
    );
};
