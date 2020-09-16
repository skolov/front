import React, { FC, useCallback } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import classNames from 'classnames'
import style from './EstateEdit.module.scss'

type TabItem = {
    value: number
    label: string
}

type Props = {
    items?: TabItem[]
    onChange?: (activeTab: number) => void
    activeTab?: number
}

const BookmarkSwitch: FC<Props> = ({ items, onChange, activeTab }) => {
    const { t } = useTranslation()

    const onHandleChangeTab = useCallback(
        (activeTab: number) => {
            if (onChange) {
                onChange(activeTab)
            }
        },
        [onChange]
    )

    return (
        <div className={style.wrap}>
            {items &&
                items.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => {
                            onHandleChangeTab(item.value)
                        }}
                        className={classNames(
                            { [style.itemActive]: activeTab === index },
                            style.item
                        )}
                    >
                        {t(item.label)}
                    </div>
                ))}
        </div>
    )
}

export default BookmarkSwitch
