import {
  useGLTF,
} from "@react-three/drei";
import { MeshProps, useLoader, useThree } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import { BufferGeometry, InstancedMesh, Material, Matrix4, Mesh, Object3D } from "three";
import { FBXLoader } from "three/examples/jsm/Addons.js";

interface Props {
  children?: React.ReactNode;
}
function getRandomValue(min:number, max:number) {
  return Math.random() * (max - min) + min;
}

const InstancedGLTF = (props: {geometry: BufferGeometry, material: Material,  n_instances: number}) => {
  const ref = useRef<InstancedMesh | null>(null)
  useEffect(() => {
    if (!ref.current) return
    const temp = new Object3D()
    for (let i = 0; i < props.n_instances; i++) {
      temp.position.set(getRandomValue(-25, 25), 0, getRandomValue(-25, 25));
      // temp.rotation.set(getRandomValue(0, 2*Math.PI), getRandomValue(0, 2*Math.PI), 0)
      temp.scale.setScalar(getRandomValue(0.1, 0.5))
      temp.updateMatrix()
      ref.current.setMatrixAt(i, temp.matrix)
      
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [])
 
  return <>
    <instancedMesh frustumCulled={false} ref={ref} args={[props.geometry, props.material, props.n_instances]}>
    </instancedMesh>
  </>
}

const Boulder = (props: Props & MeshProps) => {
  const gltf = useGLTF("/stylized_rocks_formation_asset_pack.glb");
  const ref = useRef<InstancedMesh | null>(null)
  // gltf.scene.scale.setScalar(0.0025)
  // const n_instances = 50
  // useEffect(() => {
  //   if (!ref.current) return
  //   const temp = new Object3D()
  //   for (let i = 0; i < n_instances; i++) {
  //     temp.position.set(getRandomValue(-25, 25), 0, getRandomValue(-25, 25));
  //     temp.rotation.set(getRandomValue(0, 2*Math.PI), getRandomValue(0, 2*Math.PI), 0)
  //     temp.scale.setScalar(getRandomValue(0.1, 0.5))
  //     temp.updateMatrix()
  //     ref.current.setMatrixAt(i, temp.matrix)
      
  //   }
  //   ref.current.instanceMatrix.needsUpdate = true
  // }, [])
 
  return (
    <>
      {/* <instancedMesh frustumCulled={false} ref={ref} args={[gltf.scene.children[0].geometry, gltf.scene.children[0].material, n_instances]}>
      </instancedMesh> */}
      {
        gltf.scene.children.map(child => <InstancedGLTF geometry={child.geometry} material={child.material} n_instances={25}/>)
      }
     
    </>
  );
};

const Grass = (props: Props & MeshProps) => {
  const fbx = useLoader(FBXLoader, "/Foliage/FBX/F1_BushHigh.fbx")
  const ref = useRef<InstancedMesh | null>(null)
  // gltf.scene.scale.setScalar(0.0025)
  console.log(fbx)

  return (
    <>
      {/* <instancedMesh frustumCulled={false} ref={ref} args={[gltf.scene.children[0].geometry, gltf.scene.children[0].material, n_instances]}>
      </instancedMesh> */}
       <InstancedGLTF geometry={fbx.children[0].geometry} material={fbx.children[0].material} n_instances={100}/>
     
    </>
  );
};

const Rock = (props: Props & MeshProps) => {
  const gltf = useGLTF("/rock_09_1k.gltf/rock_09_1k.gltf");

  gltf.scene.traverse((child) => {
    if (child instanceof Mesh) {
      // child.castShadow = true; // Enable shadow casting
    }
  });
  return (
    <>
      <primitive object={gltf.scene} {...props}></primitive>
    </>
  );
};

export {Boulder, Rock, Grass};
