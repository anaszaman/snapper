import { useFrame } from "@react-three/fiber";
import { Movement } from "./useCharacterControls";
import { Mesh, Object3D, Group, Euler, Quaternion } from "three";


const quaternionRotation = (angle) => {
    const theta = new Euler()
    theta.y = angle;

    const quaternion = new Quaternion().setFromEuler(theta)

    return quaternion
}
const useCharacterMovement = <T,>(
  ref: React.MutableRefObject<T>,
  movDir: Movement,
  speed =0.01
) => {
  const slerpSpeed = 0.1
  useFrame(() => {
    if (ref.current instanceof Group && ref.current) {
      if (movDir.FWD) {
        const target = quaternionRotation(Math.PI)
        ref.current.quaternion.slerp(target, 0.25)
        ref.current.position.z -= speed;
      }

      if (movDir.RT) {
        const target = quaternionRotation(Math.PI * 0.5)
        ref.current.quaternion.slerp(target, slerpSpeed)
        ref.current.position.x += speed;
      }


      if (movDir.BKWD) {
        const target = quaternionRotation(Math.PI * 0.0)
        ref.current.quaternion.slerp(target, slerpSpeed)

        ref.current.position.z += speed;
      }

      if (movDir.LFT) {
        const target = quaternionRotation(-Math.PI * 0.5)
        ref.current.quaternion.slerp(target, slerpSpeed)
        ref.current.position.x -= speed;
      }


      if (movDir.FWD && movDir.RT) {
        const target = quaternionRotation(Math.PI * 0.75)
        ref.current.quaternion.slerp(target, slerpSpeed)
      }

      if (movDir.FWD && movDir.LFT) {
        // ref.current.rotation.y = Math.PI * 1.25
        const target = quaternionRotation(Math.PI * 1.25)
        ref.current.quaternion.slerp(target, slerpSpeed)
      }
      

      if (movDir.BKWD && movDir.RT) {
        // ref.current.rotation.y = Math.PI * 0.25 
        const target = quaternionRotation(Math.PI * 0.25)
        ref.current.quaternion.slerp(target, slerpSpeed)
      }

      if (movDir.BKWD && movDir.LFT) {
        const target = quaternionRotation(Math.PI * 1.75)
        ref.current.quaternion.slerp(target, slerpSpeed)
      }

    }
  });
};

export default useCharacterMovement;
