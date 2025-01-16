
const { Engine, Render, Runner, Bodies, Composite, Events } = Matter;

// ENGINE
const engine = Engine.create();
const world = engine.world;
world.gravity.y = 0; 

// RENDER
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        background: '#f0f0f0',
        wireframes: false,
    },
});
Render.run(render);


const runner = Runner.create();
Runner.run(runner, engine);

// VIEWPORT SIZZZEEEEEEEE
const viewportWidth = window.innerWidth * 8;
const viewportHeight = window.innerHeight * 5;
const boundaryThickness = 50;

document.body.style.width = `${viewportWidth}px`;
document.body.style.height = `${viewportHeight}px`;

// BOUNDARIES
const boundaries = [
    Bodies.rectangle(viewportWidth / 2, -boundaryThickness / 2, viewportWidth, boundaryThickness, { isStatic: true }),
    Bodies.rectangle(viewportWidth / 2, viewportHeight + boundaryThickness / 2, viewportWidth, boundaryThickness, { isStatic: true }),
    Bodies.rectangle(-boundaryThickness / 2, viewportHeight / 2, boundaryThickness, viewportHeight, { isStatic: true }),
    Bodies.rectangle(viewportWidth + boundaryThickness / 2, viewportHeight / 2, boundaryThickness, viewportHeight, { isStatic: true }),
];
Composite.add(world, boundaries);




// TEXT DIV
const createTextDiv = (x, y, text) => {
    const div = document.createElement('div');
    div.textContent = text;
    div.style.position = 'absolute';
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    div.style.fontSize = '100px';
    div.style.color = '#333';
    div.style.backgroundColor = '#fff';
    div.style.padding = '5px';
    div.style.borderRadius = '5px';
    div.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    document.body.appendChild(div);
};

createTextDiv(300, 400, 'WOW');
createTextDiv(2000, 1200, 'THIS MIGHT BE ANNOYING');
createTextDiv(800, 700, 'GLAD YOU FOUND THIS');
createTextDiv(100, 3000, 'AOAOAOAO');

// STARS
const stars = [];
for (let i = 0; i < 100; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    star.style.position = 'absolute';
    star.style.width = '30px';
    star.style.height = '30px';
    star.style.backgroundColor = '#000';
    star.style.borderRadius = '50%';
    star.style.left = `${Math.random() * viewportWidth}px`;
    star.style.top = `${Math.random() * viewportHeight}px`;
    document.body.appendChild(star);
    stars.push(star);
}

// ORIENTATINNNOOON
let scrollX = 0;
let scrollY = 0;

// IPHONE
if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
    const requestPermissionButton = document.createElement('button');
    requestPermissionButton.innerText = 'Enable Motion';
    requestPermissionButton.id = 'motion-permission';
    document.body.appendChild(requestPermissionButton);

    requestPermissionButton.addEventListener('click', () => {
        DeviceMotionEvent.requestPermission()
            .then((response) => {
                if (response === 'granted') {
                    window.addEventListener('deviceorientation', handleDeviceOrientation);
                } else {
                    alert('Motion permission denied.');
                }
                requestPermissionButton.remove();
            })
            .catch(console.error);
    });
} else {
    window.addEventListener('deviceorientation', handleDeviceOrientation);
}

function handleDeviceOrientation(event) {
    if (event.beta !== null && event.gamma !== null) {
        const tiltX = Math.max(-90, Math.min(90, event.beta));
        const tiltY = Math.max(-90, Math.min(90, event.gamma)); 

        const scrollSpeed = 10;
        scrollX += (tiltY / 45) * scrollSpeed;
        scrollY += (tiltX / 45) * scrollSpeed;

       
        scrollX = Math.max(0, Math.min(viewportWidth - window.innerWidth, scrollX));
        scrollY = Math.max(0, Math.min(viewportHeight - window.innerHeight, scrollY));

        document.body.style.transform = `translate(${-scrollX}px, ${-scrollY}px)`;

        // STAAAAAAAARRRRRRRRRRRSSSSSSS
        stars.forEach(star => {
            const starX = parseFloat(star.style.left) + (tiltY / 45) * 2;
            const starY = parseFloat(star.style.top) + (tiltX / 45) * 2;
            star.style.left = `${Math.max(0, Math.min(viewportWidth, starX))}px`;
            star.style.top = `${Math.max(0, Math.min(viewportHeight, starY))}px`;
        });
    }
}

// VIEWPORT GRÖßE
window.addEventListener('resize', () => {
    render.options.width = window.innerWidth;
    render.options.height = window.innerHeight;
    Render.setPixelRatio(render, window.devicePixelRatio);
});

// MOBILEE ONLYYYY
if (!('ontouchstart' in window || navigator.maxTouchPoints)) {
    alert('MOBILE ONLY HIHIHIHI');
}
