const lightColors = [
    'rgba(132, 82, 220, 0.56)',
    'rgba(45, 118, 230, 0.52)',
    'rgba(34, 190, 170, 0.48)',
    'rgba(72, 185, 105, 0.44)',
    'rgba(220, 68, 88, 0.46)'
];

const lightConfigs = [
    {
        selector: '.light-1',
        desktop: {
            width: [34, 50],
            height: [28, 46],
            x: [-4, 28],
            y: [-4, 28],
            scale: [0.95, 1.28],
            opacity: [0.34, 0.52],
            blur: [105, 135]
        },
        mobile: {
            width: [68, 92],
            height: [58, 86],
            x: [-6, 18],
            y: [-4, 26],
            scale: [0.95, 1.24],
            opacity: [0.36, 0.54],
            blur: [82, 110]
        },
        lastColorIndex: null
    },
    {
        selector: '.light-2',
        desktop: {
            width: [32, 48],
            height: [28, 44],
            x: [-28, 4],
            y: [-4, 30],
            scale: [0.96, 1.26],
            opacity: [0.34, 0.52],
            blur: [105, 135]
        },
        mobile: {
            width: [70, 96],
            height: [58, 88],
            x: [-22, 4],
            y: [-4, 28],
            scale: [0.95, 1.24],
            opacity: [0.36, 0.54],
            blur: [82, 110]
        },
        lastColorIndex: null
    },
    {
        selector: '.light-3',
        desktop: {
            width: [34, 54],
            height: [28, 46],
            x: [-18, 18],
            y: [-22, 8],
            scale: [0.95, 1.30],
            opacity: [0.32, 0.50],
            blur: [108, 140]
        },
        mobile: {
            width: [72, 100],
            height: [56, 88],
            x: [-14, 14],
            y: [-24, 8],
            scale: [0.95, 1.26],
            opacity: [0.34, 0.52],
            blur: [86, 115]
        },
        lastColorIndex: null
    }
];

const DIFFICULTIES = {
    easy: {
        label: 'Easy',
        layout: 'square',
        size: 3,
        states: 4,
        scrambleMoves: 14
    },
    normal: {
        label: 'Normal',
        layout: 'square',
        size: 4,
        states: 4,
        scrambleMoves: 24
    },
    hard: {
        label: 'Hard',
        layout: 'hex',
        radius: 3,
        states: 4,
        scrambleMoves: 42
    },
    expert: {
        label: 'Expert',
        layout: 'hex',
        radius: 3,
        states: 6,
        scrambleMoves: 58
    }
};

let currentDifficulty = 'easy';
let displayMode = 'arrows';
let cellStyle = 'classic';

let cells = [];
let cellIndexByKey = new Map();

let timerStarted = false;
let timerRunning = false;
let solved = false;
let startTimestamp = 0;
let elapsedBeforeStop = 0;
let timerFrame = null;

let moveCount = 0;

let board = null;
let boardStage = null;
let timeDisplay = null;
let bestDisplay = null;
let movesDisplay = null;
let solvedOverlay = null;
let solvedTime = null;
let solvedBest = null;

document.addEventListener('DOMContentLoaded', () => {
    initBackgroundLights();

    if (!document.body.classList.contains('game-page')) {
        return;
    }

    initGame();
});

function randomBetween(min, max, decimals = 2) {
    const value = Math.random() * (max - min) + min;
    return Number(value.toFixed(decimals));
}

function randomColorIndex(previousIndex) {
    let index = Math.floor(Math.random() * lightColors.length);

    if (lightColors.length > 1) {
        while (index === previousIndex) {
            index = Math.floor(Math.random() * lightColors.length);
        }
    }

    return index;
}

function randomRadius() {
    const values = [
        '50% 50% 50% 50%',
        '58% 42% 48% 52%',
        '44% 56% 60% 40%',
        '62% 38% 44% 56%',
        '48% 52% 38% 62%'
    ];

    return values[Math.floor(Math.random() * values.length)];
}

function getResponsiveConfig(config) {
    return window.innerWidth <= 640 ? config.mobile : config.desktop;
}

function updateBackgroundLights() {
    lightConfigs.forEach(config => {
        const light = document.querySelector(config.selector);

        if (!light) return;

        const responsiveConfig = getResponsiveConfig(config);

        const width = randomBetween(responsiveConfig.width[0], responsiveConfig.width[1]);
        const height = randomBetween(responsiveConfig.height[0], responsiveConfig.height[1]);
        const x = randomBetween(responsiveConfig.x[0], responsiveConfig.x[1]);
        const y = randomBetween(responsiveConfig.y[0], responsiveConfig.y[1]);
        const scale = randomBetween(responsiveConfig.scale[0], responsiveConfig.scale[1]);
        const opacity = randomBetween(responsiveConfig.opacity[0], responsiveConfig.opacity[1]);
        const blur = randomBetween(responsiveConfig.blur[0], responsiveConfig.blur[1], 0);
        const rotate = randomBetween(-18, 18, 0);
        const skewX = randomBetween(-4, 4, 0);
        const skewY = randomBetween(-4, 4, 0);
        const radius = randomRadius();

        const colorIndex = randomColorIndex(config.lastColorIndex);
        config.lastColorIndex = colorIndex;

        light.style.setProperty('--light-width', `${width}vw`);
        light.style.setProperty('--light-height', `${height}vw`);
        light.style.setProperty('--light-x', `${x}vw`);
        light.style.setProperty('--light-y', `${y}vh`);
        light.style.setProperty('--light-scale', scale);
        light.style.setProperty('--light-opacity', opacity);
        light.style.setProperty('--light-blur', `${blur}px`);
        light.style.setProperty('--light-color', lightColors[colorIndex]);
        light.style.setProperty('--light-radius', radius);
        light.style.setProperty('--light-rotate', `${rotate}deg`);
        light.style.setProperty('--light-skew-x', `${skewX}deg`);
        light.style.setProperty('--light-skew-y', `${skewY}deg`);
    });
}

function initBackgroundLights() {
    updateBackgroundLights();

    setInterval(() => {
        updateBackgroundLights();
    }, 6200);

    window.addEventListener('resize', () => {
        updateBackgroundLights();
    });
}

function initGame() {
    board = document.getElementById('board');
    boardStage = document.getElementById('board-stage');
    timeDisplay = document.getElementById('time-display');
    bestDisplay = document.getElementById('best-display');
    movesDisplay = document.getElementById('moves-display');
    solvedOverlay = document.getElementById('solved-overlay');
    solvedTime = document.getElementById('solved-time');
    solvedBest = document.getElementById('solved-best');

    const skeletonContainer = document.getElementById('skeleton-container');
    const gameView = document.getElementById('game-view');
    const resetButton = document.getElementById('reset-button');
    const solvedResetButton = document.getElementById('solved-reset-button');
    const settingsButton = document.getElementById('settings-button');
    const settingsOverlay = document.getElementById('settings-overlay');
    const settingsClose = document.getElementById('settings-close');

    displayMode = readPreference('displayMode', 'arrows');
    cellStyle = readPreference('cellStyle', 'classic');

    initCustomDropdown('difficulty-control', currentDifficulty, value => {
        currentDifficulty = value;
        closeAllDropdowns();
        newGame();
    });

    initCustomDropdown('display-control', displayMode, value => {
        displayMode = value;
        writePreference('displayMode', value);
        syncBoardView();
        updateAllTiles(false);
    });

    initCustomDropdown('style-control', cellStyle, value => {
        cellStyle = value;
        writePreference('cellStyle', value);
        syncBoardView();
        updateAllTiles(false);
    });

    resetButton.addEventListener('click', () => {
        newGame();
    });

    solvedResetButton.addEventListener('click', () => {
        hideSolvedOverlay();
        newGame();
    });

    settingsButton.addEventListener('click', () => {
        settingsOverlay.classList.add('active');
        settingsOverlay.setAttribute('aria-hidden', 'false');
    });

    settingsClose.addEventListener('click', () => {
        closeSettingsOverlay();
    });

    settingsOverlay.addEventListener('click', event => {
        if (event.target === settingsOverlay) {
            closeSettingsOverlay();
        }
    });

    solvedOverlay.addEventListener('click', event => {
        if (event.target === solvedOverlay) {
            hideSolvedOverlay();
        }
    });

    board.addEventListener('click', event => {
        const tile = event.target.closest('.tile');

        if (!tile || solved) return;

        const index = Number(tile.dataset.index);
        handleTileTap(index);
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeSettingsOverlay();
            closeAllDropdowns();
        }
    });

    document.addEventListener('touchmove', event => {
        if (document.body.classList.contains('game-page')) {
            event.preventDefault();
        }
    }, { passive: false });

    window.addEventListener('resize', () => {
        recomputeBoardSize();
    });

    if ('ResizeObserver' in window) {
        const observer = new ResizeObserver(() => {
            recomputeBoardSize();
        });

        observer.observe(boardStage);
    }

    setTimeout(() => {
        skeletonContainer.classList.remove('active');
        gameView.classList.add('active');

        requestAnimationFrame(() => {
            newGame();
        });
    }, 700);
}

function closeSettingsOverlay() {
    const settingsOverlay = document.getElementById('settings-overlay');

    settingsOverlay.classList.remove('active');
    settingsOverlay.setAttribute('aria-hidden', 'true');

    closeAllDropdowns();
}

function initCustomDropdown(controlId, initialValue, onChange) {
    const control = document.getElementById(controlId);
    const trigger = control.querySelector('.select-trigger');
    const valueLabel = control.querySelector('.select-value');
    const options = Array.from(control.querySelectorAll('.select-option'));

    function setSelected(value, shouldNotify = false) {
        const selectedOption = options.find(option => option.dataset.value === value);

        if (!selectedOption) return;

        options.forEach(option => {
            const isActive = option.dataset.value === value;
            option.classList.toggle('active', isActive);
            option.setAttribute('aria-selected', String(isActive));
        });

        valueLabel.textContent = selectedOption.textContent.trim();
        control.dataset.value = value;

        if (shouldNotify) {
            onChange(value);
        }
    }

    trigger.addEventListener('click', event => {
        event.stopPropagation();

        const isOpen = control.classList.contains('open');

        closeAllDropdowns();

        control.classList.toggle('open', !isOpen);
        trigger.setAttribute('aria-expanded', String(!isOpen));
    });

    options.forEach(option => {
        option.addEventListener('click', event => {
            event.stopPropagation();

            const value = option.dataset.value;

            setSelected(value, true);
            control.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
        });
    });

    document.addEventListener('click', event => {
        if (!control.contains(event.target)) {
            control.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
        }
    });

    setSelected(initialValue, false);
}

function closeAllDropdowns() {
    document.querySelectorAll('.custom-select.open').forEach(control => {
        control.classList.remove('open');

        const trigger = control.querySelector('.select-trigger');

        if (trigger) {
            trigger.setAttribute('aria-expanded', 'false');
        }
    });
}

function newGame() {
    hideSolvedOverlay();
    stopTimer();
    resetTimerDisplay();

    solved = false;
    timerStarted = false;
    timerRunning = false;

    moveCount = 0;
    updateMovesDisplay();

    cells = [];
    cellIndexByKey = new Map();

    createCells();
    scramblePuzzle();
    renderBoard();
    updateBestDisplay();
}

function updateMovesDisplay() {
    if (movesDisplay) {
        movesDisplay.textContent = String(moveCount);
    }
}

function createCells() {
    const config = DIFFICULTIES[currentDifficulty];

    if (config.layout === 'square') {
        createSquareCells(config.size);
    } else {
        createHexCells(config.radius);
    }
}

function createSquareCells(size) {
    for (let row = 0; row < size; row += 1) {
        for (let col = 0; col < size; col += 1) {
            const index = cells.length;
            const key = `${row}:${col}`;

            cells.push({
                index,
                key,
                row,
                col,
                state: 0
            });

            cellIndexByKey.set(key, index);
        }
    }
}

function createHexCells(radius) {
    for (let q = -radius; q <= radius; q += 1) {
        const rMin = Math.max(-radius, -q - radius);
        const rMax = Math.min(radius, -q + radius);

        for (let r = rMin; r <= rMax; r += 1) {
            const index = cells.length;
            const key = `${q}:${r}`;

            const rawX = 1.5 * q;
            const rawY = Math.sqrt(3) * (r + q / 2);

            cells.push({
                index,
                key,
                q,
                r,
                rawX,
                rawY,
                state: 0
            });

            cellIndexByKey.set(key, index);
        }
    }
}

function scramblePuzzle() {
    const config = DIFFICULTIES[currentDifficulty];
    let attempts = 0;

    do {
        cells.forEach(cell => {
            cell.state = 0;
        });

        for (let i = 0; i < config.scrambleMoves; i += 1) {
            const randomIndex = Math.floor(Math.random() * cells.length);
            applyMove(randomIndex, false);
        }

        attempts += 1;
    } while (isSolved() && attempts < 12);
}

function renderBoard() {
    const config = DIFFICULTIES[currentDifficulty];

    board.innerHTML = '';
    board.className = `board ${config.layout === 'square' ? 'square-board' : 'hex-board'}`;
    board.dataset.display = displayMode;
    board.dataset.cellStyle = cellStyle;
    board.dataset.difficulty = currentDifficulty;

    const fragment = document.createDocumentFragment();

    cells.forEach(cell => {
        const tile = document.createElement('button');

        tile.className = 'tile';
        tile.type = 'button';
        tile.dataset.index = String(cell.index);
        tile.dataset.key = cell.key;
        tile.setAttribute('aria-label', `Tile ${cell.index + 1}`);

        tile.innerHTML = `
            <span class="tile-surface">
                <svg class="arrow-icon" viewBox="0 0 64 64" aria-hidden="true">
                    <path d="M18 39L32 25L46 39"></path>
                </svg>
                <span class="tile-number" aria-hidden="true"></span>
            </span>
        `;

        fragment.appendChild(tile);
    });

    board.appendChild(fragment);

    recomputeBoardSize();
    updateAllTiles(false);
    syncBoardView();
}

function recomputeBoardSize() {
    if (!board || !boardStage || !cells.length) return;

    const config = DIFFICULTIES[currentDifficulty];
    const stageRect = boardStage.getBoundingClientRect();

    const isDesktop = window.innerWidth >= 960;
    const isMobile = window.innerWidth <= 640;

    let maxWidth = stageRect.width;
    let maxHeight = stageRect.height;

    if (isDesktop) {
        maxWidth = stageRect.width * 0.88;
        maxHeight = stageRect.height * 0.88;
    } else if (isMobile) {
        maxWidth = stageRect.width * 0.96;
        maxHeight = stageRect.height * 0.78;
    } else {
        maxWidth = stageRect.width * 0.92;
        maxHeight = stageRect.height * 0.84;
    }

    maxWidth = Math.max(140, Math.floor(maxWidth));
    maxHeight = Math.max(140, Math.floor(maxHeight));

    if (config.layout === 'square') {
        resizeSquareBoard(config.size, maxWidth, maxHeight);
    } else {
        resizeHexBoard(maxWidth, maxHeight);
    }
}

function resizeSquareBoard(size, maxWidth, maxHeight) {
    const gap = clamp(3, Math.min(maxWidth, maxHeight) * 0.014, 10);
    const maxSquareCell = window.innerWidth >= 960 ? 76 : 96;

    const cellSize = Math.floor(Math.min(
        maxSquareCell,
        (maxWidth - gap * (size - 1)) / size,
        (maxHeight - gap * (size - 1)) / size
    ));

    const boardSize = cellSize * size + gap * (size - 1);

    board.style.width = `${boardSize}px`;
    board.style.height = `${boardSize}px`;
    board.style.setProperty('--cell-size', `${cellSize}px`);
    board.style.setProperty('--cell-gap', `${gap}px`);
    board.style.gridTemplateColumns = `repeat(${size}, ${cellSize}px)`;
    board.style.gridTemplateRows = `repeat(${size}, ${cellSize}px)`;
}

function resizeHexBoard(maxWidth, maxHeight) {
    const metrics = getHexMetrics();
    const cellFactor = 1.48;

    let unit = Math.min(
        maxWidth / (metrics.rangeX + cellFactor),
        maxHeight / (metrics.rangeY + cellFactor)
    );

    unit = Math.max(8, unit);

    const maxCellSize = window.innerWidth >= 960 ? 54 : 82;
    const cellSize = Math.min(maxCellSize, unit * cellFactor);
    const boardWidth = metrics.rangeX * unit + cellSize;
    const boardHeight = metrics.rangeY * unit + cellSize;

    board.style.width = `${boardWidth}px`;
    board.style.height = `${boardHeight}px`;
    board.style.setProperty('--cell-size', `${cellSize}px`);

    cells.forEach(cell => {
        const tile = board.querySelector(`.tile[data-index="${cell.index}"]`);

        if (!tile) return;

        const left = (cell.rawX - metrics.minX) * unit;
        const top = (cell.rawY - metrics.minY) * unit;

        tile.style.width = `${cellSize}px`;
        tile.style.height = `${cellSize}px`;
        tile.style.left = `${left}px`;
        tile.style.top = `${top}px`;
    });
}

function getHexMetrics() {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    cells.forEach(cell => {
        minX = Math.min(minX, cell.rawX);
        maxX = Math.max(maxX, cell.rawX);
        minY = Math.min(minY, cell.rawY);
        maxY = Math.max(maxY, cell.rawY);
    });

    return {
        minX,
        maxX,
        minY,
        maxY,
        rangeX: maxX - minX,
        rangeY: maxY - minY
    };
}

function handleTileTap(index) {
    if (!timerStarted) {
        startTimer();
    }

    moveCount += 1;
    updateMovesDisplay();

    const affected = applyMove(index, true);

    affected.forEach(affectedIndex => {
        if (affectedIndex === index) {
            animateTile(affectedIndex, 'clicked');
        } else {
            animateTile(affectedIndex, 'affected');
        }
    });

    if (isSolved()) {
        completePuzzle();
    }
}

function applyMove(index, shouldRender) {
    const affectedIndices = getAffectedIndices(index);

    affectedIndices.forEach(affectedIndex => {
        const cell = cells[affectedIndex];
        const previousState = cell.state;
        const config = DIFFICULTIES[currentDifficulty];

        cell.state = (cell.state + 1) % config.states;

        if (shouldRender) {
            updateTile(affectedIndex, true, previousState);
        }
    });

    return affectedIndices;
}

function getAffectedIndices(index) {
    const config = DIFFICULTIES[currentDifficulty];
    const cell = cells[index];

    if (config.layout === 'square') {
        const affected = [];

        for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
            for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
                const key = `${cell.row + rowOffset}:${cell.col + colOffset}`;

                if (cellIndexByKey.has(key)) {
                    affected.push(cellIndexByKey.get(key));
                }
            }
        }

        return affected;
    }

    const directions = [
        [0, 0],
        [1, 0],
        [1, -1],
        [0, -1],
        [-1, 0],
        [-1, 1],
        [0, 1]
    ];

    return directions
        .map(([qOffset, rOffset]) => `${cell.q + qOffset}:${cell.r + rOffset}`)
        .filter(key => cellIndexByKey.has(key))
        .map(key => cellIndexByKey.get(key));
}

function updateAllTiles(animate = false) {
    cells.forEach(cell => {
        updateTile(cell.index, animate);
    });
}

function updateTile(index, animate = false, previousState = null) {
    const config = DIFFICULTIES[currentDifficulty];
    const cell = cells[index];
    const tile = board.querySelector(`.tile[data-index="${index}"]`);

    if (!tile) return;

    const number = tile.querySelector('.tile-number');
    const arrow = tile.querySelector('.arrow-icon');
    const rotation = (360 / config.states) * cell.state;

    tile.dataset.state = String(cell.state);
    tile.style.setProperty('--state-dark', getStateDarkness(cell.state, config.states));

    if (number) {
        number.textContent = String(cell.state + 1);
    }

    tile.setAttribute('aria-label', `Tile ${index + 1}, state ${cell.state + 1}`);

    if (arrow) {
        if (animate && previousState !== null) {
            animateArrowClockwise(arrow, previousState, cell.state, config.states);
        } else {
            clearArrowAnimation(arrow);
            arrow.style.transform = `rotate(${rotation}deg)`;
        }
    }
}

function animateArrowClockwise(arrow, previousState, nextState, totalStates) {
    const stepDeg = 360 / totalStates;
    const fromDeg = previousState * stepDeg;
    const animatedToDeg = fromDeg + stepDeg;
    const normalizedToDeg = nextState * stepDeg;

    clearArrowAnimation(arrow);

    arrow.style.transition = 'none';
    arrow.style.transform = `rotate(${fromDeg}deg)`;

    arrow.getBoundingClientRect();

    arrow.style.transition = 'transform 180ms cubic-bezier(0.22, 0.61, 0.36, 1)';
    arrow.style.transform = `rotate(${animatedToDeg}deg)`;

    arrow._cleanupTimer = setTimeout(() => {
        arrow.style.transition = 'none';
        arrow.style.transform = `rotate(${normalizedToDeg}deg)`;

        requestAnimationFrame(() => {
            arrow.style.transition = '';
        });
    }, 190);
}

function clearArrowAnimation(arrow) {
    if (arrow._cleanupTimer) {
        clearTimeout(arrow._cleanupTimer);
        arrow._cleanupTimer = null;
    }

    arrow.style.transition = 'none';
}

function getStateDarkness(state, totalStates) {
    if (totalStates <= 1) return '0.10';

    const min = 0.10;
    const max = 0.82;
    const value = min + (state / (totalStates - 1)) * (max - min);

    return value.toFixed(3);
}

function syncBoardView() {
    if (!board) return;

    board.dataset.display = displayMode;
    board.dataset.cellStyle = cellStyle;
}

function animateTile(index, className) {
    const tile = board.querySelector(`.tile[data-index="${index}"]`);

    if (!tile) return;

    tile.classList.remove(className);

    window.requestAnimationFrame(() => {
        tile.classList.add(className);

        setTimeout(() => {
            tile.classList.remove(className);
        }, 220);
    });
}

function isSolved() {
    return cells.length > 0 && cells.every(cell => cell.state === 0);
}

function completePuzzle() {
    solved = true;
    stopTimer();

    const finalTime = elapsedBeforeStop;
    const previousBest = readBestTime();

    if (!previousBest || finalTime < previousBest) {
        writeBestTime(finalTime);
    }

    updateBestDisplay();
    showSolvedOverlay(finalTime);
}

function startTimer() {
    timerStarted = true;
    timerRunning = true;
    startTimestamp = performance.now();
    elapsedBeforeStop = 0;

    tickTimer();
}

function stopTimer() {
    if (timerFrame) {
        cancelAnimationFrame(timerFrame);
        timerFrame = null;
    }

    if (timerRunning) {
        elapsedBeforeStop = performance.now() - startTimestamp;
    }

    timerRunning = false;
}

function resetTimerDisplay() {
    if (timerFrame) {
        cancelAnimationFrame(timerFrame);
        timerFrame = null;
    }

    startTimestamp = 0;
    elapsedBeforeStop = 0;
    timerStarted = false;
    timerRunning = false;

    timeDisplay.textContent = '00:00.000';
}

function tickTimer() {
    if (!timerRunning) return;

    const elapsed = performance.now() - startTimestamp;

    timeDisplay.textContent = formatTime(elapsed);

    timerFrame = requestAnimationFrame(tickTimer);
}

function formatTime(milliseconds) {
    const totalMilliseconds = Math.max(0, Math.floor(milliseconds));
    const minutes = Math.floor(totalMilliseconds / 60000);
    const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
    const millis = totalMilliseconds % 1000;

    return `${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(millis, 3)}`;
}

function pad(value, length) {
    return String(value).padStart(length, '0');
}

function bestKey() {
    return `arrowPuzzleBest:${currentDifficulty}`;
}

function readBestTime() {
    try {
        const value = sessionStorage.getItem(bestKey());
        return value ? Number(value) : null;
    } catch {
        return null;
    }
}

function writeBestTime(milliseconds) {
    try {
        sessionStorage.setItem(bestKey(), String(Math.floor(milliseconds)));
    } catch {
        return;
    }
}

function updateBestDisplay() {
    const best = readBestTime();
    bestDisplay.textContent = best ? formatTime(best) : '--:--.---';
}

function showSolvedOverlay(finalTime) {
    const best = readBestTime();

    solvedTime.textContent = formatTime(finalTime);
    solvedBest.textContent = best ? formatTime(best) : '--:--.---';

    solvedOverlay.classList.add('active');
    solvedOverlay.setAttribute('aria-hidden', 'false');
}

function hideSolvedOverlay() {
    if (!solvedOverlay) return;

    solvedOverlay.classList.remove('active');
    solvedOverlay.setAttribute('aria-hidden', 'true');
}

function readPreference(key, fallback) {
    try {
        return sessionStorage.getItem(`arrowPuzzlePreference:${key}`) || fallback;
    } catch {
        return fallback;
    }
}

function writePreference(key, value) {
    try {
        sessionStorage.setItem(`arrowPuzzlePreference:${key}`, value);
    } catch {
        return;
    }
}

function clamp(min, value, max) {
    return Math.max(min, Math.min(value, max));
}