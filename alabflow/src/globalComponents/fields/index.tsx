import { FIELD_RENDERERS, DefaultFieldComponent } from "./fieldRenderers";
import { FIELD_PROPS } from "./fieldProps";
import { StageFieldType } from "../../_types";
import { error } from "console";

type MatchFieldsProps = {
  field: StageFieldType;
  fieldKey?: string;
  disabled?: boolean;
  changeEvent?: any;
  required?: boolean;
  readOnly?: boolean;
  value?: { value: string | boolean | number };
  placeholder?: string;
  saveCollection?: any;
  flowSavedData?: any;
  customValue?: any;
  error?: string;
};

export const MatchFields = ({
  field,
  fieldKey,
  disabled,
  changeEvent,
  required,
  readOnly,
  value,
  saveCollection,
  flowSavedData,
  placeholder,
  error,
}: MatchFieldsProps) => {
  if (field.attr?.visible === false) {
    return null;
  }

  const FieldComponent = FIELD_RENDERERS[field.type] || DefaultFieldComponent;

  const isDisabled = disabled ?? field.disabled ?? field.attr?.disabled ?? false;
  const isReadOnly =
    field.name === "isAgreementCash"
      ? true
      : readOnly ?? field.attr?.readonly ?? false;

  return (
    <FieldComponent
      {...FIELD_PROPS(field, value, placeholder, required)}
      fieldKey={fieldKey || field.name}
      disabled={isDisabled}
      readOnly={isReadOnly}
      changeEvent={changeEvent}
      saveCollection={saveCollection}
      flowSavedData={flowSavedData}
    />
  );
};
