import { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, TransformControls, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';

export default function Experience() {
  const meshRef = useRef(); // Reference for the main box
  const controlRef = useRef(); // Reference for TransformControls
  const orbitRef = useRef(); // Reference for OrbitControls
  const floorMeshes = useRef([]); // Array to store floor meshes
  const texture = useTexture('textures/crate.gif'); // Load texture

  // Snap functionality triggered by button click
  const handleSnap = () => {
    if (!meshRef.current) return;

    // Getting bounding box from scene object
    const box = new THREE.Box3().setFromObject(meshRef.current);

    // Getting bounding box center
    const center = new THREE.Vector3();
    box.getCenter(center);

    let castPoint = center.clone();
    castPoint.y = box.min.y;

    // Cast ray from center in negative Y direction to check intersection
    const raycaster = new THREE.Raycaster(castPoint, new THREE.Vector3(0, -1, 0));

    // Exclude the object itself from intersection checks
    const objectArr = floorMeshes.current.filter((obj) => obj !== meshRef.current);

    const intersectObjects = raycaster.intersectObjects(objectArr, true);

    if (intersectObjects.length > 0) {
      const distanceToGround = intersectObjects[0].distance;
      meshRef.current.position.y -= distanceToGround; // Move object down to ground level
    }
  };

  useEffect(() => {
    const controls = controlRef.current;
    if (!controls) return;

    // Disable OrbitControls while TransformControls is active
    const callback = (e) => (orbitRef.current.enabled = !e.value);
    controls.addEventListener('dragging-changed', callback);

    return () => controls.removeEventListener('dragging-changed', callback);
  }, []);

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[1, 1, 1]} intensity={2} />

      {/* Floor */}
      <mesh
        ref={(el) => floorMeshes.current.push(el)} // Add floor to array
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshLambertMaterial color="green" side={THREE.DoubleSide} />
      </mesh>

      {/* Wireframe Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshLambertMaterial color={0xffff00} wireframe />
      </mesh>

      {/* Base Box */}
      <mesh ref={(el) => floorMeshes.current.push(el)} position={[-200, 100, -200]}>
        <boxGeometry args={[200, 200, 200]} />
        <meshLambertMaterial map={texture} transparent />
      </mesh>

      {/* Main Box */}
      <TransformControls ref={controlRef} object={meshRef.current}>
        <mesh ref={meshRef}>
          <boxGeometry args={[100, 100, 100]} />
          <meshLambertMaterial map={texture} transparent />
        </mesh>
      </TransformControls>

      {/* Controls */}
      <OrbitControls ref={orbitRef} makeDefault enableDamping dampingFactor={0.05} />

      {/* Snap Button */}
      <Html wrapperClass="overlay">
        <button onClick={handleSnap}>Snap to Ground</button>
      </Html>
    </>
  );
}
