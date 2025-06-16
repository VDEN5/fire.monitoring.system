import React, { type JSX } from 'react';
import styles from './ResultChain.module.scss';
import { Link } from 'react-router';
import { routes } from '@config/routes';
import rootStore from '@store/RootStore';
import { observer } from 'mobx-react-lite';
import { getTimeNow } from '@config/utils';
import Text from '@components/Text';
import Loader from '@components/Loader';

const ResultChain: React.FC = () => {
  const formatDateTime = (dateString: string | number): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
  };

  const formatPercent = (percent: number): string => {
    return percent.toFixed(2);
  };

  const lastValidState = rootStore.main.detections.at(-1)?.lastValidState;

  return (
    <div className={styles.resultChainContainer}>
      <Text className={styles.title} view="p-20" color="danger">
        Последние верные данные с камер:
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
              'Соединение',
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
              <td className={styles.errorCell} colSpan={10}>
                <Loader></Loader>
              </td>
            </tr>
          )}
          {lastValidState &&
            lastValidState.map((detItem) => {
              if (detItem.results) {
                return (
                  <tr key={detItem.id} className={styles.chainRow}>
                    <td className={styles.idCell}>
                      <Text color="accent">{detItem.id}</Text>
                    </td>
                    <td className={styles.dateCell}>
                      <Text color="accent">
                        {formatDateTime(detItem.timestamp)}
                      </Text>
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
                            detItem.results.pixels.openedClosed
                              .whitePercentage > 0
                              ? 'danger'
                              : 'safety'
                          }
                          className={styles.percentage}
                        >
                          {formatPercent(
                            detItem.results.pixels.openedClosed.whitePercentage
                          )}
                          %
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
                      <div
                        className={
                          detItem.fire ? styles.fireDetected : styles.noFire
                        }
                      >
                        {detItem.fire ? '🔥' : '❌'}
                      </div>
                    </td>
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
                  <td className={styles.idCell}>
                    <Text color="accent">{detItem.id}</Text>
                  </td>
                  <td className={styles.errorCell} colSpan={7}>
                    <Text color="danger">Нет данных</Text>
                  </td>
                  <td className={styles.gridCell}>
                    <div className={styles.fireDetected}>
                      {detItem.connect ? '✅' : '❌'}
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      <Text className={styles.title} view="p-20" color="danger">
        Текущие данные с камер:
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
              'Радиус (км)',
              'Огонь в радиусе',
              'Детали',
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
              <td className={styles.errorCell} colSpan={11}>
                <Loader></Loader>
              </td>
            </tr>
          )}
          {rootStore.main.detections.reduceRight<JSX.Element[]>((acc, det) => {
            acc.push(
              <React.Fragment key={det.timestamp}>
                {det.data.map((detItem) => {
                  if ('error' in detItem) {
                    return (
                      <tr key={detItem.id} className={styles.chainRow}>
                        <td className={styles.idCell}>
                          <Text color="accent">{detItem.id}</Text>
                        </td>
                        <td className={styles.errorCell} colSpan={10}>
                          <Text color="danger">Нет соединения</Text>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={detItem.id} className={styles.chainRow}>
                      <td className={styles.idCell}>
                        <Text color="accent">{detItem.id}</Text>
                      </td>
                      <td className={styles.dateCell}>
                        <Text color="accent">
                          {formatDateTime(detItem.timestamp)}
                        </Text>
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
                              detItem.results.pixels.openedClosed
                                .whitePercentage > 0
                                ? 'danger'
                                : 'safety'
                            }
                            className={styles.percentage}
                          >
                            {formatPercent(
                              detItem.results.pixels.openedClosed
                                .whitePercentage
                            )}
                            %
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
                        <div
                          className={
                            detItem.fire ? styles.fireDetected : styles.noFire
                          }
                        >
                          {detItem.fire ? '🔥' : '❌'}
                        </div>
                      </td>
                      <td className={styles.radiusCell}>
                        <Text color="accent">{det.radiusKm} км</Text>
                      </td>
                      <td className={styles.fireRatioCell}>
                        <Text color="accent">
                          {detItem.fireCountWithinRadius}/
                          {detItem.totalCountWithinRadius}
                        </Text>
                      </td>
                      <td className={styles.detailsCell}>
                        <Link
                          to={routes.result.create(
                            det.timestamp,
                            getTimeNow(detItem.timestamp)
                          )}
                          className={styles.detailsLink}
                        >
                          <Text tag="div" view="p-16">
                            Подробнее
                          </Text>
                        </Link>
                      </td>
                    </tr>
                  );
                })}

                <tr className={styles.rowGap}>
                  <td colSpan={9}></td>
                </tr>
              </React.Fragment>
            );
            return acc;
          }, [])}
        </tbody>
      </table>
    </div>
  );
};

export default observer(ResultChain);
