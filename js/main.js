'use strict'

var gBoard
var gLevel = {
    size: 8,
    mines: 14,
}
var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
}

function chooseLevel(opt) {
    switch (opt) {
        case 1:
            gLevel = {
                size: 4,
                mines: 2,
            }
            break

        case 2:
            gLevel = {
                size: 8,
                mines: 14,
            }
            break

        case 3:
            gLevel = {
                size: 12,
                mines: 32,
            }
            break
    }
    onInit()
}

function onInit() {
    buildBoard()
    renderBoard(gBoard)

    var elModal = document.querySelector('.modal')
    elModal.classList.add('hide')
}

function buildBoard() {
    gBoard = []
    for (var i = 0; i < gLevel.size; i++) {
        gBoard.push([])
        for (var j = 0; j < gLevel.size; j++) {
            var currCell = gBoard[i][j]
            currCell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
            gBoard[i].push(currCell)
        }
    }
    randomMines(gBoard)
    // gBoard[1][1].isMine = true
    // gBoard[3][3].isMine = true
    setMinesNegsCount(gBoard)
}

function randomMines(board) {
    for (var i = 0; i < gLevel.mines; i++) {
        var mineLocation = getRandomEmptyCell(board)
        gBoard[mineLocation.i][mineLocation.j].isMine = true
    }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var currCell = board[i][j]
            if (currCell.isMine) continue
            var currCellMines = countNeighbors(i, j, board)
            currCell.minesAroundCount = currCellMines
        }
    }
}

function renderBoard(board) {
    var strHTML = ''
    var elTable = document.querySelector('.board')

    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>\n`
        for (var j = 0; j < board[i].length; j++) {

            const className = `cell cell-${i}-${j}`
            strHTML += `\t<td
                             class="${className}"
                              oncontextmenu="onCellMarked(this, ${i}, ${j})"
                              onclick="onCellClicked(this, ${i}, ${j})" ></td\n>`
        }
        strHTML += `</td>\n`
    }
    elTable.innerHTML = strHTML
}

function onCellClicked(elCell, i, j) {
    var currCell = gBoard[i][j]
    if (!gGame.isOn || currCell.isMarked) return null
    currCell.isShown = true
    elCell.classList.add('clicked')

    if (currCell.isMine) {
        elCell.isShown = true
        revealMines(gBoard)
        gameOver(false)
        return
    }
    if (currCell.minesAroundCount === 0) {
        elCell.innerText = ''
        expandShown(gBoard, i, j)
    } else {
        elCell.innerText = currCell.minesAroundCount
    }
    checkGameOver(true)
}

function revealMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var currCell = board[i][j]
            if (!currCell.isMine) continue
            var elCell = document.querySelector(`.cell-${i}-${j}`)
            elCell.innerText = '💣'
            elCell.classList.add('bomb')
        }
    }
}

function onCellMarked(elCell, i, j) {
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault()
    })
    var currCell = gBoard[i][j]
    if (currCell.isShown) return null
    currCell.isMarked = !currCell.isMarked
    elCell.innerText = (currCell.isMarked) ? '🚩' : ''
    checkGameOver(true)
}

function expandShown(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board.length) continue
            if (i === rowIdx && j === colIdx) continue

            var currCell = board[i][j]
            if (currCell.isMarked) continue
            currCell.isShown = true

            var elCurrCell = document.querySelector(`.cell-${i}-${j}`)
            elCurrCell.innerText = (currCell.minesAroundCount > 0) ? currCell.minesAroundCount : ''
            elCurrCell.classList.add('clicked')
        }
    }
}

function checkGameOver(isWin) {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var currCell = gBoard[i][j]
            if (!currCell.isShown) {
                if (currCell.isMarked && currCell.isMine) continue
                return null
            }

        }
    }
    gameOver(isWin)
}

function gameOver(isWin) {
    gGame.isOn = false
    var elModal = document.querySelector('.modal')
    var elH2 = document.querySelector('.modal h2')
    elModal.classList.remove('hide')
    if (isWin) {
        elH2.innerText = 'You Win!'
    } else {
        elH2.innerText = 'Maybe Next Time...'
    }
    console.log('Game Over')
}

function onReset() {
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
    }
    onInit()
}