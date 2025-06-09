import React from "react";

// ===============================
// 📥 PARSOWANIE FORMULARZA
// ===============================


export function resetDependentFields(values: Record<string, any>, allFields: any[]) {
  allFields.forEach((field) => {
    const visible = fieldCanBeVisible(field, values);

    // Jeśli pole jest niewidoczne, usuń jego wartość
    if (!visible && values.hasOwnProperty(field.name)) {
      values[field.name] = null;
    }

    // Jeśli pole to checkbox z defaultValue: false — resetuj do false
    if (!visible && field.type === "checkbox" && field?.attr?.defaultValue === false) {
      values[field.name] = false;
    }
  });

  return values;
}


export function parseNestedErrors(nestedErrors: string[]): Record<string, string> {
  const errorMap: Record<string, string> = {};

  nestedErrors.forEach((err) => {
    // Szukamy np. collectOtherTypes w: collectSamplesFromClientAddresses[0].collectOtherTypes: To pole jest wymagane
    const match = err.match(/\.([^.]+):\s*(.*)$/);
    if (match) {
      const [, fieldName, message] = match;
      errorMap[fieldName] = message;
    }
  });

  return errorMap;
}

export function parseNestedErrorsByIndex(errors: string[]) {
  const result: Record<number, Record<string, string>> = {};

  errors.forEach((error) => {
    // Przykład: "collectSamplesFromClientAddresses[0].collectStreet: Ulica jest wymagana"
    const match = error.match(/collectSamplesFromClientAddresses\[(\d+)\]\.([^.]+):\s*(.*)/);
    if (match) {
      const index = Number(match[1]);
      const field = match[2];
      const message = match[3];

      if (!result[index]) result[index] = {};
      result[index][field] = message;
    }
  });

  return result;
}


export function getFormKeyAndValues(
  event: React.FormEvent<HTMLFormElement>,
  allFields: any[] = []
): Record<string, any> {
  const formData = new FormData(event.target as HTMLFormElement);
  const values: Record<string, any> = {};

  formData.forEach((value, key) => {
    if (key === "isSettlementAccept") {
      values[key] = value === "true";
    } else if (key.endsWith("[]")) {
      const cleanKey = key.replace("[]", "");
      values[cleanKey] = values[cleanKey] || [];
      values[cleanKey].push(parseValue(value));
    } else if (value instanceof File) {
      values[key] = {
        filename: value.name,
        content: value,
      };
    } else {
      values[key] = parseValue(value);
    }
  });

  // 🧹 Usuń standardowe fragmenty daty (jeśli są oddzielne)
  ["day", "month", "year"].forEach((field) => delete values[field]);

  // 🚫 Usuń pola niewidoczne – nie wysyłaj ich w ogóle
  allFields.forEach((field) => {
    if (!fieldCanBeVisible(field, values)) {
      delete values[field.name];
    }
  });

  // 🧼 Resetuj wartości pól zależnych jeśli są ukryte (np. rabaty, prowizje, itd.)
  resetDependentFields(values, allFields);

  return values;
}



// ===============================
// 🔄 PARSOWANIE WARTOŚCI
// ===============================

export function parseValue(value: FormDataEntryValue): any {
  if (typeof value === "string") {
    if (value === "true") return true;
    if (value === "false") return false;
    if (!isNaN(Number(value))) return Number(value);
    return value;
  }
  return value;
}

// ===============================
// 📆 FORMATOWANIE DAT
// ===============================

export function formatDateToDdMmYyyy(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

// ===============================
// 👁️ WIDOCZNOŚĆ I WARUNKI
// ===============================

export function sanitizeFormValues(
  values: Record<string, any> = {},
  allFields: any[] = []
): Record<string, any> {
  if (!values || typeof values !== "object") return {};

  const sanitized: Record<string, any> = {};


  allFields.forEach((field) => {
    let val = values[field.name];

    // Ustaw wartość domyślną jeśli undefined
    if (val === undefined && field?.attr?.defaultValue !== undefined) {
      val = field.attr.defaultValue;
      values[field.name] = val; // <-- ważne! nadpisujemy values[] dla zależności
    }

    const visible = fieldCanBeVisible(field, values);
    const required = fieldIsRequired(field, values);
    const isEmpty = val === "" || val === null || val === undefined;



    if (!visible && !required) return;

    if (field.type === "checkbox") {
      sanitized[field.name] = val === true;
      return;
    }

    if (val && typeof val === "object" && "value" in val) {
      sanitized[field.name] = val.value;
      return;
    }

    if (Array.isArray(val)) {
      if (visible && (required || val.length > 0)) {
        sanitized[field.name] = val;
      }
      return;
    }


    if (required || !isEmpty) {
      sanitized[field.name] = val;
    }
  });



  if (!sanitized.isAgreementDiscount) {
    delete sanitized.agreementDiscountDescription;
  }

  if (!sanitized.isAgreementProvision) {
    delete sanitized.agreementProvision;
  }

  if (!sanitized.isAgreementIndefinitePeriod) {
    delete sanitized.agreementToAt;
  }

  return sanitized;
}





export function fieldCanBeVisible(field: any, formData: Record<string, any>): boolean {
  //test
  // formData.groupOfPayers = "gotow";

  const visibleAttr = field?.attr?.visible;
  if (!visibleAttr) return true;

  try {
    const conditions = visibleAttr.split("&&").map((cond: string) => cond.trim());
    const result = conditions.every((cond: string) => checkCondition(cond, formData));



    return result;
  } catch (error) {
    return true;
  }
}


export function fieldIsRequired(field: any, formData: Record<string, any>): boolean {
  const visible = fieldCanBeVisible(field, formData);
  if (!visible) return false;

  const requiredAttr = field?.attr?.required;
  if (typeof requiredAttr === "string") {
    return checkCondition(requiredAttr, formData);
  }
  return !!requiredAttr;
}


export function checkCondition(condition: string, formData: any): boolean {
  // Obsługa wielu warunków logicznych (&&, ||)

  if (condition.includes("&&")) {
    return condition.split("&&").every((cond) => checkCondition(cond.trim(), formData));
  }

  if (condition.includes("||")) {
    return condition.split("||").some((cond) => checkCondition(cond.trim(), formData));
  }

  if (condition.includes("&&") || condition.includes("&")) {
    return condition.split(/&&|&/).every((cond) => checkCondition(cond.trim(), formData));
  }

  if (condition.includes("||") || condition.includes("|")) {
    return condition.split(/\|\||\|/).some((cond) => checkCondition(cond.trim(), formData));
  }


  let negation = false;
  if (condition.startsWith("!")) {
    negation = true;
    condition = condition.slice(1);
  }

  const [key, expectedRaw] = condition.split(":");
  const expectedValue = parseValue(expectedRaw);
  const rawActual = formData[key];

  const actualValue = typeof rawActual === "object" && rawActual !== null && "value" in rawActual
    ? rawActual.value
    : rawActual;

  let result = false;

  if (Array.isArray(actualValue)) {
    result = actualValue.includes(expectedValue);
  } else {
    result = actualValue === expectedValue;
  }



  return negation ? !result : result;
}


// ===============================
// 🧼 NARZĘDZIA POMOCNICZE
// ===============================

export function isObjectEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

// ===============================
// 📦 CACHE REQUESTÓW
// ===============================

export async function cacheRequest(
  key: string,
  apiCall: () => Promise<any>,
  cacheDuration: number = 5 * 60 * 1000,
  forceRefresh: boolean = false
): Promise<any> {
  const cachedData = sessionStorage.getItem(key);
  if (!forceRefresh && cachedData) {
    const data = JSON.parse(cachedData);
    if (data.ts >= Date.now() - cacheDuration) {
      return JSON.parse(data.context);
    }
  }
  const response = await apiCall();
  sessionStorage.setItem(
    key,
    JSON.stringify({
      ts: Date.now(),
      context: JSON.stringify(response),
    })
  );
  return response;
}

// ===============================
// 📧 WALIDACJA
// ===============================

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function isValidPassword(password: string): string | null {
  const minLength = 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  if (password.length < minLength) {
    return `Hasło musi mieć co najmniej ${minLength} znaków.`;
  }
  if (!hasUppercase) {
    return "Hasło musi zawierać co najmniej jedną dużą literę.";
  }
  if (!hasSpecialChar) {
    return "Hasło musi zawierać co najmniej jeden znak specjalny.";
  }
  return null;
}

// ===============================
// 🧱 GRUPOWANIE ETAPÓW
// ===============================

export const groupStagesByGroupId = (stages: any, flowStageGroups: any) => {
  const groupsArray = Array.isArray(flowStageGroups)
    ? flowStageGroups
    : Object.values(flowStageGroups);
  return Object.values(
    stages.reduce((groups: any, stage: any) => {
      const { stageGroupId } = stage;
      const stageGroupObj = groupsArray.find((group) => group.id === stageGroupId);
      if (!groups[stageGroupId]) {
        groups[stageGroupId] = {
          stageGroupName: stageGroupObj?.name,
          stages: [],
          nodeRef: null,
        };
      }
      groups[stageGroupId].stages.push(stage);
      return groups;
    }, {})
  );
};

export const groupFieldsByAttribute = (
  fields: any[],
  formData: any
): Record<string, any> => {
  return fields.reduce((grouped: any, field: any) => {
    const group = field?.attr?.group || "default";
    if (!grouped[group]) {
      grouped[group] = { fields: [] };
    }
    if (field.attr?.visible !== false) {
      grouped[group].fields.push(field);
    }
    return grouped;
  }, {});
};

// ===============================
// ➕➖ KOLEKCJE (ADD/REMOVE)
// ===============================

export function canAddItem(field: any): boolean {
  return field?.attr?.allow_add !== false;
}

export function canDeleteItem(field: any): boolean {
  return field?.attr?.allow_delete !== false;
}