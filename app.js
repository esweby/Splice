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
            const [attack, defense] = card.action( nxtFnc, arr, obj, card.getNewStat );
            obj.attack = attack;
            obj.defense = defense;
            return card.action( card.add, arr, obj);
        },
        getNewStats ( arr, obj, nxtFnc ) {
            return [ card.action( nxtFnc, arr, obj, null, 'attack' ), card.action( nxtFnc, arr, obj, null, 'defense' ) ];
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
            for ( const newCard of arrOfArr ) card.action( card.preAddChecks, deck, {name: newCard[0], defense: newCard[1], attack: newCard[2]}, card.add );
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

    const gameObj = gameState.getGame(); // used often as a cross reference for getting player data
    const players = plyrMngr.getPlayers(); // used with gameObj as a cross reference - may be better to add perm 
    // variables for players rather than wrestling with sometimes confusing queries
    const card = cardMngr.getCardObj(); // so far it hasn't been used so consider deleting

    const cardCtrl = cardMngr;
    const gameCtrl = gameState;
    const playerCtrl = plyrMngr;

    const arrFiveCards = [];

    function action( fnc, nxtFnc, data ) { return fnc( nxtFnc, data ); };

    //  These are all high level actions taken at a game level 
    //  Including what actions to take if a new game starts, a game ends
    //
    const game = {
        new() {
            cardCtrl.resetDeck();
            cardCtrl.init();
            gameCtrl.reset();
            playerCtrl.reset();

            return action( round.firstRound );
        },
        swapActivePlayer( nxtFnc ) {
            gameObj.active === 0 ? action( nxtFnc([1, 0])) : action( nxtFnc([0, 1]));
        },
        swapActiveTo( [one, two] ) {
            gameObj.active = one;
            gameObj.opposite = two;
        },
        finishGame( ) {

        }
    }

    //  These are mid level actions 
    //  I've broken these out so that they dont get lost within the phases of 
    //  play within the game
    const round = {
        firstRound() {
            action( round.addRound );
            console.log(`------------------ Starting round ${gameObj.round} ------------------`);
            console.log(` `);
            action( phase.One.start );
        },
        nextRound() {
            console.log(` `);
            console.log(`------------------ End of round ${gameObj.round} ------------------`);
            console.log(` `);
            action( round.addRound );
            console.log(`------------------ Starting round ${gameObj.round} ------------------`);
            console.log(` `);
            action( phase.One.start );
        },
        swapStartOrder() {
            const one = [0, 'playerOne'];
            const two = [1, 'playerTwo'];
            if(game.active[0] === 0) {
                game.active = two;
                game.opposite = one;
            } else {
                game.active = one;
                game.opposite = two;
            }
        },
        addRound( ) {
            gameObj.round++;
        },
    };

    //  These are the vast majority of player controlled actions 
    //  It is split up into One, Two, Three 
    //  One is the card pick round - the active player gets to choose the first two cards, the other play recieves the rest
    //  Two is a deck management round where players can choose to move their cards or splice them together
    //  Three is an automated round where battles take place - I need to put a check around this so regular game actions can not be taken if the game is finished -
    //  though I may just leave that for the UI where it will be easier to do so.
    const phase = {
        currPlyr: 'active',
        activePhase: 1,
        One: {
            // - start is the official starting point and is only called once 
            // - continue will be called when a player picks a card and will also trigger phase two when the criteria are met 
            //   (criteria are there is only 3 cards left in fiveCardArr)
            start() {
                action( phase.One.getFiveCards, phase.One.dispFiveCardArr );
                console.log(`Player ${gameObj[phase.currPlyr][0] + 1}, please choose a card using pickCard(id)`);
                phase.activePhase = 2;
                phase.currPlyr = 'active';
            },
            continue() {
                if(arrFiveCards.length > 3) {
                    console.log(`Player ${gameObj[phase.currPlyr][0] + 1}, please choose a card using pickCard(id)`);
                } else {
                    action( phase.One.pushRestToPlayer );
                    action( phase.Two.start );
                }
            },
            //  This section controls the five cards that you can get from the primary deck
            //  I feel like it's fairly refined and doesn't repeat itself - though there is a case that there is a 
            //  lot of duplication when it comes to referencing 
            //
            getFiveCards( nxtFnc ) {
                action( cardCtrl.getFiveCards, arrFiveCards );
                nxtFnc();
            },
            dispFiveCardArr() {
                console.log('------------------------------------------------------');
                for(const [i, card] of arrFiveCards.entries()) console.log(`Card ${i}: ${card.name} | Attack: ${card.attack} | defense: ${card.defense}`);
                console.log('------------------------------------------------------');
                
            },
            pushChosenCardToPlayer( data ) {
                const [id, type] = data;
                const newCardObj = {
                    name: arrFiveCards[id].name,
                    defense: arrFiveCards[id].defense,
                    attack: arrFiveCards[id].attack,
                    id: players[gameObj[type][0]].hand.length,
                }
                players[gameObj[type][0]].hand.push(newCardObj);
            },
            pushRestToPlayer() {
                console.log(`Player ${gameObj.opposite[0] + 1} receives the ${arrFiveCards[0].name}, ${arrFiveCards[1].name} and ${arrFiveCards[2].name} cards!`);
                for(let i = 0; i < 3; i++) {
                    action( phase.One.pushChosenCardToPlayer, [0, 'opposite'] );
                    action( phase.One.removeCardFromFiveCards, 0 );
                }
            },
            removeCardFromFiveCards( id ) {
                arrFiveCards.splice(id, 1);
            },
            // 
            //    This is a player taken action that can be called using the function pickCard() (defined outside of the code)
            //
            selectCard( id ) {
                action( phase.One.pushChosenCardToPlayer, [id, 'active'] );
                console.log(` - Player ${gameObj.active[0] + 1} chose the ${arrFiveCards[id].name} card!`);
                action( phase.One.removeCardFromFiveCards, id );
                action( phase.One.dispFiveCardArr );
                action( phase.One.continue );
            },
        },
        // This is phase two
        // I feel like it is currently on the messy side but that may be due to large amounts of console.logs - for the sake of continued testing I may write 
        // a function that can take multiple string arrays and console.log them in order. FOR THE NEATNESS.
        Two: {
            start() {
                phase.activePhase = 2;
                phase.currPlyr = 'active';
                action( phase.Two.promptPlyr );
            },
            promptPlyr() {  // Player info
                console.log(' ');
                console.log(`Player ${gameObj[phase.currPlyr][0] + 1}, please manage your deck! The following commands are available:`);
                console.log(` `);
                console.log('seeDecks() - view your hand, attack and defense deck');
                console.log(`moveCard('fromDeck', 'toDeck', cardId) - move a card to another deck`);
                console.log(`         from and to options - 'hand', 'attack', 'defense'`);
                console.log(`spliceCards('name', idOne, idTwo) - Splice two cards together and get a new one back`);
                console.log(`          only works on cards in your hand`);
                console.log(`         If the card has already been made you will get a copy of that instead`);
                console.log(`nextPlayer() - this will end your turn`);
                console.log(`         If you are the opposite player this will end the round and move through`);
                console.log(`         the battle phase automatically.`);
            },
            // Player function to display the current players deck.
            viewDecks() {
                console.log(` `);  // Player info
                console.log(`- You have chosen to view your deck`);  // Player info
                const decks = ['hand', 'attack', 'defense'];
                for (let i = 0; i < 3; i++) {
                    let attack = 0;
                    let defense = 0;

                    i === 0 ? console.log(`In your ${decks[i]}: `) : console.log(`In your ${decks[i]} deck: `);
                    const arr = players[gameObj[phase.currPlyr][0]][decks[i]];
                    for (const [i, card] of arr.entries()) {
                        console.log(`Card ${i}: ${card.name} | Attack: ${card.attack} | Defense: ${card.defense}`);
                        attack += card.attack;
                        defense += card.defense;
                    }
                    console.log(`This hand has ${attack} attack and ${defense} defense`); // Player info
                    console.log('------------------------------------------------------'); // Player info
                }
                console.log(`It is player ${gameObj[phase.currPlyr][0] + 1} go... please use help() to see more options`); // Player info
            },
            // Player function to move a card from one deck to another using the id
            moveCard( from, to, id ) {
                console.log(`- You have chosen to move ${players[gameObj[phase.currPlyr][0]][from][id].name} to the ${to} deck.`); // Player prompt
                players[gameObj[phase.currPlyr][0]][to].push( players[gameObj[phase.currPlyr][0]][from][id] );
                players[gameObj[phase.currPlyr][0]][from].splice(id, 1);
                action( phase.Two.resetIds );
            },
            // written in a slightly confusing manner thanks to the references and is an example where you can't really tell what is being referenced.
            resetIds() {
                const decks = ['hand', 'attack', 'defense'];
                for (let i = 0; i < 3; i++) {
                    const arr = players[gameObj[phase.currPlyr][0]][decks[i]];
                    for (let j = 0; j < arr.length; j++) arr[j].id = j;
                }
            },
            // Player function to splice two cards togerher
            // Written to just get it working, this needs a lot of reworking
            splice(name, parentOne, parentTwo) {
                if( players[gameObj[phase.currPlyr][0]].hand.length < parentTwo ) {
                    return console.log(`Error: Can not Splice! Please choose a valid card from your hand less than ${players[gameObj][phase.currPlyr][0].hand.length}`); // player info - error
                }
                const p1name = action( phase.Two.getParentName, parentOne );     //   Code block gets information to pass into splicing
                const p1id = action( phase.Two.getParentOriginalId, parentOne ); //   Would like to see if there was a neat method for doing this in one line
                const p2name = action( phase.Two.getParentName, parentTwo );     //   Thinking destructor with a high level first function
                const p2id = action( phase.Two.getParentOriginalId, parentTwo ); //

                console.log(` - You have chosen to splice a new card from ${p1name} amd ${p2name}!`); // player info
                action( phase.Two.removeCardFromHand, p1name );  //   Code block removes the cards used for splicing from the player hand before moving forward
                action( phase.Two.resetIds );                    //   Same with this code block - would like to rewrite to be neater
                action( phase.Two.removeCardFromHand, p2name );  //
                action( phase.Two.resetIds );                    //

                const newCard = cardCtrl.spliceCard(name, p1id, p2id); // gets the new splicedcard
                players[gameObj[phase.currPlyr][0]].hand.push(newCard); // pushes spliced card into player hand - can be moved 

                action( phase.Two.resetIds );  //  Can probably be moved into one code block / action.
                action( phase.Two.viewDecks ); //
            },
            //
            //  These are all functions for splicing cards together
            //
            getParentName( parent ) {
                return players[gameObj[phase.currPlyr][0]].hand[parent].name;
            },
            getParentOriginalId( parent ) {
                return cardCtrl.getOriginalId(players[gameObj[phase.currPlyr][0]].hand[parent]);
            },
            removeCardFromHand( name ) {
                // this line is not at all human readable, I get it and will turn it into nice code.
                // also was difficult to write because of referencing objects so really need a nice way to do that
                for (const currCard of players[gameObj[phase.currPlyr][0]].hand) {
                    if (name === currCard.name) {
                        players[gameObj[phase.currPlyr][0]].hand.splice( currCard.id, 1);
                    }
                }
            },
            //  Switches the active player so that player two (or one on even rounds)
            //  can do their card management.
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
        //
        // This is the battle round and is largely console.logs
        //
        // During a battle we will check for the win condition and call that if it is met.
        Three: {
            start() {
                console.log(`----------------------------------------------`);
                console.log('Battle One!!!');
                console.log(`----------------------------------------------`);
                action( phase.Three.battle, [0, 1] ); // calls the first battle passing through 0 - first player and 1 - second player
                console.log(`----------------------------------------------`);
                console.log('Battle Two!!!');
                console.log(`----------------------------------------------`);
                action( phase.Three.battle, [1, 0] ); // see above comment

                action( round.nextRound ); // at the end of the battles - start the next round 
            },
            battle( arr ) {
                // not sure why i wrote the below - I think I just wanted some definite data to be passed in - bit weird really.
                const attackingPlayer = arr[0] === 0 ? 0 : 1;
                const defendingPlayer = arr[1] === 1 ? 1 : 0;

                const [ attPlyrAtt, attPlyrDef, defPlyrAtt, defPlyrDef ] = action( phase.Three.getBattleStats, players[attackingPlayer].attack, players[defendingPlayer].defense );

                console.log(`Player ${attackingPlayer + 1} will attack player ${defendingPlayer + 1}!`);           // 
                console.log(`Player ${attackingPlayer + 1} has ${attPlyrAtt} attack and ${attPlyrDef} defense`);   // Player prompt and largely irrelevant with the rest that we tell them
                console.log(`Player ${defendingPlayer + 1} has ${defPlyrAtt} attack and ${defPlyrDef} defense`);   // 

                action( phase.Three.attack, [attackingPlayer, defendingPlayer], attPlyrAtt );
                console.log(`----------------------------------------------`);
                action( phase.Three.defend, [defendingPlayer, attackingPlayer], defPlyrAtt );
                console.log(`----------------------------------------------`);
                
                action( phase.Two.resetIds );
            },
            //   attack and defense are SHOCKINGLY similar and need rewriting to farm some of their functions out
            //   during attack we check for the win condition
            //
            attack( arr, attackPower ) {
                let attack = attackPower;
                const [ attacker, defender ] = arr;
                let spliceNum = 0;

                const defendingDeck = players[defender].defense;
                console.log(`Starting attack...`);
                for(let i = 0; i < defendingDeck.length; i++) {
                    console.log(`Player ${attacker + 1} attacks Player ${defender + 1} for ${attack} attack power!`);
                    if (attack >= defendingDeck[i].defense) {
                        console.log(`Player ${attacker + 1} defeats the ${defendingDeck[i].name} card (${attack} attack vs ${defendingDeck[i].defense} defense)`);
                        attack -= defendingDeck[i].defense;
                        attack > 0 ? console.log(`Player ${attacker + 1} has ${attack} attack power left. Player ${attacker + 1} will attack again!`) : console.log(`Player ${attacker + 1} has ${attack} attack power left. Player ${attacker + 1}'s attack is over.`);
                        spliceNum++;
                    } else if (attack <= defendingDeck[i].defense) {
                        console.log(`Player ${attacker + 1}'s attack on Player ${defender + 1} fails! (${attack} attack vs ${defendingDeck[i].defense} defense)`);
                    }
                }

                // remove defeated cards - no idea if this works yet
                defendingDeck.splice(0, spliceNum);

                // Check if player can attack opponent health
                if(defendingDeck.length === 0 && attack > 0) {
                    // Attack player health
                    players[defender].health -= attack;
                    // Player prompt to say about it 
                    console.log(`Player ${attacker + 1} hits Player ${defender + 1}'s health for ${attack} attack. Player ${defender + 1}'s health is now ${players[defender].health}.`);
                    // check for win condition
                    if(players[defender].health <= 0) {
                        action( game.finishGame );
                    }
                }
            },
            defend( arr, attackPower ) {
                let attack = attackPower;
                const [ attacker, defender ] = arr;
                let spliceNum = 0;

                const defendingDeck = players[defender].attack;
                console.log(`Defense starting...`);
                for(let i = 0; i < defendingDeck.length; i++) {
                    if (attack >= defendingDeck[i].defense) {
                        console.log(`Player ${attacker + 1} defeats the ${defendingDeck[i].name} card (${attack} attack vs ${defendingDeck[i].defense} defense)`);
                        attack -= defendingDeck[i].defense;
                        attack > 0 ? console.log(`Player ${attacker + 1} has ${attack} attack power left. Player ${attacker + 1} can defend again.`) : console.log(`Player ${attacker + 1} has ${attack} attack power left. Player ${attacker + 1}'s attack is over.`);
                        spliceNum++;
                    } else if (attack <= defendingDeck[i].defense) {
                        console.log(`Player ${attacker + 1}'s attack on Player ${defender + 1} fails! (${attack} attack vs ${defendingDeck[i].defense} defense)`);
                    }
                }
            },
            // famred out functions to get attack and defense values and return as an array
            getBattleStats( arrOne, arrTwo ) {
                return [ 
                    action( phase.Three.getBattleStat, arrOne, 'attack' ), 
                    action( phase.Three.getBattleStat, arrOne, 'defense' ), 
                    action( phase.Three.getBattleStat, arrTwo, 'attack' ),
                    action( phase.Three.getBattleStat, arrTwo, 'defense' ), 
                ];
            },
            getBattleStat( arr, stat ) {
                let attr = 0;
                for(const card of arr) attr += card[stat];
                return attr;
            },
        }
    }

    
    return {
        init() {
            game.new();
        },
        getPhase() {
            return phase;
        }

    }
})(gameState, playerMngr, cardMngr)

gameCtrl.init();

const phaseCtrl = gameCtrl.getPhase();
const pickCard = phaseCtrl.One.selectCard;

const seeDecks = phaseCtrl.Two.viewDecks;
const moveCard = phaseCtrl.Two.moveCard;
const spliceCards = phaseCtrl.Two.splice;
const help = phaseCtrl.Two.promptPlyr;
const nextPlayer = phaseCtrl.Two.nextPlayer;

// pickCard(0);
// pickCard(0);

// seeMyDecks();
// moveCard('hand', 'attack', 0);
// moveCard('hand', 'defense', 0);

// nextPlayer();
// console.log(`------- TEST ----------`)
// seeDecks();
// spliceCards('Carrot', 1, 2);
// moveMyCard('hand', 'attack', 0);
// moveMyCard('hand', 'defense', 0);

// nextPlayer();