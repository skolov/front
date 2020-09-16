import React, { FC, MouseEvent, useCallback, useRef, useState } from 'react'
import classNames from 'classnames'
import styles from './CompanyEmployees.module.scss'
import { ReactComponent as DotsIcon } from '../../../assets/icons/dots.svg'
import { ReactComponent as ArrowIcon } from '../../../assets/icons/arrow-dropdown-ico.svg'
import { Lightbox } from '../../simples/Lightbox'
import {
    FileType,
    CompanyStaff,
    Profile,
    ProfileTranslation,
} from '../../../store/types'
import { ReactComponent as VerifiedIcon } from '../../../assets/icons/verification-ico.svg'
import { Action } from '../ProfileFamily/Item'

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

/**
 * Извлечение перевода профиля по идентификатору языка.
 * Если для указанного языка перевод отсутствует, то извлекаем перевод по-умолчанию
 * @param {Profile} profile - Данные профиля
 * @param {number} langId - идентификатор языка
 */

type Props = {
    avatar?: FileType | null
    name: string
    actions?: Array<Action>
    hide: boolean
    position: string
}

const Item: FC<Props> = ({ name, hide, actions, avatar, position }) => {
    const actionRef = useRef<HTMLDivElement>(null)
    const [actionIsOpen, setActionIsOpen] = useState(false)

    const openAction = useCallback(() => {
        setActionIsOpen(true)
        // @ts-ignore
        document.addEventListener('click', onHandleClickDocument)
        // @ts-ignore
        // eslint-disable-next-line
    }, [setActionIsOpen])

    const closeAction = useCallback(() => {
        setActionIsOpen(false)
        // @ts-ignore
        document.removeEventListener('click', onHandleClickDocument)
        // @ts-ignore
        // eslint-disable-next-line
    }, [setActionIsOpen])

    const onHandleClickAction = useCallback(() => {
        if (actionIsOpen) {
            closeAction()
        } else {
            openAction()
        }
    }, [actionIsOpen, openAction, closeAction])

    const onHandleClickDocument = useCallback(
        (event: MouseEvent) => {
            if (
                event &&
                event.target &&
                actionRef &&
                actionRef.current &&
                actionRef.current.contains(event.target as HTMLElement)
            ) {
                return
            }

            closeAction()
        },
        [closeAction]
    )

    const onHandleClickOption = useCallback(
        (event: MouseEvent<HTMLDivElement>, onClick?: () => void) => {
            if (onClick) {
                onClick()
            }
            closeAction()
        },
        [closeAction]
    )

    const [showAvatar, setShowAvatar] = useState(false)
    const openAvatar = useCallback(() => {
        if (avatar) {
            setShowAvatar(true)
        }
    }, [avatar])

    const closeAvatar = useCallback(() => {
        setShowAvatar(false)
    }, [setShowAvatar])

    let avatarUrl = ''
    if (avatar) {
        if (avatar.thumbnails && avatar.thumbnails.small) {
            avatarUrl = avatar.thumbnails.small
        } else if (avatar.original) {
            avatarUrl = avatar.original
        }
    }

    return (
        <>
            <div
                className={classNames(styles.item, {
                    [styles.itemHide]: hide,
                })}
            >
                <div className={styles.itemCart}>
                    <div className={styles.itemTop}>
                        <div
                            className={styles.itemAvatarPhoto}
                            style={{
                                backgroundImage: avatarUrl
                                    ? `url("${avatarUrl}")`
                                    : 'none',
                            }}
                            onClick={openAvatar}
                        />
                        <div className={styles.itemIntroduce}>
                            <div className={styles.itemName}>
                                <span className={styles.itemNameText}>
                                    <span>{name}</span>
                                </span>
                            </div>
                            <div className={styles.itemPosition}>
                                <span className={styles.itemText}>
                                    <span>{position}</span>
                                </span>
                            </div>
                        </div>

                        {actions && actions.length > 0 && (
                            <div className={styles.itemActions} ref={actionRef}>
                                <button
                                    className={styles.itemActionsButton}
                                    onClick={onHandleClickAction}
                                >
                                    <DotsIcon />
                                </button>

                                {actionIsOpen && (
                                    <div className={styles.itemActionsMenu}>
                                        {actions.map((action, index) => (
                                            <div
                                                className={
                                                    styles.itemActionsOption
                                                }
                                                onClick={(event) =>
                                                    onHandleClickOption(
                                                        event,
                                                        action.onClick
                                                    )
                                                }
                                                key={index}
                                            >
                                                {action.title}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showAvatar && avatar && (
                <Lightbox
                    photos={[avatar]}
                    startIndex={0}
                    onClose={closeAvatar}
                />
            )}
        </>
    )
}

export default Item
