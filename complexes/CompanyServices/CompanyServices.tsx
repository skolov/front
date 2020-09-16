import React from 'react'
import styles from './CompanyServices.module.scss'
import classNames from 'classnames'
import { useTranslation } from '../../hooks/useTranslation'
import i18nProfile from '../../../utils/i18nProfile'
import { ReactComponent as EditIcon } from '../../../assets/icons/prototype/pencil-edit-ico.svg'
import { CompanyTranslation } from '../../../store/types'

type Props = {
    currentTranslation: CompanyTranslation | undefined
    onEdit?: () => void
}

const CompanyServices: React.FC<Props> = ({ currentTranslation, onEdit }) => {
    const { t } = useTranslation({ i18n: i18nProfile, ns: 'profile' })

    // Вывод компонента
    return currentTranslation ? (
        <div className={styles.wrap}>
            {onEdit && <EditIcon onClick={onEdit} className={styles.editBtn} />}

            <h1 className={styles.title}>
                {t('company_provided_services_title')}:
            </h1>
            <div className={styles.holder}>
                {currentTranslation &&
                currentTranslation.services_provided &&
                currentTranslation.services_provided.length !== 0
                    ? currentTranslation.services_provided.map((item: any) => (
                          <span>{item}</span>
                      ))
                    : t('company_provided_services_choose_services')}
            </div>
        </div>
    ) : null
}

export default CompanyServices
