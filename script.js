window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                               window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

const canvas = document.getElementById('canvas');
const heat = simpleheat(canvas).data([]).max(18);
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
    return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height),
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
    e.preventDefault(); // Prevent scrolling while interacting with the canvas
    const { x, y } = getCoordinates(e);
    addHeatPoint(x, y);
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); 
    const { x, y } = getCoordinates(e);
    addHeatPoint(x, y);
});

canvas.addEventListener('touchstart', (e) => console.log('Touchstart detected', e));
canvas.addEventListener('touchmove', (e) => console.log('Touchmove detected', e));
