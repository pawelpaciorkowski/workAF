import React, { useEffect } from "react";
import { initTWE, Select } from "tw-elements";

function YesNoField({ field, customValue, disabled, changeEvent }: any) {
  useEffect(() => {
    // Inicjalizacja stylów `tw-elements`
    initTWE({ Select }, { allowReinits: true });
  }, []);

  const handleValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value === "true";
    changeEvent && changeEvent({ [field.name]: newValue });
  };

  return (
    <div key={field.name} className="py-4">
      <label
        htmlFor={`yesno-${field.name}`}
        className="text-[14px] inline-block text-neutral-700"
      >
        {field.label}
      </label>
      <select
        data-twe-select-init
        data-twe-class-select-label="pointer-events-none absolute font-semibold top-0 left-4 mb-0 max-w-[90%] origin-[0_0] truncate text-neutral-700 transition-all duration-200 ease-out peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none data-[te-input-state-active]:scale-[0.8]"
        data-twe-class-select-input="peer block text-neutral-600 min-h-[auto] w-full rounded border-0 bg-transparent outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0 cursor-pointer data-[te-input-disabled]:bg-[#e9ecef] data-[te-input-disabled]:cursor-default group-data-[te-was-validated]/validation:mb-4"
        name={field.name}
        id={`yesno-${field.name}`}
        value={customValue === true ? "true" : "false"} // Obsługa customValue
        onChange={handleValueChange}
        disabled={disabled}
      >
        <option value="true">Tak</option>
        <option value="false">Nie</option>
      </select>
    </div>
  );
}

export default YesNoField;
