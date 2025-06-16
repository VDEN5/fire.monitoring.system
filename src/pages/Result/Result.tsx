import React from 'react';
import { useParams, Link, Navigate } from 'react-router';
import rootStore from '@store/RootStore';
import { routes } from '@config/routes';
import styles from './Result.module.scss';
import Text from '@components/Text';
import Button from '@components/Button';

const Result: React.FC = () => {
  const params = useParams();
  const detId = Number(params.detId);
  const detCameraId = Number(params.detCameraId);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const detections = rootStore.main.detections;

  if (detections.length === 0) {
    return <Navigate to={routes.main.create()} replace />;
  }

  const detection = detections.find((d) => d.timestamp === detId);
  if (!detection) {
    return <Navigate to={routes.main.create()} replace />;
  }

  const detItem = detection.data.find((item) => {
    const itemTime = new Date(item.timestamp).getTime();
    return itemTime === detCameraId;
  });

  if (!detItem) {
    return <Navigate to={routes.main.create()} replace />;
  }

  const {
    imageInfo,
    results: { pixels, yolo },
    timestamp,
  } = detItem;

  const { closed, dilated, eroded, opened, openedClosed } = pixels;

  return (
    <div className="container">
      <div className={styles.inner}>
        <Link to={routes.main.create()} className={styles.backLink}>
          <Button>Вернуться на основную страницу</Button>
        </Link>

        <div className={styles.section}>
          <Text tag="h2">Исходное изображение</Text>
          <img
            src={imageInfo.path}
            alt={imageInfo.name}
            className={styles.imageMain}
          />
          <Text>
            <strong>ID камеры: </strong>
            {detItem.id}
          </Text>
          <Text>
            <strong>Координаты (широта, долгота): </strong>(
            {detItem.coordinates.latitude.toFixed(5)},{' '}
            {detItem.coordinates.longitude.toFixed(5)})
          </Text>
          <Text>
            <strong>Время: </strong>
            {new Date(timestamp).toLocaleString('ru-RU')}
          </Text>
        </div>

        <div className={styles.section}>
          <Text tag="h2">Обработка изображения (Pixel operations)</Text>
          <div className={styles.pixelGrid}>
            {[
              { title: 'Дилатация', data: dilated },
              { title: 'Эрозия', data: eroded },
              { title: 'Открытие', data: opened },
              { title: 'Закрытие', data: closed },
              { title: 'Открытие + Закрытие', data: openedClosed },
            ].map(({ title, data }) => (
              <div className={styles.pixelItem} key={title}>
                <Text tag="h3">{title}</Text>
                <img src={data.path} alt={title} />
                <Text className={styles.percent}>
                  {data.whitePercentage.toFixed(2)}%
                </Text>
              </div>
            ))}
          </div>
        </div>

        <div className={`${styles.section} ${styles.yoloSection}`}>
          <Text tag="h2">YOLO результаты</Text>
          <img src={yolo.path} alt="YOLO" className={styles.imageMain} />
          <Text>
            <strong>Количество распознанных объектов:</strong> {yolo.fireCount}
          </Text>
          <Text>
            <strong>Максимальная вероятность: </strong>
            {(yolo.maxProb * 100).toFixed(2)}%
          </Text>
          <Text>
            <strong>Средняя вероятность: </strong>
            {(yolo.meanProb * 100).toFixed(2)}%
          </Text>
        </div>
      </div>
    </div>
  );
};

export default Result;
