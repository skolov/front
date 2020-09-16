import React, { FC, useEffect, useState, useCallback } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import i18nProfile from '../../../utils/i18nProfile'
import style from './EstateEdit.module.scss'
import { estateFieldsTypes, estateAllTypes } from '../../../constants'
import {
    EstateTypes,
    EstateType,
    EstateParamsGroups,
    EstateParam,
    FieldsType,
} from '../../../store/types'
import { FormTextField } from '../../simples/FormTextField'
import { useForm, Control } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers'
import { FormSelect } from '../../simples/FormSelect'
import { FormCheckboxLabel } from '../../simples/FormCheckboxLabel'
import { TFunction } from 'i18next'
import { EditingFormInputs } from '../../pages/RealEstateCreate/RealEstateCreate'

const getParamsForSection = (
    estateParam: EstateParamsGroups | null,
    currentEstate: EstateType | null
): EstateParam[] | null | undefined => {
    let params: EstateParam[] | undefined = []

    if (estateParam === null || !currentEstate) {
        return null
    }

    params = currentEstate.paramsGroups[estateParam]

    return params
}

const renderField = (
    item: EstateParam,
    control: Control<EditingFormInputs>,
    t: TFunction
) => {
    let field: JSX.Element = <></>

    switch (estateFieldsTypes[item].type) {
        case FieldsType.TextField:
            field = (
                <FormTextField
                    label={t(`param_${item}`)}
                    name={item}
                    control={control}
                ></FormTextField>
            )
            break

        case FieldsType.Select:
            let options = estateFieldsTypes[item].options

            if (options) {
                field = (
                    <FormSelect
                        options={options}
                        control={control}
                        name={item}
                        label={t(`param_${item}`)}
                    ></FormSelect>
                )
            }
            break

        case FieldsType.Checkbox:
            field = (
                <FormCheckboxLabel
                    label={t(`param_${item}`)}
                    control={control}
                    name={item}
                ></FormCheckboxLabel>
            )
        default:
            break
    }

    return field
}

const getCurrentEstate = (
    typeEstate: EstateTypes | null
): EstateType | null => {
    let currentEstate: EstateType | null = null

    if (typeEstate) {
        currentEstate = estateAllTypes[typeEstate]
    }

    return currentEstate
}

type Props = {
    typeEstate?: EstateTypes | null
    params?: any
    schema?: any
}

const EstateEditParams: FC<Props> = ({
    typeEstate = EstateTypes.Flat,
    params,
    schema,
}) => {
    const { t, i18n } = useTranslation()

    // Подключение валидации к заполняемой форме
    const {
        handleSubmit,
        control,
        errors,
        reset,
        watch,
        setError,
        setValue,
    } = useForm<EditingFormInputs>({
        defaultValues: params,
        resolver: yupResolver(schema),
    })

    if (!typeEstate) return null
    const currentEstate: EstateType | null = getCurrentEstate(typeEstate)

    const paramsMain: EstateParam[] | null | undefined = getParamsForSection(
        EstateParamsGroups.Params,
        currentEstate
    )

    const paramsAppliances = getParamsForSection(
        EstateParamsGroups.Appliances,
        currentEstate
    )
    const paramsBeds = getParamsForSection(
        EstateParamsGroups.Beds,
        currentEstate
    )

    const paramsComforts = getParamsForSection(
        EstateParamsGroups.Comfort,
        currentEstate
    )
    const paramsMultimedia = getParamsForSection(
        EstateParamsGroups.Multimedia,
        currentEstate
    )
    const paramsResolutions = getParamsForSection(
        EstateParamsGroups.Resolutions,
        currentEstate
    )

    const getFormedParams = () => {
        let formedParams: JSX.Element[] = []

        if (paramsMain) {
            for (let index = 0; index < paramsMain.length; index += 2) {
                let oneRow: JSX.Element
                oneRow = (
                    <div className={style.formRow}>
                        <div className={style.formCol}>
                            {renderField(paramsMain[index], control, t)}
                        </div>
                        <div className={style.formCol}>
                            {paramsMain[index + 1] &&
                                renderField(paramsMain[index + 1], control, t)}
                        </div>
                    </div>
                )

                formedParams.push(oneRow)
            }
        }

        return formedParams
    }

    return (
        <>
            <div className={style.formWrap}>
                <div className={style.estateFormSection}>
                    <h2 className={style.estateFormSectionTitle}>
                        {t('estate_params_window_address_estate_title')}
                    </h2>
                    <p className={style.estateFormSectionDescription}>
                        {t('estate_params_window_address_estate_under_title')}
                    </p>
                    {getFormedParams()}
                </div>
            </div>

            <div className={style.formWrap}>
                <div className={style.estateFormSection}>
                    <h2 className={style.estateFormSectionTitle}>
                        {t('estate_params_window_facilities_estate_title')}
                    </h2>
                    <p className={style.estateFormSectionDescription}>
                        {t(
                            'estate_params_window_facilities_estate_under_title'
                        )}
                    </p>

                    <div className={style.formRow}>
                        {paramsBeds &&
                            paramsBeds.map((item) => (
                                <div className={style.formCol}>
                                    {renderField(item, control, t)}
                                </div>
                            ))}
                        {paramsBeds && paramsBeds.length < 2 && (
                            <div className={style.formCol}></div>
                        )}
                    </div>

                    <div className={style.containerParams}>
                        {paramsComforts && (
                            <div className={style.columnParams}>
                                <p className={style.columnParamsHeader}>
                                    {t('params_title_section_comfort')}
                                </p>
                                {paramsComforts.map((item) =>
                                    renderField(item, control, t)
                                )}
                            </div>
                        )}
                        {paramsMultimedia && (
                            <div className={style.columnParams}>
                                <p className={style.columnParamsHeader}>
                                    {t('params_title_section_multimedia')}
                                </p>
                                {paramsMultimedia.map((item) =>
                                    renderField(item, control, t)
                                )}
                            </div>
                        )}

                        {paramsResolutions && (
                            <div className={style.columnParams}>
                                <p className={style.columnParamsHeader}>
                                    {t('params_title_section_resolutions')}
                                </p>
                                {paramsResolutions.map((item) =>
                                    renderField(item, control, t)
                                )}
                            </div>
                        )}

                        {paramsAppliances && (
                            <div className={style.columnParams}>
                                <p className={style.columnParamsHeader}>
                                    {t('params_title_section_appliances')}
                                </p>
                                {paramsAppliances.map((item) =>
                                    renderField(item, control, t)
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default EstateEditParams
