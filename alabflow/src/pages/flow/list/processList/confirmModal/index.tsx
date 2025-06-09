import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  children?: React.ReactNode;
  backdrop?: "static" | true | false;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  backdrop = true,
}) => {
  // Blokada przewijania tła
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50, // Dodanie wysokiego z-index
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && backdrop !== "static" && onClose) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "5px",
          width: "80%",
          maxWidth: "500px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <p className="p-3">Czy na pewno chcesz anulować ten wniosek?</p>
        <div className="flex justify-end">
          <button
            className="mr-2 px-4 py-2 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:shadow-lg bg-blue-500 hover:bg-blue-700"
            onClick={onConfirm}
          >
            Tak
          </button>
          <button
            className="px-4 py-2 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:shadow-lg bg-red-500 hover:bg-red-700"
            onClick={onClose}
          >
            Nie
          </button>
        </div>
      </div>
    </div>
  );
};
