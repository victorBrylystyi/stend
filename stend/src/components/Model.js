import { useMemo } from "react"
import { useAsset } from "../hooks/useAssetsManager"


const Model = (props) => {

    const { path } = props

    const { asset } = useAsset(path)

    const meshs = useMemo(()=>{
        if (asset) {
            let children = []
            asset.scene.traverse(child => {
              if (child.isMesh) {
                children.push(
                  <primitive
                    key={`${child.uuid}`}
                    object={child}
                  />
                )
              }
            })
            return children
          } else {
              return []
          }
    },[asset])

    return (
        <group position={[0,0,0]}>
            {meshs}
        </group>
    )
}

export default Model