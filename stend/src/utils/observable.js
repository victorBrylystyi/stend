
const observable = (initState = {}) => {

    const listeners = []
    const state = {
        current: initState
    }

    const get = () => state.current
    const set = (newState) => {
        state.current = newState
        notify()
    } 

    const subscribe = (fn) => listeners.indexOf(fn) === -1 && listeners.push(fn)
    const unsubscribe = (fn) => listeners.indexOf(fn) !== -1 && listeners.splice(listeners.indexOf(fn), 1)
    const notify = () => {
      for(let i = listeners.length - 1; i >= 0; i--) {
        let fn = listeners[i]
        if(!fn) continue
        fn(state.current)
      }
    }

    return {
        get,
        set,
        subscribe,
        unsubscribe
    }
}

export default observable 