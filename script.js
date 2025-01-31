document.addEventListener("DOMContentLoaded", function () {
    const intro = document.querySelector(".intro");
    const introSpacer = document.querySelector(".intro-spacer");
    const content = document.querySelector(".content");

    function handleScroll() {
        let scrollTop = window.scrollY || document.documentElement.scrollTop;
        let maxScale = 12.5; // Initial stretched scale
        let shrinkSpeed = 50; // Smaller number = faster shrink
        let scaleValue = Math.max(0, maxScale - scrollTop / shrinkSpeed); // Faster shrink

        // Apply scale effect
        intro.style.transform = `scaleY(${scaleValue})`;

        // Fade out when fully shrunk
        if (scaleValue <= 1) {
            intro.style.opacity = "0";
        } else {
            intro.style.opacity = "1";
        }

        // Once fully shrunk, remove intro without shifting content
        if (scaleValue <= 0.1) {
            intro.style.display = "none";
        }
    }

    window.addEventListener("scroll", handleScroll);



    // HEATMAP FUNCTIONALITY
    if (canvas) {
        const heat = simpleheat(canvas).data([]).max(18);
        let frame;

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
    }
});
