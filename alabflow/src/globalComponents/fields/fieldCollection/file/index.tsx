import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useAlerts } from "../../../../_hooks/alerts";
import { FileEarmark, XCircleFill } from "react-bootstrap-icons";

interface FileItem {
  filename: string;
  content?: string;
  downloadUrl?: string;
}

interface FileCollectionFieldProps {
  field: {
    name: string;
    label: string;
    value: any;
  };
  value?: FileItem[];
  disabled?: boolean;
  saveCollection?: (name: string, files: FileItem[]) => void;
  setValidationError?: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function FileCollectionField({
  field,
  disabled = false,
  saveCollection,
  setValidationError,
}: FileCollectionFieldProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const { addAlert } = useAlerts();

  useEffect(() => {
    if (!saveCollection || selectedFiles.length === 0) return;

    const validFiles = selectedFiles.filter(
      (file) => file.filename && (file.content || file.downloadUrl)
    );

    if (validFiles.length === 0) {
      return;
    }

    saveCollection(field.name, validFiles);
  }, [selectedFiles, field.name, saveCollection]);

  useEffect(() => {
    if (!field.value || !Array.isArray(field.value)) return;

    const looksLikeFinalFormat = field.value.every(
      (item: any) =>
        typeof item?.filename === "string" &&
        (item?.content || item?.downloadUrl)
    );

    if (looksLikeFinalFormat) {
      setSelectedFiles(field.value);
      return;
    }

    const files = field.value.map((fileGroup: any) => {
      const filenameField = fileGroup.find((f: any) => f.name === "filename");
      const downloadField = fileGroup.find((f: any) => f.name === "downloadUrl");

      return {
        filename: filenameField?.value || "Nieznana nazwa pliku",
        downloadUrl: downloadField?.value || "#",
      };
    });

    setSelectedFiles(files);
  }, [field.value]);

  useEffect(() => {
  }, [selectedFiles]);

  const fileToBase64 = (file: File) => {
    return new Promise<FileItem>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64WithPrefix = reader.result as string;
        const base64 = base64WithPrefix.split(",")[1]; // Usunięcie prefixu
        resolve({ filename: file.name, content: base64 });
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled) return;
      try {
        const results = await Promise.all(acceptedFiles.map(fileToBase64));
        setSelectedFiles((prev) => [...prev, ...results]);
      } catch (error) {
        addAlert("danger", "Błąd przetwarzania plików.");
      }
    },
    [disabled, addAlert]
  );

  const removeFile = (fileName: string) => {
    if (disabled) return;
    setSelectedFiles((prev) =>
      prev.filter((file) => file.filename !== fileName)
    );
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, disabled });

  return (
    <>
      <div className="mb-2">{field.label}</div>
      <div className="flex flex-wrap">
        {selectedFiles.map((file, index) => (
          <div key={file.filename + index} className="p-2">
            <div className="bg-primary-300 p-2 rounded flex items-center">
              <FileEarmark className="mr-2" />
              <span className="flex-grow">
                {file.downloadUrl ? (
                  <a
                    href={file.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {file.filename}
                  </a>
                ) : (
                  file.filename
                )}
              </span>
              <XCircleFill
                className={`ml-2 ${disabled
                  ? "text-gray-400 cursor-not-allowed"
                  : "cursor-pointer hover:text-danger-600"
                  }`}
                onClick={() => {
                  if (!disabled) {
                    removeFile(file.filename);
                  }
                }}
                tabIndex={disabled ? -1 : 0}
                aria-disabled={disabled}
                role="button"
              />
            </div>
          </div>
        ))}
      </div>
      <div
        {...getRootProps()}
        className={`p-4 m-2 cursor-pointer border border-dashed ${disabled
          ? "opacity-50 cursor-not-allowed bg-gray-200"
          : "bg-white"
          }`}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
      >
        <input {...getInputProps()} disabled={disabled} />
        <p className="text-gray-500 text-center">
          📂 Przeciągnij i upuść pliki tutaj lub kliknij, aby wybrać.
        </p>
      </div>
    </>
  );
}
