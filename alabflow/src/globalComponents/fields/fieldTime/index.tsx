import { Input, initTWE, Timepicker } from "tw-elements";
import React, { useEffect, useState } from "react";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";

export default function TimeField({ field, changeEvent }: any) {
  const [fieldValue, setFieldValue] = useState("00:00");
  const [alert, setAlert] = useState("");

  useEffect(() => {
    initTWE({ Input }, { allowReinits: true });
  }, []);

  useEffect(() => {
    changeEvent({ [field.name]: { value: fieldValue } });
  }, [fieldValue]);

  return (
    <>
      <label
        htmlFor={`input-${field.name}`}
        className="text-[14px] inline-block text-neutral-700"
      >
        {field.label}
      </label>
      <DefaultTimePicker value={fieldValue} setValue={setFieldValue} />
      {alert && <span className={"text-danger text-xs"}>{alert}</span>}
    </>
  );
}

const DefaultTimePicker = ({ value, setValue }: any) => {
  return <TimePicker onChange={setValue} value={value} />;
};
