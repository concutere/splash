import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {'mode':'grab','nodes':[]};

    this.setMode = this.setMode.bind(this);
    this.setModeToGrab = this.setModeToGrab.bind(this);
    this.setModeToPoint = this.setModeToPoint.bind(this);
    this.setModeToLine = this.setModeToLine.bind(this);
    this.startClick = this.startClick.bind(this);
    this.endClick = this.endClick.bind(this);

    this.outputSvg = this.outputSvg.bind(this);
  }
 
  render() {
    var details=[];
    if(this.state.mode==='grab' && this.state.detailsIndex >=0 && this.state.detailsIndex < this.state.nodes.length) {
      const node = this.state.nodes[this.state.detailsIndex];
      for (var n in node) {
        console.log(n);
        details.push(<div><div className="detail-label">{`${n}`}</div><div className="detail">{node[n]}</div></div>);
      }
    }

    return (
      <div className="toolgrid">
        <div id="logo"></div>
        <div id="modebox">
          <div id="save" >
            <a id="savelink" download="output.svg" onMouseDown={this.outputSvg} href={this.SvgToUrl()}>SAVE</a>
          </div>
          <div id="grab" onClick={this.setModeToGrab} className={(this.state.mode === 'grab') ? 'selected' : ''}>GRAB</div>
          <div id="point" onClick={this.setModeToPoint} className={(this.state.mode === 'point') ? 'selected' : ''}>POINT</div>
          <div id="line" onClick={this.setModeToLine} className={(this.state.mode === 'line') ? 'selected' : ''}>LINE</div>
        </div>
        <div id="proptop"></div>
        <div id="toolbox">
        </div>
        <div id="output-outer">
          <div className="output-cnt">
            <svg xmlns="http://www.w3.org/2000/svg" id="surface" width="100%" height="100%" preserveAspectRatio="none" onMouseDown={this.startClick} onMouseUp={this.endClick}>
              {this.state.nodes.map((n,i,a) => {
                if(n.mode==='point') { 
                  return <circle id={`el${i}`} cx={n.x} cy={n.y} r="5" fill="red" stroke="transparent"/>
                }
                else if(n.mode==='line') {
                  return <line id={`el${i}`} x1={n.x1} y1={n.y1} x2={n.x2} y2={n.y2} stroke="black" strokeWidth="2" />
                }
              })};
            </svg>
          </div>
        </div>
        <div id="properties">
          <div>DETAILS</div>
          <div className="details">{details}</div>
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

  setModeToGrab() {
    this.setMode('grab');
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
    }
    else if(mode==='line') {
      let nodes = this.state.nodes.slice() || [];
      nodes.push({'mode':'line-part','x1':x,'y1':y});
      this.setState({'nodes':nodes});
    }
    else if(mode==='grab') {
      let id = e.target.id;
      let numpart = id.substr(2);
      if (id.substr(0,2) === 'el') {
        if(isNaN(numpart)) {
          numpart = -1;
        }
        this.setState({'detailsIndex':numpart});
        console.log(numpart);
      }
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
