document.addEventListener("DOMContentLoaded", function () {
    const { Engine, Render, World, Bodies, Body } = Matter;

    const scrollableContent = document.getElementById("scrollable-content");

    // Initialize Matter.js Physics Engine
    const engine = Engine.create();
    const world = engine.world;

    // Hidden Matter.js canvas (for physics calculations only)
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

    // Create a physics body for the scrollable content
    const contentHeight = scrollableContent.scrollHeight;
    const bodyObject = Bodies.rectangle(
        window.innerWidth / 2, window.innerHeight / 2,
        window.innerWidth, contentHeight,
        {
            isStatic: false,
            frictionAir: 0.2, // Slow down movement for smooth reaction
            restitution: 0,
            render: { visible: false }
        }
    );

    // Add body to the physics world
    World.add(world, bodyObject);
    Engine.run(engine);
    Render.run(render);

    // Neutral position is phone upright (90°), tilting up/down triggers scroll
    if (window.DeviceOrientationEvent) {
        window.addEventListener("deviceorientation", function (event) {
            let tilt = event.beta; // Forward/Backward tilt (-90 to 90)
            let neutralPosition = 90; // Upright position for holding phone
            let tiltOffset = tilt - neutralPosition; // Adjusted tilt calculation

            let threshold = 5; // Minimum tilt required for movement
            if (Math.abs(tiltOffset) > threshold) {
                let force = tiltOffset * 0.0005; // Adjusted for better control
                Body.applyForce(bodyObject, { x: bodyObject.position.x, y: bodyObject.position.y }, {
                    x: 0,
                    y: force
                });
            } else {
                // Stop movement when near neutral position
                Body.setVelocity(bodyObject, { x: 0, y: 0 });
            }
        });
    }

    // Update scroll position based on physics body movement
    Matter.Events.on(engine, "afterUpdate", function () {
        window.scrollTo({
            top: bodyObject.position.y - window.innerHeight / 2,
            behavior: "smooth"
        });
    });
});
