import React, { useCallback, useRef } from "react";
import { StageType } from "../../../_types";
import { fieldCanBeVisible, sanitizeFormValues } from "../../../_utils";
import { MatchFields } from "../../../globalComponents/fields";
import { useFlowApi } from "../../../_hooks/flowAPI";
import FileGenerator from "../../../globalComponents/fields/fieldCollection/file/fileGenerator";
import SimplePrincipalsEditor from "../../../globalComponents/fields/fieldCollection/principalsEditor";
import { CustomStage8AComponent } from "./test8_A";
import { FilesSpecialStageComponent } from "./files";
import { PeriodsSpecialStageComponent } from "./periods";
import { GusStageComponent } from "./gus";
import { RPWDLStageComponent } from "./rpwdl";
import CollectSamplesFromClientAddressesCollectionField from "./clientPeriods";


type DefaultSpecialStageProps = {
  stage: StageType;
  collectFormData: (data: Record<string, any>) => void;
  globalFormData: Record<string, any>;
  setValidationError: React.Dispatch<React.SetStateAction<string[]>>;
  errors: string[];
};


function DefaultSpecialStageComponent({
  stage,
  collectFormData,
  globalFormData,
  errors,
}: DefaultSpecialStageProps) {
  useFlowApi();

  const saveCollection = useCallback(
    (collection: any[]) => {
      collectFormData(collection);
    },
    [collectFormData]
  );



  const formData = stage.fields.reduce((acc: any, field: any) => {
    const globalValue = globalFormData[field.name];
    const fieldValue = field?.value;
    const defaultValue = field?.attr?.defaultValue;

    acc[field.name] =
      globalValue !== undefined ? globalValue
        : fieldValue !== undefined && fieldValue !== null ? fieldValue
          : defaultValue !== undefined ? defaultValue
            : null;

    return acc;
  }, {});



  return (
    <>
      {stage.fields.map((field) => {
        const parsedAttr =
          typeof field.attr === "string" ? JSON.parse(field.attr) : field.attr;
        const isVisible = fieldCanBeVisible(field, { ...globalFormData, ...formData });

        return (
          <div
            key={field.name}
            style={{ display: isVisible ? "block" : "none" }}
          >
            <MatchFields
              field={{
                ...field,
                attr: {
                  ...parsedAttr,
                  ...(field.name === "isAgreementCash" ? { readonly: true } : {}),
                },
              }}
              saveCollection={saveCollection}
              error={errors.includes(field.label) ? "To pole jest wymagane" : undefined}
            />
          </div>
        );
      })}
    </>
  );
}

type SpecialStageComponentProps = {
  activeStage: StageType;
  saveControlledForm: (formData: Record<string, any>) => void;
  processId: string;
  globalFormData: Record<string, any>;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>, payload: Record<string, any>) => void;
  errors: string[];
  setValidationError: React.Dispatch<React.SetStateAction<string[]>>;
  onFormChange: (data: Record<string, any>) => void;
};


export function SpecialStageComponent({
  activeStage,
  saveControlledForm,
  processId,
  globalFormData,
  handleSubmit,
  errors,
  setValidationError,
  onFormChange,
}: SpecialStageComponentProps) {
  const collectedFormData = useRef<Record<string, any>>({ ...globalFormData });

  const collectFormData = (newData: Record<string, any>) => {
    const mergedData = {
      ...collectedFormData.current,
      ...newData,
    };

    const cleaned = sanitizeFormValues(mergedData, activeStage.fields);

    const testDictionariesField = activeStage?.fields?.find(
      (field) => field.name === "testDictionaries"
    );
    if (testDictionariesField) {
      cleaned.testDictionaries = testDictionariesField.value;
    }

    collectedFormData.current = cleaned;
    saveControlledForm && saveControlledForm(cleaned);
  };

  const fileSpecialValues = new Set([
    "agreementFiles",
    "priceLists",
    "testDictionaries",
    "priceListWithoutPrices",
  ]);

  let mappedSpecial = "default";
  const { special } = activeStage;

  if (Array.isArray(special) && special.length > 0) {
    const specialValue = special[0];
    mappedSpecial = fileSpecialValues.has(specialValue) ? "files" : specialValue;
  }

  const hasDownloadFiles = activeStage.fields.some(
    (field) => field.attr?.special === "downloadFiles"
  );
  const hasFileGenerator = Array.isArray(special) && special.includes("fileGenerator");

  if (hasDownloadFiles && hasFileGenerator) mappedSpecial = "fileGeneratorAndFiles";
  else if (hasDownloadFiles) mappedSpecial = "downloadFiles";
  else if (hasFileGenerator) mappedSpecial = "fileGenerator";



  return (
    <>


      {(() => {
        switch (mappedSpecial) {
          case "principalsEditor":
            return (
              <SimplePrincipalsEditor
                flowName="client"
                flowId={processId}
                onNext={collectFormData}
                stageId={activeStage.stage}
              />
            );
          case "principalLaboratories":
            return (
              <SimplePrincipalsEditor
                flowName="client"
                flowId={processId}
                onNext={collectFormData}
                stageId={activeStage.stage}
              />
            );
          case "rpwdl":
            return (
              <RPWDLStageComponent
                stage={activeStage}
                collectFormData={collectFormData}
                errors={errors}
                handleSubmit={handleSubmit}
                setValidationError={setValidationError}
              />
            );
          case "gus":
            return (
              <GusStageComponent
                stage={activeStage}
                collectFormData={collectFormData}
                errors={errors}
                setValidationError={setValidationError}
              />
            );
          case "periods":
            return (
              <PeriodsSpecialStageComponent
                stage={activeStage}
                collectFormData={collectFormData}
                setValidationError={setValidationError}
              />
            );
          // Nowa, poprawna wersja
          case "files":
            return (
              <FilesSpecialStageComponent
                stage={activeStage}
                onFormChange={onFormChange}
                globalFormData={globalFormData}
                handleSubmit={handleSubmit}
                errors={errors}
                setValidationError={setValidationError}
              />
            );
          case "fileGenerator":
          case "downloadFiles":
          case "fileGeneratorAndFiles":
            return (
              <FileGenerator
                flowName="client"
                flowId={processId}
                stage={activeStage}
                collectFormData={collectFormData}
                setValidationError={setValidationError}
                errors={errors}
              />
            );
          case "collectionPoints":
            return (
              <CustomStage8AComponent
                stage={activeStage}
                collectFormData={collectFormData}
                setValidationError={setValidationError}
              />
            );
          case "collectSamplesFromClientAddresses": {
            const fieldForAddresses = activeStage.fields.find(
              (f) => f.name === "collectSamplesFromClientAddresses"
            );
            return (
              <CollectSamplesFromClientAddressesCollectionField
                field={fieldForAddresses}
                disabled={false}
                saveCollection={(newData: Record<string, any>) => {
                  collectFormData(newData);
                }}
                setValidationError={setValidationError}
              />
            );
          }
          default:
            return (
              <DefaultSpecialStageComponent
                stage={activeStage}
                collectFormData={collectFormData}
                globalFormData={globalFormData}
                setValidationError={setValidationError}
                errors={errors}
              />
            );
        }
      })()}
    </>
  );
}