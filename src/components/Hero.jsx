import React, {useMemo, useRef} from 'react';
import {BallCollider, InstancedRigidBodies, Physics, RigidBody} from "@react-three/rapier";
import * as THREE from "three";
import {useFrame} from "@react-three/fiber";
import {Bloom, EffectComposer, SMAA} from "@react-three/postprocessing";
import {Environment, Lightformer, useScroll} from "@react-three/drei";

export const Hero = () => {

    return (
        <>
            <Physics gravity={[0, 0, 0]}>
                <Instances count={40}/>
                <Pointer/>
            </Physics>

            <EffectComposer disableNormalPass multisampling={0}>
                <SMAA/>
                <Bloom intensity={2.0} kernelSize={3} luminanceThreshold={0.9} luminanceSmoothing={0.025}/>
            </EffectComposer>

            <ambientLight intensity={2}/>
            <directionalLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow
                              shadow-mapSize={[2048, 2048]}/>
            <pointLight position={[10, 0, 0]} castShadow/>
            <Environment resolution={256}>
                <group rotation={[-Math.PI / 3, 0, 1]}>
                    <Lightformer form="circle" intensity={100} rotation-x={Math.PI / 2} position={[0, 5, -9]}
                                 scale={2}/>
                    <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2}/>
                    <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, -1, -1]}
                                 scale={2}/>
                    <Lightformer form="circle" intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={8}/>
                    <Lightformer form="ring" color="#444" intensity={80} onUpdate={(self) => self.lookAt(0, 0, 0)}
                                 position={[10, 10, 0]} scale={10}/>
                </group>
            </Environment>
        </>
    );
};

const rfs = THREE.MathUtils.randFloatSpread;
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const bubbleMaterial = new THREE.MeshStandardMaterial({
    color: "#070707",
    envMapIntensity: 1,
    roughness: 0.2,
    transparent: true,
    opacity: 0.5
});

// Adjust Pointer to account for scroll position
const Pointer = () => {
    const ref = useRef();
    const scroll = useScroll();

    useFrame(({pointer, viewport}) => {
        const scrollOffset = scroll.offset;
        console.log(scrollOffset);

        let mousePos = new THREE.Vector3();


        mousePos = mousePos.set(
            (pointer.x * viewport.width) / 2,
            ((pointer.y - scrollOffset * 4) * viewport.height) / 2,
            0
        );

        if (mousePos.y >= -viewport.height / 2)
            ref.current?.setNextKinematicTranslation(mousePos);
    });

    return (
        <RigidBody position={[0, 0, 0]} type="kinematicPosition" colliders={false} ref={ref}>
            <BallCollider args={[2]}/>
        </RigidBody>
    );
};

// Ensure initial positions of balls are centered
const Instances = ({count = 40}) => {
    const instances = useMemo(() => Array.from({length: count}, () => ({
        key: "instance_" + Math.random(),
        position: [rfs(20), rfs(20), rfs(20)],
        rotation: [Math.random(), Math.random(), Math.random()],
    })), [count]);

    const instanceRefs = useRef([]);

    useFrame(() => {
        const center = new THREE.Vector3(0, 0, 0);
        instanceRefs.current.forEach(ref => {
            if (ref) {
                const position = ref.translation();
                const direction = center.clone().sub(position).normalize();
                ref.applyImpulse(direction.multiplyScalar(0.5), true);
            }
        });
    });

    return (
        <InstancedRigidBodies instances={instances} colliders="ball" canSleep={false} ref={instanceRefs}
                              linearDamping={4} angularDamping={1} friction={0.1}>
            <instancedMesh args={[sphereGeometry, bubbleMaterial, count]} count={count} castShadow receiveShadow
                           frustumCulled={false}/>
        </InstancedRigidBodies>
    );
};