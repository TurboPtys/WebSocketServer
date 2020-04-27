const port = process.env.port || 3000;
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
var data = require('./data/codes-data.json');
const cors = require('cors');

const router = require('./router');

app.use(cors());
app.use(router);

var board;
var isRedFirstPlayer = false;
var redCounter = 0;
var blueCounter = 0;

io.on('connection', (socket) => {

    console.log('user connected');

    socket.on('new-board', () => {
        console.log('New Board');
        isRedFirstPlayer = !isRedFirstPlayer;
        board = randNewBoard();
        redCounter = isRedFirstPlayer ? 9 : 8;
        blueCounter = !isRedFirstPlayer ? 9 : 8;
        io.emit('board', { board, redCounter, blueCounter});
    })

    socket.on('check-card', (index) => {
        console.log('checkCard');
        board[index].isSelected = true;
        if(board[index].color === 'R') {
            redCounter--;
        }

        if(board[index].color === 'B') {
            blueCounter--;
        }
        io.emit('board', { board, redCounter, blueCounter});
    })

});

http.listen(3000, () => {
    console.log('Server has started. Listen on port ', port );
})

function randNewBoard() {
    const cardsCode = [];
    const codeList = [...data.title];

    const newCardsText = [];
    const newCardsColor = [];
    const index = [];

    // random 25 words without duplicate
    for (let i = 0; i < 25; i++) {
        const temp = Math.floor(Math.random() * (codeList.length - 1));
        newCardsText.push(codeList[temp]);
        codeList.splice(temp, 1);
        index.push(i);
        newCardsColor.push('');
    }

    // random 15 cards (3 deferent colors in each one row)
    for (let i = 0; i < 5; i++) {
        constRowIndex = [0, 1, 2, 3, 4];

        for (let j = 0; j < 3; j++) {
            const temp = Math.floor(Math.random() * (constRowIndex.length - 1));

            switch (j) {
                case 0:
                    newCardsColor[constRowIndex[temp] + (5 * i)] = 'N';
                    break;
                case 1:
                    newCardsColor[constRowIndex[temp] + (5 * i)] = 'R';
                    break;
                case 2:
                    newCardsColor[constRowIndex[temp] + (5 * i)] = 'B';
                    break;
            }

            index.splice(index.indexOf(constRowIndex[temp] + (5 * i)), 1);
            constRowIndex.splice(temp, 1);
        }
    }

    // random index BlackCard
    const randBlackCard = Math.floor(Math.random() * (index.length - 1));
    newCardsColor[index[randBlackCard]] = 'E';
    index.splice(randBlackCard, 1);

    // random 2 Neutral Cards
    for (let i = 0; i < 2; i++) {
        const randLastTwoNeutralCard = Math.floor(Math.random() * (index.length - 1));
        newCardsColor[index[randLastTwoNeutralCard]] = 'N';
        index.splice(randLastTwoNeutralCard, 1);
    }

    // random additional card for first player
    const randIndexFirstPlayerCard = Math.floor(Math.random() * (index.length - 1));
    newCardsColor[index[randIndexFirstPlayerCard]] = isRedFirstPlayer ? 'R' : 'B';
    index.splice(randIndexFirstPlayerCard, 1);

    // random last 6 cards
    const randomizer = Math.floor(Math.random() * 100) > 49 ? true : false;
    for (let i = 0; i < 6; i++) {
        const temp = Math.floor(Math.random() * (index.length - 1));
        if (i % 2 === 0) {
            newCardsColor[index[temp]] = randomizer ? 'B' : 'R';
        } else {
            newCardsColor[index[temp]] = !randomizer ? 'B' : 'R';
        }
        index.splice(temp, 1);
    }

    for (let i = 0; i < 25; i++) {
        cardsCode.push({ title: newCardsText[i], color: newCardsColor[i], isSelected: false });
    }

    return cardsCode;
}