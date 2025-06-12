let lines = [];
let preLines = [];
let postLines = [];
let filledRects = [];
let horizontal = true;
let gameStarted = false;
let instructionsVisible = true;
let lineWidth = 6;
let pressStartTime = null;
let pressStartPos = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(18);
  noLoop();
  background(255);
  showInstructions(); // Show rules at the beginning
}

function showInstructions() {
  background(255);

  // Instruction box dimensions
  let boxWidth = Math.floor(width * 0.4);
  let boxHeight = height * 0.58;
  let boxX = (width - boxWidth) / 2;
  let boxY = (height - boxHeight) / 2;
  let padding = 48;
  let radius = 30;

  // Draw white rounded instruction panel
  fill(255);
  stroke(0);
  strokeWeight(2);
  rect(boxX, boxY, boxWidth, boxHeight, radius);

  // Set text style
  textAlign(LEFT, TOP);
  textSize(18);
  textLeading(28); // Set line spacing
  fill(0);
  noStroke();

  // Text position and width
  let x = boxX + padding;
  let y = boxY + padding;
  let tw = boxWidth - padding * 2;

  // Instruction text
  let msg = 
    "Welcome to the Mondrian Canvas!\n" +
    "Here you can create your own unique Mondrian-style artwork.\n\n" +
    "Rules:\n" +
    "Rule 1: Click on the edge of the canvas to add straight lines. Once there are more than 5 lines, Rule 2 will be enabled.\n" +
    "Rule 2: Double-click on a rectangle formed by the lines to fill it with red, yellow, or blue. You can double-click again to change the color.\n" +
    "Rule 3: Long-press on a filled rectangle for 2 seconds to turn it white. This makes the rectangle unchangeable and is useful for removing colors.\n\n" +
    "Click any blank area to start your creation!";

  text(msg, x, y, tw); // Draw wrapped instruction text
}

function mousePressed() {
  if (!gameStarted) {
    gameStarted = true;
    instructionsVisible = false;
    background(255);
    redraw();
    return;
  }

  // Start long-press timer
  pressStartTime = millis();
  pressStartPos = { x: mouseX, y: mouseY };

  let edgeMargin = 30;
  // Only allow line creation near the canvas edges
  if (
    mouseX < edgeMargin || mouseX > width - edgeMargin ||
    mouseY < edgeMargin || mouseY > height - edgeMargin
  ) {
    let newLine = (mouseX > mouseY)
      ? { type: 'v', pos: mouseX }  // Vertical line
      : { type: 'h', pos: mouseY }; // Horizontal line

    if (filledRects.length === 0) preLines.push(newLine); // Before any rectangles
    else postLines.push(newLine); // After first rectangle appears
    lines.push(newLine);
    redraw();
  }
}

function mouseReleased() {
  if (!pressStartTime) return;

  let heldTime = millis() - pressStartTime;
  // If long press is over 2 seconds, turn matching rect white
  if (heldTime >= 2000) {
    for (let r of filledRects) {
      if (
        pressStartPos.x > r.x && pressStartPos.x < r.x + r.w &&
        pressStartPos.y > r.y && pressStartPos.y < r.y + r.h
      ) {
        r.color = [255, 255, 255]; // Turn to white
        redraw();
        break;
      }
    }
  }

  pressStartTime = null;
  pressStartPos = null;
}

function doubleClicked() {
  if (lines.length < 5) return;

  let hLines = lines.filter(l => l.type === 'h').map(l => l.pos).sort((a, b) => a - b);
  let vLines = lines.filter(l => l.type === 'v').map(l => l.pos).sort((a, b) => a - b);

  for (let i = 0; i < hLines.length - 1; i++) {
    for (let j = 0; j < vLines.length - 1; j++) {
      // Calculate rectangle position based on line intersections
      let x = vLines[j] + lineWidth / 2;
      let y = hLines[i] + lineWidth / 2;
      let w = vLines[j + 1] - vLines[j] - lineWidth;
      let h = hLines[i + 1] - hLines[i] - lineWidth;

      // Check if mouse is inside this rect
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

function getNeighborColors(x, y, w, h) {
  let neighbors = [];
  for (let r of filledRects) {
    if (
      (abs(r.y + r.h - y) <= lineWidth && r.x < x + w && r.x + r.w > x) ||  // Top
      (abs(y + h - r.y) <= lineWidth && r.x < x + w && r.x + r.w > x) ||    // Bottom
      (abs(r.x + r.w - x) <= lineWidth && r.y < y + h && r.y + r.h > y) ||  // Left
      (abs(x + w - r.x) <= lineWidth && r.y < y + h && r.y + r.h > y)       // Right
    ) {
      neighbors.push(r.color);
    }
  }
  return neighbors;
}

function draw() {
  background(255);

  if (instructionsVisible) {
    showInstructions();
    return;
  }

  // Draw lines created after first rectangle (bottom layer)
  stroke(0);
  strokeWeight(lineWidth);
  for (let l of postLines) {
    if (l.type === 'v') line(l.pos, 0, l.pos, height);
    else line(0, l.pos, width, l.pos);
  }

  // Draw colored rectangles (middle layer)
  for (let r of filledRects) {
    noStroke();
    fill(r.color);
    rect(r.x, r.y, r.w, r.h);
  }

  // Draw lines created before rectangles (top layer)
  stroke(0);
  strokeWeight(lineWidth);
  for (let l of preLines) {
    if (l.type === 'v') line(l.pos, 0, l.pos, height);
    else line(0, l.pos, width, l.pos);
  }
}
