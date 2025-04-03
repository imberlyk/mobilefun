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


    const viewportWidth = window.innerWidth * 1;
    const viewportHeight = window.innerHeight * 6;
    content.style.width = `${viewportWidth}px`;
    content.style.height = `${viewportHeight}px`;

    const boundaries = [
        Bodies.rectangle(viewportWidth / 2, -50, viewportWidth, 50, { isStatic: true }),
        Bodies.rectangle(viewportWidth / 2, viewportHeight + 50, viewportWidth, 50, { isStatic: true }),
        Bodies.rectangle(-50, viewportHeight / 2, 50, viewportHeight, { isStatic: true }),
        Bodies.rectangle(viewportWidth + 50, viewportHeight / 2, 50, viewportHeight, { isStatic: true }),
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

    let targetScrollX = 0;
    let targetScrollY = 0;
    let currentScrollX = 0;
    let currentScrollY = 0;

    function handleDeviceOrientation(event) {
        if (event.beta === null || event.gamma === null) {
            console.warn("🚨 No orientation data detected.");
            return;
        }

        console.log("📡 Device Orientation Data:", event.beta, event.gamma);


        const tiltX = Math.max(-90, Math.min(90, event.beta));
        const tiltY = Math.max(-90, Math.min(90, event.gamma));


        const scrollSpeed = 0.005; 
        targetScrollX += (tiltY / 45) * scrollSpeed * viewportWidth;
        targetScrollY += (tiltX / 45) * scrollSpeed * viewportHeight;


        targetScrollX = Math.max(0, Math.min(viewportWidth - window.innerWidth, targetScrollX));
        targetScrollY = Math.max(0, Math.min(viewportHeight - window.innerHeight, targetScrollY));

   
        Body.applyForce(bodyObject, { x: bodyObject.position.x, y: bodyObject.position.y }, {
            x: (tiltY / 90) * 0.002,
            y: (tiltX / 90) * 0.002
        });
    }

    function requestMotionPermission() {
        console.log("🔄 Checking for motion permissions...");

        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            const permissionButton = document.createElement('button');
            permissionButton.innerText = 'Enable Motion/ tilt your phone to navigate';
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

    function animateScroll() {
        currentScrollX += (targetScrollX - currentScrollX) * 0.1;
        currentScrollY += (targetScrollY - currentScrollY) * 0.1;
        content.style.transform = `translate(${-currentScrollX}px, ${-currentScrollY}px)`;

        requestAnimationFrame(animateScroll);
    }
    animateScroll();



    // 🔥 HEATMAP 
    if (canvas) {
        const heat = simpleheat(canvas).data([]).max(18);
    
        function updateRadius() {
        
            const baseRadius = Math.min(window.innerWidth, window.innerHeight) * 0.05; 
            heat.radius(baseRadius, baseRadius * 0.75);
        }
    
        function resizeCanvas() {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
    
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
    
            const ctx = canvas.getContext("2d");
            ctx.scale(dpr, dpr);
            heat.resize();
            updateRadius();
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
            heat.add([x, y, 2]); 
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
        }, { passive: false });
    }
    

});
