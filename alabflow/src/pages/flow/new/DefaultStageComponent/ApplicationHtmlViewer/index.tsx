import React from "react";

interface Props {
    html: string | null;
    isLoading: boolean;
}

/**
 * Wstrzykuje do przekazanego HTML dodatkowy styl (czcionki, formatowanie).
 */
const insertCustomStyles = (html: string): string => {
    const customStyle = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
      body {
        font-family: 'Poppins', sans-serif !important;
        font-size: 20px !important;
        margin: 0 !important;
        padding: 20px !important;
        box-sizing: border-box !important;
      }
      th, td {
        font-size: 16px !important;
      }
      table {
        width: 100% !important;
        border-collapse: collapse !important;
      }
    </style>
  `;
    return html.replace("</head>", `${customStyle}</head>`);
};

/**
 * Komponent wyświetlający treść wniosku w formie HTML w kontrolowanym <iframe>.
 */
const ApplicationHtmlViewer: React.FC<Props> = ({ html, isLoading }) => {
    if (isLoading) {
        return (
            <div className="text-center text-lg font-bold text-primary animate-pulse">
                Trwa ładowanie treści wniosku...
            </div>
        );
    }

    if (!html) {
        return (
            <div className="text-center text-red-500">
                Nie udało się załadować treści wniosku.
            </div>
        );
    }

    return (
        <div className="html-container my-4">
            <iframe
                title="frameHtml"
                srcDoc={insertCustomStyles(html)}
                style={{ width: "100%", height: "600px", border: "none" }}
            />
        </div>
    );
};

export default ApplicationHtmlViewer;
