/**
 * Модальное окно добавления и редактирования члена семьи
 */
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import memoizeOne from 'memoize-one'
import i18nProfile from '../../../utils/i18nProfile'
import { useTranslation } from '../../hooks/useTranslation'
import { useForm } from 'react-hook-form'
import classNames from 'classnames'
import style from './CompanyEmployeesEditorModal.module.scss'
import { Modal, ModalButton } from '../../simples/Modal'
import { ButtonColors, ButtonVariants } from '../../simples/Button'
import { FormTextField } from '../../simples/FormTextField'
import {
    ContactTypes,
    FileType,
    Genders,
    ProfileTranslation,
    CompanyStaff,
    StaffRoles,
    StaffPosition,
    ProfileContact,
    Profile,
} from '../../../store/types'
import { genderOptions, staffRoleOptions, emailRE } from '../../../constants'
import { Switch } from '../../simples/Switch'
import sleep from '../../../utils/sleep'
import { RootState } from '../../../store/ducks'
import { AvatarEditor } from '../AvatarEditor'
import { FormSelect } from '../../simples/FormSelect'
import { inviteThroughSocialNetwork } from '../../../utils/socialNetwork'
import {
    SocialNetwork,
    SocialNetworkTypes,
} from '../../../services/SocialNetwork'
import { Staff as StaffServices } from '../../../services/Staff'

// Способы отправки приглашения
enum InviteTypes {
    Email = 'Email',
    Facebook = 'Facebook',
    LinkedIn = 'LinkedIn',
}

// Правила валидации Email
const emailRules = {
    pattern: emailRE,
}

type StaffMemberEditorInputs = {
    name: string
    surname: string
    fullName: string
    position: string
    gender: Genders | null
    email: string
    role?: StaffRoles | null
}
// Получение должности пользователя
const getInitStaffMemberPosition = memoizeOne(
    (langId: number, staffMember?: CompanyStaff): StaffPosition | void => {
        if (staffMember && staffMember.position) {
            return staffMember.position.find((p) => p.lang_id === langId)
        }
    }
)
// Получение перевода пользователя
const getInitStaffMemberTranslation = memoizeOne(
    (langId: number, staffMember?: CompanyStaff): ProfileTranslation | void => {
        if (
            staffMember &&
            staffMember.profile &&
            staffMember.profile.translations
        ) {
            let translation = staffMember.profile.translations.find(
                (t) => t.lang_id === langId
            )
            if (!translation) {
                translation = staffMember.profile.translations.find(
                    (t) => t.default === true
                )
            }
            return translation
        }
    }
)

// Инициализация формы редактирования
const getInitStaffMemberFields = memoizeOne(
    (langId: number, staffMember?: CompanyStaff): StaffMemberEditorInputs => {
        let fields: StaffMemberEditorInputs = {
            name: '',
            surname: '',
            fullName: '',
            position: '',
            gender: null,
            email: '',
            role: null,
        }

        if (staffMember && staffMember.profile && staffMember.position) {
            fields.gender = staffMember.profile.gender || null
            fields.role = staffMember.role || null

            if (staffMember.profile && staffMember.profile.contacts) {
                const contacts = staffMember.profile.contacts

                for (let i = 0; i < contacts.length; i++) {
                    const contact = contacts[i]

                    if (contact.type === ContactTypes.Email) {
                        fields.email = contact.value
                        break
                    }
                }
            }

            const translation = getInitStaffMemberTranslation(
                langId,
                staffMember
            )

            const position = getInitStaffMemberPosition(langId, staffMember)

            if (translation) {
                fields.name = translation.name || ''
                fields.surname = translation.surname || ''
                fields.fullName = translation.full_name || ''
            }

            if (position) {
                fields.position = position.position || ''
            }
        }

        return fields
    }
)
// Получение аватара сотрудника
const getInitStaffMemberAvatar = memoizeOne(
    (staffMember?: CompanyStaff): FileType | null => {
        if (staffMember && staffMember.profile && staffMember.profile.photo) {
            return staffMember.profile.photo
        }

        return null
    }
)

const mapState = (state: RootState, props: OwnProps) => ({})

const mapDispatch = {}

const connector = connect(mapState, mapDispatch)

type PropsFromRedux = ConnectedProps<typeof connector>

// Определение пропсов компонента
type OwnProps = {
    onClose: () => void
    onChange?: (staff: CompanyStaff) => void
    staff?: CompanyStaff
    langId: number
    staffId?: number
    companyId: number
    edit?: boolean
}

type Props = PropsFromRedux & OwnProps

const FamilyMemberEditorModal: FC<Props> = ({
    onClose,
    staff,
    langId,
    onChange,
    staffId,
    companyId,
    edit = false,
}) => {
    // Получение функции переводчика
    const { t } = useTranslation({ ns: 'profile', i18n: i18nProfile })

    // Способ приглашения
    const [inviteType, setInviteType] = useState<InviteTypes | null>(null)

    const [draft, setDraft] = useState<CompanyStaff | null>(null)
    const [photo, setPhoto] = useState<FileType | null>(null)
    // Обработчик при изменении способа приглашения
    const changeInviteType = useCallback(
        (checked: boolean, inviteType: InviteTypes) => {
            if (!checked) {
                setInviteType(null)
            } else {
                setInviteType(inviteType)
            }
        },
        [setInviteType]
    )

    // Подключение react-hook-form
    const { handleSubmit, control, setValue, watch, errors } = useForm<
        StaffMemberEditorInputs
    >({
        defaultValues: getInitStaffMemberFields(langId, staff),
    })

    // Ссылка на идентификатор редактируемого члена семьи
    const refStaffProfileId = useRef<number | null>(staffId || null)
    const refLoadingFamilyProfileId = useRef(false)

    const getStaffProfileId = useCallback(async (): Promise<number> => {
        if (refStaffProfileId.current) {
            return refStaffProfileId.current
        }

        if (refLoadingFamilyProfileId.current) {
            while (true) {
                if (
                    !refLoadingFamilyProfileId.current &&
                    refStaffProfileId.current
                ) {
                    return refStaffProfileId.current
                }

                await sleep(500)
            }
        }

        refLoadingFamilyProfileId.current = true

        const staffDraft = await StaffServices.createNewCompanyStaff(
            companyId,
            1
        )
        setDraft(staffDraft)

        refLoadingFamilyProfileId.current = false
        refStaffProfileId.current = staffDraft.id || 0
        return refStaffProfileId.current
    }, [companyId])

    // Аватар
    const [avatar, setAvatar] = useState<FileType | null>(
        getInitStaffMemberAvatar(staff)
    )

    // Обработчик удаления аватара
    const avatarDeleteHandler = useCallback(async (): Promise<void> => {
        const staffMemberId = await getStaffProfileId()

        if (staff && onChange) {
            let newStaff: CompanyStaff = {
                ...staff,
                profile: {
                    ...staff.profile,
                    photo: null,
                },
            }
            onChange(newStaff)
        } else {
            setPhoto(null)
        }

        return StaffServices.deleteAvatar(staffMemberId)
    }, [getStaffProfileId, onChange, staff])

    // Обработчик изменения аватара
    const avatarUploadHandler = useCallback(
        async (
            file: File,
            onUploadProgress: (percent: number) => void
        ): Promise<FileType> => {
            const staffMemberId = await getStaffProfileId()
            const response = StaffServices.uploadAvatar(
                staffMemberId,
                file,
                onUploadProgress
            )
            response.then((photo) => {
                if (staff && onChange) {
                    let newStaff: CompanyStaff = {
                        ...staff,
                        profile: {
                            ...staff.profile,
                            photo: photo,
                        },
                    }
                    onChange(newStaff)
                } else {
                    setPhoto(photo)
                }
            })
            return response
        },
        [getStaffProfileId, onChange, staff]
    )

    // Состояние сохранения формы
    const [saving, setSaving] = useState(false)
    // Обработчик сохранения формы
    const onHandleSave = useCallback(
        async (data: StaffMemberEditorInputs) => {
            const staffMemberId = await getStaffProfileId()

            if (!staffMemberId) {
                return
            }

            const contacts: Array<ProfileContact> = []
            if (data.email) {
                contacts.push({
                    type: ContactTypes.Email,
                    value: data.email,
                    for_notification: false,
                })
            }

            let staffMember: CompanyStaff = {}
            if (data.role) {
                staffMember = {
                    draft: false,
                    invite: !!inviteType,
                    invite_send_email: inviteType === InviteTypes.Email,
                    role: data.role,
                }
            }

            const position: StaffPosition = {
                lang_id: langId,
                position: data.position,
            }

            let staffMemberProfileTranslation: ProfileTranslation = {
                lang_id: langId,
            }
            if (data.name && data.surname && data.fullName && data.position) {
                staffMemberProfileTranslation = {
                    lang_id: langId,
                    name: data.name,
                    surname: data.surname,
                    full_name: data.fullName,
                }
            }

            let staffMemberProfile: Profile = {
                gender: data.gender,
                contacts,
            }

            await StaffServices.updateStaffMemberProfileTranslation(
                staffMemberId,
                staffMemberProfileTranslation
            )
            await StaffServices.updateStaffTranslation(staffMemberId, position)

            await StaffServices.updateStaffProfile(
                staffMemberId,
                staffMemberProfile
            )
            const updatedStaff = await StaffServices.updateStaffMember(
                staffMemberId,
                staffMember
            )

            if (
                staff &&
                staff.position &&
                staff.profile &&
                staff.profile.translations &&
                onChange
            ) {
                let newPosition = staff.position.map((item) =>
                    item.lang_id === langId
                        ? { ...item, position: position.position }
                        : item
                )

                let newTranslation = staff.profile.translations.map((item) =>
                    item.lang_id === langId
                        ? {
                              ...item,
                              lang_id: langId,
                              name: staffMemberProfileTranslation.name,
                              surname: staffMemberProfileTranslation.surname,
                              full_name:
                                  staffMemberProfileTranslation.full_name,
                          }
                        : item
                )
                let newStaff: CompanyStaff = {
                    ...staff,
                    position: newPosition,
                    role: staffMember.role,
                    profile: {
                        ...staff.profile,
                        translations: newTranslation,
                        gender: staffMemberProfile.gender,
                        contacts,
                    },
                }

                onChange(newStaff)
            }

            if (!staff && onChange && updatedStaff) {
                if (data.role) {
                    let newStaff: CompanyStaff = {
                        ...updatedStaff,
                        position: [position],
                        role: data.role,
                        hide: false,
                        profile: {
                            ...draft,
                            gender: data.gender,
                            photo: photo,
                            contacts,
                            translations: [
                                {
                                    lang_id: langId,
                                    full_name: data.fullName,
                                    name: data.name,
                                    surname: data.surname,
                                },
                            ],
                        },
                    }

                    onChange(newStaff)
                }
            }

            setSaving(true)
        },
        [draft, getStaffProfileId, inviteType, langId, onChange, photo, staff]
    )

    const [fullNameIsChanged, setFullNameIsChanged] = useState(false)
    const watchNameSurname = watch(['name', 'surname'])
    useEffect(() => {
        if (fullNameIsChanged) {
            return
        }

        const { name, surname } = watchNameSurname

        let newFullName = ''
        if (name && surname) {
            newFullName = `${name} ${surname}`
        } else if (name) {
            newFullName = name
        } else if (surname) {
            newFullName = surname
        }

        setValue('fullName', newFullName)
    }, [fullNameIsChanged, setValue, watchNameSurname])

    // Эффект, отслеживающий окончания обновления профиля
    useEffect(() => {
        if (saving) {
            getStaffProfileId().then((staffMemberId) => {
                setSaving(false)

                switch (inviteType) {
                    case InviteTypes.Facebook:
                        SocialNetwork.getInviteUrl(
                            SocialNetworkTypes.Facebook,
                            staffMemberId
                        )
                            .then((url) => {
                                return inviteThroughSocialNetwork(url)
                            })
                            .then(() => {
                                onClose()
                            })
                        break

                    case InviteTypes.LinkedIn:
                        SocialNetwork.getInviteUrl(
                            SocialNetworkTypes.LinkedIn,
                            staffMemberId
                        )
                            .then((url) => {
                                return inviteThroughSocialNetwork(url)
                            })
                            .then()

                        onClose()
                    default:
                        onClose()
                        break
                }
            })
        }
    }, [setSaving, saving, onClose, inviteType, getStaffProfileId])

    // Кнопки модального окна
    const buttons: Array<ModalButton> = [
        {
            title: t('employees_modal_invite_add_btn'),
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

    // Вывод компонента
    return (
        <Modal
            onClose={onClose}
            title={
                edit
                    ? t('employees_modal_editor_title_edit')
                    : t('employees_modal_editor_title_add')
            }
            description={
                edit
                    ? t('employees_modal_editor_description_edit')
                    : t('employees_modal_editor_description_add')
            }
            buttons={buttons}
        >
            {/* Имя и фамилия */}
            <div className={style.formRow}>
                <div className={style.formCol}>
                    <FormTextField
                        label={t('profile_name_field_label')}
                        name="name"
                        control={control}
                    />
                </div>
                <div className={style.formCol}>
                    <FormTextField
                        label={t('profile_surname_field_label')}
                        name="surname"
                        control={control}
                    />
                </div>
            </div>

            {/* Полное имя */}
            <div className={style.formRow}>
                <div className={style.formCol}>
                    <FormTextField
                        label={t('profile_full_name_field_label')}
                        name="fullName"
                        control={control}
                    />
                </div>
            </div>

            {/* Должность сотрудника */}
            <div className={style.formRow}>
                <div className={style.formCol}>
                    <FormTextField
                        label={t('profile_position_field_label')}
                        name="position"
                        control={control}
                    />
                </div>
            </div>

            {/* Email и пол сотрудника */}
            <div className={style.formRow}>
                <div className={style.formCol}>
                    <FormTextField
                        label={t('profile_email_field_label')}
                        name="email"
                        control={control}
                        rules={emailRules}
                    />
                </div>
                <div className={style.formCol}>
                    <FormSelect
                        label={t('profile_gender_field_label')}
                        options={genderOptions}
                        name="gender"
                        control={control}
                        transNS="profile"
                        i18n={i18nProfile}
                    />
                </div>
            </div>

            <div className={style.formRow}>
                <div className={style.formCol}>
                    <div
                        className={classNames(
                            style.formSectionLabel,
                            style.formDescription
                        )}
                    >
                        {t('employees_modal_access_rights_title')}
                        <p className={style.formSectionDescription}>
                            {t('employees_modal_access_rights_description')}
                        </p>
                    </div>
                </div>
            </div>

            <div className={style.formRow}>
                <div className={style.formCol}>
                    <FormSelect
                        label={t('profile_role_field_label')}
                        options={staffRoleOptions}
                        name="role"
                        control={control}
                        transNS="profile"
                        i18n={i18nProfile}
                    />
                </div>
                <div className={style.formCol}></div>
            </div>

            {/* Аватар пользователя */}
            <div className={style.formRow}>
                <div className={style.formCol}>
                    <div className={style.formSectionLabel}>
                        {t('employees_modal_photo_editor_title')}
                    </div>

                    <AvatarEditor
                        id="new_staff_member_avatar"
                        photo={avatar}
                        onChange={setAvatar}
                        uploadHandler={avatarUploadHandler}
                        deleteHandler={avatarDeleteHandler}
                        i18n={i18nProfile}
                        note={t('employees_modal_photo_editor_description')}
                    />
                </div>
            </div>

            {/* Пригласить через: */}
            <div className={classNames(style.formSection, style.inviteSection)}>
                <div className={style.formSectionLabel}>
                    {t('family_member_editor_modal_invite_via')}
                </div>

                <div className={style.inviteSwitches}>
                    <div className={style.inviteSwitch}>
                        <div className={style.inviteSwitchLabel}>E-mail</div>
                        <Switch
                            value={inviteType === InviteTypes.Email}
                            onChange={(checked) => {
                                changeInviteType(checked, InviteTypes.Email)
                            }}
                        />
                    </div>

                    <div className={style.inviteSwitch}>
                        <div className={style.inviteSwitchLabel}>Facebook</div>
                        <Switch
                            value={inviteType === InviteTypes.Facebook}
                            onChange={(checked) => {
                                changeInviteType(checked, InviteTypes.Facebook)
                            }}
                        />
                    </div>

                    <div className={style.inviteSwitch}>
                        <div className={style.inviteSwitchLabel}>LinkedIn</div>
                        <Switch
                            value={inviteType === InviteTypes.LinkedIn}
                            onChange={(checked) => {
                                changeInviteType(checked, InviteTypes.LinkedIn)
                            }}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default connector(FamilyMemberEditorModal)
