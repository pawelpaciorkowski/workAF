import React, { useState, useEffect, useCallback } from "react";
import { useFlowApi } from "../../../../_hooks/flowAPI";
import { useAlerts } from "../../../../_hooks/alerts";
import Select, { MultiValue } from "react-select";
import { StageType } from "../../../../_types";
import YesNoField from "../../../../globalComponents/fields/fieldYesNo";

interface CollectionPoint {
  name: string;
  id: number;
}

interface OptionType {
  value: number;
  label: string;
  multi?: boolean;
  raw: CollectionPoint;
}

interface CustomStage8AComponentProps {
  stage: StageType;
  collectFormData: (data: any) => void;
  setValidationError: React.Dispatch<React.SetStateAction<string[]>>;
}

export const CustomStage8AComponent: React.FC<CustomStage8AComponentProps> = ({
  stage,
  collectFormData,
  setValidationError,
}) => {
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedPP, setSelectedPP] = useState<number[]>([]);
  const [rawPPOptions, setRawPPOptions] = useState<CollectionPoint[]>([]);
  const [ppOptions, setPPOptions] = useState<OptionType[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { flowAPI } = useFlowApi();
  const { addAlert } = useAlerts();

  const fetchPPOptions = useCallback(async () => {
    try {
      const { data } = await flowAPI.getDictionaryByName("collectionPoints");

      setRawPPOptions(data);

      const active = data.filter((pp: { isActive: any; }) => pp.isActive);

      const options = active.map((pp: { id: any; name: any; }) => ({
        value: pp.id,
        label: pp.name,
        raw: pp,
      }));
      setPPOptions(options);
      sessionStorage.setItem("ppOptions", JSON.stringify(options));
      handleSelectAll(options);

    } catch {
      addAlert("error", "Problem z pobraniem listy punktów pobrań");
    }
  }, [flowAPI, addAlert]);



  const handleSelectAll = (options: OptionType[]) => {
    if (selectAll) {
      const allIds = options.map((option) => option.value);
      setSelectedPP(allIds);
    }
  };

  useEffect(() => {
    fetchPPOptions();
  }, [fetchPPOptions]);

  useEffect(() => {
    if (selectAll) {
      setSelectedPP(ppOptions.map((pp) => pp.value));
    } else {
      setSelectedPP([]);
    }
  }, [selectAll, ppOptions]);

  const handleSelectAllChange = (value: { selectAll: boolean }) => {
    setSelectAll(value.selectAll);
    setSelectedPP(value.selectAll ? ppOptions.map((pp) => pp.value) : []);
    setValidationErrors([]);
  };

  const handlePPChange = (selectedOptions: MultiValue<OptionType>) => {
    const selectedIds = selectedOptions.map((option) => option.value);
    setSelectedPP(selectedIds);
    setValidationErrors([]);
  };

  const handleSubmit = () => {
    const dataToSave = {
      collectionPoints: selectedPP.map((ppId) => ({ collectionPoint: ppId })),
    };
    setValidationErrors([]);
    collectFormData(dataToSave);
  };

  return (
    <div>
      {validationErrors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 rounded">
          {validationErrors.map((error, idx) => (
            <p key={idx}>{error}</p>
          ))}
        </div>
      )}
      <YesNoField
        field={{
          label: "Czy wszystkie punkty pobrań?",
          name: "selectAll",
          value: selectAll,
          attr: { defaultValue: false },
        }}
        disabled={false}
        changeEvent={handleSelectAllChange}
      />

      {!selectAll && (
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Wybierz punkty pobrań
          </label>
          <Select<OptionType, true>
            isMulti
            options={ppOptions}
            value={ppOptions.filter((pp) => selectedPP.includes(pp.value))}
            onChange={handlePPChange}
            className="basic-multi-select mt-1"
            classNamePrefix="select"
            closeMenuOnSelect={false}
          />
        </div>
      )}

      <div className="text-right mt-2">
        <button
          onClick={handleSubmit}
          className="inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs mt-2 font-medium uppercase leading-normal text-white shadow transition duration-150 ease-in-out hover:bg-primary-600 focus:bg-primary-600 active:bg-primary-700"
          data-twe-ripple-init
          data-twe-ripple-color="light"
        >
          Dalej
        </button>
      </div>

    </div>
  );
};

export default CustomStage8AComponent;
