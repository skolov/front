import React, { FC, useCallback } from 'react'
import i18nProfile from '../../../utils/i18nProfile'
import { useTranslation } from '../../hooks/useTranslation'
import style from './CompanyEmployeesEditor.module.scss'
import { Modal, ModalButton } from '../../simples/Modal'
import { ButtonColors, ButtonVariants } from '../../simples/Button'

type Props = {
    onClose: () => void
    onAddExisting: () => void
    onAddNew: () => void
}

/**
 * Диалоговое окно "Добавить существующий аккаунт?"
 * @param onClose - Callback закрытия окна
 * @param onAddExisting - Callback при клике "Добавить существующий аккаунт
 * @param onAddNew - Callback при клике "Заполнить профиль"
 * @constructor
 */
const QuestionModal: FC<Props> = ({ onClose, onAddExisting, onAddNew }) => {
    const { t } = useTranslation({ ns: 'profile', i18n: i18nProfile })

    // При нажатии на "Добавить существующий аккаунт" вызываем два callback-а onClose и onAddExisting
    const onHandleAddExistingClick = useCallback(() => {
        onClose()
        onAddExisting()
    }, [onClose, onAddExisting])

    // При нажатии на "Заполнить" вызываем два callback-а onClose и onAddNew
    const onHandleAddNewClick = useCallback(() => {
        onAddNew()
        onClose()
    }, [onClose, onAddNew])

    // Кнопки диалогового окна
    const buttons: Array<ModalButton> = [
        {
            title: t('employees_modal_branches_fill_in'),
            onClick: onHandleAddNewClick,
            color: ButtonColors.Primary,
        },
        {
            title: t('employees_modal_branches_existing'),
            variant: ButtonVariants.Link,
            onClick: onHandleAddExistingClick,
        },
    ]

    // Вывод компонента
    return (
        <Modal
            onClose={onClose}
            title={t('employees_modal_branches_title')}
            description={t('employees_modal_branches_description')}
            buttons={buttons}
            classes={{
                modal: style.questionModal,
                header: style.questionModalHeader,
            }}
        ></Modal>
    )
}

export default QuestionModal
