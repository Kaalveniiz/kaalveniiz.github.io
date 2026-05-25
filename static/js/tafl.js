(function () {
  var SIZE = 11;
  var CELL = 40;
  var PADDING = 20;
  var EMPTY = ".";
  var ATTACKER = "A";
  var DEFENDER = "D";
  var KING = "K";
  var THRONE = { r: 5, c: 5 };
  var CORNERS = [
    { r: 0, c: 0 },
    { r: 0, c: 10 },
    { r: 10, c: 0 },
    { r: 10, c: 10 }
  ];

  var boardEl = document.getElementById("tafl-board");
  if (!boardEl) return;
  var statusEl = document.getElementById("tafl-status");
  var aiBtn = document.getElementById("tafl-ai-move");
  var resetBtn = document.getElementById("tafl-reset");

  var state = createInitialState();
  var dragFrom = null;
  var legalTargets = [];

  boardEl.style.setProperty("--size", String(SIZE));
  boardEl.style.setProperty("--cell", CELL + "px");
  boardEl.style.setProperty("--pad", PADDING + "px");

  function createInitialState() {
    var b = [];
    for (var r = 0; r < SIZE; r++) {
      var row = [];
      for (var c = 0; c < SIZE; c++) row.push(EMPTY);
      b.push(row);
    }

    // Layout requested by user:
    //   a b c d e f g h i j k
    // 1 C . . A A A A A . . C
    // 2 . . . . . A . . . . .
    // 3 . . . . . . . . . . .
    // 4 A . . . . D . . . . A
    // 5 A . . . D D D . . . A
    // 6 A A . D D K D D . A A
    // 7 A . . . D D D . . . A
    // 8 A . . . . D . . . . A
    // 9 . . . . . . . . . . .
    //10 . . . . . A . . . . .
    //11 C . . A A A A A . . C
    [
      [0, 3], [0, 4], [0, 5], [0, 6], [0, 7],
      [1, 5],
      [3, 0], [3, 10],
      [4, 0], [4, 10],
      [5, 0], [5, 1], [5, 9], [5, 10],
      [6, 0], [6, 10],
      [7, 0], [7, 10],
      [9, 5],
      [10, 3], [10, 4], [10, 5], [10, 6], [10, 7]
    ].forEach(function (p) { b[p[0]][p[1]] = ATTACKER; });

    [
      [3, 5],
      [4, 4], [4, 5], [4, 6],
      [5, 3], [5, 4], [5, 6], [5, 7],
      [6, 4], [6, 5], [6, 6],
      [7, 5]
    ].forEach(function (p) { b[p[0]][p[1]] = DEFENDER; });

    b[5][5] = KING;

    return {
      board: b,
      turn: "defenders",
      winner: null,
      lastMove: ""
    };
  }

  function inBounds(r, c) {
    return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
  }

  function isCorner(r, c) {
    return CORNERS.some(function (p) { return p.r === r && p.c === c; });
  }

  function isThrone(r, c) {
    return r === THRONE.r && c === THRONE.c;
  }

  function sideOf(piece) {
    if (piece === ATTACKER) return "attackers";
    if (piece === DEFENDER || piece === KING) return "defenders";
    return null;
  }

  function pieceLabel(piece) {
    if (piece === ATTACKER) return "A";
    if (piece === DEFENDER) return "D";
    if (piece === KING) return "K";
    return "";
  }

  function legalMovesForPiece(board, r, c) {
    var piece = board[r][c];
    if (piece === EMPTY) return [];
    var out = [];
    var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (var i = 0; i < dirs.length; i++) {
      var dr = dirs[i][0];
      var dc = dirs[i][1];
      var nr = r + dr;
      var nc = c + dc;
      while (inBounds(nr, nc) && board[nr][nc] === EMPTY) {
        if (piece === KING || (!isThrone(nr, nc) && !isCorner(nr, nc))) {
          out.push({ from: { r: r, c: c }, to: { r: nr, c: nc } });
        }
        nr += dr;
        nc += dc;
      }
    }
    return out;
  }

  function allLegalMoves(board, side) {
    var out = [];
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        var piece = board[r][c];
        if (piece === EMPTY) continue;
        if (sideOf(piece) !== side) continue;
        out = out.concat(legalMovesForPiece(board, r, c));
      }
    }
    return out;
  }

  function cloneBoard(board) {
    return board.map(function (row) { return row.slice(); });
  }

  function applyMove(board, move) {
    var captures = 0;
    var piece = board[move.from.r][move.from.c];
    board[move.from.r][move.from.c] = EMPTY;
    board[move.to.r][move.to.c] = piece;

    if (piece === KING && isCorner(move.to.r, move.to.c)) {
      return { captures: captures, winner: "defenders" };
    }

    var moverSide = sideOf(piece);
    var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    for (var i = 0; i < dirs.length; i++) {
      var dr = dirs[i][0];
      var dc = dirs[i][1];
      var ar = move.to.r + dr;
      var ac = move.to.c + dc;
      var br = move.to.r + dr * 2;
      var bc = move.to.c + dc * 2;
      if (!inBounds(ar, ac) || !inBounds(br, bc)) continue;

      var adjacent = board[ar][ac];
      if (adjacent === EMPTY) continue;
      var adjacentSide = sideOf(adjacent);
      if (!adjacentSide || adjacentSide === moverSide) continue;

      if (adjacent === KING) {
        var k = { r: ar, c: ac };
        var surrounded = [[1, 0], [-1, 0], [0, 1], [0, -1]].every(function (d) {
          var rr = k.r + d[0];
          var cc = k.c + d[1];
          if (!inBounds(rr, cc)) return false;
          return board[rr][cc] === ATTACKER;
        });
        if (surrounded) return { captures: captures, winner: "attackers" };
        continue;
      }

      var beyond = board[br][bc];
      if (sideOf(beyond) === moverSide) {
        board[ar][ac] = EMPTY;
        captures += 1;
      }
    }

    return { captures: captures, winner: null };
  }

  function manhattanToNearestCorner(r, c) {
    var best = 999;
    for (var i = 0; i < CORNERS.length; i++) {
      var d = Math.abs(r - CORNERS[i].r) + Math.abs(c - CORNERS[i].c);
      if (d < best) best = d;
    }
    return best;
  }

  function findKing(board) {
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        if (board[r][c] === KING) return { r: r, c: c };
      }
    }
    return null;
  }

  function evaluateBoard(board, side, captures) {
    var king = findKing(board);
    var kingDist = king ? manhattanToNearestCorner(king.r, king.c) : 0;
    if (side === "attackers") return captures * 100 + (24 - kingDist * 2);
    return captures * 100 + (50 - kingDist * 3);
  }

  function countSide(board, side) {
    var n = 0;
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        if (side === "attackers") {
          if (board[r][c] === ATTACKER) n += 1;
        } else if (board[r][c] === DEFENDER) {
          n += 1;
        }
      }
    }
    return n;
  }

  function kingDistanceToEdge(board) {
    var pos = findKing(board);
    if (!pos) return 1000000000;
    return Math.min(pos.r, pos.c, SIZE - 1 - pos.r, SIZE - 1 - pos.c);
  }

  function attackersAdjacentToKing(board) {
    var pos = findKing(board);
    if (!pos) return 0;
    var count = 0;
    var dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (var i = 0; i < dirs.length; i++) {
      var rr = pos.r + dirs[i][0];
      var cc = pos.c + dirs[i][1];
      if (inBounds(rr, cc) && board[rr][cc] === ATTACKER) count += 1;
    }
    return count;
  }

  function distanceToKing(board, r, c) {
    var pos = findKing(board);
    if (!pos) return 1000000000;
    return Math.abs(r - pos.r) + Math.abs(c - pos.c);
  }

  function compareKeys(a, b) {
    for (var i = 0; i < a.length; i++) {
      if (a[i] > b[i]) return 1;
      if (a[i] < b[i]) return -1;
    }
    return 0;
  }

  function chooseGreedyMove() {
    var moves = allLegalMoves(state.board, state.turn);
    if (!moves.length) return null;

    var side = state.turn;
    var best = [];
    var bestKey = null;

    for (var i = 0; i < moves.length; i++) {
      var m = moves[i];
      var b = cloneBoard(state.board);
      var beforeEnemy = countSide(b, side === "attackers" ? "defenders" : "attackers");
      var res = applyMove(b, m);
      var afterEnemy = countSide(b, side === "attackers" ? "defenders" : "attackers");

      var captures = Math.max(0, beforeEnemy - afterEnemy);
      var isWin = res.winner === side;
      var key;

      if (side === "defenders") {
        var kingDist = kingDistanceToEdge(b);
        key = [isWin ? 1 : 0, captures, -kingDist, 0];
      } else {
        var adj = attackersAdjacentToKing(b);
        var movedDist = distanceToKing(b, m.from.r, m.from.c);
        key = [isWin ? 1 : 0, captures, adj, -movedDist];
      }

      if (!bestKey || compareKeys(key, bestKey) > 0) {
        bestKey = key;
        best = [m];
      } else if (compareKeys(key, bestKey) === 0) {
        best.push(m);
      }
    }

    if (!best.length) return null;
    return best[Math.floor(Math.random() * best.length)];
  }

  function aiMove() {
    if (state.winner) return;
    var best = chooseGreedyMove();
    if (!best) {
      state.winner = state.turn === "attackers" ? "defenders" : "attackers";
      render();
      return;
    }

    var res = applyMove(state.board, best);
    state.lastMove = formatMove(best, "AI");
    if (res.winner) state.winner = res.winner;
    else state.turn = state.turn === "attackers" ? "defenders" : "attackers";
    render();
  }

  function formatMove(m, who) {
    return who + ": (" + m.from.r + "," + m.from.c + ") -> (" + m.to.r + "," + m.to.c + ")";
  }

  function legalTargetFor(from, toR, toC) {
    return legalTargets.some(function (m) {
      return m.from.r === from.r && m.from.c === from.c && m.to.r === toR && m.to.c === toC;
    });
  }

  function startDrag(fromR, fromC, ev) {
    var piece = state.board[fromR][fromC];
    if (state.winner || sideOf(piece) !== state.turn) {
      ev.preventDefault();
      return;
    }
    dragFrom = { r: fromR, c: fromC };
    legalTargets = legalMovesForPiece(state.board, fromR, fromC);
    try {
      ev.dataTransfer.setData("text/plain", fromR + "," + fromC);
    } catch (_err) {}
    render();
  }

  function clearDrag() {
    dragFrom = null;
    legalTargets = [];
    render();
  }

  function tryDrop(toR, toC) {
    if (!dragFrom) return;
    if (!legalTargetFor(dragFrom, toR, toC)) {
      clearDrag();
      return;
    }
    var move = { from: { r: dragFrom.r, c: dragFrom.c }, to: { r: toR, c: toC } };
    var res = applyMove(state.board, move);
    state.lastMove = formatMove(move, "You");
    if (res.winner) state.winner = res.winner;
    else state.turn = state.turn === "attackers" ? "defenders" : "attackers";
    clearDrag();
  }

  function renderStatus() {
    if (state.winner) {
      var isPlayerWin = state.lastMove && state.lastMove.indexOf("You:") === 0;
      statusEl.textContent = isPlayerWin ? "you win" : "try again";
      return;
    }
    statusEl.textContent = "Turn: " + state.turn + " | " + (state.lastMove || "Drag a piece to move");
  }

  function pointPx(n) {
    return PADDING + n * CELL;
  }

  function createLines() {
    for (var i = 0; i < SIZE; i++) {
      var h = document.createElement("div");
      h.className = "tafl-line tafl-line-h";
      h.style.top = pointPx(i) + "px";
      h.style.left = pointPx(0) + "px";
      h.style.width = (CELL * (SIZE - 1)) + "px";
      boardEl.appendChild(h);

      var v = document.createElement("div");
      v.className = "tafl-line tafl-line-v";
      v.style.left = pointPx(i) + "px";
      v.style.top = pointPx(0) + "px";
      v.style.height = (CELL * (SIZE - 1)) + "px";
      boardEl.appendChild(v);
    }
  }

  function createAxisLabels() {
    var letters = "abcdefghijk".split("");
    for (var i = 0; i < SIZE; i++) {
      var top = document.createElement("div");
      top.className = "tafl-label tafl-label-col";
      top.textContent = letters[i] || "";
      top.style.left = pointPx(i) + "px";
      boardEl.appendChild(top);

      var left = document.createElement("div");
      left.className = "tafl-label tafl-label-row";
      left.textContent = String(i + 1);
      left.style.top = pointPx(i) + "px";
      boardEl.appendChild(left);
    }
  }

  function render() {
    boardEl.textContent = "";
    createLines();
    createAxisLabels();

    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        var point = document.createElement("div");
        point.className = "tafl-point";
        if (isThrone(r, c)) point.classList.add("throne");
        if (isCorner(r, c)) point.classList.add("corner");
        if (dragFrom && legalTargetFor(dragFrom, r, c)) point.classList.add("legal");

        point.style.left = pointPx(c) + "px";
        point.style.top = pointPx(r) + "px";

        point.addEventListener("dragover", function (ev) { ev.preventDefault(); });
        (function (rr, cc) {
          point.addEventListener("drop", function (ev) {
            ev.preventDefault();
            tryDrop(rr, cc);
          });
        })(r, c);

        var piece = state.board[r][c];
        if (piece === EMPTY && isCorner(r, c)) {
          var corner = document.createElement("div");
          corner.className = "tafl-corner-label";
          corner.textContent = "C";
          point.appendChild(corner);
        }
        if (piece !== EMPTY) {
          var p = document.createElement("div");
          p.className = "tafl-piece " +
            (piece === ATTACKER ? "attacker" : piece === DEFENDER ? "defender" : "king");
          p.textContent = pieceLabel(piece);
          p.draggable = !state.winner && sideOf(piece) === state.turn;
          (function (rr, cc) {
            p.addEventListener("dragstart", function (ev) { startDrag(rr, cc, ev); });
            p.addEventListener("dragend", clearDrag);
          })(r, c);
          point.appendChild(p);
        }

        boardEl.appendChild(point);
      }
    }

    renderStatus();
  }

  aiBtn.addEventListener("click", aiMove);
  resetBtn.addEventListener("click", function () {
    state = createInitialState();
    dragFrom = null;
    legalTargets = [];
    render();
  });

  render();
})();
