// fieldProps.tsx

import { StageFieldType } from "../../_types";

// Generuje dynamiczne właściwości na podstawie typu pola
export const FIELD_PROPS = (
  field: StageFieldType,
  value?: any,
  placeholder?: string,
  required?: boolean
) => {
  const baseProps: Record<string, any> = {
    field,
    customValue: value,
    placeholder: placeholder || field.label,
    required: required || field.attr?.required,
  };

  // Specyficzne właściwości dla typów `entity` lub `enum`
  if (field.type === "entity" || field.type === "enum") {
    baseProps.multi = field.attr?.multiple || field.type === "entity";
  }

  // Specyficzne właściwości dla `collection`
  if (field.type === "collection") {
    baseProps.saveCollection = true;
    baseProps.collectionType = field.attr?.collectionType || "default";
    baseProps.template = field.template || [];

    if (field.attr?.collectionType === "file") {
      baseProps.special = field.attr?.special || null;
      baseProps.fileFields = field.template || [];
    }
  }


  return baseProps;
};
