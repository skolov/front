import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import i18nProfile from '../../../utils/i18nProfile'
import { useTranslation } from '../../hooks/useTranslation'
import { useForm } from 'react-hook-form'
import { Modal, ModalButton } from '../../simples/Modal'
import { FormTextField } from '../../simples/FormTextField'
import { FormSwitch } from '../../simples/FormSwitch'
import { ButtonColors, ButtonVariants } from '../../simples/Button'

import style from './CompanyDescriptionEditor.module.scss'
import { RootState } from '../../../store/ducks'
import { updateCompanyDescription } from '../../../store/ducks/auth'
import { Company } from '../../../store/types'

type ExpandDescriptionInputs = {
    description: string
    hide: boolean
}

const mapState = (state: RootState) => ({})
const mapDispatch = {
    updateCompanyDescription,
}

const connector = connect(mapState, mapDispatch)

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & {
    langId: number
    onClose: () => void
    company: Company
    onChange: (hide: boolean, description: string) => void
}

const CompanyDescriptionEditor: FC<Props> = ({
    langId,
    onClose,
    updateCompanyDescription,
    company,
    onChange,
}) => {
    const { t } = useTranslation({ ns: 'profile', i18n: i18nProfile })

    const { handleSubmit, control, setValue } = useForm<
        ExpandDescriptionInputs
    >({
        defaultValues: {
            description: '',
            hide: false,
        },
    })
    const [submiting, setSubmiting] = useState(false)
    //const prevUpdating = useRef(updating)

    useEffect(() => {
        let description = ''
        let hide = false

        if (company && company.translations) {
            let currantTranslation = company.translations.find(
                (item) => item.lang_id === langId
            )

            if (currantTranslation && currantTranslation.description) {
                description = currantTranslation.description
            }

            hide = company.hide_description || false
        }

        setValue('description', description)
        setValue('hide', hide)
    }, [company, langId, setValue])

    useEffect(() => {
        if (submiting) {
            onClose()
        }
    }, [onClose, submiting])

    const onHandleSave = useCallback(
        (data: ExpandDescriptionInputs) => {
            const { description, hide } = data

            if (company && company.id && onChange) {
                updateCompanyDescription(company.id, {
                    description,
                    hide,
                    langId,
                })
                onChange(hide, description)
            }
            setSubmiting(true)
        },
        [company, langId, onChange, updateCompanyDescription]
    )

    const buttons: Array<ModalButton> = [
        {
            title: t('expand_description_editor_save'),
            onClick: handleSubmit(onHandleSave),
            disabled: submiting,
            color: ButtonColors.Primary,
        },
        {
            title: t('expand_description_editor_cancel'),
            onClick: onClose,
            variant: ButtonVariants.Link,
        },
    ]

    return (
        <Modal
            onClose={onClose}
            title={t('company_about_modal_title')}
            buttons={buttons}
            classes={{
                modal: style.modal,
            }}
        >
            <FormTextField
                label={t('company_about_modal_textarea_label')}
                name="description"
                control={control}
                rules={{ required: true }}
                multiline
                classes={{ input: style.descriptionInput }}
            />

            <div className={style.hideWrap}>
                <label className={style.hideLabel}>
                    {t('expand_description_editor_hide_label')}
                </label>
                <FormSwitch name="hide" control={control} />
            </div>
        </Modal>
    )
}

export default connector(CompanyDescriptionEditor)
