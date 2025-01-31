document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Script loaded successfully!");

    const { Engine, Render, Runner, Bodies, Composite, Body, Events } = Matter;

    const content = document.getElementById("content");
    const canvas = document.getElementById("canvas");

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


    content.style.width = "100vw";  // ✅ Fixes spreading issue
    content.style.position = "absolute";


    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight * 7; // 700vh


    const boundaries = [
        Bodies.rectangle(viewportWidth / 2, -50, viewportWidth, 50, { isStatic: true }),
        Bodies.rectangle(viewportWidth / 2, viewportHeight + 50, viewportWidth, 50, { isStatic: true }),
    ];
    Composite.add(world, boundaries);


    const bodyObject = Bodies.rectangle(
        viewportWidth / 2,
        viewportHeight / 2,
        viewportWidth,
        viewportHeight,
        { isStatic: false, frictionAir: 0.1, restitution: 0, render: { visible: false } }
    );
    Composite.add(world, bodyObject);

    let targetScrollY = 0;
    let currentScrollY = 0;

    function handleDeviceOrientation(event) {
        if (!event.beta) {
            console.warn("🚨 No orientation data detected.");
            return;
        }

        let tiltOffset = event.beta - 90;
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
            window.addEventListener('deviceorientation', handleDeviceOrientation);
        }
    }

    requestMotionPermission();

    function animateScroll() {
        currentScrollY += (targetScrollY - currentScrollY) * 0.1;
        content.style.transform = `translate3d(0px, ${-currentScrollY}px, 0px)`; // ✅ Fix scrolling
        requestAnimationFrame(animateScroll);
    }

    animateScroll();

    // 🔥 FIXED HEATMAP SIZE & TOUCH POSITION
    if (canvas) {
        const heat = simpleheat(canvas).data([]).max(18);
        heat.radius(30, 20);

        function resizeCanvas() {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();

            // ✅ Heatmap now always fits **100vw x 100vh**
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;

            const ctx = canvas.getContext("2d");
            ctx.scale(dpr, dpr);
            heat.resize();
            heat.draw();
        }

        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();

        function getCoordinates(e) {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            return {
                x: (clientX - rect.left) * (canvas.width / rect.width),
                y: (clientY - rect.top) * (canvas.height / rect.height)
            };
        }

        function addHeatPoint(x, y) {
            heat.add([x, y, 1]);
            heat.draw();
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
    }
});
