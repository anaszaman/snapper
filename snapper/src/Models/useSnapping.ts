import { useEffect } from 'react';
import * as THREE from 'three';

export function useSnapping(meshRef, floorMeshes) {
  useEffect(() => {
    if (!meshRef.current) return;

    const handleSnap = () => {
      if (!meshRef.current) return;

      // Detect if the object is a sphere by checking geometry
      const isSphere = meshRef.current.geometry instanceof THREE.SphereGeometry;
      
      let boundingVolume;
      if (isSphere) {
        boundingVolume = new THREE.Sphere();
        meshRef.current.geometry.computeBoundingSphere();
        const boundingSphere = meshRef.current.geometry.boundingSphere.clone();
        boundingSphere.applyMatrix4(meshRef.current.matrixWorld);
        boundingVolume = boundingSphere;
      } else {
        boundingVolume = new THREE.Box3().setFromObject(meshRef.current);
      }

      // Getting center point
      const center = new THREE.Vector3();
      if (isSphere) {
        center.copy(boundingVolume.center);
      } else if (boundingVolume instanceof THREE.Box3) {
        boundingVolume.getCenter(center);
      }

      // Cast ray from above the object
      const objectHeight = isSphere 
        ? boundingVolume.radius * 2 
        : boundingVolume.max.y - boundingVolume.min.y;
      
      const rayOrigin = center.clone();
      rayOrigin.y = center.y + objectHeight * 2; // Start from above the object

      const raycaster = new THREE.Raycaster(
        rayOrigin,
        new THREE.Vector3(0, -1, 0),
        0,
        objectHeight * 4 // Limit the ray distance
      );

      // Exclude the object itself from intersection checks
      const objectArr = floorMeshes.current.filter((obj) => obj !== meshRef.current);

      const intersectObjects = raycaster.intersectObjects(objectArr, true);

      if (intersectObjects.length > 0) {
        // Get the first intersection (will be the highest point)
        const intersection = intersectObjects[0];
        
        // Calculate final position
        const targetY = intersection.point.y + (objectHeight / 2);
        meshRef.current.position.y = targetY;
        meshRef.current.rotation.copy(intersection.object.rotation);
      }
    };

    // Create animation frame loop
    let animationFrameId;
    const animate = () => {
      handleSnap();
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    // Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [meshRef, floorMeshes]);
} 