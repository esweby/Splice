const cardMngr = (function() {

    const card = {
        action ( fnc, arr, obj, nxtFnc, action ) {
            return fnc( arr, obj, nxtFnc, action );
        },
        preAddChecks ( arr, obj, nxtFnc ) {
            return card.action( card.checkDuplicate, arr, obj ) || card.action( nxtFnc, arr, obj, card.splice );
        },
        preSpliceChecks ( arr, obj, nxtFnc ) {
            return card.action( card.checkParentDuplicate, arr, obj) || card.action( nxtFnc, arr, obj, card.getNewStats );
        },
        splice ( arr, obj, nxtFnc ) {
            const [attack, health] = card.action( nxtFnc, arr, obj, card.getNewStat );
            obj.attack = attack;
            obj.health = health;
            return card.action( card.add, arr, obj);
        },
        getNewStats ( arr, obj, nxtFnc ) {
            return [ card.action( nxtFnc, arr, obj, null, 'attack' ), card.action( nxtFnc, arr, obj, null, 'health' ) ];
        },
        checkDuplicate ( arr, obj ) {
            for (const currCard of arr) if (obj.name === currCard.name) return currCard;
            return false;
        },
        checkParentDuplicate ( arr, obj ) {
            for (const currCard of arr) {
                if (currCard.parents) {
                    const [newParentOne, newParentTwo] = obj.parents;
                    const [parentOne, parentTwo] = currCard.parents;
                    if ((newParentOne === parentOne && newParentTwo === parentTwo) || (newParentOne === parentTwo && newParentTwo === parentOne)) return card;
                }
            }
            return false;
        },
        add ( arr, obj ) {
            obj.id = arr.length;
            arr.push(obj);
            return deck[obj.id];
        },
        getNewStat( arr, obj, ignore, stat ) {
            return Math.round((arr[obj.parents[0]][stat] + arr[obj.parents[1]][stat]) / 1.1) + (Math.round(Math.random() * (Math.round((arr[obj.parents[0]][stat] + arr[obj.parents[1]][stat]) / 1.5))));
        },
        multipleNewCards ( arrOfArr ) {
            for ( const newCard of arrOfArr ) card.action( card.preAddChecks, deck, {name: newCard[0], health: newCard[1], attack: newCard[2]}, card.add );
        },
        resetDeck ( arr ) {
            arr.splice(0, arr.length);
        }
    }
    
    const deck = new Array();

    return {
        getCardObj: () => card,
        getDeck: () => deck,
        getFiveCards( arr ) {
            for(let i = 0; i < 5; i++) arr.push( deck[Math.round(Math.random() * (deck.length - 1))] );
        },
        spliceCard(name, parentOne, parentTwo) {
            return card.action( card.preAddChecks, deck, { name, parents: [parentOne, parentTwo]}, card.preSpliceChecks );
        },
        init() {
            card.multipleNewCards([
                ['Lion', 4, 3], ['Tiger', 3, 4], ['Cheetah', 2, 2], ['Jaguar', 3, 3],
                ['Wolf', 3, 3], ['Hyena', 2, 3],
                ['Elephant', 6, 2], ['Rhino', 5, 4], 
                ['Grizzly Bear', 4, 4], ['Black Bear', 4, 3],
                ['Crocodile', 2, 5], ['Aligator', 3, 5],
                ['Human', 1, 1]
            ]);
        },
        getOriginalId( cardObj ) {
            const originalCard = card.checkDuplicate( deck, cardObj ).id;
            return originalCard;
        },
        resetDeck() {
            card.resetDeck(deck);
        }
    };
})();

const playerMngr = (function() {
    const Player = function() {
        this.health = 20;
        this.hand = [];
        this.attack = [];
        this.defense = [];
    }
    const playerOne = new Player();
    const playerTwo = new Player();
    const players = [playerOne, playerTwo];
    
    return {
        getPlayers: () => players,
        reset() {
            playerOne.hand.splice(0, playerOne.hand.length);
            playerOne.attack.splice(0, playerOne.attack.length);
            playerOne.defense.splice(0, playerOne.defense.length);
            playerOne.health = 20;
            playerTwo.hand.splice(0, playerTwo.hand.length);
            playerTwo.attack.splice(0, playerTwo.attack.length);
            playerTwo.defense.splice(0, playerTwo.defense.length);
            playerTwo.health = 20;
        }
    }
})();

const gameState = (function() {
    const game = {
        state: true,
        round: 0,
        active: [0, 'playerOne'],
        opposite: [1, 'playerTwo'],
    }

    return {
        getGame: () => game,
        reset() {
            game.state = true;
            game.round = 0;
            game.active = [0, 'playerOne'];
            game.opposite = [1, 'playerTwo'];
        }
    }
})();

const gameCtrl = (function(gameState, plyrMngr, cardMngr) {

    const gameObj = gameState.getGame();
    const players = plyrMngr.getPlayers();
    const card = cardMngr.getCardObj();

    const cardCtrl = cardMngr;
    const gameCtrl = gameState;
    const playerCtrl = plyrMngr;

    const arrFiveCards = [];

    function action( fnc, nxtFnc, data ) { return fnc( nxtFnc, data ); };

    const game = {
        new() {
            return action( round.firstRound );
        },
        swapActivePlayer( nxtFnc ) {
            gameObj.active === 0 ? action( nxtFnc([1, 0])) : action( nxtFnc([0, 1]));
        },
        swapActiveTo( [one, two] ) {
            gameObj.active = one;
            gameObj.opposite = two;
        }
    }
    
    const round = {
        firstRound() {
            action( phase.One.getFiveCards, phase.One.dispFiveCardArr );
            action( phase.One.start );
        },
        nextRound() {
            action( phase.One.getFiveCards, phase.One.dispFiveCardArr );
            action( phase.One.addRound, phase.One.nextStep );
        },
        addRound( nxtFnc ) {
            gameObj.round++;
            nxtFnc();
        },
    };

    const phase = {
        currPlyr: 'active',
        activePhase: 1,
        One: {
            start() {
                phase.activePhase = 2;
                phase.currPlyr = 'active';
                if(arrFiveCards.length > 3) {
                    console.log(`Player ${gameObj.active[0] + 1}, please select a card using selectCard(id)`);
                } else {
                    action( phase.One.pushRestToPlayer );
                    action( phase.Two.start );
                }
            },
            getFiveCards( nxtFnc ) {
                cardMngr.getFiveCards( arrFiveCards );
                nxtFnc();
            },
            dispFiveCardArr() {
                console.log('------------------------------------------------------');
                for(const [i, card] of arrFiveCards.entries()) console.log(`Card ${i}: ${card.name} | Attack: ${card.attack} | Health: ${card.health}`);
                console.log('------------------------------------------------------');
            },
            pushChosenCardToPlayer( data ) {
                const [id, type] = data;
                const newCardObj = {
                    name: arrFiveCards[id].name,
                    health: arrFiveCards[id].health,
                    attack: arrFiveCards[id].attack,
                    id: players[gameObj[type][0]].hand.length,
                }
                players[gameObj[type][0]].hand.push(newCardObj);
            },
            pushRestToPlayer() {
                for(let i = 0; i < 3; i++) {
                    action( phase.One.pushChosenCardToPlayer, [0, 'opposite'] );
                    action( phase.One.removeCardFromFiveCards, 0 );
                }
            },
            removeCardFromFiveCards( id ) {
                arrFiveCards.splice(id, 1);
            }
        },
        selectCard( id ) {
            action( phase.One.pushChosenCardToPlayer, [id, 'active'] );
            console.log(`Player ${gameObj.active[0] + 1} chose the ${arrFiveCards[id].name} card!`);
            action( phase.One.removeCardFromFiveCards, id );
            action( phase.One.dispFiveCardArr );
            action( phase.One.start );
        },
        Two: {
            start() {
                phase.activePhase = 2;
                phase.currPlyr = 'active';
                action( phase.Two.promptPlyr );
            },
            promptPlyr() {
                console.log('------------------------------------------------------');
                console.log(`Player ${gameObj[phase.currPlyr][0] + 1}, please manage your deck! The following commands are available:`);
                console.log(``);
                console.log('seeMyDecks() - view your hand, attack and defense deck');
                console.log(`moveMyCard('fromDeck', 'toDeck', cardId) - move a card to another deck`);
                console.log(`         from and to options - 'hand', 'attack', 'defense'`);
                console.log(`spliceCards('name', idOne, idTwo) - Splice two cards together and get a new one back`);
                console.log(`          only works on cards in your hand`);
                console.log(`         If the card has already been made you will get a copy of that instead`);
                console.log(`nextPlayer() - this will end your turn`);
                console.log(`         If you are the opposite player this will end the round and move through`);
                console.log(`         the battle phase automatically.`);
            },
            viewDecks() {
                
                const decks = ['hand', 'attack', 'defense'];
                for (let i = 0; i < 3; i++) {
                    let attack = 0;
                    let health = 0;
                    i === 0 ? console.log(`In your ${decks[i]}: `) : console.log(`In your ${decks[i]} deck: `);
                    const arr = players[gameObj[phase.currPlyr][0]][decks[i]];
                    for (const [i, card] of arr.entries()) {
                        console.log(`Card ${i}: ${card.name} | Attack: ${card.attack} | Health: ${card.health}`);
                        attack += card.attack;
                        health += card.health;
                    }
                    console.log(`This hand has ${attack} attack and ${health} health`);
                    console.log('------------------------------------------------------');
                }
                console.log(`It is player ${gameObj[phase.currPlyr][0] + 1} go... please use help() to see more options`);
            },
            moveCard( from, to, id ) {
                players[gameObj[phase.currPlyr][0]][to].push( players[gameObj[phase.currPlyr][0]][from][id] );
                players[gameObj[phase.currPlyr][0]][from].splice(id, 1);
                action( phase.Two.resetIds );
                action( phase.Two.viewDecks );
            },
            resetIds() {
                const decks = ['hand', 'attack', 'defense'];
                for (let i = 0; i < 3; i++) {
                    const arr = players[gameObj[phase.currPlyr][0]][decks[i]];
                    for (let j = 0; j < arr.length; j++) arr[j].id = j;
                }
            },
            splice(name, parentOne, parentTwo) {

                if( players[gameObj[phase.currPlyr][0]].hand.length < parentTwo ) {
                    return console.log(`Error: please choose a valid card from your hand less than ${players[gameObj][phase.currPlyr][0].hand.length}`)
                }
                const p1name = action( phase.Two.getParentName, parentOne );
                const p1id = action( phase.Two.getParentOriginalId, parentOne );
                const p2name = action( phase.Two.getParentName, parentTwo );
                const p2id = action( phase.Two.getParentOriginalId, parentTwo );

                action( phase.Two.removeCardFromHand, p1name );
                action( phase.Two.resetIds );
                action( phase.Two.removeCardFromHand, p2name );
                action( phase.Two.resetIds );

                const newCard = cardCtrl.spliceCard(name, p1id, p2id);
                players[gameObj[phase.currPlyr][0]].hand.push(newCard);

                action( phase.Two.resetIds );
                action( phase.Two.viewDecks );
            },
            getParentName( parent ) {
                return players[gameObj[phase.currPlyr][0]].hand[parent].name;
            },
            getParentOriginalId( parent ) {
                return cardCtrl.getOriginalId(players[gameObj[phase.currPlyr][0]].hand[parent]);
            },
            removeCardFromHand( name ) {
                for (const currCard of players[gameObj[phase.currPlyr][0]].hand) if (name === currCard.name) players[gameObj[phase.currPlyr][0]].hand.splice(players[gameObj[phase.currPlyr][0]].hand[currCard.id] , 1);
            },
            nextPlayer() {
                if (phase.currPlyr === 'opposite') {
                    action( phase.Three.start );
                    phase.currPlyr = 'active';
                    phase.activePhase = 1;
                    return
                }
                phase.currPlyr = 'opposite';
                action( phase.Two.promptPlyr );
            },
        },
        Three: {
            start() {
                console.log('Starting Battle Phase!!!');
                const battleStats = action( getBattleStats );
            },
            getBattleStats() {
                for (const [i, card] of arr.entries()) {
                    
                    attack += card.attack;
                    health += card.health;
                }
                return [
                    players[gameObj[phase.currPlyr][0]].hand
                ];
            },
        }
    }

    
    return {
        init() {
            cardCtrl.resetDeck();
            cardCtrl.init();
            gameCtrl.reset();
            playerCtrl.reset();

            game.new();
        },
        getPhase() {
            return phase;
        }

    }
})(gameState, playerMngr, cardMngr)

gameCtrl.init();

const phaseCtrl = gameCtrl.getPhase();
const pickCard = phaseCtrl.selectCard;

const seeMyDecks = phaseCtrl.Two.viewDecks;
const moveMyCard = phaseCtrl.Two.moveCard;
const spliceCards = phaseCtrl.Two.splice;
const help = phaseCtrl.Two.promptPlyr;
const nextPlayer = phaseCtrl.Two.nextPlayer;

pickCard(0);
pickCard(2);

seeMyDecks();
moveMyCard('hand', 'attack', 0);
moveMyCard('hand', 'defense', 0);

nextPlayer();
seeMyDecks();
spliceCards('Carrot', 0, 1);
moveMyCard('hand', 'attack', 0);
moveMyCard('hand', 'defense', 0);

nextPlayer();