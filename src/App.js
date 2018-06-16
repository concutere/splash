import React, { Component, Fragment } from 'react';
import './App.css';
import  {Curve} from './Curve.js';
import {Details} from './Details.js';
import {Strand} from './Strand.js';
import Strands from './Strands.js';
import StrandHandler from './StrandHandler.js';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {'mode':'edit','nodes':[], 'lastClicked':-1};

    this.setMode = this.setMode.bind(this);
    this.setModeToEdit = this.setModeToEdit.bind(this);
    this.setModeToPoint = this.setModeToPoint.bind(this);
    this.setModeToLine = this.setModeToLine.bind(this);
    this.setModeToChain = this.setModeToChain.bind(this);
    this.setModeToSpline = this.setModeToSpline.bind(this);

    this.startClick = this.startClick.bind(this);
    this.endClick = this.endClick.bind(this);
    this.handleMove = this.handleMove.bind(this);

    this.outputSvg = this.outputSvg.bind(this);

    this.undoOne = this.undoOne.bind(this);
    this.undoAll = this.undoAll.bind(this);
  }
 
  render() {
    let node = (this.state.detailsIndex > -1 && this.state.nodes.length > this.state.detailsIndex) ?
                this.state.nodes[this.state.detailsIndex] :
                undefined;

    let id = this.state.detailsIndex;

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
          <div id="chain" onClick={this.setModeToChain} className={(this.state.mode === 'chain') ? 'selected' : ''}>CHAIN</div>
          <div id="spline" onClick={this.setModeToSpline} className={(this.state.mode === 'spline') ? 'selected' : ''}>SPLINE</div>
        </div>
        <div id="proptop"></div>
        <div id="toolbox">
        </div>
        <div id="output-outer">
          <div className="output-cnt">
            <svg xmlns="http://www.w3.org/2000/svg" id="surface" width="100%" height="100%" preserveAspectRatio="none" onMouseDown={this.startClick} onMouseUp={this.endClick} onMouseMove={this.handleMove}>
              <Strands nodes={this.state.nodes} detailsIndex={this.state.detailsIndex} mode={this.state.mode} />
            </svg>
          </div>
        </div>
        <div id="properties">
          <Details node={node} id={id} />
        </div>
        
      </div>
    );
  }

  setMode(mode) {
    let state = {'mode':mode};
    if (this.state.mode==='chain' || this.state.mode==='spline') {
      let nodes = this.state.nodes.slice() || [];
      let node = nodes.pop();
      if (node && node.sweep) {
        node.sweep=undefined;
      }
      nodes.push(node);
      //if(this.state.mode==='chain') {
        nodes.push({'mode':'unchained'});
      //}
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

  setModeToSpline() {
    this.setMode('spline');
  }

  hasMoved(x, y) {
    return this.state.detailsIndex > -1 && this.state.moveFrom && (this.state.moveFrom.x !== x || this.state.moveFrom.y !== y);
  }

  handleMove(e) {
    const offX = 175;
    const offY = 75;
    const x = e.clientX - offX;
    const y = e.clientY - offY;
    let nodes = this.state.nodes.slice() || [];

    if (this.state.mode === 'editctl') {
      this.setState(
        StrandHandler.editControl(x, y, nodes, this.state.detailsIndex, this.state.ctlid)
      );
    }
    else if(this.state.mode === 'edit') {
      if (this.hasMoved(x, y)) {
        this.setState(
          StrandHandler.editMove({x, y}, this.state.moveFrom, nodes, this.state.detailsIndex)
        );
      }
    }
    else if(nodes.length > 0) {
      let node = nodes.pop();
      /*if(node && node.mode === 'line-part') {
        node.x2 = x;
        node.y2 = y;
        nodes.push(node);
        this.setState({'nodes':nodes});
      }
      else if (node && (node.mode ==='chain' || node.mode=== 'spline') && node.points.length > 0) {
      */  
      node.sweep={'x':x,'y':y};
      nodes.push(node);
      this.setState({'nodes':nodes});
      //}
    }
  }

  startClick(e) {
    const mode = this.state.mode;
    const offX = 175;
    const offY = 75;
    const x = e.clientX - offX;
    const y= e.clientY  - offY;
    /*if(mode === 'point') {
      let nodes = this.state.nodes.slice() || [];
      nodes.push({'mode':'point','x':x,'y':y});
      this.setState({'nodes':nodes});
    }
    else if(mode==='line') {
      let nodes = this.state.nodes.slice() || [];
      nodes.push({'mode':'line-part','x1':x,'y1':y});
      this.setState({'nodes':nodes});
    }
    else*/ if(mode==='chain' || mode==='spline') {
      let nodes = this.state.nodes.slice() || [];
      this.setState(
        StrandHandler.addToChain(x, y, nodes, mode)
      );
    }
    else if(mode==='edit') {
      let id = e.target.id;
      if (id.substr(0,3) === 'ctl') {
        this.setState(
          StrandHandler.doubleClickEditControl(id, this.state.lastClicked, this.state.nodes.slice() || [], this.state.detailsIndex)
        );

      }
      else {
        this.setState(
          StrandHandler.onClickEdit(id, x, y, this.state.lastClicked, this.state.nodes.slice() || [], this.state.detailsIndex)
        );
      }
    }
  }

  endClick(e) {
    const mode = this.state.mode;
    const offX = 175;
    const offY = 75;
    const x = e.clientX - offX;
    const y = e.clientY - offY;

    /*if(mode === 'line') {
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
    else*/ if(mode === 'editctl') {
      this.setState(
        StrandHandler.endClickEditControl(this.state.ctlid, this.state.lastClicked, this.state.nodes.slice() || [], this.state.detailsIndex)
      );
    }
    //TODO refactor move? also used in handleMove ...
    else if(mode === 'edit') {
      this.setState({'moveFrom':undefined});
    }
    else if((mode === 'chain' || mode === 'spline')) {
      this.setState(
        StrandHandler.endChain(x, y, mode, this.state.nodes, this.state.detailsIndex)
      );
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

////////////////////////////////
}

export default App;
