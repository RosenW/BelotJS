const suits_size = 4;
const max_played_cards = 4;
const suits = ["Clubs", "Diamonds", "Hearts", "Spades"];
const suit_symbols = ["♣", "♦", "♥", "♠"];
const labels = ["7", "8", "Q", "K", "10", "A", "9", "J"];
const calls = ["C", "D", "H", "S", "A", "J"];
const labels_to_points = {
    "7": 0, 
    "8": 0, 
    "Q": 3, 
    "K": 4, 
    "10": 10,
    "A": 11, 
    "9": 14, 
    "J": 20
}
const contras = [1, 2, 4];
const deck_size = suits_size * labels.length;
const shuffle_intensity = 2;
const players_count = 4;
const max_cards_in_hand = 8;

const first_deal_card_count = 3;
const second_deal_card_count = 2;
const third_deal_card_count = 3;

const last_turn = 7;
const last_turn_points = 10;

let deck = [];
let player_hands = [[], [], [], []];
let cards_in_play = [];

let player_turn = 0;

let side_score = 0;
let top_score = 0;
let side_game_score = 0;
let top_game_score = 0;

let starting_player = 0;
let turn = 0;

for (const label of labels) {
    for (let i = 0; i < suits_size; i++) {
        deck.push({
            suit: suits[i],
            symbol: suit_symbols[i],
            label: label
        });
    }
}

//deck = deal_second(deck);
//
//
//start_new_hand(0);

start_next_round();

function start_next_round() {
    deck = shuffle(deck);
    deck = deal_first(deck);

    update_ui();
}


function shuffle(deck) {
    for (let i = 0; i < deck_size * shuffle_intensity; i++) {
        let place1 = Math.floor(Math.random() * deck_size);
        let place2 = Math.floor(Math.random() * deck_size);
        let spare = deck[place2];
        deck[place2] = deck[place1];
        deck[place1] = spare;
    }

    return deck;
}

function print_deck(deck) {
    console.log("Printing Deck: ");
    for (const card of deck) {
        console.log(card.label + card.symbol);
    }    
}

function deal_first (deck) {
    for (let i = 0; i < players_count; i++) {
        for (let j = 0; j < first_deal_card_count; j++) {
            player_hands[i].push(deck.pop());
        }
    }

    for (let i = 0; i < players_count; i++) {
        for (let j = 0; j < second_deal_card_count; j++) {
            player_hands[i].push(deck.pop());
        }
    }

    return deck;
}

function deal_second (deck) {
    for (let i = 0; i < players_count; i++) {
        for (let j = 0; j < third_deal_card_count; j++) {
            player_hands[i].push(deck.pop());
        }
    }

    return deck;
}

function update_ui () {
    for (let i = 0; i < players_count; i++) {
        for (let j = 0; j < max_cards_in_hand; j++) {
            if (!player_hands[i][j]) { break; }
            document.getElementById("i" + i + "c" + j).src = "Cards/" + player_hands[i][j].label + player_hands[i][j].suit + ".png";
        }
    }

    //sp = 0; k = 0,1,2,3; ci = 0,1,2,3
    //sp = 3; k = 0,1,2,3; ci = 3,4,5,6 % 4 = 3,0,1,2 TODO: FIX BUG CARDS NOT APPEARING WHERE THEY HAVE TO
    //cards = [{card}]
    for (let l = 0; l < cards_in_play.length; l++) {
        let card_slot_index = (l + starting_player) % 4;
        document.getElementById("i" + (card_slot_index + 4) + "c0").src = "Cards/" + cards_in_play[l].label + cards_in_play[l].suit + ".png";
    }

    for (let k = 0; k < max_played_cards; k++) {
        let card_slot_index = (k + starting_player) % 4;
        if (!cards_in_play[k]) {
            document.getElementById("i" + (card_slot_index + 4) + "c0").src = "Cards/Blank.png";
        }
    }

    document.getElementById("top-game-score").innerHTML = top_game_score;
    document.getElementById("side-game-score").innerHTML = side_game_score;
    document.getElementById("top-score").innerHTML = top_score;
    document.getElementById("side-score").innerHTML = side_score;
}

function call () {
    return { 
        call: "J",
        contra: 1
    }
}

function start_new_hand(player_num) {
    document.querySelectorAll('.t' + player_num + ' td').forEach((td) => {td.style["background-color"] = 'green'});
    player_turn = player_num;
    starting_player = player_num;
}

let current_hand_suit;
function play_card (card_num, player_num) {
    if (player_num != player_turn || player_hands[player_turn][card_num].label == "Blank") {
        return;
    }

    if (cards_in_play.length == 0) {
        current_hand_suit = player_hands[player_turn][card_num].suit;
    }

    document.querySelectorAll('td').forEach((td) => {td.style["background-color"] = 'white'});

    cards_in_play.push({label: player_hands[player_turn][card_num].label, suit: player_hands[player_turn][card_num].suit});
    player_hands[player_turn][card_num] = { label: "Blank", suit: "" };


    if (cards_in_play.length == 4) {
        update_ui();
        setTimeout(check_hand_winner, 1000);
        return;
    }

    if (player_turn == players_count - 1) {
        player_turn = 0;
    } else {
        player_turn++;
    }

    document.querySelectorAll('.t' + player_turn +' td').forEach((td, i) => {
        if (can_play_card(player_hands[player_turn][i], player_turn)) {
            td.style["background-color"] = 'green';
        } else {
            td.style["background-color"] = 'red';
        }
    });

    update_ui();
}

function check_hand_winner () {
    let strongest_card;
    let winning_player;
    console.log(current_hand_suit);
    cards_in_play.forEach((card_in_play, i) => {
        //sp = 0; i = 0,1,2,3; ci = 0,1,2,3
        //sp = 3; i = 0,1,2,3; ci = 3,4,5,6 % 4 = 3,0,1,2
        let card_index = (i + starting_player) % 4;
        if (i==0) {
            strongest_card = card_in_play;
            winning_player = card_index;
        } else {
            if (card_in_play.suit == current_hand_suit && strongest_card.suit != current_hand_suit) {
                strongest_card = card_in_play;
                winning_player = card_index;
            } else if (
                    labels.indexOf(card_in_play.label) > labels.indexOf(strongest_card.label) 
                &&  strongest_card.suit == card_in_play.suit) {
                strongest_card = card_in_play;
                winning_player = card_index;
            }
        }
    });

    cards_in_play.forEach((card_in_play) => {
           if (winning_player % 2 == 0) {
            top_game_score += labels_to_points[card_in_play.label];
            if (turn == last_turn) {
                top_game_score += last_turn_points; // TODO: FIX BUG
            }
        } else {
            side_game_score += labels_to_points[card_in_play.label];
            if (turn == last_turn) {
                side_game_score += last_turn_points;
            }
        }
    });

    cards_in_play = [];
    if (turn == last_turn) {
        turn = 0;
        top_score += Math.round(top_game_score / 10);
        side_score += Math.round(side_game_score / 10);
        top_game_score = 0;
        side_game_score = 0;
    } else {
        start_new_hand(winning_player);    
        turn++;
    }
    
    update_ui();
}

function can_play_card (play_card, player_turn) {
    let has_stronger = false;
    let has_any_of_suit = false;
    let strongest_card;

    cards_in_play.forEach((card_in_play, i) => {
        if (i==0) {
            strongest_card = card_in_play;
        } else {
            if (card_in_play.suit == current_hand_suit && strongest_card.suit != current_hand_suit) {
                strongest_card = card_in_play;
            } else if (labels.indexOf(card_in_play.label) > labels.indexOf(strongest_card.label)) {
                strongest_card = card_in_play;
            }
        }
    });

    player_hands[player_turn].forEach((card) => {
        if (card.suit == current_hand_suit) {
            has_any_of_suit = true;
        }

        if (
                    labels.indexOf(card.label) > labels.indexOf(strongest_card.label)
                &&  card.suit == current_hand_suit
            ) {
            has_stronger = true;
        }
    });

    if (!has_any_of_suit) {
        return true;
    }

    if (!has_stronger) {
        if (play_card.suit == current_hand_suit) {
            return true;
        }
        return false;
    } else if (play_card.suit == current_hand_suit && labels.indexOf(play_card.label) > labels.indexOf(strongest_card.label)) {
        return true;
    } else {
        return false;
    }
}
