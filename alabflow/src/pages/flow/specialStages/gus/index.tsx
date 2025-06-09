import { StageType } from "../../../../_types";
import { useCallback, useEffect, useState } from "react";
import { useFlowApi } from "../../../../_hooks/flowAPI";
import { initTWE, Input, Ripple } from "tw-elements";
import { MatchFields } from "../../../../globalComponents/fields";
import { AxiosError, AxiosResponse } from "axios";
import GlobalModal from '../../../../globalComponents/globalModal';
import { error } from 'console';

type GusDataType = {
    apartmentNumber: string
    city: string,
    community: string,
    district: string,
    name: string,
    nip: string,
    propertyNumber: string,
    province: string,
    regon: string,
    street: string,
    type: string,
    zipCode: string
    phone: string
    email: string
}

type GusFormType = {
    gusCity: string
    gusEmail: string
    gusFlatNumber: string
    gusHouseNumber: string
    gusNIP: string
    gusName: string
    gusPhone: string
    gusPostalCode: string
    gusREGON: string
    gusStreet: string
    [key: string]: string
}

export function GusStageComponent({
    stage,
    collectFormData,
    errors,
    setValidationError,
}: {
    stage: StageType,
    collectFormData: Function,
    errors: string[],
    setValidationError: React.Dispatch<React.SetStateAction<string[]>>,
}) {
    const [formData, setFormData] = useState<GusFormType>({} as GusFormType);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', content: '' });
    const { flowAPI } = useFlowApi();

    const handleChange = (formFieldData: any) => {
        const updatedFormData: any = { ...formData };
        const [key, value]: any = Object.entries(formFieldData)[0];
        updatedFormData[key] = value;
        setFormData(updatedFormData);
    };

    const completeFormByGusData = (gusData: GusDataType) => {
        if (gusData) {
            const updatedFormData: any = { ...formData };
            updatedFormData.gusCity = gusData.city;
            updatedFormData.gusFlatNumber = gusData.apartmentNumber;
            updatedFormData.gusHouseNumber = gusData.propertyNumber;
            updatedFormData.gusNIP = gusData.nip;
            updatedFormData.gusName = gusData.name;
            updatedFormData.gusPostalCode = gusData.zipCode;
            updatedFormData.gusREGON = gusData.regon;
            updatedFormData.gusStreet = gusData.street;
            updatedFormData.gusPhone = gusData.phone;
            updatedFormData.gusEmail = gusData.email;
            setFormData(updatedFormData);
        }
    };

    const handleCollectFormData = useCallback(() => {
        const requiredFields = [
            "gusName",
            "gusREGON",
            "gusCity",
            "gusPostalCode",
            "gusStreet",
            "medicalRepresentativePostalCode",
        ];

        const missingFields = requiredFields.filter(name => !formData[name]);
        if (missingFields.length > 0) {
            const missingLabels = missingFields.map(name => {
                const field = stage.fields.find(f => f.name === name);
                return field?.label ?? name;
            });
            setValidationError(missingLabels);
            return;
        }

        setValidationError([]);
        collectFormData(formData);
    }, [formData, collectFormData, setValidationError, stage.fields]);

    useEffect(() => {
        initTWE({ Input, Ripple }, { allowReinits: true });
    });

    function searchGus() {
        flowAPI.getClientInfoFromGusByNip(formData.gusNIP)
            .then((r: AxiosResponse) => {
                if (r.statusText === 'OK' && r.data && r.data.length > 0) {
                    completeFormByGusData(r.data[0]);
                } else {
                    setModalContent({
                        title: 'Brak wyników',
                        content: 'Nie znaleziono żadnych danych dla podanego numeru NIP w bazie GUS.'
                    });
                    setIsModalOpen(true);
                }
            })
            .catch((error: AxiosError) => {
                setModalContent({
                    title: 'Błąd wyszukiwania',
                    content: 'Wystąpił problem podczas wyszukiwania w bazie GUS. Sprawdź poprawność wprowadzonych danych i spróbuj ponownie.'
                });
                setIsModalOpen(true);
            });
    }

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    return (
        <>
            {formData && stage.fields.map((field) => {
                if (field.name === 'gusNIP') {
                    return (
                        <div key={field.name} className="relative mb-1 flex flex-wrap items-stretch">
                            <input
                                type="text"
                                name={field.name}
                                value={formData[field.name]}
                                onChange={(e) => handleChange({ [e.target.name]: e.target.value })}
                                className="relative m-0 -mr-0.5 block w-[1px] min-w-0 flex-auto rounded-l border border-solid border-neutral-900 bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-[3] focus:border-primary focus:text-neutral-700 focus:shadow-[inset_0_0_0_1px_rgb(59,113,202)] focus:outline-none"
                                placeholder={field.label}
                                aria-label={field.label}
                                aria-describedby={`button-${field.name}`}
                            />
                            <button
                                className="disabled:opacity-70 z-[2] inline-block rounded-r bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:z-[3] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
                                data-twe-ripple-init
                                data-twe-ripple-color="light"
                                type="button"
                                onClick={() => searchGus()}
                                id={`button-${field.name}`}
                            >
                                Szukaj w bazie GUS
                            </button>
                        </div>
                    );
                }

                return (
                    <MatchFields
                        key={field.name}
                        field={field}
                        changeEvent={handleChange}
                        value={{ value: formData[field.name] }}
                        error={errors.includes(field.label) ? `Pole "${field.label}" jest wymagane.` : undefined}
                    />
                );
            })}

            <GlobalModal
                isOpen={isModalOpen}
                title={modalContent.title}
                content={modalContent.content}
                onConfirm={closeModal}
                buttonType="ok"
            />

            <button
                onClick={handleCollectFormData}
                type="submit"
                className="inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
                data-twe-ripple-init
                data-twe-ripple-color="light"
            >
                Dalej
            </button>
        </>
    );
}

