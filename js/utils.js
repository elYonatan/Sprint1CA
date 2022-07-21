'use strict'


function getRandomIntInclusive(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1) + min)
}


// returns a random color
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[i].length; j++) {
            var className = `cell-${i}-${j} cell`;
            strHTML += `<td class="${className}" oncontextmenu="cellMarked(event , this , ${i} , ${j})" onclick="cellClicked(this , ${i} , ${j})"></td>`;
        }
        strHTML += '</tr>';
    }
    var elMat = document.querySelector('.game-board');
    elMat.innerHTML = strHTML;
}


function createMat(ROWS, COLS) {
    var board = []
    for (var i = 0; i < ROWS; i++) {
        board[i] = []
        for (var j = 0; j < COLS; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board
}


function copyMat(mat) {
    var newMat = [];
    for (var i = 0; i < mat.length; i++) {
        newMat[i] = [];
        for (var j = 0; j < mat[0].length; j++) {
            newMat[i][j] = mat[i][j];
        }
    }
    return newMat;
}

// function renderCell(i, j, value) {
//     var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
//     elCell.innerText = value
//     return elCell
// }





// return all neighbors include the cell in the middle
function getNeighbors(cellI, cellJ, mat) {
    const neighbors = []
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue;
            neighbors.push({ i, j });
        }
    }
    console.log(neighbors)
    return neighbors;
}

// returning a fixed number from array
function drawCell(cells) {
    var randIdx = getRandomIntInclusive(0, (cells.length - 1))
    var randCell = cells.splice(randIdx, 1)
    return randCell
}

// Move the player by keyboard arrows
function handleKey(event) {
    console.log('event.key:', event.key)
    switch (event.key) {
        case 'ArrowLeft':
            break;
    }
}

// Returns the class name for a specific cell
function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}

// Convert a location object {i, j} (cell-1-2) to a selector and render a value in that element
function renderCellByLocation(location, value) {
    var cellSelector = '.' + getClassName(location)
    var elCell = document.querySelector(cellSelector)
    renderCell(elCell, value)
}

function getCellByLocation(location) {
    var cellSelector = '.' + getClassName(location)
    var elCell = document.querySelector(cellSelector)
    return elCell
}


function renderCell(elCell, value, signIndicate = null) {
    if (signIndicate === 'mine') {
        elCell.innerHTML = value
        elCell.classList.add('mine')
        return
    } else if (signIndicate === 'flag') {
        elCell.innerHTML = value
        elCell.classList.add('flag')
        return
    }
    // else if (signIndicate === 'deflag') {
    //     elCell.innerHTML = value
    // }
    console.log(value)
    console.log(signIndicate)
    elCell.classList.add(`negAround${value}`)
    value = (value === 0) ? ' ' : value
    elCell.innerText = value
}

function deRenderCell(elCell, value, signIndicate) {
    if (signIndicate === 'mine') {
        elCell.innerHTML = ''
        elCell.classList.remove('mine')
        return
    }
    if (signIndicate === 'flag') {
        elCell.innerHTML = ''
        elCell.classList.remove('flag')
        return
    }
    elCell.classList.remove(`negAround${value}`)
    elCell.innerText = ''
}

function getRandomNonMineCell(board) {
    var nonMineCells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            if (cell.isMine || cell.isShown) continue
            nonMineCells.push({ i, j })
        }
    }
    var randCell = (drawCell(nonMineCells))
    return randCell
}

function createCell(rowIdx, colIdx, inCell = '') {
    return {
        i: rowIdx,
        j: colIdx,
        element: inCell
    }


}

function showAllMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            if (cell.isMine && !cell.isShown) {
                renderCell(getCellByLocation({ i, j }), MINE_IMG, 'mine')
            }
        }
    }
    return
}
