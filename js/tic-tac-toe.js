let board = [['', '', ''], ['', '', ''], ['', '', '']];
let currentPlayer = 'X';
let maxDepth = 9; // depth for the minimax algorithm
let gameOver = false;
let winningLine = null;

function drawBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const rowElement = document.createElement('div');
        rowElement.className = 'row';
        for (let j = 0; j < 3; j++) {
            const cellElement = document.createElement('div');

            if (board[i][j] === 'X') {
                const icon = document.createElement('i');
                icon.className = 'fa-solid fa-x';
                cellElement.appendChild(icon);
            } else if (board[i][j] === 'O') {
                const icon = document.createElement('i');
                icon.className = 'fa-solid fa-o';
                cellElement.appendChild(icon);
            }

            if (gameOver && winningLine && winningLine.some(coord => coord[0] === i && coord[1] === j)) {
                cellElement.style.backgroundColor = '#B71C1C';
            }
            cellElement.addEventListener('click', () => {
                if (board[i][j] === '' && currentPlayer === 'X' && !gameOver) {
                    board[i][j] = currentPlayer;
                    currentPlayer = 'O';
                    if (terminal(board)) {
                        gameOver = true;
                    }
                    else {
                        const { move } = minimax(board, maxDepth, currentPlayer === 'X', -Infinity, Infinity);
                        if (move) {
                            board[move[0]][move[1]] = currentPlayer;
                            currentPlayer = 'X';
                            if (terminal(board)) {
                                gameOver = true;
                            }
                        }
                    }
                    drawBoard();
                }
            });
            rowElement.appendChild(cellElement);
        }
        boardElement.appendChild(rowElement);
    }
}

function resetBoard() {
    board = [['', '', ''], ['', '', ''], ['', '', '']];
    currentPlayer = 'X';
    const resultElement = document.getElementById('game-result');
    resultElement.textContent = ''; // clear game result
    gameOver = false;
    winningLine = null;
    drawBoard();
}

function getLines(board) {
    return [
        [board[0][0], board[0][1], board[0][2]],
        [board[1][0], board[1][1], board[1][2]],
        [board[2][0], board[2][1], board[2][2]],
        [board[0][0], board[1][0], board[2][0]],
        [board[0][1], board[1][1], board[2][1]],
        [board[0][2], board[1][2], board[2][2]],
        [board[0][0], board[1][1], board[2][2]],
        [board[0][2], board[1][1], board[2][0]]
    ];
}

function terminal(board) {
    const lines = getLines(board);
    const resultElement = document.getElementById('game-result');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].every(cell => cell === 'X')) {
            winningLine = getWinningLineCoordinates(i);
            resultElement.innerHTML = '<strong>You are the cheater!</strong>';
            return true;
        }
        if (lines[i].every(cell => cell === 'O')) {
            winningLine = getWinningLineCoordinates(i);
            resultElement.innerHTML = '<strong>AI is the winner!</strong>';
            return true;
        }
    }
    if (board.every(row => row.every(cell => cell !== ''))) {
        winningLine = []; // Clear the winningLine variable
        resultElement.innerHTML = '<strong>The game is a draw!</strong>';
        return true;
    }
    resultElement.textContent = '';
    return false;
}


function getWinningLineCoordinates(index) {
    switch (index) {
        case 0: return [[0, 0], [0, 1], [0, 2]];
        case 1: return [[1, 0], [1, 1], [1, 2]];
        case 2: return [[2, 0], [2, 1], [2, 2]];
        case 3: return [[0, 0], [1, 0], [2, 0]];
        case 4: return [[0, 1], [1, 1], [2, 1]];
        case 5: return [[0, 2], [1, 2], [2, 2]];
        case 6: return [[0, 0], [1, 1], [2, 2]];
        case 7: return [[0, 2], [1, 1], [2, 0]];
    }
}

function winner(board) {
    const lines = getLines(board);
    if (lines.some(line => line.every(cell => cell === 'X'))) {
        return 'X';
    }
    if (lines.some(line => line.every(cell => cell === 'O'))) {
        return 'O';
    }
    return null;
}

function actions(board) {
    let moves = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] === '') {
                moves.push([i, j]);
            }
        }
    }
    return moves;
}

function result(board, action, player) {
    let newBoard = JSON.parse(JSON.stringify(board));
    newBoard[action[0]][action[1]] = player;
    return newBoard;
}

function utility(board) {
    let win = winner(board);
    if (win === 'X') return 1;
    else if (win === 'O') return -1;
    else return 0;
}

function minimax(board, depth, isMaximizingPlayer, alpha, beta) {
    if (terminal(board) || depth === 0) {
        return { score: utility(board) };
    }

    let bestMove = null;

    if (isMaximizingPlayer) {
        let maxEval = { score: -Infinity };
        let possibleActions = actions(board);

        for (let i = 0; i < possibleActions.length; i++) {
            let eval = minimax(result(board, possibleActions[i], isMaximizingPlayer ? 'X' : 'O'), depth - 1, !isMaximizingPlayer, alpha, beta);
            if (eval.score > maxEval.score) {
                maxEval = { score: eval.score, move: possibleActions[i] };
                bestMove = possibleActions[i];
            }
            alpha = Math.max(alpha, eval.score);
            if (beta <= alpha) {
                break;
            }
        }
        return maxEval;
    } else {
        let minEval = { score: Infinity };
        let possibleActions = actions(board);

        for (let i = 0; i < possibleActions.length; i++) {
            let eval = minimax(result(board, possibleActions[i], isMaximizingPlayer ? 'X' : 'O'), depth - 1, !isMaximizingPlayer, alpha, beta);
            if (eval.score < minEval.score) {
                minEval = { score: eval.score, move: possibleActions[i] };
                bestMove = possibleActions[i];
            }
            beta = Math.min(beta, eval.score);
            if (beta <= alpha) {
                break;
            }
        }
        return minEval;
    }
}

drawBoard();
