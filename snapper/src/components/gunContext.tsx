import { createContext, useState } from "react";

const dfault = {
    'Pistol': 'steampunk_gun.glb',
    'Rifle': 'keith_thomson_rifle.glb',
    'Selected': 'keith_thomson_rifle.glb'
}
const context = createContext(dfault)

const useGuns = () => {
    const [gun, setGuns] = useState(dfault)
    const setSelected = (selected:string) => {
        setGuns({
            ...dfault,
            'Selected': selected
        })
    }

    return {gun, setSelected}
}


export default context
export {
    dfault,
    useGuns
}