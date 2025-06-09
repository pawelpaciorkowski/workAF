import React, { useCallback } from "react";

interface GlobalModalProps {
  title: string;
  content: React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  isOpen: boolean;
  buttonType: "yesNo" | "ok";
  confirmText?: string;
  cancelText?: string;
  customClass?: string;
  customConfirmButtonClass?: string;
  customCancelButtonClass?: string;
}

const GlobalModal: React.FC<GlobalModalProps> = ({
  title,
  content,
  onConfirm,
  onCancel,
  isOpen,
  buttonType,
  confirmText = "Tak, kontynuuj",
  cancelText = "Nie, anuluj",
  customClass = "",
  customConfirmButtonClass = "",
  customCancelButtonClass = "",
}) => {
  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`bg-white shadow-lg rounded-lg p-6 w-full max-w-md ${customClass}`}
      >
        <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">
          {title}
        </h2>
        <div className="text-gray-700 mb-6">{content}</div>
        <div className="flex justify-center gap-4">
          {buttonType === "yesNo" ? (
            <>
              <button
                onClick={handleConfirm}
                className={`bg-blue-500 text-white font-medium px-6 py-2 rounded shadow hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 transition ${customConfirmButtonClass}`}
              >
                {confirmText}
              </button>
              <button
                onClick={handleCancel}
                className={`bg-red-400 text-white font-medium px-6 py-2 rounded shadow hover:bg-red-500 focus:ring-2 focus:ring-red-300 transition ${customCancelButtonClass}`}
              >
                {cancelText}
              </button>
            </>
          ) : (
            <button
              onClick={handleConfirm}
              className={`bg-blue-500 text-white font-medium px-6 py-2 rounded shadow hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 transition ${customConfirmButtonClass}`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalModal;
