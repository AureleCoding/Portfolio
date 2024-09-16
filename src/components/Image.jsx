import React, {useEffect, useRef, useState} from 'react';
import {extend, useFrame, useLoader, useThree} from '@react-three/fiber';
import {Hud, OrthographicCamera, Plane, shaderMaterial} from '@react-three/drei';
import * as THREE from 'three';

// Define custom shader material
const PicturePixelizedMaterial = shaderMaterial(
    {
        u_texture: null,
        u_mouse: new THREE.Vector2(0.5, 0.5),
        u_prevMouse: new THREE.Vector2(0.5, 0.5),
        u_aberrationIntensity: 0.0,
        u_opacity: 0.0,
        u_time: 0.0,
    },
    // Vertex Shader
    `
    uniform float u_time;
varying vec2 vUv;

void main() {
  vUv = uv;
  
  vec3 pos = position;
  pos.x += sin(pos.y + u_time) * 0.05;
    pos.y += sin(pos.x + u_time) * 0.05;
 
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
  `,
    // Fragment Shader
    `
    varying vec2 vUv;
    uniform sampler2D u_texture;    
    uniform vec2 u_mouse;
    uniform vec2 u_prevMouse;
    uniform float u_aberrationIntensity;
    uniform float u_opacity;  

    void main() {
        vec2 gridUV = floor(vUv * vec2(10.0, 10.0)) / vec2(10.0, 10.0);
        vec2 centerOfPixel = gridUV + vec2(1.0/10.0, 1.0/10.0);
        
        vec2 mouseDirection = u_mouse - u_prevMouse;
        
        vec2 pixelToMouseDirection = centerOfPixel - u_mouse;
        float pixelDistanceToMouse = length(pixelToMouseDirection);
        float strength = smoothstep(0.5, 0.0, pixelDistanceToMouse);
 
        vec2 uvOffset = strength * -mouseDirection * 0.3;
        vec2 uv = vUv - uvOffset;
        
        vec4 colorR = texture2D(u_texture, uv + vec2(strength * u_aberrationIntensity * 0.01, 0.0));
        vec4 colorG = texture2D(u_texture, uv);
        vec4 colorB = texture2D(u_texture, uv - vec2(strength * u_aberrationIntensity * 0.01, 0.0));

        vec4 color = vec4(colorR.r, colorG.g, colorB.b, u_opacity);  
        gl_FragColor = color;
        
       #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `
);

extend({PicturePixelizedMaterial});

export const Image = ({mode = 0}) => {
    const meshRef = useRef();
    const {viewport} = useThree();

    const [mousePosition, setMousePosition] = useState({x: 0.5, y: 0.5});
    const [targetMousePosition, setTargetMousePosition] = useState({x: 0.5, y: 0.5});
    const [prevPosition, setPrevPosition] = useState({x: 0.5, y: 0.5});
    const easeFactorRef = useRef(0.02);
    const easeFactorOpacityRef = useRef(0.03);
    const [aberrationIntensity, setAberrationIntensity] = useState(0.0);
    const [opacity, setOpacity] = useState(0.0);
    const [targetOpacity, setTargetOpacity] = useState(0.0);

    const texture = useLoader(THREE.TextureLoader, "./logo.jpg");

    const handlePointerMove = (event) => {
        setPrevPosition({...targetMousePosition});
        setTargetMousePosition({
            x: event.uv.x,
            y: event.uv.y,
        });
        easeFactorRef.current = 0.02;

        setAberrationIntensity(1.0);
    };

    const handlePointerEnter = (event) => {
        easeFactorRef.current = 0.02;
        setMousePosition({
            x: event.uv.x,
            y: event.uv.y,
        });
        setTargetMousePosition({
            x: event.uv.x,
            y: event.uv.y,
        });
    };

    const handlePointerLeave = () => {
        easeFactorRef.current = 0.05;
        setTargetMousePosition({...prevPosition});
        setAberrationIntensity(0.0);
    };

    useFrame((state) => {
        if (meshRef.current) {
            const newMousePosition = {
                x: mousePosition.x + (targetMousePosition.x - mousePosition.x) * easeFactorRef.current,
                y: mousePosition.y + (targetMousePosition.y - mousePosition.y) * easeFactorRef.current,
            };
            setAberrationIntensity(Math.max(0.0, aberrationIntensity - 0.05));
            setMousePosition(newMousePosition);
            setOpacity(opacity + (targetOpacity - opacity) * easeFactorOpacityRef.current);

            meshRef.current.material.uniforms.u_mouse.value.set(newMousePosition.x, newMousePosition.y);
            meshRef.current.material.uniforms.u_prevMouse.value.set(prevPosition.x, prevPosition.y);
            meshRef.current.material.uniforms.u_aberrationIntensity.value = aberrationIntensity;
            meshRef.current.material.uniforms.u_opacity.value = opacity;
            meshRef.current.material.uniforms.u_time.value = state.clock.elapsedTime;
        }
    });

    useEffect(() => {

        if (mode === 1) {
            easeFactorOpacityRef.current = 0.01;
        } else {
            easeFactorOpacityRef.current = 0.03;
        }
        const timer = setTimeout(() => {
            setTargetOpacity(mode === 0 ? 0.0 : 1.0);
        }, 1000);
        return () => clearTimeout(timer);


    }, [mode]);

    return (
        <Hud renderPriority={2}>
            <OrthographicCamera
                top={1}
                right={1}
                bottom={-1}
                left={-1}
                near={0}
                far={1}
            />
            <Plane
                ref={meshRef}
                args={[Math.min(viewport.width, viewport.height) / 1.8, Math.min(viewport.width, viewport.height) / 1.8, 16, 16]}
                onPointerMove={handlePointerMove}
                onPointerEnter={handlePointerEnter}
                onPointerLeave={handlePointerLeave}
                position={[viewport.width / 2.5 - Math.min(viewport.width, viewport.height) / 2, 0, 0]}
            >
                <picturePixelizedMaterial
                    u_texture={texture}
                    transparent={true}
                    blending={THREE.NormalBlending}
                />
            </Plane>
        </Hud>
    );
};
