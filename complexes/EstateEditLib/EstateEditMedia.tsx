import React, { FC, useEffect, useState, useCallback } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { TextField } from '../../simples/TextField'
import { PhotoEditor } from '../PhotoEditor'
import style from './EstateEdit.module.scss'

type Props = {}

const EstateEditGeneral: FC<Props> = ({}) => {
    const { t, i18n } = useTranslation()

    const [url, setUrl] = useState('')
    // Temp
    const onHandleUrlChange = useCallback((event) => {
        setUrl(event.target.value)
    }, [])

    const classes = {
        input: style.textareaDescription,
    }

    return (
        <div className={style.formWrap}>
            <div className={style.estateFormSection}>
                <h2 className={style.estateFormSectionTitle}>
                    {t('estate_photos_window_photo_estate_title')}
                </h2>
                <p className={style.estateFormSectionDescription}>
                    {t('estate_photos_window_photo_estate_under_title')}
                </p>

                <div className={style.photosEditorWrapper}>
                    <PhotoEditor
                        id="company-photos"
                        gallery={undefined}
                        classes={{ photosContainer: style.photosContainer }}
                        uploadHandler={undefined}
                        deleteHandler={undefined}
                        onChange={undefined}
                        i18n={undefined}
                        countLimit={undefined}
                        sortable={true}
                    />
                </div>

                <h2 className={style.estateFormSectionTitle}>
                    {t('estate_photos_window_video_estate_title')}
                </h2>
                <p className={style.estateFormSectionDescription}>
                    {t('estate_photos_window_video_estate_under_title')}
                </p>

                <div className={style.formRow}>
                    <div className={style.formCol}>
                        <TextField
                            label={t('estate_photos_window_link_youtube')}
                            value={url}
                            onChange={onHandleUrlChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EstateEditGeneral
