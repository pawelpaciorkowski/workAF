import React, { useState } from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { groupStagesByGroupId } from "../../../../_utils";

function hasValue(field: any): boolean {
  if (field.value === null || field.value === "") return false;
  if (typeof field.value === "object" && field.value !== null && Object.keys(field.value).length === 0) return false;
  if (Array.isArray(field.value) && field.value.length === 0) return false;
  if (field.value?.value === null || field.value?.value === "") return false;
  return true;
}

function PrevStagesComponent({
  stages,
  flowStageGroups,
  laboratoriesData,
  principalsData,
}: any) {
  const [hoveredStageGroup, setHoveredStageGroup] = useState<string>("");
  const groupedStages = groupStagesByGroupId(stages, flowStageGroups);

  const renderDisplayValue = (value: any, dictionary?: Record<string, string>): string => {
    if (value === null || value === undefined) return "Brak danych";
    if (typeof value === 'boolean') return value ? "Tak" : "Nie";

    if (typeof value === 'string' && value.includes('T') && value.includes(':')) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
        }
      } catch (e) {
        return value;
      }
    }

    if (dictionary && (typeof value === 'string' || typeof value === 'number')) {
      return dictionary[value] || `ID: ${value}`;
    }
    if (typeof value === 'object' && value !== null && 'label' in value) {
      return value.label;
    }
    if (Array.isArray(value)) {
      return value.map(item => renderDisplayValue(item, dictionary)).join(', ');
    }
    return String(value);
  };

  return (
    <TransitionGroup component={null}>
      {groupedStages.map((previousStageGroup: any, index: number) => {
        const filledStages = previousStageGroup.stages.filter((stage: any) => {
          const hasFilledFields = stage.fields && stage.fields.some((f: any) => hasValue(f));
          const hasSummary = typeof stage.summary === "string" && stage.summary.trim() !== "";
          return hasFilledFields || hasSummary;
        });

        if (filledStages.length === 0) return null;

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
              onClick={() => setHoveredStageGroup(previousStageGroup.stageGroupName)}
              className="block mb-3 rounded bg-white text-neutral-700 p-6 shadow-md"
            >
              <span className="mb-2 text-sm font-medium leading-tight">{previousStageGroup.stageGroupName}</span>

              {hoveredStageGroup === previousStageGroup.stageGroupName &&
                filledStages.map((stage: any) => (
                  <div key={stage.stage} className="mt-2">
                    <div className="mb-2 text-sm font-medium text-gray-500">
                      Etap {stage.stage} — {String(stage.name?.label || stage.name)}
                    </div>

                    {stage.summary ? (
                      <div className="bg-gray-100 p-2 rounded mt-1">{stage.summary}</div>
                    ) : (
                      <>
                        {stage.fields
                          .filter((field: any) => hasValue(field))
                          .map((field: any) => {
                            if (field.type === "collection") {
                              const collectionValue = field.value;
                              if (!Array.isArray(collectionValue) || collectionValue.length === 0) {
                                return (<div key={field.name} className="mt-2"><strong>{field.label}:</strong> <span>Brak danych.</span></div>);
                              }

                              const template = field.template?.filter((t: any) => t.attr?.visible !== false) || [];
                              if (template.length === 0) return null;

                              const headers = template.map((tField: any) => tField.label);

                              return (
                                <div key={field.name} className="mt-4">
                                  <h4 className="text-md font-semibold text-gray-800 mb-2">{field.label}</h4>
                                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                                    <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          {headers.map((header: any) => (
                                            <th key={header} className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left">{header}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200">
                                        {collectionValue.map((item, rowIndex) => (
                                          <tr key={rowIndex} className="hover:bg-gray-50">
                                            {template.map((tField: any) => {
                                              const dataField = Array.isArray(item) ? item.find(d => d.name === tField.name) : null;
                                              const rawValue = dataField ? dataField.value : undefined; // Pobieramy jego wartość

                                              let displayValue;

                                              if (tField.name === 'laboratory') {
                                                displayValue = renderDisplayValue(rawValue, laboratoriesData);
                                              } else if (tField.name === 'principals') {
                                                displayValue = renderDisplayValue(rawValue, principalsData);
                                              } else if (tField.name === 'principalResortCodes' && Array.isArray(rawValue)) {
                                                displayValue = rawValue.map(r => `Część ${r.resortCodePart?.replace('part_', '')}: ${r.resortCode}`).join('; ');
                                              } else {
                                                displayValue = renderDisplayValue(rawValue);
                                              }

                                              return (
                                                <td key={`${rowIndex}-${tField.name}`} className="whitespace-nowrap px-4 py-2 text-gray-700">{displayValue}</td>
                                              );
                                            })}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div key={field.name} className="mb-2">
                                <strong>{field.label}:</strong> <span>{renderDisplayValue(field.value)}</span>
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