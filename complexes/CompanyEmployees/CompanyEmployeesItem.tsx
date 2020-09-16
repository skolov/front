import React, { FC, useState, useCallback } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import i18nProfile from '../../../utils/i18nProfile'
import { useTranslation } from '../../hooks/useTranslation'
import {
    ProfileTranslation,
    CompanyStaff,
    Profile,
    StaffPosition,
} from '../../../store/types'
import Item from './item'
import { Action } from '../ProfileFamily/Item'
import { RootState } from '../../../store/ducks'
import { Confirm } from '../../simples/Confirm'
import { Staff as StaffServices } from '../../../services/Staff'
import { CompanyEmployeesEditorModal } from '../../complexes/CompanyEmployeesEditorModal'

/**
 * Извлечение перевода профиля по идентификатору языка.
 * Если для указанного языка перевод отсутствует, то извлекаем перевод по-умолчанию
 * @param {Profile} profile - Данные профиля
 * @param {number} langId - идентификатор языка
 */

const getTranslation = (
    profile: Profile,
    langId: number
): ProfileTranslation | null => {
    if (!profile.translations) {
        return null
    }

    let translation = profile.translations.find(
        (translation) => translation.lang_id === langId
    )

    if (!translation) {
        translation = profile.translations.find(
            (translation) => !!translation.default
        )
    }

    return translation || null
}

const getPosition = (
    position: Array<StaffPosition> | undefined,
    langId: number
): string | undefined | null => {
    if (!position) {
        return null
    }
    let currentPosition = position.find(
        (position) => position.lang_id === langId
    )

    if (currentPosition) {
        return currentPosition.position
    }
}

const mapState = (state: RootState) => ({})
const mapDispatch = {}

const connector = connect(mapState, mapDispatch)

type PropsFromRoute = {
    id: string
}

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux &
    RouteComponentProps<PropsFromRoute> & {
        staff: CompanyStaff
        langId: number
        editable?: boolean
        onChange?: (staff: CompanyStaff) => void
        onHandleDelete?: (id: number) => void
    }

/**
 * Вывод карточки члена семьи
 * @param {FamilyMember} member - Данные члена семьи
 * @param {number} langId - идентификатор языка
 * @constructor
 */
const CompanyEmployeesItem: FC<Props> = ({
    match,
    staff,
    langId,
    editable = false,
    onChange,
    onHandleDelete,
}) => {
    const { t } = useTranslation({ ns: 'profile', i18n: i18nProfile })
    const companyId = parseInt(match.params.id)

    const [edit, setEdit] = useState(false)

    const openEditor = useCallback(() => {
        setEdit(true)
    }, [setEdit])

    const closeEditor = useCallback(() => {
        setEdit(false)
    }, [setEdit])

    const onHandleHide = useCallback(async (): Promise<void> => {
        if (!staff.id) {
            return
        }
        await StaffServices.updateStaffMember(staff.id, { hide: !staff.hide })

        let newStaff: CompanyStaff = {
            ...staff,
            hide: !staff.hide,
        }

        if (onChange) {
            onChange(newStaff)
        }
    }, [onChange, staff])

    const onHandleChangeStaffItem = useCallback(
        (newStaff: CompanyStaff) => {
            if (staff && onChange) {
                onChange(newStaff)
            }
        },
        [onChange, staff]
    )

    const [deleteConfirm, setDeleteConfirm] = useState(false)
    const onHandleDeleteClick = useCallback(() => {
        setDeleteConfirm(true)
    }, [setDeleteConfirm])

    const onCancelDelete = useCallback(() => {
        setDeleteConfirm(false)
    }, [setDeleteConfirm])

    const executeDelete = useCallback(async (): Promise<void> => {
        setDeleteConfirm(false)
        if (!staff.id) {
            return
        }
        await StaffServices.deleteStaffMember(staff.id)

        if (onHandleDelete) {
            onHandleDelete(staff.id)
        }
    }, [onHandleDelete, staff.id])

    const actions: Array<Action> = []
    if (editable) {
        if (!staff.registered) {
            actions.push({ title: t('profile_family_repeat_invite') })
            actions.push({
                title: t('profile_family_edit'),
                onClick: openEditor,
            })
            actions.push({
                title: staff.hide
                    ? t('profile_family_show')
                    : t('profile_family_hide'),
                onClick: onHandleHide,
            })
        }
        actions.push({
            title: t('profile_family_delete'),
            onClick: onHandleDeleteClick,
        })
    }

    if (!staff.profile || staff.hide === undefined) {
        return null
    }

    // Получение перевода профиля
    const translation = getTranslation(staff.profile, langId)
    const position = getPosition(staff.position, langId)

    if (!translation) {
        return null
    }

    // Вывод компонента
    return (
        <>
            <Item
                avatar={staff.profile.photo}
                name={translation.full_name || ''}
                position={position || ''}
                actions={actions}
                hide={staff.hide}
            />

            {/* Модальное окно подтверждения удаления */}
            {deleteConfirm && (
                <Confirm
                    message={t('employee_delete_staff_member')}
                    onClose={onCancelDelete}
                    onAccept={executeDelete}
                />
            )}

            {/* Модальное окно редактирования члена семьи */}
            {edit && (
                <CompanyEmployeesEditorModal
                    langId={langId}
                    onClose={closeEditor}
                    staff={staff}
                    staffId={staff.id}
                    companyId={companyId}
                    onChange={onHandleChangeStaffItem}
                    edit
                />
            )}
        </>
    )
}

export default connector(withRouter(CompanyEmployeesItem))
