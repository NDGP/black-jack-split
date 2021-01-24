import { Deck, Hand } from "../helpers/cardLogic";
import useApplicationData from "../hooks/useApplicationData"

import Table from "./Table";
import Chips from "./Chips";
import Actions from './Actions';

import "./Home.css";


let deck = new Deck(6);
let dealer = new Hand();

//REFACTOR EVERYTHING
let totalWins = 0;
let totalLosses = 0;
let totalDraws = 0;
let totalBlackjacks = 0;

let cash = {
  bet: 0,
  bankroll : 0,
  initBankroll: 0
}

// let currentUser = null;

export default function Home(props) {
  const {
    state,
    updateHand,
    updateHands,
    resetHands,
    addSplitHand,
    updateActions,
    testLogin,
    updateBankroll,
    addBet,
    clearBet,
    updateBet
  } = useApplicationData();

  let hand = state.hand;
  let currentHand = state.currentHand;
  let actions = state.actions;
  let cash = state.cash;

  // shuffle
  if (state.turn === "reveal" && deck.cards.length < deck.resetCards.length / 2){
      deck.reset()
    }

  const recordStats = (turnWins, turnLosses, turnDraws, turnBlackjacks) => {
    //  console.log(`Record Stats before: wins ${totalWins} losses ${totalLosses} draws ${totalDraws} `)
    if (state.turn === "reveal") {
      totalWins += (turnWins / 2);
      totalLosses += (turnLosses / 2);
      totalDraws += (turnDraws / 2);
      totalBlackjacks += (turnBlackjacks / 2);
      console.log(`Record Stats after: wins ${totalWins} losses ${totalLosses} draws ${totalDraws} `)
    }
  }
  //if (state.dealer) dealer = state.dealer;
  if (hand[currentHand]) actions.split = hand[currentHand].canSplit;

  const deal = () => {
    actions.deal = false;
    updateActions(-1, "deal")

    setTimeout(() => { hit(hand[0]) }, 350);
    setTimeout(() => { hit(hand[0]) }, 1400);

    setTimeout(() => { hit(hand[1]) }, 700);
    setTimeout(() => { hit(hand[1]) }, 1750);

    setTimeout(() => { hit(dealer) }, 1050);
    setTimeout(() => { updateActions(0, "player") }, 1755);
  }

  //testcode
  // const fakehit = (hand) => {
  //   hand.add("AS")
  //   updateHand(hand);
  // }
  // const fakehit2 = (hand) => {
  //   hand.add("KH")
  //   updateHand(hand);
  // }

  const hit = (hand) => {
    hand.add(deck.draw())
    updateHand(hand);
    actions.switch = false;
  }

  const checkBlackjack = () => {
    if (hand[currentHand]) {
      if (hand[currentHand].value >= 21 && state.turn === "player") {
        stay()
      }
    }
  }

  const stay = () => {
    if (currentHand < hand.length - 1) {
      updateHand(hand[currentHand]);
      currentHand++
      updateActions(currentHand, "player");
    } else if (currentHand === hand.length - 1) {
      updateActions(currentHand, "dealer");
    }
  }

  //DEALER
  //dealer code
  if (state.turn === "dealer") {
    if (dealer.value < 17 || (dealer.ace > 0 && dealer.value === 17)) {
      hit(dealer)
    } else {
      updateActions(-1, "reveal");
    }
  }

  const split = () => {
    if (hand[currentHand].canSplit === true) {
      hand[currentHand].canSplit = false;
      let newHand = new Hand(hand[currentHand].splitHand(), state.cash.bet)
      addSplitHand(newHand);
      updateHand(hand[currentHand]);
      updateHand(hand[currentHand + 1]);
      setTimeout(() => { hit(hand[currentHand]) }, 500);
      setTimeout(() => { hit(hand[currentHand + 1]) }, 1000);
      updateBet(cash.bet);
    }
  }

  const doubleDown = () => {
    if (cash.amount > cash.bankroll) {
      window.alert(`Insufficient funds, you are missing ${cash.amount - cash.bankroll}$`)
    } else {
      hit(hand[currentHand]);
      hand[currentHand].bet += state.cash.bet;
      updateBet(cash.bet);
      stay();
    }
  }

  //switch is not allowed as a function name in js, use swap instead
  const swap = (hand1, hand2) => {
    if (actions.switch) {
      // actions.switch = false;
      let temp = hand1.cards[1];
      hand1.cards[1] = hand2.cards[1];
      hand2.cards[1] = temp;
      updateHand(hand1);
      updateHand(hand2);
    }
  }

  checkBlackjack();

  const clearTable = () => {
    clearBet()
    dealer = new Hand();
    updateActions(-1, "bet");
  }

  //console.log(state.currentUser, "before if.  USERS:", state.users)
  if (state.currentUser === null && state.users.length > 0) {
    //currentUser = state.users[1];
    testLogin();
    console.log(state.currentUser, "after if")
  }

  if (state.currentUser !== null && cash.bankroll === 0) {
    cash.bankroll = state.currentUser.bankroll;
    cash.initBankroll = state.currentUser.bankroll;
  }

  return (
    <div class="table">
      <Table
        cardLibrary={state.cards}
        deck={deck}
        hand={hand}
        dealer={dealer}
        currentHand={currentHand}
        recordStats={recordStats}
        totalWins={totalWins}
        totalLosses={totalLosses}
        totalDraws={totalDraws}
        totalBlackjacks={totalBlackjacks}
        bet={cash.bet}
      />
      <Actions
        hit={() => hit(hand[currentHand])}
        stay={() => stay()}
        deal={() => deal()}
        swap={() => swap(hand[0], hand[1])}
        split={() => split()}
        double={() => doubleDown()}
        reset={() => clearTable()}
        actions={actions}
      />
      <Chips
        addBet5={() => addBet(5)}
        addBet25={() => addBet(25)}
        addBet100={() => addBet(100)}
        addBet500={() => addBet(500)}
        clearBet={() => clearBet()}
        bet={cash.bet}
        bankroll={cash.bankroll}
        initialBankroll={cash.initBankroll}
        turn={state.turn}
        hand={hand}
      />


    </div>
  )
}