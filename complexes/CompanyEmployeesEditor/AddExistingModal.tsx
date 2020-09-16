import React, {
    FC,
    KeyboardEvent,
    useState,
    useEffect,
    useCallback,
    ChangeEvent,
    useRef,
} from 'react'
import styles from './CompanyEmployeesEditor.module.scss'
import _ from 'lodash'
import { Modal, ModalButton } from '../../simples/Modal'
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from '../../../store/ducks'
import { useTranslation } from '../../hooks/useTranslation'
import i18nProfile from '../../../utils/i18nProfile'
import { ButtonColors, ButtonVariants } from '../../simples/Button'
import { ReactComponent as CorrectIcon } from '../../../assets/icons/correct.svg'
import { TextField } from '../../simples/TextField'
import {
    CompanyStaff,
    StaffRoles,
    User as UserType,
    StaffPosition,
} from '../../../store/types'
import { User as UserService } from '../../../services/User'
import { Staff as StaffServices } from '../../../services/Staff'
import { Select } from '../../simples/Select'
import { staffRoleOptions } from '../../../constants'

const SEARCH_DELAY = 1000
const mapState = (state: RootState, ownProps: OwnProps) => ({})
const mapDispatch = {}
const connector = connect(mapState, mapDispatch)

type PropsFromRedux = ConnectedProps<typeof connector>

type OwnProps = {
    onClose: () => void
    onAddNewStaffMember?: (staff: CompanyStaff) => void
    langId?: number
    companyId: number
}

type Props = PropsFromRedux & OwnProps

/**
 * Вывод основной информации профиля компании
 * @param {string | undefined} currentLanguageCode - Код текущего языка
 * @constructor
 */
const CompanyEmployees: FC<Props> = ({
    onClose,
    langId,
    companyId,
    onAddNewStaffMember,
}) => {
    const { t } = useTranslation({ ns: 'profile', i18n: i18nProfile })
    const { t: tGlobal } = useTranslation({ i18n: i18nProfile })

    const [errorMessage, setErrorMessage] = useState('')

    const [search, setSearch] = useState('')
    const found = useRef(false)
    const searchTimerID = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [foundUser, setFoundUser] = useState<
        CompanyStaff | 'not found' | null
    >(null)
    const [role, setRole] = useState<StaffRoles>(StaffRoles.Default)
    const [position, setPosition] = useState('')

    const searchUser = useCallback(
        async (value) => {
            let user: UserType | 'not found' | null = null
            if (found.current) {
                return
            }
            found.current = true

            try {
                if (value) {
                    user = await UserService.search(value)
                }
            } catch (error) {
                user = 'not found'
            }

            setFoundUser(user)
        },
        [search]
    )

    const [findCounter, setFindCounter] = useState(0)

    const onHandleSearchChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value
            setSearch(value)
            found.current = false

            if (searchTimerID.current) {
                clearTimeout(searchTimerID.current)
            }

            searchTimerID.current = setTimeout(() => {
                searchUser(value).then()
            }, SEARCH_DELAY)
        },
        [setSearch, searchTimerID, searchUser]
    )

    const onHandleSearchKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
                if (searchUser) {
                    searchUser(search).then()
                }
            }
        },
        [searchUser, search]
    )

    const onHandleChangePosition = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setPosition(event.target.value)
        },
        []
    )

    const [submiting, setSubmiting] = useState(false)
    const onHandleAddToFamily = useCallback(async () => {
        if (!foundUser || foundUser === 'not found' || !foundUser.id) {
            return
        }

        let companyStaff: CompanyStaff | null = null

        setSubmiting(true)

        try {
            companyStaff = await StaffServices.createNewCompanyStaff(
                companyId,
                StaffRoles.Default,
                foundUser.id
            )

            if (
                companyStaff &&
                companyStaff.id &&
                langId &&
                onAddNewStaffMember
            ) {
                let staffMemberPosition: StaffPosition = {
                    lang_id: langId,
                    position: position,
                }

                await StaffServices.updateStaffTranslation(
                    companyStaff.id,
                    staffMemberPosition
                )
                await StaffServices.updateStaffMember(companyStaff.id, {
                    role: role,
                    draft: false,
                })

                let newCompanyStaff: CompanyStaff = {
                    ...companyStaff,
                    role: role,
                    draft: false,
                    position: [staffMemberPosition],
                }

                onAddNewStaffMember(newCompanyStaff)
                onClose()
            }
        } catch (error) {
            if (
                error.response &&
                error.response.data &&
                error.response.data.errors &&
                _.isArray(error.response.data.errors.user) &&
                error.response.data.errors.user.length > 0 &&
                error.response.data.errors.user[0] === 'already_added'
            ) {
                setErrorMessage('employees_user_already_added')
            } else {
                setErrorMessage('employees_exists_error')
            }

            setSubmiting(false)
        }
    }, [
        companyId,
        foundUser,
        langId,
        onAddNewStaffMember,
        position,
        role,
        setErrorMessage,
    ])

    const closeErrorModal = useCallback(() => {
        setErrorMessage('')
    }, [setErrorMessage])

    if (errorMessage) {
        const errorModalButtons: Array<ModalButton> = [
            {
                title: t('employees_exists_modal_continue'),
                color: ButtonColors.Primary,
                onClick: closeErrorModal,
            },
            {
                title: t('family_member_editor_modal_cancel_button'),
                variant: ButtonVariants.Link,
                onClick: onClose,
            },
        ]

        return (
            <Modal
                onClose={closeErrorModal}
                buttons={errorModalButtons}
                classes={{
                    modal: styles.errorModal,
                }}
            >
                {t(errorMessage)}
            </Modal>
        )
    }

    const buttonsForAddingExisting: Array<ModalButton> = [
        {
            title: t('employees_add_exists_add'),
            onClick: onHandleAddToFamily,
            color: ButtonColors.Primary,
            disabled: submiting,
        },
        {
            title: t('family_member_editor_modal_cancel_button'),
            variant: ButtonVariants.Link,
            onClick: onClose,
        },
    ]

    let foundUserFullName = ''
    let foundUserPhotoUrl: string | null = null

    if (
        foundUser &&
        foundUser !== 'not found' &&
        foundUser.profile &&
        foundUser.profile.translations
    ) {
        let translation = foundUser.profile.translations.find(
            (t) => t.lang_id === langId
        )

        if (!translation) {
            translation = foundUser.profile.translations.find((t) => t.default)
        }

        if (translation) {
            foundUserFullName = translation.full_name || ''

            if (foundUser.profile && foundUser.profile.photo) {
                if (
                    foundUser.profile.photo.thumbnails &&
                    foundUser.profile.photo.thumbnails.small
                ) {
                    foundUserPhotoUrl = foundUser.profile.photo.thumbnails.small
                } else if (foundUser.profile.photo.original) {
                    foundUserPhotoUrl = foundUser.profile.photo.original
                }
            }
        }
    }

    // Вывод компонента
    return (
        <Modal
            onClose={onClose}
            title={t('employees_modal_add_existing_title')}
            description={t('employees_modal_add_existing_description')}
            buttons={buttonsForAddingExisting}
        >
            <TextField
                label={t('profile_family_editor_add_exists_modal_search_label')}
                value={search}
                onChange={onHandleSearchChange}
                onKeyDown={onHandleSearchKeyDown}
            />
            {foundUser === 'not found' && (
                <div className={styles.addExistsNotFound}>
                    {t('add_exists_modal_not_found')}
                </div>
            )}

            {foundUserFullName && (
                <>
                    <div className={styles.addExistsItem}>
                        <div
                            className={styles.addExistsPhoto}
                            style={{
                                backgroundImage: foundUserPhotoUrl
                                    ? `url("${foundUserPhotoUrl}")`
                                    : 'none',
                            }}
                        />
                        <div className={styles.addExistsFullName}>
                            {foundUserFullName}
                        </div>
                        <CorrectIcon className={styles.addExistsMark} />
                    </div>

                    <div className={styles.additionalInformation}>
                        <Select
                            label={t('profile_role_field_label')}
                            options={staffRoleOptions}
                            value={role}
                            onChange={setRole}
                            transNS="profile"
                            i18n={i18nProfile}
                        />
                    </div>

                    <div className={styles.additionalInformation}>
                        <TextField
                            label={t('profile_position_field_label')}
                            value={position}
                            onChange={onHandleChangePosition}
                            onKeyDown={onHandleSearchKeyDown}
                        />
                    </div>
                </>
            )}
        </Modal>
    )
}

export default connector(CompanyEmployees)
