import React from 'react'
import styles from './RealEstateContainer.module.scss'

import { EstateItem } from '../EstateItem'

export type BreadCrumb = {
    url?: string
    title: string
}

type Props = {}

const Layout: React.FC<Props> = ({}) => {
    return (
        <div className={styles.wrap}>
            <EstateItem></EstateItem>
            <EstateItem></EstateItem>
            <EstateItem></EstateItem>
            <EstateItem></EstateItem>
            <EstateItem></EstateItem>
            <EstateItem></EstateItem>
        </div>
    )
}

export default Layout
