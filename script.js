document.addEventListener("DOMContentLoaded", function () {
    const { Engine, Render, World, Bodies, Body } = Matter;

    const intro = document.querySelector(".intro");
    const canvas = document.getElementById("canvas");

    // Initialize Matter.js Physics Engine
    const engine = Engine.create();
    const world = engine.world;

    // Render (Hidden canvas, physics only)
    const render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            wireframes: false,
            background: "transparent"
        }
    });

    // Large physics body representing the document
    const bodyObject = Bodies.rectangle(
        window.innerWidth / 2, window.innerHeight / 2,
        window.innerWidth, window.innerHeight * 5,
        {
            isStatic: false,
            frictionAir: 0.2, // Increased for slower movement
            restitution: 0,
            render: { visible: false }
        }
    );

    // Add body to the physics world
    World.add(world, bodyObject);
    Engine.run(engine);
    Render.run(render);

    // Update scroll position based on physics body movement
    Matter.Events.on(engine, "afterUpdate", function () {
        window.scrollTo({
            top: bodyObject.position.y - window.innerHeight / 2,
            behavior: "auto" // No smooth scroll to avoid unwanted inertia
        });
    });

    // Device Tilt to Scroll
    if (window.DeviceOrientationEvent) {
        window.addEventListener("deviceorientation", function (event) {
            let tilt = event.beta; // Forward/Backward tilt (-90 to 90)
            let threshold = 10; // Only react to significant tilt changes

            if (Math.abs(tilt) > threshold) {
                let force = tilt * 0.0005; // Adjusted for better control
                Body.applyForce(bodyObject, { x: bodyObject.position.x, y: bodyObject.position.y }, {
                    x: 0,
                    y: force
                });
            } else {
                // Stop movement if tilt is below threshold
                Body.setVelocity(bodyObject, { x: 0, y: 0 });
            }
        });
    }

    // ScaleY Effect on Scroll
    function handleScroll() {
        let scrollTop = window.scrollY || document.documentElement.scrollTop;
        let maxScale = 12.5;
        let shrinkSpeed = 50;
        let scaleValue = Math.max(0, maxScale - scrollTop / shrinkSpeed);

        // Apply scale effect
        intro.style.transform = `scaleY(${scaleValue})`;

        // Fade out when fully shrunk
        intro.style.opacity = scaleValue <= 1 ? "0" : "1";

        // Hide when almost invisible
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
