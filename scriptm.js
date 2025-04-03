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
createTextDiv(300, 400, 'Ahh, The Dress, a perfect analogy for delusion. In 2015, this image shook the internet, an optical illusion that crystallizes differently for each person. You might see a black and blue dress, or you might see a white and gold dress. ', 'text-box');
createTextDiv(2000, 1200, 'This is, imo, a form of delusion...');
createTextDiv(800, 700, 'While there’s no denying that people perceive different colors, there is still one objective truth, an undeniable fact, even if individual perception cant be dismissed. In this case, we moved from a collective delusion, uncertainty about the dresss true colors, to the realization that, even though I know the dress is black and blue, my brain simply refuses to see it as anything but white and gold.', 'text-box');
createTextDiv(100, 3000, 'At times, all I want in life is to simply hihi and haha to exist in a space where seriousness takes a backseat. Delulu offers a kind of refuge, a soft, cushioned hideaway from the harshness of reality when it feels particularly unforgiving.', 'text-box');
createTextDiv(400, 2000, 'While there’s no denying that people perceive different colors, there is still one objective truth, an undeniable fact, even if individual perception can not be dismissed.', 'text-box');
// CREATE STAR CONTAINER
const starsContainer = document.createElement('div');
starsContainer.id = 'stars-container';
starsContainer.style.position = 'fixed';
starsContainer.style.width = '100%';
starsContainer.style.height = '100%';
starsContainer.style.pointerEvents = 'none'; 
document.body.appendChild(starsContainer);

// FUNCTION TO CREATE SVG STARS
const createStarSVG = (size, color) => {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.style.position = "absolute";

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", "M12 2L15 9h7l-5.5 4.5 2 7.5-6-4-6 4 2-7.5L2 9h7z");
    path.setAttribute("fill", color);

    svg.appendChild(path);
    return svg;
};

// CREATE MOVING SVG STARS
const stars = [];
for (let i = 0; i < 100; i++) {
    const size = Math.random() * 15 + 10; 
    const color = "#fcbcd9"; //COLOR IS HERE!!!
    const star = createStarSVG(size, color);
    

    star.dataset.initialX = Math.random() * window.innerWidth; 
    star.dataset.initialY = Math.random() * window.innerHeight;

    star.style.left = `${star.dataset.initialX}px`;
    star.style.top = `${star.dataset.initialY}px`;

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

        const scrollSpeed = 2; 
        targetScrollX += (tiltY / 45) * scrollSpeed;
        targetScrollY += (tiltX / 45) * scrollSpeed;

        targetScrollX = Math.max(0, Math.min(viewportWidth - window.innerWidth, targetScrollX));
        targetScrollY = Math.max(0, Math.min(viewportHeight - window.innerHeight, targetScrollY));
    }
}

// ANIMATION LOOP FOR SMOOTH SCROLLING & STAR MOVEMENT
function animate() {

    currentScrollX += (targetScrollX - currentScrollX) * 0.1;
    currentScrollY += (targetScrollY - currentScrollY) * 0.1;

    scrollableContent.style.transform = `translate(${-currentScrollX}px, ${-currentScrollY}px)`;

    stars.forEach((star, index) => {
        const parallaxFactor = (index + 1) / 200; 
        const offsetX = Math.sin(Date.now() * 0.0005 + index) * 5; 
        const starX = parseFloat(star.dataset.initialX) + (targetScrollX * parallaxFactor) + offsetX;
        const starY = parseFloat(star.dataset.initialY) + (targetScrollY * parallaxFactor);

        star.style.transform = `translate(${starX - window.innerWidth / 2}px, ${starY - window.innerHeight / 2}px)`;
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
