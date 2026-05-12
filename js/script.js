"use strict";
// @ts-check
import { lexicon } from "../lexicon/lexicon.js";

let x = 0;
let y = 0;
/** @type {string} */let targetWord;
/** @type {string[]} */let targetWordList;
/** @type {number} */let wordLen;
/** @type {number} */let nbTry;
/** @type {HTMLElement} */let keyboard;
/** @type {NodeListOf<HTMLElement>} */let gameEl;
const panelBtn = document.querySelector("#panelBtn");
if (panelBtn) {
    panelBtn.addEventListener("click", play);
}
const ctrl = document.querySelectorAll(".ctrl");
if (ctrl) {
    ctrl.forEach(element => {
        element.addEventListener("click", changeTry);
    });
}
const inNbTry = /** @type {HTMLInputElement} */ (document.querySelector("#nbTry"));
/**
 * 
 * @param {*} event 
 */
function changeTry(event) {
    const action = event.target.textContent;
    const currentValue=parseInt(inNbTry.value);
    switch (action) {
        case "-1":
            (currentValue>1)?inNbTry.value = String(currentValue-1): inNbTry.value = inNbTry.value;
            break;
        case "RESET":
            inNbTry.value = "5";
            break;
        case "+1":
            (currentValue<16)?inNbTry.value = String(currentValue+1): inNbTry.value = inNbTry.value;
            break;

        default:
            console.log("Action non reconnue :", action);
            break;
    }
}
function play() {
    nbTry = parseInt((/** @type {HTMLInputElement} */ (document.querySelector("#nbTry"))).value);
    wordLen = parseInt((/** @type {HTMLInputElement} */ (document.querySelector("#wordLen"))).value);
    const letterElement = document.querySelector(".letter");
    if (letterElement) {
        letterElement.textContent = String(wordLen);
    }
    createGrid(/** @type {HTMLElement} */(document.querySelector("#game")), nbTry, wordLen);
    const panel = /** @type {HTMLElement} */ (document.querySelector(".panel"));
    panel.style.display = "none";
    const theGame = document.querySelector(".theGame");
    if (theGame) {
        theGame.removeAttribute("hidden");
    }
    gameEl = /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll("#game > .row > .tile"));
    keyboard = /** @type {HTMLElement} */ (document.querySelector("body"));
    keyboard.addEventListener("keyup", keyUpHandler);
    const randomWordResult = randomWord(wordLen);
    if (!randomWordResult) {
        console.error(`No target word found for length ${wordLen}`);
        return;
    }
    targetWord = randomWordResult;
    targetWordList = targetWord.split("");
    const game = /** @type {HTMLElement} */ (document.querySelector("#game"));
    game.style.gridTemplateRows = `repeat(${String(nbTry)}, 1fr)`;
    const rows = /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll(".row"));
    rows.forEach((row) => {
        row.style.gridTemplateColumns = `repeat(${String(wordLen)}, 1fr)`;
    });
}
/**
 * 
 * @param {number} x 
 * @param {number} y 
 * @param {string} letter the letter recieved
 */
function setLetter(x, y, letter) {
    let index = x * wordLen + y;
    gameEl[index].textContent = letter.toUpperCase();
    gameEl[index].style.background = "#121213";
    if (index != x * wordLen + wordLen - 1) {
        gameEl[index + 1].style.background = "rgb(129, 131, 132)";
    }
}
/**
 * @param {HTMLElement} game 
 * @param {number} nbTry 
 * @param {number} wordLen 
 */
function createGrid(game, nbTry, wordLen) {
    for (let i = 0; i < nbTry; i++) {
        let row = document.createElement("div");
        row.classList.add("row");
        for (let j = 0; j < wordLen; j++) {
            let tile = document.createElement("div");
            tile.classList.add("tile");
            row.append(tile);
        }
        game.append(row);
    }
}

/**
 * 
 * @param {number} x wich line to delete his last letter
 */
function deleteLast(x) {
    let index = x * wordLen;
    let i = 0;
    for (i = index + wordLen - 1; i >= index; i--) {
        if (gameEl[i].textContent != "") {
            gameEl[i].textContent = "";
            y--;
            gameEl[i + 1].style.background = "#121213";
            gameEl[i].style.background = "rgb(129, 131, 132)";
            break;
        }
    }
}
/**
 * 
 * @param {number} wordLen 
 * @returns 
 */
function randomWord(wordLen) {
    const wordList = lexicon[wordLen];
    if (wordList && wordList.length > 0) {
        const randomIndex = Math.floor(Math.random() * wordList.length);
        console.log(wordList[randomIndex]);
        return wordList[randomIndex];
    }
    console.log("words with the length of [" + wordLen + "] not found");
}
/**
 * 
 * @param {*} e the event needed to know the key that's pressed
 */
function keyUpHandler(e) {
    if (e.code === "Enter" && !isEmptyLine(x) && x != nbTry) {
        const find = checkWord();
        if (find) {
            endGame(true);
        } else {
            if (isWord()) {
                x++
                y = 0;
                if (x == nbTry) {
                    endGame(false);
                }
            }
            else {
                for (let i = x * wordLen; i <= x * wordLen + wordLen - 1; i++) {
                    gameEl[i].style.background = "red";
                }
            }
        }
    }
    if (e.code === "Backspace") {
        for (let i = x * wordLen; i <= x * wordLen + wordLen - 1; i++) {
            gameEl[i].style.background = "#121213";
        }
        deleteLast(x);
    }
    else {
        if (/^[a-zA-Z]$/.test(e.key)) {
            if (y < wordLen) {
                setLetter(x, y, e.key);
            }
            if (y <= wordLen - 1) {
                y++;
            }
        }
    }
}
/**
 * 
 * @param {boolean} find if the word is found
 */
function endGame(find) {
    keyboard.removeEventListener("keyup", keyUpHandler);
    let endOut = /**  @type {HTMLElement}  */ (document.querySelector("#endGame"));
    if (find) {
        endOut.textContent = "Bravo ! Vous avez gagné";
    }
    else {
        endOut.textContent = "Perdu ! Le mot était " + targetWord;
    }

}
function isWord() {
    let word = "";
    for (let i = x * wordLen; i <= x * wordLen + wordLen - 1; i++) {
        word = word + gameEl[i].textContent;
    }
    return lexicon[wordLen].includes(word);
}
/**
 * 
 * @returns if the word is found
 */
function checkWord() {
    let index = x * wordLen;
    let j = 0;
    let find = true;
    let findedWords = [];
    for (let i = index; i < index + wordLen; i++) {
        if (gameEl[i].textContent == targetWordList[j]) {
            gameEl[i].style.backgroundColor = "green";
            findedWords.push(j);
        }
        else {
            find = false
            if (targetWordList.includes(gameEl[i].textContent)) {
                gameEl[i].style.backgroundColor = "orange";
            }
        }
        j++;
    }
    return find;
}
/**
 * 
 * @param {number} x is the number of the line
 * @returns if the line is empty
 */
function isEmptyLine(x) {
    let index = x * wordLen;
    for (let i = index; i < index + wordLen; i++) {
        if (gameEl[i].textContent == "") {
            return true;
        }
    }
    return false;
}