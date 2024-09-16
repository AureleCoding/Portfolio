// src/components/Experience.jsx
import {useFrame, useThree} from "@react-three/fiber";
import React, {useEffect, useRef, useState} from "react";
import {CameraControls, OrbitControls, PerspectiveCamera, useFBO} from "@react-three/drei";
import {MathUtils} from "three";
import {Hero} from "./Hero.jsx";
import {useControls} from "leva";

const nbModes = 2;

export const Experience = ({mode, setMode}) => {
    const viewport = useThree((state) => state.viewport);
    const renderedScene = useRef();
    const exampleScene = useRef();

    const renderTarget = useFBO();
    const renderTarget2 = useFBO();
    const renderMaterial = useRef();
    const [prevMode, setPrevMode] = useState(0);

    const transitionSettings = {
        transition: 4,
        speed: 2,
        smoothness: 0.5,
        repeat: 10,
    };

    useEffect(() => {
        if (mode === prevMode) {
            return;
        }
        renderMaterial.current.uProgression = 0;
    }, [mode]);

    useFrame(({gl, scene}, delta) => {
        gl.setRenderTarget(renderTarget);

        if (prevMode === 1) {
            renderedScene.current.visible = false;
            exampleScene.current.visible = true;
        } else {
            renderedScene.current.visible = true;
            exampleScene.current.visible = false;
        }

        renderMaterial.current.uProgression = MathUtils.lerp(renderMaterial.current.uProgression, 1, delta * transitionSettings.speed);
        gl.render(scene, renderCamera.current);

        gl.setRenderTarget(renderTarget2);

        if (mode === 1) {
            renderedScene.current.visible = false;
            exampleScene.current.visible = true;
        } else {
            renderedScene.current.visible = true;
            exampleScene.current.visible = false;
        }

        gl.render(scene, renderCamera.current);

        renderedScene.current.visible = false;
        exampleScene.current.visible = false;

        gl.setRenderTarget(null);
        renderMaterial.current.map = renderTarget.texture;
    });

    const renderCamera = useRef();
    const controls = useRef();

    useEffect(() => {
        controls.current.camera = renderCamera.current;
    }, []);

    useControls("SCENE", {
        mode: {
            value: mode, options: [...Array(nbModes).keys()], onChange: (value) => {
                setMode((mode) => {
                    setPrevMode(mode);
                    return value;
                });
            },
        },
    });

    return (
        <>
            <PerspectiveCamera near={0.5} ref={renderCamera}/>
            <CameraControls
                ref={controls}
                touches={{
                    one: 0, two: 0, three: 0,
                }}
                mouseButtons={{
                    left: 0, middle: 0, right: 0,
                }}
            />

            <OrbitControls/>

            <mesh>
                <planeGeometry args={[viewport.width, viewport.height]}/>
                <transitionMaterial
                    ref={renderMaterial}
                    uTex={renderTarget.texture}
                    uTex2={renderTarget2.texture}
                    toneMapped={false}
                    uTransition={transitionSettings.transition}
                    uRepeat={transitionSettings.repeat}
                    uSmoothness={transitionSettings.smoothness}
                    uProgression={0}
                />
            </mesh>

            <group ref={renderedScene}>
                <Hero/>
            </group>

            <group ref={exampleScene}>
            </group>

            {/*<Environment background preset={"studio"}/>*/}
        </>
    );
};