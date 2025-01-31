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

    // Adjust content size 
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight * 7; // 700vh

    // Create physics boundaries
    const boundaries = [
        Bodies.rectangle(viewportWidth / 2, -50, viewportWidth, 50, { isStatic: true }),
        Bodies.rectangle(viewportWidth / 2, viewportHeight + 50, viewportWidth, 50, { isStatic: true }),
    ];
    Composite.add(world, boundaries);

    // Create physics body for scrolling
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
        content.style.transform = `translateY(${-currentScrollY}px)`;
        requestAnimationFrame(animateScroll);
    }

    animateScroll();

    // 🔥 HEATMAP
    if (canvas) {
        const heat = simpleheat(canvas).data([]).max(18);
        heat.radius(40, 25);

        canvas.addEventListener("mousemove", (e) => {
            heat.add([e.clientX, e.clientY, 1]);
            heat.draw();
        });

        canvas.addEventListener("touchmove", (e) => {
            e.preventDefault();
            heat.add([e.touches[0].clientX, e.touches[0].clientY, 1]);
            heat.draw();
        });
    }
});
