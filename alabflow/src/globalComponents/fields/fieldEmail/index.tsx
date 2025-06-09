import {
    Input,
    initTWE,
} from "tw-elements";
import {useEffect} from "react";
import {DefaultFieldProps} from "../_fieldTypes";

export default function EmailField({ field, disabled, changeEvent, customValue }: any) {

    useEffect(() => {
        initTWE({ Input }, {allowReinits: true});
    })

    if (disabled) {
        return (
            <>
                <label
                    htmlFor={`email-${field.name}`}
                    className="text-[14px] inline-block text-neutral-700"
                >{field.label}
                </label>
                <div className="relative mb-3" data-twe-input-wrapper-init>
                    <input
                        type="email"
                        className="peer block min-h-[auto] w-full rounded border-0 bg-[#e9ecef] px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0"
                        id={`email-${field.name}`}
                        readOnly={true}
                        placeholder={field.attr.placeholder}/>
                </div>
            </>
        )
    }
    if (changeEvent){
        return (
            <>
                <label
                    htmlFor={`email-${field.name}`}
                    className="text-[14px] inline-block text-neutral-700"
                >{field.label}
                </label>
                <div className="relative mb-3" data-twe-input-wrapper-init>
                    {customValue
                        ?
                        <input
                            type="email"
                            onChange={(e) => changeEvent({[e.target.name]: e.target.value})}
                            name={field.name}
                            value={customValue.value}
                            className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0"
                            id={`email-${field.name}`}
                            placeholder={field.attr.placeholder}/>
                        :
                        <input
                            type="email"
                            onChange={(e) => changeEvent({[e.target.name]: e.target.value})}
                            name={field.name}
                            defaultValue={field.value}
                            className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0"
                            id={`email-${field.name}`}
                            placeholder={field.attr.placeholder}/>
                    }
                </div>
            </>
        )
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
                        placeholder={field.attr.placeholder}/>
                </div>
            </div>
        )
    }
}