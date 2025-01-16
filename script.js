window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                               window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

const canvas = document.getElementById('canvas');
const heat = simpleheat(canvas).data([]).max(18);
heat.radius(30, 15); 

let frame;

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

function draw() {
    heat.draw();
    frame = null;
}

function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
    };
}

function addHeatPoint(x, y) {
    heat.add([x, y, 1]);
    frame = frame || window.requestAnimationFrame(draw);
}

canvas.addEventListener('mousemove', (e) => {
    const { x, y } = getCoordinates(e);
    addHeatPoint(x, y);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    addHeatPoint(x, y);
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    addHeatPoint(x, y);
});
