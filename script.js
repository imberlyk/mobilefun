document.addEventListener("DOMContentLoaded", function () {
    const { Engine, Render, World, Bodies, Body } = Matter;

    // Initialize Matter.js Engine
    const engine = Engine.create();
    const world = engine.world;

    // Create Render (Hidden Canvas)
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

    // Physics Body for Scrollable Content
    const bodyObject = Bodies.rectangle(
        window.innerWidth / 2, window.innerHeight / 2,
        window.innerWidth, window.innerHeight * 3, // 3x the height for extended scrolling
        {
            isStatic: false,
            frictionAir: 0.3, // Higher friction for soft movement
            restitution: 0,
            render: { visible: false }
        }
    );

    World.add(world, bodyObject);
    Engine.run(engine);
    Render.run(render);

    // Scroll Page Based on Physics Object Movement
    Matter.Events.on(engine, "afterUpdate", function () {
        window.scrollTo({
            top: bodyObject.position.y - window.innerHeight / 2,
            behavior: "auto" // Prevents abrupt snapping
        });
    });

    // Device Tilt Scrolling
    if (window.DeviceOrientationEvent) {
        window.addEventListener("deviceorientation", function (event) {
            let tilt = event.beta; // Forward/Backward tilt (-180 to 180)
            let neutralPosition = 90; // Holding the phone upright = neutral
            let tiltThreshold = 8; // Minimum tilt before movement starts

            let tiltForce = 0; // Default (no force)
            
            if (tilt < neutralPosition - tiltThreshold) {
                // Tilted forward → Scroll down
                tiltForce = (neutralPosition - tilt) * 0.0004; 
            } else if (tilt > neutralPosition + tiltThreshold) {
                // Tilted backward → Scroll up
                tiltForce = (neutralPosition - tilt) * 0.0004;
            }

            // Apply Smooth Force
            Body.applyForce(bodyObject, { x: bodyObject.position.x, y: bodyObject.position.y }, {
                x: 0,
                y: tiltForce
            });
        });
    }
});
