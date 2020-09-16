import React, { FC, useState, useEffect, useCallback } from 'react'
import styles from './CompanyEmployees.module.scss'
import { CompanyStaff } from '../../../store/types'

import CompanyEmployeesItem from './CompanyEmployeesItem'
import { Modal, ModalButton } from '../../simples/Modal'
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from '../../../store/ducks'
import { useTranslation } from '../../hooks/useTranslation'
import i18nProfile from '../../../utils/i18nProfile'
import { ButtonColors, ButtonVariants } from '../../simples/Button'

const mapState = (state: RootState, ownProps: OwnProps) => ({})
const mapDispatch = {}
const connector = connect(mapState, mapDispatch)

type PropsFromRedux = ConnectedProps<typeof connector>

type OwnProps = {
    staff?: Array<CompanyStaff>
    langId: number
    editable?: boolean
    onChange?: (staff: Array<CompanyStaff>) => void
    onAdd?: () => void
    showAddButton?: boolean
    companyId: number
}

type Props = PropsFromRedux & OwnProps

/**
 * Вывод основной информации профиля компании
 * @param {string | undefined} currentLanguageCode - Код текущего языка
 * @constructor
 */
const CompanyEmployees: FC<Props> = ({
    staff,
    langId,
    editable = false,
    onChange,
    onAdd,
    showAddButton,
    companyId,
}) => {
    const { t } = useTranslation({ ns: 'profile', i18n: i18nProfile })
    const { t: tGlobal } = useTranslation({ i18n: i18nProfile })

    const onHandleChangeStaffItem = useCallback(
        (staffItem: CompanyStaff) => {
            let newStaff: Array<CompanyStaff> = []
            if (staff) {
                newStaff = staff.map((item) => {
                    return item.id === staffItem.id ? staffItem : item
                })
            }
            if (onChange) {
                onChange(newStaff)
            }
        },
        [onChange, staff]
    )

    const onHandleDeleteStaffItem = useCallback(
        (id: number) => {
            let newStaff: Array<CompanyStaff> = []
            if (staff) {
                newStaff = staff.filter((item) => item.id !== id)
            }

            if (onChange) {
                onChange(newStaff)
            }
        },
        [onChange, staff]
    )

    const onHandleAddStaffItem = useCallback(() => {}, [])
    /*
    const buttons: Array<ModalButton> = [
        {
            title: inviteType
                ? familyMember
                    ? t('family_member_editor_modal_invite_and_save')
                    : t('family_member_editor_modal_invite_and_add')
                : familyMember
                ? t('family_member_editor_modal_save')
                : t('family_member_editor_modal_add'),
            onClick: handleSubmit(onHandleSave),
            disabled: saving,
            color: ButtonColors.Primary,
        },
        {
            title: t('family_member_editor_modal_cancel_button'),
            variant: ButtonVariants.Link,
            onClick: onClose,
        },
    ]


    
    const buttonsForBranchesModal: Array<ModalButton> = [
        {
            title: t('employees_modal_branches_fill_in'),
            onClick: onHandleCompanyEmployeesEdit,
            color: ButtonColors.Primary,
        },
        {
            title: t('employees_modal_branches_existing'),
            variant: ButtonVariants.Link,
            onClick: onHandleShowAddingExistingModal,
        },
    ]

    const buttonsForAddingExisting: Array<ModalButton> = [
        {
            title: t('employees_modal_branches_fill_in'),
            onClick: onHandleCompanyEmployeesEdit,
            color: ButtonColors.Primary,
        },
        {
            title: t('family_member_editor_modal_cancel_button'),
            variant: ButtonVariants.Link,
            onClick: onHandleShowAddingExistingModalClose,
        },
    ]
*/

    // Вывод компонента
    return (
        <div className={styles.wrap}>
            {staff && staff.length > 0
                ? staff.map(
                      (item) =>
                          item.profile && (
                              <CompanyEmployeesItem
                                  key={`comapny-${item.profile.id}`}
                                  staff={item}
                                  langId={langId}
                                  editable={editable}
                                  onChange={onHandleChangeStaffItem}
                                  onHandleDelete={onHandleDeleteStaffItem}
                              />
                          )
                  )
                : null}
        </div>
    )
}

export default connector(CompanyEmployees)
/*


            {showAddingExistingModal && (
                <Modal
                    onClose={onHandleCloseAll}
                    title={t('employees_modal_add_existing_title')}
                    description={t('employees_modal_add_existing_description')}
                    buttons={buttonsForAddingExisting}
                >
                    <div className={styles.formCol}></div>
                </Modal>
            )}

            {showCompanyEmployeesEditor && (
                <CompanyEmployeesEditorModal
                    companyId={companyId}
                    langId={langId}
                    onClose={onHandleCloseAll}
                    edit={false}
                    onChange={() => {}}
                    staff={undefined}
                    staffId={undefined}
                />
            )}



            const [showBranchingModal, setShowBranchingModal] = useState(false)
    const onHandleShowBranchingModalOpen = useCallback(() => {
        setShowBranchingModal(true)
    }, [])
    const onHandleShowBranchingModalClose = useCallback(() => {
        setShowBranchingModal(false)
    }, [])

    const [showAddingExistingModal, setShowAddingExistingModal] = useState(
        false
    )
    const onHandleShowAddingExistingModal = useCallback(() => {
        setShowAddingExistingModal(true)
    }, [])
    const onHandleShowAddingExistingModalClose = useCallback(() => {
        setShowAddingExistingModal(false)
    }, [])

    const [
        showCompanyEmployeesEditor,
        setShowCompanyEmployeesEditor,
    ] = useState(false)
    const onHandleCompanyEmployeesEdit = useCallback(() => {
        setShowCompanyEmployeesEditor(true)
    }, [])
    const onHandleCompanyEmployeesEditorClose = useCallback(() => {
        setShowCompanyEmployeesEditor(false)
    }, [])

    const onHandleCloseAll = useCallback(() => {
        setShowAddingExistingModal(false)
        setShowBranchingModal(false)
        setShowCompanyEmployeesEditor(false)
    }, [])

*/
