import React, { type JSX } from 'react';
import styles from './ResultChain.module.scss';
import { Link } from 'react-router';
import { routes } from '@config/routes';
import rootStore from '@store/RootStore';
import { observer } from 'mobx-react-lite';
import { getTimeNow } from '@config/utils';
import Text from '@components/Text';
import Loader from '@components/Loader';

type DetectionItem = {
  id: string;
  timestamp: string;
  imageInfo: { path: string; name: string };
  results?: {
    pixels: {
      openedClosed: { path: string; whitePercentage: number };
    };
    yolo: {
      path: string;
      fireCount: number;
      maxProb: number;
      meanProb: number;
    };
  };
  fire?: boolean;
  connect?: boolean;
  fireCountWithinRadius?: number;
  totalCountWithinRadius?: number;
};

type DetectionGroup = {
  timestamp: number;
  data: DetectionItem[];
  radiusKm?: number;
  lastValidState?: DetectionItem[];
};

const ResultChain: React.FC = () => {
  const formatDateTime = (dateString: string | number): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
  };

  const formatPercent = (percent: number): string => percent.toFixed(2);

  // Объединяем все детекции в один массив для обработки
  const allDetections = [
    { data: rootStore.main.detections, name: 'detections' },
  ];

  // Рендер строки таблицы для одного элемента детекции
  const renderDetectionRow = (detItem: DetectionItem, det: DetectionGroup, isLastValid = false) => {
    if (!detItem.results) {
      return (
        <tr key={detItem.id} className={styles.chainRow}>
          <td className={styles.idCell}>
            <Text color="accent">{detItem.id}</Text>
          </td>
          <td className={styles.errorCell} colSpan={isLastValid ? 7 : 10}>
            <Text color="danger">Нет данных</Text>
          </td>
          <td className={styles.gridCell}>
            <div className={styles.fireDetected}>
              {detItem.connect ? '✅' : '❌'}
            </div>
          </td>
        </tr>
      );
    }

    const commonCells = (
      <>
        <td className={styles.idCell}>
          <Text color="accent">{detItem.id}</Text>
        </td>
        <td className={styles.dateCell}>
          <Text color="accent">{formatDateTime(detItem.timestamp)}</Text>
        </td>
        <td className={styles.gridCell}>
          <img
            src={detItem.imageInfo.path}
            alt={`Исходное изображение ${detItem.id}`}
            className={styles.smallImage}
          />
        </td>
        <td className={styles.gridCell}>
          <div className={styles.algorithmContent}>
            <Text
              weight="bold"
              color={
                detItem.results.pixels.openedClosed.whitePercentage > 0
                  ? 'danger'
                  : 'safety'
              }
              className={styles.percentage}
            >
              {formatPercent(detItem.results.pixels.openedClosed.whitePercentage)}%
            </Text>
            <img
              src={detItem.results.pixels.openedClosed.path}
              alt={`Попиксельная обработка ${detItem.id}`}
              className={styles.algorithmImage}
            />
          </div>
        </td>
        <td className={styles.gridCell}>
          <div className={styles.algorithmContent}>
            <Text tag="div" weight="bold" view="p-20">
              {detItem.results.yolo.fireCount > 0 ? (
                <Text color="safety">✓</Text>
              ) : (
                <Text color="danger">✗</Text>
              )}
            </Text>
            <img
              src={detItem.results.yolo.path}
              alt={`YOLO ${detItem.id}`}
              className={styles.algorithmImage}
            />
          </div>
        </td>
        <td className={styles.percentageCell}>
          <Text color="accent">
            {formatPercent(detItem.results.yolo.maxProb * 100)}%
          </Text>
        </td>
        <td className={styles.percentageCell}>
          <Text color="accent">
            {formatPercent(detItem.results.yolo.meanProb * 100)}%
          </Text>
        </td>
        <td className={styles.gridCell}>
          <div className={detItem.fire ? styles.fireDetected : styles.noFire}>
            {detItem.fire ? '🔥' : '❌'}
          </div>
        </td>
      </>
    );

    if (isLastValid) {
      return (
        <tr key={detItem.id} className={styles.chainRow}>
          {commonCells}
          <td className={styles.gridCell}>
            <div className={styles.fireDetected}>
              {detItem.connect ? '✅' : '❌'}
            </div>
          </td>
        </tr>
      );
    }

    return (
      <tr key={detItem.id} className={styles.chainRow}>
        {commonCells}
        <td className={styles.radiusCell}>
          <Text color="accent">{det.radiusKm} км</Text>
        </td>
        <td className={styles.fireRatioCell}>
          <Text color="accent">
            {detItem.fireCountWithinRadius}/{detItem.totalCountWithinRadius}
          </Text>
        </td>
        <td className={styles.detailsCell}>
          <Link
            to={routes.result.create(det.timestamp, getTimeNow(detItem.timestamp))}
            className={styles.detailsLink}
          >
            <Text tag="div" view="p-16">Подробнее</Text>
          </Link>
        </td>
      </tr>
    );
  };

  // Рендер таблицы с данными
  const renderTable = (title: string, data: DetectionGroup[], isLastValid = false) => (
    <>
      <Text className={styles.title} view="p-20" color="danger">
        {title}
      </Text>
      <table className={styles.resultChain}>
        <thead className={styles.tableHead}>
          <tr className={styles.chainHeader}>
            {[
              'ID камеры',
              'Дата и Время',
              'Исходное изображение',
              'Пиксельный анализ',
              'YOLO',
              'Максимальный % (YOLO)',
              'Cредний % (YOLO)',
              'Огонь',
              ...(isLastValid ? [] : ['Радиус (км)', 'Огонь в радиусе', 'Детали'])
            ].map((txt) => (
              <th key={txt}>
                <Text tag="div" view="p-16" weight="bold">
                  {txt}
                </Text>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!rootStore.main.isLoaded && (
            <tr className={styles.chainRow}>
              <td className={styles.errorCell} colSpan={isLastValid ? 9 : 11}>
                <Loader />
              </td>
            </tr>
          )}
          {data.map((det) => (
            <React.Fragment key={det.timestamp}>
              {det.data.map((detItem) => renderDetectionRow(detItem, det, isLastValid))}
              <tr className={styles.rowGap}>
                <td colSpan={isLastValid ? 9 : 11}></td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </>
  );

  return (
    <div className={styles.resultChainContainer}>
      {renderTable(
        'Последние верные данные с камер:',
        allDetections
          .map(d => d.data.at(-1)?.lastValidState ? { 
            timestamp: d.data.at(-1)!.timestamp, 
            data: d.data.at(-1)!.lastValidState! 
          } : null)
          .filter(Boolean) as DetectionGroup[],
        true
      )}
      
      {renderTable(
        'Текущие данные с камер:',
        allDetections.flatMap(d => d.data),
        false
      )}
    </div>
  );
};

export default observer(ResultChain);