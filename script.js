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

    Events.on(engine, "afterUpdate", function () {
        targetScrollY = bodyObject.position.y - window.innerHeight / 2;
    });

    function animateScroll() {
        currentScrollY += (targetScrollY - currentScrollY) * 0.1;
        content.scrollTop = currentScrollY;
        requestAnimationFrame(animateScroll);
    }

    animateScroll();

    const heat = simpleheat(canvas).data([]).max(18);
    heat.radius(40, 25);

    function draw() {
        heat.draw();
    }

    canvas.addEventListener("mousemove", (e) => {
        heat.add([e.clientX, e.clientY, 1]);
        window.requestAnimationFrame(draw);
    });

    canvas.addEventListener("touchmove", (e) => {
        e.preventDefault();
        heat.add([e.touches[0].clientX, e.touches[0].clientY, 1]);
        window.requestAnimationFrame(draw);
    });
});
