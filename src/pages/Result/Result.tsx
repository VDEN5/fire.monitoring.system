import React from 'react';
import { useParams, Link, Navigate } from 'react-router';
import rootStore from '@store/RootStore';
import { routes } from '@config/routes';
import styles from './Result.module.scss';
import Text from '@components/Text';
import Button from '@components/Button';

type DetectionItem = {
  id: string;
  coordinates: { latitude: number; longitude: number };
  timestamp: string;
  imageInfo: { path: string; name: string };
  results: {
    pixels: {
      closed: { path: string; whitePercentage: number };
      dilated: { path: string; whitePercentage: number };
      eroded: { path: string; whitePercentage: number };
      opened: { path: string; whitePercentage: number };
      openedClosed: { path: string; whitePercentage: number };
    };
    yolo: {
      path: string;
      fireCount: number;
      maxProb: number;
      meanProb: number;
    };
  };
};

const Result: React.FC = () => {
  const params = useParams();
  const detId = Number(params.detId);
  const detCameraId = Number(params.detCameraId);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Получаем все детекции одним массивом
  const allDetections = [
    rootStore.main.detections,
  ];

  // Проверяем, что все массивы детекций не пустые
  if (allDetections.some(detections => detections.length === 0)) {
    return <Navigate to={routes.main.create()} replace />;
  }

  // Находим нужные детекции
  const detections = allDetections.map(detections => 
    detections.find(d => d.timestamp === detId)
  );

  if (detections.some(det => !det)) {
    return <Navigate to={routes.main.create()} replace />;
  }

  // Находим конкретные элементы детекций
  const findDetItem = (det: { data: any[] }) => 
    det.data.find(item => new Date(item.timestamp).getTime() === detCameraId);

  const detItems = detections.map(findDetItem);

  if (detItems.some(item => !item)) {
    return <Navigate to={routes.main.create()} replace />;
  }

  // Используем первый элемент для отображения (как в оригинале)
  const [detItem] = detItems;
  const {
    imageInfo,
    results: { pixels, yolo },
    timestamp,
  } = detItem as DetectionItem;

  const pixelOperations = [
    { title: 'Дилатация', data: pixels.dilated },
    { title: 'Эрозия', data: pixels.eroded },
    { title: 'Открытие', data: pixels.opened },
    { title: 'Закрытие', data: pixels.closed },
    { title: 'Открытие + Закрытие', data: pixels.openedClosed },
  ];

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
            {pixelOperations.map(({ title, data }) => (
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