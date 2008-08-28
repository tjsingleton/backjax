function Deck() {
	this.cards = new Array;
	this.defaultCardValues = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
	this.reset = function(){
		this.cards = new Array();
	};
	this.count =  function(){
		return this.cards.length;
	};
	this.getNextCard = function(){
		return this.cards.shift();
	};
	this.shuffle = function(){
	  var i = this.cards.length;
	  if ( i == 0 ) return false;
	  while ( --i ) {
	     var newKey = Math.floor( Math.random() * ( i + 1 ) );
	     var oldCard = this.cards[i];
	     var newCard = this.cards[newKey];	 
	     this.cards[i] = newCard;
	     this.cards[newKey] = oldCard;
	   }
	};
	this.completeDeck = function(){
		this.reset();
		this.createSuit("spades","&spades;");
		this.createSuit("hearts", "&hearts;");
		this.createSuit("clubs", "&clubs;");
		this.createSuit("diams", "&diams;");
		return this.cards;
	};
	this.createSuit = function(suit, suitIcon){
		for(var i in this.defaultCardValues)
		{
			this.cards.push(new Card(this.defaultCardValues[i], suit, suitIcon));
		}
		return true;
	};	
	this.show = function(){
		for(var i in this.cards) { this.cards[i].draw();}
	}
	/* Constructor Function */
	this.completeDeck();
};

function Card(value, suit, suitIcon){
	this.value = value;
	this.suit = suit;
	this.suitIcon = suitIcon;	

	return this;
}

function Hand() {
	this.cards = new Array();
	this.add = function(card) {
		this.cards.push(card);
	}
	this.evaluate = function(){
		// Needs to handle two aces better
		var total1 = new Number;
		var total2 = new Number;
		
		for(var i in this.cards)
		{
			if (this.cards[i].value == "A") { 
				total1 += 1;
				total2 += 11;
				continue;
			}
			if (isNaN(this.cards[i].value * 1)) {
				total1 += 10;
				total2 += 10;
				continue;
			} 
			total1 += Number(this.cards[i].value);
			total2 += Number(this.cards[i].value);
		}
		return [total1, total2];
	};
}

function Player(name) {
	this.name = new String;
	this.hand = new Object;
	this.total = new Number;
	this.busted = false;
	this.stand = false;
	this.blackjack = false;
	
	this.addCard = function(deck){
		this.hand.add(deck.getNextCard());
	}
	
	this.getCard = function(cardNum){
		return this.hand.cards[cardNum];
	}
	/* Constructor Function */
	this.name = name;
	this.hand = new Hand;
}

function Dealer(game){
	this.deck = new Object;
	this.game = new Object;
	
	this.getDeck = function(){
		this.deck = new Deck();
		this.deck.shuffle();
	};
	this.dealCard = function(player){
		player.addCard(this.deck);
		return true;
	};

	this.play = function(displayObj){
		var dealer = this.game.players[0];
		var handTotal = dealer.hand.evaluate();
		var highest = false;
		var lowest = false;
	
		if(dealer.bust == true || dealer.blackjack == true) {
			return;	
		}
		// Dealer must hit
		// Both ways is less than 17.
		if(handTotal[0] < 17 && handTotal[1] < 17)
		{
			return displayObj.hit(dealer);
		} 
		
		// figures out which one is higher
		if(handTotal[1] > handTotal[0]) { 
			highest = handTotal[1]
			lowest = handTotal[0];
		} else {
			highest = handTotal[0]
			lowest = handTotal[1];
		}

		// One way bust, one way under 17
		if(highest > 21 && lowest < 17) {
			return displayObj.hit(dealer);
		}
		
		// Dealer stands
		return displayObj.stand(dealer);
	

	};
	/* Constructor Function */
	this.game = game;
	game.addPlayer("Dealer");
	return this;
}

function BlackjackGame() {
	this.players = new Array;
	this.dealer = new Object;
	
	this.start = function(){
		this.resetPlayers();
		this.deal();
	};
	this.deal = function(){
		this.dealer.getDeck();	
		/* Deal two cards */
		for(var i = 0; i <= 1; i++)
		{	
			/* Deal players first */
			for(var ii = 1; ii <= this.players.length-1; ii++)
			{
				this.dealer.dealCard(this.players[ii]);
			}
			
			/* Deal dealer last */
			this.dealer.dealCard(this.players[0]);
		}
	}
	this.resetPlayers = function(){
		for(var i in this.players)
		{
			this.players[i].busted = false;
			this.players[i].stand = false;
			this.players[i].blackjack = false;
			this.players[i].total = new Number;
			this.players[i].hand = new Hand;
		}
		return true;
	};
	this.addPlayer = function(playerName){
		/* No more than 7 players */
		if(this.players.length >= 6){
			return false;
		}
		this.players.push(new Player(playerName));
		return true;
	};
	this.checkHand = function(player){
		var handTotal = player.hand.evaluate();
		if(handTotal[0] > 21 && handTotal[1] > 21) {
			// For a bust return the lowest score
			if(handTotal[0] < handTotal[1]) { 
				handTotal = handTotal[0] 
			} else {
				handTotal = handTotal[1] 
			}
			this.bust(player, handTotal);
			return false;
		}

		// return highest score
		if(handTotal[1] > handTotal[0] && handTotal[1] < 22) { 
			handTotal = handTotal[1] 
		} else {
			handTotal = handTotal[0] 
		}
		return handTotal;
	};
	this.checkPlayers = function(displayObj){
		var activePlayers = 0;
		var standPlayers = 0; 
		for(var i=0; i < this.players.length; i++)
		{		
			if(!this.players[i].busted && !this.players[i].stand)
			{
				activePlayers++;
			}
			if(this.players[i].stand)
			{
				standPlayers++;
			}
		}
	// Only Dealer left, other players stood
		if (activePlayers == 1 && standPlayers)
		{
			return this.dealer.play(displayObj);
		}
		// Only Dealer left, everyone else bust.
		if (activePlayers == 1 && standPlayers == 0)
		{
			return displayObj.stand(this.players[0]);
		}
		// Dealer already stood/bust-
		if (activePlayers == 0 )
		{
			return displayObj.evaluateGame();
		} 
		return true;		

	};
	this.checkForBlackjack = function(){
		var blackjacks = new Array();
		for(var i=0; i < this.players.length; i++)
		{		
			if(this.checkHand(this.players[i]) == 21) {
				blackjacks.push(this.blackjack(this.players[i]));
			}
		}
		return blackjacks;
	};
	this.hit = function(player){
		this.dealer.dealCard(player);
		return this.checkHand(player);
	};
	this.blackjack = function(player) {
		player.blackjack = true;
		player.stand = true;
		player.total = 21;
		return player;
	}
	this.stand = function(player){
		player.stand = true;
		return player.total = this.checkHand(player);		
	};
	this.bust = function(player, total){
		player.busted = true;
		player.total = total;
	};
	this.evaluateGame = function(){
		// End game logic
	};
	this.getPlayers = function(){
		return this.players;
	}
	/* Constructor Function */	
	this.dealer = new Dealer(this);
	return this;
}

function BlackjackFrontend() {
	var game = new Object;
	
	this.newGame = function(){
		this.game.start();
		$("body *").remove(); // Reset Screen
		this.showDeal();
		this.checkForBlackjack();
		this.showButtons();
		return true;
	};
	
	this.addPlayer = function(playerName){
		this.game.addPlayer(playerName);
	};

	this.showDeal = function(){
		var players = this.game.getPlayers();
		for(var cardNum = 0; cardNum < 2; cardNum++) {
			for(var i = 0; i < players.length; i++) {
				// Add Player Containers on first
				if(cardNum == 0) {
					$(document.body).append('<div id="' + players[i].name + '" class="player"><h2>'+players[i].name+'</h2><ul class="hand"></ul></div>');
				}
				// Add Cardstack On first dealer card
				if(cardNum == 0 && i == 0) {
					$("#Dealer").append("<div id=\"cardstack\"></div>");	
				}
				this.showCard(players[i].name, players[i].getCard([cardNum]));
			}
		}
	};
	this.showButtons = function(){
		var blackjack = this;
		var players = this.game.getPlayers();
		for(var i = 0; i < players.length; i++) {
			// Not the dealer or not blackjacked
			if(i != 0) {
				if( players[i].blackjack != true) {
					$("#" +players[i].name).append("<div class=\"buttons actions\"><button id=\""+i+"\" class=\"hit\">Hit</button><button id=\""+i+"\" class=\"stand\">Stand</button></div>");		$("#" + players[i].name + " button.hit").click(
						function(el){
							blackjack.hit(blackjack.game.players[$(this).attr("id")]);		
						}
					);
					$("#" + players[i].name + " button.stand").click(
						function(el){
							blackjack.stand(blackjack.game.players[$(this).attr("id")]);
						}
					);			
				}
			}
		}
	};

	this.hit = function(player){
		if(!this.game.hit(player)){
			this.bust(player);
		}
		this.showCard(player.name, player.getCard(player.hand.cards.length-1));
		this.game.checkPlayers(this);
	};

	this.stand = function(player){
		this.game.stand(player);
		$("#" + player.name + " button").remove();
		this.playerMsg(player.name, 'Stand ['+player.total+']', 'stood');		
		this.game.checkPlayers(this);
	};
	this.bust = function(player, handTotal){
		$("#" + player.name + " button").remove();
		this.playerMsg(player.name, 'Bust ['+player.total+']', 'busted');	
	};
	this.playerMsg = function(name, msg, className){
		var html = new String();
		if(!className) {
			className="playerMsg";
		}
		html = '<span class="' + className + '">' + msg + '</span>';
		$("#" + name).append(html);
		$("#" + name + ' span.' + className).fadeIn('fast');
	}
	this.checkForBlackjack = function(){
		var blackjacks = this.game.checkForBlackjack();
		if(!blackjacks.length)	{ return false;	}
		for(var i = 0; i < blackjacks.length; i++) {
			this.playerMsg(blackjacks[i].name, "BLACKJACK!", "blackjack");
		}
		this.game.checkPlayers(this);
	};
	this.evaluateGame = function(){
		var blackjack = this;
		$(document.body).append('<div id="gameMsg"><strong>Game Over</strong><br/><button class="newGame">New Game</button><br /><a href="#" class="tribute">Tribute to Windows Solitare</a></div>')
		$("gameMsg").animate({
				"left": $(window).width()/2,
				"top": $(window).height()/2,
				"height": "15em",
				"width": "10em"
			  });
			$("button.newGame").click(
				function(el){	
					blackjack.newGame();
				}
			);
		$("#gameMsg").centerScreen();
		$("a.tribute").click(function(){for(i=0; i < 52; i++) {
						x = $(window).width() * .75;
						y = $(window).height()* .75;
						setTimeout(function(){$("#cardstack").clone().insertAfter('#cardstack').animate({
							"left": Math.floor(Math.random()*x),
							"top": Math.floor(Math.random()*y),
							"height": "17em",
							"width": "12em"}, 2000, "swing", function(){});
							 }, i*i);
					
					}});
	};
	this.showCard = function(playerName, cardObj){
		var offset = $('#' + playerName).offset();
		$('#' + playerName + ' .hand').append('<li><div class="card '+cardObj.suit+'"><div class="top"><div class="value">'+cardObj.value+'</div><div class="suit">'+cardObj.suitIcon+'</div></div><div class="middle"><div class="suit">'+cardObj.suitIcon+'</div></div><div class="bottom"><div class="value">'+cardObj.value+'</div><div class="suit">'+cardObj.suitIcon+'</div></div></div></li>');
		$("#cardstack").clone().insertAfter('#cardstack').animate({
					"left": offset.left,
					"top": offset.top,
					"height": "15em",
					"width": "10em"
				  }).fadeOut('fast', function(){
					   $(this).remove();
					   $('#' + playerName + ' .hand .card').fadeIn("slow");
				  });
	};	
	/* Constructor Function */	
	this.game = new BlackjackGame();

}

$(function(){
	$("#gameSetup input[type=button]").click(function() {
		var  i = $('div.player_name').length + 1;
		$('div.player_name:last').after('<div class="player_name"><label for="player['+i+']">Player '+i+'</label><input type="text" name="player['+i+']" value=""/></div>');
		if(i == 6) {$(this).remove();}
	});
	$("#gameSetup").submit(function(){return false;});
	$("#gameSetup input[type=submit]").click(function(){
		var blackjax = new BlackjackFrontend();
    	var inputs = $('input[type=text]');
	  	 inputs.each(function (i) {
			var name = $(this).val();
			var accept = /\W/;
		   if(name == "" || accept.test(name) ) {name= 'Player_'+i;}
		   blackjax.addPlayer(name);       
    	});
	    blackjax.newGame();
	});
	
});