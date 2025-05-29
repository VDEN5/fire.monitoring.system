import Placemark from '@components/icons/Placemark';
import {
  reactify,
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

const DEFAULT_LOCATION_SETTINGS: Partial<YMapLocationRequest> = {
  duration: 1000,
  easing: 'ease-in-out',
  zoom: 9,
};

const DEFAULT_CENTER: [number, number] = [37.619771, 55.754314];

const Map: React.FC = () => {
  const [activeCameras, setActiveCameras] = React.useState<string[]>([]);
  const [location, setLocation] = React.useState<YMapLocationRequest>({
    center: DEFAULT_CENTER,
    ...DEFAULT_LOCATION_SETTINGS,
  });
  const [hasCentered, setHasCentered] = React.useState(false);

  const getCircleGeoJSON = (
    center: LngLat,
    radiusMeters: number
  ): PolygonGeometry => {
    const { geometry } = turf.circle([center[0], center[1]], radiusMeters, {
      units: 'meters',
    });
    return geometry as PolygonGeometry;
  };

  const activeDet = rootStore.main.detections.at(-1);
  const activeDetItem = activeDet?.data.find(
    (det) => det.id === activeCameras[0]
  );

  React.useEffect(() => {
    if (!hasCentered && activeDet) {
      setLocation({
        center: [
          activeDet.centerCoords.longitude,
          activeDet.centerCoords.latitude,
        ],
        ...DEFAULT_LOCATION_SETTINGS,
      });
      setHasCentered(true);
    }
  }, [activeDet, hasCentered]);

  return (
    <div className={styles.map}>
      <YMap location={location}>
        <YMapDefaultSchemeLayer />
        <YMapDefaultFeaturesLayer />
        <YMapListener
          onClick={(obj) => {
            if (obj === undefined) {
              setActiveCameras([]);
            }
          }}
        />

        <YMapControls position="right">
          <YMapZoomControl />
        </YMapControls>

        <YMapControls position="bottom left">
          <YMapScaleControl />
        </YMapControls>

        {activeDetItem && (
          <YMapControls position="top left">
            <YMapControl>
              <div className={styles.mark__popup}>
                <img
                  className={styles.mark__image}
                  src={activeDetItem.imageInfo.path}
                  alt=""
                />
                <Link className={styles.details}
                  to={routes.result.create(
                    activeDet!.timestamp,
                    getTimeNow(activeDetItem.timestamp)
                  )}
                >
                  <Text tag="div" color="danger">
                    Подробнее
                  </Text>
                </Link>
                <Text tag="div">ID: {activeDetItem.id}</Text>
                <Text tag="div">
                  Координаты: ({activeDetItem.coordinates.latitude},{' '}
                  {activeDetItem.coordinates.longitude})
                </Text>
                <Text>
                  {activeDetItem.fireCountWithinRadius} локаций в огне из{' '}
                  {activeDetItem.totalCountWithinRadius} в радиусе{' '}
                  {rootStore.main.radius} км
                </Text>
                <Text
                  tag="div"
                  color={activeDetItem.fire ? 'danger' : 'safety'}
                  weight={activeDetItem.fire ? 'bold' : 'normal'}
                >
                  Огонь: {activeDetItem.fire ? 'Обнаружен' : 'Не обнаружен'}
                </Text>
                <Button
                  onClick={() => {
                    setActiveCameras(
                      activeCameras.filter((id) => activeDetItem.id !== id)
                    );
                  }}
                >
                  Скрыть
                </Button>
              </div>
            </YMapControl>
          </YMapControls>
        )}

        {activeDet?.data.map((det) => (
          <React.Fragment key={det.id}>
            {activeCameras.includes(det.id) && (
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
              coordinates={reactify.useDefault([
                det.coordinates.longitude,
                det.coordinates.latitude,
              ])}
              draggable={false}
              onClick={() => {
                if (!activeCameras.includes(det.id)) {
                  setActiveCameras([det.id]);
                }
              }}
            >
              <div className={styles.mark}>
                {det.fire && (
                  <div className={styles.mark__fire}>
                    <Fire />
                  </div>
                )}
                <Placemark
                  fire={det.fire}
                  className={styles.mark__placemark}
                  width={50}
                  height={50}
                />
              </div>
            </YMapMarker>
          </React.Fragment>
        ))}
      </YMap>
    </div>
  );
};

export default observer(Map);
