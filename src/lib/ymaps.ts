import React from 'react';
import ReactDom from 'react-dom';

const [ymaps3React] = await Promise.all([ymaps3.import('@yandex/ymaps3-reactify'), ymaps3.ready]);

export const reactify = ymaps3React.reactify.bindTo(React, ReactDom);
export const {YMap, YMapControls, YMapControlButton, YMapListener, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker, YMapScaleControl, YMapFeature, YMapControl} = reactify.module(ymaps3);

export const {YMapZoomControl} = reactify.module(await ymaps3.import('@yandex/ymaps3-controls@0.0.1'));

export const {YMapDefaultMarker} = reactify.module(await ymaps3.import('@yandex/ymaps3-markers@0.0.1'));
