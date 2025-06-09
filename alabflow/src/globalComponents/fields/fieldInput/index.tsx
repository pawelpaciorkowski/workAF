import { Input, initTWE } from "tw-elements";
import React, { useEffect } from "react";

export default function InputField({ disabled, key, field, changeEvent, required, customValue, placeholder }: any) {
    useEffect(() => {
        initTWE({ Input }, { allowReinits: true });
    }, []);

    if (disabled) {
        return (
            <div>
                <label
                    htmlFor={`input-${field.name}`}
                    className="text-[14px] inline-block text-neutral-700">
                    {field.label}
                </label>
                <div key={key ? key : field.name} className="relative mb-3" data-twe-input-wrapper-init>
                    <input
                        key={key ? key : field.name}
                        type="text"
                        name={field.name}
                        value={customValue ? customValue.value : (field.attr?.defaultValue || field.value)}
                        className="peer block min-h-[auto] w-full rounded border-0 bg-[#e9ecef] px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0"
                        id={`input-${field.name}`}
                        readOnly={true}
                        placeholder={placeholder} // Zmienione tutaj
                    />
                </div>
            </div>
        );
    }
    if (changeEvent) {
        return (
            <div>
                <label
                    htmlFor={`input-${field.name}`}
                    className="text-[14px] inline-block text-neutral-700">
                    {field.label}
                </label>
                <div className="relative mb-3" data-twe-input-wrapper-init>
                    {customValue
                        ? <input
                            type="text"
                            key={key ? key : field.name}
                            onChange={(e) => changeEvent({ [e.target.name]: e.target.value })}
                            name={field.name}
                            value={customValue ? customValue.value : (field.attr?.defaultValue || field.value)}
                            className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0"
                            id={`input-${field.name}`}
                            placeholder={placeholder}
                        />
                        : <input
                            type="text"
                            key={key ? key : field.name}
                            onChange={(e) => changeEvent({ [e.target.name]: e.target.value })}
                            name={field.name}
                            defaultValue={field.value}
                            className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0"
                            id={`input-${field.name}`}
                            placeholder={placeholder}
                        />
                    }
                </div>
            </div>
        );
    } else {
        return (
            <div>
                <label
                    htmlFor={`input-${field.name}`}
                    className="text-[14px] inline-block text-neutral-700">
                    {field.label}
                </label>
                <div className="relative mb-3" data-twe-input-wrapper-init>
                    <input
                        type="text"
                        name={field.name}
                        defaultValue={field.value}
                        className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0"
                        id={`input-${field.name}`}
                        placeholder={placeholder}
                    />
                </div>
            </div>
        );
    }
}