import {
    Input,
    initTWE,
} from "tw-elements";
import React, { useEffect, useState } from "react";
import DatePicker from "react-date-picker";
import { formatDateToDdMmYyyy } from "../../../_utils";

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function DateField({ field, disabled, changeEvent }: any) {
    const [value, onChange] = useState<Value>(field.value ? new Date(field.value) : new Date());

    useEffect(() => {
        initTWE({ Input });
    }, []);

    useEffect(() => {
        if (value && changeEvent) {
            const formattedDate = formatDateToDdMmYyyy(value as Date);
            changeEvent({
                [field.name]: formattedDate
            });
        }
    }, [field.name, value, changeEvent]);



    const handleDateChange = (newValue: Value) => {
        onChange(newValue);
    };

    return (
        <div className={'pt-2 pb-2'}>
            <label
                className="text-[14px] inline-block text-neutral-700"
            >{field.label}</label><br />
            <DatePicker
                disabled={disabled}
                className={'w-full'}
                name={field.name}
                onChange={handleDateChange}
                value={value}
            />
        </div>
    );
}