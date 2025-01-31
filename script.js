document.addEventListener("DOMContentLoaded", function () {
    console.log("Script loaded successfully!");

    const { Engine, Render, Runner, Bodies, Composite, Body } = Matter;

    const intro = document.querySelector(".intro");
    const canvas = document.getElementById("canvas");
    const scrollableContent = document.getElementById("scrollable-content");

    // Initialize Matter.js Physics Engine
    const engine = Engine.create();
    const world = engine.world;
    world.gravity.y = 0; // Disable default gravity

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

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Create a physics body for scrolling
    const contentHeight = scrollableContent.scrollHeight;
    const bodyObject = Bodies.rectangle(
        window.innerWidth / 2, window.innerHeight / 2,
        window.innerWidth, contentHeight,
        {
            isStatic: false,
            frictionAir: 0.1, // Smooth movement, slower reaction
            restitution: 0,
            render: { visible: false }
        }
    );

    // Boundaries to prevent infinite scrolling
    const boundaries = [
        Bodies.rectangle(window.innerWidth / 2, -50, window.innerWidth, 50, { isStatic: true }),
        Bodies.rectangle(window.innerWidth / 2, contentHeight + 50, window.innerWidth, 50, { isStatic: true })
    ];

    Composite.add(world, [bodyObject, ...boundaries]);

    let targetScrollY = 0;
    let currentScrollY = 0;

    function handleDeviceOrientation(event) {
        if (!event.beta) {
            console.warn("No orientation data detected.");
            return;
        }

        let tilt = event.beta; // Forward/Backward tilt (-90 to 90)
        let neutralPosition = 90; // Holding phone upright
        let tiltOffset = tilt - neutralPosition;

        let threshold = 5; // Minimum tilt required for movement
        if (Math.abs(tiltOffset) > threshold) {
            let force = tiltOffset * 0.0003; // Adjusted force for smooth scrolling
            Body.applyForce(bodyObject, { x: bodyObject.position.x, y: bodyObject.position.y }, {
                x: 0,
                y: force
            });
        } else {
            // Stop movement when near neutral position
            Body.setVelocity(bodyObject, { x: 0, y: 0 });
        }
    }

    function requestMotionPermission() {
        console.log("Checking for motion permissions...");
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            const permissionButton = document.createElement('button');
            permissionButton.innerText = 'Enable Motion';
            permissionButton.id = 'motion-permission';
            permissionButton.style.position = 'fixed';
            permissionButton.style.top = '50%';
            permissionButton.style.left = '50%';
            permissionButton.style.transform = 'translate(-50%, -50%)';
            permissionButton.style.padding = '10px 20px';
            permissionButton.style.fontSize = '18px';
            permissionButton.style.zIndex = '10000';

            document.body.appendChild(permissionButton);

            permissionButton.addEventListener('click', () => {
                DeviceMotionEvent.requestPermission().then(response => {
                    if (response === 'granted') {
                        console.log("Motion permission granted.");
                        window.addEventListener('deviceorientation', handleDeviceOrientation);
                        permissionButton.remove();
                    } else {
                        alert('Motion permission denied.');
                    }
                }).catch(error => {
                    console.error("Error requesting permission:", error);
                });
            });
        } else {
            console.log("No permission required (non-iOS).");
            window.addEventListener('deviceorientation', handleDeviceOrientation);
        }
    }

    requestMotionPermission();

    // Update scroll position based on physics body movement
    Matter.Events.on(engine, "afterUpdate", function () {
        targetScrollY = bodyObject.position.y - window.innerHeight / 2;
    });

    function animateScroll() {
        currentScrollY += (targetScrollY - currentScrollY) * 0.1; // Lerp for smooth movement
        window.scrollTo(0, currentScrollY);
        requestAnimationFrame(animateScroll);
    }

    animateScroll();

    // 🔥 HEATMAP FUNCTIONALITY (Restored)
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
