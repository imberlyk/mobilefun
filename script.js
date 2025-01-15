window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                               window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

// Helper function to get elements by ID
function get(id) {
    return document.getElementById(id);
}

const canvas = get('canvas');
const button = get('button');

// Initialize heatmap
const heat = simpleheat(canvas).data([]).max(10); // Reduced max intensity for subtle touch
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
    heat._data = heat._data.map(([x, y, intensity]) => [x, y, intensity * 0.95]) // Faster decay for reactivity
                          .filter(([x, y, intensity]) => intensity > 0.01);     // Remove weak points
    if (!frame) frame = window.requestAnimationFrame(draw);
}

// Start decay process
setInterval(decayHeatmap, 50); // Decay every 50ms for smoother updates

// Map touch coordinates to canvas
function getTouchPos(canvas, touchEvent) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (touchEvent.touches[0].clientX - rect.left) * (canvas.width / rect.width),
        y: (touchEvent.touches[0].clientY - rect.top) * (canvas.height / rect.height)
    };
}

// Add touch data to the heatmap
function addHeatPoint(x, y) {
    heat.add([x, y, 0.5]); // Lower intensity for lighter touches
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
    e.preventDefault(); // Prevent scrolling
    const pos = getTouchPos(canvas, e);
    addHeatPoint(pos.x, pos.y);
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault(); // Prevent scrolling
    if (e.touches.length === 0) {
        draw(); // Trigger a final draw on touch release
    }
});

// Handle button click
button.addEventListener('click', () => {
    alert('Button clicked!');
});
