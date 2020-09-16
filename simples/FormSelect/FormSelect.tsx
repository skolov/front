import React, { FC } from 'react'
import { Controller, Control, ValidationRules } from 'react-hook-form'
import { Select, Props as SelectProps } from '../Select'

type Props = SelectProps & {
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
const FormSelect: FC<Props> = ({
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
            render={(props) => <Select {...rest} {...props} />}
        />
    )
}

export default FormSelect
