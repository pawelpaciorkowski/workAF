import React, {
  useEffect,
  useImperativeHandle,
  useState,
  forwardRef,
} from "react";
import SelectField from "../../fieldSelect";
import TimeField from "../../fieldTime";

type PeriodsType = {
  fromDayOfWeek: string;
  toDayOfWeek: string;
  fromTime: string;
  toTime: string;
};

const translateDays = (day: string): string => {
  const daysMap: { [key: string]: string } = {
    monday: "Poniedziałek",
    tuesday: "Wtorek",
    wednesday: "Środa",
    thursday: "Czwartek",
    friday: "Piątek",
    saturday: "Sobota",
    sunday: "Niedziela",
  };
  return daysMap[day] || "Nieznany dzień";
};

const CollectionPeriodsField = forwardRef(
  ({ field, saveCollection, disabled }: any, ref) => {
    const [formData, setFormData] = useState<PeriodsType>({
      fromDayOfWeek: "monday",
      fromTime: "00:00",
      toDayOfWeek: "monday",
      toTime: "00:00",
    });

    const [periodsSubmitted, setPeriodsSubmitted] = useState<PeriodsType[]>([]);

    useEffect(() => {
      if (field?.value && field.value.length > 0) {
        setPeriodsSubmitted(field.value);
      }
    }, [field?.value]);

    // Obsługa ref i udostępnienie danych przez `getPeriodsData`
    useImperativeHandle(ref, () => ({
      getPeriodsData: () => periodsSubmitted,
    }));

    const handleChange = (selectData: any) => {
      if (selectData.target) {
        const { name, value } = selectData.target;
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: value,
        }));
      } else {
        Object.entries(selectData).forEach(([key, value]: [string, any]) => {
          setFormData((prevFormData) => ({
            ...prevFormData,
            [key]: value.value || value,
          }));
        });
      }
    };

    const addPeriod = () => {
      if (
        formData.fromDayOfWeek &&
        formData.toDayOfWeek &&
        formData.fromTime &&
        formData.toTime
      ) {
        const newPeriod = {
          fromDayOfWeek: formData.fromDayOfWeek,
          toDayOfWeek: formData.toDayOfWeek,
          fromTime: formData.fromTime,
          toTime: formData.toTime,
        };

        const updatedPeriods = [...periodsSubmitted, newPeriod];
        setPeriodsSubmitted(updatedPeriods);

        setFormData({
          fromDayOfWeek: "monday",
          fromTime: "00:00",
          toDayOfWeek: "monday",
          toTime: "00:00",
        });
      }
    };

    const removePeriod = (index: number) => {
      const updatedPeriods = periodsSubmitted.filter((_, i) => i !== index);
      setPeriodsSubmitted(updatedPeriods);
    };

    if (disabled) {
      return <SummaryTable field={{ ...field, value: periodsSubmitted }} />;
    }

    if (!field) return <p>Ładowanie...</p>;

    return (
      <>
        <div className={"mb-1"}>{field.label}</div>
        {periodsSubmitted.length > 0 &&
          periodsSubmitted.map((period, index) => (
            <div
              key={index}
              className="block cursor-pointer my-2 w-full rounded-lg bg-white text-left shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-neutral-100 "
            >
              <div className="p-3 text-[14px] relative">
                <button
                  onClick={() => removePeriod(index)}
                  className="absolute top-3 right-1 p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors duration-200 focus:outline-none "
                  aria-label="Usuń okres"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="flex flex-row items-center">
                  <div className="basis-3/12 p-2">
                    <b>Dzień od: </b>
                    <span className="inline-block whitespace-nowrap rounded-full bg-info-100 px-[0.65em] pb-[0.25em] pt-[0.35em] text-center align-baseline text-[0.75em] font-bold leading-none text-info-800">
                      {translateDays(period.fromDayOfWeek)}
                    </span>
                  </div>
                  <div className="basis-3/12 p-2">
                    <b>Dzień do: </b>
                    <span className="inline-block whitespace-nowrap rounded-full bg-info-100 px-[0.65em] pb-[0.25em] pt-[0.35em] text-center align-baseline text-[0.75em] font-bold leading-none text-info-800">
                      {translateDays(period.toDayOfWeek)}
                    </span>
                  </div>
                  <div className="basis-3/12 p-2">
                    <b>Czas od: </b>
                    <span className="inline-block whitespace-nowrap rounded-full bg-info-100 px-[0.65em] pb-[0.25em] pt-[0.35em] text-center align-baseline text-[0.75em] font-bold leading-none text-info-800">
                      {period.fromTime}
                    </span>
                  </div>
                  <div className="basis-3/12 p-2">
                    <b>Czas do: </b>
                    <span className="inline-block whitespace-nowrap rounded-full bg-info-100 px-[0.65em] pb-[0.25em] pt-[0.35em] text-center align-baseline text-[0.75em] font-bold leading-none text-info-800">
                      {period.toTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

        <div className="flex mb-3 flex-row border-primary border rounded">
          {field?.template?.map((_field: any) => (
            <div className="basis-1/4 p-2" key={_field.name}>
              {_field.type === "enum" ? (
                <SelectField
                  field={_field}
                  changeEvent={handleChange}
                  inputName={_field.name}
                />
              ) : (
                <TimeField field={_field} changeEvent={handleChange} />
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addPeriod}
          type="button"
          className="inline-block rounded bg-success mr-2 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#14a44d] transition duration-150 ease-in-out hover:bg-success-600 hover:shadow-[0_8px_9px_-4px_rgba(20,164,77,0.3),0_4px_18px_0_rgba(20,164,77,0.2)] focus:bg-success-600 focus:shadow-[0_8px_9px_-4px_rgba(20,164,77,0.3),0_4px_18px_0_rgba(20,164,77,0.2)] focus:outline-none focus:ring-0 active:bg-success-700 active:shadow-[0_8px_9px_-4px_rgba(20,164,77,0.3),0_4px_18px_0_rgba(20,164,77,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(20,164,77,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(20,164,77,0.2),0_4px_18px_0_rgba(20,164,77,0.1)]"
        >
          Dodaj okres
        </button>
      </>
    );
  }
);

const SummaryTable = ({ field }: any) => {
  const periods = field.value || field.periods || [];

  const extractTime = (timeString: string) => {
    // Użyj substring do wyciągnięcia tylko godzin i minut
    return timeString.substring(11, 16); // Zwróci np. '01:00'
  };

  const extractValue = (period: any, fieldName: string) => {
    const field = period.find((item: any) => item.name === fieldName);
    if (fieldName === "fromTime" || fieldName === "toTime") {
      return field ? extractTime(field.value) : "Brak danych"; // Wyciągnij tylko godzinę
    }
    return field ? field.value : "Brak danych";
  };

  if (periods.length === 0) {
    return (
      <div
        className="mb-4 rounded-lg bg-warning-100 px-6 py-5 text-base text-warning-800"
        role="alert"
      >
        Pole <b>periods</b> nie zostało wypełnione
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="overflow-hidden">
            <table className="min-w-full text-left text-sm font-light">
              <thead className="border-b font-medium dark:border-neutral-500">
                <tr>
                  <th scope="col" className="px-6 py-4">
                    #
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Dzień od
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Dzień do
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Czas od
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Czas do
                  </th>
                </tr>
              </thead>

              <tbody>
                {periods.map((period: any, index: number) => (
                  <tr key={index} className="border-b dark:border-neutral-500">
                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                      {index + 1}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {translateDays(
                        extractValue(period, "fromDayOfWeek").value
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {translateDays(extractValue(period, "toDayOfWeek").value)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {extractValue(period, "fromTime")}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {extractValue(period, "toTime")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionPeriodsField;
