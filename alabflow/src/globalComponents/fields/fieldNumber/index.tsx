import { Input, initTWE } from "tw-elements";
import { useEffect } from "react";
import { DefaultFieldProps } from "../_fieldTypes";

export default function NumberField({ disabled, changeEvent, field }: any) {
  useEffect(() => {
    initTWE({ Input }, { allowReinits: true });
  });

  if (disabled) {
    return (
      <div>
        <label
          htmlFor={`number-${field.name}`}
          className="text-[14px] inline-block text-neutral-700"
        >
          {field.label}
        </label>
        <div className="relative mb-3" data-twe-input-wrapper-init>
          <input
            type="number"
            className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0"
            id={`number-${field.name}`}
            name={field.name}
            value={field.value}
            readOnly={true}
            placeholder={field.attr.placeholder}
            required={field.attr.required}
          />
        </div>
      </div>
    );
  }
  return (
    <div>
      <label
        htmlFor={`number-${field.name}`}
        className="text-[14px] inline-block text-neutral-700"
      >
        {field.label}
      </label>
      <div className="relative mb-3" data-twe-input-wrapper-init>
        <input
          type="number"
          onChange={(e) => changeEvent({ [e.target.name]: e.target.value })}
          className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0"
          id={`number-${field.name}`}
          name={field.name}
          defaultValue={field.value}
          placeholder={field.attr.placeholder}
          required={field.attr.required}
        />
      </div>
    </div>
  );
}
