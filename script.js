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

// Map touch coordinates to canvas
function getTouchPos(canvas, touchEvent) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (touchEvent.touches[0].clientX - rect.left) * (canvas.width / rect.width),
        y: (touchEvent.touches[0].clientY - rect.top) * (canvas.height / rect.height)
    };
}

// Add heatmap point
function addHeatPoint(x, y) {
    heat.add([x, y, 1]);
    frame = frame || window.requestAnimationFrame(draw);
}

// Handle heatmap interaction via mouse
canvas.addEventListener('mousemove', (e) => {
    addHeatPoint(e.offsetX, e.offsetY);
});

// Handle heatmap interaction via touch
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Prevent scrolling
    const pos = getTouchPos(canvas, e);
    addHeatPoint(pos.x, pos.y);
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const pos = getTouchPos(canvas, e);
    addHeatPoint(pos.x, pos.y);
});

// Handle button click
button.addEventListener('click', () => {
    alert('Button clicked!');
});
