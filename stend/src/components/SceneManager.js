import { OrbitControls } from "@react-three/drei"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useEffect, useMemo, useRef, useState } from "react"
import Model from "./Model"
import Env from "./Env"



const Controls = ({camera, domElement}) => {

    const ref = useRef()

    // useEffect(()=>{
    //     console.log(ref)
    //     ref.current.addEventListener('change',() => console.log('test'))
    //     return ref.current.removeEventListener('change',() => console.log('test'))
    // },[])

    // useFrame(()=>{
    //     ref.current.update()
    // })

    return (
        <OrbitControls args={[camera, domElement]} ref={ref} enablePan={true} enableZoom={true} enableRotate={true} />
    )
}


const SandBox = ()=>{

    console.log('SandBox')

    const {camera, gl} = useThree()

    return (
        <Controls camera={camera} domElement={gl.domElement} />
    )
}

const SceneManager = () => {

    const pathRim = useMemo(()=>{
        return {
            url:'./assets/models/rim.glb',
        }
    },[])

    const pathStend = useMemo(()=>{
        return {
            url:'./assets/models/stend.glb',
        }
    },[])

    return (
        <Canvas>
            <Env />
            <SandBox />
            <ambientLight color='white' intensity={1} />
            <Model path={pathRim.url}/>
            <Model path={pathStend.url}/>
        </Canvas>
    )
}

export default SceneManager 