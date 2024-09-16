export const UI = ({mode = 0}) => {

    return (
        <>
            <div className="ui">

                <div className={mode === 0 ? 'fade-in' : 'fade-out'}>
                    <Home/>
                    <Project/>
                </div>
            </div>
        </>
    );
};

// Home Component
const Home = () => {
    return (
        <div className="home-section">
            <div className="hero">
                <div className="center">
                    <p className="text">AurèleJ</p>
                    <p className="description">
                        Hello ! <span>I'm Aurèle</span>, Welcome to <span>my portfolio</span> !
                    </p>
                </div>
            </div>
        </div>
    );
};

// Project Component
const Project = () => {
    return (
        <div className="project-section">
            <div className="project">
                <div className="center">
                    <p className="text">Projects</p>
                    <p className="description">
                        Here are some of my <span>projects</span> that I have worked on.
                    </p>
                </div>
            </div>
        </div>
    );
};
