import React, { FC, useCallback, useState } from 'react'
import i18nProfile from '../../../utils/i18nProfile'
import { useTranslation } from '../../hooks/useTranslation'
import style from './CompanyEmployeesEditor.module.scss'
import { AddButton } from '../../simples/AddButton'
import QuestionModal from './QuestionModal'
import AddExistingModal from './AddExistingModal'
import { CompanyEmployeesEditorModal } from '../CompanyEmployeesEditorModal'
import { CompanyStaff } from '../../../store/types'

type Props = {
    langId: number
    showAddButton?: boolean
    companyId: number
    onChange?: (staff: Array<CompanyStaff>) => void
    staff?: Array<CompanyStaff>
}

/**
 * Компонент отвечает за редактирования членов семьи и питомцев авторизованного пользователя.
 * Выводит модальные окна "Добавить существующий аккаунт?", "Добавить существующий аккаунт", "Добавить члена семьи" и "Добавить члена семьи: Питомец"
 * @param langId - идентификатор языка
 * @constructor
 */
const ProfileFamilyEditor: FC<Props> = ({
    langId,
    showAddButton,
    onChange,
    staff,
    companyId,
}) => {
    const { t } = useTranslation({ ns: 'profile', i18n: i18nProfile })

    // Управление показом окна "Добавить существующий аккаунт?"
    const [showQuestionModal, setShowQuestionModal] = useState(false)
    const onHandleAddClick = useCallback(() => {
        setShowQuestionModal(true)
    }, [setShowQuestionModal])
    const onHandleQuestionModalClose = useCallback(() => {
        setShowQuestionModal(false)
    }, [setShowQuestionModal])

    // Обработчик выбора добавления существующего аккаунта
    const [showAddExistsEditor, setShowAddExistsEditor] = useState(false)
    const onHandleAddExisting = useCallback(() => {
        setShowAddExistsEditor(true)
    }, [setShowAddExistsEditor])
    const onHandleAddExistsEditorClose = useCallback(() => {
        setShowAddExistsEditor(false)
    }, [setShowAddExistsEditor])

    // Обработчик выбора создания нового профиля
    const [showStaffMemberEditor, setShowStaffMemberEditor] = useState(false)
    const onHandleAddNew = useCallback(() => {
        setShowStaffMemberEditor(true)
    }, [setShowStaffMemberEditor])
    const onHandleStaffMemberEditorClose = useCallback(() => {
        setShowStaffMemberEditor(false)
    }, [setShowStaffMemberEditor])

    const closeEditor = useCallback(() => {
        setShowStaffMemberEditor(false)
    }, [])

    const onHandleAddNewStaffMember = useCallback(
        (staffMember: CompanyStaff) => {
            if (staff && onChange && staffMember) {
                let newStaff = [...staff]

                let found = newStaff.some((item) => {
                    return item.id === staffMember.id
                })

                if (!found) {
                    newStaff.push(staffMember)
                }
                onChange(newStaff)
            }
        },
        [onChange, staff]
    )

    return (
        <div className={style.root}>
            {showAddButton && (
                <AddButton
                    label={t('company_add_staff_member')}
                    onClick={onHandleAddClick}
                />
            )}

            {showQuestionModal && (
                <QuestionModal
                    onClose={onHandleQuestionModalClose}
                    onAddExisting={onHandleAddExisting}
                    onAddNew={onHandleAddNew}
                />
            )}

            {showAddExistsEditor && (
                <AddExistingModal
                    onClose={onHandleAddExistsEditorClose}
                    companyId={companyId}
                    langId={langId}
                    onAddNewStaffMember={onHandleAddNewStaffMember}
                />
            )}

            {showStaffMemberEditor && (
                <CompanyEmployeesEditorModal
                    companyId={companyId}
                    langId={langId}
                    onClose={closeEditor}
                    onChange={onHandleAddNewStaffMember}
                />
            )}
        </div>
    )
}

export default ProfileFamilyEditor

/*

{showAddExistsEditor && (
                <AddExistingModal
                    onClose={onHandleAddExistsEditorClose}
                    langId={langId}
                />
            )}
*/
