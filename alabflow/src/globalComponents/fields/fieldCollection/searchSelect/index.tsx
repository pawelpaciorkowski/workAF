import {Select, initTWE, Input, Ripple} from "tw-elements";
import React, {useEffect, useState} from "react";
import {XSquareFill} from "react-bootstrap-icons";
import {MeiliSearchApi} from "../../../../_services/meiliSearch";

function NewItemForm({setNewItems, newItems, template, setAddNewItemOpened}: any) {
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        initTWE({ Ripple, Input });
    })

    const handleFieldChange = (name: string, value: string) => {
        setFormData((prevData: any) => ({
            ...prevData,
            [name]: value
        }));
    };


    const handleSubmit = () => {
        for (const field of template) {
            if (formData[field.name] && formData[field.name] === null || !formData[field.name]) {
                alert('Wypełnij wszystkie pola aby dodać nowego zleceniodawcę')
                break
            }
        }
        setNewItems([...newItems, formData])
        setFormData({});
        setAddNewItemOpened(false)
    };

    return (
        //TODO - generate fields from collection template and save WITHOUT FORM
        <div
            className="block max-w-md rounded-lg bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] mt-2 mb-5">
            {template.map((field: any) => {
                return (
                    <div className="relative mb-6" data-twe-input-wrapper-init>
                        <input
                            type={field.type}
                            className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0"
                            id={`${field.name}Input`}
                            value={formData[field.name] || ''}
                            onChange={(event) => handleFieldChange(field.name, event.target.value)}
                            placeholder={field.label}/>
                        <label
                            htmlFor={`${field.name}Input`}
                            className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none"
                        >{field.label}
                        </label>
                    </div>
                )
            })}

            <button
                type="button"
                onClick={() => handleSubmit()}
                className="inline-block w-full rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
                data-twe-ripple-init
                data-twe-ripple-color="light">
                Dodaj
            </button>
        </div>
    )
}

export default function CollectionSearchSelectField({ field }: any) {
    const [searchData, setSearchData] = useState<any[]>([])
    const [selectedItems, setSelectedItems] = useState<any[]>([])
    const [newItems, setNewItems] = useState<any[]>([])
    const [addNewItemOpened, setAddNewItemOpened] = useState<boolean>(false)

    useEffect(() => {
        initTWE({ Input, Ripple });
    }, [])

    const selectItem = (item: any) => {
        const foundItem = selectedItems.find((existItem) => existItem.id === item.id)
        if (!foundItem) { setSelectedItems([...selectedItems, item]) } else { setSelectedItems(selectedItems.filter((existItem) => existItem.id !== item.id)) }
    }

    const searchMeili = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value
        if (query.length > 3) setSearchData([])
        if (query.length > 3) {
            const msApi = new MeiliSearchApi()
            msApi.search('podmioty', query, 'table=zleceniodawcy').then((res) => {
                setSearchData(res.hits)
            })
        }
    }

    if (field) { return (
        <div className={'mt-3'}>
            <div className="relative mb-3" data-twe-input-wrapper-init>
                <input onChange={(event) => searchMeili(event)}
                       type="text"
                       className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0"
                       id={`collectionSearch-${field.name}`}
                       placeholder={field.label}/>
                <label
                    htmlFor={`collectionSearch-${field.name}`}
                    className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none"
                >Szukaj w słowniku - {field.label}
                </label>
            </div>
            {searchData.length > 0 &&
                <>
                    <div
                        className="block w-full text-neutral-200 rounded-lg text-left shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] bg-neutral-700">
                        <div className="p-3">
                            <div className="flex flex-row">
                                <div className="basis-10/12 p-2">Wyniki wyszukiwania</div>
                                <div className="basis-2/12 p-2"><XSquareFill onClick={() => {
                                    setSearchData([])
                                    setSelectedItems([])}
                                } size={25} className="float-right cursor-pointer text-white hover:text-red-400"/></div>
                            </div>
                        </div>
                    </div>
                    {searchData.map((item) => {
                        return (
                            <div onClick={() => selectItem(item)}
                                 className={`block cursor-pointer my-2 w-full rounded-lg bg-white text-left shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] ${selectedItems.find((existItem) => existItem.id === item.id) ? 'bg-primary-500 border-primary-200 hover:bg-danger-200' : 'border-neutral-100 hover:bg-neutral-200'}`}>
                                <div className="p-3 text-[14px]">
                                    <div className="flex flex-row">
                                        <div className="basis-6/12 p-2">{item.nazwa}</div>
                                        <div className="basis-2/12 p-2">{item.symbole}</div>
                                        <div className="basis-4/12 p-2">{item.adres}</div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </>
            }
            {newItems && newItems.map((newItem) => {
                return (
                    <div
                        className={`block cursor-pointer my-2 w-full rounded-lg bg-white text-left shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]`}>
                        <div className="p-3 text-[14px]">
                            <div className="flex flex-row">
                                <div className="basis-6/12 p-2">{newItem.name}</div>
                                <div className="basis-2/12 p-2">{JSON.stringify(newItem)}</div>
                                <div className="basis-4/12 p-2">abc</div>
                            </div>
                        </div>
                    </div>
                )
            })}
            <button
                onClick={() => setAddNewItemOpened(true)}
                type="button"
                className="inline-block rounded bg-info mb-3 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
                data-twe-ripple-init
                data-twe-ripple-color="light">
                Dodaj nowego zleceniodawce
            </button>
            {addNewItemOpened && newItems && <NewItemForm template={field.template} newItems={newItems} setNewItems={setNewItems} setAddNewItemOpened={setAddNewItemOpened}/>}
        </div>
    ) } else {
        return <p>loading.....</p>
    }
}