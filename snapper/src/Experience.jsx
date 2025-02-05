import { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, TransformControls, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSnapping } from './useSnapping';
import { InstancedRigidBodies, CylinderCollider, BallCollider, CuboidCollider, RigidBody, Physics } from '@react-three/rapier'


export default function Experience() {
  const meshRef = useRef(); // Reference for the main box
  const controlRef = useRef(); // Reference for TransformControls
  const orbitRef = useRef(); // Reference for OrbitControls
  const floorMeshes = useRef([]); // Array to store floor meshes
  const texture = useTexture('textures/crate.gif'); // Load texture
  
  useSnapping(meshRef, floorMeshes);

  useEffect(() => {
    const controls = controlRef.current;
    if (!controls) return;

    // Disable OrbitControls while TransformControls is active`
    const callback = (e) => (orbitRef.current.enabled = !e.value);
    controls.addEventListener('dragging-changed', callback);
    window.addEventListener('keypress', (e) => {
      if (e.key === 'w') {
        controls.mode='scale'
      }
 
      if (e.key === 'e') {
        controls.mode='translate'
      }

      if (e.key === 'r') {
        controls.mode='rotate'
      }
    });
    return () => controls.removeEventListener('dragging-changed', callback);
  }, []);

  useEffect(() => {
    if (controlRef.current) {
      controlRef.current.attach(meshRef.current);
    }
  }, [meshRef.current]);

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[1, 1, 1]} intensity={2} />

      {/* Floor */}
         <mesh
        ref={(el) => floorMeshes.current.push(el)} // Add floor to array
        rotation={[-Math.PI / 1.5, 0, 0]}
        position={[0, -0.01, 0]}
      >
        <planeGeometry args={[10, 10]} />
        <meshLambertMaterial color="green" side={THREE.DoubleSide} />
      </mesh>

      {/* Wireframe Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, -2]} ref={(el) => floorMeshes.current.push(el)}>
        <planeGeometry args={[10, 10]} />
        <meshLambertMaterial color={0xffff00} />
      </mesh>

      {/* Base Box */}
      <mesh ref={(el) => floorMeshes.current.push(el)} position={[-2, 1, -2]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshLambertMaterial map={texture} transparent />
      </mesh>

      {/* Main Box */}
      <TransformControls ref={controlRef} object={meshRef.current}>
        <mesh ref={meshRef} position-y={3}>
          <boxGeometry args={[1]} />
          <meshMatcapMaterial map={texture} transparent />
        </mesh>
      </TransformControls>

      {/* Controls */}
      <OrbitControls ref={orbitRef} makeDefault enableDamping dampingFactor={0.05} />
    </>
  );
}
