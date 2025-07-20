import Placemark from '@components/icons/Placemark';
import {
  YMap,
  YMapDefaultSchemeLayer,
  YMapControls,
  YMapDefaultFeaturesLayer,
  YMapListener,
  YMapMarker,
  YMapZoomControl,
  YMapScaleControl,
  YMapFeature,
  YMapControl,
  reactify,
} from '@lib/ymaps';
import type {
  LngLat,
  PolygonGeometry,
  YMapLocationRequest,
} from '@yandex/ymaps3-types';

import React from 'react';

import styles from './Map.module.scss';
import Fire from '@components/Fire';
import Text from '@components/Text';
import Button from '@components/Button';
import rootStore from '@store/RootStore';
import { observer } from 'mobx-react-lite';

import * as turf from '@turf/turf';
import { Link } from 'react-router';
import { routes } from '@config/routes';
import { getTimeNow } from '@config/utils';
import Loader from '@components/Loader';

const DEFAULT_CENTER: [number, number] = [37.619771, 55.754314];

interface CameraData {
  detections: typeof rootStore.main.detections;
  activeCamera: string | null;
  setActiveCamera: React.Dispatch<React.SetStateAction<string | null>>;
}

const Map: React.FC = () => {
  const [isCentered, setIsCentered] = React.useState<boolean>(false);
  const [activeCamera, setActiveCamera] = React.useState<string | null>(null);
  const [activeCamera1, setActiveCamera1] = React.useState<string | null>(null);
  const [activeCamera2, setActiveCamera2] = React.useState<string | null>(null);

  const cameraGroups: CameraData[] = [
    {
      detections: rootStore.main.detections,
      activeCamera: activeCamera,
      setActiveCamera: setActiveCamera,
    },
    {
      detections: rootStore.main.detections1,
      activeCamera: activeCamera1,
      setActiveCamera: setActiveCamera1,
    },
    {
      detections: rootStore.main.detections2,
      activeCamera: activeCamera2,
      setActiveCamera: setActiveCamera2,
    },
  ];

  const getCircleGeoJSON = (
    center: LngLat,
    radiusMeters: number
  ): PolygonGeometry => {
    const { geometry } = turf.circle([center[0], center[1]], radiusMeters, {
      units: 'meters',
    });
    return geometry as PolygonGeometry;
  };

  const activeDetections = cameraGroups.map(group => group.detections.at(-1));
  const activeDetectionItems = cameraGroups.map((group, index) => 
    !activeDetections[index] || !group.activeCamera
      ? null
      : activeDetections[index]!.data.find(det => det.id === group.activeCamera)
  );

  if (activeDetections[0] && !isCentered) {
    setIsCentered(true);
  }

  const LOCATION: YMapLocationRequest = {
    center: activeDetections[0]
      ? [
          activeDetections[0].centerCoords.longitude,
          activeDetections[0].centerCoords.latitude,
        ]
      : DEFAULT_CENTER,
    duration: 1000,
    easing: 'ease-in-out',
    zoom: 9,
  };

  const handleMapClick = () => {
    cameraGroups.forEach(group => group.setActiveCamera(null));
  };

  const renderPopup = (detectionItem: typeof activeDetectionItems[0], timestamp: string) => {
    if (!detectionItem) return null;

    return (
      <div className={styles.mark__popup}>
        {!('error' in detectionItem) && (
          <>
            <img
              className={styles.mark__image}
              src={detectionItem.imageInfo.path}
              alt=""
            />
            <Link
              className={styles.details}
              to={routes.result.create(
                timestamp,
                getTimeNow(detectionItem.timestamp)
              )}
            >
              <Text tag="div" color="danger">
                Подробнее
              </Text>
            </Link>
          </>
        )}

        <Text tag="div">ID: {detectionItem.id}</Text>
        <Text tag="div">
          Координаты: ({detectionItem.coordinates.latitude},{' '}
          {detectionItem.coordinates.longitude})
        </Text>
        <Text>
          {detectionItem.fireCountWithinRadius} из{' '}
          {detectionItem.totalCountWithinRadius} камер обнаружили огонь
          в радиусе {rootStore.main.radius} км
        </Text>
        {!('error' in detectionItem) && (
          <Text
            tag="div"
            color={detectionItem.fire ? 'danger' : 'safety'}
            weight={detectionItem.fire ? 'bold' : 'normal'}
          >
            Огонь: {detectionItem.fire ? 'Обнаружен' : 'Не обнаружен'}
          </Text>
        )}

        <Button onClick={handleMapClick}>
          Скрыть
        </Button>
      </div>
    );
  };

  const renderMarkers = (group: CameraData, index: number) => {
    const activeDet = activeDetections[index];
    if (!activeDet) return null;

    return activeDet.data.map(det => (
      <React.Fragment key={det.id}>
        {det.id === group.activeCamera && (
          <YMapFeature
            geometry={getCircleGeoJSON(
              [det.coordinates.longitude, det.coordinates.latitude],
              rootStore.main.radius * 1000
            )}
            style={{
              simplificationRate: 0,
              stroke: [{ color: '#006efc', width: 4, dash: [5, 10] }],
              fill: 'rgba(56, 56, 219, 0.5)',
            }}
          />
        )}
        <YMapMarker
          coordinates={[det.coordinates.longitude, det.coordinates.latitude]}
          draggable={false}
          onClick={() => {
            if (group.activeCamera !== det.id) {
              group.setActiveCamera(det.id);
            }
          }}
        >
          <div className={styles.mark}>
            {!('error' in det) && det.fire && (
              <div className={styles.mark__fire}>
                <Fire />
              </div>
            )}
            <Placemark
              fire={'error' in det ? 'nodata' : det.fire ? 'yes' : 'no'}
              className={styles.mark__placemark}
              width={50}
              height={50}
            />
          </div>
        </YMapMarker>
      </React.Fragment>
    ));
  };

  return (
    <div className={styles.map}>
      {!rootStore.main.isLoaded && (
        <div className={styles.cover_block}>
          <Loader className={styles.cover_block__loader}></Loader>
        </div>
      )}

      <YMap
        className={styles.map_block}
        location={isCentered ? reactify.useDefault(LOCATION) : LOCATION}
      >
        <YMapDefaultSchemeLayer />
        <YMapDefaultFeaturesLayer />
        <YMapListener onClick={handleMapClick} />

        <YMapControls position="right">
          <YMapZoomControl />
        </YMapControls>

        <YMapControls position="bottom left">
          <YMapScaleControl />
        </YMapControls>

        {cameraGroups.map((group, index) => (
          activeDetectionItems[index] && (
            <YMapControls position="top left" key={`popup-${index}`}>
              <YMapControl>
                {renderPopup(activeDetectionItems[index], activeDetections[index]!.timestamp)}
              </YMapControl>
            </YMapControls>
          )
        ))}

        {cameraGroups.map((group, index) => renderMarkers(group, index))}
      </YMap>
    </div>
  );
};

export default observer(Map);