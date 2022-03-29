import React from "react"
import Die from "./Die"
import {nanoid} from "nanoid"
import Confetti from "react-confetti"

export default function App() {
    const obj = JSON.parse(localStorage.getItem("try")) || null;
    const [dice, setDice] = React.useState(allNewDice());
    const [tenzies, setTenzies] = React.useState(false);
    const [rolls, setRolls] = React.useState(0);
    const [seconds, setSeconds] = React.useState(0);
    const [isActive, setIsActive] = React.useState(true);
    const [bestScore, setBestScore] = React.useState(obj || {});

    React.useEffect(() => {
        const allHeld = dice.every(die => die.isHeld)
        const firstValue = dice[0].value
        const allSameValue = dice.every(die => die.value === firstValue)
        if (allHeld && allSameValue) {
            setTenzies(true)
            setIsActive(false)
        }
    }, [dice])
    
    React.useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(seconds => seconds + 1);
            }, 1000);
        } else if (!isActive && seconds !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);
    
    React.useEffect(() => {
        localStorage.setItem("try", JSON.stringify(bestScore))
    }, [bestScore])

    function generateNewDie() {
        return {
            value: Math.ceil(Math.random() * 6),
            isHeld: false,
            id: nanoid()
        }
    }
    
    function allNewDice() {
        const newDice = []
        for (let i = 0; i < 10; i++) {
            newDice.push(generateNewDie())
        }
        return newDice
    }
    
    function rollDice() {
        if(!tenzies) {
            setDice(oldDice => oldDice.map(die => {
                return die.isHeld ? 
                    die :
                    generateNewDie()
            }))
            setRolls(prev => prev + 1)
        } else {
            setIsActive(true)
            setSeconds(0)
            setRolls(0)
            setTenzies(false)
            setDice(allNewDice())
        }
    }
    
    function holdDice(id) {
        setDice(oldDice => oldDice.map(die => {
            return die.id === id ? 
                {...die, isHeld: !die.isHeld} :
                die
        }))
    }
    
    function saveScore() {
        setBestScore({time: seconds, rolls: rolls})
    }
    
    const diceElements = dice.map(die => (
        <Die 
            key={die.id} 
            value={die.value} 
            isHeld={die.isHeld} 
            holdDice={() => holdDice(die.id)}
        />
    ))
    
    return (
        <main>
            {tenzies && <Confetti />}
            <h1 className="title">Tenzies</h1>
            <p className="instructions">Roll until all dice are the same. 
            Click each die to freeze it at its current value between rolls.</p>
            {bestScore && <p className="stats">Saved Score - {bestScore.time}s, {bestScore.rolls} rolls</p>}
            <p className="stats">Game Duration: {seconds}s, Rolls: {rolls}</p>
            <div className="dice-container">
                {diceElements}
            </div>
            <div className="buttons">
                <button 
                    className="roll-dice" 
                    onClick={rollDice}
                >
                    {tenzies ? "New Game" : "Roll"}
                </button>
                {tenzies && <button 
                    className="roll-dice" 
                    onClick={saveScore}
                >
                    Save Score
                </button>}
            </div>
        </main>
    )
}