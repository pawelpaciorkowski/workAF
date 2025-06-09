import React, { useState, useEffect, FormEvent, useMemo } from "react";
import { useFlowApi } from "../../../../_hooks/flowAPI";
import { AxiosResponse } from "axios";
import { MatchFields } from "../..";
import { StageFieldType } from "../../../../_types";
import GlobalModal from "../../../globalModal";
import { useNavigate } from "react-router-dom";

export type Principal = StageFieldType[];

export interface SimplePrincipalsEditorProps {
  flowName: string;
  flowId: string | number;
  stageId: string; // np. "304_1" lub "304_2"
  onNext?: (payload: { principals: { symbol: string }[] }) => void;
}

const SimplePrincipalsEditor: React.FC<SimplePrincipalsEditorProps> = ({
  flowName,
  flowId,
  stageId,
  onNext,
}) => {
  const { flowData, flowAPI, setFlowData } = useFlowApi();
  const [principals, setPrincipals] = useState<Principal[]>([]);
  const [isFilledModalOpen, setIsFilledModalOpen] = useState(false);
  const [editableDepartments, setEditableDepartments] = useState<string[]>([]);
  const [stageFieldValues, setStageFieldValues] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const navigate = useNavigate();

  const currentStage = useMemo(() => {
    return Array.isArray(flowData?.flow)
      ? flowData.flow.find((stage: any) => stage.stage === stageId)
      : null;
  }, [flowData, stageId]);

  useEffect(() => {
    if (!flowData && flowName && flowId) {
      flowAPI
        .getFlowConfig(flowId)
        .then((r: AxiosResponse) => {
          if (r.status === 200) {
            setFlowData(r.data);
          } else {
            console.error("❌ Nieoczekiwany status odpowiedzi:", r.status);
          }
        })
        .catch((error: any) => {
          console.error("❌ Błąd przy pobieraniu flowData:", error);
        });
    }
  }, [flowData, flowName, flowId]);

  useEffect(() => {
    if (!isWaitingForResponse && isSubmitted && flowData?.flowStatuses) {
      const completedStatus = flowData.flowStatuses.find(
        (status: any) =>
          status.flowStatus?.name.toLowerCase() === "wypełniony" &&
          !status.flowStatus?.isEditable
      );

      if (completedStatus) {
        setIsFilledModalOpen(true);

        const editable = flowData.flowStatuses
          .filter((status: any) => status.flowStatus?.isEditable)
          .map((status: any) =>
            status.department?.name ||
            status.team?.department?.name ||
            status.team?.name ||
            status.unit?.name ||
            null
          )
          .filter((name: any): name is string => !!name?.trim());

        // setEditableDepartments([...new Set(editable)]);
      }
    }
  }, [isSubmitted, flowData, isWaitingForResponse]);

  function flattenCollectionData(collection: StageFieldType[][]): Record<string, any>[] {
    return collection.map((entry) => {
      const flatEntry: Record<string, any> = {};

      entry.forEach((field) => {
        flatEntry[field.name] = field.value;
      });

      return flatEntry;
    });
  }


  useEffect(() => {
    if (!currentStage?.fields) return;
    const field = currentStage.fields.find(
      (f: any) => f.name === "principalLaboratories"
    );

    const collectionField = currentStage.fields.find(
      (field: any) =>
        field.name === "principalLaboratories"
    );

    if (!collectionField) return;

    const value = Array.isArray(collectionField.value) ? collectionField.value : [];

    if (value.length > 0) {
      // dane przychodzą z backendu jako tablica tablic pól (Field[][])
      setPrincipals(value);
    }

  }, [currentStage]);




  const handleSymbolChange = (principalIndex: number, fieldName: string, newValue: string) => {
    setPrincipals((prev) =>
      prev.map((principal, i) => {
        if (i !== principalIndex) return principal;

        return principal.map((field) =>
          field.name === fieldName ? { ...field, value: newValue } : field
        );
      })
    );
  };


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const payload: any = { ...stageFieldValues };

    const hasSymbols = principals.some((principal) =>
      principal.some((field) => field.name === "symbol")
    );

    const payloadPrincipalLaboratories = flattenCollectionData(principals)
      .filter((row) => row.symbol?.toString().trim() !== "");

    if (payloadPrincipalLaboratories.length > 0) {
      payload.principalLaboratories = payloadPrincipalLaboratories;
    }






    if (onNext) {
      setIsWaitingForResponse(true);
      try {
        await onNext(payload);
        const updatedFlowData = await flowAPI.getFlowConfig(flowId);
        setFlowData(updatedFlowData.data);
        setIsSubmitted(true);
      } catch (error) {
        console.error("❌ Błąd podczas wysyłania danych:", error);
      } finally {
        setIsWaitingForResponse(false);
      }
    }
  };

  if (!currentStage || !Array.isArray(currentStage.fields)) {
    return <div className="text-sm text-gray-500">Ładowanie danych etapu...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Render tylko dla 304_1 */}
      {currentStage.stage === "304_1" &&
        currentStage.fields.map((field: any) => {
          if (field.name === "principals") return null;

          return (
            <div key={field.name} className="mb-4">
              <MatchFields
                field={field}
                disabled={false}
                required={field.attr?.required || false}
                value={{
                  value:
                    stageFieldValues[field.name] ??
                    field.value ??
                    field.attr?.defaultValue ??
                    "",
                }}
                changeEvent={(changedData: Record<string, any>) => {
                  const newVal = changedData[field.name];
                  setStageFieldValues((prev) => ({
                    ...prev,
                    [field.name]: newVal,
                  }));
                }}
              />
            </div>
          );
        })}

      {/* Render tylko dla 304_2 */}
      {principals.length > 0 &&
        principals.map((principal, index) => {
          const title = `Przypisanie ${index + 1}`;

          return (
            <div key={index} className="mb-4 border border-gray-300 p-4 rounded">
              <div className="font-bold mb-2">{title}</div>
              <div className="grid grid-cols-3 gap-4">
                {principal.map((field) => {
                  if (field.name === "symbol") {
                    return (
                      <div key={field.name}>
                        <MatchFields
                          field={field}
                          required
                          disabled={false}
                          value={{ value: field.value ?? "" }}
                          changeEvent={(changedData: Record<string, any>) => {
                            const newVal = changedData[field.name];
                            handleSymbolChange(index, field.name, String(newVal));
                          }}
                        />
                      </div>
                    );
                  }

                  return (
                    <div key={field.name}>
                      <label className="text-xs text-gray-500">{field.label}</label>
                      <input
                        type="text"
                        readOnly
                        className="w-full bg-gray-100 border border-gray-300 rounded px-2 py-1"
                        value={
                          typeof field.value === "object"
                            ? JSON.stringify(field.value)
                            : String(field.value ?? "")
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

      {/* Modal */}
      {isFilledModalOpen && (
        <GlobalModal
          isOpen={isFilledModalOpen}
          title="Wniosek wypełniony"
          content={
            <div>
              <p>Twój wniosek został wypełniony. Prosimy o kontynuację w działach:</p>
              <ul className="list-disc list-inside text-blue-600 font-semibold mt-2">
                {editableDepartments.length > 0 ? (
                  editableDepartments.map((dept, i) => <li key={i}>{dept}</li>)
                ) : (
                  <li>Nieznany dział</li>
                )}
              </ul>
            </div>
          }
          onConfirm={() => {
            setIsFilledModalOpen(false);
            navigate("/home", { replace: true });
          }}
          buttonType="ok"
          confirmText="OK"
        />
      )}

      <div className="mt-4 ml-4">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
        >
          Dalej
        </button>
      </div>
    </form>
  );
};

export default SimplePrincipalsEditor;



