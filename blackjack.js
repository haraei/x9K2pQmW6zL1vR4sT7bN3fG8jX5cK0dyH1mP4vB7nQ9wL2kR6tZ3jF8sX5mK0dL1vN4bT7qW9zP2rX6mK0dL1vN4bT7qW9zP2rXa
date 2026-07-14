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

const BGM1 = new Audio("music/kyuuketukihakikaizikakenosyoujonikoiwosuru.mp3");
BGM1.loop = true;

const BGM2 = new Audio("music/kazinonohitotoki.mp3");
BGM2.loop = true;

const hurouhusi = new Audio("music/hurouhusi.mp3");
hurouhusi.loop = true;

const hosikuzusaraundo = new Audio("music/hosikuzusaraundo.mp3");
hosikuzusaraundo.loop = true;

const taihunparedo = new Audio("music/taihunparedo.mp3");
taihunparedo.loop = true;

const Success = new Audio("music/Success.mp3");
Success.loop = true;

const itipasenntonokakumeizenya = new Audio("music/itpasentonokakumeizenya.mp3");
itipasenntonokakumeizenya.loop = true;

window.onload = function() {
    let sitePassword = prompt("パスワードを入力してください");
    if (sitePassword !== "tachifes") { 
        alert("馬鹿がよ");
        const insults = [
        "IQより入力回数の方が多そう",
        "知識0、根拠0、自信100",
        "自信満々で不正解",
        "記憶力404 Not Found",
        "入力欄に遊ばれてる",
        "勘認証",
        "Human authentication failed.",
        "ログイン画面 1 - 0 お前",
        "パスワードに不審者扱いされてて草",
        "その入力、記憶じゃなくて幻覚",
        "実力で外してる",
        "全部違うの逆に才能",
        "サイト『お前誰だよ』",
        "バーカ<br>by高火田",
        "もしかしてハッカーにあこがれているのかな<br>by森コーチ"
        ];
        const msg = insults[Math.floor(Math.random() * insults.length)];
        document.body.innerHTML = `<h2>${msg}</h2>`;
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

    // ディーラーの1枚目（伏せ札）
    hidden = deck.pop();
    dealerCardsList.push(hidden);

    let hiddenImg = document.createElement("img");
    hiddenImg.src = "./cards/card_back.png";
    hiddenImg.id = "hidden";
    document.getElementById("dealer-cards").append(hiddenImg);
    dealerSum += getValue(hidden);
    dealerAceCount += checkAce(hidden);

    // ディーラーが17点以上になるまで引く（※yourCardsList.pushを削除しました）
    while (dealerSum < 17) {
        let cardImg = document.createElement("img");
        let card = deck.pop();
        dealerCardsList.push(card);
        cardImg.src = "./cards/" + card + ".png";
        dealerSum += getValue(card);
        dealerAceCount += checkAce(card);
        document.getElementById("dealer-cards").append(cardImg);
    }
    console.log("Dealer Initial Sum: " + dealerSum);

    // プレイヤーに最初の2枚を配る（※ここできちんと yourCardsList に追加します）
    for (let i = 0; i < 2; i++) {
        let cardImg = document.createElement("img");
        let card = deck.pop();
        yourCardsList.push(card); // ★超重要！これで手札リストに保存されます
        cardImg.src = "./cards/" + card + ".png";
        document.getElementById("your-cards").append(cardImg);
    }

    // 最初に配られた2枚の時点で、エースの調整を含めて正しく計算する
    yourSum = 0;
    yourAceCount = 0;
    for (let i = 0; i < yourCardsList.length; i++) {
        yourSum += getValue(yourCardsList[i]);
        yourAceCount += checkAce(yourCardsList[i]);
    }
    yourSum = reduceAce(yourSum, yourAceCount);

    console.log("Your Initial Sum: " + yourSum);

    document.getElementById("your-sum").innerText = yourSum;
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

function hit() {
    if (!canHit) {
        return;
    }

    let cardImg = document.createElement("img");
    let card = deck.pop();
    yourCardsList.push(card); // 手札リストにカードを追加
    cardImg.src = "./cards/" + card + ".png";
    document.getElementById("your-cards").append(cardImg);

    yourSum = 0;
    yourAceCount = 0;
    for (let i = 0; i < yourCardsList.length; i++) {
        yourSum += getValue(yourCardsList[i]);
        yourAceCount += checkAce(yourCardsList[i]);
    }

    yourSum = reduceAce(yourSum, yourAceCount);

    document.getElementById("your-sum").innerText = yourSum;

    if (yourSum > 21) { 
        canHit = false;
        stay();
    }

    saveGameState();
}
function stay() {
    if (finish) {
        return;
    }
    dealerSum = reduceAce(dealerSum, dealerAceCount);

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
    hurou: hurouhusi,
    hoshikuzu: hosikuzusaraundo,
    typhoon: taihunparedo,
    success: Success,
    revolution: itipasenntonokakumeizenya
};

function music() {
    let ps = prompt("パスワードを入力してください");
    if (ps === "HARAEI") {
        document.getElementById("musicArea").style.display = "block";
        document.getElementById("countArea").style.display = "block";
        document.getElementById("reset").style.display = "block";
    }else {
        alert("あほなのかな？");
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

// 右クリック禁止
document.addEventListener('contextmenu', e => e.preventDefault());

// F12やCtrl+Shift+Iなどの禁止
document.addEventListener('keydown', e => {
  if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
    e.preventDefault();
  }
});

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
