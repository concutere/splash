import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {'mode':'edit','nodes':[]};

    this.setMode = this.setMode.bind(this);
    this.setModeToEdit = this.setModeToEdit.bind(this);
    this.setModeToPoint = this.setModeToPoint.bind(this);
    this.setModeToLine = this.setModeToLine.bind(this);
    this.setModeToChain = this.setModeToChain.bind(this);

    this.startClick = this.startClick.bind(this);
    this.endClick = this.endClick.bind(this);
    this.handleMove = this.handleMove.bind(this);

    this.outputSvg = this.outputSvg.bind(this);

    this.undoOne = this.undoOne.bind(this);
    this.undoAll = this.undoAll.bind(this);
  }
 
  render() {
    var details=[];
    if(this.state.mode==='edit' && this.state.detailsIndex >=0 && this.state.detailsIndex < this.state.nodes.length) {
      const node = this.state.nodes[this.state.detailsIndex];
      details.push(<div><div className="detail-label">id</div><div className="detail">{this.state.detailsIndex}</div></div>);
      for (var n in node) {
        if(node.mode === 'chain' && n === 'points') {
          let points = node[n];
          points.forEach((v,i,a) => {
            details.push(
              <div><div className="detail-label">{(i === 0 ? n : '')}</div><div className="detail">{`${v.x},${v.y}`}</div></div>
            );  
          });
          console.log(details);
        }
        else {
          details.push(<div><div className="detail-label">{n}</div><div className="detail">{node[n]}</div></div>);
        }
      }
    }

    return (
      <div className="toolgrid">
        <div id="logo"></div>
        <div id="modebox">
          <div id="save" >
            <a id="savelink" download="output.svg" onMouseDown={this.outputSvg} href={this.SvgToUrl()}>SAVE</a>
          </div>
          <div id="clear" onClick={this.undoAll}>CLEAR</div>
          <div id="undo" onClick={this.undoOne}>UNDO</div>
          <div id="edit" onClick={this.setModeToEdit} className={(this.state.mode === 'edit') ? 'selected' : ''}>EDIT</div>
          <div id="point" onClick={this.setModeToPoint} className={(this.state.mode === 'point') ? 'selected' : ''}>POINT</div>
          <div id="line" onClick={this.setModeToLine} className={(this.state.mode === 'line') ? 'selected' : ''}>LINE</div>
          <div id="chain" onClick={this.setModeToChain} className={(this.state.mode === 'chain') ? 'selected' : ''}>CHAIN</div>
        </div>
        <div id="proptop"></div>
        <div id="toolbox">
        </div>
        <div id="output-outer">
          <div className="output-cnt">
            <svg xmlns="http://www.w3.org/2000/svg" id="surface" width="100%" height="100%" preserveAspectRatio="none" onMouseDown={this.startClick} onMouseUp={this.endClick} onMouseMove={this.handleMove}>
              {this.state.nodes.map((n,i,a) => {
                var cls = (this.state.detailsIndex===i) ? 'selected' : '';
                if(n.mode==='point') { 
                  return <circle id={`el${i}`} cx={n.x} cy={n.y} r="5" fill="red" stroke="transparent" className={cls}/>
                }
                else if(n.mode==='line' 
                  || (n.mode==='line-part' && !isNaN(n.x2) &&!isNaN(n.y2))) {
                  if(n.mode==='line-part') {
                    cls='selected';
                  }
                  return <line id={`el${i}`} x1={n.x1} y1={n.y1} x2={n.x2} y2={n.y2} stroke="black" strokeWidth="2"  className={cls} />
                }
                else if(n.mode==='chain') {
                  let pts = n.points.map((v,i,a) => {
                    return `${v.x},${v.y}`;
                  });
                  if(n.sweep && !isNaN(n.sweep.x) && !isNaN(n.sweep.y)) {
                    pts.push(`${n.sweep.x},${n.sweep.y}`);
                  }

                  return <polyline id={`el${i}`} className={cls} points={pts.join(' ')} />
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
    let state = {'mode':mode};
    if (this.state.mode==='chain') {
      let nodes = this.state.nodes.slice() || [];
      nodes.push({'mode':'unchained'});
      state['nodes']=nodes;
    }
    else if(this.state.mode==='edit' && mode !=='edit') {
      state['detailsIndex']=-1;
    }
    this.setState(state);
  }

  setModeToPoint() {
    this.setMode('point');
  }

  setModeToEdit() {
    this.setMode('edit');
  }

  setModeToLine() {
    this.setMode('line');
  }

  setModeToChain() {
    this.setMode('chain');
  }

  handleMove(e) {
    const offX = 175;
    const offY = 75;
    const x = e.clientX - offX;
    const y = e.clientY - offY;
    let nodes = this.state.nodes.slice() || [];
    let node = nodes.pop();
    if(node && node.mode === 'line-part') {
      node.x2 = x;
      node.y2 = y;
      nodes.push(node);
      this.setState({'nodes':nodes});
    }
    else if (node && node.mode==='chain' && node.points.length > 0) {
      node.sweep={'x':x,'y':y};
      console.log(`setting sweep: ${node.sweep.x},${node.sweep.y}`);
      nodes.push(node);
      this.setState({'nodes':nodes});
    }
  }

  startClick(e) {
    const mode = this.state.mode;
    const offX = 175;
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
    else if(mode==='chain') {
      let nodes = this.state.nodes.slice() || [];
      var node;
      if(nodes.length > 0 && nodes[nodes.length-1].mode==='chain') {
        node = nodes.pop();
        node.points.push({'x':x, 'y':y});
      }
      else {
        node = {'mode':'chain','points':[{'x':x, 'y':y}]};
      }
      nodes.push(node);
      this.setState({'nodes':nodes});
    }
    else if(mode==='edit') {
      let id = e.target.id;
      let numpart = id.substr(2);
      if (id.substr(0,2) !== 'el' || isNaN(numpart)) {
        numpart = -1;
      }
      else {
        numpart = parseInt(numpart);
      }
      this.setState({'detailsIndex':numpart});
    }
  }

  endClick(e) {
    const mode = this.state.mode;
    const offX = 175;
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
    /*else if(mode==='chain') {
      let nodes = this.state.nodes.slice();
      if (nodes.length > 0) {
        let node = nodes.pop();
        if(node.mode==='chain') {
          node.points.push({'x':x,'y':y});
          nodes.push(node);
          this.setState({'nodes':nodes});
        }
      }
    }*/
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

  //TODO refactor to use a commands/changes list rather than output list? when refactoring properties?
  undoOne() {
    let nodes = this.state.nodes.slice() || [];
    if(nodes.length > 0) {
      let removed = nodes.pop();
      this.setState({'nodes':nodes});
    }
  }

  undoAll() {
    this.setState({'nodes':[]});
  }
}

export default App;
