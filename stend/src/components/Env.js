import { useThree } from "@react-three/fiber"
import { useEffect } from "react"
import { useAsset } from "../hooks/useAssetsManager"


const Env = () => {

    const { asset } = useAsset('./assets/env/fireplace.jpg')

    const get = useThree(state => state.get)

    useEffect(()=>{
        const { scene } = get()

        scene.background = asset
    },[asset])

    return null

}

export default Env