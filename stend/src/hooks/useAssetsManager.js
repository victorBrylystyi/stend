import * as THREE from 'three'
import { useEffect, useMemo, useState } from "react"
import { gltfLoader } from "../utils/gltfLoader"
import observable from "../utils/observable"

export const cache = observable({})

const textureLoader = new THREE.TextureLoader()

const LOADING_MODE = {
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR'
}
 
export const cleanUpCache = () => { 
    cache.set({}) 
}

const isLoaded = (path) => {
    const state = cache.get()
  
    return (state[path] && state[path].status === LOADING_MODE.SUCCESS)
}

const assetExist = (path) => Boolean(cache.get()[path])

const isAssetPending = (path) => (cache.get()[path] && cache.get()[path].status === LOADING_MODE.PENDING)

const loadAsset = (path) => {

    if (!path) return Promise.resolve(null)

    const currentCache = cache.get()

    if (!currentCache[path]){

        cache.set(
            {
                ...cache.get(),
                [path]:{
                    data: null,
                    status: LOADING_MODE.PENDING,
                    usageCount: 0, 
                    lastUsedDate: Date.now() 
                }
            }
        )

        return new Promise((resolve,reject) => {

            const cacheData = cache.get()

            if (!cacheData[path].data){

                let loader, match, ext
                const exts = /(\.(glb|gltf|jpg|jpeg|png))$/gim 
                match = path.match(exts) 
                ext = match[0].toLowerCase()
                switch (ext) {
                    case '.gltf':
                    case '.glb':
                        loader = gltfLoader
                    break      
                    case '.jpg':
                    case '.jpeg':
                    case '.png':
                        loader = textureLoader 
                        break                                               
                    default:
                    break
                }
                loader.load(
                    path,
                    (model) => {
                        cache.set(
                            {
                                ...cache.get(),
                                [path]: {
                                    data: model, 
                                    status: LOADING_MODE.SUCCESS,
                                    usageCount: cacheData[path].usageCount, 
                                    lastUsedDate: cacheData[path].lastUsedDate 
                                }
                            }
                        )
                        resolve(cacheData[path])
                    },
                    null,
                    (error) => {
                        cache.set(
                            {
                                ...cache.get(),
                                [path]: {
                                    data: null, 
                                    status: LOADING_MODE.ERROR
                                }
                            }
                        )
                        reject(error)
                    }
                )
            } else {
                resolve(cacheData[path])
            }
        })
    }

}

const cleanUnusedAssets = () => {
    const current = cache.get()
    let keys = Object.keys(current)
    for(let i = 0; i < keys.length; i++) {
        let key = keys[i]
        let currentAsset = current[key]
        if(currentAsset.usageCount === 0) {
            let difference = (Date.now() - currentAsset.lastUsedDate) / 60000
            if(difference >= 15) {
                delete current[key]
            }
        }
    }
} 

export const useAssets = (paths) => {

    const [assetsToLoad, setAssetsToLoad] = useState(paths || [])

    /**
     * Fetch not fetched resources if 'paths' variable was changed
     */

    useEffect(() => {

        const shouldLoad = paths.filter(assetPath => !assetExist(assetPath))
        const pendingAssets = paths.filter(assetPath => isAssetPending(assetPath))

        if (shouldLoad.length > 0) {
            shouldLoad.map(loadAsset) // Fetch here
        }
  
      // Update 'assetsToLoad' to know, how many objects we are waiting for fetch
        setAssetsToLoad(shouldLoad.concat(pendingAssets))
        for(let i = 0; i < paths.length; i++) {
            cache.get()[paths[i]].usageCount += 1
            cache.get()[paths[i]].lastUsedDate = Date.now()
        }
        cleanUnusedAssets()
        return () => {
            for(let i = 0; i < paths.length; i++){
                let currentModel = cache.get()[paths[i]]
                if(!currentModel) continue
                currentModel.usageCount -= 1
            }
        }
    }, [paths.reduce((acc, v) => acc + v, '')])
  
    /**
     * Subscribe to cache on mount, remove subscription on unmount
     */

    useEffect(() => {

        if (assetsToLoad.length === 0) {
        // If we don't have assetsToLoad then exit
            return
        }
      
      // Next function is called when some resource has been loaded
        const fn = () => {
            // Get resources that haven't fetched yet
            const toLoadNext = assetsToLoad.filter(assetPath => !isLoaded(assetPath))
        
            // If we still have any resources to fetch then update 'assetsToLoad'
            if (toLoadNext.length !== assetsToLoad.length) {
                setAssetsToLoad(toLoadNext)
            }
        }
  
        cache.subscribe(fn)
  
        return () => {
            cache.unsubscribe(fn)
        }

    }, [assetsToLoad, paths])
  
    // This returns our assets
    const assets = useMemo(() => {
        const current = cache.get()
        return paths.filter(isLoaded).map((path) => {
            return current[path].data
        })
    }, [assetsToLoad, paths])
    
    return {
        assets, // Array of loaded assets
        loaded: (assetsToLoad.length === 0) // Are assets loaded?
    }
  }
  

export const useAsset = (path) => {

    const { assets, loaded } = useAssets(path ? [path] : [])

    return {
        asset: assets[0], 
        loaded
    }
}
  