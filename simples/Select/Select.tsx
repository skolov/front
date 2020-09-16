import React, { FC, useState, useEffect, useCallback, useRef } from 'react'
import classNames from 'classnames'
import { i18n as i18nType } from 'i18next'
import { useTranslation } from '../../hooks/useTranslation'
import memoizeOne from 'memoize-one'
import styles from './Select.module.scss'
import { ReactComponent as ArrowIcon } from '../../../assets/icons/prototype/arrow-dropdown-ico.svg'

/**
 * Вычисление выбранного значения в селекторе.
 * В случае, если значение установлено, то выводим его, в противном случае undefined
 * @param {any} value - Значение селектора
 * @param {Array<OptionsItem>} options - Набор возможных опций для выбора в селекторе
 */
const getSelectContents = memoizeOne((value: any, options: Array<OptionsItem>):
    | undefined
    | OptionsItem => {
    if (value === undefined || value === null || value === '') {
        return undefined
    } else {
        return options.find((x) => x.value === value)
    }
})

// Тип для одной возможной опции в селекторе
export type OptionsItem = {
    value: any
    label?: string
    labelTrans?: string
}

export type SelectOptions = {
    options: Array<OptionsItem>
    label?: string
    value?: any
    placeholder?: string
    onChange?: (value: any, name?: string) => void
    name?: string
    helperText?: string
    error?: boolean
    classes?: {
        textInside?: string
        arrow?: string
        optionList?: string
        label?: string
        placeholder?: string
    }
    transNS?: string
    i18n?: i18nType
    disabled?: boolean
}

export type Props = SelectOptions & {}

/**
 * Вывод селектора
 * @param {Object} (optional) classes - Стили, применяемы к селектору помимо стандартных
 * @param {string} (optional) label - Вспомогательная метка, всплывающая вверх при взаимодействии с селектором
 * @param {any} (optional) value - Текущее значение селектора
 * @param {Array<OptionsItem>} options - Набор возможных для выбора в селекторе опций
 * @param {boolean} (optional) disabled - Свойство для блокировки селектора
 * @param {string} (optional) placeholder - Заполнитель селектора, исчезающий при установленном значении
 * @param {string} (optional) helperText - Текст подсказки под селектором
 * @param {boolean} (optional) error - Подсветка селектора в случае ошибки
 * @param onChange (optional) - Колбэк для извлечения значения селектора при клике на определенную опцию
 * @param {string} (optional) name - Имя селектора
 * @param {string} (optional) transNS - Параметр необходимый для перевода (Пространство имен)
 * @param {i18nType} (optional) i18n - Параметр необходимый для перевода
 * @constructor
 */
const Select: FC<Props> = ({
    classes = {},
    label,
    value,
    options,
    disabled,
    placeholder,
    helperText,
    error = false,
    onChange,
    name,
    transNS,
    i18n,
}) => {
    // Подключение функции перевода
    const { t } = useTranslation({ i18n, ns: transNS })
    const { t: tGlobal } = useTranslation({ i18n })

    const optionsBlock = useRef<HTMLDivElement>(null)

    const [openStatus, setOpenStatus] = useState(false)

    // Вычисление текущего значения для отображения текста выбранного значения в селекторе.
    const currentOption: OptionsItem | undefined = getSelectContents(
        value,
        options
    )

    // Метод сброса фокуса с выбранного элемента
    const loseFocus = useCallback(() => {
        if (optionsBlock && optionsBlock.current) {
            optionsBlock.current.blur()
        }
    }, [])

    // Метод закрытия селектора при клике вне самого селектора
    const closeSelectOutOfBlock = useCallback(
        (event: any) => {
            if (optionsBlock && optionsBlock.current) {
                if (!event.path.includes(optionsBlock.current)) {
                    setOpenStatus(false)
                    loseFocus()
                }
            }
        },
        [loseFocus]
    )

    // Обновление значения селектора при клике на определенную опцию
    const onHandleItemClick = useCallback(
        (value: string | number) => {
            if (onChange) {
                onChange(value, name)
            }
            setOpenStatus(false)
            loseFocus()
        },
        [loseFocus, name, onChange]
    )

    // Раскрытие пунктов меню с опциями при фокусе на селекторе
    const onHandleFocus = useCallback(() => {
        if (!disabled) setOpenStatus(true)
    }, [disabled])

    // Закрытие пунктов меню с опциями при потере фокуса с селектора
    const onHandleBlur = useCallback(() => {
        if (!disabled) setOpenStatus(false)
    }, [disabled])

    // Установка/удаление обработчика события на документе.
    useEffect(() => {
        document.addEventListener('click', closeSelectOutOfBlock, false)
        return () => {
            document.removeEventListener('click', closeSelectOutOfBlock, false)
        }
    }, [closeSelectOutOfBlock])

    // Вывод компонента
    return (
        <div
            ref={optionsBlock}
            onFocus={onHandleFocus}
            onBlur={onHandleBlur}
            className={classNames(styles.selectWrap, {
                [styles.error]: error,
                [styles.opened]: openStatus && options && options.length !== 0,
                [styles.filled]: value || value === 0,
                [styles.disabled]: disabled,
            })}
            tabIndex={0}
        >
            <ArrowIcon className={classNames(styles.arrow, classes.arrow)} />
            <div
                className={classNames(styles.valueHolder, classes.textInside, {
                    [styles.filled]: value || value === 0,
                })}
            >
                {placeholder && !currentOption && (
                    <div
                        className={classNames(
                            styles.placeholder,
                            classes.placeholder
                        )}
                    >
                        {placeholder}
                    </div>
                )}
                {label && (
                    <>
                        <label
                            className={classNames(styles.label, classes.label, {
                                [styles.labelVisible]: !value && !placeholder,
                            })}
                        >
                            {label}
                        </label>
                        <div className={styles.notch}>
                            <span className={styles.notchContainer}>
                                {label}
                            </span>
                        </div>
                    </>
                )}
                {!label &&
                    !placeholder &&
                    !value &&
                    value !== 0 &&
                    tGlobal('select_nothing_inside_select')}
                <p className={classNames(styles.someText, classes.textInside)}>
                    {currentOption &&
                        (currentOption.labelTrans
                            ? t(currentOption.labelTrans)
                            : currentOption.label)}
                </p>
            </div>
            {helperText && <p className={styles.helperText}>{helperText}</p>}
            {openStatus && options.length !== 0 && (
                <ul
                    className={classNames(
                        styles.selectList,
                        classes.optionList
                    )}
                >
                    {options.map((option, index) => (
                        <li
                            className={classes.optionList}
                            onClick={() => {
                                onHandleItemClick(option.value)
                            }}
                            key={index}
                        >
                            {option.value || option.value === 0
                                ? option.labelTrans
                                    ? t(`${option.labelTrans}`)
                                    : option.label
                                : t('profile_infoblock_not_indicated')}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default Select
