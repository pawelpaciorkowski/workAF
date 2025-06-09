import { useEffect, useState } from "react";

export function useFinalStageModal(flowData: any, activeStage: any) {
    const [isFinalStageModalOpen, setIsFinalStageModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<JSX.Element | null>(null);

    useEffect(() => {
        if (!flowData?.flowStatuses || !activeStage?.stage) return;

        const departmentFromStatus = flowData.flowStatuses.find((status: any) =>
            status.stageHierarchy?.includes(activeStage.stage)
        )?.department;

        const departmentId = departmentFromStatus?.id;
        if (!departmentId) return;

        const matchedStatuses = flowData.flowStatuses.filter((status: any) => {
            const inDept = status.department?.id === departmentId;
            const inHierarchy = status.stageHierarchy?.includes(activeStage.stage);
            const isApproved = status.flowStatus?.name?.toLowerCase() === "zatwierdzony";
            return inDept && inHierarchy && isApproved;
        });

        if (matchedStatuses.length > 0) {
            const allStatusesFilled = flowData?.flowStatuses?.every(
                (status: any) =>
                    status.flowStatus?.name?.toLowerCase() === "zatwierdzony" &&
                    status.flowStatus?.isEditable === false
            );

            const nextStatuses = flowData?.flowStatuses?.filter(
                (status: any) =>
                    status.flowStatus?.name?.toLowerCase() === "nowy" &&
                    status.currentStage
            );

            const nextDepartmentNames: string[] = Array.from(
                new Set(nextStatuses.map((s: any) => s.department?.name).filter(Boolean))
            );

            setModalContent(
                allStatusesFilled ? (
                    <>Dziękujemy! Twój wniosek został całkowicie wypełniony.</>
                ) : (
                    <>
                        Twój wniosek został wypełniony. Przekazano go do działu:
                        <ul className="list-disc list-inside text-blue-600 font-semibold mt-2">
                            {nextDepartmentNames.length > 0 ? (
                                nextDepartmentNames.map((name, idx) => <li key={idx}>{name}</li>)
                            ) : (
                                <li>Nieznany dział</li>
                            )}
                        </ul>
                    </>
                )
            );
            setIsFinalStageModalOpen(true);
        }
    }, [flowData, activeStage]);

    return { isFinalStageModalOpen, setIsFinalStageModalOpen, modalContent };
}
