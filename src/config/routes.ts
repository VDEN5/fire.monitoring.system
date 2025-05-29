import App from '@App/App';
import Main from '@pages/Main';
import Result from '@pages/Result';
import type { RouteObject } from 'react-router';

export const routes = {
  main: {
    create: () => '/',
    mask: '/',
  },
  result: {
    create: (detId: number, detCameraId : number) => `/result/${detId}/${detCameraId}`,
    mask: '/result/:detId/:detCameraId',
  },
};

export const routesConfig: RouteObject[] = [
  {
    path: routes.main.mask,
    Component: App,
    children: [
      {
        index: true,
        Component: Main,
      },
      {
        path: routes.result.mask,
        Component: Result,
      },
    ],
  },
];
