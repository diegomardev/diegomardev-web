import { useState } from 'react'
import './Aspect_Ratio.css'
import Navbar from '../../../../components/Navbar/Navbar'

function Apps() {


  const [ratioWidthInput, setRatioWidthInput] = useState(16);
  const [ratioHeigthInput, setRatioHeigthInput] = useState(9);
  const [pixelsWidthInput, setPixelsWidthInput] = useState(1920);
  const [pixelsHeigthInput, setPixelsHeigthInput] = useState(1080);

  const handleAspectRatioChange = (e) => {
    const selectedAspectRatio = e.target.value.split('/');
    
    setRatioWidthInput(selectedAspectRatio[0]);
    setRatioHeigthInput(selectedAspectRatio[1]);
    setPixelsHeigthInput((pixelsWidthInput * selectedAspectRatio[1]) / selectedAspectRatio[0]);
  }

  const handle_ratioWidthInput = (e) => {
    setRatioWidthInput(e.target.value);
    setPixelsHeigthInput(pixelsWidthInput * ratioHeigthInput / e.target.value);
  }

  const handle_ratioHeigthInput = (e) => {
    setRatioHeigthInput(e.target.value);
    setPixelsHeigthInput(pixelsWidthInput * e.target.value / ratioWidthInput);
  }
  
  const handle_pixelsWidthInput = (e) => {
    setPixelsWidthInput(e.target.value);
    setPixelsHeigthInput(e.target.value * ratioHeigthInput / ratioWidthInput);
  }

  const handle_pixelsHeigthInput = (e) => {
    setPixelsHeigthInput(e.target.value);
    setPixelsWidthInput(e.target.value * ratioWidthInput / ratioHeigthInput);
  }
  return (
    <>
    <div>
      <Navbar/>
    </div>
    <h1 className="read-the-docs">
      Aspect Ratio Calculator
    </h1>
    <div>
      <form>
        <div>
          <span className="span-calculator">Aspect Ratio</span>
          <select
            name="aspect_ratio"
            id="ratio"
            className="select-calculator"
            onChange={(e) => handleAspectRatioChange(e)}
          >
            <option value="16/9">16/9</option>
            <option value="4/3">4/3</option>
            <option value="16/10">16/10</option>
            <option value="21/9">21/9</option>
            <option value="5/4">5/4</option>
          </select>
        </div>
        <div>
          <div className="input-group-calculator">
            <input
              required
              type="number"
              name="text"
              autoComplete="off"
              className="input-calculator"
              value= {ratioWidthInput}
              onChange={(e) => handle_ratioWidthInput(e)}
              //onChange={(e) => setRatioWidthInput(e.target.value)}
              //onKeyDown={(e) => handleKeyPress(e, handleRegister)}
            />
            <label className="user-label-calculator">Ratio Width</label>
          </div>
          <div className="input-group-calculator">
            <input
              required
              type="number"
              name="text"
              autoComplete="off"
              className="input-calculator input-calculator"
              value={ratioHeigthInput}
              onChange={(e) => handle_ratioHeigthInput(e)}
            />
            <label className="user-label-calculator">Ratio Heigth</label>
          </div>
        </div>
        <div>
          <div className="input-group-calculator">
            <input
              required
              type="number"
              name="text"
              autoComplete="off"
              className="input-calculator"
              value={pixelsWidthInput}
              onChange={(e) => handle_pixelsWidthInput(e)}
            />
            <label className="user-label-calculator">Pixels Width</label>
          </div>
          <div className="input-group-calculator">
            <input
              required
              type="number"
              name="text"
              autoComplete="off"
              className="input-calculator"
              value={pixelsHeigthInput}
              onChange={(e) => handle_pixelsHeigthInput(e)}
            />
            <label className="user-label-calculator">Pixels Heigth</label>
          </div>
        </div>
        
      </form>
    </div>
    </>
  )
}

export default Apps