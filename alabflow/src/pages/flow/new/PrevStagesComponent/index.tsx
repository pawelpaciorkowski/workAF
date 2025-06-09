import React, { useState } from "react";

import { TransitionGroup, CSSTransition } from "react-transition-group";

import { groupStagesByGroupId } from "../../../../_utils";

import { MatchFields } from "../../../../globalComponents/fields";

/**

* Pomocnicza funkcja sprawdzająca, czy pole ma niepustą wartość.

* @param {any} field - Pole etapu.

* @returns {boolean} - True, jeśli pole zawiera faktyczną wartość.

*/

function hasValue(field: any): boolean {
  if (field.value === null || field.value === "") return false;

  if (typeof field.value === "object" && Object.keys(field.value).length === 0)
    return false;

  if (Array.isArray(field.value) && field.value.length === 0) return false;

  if (field.value?.value === null || field.value?.value === "") return false;

  return true;
}

/**

* Komponent wyświetlający poprzednie, wypełnione etapy procesu.

* Kliknięcie w nazwę grupy umożliwia podgląd jej zawartości.

*/

function PrevStagesComponent({
  stages,
  flowStageGroups,
  laboratoriesData,
  principalsData,
  userAnswers,
}: any) {
  const [hoveredStageGroup, setHoveredStageGroup] = useState<string>("");

  function getActualValue(field: any) {
    if (!userAnswers) return field.value;

    // Obsługa booleanów string/boolean

    if (typeof userAnswers[field.name] !== "undefined") {
      return userAnswers[field.name];
    }

    return field.value;
  }

  console.log("laboratoriesData:", laboratoriesData);

  console.log("principalsData:", principalsData);

  // Grupujemy etapy wg ID grupy (np. "Krok 1", "Krok 2" itd.)

  const groupedStages = groupStagesByGroupId(stages, flowStageGroups);

  const [expandedCollectionItems, setExpandedCollectionItems] = useState<
    Record<string, number | null>
  >({});

  return (
    <TransitionGroup component={null}>
      {groupedStages.map((previousStageGroup: any, index: number) => {
        // Filtrowanie etapów tak, by pokazywać tylko te, gdzie:

        // - przynajmniej jedno pole ma wartość LUB

        // - istnieje niepusty `summary`.

        const filledStages = previousStageGroup.stages.filter((stage: any) => {
          const hasFilledFields = stage.fields && stage.fields.some(hasValue);

          const hasSummary =
            typeof stage.summary === "string" && stage.summary.trim() !== "";

          return hasFilledFields || hasSummary;
        });

        if (filledStages.length === 0) return null; // Pomijamy puste grupy etapów

        return (
          <CSSTransition
            nodeRef={previousStageGroup.nodeRef}
            key={index}
            timeout={500}
            classNames="fade"
            style={{ transitionDelay: `${index * 10 + 100}ms` }}
          >
            <div
              ref={previousStageGroup.nodeRef}
              onClick={() =>
                setHoveredStageGroup(previousStageGroup.stageGroupName)
              }
              className="block mb-3 rounded bg-white text-neutral-700 p-6 shadow-md"
            >
              <span className="mb-2 text-sm font-medium leading-tight">
                {previousStageGroup.stageGroupName}
              </span>

              {/* Po kliknięciu w daną grupę wyświetlamy jej etapy (filledStages) */}

              {hoveredStageGroup === previousStageGroup.stageGroupName &&
                filledStages.map((stage: any) => (
                  <div key={stage.stage} className="mt-2">
                    <div className="mb-2 text-sm font-medium text-gray-500">
                      Etap {stage.stage} —{" "}
                      {typeof stage.name === "object" && stage.name.label
                        ? stage.name.label
                        : String(stage.name)}
                    </div>

                    {stage.summary ? (
                      <div className="bg-gray-100 p-2 rounded mt-1">
                        {React.isValidElement(stage.summary)
                          ? stage.summary
                          : typeof stage.summary === "string"
                            ? stage.summary
                            : JSON.stringify(stage.summary, null, 2)}
                      </div>
                    ) : (
                      // Jeżeli nie ma summary, wyświetlamy niepuste pola

                      <>
                        {stage.fields

                          .filter((field: any) => {
                            const actualValue = getActualValue(field);

                            return hasValue({ ...field, value: actualValue });
                          })

                          .map((field: any) => {
                            const actualValue = getActualValue(field);

                            // KOLEKCJE – Twój kod, zostaje bez zmian!

                            if (field.type === "collection") {
                              return (
                                <div
                                  key={field.name}
                                  className="bg-gray-100 p-2 rounded mt-2"
                                >
                                  <div className="text-sm font-semibold text-gray-700">
                                    {field.label}
                                  </div>

                                  <div className="text-sm text-gray-600">
                                    {Array.isArray(field.value) &&
                                      field.value.length > 0 ? (
                                      field.value.map(
                                        (item: any, idx: number) => {
                                          const isExpanded =
                                            expandedCollectionItems[
                                            field.name
                                            ] === idx;

                                          return (
                                            <div
                                              key={idx}
                                              className="border-t mt-2 pt-2"
                                            >
                                              <div
                                                className="cursor-pointer text-sm font-semibold text-gray-700 hover:underline"
                                                onClick={(e) => {
                                                  e.stopPropagation();

                                                  setExpandedCollectionItems(
                                                    (prev) => ({
                                                      ...prev,

                                                      [field.name]: isExpanded
                                                        ? null
                                                        : idx,
                                                    })
                                                  );
                                                }}
                                              >
                                                {isExpanded ? "▼" : "►"}{" "}
                                                {field.placeholder?.replace(
                                                  /y$/,
                                                  ""
                                                ) || "Element"}{" "}
                                                {idx + 1}
                                              </div>

                                              {isExpanded && (
                                                <ul className="text-sm text-gray-800 list-disc pl-4 mt-1">
                                                  {Object.entries(item).map(
                                                    ([key, val]: [
                                                      string,
                                                      any
                                                    ]) => {
                                                      // Obsługa laboratory

                                                      if (
                                                        key === "laboratory"
                                                      ) {
                                                        let labId =
                                                          typeof val ===
                                                            "object" &&
                                                            val !== null &&
                                                            "id" in val
                                                            ? val.id
                                                            : val;

                                                        let labName =
                                                          laboratoriesData[
                                                          labId
                                                          ] ||
                                                          (val?.name ?? labId);

                                                        return (
                                                          <li key={key}>
                                                            <strong>
                                                              Laboratorium:
                                                            </strong>{" "}
                                                            {labName}
                                                          </li>
                                                        );
                                                      }

                                                      // Obsługa principals (lista)

                                                      if (
                                                        key === "principals"
                                                      ) {
                                                        let displayPrincipals =
                                                          Array.isArray(val)
                                                            ? val
                                                              .map((p: any) =>
                                                                typeof p ===
                                                                  "object"
                                                                  ? principalsData[
                                                                  p.id
                                                                  ] ||
                                                                  p.name ||
                                                                  p.id
                                                                  : principalsData[
                                                                  p
                                                                  ] || p
                                                              )
                                                              .join(", ")
                                                            : typeof val ===
                                                              "object"
                                                              ? principalsData[
                                                              val.id
                                                              ] ||
                                                              val.name ||
                                                              val.id
                                                              : principalsData[
                                                              val
                                                              ] || val;

                                                        return (
                                                          <li key={key}>
                                                            <strong>
                                                              Zleceniodawcy:
                                                            </strong>{" "}
                                                            {displayPrincipals}
                                                          </li>
                                                        );
                                                      }

                                                      if (
                                                        key ===
                                                        "principalResortCodes" &&
                                                        Array.isArray(
                                                          val?.value
                                                        )
                                                      ) {
                                                        return (
                                                          <li key={key}>
                                                            <strong>
                                                              {val.label ||
                                                                "Kody resortowe"}
                                                              :
                                                            </strong>

                                                            <ul className="pl-4 list-disc">
                                                              {val.value.map(
                                                                (
                                                                  resort: any,
                                                                  idx: number
                                                                ) => (
                                                                  <li key={idx}>
                                                                    {resort.resortCodePart?.replace(
                                                                      "part_",
                                                                      "Część "
                                                                    )}
                                                                    :{" "}
                                                                    {
                                                                      resort.resortCode
                                                                    }
                                                                  </li>
                                                                )
                                                              )}
                                                            </ul>
                                                          </li>
                                                        );
                                                      }

                                                      // SPECJALNA OBSŁUGA TAK/NIE w kolekcji

                                                      if (
                                                        typeof val ===
                                                        "boolean" ||
                                                        val === "true" ||
                                                        val === "false"
                                                      ) {
                                                        return (
                                                          <li key={key}>
                                                            <strong>
                                                              {key}:
                                                            </strong>{" "}
                                                            {val === true ||
                                                              val === "true"
                                                              ? "Tak"
                                                              : val === false ||
                                                                val === "false"
                                                                ? "Nie"
                                                                : "Brak danych"}
                                                          </li>
                                                        );
                                                      }

                                                      // POLA SŁOWNIKOWE w kolekcji

                                                      if (
                                                        typeof val ===
                                                        "object" &&
                                                        val !== null
                                                      ) {
                                                        return (
                                                          <li key={key}>
                                                            <strong>
                                                              {val.label ||
                                                                val.name ||
                                                                key}
                                                              :
                                                            </strong>{" "}
                                                            {val.value
                                                              ? Array.isArray(
                                                                val.value
                                                              )
                                                                ? val.value
                                                                  .map(
                                                                    (
                                                                      v: any
                                                                    ) =>
                                                                      typeof v ===
                                                                        "object" &&
                                                                        v !==
                                                                        null &&
                                                                        (v.label ||
                                                                          v.name)
                                                                        ? v.label ||
                                                                        v.name
                                                                        : JSON.stringify(
                                                                          v
                                                                        )
                                                                  )
                                                                  .join(", ")
                                                                : val.value
                                                                  .label ||
                                                                val.value
                                                                  .name ||
                                                                JSON.stringify(
                                                                  val.value
                                                                )
                                                              : val.label ||
                                                              val.name ||
                                                              JSON.stringify(
                                                                val
                                                              )}
                                                          </li>
                                                        );
                                                      }

                                                      return (
                                                        <li key={key}>
                                                          <strong>
                                                            {key}:
                                                          </strong>{" "}
                                                          {String(val)}
                                                        </li>
                                                      );
                                                    }
                                                  )}
                                                </ul>
                                              )}
                                            </div>
                                          );
                                        }
                                      )
                                    ) : (
                                      <div className="text-sm text-gray-600">
                                        Brak danych do wyświetlenia.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            }

                            // SPECJALNA OBSŁUGA TAK/NIE dla pojedynczego pola

                            if (
                              field.type === "yesno" ||
                              typeof actualValue === "boolean" ||
                              actualValue === "true" ||
                              actualValue === "false"
                            ) {
                              return (
                                <div key={field.name} className="mb-2">
                                  <strong>{field.label}:</strong>{" "}
                                  <span>
                                    {actualValue === true ||
                                      actualValue === "true"
                                      ? "Tak"
                                      : actualValue === false ||
                                        actualValue === "false"
                                        ? "Nie"
                                        : "Brak danych"}
                                  </span>
                                </div>
                              );
                            }

                            // POZOSTAŁE typy: obsługa słowników, multiselectów, stringów, liczb, itd.

                            return (
                              <div key={field.name} className="mb-2">
                                <strong>{field.label}:</strong>{" "}
                                <span>
                                  {Array.isArray(actualValue)
                                    ? actualValue

                                      .map((v) =>
                                        typeof v === "object" && v !== null
                                          ? v.label ||
                                          v.name ||
                                          JSON.stringify(v)
                                          : String(v)
                                      )

                                      .join(", ")
                                    : typeof actualValue === "object" &&
                                      actualValue !== null
                                      ? actualValue.label ||
                                      actualValue.name ||
                                      JSON.stringify(actualValue)
                                      : String(actualValue)}
                                </span>
                              </div>
                            );
                          })}
                      </>
                    )}
                  </div>
                ))}
            </div>
          </CSSTransition>
        );
      })}
    </TransitionGroup>
  );
}

export default PrevStagesComponent;
