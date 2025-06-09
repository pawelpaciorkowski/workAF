import React from "react";

interface ModalSessionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

  export const ModalSession: React.FC<ModalSessionProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-1/2 min-w-max max-w-2xl">
        <p className="text-xl font-semibold mb-4">
          Czy chcesz przedłużyć sesję?
        </p>
        <div className="flex justify-end">
          <button
            onClick={onConfirm}
            className="bg-green-500 text-white px-4 py-2 rounded mr-4 hover:bg-green-600"
          >
            Tak
          </button>
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Nie
          </button>
        </div>
      </div>
    </div>
  );
};