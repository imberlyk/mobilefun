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

// SCROLLABLE CONTENT
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

// TEXT ELEMENTS
const createTextDiv = (x, y, text, className) => {
    const div = document.createElement('div');
    div.textContent = text;
    div.className = className;
    div.style.position = 'absolute';
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    scrollableContent.appendChild(div);
};

// ADD TEXT ELEMENTS
createTextDiv(300, 400, 'Ahh, The Dress, a perfect analogy for delusion...', 'text-box');
createTextDiv(2000, 1200, 'This is, imo, a form of delusion...', 'text-box');
createTextDiv(800, 700, 'The concept of delulu is undeniably intriguing...', 'text-box');
createTextDiv(100, 3000, 'AOAOAOAO', 'text-box');

// CREATE STAR CONTAINER
const starsContainer = document.createElement('div');
starsContainer.id = 'stars-container';
starsContainer.style.position = 'fixed';
starsContainer.style.width = '100%';
starsContainer.style.height = '100%';
starsContainer.style.pointerEvents = 'none'; // Prevent interaction
document.body.appendChild(starsContainer);

// CREATE MOVING STARS
const stars = [];
for (let i = 0; i < 100; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    star.style.position = 'absolute';
    star.style.width = '30px';
    star.style.height = '30px';
    star.style.backgroundColor = '#001eff';
    star.style.borderRadius = '50%';
    star.style.left = `${Math.random() * window.innerWidth}px`; 
    star.style.top = `${Math.random() * window.innerHeight}px`; 
    starsContainer.appendChild(star);
    stars.push(star);
}

// DEVICE ORIENTATION SCROLLING WITH LERPING
let targetScrollX = 0;
let targetScrollY = 0;
let currentScrollX = 0;
let currentScrollY = 0;

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

        const scrollSpeed = 5; // Reduced speed for smoother movement
        targetScrollX += (tiltY / 45) * scrollSpeed;
        targetScrollY += (tiltX / 45) * scrollSpeed;

        targetScrollX = Math.max(0, Math.min(viewportWidth - window.innerWidth, targetScrollX));
        targetScrollY = Math.max(0, Math.min(viewportHeight - window.innerHeight, targetScrollY));
    }
}

// ANIMATION LOOP FOR SMOOTH SCROLLING & STAR MOVEMENT
function animate() {
    // Apply lerping to smooth the motion
    currentScrollX += (targetScrollX - currentScrollX) * 0.1;
    currentScrollY += (targetScrollY - currentScrollY) * 0.1;

    // Move content
    scrollableContent.style.transform = `translate(${-currentScrollX}px, ${-currentScrollY}px)`;

    // Move stars dynamically
    stars.forEach((star, index) => {
        const parallaxFactor = 0.02 + (index / 500); // Each star moves slightly differently
        const starX = (window.innerWidth / 2 - currentScrollX) * parallaxFactor;
        const starY = (window.innerHeight / 2 - currentScrollY) * parallaxFactor;

        star.style.transform = `translate(${starX}px, ${starY}px)`;
    });

    requestAnimationFrame(animate);
}
animate();

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
