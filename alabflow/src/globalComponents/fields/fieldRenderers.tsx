// fieldRenderers.tsx

import YesNoField from "./fieldYesNo";
import InputField from "./fieldInput";
import EmailField from "./fieldEmail";
import SelectField from "./fieldSelect";
import CollectionField from "./fieldCollection";
import TimeField from "./fieldTime";
import DateField from "./fieldDate";
import TextAreaField from "./fieldTextArea";
import NumberField from "./fieldNumber";
import FileCollectionField from "./fieldCollection/file";
import FileGenerator from "./fieldCollection/file/fileGenerator";

// Mapowanie typów pól na komponenty
export const FIELD_RENDERERS: Record<string, React.ComponentType<any>> = {
  checkbox: YesNoField,
  text: InputField,
  email: EmailField,
  enum: SelectField,
  collection: CollectionField,
  time: TimeField,
  date: DateField,
  textarea: TextAreaField,
  number: NumberField,
  integer: NumberField,
  entity: SelectField,
  file: FileCollectionField,
  // file: FileGenerator,
};

// Domyślny komponent dla nieobsługiwanych typów
export const DefaultFieldComponent = () => <div>Nieobsługiwany typ pola</div>;
