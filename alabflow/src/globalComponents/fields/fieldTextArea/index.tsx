import { Input, initTWE } from "tw-elements";
import { useEffect } from "react";

export default function TextAreaField({
  disabled,
  field,
  changeEvent = () => {},
}: any) {
  useEffect(() => {
    initTWE({ Input }, { allowReinits: true });
  });

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    changeEvent({ [name]: value });
  };

  return (
    <div>
      <label
        htmlFor={`textarea-${field.name}`}
        className="text-[14px] inline-block text-neutral-700"
      >
        {field.label}
      </label>
      <div className="relative mb-3" data-twe-input-wrapper-init>
        <textarea
          className={`peer block min-h-[auto] w-full rounded border-0 ${
            disabled ? "bg-gray-200" : "bg-transparent"
          } px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0`}
          id={`textarea-${field.name}`}
          name={field.name}
          readOnly={disabled}
          value={field.value}
          rows={3}
          placeholder={field.attr?.placeholder || ""}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
