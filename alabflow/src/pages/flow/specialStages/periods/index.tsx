import { useCallback, useEffect, useRef, useState } from "react";
import { StageType } from "../../../../_types";
import { MatchFields } from "../../../../globalComponents/fields";
import CollectionPeriodsField from "../../../../globalComponents/fields/fieldCollection/periods";
import { fieldCanBeVisible } from "../../../../_utils";

type PeriodsSpecialStageProps = {
  stage: StageType;
  collectFormData: (data: Record<string, any>) => void;
  setValidationError: React.Dispatch<React.SetStateAction<string[]>>;
};

export function PeriodsSpecialStageComponent({
  stage,
  collectFormData,
  setValidationError,
}: PeriodsSpecialStageProps) {
  const [collectedFormData, setCollectedFormData] = useState<Record<string, any>>({});
  const [addresses, setAddresses] = useState<Array<{ id: number; data: Record<string, any> }>>([]);

  const collectionRefs = useRef<Record<string, () => any>>({});
  const addressCounter = useRef(0);

  const getDefaultValue = (field: any) => {
    if (field.type === "boolean") return false;
    if (field.type === "string") return "";
    if (field.type === "collection") return [];
    return field.value ?? "";
  };

  useEffect(() => {
    const initialData = stage.fields.reduce((acc: Record<string, any>, field: any) => {
      acc[field.name] = getDefaultValue(field);
      return acc;
    }, {});
    setCollectedFormData(initialData);
  }, [stage.fields]);

  const handleSave = useCallback(
    (fieldName: string, collection: any) => {
      setCollectedFormData((prevData) => {
        const updated = { ...prevData, [fieldName]: collection };
        collectFormData(updated);
        return updated;
      });
    },
    [collectFormData]
  );

  const handleAddAddress = () => {
    setAddresses((prev) => [
      ...prev,
      { id: addressCounter.current++, data: {} },
    ]);
  };

  const handleRemoveAddress = (id: number) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
  };

  const handleNext = () => {
    const updatedData = { ...collectedFormData };
    Object.keys(collectionRefs.current).forEach((key) => {
      const getPeriodsData = collectionRefs.current[key];
      if (typeof getPeriodsData === "function") {
        updatedData[key] = getPeriodsData();
      }
    });
    collectFormData(updatedData);
  };

  return (
    <>
      {stage.stage === "9_3_B" && (
        <>
          <button
            type="button"
            onClick={handleAddAddress}
            className="mb-4 mr-4 inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white"
          >
            Dodaj adres
          </button>

          {addresses.map((address) => (
            <div
              key={address.id}
              className="p-4 border rounded-lg shadow-md bg-gray-100 mt-4"
            >
              <h3 className="text-md font-semibold mb-2">Nowy adres odbioru</h3>
              {stage.fields
                .filter((field) =>
                  ["street", "city", "postalCode"].includes(field.name) && fieldCanBeVisible(field, address.data)
                )
                .map((field) => (
                  <MatchFields
                    key={`${address.id}-${field.name}`}
                    field={field}
                    changeEvent={(data: any) => {
                      setAddresses((prev) =>
                        prev.map((addr) =>
                          addr.id === address.id
                            ? { ...addr, data: { ...addr.data, ...data } }
                            : addr
                        )
                      );
                    }}
                    value={{
                      value: address.data[field.name] ?? getDefaultValue(field),
                    }}
                  />
                ))}

              {stage.fields
                .filter(
                  (field) =>
                    field.type === "collection" && field.attr?.collectionType &&
                    fieldCanBeVisible(field, address.data)
                )
                .map((field) => (
                  <CollectionPeriodsField
                    key={`${address.id}-${field.name}`}
                    field={field}
                    saveCollection={(collection: any) =>
                      handleSave(`${address.id}-${field.name}`, collection)
                    }
                    disabled={false}
                    ref={(ref: { getPeriodsData: () => any }) => {
                      if (ref) {
                        collectionRefs.current[`${address.id}-${field.name}`] =
                          ref.getPeriodsData;
                      }
                    }}
                  />
                ))}

              <button
                type="button"
                onClick={() => handleRemoveAddress(address.id)}
                className="mb-4 inline-block rounded bg-red-500 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white"
              >
                Usuń adres
              </button>
            </div>
          ))}
        </>
      )}

      {stage.stage !== "9_3_B" &&
        stage.fields
          .filter(field => fieldCanBeVisible(field, collectedFormData))
          .map((field) => {
            if (field.type === "collection" && field.attr?.collectionType) {
              return (
                <CollectionPeriodsField
                  key={field.name}
                  field={field}
                  saveCollection={(collection: any) =>
                    handleSave(field.name, collection)
                  }
                  disabled={false}
                  ref={(ref: { getPeriodsData: () => any }) => {
                    if (ref) {
                      collectionRefs.current[field.name] = ref.getPeriodsData;
                    }
                  }}
                />
              );
            }
            return (
              <MatchFields
                key={field.name}
                field={field}
                changeEvent={(data: Record<string, any>) =>
                  setCollectedFormData((prev) => ({ ...prev, ...data }))
                }
                value={{
                  value: collectedFormData[field.name] ?? getDefaultValue(field),
                }}
              />
            );
          })}

      <div className="overflow-hidden">
        <button
          onClick={handleNext}
          type="button"
          className="mt-4 float-right inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white"
        >
          Dalej
        </button>
      </div>

    </>
  );
}
