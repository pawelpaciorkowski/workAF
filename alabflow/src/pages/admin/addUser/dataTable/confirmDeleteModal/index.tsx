import React, { useState } from "react";
import { AxiosError } from "axios";

type ConfirmDeleteModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
};

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      await onConfirm();
      setError(null);
      onClose(); 
    } catch (e: unknown) {
      if (e instanceof AxiosError && e.response && e.response.status === 500) {
        setError("Nie można usunąć użytkownika, ponieważ ma aktywny wniosek.");
      } else {
        setError("Wystąpił błąd. Spróbuj ponownie później.");
      }
    }
  };

  const handleClose = () => {
    setError(null); 
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-white p-4 rounded shadow-lg w-1/3">
        <h2 className="text-xl mb-4 font-bold">Potwierdzenie</h2>
        <p>
          {error || "Czy na pewno chcesz usunąć tego użytkownika? Po usunięciu nie będzie można go przywrócić..."}
        </p>
        <div className="mt-4 flex justify-end">
          {!error && (
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-2"
              onClick={handleConfirm}
            >
              Usuń
            </button>
          )}
          <button
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
            onClick={handleClose}
          >
            {error ? "Zamknij" : "Anuluj"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;