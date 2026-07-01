"use strict";

let dealerCardsList = [];
let yourCardsList = [];

let dealerSum = 0;
let yourSum = 0;

let dealerAceCount = 0;
let yourAceCount = 0; 

let hidden;
let deck;

let canHit = true;

let finish = false;

let count = 0;
let wincount = 0;
let tiecount = 0;
let losecount = 0;

let type = "";

const BGM1 = new Audio("music/吸血鬼は機械仕掛けの少女に恋をする.mp3");
BGM1.loop = true;

const BGM2 = new Audio("music/カジノのひと時.mp3");
BGM2.loop = true;

const 不老不死 = new Audio("music/不老不死.mp3");
不老不死.loop = true;

const 星屑サラウンド = new Audio("music/星屑サラウンド.mp3");
星屑サラウンド.loop = true;

const タイフーンパレード = new Audio("music/タイフーンパレード.mp3");
タイフーンパレード.loop = true;

const Success = new Audio("music/Success!.mp3");
Success.loop = true;

const 一パーセントの革命前夜 = new Audio("music/1%の革命前夜.mp3");
一パーセントの革命前夜.loop = true;

// const シャイニングスター = new Audio("https://maou.audio/14_shining_star/");
// シャイニングスター.loop = true;

window.onload = function() {
    let sitePassword = prompt("橘祭 Blackjack のパスワードを入力してください");
    if (sitePassword !== "TACHIBANA2026") { 
        alert("パスワードが違います。アクセスできません。");
        document.body.innerHTML = "<h2>閲覧権限がありません。</h2>";
        return;
    }
    const saved = loadGameState();

    if (saved) {
        // 保存された状態を復元
        ({
            deck,
            hidden,
            dealerSum,
            yourSum,
            dealerAceCount,
            yourAceCount,
            canHit,
            finish,
            count,
            wincount,
            tiecount,
            losecount,
            dealerCardsList,
            yourCardsList
        } = saved);

        renderRestoredGame();
    } else {
        // 通常の初期化
        dealerSum = 0;
        yourSum = 0;
        dealerAceCount = 0;
        yourAceCount = 0;
        canHit = true;
        finish = false;

        buildDeck();
        shuffleDeck();
        startGame();
    }

    document.getElementById("maker").addEventListener("click", music);
    document.getElementById("hit").addEventListener("click", hit);
    document.getElementById("stay").addEventListener("click", stay);
    document.getElementById("restart").addEventListener("click", resetGame);
    document.getElementById("musicSelect").addEventListener("change", changeMusic);
    document.getElementById("decisioncount").addEventListener("click", changecount);
    document.getElementById("reset").addEventListener("click", reset);
};


function buildDeck() {
    let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let types = ["C", "D", "H", "S"];
    deck = [];

    for (let i = 0; i < types.length; i++) {
        for (let j = 0; j < values.length; j++) {
            deck.push(values[j] + "-" + types[i]); //A-C -> K-C, A-D -> K-D
        }
    }
    // console.log(deck);
}

function shuffleDeck() {
    for (let i = 0; i < deck.length; i++) {
        let j = Math.floor(Math.random() * deck.length); // (0-1) * 52 => (0-51.9999)
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
    console.log(deck);
}

function startGame() {
    dealerCardsList = [];
    yourCardsList = [];

    hidden = deck.pop();
    dealerCardsList.push(hidden);

    let hiddenImg = document.createElement("img");
    hiddenImg.src = "./cards/card_back.png";
    hiddenImg.id = "hidden";
    document.getElementById("dealer-cards").append(hiddenImg);
    dealerSum += getValue(hidden);
    dealerAceCount += checkAce(hidden);
    while (dealerSum < 17) {
        let cardImg = document.createElement("img");
        let card = deck.pop();
        yourCardsList.push(card);
        dealerCardsList.push(card);
        cardImg.src = "./cards/" + card + ".png";
        dealerSum += getValue(card);
        dealerAceCount += checkAce(card);
        document.getElementById("dealer-cards").append(cardImg);
    }
    console.log(dealerSum);

    

    for (let i = 0; i < 2; i++) {
        let cardImg = document.createElement("img");
        let card = deck.pop();
        cardImg.src = "./cards/" + card + ".png";
        yourSum += getValue(card);
        yourAceCount += checkAce(card);
        document.getElementById("your-cards").append(cardImg);
    }

    console.log(yourSum);

    saveGameState();
    document.getElementById("your-sum").innerText = yourSum;
}

function hit() {
    if (!canHit) {
        return;
    }

    let cardImg = document.createElement("img");
    let card = deck.pop();
    yourCardsList.push(card);
    cardImg.src = "./cards/" + card + ".png";
    yourSum += getValue(card);
    yourAceCount += checkAce(card);
    document.getElementById("your-cards").append(cardImg);
    dealerSum = reduceAce(dealerSum, dealerAceCount);
    yourSum = reduceAce(yourSum, yourAceCount);
    document.getElementById("your-sum").innerText = yourSum;

    if (reduceAce(yourSum, yourAceCount) > 21) { //A, J, 8 -> 1 + 10 + 8
        canHit = false;
        stay()
    }

    saveGameState();
}

function stay() {
    if (finish) {
        return;
    }
    dealerSum = reduceAce(dealerSum, dealerAceCount);
    yourSum = reduceAce(yourSum, yourAceCount);

    canHit = false;
    document.getElementById("hidden").src = "./cards/" + hidden + ".png";
    finish = true;

    let message = "";
    if (yourSum > 21) {
        message = "You Lose!(burst)";
        losecount++;
    }
    else if (dealerSum > 21) {
        message = "You win!(burst)";
        wincount++;
    }
    //both you and dealer <= 21
    
    else if (yourSum == dealerSum) {
        message = "Tie!";
        tiecount++;
    }

    else if (yourSum > dealerSum) {
        message = "You Win!";
        wincount++;
    }
    else if (yourSum < dealerSum) {
        message = "You Lose!";
        losecount++;
    }
    count++;

    document.getElementById("count").innerText = count;
    document.getElementById("wincount").innerText = wincount;
    document.getElementById("tiecount").innerText = tiecount;
    document.getElementById("losecount").innerText = losecount;
    document.getElementById("dealer-sum").innerText = dealerSum;
    document.getElementById("your-sum").innerText = yourSum;
    document.getElementById("results").innerText = message;

    saveGameState();
}

function getValue(card) {
    let data = card.split("-"); // "4-C" -> ["4", "C"]
    let value = data[0];

    if (isNaN(value)) { //A J Q K
        if (value == "A") {
            return 11;
        }
        return 10;
    }
    return parseInt(value);
}

function checkAce(card) {
    if (card[0] == "A") {
        return 1;
    }
    return 0;
}

function reduceAce(playerSum, playerAceCount) {
    while (playerSum > 21 && playerAceCount > 0) {
        playerSum -= 10;
        playerAceCount -= 1;
    }
    return playerSum;
}

function resetGame() {
    if (!finish) return;
    dealerSum = 0;
    yourSum = 0;
    dealerAceCount = 0;
    yourAceCount = 0;
    canHit = true;
    finish = false;

    document.getElementById("dealer-cards").innerHTML = "";
    document.getElementById("your-cards").innerHTML = "";
    document.getElementById("dealer-sum").innerText = "";
    document.getElementById("your-sum").innerText = "";
    document.getElementById("results").innerText = "";

    buildDeck();
    shuffleDeck();
    startGame();

    saveGameState();
}

function reset() {
    dealerSum = 0;
    yourSum = 0;
    dealerAceCount = 0;
    yourAceCount = 0;
    canHit = true;
    finish = false;
    wincount = 0;
    tiecount = 0;
    losecount = 0;
    count = 0;

    document.getElementById("dealer-cards").innerHTML = "";
    document.getElementById("your-cards").innerHTML = "";
    document.getElementById("dealer-sum").innerText = "";
    document.getElementById("your-sum").innerText = "";
    document.getElementById("results").innerText = "";
    document.getElementById("count").innerText = count;
    document.getElementById("wincount").innerText = wincount;
    document.getElementById("tiecount").innerText = tiecount;
    document.getElementById("losecount").innerText = losecount;
    document.getElementById("musicArea").style.display = "none";
    document.getElementById("countArea").style.display = "none";
    document.getElementById("reset").style.display = "none";

    buildDeck();
    shuffleDeck();
    startGame();

    saveGameState();
}

const songList = {
    bgm1: BGM1,
    bgm2: BGM2,
    hurou: 不老不死,
    hoshikuzu: 星屑サラウンド,
    typhoon: タイフーンパレード,
    success: Success,
    revolution: 一パーセントの革命前夜
};

function music() {
    let ps = prompt("パスワードを入力してください");
    if (ps === "HARAEI") {
        document.getElementById("musicArea").style.display = "block";
        document.getElementById("countArea").style.display = "block";
        document.getElementById("reset").style.display = "block";
    }else {
        alert("パスワードが違います");
    }
};

function changecounttype(event) {
    type = event.target.value;
};

function changecount() {
    let memo = 0
    const valueCount = Number(document.getElementById("countchange").value);
    if (type === "win") {
        memo = wincount - valueCount;
        wincount = valueCount;
        count -= memo;
    } else if (type === "tie") {
        memo = tiecount - valueCount;
        tiecount = valueCount;
        count -= memo
    } else if (type === "lose") {
        memo = losecount - valueCount;
        losecount = valueCount;
        count -= memo;
    }
    document.getElementById("counttype").selectedIndex = 0;
    document.getElementById("countchange").value = "";
    document.getElementById("count").innerText = count;
    document.getElementById("wincount").innerText = wincount;
    document.getElementById("tiecount").innerText = tiecount;
    document.getElementById("losecount").innerText = losecount;
    document.getElementById("musicArea").style.display = "none";
    document.getElementById("countArea").style.display = "none";
    document.getElementById("reset").style.display = "none";

    saveGameState();
};

function changeMusic(event) {
    Object.values(songList).forEach(song => {
        song.pause();
        song.currentTime = 0;
    });

    const selectedValue = event.target.value;
    let bgmText="";
    if (selectedValue !== "stop" && songList[selectedValue]) {
        songList[selectedValue].play();

        if (selectedValue === "bgm1") {
            bgmText = "BGM:musmus";
        }else if (selectedValue === "bgm2") {
            bgmText = "BGM:もみじばミュージック";
        } else if (selectedValue === "hurou" || selectedValue === "hoshikuzu" || selectedValue === "typhoon" || selectedValue === "success" || selectedValue === "revolution") {
            bgmText = "BGM:Losstime Life";
        } else {
            bgmText = "";
        }
    }
    document.getElementById("BGMname").innerText = bgmText;
    document.getElementById("musicArea").style.display = "none";
    document.getElementById("countArea").style.display = "none";
    document.getElementById("reset").style.display = "none";
}

function saveGameState() {
    const state = {
        deck,
        hidden,
        dealerSum,
        yourSum,
        dealerAceCount,
        yourAceCount,
        canHit,
        finish,
        count,
        wincount,
        tiecount,
        losecount,
        dealerCardsList,
        yourCardsList
    };
    localStorage.setItem("blackjackState", JSON.stringify(state));
}

function loadGameState() {
    const data = localStorage.getItem("blackjackState");
    return data ? JSON.parse(data) : null;
}

function renderRestoredGame() {
    document.getElementById("dealer-cards").innerHTML = "";
    document.getElementById("your-cards").innerHTML = "";

    // --- ディーラーのカード描画 ---
    if (dealerCardsList && dealerCardsList.length > 0) {
        dealerCardsList.forEach((card, index) => {
            let img = document.createElement("img");
            // 最初の1枚（伏せ札）かつ、まだ勝負が終わっていない(finish=false)なら裏面
            if (index === 0 && !finish) {
                img.src = "./cards/card_back.png";
                img.id = "hidden";
            } else {
                img.src = "./cards/" + card + ".png";
                if (index === 0) img.id = "hidden"; // 終わっていてもIDは一応付与
            }
            document.getElementById("dealer-cards").append(img);
        });
    }

    // --- プレイヤーのカード描画 ---
    if (yourCardsList && yourCardsList.length > 0) {
        yourCardsList.forEach(card => {
            let img = document.createElement("img");
            img.src = "./cards/" + card + ".png";
            document.getElementById("your-cards").append(img);
        });
    }

    // --- カウント類・合計値の表示 ---
    document.getElementById("count").innerText = count;
    document.getElementById("wincount").innerText = wincount;
    document.getElementById("tiecount").innerText = tiecount;
    document.getElementById("losecount").innerText = losecount;
    document.getElementById("your-sum").innerText = yourSum;

    // ディーラーの合計は、勝負が終わっているときだけ表示（ブラックジャックの通常ルールに合わせる場合）
    // もし最初から数字だけは見せておくスタイルなら、if(finish) の外に出してください
    if (finish) {
        document.getElementById("dealer-sum").innerText = dealerSum;
        
        let message = "";
        if (yourSum > 21) message = "You Lose!(burst)";
        else if (dealerSum > 21) message = "You win!(burst)";
        else if (yourSum == dealerSum) message = "Tie!";
        else if (yourSum > dealerSum) message = "You Win!";
        else message = "You Lose!";

        document.getElementById("results").innerText = message;
    } else {
        document.getElementById("dealer-sum").innerText = ""; 
        document.getElementById("results").innerText = "";
    }
}

function renderRestoredGame() {
    document.getElementById("dealer-cards").innerHTML = "";
    document.getElementById("your-cards").innerHTML = "";

    // --- ディーラーの伏せ札 ---
    let hiddenImg = document.createElement("img");
    hiddenImg.src = finish ? "./cards/" + hidden + ".png" : "./cards/card_back.png";
    hiddenImg.id = "hidden";
    document.getElementById("dealer-cards").append(hiddenImg);

    // --- ディーラーの公開カード ---
    let dealerCards = [];
    let tempSum = dealerSum - getValue(hidden);
    let tempAce = dealerAceCount - checkAce(hidden);

    for (let i = 0; i < deck.length; i++) {
        if (tempSum <= 0) break;
        dealerCards.push(deck[i]);
        tempSum -= getValue(deck[i]);
        tempAce -= checkAce(deck[i]);
    }

    dealerCards.forEach(card => {
        let img = document.createElement("img");
        img.src = "./cards/" + card + ".png";
        document.getElementById("dealer-cards").append(img);
    });

    // --- プレイヤーのカード ---
    let playerCards = [];
    let startIndex = dealerCards.length;
    let tempPlayerSum = yourSum;
    let tempPlayerAce = yourAceCount;

    for (let i = startIndex; i < deck.length; i++) {
        if (tempPlayerSum <= 0) break;
        playerCards.push(deck[i]);
        tempPlayerSum -= getValue(deck[i]);
        tempPlayerAce -= checkAce(deck[i]);
    }

    playerCards.forEach(card => {
        let img = document.createElement("img");
        img.src = "./cards/" + card + ".png";
        document.getElementById("your-cards").append(img);
    });

    // --- カウント類 ---
    document.getElementById("count").innerText = count;
    document.getElementById("wincount").innerText = wincount;
    document.getElementById("tiecount").innerText = tiecount;
    document.getElementById("losecount").innerText = losecount;

    // --- 合計値 ---
    document.getElementById("dealer-sum").innerText = dealerSum;
    document.getElementById("your-sum").innerText = yourSum;

    // --- 結果表示（finish のときだけ） ---
    if (finish) {
        let message = "";
        if (yourSum > 21) message = "You Lose!(burst)";
        else if (dealerSum > 21) message = "You win!(burst)";
        else if (yourSum == dealerSum) message = "Tie!";
        else if (yourSum > dealerSum) message = "You Win!";
        else message = "You Lose!";

        document.getElementById("results").innerText = message;
    }
}
