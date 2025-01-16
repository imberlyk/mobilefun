// Include the Matter.js library
const { Engine, Render, Runner, Bodies, Composite, Events } = Matter;

// Create an engine
const engine = Engine.create();
const world = engine.world;
world.gravity.y = 0; // Disable gravity

// Create a renderer
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

// Create a runner
const runner = Runner.create();
Runner.run(runner, engine);

// Create a huge viewport (canvas)
const viewportWidth = 5000;
const viewportHeight = 3000;
const boundaryThickness = 50;

// Add boundaries to keep objects inside the viewport
const boundaries = [
    Bodies.rectangle(viewportWidth / 2, -boundaryThickness / 2, viewportWidth, boundaryThickness, { isStatic: true }),
    Bodies.rectangle(viewportWidth / 2, viewportHeight + boundaryThickness / 2, viewportWidth, boundaryThickness, { isStatic: true }),
    Bodies.rectangle(-boundaryThickness / 2, viewportHeight / 2, boundaryThickness, viewportHeight, { isStatic: true }),
    Bodies.rectangle(viewportWidth + boundaryThickness / 2, viewportHeight / 2, boundaryThickness, viewportHeight, { isStatic: true }),
];
Composite.add(world, boundaries);

// Add pointers at various locations
const pointers = [
    Bodies.circle(500, 500, 20, { isStatic: true, render: { fillStyle: 'red' } }),
    Bodies.circle(2500, 1500, 20, { isStatic: true, render: { fillStyle: 'blue' } }),
    Bodies.circle(4500, 2500, 20, { isStatic: true, render: { fillStyle: 'green' } }),
];
Composite.add(world, pointers);

// Add divs with text all over the viewport
const createTextDiv = (x, y, text) => {
    const div = document.createElement('div');
    div.textContent = text;
    div.style.position = 'absolute';
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    div.style.fontSize = '24px';
    div.style.color = '#333';
    div.style.backgroundColor = '#fff';
    div.style.padding = '5px';
    div.style.borderRadius = '5px';
    div.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    document.body.appendChild(div);
};

createTextDiv(300, 400, 'Welcome to the viewport!');
createTextDiv(2000, 1200, 'Keep scrolling...');
createTextDiv(4000, 2500, 'Almost there!');

// Handle device orientation
let scrollX = 0;
let scrollY = 0;

// Request motion and orientation permission for iOS devices
if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
    const requestPermissionButton = document.createElement('button');
    requestPermissionButton.innerText = 'Enable Motion';
    requestPermissionButton.style.position = 'absolute';
    requestPermissionButton.style.top = '10px';
    requestPermissionButton.style.left = '10px';
    requestPermissionButton.style.zIndex = '1000';
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
        const tiltX = Math.max(-90, Math.min(90, event.beta)); // Front-to-back tilt
        const tiltY = Math.max(-90, Math.min(90, event.gamma)); // Left-to-right tilt

        // Map tilt to scroll speed
        const scrollSpeed = 5;
        scrollX += (tiltY / 90) * scrollSpeed;
        scrollY += (tiltX / 90) * scrollSpeed;

        // Clamp scroll position within viewport boundaries
        scrollX = Math.max(0, Math.min(viewportWidth - window.innerWidth, scrollX));
        scrollY = Math.max(0, Math.min(viewportHeight - window.innerHeight, scrollY));

        // Apply transform to simulate scrolling
        document.body.style.transform = `translate(${-scrollX}px, ${-scrollY}px)`;
    }
}

// Resize handler to update renderer size
window.addEventListener('resize', () => {
    render.options.width = window.innerWidth;
    render.options.height = window.innerHeight;
    Render.setPixelRatio(render, window.devicePixelRatio);
});

// Ensure this is only active on mobile devices
if (!('ontouchstart' in window || navigator.maxTouchPoints)) {
    alert('This demo is designed for mobile devices with motion sensors.');
}
