document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Script loaded successfully!");

    const { Engine, Render, Runner, Bodies, Composite, Body, Events } = Matter;

    const content = document.getElementById("content");
    if (!content) {
        console.error("🚨 ERROR: #content not found! Check your HTML.");
        return;
    }

    const engine = Engine.create();
    const world = engine.world;
    world.gravity.y = 0;

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

    // Create an invisible physics body to represent the content's scroll
    const contentHeight = content.scrollHeight;
    const bodyObject = Bodies.rectangle(
        window.innerWidth / 2, window.innerHeight / 2,
        window.innerWidth, contentHeight,
        { isStatic: false, frictionAir: 0.1, restitution: 0, render: { visible: false } }
    );

    const boundaries = [
        Bodies.rectangle(window.innerWidth / 2, -50, window.innerWidth, 50, { isStatic: true }),
        Bodies.rectangle(window.innerWidth / 2, contentHeight + 50, window.innerWidth, 50, { isStatic: true })
    ];

    Composite.add(world, [bodyObject, ...boundaries]);

    let targetScrollY = 0;
    let currentScrollY = 0;

    function handleDeviceOrientation(event) {
        if (event.beta === null) {
            console.warn("🚨 No orientation data detected.");
            return;
        }

        console.log("📡 Device Orientation Data:", event.beta);

        let tiltOffset = event.beta - 90; // Adjust for phone's natural resting position
        let threshold = 5;

        if (Math.abs(tiltOffset) > threshold) {
            let force = tiltOffset * 0.0003;
            Body.applyForce(bodyObject, { x: bodyObject.position.x, y: bodyObject.position.y }, { x: 0, y: force });
        } else {
            Body.setVelocity(bodyObject, { x: 0, y: 0 });
        }
    }

    function requestMotionPermission() {
        console.log("🔄 Checking for motion permissions...");

        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            const permissionButton = document.createElement('button');
            permissionButton.innerText = 'Enable Motion';
            permissionButton.id = 'motion-permission';

            Object.assign(permissionButton.style, {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                padding: '15px 25px',
                fontSize: '18px',
                fontWeight: 'bold',
                backgroundColor: 'rgba(150,150,150,1)',
                color: 'blue',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                zIndex: '1000000',
                display: 'block'
            });

            document.body.appendChild(permissionButton);

            permissionButton.addEventListener('click', () => {
                DeviceMotionEvent.requestPermission().then(response => {
                    if (response === 'granted') {
                        console.log("✅ Motion permission granted.");
                        window.addEventListener('deviceorientation', handleDeviceOrientation);
                        permissionButton.remove();
                    } else {
                        alert('🚨 Motion permission denied.');
                    }
                }).catch(error => console.error("🚨 Error requesting permission:", error));
            });
        } else {
            console.log("🔄 No permission required (non-iOS).");
            window.addEventListener('deviceorientation', handleDeviceOrientation);
        }
    }

    requestMotionPermission();

    Events.on(engine, "afterUpdate", function () {
        targetScrollY = bodyObject.position.y - window.innerHeight / 2;
    });

    function animateScroll() {
        if (content) {
            currentScrollY += (targetScrollY - currentScrollY) * 0.1; 
            content.scrollTop = currentScrollY; // Scroll inside .content
        }
        requestAnimationFrame(animateScroll);
    }

    animateScroll();

    // 🔥 HEATMAP FUNCTIONALITY
    const canvas = document.getElementById("canvas");

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
            const { x, y } = getCoordinates(e);
            addHeatPoint(x, y);
        });

        canvas.addEventListener("mousedown", () => canvas.classList.add("active"));
        canvas.addEventListener("mouseup", () => canvas.classList.remove("active"));
        canvas.addEventListener("touchstart", () => canvas.classList.add("active"));
        canvas.addEventListener("touchend", () => canvas.classList.remove("active"));
    }
});
