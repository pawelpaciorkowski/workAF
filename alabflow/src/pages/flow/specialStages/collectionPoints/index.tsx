import { StageType } from "../../../../_types";
import { MatchFields } from "../../../../globalComponents/fields";
import React, { useCallback } from "react";

export function CollectionPointsSpecialStageComponent({ stage, collectFormData, flowData }: { stage: StageType, collectFormData: Function, flowData: any }) {
    const saveCollection = useCallback((collection: any) => {
        collectFormData(collection);
    }, [collectFormData]);


    return <>
        {stage.fields.map((field) => {
            return <MatchFields field={field} saveCollection={saveCollection} />
        }
        )}
    </>
}