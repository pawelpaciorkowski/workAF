import React, { useState, useRef, useEffect } from "react";
import { MatchFields } from "../../../../globalComponents/fields";
import { v4 as uuidv4 } from "uuid";
import CollectionPeriodsField from "../../../../globalComponents/fields/fieldCollection/periods";
import { X } from "react-bootstrap-icons";
import { parseNestedErrors, parseNestedErrorsByIndex, fieldCanBeVisible } from "../../../../_utils";


type AddressItem = Record<string, any>;

type CollectSamplesFromClientAddressesCollectionFieldProps = {
    field: any;
    disabled: boolean;
    saveCollection: (data: Record<string, any>) => void;
    setValidationError?: React.Dispatch<React.SetStateAction<string[]>>;
    nestedErrorsContext?: any[]

};

export default function CollectSamplesFromClientAddressesCollectionField({
    field,
    disabled,
    saveCollection,
    setValidationError,
    nestedErrorsContext = [],
}: CollectSamplesFromClientAddressesCollectionFieldProps) {
    const [collectionData, setCollectionData] = useState<Array<{ uuid: string; form: AddressItem }>>([]);
    const refsMap = useRef<Record<string, any>>({});

    const addAddress = () => {
        const newItem = { uuid: uuidv4(), form: {} };
        setCollectionData((prev) => [...prev, newItem]);
    };

    const removeAddress = (uuid: string) => {
        setCollectionData((prev) => prev.filter((item) => item.uuid !== uuid));
        delete refsMap.current[uuid];
    };

    const parsedErrors = parseNestedErrors(nestedErrorsContext);
    const parsedErrorsByIndex = parseNestedErrorsByIndex(nestedErrorsContext);



    const handleFieldChange = (uuid: string, formFieldData: AddressItem) => {
        setCollectionData((prev) =>
            prev.map((item) =>
                item.uuid === uuid ? { ...item, form: { ...item.form, ...formFieldData } } : item
            )
        );
    };

    const setSubcollectionRef = (
        uuid: string,
        fieldName: string,
        getPeriodsData: () => any
    ) => {
        if (!refsMap.current[uuid]) {
            refsMap.current[uuid] = {};
        }
        refsMap.current[uuid][fieldName] = getPeriodsData;
    };

    const handleSave = () => {
        const payload = collectionData.map((item) => {
            const result = { ...item.form };
            if (refsMap.current[item.uuid]) {
                Object.keys(refsMap.current[item.uuid]).forEach((fName) => {
                    const getPeriodsDataFn = refsMap.current[item.uuid][fName];
                    if (typeof getPeriodsDataFn === "function") {
                        result[fName] = getPeriodsDataFn();
                    }
                });
            }
            return result;
        });
        saveCollection({ [field.name]: payload });
    };

    useEffect(() => {
        if (disabled && collectionData.length > 0) {
            handleSave();
        }
    }, [disabled]);

    if (!field || !Array.isArray(field.template)) {
        return <p>Brak definicji template dla pola {field?.name || "nieznane pole"}.</p>;
    }

    if (disabled) {
        return renderSummary(field, collectionData, refsMap.current);
    }

    return (
        <div>
            {collectionData.map((item, idx) => (
                <div
                    key={item.uuid}
                    className="relative my-2 rounded-lg bg-white p-3 shadow-md border border-neutral-200"
                >
                    <button
                        onClick={() => removeAddress(item.uuid)}
                        className="absolute top-2 right-2  p-1 rounded-full bg-red-100 hover:bg-red-300 text-red-500 hover:text-red-700 transition"
                        aria-label="Usuń adres"
                    >
                        <X size={16} />
                    </button>

                    {field.template.map((templateField: any) => {

                        if (!fieldCanBeVisible(templateField, item.form)) {
                            return null;
                        }
                        if (
                            templateField.type === "collection" &&
                            templateField.attr?.collectionType
                        ) {
                            return (
                                <CollectionPeriodsField
                                    key={templateField.name}
                                    field={templateField}
                                    disabled={false}
                                    ref={(ref: { getPeriodsData: () => any }) => {
                                        if (ref?.getPeriodsData) {
                                            setSubcollectionRef(
                                                item.uuid,
                                                templateField.name,
                                                ref.getPeriodsData
                                            );
                                        }
                                    }}
                                />
                            );
                        }

                        return (
                            <MatchFields
                                key={templateField.name}
                                field={templateField}
                                value={{
                                    value: item.form[templateField.name]?.value,
                                }}
                                changeEvent={(data: Record<string, any>) =>
                                    handleFieldChange(item.uuid, data)
                                }
                                error={parsedErrorsByIndex[idx]?.[templateField.name]}

                            />


                        );
                    })}
                </div>
            ))}

            <button
                onClick={addAddress}
                type="button"
                className="mr-2 rounded bg-success px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white hover:bg-success-600"
            >
                Dodaj kolejny adres
            </button>

            <button
                onClick={handleSave}
                type="button"
                className="rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white hover:bg-primary-600"
            >
                Dalej
            </button>
        </div>
    );
}

/** 
 * Podsumowanie w trybie read-only – wspiera też dane z `collectionData` i `refsMap`, jeśli field.value puste.
 */
function renderSummary(field: any, collectionData: any[] = [], refsMap?: any) {
    let addresses: any[] = [];

    // 🧠 Naprawa: jeśli value jest stringiem (np. "[Array(15)]") – zignoruj
    if (Array.isArray(field.value)) {
        addresses = field.value;
    } else if (typeof field.value === "string") {
        try {
            const parsed = JSON.parse(field.value);
            if (Array.isArray(parsed)) {
                addresses = parsed;
            }
        } catch (e) {
        }
    }

    if (addresses.length === 0 && collectionData.length > 0) {
        addresses = collectionData.map((item) => {
            const base = { ...item.form };
            const refEntry = refsMap?.[item.uuid];
            if (refEntry) {
                for (const key in refEntry) {
                    const getter = refEntry[key];
                    if (typeof getter === "function") {
                        base[key] = getter();
                    }
                }
            }
            return base;
        });
    }

    if (addresses.length === 0) {
        return (
            <div className="text-sm text-gray-500">
                Brak zdefiniowanych adresów do odbioru próbek.
            </div>
        );
    }

    return (
        <div className="text-sm mt-2">
            <h4 className="font-bold mb-2">Dodatkowe adresy odbiorów próbek</h4>
            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm border">
                    <thead className="border-b bg-gray-50">
                        <tr>
                            <th className="px-3 py-2 font-medium">#</th>
                            <th className="px-3 py-2 font-medium">Rodzaj adresu</th>
                            <th className="px-3 py-2 font-medium">Ulica</th>
                            <th className="px-3 py-2 font-medium">Miejscowość</th>
                            <th className="px-3 py-2 font-medium">Kod pocztowy</th>
                            <th className="px-3 py-2 font-medium">Okresy</th>
                        </tr>
                    </thead>
                    <tbody>
                        {addresses.map((addr: any, idx: number) => (
                            <tr key={idx} className="border-b">
                                <td className="px-3 py-2">{idx + 1}</td>
                                <td className="px-3 py-2">{addr.collectSamplesFromClientAddressType}</td>
                                <td className="px-3 py-2">{addr.collectStreet}</td>
                                <td className="px-3 py-2">{addr.collectCity}</td>
                                <td className="px-3 py-2">{addr.collectPostalCode}</td>
                                <td className="px-3 py-2">{renderPeriodsSummary(addr)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}



function renderPeriodsSummary(addr: any) {
    const fieldsToRender = [
        "collectSamplesFromClientAddressCollectConstantPeriods",
        "collectSamplesFromClientAddressCollectOnCallPeriods",
        "collectSamplesFromClientAddressCollectCitoPeriods",
    ];

    return fieldsToRender
        .map((fieldKey) => {
            const periods = addr[fieldKey];
            if (!Array.isArray(periods) || periods.length === 0) return null;


            const transformedPeriods = periods.map((p: any) => [
                { name: "fromDayOfWeek", value: p.fromDayOfWeek },
                { name: "toDayOfWeek", value: p.toDayOfWeek },
                { name: "fromTime", value: p.fromTime },
                { name: "toTime", value: p.toTime },
            ]);

            return (
                <div key={fieldKey} className="mb-2">
                    <CollectionPeriodsField
                        disabled={true}
                        field={{
                            name: fieldKey,
                            label: formatPeriodLabel(fieldKey),
                            value: transformedPeriods,
                            template: [
                                { name: "fromDayOfWeek", type: "enum" },
                                { name: "toDayOfWeek", type: "enum" },
                                { name: "fromTime", type: "time" },
                                { name: "toTime", type: "time" },
                            ],
                        }}
                    />
                </div>
            );
        })
        .filter(Boolean);
}


function formatPeriodLabel(fieldKey: string): string {
    if (fieldKey.includes("Constant")) return "Stałe okresy";
    if (fieldKey.includes("OnCall")) return "Okresy na wezwanie";
    if (fieldKey.includes("Cito")) return "Okresy cito";
    return fieldKey;
}
