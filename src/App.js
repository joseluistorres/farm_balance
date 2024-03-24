import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import cheerio from 'cheerio';


import React, { useState, useEffect } from 'react';

const CellTypes = {
  TEXT: 'TEXT',
  NUMBER: 'NUMBER',
  FORMULA: 'FORMULA'
};

const Cell = ({ type, value, onChange }) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleDoubleClick = () => {
    setEditing(true);
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    setEditing(false);
    onChange(inputValue);
  };

  return (
    <td onDoubleClick={handleDoubleClick}>
      {editing ? (
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          autoFocus
        />
      ) : (
        <span>{value}</span>
      )}
    </td>
  );
};

const Spreadsheet = ({ identifiers }) => {
  const [cells, setCells] = useState([
    { type: CellTypes.TEXT, value: 'Grandma' },
    { type: CellTypes.NUMBER, value: '0' },
    { type: CellTypes.NUMBER, value: '115' },
    { type: CellTypes.FORMULA, value: '' }, // Total Acres
    { type: CellTypes.NUMBER, value: '220' },
    { type: CellTypes.NUMBER, value: '80' },
    { type: CellTypes.NUMBER, value: '105' },
    { type: CellTypes.NUMBER, value: '' },
    { type: CellTypes.NUMBER, value: '' },
    { type: CellTypes.NUMBER, value: '95' },
    { type: CellTypes.NUMBER, value: '' },
    { type: CellTypes.NUMBER, value: '49.74' },
    { type: CellTypes.NUMBER, value: '15.34' },
    { type: CellTypes.NUMBER, value: '' },
    { type: CellTypes.NUMBER, value: '35' },
    { type: CellTypes.NUMBER, value: '13' },
    { type: CellTypes.NUMBER, value: '140' },
    { type: CellTypes.NUMBER, value: '25' },
    { type: CellTypes.FORMULA, value: '' },
    { type: CellTypes.TEXT, value: '' },
    { type: CellTypes.TEXT, value: '65' }, // Bu/Ac
    { type: CellTypes.FORMULA, value: '' }, // Bushels
    { type: CellTypes.TEXT, value: '' }, // Price
  ]);

  const handleCellChange = (index, newValue) => {
    const newCells = [...cells];
    newCells[index].value = newValue;
    setCells(newCells);
  };

  useEffect(() => {
    const sum1 = cells.slice(1, 3).reduce((acc, cur) => acc + parseFloat(cur.value), 0);
    handleCellChange(3, sum1.toString());

    const sum3 = cells
      .slice(4, 18) // Slicing from index 4 to 17 to include the specified cells
      .filter(cell => cell.value !== '') // Filtering out empty values
      .reduce((acc, cur) => acc + parseFloat(cur.value), 0); // Summing up the non-empty values

    const roundedSum3 = sum3.toFixed(2); // Round the sum to 2 decimals
    handleCellChange(18, roundedSum3.toString()); // Changing the index to 17 for the last formula cell

    // Formula calculation for the new formula cell
    const value95 = parseFloat(cells[9].value); // Value from the cell above with value 95
    const newValue = isNaN(value95) ? '' : (value95 * -0.8).toString(); // Multiply by -0.8
    handleCellChange(10, newValue);

    // Formula calculation for the new formula cell
    const valueTotalAcres = parseFloat(cells[3].value); // Value from the cell above with value 76
    const valueTotalCosts = parseFloat(cells[18].value); // Value from the cell above with value 76
    
    //  const value95 = parseFloat(cells[10].value); // Value from the cell above with value 95
    const total = isNaN(valueTotalAcres) || isNaN(valueTotalCosts) ? 0 : (valueTotalAcres * valueTotalCosts); // Multiply the values
    const roundedSum4 = total.toFixed(2); // Round the sum to 2 decimals
    handleCellChange(19, roundedSum4);

    const buPerAc = parseFloat(cells[20].value);
    const totalAcres = parseFloat(cells[3].value);
    const bushels = isNaN(buPerAc) || isNaN(totalAcres) ? 0 : (buPerAc * totalAcres);
    handleCellChange(21, bushels.toString());

    // Parsing HTML to get soybeans price and update the last cell
    axios.get('https://adm.gradable.com/market/Des-Moines--IA')
      .then(response => {
        const soybeansPrice = parseHTMLForSoybeansPrice(response.data);
        handleCellChange(23, soybeansPrice);
      })
      .catch(error => {
        console.error('Error fetching soybeans price:', error);
      });
  }, [cells]);

  // Function to parse HTML and extract soybeans price
  const parseHTMLForSoybeansPrice = (html) => {
    const $ = cheerio.load(html);
    const table = $('.ReactTable');
    const firstRow = table.find('.rt-tr').first();
    const soybeansPrice = firstRow.find('.rt-td').eq(2).text().trim();
    // console.log('Soybeans price:', soybeansPrice);
    return soybeansPrice;
  };


  return (
    <table>
      <tbody>
        {cells.map((cell, index) => (
          <tr key={index}>
            <td>{identifiers[index]}</td>
            <Cell
              type={cell.type}
              value={cell.value}
              onChange={(newValue) => handleCellChange(index, newValue)}
            />
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// main app
function App() {
  const identifiers = [
    '',
    'Corn Acres',
    'Bean Acres',
    'Total Acres:',
    'Rent',
    'Seed',
    'Fertilizer',
    '32% and Starter',
    'Anhydrous',
    'Lime',
    'Lime Credit (5 yrs.)',
    'Chemical',
    'Fungicide',
    'Pivot',
    'Crop Insurance',
    'Fungicide Application',	
    'Machinery, Labor, Maintenance', 
    'Interest', 
    'Total Costs:', 
    'Total Revenue:',
    'Bu/Ac',
    'Bushels',
    'Price',
    'Total Income',
    'Net Profit',
    'Net Profit/Acre'
  ];

  return (
    <div className="App">
      <header className="App-header">
        <Spreadsheet identifiers={identifiers} />
      </header>
    </div>
  );
}

export default App;
