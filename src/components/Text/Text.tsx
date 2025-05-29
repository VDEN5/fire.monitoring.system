import classNames from 'classnames';

import * as React from 'react';
import styles from './Text.module.scss';

export type TextProps = {
  /** Дополнительный класс */
  className?: string;
  /** Стиль отображения */
  view?: 'title' | 'subtitle' | 'button' | 'p-20' | 'p-18' | 'p-16' | 'p-14';
  /** Html-тег */
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'p' | 'span';
  /** Начертание шрифта */
  weight?: 'normal' | 'medium' | 'bold';
  /** Контент */
  children: React.ReactNode;
  /** Цвет */
  color?: 'primary' | 'secondary' | 'accent' | 'safety' | 'danger';
  /** Максимальное кол-во строк */
  maxLines?: number;
};

const Text: React.FC<TextProps> = (props) => {
  const { className, view, tag = 'p', weight, color, maxLines, ...other } = props;
  const classes = classNames(
    styles['default'],
    {
      [styles[`view_${view}`]]: view,
      [styles[`weight_${weight}`]]: weight,
      [styles[`color_${color}`]]: color,
      [styles[`lines`]]: maxLines,
    },
    className,
  );

  const maxLinesStyle = maxLines
    ? {
        WebkitLineClamp: maxLines,
      }
    : {};

  const Component = tag;
  return <Component {...other} className={classes} style={maxLinesStyle}></Component>;
};

export default Text;
