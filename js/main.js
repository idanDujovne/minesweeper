'use strict'

var gLives
var gBoard
var gLevel = {
    size: 4,
    mines: 2,
}
var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
}

var gIsHintOn = false
var gIsReveal = true

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
    onReset()
}

function onInit() {
    var elResetBtn = document.querySelector('.reset-btn')
    elResetBtn.innerText = '😃'

    gLives = 3
    document.querySelector('.lives-left').innerText = gLives

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
        gLives--
        document.querySelector('.lives-left').innerText = gLives
        currCell.isMarked = true

        elCell.innerText = '💣'
        elCell.classList.add('bomb')
        checkGameOver()
        return
    }
    if (currCell.minesAroundCount === 0) {
        elCell.innerText = ''
        expandShown(gBoard, i, j)
    } else {
        elCell.innerText = currCell.minesAroundCount
    }
    checkGameOver()
}

function revealCells(rowIdx, colIdx) {
    console.log('hi');
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue

            var currCell = gBoard[i][j]
            if (currCell.isShown || currCell.isMarked) continue

            revealCell(i, j)
        }
    }
    gIsHintOn = false
}

function revealCell(i, j) {
    var elCell = document.querySelector(`.cell-${i}-${j}`)
    if (gBoard[i][j].isMine) {
        elCell.classList.toggle('bomb')
        elCell.innerText = (gIsReveal) ? '💣' : ''
    } else {
        elCell.classList.toggle('clicked')

        if (gBoard[i][j].minesAroundCount > 0 && gIsReveal) {
            elCell.innerText = gBoard[i][j].minesAroundCount
        } else {
            elCell.innerText = ''
        }
    }
    gIsReveal = !gIsReveal
}

function unRevealCells(rowIdx, colIdx) {

}

function onCellMarked(elCell, i, j) {
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault()
    })

    var currCell = gBoard[i][j]
    if (currCell.isShown || !gGame.isOn) return null
    currCell.isMarked = !currCell.isMarked
    elCell.innerText = (currCell.isMarked) ? '🚩' : ''
    checkGameOver()
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

function checkGameOver() {
    if (gLives === 0) gameOver(false)
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var currCell = gBoard[i][j]
            if (!currCell.isShown) {
                if (currCell.isMarked && currCell.isMine) continue
                return null
            }
        }
    }
    gameOver(true)
}

function gameOver(isWin) {
    gGame.isOn = false
    var elModal = document.querySelector('.modal')
    var elResetBtn = document.querySelector('.reset-btn')
    elModal.classList.remove('hide')
    if (isWin) {
        elModal.innerText = 'You Win!'
        elResetBtn.innerText = '😎'
    } else {
        elModal.innerText = 'Maybe Next Time...'
        elResetBtn.innerText = '🤯'
    }
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