import { StageType } from "../../../../_types";
import { fieldCanBeVisible } from "../../../../_utils";
import { MatchFields } from "../../../../globalComponents/fields";
import { useCallback, useEffect, useState } from "react";


type FilesSpecialStageComponentProps = {
  stage: StageType;
  collectFormData: (data: Record<string, any>) => void;
  globalFormData: Record<string, any>;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>, payload: Record<string, any>) => void;
  errors?: string[];
  setValidationError: React.Dispatch<React.SetStateAction<string[]>>;
};



export function FilesSpecialStageComponent({
  stage,
  collectFormData,
  globalFormData,
  handleSubmit,
  errors = [],
  setValidationError
}: FilesSpecialStageComponentProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Loguj wszystkie fields i aktualny formData po każdej zmianie


  useEffect(() => {
    const initial = stage.fields.reduce((acc: Record<string, any>, field: any) => {
      if (field.type === "date") {
        acc[field.name] = globalFormData[field.name]
          ?? field.value
          ?? field.attr?.defaultValue
          ?? (new Date()).toISOString().slice(0, 10);
      } else {
        acc[field.name] = globalFormData[field.name]
          ?? field.value
          ?? field.attr?.defaultValue
          ?? "";
      }
      return acc;
    }, {});
    setFormData(initial);
  }, [stage.fields, globalFormData]);

  const handleChange = useCallback((data: Record<string, any>) => {
    setFormData((prev) => ({
      ...prev,
      ...Object.entries(data).reduce((acc: Record<string, any>, [key, value]) => {
        acc[key] = typeof value === "object" ? value?.value ?? value : value;
        return acc;
      }, {}),
    }));

    setValidationError?.((prev: string[]) =>
      prev.filter((err) => !Object.keys(data).includes(err))
    );
  }, [setValidationError]);

  const saveCollection = useCallback((key: string, collection: any[]) => {
    setFormData((prev) => ({
      ...prev,
      [key]: collection,
    }));
  }, []);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const filtered = stage.fields.reduce((acc: Record<string, any>, field) => {
      const isVisible = fieldCanBeVisible(field, formData);
      if (!isVisible) return acc;
      acc[field.name] = formData[field.name];
      return acc;
    }, {});


    collectFormData(filtered);
    handleSubmit(event, filtered);
  };

  return (
    <form onSubmit={onSubmit}>
      {stage.fields.map((field) => {
        const isVisible = fieldCanBeVisible(field, formData);
        const parsedAttr = typeof field.attr === "string" ? JSON.parse(field.attr) : field.attr;

        // LOGUJ każdy MatchFields, szczególnie dla pól file!
        if (field.type === "file") {

        }

        return isVisible ? (
          <div key={field.name} className="mb-4">
            <MatchFields
              field={{ ...field, attr: parsedAttr }}
              value={formData[field.name]}
              changeEvent={handleChange}
              saveCollection={saveCollection}
              error={errors.includes(field.label) ? "To pole jest wymagane" : undefined}
            />
            {typeof parsedAttr?.help === "string" && parsedAttr.help.trim() !== "" && (
              <p className="text-xs text-gray-500 mt-1">{parsedAttr.help}</p>
            )}
          </div>
        ) : null;
      })}

      <div className="text-right pt-4">
        <button
          type="submit"
          className="inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-md transition duration-150 ease-in-out"
        >
          Dalej
        </button>
      </div>
    </form>
  );
}


