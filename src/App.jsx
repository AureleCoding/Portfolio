import { Suspense } from 'react'
import {Canvas} from "@react-three/fiber";
import {OrbitControls} from "@react-three/drei";

import {Experience} from "./components/Experience";

function App() {

  return (
    <>
        <Canvas shadows camera={{position: [5, 5, 5], fov: 30}}>
            <color attach="background" args={["lightBlue"]}/>
            <Suspense>
                <Experience/>
                <OrbitControls/>
            </Suspense>
        </Canvas>
    </>
  )
}

export default App
