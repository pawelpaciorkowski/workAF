import React, { CSSProperties, useEffect, useState } from "react";
import { useFlowApi } from "../../../../_hooks/flowAPI";
import { AxiosResponse } from "axios";
import Select from "react-select";

const SelectComponent = ({ _field, setFormData, formData, disabled, flowSavedData, parentField }: any) => {
    const { flowAPI } = useFlowApi();
    const [options, setOptions] = useState<any>()
    const [savedValues, setSavedValues] = useState<any[]>([])

    const handleSetCollectionData = (data: any) => {
        setFormData((prevFormData: any) => ({
            ...prevFormData,
            [_field.name]: data
        }));
    }

    useEffect(() => {
        if (disabled) {
            let savedValuesArr: any[] = []
            parentField.value.forEach((item: any[]) => {
                if (item.length > 0) {
                    savedValuesArr.push({ label: item[0].value, value: item[0].value })
                }
            })
            setSavedValues(savedValuesArr)
        }
    }, [disabled])

    interface GroupedOption {
        readonly label: string;
        readonly options: readonly any[];
    }

    const groupStyles = {
        display: 'flex',
        fontSize: 18,
        alignItems: 'center',
        justifyContent: 'space-between',
    };

    const groupBadgeStyles: CSSProperties = {
        backgroundColor: '#EBECF0',
        borderRadius: '2em',
        color: '#172B4D',
        display: 'inline-block',
        fontSize: 12,
        fontWeight: 'normal',
        lineHeight: '1',
        minWidth: 1,
        padding: '0.16666666666667em 0.5em',
        textAlign: 'center',
    };

    const formatGroupLabel = (data: GroupedOption) => (
        <div style={groupStyles}>
            <span>{data.label}</span>
            <span style={groupBadgeStyles}>{data.options.length}</span>
        </div>
    );

    const getSubmittedData = (stage: any, key: any) => {
        const existStage = flowSavedData.flow.find((item: any) => item.stage === stage)
        const existField = existStage.fields.find((item: any) => item.name === key)
        return existField.value.map((valueArr: any[]) =>
            Object.fromEntries(valueArr.map((item) => [item.name, item.value]))
        );
    }

    useEffect(() => {
        const getDictionary = (labIds: any) => {
            return flowAPI.getLaboratoriesWithCollectionPointsLimited(labIds).then((r: AxiosResponse) => {
                if (r.statusText === 'OK') {
                    return r.data.map((item: any) => {
                        return {
                            label: `[${item.symbol}] ${item.name} ${item.mpk}`,
                            options: item.collectionPoints.map((_item: any) => {
                                return {
                                    label: `[${_item.marcel}] ${_item.name}`,
                                    value: _item.id
                                }
                            })
                        }
                    })
                }
            })
        }

        const getEntityOptions = () => {
            const objToFind = {
                laboratoryId: getSubmittedData('5_1', 'laboratories').map((item: any) => item.laboratory)
            }
            getDictionary(objToFind).then((r: any) => setOptions(r))
        }
        getEntityOptions()
    }, [])

    return <div className="mb-2 mt-2">
        <label
            className="text-[14px] inline-block text-neutral-700">
            {disabled
                ? <>Wybrane punkty pobrań</>
                : <>Wybierz punkty pobrań</>
            }
        </label>
        <Select
            formatGroupLabel={formatGroupLabel} isDisabled={disabled} value={disabled ? savedValues : formData[_field.name]} isClearable={true} isMulti={true} onChange={(data) => handleSetCollectionData(data)} options={options} />
    </div>
}


export default function CollectionPointsCollectionField({ field, disabled, saveCollection }: any) {
    const [formData, setFormData] = useState<any>({})
    const { flowData } = useFlowApi()

    const createCollectionObjToSave = () => {
        if (Object.keys(formData).length === 0) return formData
        const [key, value]: any = Object.entries(formData)[0]
        return {
            isAllChecked: false,
            collectionPoints: value.map((item: any) => {
                return {
                    [key]: item.value
                }
            })
        }
    };

    return (<>
        {field.template.map((_field: any) => {
            return <SelectComponent key={_field.name} disabled={disabled} formData={formData} setFormData={setFormData} flowSavedData={flowData} _field={_field} parentField={field} />
        })}
        {!disabled && <button
            onClick={() => saveCollection(createCollectionObjToSave())}
            type="button"
            className="inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
            data-twe-ripple-init
            data-twe-ripple-color="light">
            Dalej
        </button>}
    </>
    )
}


