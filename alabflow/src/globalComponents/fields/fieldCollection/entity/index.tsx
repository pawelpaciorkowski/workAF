import { Check2All, XCircleFill } from "react-bootstrap-icons";
import React, { useEffect, useState } from "react";
import { useAlerts } from "../../../../_hooks/alerts";
import { useFlowApi } from "../../../../_hooks/flowAPI";
import { AxiosResponse } from "axios/index";
import Select from "react-select";
import { v4 as uuidv4 } from "uuid";
import ToggleSwitch from "../../../fields/fieldToggle";

interface FieldTemplate {
    name: string;
    attr: {
        visible: boolean;
        source?: string;
        [key: string]: any;
    };
    multiple?: boolean;
}

interface GroupedData {
    [key: string]: any;
}

interface CollectionItem extends GroupedData {
    uuid: string;
}

interface SelectOption {
    label: string;
    value: number | string;
}

const GroupOfEntityFields = ({
    template,
    addCollectionItem,
    flowSavedData,
}: {
    template: FieldTemplate[];
    addCollectionItem: (item: CollectionItem) => void;
    flowSavedData: any;
}) => {
    const [groupedData, setGroupedData] = useState<GroupedData>({});
    const { addAlert } = useAlerts();

    const handleAddCollectionItem = () => {
        if (Object.keys(groupedData).length > 1) {
            if (Array.isArray(groupedData.laboratory)) {
                groupedData.laboratory.forEach(lab => {
                    addCollectionItem({
                        ...groupedData,
                        laboratory: lab,
                        uuid: uuidv4()
                    });
                });
            } else {
                addCollectionItem({ ...groupedData, uuid: uuidv4() });
            }
            setGroupedData({});
        } else {
            addAlert("warning", "Wypełnij formularz aby dodać przypisanie");
        }
    };

    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                {template.map((_field: FieldTemplate) => {
                    if (_field.attr.visible === false) return null;
                    return (
                        <SelectComponent
                            key={_field.name}
                            groupedData={groupedData}
                            setGroupedData={setGroupedData}
                            flowSavedData={flowSavedData}
                            _field={_field}
                        />
                    );
                })}
            </div>
            <div className="mt-2">
                <button
                    onClick={handleAddCollectionItem}
                    type="button"
                    className="inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs mb-2 font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                >
                    Dodaj przypisanie
                </button>
            </div>
        </>
    );
};

const SelectComponent = ({
    _field,
    groupedData,
    setGroupedData,
    flowSavedData,
}: {
    _field: FieldTemplate;
    groupedData: GroupedData;
    setGroupedData: React.Dispatch<React.SetStateAction<GroupedData>>;
    flowSavedData: any;
}) => {
    const { flowAPI } = useFlowApi();
    const [options, setOptions] = useState<SelectOption[]>([]);

    const handleSetCollectionData = (data: any) => {
        setGroupedData((prevFormData) => ({
            ...prevFormData,
            [_field.name]: data,
        }));
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            handleSetCollectionData(options);
        } else {
            handleSetCollectionData([]);
        }
    };

    const getSubmittedData = (stage: string, key: string) => {
        const existStage = flowSavedData?.flow?.find(
            (item: any) => item.stage === stage
        );

        if (!existStage || !Array.isArray(existStage.fields)) {
            return [];
        }

        const existField = existStage.fields.find((item: any) => item.name === key);

        if (!existField || !Array.isArray(existField.value)) {
            return [];
        }

        return existField.value.map((valueArr: any[]) =>
            Object.fromEntries(valueArr.map((item) => [item.name, item.value]))
        );
    };


    useEffect(() => {
        const getDictionary = (name: string) => {
            return flowAPI
                .getDictionaryByName(name)
                .then((r: AxiosResponse) => {
                    if (r.statusText === "OK") {
                        return r.data.map((item: any) => ({
                            label: `[${item.symbol}], ${item.name}, ${"MPK-" + item.mpk}`,
                            value: item.id,
                        }));
                    }
                });
        };

        const getEntityOptions = () => {
            if (_field.attr.hasOwnProperty("source")) {
                const sourceAttrs = _field.attr.source!.split(":");
                switch (sourceAttrs[0]) {
                    case "remote":
                        getDictionary(sourceAttrs[1]).then((r: any) =>
                            setOptions(r)
                        );
                        return;
                    case "submitted":
                        const submittedData = getSubmittedData(
                            sourceAttrs[1],
                            sourceAttrs[2]
                        );
                        const _options = submittedData.map((item: any) => ({
                            value: item.id,
                            label: item.name,
                        }));
                        setOptions(_options);
                }
            }
        };
        getEntityOptions();
    }, []);

    const isAllSelected = groupedData[_field.name]?.length === options.length;

    const handleChange = (selectedOptions: any) => {
        handleSetCollectionData(selectedOptions || []);
    };

    return (
        <div>
            <Select
                value={groupedData[_field.name] || []}
                noOptionsMessage={() => "Brak danych"}
                placeholder={"Wybierz lub szukaj"}
                isClearable={true}
                isMulti={true}
                onChange={handleChange}
                options={options}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
            />

            {(_field.name === "principals" || _field.name === "laboratory") && (
                <ToggleSwitch
                    label="Zaznacz Wszystkie"
                    id={`selectAll${_field.name}`}
                    isChecked={isAllSelected}
                    onToggle={(e) => {
                        handleSelectAll(e);
                        if (!isAllSelected) {
                            handleSetCollectionData(options);
                        } else {
                            handleSetCollectionData([]);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default function EntityCollectionField({
    field,
    disabled,
    saveCollection,
}: {
    field: any;
    disabled: boolean;
    saveCollection: (data: any) => void;
}) {
    const [collectionItems, setCollectionItems] = useState<CollectionItem[]>([]);
    const { addAlert } = useAlerts();
    const { flowData, flowAPI } = useFlowApi();
    const [laboratoriesData, setLaboratoriesData] = useState<Record<number, string>>({});
    const [principalsData, setPrincipalsData] = useState<Record<number, string>>({});

    useEffect(() => {
        const fetchDictionaries = async () => {
            try {
                const [labResponse, prinResponse] = await Promise.all([
                    flowAPI.getDictionaryByName("laboratories"),
                    flowAPI.getDictionaryByName("principals")
                ]);

                if (labResponse && labResponse.data) {
                    const labData: Record<number, string> = {};
                    labResponse.data.forEach((item: any) => {
                        labData[item.id] = `[${item.symbol}], ${item.name}, MPK-${item.mpk}`;
                    });
                    setLaboratoriesData(labData);
                }

                if (prinResponse && prinResponse.data) {
                    const prinData: Record<number, string> = {};
                    prinResponse.data.forEach((item: any) => {
                        prinData[item.id] = `[${item.label}], ${item.name}`;
                    });
                    setPrincipalsData(prinData);


                }
            } catch (error) {
                console.error("Błąd podczas pobierania słowników:", error);
            }
        };

        fetchDictionaries();
    }, []);

    const addCollectionItem = (selectedObj: CollectionItem) => {
        const notExist = collectionItems.every((item) => {
            return !Object.entries(item).some(([key, value]) => {
                if (typeof value === "object" && !Array.isArray(value)) {
                    if (value === selectedObj[key]) {
                        addAlert(
                            "warning",
                            `${(value as any).label} jest już dodane do kolekcji !`
                        );
                        return true;
                    }
                }
                return false;
            });
        });

        if (notExist) {
            setCollectionItems((prevItems) => [...prevItems, selectedObj]);
        }
    };

    const removeCollectionItem = (uuid: string) => {
        setCollectionItems((prevItems) =>
            prevItems.filter((item) => item.uuid !== uuid)
        );
    };

    const createCollectionObjToSave = () => {
        return {
            [field.name]: collectionItems.map((collItem) => {
                let resObj: any = {};
                Object.entries(collItem).forEach(([key, value]) => {
                    if (key !== 'uuid') {
                        if (Array.isArray(value)) {
                            resObj[key] = value.map((item: any) => item.value);
                        } else if (typeof value === "object" && value !== null) {
                            resObj[key] = value.value;
                        } else {
                            resObj[key] = value;
                        }
                    }
                });
                return resObj;
            }),
        };
    };

    const formatLabel = (label: string) => {
        const [symbolPart, ...rest] = label.split(",");
        return {
            symbol: symbolPart?.trim(),
            name: rest?.join(",").trim(),
        };
    };



    if (disabled) {
        return (
            <>
                <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                    <div className="overflow-hidden">
                        <table className="min-w-full text-left text-sm font-light">
                            <thead className="border-b font-medium dark:border-neutral-500">
                                <tr>
                                    <th scope="col" className="px-6 py-4">#</th>
                                    <th scope="col" className="px-6 py-4">Laboratorium</th>
                                    <th scope="col" className="px-6 py-4">Wszyscy zleceniodawcy</th>
                                    <th scope="col" className="px-6 py-4">Zleceniodawcy</th>
                                </tr>
                            </thead>
                            <tbody>
                                {field.value.map((item: any, index: number) => {
                                    const laboratoryId = item.find((f: any) => f.name === 'laboratory')?.value;
                                    const isAllChecked = item.find((f: any) => f.name === 'isAllChecked')?.value;
                                    let principals = item.find((f: any) => f.name === 'principals')?.value || [];



                                    // Twoja dalsza logika przetwarzania...
                                    if (!Array.isArray(principals) && principals && typeof principals === 'object') {
                                        if (principals.principals && Array.isArray(principals.principals)) {
                                            principals = principals.principals;
                                        } else {
                                            principals = [principals];
                                        }
                                    }

                                    const principalsDisplay = Array.isArray(principals)
                                        ? principals
                                            .map((p: any) => {
                                                if (p && typeof p === 'object' && 'principals' in p) {
                                                    p = p.principals;
                                                }
                                                const principalName = principalsData[p];
                                                return principalName !== undefined ? principalName : p;
                                            })
                                            .join(", ")
                                        : "Brak danych (nie tablica)";

                                    return (
                                        <tr key={index} className="border-b dark:border-neutral-500">
                                            <td className="whitespace-nowrap px-6 py-4 font-medium">{index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {laboratoriesData[laboratoryId] || `Laboratorium ID: ${laboratoryId}`}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {isAllChecked ? "Tak" : "Nie"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {principalsDisplay || "Brak danych"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>



                        </table>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {collectionItems.map((item) => (
                <div
                    key={item.uuid}
                    className={`block cursor-pointer my-2 w-full rounded-lg bg-white text-left shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-neutral-100 hover:bg-neutral-200`}
                >
                    <div className="p-3 text-[14px]">
                        <div className="flex flex-row">
                            {Object.entries(item).map(([key, value]) => {
                                if (key === 'uuid') return null;
                                if (Array.isArray(value)) {
                                    return (
                                        <div key={key} className="basis-5/12 p-2">
                                            {value.map((subItem: any, index: number) => (
                                                <span key={index} className="inline-block mr-2 whitespace-nowrap rounded-[0.27rem] bg-primary-100 px-[0.65em] pb-[0.25em] pt-[0.35em] text-center align-baseline text-[0.75em] font-bold leading-none text-primary-700">
                                                    {subItem.label}
                                                </span>
                                            ))}
                                        </div>
                                    );
                                }
                                if (typeof value === 'object' && value !== null && 'label' in value) {
                                    const { symbol, name } = formatLabel(value.label);

                                    return (
                                        <div key={key} className="basis-5/12 p-2">
                                            <div className="text-sm text-gray-800 font-medium">
                                                <span className="text-blue-700 font-bold">{symbol}</span> — {name}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                            <div className="basis-2/12 p-2">
                                <XCircleFill
                                    onClick={() => removeCollectionItem(item.uuid)}
                                    className={"float-right"}
                                    size={20}
                                    color={"red"}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            <GroupOfEntityFields
                template={field.template}
                addCollectionItem={addCollectionItem}
                flowSavedData={flowData}
            />

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
