import * as THREE from 'three';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { GroupProps, useFrame, useLoader, useThree } from '@react-three/fiber';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { Movement } from '../components/hooks/useCharacterControls';
import { useGuns } from "../components/gunContext";
import { useLoadAnimations } from "../components/data";

interface CharacterProps {
  stateMachine: Movement;
}

const Model = React.forwardRef<THREE.Group, GroupProps & CharacterProps>((props: JSX.IntrinsicElements['group'] & CharacterProps, ref) => {
  const three = useThree();
  const { stateMachine, ...rest } = props;
  const { gun } = useGuns();
  
  const fbx = useLoader(FBXLoader, '/character.fbx');
  const gunModel = useGLTF(`/${gun['Selected']}`);

  // State to track if shooting is in progress
  const [isShooting, setIsShooting] = useState(false);
  
  // Mouse position
  const [mousePos, setMousePos] = useState(new THREE.Vector2());

  // Create Bullet Hole Geometry (a small disc)
  const createBulletHole = (position: THREE.Vector3) => {
    const geometry = new THREE.SphereGeometry(0.1, 32, 32); // Smaller size for bullet holes
    const material = new THREE.MeshBasicMaterial({ color: 0x777777 });
    const bulletHole = new THREE.Mesh(geometry, material);

    // Position the bullet hole at the intersection point
    bulletHole.position.copy(position);
    bulletHole.rotation.x = Math.PI / 2;

    // Add it to the scene
    three.scene.add(bulletHole);

    // Remove after a short time (simulate fading away)
    setTimeout(() => {
      three.scene.remove(bulletHole);
    }, 3000); // Bullet hole disappears after 3 seconds
  };

  // Shoot callback
  const shoot = useCallback(() => {
    if (isShooting) return; // Prevent multiple shots while holding down the button
    setIsShooting(true);

    const raycaster = new THREE.Raycaster();
    
    // Convert mouse position to normalized device coordinates (-1 to +1)
    const x = (mousePos.x / window.innerWidth) * 2 - 1;
    const y = -(mousePos.y / window.innerHeight) * 2 + 1;
    
    // Set raycaster based on mouse position
    raycaster.setFromCamera(new THREE.Vector2(x, y), three.camera);

    // Perform the raycast and check for intersections
    const intersection = raycaster.intersectObjects(three.scene.children, true);
    
    if (intersection.length > 0) {
      // Filter out intersections that are not with the gun itself
      const validIntersections = intersection.filter(intersect => !intersect.object.name.includes('Gun'));

      if (validIntersections.length > 0) {
        const hitPoint = validIntersections[0].point; // Get the point of intersection
        createBulletHole(hitPoint); // Create the bullet hole at the hit point
      } else {
        console.log('No valid intersection detected');
      }
    } else {
      console.log('No intersections detected');
    }

    // Reset shooting state after a short delay
    setTimeout(() => {
      setIsShooting(false);
    }, 200); // Adjust delay as necessary
  }, [mousePos, isShooting]);

  // Listen for mouse down events and mouse movement for aiming
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { // Left mouse button
        shoot(); // Trigger shooting logic
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      setMousePos(new THREE.Vector2(e.clientX, e.clientY)); // Update mouse position
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [shoot]);

  // Scale and rotation adjustments for the gun model
  useEffect(() => {
    gunModel.scene.scale.setScalar(0.5);
    gunModel.scene.rotation.y = Math.PI;
  }, [gunModel]);

  // Find the left hand to attach the gun
  const slots: { [key: string]: THREE.Object3D | undefined } = {};
  
  fbx.traverse(child => {
    if (child.name.includes('LeftHand')) {
      slots['hand'] = child;
    }
  });

  if (slots['hand']) {
    slots['hand'].add(gunModel.scene);
  } else {
    console.warn('LeftHand bone not found, using default attachment');
  }

  const tweenSpeed = 0.15;
  const actionsDict = useLoadAnimations(fbx);
  
  const [currentAction, setCurrentAction] = useState<THREE.AnimationAction | null>(null);

  // Update animation based on movement
  useFrame((state, delta) => {
    if (!actionsDict['Walk'] || !actionsDict['Idle']) return;

    const isMoving = stateMachine['FWD'] || stateMachine['BKWD'] || stateMachine['LFT'] || stateMachine['RT'];

    if (!isMoving) {
      if (currentAction !== actionsDict['Idle']) {
        if (currentAction) currentAction.fadeOut(tweenSpeed);
        actionsDict['Idle'].reset().fadeIn(0.1).play();
        setCurrentAction(actionsDict['Idle']);
      }
    } else {
      if (currentAction !== actionsDict['Walk']) {
        if (currentAction) currentAction.fadeOut(tweenSpeed);
        actionsDict['Walk'].reset().fadeIn(0.1).play();
        setCurrentAction(actionsDict['Walk']);
      }
    }

    // Update animation mixer if exists
    if (actionsDict['mixer']) actionsDict['mixer'].update(delta);
  });

  return (
    <group ref={ref} {...rest}>
      <primitive object={fbx} />
    </group>
  );
});

export { Model };
