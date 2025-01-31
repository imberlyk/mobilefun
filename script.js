document.addEventListener("DOMContentLoaded", function () {
    const intro = document.querySelector(".intro");
    const content = document.querySelector(".content");
    const canvas = document.getElementById("canvas");
    const heat = simpleheat(canvas).data([]).max(18);
    let frame;

    // Set initial styles for intro
    intro.style.transformOrigin = "top";
    intro.style.position = "absolute"; 
    intro.style.width = "100%";
    intro.style.top = "0";

    function handleScroll() {
        let scrollTop = window.scrollY || document.documentElement.scrollTop;
        let contentOffset = content.offsetTop; 
        let distance = Math.max(0, contentOffset - scrollTop); 
        let scaleValue = Math.max(1, 6.5 - scrollTop / 150); 
        let skewValue = Math.max(0, 20 - scrollTop / 20); 


        intro.style.transform = `scaleY(${scaleValue}) skewY(${skewValue}deg)`;

     
        if (scrollTop >= contentOffset - 100) {
            intro.style.position = "relative";
        } else {
            intro.style.position = "absolute"; 
            intro.style.top = "0";
            intro.style.width = "100%";
        }
    }

    window.addEventListener("scroll", handleScroll);

    // HEAT MAP!!!
    heat.radius(40, 25);

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext("2d");
        ctx.scale(dpr, dpr);
        heat.resize();
        heat.draw();
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    function draw() {
        heat.draw();
        frame = null;
    }

    function getCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
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

    canvas.addEventListener("mousemove", (e) => {
        const { x, y } = getCoordinates(e);
        addHeatPoint(x, y);
    });

    canvas.addEventListener("touchmove", (e) => {
        e.preventDefault();
        if (!canvas.classList.contains("active")) return;
        const { x, y } = getCoordinates(e);
        addHeatPoint(x, y);
    });

    canvas.addEventListener("mousedown", () => canvas.classList.add("active"));
    canvas.addEventListener("mouseup", () => canvas.classList.remove("active"));
    canvas.addEventListener("touchstart", () => canvas.classList.add("active"));
    canvas.addEventListener("touchend", () => canvas.classList.remove("active"));
});
