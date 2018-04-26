import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {'mode':'drag','nodes':[]};

    this.setMode = this.setMode.bind(this);
    this.setModeToPoint = this.setModeToPoint.bind(this);
    this.setModeToLine = this.setModeToLine.bind(this);
    this.startClick = this.startClick.bind(this);
    this.endClick = this.endClick.bind(this);

    this.outputSvg = this.outputSvg.bind(this);
  }
 
  render() {

    return (
      <div className="toolgrid">
        <div id="logo"></div>
        <div id="modebox">
          <div id="save" >
            <a id="savelink" download="output.svg" onMouseDown={this.outputSvg} href={this.SvgToUrl()}>SAVE</a>
          </div>
          <div id="point" onClick={this.setModeToPoint} className={(this.mode === 'point') ? '.selected' : ''}>POINT</div>
          <div id="line" onClick={this.setModeToLine}>LINE</div>
        </div>
        <div id="proptop"></div>
        <div id="toolbox">
        </div>
        <div id="output-outer">
          <div className="output-cnt">
            <svg xmlns="http://www.w3.org/2000/svg" id="surface" width="100%" height="100%" preserveAspectRatio="none" onMouseDown={this.startClick} onMouseUp={this.endClick}>
              {this.state.nodes.map((n,i,a) => {
                if(n.mode==='point') { 
                  return <circle cx={n.x} cy={n.y} r="5" fill="red" stroke="transparent"/>
                }
                else if(n.mode==='line') {
                  return <line x1={n.x1} y1={n.y1} x2={n.x2} y2={n.y2} stroke="black" strokeWidth="2" />
                }
              })};
            </svg>
          </div>
        </div>
      </div>
    );
  }

  setMode(mode) {
    this.setState({'mode':mode});
  }

  setModeToPoint() {
    this.setMode('point');
  }

  setModeToLine() {
    this.setMode('line');
  }

  startClick(e) {
    const mode = this.state.mode;
    const offX = 125;
    const offY = 75;
    const x = e.clientX - offX;
    const y= e.clientY  - offY;
    if(mode === 'point') {
      let nodes = this.state.nodes.slice() || [];
      nodes.push({'mode':'point','x':x,'y':y});
      this.setState({'nodes':nodes});
      console.log('pointing');
    }
    else if(mode==='line') {
      let nodes = this.state.nodes.slice() || [];
      nodes.push({'mode':'line-part','x1':x,'y1':y});
      this.setState({'nodes':nodes});
    }
  }

  endClick(e) {
    const mode = this.state.mode;
    const offX = 125;
    const offY = 75;
    const x = e.clientX - offX;
    const y = e.clientY - offY;
    if(mode === 'line') {
      let nodes = this.state.nodes;
      let node = nodes.pop();
      if(node.mode ==='line-part') {
        node.mode = 'line';
        node.x2 = x;
        node.y2 = y;
        nodes.push(node);
        this.setState({'nodes':nodes});
      }
    }
  }

  outputSvg() {
    const link = document.getElementById('savelink');
    if(link) {
      link.href = this.SvgToUrl();
      return link.href;
    }
  }

  SvgToUrl() {
    const surface = document.getElementById('surface'); 
    if(surface !== null && surface !== undefined) {
      var svgData = surface.outerHTML;
      var svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
      return URL.createObjectURL(svgBlob);
    }
  }
}

export default App;
