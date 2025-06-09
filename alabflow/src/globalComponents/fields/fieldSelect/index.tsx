import { useEffect, useState, useRef } from "react";
import Select from "react-select";
import { SelectFieldProps } from "../_fieldTypes";
import { useFlowApi } from "../../../_hooks/flowAPI";

export default function SelectField({
  field,
  options,
  disabled,
  customValue,
  changeEvent,
  multi,
}: SelectFieldProps) {
  const [remoteOptions, setRemoteOptions] = useState<any[]>([]);
  const { flowAPI } = useFlowApi();
  const [isLoading, setIsLoading] = useState(false);
  const lastFetchedSource = useRef(null);



  useEffect(() => {
    const fetchOptions = async () => {
      try {
        if (!field?.attr?.source) return;
        if (lastFetchedSource.current === field.attr.source) return;

        setIsLoading(true);
        const source = field.attr.source.replace("remote:", "/");
        const data = await flowAPI.fetchDataSource(source);

        // **Pobierz flagę z propsów pola** (może musisz ją przynieść jako prop/context)
        const isMedicalPath = field.isMedicalPath;


        const shouldFilter =
          field.name === "resultReceiveTypes" &&
          field.stage === "6_1" &&
          typeof field.isMedicalPath !== "undefined";

        const filteredData = shouldFilter
          ? data.filter((item: any) =>
            field.isMedicalPath ? item.isMedical : item.isNonMedical
          )
          : data;



        const formattedOptions = filteredData.map((item: { id: any; name: any; }) => ({
          value: item.id,
          label: item.name,
        }));



        setRemoteOptions(formattedOptions);
        lastFetchedSource.current = field.attr.source;
      } catch (error) {
        console.error("Błąd podczas pobierania opcji:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (field?.attr?.source) {
      fetchOptions();
    }
  }, [field?.attr?.source, field.isMedicalPath]);




  const handleSelectOptions = (selectedOptions: { map: (arg0: (option: any) => any) => any; value: any; }) => {
    let formattedValue;
    if (multi) {
      formattedValue = Array.isArray(selectedOptions)
        ? selectedOptions.map((option) => option.value)
        : selectedOptions
          ? [selectedOptions.value]
          : [];
    } else {
      formattedValue = selectedOptions ? selectedOptions.value : null;
    }

    const isEntityType = field.attr?.collectionType === "entity";

    const payload = {
      [field.name]: isEntityType
        ? Array.isArray(formattedValue)
          ? formattedValue
          : formattedValue !== null
            ? [formattedValue]
            : []
        : formattedValue,
    };

    changeEvent(payload);
  };

  const transformChoices = () => {
    if (!field.choices) {
      return [];
    }
    return Object.entries(field.choices).map(([value, label]) => ({
      value,
      label,
    }));
  };

  const getSelOpt = (customValue: any) => {
    if (customValue && customValue.value && customValue.value.length > 0) {
      const selectedOptions = Object.entries(field.choices).map(
        ([value, label]) => ({
          value,
          label,
        })
      );
      return selectedOptions.find(
        (item: any) => item.value === customValue.value
      );
    } else {
      return null;
    }
  };

  const selectOptions = options
    ? options.concat(remoteOptions)
    : transformChoices().concat(remoteOptions);

  if (changeEvent) {
    return (
      <div>
        <label
          htmlFor={`input-${field.name}`}
          className="text-[14px] inline-block text-neutral-700"
        >
          {field.label}
        </label>
        <Select
          isMulti={multi}
          isDisabled={disabled}
          placeholder="Wybierz lub szukaj w rozwijanej liście"
          noOptionsMessage={() => "Brak danych"}
          onChange={(selectedOptions) => handleSelectOptions(selectedOptions)}
          value={selectOptions.find((opt) => opt.value === field.value)}
          name={field.name}
          options={selectOptions}
          closeMenuOnSelect={!multi}
        />
      </div>
    );
  } else {
    let selectedLabel = "";
    const val = field.value;

    if (val && typeof val === "object" && val.label) {
      selectedLabel = val.label;
    } else if (typeof val === "string" && field.choices) {
      selectedLabel = field.choices[val] || val;
    } else if (Array.isArray(val)) {
      selectedLabel = val
        .map((v) => (typeof v === "object" && v.label ? v.label : field.choices?.[v] || v))
        .join(", ");
    }

    return (
      <div>
        <label
          htmlFor={`input-${field.name}`}
          className="text-[14px] inline-block text-neutral-700"
        >
          {field.label}
        </label>
        <div
          className="p-2 mt-1 min-h-[38px] rounded border border-gray-300 bg-gray-100 text-neutral-500 flex items-center"
          style={{ fontSize: 14 }}
        >
          {selectedLabel || <span className="text-gray-400">Brak wyboru</span>}
        </div>
      </div>
    );
  }



}

