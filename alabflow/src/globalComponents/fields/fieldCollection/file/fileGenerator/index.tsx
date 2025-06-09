import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAlerts } from "../../../../../_hooks/alerts";
import { useFlowApi } from "../../../../../_hooks/flowAPI";
import apiInstance from "../../../../../_services/api/common";
import GlobalModal from "../../../../globalModal";
import { useAuth } from "../../../../../_hooks/auth";

interface FileGeneratorProps {
    errors?: string[];
    flowName?: string;
    flowId?: string | number;
    stage?: any;
    collectFormData?: (formData: object) => void;
    setValidationError?: React.Dispatch<React.SetStateAction<string[]>>;
}


export default function FileGenerator(props: FileGeneratorProps) {
    const {
        flowName: propFlowName,
        flowId: propFlowId,
        stage,
        collectFormData,
        setValidationError,
        errors,
    } = props;
    const params = useParams<{ flowName?: string; flowId?: string }>();

    const flowName = propFlowName || stage?.flowName || params.flowName;
    const flowId = propFlowId || stage?.flowId || params.flowId;

    const [availableFiles, setAvailableFiles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [isWaitingForResponse, setIsWaitingForResponse] =
        useState<boolean>(false);
    const [isFilledModalOpen, setIsFilledModalOpen] = useState<boolean>(false);
    const [nextDepartmentName, setNextDepartmentName] = useState<string | null>(
        null
    );

    const { addAlert } = useAlerts();
    const { flowAPI, flowData, setFlowData } = useFlowApi();
    const { authData } = useAuth();
    const navigate = useNavigate();
    const [downloadError, setDownloadError] = useState<string | null>(null);





    useEffect(() => {
        if (!flowAPI || !flowName || !stage) {
            addAlert("danger", "Błąd autoryzacji lub brak wymaganej funkcji w API.");
            return;
        }


        let isMounted = true;

        const fetchFiles = async () => {
            try {
                setIsLoading(true);
                const uploadedFiles =
                    (await flowAPI.getUploadedFilesList(flowName)) || [];

                const formFiles: any[] = [];
                stage.fields.forEach((field: any) => {
                    if (field.attr?.special === "downloadFiles") {
                        field.value.forEach((file: any) => {
                            let downloadUrl = file.find((f: any) => f.name === "downloadUrl")?.value;
                            const filename = file.find((f: any) => f.name === "filename")?.value;

                            if (filename === "principals.xlsx" && downloadUrl?.includes("/generate/laboratories")) {
                                downloadUrl = downloadUrl.replace("/generate/laboratories", "/generate/principal-laboratories");
                            }

                            if (downloadUrl && filename) {
                                formFiles.push({
                                    id: downloadUrl,
                                    name: filename,
                                    type: field.name,
                                    isApiFile: downloadUrl.startsWith("/api"),
                                });
                            }

                            if (downloadUrl?.includes("{fileType}") || downloadUrl?.includes("{fileId}")) {
                                addAlert("danger", "Błąd: niepoprawny link do pliku – zgłoś do administratora.");
                                return;
                            }
                        });
                    }
                });


                const uniqueFiles = Array.from(
                    new Map(
                        [...uploadedFiles, ...formFiles].map((file) => [file.name, file])
                    ).values()
                );

                if (isMounted) {
                    setAvailableFiles(uniqueFiles);
                }
            } catch (error: any) {
                console.error("❌ Błąd pobierania pliku:", error);

                const accessDenied =
                    error?.response?.status === 403 ||
                    error?.response?.data?.message?.includes("Access denied");

                if (accessDenied) {
                    addAlert("danger", "Nie masz uprawnień do pobrania tego pliku.");
                    setValidationError?.((prev) => Array.from(new Set([...prev, "downloadAccess"])));
                }
            }


            finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchFiles();

        return () => {
            isMounted = false;
        };
    }, [flowName, stage]);

    const handleDownloadFile = async (file: any) => {
        try {
            if (!file || !file.id) {
                throw new Error("Brak pliku do pobrania.");
            }

            let fileUrl = file.id;

            if (file.isApiFile && file.id.startsWith("/api/")) {
                fileUrl = file.id.replace(/^\/api\//, "");
            }

            const baseURL = apiInstance.defaults.baseURL || "";
            const fullUrl = `${baseURL.replace(/\/$/, "")}/${fileUrl.replace(/^\//, "")}`;


            const token = authData?.token;
            if (!token) {
                throw new Error("Brak tokena JWT. Użytkownik nie jest zalogowany.");
            }

            const response = await apiInstance.get(fullUrl, {
                responseType: "json",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const { filename, content } = response.data;

            if (!content) {
                throw new Error("Błąd: Brak zawartości pliku.");
            }

            const binaryData = atob(content);
            const byteArray = new Uint8Array(binaryData.length);
            for (let i = 0; i < binaryData.length; i++) {
                byteArray[i] = binaryData.charCodeAt(i);
            }

            const blob = new Blob([byteArray], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename || "pobrany_plik.xlsx";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

        } catch (error: any) {
            console.error("❌ Błąd pobierania pliku:", error);

            const accessDenied =
                error?.response?.status === 403 ||
                error?.response?.data?.message?.includes("Access denied");

            if (accessDenied) {
                setDownloadError("Nie masz uprawnień do pobrania tego pliku. Przejdź dalej do kolejnego etapu.");
                addAlert("danger", "Nie masz uprawnień do pobrania tego pliku.");
                setValidationError?.((prev) => Array.from(new Set([...prev, "downloadAccess"])));
            }
            else {
                setDownloadError("Nie masz uprawnień do pobrania tego pliku. Przejdź dalej do kolejnego etapu.");
                addAlert("danger", "Wystąpił błąd przy pobieraniu pliku.");
            }

        }
    };


    const handleSubmit = async () => {
        if (!collectFormData) return;

        setIsWaitingForResponse(true);
        try {
            await collectFormData({});

            const updatedFlowData = await flowAPI.getFlowConfig(flowId);
            setFlowData(updatedFlowData.data);

            setIsSubmitted(true);
        } catch (error) {
            console.error("❌ Błąd podczas wysyłania formularza:", error);
        }
        setIsWaitingForResponse(false);
    };

    return (
        <div className="flex flex-col items-center p-4 mt-2 border-2 border-dashed border-gray-300 bg-gray-100 text-gray-500">
            {errors?.includes("downloadAccess") && (
                <div className="w-full mt-2 text-sm text-red-600 border border-red-300 bg-red-50 p-3 rounded">
                    Nie masz uprawnień do pobrania pliku. Skontaktuj się z administratorem.
                </div>
            )}
            {downloadError && (
                <div className="w-full mt-2 text-sm text-red-600 border border-red-300 bg-red-50 p-3 rounded">
                    {downloadError}
                </div>
            )}



            <div className="mt-4 w-full">

                <h3 className="text-lg font-semibold mb-2">
                    Wygenerowane i dodane pliki:
                </h3>
                {availableFiles.length > 0 ? (
                    <ul className="border rounded p-2">
                        {availableFiles.map((file) => (
                            <li
                                key={file.id}
                                className="flex justify-between items-center border-b p-2"
                            >
                                <span>{file.name}</span>
                                <button
                                    className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                                    onClick={() => handleDownloadFile(file)}
                                >
                                    Pobierz
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : props.errors?.includes("downloadAccess") ? (
                    <p className="text-red-600 text-sm mb-2">
                        Brak dostępu do pobrania pliku – skontaktuj się z administratorem.
                    </p>
                ) : (
                    <p className="text-gray-600">Brak dostępnych plików.</p>
                )
                }
            </div>

            <button
                className="self-end rounded bg-primary mt-4 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                data-twe-ripple-init
                data-twe-ripple-color="light"
                onClick={handleSubmit}
                disabled={isLoading}
            >
                Dalej
            </button>

            {isFilledModalOpen && (
                <GlobalModal
                    isOpen={isFilledModalOpen}
                    title="Wniosek wypełniony"
                    content={
                        <span>
                            Twój wniosek został wypełniony. Prosimy o kontynuację w dziale:{" "}
                            <span className="text-xl font-bold text-blue-600">
                                {nextDepartmentName || "Nieznany dział"}
                            </span>
                            .
                        </span>
                    }
                    onConfirm={() => {
                        setIsFilledModalOpen(false);
                        navigate("/home", { replace: true });
                    }}
                    buttonType="ok"
                    confirmText="OK"
                />
            )}
        </div>
    );
}