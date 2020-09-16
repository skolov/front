import React, { FC, useCallback, useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Modal, ModalButton } from '../../simples/Modal'
import i18nProfile from '../../../utils/i18nProfile'
import { useTranslation } from '../../hooks/useTranslation'
import { ButtonVariants, ButtonColors } from '../../simples/Button'
import style from './CompanyServicesEditor.module.scss'
import { CreatableIntakeItemContainer } from '../../simples/CreatableIntakeItemContainer'
import { CompanyTranslation } from '../../../store/types'
import { RootState } from '../../../store/ducks'
import { updateCompanyServices } from '../../../store/ducks/auth'
import { RouteComponentProps, withRouter } from 'react-router-dom'

const mapState = (state: RootState) => ({})
const mapDispatch = {
    updateCompanyServices,
}
const connector = connect(mapState, mapDispatch)

type PropsFromRoute = {
    id: string
}

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux &
    RouteComponentProps<PropsFromRoute> & {
        onClose: () => void
        onChange: (services: string[]) => void
        companyTranslation: CompanyTranslation | undefined
        langId: number
    }
/**
 * Компонент для ручного ввода информации (Услуг, продвигаемых компанией)
 * @param Колбэк onClose - Метод закрытия модального окна
 * @param {CompanyTranslation | undefined} companyTranslation - Текущий перевод пользователя
 * @param {number} langId - Текущий, используемый перевод
 * @param Колбэк updateCompanyServices - Колбэк для обновления данных на сервере
 * @param Колбэк onChange - Колбэк для обновления данных в интерфейсе
 * @constructor
 */
const CompanyServices: FC<Props> = ({
    onClose,
    companyTranslation,
    onChange,
    langId,
    updateCompanyServices,
    match,
}) => {
    // подключение функции перевода
    const { t } = useTranslation({ ns: 'profile', i18n: i18nProfile })
    const id = parseInt(match.params.id)

    const [services, setServices] = useState<string[]>([])
    const [submiting, setSubmiting] = useState(false)

    // Метод отрисовки элементов
    const itemRender = useCallback((item: any): JSX.Element => {
        return <span className={style.item}>{item}</span>
    }, [])

    // Обработчик изменения сервисов
    const onHandleChangeServices = useCallback((services: string[]) => {
        setServices(services)
    }, [])

    // Метод отправки данных на сервер
    const onHandleSave = useCallback(() => {
        updateCompanyServices(id, {
            services,
            langId,
        })
        if (onChange) {
            onChange(services)
        }
        setSubmiting(true)
    }, [id, langId, onChange, services, updateCompanyServices])

    // Кнопки модального окна
    const buttons: Array<ModalButton> = [
        {
            title: t('expand_description_editor_save'),
            onClick: onHandleSave,
            disabled: submiting,
            color: ButtonColors.Primary,
        },
        {
            title: t('expand_description_editor_cancel'),
            onClick: onClose,
            variant: ButtonVariants.Link,
        },
    ]

    const classes = {
        header: style.headerModal,
    }

    // Метод закрытия модального окна при нажатии на клавишу сохранения
    useEffect(() => {
        if (submiting) {
            onClose()
        }
    }, [onClose, submiting])

    // Инициализация информации для вывода в компоненте
    useEffect(() => {
        let services: string[] = []
        if (companyTranslation && companyTranslation.services_provided) {
            services = companyTranslation.services_provided
        }
        setServices(services)
    }, [companyTranslation])

    // Вывод компонента
    return (
        <Modal
            onClose={onClose}
            title={t('company_modal_provided_services_title')}
            buttons={buttons}
            classes={classes}
        >
            <p className={style.title}>
                {t('company_modal_provided_services_explanation')}
            </p>

            <CreatableIntakeItemContainer
                textFieldLabel={t(
                    'company_modal_provided_services_input_title'
                )}
                intakeItemContainerLabel={t(
                    'company_modal_provided_services_itemholder_label'
                )}
                items={services}
                itemRender={itemRender}
                onChange={onHandleChangeServices}
            ></CreatableIntakeItemContainer>
        </Modal>
    )
}

export default connector(withRouter(CompanyServices))
