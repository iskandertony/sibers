import { forwardRef } from 'react'

import { Button, ButtonProps } from 'antd'
import cx from 'classnames'

import s from './AppButton.module.scss'

type AppButtonOwnProps = {
  variant?: 'primary' | 'success' | 'soft' | 'outline' | 'ghost'
  fullWidth?: boolean
  round?: boolean
  iconOnly?: boolean
}

export type AppButtonProps = Omit<ButtonProps, 'type'> & AppButtonOwnProps

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  ({ className, variant = 'soft', fullWidth, round, iconOnly, size, ...rest }, ref) => {
    return (
      <Button
        {...rest}
        ref={ref}
        type="default"
        size={size}
        className={cx(
          s.buttonWrapper,
          s[variant],
          fullWidth && s.fullWidth,
          round && s.round,
          iconOnly && (size === 'small' ? s.smallIconOnly : s.iconOnly),
          className,
        )}
      />
    )
  },
)

export default AppButton
