const { Engine, Render, Runner, Bodies, Composite } = Matter;

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
        background: '#fff',
        wireframes: false,
    },
});
Render.run(render);

const runner = Runner.create();
Runner.run(runner, engine);

// VIEWPORT SIZE
const viewportWidth = window.innerWidth * 8;
const viewportHeight = window.innerHeight * 5;
const boundaryThickness = 50;

//
const scrollableContent = document.getElementById('scrollable-content');
scrollableContent.style.width = `${viewportWidth}px`;
scrollableContent.style.height = `${viewportHeight}px`;

// BOUNDARIES
const boundaries = [
    Bodies.rectangle(viewportWidth / 2, -boundaryThickness / 2, viewportWidth, boundaryThickness, { isStatic: true }),
    Bodies.rectangle(viewportWidth / 2, viewportHeight + boundaryThickness / 2, viewportWidth, boundaryThickness, { isStatic: true }),
    Bodies.rectangle(-boundaryThickness / 2, viewportHeight / 2, boundaryThickness, viewportHeight, { isStatic: true }),
    Bodies.rectangle(viewportWidth + boundaryThickness / 2, viewportHeight / 2, boundaryThickness, viewportHeight, { isStatic: true }),
];
Composite.add(world, boundaries);

// FUNCTION TO CREATE TEXT DIVS
const createTextDiv = (x, y, text, className) => {
    const div = document.createElement('div');
    div.textContent = text;
    div.className = className;
    div.style.position = 'absolute';
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    scrollableContent.appendChild(div);
};

// ADD TEXT DIVS
createTextDiv(300, 400, 'Ahh, The Dress, a perfect analogy for delusion. In 2015, this image shook the internet, an optical illusion that crystallizes differently for each person. You might see a black and blue dress, or you might see a white and gold dress. Isnt that crazy ? Lol.', 'text-box');
createTextDiv(2000, 1200, 'THIS MIGHT BE ANNOYING', 'text-box');
createTextDiv(800, 700, 'GLAD YOU FOUND THIS', 'text-box');
createTextDiv(100, 3000, 'AOAOAOAO', 'text-box');

// CREATE STARS
const stars = [];
for (let i = 0; i < 100; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    star.style.position = 'absolute';
    star.style.width = '30px';
    star.style.height = '30px';
    star.style.backgroundColor = '#001eff';
    star.style.borderRadius = '50%';
    star.style.left = `${Math.random() * viewportWidth}px`;
    star.style.top = `${Math.random() * viewportHeight}px`;
    scrollableContent.appendChild(star);
    stars.push(star);
}

// DEVICE ORIENTATION SCROLLING
let scrollX = 0;
let scrollY = 0;

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

     
        scrollableContent.style.transform = `translate(${-scrollX}px, ${-scrollY}px)`;
    }
}

// UPDATE VIEWPORT SIZE ON RESIZE
window.addEventListener('resize', () => {
    render.options.width = window.innerWidth;
    render.options.height = window.innerHeight;
    Render.setPixelRatio(render, window.devicePixelRatio);
});

// ALERT FOR NON-MOBILE USERS
if (!('ontouchstart' in window || navigator.maxTouchPoints)) {
    alert('This experience is designed for mobile devices.');
}
