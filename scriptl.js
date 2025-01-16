document.addEventListener("DOMContentLoaded", () => {
    const urls = [
   
      "https://imberlyk.github.io/Screenshots/",
      "https://imberlyk.github.io/Screenshots/",
      "https://imberlyk.github.io/Screenshots/",
  
  
  
    ];
  
    const clickButton = document.getElementById("clickButton");
    const urlLink = document.getElementById("urlLink");
  
   
    const explosionCanvas = document.getElementById("explosionCanvas");
    const app = new PIXI.Application({
      view: explosionCanvas,
      resizeTo: window,
      backgroundAlpha: 0, 
      antialias: true
    });
  
    const colors = [0xffd700, 0xff6347, 0x7fffd4, 0xff69b4, 0x00bfff];
  
    clickButton.addEventListener("click", () => {
      const shuffledUrls = shuffleArray([...urls]); 
      let urlIndex = 0;
      const maxCycles = Math.floor(Math.random() * 3 + 3);
      let currentCycle = 0;
  
      const interval = setInterval(() => {
        urlLink.textContent = shuffledUrls[urlIndex];
        urlLink.href = shuffledUrls[urlIndex];
        urlIndex = (urlIndex + 1) % shuffledUrls.length;
  
        if (urlIndex === 0) currentCycle++;
  
        if (currentCycle >= maxCycles) {
          clearInterval(interval);
          const winnerIndex = Math.floor(Math.random() * shuffledUrls.length);
          urlLink.textContent = shuffledUrls[winnerIndex];
          urlLink.href = shuffledUrls[winnerIndex];
          createExplosion();
        }
      }, 100);
    });
  
   
    function createExplosion() {
      const particles = new PIXI.ParticleContainer(500, {
        position: true,
        rotation: true,
        alpha: true,
        scale: true
      });
      app.stage.addChild(particles);
  
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
  
      for (let i = 0; i < 200; i++) {
        const star = createStar();
        star.x = centerX;
        star.y = centerY;
  
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
  
        const targetX = star.x + Math.cos(angle) * speed * 200;
        const targetY = star.y + Math.sin(angle) * speed * 200;
  
        gsap.to(star, {
          duration: Math.random() * 2 + 1,
          x: targetX,
          y: targetY,
          alpha: 0,
          ease: "power1.out",
          onComplete: () => particles.removeChild(star)
        });
  
        particles.addChild(star);
      }
    }
  

    function createStar() {
      const graphics = new PIXI.Graphics();
      const color = colors[Math.floor(Math.random() * colors.length)];
  
      graphics.beginFill(color);
      const r1 = 10;
      const r2 = 5;
      const points = 5;
  
      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? r1 : r2;
        const angle = (Math.PI * i) / points;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) graphics.moveTo(x, y);
        else graphics.lineTo(x, y);
      }
  
      graphics.closePath();
      graphics.endFill();
  
      const texture = app.renderer.generateTexture(graphics);
      return new PIXI.Sprite(texture);
    }
  

    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
  });
  