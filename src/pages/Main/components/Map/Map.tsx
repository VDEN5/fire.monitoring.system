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

const Map: React.FC = () => {
  const [isCentered, setIsCentered] = React.useState<boolean>(false);
  const [activeCamera, setActiveCamera] = React.useState<string | null>(null);

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
  const activeDetItem =
    !activeDet || !activeCamera
      ? null
      : activeDet.data.find((det) => det.id === activeCamera);

  if (activeDet && !isCentered) {
    setIsCentered(true);
  }

  const LOCATION: YMapLocationRequest = {
    center: activeDet
      ? [activeDet.centerCoords.longitude, activeDet.centerCoords.latitude]
      : DEFAULT_CENTER,
    duration: 1000,
    easing: 'ease-in-out',
    zoom: 9,
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
        <YMapListener
          onClick={(obj) => {
            if (obj === undefined) {
              setActiveCamera(null);
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
                {!('error' in activeDetItem) && (
                  <>
                    <img
                      className={styles.mark__image}
                      src={activeDetItem.imageInfo.path}
                      alt=""
                    />
                    <Link
                      className={styles.details}
                      to={routes.result.create(
                        activeDet!.timestamp,
                        getTimeNow(activeDetItem.timestamp)
                      )}
                    >
                      <Text tag="div" color="danger">
                        Подробнее
                      </Text>
                    </Link>
                  </>
                )}

                <Text tag="div">ID: {activeDetItem.id}</Text>
                <Text tag="div">
                  Координаты: ({activeDetItem.coordinates.latitude},{' '}
                  {activeDetItem.coordinates.longitude})
                </Text>
                <Text>
                  {activeDetItem.fireCountWithinRadius} из{' '}
                  {activeDetItem.totalCountWithinRadius} камер обнаружили огонь
                  в радиусе {rootStore.main.radius} км
                </Text>
                {!('error' in activeDetItem) && (
                  <Text
                    tag="div"
                    color={activeDetItem.fire ? 'danger' : 'safety'}
                    weight={activeDetItem.fire ? 'bold' : 'normal'}
                  >
                    Огонь: {activeDetItem.fire ? 'Обнаружен' : 'Не обнаружен'}
                  </Text>
                )}

                <Button
                  onClick={() => {
                    setActiveCamera(null);
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
            {det.id === activeCamera && (
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
              coordinates={[
                det.coordinates.longitude,
                det.coordinates.latitude,
              ]}
              draggable={false}
              onClick={() => {
                if (activeCamera !== det.id) {
                  setActiveCamera(det.id);
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
        ))}
      </YMap>
    </div>
  );
};

export default observer(Map);
