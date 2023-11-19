// Global Variables
const displayer = document.querySelector('#displayer');
const gameBoardArray = [];


// Player Class
class Player {

    constructor(id, xo, display) {
        this.id = id;
        this.winCount = 0;
        this.display = display;
        this.title = document.querySelector(`#p${id}Title`);
        this.input = document.querySelector(`#p${id}Input`);
        this.button = document.querySelector(`#p${id}Button`).addEventListener('click', this.changeName.bind(this));
        this.winsDisplay = document.querySelector(`#p${id}Score`);
        this.name = `Player ${id}`;
        this.declareType(xo);
        this.displayTitle();
    };

    // Changes name of player
    changeName() {
        if (this.input.value != '') {
            this.name = this.input.value;
            this.input.value = '';
            this.displayTitle();
            this.display();
            this.wins(false);
        } else {
            displayer.textContent = "You can't change your name to nothing, dumbass!!!";
        }
    }

    // Sets type to either X or O
    declareType(xo) {
        this.type = this.id === String(xo) ? 'X' : 'O';
        this.displayTitle();
    }

    // Displays title above side
    displayTitle() {
        this.title.textContent = this.name + ' is ' + this.type;
    }

    // Keeps track of wins, internally and on display
    wins(didWin) {
        if (didWin) {
            this.winCount++;
        }
        this.winsDisplay.textContent = `${this.name}'s Wins: ${this.winCount}`;
    }

    // Resets - winCount, name, and 3 displays where name could occur
    reset() {
        this.winCount = 0;
        this.name = `Player ${this.id}`;
        this.displayTitle();
        this.display();
        this.wins(false);
    }

}


// Game Button Class
class Button {

    constructor(x, y) {
        // Create button
        this.b = document.createElement('button');
        this.b.classList.add('boardButton');
        this.b.id = x + ',' + y;
        return this.b;
    };

}


// Gameboard Array IIFE
(function GameBoard() {

    // Constants
    const board = document.querySelector('#board');
    var row = [];

    // Squares
    for(x = 0; x < 3; x++) {
        for(y = 0; y < 3; y++) {
            row.push(new Button(x,y));
            
        }
        gameBoardArray.push(row);
        row.forEach(b => board.appendChild(b));
        row = [];
    }

})();



// Game Controller IIFE
(function GameController() {

    // Game Initializers
    document.querySelector('#restart').addEventListener('click', newGame);
    document.querySelector('#reset').addEventListener('click', reset)
    var xo = Math.round(Math.random()) + 1;
    const p1 = new Player('1', xo, display);
    const p2 = new Player('2', xo, display);   
    var activePlayer = String(xo) === '1' ? p1 : p2;
    // Shows whose turn it is upon webpage loading
    display();

    // Add Gameboard Event Listeners
    // Need to do it here and not in class Button, because it needs to be linked to activePlayer 
    // amongst other things (winner, display functions) in this IIFE
    gameBoardArray.forEach(row => {
        row.forEach(b => b.addEventListener('click', function() {
        if (b.innerText === '') {
            b.innerText = activePlayer.type;
            if (checkNoWinner()) {
                activePlayer = activePlayer === p1 ? p2 : p1;
                display();
            }
        } else {
            displayer.textContent = `No stealing squares! It's still ${activePlayer.name}'s turn!`;
        }
    }))});



    // Game Functions

    
    // New Game button function
    function newGame() {
        // Assign new X and O
        xo = Math.round(Math.random()) + 1;
        activePlayer = String(xo) === '1' ? p1 : p2;
        display();
        p1.declareType(xo);
        p2.declareType(xo);
        
        // Clear gameboard
        gameBoardArray.forEach(row => {
            row.forEach(b => b.innerText = '')});

        // Unfreeze buttons
        freezer(false);
    }

    // Reset button function
    function reset() {
        // Reset players
        p1.reset();
        p2.reset();
        
        // New game function 
        newGame();
    }

    // Update display function
    function display() {
        displayer.textContent = `It's ${activePlayer.name}'s turn!`;
    }

    // Check for winner algorithm
    function checkNoWinner() {

        // Only need to check for active players type
        var checkFor = activePlayer.type;
        var countx = 0;
        var county = 0;
        var countTie = 0;
        var winTilesx = [];
        var winTilesy = [];

        // Scan horizontally and vertically
        for (x = 0; x < 3; x++) {
            for (y = 0; y < 3; y++) {
                // Checks vertically
                if (checkFor === gameBoardArray[y][x].innerText) {
                    county++;
                    winTilesy.push([y, x]);
                } else {
                    county = 0;
                    winTilesy = [];
                }
                // Checks horizontally
                if (checkFor === gameBoardArray[x][y].innerText) {
                    countx++;
                    winTilesx.push([x, y]);
                } else {
                    countx = 0;
                    winTilesx = [];
                }
                // Checks for tie; blank or not
                if (gameBoardArray[x][y].innerText != '') {
                    countTie++;
                }
            }
            // Check for 3 in a row
            if (county === 3) {
                winner(winTilesy);
                return false;
            } else if (countx === 3) {
                winner(winTilesx);
                return false;
            }
        }

        // Outlying diagnal cases
        if (checkFor === gameBoardArray[0][0].innerText && 
            checkFor === gameBoardArray[1][1].innerText && 
            checkFor === gameBoardArray[2][2].innerText) {
            winner([[0, 0], [1, 1], [2, 2]]);
            return false;
        }
        if (checkFor === gameBoardArray[2][0].innerText && 
            checkFor === gameBoardArray[1][1].innerText && 
            checkFor === gameBoardArray[0][2].innerText) {
            winner([[2, 0], [1, 1], [0, 2]]);
            return false;
        }

        // Check for tie; if up til now no winner is found, and count is 9, it's a tie
        if (countTie === 9) {
            tie();
            return false;
        }

        // Returns true if game is not over is found; continue gameplay
        return true;
    }   


    // Winner function
    function winner(winningSpaces) {
        // Freeze gameboard
        freezer(true);

        // Light up winning spaces
        winningSpaces.forEach(b => gameBoardArray[b[0]][b[1]].classList.add('winningSpace'));

        // Print winner in displayer
        displayer.textContent = `${activePlayer.name} has won the game!`;

        // Update win count
        activePlayer.wins(true);
    }

    // Tie function
    function tie() {
        // Freeze gameboard
        freezer(true);

        // Print winner in displayer
        displayer.textContent = `It's a tie. Play again?`;
    }

    // Freeze buttons
    function freezer(shouldFreeze) {
        gameBoardArray.forEach(row => {
            row.forEach(b => {
                b.disabled = shouldFreeze;
                if (!shouldFreeze) {
                    // Undoes highlighted class whenever buttons are unfrozen (at the start of a new game)
                    b.classList.remove('winningSpace');
                }
            })
        })
    }

})();