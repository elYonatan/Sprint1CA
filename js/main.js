'use strict'

/*
curr form the only missing function is manual
will be implented hopefully by today :)
*/
const EASY = { size: 4, mines: 2, isLives: false, levelName: 'easy' }
const MEDIUM = { size: 8, mines: 12, levelName: 'medium' }
const HARD = { size: 12, mines: 30, levelName: 'hard' }
const BOOM7 = { size: 0, mines: 0, levelName: '7boom' }
const MANUALLY = { size: 0, mines: 0, levelName: 'manually' }


const MINE_IMG = '<img class = "in-game-element"  src ="img/mine.png" />'
const FLAG_IMG = '<img class = "in-game-element"  src ="img/flag.png" />'
const LOSE_IMG = '<img class = "restart-btn" src="img/lose.png" />'
const THINKING_IMG = '<img class = "restart-btn" src="img/thinking.png" />'
const WIN_IMG = '<img class = "restart-btn" src="img/win.png" />'
const HEART_IMG = '<img class = "heart" src="img/heart.png" />'
const YELLOWBULB_IMG = "img/yellowbulb.png"
const BULB_IMG = "img/bulb.png"


var isUndo = false
var gYellowBulbs = [false, false, false]
var gYellowBulb
var gTurnsPlayed
var gFlashTimeSafe = 0
var gFlashTimeHint = 0
var gIntervalTime = 0
var gGameStartTime = 0
var gManualFlow = -1 //-2 = not for users (initalize to fix a certain bug) -1 setting bombs, 0 calculate cells area value , 1 gaming

const gGame = {
    isOn: false,
    isLivesOn: true,
    lives: 3,
    isSafeClickOn: true,
    safeClicks: 0,
    isHelpOn: true,
    helps: 3,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}
const gLevel = {
    size: 0,
    mines: 0,
    levelName: ''
}

var gBoard = {}


function initGameManually(manualFlow) {
    var elBtn = document.querySelectorAll('.difficult-btn')[3]
    var newManualFlow = 0
    if (manualFlow === -1) {
        gManualFlow = -1
        newManualFlow = 0

    } else if (manualFlow === 0) {
        console.log('HERERERERER')
        newManualFlow = -1
        gManualFlow = 0
    }
    console.log(newManualFlow)
    const elBtnHTML = '<button class="difficult-btn" onclick="initGameManually(' + newManualFlow + ')">Manually</button>'
    elBtn.innerHTML = elBtnHTML
    console.log(elBtn)
    var newElBtn = document.querySelectorAll('.difficult-btn')[3]
    console.log(gManualFlow)
    if (gManualFlow === -1) initGame(MANUALLY)
}


function initGame(difficulty = HARD) {
    // if (gManualFlow === -2) {
    //     initGameManually(gManualFlow)
    // }
    changeGameState(THINKING_IMG)
    isUndo = false
    console.log(document.querySelectorAll('.difficult-btn')[3])
    gGame.isOn = true
    const elClicks = document.querySelectorAll('.in-game-func-btn')
    elClicks[0].classList.add('not-allowed')
    elClicks[1].classList.add('not-allowed')
    gTurnsPlayed = []
    gGameStartTime = 0
    gLevel.size = difficulty.size
    gLevel.mines = difficulty.mines
    gLevel.levelName = difficulty.levelName
    gGame.lives = 3
    gGame.shownCount = 0
    gGame.markedCount = 0
    if (gLevel.levelName === BOOM7.levelName) build7Boom()
    else if (gLevel.levelName === MANUALLY.levelName) {
        buildManual()
    } else gBoard = createMat(gLevel.size, gLevel.size)
    var level = (gLevel.mines === 2) ? 0 : 1
    updateLifeCount(3, null, level)
    updateSafeClicks(3)
    updateBulbCount(3)
    renderTimer(document.querySelector('.timer'))
    renderBestTime(document.querySelector('.best-res'))
    renderBoard(gBoard)
}

function buildManual() {
    gLevel.mines = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            const cell = gBoard[i][j]
            cell.isMarked = false
            cell.isMine = false
            cell.isShown = false
        }
    }
}

function build7Boom() {
    gLevel.mines = 0
    gLevel.size = gBoard.length
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            const cell = gBoard[i][j]
            cell.isMarked = false
            cell.isMine = false
            cell.isShown = false
            var cellIndicator = (i * gBoard[i].length + j + 1) // indicates the cell location counting from 1
            var cellIndicatorStr = cellIndicator + ''
            if ((cellIndicator % 7 === 0 || cellIndicatorStr.includes('7'))) { // if the string of the indicator contains 7 or divdeable by 7 add mine
                console.log(`7boomcheck = [i][j] = [${i}][${j}]`)
                gLevel.mines++
                cell.isMine = true
                cell.minesAroundCount = -1
            }
        }
    }
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            const cell = gBoard[i][j]
            if (cell.isMine) continue
            cell.minesAroundCount = setMinesNegsCount(gBoard, i, j)
        }
    }
    const elClicks = document.querySelectorAll('.in-game-func-btn')
    elClicks[0].classList.remove('not-allowed')
    elClicks[1].classList.remove('not-allowed')
    if (gGame.isSafeClickOn) gGame.safeClicks = 3
    if (gGame.isHelpOn) gGame.helps = 3
}

function buildBoard(board, i, j) {
    if (gLevel.levelName === BOOM7.levelName) return
    //start timer
    //build board so the first spot will be ensured to not be a mine
    setMinesOnBoard(board, i, j)

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            const cell = board[i][j]
            if (cell.isMine) continue
            cell.minesAroundCount = setMinesNegsCount(board, i, j)
        }
    }
    const elClicks = document.querySelectorAll('.in-game-func-btn')
    elClicks[0].classList.remove('not-allowed')
    elClicks[1].classList.remove('not-allowed')
    if (gGame.isSafeClickOn) gGame.safeClicks = 3
    if (gGame.isHelpOn) gGame.helps = 3
    return board

}
function iniateTime() {
    const elBestTime = document.querySelector('.best-res')
    const elTimer = document.querySelector('.timer')
    gGameStartTime = new Date()
    gIntervalTime = setInterval(updateGameTime, 1000, elTimer)
    renderBestTime(elBestTime)
}


// so the code can be more read-able
function setMinesOnBoard(board, i, j) {
    const numsRolled = [(i * gLevel.size) + j]
    while ((numsRolled.length - 1) !== gLevel.mines) {
        const randMineIdx = getRandomIntInclusive(0, (gLevel.size ** 2) - 1)
        if (numsRolled.includes(randMineIdx)) continue
        numsRolled.push(randMineIdx)
        board[parseInt(randMineIdx / gLevel.size)][randMineIdx % gLevel.size].isMine = true
        board[parseInt(randMineIdx / gLevel.size)][randMineIdx % gLevel.size].minesAroundCount = -1
    }
}

function setMinesNegsCount(board, rowIdx, colIdx) {
    var minesNegsCount = 0
    for (var i = rowIdx - 1; i <= (rowIdx + 1); i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= (colIdx + 1); j++) {
            const cell = board[i][j]
            if (j < 0 || j === board[i].length) continue
            if (j === colIdx && i === rowIdx) continue
            if (cell.isMine) minesNegsCount++
        }
    }
    return minesNegsCount
}
// -1 setting bombs, 0 calculate cells area value , 1 gaming
function cellClicked(elCell, i, j) {
    if (!gGame.isOn) return

    if (gLevel.levelName === MANUALLY.levelName && gGame.shownCount === 0) {
        if (gManualFlow === -1) {
            gBoard[i][j].isMine = true
            gBoard[i][j].minesAroundCount = -1
            gLevel.mines++
        } else if (gManualFlow === 0) {
            for (var i = 0; i < gBoard.length; i++) {
                for (var j = 0; j < gBoard[i].length; j++) {
                    const cell = gBoard[i][j]
                    if (cell.isMine) continue
                    cell.minesAroundCount = setMinesNegsCount(gBoard, i, j)
                }
            }
            const elClicks = document.querySelectorAll('.in-game-func-btn')
            elClicks[0].classList.remove('not-allowed')
            elClicks[1].classList.remove('not-allowed')
            if (gGame.isSafeClickOn) gGame.safeClicks = 3
            if (gGame.isHelpOn) gGame.helps = 3
            gManualFlow = 1
        }
    }

    //Makes sure the first turn is never a bomb turn
    if (gGame.shownCount === 0 && !isUndo) {
        if (gGame.markedCount === 0) {
            iniateTime()
        }
        if (gLevel.levelName !== BOOM7.levelName && gLevel.levelName !== MANUALLY.levelName) gBoard = buildBoard(gBoard, i, j)
    }
    const cell = gBoard[i][j]
    if (gYellowBulb === true) {
        const lightedBulb = getLightedBulbIdx()
        const elHint = document.querySelectorAll('.bulb')[(lightedBulb)]
        const elBulbImg = elHint.querySelector('img')
        elBulbImg.src = BULB_IMG
        elHint.classList.add('hidden')
        hintByDecision({ i, j }, false) // making it appear
        gFlashTimeHint = setTimeout(hintByDecision, 1000, { i, j }, true, elHint) // making it disappear
        gYellowBulb = false
        gYellowBulbs[lightedBulb] = false
        return
    }
    const minesAround = cell.minesAroundCount
    if (cell.isMarked || cell.isShown) return

    if (cell.isMine) {
        gBoard[i][j].isShown = true
        gGame.shownCount++
        renderCell(elCell, MINE_IMG, 'mine')
        if (gGame.isLivesOn) {
            gGame.lives--
            updateLifeCount(gGame.lives)
            if (gGame.lives === 0) {
                changeGameState(LOSE_IMG)
            }
            gTurnsPlayed.push({ i, j, isMine: true, isMarkedTurn: false, isValue0: false })
        } else {
            changeGameState(LOSE_IMG)
        }
    }

    if (minesAround === 0) {
        gTurnsPlayed.push({ i, j, isMine: false, isMarkedTurn: false, isValue0: true })
        expandShown(gBoard, elCell, i, j)
    }

    else if (minesAround > 0) {
        gBoard[i][j].isShown = true
        gGame.shownCount++
        gTurnsPlayed.push({ i, j, isMine: false, isMarkedTurn: false, isValue0: false })
        renderCell(elCell, minesAround)
    }

    if (checkGameWon()) changeGameState(WIN_IMG)
}
function updateGameTime(elTimer) {
    gGame.secsPassed = (parseInt((new Date() - gGameStartTime) / 1000))
    renderTimer(elTimer)
}

function renderTimer(elTimer) {
    gGame.secsPassed = (gGame.secsPassed + '').padStart(3, '0')
    var onScreen = 'My Time: ' + gGame.secsPassed
    elTimer.innerText = onScreen
}
function renderBestTime(elTime) {
    var key = gLevel.levelName
    if (key === BOOM7.levelName || key === MANUALLY.levelName) {
        key += ' ' + gBoard.length ** 2
    }
    var bestTime = localStorage.getItem(key)
    if (!bestTime) {
        bestTime = 'None'
    }
    console.log(bestTime)
    bestTime = bestTime.padStart(3, '0')
    console.log(bestTime)
    elTime.innerText = `Quickest: ${bestTime}`
}

// This function is supposed to change the state to winning / losing (msg dependa
// if already won/lost it will intalize the game once clicked play again
function changeGameState(img) {
    gGame.isOn = false
    gGame.safeClicks = 0
    gGame.hints = 0
    if (img === LOSE_IMG) {
        showAllMines(gBoard)

    } else if (gGame.markedCount !== 0) {
        var key = gLevel.levelName
        if (key === BOOM7.levelName || key === MANUALLY.levelName) {
            key += ' ' + gBoard.length ** 2
        }
        var currBestTime = localStorage.getItem(key)
        currBestTime = (currBestTime) ? Math.max(parseInt(currBestTime), parseInt(gGame.secsPassed)) : gGame.secsPassed
        if (currBestTime > 999) {
            currBestTime = '999' //bug-Defense until fixed
        }
        localStorage.setItem(key, currBestTime)

    }
    const elStateModal = document.querySelector('.restart-btn button')
    elStateModal.innerHTML = img
    if (gIntervalTime) {
        clearInterval(gIntervalTime)
        gGame.secsPassed = 0
        gGameStartTime = 0
        gIntervalTime = null
    }
}

function expandShown(board, elCell, rowIdx, colIdx) {

    for (var i = rowIdx - 1; i <= (rowIdx + 1); i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= (colIdx + 1); j++) {
            const cell = board[i][j]
            if (j < 0 || j === board[i].length) continue
            if (cell.isMarked || cell.isShown) continue
            if (j === colIdx && i === rowIdx) {
                cell.isShown = true
                gGame.shownCount++
                renderCell(elCell, 0)
                continue
            }
            if (cell.isMine) continue
            gBoard[i][j].isShown = true
            gGame.shownCount++
            renderCellByLocation({ i, j }, cell.minesAroundCount)

            if (cell.minesAroundCount === 0) {
                expandShown(board, getCellByLocation({ i, j }), i, j)
            }
        }
    }
}
function deExpandShown(board, elCell, rowIdx, colIdx) {

    for (var i = rowIdx - 1; i <= (rowIdx + 1); i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= (colIdx + 1); j++) {
            const cell = board[i][j]
            if (j < 0 || j === board[i].length) continue
            if (cell.isMarked || !cell.isShown) continue
            if (isPlayedBefore(i, j)) continue
            if (j === colIdx && i === rowIdx) {
                cell.isShown = false
                gGame.shownCount--
                deRenderCell(elCell, 0)
                continue
            }
            if (cell.isMine) continue

            gBoard[i][j].isShown = false
            gGame.shownCount--
            deRenderCell(getCellByLocation({ i, j }), cell.minesAroundCount)
            if (cell.minesAroundCount === 0) {
                deExpandShown(board, getCellByLocation({ i, j }), i, j)
            }
        }
    }
}
function cellMarked(ev, elCell, i, j) {
    ev.preventDefault()
    if (!gGame.isOn) return
    if (gGame.markedCount === 0 && gGame.shownCount === 0) {
        iniateTime()
    }
    var cell = gBoard[i][j]
    if (cell.isShown) return
    cell.isMarked = !cell.isMarked
    gGame.markedCount += (cell.isMarked) ? 1 : -1
    if (cell.isMarked) {
        gTurnsPlayed.push({ i, j, isMine: false, isMarkedTurn: true, isValue0: true })
        renderCell(elCell, FLAG_IMG, 'flag')
    } else {
        gTurnsPlayed.push({ i, j, isMine: false, isMarkedTurn: false, isValue0: false, unMarkTurn: true })
        deRenderCell(elCell, FLAG_IMG, 'flag')
    }
    // elCell.classList.toggle('flag')
    if (checkGameWon()) {
        changeGameState(WIN_IMG)
    }
}


//TODO : safeClick works perfectly and can be toggled, yet doesnt have visualize effect
function safeClick() {
    if (!gGame.isSafeClickOn || !gGame.isOn || gFlashTimeSafe) return
    if (gGame.safeClicks === 0) return
    const elSafeClick = document.querySelectorAll('.in-game-func-btn')[0]
    elSafeClick.classList.add('not-allowed')
    gGame.safeClicks--
    updateSafeClicks(gGame.safeClicks)
    var safeLocation = getRandomNonMineCell(gBoard) // getting all non mines
    const elCells = getNeighbors(safeLocation[0].i, safeLocation[0].j, gBoard) // getting random non mine spot
    safeClickByDecision(elCells, false) // making it appear
    gFlashTimeSafe = setTimeout(safeClickByDecision, 1000, elCells, true, elSafeClick) // making it disappear
}

//NEED BETTER NAME (FUNCTION RENDER OR DE RENDER ACCORDING TO THE ISDERENDER)
function safeClickByDecision(cells, isDeRender, elSafeClick = null) {
    if (isDeRender) {
        for (var i = 0; i < cells.length; i++) {
            const cell = gBoard[cells[i].i][cells[i].j]
            if (cell.isShown === true) continue
            const elCell = getCellByLocation(cells[i])
            if (cell.isMine) deRenderCell(elCell, MINE_IMG, 'mine')
            else deRenderCell(elCell, cell.minesAroundCount)
        }
        clearTimeout(gFlashTimeSafe)
        elSafeClick.classList.remove('not-allowed')
        gFlashTimeSafe = null
    } else {
        for (var i = 0; i < cells.length; i++) {
            const elCell = getCellByLocation(cells[i])
            const cell = gBoard[cells[i].i][cells[i].j]
            if (cell.isMine) renderCell(elCell, MINE_IMG, 'mine')
            else renderCell(elCell, cell.minesAroundCount)
        }
    }
}

//NEED BETTER NAME (FUNCTION RENDER OR DE RENDER ACCORDING TO THE ISDERENDER)
function hintByDecision(location, isDeRender) {
    if (isDeRender) {
        const cell = gBoard[location.i][location.j]
        const elCell = getCellByLocation(location)
        if (cell.isMine) deRenderCell(elCell, MINE_IMG, 'mine')
        else deRenderCell(elCell, cell.minesAroundCount)
        clearTimeout(gFlashTimeHint)
        gFlashTimeHint = null
    } else {
        const cell = gBoard[location.i][location.j]
        const elCell = getCellByLocation(location)
        if (cell.isMine) renderCell(elCell, MINE_IMG, 'mine')
        else renderCell(elCell, cell.minesAroundCount)
    }

}


// curr works for 3 hearts hard coded
function updateLifeCount(remainLifeCount, undoMove = false, difficulty = null) {
    if (difficulty === 0) {
        const elLives = document.querySelectorAll('.heart')
        gGame.isLivesOn = false
        for (var i = 1; i < 3; i++) {
            elLives[i].classList.add("hidden")
        }
        return
    }
    gGame.isLivesOn = true
    if (undoMove) {
        const elLive = document.querySelectorAll('.heart')[remainLifeCount]
        console.log(remainLifeCount)
        elLive.classList.remove('hidden')
    }
    if (remainLifeCount === 3) {
        const elLives = document.querySelectorAll('.heart')
        for (var i = 0; i < remainLifeCount; i++) {
            elLives[i].classList.remove('hidden')
        }
    } else {
        const elHearts = document.querySelectorAll('.heart')
        elHearts[remainLifeCount].classList.add('hidden')
    }
}

function updateSafeClicks(safeClicks) {
    if (!gGame.isOn) return
    var msg = safeClicks + ' clicks available!'
    if (safeClicks === 3) {
        const elSafeClicks = document.querySelector('.safe-clicks p')
        elSafeClicks.innerText = msg
    } else {
        const elSafeClicks = document.querySelector('.safe-clicks p')
        elSafeClicks.innerText = msg
    }
}

function updateBulbCount(remainBulbCount) {
    if (remainBulbCount === 3) {
        gYellowBulbs = [false, false, false]
        gYellowBulb = false
        const elBulbs = document.querySelectorAll('.bulb')
        for (var i = 0; i < remainBulbCount; i++) {
            elBulbs[i].classList.remove('hidden')
        }
    } else {
        if (gGame.shownCount === 0) return
        const elBulbBtn = document.querySelectorAll('.bulb')[(remainBulbCount)]
        const elBulbImg = elBulbBtn.querySelector('img')
        if (gYellowBulb === false) {
            elBulbImg.src = YELLOWBULB_IMG
            gYellowBulb = true
            gYellowBulbs[remainBulbCount] = true
        } else {
            if (gYellowBulbs[remainBulbCount] === true) {
                elBulbImg.src = BULB_IMG
                gYellowBulb = false
                gYellowBulbs[remainBulbCount] = false
            }
        }
        // elBulb.classList.add('hidden')
    }
}

function getLightedBulbIdx() {
    var idx = 0
    for (var i = 0; i < gYellowBulbs.length; i++) {
        console.log(gYellowBulbs[i])
        if (gYellowBulbs[i]) return i
    }
    return null
}

function checkGameWon() {
    if (gGame.markedCount > gLevel.mines) return false
    console.log(gTurnsPlayed)
    return (gGame.shownCount + gGame.markedCount === gLevel.size ** 2)
}

function undo() {
    if (!gGame.isOn) return
    const currTurn = gTurnsPlayed.length - 1
    isUndo = true
    if (currTurn < 0) return
    if (currTurn === 0) {
        const elClicks = document.querySelectorAll('.in-game-func-btn')
        elClicks[1].classList.add('not-allowed')
    } else if (currTurn >= 1) {
        const elClicks = document.querySelectorAll('.in-game-func-btn')
        elClicks[1].classList.remove('not-allowed')
    }

    const cellPlayed = gTurnsPlayed.splice(currTurn, 1)
    const elCellPlayed = getCellByLocation({ i: cellPlayed[0].i, j: cellPlayed[0].j })

    if (cellPlayed[0].isMine) {
        // updateLifeCount(gGame.lives, true)
        // gGame.lives++
        gBoard[cellPlayed[0].i][cellPlayed[0].j].isShown = false
        gGame.shownCount--
        deRenderCell(elCellPlayed, MINE_IMG, 'mine')

    } else if (cellPlayed[0].isMarkedTurn) {
        gBoard[cellPlayed[0].i][cellPlayed[0].j].isMarked = !gBoard[cellPlayed[0].i][cellPlayed[0].j].isMarked
        gGame.markedCount += (gBoard[cellPlayed[0].i][cellPlayed[0].j].isMarked) ? 1 : -1;
        deRenderCell(elCellPlayed, FLAG_IMG, 'flag')

    } else if (cellPlayed[0].unMarkTurn) {
        gBoard[cellPlayed[0].i][cellPlayed[0].j].isMarked = !gBoard[cellPlayed[0].i][cellPlayed[0].j].isMarked
        gGame.markedCount += (gBoard[cellPlayed[0].i][cellPlayed[0].j].isMarked) ? 1 : -1;
        renderCell(elCellPlayed, FLAG_IMG, 'flag')


    } else if (cellPlayed[0].isValue0) {
        deExpandShown(gBoard, elCellPlayed, cellPlayed[0].i, cellPlayed[0].j)

    } else {
        gBoard[cellPlayed[0].i][cellPlayed[0].j].isShown = false
        gGame.shownCount--
        console.log(gBoard[cellPlayed[0].i][cellPlayed[0].j].minesAroundCount)
        deRenderCell(elCellPlayed, gBoard[cellPlayed[0].i][cellPlayed[0].j].minesAroundCount)
    }
}

//gTurnsPlayed({ i, j, isMine: false, isMarkedTurn: false, isValue0: true, unMarkTurn: true })


function isPlayedBefore(x, y) {
    console.log(x, ': x')
    console.log(y, ': y')
    for (var i = 0; i < gTurnsPlayed.length; i++) {
        if (x === gTurnsPlayed[i].i && y === gTurnsPlayed[i].j) {
            return true
        }
    }
    return false
}