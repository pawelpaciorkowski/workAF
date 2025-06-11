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
  stageId: string;
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
  const navigate = useNavigate();
  const [laboratoriesData, setLaboratoriesData] = useState<Record<string, string>>({});
  const [principalsData, setPrincipalsData] = useState<Record<string, string>>({});
  const [isFilledModalOpen, setIsFilledModalOpen] = useState(false);
  const [editableDepartments, setEditableDepartments] = useState<string[]>([]); // Pozostawiamy oryginalną logikę
  const [stageFieldValues, setStageFieldValues] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  useEffect(() => {
    if (flowAPI) {
      flowAPI.getDictionaryByName("laboratories").then((res: AxiosResponse) => {
        if (res && res.data) {
          const labMap = res.data.reduce((acc: any, item: any) => {
            acc[item.id] = `[${item.symbol}] ${item.name}`;
            return acc;
          }, {});
          setLaboratoriesData(labMap);
        }
      });
      flowAPI.getDictionaryByName("principals").then((res: AxiosResponse) => {
        if (res && res.data) {
          const prinMap = res.data.reduce((acc: any, item: any) => {
            acc[item.id] = `[${item.label}] ${item.name}`;
            return acc;
          }, {});
          setPrincipalsData(prinMap);
        }
      });
    }
  }, [flowAPI]);

  const currentStage = useMemo(() => {
    return Array.isArray(flowData?.flow)
      ? flowData.flow.find((stage: any) => stage.stage === stageId)
      : null;
  }, [flowData, stageId]);

  useEffect(() => {
    if (!flowData && flowName && flowId && flowAPI) {
      flowAPI.getFlowConfig(flowId)
        .then((r: AxiosResponse) => {
          if (r.status === 200) setFlowData(r.data);
        })
        .catch((error: any) => console.error("❌ Błąd przy pobieraniu flowData:", error));
    }
  }, [flowData, flowName, flowId, flowAPI, setFlowData]);

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

        setEditableDepartments(Array.from(new Set(editable)));
      }
    }
  }, [isSubmitted, flowData, isWaitingForResponse]);

  useEffect(() => {
    if (!currentStage?.fields) return;
    const collectionField = currentStage.fields.find((field: any) => field.name === "principalLaboratories");
    if (collectionField && Array.isArray(collectionField.value) && collectionField.value.length > 0) {
      setPrincipals(collectionField.value);
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
    if (!onNext) return;

    const flattenCollectionData = (collection: StageFieldType[][]): Record<string, any>[] => {
      return collection.map((entry) => {
        const flatEntry: Record<string, any> = {};
        entry.forEach((field) => { flatEntry[field.name] = field.value; });
        return flatEntry;
      });
    }

    const payload: any = { ...stageFieldValues };
    const payloadPrincipalLaboratories = flattenCollectionData(principals)
      .filter((row) => row.symbol?.toString().trim() !== "");

    if (payloadPrincipalLaboratories.length > 0) {
      payload.principalLaboratories = payloadPrincipalLaboratories;
    }

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
  };

  if (!currentStage || !Array.isArray(currentStage.fields)) {
    return <div className="text-sm text-gray-500">Ładowanie danych etapu...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {currentStage.stage === "304_1" &&
        currentStage.fields.map((field: any) => {
          if (field.name === "principals") return null;
          return (
            <div key={field.name} className="mb-4">
              <MatchFields
                field={field}
                disabled={false}
                required={field.attr?.required || false}
                value={{ value: stageFieldValues[field.name] ?? field.value ?? field.attr?.defaultValue ?? "" }}
                changeEvent={(changedData: Record<string, any>) => {
                  setStageFieldValues((prev) => ({ ...prev, ...changedData }));
                }}
              />
            </div>
          );
        })}

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
                  let displayValue;
                  const value = field.value;
                  const isKeyable = typeof value === 'string' || typeof value === 'number';
                  if (field.name === 'laboratory' && isKeyable) {
                    displayValue = laboratoriesData[value] || `ID: ${value}`;
                  } else if (field.name === 'principal' && isKeyable) {
                    displayValue = principalsData[value] || `ID: ${value}`;
                  } else {
                    displayValue = String(value ?? "");
                  }
                  return (
                    <div key={field.name}>
                      <label className="text-xs text-gray-500">{field.label}</label>
                      <input
                        type="text"
                        readOnly
                        className="w-full bg-gray-100 border border-gray-300 rounded px-2 py-1"
                        value={displayValue}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

      {isFilledModalOpen && (
        <GlobalModal
          isOpen={isFilledModalOpen}
          title="Wniosek wypełniony"
          content={
            <div>
              <p>Twój wniosek został wypełniony. Prosimy o kontynuację w działach:</p>
              <ul className="list-disc list-inside text-blue-600 font-semibold mt-2">
                {editableDepartments.map((dept: string, i) => <li key={i}>{dept}</li>)}
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