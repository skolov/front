import React, { FC } from 'react'
import { Controller, Control } from 'react-hook-form'
import { Checkbox } from '../Checkbox'

type Props = {
    name: string
    control: Control
    defaultValue?: boolean
}

const FormCheckbox: FC<Props> = ({ name, control, defaultValue }) => {
    return (
        <Controller
            name={name}
            control={control}
            defaultValue={defaultValue}
            render={(props) => {
                return (
                    <Checkbox checked={props.value} onChange={props.onChange} />
                )
            }}
        />
    )
}
export default FormCheckbox
