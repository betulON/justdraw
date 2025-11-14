

import React, { useReducer, useRef, useEffect, useState } from 'react';
import './App.css';

// SlideshowView component for hover/arrow logic
function SlideshowView({ state, goPrev, goNext, stopTimer, dispatch }) {
  const [showArrows, setShowArrows] = useState(true);
  const hideTimeout = useRef();

  // Show arrows on mouse move/enter, hide after 2s if timer is running
  const handleMouseMove = () => {
    setShowArrows(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    if (state.timerActive) {
      hideTimeout.current = setTimeout(() => setShowArrows(false), 2000);
    }
  };


  return (
    <div
      style={{marginTop:32, display:'flex', justifyContent:'center', alignItems:'center', position:'relative', minHeight: '80vh'}}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseMove}
    >
      {/* Overlay for focus effect */}
      {state.timerActive && (
        <div style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',background:'rgba(0, 0, 0, 0.7)',zIndex:1, pointerEvents:'none'}}></div>
      )}
      {/* Clock and controls on the left */}
      <div style={{zIndex:2, marginRight:32, flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', minWidth:180}}>
        <AnalogClock seconds={state.timeLeft} />
        <div style={{marginTop:24, display:'flex', flexDirection:'column', alignItems:'center', gap:12}}>
          <div style={{display:'flex', gap:12}}>
            <button onClick={stopTimer} disabled={!state.timerActive} style={{padding:'8px 18px',fontSize:15,borderRadius:8,border:'none',background:!state.timerActive?'#eee':'#f7b801',color:!state.timerActive?'#aaa':'#222',cursor:!state.timerActive?'not-allowed':'pointer'}}>Stop</button>
            <button onClick={() => dispatch({ type: 'START', restart: true })} style={{padding:'8px 18px',fontSize:15,borderRadius:8,border:'none',background:'#87535dff',color:'#fff',cursor:'pointer'}}>Restart</button>
          </div>
          <div style={{color:'#c00', fontWeight:'bold', fontSize:22, letterSpacing:'1px', background:'#fff', borderRadius:8, padding:'2px 16px', marginTop:4, boxShadow:'0 1px 4px #0001'}}>
            {state.timeLeft > 0 ? `${Math.floor(state.timeLeft/60)}:${String(state.timeLeft%60).padStart(2,'0')}` : 'Time is up!'}
          </div>
          <div style={{color:'#888',fontSize:15,marginTop:2}}>Image {state.currentIdx + 1} of {state.images.length}</div>
        </div>
      </div>
      {/* Prev arrow button on left (space always reserved) */}
      <button
        onClick={goPrev}
        disabled={state.currentIdx === 0}
        style={{
          zIndex: 3,
          background: 'none',
          border: 'none',
          fontSize: 48,
          color: '#fff',
          opacity: state.currentIdx === 0 ? 0.3 : 1,
          cursor: state.currentIdx === 0 ? 'not-allowed' : 'pointer',
          marginRight: 16,
          position: 'relative',
          transition: 'opacity 0.3s',
          visibility: showArrows ? 'visible' : 'hidden',
        }}
      >
        &#8592;
      </button>
      {/* Focused image */}
      <div style={{zIndex:4, position:'relative', flex:'1 1 0', display:'flex', justifyContent:'center', alignItems:'center'}}>
        <img src={state.images[state.currentIdx].url} alt={state.images[state.currentIdx].name} style={{maxWidth:'calc(100vw - 320px)', maxHeight:'92vh', objectFit:'contain', position:'relative'}} />
        {/* Overlay for focus effect (clear area) */}
        {state.timerActive && (
          <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,boxShadow:'0 0 0 9999px rgba(0,0,0,0.7)', pointerEvents:'none'}}></div>
        )}
      </div>
      {/* Next arrow button on right (space always reserved) */}
      <button
        onClick={goNext}
        disabled={state.currentIdx === state.images.length - 1}
        style={{
          zIndex: 3,
          background: 'none',
          border: 'none',
          fontSize: 48,
          color: '#fff',
          opacity: state.currentIdx === state.images.length - 1 ? 0.3 : 1,
          cursor: state.currentIdx === state.images.length - 1 ? 'not-allowed' : 'pointer',
          marginLeft: 16,
          position: 'relative',
          transition: 'opacity 0.3s',
          visibility: showArrows ? 'visible' : 'hidden',
        }}
      >
        &#8594;
      </button>
    </div>
  );
}

// AnalogClock component (minute hand only, faded)
function AnalogClock({ seconds }) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const minuteAngle = (secs / 60) * 360;
  let centerNumber = '';
  if (minutes > 0) {
    centerNumber = minutes.toString();
  } else {
    centerNumber = secs.toString();
  }
  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      <circle cx="80" cy="80" r="75" fill="#fff" stroke="#bbb" strokeWidth="4" />
      {/* Minute hand (seconds) */}
      <line x1="80" y1="80" x2="80" y2="28" stroke="#e33" strokeWidth="5" strokeLinecap="round"
        transform={`rotate(${minuteAngle} 80 80)`} opacity="0.35" />
      {/* Center dot */}
      <circle cx="80" cy="80" r="6" fill="#333" />
      {/* Center number */}
      <text x="80" y="95" textAnchor="middle" fontSize="40" fontWeight="bold" fill="#222">{centerNumber}</text>
    </svg>
  );
}

// SlideshowView component for hover/arrow logic


function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const initialState = {
  images: [],
  timers: [],
  started: false,
  currentIdx: 0,
  timeLeft: 0,
  timerActive: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'UPLOAD_IMAGES': {
      return {
        ...state,
        images: action.images,
        timers: action.timers,
        started: false,
        currentIdx: 0,
        timeLeft: 0,
        timerActive: false,
      };
    }
    case 'SET_TIMER': {
      const timers = [...state.timers];
      timers[action.idx] = action.value;
      return { ...state, timers };
    }
    case 'START': {
      // Shuffle images and timers together
        const zipped = state.images.map((img, i) => ({ img, timer: state.timers[i] }));
        const shuffled = shuffleArray(zipped);
        const images = shuffled.map(z => z.img);
        const timers = shuffled.map(z => z.timer);
        return {
          ...state,
          images,
          timers,
          started: true,
          currentIdx: 0,
          timeLeft: timers[0] || 0,
          timerActive: true,
        };
    }
    case 'TICK': {
      if (!state.timerActive || !state.started) return state;
      if (state.timeLeft > 0) {
        return { ...state, timeLeft: state.timeLeft - 1 };
      } else {
        // Time's up, auto-advance if possible
        if (state.currentIdx < state.images.length - 1) {
          return {
            ...state,
            currentIdx: state.currentIdx + 1,
            timeLeft: state.timers[state.currentIdx + 1] || 0,
            timerActive: true,
          };
        } else {
          return { ...state, timerActive: false };
        }
      }
    }
    case 'NEXT': {
      if (state.currentIdx < state.images.length - 1) {
        return {
          ...state,
          currentIdx: state.currentIdx + 1,
          timeLeft: state.timers[state.currentIdx + 1] || 0,
          timerActive: true,
        };
      }
      return state;
    }
    case 'PREV': {
      if (state.currentIdx > 0) {
        return {
          ...state,
          currentIdx: state.currentIdx - 1,
          timeLeft: state.timers[state.currentIdx - 1] || 0,
          timerActive: true,
        };
      }
      return state;
    }
    case 'STOP_TIMER':
      return { ...state, timerActive: false };
    case 'RESTART_TIMER':
        return {
          ...state,
          timeLeft: state.timers[state.currentIdx] || 0,
          timerActive: true,
        };
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const timerRef = useRef();

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name
    }));
    dispatch({ type: 'UPLOAD_IMAGES', images: urls, timers: files.map(() => 60) });
  };

  // Handle timer change
  const handleTimerChange = (idx, value) => {
    dispatch({ type: 'SET_TIMER', idx, value });
  };

  // Shuffle images and start
  const handleStart = () => {
    dispatch({ type: 'START' });
  };

  // Go to next/prev image
  const goNext = () => dispatch({ type: 'NEXT' });
  const goPrev = () => dispatch({ type: 'PREV' });

  // Stop/restart timer
  const stopTimer = () => dispatch({ type: 'STOP_TIMER' });


  // Timer effect
  useEffect(() => {
    if (!state.started || !state.timerActive) return;
    timerRef.current = setTimeout(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearTimeout(timerRef.current);
  }, [state.started, state.timerActive, state.timeLeft]);

  return (
    <div className="container" style={{maxWidth:600,margin:'0 auto',padding:24}}>
      {!state.started && (
        <>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:24}}>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={state.started}
              style={{marginBottom:8}}
            />
            <div className="image-list" style={{display:'flex',flexWrap:'wrap',gap:16,justifyContent:'center'}}>
              {state.images.map((img, idx) => (
                <div key={img.url} className="image-item" style={{display:'flex',flexDirection:'column',alignItems:'center',background:'#f8f8f8',borderRadius:10,padding:8,boxShadow:'0 1px 4px #0001'}}>
                  <img src={img.url} alt={img.name} width={80} height={80} style={{objectFit:'cover',borderRadius:8,marginBottom:6}} />
                  <div style={{fontSize:12,marginBottom:4,maxWidth:80,overflow:'hidden',textOverflow:'ellipsis'}}>{img.name}</div>
                  <label style={{fontSize:13}}>Timer:</label>
                  <select
                    value={state.timers[idx] || 60}
                    onChange={e => handleTimerChange(idx, Number(e.target.value))}
                    disabled={state.started}
                    style={{margin:'4px 0'}}
                  >
                    <option value={30}>30 seconds</option>
                    <option value={60}>1 minute</option>
                    <option value={120}>2 minutes</option>
                    <option value={300}>5 minutes</option>
                    <option value={600}>10 minutes</option>
                  </select>
                  <span style={{marginLeft:4,fontSize:13}}>
                    {state.timers[idx] === 30 && '0:30'}
                    {state.timers[idx] === 60 && '1:00'}
                    {state.timers[idx] === 120 && '2:00'}
                    {state.timers[idx] === 300 && '5:00'}
                    {state.timers[idx] === 600 && '10:00'}
                  </span>
                </div>
              ))}
            </div>
            <button onClick={handleStart} disabled={state.started || state.images.length === 0} style={{marginTop:8,padding:'10px 32px',fontSize:18,borderRadius:8,background:'#753f4eff',color:'#fff',border:'none',boxShadow:'0 2px 8px #0001',cursor:state.started||state.images.length===0?'not-allowed':'pointer',transition:'background 0.2s'}}>
              Start
            </button>
          </div>
        </>
      )}
      {state.started && state.images.length > 0 && (
        <SlideshowView state={state} goPrev={goPrev} goNext={goNext} stopTimer={stopTimer} dispatch={dispatch} />
      )}


    </div>
  );
}

export default App;
