import React, { CSSProperties, useEffect, useState } from 'react';
import Select from 'react-select'
import { useFlowApi } from "../../../../../_hooks/flowAPI";
import { AxiosResponse } from "axios";
import InputField from "../../../../../globalComponents/fields/fieldInput";

function CreateZleceniodawcaComponent({ healthDivision }: any) {
    const handleChangeInput = (fieldValue: string) => {
    };

    const fieldObj = {
        name: "testabc",
        value: "valueabc",
        label: "LabelTestField",
    };

    return (
        <>
            <InputField field={fieldObj} changeEvent={handleChangeInput} />
        </>
    );
}

export function RpwdlTestComponent() {
    const { flowAPI } = useFlowApi();
    const [groupedHealthDivisions, setGroupedHealthDivisions] =
        useState<any>();

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

    useEffect(() => {
        flowAPI
            .getClientInfoFromRPWDLByNip("5212932455")
            .then((r: AxiosResponse) => {
                if (r.statusText === "OK") {
                    let groupedHealthUnits: any = [];
                    for (const hd of r.data.healthDivision) {
                        const healthUnitExist = groupedHealthUnits.find(
                            (item: any) => item.id === hd.healthUnitId
                        );
                        if (healthUnitExist) {
                            healthUnitExist.options.push({ ...hd, label: `[${hd.id}] ${hd.city} ${hd.street} ${hd.houseNumber} ${hd.phone} ${hd.email}`, value: hd.id });
                        } else {
                            groupedHealthUnits.push({
                                label: r.data.healthUnit.find(
                                    (item: any) => item.id === hd.healthUnitId
                                ).name,
                                id: hd.healthUnitId,
                                options: [{ ...hd, label: `[${hd.id}] ${hd.city} ${hd.street} ${hd.houseNumber} ${hd.phone} ${hd.email}`, value: hd.id }],
                            });
                        }
                    }
                    setGroupedHealthDivisions(groupedHealthUnits);
                    // TODO: get healthUnits and group with healthDivisions
                }
            });
    }, [flowAPI]);

    const groupStyles = {
        display: 'flex',
        fontSize: 16,
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

    const formatGroupLabel = (data: GroupedHealthUnit) => (
        <div style={groupStyles}>
            <span>{data.label}</span>
            <span style={groupBadgeStyles}>{data.options.length}</span>
        </div>
    );

    return (
        <div>
            <Select
                options={groupedHealthDivisions}
                formatGroupLabel={formatGroupLabel}
            />
            <CreateZleceniodawcaComponent healthDivision={"healthDivision"} />
            TEST
        </div>
    );
}
