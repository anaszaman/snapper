import { useLoader } from "@react-three/fiber";
import { RepeatWrapping, TextureLoader } from "three";

const useTexture = (name: string) => {
    const ao = useLoader(TextureLoader, '/textures/' + name + '_ao_1k.png',)
    const diff = useLoader(TextureLoader, '/textures/' +name + '_diff_1k.png')
    const nor_gl = useLoader(TextureLoader, '/textures/' +name + '_nor_gl_1k.png')
    const rough = useLoader(TextureLoader, '/textures/' +name + '_rough_1k.png')

    ao.wrapS = RepeatWrapping
    ao.wrapT = RepeatWrapping
    diff.wrapS = RepeatWrapping
    diff.wrapT = RepeatWrapping
    nor_gl.wrapS = RepeatWrapping
    nor_gl.wrapT = RepeatWrapping
    rough.wrapS = RepeatWrapping
    rough.wrapT = RepeatWrapping

    ao.repeat.x = 20
    ao.repeat.y = 20

    diff.repeat.x = 20
    diff.repeat.y = 20

    nor_gl.repeat.x = 20
    nor_gl.repeat.y = 20

    rough.repeat.x = 20
    rough.repeat.y = 20

    return {
        ao, diff, nor_gl, rough
    }
};

export default useTexture;