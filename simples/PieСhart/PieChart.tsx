import React from 'react'
import styles from './PieChart.module.scss'
import classNames from 'classnames'

type Props = {
    value?: number
    revers?: boolean
    radius?: number
    snakeWidth?: number
    classes?: {
        blockHolder?: string
        svgContainer?: string
        gTag?: string
        label?: string
        backCircle?: string
        track?: string
    }
}

/**
 * Тип размеров окружности
 * @param {number | undefined} radius - Радиус окружности
 * @param {number | undefined} diameter - Диаметр окружности
 * @param {number | undefined} snakeWidth - Ширина индикатора заполненности (дорожки)
 */
type CircleSize = {
    radius?: number
    diameter?: number
    snakeWidth?: number
}

/**
 * Метод получения размеров окружности кругового индикатора
 * В случае, если не установлен радиус и толщина границы, возвращаем стандартные размеры
 * @param {CircleSize} sizes - Размеры окружности
 */
const getCircleSize = (sizes: CircleSize): CircleSize => {
    let sumSize: CircleSize = {
        radius: 27,
        diameter: 62,
        snakeWidth: 8,
    }

    if (sizes.radius && sizes.snakeWidth) {
        sumSize.radius = sizes.radius
        sumSize.diameter = sizes.radius * 2 + sizes.snakeWidth
        sumSize.snakeWidth = sizes.snakeWidth

        return sumSize
    }

    if (sizes.radius || sizes.snakeWidth) {
        if (sizes.radius) {
            sumSize.radius = sizes.radius
            sumSize.diameter = sizes.radius * 2 + 8
        }

        if (sizes.snakeWidth) {
            sumSize.radius = (62 - sizes.snakeWidth) / 2
            sumSize.snakeWidth = sizes.snakeWidth
        }
    }

    return sumSize
}

/**
 * Метод получения длины окружности
 * В случае, если не установлен радиус, возвращаем стандартный радиус
 * @param {number} radius - Радиус окружности
 */
const getLengthCircle = (radius: number = 27): number => {
    return 2 * Math.PI * radius
}

/**
 * Метод получения аттрибута d тега path для отображения дорожки текущего уровня в индикаторе
 * В случае, если не установлены размеры, возвращаем стандартную дорожку
 * @param {CircleSize} sizeCircle - Размеры окружности
 */
const getPathD = (sizeCircle: CircleSize) => {
    if (sizeCircle.diameter && sizeCircle.radius && sizeCircle.snakeWidth) {
        return `M ${sizeCircle.diameter / 2 + sizeCircle.snakeWidth / 2}, ${
            sizeCircle.diameter / 2
        } m -${sizeCircle.diameter / 2}, 0 a ${sizeCircle.radius},${
            sizeCircle.radius
        } 0 1,0 ${sizeCircle.diameter - sizeCircle.snakeWidth},0 a ${
            sizeCircle.radius
        },${sizeCircle.radius} 0 1,0 -${
            sizeCircle.diameter - sizeCircle.snakeWidth
        },0`
    } else {
        return `M 35, 31 m -31, 0 a 27,27 0 1,0 54,0 a 27,27 0 1,0 -54,0`
    }
}

/**
 * Метод получения длины дорожки. Вычисление текущей заполненности в процентах
 * В случае, если не установлено текущее значение, возвращаем 0
 * @param {number} value - Текущее значение в индикаторе
 * @param {number} lengthCircle - Заданная длина окружности
 */
const getTrackLength = (value: number = 0, lengthCircle: number): number => {
    return (lengthCircle * value) / 100
}

/**
 * Индикатора заполненности
 * @param {number} value - Текущее значение в индикаторе
 * @param {number} radius - Радиус окружности
 * @param {boolean} revers - Реверс индикатора (отзеркаливание по горизонтали)
 * @param {number} snakeWidth - Ширина индикатора заполненности
 * @param {object} classes - Дополнительные стили
 */
const PieChart: React.FC<Props> = ({
    value,
    radius,
    revers,
    snakeWidth,
    classes = {},
}) => {
    // Получение Размеров окружности
    const sizeCircle: CircleSize = getCircleSize({
        radius: radius,
        snakeWidth: snakeWidth,
    })

    // Получение длины окружности
    const lengthCircle = getLengthCircle(radius)

    // Прорисовка дорожки заполненности
    const svgPathD = getPathD(sizeCircle)

    // Получение длины дорожки заполненности
    const trackLength = getTrackLength(value, lengthCircle)

    // Вывод компонента
    return sizeCircle &&
        sizeCircle.diameter &&
        sizeCircle.radius &&
        sizeCircle.snakeWidth ? (
        <div
            className={classNames(styles.baseTimer, classes.blockHolder)}
            style={{
                width: sizeCircle.diameter,
                height: sizeCircle.diameter,
            }}
        >
            <svg
                className={classNames(
                    styles.baseTimer__svg,
                    classes.svgContainer
                )}
                viewBox={`0 0 ${sizeCircle.diameter} ${sizeCircle.diameter}`}
                xmlns="http://www.w3.org/2000/svg"
            >
                <g
                    className={classNames(
                        styles.baseTimer__circle,
                        classes.gTag
                    )}
                >
                    <circle
                        className={classNames(
                            styles.baseTimer__path_elapsed,
                            classes.backCircle
                        )}
                        strokeWidth={sizeCircle.snakeWidth}
                        cx={sizeCircle.diameter / 2}
                        cy={sizeCircle.diameter / 2}
                        r={sizeCircle.radius}
                    />
                    <path
                        strokeDasharray={`${trackLength} ${lengthCircle}`}
                        className={classNames(
                            styles.baseTimer__pathRemaining,
                            classes.track,
                            {
                                [styles.revers]: revers,
                            }
                        )}
                        strokeWidth={sizeCircle.snakeWidth}
                        d={svgPathD}
                    ></path>
                </g>
            </svg>
            <span
                className={classNames(styles.baseTimer__label, classes.label)}
            >
                {value && value + '%'}
            </span>
        </div>
    ) : null
}

export default PieChart
