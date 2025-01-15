window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                               window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

function get(id) {
    return document.getElementById(id);
}

var canvas = get('canvas');
var heat = simpleheat(canvas).data([]).max(18),
    frame;

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

canvas.ontouchmove = function (e) {
    e.preventDefault(); // Prevent scrolling
    const touch = e.touches[0];
    heat.add([touch.clientX, touch.clientY, 1]);
    frame = frame || window.requestAnimationFrame(draw);
};

canvas.onmousemove = function (e) {
    heat.add([e.offsetX, e.offsetY, 1]);
    frame = frame || window.requestAnimationFrame(draw);
};
