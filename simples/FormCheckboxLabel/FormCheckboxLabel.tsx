import React, { FC } from 'react'
import style from './FormCheckboxLabel.module.scss'
import classNames from 'classnames'
import { FormCheckbox } from '../FormCheckbox'
import { Control } from 'react-hook-form'

type Props = {
    name: string
    control: Control
    defaultValue?: boolean
    label?: string
}

const FormCheckboxLabel: FC<Props> = ({
    name,
    control,
    defaultValue,
    label,
}) => {
    return (
        <div className={style.checkBoxContainer}>
            <FormCheckbox
                control={control}
                name={name}
                defaultValue={defaultValue}
            />
            {label && <div className={style.checkBoxLabel}>{label}</div>}
        </div>
    )
}
export default FormCheckboxLabel
