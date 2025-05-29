import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@styles/index.scss';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { routesConfig } from '@config/routes';

const router = createBrowserRouter(routesConfig)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>
);
