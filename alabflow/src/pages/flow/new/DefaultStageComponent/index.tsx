import React, { useCallback, useEffect, useState } from "react";
import { MatchFields } from "../../../../globalComponents/fields";
import { fieldCanBeVisible, isObjectEmpty } from "../../../../_utils";
import { useNavigate } from "react-router-dom";
import GlobalModal from "../../../../globalComponents/globalModal";
import ApplicationHtmlViewer from "./ApplicationHtmlViewer";
import { useFinalStageModal } from "../../../../_hooks/modals";


function DefaultStageComponent({
  activeStage,
  handleSubmit,
  downloadApplicationHtml,
  htmlContent,
  setValidationError,
  flowData,
  globalFormData,
}: any) {

  const stageWithMedicalType = flowData?.flow?.find((stage: { stage: string; }) => stage.stage === "1_1");
  const medicalTypeField = stageWithMedicalType?.fields?.find((f: { name: string; }) => f.name === "medicalType");
  const isMedicalPath = medicalTypeField?.value?.value === "medical";




  const navigate = useNavigate();

  const [isRejectedModalOpen, setIsRejectedModalOpen] = useState(false);
  const [isFilledModalOpen, setIsFilledModalOpen] = useState(false);
  const [groupedFields, setGroupedFields] = useState<any>({});
  const [collectionData, setCollectionData] = useState<any>({});
  const [isHtmlLoading, setIsHtmlLoading] = useState(false);
  const [currentHtmlContent, setCurrentHtmlContent] = useState<string | null>(htmlContent || null);
  const { isFinalStageModalOpen, setIsFinalStageModalOpen } =
    useFinalStageModal(flowData, activeStage);

  const [isConnectorModalOpen, setIsConnectorModalOpen] = useState(false);
  const [selectedConnectorValue, setSelectedConnectorValue] = useState<string | null>(null);

  const enhancedFields = activeStage.fields.map((f: any) =>
    f.name === "resultReceiveTypes"
      ? { ...f, attr: { ...f.attr, required: true } }
      : f
  );


  const flattenCollection = (arr: any[]) =>
    Array.isArray(arr) && Array.isArray(arr[0]) ? arr.flat() : arr;



  const [formData, setFormData] = useState<any>(() => {
    const initialFormData = activeStage.fields.reduce((acc: any, field: any) => {
      const defaultValue = field.attr?.defaultValue ?? "";
      const value = field.value ?? defaultValue;
      if (field.name === "isAgreementCash") {
        acc[field.name] = true;
      }
      if (field.type === "checkbox") {
        acc[field.name] = value === true || value === "true";


      } else if (field.type === "collection") {
        acc[field.name] = value ?? [];
      } else {
        acc[field.name] = value;
      }

      return acc;
    }, {});


    return initialFormData;
  });


  useEffect(() => {
    if (!flowData?.flowStatuses || !activeStage?.stage) return;

    const currentStatus = flowData.flowStatuses.find(
      (status: any) =>
        status.stageHierarchy?.includes(activeStage.stage) &&
        status.flowStatus?.name?.toLowerCase() === "odrzucony"
    );

    if (currentStatus) {
      setIsRejectedModalOpen(true);
    }
  }, [flowData?.flowStatuses, activeStage?.stage]);





  useEffect(() => {
    if (!flowData?.flowStatuses || !activeStage?.stage) {
      return;
    }

    const departmentFromStatus = flowData?.flowStatuses?.find((status: any) =>
      status.stageHierarchy?.includes(activeStage.stage)
    )?.department;

    const departmentId = departmentFromStatus?.id;


    const matchedStatuses = flowData.flowStatuses.filter((status: any) => {
      const inDept = status.department?.id === departmentId;
      const inHierarchy = status.stageHierarchy?.includes(activeStage.stage);
      const isApproved = status.flowStatus?.name?.toLowerCase() === "zatwierdzony";

      return inDept && inHierarchy && isApproved;
    });


    if (matchedStatuses.length > 0) {
      setIsFilledModalOpen(true);
    } else {
      setIsFilledModalOpen(false);
    }
  }, [flowData?.flowStatuses, activeStage?.stage]);


  useEffect(() => {
    const fetchHtml = async () => {
      setIsHtmlLoading(true);
      try {
        if (["13_1", "501_1", "601_1", "701_1"].includes(activeStage.stage)) {
          const response = await downloadApplicationHtml();
          if (!response || !response.data) {
            throw new Error("Brak danych w odpowiedzi API");
          }
          const htmlBlob = new Blob([response.data], { type: "text/html" });
          const html = await htmlBlob.text();
          setCurrentHtmlContent(html);
        } else {
          setCurrentHtmlContent("");
        }
      } catch (err) {
        setCurrentHtmlContent("<div>Błąd podczas ładowania wniosku</div>");
      } finally {
        setIsHtmlLoading(false);
      }
    };

    if (activeStage) {
      fetchHtml();
    }
  }, [activeStage]);

  const getConnectorLabel = (value: string | null): string => {
    if (!value) return "Brak konfiguracji";

    const field = activeStage.fields.find((f: any) => f.name === "connectorConfiguration");
    const rawChoices = field?.choices;

    if (Array.isArray(rawChoices)) {
      const found = rawChoices.find((choice: any) => choice.value === value);
      return found?.label || value;
    }

    if (typeof rawChoices === "object" && rawChoices !== null) {
      return rawChoices[value] || value;
    }

    return value;
  };




  useEffect(() => {
    const grouped = activeStage.fields.reduce((acc: any, field: any) => {
      const group = field.attr?.group || "default";
      if (!acc[group]) acc[group] = { fields: [] };
      acc[group].fields.push(field);
      return acc;
    }, {});
    setGroupedFields((prev: any) => {
      if (JSON.stringify(prev) !== JSON.stringify(grouped)) return grouped;
      return prev;
    });
  }, [activeStage.fields, formData]);

  const handleChange = useCallback(
    (formFieldData: Record<string, any>) => {
      setFormData((prev: any) => ({ ...prev, ...formFieldData }));
      setValidationError((prevErrors: string[]) =>
        prevErrors.filter((error) => !Object.keys(formFieldData).includes(error))
      );
    },
    [setValidationError]
  );

  const saveCollection = useCallback(
    (collectionName: string, collectionContent: any) => {
      setFormData((prev: any) => ({
        ...prev,
        [collectionName]: collectionContent,
      }));
    },
    []
  );


  const nextStatus = flowData?.flowStatuses?.find(
    (status: any) =>
      status.flowStatus?.name?.toLowerCase() === "nowy" &&
      status.currentStage
  );
  const nextDepartmentName = nextStatus?.department?.name || "Nieznany dział";

  const allStatusesFilled = flowData?.flowStatuses?.every(
    (status: any) =>
      status.flowStatus?.name?.toLowerCase() === "zatwierdzony" &&
      status.flowStatus?.isEditable === false
  );

  const modalContent = allStatusesFilled ? (
    "Dziękujemy! Twój wniosek został całkowicie wypełniony."
  ) : (
    <span>
      Twój wniosek został wypełniony. Prosimy o kontynuację w dziale:{" "}
      <span className="text-xl font-bold text-blue-600">
        {nextDepartmentName}
      </span>
      .
    </span>
  );

  const handleFormSubmit = (event: any) => {
    event.preventDefault();

    const merged = { ...globalFormData, ...formData };

    if (activeStage.stage === "7_1" && formData.isCito) {
      const hasCitoTest = !!(formData.citoTest && formData.citoTest.trim().length > 0);
      const hasCitoFiles = Array.isArray(formData.citoFiles) && formData.citoFiles.length > 0;

      if (!hasCitoTest && !hasCitoFiles) {
        setValidationError([
          "Wymagane jest wypełnienie badań CITO jako tekst LUB załączenie pliku."
        ]);
        return;
      }
    }

    const missing = (enhancedFields ?? activeStage.fields)
      .filter((f: any) => f.attr?.required)
      .filter((f: any) => fieldCanBeVisible(f, merged))
      .filter((f: any) => {
        if (activeStage.stage === "7_1" && (f.name === "citoTest" || f.name === "citoFiles")) return false;
        const v = merged[f.name];
        if (Array.isArray(v)) return v.length === 0;
        return v === undefined || v === null || (typeof v === "string" && v.trim() === "");
      });

    if (missing.length > 0) {
      setValidationError(missing.map((f: { label: any; }) => f.label));
      return;
    }

    const payload: any = {};



    activeStage.fields.forEach((field: any) => {
      const isVisible = fieldCanBeVisible(field, { ...globalFormData, ...formData });


      if (!isVisible) {
        return;
      }

      let value = field.type === "collection"
        ? collectionData[field.name] ?? formData[field.name]
        : formData[field.name];

      if (field.type !== "file" && (value === 0 || value === "0")) {
        value = "";
      }

      const blacklistedFieldsByStage: Record<string, string[]> = {
        "902_1": ["agreementSupplements"],
      };

      if (blacklistedFieldsByStage[activeStage.stage]?.includes(field.name)) {
        return;
      }


      payload[field.name] = value;
    });




    if (activeStage?.stage === "503_1") {
      const selected = payload["connectorConfiguration"];
      if (selected !== "production_launch") {
        setSelectedConnectorValue(selected);
        setIsConnectorModalOpen(true);
        return;
      }
    }

    Object.keys(payload).forEach((key) => {
      if (Array.isArray(payload[key]) && Array.isArray(payload[key][0])) {
        payload[key] = payload[key].flat();
      }
    });



    handleSubmit(event, payload);
    setCollectionData({});
  };


  return (
    <div>
      <GlobalModal
        isOpen={isFinalStageModalOpen}
        title="Wniosek zakończony"
        content={modalContent}
        onConfirm={() => {
          setIsFinalStageModalOpen(false);
          navigate("/home");
        }}
        buttonType="ok"
        confirmText="OK"
      />

      <GlobalModal
        isOpen={isRejectedModalOpen}
        title="Wniosek odrzucony"
        content={
          <>
            <p>Ten wniosek został odrzucony.</p>
            {formData.settlementRejectionReason && (
              <p>
                <strong>Powód:</strong> {formData.settlementRejectionReason}
              </p>
            )}
          </>
        }
        onConfirm={() => {
          setIsRejectedModalOpen(false);
          navigate("/home");
        }}
        buttonType="ok"
        confirmText="OK"
      />

      <GlobalModal
        isOpen={isConnectorModalOpen}
        title="Potwierdzenie konfiguracji"
        content={
          <div>
            Wybrano konfigurację złączki:{" "}
            <span className="font-bold text-blue-600">
              <span className="font-bold text-blue-600">{getConnectorLabel(selectedConnectorValue)}</span>

            </span>


            <br />
            Czy na pewno chcesz zapisać i przejść dalej?
          </div>
        }
        onConfirm={() => {
          const event = new Event("submit", { bubbles: true, cancelable: true });
          document.querySelector("form")?.dispatchEvent(event); // re-submit
          setIsConnectorModalOpen(false);
          navigate("/home");
        }}
        onCancel={() => {
          setIsConnectorModalOpen(false);
        }}

        buttonType="yesNo"
        confirmText="Tak, zapisz"
        cancelText="Anuluj"
      />




      <form onSubmit={handleFormSubmit}>
        {!isObjectEmpty(groupedFields) ? (
          Object.entries(groupedFields).map(([group, value]: [any, any]) => (
            <div key={group}>
              {group !== "default" && (
                <div className="border-l-4 pl-3 border-primary text-lg mb-2">
                  {group}
                </div>
              )}
              {value.fields.map((field: any) => {
                const normalizeFormData = (formData: Record<string, any>) => {
                  const copy = { ...formData };
                  if (copy.groupOfPayers && typeof copy.groupOfPayers === "object") {
                    copy.groupOfPayers = copy.groupOfPayers.value;
                  }
                  return copy;
                };

                const mergedFormData = normalizeFormData({ ...globalFormData, ...formData });

                const isVisible = fieldCanBeVisible(field, mergedFormData);

                let filteredField = field;
                if (
                  field.name === "resultReceiveTypes" &&
                  Array.isArray(field.choices)
                ) {
                  filteredField = {
                    ...field,
                    choices: field.choices.filter((opt: { isMedical: any; isNonMedical: any; }) =>
                      isMedicalPath ? !!opt.isMedical : !!opt.isNonMedical
                    )
                  };
                }

                return (
                  isVisible && (
                    <div key={field.name} className="mb-4">
                      <MatchFields
                        saveCollection={saveCollection}
                        changeEvent={handleChange}
                        field={
                          filteredField.name === "resultReceiveTypes" && activeStage.stage === "6_1"
                            ? { ...filteredField, isMedicalPath, stage: activeStage.stage }
                            : filteredField
                        }
                        placeholder={filteredField.label}
                        value={
                          filteredField.type === "collection"
                            ? flattenCollection(formData[filteredField.name])
                            : formData[filteredField.name]
                        }
                      />



                      {filteredField?.attr?.help &&
                        typeof filteredField.attr.help === "string" &&
                        filteredField.attr.help.trim() !== "" &&
                        formData?.typeOfAgreement === "preliminary" && (
                          <p className="text-sm text-blue-700 font-medium mt-2">
                            {filteredField.attr.help}
                          </p>
                        )}
                    </div>
                  )
                );
              })}

            </div>
          ))
        ) : (
          <div className="w-full pt-2">
            <div
              className="inline-block w-full text-primary text-xl font-bold animate-pulse"
              role="status"
            >
              Sprawdź poprawność wniosku !!!
            </div>
          </div>
        )}

        {["13_1", "501_1", "601_1", "701_1"].includes(activeStage?.stage) && (
          <ApplicationHtmlViewer
            html={currentHtmlContent}
            isLoading={isHtmlLoading}
          />
        )}

        <div className="w-full text-right pt-2 pb-2">
          <button
            type="submit"
            className="inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-md transition duration-150 ease-in-out"
          >
            Dalej
          </button>
        </div>
      </form>
    </div>
  );
}

export default DefaultStageComponent;