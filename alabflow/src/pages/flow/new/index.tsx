import React, { useCallback, useEffect, useState, useRef } from "react";
import { StageGroupType, StageType } from "../../../_types";
import { Asterisk } from "react-bootstrap-icons";
import { useFlowApi } from "../../../_hooks/flowAPI";
import { fieldCanBeVisible, getFormKeyAndValues } from "../../../_utils";
import { SpecialStageComponent } from "../specialStages";
import { AxiosResponse } from "axios";
import { useParams, useNavigate } from "react-router-dom";
import GlobalModal from "../../../globalComponents/globalModal";
import PrevStagesComponent from "./PrevStagesComponent";
import DefaultStageComponent from "./DefaultStageComponent";
import { useFinalStageModal } from "../../../_hooks/modals";

type DictionaryMap = Record<number, string>;

function CreateNewFlowComponent({ createFlow, flowID }: any) {
  return (
    <div className="block rounded bg-white text-neutral-700 p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.2),0_10px_20px_-2px_rgba(0,0,0,0.1)]">
      <h3 className="mb-2 text-xl font-medium leading-tight">
        {flowID
          ? "Kontynuuj wypełnianie wniosku o id " + flowID
          : "Rozpocznij wypełnianie wniosku"}
      </h3>
      <button
        onClick={() => createFlow()}
        type="button"
        className="inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
        data-twe-ripple-init
        data-twe-ripple-color="light"
      >
        {flowID ? "Kontynuuj wypełnianie wniosku " : "Rozpocznij wniosek"}
      </button>
    </div>
  );
}


export default function FlowNew() {
  const { flowID } = useParams();
  const {
    flowAPI,
    flowData,
    setFlowData,
    flowClientGroups,
    getFlowClientGroups,
    invalidateApplicationsCache
  } = useFlowApi();
  const navigate = useNavigate();

  const [laboratoriesData, setLaboratoriesData] = useState<DictionaryMap>({});
  const [principalsData, setPrincipalsData] = useState<DictionaryMap>({});

  const [activeStageGroup, setActiveStageGroup] = useState<StageGroupType | undefined>(undefined);
  const [validationError, setValidationError] = useState<any>([]);
  const [previousStages, setPreviousStages] = useState<StageType[] | []>([]);
  const [htmlContent] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stageToChange, setStageToChange] = useState<StageGroupType | null>(null);
  const [globalFormData, setGlobalFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStage, setActiveStage] = useState<StageType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isFinalizedRef = useRef<boolean>(false);
  const [nestedErrorsContext, setNestedErrorsContext] = useState<string[]>([]);

  const { isFinalStageModalOpen, setIsFinalStageModalOpen, modalContent } = useFinalStageModal(
    flowData,
    activeStage
  );

  useEffect(() => {
    const fetchDictionaries = async () => {
      try {
        const [labResponse, prinResponse] = await Promise.all([
          flowAPI.getDictionaryByName("laboratories"),
          flowAPI.getDictionaryByName("principals")
        ]);

        if (labResponse && labResponse.data) {
          const labMap: DictionaryMap = {};
          labResponse.data.forEach((item: any) => {
            labMap[item.id] = `[${item.symbol}], ${item.name}, MPK-${item.mpk}`;
          });
          setLaboratoriesData(labMap);
        }

        if (prinResponse && prinResponse.data) {
          const prinMap: DictionaryMap = {};
          prinResponse.data.forEach((item: any) => {
            prinMap[item.id] = `[${item.label}], ${item.name}`;
          });
          setPrincipalsData(prinMap);
        }
      } catch (error) {
        console.error("Błąd podczas pobierania słowników:", error);
      }
    };

    if (flowAPI) {
      fetchDictionaries();
    }
  }, []);


  useEffect(() => {
    if (isFinalStageModalOpen) {
      isFinalizedRef.current = true;
    }
  }, [isFinalStageModalOpen]);

  const normalizedFlowClientGroups = useCallback(
    () =>
      Array.isArray(flowClientGroups)
        ? flowClientGroups
        : Object.values(flowClientGroups || {}),
    [flowClientGroups]
  );

  const getStageGroup = useCallback(
    (stage: StageType) => {
      const flowGroupsArray = normalizedFlowClientGroups();
      return flowGroupsArray.find(
        (obj: StageGroupType) => obj.id === stage.stageGroupId
      ) || null;
    },
    [normalizedFlowClientGroups]
  );

  const downloadApplicationHtml = useCallback(async () => {
    if (!flowData?.id) {
      return null;
    }
    try {
      const response = await flowAPI.getApplicationHtml(flowData.id);
      if (!response || !response.data) {
        throw new Error("Brak danych w odpowiedzi API.");
      }
      return response;
    } catch (error: any) {
      return null;
    }
  }, [flowData?.id, flowAPI]);

  useEffect(() => {
    getFlowClientGroups();
  }, [activeStage, getFlowClientGroups]);

  const createFlow = async () => {
    try {
      const response = flowID
        ? await flowAPI.getFlowConfig(flowID)
        : await flowAPI.getFlowConfig();

      if (response.status === 200) {
        setFlowData(response.data);
      } else {
        console.error(`❌ Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error("Błąd podczas tworzenia/pobierania flow:", error);
    }
  };

  const injectMissingStages = useCallback(() => {
    if (!flowData?.flow || !flowData?.flowStatuses) return [];

    const currentStageIdsFromStatuses = flowData.flowStatuses
      .filter((status: { flowStatus: { isEditable: any; }; currentStage: any; }) => status.flowStatus?.isEditable && status.currentStage)
      .map((status: { currentStage: any; }) => status.currentStage);

    const existingStageIds = flowData.flow.map((stage: any) => stage.stage);

    const missingStages = currentStageIdsFromStatuses
      .filter((stageId: any) => !existingStageIds.includes(stageId))
      .map((stageId: any) => ({
        stage: stageId,
        fields: [],
        name: `Etap ${stageId} (uzupełniony)`,

      }));

    return missingStages;
  }, [flowData?.flow, flowData?.flowStatuses]);

  const getStage = useCallback((): StageType | undefined => {
    if (!flowData?.flow || !flowData?.flowStatuses) return;

    const userDeptId =
      flowData?.user?.department?.id ??
      flowData?.user?.team?.department?.id ??
      null;

    const allStages = [...flowData.flow, ...injectMissingStages()];

    const stageToGroupMap = allStages.reduce((acc, stage) => {
      acc[stage.stage] = stage.stageGroupId ?? 9999;
      return acc;
    }, {} as Record<string, number>);

    const editableStatuses = flowData.flowStatuses
      .filter((status: any) => status.flowStatus?.isEditable)
      .map((status: any) => {
        const stageId = status.currentStage || status.stageHierarchy?.slice(-1)[0];
        const groupId = stageToGroupMap[stageId] ?? 9999;
        return {
          ...status,
          groupId,
          stageId,
          deptId: status.department?.id ?? status.team?.department?.id,
          statusName: status.flowStatus?.name?.toLowerCase()
        };
      })
      .filter((status: { statusName: string; }) =>
        ["nowy", "w trakcie uzupełniania"].includes(status.statusName)
      )
      .sort((a: { groupId: number; }, b: { groupId: number; }) => a.groupId - b.groupId);

    const activeStatus = editableStatuses.find(
      (s: { deptId: any; }) => s.deptId === userDeptId
    ) || editableStatuses[0];

    if (!activeStatus || !activeStatus.stageId) {
      return;
    }

    const foundStage = allStages.find(
      (stage) => stage.stage === activeStatus.stageId
    );

    if (!foundStage) {
      return;
    }

    foundStage.fields = foundStage.fields.map((field: any) => ({
      ...field,
      attr: typeof field.attr === "string" ? JSON.parse(field.attr) : field.attr,
    }));

    return foundStage;
  }, [flowData, injectMissingStages]);

  useEffect(() => {
    const currentStage = getStage();
    if (!currentStage) return;

    if (!isFinalizedRef.current && currentStage.stage !== activeStage?.stage) {

      const relevantSteps = flowData.flow.filter(
        (step: any) => step.stageGroupId <= currentStage.stageGroupId
      );

      const defaultValues: Record<string, any> = {};
      relevantSteps.forEach((step: any) => {
        step.fields.forEach((field: any) => {
          const val = field.value ?? field.attr?.defaultValue;
          if (field.name && val !== undefined) {
            defaultValues[field.name] = val;
          }
        });
      });
      setValidationError([]);
      setGlobalFormData(defaultValues);

      setActiveStage(currentStage);
      const activeGroup = getStageGroup(currentStage);
      if (activeGroup) setActiveStageGroup(activeGroup);
    }
  }, [flowData, getStage, getStageGroup, activeStage?.stage]);


  function resetFlowToStage(stageId: string) {
    // ... bez zmian
    flowAPI
      .resetFlow(flowData.id, stageId)
      .then((r: AxiosResponse) => {
        if (r.status === 200) {
          setFlowData(r.data);
          setPreviousStages([]);
        } else {
          setErrorMessage(
            "Nie można cofnąć etapu. Możesz cofać się tylko do etapów, które zostały już wypełnione i zatwierdzone."
          );
        }
      })
      .catch(() => {
        setErrorMessage("Nie można cofnąć etapu.");
      });
  }

  const validateAndFormatData = (
    data: Record<string, any>,
    fieldsMetadata: Record<string, any>
  ) => {
    const formattedData: Record<string, any> = { ...data };

    Object.keys(formattedData).forEach((key) => {
      const value = formattedData[key];
      const fieldMetadata = fieldsMetadata[key] || {};

      if (key === "resultReceiveTypes") {
        formattedData[key] = Array.isArray(value)
          ? value
          : value
            ? [value]
            : [];
      } else if (Array.isArray(value)) {
        if (fieldMetadata.collectionType === "file") {
          formattedData[key] = value.map((item) => ({
            filename: item.filename,
            content: item.content,
          }));
        } else {
          formattedData[key] = value.map(String);
        }
      } else if (value instanceof File) {
        formattedData[key] = {
          filename: value.name,
          content: value,
        };
      } else if (fieldMetadata.collectionType === "entity") {
        formattedData[key] =
          value !== null && value !== undefined ? [value] : [];
      } else if (typeof value === "object" && value !== null) {
        formattedData[key] = JSON.stringify(value);
      } else if (value === "") {
        formattedData[key] = null;
      }
    });

    return formattedData;
  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
    collectionData: any
  ) => {
    // ... (bez zmian)
    event.preventDefault();
    if (isSubmitting || !activeStage) return;
    setIsSubmitting(true);

    const rawFormData = {
      ...globalFormData,
      ...getFormKeyAndValues(event, activeStage.fields),

    };

    const currentFormState = { ...globalFormData, ...rawFormData };

    const visibleFields = activeStage.fields.filter(field =>
      fieldCanBeVisible(field, currentFormState)
    );

    const filteredFormData = visibleFields.reduce<Record<string, any>>((acc, field) => {
      acc[field.name] = currentFormState[field.name];
      return acc;
    }, {});

    const fieldsMetadata = visibleFields.reduce<Record<string, any>>((acc, field) => {
      acc[field.name] = field.attr || {};
      return acc;
    }, {});

    const validatedData = validateAndFormatData(filteredFormData, fieldsMetadata);
    const finalPayload = { ...validatedData, ...collectionData };

    flowAPI
      .saveStage(flowData.id, activeStage.stage, finalPayload)
      .then((response: any) => {

        if (response.statusText === "OK") {
          invalidateApplicationsCache();
          if (!isFinalizedRef.current) {
            setFlowData(response.data);
          } else {
          }
        } else if (response.data?.error === "Validation errors") {
          const context = response.data.context;
          let errors: string[] = [];

          if (Array.isArray(context) && context.length && Array.isArray(context[0]) && typeof context[0][0] === "string") {
            errors = context[0];
            setNestedErrorsContext([]);
          }
          else if (Array.isArray(context)) {
            errors = context.flatMap((errObj) => {
              if (typeof errObj === "object" && errObj !== null) {
                return Object.entries(errObj).flatMap(([field, msgs]) =>
                  Array.isArray(msgs) ? msgs.map(msg => ` ${msg}`) : []
                );
              }
              return [];
            });
            setNestedErrorsContext([]);
          }
          else {
            errors = ["Wystąpił nieznany błąd walidacji."];
            setNestedErrorsContext([]);
          }
          setValidationError(errors);
        }
      })
      .catch((error: any) => {
        console.error("❌ Błąd zapisu etapu:", error.response?.data || error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const saveControlledForm = (formObj: object) => {
    if (!activeStage) return;

    const flowId = flowData.id;
    const currentStageId = activeStage.stage;
    setIsSubmitting(true);

    flowAPI
      .saveStage(flowId, currentStageId, formObj)
      .then((r: AxiosResponse) => {
        setIsSubmitting(false);

        if (r.statusText === "OK") {
          if (!isFinalizedRef.current) {
            setFlowData(r.data);
          }
        }
        else if (r.data?.error === "Validation errors") {
          const context = r.data.context;
          let errors: string[] = [];

          if (Array.isArray(context) && context.length && Array.isArray(context[0]) && typeof context[0][0] === "string") {
            errors = context[0];
            setNestedErrorsContext([]);
          }
          else if (Array.isArray(context)) {
            errors = context.flatMap((errObj) => {
              if (typeof errObj === "object" && errObj !== null) {
                return Object.entries(errObj).flatMap(([field, msgs]) =>
                  Array.isArray(msgs) ? msgs.map(msg => ` ${msg}`) : []
                );
              }
              return [];
            });
            setNestedErrorsContext([]);
          }
          else {
            errors = ["Wystąpił nieznany błąd walidacji."];
            setNestedErrorsContext([]);
          }

          setValidationError(errors);
        }

      })
      .catch((err: any) => {
        setIsSubmitting(false);
        console.error("Błąd zapisu w etapie specjalnym:", err);

        if (err?.response?.data?.error === "Validation errors") {
          const raw = (err.response.data.context?.[0] as any)?.collectSamplesFromClientAddresses;
          const nested: string[] = Array.isArray(raw)
            ? raw.flatMap((errObj: Record<string, any>, idx: number) => {
              const entries = Object.entries(errObj) as Array<[string, string[]]>;
              return entries.map(
                ([fieldName, messages]) =>
                  `collectSamplesFromClientAddresses[${idx}].${fieldName}: ${messages.join(", ")}`
              );
            })
            : [];
          setNestedErrorsContext(nested);

        }
      });
  };

  useEffect(() => {
    if (!flowData?.flowStatuses || !activeStageGroup) return;

    const usedStageIds = new Set<string>();
    flowData.flowStatuses.forEach((status: any) => {
      if (Array.isArray(status.stageHierarchy)) {
        status.stageHierarchy.forEach((stageId: string) => usedStageIds.add(stageId));
      }
      if (status.currentStage) {
        usedStageIds.add(status.currentStage);
      }
    });

    const filtered = flowData.flow.filter(
      (obj: StageType) =>
        usedStageIds.has(obj.stage) && obj.stageGroupId < activeStageGroup.id
    );
    setPreviousStages(filtered);
  }, [flowData, activeStageGroup]);

  const handleSetActiveStageGroup = (stageGroup: StageGroupType) => {
    if (activeStageGroup && stageGroup.id < activeStageGroup.id) {
      setStageToChange(stageGroup);
      setIsModalOpen(true);
    }
  };

  const confirmStageChange = () => {
    if (stageToChange) {
      setPreviousStages(
        previousStages.filter((pStage) => pStage.stageGroupId < stageToChange.id)
      );
      setActiveStageGroup(stageToChange);
      resetFlowToStage(stageToChange.stages[0]);
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    if (isFinalStageModalOpen) {
      setActiveStage(null);
      setActiveStageGroup(undefined);
    }
  }, [isFinalStageModalOpen]);

  return (
    <div className="relative">
      <nav className="sticky z-40 top-main-nav flex w-full flex-wrap items-center justify-between font-bold uppercase bg-neutral-100 py-2 text-neutral-500 shadow-lg focus:text-neutral-700 dark:bg-neutral-300 lg:py-4">
        <div className="flex w-full flex-wrap items-center justify-between px-5">
          <div>Dodaj nowy proces</div>
        </div>
      </nav>

      <div className="mx-5 my-5">
        <div className="grid grid-cols-3 gap-4">
          <div className={activeStageGroup ? "col-span-2" : "col-span-3"}>
            {isFinalStageModalOpen ? null : activeStageGroup && Object.keys(activeStageGroup).length > 0 ? (
              <>
                {previousStages.length > 0 && (
                  <PrevStagesComponent
                    stages={previousStages}
                    flowStageGroups={flowClientGroups}
                    laboratoriesData={laboratoriesData}
                    principalsData={principalsData}
                  />
                )}

                <div className="block rounded bg-white text-neutral-700 p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.2),0_10px_20px_-2px_rgba(0,0,0,0.1)]">
                  {validationError && validationError.length > 0 && (
                    <div className="mb-4 rounded-lg bg-warning-100 px-6 py-5 text-base text-warning-700" role="alert" >
                      <h4 className="mb-2 font-bold leading-tight">
                        Popraw błędy walidacji w poniższych polach!
                      </h4>
                      <ul className="w-96">
                        {validationError.map((fieldName: string) => (
                          <li key={fieldName} className="w-full text-sm border-b-2 border-warning-300 border-opacity-100 py-2" >
                            {fieldName}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      {flowData?.id && (
                        <div className="mb-4 text-xl font-semibold text-blue-800">
                          Wniosek nr {flowData.id}
                        </div>
                      )}
                      <h5 className="mb-2 text-xl font-medium leading-tight">
                        {activeStageGroup.name}
                        <br />
                        <small className="text-neutral-500 font-normal">
                          Etap {activeStage?.stage}
                          <br />
                          {activeStage?.description ? (
                            <span>{activeStage.description}</span>
                          ) : (
                            <span>{activeStage?.name}</span>
                          )}
                        </small>
                      </h5>
                    </div>
                    <div className="my-auto">
                      <Asterisk size="30px" className="float-right" />
                    </div>
                  </div>

                  {activeStage ? (
                    !activeStage.special ? (
                      <DefaultStageComponent
                        key={activeStage.stage}
                        activeStage={activeStage}
                        handleSubmit={handleSubmit}
                        downloadApplicationHtml={downloadApplicationHtml}
                        htmlContent={htmlContent}
                        setValidationError={setValidationError}
                        flowData={flowData}
                        formData={globalFormData}
                        setFormData={setGlobalFormData}
                      />
                    ) : (
                      <SpecialStageComponent
                        activeStage={activeStage}
                        saveControlledForm={saveControlledForm}
                        processId={flowData.id}
                        globalFormData={globalFormData}
                        handleSubmit={handleSubmit}
                        errors={validationError}
                        setValidationError={setValidationError}
                      />
                    )
                  ) : (
                    <div>Nie wybrano etapu lub etap jest specjalny.</div>
                  )}
                </div>
              </>
            ) : (
              <CreateNewFlowComponent createFlow={createFlow} flowID={flowID} />
            )}
          </div>

          {activeStageGroup && (
            <div>
              <div className="block sticky md:top-[133px] rounded bg-white text-neutral-700 p-2 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.2),0_10px_20px_-2px_rgba(0,0,0,0.1)]">
                <h5 className="mb-2 mt-3 ml-3 text-xl font-medium leading-tight">
                  Etapy procesu
                </h5>
                <div className="overflow-y-auto max-h-screen p-2">
                  <ol className="border-l border-neutral-300 dark:border-neutral-500">
                    {normalizedFlowClientGroups().map(
                      (stageGroup: StageGroupType) => (
                        <li
                          key={stageGroup.id}
                          onClick={() => {
                            if (
                              activeStageGroup &&
                              stageGroup.id < activeStageGroup.id
                            ) {
                              handleSetActiveStageGroup(stageGroup);
                            }
                          }}
                        >
                          <div
                            className={`flex-start flex items-center pt-3 ${activeStageGroup && stageGroup.id < activeStageGroup.id
                              ? "cursor-pointer hover:translate-y-1 duration-300"
                              : ""
                              }`}
                          >
                            <div
                              className={`-ml-[5px] mr-3 h-[9px] w-[9px] rounded-full transition ease-in-out delay-150 ${activeStageGroup?.name === stageGroup.name
                                ? "bg-blue-600"
                                : "bg-neutral-500"
                                }`}
                            ></div>
                            <p
                              className={`font-bold transition ease-in-out delay-100 ${activeStageGroup?.name === stageGroup.name
                                ? "text-blue-600"
                                : "text-neutral-500"
                                }`}
                            >
                              {stageGroup.name}
                            </p>
                          </div>
                          <div className="mb-6 ml-4 mt-2">
                            <p className="mb-3 text-sm text-neutral-500">
                              Krok {stageGroup.id}
                            </p>
                          </div>
                        </li>
                      )
                    )}
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded shadow">
            <div className="mb-4">
              <svg
                className="animate-spin h-8 w-8 text-blue-500 mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <p className="text-center">Trwa zatwierdzanie wniosku...</p>
          </div>
        </div>
      )}

      <GlobalModal
        isOpen={isModalOpen}
        title="UWAGA!"
        content={`Powrót do edycji etapu ${stageToChange?.name} spowoduje usunięcie danych wprowadzonych po tym etapie. Czy chcesz kontynuować?`}
        onConfirm={confirmStageChange}
        onCancel={() => setIsModalOpen(false)}
        buttonType="yesNo"
        confirmText="Tak, kontynuuj"
        cancelText="Nie, anuluj"
      />

      {errorMessage && (
        <GlobalModal
          isOpen={!!errorMessage}
          title="Błąd cofania etapu"
          content={errorMessage}
          onConfirm={() => setErrorMessage(null)}
          buttonType="ok"
          confirmText="OK, rozumiem"
        />
      )}

      {isFinalStageModalOpen && (
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
      )}
    </div>
  );
}