// src/App.jsx
import React, {Suspense, useState} from 'react';
import {Canvas} from "@react-three/fiber";

import {UI} from "./components/UI.jsx";
import {Hero} from "./components/Hero.jsx";
import {Transition} from "./components/Transition.jsx";
import {Loader, Scroll, ScrollControls} from "@react-three/drei";
import {Image} from "./components/Image.jsx";

function App() {
    const [mode, setMode] = useState(0);

    const handleMode = () => {
        setMode(prevMode => (prevMode === 0 ? 1 : 0));
    }

    return (
        <>
            <button onClick={handleMode} style={{position: 'fixed', top: "2%", left: "2%", zIndex: 1000}}>
                {mode === 0 ? 'About' : 'Home'}
            </button>
            <About mode={mode}/>

            <Canvas shadows camera={{position: [0, 0, 30], fov: 20, near: 0.1, far: 2000}} gl={{
                powerPreference: 'high-performance', alpha: false, antialias: false, stencil: false, depth: false
            }} dpr={[1, 1.5]}>
                <color attach="background" args={["#070707"]}/>
                <Suspense fallback={null}>

                    <Image mode={mode}/>

                    <ScrollControls pages={3}>
                        <Scroll>
                            <Hero/>
                            <Transition mode={mode}/>
                        </Scroll>
                        <Scroll html>
                            <UI mode={mode} setMode={setMode}/>
                        </Scroll>
                    </ScrollControls>
                    {/*<StatsGl/>*/}
                </Suspense>
                {/*<OrbitControls/>*/}
            </Canvas>
            <Loader/>
        </>
    );
}

export default App;

const About = ({mode}) => {

    return (
        <div className="about-section">

            <div className="about-left">
                <div className="center">
                    <TextAnimation text={['A', 'b', 'o', 'u', 't']} mode={mode}/>
                    {/*<p className={mode === 0 ? 'fade-out description' : 'fade-in description'}>
                        I'm a <span>front-end developer</span> based in <span>France</span>. I have a passion for
                        <span> design</span> and <span>development</span>.
                    </p>*/}

                    <div className="line-text">
                        <p style={{'--char-index': 0}}
                           className={mode === 0 ? 'fade-out-right text' : 'fade-in-right text'}>
                            Hello, I&apos;m <span>Aurèle</span>,
                        </p>

                        <p style={{'--char-index': 1}}
                           className={mode === 0 ? 'fade-out-right text' : 'fade-in-right text'}>
                            an <span>18-year-old</span>,
                        </p>

                        <p style={{'--char-index': 2}}
                           className={mode === 0 ? 'fade-out-right text' : 'fade-in-right text'}>
                            <span>french</span> student,
                        </p>

                        <p style={{'--char-index': 3}}
                           className={mode === 0 ? 'fade-out-right text' : 'fade-in-right text'}>
                            in <span>preparatory class</span>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TextAnimation = ({text, mode}) => (
    <p className="text-container title">
        {text.map((char, index) => (
            <span
                key={index}
                className={`${mode === 0 ? 'fade-out-up' : 'fade-in-up'} reveal-text`}
                style={{'--char-index': index + 1}}
            >
                {char}
            </span>
        ))}
    </p>
);