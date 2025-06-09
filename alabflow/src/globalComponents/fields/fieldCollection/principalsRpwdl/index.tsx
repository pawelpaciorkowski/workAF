import React, { useCallback, useEffect, useState, CSSProperties } from "react";
import { useFlowApi } from "../../../../_hooks/flowAPI";
import { v4 as uuidv4 } from "uuid";
import { PlusCircleFill, XCircleFill, ChevronDown, ChevronUp } from "react-bootstrap-icons";
import { MatchFields } from "../..";
import { AxiosResponse } from "axios";
import Select from "react-select";
import ToggleSwitch from "../../fieldToggle";
import GlobalModal from "../../../globalModal/index";
import { motion, AnimatePresence } from "framer-motion";

interface HealthDivisionOption {
  readonly value: string;
  readonly label: string;
  readonly id: number;
  readonly city: string;
  readonly email: string;
  readonly flatNumber?: string;
  readonly houseNumber?: string;
  readonly phone?: string;
  readonly postalCode?: string;
  readonly regon?: string;
  readonly street?: string;
}

interface GroupedHealthUnit {
  readonly label: string;
  readonly options: readonly HealthDivisionOption[];
}

const groupStyles = {
  display: "flex",
  fontSize: 16,
  alignItems: "center",
  justifyContent: "space-between",
};

const groupBadgeStyles: CSSProperties = {
  backgroundColor: "#EBECF0",
  borderRadius: "2em",
  color: "#172B4D",
  display: "inline-block",
  fontSize: 12,
  fontWeight: "normal",
  lineHeight: "1",
  minWidth: 1,
  padding: "0.16666666666667em 0.5em",
  textAlign: "center",
};

const formatGroupLabel = (data: GroupedHealthUnit) => (
  <div style={groupStyles}>
    <span>{data.label}</span>
    <span style={groupBadgeStyles}>{data.options.length}</span>
  </div>
);

const DEFAULT_LABELS: Record<string, string> = {
  email: "Adres e-mail",
  phone: "Telefon",
  flatNumber: "Numer mieszkania",
  id: "ID z RPWDL",
  regon: "REGON",
  street: "Ulica",
  houseNumber: "Numer domu",
  city: "Miejscowość",
  postalCode: "Kod pocztowy siedziby zleceniodawcy",
  name: "Nazwa zleceniodawcy",
  resortCodes: "Kod resortowy",
  healthUnitId: "RPWDL unit ID",
};

const AddRpwdlPrincipalComponent = ({
  template,
  addCollectionItem,
  formData,
  setFormData,
  updateFormData,
  handleChange,
  addAdditionalPrincipal,
  groupedHealthDivisions,
  resetKey,
}: any) => {
  const [selectedHealthDivision, selectHealthDivision] = useState<any>();
  const [isPrincipalAssignedToUnitChecked, checkIsPrincipalAssignedToUnit] =
    useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isDisabled = Object.keys(formData).length === 0 || !selectedHealthDivision;

  const handleToggleSwitchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.checked) {
      setIsModalOpen(true);
    } else {
      checkIsPrincipalAssignedToUnit(false);
    }
  };

  const handleModalConfirm = () => {
    checkIsPrincipalAssignedToUnit(true);
    setIsModalOpen(false);
  };

  const handleModalDecline = () => {
    checkIsPrincipalAssignedToUnit(false);
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (Object.keys(formData).length === 0) {
      selectHealthDivision(null);
    }
  }, [formData]);


  useEffect(() => {
    if (!selectedHealthDivision) return;
    let formDataObj: any = {};

    for (const [key, value] of Object.entries(selectedHealthDivision)) {
      if (value === null || value === "null") continue;
      formDataObj[key] = {
        value,
        label: DEFAULT_LABELS[key] || "",
      };
    }





    if (selectedHealthDivision.resortCodes) {
      for (const [key, value] of Object.entries(selectedHealthDivision.resortCodes)) {
        if (!value) continue;

        const part = key.replace("part_", "").toUpperCase();       // VI, VII, VIII
        const fieldName = `kodresort${part.toLowerCase()}`;       // kodresortvi

        formDataObj[fieldName] = {
          value,
          label: `Kod resortowy ${part}`,
        };
      }
    }





    setFormData(formDataObj);
  }, [selectedHealthDivision]);


  useEffect(() => {
    updateFormData({
      key: "isPrincipalAssignedToUnit",
      value: isPrincipalAssignedToUnitChecked.toString(),
      label: "Przypisz zleceniodawcę do jednostki",
    });
  }, [isPrincipalAssignedToUnitChecked]);

  return (
    <div>
      <div className="border-dashed shadow-md p-5 mt-2 mb-2 rounded">
        <h5 className="mb-2 text-xl font-medium leading-tight text-neutral-800">
          Dodaj zleceniodawcę
        </h5>
        <div>
          <label className="text-[14px] inline-block text-neutral-700">
            Wybierz komórkę
          </label>
          <Select
            key={"chooseHealthDivision"}
            onChange={(healthDivision: any) =>
              selectHealthDivision(healthDivision)
            }
            value={selectedHealthDivision}
            options={groupedHealthDivisions}
            formatGroupLabel={formatGroupLabel}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {template.map((_field: any, index: number) => {
            if (
              (_field.hasOwnProperty("attr") &&
                _field.attr.hasOwnProperty("readonly") &&
                _field.attr.readonly) ||
              (_field.hasOwnProperty("attr") &&
                _field.attr.hasOwnProperty("visible") &&
                !_field.attr.visible) ||
              _field.name === "isPrincipalAssignedToUnit"
            ) {
              return null;
            }



            if (_field.name === "vat") {
              return (
                <div key={`AddRpwdlPrincipalComponent-${_field.name}-${resetKey}`}>
                  <MatchFields
                    field={_field}
                    required
                    disabled={false}
                    value={
                      formData && formData.hasOwnProperty(_field.name)
                        ? { value: formData[_field.name].value }
                        : { value: "" }
                    }
                    changeEvent={handleChange}
                  />
                </div>
              );
            }

            return (
              <div key={`AddRpwdlPrincipalComponent-${_field.name}`}>
                <MatchFields
                  field={_field}
                  required
                  disabled={false}
                  placeholder={_field.placeholder}
                  value={
                    formData && formData.hasOwnProperty(_field.name)
                      ? { value: formData[_field.name].value }
                      : { value: "" }
                  }
                  changeEvent={handleChange}
                />
              </div>
            );
          })}
        </div>

      </div>
      <div className="my-4">
        <div className="text-center">
          <ToggleSwitch
            label="Przypisz zleceniodawcę do jednostki"
            isChecked={isPrincipalAssignedToUnitChecked}
            id={"isPrincipalAssignedToUnit"}
            onToggle={handleToggleSwitchChange}
          />
          <GlobalModal
            title="UWAGA!!!"
            content="Definiowanie zleceniodawców dla jednostek nie jest zalecane. Czy jesteś pewny, że chcesz dodać zleceniodawców do jednostek?"
            onConfirm={handleModalConfirm}
            onCancel={handleModalDecline}
            isOpen={isModalOpen}
            buttonType="yesNo"
            confirmText="Tak, kontynuuj"
            cancelText="Nie, anuluj"
          />
        </div>
      </div>
      <button
        onClick={addCollectionItem}
        type="button"
        disabled={isDisabled}
        className={`
    mb-2 inline-block rounded
    bg-success            /* zawsze zielone tło */
    px-6 pb-2 pt-2.5 text-xs font-medium uppercase text-white transition
    ${isDisabled
            ? "opacity-50 cursor-not-allowed"                /* gdy disabled: półprzezroczyste + zła kursor */
            : "hover:bg-success-600 hover:shadow-lg cursor-pointer"  /* gdy aktywne: hover i pointer */
          }
  `}
      >
        Zapisz zleceniodawcę
      </button>

      <button
        onClick={() => addAdditionalPrincipal(false)}
        type="button"
        className="mb-2 ml-2 inline-block rounded bg-warning px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#14a44d] transition duration-150 ease-in-out hover:bg-warning-600 hover:shadow-[0_8px_9px_-4px_rgba(20,164,77,0.3),0_4px_18px_0_rgba(20,164,77,0.2)] focus:bg-warning-600 focus:shadow-[0_8px_9px_-4px_rgba(20,164,77,0.3),0_4px_18px_0_rgba(20,164,77,0.2)] focus:outline-none focus:ring-0 active:bg-warning-700 active:shadow-[0_8px_9px_-4px_rgba(20,164,77,0.3),0_4px_18px_0_rgba(20,164,77,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(20,164,77,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(20,164,77,0.2),0_4px_18px_0_rgba(20,164,77,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(20,164,77,0.2),0_4px_18px_0_rgba(20,164,77,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(20,164,77,0.2),0_4px_18px_0_rgba(20,164,77,0.1)]"
      >
        Anuluj
      </button>
    </div>
  );
};

const vatTranslations: { [key: string]: string } = {
  exempt: "zw",
  "23%": "23%",
};

const getVatDisplay = (vatValue: any): string => {
  if (typeof vatValue === "string") {
    return vatTranslations[vatValue] || vatValue;
  }
  if (typeof vatValue === "object") {
    if (vatValue.label) return vatValue.label;
    if (vatValue.value)
      return vatTranslations[vatValue.value] || vatValue.value;
  }
  return String(vatValue);
};

function formatResortCodes(value: any): JSX.Element | string {
  if (typeof value === "object" && value !== null) {
    return (
      <div className="flex flex-col">
        {Object.entries(value)
          .filter(([_, val]) => val !== null && val !== "null")
          .map(([key, val], idx) => (
            <div key={idx}>
              <span className="text-sm text-gray-800">
                {key}: {String(val)}
              </span>
            </div>
          ))}
      </div>
    );
  }
  return String(value);
}





export function PrincipalsRPWDLCollectionField({
  field,
  disabled,
  saveCollection,
}: any) {
  const [formData, setFormData] = useState<any>({});
  const [collection, setCollection] = useState<any>([]);
  const [alert, setAlert] = useState("");
  const [details, openDetails] = useState<number>(-1);
  const [additionalPrincipal, addAdditionalPrincipal] =
    useState<boolean>(false);
  const [groupedHealthDivisions, setGroupedHealthDivisions] = useState<any>();
  const { flowAPI, flowData } = useFlowApi();
  const [resetKey, setResetKey] = useState(0);


  const handleChange = (formFieldData: any) => {
    const [fieldName, fieldValue]: [any, any] =
      Object.entries(formFieldData)[0];
    const fieldLabel = field.template.find(
      (obj: any) => obj.name === fieldName
    ).label;

    setFormData((prevFormData: any) => ({
      ...prevFormData,
      [fieldName]: {
        ...prevFormData[fieldName],
        value: typeof fieldValue == "object" ? fieldValue.value : fieldValue,
        label: fieldLabel,
      },
    }));
  };

  const updateFormData = (obj: any) => {
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      [obj.key]: {
        ...prevFormData[obj.key],
        value: obj.value,
        label: obj.label,
      },
    }));
  };





  const handleSetFormData = (givenFormData: any) => {
    if (field && field.template) {
      for (const fieldName of Object.keys(givenFormData)) {
        const fieldLabel = field.template.find(
          (obj: any) => obj.name === fieldName
        );
        if (fieldLabel && fieldLabel.hasOwnProperty("label")) {
          givenFormData[fieldName].label = fieldLabel.label;
        }

        if (!givenFormData[fieldName].label && DEFAULT_LABELS[fieldName]) {
          givenFormData[fieldName].label = DEFAULT_LABELS[fieldName];
        }

      }
    }
    setFormData(sortObjectKeysByOtherObject(givenFormData, field.template));
  };



  useEffect(() => {
    const existedStage = flowData.flow.find(
      (item: any) => item.stage === "2_A_1_A"
    );
    if (!existedStage) {
      console.error("Nie znaleziono etapu 2_A_1_A");
      return;
    }

    const field = existedStage.fields.find(
      (item: any) => item.name === "rpwdlNip"
    );
    if (!field) {
      console.error("Nie znaleziono pola rpwdlNip");
      return;
    }

    const rpwdlNip = field.value;

    flowAPI.getClientInfoFromRPWDLByNip(rpwdlNip).then((r: AxiosResponse) => {
      if (r.statusText === "OK") {
        let groupedHealthUnits: any = [];
        for (const hd of r.data.healthDivision) {
          const healthUnitExist = groupedHealthUnits.find(
            (item: any) => item.id === hd.healthUnitId
          );

          const healthUnitData = r.data.healthUnit.find(
            (item: any) => item.id === hd.healthUnitId
          );

          if (healthUnitExist) {
            healthUnitExist.options.push({
              ...hd,
              label: `[${hd.id}] ${hd.name} (${hd.city} ${hd.street} ${hd.houseNumber})`,
              value: hd.id,
            });
          } else {
            groupedHealthUnits.push({
              label: healthUnitData ? healthUnitData.name : "Nieznany oddział zdrowotny",
              id: hd.healthUnitId,
              options: [
                {
                  ...hd,
                  label: `[${hd.id}] ${hd.city} ${hd.street} ${hd.houseNumber}`,
                  value: hd.id,
                },
              ],
            });
          }
        }
        setGroupedHealthDivisions(groupedHealthUnits);
      }
    });
  }, [flowAPI, flowData.flow]);


  const checkFieldsNotEmpty = useCallback(() => {

    if (Object.keys(formData).length === 0) {
      setAlert("Wypełnij przynajmniej jedno pole");
      return false;
    }
    for (const _field of field.template) {
      if (
        _field.attr &&
        (_field.attr.readonly === true || !field.attr.visible)
      ) {
        continue;
      }
      const isRequired =
        _field.name === "vat" ||
        _field.attr?.required === true ||
        _field.required === true;


      if (isRequired) {
        const value = formData[_field.name]?.value;
        const isEmpty = value === undefined || value === null || value === "";

        if (isEmpty) {
          setAlert(`Wypełnij wymagane pole ${_field.label}`);
          return false;
        }
      }

    }
    return true;
  }, [formData, field.template]);

  const addCollectionItem = useCallback(() => {
    if (checkFieldsNotEmpty()) {
      setAlert("");
      const formDataWithKey = {
        removable: true,
        uuid: uuidv4(),
        form: sortObjectKeysByOtherObject(formData, field.template),
      };
      setCollection([...collection, formDataWithKey]);
      setFormData({});
      setResetKey(prev => prev + 1);
    }
  }, [checkFieldsNotEmpty, formData, field.template, collection]);

  const removeCollectionItem = (uuid: any) => {
    const updatedCollection = collection.filter(
      (_item: any) => _item.uuid !== uuid
    );
    setCollection(updatedCollection);
  };

  const createCollectionObjToSave = () => {


    return {
      [field.name]: collection.map((collectionItem: any) => {
        const formEntries = Object.entries(collectionItem.form);
        const entry: Record<string, any> = {};
        const resortCodes: { resortCodePart: string; resortCode: string }[] = [];

        const EXCLUDED_KEYS = ["resortCodes", "label", "value", "healingDivisionCode", "email", "phone", "regon"];

        const RESORT_PART_MAPPING: Record<string, string> = {
          kodresortv: "part_V",
          kodresortvi: "part_VI",
          kodresortvii: "part_VII",
          kodresortviii: "part_VIII",
          kodresortix: "part_IX",
          kodresortx: "part_X",
        };


        for (const [key, fieldValueObj] of formEntries) {
          const value = (fieldValueObj as { value: any })?.value ?? "";

          if (RESORT_PART_MAPPING[key] && value) {
            resortCodes.push({
              resortCodePart: RESORT_PART_MAPPING[key],
              resortCode: value,
            });
          } else if (!EXCLUDED_KEYS.includes(key)) {
            entry[key] = value;
          }
        }

        if (resortCodes.length > 0) {
          entry.principalResortCodes = resortCodes;
        }

        return entry;
      }),
    };


  };

  const renderCollectionItem = (item: any, index: number) => {
    const isExpanded = details === item.uuid;



    return (
      <div
        key={item.uuid}
        className="relative block w-full rounded-lg border mb-4 shadow-md transition-all hover:bg-neutral-100"
      >
        <div className="flex justify-between items-center bg-neutral-50 px-4 py-3 rounded-t-lg">
          <div
            onClick={() => openDetails(isExpanded ? -1 : item.uuid)}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <span className="text-base font-semibold">
              Zleceniodawca {index + 1}:    {item.form.name?.value || "Brak nazwy"}
            </span>


            {isExpanded ? (
              <ChevronUp size={20} className="text-gray-500" />
            ) : (
              <ChevronDown size={20} className="text-gray-500" />
            )}
          </div>

          {item.removable && (
            <XCircleFill
              onClick={(e) => {
                e.stopPropagation();
                removeCollectionItem(item.uuid);
              }}
              className="cursor-pointer hover:text-red-600 transition-colors"
              size={24}
              color="red"
            />
          )}
        </div>

        <div
          onClick={() => openDetails(isExpanded ? -1 : item.uuid)}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 text-sm"
        >
          {Object.entries(item.form)
            .slice(0, 6)
            .filter(([_, _item]: [string, any]) => _item?.value !== null && _item?.value !== "null")
            .map(([key, _item]: [string, any], idx: number) => (
              <div key={idx} className="flex flex-col">
                <span className="text-gray-500 font-medium">{_item.label}</span>
                <span className="text-gray-900">
                  {key === "vat"
                    ? getVatDisplay(_item.value)
                    : typeof _item.value === "object" && _item.value !== null
                      ? _item.value.label || _item.value.value || JSON.stringify(_item.value)
                      : _item.value}

                </span>
              </div>
            ))}

        </div>

        {
          isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden px-4 pb-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-blue-50 rounded-b-lg p-4">
                {(() => {

                  const entries = Object.entries(item.form);
                  const regularFields: [string, any][] = [];

                  const resortCodes =
                    Array.isArray(item.form?.principalResortCodes)
                      ? item.form.principalResortCodes
                      : [];



                  for (const [key, _item] of entries as [string, { value: any; label?: string }][]) {
                    if (
                      key.startsWith("kodresort") ||
                      key.startsWith("part_") ||
                      key === "principalResortCodes"
                    ) {
                      continue;
                    }
                    regularFields.push([key, _item]);
                  }


                  return (
                    <>
                      {regularFields
                        .filter(([_, _item]) => _item?.value !== null && _item?.value !== "null")
                        .map(([key, _item], idx) => (
                          <div key={idx} className="flex flex-col">
                            <span className="text-gray-500 font-medium">{_item.label}</span>
                            <span className="text-gray-900">
                              {key === "vat" ? getVatDisplay(_item.value) : formatResortCodes(_item.value)}
                            </span>
                          </div>
                        ))}

                      {resortCodes.length > 0 && (
                        <div className="flex flex-col col-span-full">
                          <span className="text-gray-500 font-medium mb-1">Kody resortowe</span>
                          <div className="ml-2 flex flex-col gap-1">
                            {resortCodes.map((codeObj: any, idx: number) => (
                              <div key={idx}>
                                <span className="text-gray-500 text-sm">
                                  Kod resortowy {codeObj?.resortCodePart?.replace("part_", "")}
                                </span>
                                <span className="text-gray-900">{codeObj?.resortCode}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </>
                  );
                })()}

              </div>
            </motion.div>
          )
        }


      </div >
    );
  };


  if (disabled) {
    return <SummaryTable field={field} />;
  }

  return (
    <>
      {collection &&
        collection.length > 0 &&
        collection.map(renderCollectionItem)}
      {alert && (
        <div
          className="mb-4 rounded-lg bg-warning-100 px-6 py-5 text-base text-warning-800"
          role="alert"
        >
          {alert}
        </div>
      )}
      {additionalPrincipal && (
        <AddRpwdlPrincipalComponent
          template={field.template ? field.template : null}
          addCollectionItem={addCollectionItem}
          setFormData={handleSetFormData}
          updateFormData={updateFormData}
          formData={formData}
          handleChange={handleChange}
          addAdditionalPrincipal={addAdditionalPrincipal}
          groupedHealthDivisions={groupedHealthDivisions}
          resetKey={resetKey}  // <-- przekazujemy resetKey
        />
      )}
      {!additionalPrincipal && !disabled && (
        <button
          onClick={() => addAdditionalPrincipal(true)}
          type="button"
          disabled={additionalPrincipal}
          data-twe-ripple-init
          data-twe-ripple-color="light"
          className="mb-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center rounded bg-success px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-success-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-success-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-success-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
        >
          <PlusCircleFill className="mr-2" />
          Dodaj zleceniodawcę
        </button>
      )}
      <button
        onClick={() => saveCollection(createCollectionObjToSave())}
        type="button"
        className="inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
        data-twe-ripple-init
        data-twe-ripple-color="light"
      >
        Dalej
      </button>
    </>
  );
}

function sortObjectKeysByOtherObject(objectToSort: any, referenceObject: any) {
  const referenceOrder: Record<string, number> = {};
  referenceObject.forEach((obj: any, index: number) => {
    referenceOrder[obj.name] = index + 1;
  });

  const sortedObject: any = {};

  // Najpierw sortuj na podstawie referencji
  Object.keys(referenceOrder)
    .sort((a, b) => referenceOrder[a] - referenceOrder[b])
    .forEach((key) => {
      if (objectToSort[key]) {
        sortedObject[key] = objectToSort[key];
      }
    });

  Object.entries(objectToSort).forEach(([key, value]) => {
    if (!sortedObject[key]) {
      sortedObject[key] = value;
    }
  });


  return sortedObject;
}



const SummaryTable = ({ field }: any) => {
  if (field.value.length === 0) {
    return (
      <div
        className="mb-4 rounded-lg bg-warning-100 px-6 py-5 text-base text-warning-800"
        role="alert"
      >
        Pole <b>{field.name}</b> nie zostało wypełnione
      </div>
    );
  }
  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="overflow-hidden">
            <table className="min-w-full text-left text-sm font-light">
              <thead className="border-b font-medium dark:border-neutral-500">
                <tr>
                  <th scope="col" className="px-6 py-4">
                    #
                  </th>
                  {field.value[0].map((item: any) => (
                    <th key={item.name} scope="col" className="px-6 py-4">
                      {item.label || (item.name === "kodresortviii" ? "Kod resortowy" : item.name)}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {field.value.map((item: any, index: number) => (
                  <tr key={index} className="border-b dark:border-neutral-500">
                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                      {index + 1}
                    </td>
                    {item.map((_item: any) => (
                      <td
                        key={_item.name}
                        className="whitespace-nowrap px-6 py-4"
                      >
                        {_item.name === "vat"
                          ? getVatDisplay(_item.value)
                          : _item.value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
