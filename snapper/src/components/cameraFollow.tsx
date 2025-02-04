import { useFrame, useThree } from "@react-three/fiber";
import { Mesh, Object3D, Group, Vector3 } from "three";

const cameraFollow = <T,>(target: React.MutableRefObject<T>, speed=0.01) => {
  const { camera } = useThree();

  useFrame(() => {
    if (
      target.current instanceof Mesh ||
      target.current instanceof Group ||
      target.current instanceof Object3D
    ) {
      const targetPos = new Vector3(target.current.position.x, 5, target.current.position.z + 2)
      camera.position.lerp(targetPos, speed);
    }
  });
};

export default cameraFollow;
