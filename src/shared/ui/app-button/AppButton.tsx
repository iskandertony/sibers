import { forwardRef } from 'react'

import { Button, type ButtonProps } from 'antd'
import classNames from 'classnames'

import styles from './AppButton.module.scss'

type AppButtonProps = ButtonProps & {
  fullWidth?: boolean
  round?: boolean
  iconOnly?: boolean
}

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  ({ className, fullWidth, round, iconOnly, size, ...rest }, ref) => {
    const iconOnlyClass = iconOnly ? (size === 'small' ? styles.smallIconOnly : styles.iconOnly) : undefined

    return (
      <Button
        ref={ref}
        {...rest}
        className={classNames(
          styles.buttonWrapper,
          fullWidth && styles.fullWidth,
          round && styles.round,
          iconOnlyClass,
          className,
        )}
      />
    )
  },
)

export default AppButton
