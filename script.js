
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                               window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

// Helper function to get elements by ID
function get(id) {
    return document.getElementById(id);
}

const canvas = get('canvas');
const button = get('button');

// Initialize heatmap
const heat = simpleheat(canvas).data([]).max(18);
let frame;

// Resize canvas dynamically
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    canvas.getContext('2d').scale(dpr, dpr);

    heat.resize();
    heat.draw();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Draw the heatmap
function draw() {
    heat.draw();
    frame = null;
}

// Function to decay heatmap points over time
function decayHeatmap() {
    heat._data = heat._data.map(([x, y, intensity]) => [x, y, intensity * 0.98]) // Reduce intensity
                          .filter(([x, y, intensity]) => intensity > 0.01);     // Remove weak points
    if (!frame) frame = window.requestAnimationFrame(draw);
}

// Start decay process
setInterval(decayHeatmap, 100); // Decay every 100ms

// Handle heatmap interaction via mouse
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const x = (e.clientX - rect.left) * dpr;
    const y = (e.clientY - rect.top) * dpr;

    heat.add([x, y, 1]);
    frame = frame || window.requestAnimationFrame(draw);
});

// Handle heatmap interaction via touch
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Prevent scrolling
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const x = (touch.clientX - rect.left) * dpr;
    const y = (touch.clientY - rect.top) * dpr;

    heat.add([x, y, 1]);
    frame = frame || window.requestAnimationFrame(draw);
});

// Ripple effect for button clicks
function createRipple(event) {
    const button = event.currentTarget;

    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add("ripple");

    const ripple = button.getElementsByClassName("ripple")[0];

    if (ripple) {
        ripple.remove();
    }

    button.appendChild(circle);
}

// Add ripple effect to all buttons
const buttons = document.getElementsByTagName("button");
for (const button of buttons) {
    button.addEventListener("click", createRipple);
}
