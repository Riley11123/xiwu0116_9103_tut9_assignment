// Mondrian-style Interactive Sketch with User Input
let lines = [];
let preLines = [];
let postLines = [];
let rectangles = [];
let filledRects = [];
let horizontal = true;
let clickCount = 0;
let gameStarted = false;
let instructionsVisible = true;

function setup() { // Initialize canvas and display instructions
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(18);
  noLoop();
  background(255);
  showInstructions();
}

function showInstructions() { // Show game rules before interaction starts
  background(255);
  fill(0);
  noStroke();
  text("Click the edge of the canvas to add lines. Click to add straight lines. Double-click to generate rectangles (please double-click only after more than 5 lines are created).\nFeel free to create your own Mondrian-style artwork!\nClick any blank area to start.", width / 2, height / 2);
}

function mousePressed() { // Handle mouse click to add lines
  if (!gameStarted) {
    gameStarted = true;
    instructionsVisible = false;
    background(255);
    redraw();
    return;
  }

  let edgeMargin = 30;
  if (
    mouseX < edgeMargin || mouseX > width - edgeMargin ||
    mouseY < edgeMargin || mouseY > height - edgeMargin
  ) {
    let newLine;
    if (mouseX > mouseY) {
      newLine = { type: 'v', pos: mouseX }; // Vertical line
    } else {
      newLine = { type: 'h', pos: mouseY }; // Horizontal line
    }

    if (filledRects.length === 0) {
      preLines.push(newLine);
    } else {
      postLines.push(newLine);
    }
    lines.push(newLine);
    redraw();
  }
}

function doubleClicked() { // Handle double-click to generate and fill rectangles
  if (lines.length < 5) return;

  let hLines = lines.filter(l => l.type === 'h').map(l => l.pos).sort((a, b) => a - b);
  let vLines = lines.filter(l => l.type === 'v').map(l => l.pos).sort((a, b) => a - b);

  for (let i = 0; i < hLines.length - 1; i++) {
    for (let j = 0; j < vLines.length - 1; j++) {
      let x = vLines[j];
      let y = hLines[i];
      let w = vLines[j + 1] - x;
      let h = hLines[i + 1] - y;
      let cx = x + w / 2;
      let cy = y + h / 2;

      if (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) {
        let neighbors = getNeighborColors(x, y, w, h);
        let choices = ['red', 'yellow', 'blue'].filter(c => !neighbors.includes(c));
        if (choices.length === 0) return;
        let picked = random(choices);
        filledRects.push({ x, y, w, h, color: picked });
        redraw();
        return;
      }
    }
  }
}

function getNeighborColors(x, y, w, h) { // Check neighbor rectangles for color constraints
  let neighbors = [];
  for (let r of filledRects) {
    let alignedH = r.y === y && r.h === h;
    let alignedV = r.x === x && r.w === w;
    if (
      (r.x === x && abs(r.y + r.h - y) < 2) ||
      (r.x === x && abs(y + h - r.y) < 2) ||
      (r.y === y && abs(r.x + r.w - x) < 2) ||
      (r.y === y && abs(x + w - r.x) < 2)
    ) {
      neighbors.push(r.color);
    }
  }
  return neighbors;
}

function draw() { // Main draw function, handles all layers
  background(255);
  if (instructionsVisible) {
    showInstructions();
    return;
  }

  stroke(0);
  strokeWeight(6);
  for (let l of postLines) {
    if (l.type === 'v') line(l.pos, 0, l.pos, height);
    else line(0, l.pos, width, l.pos);
  }

  for (let r of filledRects) {
    noStroke();
    fill(r.color);
    rect(r.x, r.y, r.w, r.h);
  }

  stroke(0);
  strokeWeight(6);
  for (let l of preLines) {
    if (l.type === 'v') line(l.pos, 0, l.pos, height);
    else line(0, l.pos, width, l.pos);
  }
}
