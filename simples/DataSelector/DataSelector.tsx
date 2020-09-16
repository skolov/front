import React, { FC, useState, useCallback, useEffect, ChangeEvent } from 'react'
import styles from './DataSelector.module.scss'
import { useTranslation } from '../../hooks/useTranslation'
import { i18n as i18nType } from 'i18next'
import classNames from 'classnames'
import Select from '../Select/Select'
import TextField from '../TextField/TextField'

// Коректный вывод даты в виде строки.
const printDataComponent = (value: number | null): string => {
    if (value === null) {
        return ''
    }

    let intValue = Number(value) + 1

    return intValue < 10 ? `0${intValue}` : intValue + ''
}

// Набор опций для селектора с выбором месяца
const monthOptions = [
    { value: 0, labelTrans: 'january_genitive' },
    { value: 1, labelTrans: 'february_genitive' },
    { value: 2, labelTrans: 'march_genitive' },
    { value: 3, labelTrans: 'april_genitive' },
    { value: 4, labelTrans: 'may_genitive' },
    { value: 5, labelTrans: 'june_genitive' },
    { value: 6, labelTrans: 'jule_genitive' },
    { value: 7, labelTrans: 'august_genitive' },
    { value: 8, labelTrans: 'september_genitive' },
    { value: 9, labelTrans: 'october_genitive' },
    { value: 10, labelTrans: 'november_genitive' },
    { value: 11, labelTrans: 'december_genitive' },
]

export type Props = {
    onChange?: (value: string) => void
    label?: string
    value?: string | null
    error?: boolean
    helperText?: string
    disabled?: boolean
    i18n?: i18nType
}

/**
 * Компонент выбора даты
 *
 * @param onChange (optional) - Callback для обновления значения
 * @param {string} (optional) label - Строка, расположенная под блоком выбора даты
 * @param {string | null} (optional) value - Текущее значение даты
 * @param {string} (optional) helperText - Текст подсказка, отображаемая в случае ошибки
 * @param {boolean} (optional) error - Флаг ошибки
 * @param {boolean} (optional) disabled - Флаг для блокировки поля выбора дат
 * @constructor
 *
 **/
const DataSelector: FC<Props> = ({
    onChange,
    label,
    value,
    helperText,
    error = false,
    disabled,
    i18n: i18nOverride,
}) => {
    // Подключение функции перевода
    const { t, i18n } = useTranslation({ i18n: i18nOverride })

    // Массив с количеством дней в месяцах.
    const days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    const classes = classNames(styles.dataSelector, {})
    const [dayValue, setDayValue] = useState<number | null>(null)
    const [monthValue, setMonthValue] = useState<number | null>(null)
    const [yearValue, setYearValue] = useState<string>('')
    const [daysInMonth, setDaysInMonth] = useState(31)

    // Метод получение количества дней в выбранном месяце
    const getDayMaxValueInMonth = useCallback(
        (value: number) => {
            if (value !== null) {
                if (Number(yearValue) % 4 === 0 && value === 1) {
                    return 29
                } else {
                    return days_in_month[value]
                }
            } else {
                return 31
            }
        },
        [days_in_month, yearValue]
    )

    // Метод отрисовки дней в селекторы выбора дней
    const days = (): Array<{ value: number; label: string }> => {
        let days: Array<{ value: number; label: string }> = []
        for (let index = 0; index < daysInMonth; index++) {
            days.push({ value: index, label: (index + 1).toString() })
        }
        return days
    }

    // Обработчик на клик по селектору в момент выбора дня или месяцы
    const onHandleSelect = useCallback(
        (val: string | number, name?: string) => {
            let newDay = dayValue
            let newMonth = monthValue
            let newYear = yearValue

            if (name === 'day') {
                newDay = Number(val)
            }

            if (name === 'month') {
                newMonth = Number(val)

                if (newDay) {
                    let dayMaxValue: number = getDayMaxValueInMonth(newMonth)

                    if (newDay > dayMaxValue) {
                        newDay = dayMaxValue
                    }
                    setDaysInMonth(dayMaxValue + 1)
                }
            }

            const newDate = `${printDataComponent(newDay)}.${printDataComponent(
                newMonth
            )}.${newYear}`
            if (onChange) {
                onChange(newDate)
            }
        },
        [dayValue, monthValue, yearValue, getDayMaxValueInMonth, onChange]
    )

    // Обработчик на ввод года в текстовое поле
    const onHandleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            let newDay = dayValue
            let newMonth = monthValue
            let newYear = event.target.value

            if (newYear.length > 4) {
                newYear = newYear.slice(0, 4)
            }

            if (newDay !== null && newMonth !== null) {
                let dayMaxValue = getDayMaxValueInMonth(newMonth)

                if (newDay > dayMaxValue) {
                    newDay = dayMaxValue
                }
                setDaysInMonth(dayMaxValue + 1)
            }
            if (/^\d{0,4}$/.test(newYear)) {
                const newDate = `${printDataComponent(
                    newDay
                )}.${printDataComponent(newMonth)}.${newYear}`

                if (onChange) {
                    onChange(newDate)
                }
            }
        },
        [dayValue, getDayMaxValueInMonth, monthValue, onChange]
    )

    // Метод обновления состояния (даты) компонента.
    useEffect(() => {
        let dayValue: number | null = null,
            monthValue: number | null = null,
            yearValue: string = '',
            daysInMonth: number = 31

        if (value) {
            let dateArray = value.split('.')

            if (dateArray[0]) {
                dayValue = parseInt(dateArray[0]) - 1
            }
            if (dateArray[1]) {
                monthValue = parseInt(dateArray[1]) - 1
                daysInMonth = getDayMaxValueInMonth(monthValue)
            }
            if (dateArray[2]) {
                yearValue = dateArray[2]
            }
        }

        setDayValue(dayValue)
        setMonthValue(monthValue)
        setYearValue(yearValue)
        setDaysInMonth(daysInMonth)
    }, [getDayMaxValueInMonth, value])

    // Вывод компонента
    return (
        <div className={classes}>
            <div className={styles.fieldset}>
                <div className={styles.days}>
                    <Select
                        options={days()}
                        name="day"
                        onChange={onHandleSelect}
                        value={dayValue}
                        label={t('data_selector_day')}
                        error={error}
                        i18n={i18n}
                        classes={{
                            arrow: styles.arrowsMargin,
                            label: styles.smallLabel,
                            textInside: styles.dayText,
                        }}
                        disabled={disabled}
                    />
                </div>
                <div className={styles.mounth}>
                    <Select
                        options={monthOptions}
                        name="month"
                        onChange={onHandleSelect}
                        value={monthValue}
                        label={t('data_selector_month')}
                        error={error}
                        i18n={i18n}
                        classes={{
                            arrow: styles.arrowsMargin,
                            textInside: styles.monthText,
                        }}
                        disabled={disabled}
                    />
                </div>
                <div className={styles.years}>
                    <TextField
                        label={t('data_selector_year')}
                        onChange={onHandleChange}
                        name="year"
                        error={error}
                        value={yearValue}
                        classes={{
                            root: styles.input,
                        }}
                        disabled={disabled}
                    />
                </div>
            </div>
            {(helperText || label) &&
                (error ? (
                    <p className={styles.helperText}>{helperText}</p>
                ) : (
                    <p className={styles.labelBottom}>{label}</p>
                ))}
        </div>
    )
}

export default DataSelector
