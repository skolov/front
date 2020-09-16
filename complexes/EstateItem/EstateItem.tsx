import React, { FC, useState } from 'react'
import styles from './EstateItem.module.scss'
import classNames from 'classnames'

import { useTranslation } from '../../hooks/useTranslation'
import i18nProfile from '../../../utils/i18nProfile'

import { ReactComponent as DocsExIcon } from '../../../assets/icons/prototype/docs.svg'
import { ReactComponent as RatingExIcon } from '../../../assets/icons/prototype/rating.svg'
import { ReactComponent as ProgressExIcon } from '../../../assets/icons/prototype/progress.svg'
import { ReactComponent as PropertyIcon } from '../../../assets/icons/prototype/proprty-icon.svg'
import ImageOne from '../../../assets/images/nastuh-abootalebi-rSpMla5RItA-unsplash 1.png'
import ImageTwo from '../../../assets/images/toa-heftiba-FV3GConVSss-unsplash 1.png'

type Props = {
    item?: {
        address: string
        rating: number
        languages: []
    }
    classes?: {
        root?: string
    }
}

const ProfileItem: FC<Props> = ({ item, classes = {} }) => {
    const { t } = useTranslation({ ns: 'profile', i18n: i18nProfile })
    const [imageDisplay, setImageDisplay] = useState<Number>(0)

    const onHoverHandle = (index: number) => {
        setImageDisplay(index)
    }

    const getImages = (): JSX.Element[] => {
        let images: JSX.Element[] = []
        for (let index = 0; index < 4; index++) {
            images.push(
                <img
                    alt=""
                    key={index}
                    src={index % 2 ? ImageOne : ImageTwo}
                    className={classNames(styles.image, {
                        [styles.imageDisplay]: index === imageDisplay,
                    })}
                />
            )
        }
        return images
    }

    const getHoverElement = (): JSX.Element[] => {
        let hovers: JSX.Element[] = []
        for (let index = 0; index < 4; index++) {
            hovers.push(
                <span
                    key={index}
                    className={classNames(styles.itemHover, {
                        [styles.itemHovered]: index === imageDisplay,
                    })}
                    onMouseEnter={() => {
                        onHoverHandle(index)
                    }}
                ></span>
            )
        }
        return hovers
    }

    return (
        <div className={classNames(styles.propertyItem, classes.root)}>
            <div className={styles.imageHolder}>
                <div className={styles.statusFlat}>Неактивно</div>
                <div className={styles.topIcon}>
                    <PropertyIcon />
                </div>
                {getImages()}
            </div>
            <div className={styles.hoverHolder}>{getHoverElement()}</div>
            <div className={styles.itemInfo}>
                <div className={styles.statuses}>
                    <div>
                        <ProgressExIcon style={{ marginRight: 15 }} />
                        <DocsExIcon />
                    </div>
                    <RatingExIcon />
                </div>
                <p className={classNames(styles.address, styles.greenText)}>
                    SLanges gate 13, Erika LaFantan
                </p>
                <div className={classNames(styles.apartment, styles.greenText)}>
                    <p className={styles.description}>Квартира, 2 комн.</p>
                    <p className={styles.space}>92/98м2</p>
                </div>
                <p className={classNames(styles.greenText, styles.languages)}>
                    <u>ENG</u> / RUS / CHN
                </p>
            </div>
        </div>
    )
}

export default ProfileItem
