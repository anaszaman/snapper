import React from 'react';
import ReactDOM from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Canvas
      camera={{
        position: [1000, 500, 1000], // Adjusted camera position
        fov: 50,
        near: 0.01,
        far: 30000,
      }}
      style={{ height: '100vh', background: 'grey' }}
    >
      <Experience />
    </Canvas>
  </React.StrictMode>
);
