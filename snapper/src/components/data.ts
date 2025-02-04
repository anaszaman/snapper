import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { AnimationMixer, Group } from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

const Animations = {
    "Walk": '/animations/rn_fwd.fbx',
    // "Run": null,
    "Idle": '/animations/idle.fbx',
    // "ShotgunFire": '/animations/Gunplay.fbx'
}


const useLoadAnimations = (object:Group, tweenSpeed=0.1) => {
    const AnimationActions = useMemo(()=>new Object(), [])
    const mixer = useMemo(() => new AnimationMixer(object), [])
    for (const AnimationName in Animations) {
            const AnimationPath = Animations[AnimationName];
           
            const animationFBX = useLoader(FBXLoader, AnimationPath) 
            const animationSkel = animationFBX.animations[0]
            const action = mixer.clipAction(animationSkel)
            AnimationActions[AnimationName] = action
        }
        AnimationActions['mixer'] = mixer;
        AnimationActions['Idle'].play()


    return AnimationActions
}


export {
    Animations,
    useLoadAnimations
}