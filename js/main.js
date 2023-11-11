'use strict'

var gLives
var gBoard
var gLevel = {
    size: 4,
    mines: 2,
    cells: 16,
}
var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
}
var gIsFirstClick
var gMarksLeft

function chooseLevel(opt) {
    switch (opt) {
        case 1:
            gLevel = {
                size: 4,
                mines: 2,
                cells: 16,
            }
            break

        case 2:
            gLevel = {
                size: 8,
                mines: 14,
                cells: 64,
            }
            break

        case 3:
            gLevel = {
                size: 12,
                mines: 32,
                cells: 144,
            }
            break
    }
    onReset()
}

function onInit() {
    var elResetBtn = document.querySelector('.reset-btn')
    elResetBtn.innerText = '😃'

    var elMarkedCells = document.querySelector('.marks-count')
    elMarkedCells.innerText = gLevel.mines
    gMarksLeft = gLevel.mines

    gIsFirstClick = true
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
}

function randomMines(board, safeLocation) {
    for (var i = 0; i < gLevel.mines; i++) {
        var mineLocation = getRandomEmptyCell(board)

        if (mineLocation.i === safeLocation.i && mineLocation.j === safeLocation.j) {
            i--
            continue
        }
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

    if (gIsFirstClick) {
        randomMines(gBoard, { i, j })
        setMinesNegsCount(gBoard)
        gIsFirstClick = false
    }

    currCell.isShown = true
    elCell.classList.add('clicked')

    if (currCell.isMine) {
        gLives--
        document.querySelector('.lives-left').innerText = gLives
        currCell.isMarked = true
        
        elCell.innerText = '💣'
        elCell.classList.add('bomb')
        
        gMarksLeft--
        var elMarksCount = document.querySelector('.marks-count')
        elMarksCount.innerText = gMarksLeft
        
        checkGameOver()
        return
    }
    if (currCell.minesAroundCount === 0) {
        elCell.innerText = ''
        expandShown(gBoard, i, j)
    } else {
        elCell.innerText = currCell.minesAroundCount
        colorNum(elCell, currCell)
    }
    checkGameOver()
}

function onCellMarked(elCell, i, j) {
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault()
    })
    var currCell = gBoard[i][j]
    if (currCell.isShown || !gGame.isOn) return null
    
    if (currCell.isMarked) {
        gMarksLeft++
        elCell.innerText = ''

    } else {
        if (gMarksLeft === 0) return null
        gMarksLeft--
        elCell.innerText = '🚩'
    }
    currCell.isMarked = !currCell.isMarked
    var elMarksCount = document.querySelector('.marks-count')
    elMarksCount.innerText = gMarksLeft

    checkGameOver()
}

function expandShown(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board.length) continue
            if (i === rowIdx && j === colIdx) continue

            var currCell = board[i][j]
            if (currCell.isMarked || currCell.isShown) continue
            currCell.isShown = true

            var elCurrCell = document.querySelector(`.cell-${i}-${j}`)
            elCurrCell.innerText = (currCell.minesAroundCount > 0) ? currCell.minesAroundCount : ''
            elCurrCell.classList.add('clicked')

            colorNum(elCurrCell, currCell)

            if (currCell.minesAroundCount === 0) expandShown(gBoard, i, j)
        }
    }
}

function colorNum(elCell, currCell) {
    if (currCell.minesAroundCount === 1) elCell.style.color = 'blue'
    if (currCell.minesAroundCount === 2) elCell.style.color = 'green'
    if (currCell.minesAroundCount === 3) elCell.style.color = 'red'
    if (currCell.minesAroundCount === 4) elCell.style.color = 'darkblue'
    if (currCell.minesAroundCount === 5) elCell.style.color = 'darkred'
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