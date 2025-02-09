(function() {
  const canvas = document.getElementById("gauntlet-canvas");
  if (!canvas) {
    console.error("Canvas element with id 'gauntlet-canvas' not found.");
    return;
  }
  const ctx = canvas.getContext("2d");

  /* --- Dynamic Canvas Resizing --- */
  // Instead of a fixed 800x400, we adjust based on screen size while keeping a 2:1 ratio.
  function resizeCanvas() {
    // Use 95% of the viewport width (or a fixed maximum) for the canvas width.
    let desiredWidth = Math.min(window.innerWidth * 0.95, 800);
    // Maintain a 2:1 ratio (width:height).
    let desiredHeight = desiredWidth / 2;
    // Optionally, make sure the height isn’t too large for the viewport.
    if (desiredHeight > window.innerHeight * 0.8) {
      desiredHeight = window.innerHeight * 0.8;
      desiredWidth = desiredHeight * 2;
    }
    canvas.width = desiredWidth;
    canvas.height = desiredHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  /* --- Load Assets & Set Up Variables --- */
  // Load archer animation frames.
  const totalFrames = 28;
  const frames = [];
  let framesLoaded = 0;
  for (let i = 1; i <= totalFrames; i++) {
    const img = new Image();
    img.src = `images/Archer/f${i}.png`;
    img.onload = () => { framesLoaded++; };
    frames.push(img);
  }

  // Load the arrow image.
  const arrowImg = new Image();
  arrowImg.src = "images/Archer/tom1.png";

  // State variables.
  let currentFrame = 0; 
  let isPressed = false;
  let isAiming = false;
  // aimX and aimY track the current pointer position (mouse or touch).
  let aimX = 0, aimY = 0; 
  let arrowFired = false; 
  let arrow = null;      
  let win = false;        
  let firstInteractionMade = false; 

  // Constants for scaling and arrow physics.
  const intendedScaleWidth = 0.7;
  const intendedScaleHeight = 0.9;
  const drawnScaleFactor = 0.75;
  const arrowSpeedFactor = 0.25;
  const gravity = 0.3;         
  const maxPull = 100;          
  const defaultThreshold = 10; // Minimum pull distance in pixels

  // Helper: Returns the fixed launch point (the center of the drawn archer image)
  function getLaunchPoint() {
    const img = frames[currentFrame];
    if (!img.complete) {
      // Fallback approximation.
      return { launchX: 50 + 100, launchY: canvas.height / 2 };
    }
    const intendedWidth = img.width * intendedScaleWidth;
    const intendedHeight = img.height * intendedScaleHeight;
    const intendedX = 50;
    const intendedY = canvas.height / 2 - intendedHeight / 2;
    const drawnWidth = intendedWidth * drawnScaleFactor;
    const drawnHeight = intendedHeight * drawnScaleFactor;
    const drawnX = intendedX + (intendedWidth - drawnWidth) / 2;
    const drawnY = intendedY + (intendedHeight - drawnHeight) / 2;
    const launchX = drawnX + drawnWidth / 2;
    const launchY = drawnY + drawnHeight / 2;
    return { launchX, launchY };
  }

  /* --- Archer Animation Functions --- */
  function pressAnimation(frameIndex) {
    if (!isPressed) return;
    if (frameIndex <= 14) {
      currentFrame = frameIndex;
      if (frameIndex < 14) {
        setTimeout(() => pressAnimation(frameIndex + 1), 50);
      }
    }
  }
  function releaseAnimation(frameIndex) {
    if (frameIndex <= 27) {
      currentFrame = frameIndex;
      setTimeout(() => releaseAnimation(frameIndex + 1), 50);
    } else {
      currentFrame = 0;
    }
  }

  /* --- Event Handlers for Mouse --- */
  // Mouse events continue to work as before.
  canvas.addEventListener("mousedown", function(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    if (!arrowFired && !win) {
      if (!firstInteractionMade) {
        let title = document.querySelector("#panel-gauntlet h2");
        if (title) { title.classList.add("rainbow-title"); }
        firstInteractionMade = true;
      }
      isPressed = true;
      isAiming = true;
      aimX = mouseX;
      aimY = mouseY;
      pressAnimation(1);
    }
  });

  canvas.addEventListener("mousemove", function(e) {
    if (isAiming) {
      const rect = canvas.getBoundingClientRect();
      let newAimX = e.clientX - rect.left;
      let newAimY = e.clientY - rect.top;
      const { launchX } = getLaunchPoint();
      // Prevent pulling to the right of the archer.
      if (newAimX > launchX) { newAimX = launchX; }
      aimX = newAimX;
      aimY = newAimY;
    }
  });

  canvas.addEventListener("mouseup", function(e) {
    if (isPressed && isAiming) {
      isPressed = false;
      isAiming = false;
      const { launchX, launchY } = getLaunchPoint();
      let dx = launchX - aimX;
      let dy = launchY - aimY;
      let d = Math.sqrt(dx * dx + dy * dy);
      if (d < defaultThreshold) {
        dx = maxPull / 2;
        dy = 0;
      } else if (d > maxPull) {
        dx = (dx / d) * maxPull;
        dy = (dy / d) * maxPull;
      }
      const v0x = dx * arrowSpeedFactor;
      const v0y = dy * arrowSpeedFactor;
      arrow = { x: launchX, y: launchY, vx: v0x, vy: v0y };
      arrowFired = true;
      releaseAnimation(15);
    }
  });

  canvas.addEventListener("mouseleave", function() {
    if (isPressed) {
      isPressed = false;
      isAiming = false;
      releaseAnimation(15);
    }
  });

  /* --- Event Handlers for Touch (Mobile Devices) --- */
  // These event listeners mirror the mouse ones but use touch events.
  canvas.addEventListener("touchstart", function(e) {
    e.preventDefault(); // Prevents scrolling
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    if (!arrowFired && !win) {
      if (!firstInteractionMade) {
        let title = document.querySelector("#panel-gauntlet h2");
        if (title) { title.classList.add("rainbow-title"); }
        firstInteractionMade = true;
      }
      isPressed = true;
      isAiming = true;
      aimX = touchX;
      aimY = touchY;
      pressAnimation(1);
    }
  }, {passive: false});

  canvas.addEventListener("touchmove", function(e) {
    e.preventDefault();
    if (isAiming) {
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      let newAimX = touch.clientX - rect.left;
      let newAimY = touch.clientY - rect.top;
      const { launchX } = getLaunchPoint();
      if (newAimX > launchX) { newAimX = launchX; }
      aimX = newAimX;
      aimY = newAimY;
    }
  }, {passive: false});

  canvas.addEventListener("touchend", function(e) {
    e.preventDefault();
    if (isPressed && isAiming) {
      isPressed = false;
      isAiming = false;
      const { launchX, launchY } = getLaunchPoint();
      let dx = launchX - aimX;
      let dy = launchY - aimY;
      let d = Math.sqrt(dx * dx + dy * dy);
      if (d < defaultThreshold) {
        dx = maxPull / 2;
        dy = 0;
      } else if (d > maxPull) {
        dx = (dx / d) * maxPull;
        dy = (dy / d) * maxPull;
      }
      const v0x = dx * arrowSpeedFactor;
      const v0y = dy * arrowSpeedFactor;
      arrow = { x: launchX, y: launchY, vx: v0x, vy: v0y };
      arrowFired = true;
      releaseAnimation(15);
    }
  }, {passive: false});

  canvas.addEventListener("touchcancel", function(e) {
    e.preventDefault();
    if (isPressed) {
      isPressed = false;
      isAiming = false;
      releaseAnimation(15);
    }
  }, {passive: false});

  /* --- Animation Loop --- */
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const img = frames[currentFrame];
    if (img.complete) {
      const intendedWidth = img.width * intendedScaleWidth;
      const intendedHeight = img.height * intendedScaleHeight;
      const intendedX = 50;
      const intendedY = canvas.height / 2 - intendedHeight / 2;
      const drawnWidth = intendedWidth * drawnScaleFactor;
      const drawnHeight = intendedHeight * drawnScaleFactor;
      const drawnX = intendedX + (intendedWidth - drawnWidth) / 2;
      const drawnY = intendedY + (intendedHeight - drawnHeight) / 2;
      ctx.drawImage(img, drawnX, drawnY, drawnWidth, drawnHeight);
      // Draw a marker at the fixed launch point.
      const { launchX, launchY } = getLaunchPoint();
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.beginPath();
      ctx.arc(launchX, launchY, 4, 0, Math.PI * 2);
      ctx.fill();

      if (isAiming) {
        let dx = launchX - aimX;
        let dy = launchY - aimY;
        let d = Math.sqrt(dx * dx + dy * dy);
        if (d > maxPull) {
          dx = (dx / d) * maxPull;
          dy = (dy / d) * maxPull;
        }
        const v0x = dx * arrowSpeedFactor;
        const v0y = dy * arrowSpeedFactor;
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = "rgba(0,0,0,0.7)";
        ctx.beginPath();
        ctx.moveTo(launchX, launchY);
        ctx.lineTo(launchX + v0x * 10, launchY + v0y * 10);
        ctx.stroke();
        ctx.restore();
        // Draw aim dots along the predicted trajectory.
        for (let i = 1; i <= 5; i++) {
          const t = i;
          const dotX = launchX + v0x * t;
          const dotY = launchY + v0y * t + 0.5 * gravity * t * t;
          ctx.fillStyle = (i % 2 === 0) ? "purple" : "orange";
          ctx.beginPath();
          ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    // Draw target.
    const targetX = canvas.width - 100;
    const targetY = canvas.height / 2;
    const targetRadius = 40;
    ctx.fillStyle = "#e74c3c";
    ctx.beginPath();
    ctx.arc(targetX, targetY, targetRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(targetX, targetY, targetRadius * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e74c3c";
    ctx.beginPath();
    ctx.arc(targetX, targetY, targetRadius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Update and draw the arrow if it has been fired.
    if (arrowFired && arrow) {
      arrow.x += arrow.vx;
      arrow.y += arrow.vy;
      arrow.vy += gravity;
      if (arrowImg.complete) {
        // Compute the angle of motion.
        const angle = Math.atan2(arrow.vy, arrow.vx);
        ctx.save();
        ctx.translate(arrow.x, arrow.y);
        // Add a 180° (PI) rotation offset so that the arrow image points toward the target.
        ctx.rotate(angle + Math.PI);
        ctx.drawImage(arrowImg, -arrowImg.width / 2, -arrowImg.height / 2);
        ctx.restore();
      }
      const distX = arrow.x - targetX;
      const distY = arrow.y - targetY;
      const distance = Math.sqrt(distX * distX + distY * distY);
      if (distance < targetRadius && !win) {
        win = true;
        arrowFired = false;
        arrow = null;
        canvas.classList.add("fade-out");
        setTimeout(() => {
          canvas.classList.add("hidden");
          const pane = canvas.parentNode;
          const winMessageDiv = document.createElement("div");
          winMessageDiv.id = "mystery-win-overlay";
          winMessageDiv.innerText = "You Won!";
          pane.appendChild(winMessageDiv);
          setTimeout(() => {
            winMessageDiv.classList.add("win-animation");
          }, 50);
          // Display the win message for 2 seconds, then remove it.
          setTimeout(() => {
            if (winMessageDiv.parentNode) {
              winMessageDiv.parentNode.removeChild(winMessageDiv);
            }
            const cp = document.getElementById("color-picker");
            if (cp && cp.parentNode !== pane) {
              pane.appendChild(cp);
            }
            cp.classList.add("visible");
          }, 2000);
        }, 1000);
      }
      if (arrow && (arrow.x > canvas.width || arrow.y > canvas.height || arrow.y < 0)) {
        arrowFired = false;
        arrow = null;
      }
    }
    if (!win) {
      requestAnimationFrame(animate);
    }
  }

  function checkLoaded() {
    if (framesLoaded === totalFrames && arrowImg.complete) {
      animate();
    } else {
      requestAnimationFrame(checkLoaded);
    }
  }
  
  checkLoaded();
})();
