import classNames from 'classnames';
import React from 'react';
import Text from '@components/Text';
import styles from './Button.module.scss';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Состояние загрузки */
  loading?: boolean;
  /** Текст кнопки */
  children: React.ReactNode;

  disabled?: boolean;
  className?: string;
};

const Button: React.FC<ButtonProps> = (props) => {
  const { className, disabled, children, ...others } = props;
  const classes = classNames(
    className,
    styles['primary__default'],
    {
      [styles['primary__disabled']]: disabled,
    },
  );
  return (
    <button {...others} className={classes} disabled={disabled}>
      <Text tag="div" view="button">
        {children}
      </Text>
    </button>
  );
};

export default Button;
