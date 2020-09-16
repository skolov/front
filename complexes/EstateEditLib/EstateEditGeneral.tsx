import React, { FC, useState, useCallback, useEffect } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import style from './EstateEdit.module.scss'
import { Select } from '../../simples/Select'
import {
    kindsEstateOptions,
    typesEstateGarageOptions,
    typesEstateCommercialOptions,
    typesEstateResidentialOptions,
    estateKindsOptions,
} from '../../../constants'
import { TextField } from '../../simples/TextField'
import { Map, Marker } from '../../simples/Map'
import memoizeOne from 'memoize-one'
import {
    LocationValue,
    LocationError,
    LocationTextField,
} from '../../simples/LocationTextField'
import { EstateKinds, EstateParam, EstateTypes } from '../../../store/types'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers'
import { EditingFormInputs } from '../../pages/RealEstateCreate/RealEstateCreate'
import { FormSelect } from '../../simples/FormSelect'
import { FormTextField } from '../../simples/FormTextField'

const getMarker = memoizeOne((value?: LocationValue): Marker | undefined => {
    if (!value) {
        return
    }

    return {
        latitude: +value.latitude,
        longitude: +value.longitude,
    }
})

type Props = {
    schema?: any
    params?: any
    onChange?: (params: EditingFormInputs) => void
}

const EstateEditGeneral: FC<Props> = ({ schema, params, onChange }) => {
    const { t, i18n } = useTranslation()

    const {
        handleSubmit,
        control,
        errors,
        reset,
        watch,
        setError,
        setValue,
        getValues,
    } = useForm<EditingFormInputs>({
        defaultValues: params,
        resolver: yupResolver(schema),
    })

    const [legalAddress, setLegalAddress] = useState<LocationValue>()
    const [legalAddressError, setLegalAddressError] = useState('')

    const changeLegalAddress = useCallback(
        (location?: LocationValue, error?: LocationError) => {
            setLegalAddress(location)
            setLegalAddressError(error && error.message ? error.message : '')
        },
        [setLegalAddress, setLegalAddressError]
    )

    const classes = {
        input: style.textareaDescription,
    }

    const watchKindEstate = watch([
        EstateParam.estate_kind,
        EstateParam.estate_type,
    ])

    const kindEstate = getValues(EstateParam.estate_kind)
    const typeEstate = getValues(EstateParam.estate_type)
    //console.log(watchKindEstate[EstateParam.estate_type])

    useEffect(() => {
        //const { EstateParam.estate_kind } = watchKindEstate
    }, [getValues, watchKindEstate])

    return (
        <div className={style.formWrap}>
            <div className={style.estateFormSection}>
                <h2 className={style.estateFormSectionTitle}>
                    {t('estate_general_window_type_estate_title')}
                </h2>
                <p className={style.estateFormSectionDescription}>
                    {t('estate_general_window_type_estate_under_title')}
                </p>

                <div className={style.formRow}>
                    <div className={style.formCol}>
                        <FormSelect
                            options={kindsEstateOptions}
                            label={t(
                                'estate_general_window_kind_estate_label_textfield'
                            )}
                            name={EstateParam.estate_kind}
                            control={control}
                        ></FormSelect>
                    </div>
                    <div className={style.formCol}>
                        {kindEstate && (
                            <FormSelect
                                options={
                                    kindEstate === 1
                                        ? typesEstateResidentialOptions
                                        : kindEstate === 2
                                        ? typesEstateCommercialOptions
                                        : typesEstateGarageOptions
                                }
                                label={t(
                                    'estate_general_window_type_estate_label_textfield'
                                )}
                                name={EstateParam.estate_type}
                                control={control}
                            ></FormSelect>
                        )}
                    </div>
                </div>
            </div>

            {typeEstate && (
                <>
                    <div className={style.estateFormSection}>
                        <h2 className={style.estateFormSectionTitle}>
                            {t(
                                'estate_general_window_description_estate_title'
                            )}
                        </h2>
                        <p className={style.estateFormSectionDescription}>
                            {t(
                                'estate_general_window_description_estate_under_title'
                            )}
                        </p>

                        <div className={style.formRow}>
                            <div className={style.formCol}>
                                <FormTextField
                                    classes={classes}
                                    label={t(
                                        'estate_general_window_description_estate_label_textfield'
                                    )}
                                    name={EstateParam.description}
                                    control={control}
                                    multiline
                                />
                            </div>
                        </div>
                    </div>

                    <div className={style.estateFormSection}>
                        <h2 className={style.estateFormSectionTitle}>
                            {t('estate_general_window_address_estate_title')}
                        </h2>
                        <p className={style.estateFormSectionDescription}>
                            {t(
                                'estate_general_window_address_estate_under_title'
                            )}
                        </p>

                        <div className={style.formRow}>
                            <div className={style.formCol}>
                                <LocationTextField
                                    label={t('create_company_location_field')}
                                    value={legalAddress}
                                    onChange={changeLegalAddress}
                                    type="address"
                                    langCode={i18n.language}
                                    error={!!legalAddressError}
                                    helperText={t(legalAddressError)}
                                />
                            </div>
                        </div>

                        <div className={style.mapUnderlay}>
                            <Map
                                langCode={i18n.language}
                                marker={getMarker(legalAddress)}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default EstateEditGeneral
