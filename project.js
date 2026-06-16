let checkersBoard = [];
let colors = ["red", "gray"];
let canvasBoard = document.getElementById("projectWork");
let ctx = canvasBoard.getContext("2d");
let boardSize = 8;
let boxSize = 100;

function drawBoard() {
    ctx.clearRect(0, 0, canvasBoard.width, canvasBoard.height);
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            ctx.fillStyle = (row + col) % 2 === 0 ? "white" : "black";
            ctx.fillRect(col * boxSize, row * boxSize, boxSize, boxSize);
            ctx.strokeRect(col * boxSize, row * boxSize, boxSize, boxSize);
        }
    }
}

function drawPieces() {
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            let piece = checkersBoard[row][col];
            if (piece instanceof Piece) {
                piece.draw(ctx, boxSize);
            }
        }
    }
}

function Piece(row, col, color) {
    this.row = row;
    this.col = col;
    this.color = color;
    this.isClicked = false;
    this.isKing = false;

    this.draw = function (ctx, squareSize) {
        let x = this.col * squareSize + squareSize / 2;
        let y = this.row * squareSize + squareSize / 2;
        let radius = squareSize * 0.4;

        if (this.isClicked) {
            ctx.beginPath();
            ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
            ctx.fillStyle = "yellow";
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        if (this.isKing) {
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.arc(x - 5, y - 5, 2, 0, Math.PI * 2);
            ctx.arc(x + 5, y - 5, 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.strokeStyle = "white";
            ctx.lineWidth = 1.5;
            ctx.arc(x, y + 2, 5, 0, Math.PI);
            ctx.stroke();
        }
    };

    this.checkKing = function () {
        if (this.color === "red" && this.row === 7) this.isKing = true;
        if (this.color === "gray" && this.row === 0) this.isKing = true;
    };

    this.move = function (newRow, newCol) {
        let rowDiff = newRow - this.row;
        let colDiff = newCol - this.col;

        // remove captured piece if jump
        if (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 2) {
            let midRow = (this.row + newRow) / 2;
            let midCol = (this.col + newCol) / 2;
            checkersBoard[midRow][midCol] = null;
        }

        this.row = newRow;
        this.col = newCol;
        this.checkKing();
    };

    this.isValidMove = function (newRow, newCol) {
        if (
            newRow < 0 || newRow >= boardSize ||
            newCol < 0 || newCol >= boardSize ||
            checkersBoard[newRow][newCol] !== null
        ) return false;

        let rowDiff = newRow - this.row;
        let colDiff = newCol - this.col;

        if ((this.row + this.col) % 2 === 0) return false;

        // Regular forward step
        if (Math.abs(colDiff) === 1) {
            if (
                (this.color === "red" && rowDiff === 1) ||
                (this.color === "gray" && rowDiff === -1) ||
                (this.isKing && Math.abs(rowDiff) === 1)
            ) {
                return true;
            }
        }

        // Jump move
        if (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 2) {
            let midRow = (this.row + newRow) / 2;
            let midCol = (this.col + newCol) / 2;
            let middle = checkersBoard[midRow][midCol];

            if (!middle || middle.color === this.color) return false;

            // Prevent backward jump unless it's a king
            if (!this.isKing) {
                if (this.color === "red" && rowDiff !== 2) return false;
                if (this.color === "gray" && rowDiff !== -2) return false;
            }

            return true;
        }

        return false;
    };
}

for (let row = 0; row < boardSize; row++) {
    checkersBoard[row] = [];
    for (let col = 0; col < boardSize; col++) {
        if ((row + col) % 2 !== 0) {
            if (row < 3) {
                checkersBoard[row][col] = new Piece(row, col, "red");
            } else if (row > 4) {
                checkersBoard[row][col] = new Piece(row, col, "gray");
            } else {
                checkersBoard[row][col] = null;
            }
        } else {
            checkersBoard[row][col] = null;
        }
    }
}

function getSelectedPiece() {
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            let piece = checkersBoard[row][col];
            if (piece && piece.isClicked) return piece;
        }
    }
    return null;
}

canvasBoard.addEventListener("click", function (event) {
    let x = event.offsetX;
    let y = event.offsetY;
    let row = Math.floor(y / boxSize);
    let col = Math.floor(x / boxSize);

    let clickedPiece = checkersBoard[row][col];
    let selected = getSelectedPiece();

    if (clickedPiece === null) {
        if (selected && selected.isValidMove(row, col)) {
            checkersBoard[selected.row][selected.col] = null;
            selected.move(row, col);
            checkersBoard[row][col] = selected;
            selected.isClicked = false;
        }
    } else {
        if (clickedPiece.isClicked) {
            clickedPiece.isClicked = false;
        } else {
            if (selected) selected.isClicked = false;
            clickedPiece.isClicked = true;
        }
    }

    drawBoard();
    drawPieces();
});

drawBoard();
drawPieces();
