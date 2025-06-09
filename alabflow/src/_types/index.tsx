import React from "react";

export type StageGroupType = {
  id: number;
  name: string;
  description: string;
  stageGroupName: string;
  stages: string[];
  nodeRef?: React.RefObject<any>;
};


export type StageType = {
  stageGroupId: number;
  isSubmitted: boolean;
  special: boolean | string[];
  stage: string;
  name: string;
  description: string;
  fields: StageFieldType[];
  nodeRef?: React.RefObject<any>;
};

type StageFieldAttributesType = {
  special: string;
  visible?: boolean | string;
  readonly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean | string;
  options?: Array<{ value: string; label: string }>;
  collectionType?: string;
  multiple?: boolean;
  defaultValue?: any;
};

export type StageFieldType = {
  disabled: boolean | undefined;
  id: string;
  key: string | number;
  placeholder?: string;
  settings?: StageFieldSettingsType;
  field_type:
  | "checkbox"
  | "collection"
  | "textarea"
  | "enum"
  | "time"
  | "text"
  | "email"
  | "date"
  | "number"
  | "integer"
  | "file"
  | "entity";
  name: string;
  label: string;
  type:
  | "checkbox"
  | "collection"
  | "textarea"
  | "enum"
  | "time"
  | "text"
  | "email"
  | "date"
  | "number"
  | "integer"
  | "file"
  | "entity";
  value: string | number | boolean | null;
  choices?: Array<{ value: string; label: string }>;
  multiple?: boolean;
  attr?: StageFieldAttributesType;
  template?: StageFieldType[];
  required?: boolean;
};

type StageFieldSettingsType = {
  max_length?: number;
  select_options?: Array<{ value: string | number; label: string }>;
};

export type AuthUser = {
  refreshToken: string;
  token: string;
  iat: number;
  exp: number;
  roles: Array<{ id: number; name: string }> | any[];
  username: string;
  departments?: Array<{ id: number; name: string }>;
};
