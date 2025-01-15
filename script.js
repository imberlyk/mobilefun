window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                               window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

const canvas = document.getElementById('canvas');
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

// Decay heatmap points over time
function decayHeatmap() {
    heat._data = heat._data.map(([x, y, intensity]) => [x, y, intensity * 0.98])
                          .filter(([x, y, intensity]) => intensity > 0.01);
    if (!frame) frame = window.requestAnimationFrame(draw);
}
setInterval(decayHeatmap, 100);

// Map touch/mouse coordinates to canvas
function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    return { x: x * (canvas.width / rect.width), y: y * (canvas.height / rect.height) };
}

// Add heatmap point
function addHeatPoint(x, y) {
    heat.add([x, y, 1]);
    frame = frame || window.requestAnimationFrame(draw);
}

// Handle mouse and touch events
canvas.addEventListener('mousemove', (e) => {
    const { x, y } = getCoordinates(e);
    addHeatPoint(x, y);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    addHeatPoint(x, y);
});

// Optional: Add initial point on touchstart
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    addHeatPoint(x, y);
});
