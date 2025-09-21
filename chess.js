class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentTurn = 'white';
        this.selectedSquare = null;
        this.possibleMoves = [];
        this.gameOver = false;
        this.init();
    }

    initializeBoard() {       
        const board = Array(8).fill().map(() => Array(8).fill(null));

        // Place pieces
        const pieces = [
            ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],
            ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'],
            Array(8).fill(null),
            Array(8).fill(null),
            Array(8).fill(null),
            Array(8).fill(null),
            ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'],
            ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']
        ];

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (pieces[row][col]) {
                    const color = row < 2 ? 'black' : 'white';
                    board[row][col] = { type: pieces[row][col], color };
                }
            }
        }

        return board;
    }

    init() {
        this.renderBoard();
        this.addEventListeners();
    }

    renderBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = (row + col) % 2 === 0 ? 'a' : 'b';
                square.dataset.row = row;
                square.dataset.col = col;
                square.id = `square-${row}-${col}`;

                const piece = this.board[row][col];
                if (piece) {
                    square.innerHTML = this.getPieceSymbol(piece);
                    square.classList.add('piece');
                }

                if (this.possibleMoves.some(move => move.row === row && move.col === col)) {
                    square.classList.add('possible-move');
                }

                if (this.selectedSquare && this.selectedSquare.row === row && this.selectedSquare.col === col) {
                    square.classList.add('selected');
                }

                boardElement.appendChild(square);
            }
        }
    }

    getPieceSymbol(piece) {
        const symbols = {
            king: { white: '&#9812;', black: '&#9818;' },
            queen: { white: '&#9813;', black: '&#9819;' },
            rook: { white: '&#9814;', black: '&#9820;' },
            bishop: { white: '&#9815;', black: '&#9821;' },
            knight: { white: '&#9816;', black: '&#9822;' },
            pawn: { white: '&#9817;', black: '&#9823;' }
        };
        return symbols[piece.type][piece.color];
    }

    addEventListeners() {
        document.getElementById('board').addEventListener('click', (e) => {
            if (this.gameOver) return;

            const square = e.target.closest('div[data-row]');
            if (!square) return;

            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);

            this.handleSquareClick(row, col);
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGame();
        });
    }

    handleSquareClick(row, col) {
        const piece = this.board[row][col];

        if (this.selectedSquare) {
            // If clicking on a possible move, make the move
            if (this.possibleMoves.some(move => move.row === row && move.col === col)) {
                this.makeMove(this.selectedSquare, { row, col });
                this.selectedSquare = null;
                this.possibleMoves = [];
            } else if (piece && piece.color === this.currentTurn) {
                // Select a new piece
                this.selectedSquare = { row, col };
                this.possibleMoves = this.getPossibleMoves(row, col);
            } else {
                // Deselect
                this.selectedSquare = null;
                this.possibleMoves = [];
            }
        } else {
            // Select a piece if it's the current player's turn
            if (piece && piece.color === this.currentTurn) {
                this.selectedSquare = { row, col };
                this.possibleMoves = this.getPossibleMoves(row, col);
            }
        }

        this.renderBoard();
        this.updateTurnIndicator();
    }

    getPossibleMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];

        const moves = [];

        switch (piece.type) {
            case 'pawn':
                moves.push(...this.getPawnMoves(row, col, piece.color));
                break;
            case 'rook':
                moves.push(...this.getRookMoves(row, col));
                break;
            case 'knight':
                moves.push(...this.getKnightMoves(row, col));
                break;
            case 'bishop':
                moves.push(...this.getBishopMoves(row, col));
                break;
            case 'queen':
                moves.push(...this.getQueenMoves(row, col));
                break;
            case 'king':
                moves.push(...this.getKingMoves(row, col));
                break;
        }

        return moves.filter(move => this.isValidMove(move, piece.color));
    }

    getPawnMoves(row, col, color) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;

        // Forward move
        const newRow = row + direction;
        if (newRow >= 0 && newRow < 8 && !this.board[newRow][col]) {
            moves.push({ row: newRow, col });

            // Double move from start
            const doubleNewRow = row + 2 * direction;
            if (row === startRow && doubleNewRow >= 0 && doubleNewRow < 8 && !this.board[doubleNewRow][col]) {
                moves.push({ row: doubleNewRow, col });
            }
        }

        // Captures
        for (let dc = -1; dc <= 1; dc += 2) {
            const newCol = col + dc;
            if (newCol >= 0 && newCol < 8 && newRow >= 0 && newRow < 8) {
                const target = this.board[newRow][newCol];
                if (target && target.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }

        return moves;
    }

    getRookMoves(row, col) {
        const moves = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        for (const [dr, dc] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dr * i;
                const newCol = col + dc * i;

                if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;

                const target = this.board[newRow][newCol];
                if (target) {
                    if (target.color !== this.board[row][col].color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
                moves.push({ row: newRow, col: newCol });
            }
        }

        return moves;
    }

    getKnightMoves(row, col) {
        const moves = [];
        const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];

        for (const [dr, dc] of knightMoves) {
            const newRow = row + dr;
            const newCol = col + dc;

            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const target = this.board[newRow][newCol];
                if (!target || target.color !== this.board[row][col].color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }

        return moves;
    }

    getBishopMoves(row, col) {
        const moves = [];
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

        for (const [dr, dc] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dr * i;
                const newCol = col + dc * i;

                if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;

                const target = this.board[newRow][newCol];
                if (target) {
                    if (target.color !== this.board[row][col].color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
                moves.push({ row: newRow, col: newCol });
            }
        }

        return moves;
    }

    getQueenMoves(row, col) {
        return [...this.getRookMoves(row, col), ...this.getBishopMoves(row, col)];
    }

    getKingMoves(row, col) {
        const moves = [];
        const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;

            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const target = this.board[newRow][newCol];
                if (!target || target.color !== this.board[row][col].color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }

        return moves;
    }

    isValidMove(move, color) {
        // Basic validation - check if move doesn't put own king in check
        // This is a simplified version; full implementation would check for check
        return true;
    }

    makeMove(from, to) {
        this.board[to.row][to.col] = this.board[from.row][from.col];
        this.board[from.row][from.col] = null;

        this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';

        // Check for checkmate (simplified)
        if (this.isCheckmate()) {
            this.gameOver = true;
            alert(`${this.currentTurn === 'white' ? 'Black' : 'White'} wins!`);
        }
    }

    isCheckmate() {
        // Simplified checkmate detection
        return false;
    }

    updateTurnIndicator() {
        const indicator = document.getElementById('turn-indicator');
        if (this.gameOver) {
            indicator.textContent = 'Game Over';
        } else {
            const current = this.currentTurn === 'white' ? 'White' : 'Black';
            indicator.textContent = `${current}'s Turn`;
        }
    }

    resetGame() {
        this.board = this.initializeBoard();
        this.currentTurn = 'white';
        this.selectedSquare = null;
        this.possibleMoves = [];
        this.gameOver = false;
        this.renderBoard();
        this.updateTurnIndicator();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChessGame();
});
