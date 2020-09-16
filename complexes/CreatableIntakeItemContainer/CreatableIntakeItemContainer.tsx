import React, {
    FC,
    useCallback,
    useState,
    ChangeEvent,
    KeyboardEvent,
} from 'react'
import { i18n as i18nType } from 'i18next'
import style from './CreatableIntakeItemContainer.module.scss'
import { useTranslation } from '../../hooks/useTranslation'
import { TextField } from '../TextField'
import { Button, ButtonVariants } from '../Button'
import { IntakeItemContainer } from '../IntakeItemContainer'

type Props = {
    textFieldLabel: string
    intakeItemContainerLabel: string
    items?: Array<string>
    onChange?: (items: Array<string>) => void
    i18n?: i18nType
    itemRender?: (item: any) => JSX.Element
    classes?: {
        item?: string
    }
}

/**
 * Компонент для ручного ввода информации (навыков и интересов)
 * @param {string} textFieldLabel - Надпись-подсказка над текстовым полем ввода информации
 * @param {string} intakeItemContainerLabel - Надпись-подсказка над блоком содержащим элементы массива
 * @param {Array<string>} (optional) items - Массив элементов
 * @param Колбэк (optional) onChange - Обработчик на изменение входного набора элементов
 * @param Колбэк (optional) itemRender - Метод отрисовки входных элементов
 * @param {i18nType} (optional) i18n - Метод отрисовки входных элементов
 * @constructor
 */
const CreatableIntakeItemContainer: FC<Props> = ({
    textFieldLabel,
    intakeItemContainerLabel,
    items,
    onChange,
    i18n,
    itemRender,
    classes = {},
}) => {
    // Подключение функции перевода
    const { t } = useTranslation({ i18n })

    const [newItem, setNewItem] = useState<string>('')

    // Обработчик ввода информации в текстовое поле
    const onHandleNewItemChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setNewItem(event.target.value)
        },
        [setNewItem]
    )

    // Добавление нового пункта (элемента в массив)
    const addItem = useCallback(() => {
        if (!newItem) {
            return
        }

        const newItems = items ? [...items] : []
        newItems.push(newItem)

        if (onChange) {
            onChange(newItems)
        }

        setNewItem('')
    }, [items, newItem, onChange, setNewItem])

    // Обработчик на нажатие клавиши enter, для добавления нового пункта меню
    const onHandleNewItemKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
                addItem()
            }
        },
        [addItem]
    )

    // Обработчик удаления элемента из массива
    const onHandleDelete = useCallback(
        (item: number) => {
            const newItem = items ? [...items] : []
            newItem.splice(item, 1)
            if (onChange) {
                onChange(newItem)
            }
        },
        [items, onChange]
    )

    // Вывод компонента
    return (
        <div className={style.root}>
            <div className={style.formRow}>
                <div className={style.formCol}>
                    <TextField
                        label={textFieldLabel}
                        onChange={onHandleNewItemChange}
                        value={newItem}
                        onKeyDown={onHandleNewItemKeyDown}
                    />
                </div>
                <div className={style.formCol}>
                    {newItem && (
                        <Button
                            onClick={addItem}
                            variant={ButtonVariants.Link}
                            className={style.btnAdd}
                        >
                            {t('creatable_intake_item_container_add')}
                        </Button>
                    )}
                </div>
            </div>

            <IntakeItemContainer
                label={intakeItemContainerLabel}
                itemRender={itemRender}
                items={items}
                onChange={onHandleDelete}
                classes={classes}
            />
        </div>
    )
}

export default CreatableIntakeItemContainer
