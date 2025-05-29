
import type React from 'react';
import { Outlet } from 'react-router';

const App: React.FC = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default App;
