// Only define the default if it’s not already defined.
if (
  !window.initNewBackground ||
  window.initNewBackground.toString().indexOf("No custom initialization") !== -1
) {
  window.initNewBackground = function () {
    console.log(
      "Default initNewBackground: No custom initialization provided for Background1."
    );
  };
}
if (
  !window.initNewBackground2 ||
  window.initNewBackground2.toString().indexOf("No custom initialization") !== -1
) {
  window.initNewBackground2 = function () {
    console.log(
      "Default initNewBackground2: No custom initialization provided for Background2."
    );
  };
}

document.addEventListener("DOMContentLoaded", function () {
  let currentPermanentBackground = "original";
  const tfGameButton = document.getElementById("tf-game-button");
  const tfGameMessage = document.getElementById("tf-game-message");
  const panelTF = document.getElementById("panel-tf");
  const ROWS = 6;
  const COLS = 6;
  let CELL_SIZE = 70;
  const boardCanvas = document.getElementById("grid-canvas");
  const doglCanvas = document.getElementById("dogl-canvas");
  const dogrCanvas = document.getElementById("dogr-canvas");
  boardCanvas.width = COLS * CELL_SIZE;
  boardCanvas.height = ROWS * CELL_SIZE;
  const container = document.getElementById("game-container");
  const ctx = boardCanvas.getContext("2d");
  let board = [];
  let gameInProgress = false;
  let selectedPiece = null;
  let playerTurn = true;
  let dogsAnimationStarted = false;
  let firstMoveMade = false;

  // Add this at the very top inside your DOMContentLoaded callback
  window.currentBackgroundRenderer = null;
  function disposeCurrentBackgroundRenderer() {
    if (window.currentBackgroundRenderer) {
      window.currentBackgroundRenderer.dispose();
      window.currentBackgroundRenderer = null;
    }
  }

  function initBoard() {
    board = [];
    for (let r = 0; r < ROWS; r++) {
      let row = [];
      for (let c = 0; c < COLS; c++) {
        row.push(null);
      }
      board.push(row);
    }
    board[ROWS - 1][2] = { type: "king", owner: "player" };
    board[ROWS - 1][1] = { type: "soldier", owner: "player" };
    board[ROWS - 1][3] = { type: "soldier", owner: "player" };
    board[0][2] = { type: "king", owner: "ai" };
    board[0][1] = { type: "soldier", owner: "ai" };
    board[0][3] = { type: "soldier", owner: "ai" };
  }

  function drawBoard() {
    ctx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);
    ctx.strokeStyle = "#aaa";
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL_SIZE);
      ctx.lineTo(COLS * CELL_SIZE, r * CELL_SIZE);
      ctx.stroke();
    }
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CELL_SIZE, 0);
      ctx.lineTo(c * CELL_SIZE, ROWS * CELL_SIZE);
      ctx.stroke();
    }
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        let piece = board[r][c];
        if (piece) {
          drawPiece(r, c, piece);
        }
      }
    }
    if (selectedPiece) {
      ctx.strokeStyle = "#ff0";
      ctx.lineWidth = 3;
      ctx.strokeRect(
        selectedPiece.col * CELL_SIZE,
        selectedPiece.row * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
      ctx.lineWidth = 1;
    }
  }

  function drawPiece(row, col, piece) {
    const centerX = col * CELL_SIZE + CELL_SIZE / 2;
    const centerY = row * CELL_SIZE + CELL_SIZE / 2;
    const radius = CELL_SIZE / 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = piece.owner === "player" ? "#e74c3c" : "#3498db";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let label = piece.type === "king" ? "K" : "S";
    ctx.fillText(label, centerX, centerY);
  }

  function getCellFromEvent(evt) {
    const rect = boardCanvas.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);
    return { row, col };
  }

  function inBounds(row, col) {
    return row >= 0 && row < ROWS && col >= 0 && col < COLS;
  }

  function isValidMove(r, c, nr, nc, piece) {
    if (!inBounds(nr, nc)) return false;
    const dRow = Math.abs(nr - r);
    const dCol = Math.abs(nc - c);
    if (piece.type === "king") {
      if (dRow > 1 || dCol > 1 || (dRow === 0 && dCol === 0)) return false;
      let destination = board[nr][nc];
      if (destination && destination.owner === piece.owner) return false;
      return true;
    } else if (piece.type === "soldier") {
      if (dRow === 0 && dCol === 0) return false;
      if (dRow <= 1 && dCol <= 1) {
        let destination = board[nr][nc];
        if (destination && destination.owner === piece.owner) return false;
        return true;
      }
      if (dRow === 2 || dCol === 2) {
        if (
          !(
            (dRow === 2 && dCol === 0) ||
            (dRow === 0 && dCol === 2) ||
            (dRow === 2 && dCol === 2)
          )
        ) {
          return false;
        }
        const midRow = r + (nr - r) / 2;
        const midCol = c + (nc - c) / 2;
        if (!inBounds(midRow, midCol)) return false;
        if (board[midRow][midCol] !== null) return false;
        let destination = board[nr][nc];
        if (destination && destination.owner === piece.owner) return false;
        return true;
      }
      return false;
    }
    return false;
  }

  function checkWin() {
    let playerKingAlive = false;
    let aiKingAlive = false;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const piece = board[r][c];
        if (piece && piece.type === "king") {
          if (piece.owner === "player") playerKingAlive = true;
          else if (piece.owner === "ai") aiKingAlive = true;
        }
      }
    }
    if (!playerKingAlive) return "ai";
    if (!aiKingAlive) return "player";
    return null;
  }

  function evaluateBoard() {
    let score = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        let piece = board[r][c];
        if (piece) {
          let value = piece.type === "king" ? 100 : 10;
          score += piece.owner === "player" ? value : -value;
        }
      }
    }
    return score;
  }

  async function aiMove() {
    let bestMove = null;
    let bestScore = Infinity;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        let piece = board[r][c];
        if (piece && piece.owner === "ai") {
          for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
              let nr = r + dr;
              let nc = c + dc;
              if (isValidMove(r, c, nr, nc, piece)) {
                let saved = board[nr][nc];
                board[nr][nc] = piece;
                board[r][c] = null;
                let captureBonus = 0;
                if (saved && saved.owner === "player") {
                  captureBonus = saved.type === "king" ? -150 : -20;
                }
                let score = evaluateBoard() + captureBonus;
                let noise = (Math.random() - 0.5) * 5;
                let finalScore = score + noise;
                if (finalScore < bestScore) {
                  bestScore = finalScore;
                  bestMove = {
                    from: { row: r, col: c },
                    to: { row: nr, col: nc },
                  };
                }
                board[r][c] = piece;
                board[nr][nc] = saved;
              }
            }
          }
        }
      }
    }
    if (!bestMove) return;
    const { from, to } = bestMove;
    board[to.row][to.col] = board[from.row][from.col];
    board[from.row][from.col] = null;
    drawBoard();
    let winner = checkWin();
    if (winner) {
      endGame(winner);
      return;
    }
    playerTurn = true;
    tfGameMessage.textContent = "Your move!";
  }

  function endGame(winner) {
    gameInProgress = false;
    boardCanvas.removeEventListener("click", onBoardClick);
    let existingBtnContainer = document.getElementById("endgame-buttons");
    if (existingBtnContainer) {
      existingBtnContainer.remove();
    }
    let btnContainer = document.createElement("div");
    btnContainer.id = "endgame-buttons";

    if (winner === "player") {
      tfGameMessage.textContent = "Congratulations, you conquered the grid!";
      let playAgainBtn = document.createElement("button");
      playAgainBtn.textContent = "Play Again";
      playAgainBtn.classList.add("play-again-btn");
      playAgainBtn.addEventListener("click", function () {
        btnContainer.remove();
        container.style.display = "block"; // Show the game container again
        startGame();
      });
      let mysteryBtn = document.createElement("button");
      mysteryBtn.textContent = "Mystery";
      mysteryBtn.classList.add("mystery-btn");
      mysteryBtn.addEventListener("click", function () {
        btnContainer.remove();
        container.style.display = "none";
        let pane = panelTF;
        let winOverlay = document.createElement("div");
        winOverlay.id = "mystery-win-overlay";
        winOverlay.innerText = "You Won!";
        pane.appendChild(winOverlay);
        setTimeout(() => {
          winOverlay.remove();
          
          // Now (after the win message is removed) initialize the background chooser...
          // (Insert your background chooser initialization code here, if it follows immediately.)
        }, 2000);
        for (let i = 0; i < 20; i++) {
          const confetti = document.createElement("div");
          confetti.className = "confetti";
          confetti.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
          confetti.style.top = `${50 + (Math.random() * 50 - 25)}%`;
          confetti.style.left = `${50 + (Math.random() * 50 - 25)}%`;
          confetti.style.transform = "translate(-50%, -50%)";
          confetti.style.opacity = "1";
          confetti.style.animationDelay = `${Math.random() * 0.5}s`;
          pane.appendChild(confetti);
        }
        setTimeout(() => {
          winOverlay.classList.add("win-animation");
          winOverlay.style.transform = "translate(-50%, -50%) scale(1)";
          winOverlay.style.opacity = "1";
        }, 50);
        setTimeout(() => {
          console.log("DEBUG: Timeout triggered. Initializing background chooser...");
          let existingBgContainer = document.getElementById("background-container");
          if (existingBgContainer) {
            console.log("DEBUG: Found existing background container. Removing...");
            existingBgContainer.remove();
          }
          let currentPermanentBackground = "original";
          console.log("DEBUG: Default background set to 'original'.");

          function loadBackground(bg) {
            console.log(`DEBUG: loadBackground called with bg = ${bg}`);
            if (bg === "original") {
              let origCanvas = document.getElementById("bg-canvas");
              if (origCanvas) {
                origCanvas.style.display = "block";
                console.log("DEBUG: Displaying original background canvas.");
              } else {
                console.error("ERROR: Original background canvas (bg-canvas) not found.");
              }
              let altCanvas = document.getElementById("bg-canvas-2");
              if (altCanvas) {
                altCanvas.style.display = "none";
                console.log("DEBUG: Hiding alternate background canvas.");
              }
            } else if (bg === "bg1" || bg === "bg2") {
              let altCanvas = document.getElementById("bg-canvas-2");
              if (altCanvas) {
                altCanvas.parentNode.removeChild(altCanvas);
                console.log("DEBUG: Removed old alternate background canvas.");
              }
              altCanvas = document.createElement("canvas");
              altCanvas.id = "bg-canvas-2";
              document.body.appendChild(altCanvas);
              console.log("DEBUG: Created new alternate background canvas.");
              let origCanvas = document.getElementById("bg-canvas");
              if (origCanvas) {
                origCanvas.style.display = "none";
                console.log("DEBUG: Hiding original background canvas.");
              }
              if (bg === "bg1") {
                console.log("DEBUG: initNewBackground function exists, calling it.");
                initNewBackground();
              } else if (bg === "bg2") {
                console.log("DEBUG: initNewBackground2 function exists, calling it.");
                initNewBackground2();
              }
            }
          }
          function setPermanentBackground(bg) {
            console.log(`DEBUG: setPermanentBackground called with bg = ${bg}`);
            currentPermanentBackground = bg;
            window.activeBackground = bg;
            loadBackground(bg);
          }
          let backgroundContainer = document.createElement("div");
          backgroundContainer.id = "background-container";
          let backgroundTitle = document.createElement("h2");
          backgroundTitle.id = "pick-background-title";
          backgroundTitle.innerText = "Pick a Background";
          backgroundContainer.appendChild(backgroundTitle);
          let buttonsContainer = document.createElement("div");
          buttonsContainer.id = "background-buttons";
          let button1 = document.createElement("button");
          button1.textContent = "Original Background";
          button1.classList.add("background-btn");
          button1.addEventListener("click", function () {
            console.log("DEBUG: Original Background button clicked.");
            setPermanentBackground("original");
          });
          let button2 = document.createElement("button");
          button2.textContent = "Background1";
          button2.classList.add("background-btn");
          button2.addEventListener("click", function () {
            console.log("DEBUG: Background1 button clicked.");
            setPermanentBackground("bg1");
          });
          let button3 = document.createElement("button");
          button3.textContent = "Background2";
          button3.classList.add("background-btn");
          button3.addEventListener("click", function () {
            console.log("DEBUG: Background2 button clicked.");
            setPermanentBackground("bg2");
          });
          buttonsContainer.appendChild(button1);
          buttonsContainer.appendChild(button2);
          buttonsContainer.appendChild(button3);
          backgroundContainer.appendChild(buttonsContainer);
          if (pane) {
            pane.appendChild(backgroundContainer);
            console.log("DEBUG: Background container appended to pane.");
          } else {
            console.error(
              "ERROR: 'pane' element not found. Appending background container to document.body instead."
            );
            document.body.appendChild(backgroundContainer);
          }
        }, 2000);
      });
      btnContainer.appendChild(playAgainBtn);
      btnContainer.appendChild(mysteryBtn);
    } else {
      tfGameMessage.textContent =
        "Oh no, the AI has conquered your forces. Try again!";
      let restartBtn = document.createElement("button");
      restartBtn.textContent = "Restart";
      restartBtn.classList.add("play-again-btn");
      restartBtn.addEventListener("click", function () {
        btnContainer.remove();
        startGame();
      });
      btnContainer.appendChild(restartBtn);
    }
    panelTF.appendChild(btnContainer);
  }

  function onBoardClick(evt) {
    if (!playerTurn) return;
    const { row, col } = getCellFromEvent(evt);
    if (!selectedPiece) {
      const piece = board[row][col];
      if (piece && piece.owner === "player") {
        selectedPiece = { row, col };
        drawBoard();
      }
    } else {
      const piece = board[selectedPiece.row][selectedPiece.col];
      if (isValidMove(selectedPiece.row, selectedPiece.col, row, col, piece)) {
        board[row][col] = piece;
        board[selectedPiece.row][selectedPiece.col] = null;
        selectedPiece = null;
        drawBoard();
        let winner = checkWin();
        if (winner) {
          endGame(winner);
          return;
        }
        if (!firstMoveMade) {
          let title = panelTF.querySelector("h2");
          if (title) {
            title.classList.add("rainbow-title");
          }
          firstMoveMade = true;
        }
        if (!dogsAnimationStarted) {
          doglCanvas.classList.add("dog-active");
          dogrCanvas.classList.add("dog-active");
          preloadDogFramesAndAnimate(doglCanvas, dogrCanvas);
          dogsAnimationStarted = true;
        }
        playerTurn = false;
        tfGameMessage.textContent = "The AI is thinking...";
        setTimeout(aiMove, 800);
      } else {
        selectedPiece = null;
        drawBoard();
      }
    }
  }

  function preloadDogFramesAndAnimate(doglCanvas, dogrCanvas) {
    const totalDogFrames = 10;
    let doglFrames = [];
    let dogrFrames = [];
    let doglFramesLoaded = 0;
    let dogrFramesLoaded = 0;
    for (let i = 1; i <= totalDogFrames; i++) {
      const img = new Image();
      img.src = `images/dogl/f${i}.png`;
      img.onload = () => {
        doglFramesLoaded++;
      };
      doglFrames.push(img);
    }
    for (let i = 1; i <= totalDogFrames; i++) {
      const img = new Image();
      img.src = `images/dogr/f${i}.png`;
      img.onload = () => {
        dogrFramesLoaded++;
      };
      dogrFrames.push(img);
    }
    function checkDogsLoaded() {
      if (doglFramesLoaded === totalDogFrames && dogrFramesLoaded === totalDogFrames) {
        startDogAnimation();
      } else {
        setTimeout(checkDogsLoaded, 50);
      }
    }
    checkDogsLoaded();
    function startDogAnimation() {
      let currentFrame = 0;
      function animateFrame() {
        const doglCtx = doglCanvas.getContext("2d");
        const dogrCtx = dogrCanvas.getContext("2d");
        doglCtx.clearRect(0, 0, doglCanvas.width, doglCanvas.height);
        dogrCtx.clearRect(0, 0, dogrCanvas.width, dogrCanvas.height);
        const doglImg = doglFrames[currentFrame];
        const dogrImg = dogrFrames[currentFrame];
        if (doglImg.complete) {
          doglCtx.drawImage(doglImg, 0, 0, doglCanvas.width, doglCanvas.height);
        }
        if (dogrImg.complete) {
          dogrCtx.drawImage(dogrImg, 0, 0, dogrCanvas.width, dogrCanvas.height);
        }
        currentFrame = (currentFrame + 1) % totalDogFrames;
      }
      setInterval(animateFrame, 70);
    }
  }

  function resizeDogCanvases() {
    const doglCanvas = document.getElementById("dogl-canvas");
    const dogrCanvas = document.getElementById("dogr-canvas");
    if (doglCanvas) {
      doglCanvas.width = doglCanvas.offsetWidth;
      doglCanvas.height = doglCanvas.offsetHeight;
    }
    if (dogrCanvas) {
      dogrCanvas.width = dogrCanvas.offsetWidth;
      dogrCanvas.height = dogrCanvas.offsetHeight;
    }
  }
  window.addEventListener("resize", resizeDogCanvases);
  resizeDogCanvases();

  function resizeGridCanvas() {
    const containerWidth = container.clientWidth;
    const newCellSize = Math.min(Math.floor(containerWidth / COLS), 70);
    CELL_SIZE = newCellSize;
    boardCanvas.width = COLS * CELL_SIZE;
    boardCanvas.height = ROWS * CELL_SIZE;
    drawBoard();
  }
  window.addEventListener("resize", resizeGridCanvas);

  function startGame() {
    initBoard();
    drawBoard();
    selectedPiece = null;
    playerTurn = true;
    gameInProgress = true;
    tfGameMessage.textContent =
      "Your move! Soldiers move up to 2 cells (diagonals allowed) and your King moves 1 cell.";
    boardCanvas.style.display = "block";
    boardCanvas.style.opacity = "1";
    boardCanvas.addEventListener("click", onBoardClick);
  }
  startGame();
  resizeGridCanvas();
});
