import React from 'react';
import {Box} from "@react-three/drei";


export const Experience = () => {
    return (
        <>
            <ambientLight intensity={1}/>
            <Box args={[1, 1, 1]} position={[0, 0, 0]} receiveShadow={true}>
                <meshNormalMaterial  />
            </Box>
        </>
    )
}