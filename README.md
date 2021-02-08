# Splice

My attempt at a card game! A deck manager and card creation game. The idea is to allow players to splice cards together to create ever more bizzare creations and then control the management/risk/reward of their deck by placing them into attacking or defensive positions. If your opponent goes all out on you in a single go and you have only commited a little bit to defense you may lose the game but if you are only ever on defense, how do you plan to win? 

The game structure is as follows: 
A round consists of three phases pick a card, manage deck, battle.

Pick a card
Five random cards will be called from the master deck for the opponents to pick from in a Catan fashion. Player 1 of that turn will pick one card, player 2 will pick 2 consecutively, player 1 can pick the final card. It will then automatically move on to the manage deck phase.

Manage Deck
Players will be able to splice cards or move cards to attack, defense or back to their hand. At the moment the splice function uses a small form with the arr id position of the card so every card will display their arr id for the user to decide what to splice together. Both players will get the opportunity to 

Battle Phase
This phase is done automatically - it consists of 2 rounds, player 1 attacks player 2 and vica versa. These are then split into two more rounds, player 1 attacks player 2s defense deck, player 2s defense deck attack player 1s attack deck and the opposite for the primary second round. This is currently uninteractive and has no visual elements to it so doesn't work brilliantly. 

There is a lot to work on with this, but this is a basic prototype of the game to get it going. I wanted to make it pure vanilla JavaScript just to say I did/could. 

There will be a lot of things to work on and bugs to fix but hopefully this turns into a pretty awesome project. After I tighten up the mechanics, eliminate bugs, the goal will be to build a computer player and then 'node' the project so that two players can play over the net. If anyone comes across any bugs or has any feedback/ideas on how I can make it better, let me know. 

Thanks
