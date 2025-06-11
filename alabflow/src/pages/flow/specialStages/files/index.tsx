import React, { useCallback, useEffect, useState } from "react";
import { StageType } from "../../../../_types";
import { fieldCanBeVisible } from "../../../../_utils";
import { MatchFields } from "../../../../globalComponents/fields";

type FilesSpecialStageComponentProps = {
  stage: StageType;
  globalFormData: Record<string, any>;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>, payload: Record<string, any>) => void;
  onFormChange: (data: Record<string, any>) => void; // <-- Używamy onFormChange
  errors?: string[];
  setValidationError: React.Dispatch<React.SetStateAction<string[]>>;
};

export function FilesSpecialStageComponent({
  stage,
  globalFormData,
  handleSubmit,
  onFormChange,
  errors = [],
  setValidationError
}: FilesSpecialStageComponentProps) {
  const handleChange = useCallback((data: Record<string, any>) => {
    onFormChange(data);
    setValidationError((prev) => prev.filter((err) => !Object.keys(data).includes(err)));
  }, [onFormChange, setValidationError]);

  const saveCollection = useCallback((key: string, collection: any[]) => {
    onFormChange({ [key]: collection });
  }, [onFormChange]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: Record<string, any> = {};
    stage.fields.forEach((field: any) => {
      if (fieldCanBeVisible(field, globalFormData)) {
        const value = globalFormData[field.name];
        payload[field.name] = (value && typeof value === 'object' && value.hasOwnProperty('value'))
          ? value.value
          : value;
      }
    });

    handleSubmit(event, payload);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {stage.fields.map((field: any) => {
        const isVisible = fieldCanBeVisible(field, globalFormData);

        return isVisible ? (
          <div key={field.name} className="mb-4">
            <MatchFields
              field={field}
              value={globalFormData[field.name]}
              changeEvent={handleChange}
              saveCollection={saveCollection}
              error={errors.includes(field.label) ? "To pole jest wymagane" : undefined}
              placeholder={field.label}
            />
          </div>
        ) : null;
      })}
      <div className="text-right pt-4">
        <button
          type="submit"
          className="inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-md"
        >
          Dalej
        </button>
      </div>
    </form>
  );
}