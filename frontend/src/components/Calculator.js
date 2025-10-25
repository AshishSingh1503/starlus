import React, { useState } from 'react';

function Calculator() {
  const [display, setDisplay] = useState('');

  const appendToDisplay = (value) => {
    setDisplay(prev => prev + value);
  };

  const clearDisplay = () => {
    setDisplay('');
  };

  const deleteLast = () => {
    setDisplay(prev => prev.slice(0, -1));
  };

  const calculate = () => {
    try {
      const result = eval(display);
      setDisplay(result.toString());
    } catch (error) {
      setDisplay('Error');
    }
  };

  return (
    <div className="calculator">
      <input 
        type="text" 
        value={display} 
        readOnly 
        className="calc-display"
      />
      
      <div className="calc-buttons">
        <button onClick={clearDisplay}>C</button>
        <button onClick={() => appendToDisplay('/')}>/</button>
        <button onClick={() => appendToDisplay('*')}>*</button>
        <button onClick={deleteLast}>⌫</button>
        
        <button onClick={() => appendToDisplay('7')}>7</button>
        <button onClick={() => appendToDisplay('8')}>8</button>
        <button onClick={() => appendToDisplay('9')}>9</button>
        <button onClick={() => appendToDisplay('-')}>-</button>
        
        <button onClick={() => appendToDisplay('4')}>4</button>
        <button onClick={() => appendToDisplay('5')}>5</button>
        <button onClick={() => appendToDisplay('6')}>6</button>
        <button onClick={() => appendToDisplay('+')}>+</button>
        
        <button onClick={() => appendToDisplay('1')}>1</button>
        <button onClick={() => appendToDisplay('2')}>2</button>
        <button onClick={() => appendToDisplay('3')}>3</button>
        <button onClick={calculate} className="equals" rowSpan={2}>=</button>
        
        <button onClick={() => appendToDisplay('0')} className="zero">0</button>
        <button onClick={() => appendToDisplay('.')}>.</button>
      </div>
    </div>
  );
}

export default Calculator;