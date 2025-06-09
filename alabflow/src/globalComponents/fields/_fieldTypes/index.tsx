export type DefaultFieldProps = {
    field: any
    disabled?: boolean,
    value?: string,
    changeEvent?: any
}

// export type SelectFieldOptionsProps = {
//     [key]: string,
//     option: string
// }

export interface SelectFieldProps extends DefaultFieldProps {
    inputName?: string
    parentId?: number,
    customValue?: {value: string},
    multi?: boolean
    options?: any[] | null | undefined
    placeholder?: string
}