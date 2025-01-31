document.addEventListener("DOMContentLoaded", function () {
    const intro = document.querySelector(".intro");
    const content = document.querySelector(".content");
    const canvas = document.getElementById("canvas");

    function handleScroll() {
        let scrollTop = window.scrollY || document.documentElement.scrollTop;
        let maxScale = 12.5; // Initial stretched scale
        let shrinkSpeed = 50; // Smaller number = faster shrink
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

    // Matter.js Setup
    const { Engine, Render, World, Bodies } = Matter;

    const engine = Engine.create();
    const world = engine.world;

    const render = Render.create({
        element: document.body,
        canvas: canvas,
        engine: engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight * 2,
            background: "transparent",
            wireframes: false
        }
    });

    const textBody = Bodies.rectangle(window.innerWidth / 2, 100, 300, 80, {
        restitution: 0.3, // Soft bounce
        frictionAir: 0.05, // Slow movement
        mass: 1,
        render: {
            fillStyle: "blue"
        }
    });

    World.add(world, [textBody]);

    Engine.run(engine);
    Render.run(render);

    // Slow Y-axis movement
    Matter.Events.on(engine, "afterUpdate", () => {
        Matter.Body.setVelocity(textBody, { x: 0, y: textBody.velocity.y * 0.95 });
    });

    // Device Orientation to Scroll
    if (window.DeviceOrientationEvent) {
        window.addEventListener("deviceorientation", function (event) {
            let tilt = event.beta; // Forward/backward tilt (-90 to 90)

            if (tilt > 10) {
                window.scrollBy(0, tilt * 0.5);
            } else if (tilt < -10) {
                window.scrollBy(0, tilt * -0.5);
            }
        });
    }
});
