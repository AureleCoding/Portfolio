import {Hud, OrthographicCamera, shaderMaterial} from "@react-three/drei";
import {resolveLygia} from "resolve-lygia";
import {extend, useFrame} from "@react-three/fiber";
import React, {useEffect, useRef, useState} from "react";
import * as THREE from "three";

// Shader Material
const TransitionMaterial = shaderMaterial(
    {
        uProgression: 1,
        uRepeat: 2,
        uSmoothness: 0,
        uBlueColor: [1.0, 1.0, 1.0, 1.0],
        uTransparentColor: [0.0, 0.0, 0.0, 0.0],
    },
    resolveLygia(/*glsl*/ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`),
    resolveLygia(/*glsl*/ `
    varying vec2 vUv;
    uniform vec4 uBlueColor;
    uniform vec4 uTransparentColor;
    uniform float uProgression;
    uniform float uRepeat;
    uniform float uSmoothness;

    #include "lygia/generative/fbm.glsl"

    float inverseLerp(float value, float minValue, float maxValue) {
      return (value - minValue) / (maxValue - minValue);
    }

    float remap(float value, float inMin, float inMax, float outMin, float outMax) {
      float t = inverseLerp(value, inMin, inMax);
      return mix(outMin, outMax, t);
    }

    void main() {
      vec2 uv = vUv;
      float pct = fbm(uv * uRepeat) * 0.5 + 0.5;

      float smoothenProgression = remap(uProgression, 0.0, 1.0, -uSmoothness / 2.0, 1.0 + uSmoothness / 2.0);
      pct = smoothstep(smoothenProgression, smoothenProgression + uSmoothness / 2.0, pct);

      vec4 finalColor = mix(uTransparentColor, uBlueColor, pct);

      gl_FragColor = finalColor;
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`)
);

extend({TransitionMaterial});

export const Transition = ({mode = 0}) => {
    const mesh = useRef();
    const [transitionReady, setTransitionReady] = useState(false);

    useEffect(() => {
        setTransitionReady(false);

        if (mode === 0) {
            const timer = setTimeout(() => {
                setTransitionReady(true);

            }, 1500);
            return () => clearTimeout(timer);
        } else {
            setTransitionReady(true);
        }

    }, [mode]);

    useFrame((state, delta) => {
        if (transitionReady && mesh.current) {
            const currentProgress = mesh.current.material.uProgression;
            const targetProgress = mode === 0 ? 1 : 0;

            mesh.current.material.uProgression = THREE.MathUtils.lerp(currentProgress, targetProgress, delta * 2);
        }
    });

    return (
        <Hud renderPriority={1}>
            <OrthographicCamera
                makeDefault
                top={1}
                right={1}
                bottom={-1}
                left={-1}
                near={0}
                far={1}
            />

            <mesh ref={mesh}>
                <planeGeometry args={[2, 2]}/>
                <transitionMaterial
                    transparent={true}
                    blending={THREE.NormalBlending}
                />
            </mesh>
        </Hud>
    );
};
