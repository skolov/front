import React, { FC } from 'react'
import { Controller, Control, ValidationRules } from 'react-hook-form'
import { DataSelector, Props as DataSelectorProps } from '../DataSelector'

type Props = DataSelectorProps & {
    name: string
    defaultValue?: unknown
    control: Control
    rules?: ValidationRules
}

/**
 * Текстовое поля для использования в формах с валидацией.
 * @param defaultValue - начальное значение
 * @param name - имя поля
 * @param {Control} control - Контроллер, получаемый из библиотеки react-hook-form.
 * @param {ValidationRules} rules - Правила валидации
 * @param rest
 * @constructor
 */
const FormDataSelector: FC<Props> = ({
    defaultValue,
    name,
    control,
    rules,
    ...rest
}) => {
    // TextField оборачивается Controller из react-hook-form
    return (
        <Controller
            name={name}
            control={control}
            defaultValue={defaultValue}
            rules={rules}
            render={(props) => <DataSelector {...rest} {...props} />}
        />
    )
}

export default FormDataSelector
