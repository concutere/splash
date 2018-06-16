import React, { Component, Fragment } from 'react';
import './App.css';
import  {Curve} from './Curve.js';
import {Details} from './Details.js';
import {Strand} from './Strand.js';
import Strands from './Strands.js';

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

  handleMove(e) {
    const offX = 175;
    const offY = 75;
    const x = e.clientX - offX;
    const y = e.clientY - offY;
    let nodes = this.state.nodes.slice() || [];

    if (this.state.mode === 'editctl') {
      let node = nodes[this.state.detailsIndex];
      
      if(node && node.points && node.points.length > 0) {
        let ctlid = this.state.ctlid;
        let pts = node.points.slice();
        pts[ctlid] = {'x':x,'y':y};
        node.points = pts;
        nodes[this.state.detailsIndex] = node;
        this.setState({'nodes':nodes});

      }
    }
    else if(this.state.mode === 'edit'){
      if (this.state.detailsIndex > -1 && this.state.moveFrom && (this.state.moveFrom.x !== x || this.state.moveFrom.y !== y)) {
        const dx = x - this.state.moveFrom.x;
        const dy = y - this.state.moveFrom.y;

        //let nodes = this.state.nodes.slice() || [];
        let node = nodes[this.state.detailsIndex];
        //TODO nodes need centralized/inherited transform options
        if(node.mode==='chain' || node.mode==='spline') {
          let pts = node.points.map((pt) => ({x:pt.x+dx, y:pt.y+dy}));
          node.points = pts;
          this.setState({'nodes':nodes});
        }
        this.setState({'moveFrom':{x:x,y:y}});
      }
    }
    else {
      let node = nodes.pop();
      if(node && node.mode === 'line-part') {
        node.x2 = x;
        node.y2 = y;
        nodes.push(node);
        this.setState({'nodes':nodes});
      }
      else if (node && (node.mode ==='chain' || node.mode=== 'spline') && node.points.length > 0) {
        node.sweep={'x':x,'y':y};
        nodes.push(node);
        this.setState({'nodes':nodes});
      }
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
    else if(mode==='chain' || mode==='spline') {
      let nodes = this.state.nodes.slice() || [];
      var node;


      if(nodes.length > 0 && nodes[nodes.length-1].mode===mode) {
        node = nodes.pop();
        node.points.push({'x':x, 'y':y});
      }
      else {
        node = {'mode':mode,'points':[{'x':x, 'y':y}], 'closed':false};
      }
      nodes.push(node);
      this.setState({'nodes':nodes});
    }
    else if(mode==='edit') {
      let id = e.target.id;
      if (id.substr(0,3) === 'ctl') {

        const dblClickOffset = 300;
        let clickedAt = Date.now();
        if (this.state.lastClicked && clickedAt - this.state.lastClicked < dblClickOffset) {
          //console.log('dblclickd');
          let cid = parseInt(id.substr(3));
          //console.log(cid);
          
          var nodes = this.state.nodes.slice();
          var node = nodes[this.state.detailsIndex]
          let pts = node.points.filter((_,i) => i !== cid);
          node.points = pts;
          nodes[this.state.detailsIndex] = node;

          this.setState({'mode':'edit','ctlid':-1, 'lastClicked':clickedAt, 'nodes':nodes});

        }
        else {
          this.setState({'mode':'editctl','ctlid':id.substr(3), 'lastClicked':clickedAt});
        }
      }
      else {
        const dblClickOffset = 300;
        let clickedAt = Date.now();
        if (this.state.lastClicked && clickedAt - this.state.lastClicked < dblClickOffset) {
          let nodes = this.state.nodes.slice() || [];
          var node = nodes[this.state.detailsIndex];
    
          if (node && node.points) {
            //todo optimize from checking full render pts for segment insertion point?
            let ctls = node.points.slice();
            let pts = Curve.chainPts(ctls.map((v) => [v.x,v.y])).map((v) => ({x:v[0], y:v[1]}));
            //console.log(pts);
            var closestPt = pts[pts.length-1];
            var ci = pts.length-1;
            var diff = Math.sqrt(Math.pow(x-closestPt.x,2) + Math.pow(y-closestPt.y,2));

            pts.forEach((p,i) => {
              let d = Math.sqrt(Math.pow(x-p.x,2) + Math.pow(y-p.y,2));
              if (d < diff) {
                closestPt = p;
                ci = i;
                diff = d;
              }
            });
            //console.log(ci, closestPt.x, closestPt.y, diff);
            let pi = Math.ceil(ci / 100) + 1;
            if(pi > 0 && pi < ctls.length) {
              ctls.splice(pi,0,{x:x, y:y});
              node.points = ctls;
              nodes[this.state.detailsIndex] = node;
              this.setState({'nodes':nodes});
            }
            //else console.log(pi);
          }
        }
        else {
          this.setState({'moveFrom':{x:x, y:y}});
        }
        let numpart = id.substr(2);
        if (id.substr(0,2) !== 'el' || isNaN(numpart)) {
          numpart = -1;
        }
        else {
          numpart = parseInt(numpart);
        }
        this.setState({'detailsIndex':numpart,'lastClicked':clickedAt});
      }
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
    else if(mode === 'editctl') {
      let nodes = this.state.nodes.slice();
      let node = this.state.nodes[this.state.detailsIndex];
      const pts = node.points;
      
      if((node.mode === 'spline' && node.points.length >= 3 && (this.state.ctlid == 1 || this.state.ctlid == pts.length - 2)) 
        || (node.mode === 'chain' && node.points.length >= 3 && (this.state.ctlid == 0 || this.state.ctlid == pts.length - 1)))  {
        const ptA = node.mode === 'chain' ? pts[0] : pts[1];
        const ptZ = node.mode === 'chain' ? pts[pts.length-1] : pts[pts.length-2];
        var diff = Curve.dist(ptA, ptZ);
        const ctlw = 5;
        const closed = (diff <= ctlw);
        
        if (closed !== node.closed) {
          node.closed = closed;
          nodes[this.state.detailsIndex] = node;
          this.setState({'nodes':nodes});
        }
      }

      this.setState({'mode':'edit', 'ctlid':-1});
    }
    //TODO refactor move? also used in handleMove ...
    else if(mode === 'edit') {
      this.setState({'moveFrom':undefined});
    }
    else if((mode === 'chain' || mode === 'spline') && this.state.nodes[this.state.nodes.length-1].points.length >= 3) {
      const nodes = this.state.nodes.slice() || [];
      const node = nodes[nodes.length-1];
      const first = node.points[0];
      const second = node.points[1];
      const ctlw = 5;
      const diff = mode === 'chain' ?
                    Curve.dist({x:x, y:y}, first) :
                    Curve.dist({x:x, y:y}, second);
      
      if (diff <= ctlw) {
        node.closed = true;
        if(node.sweep) {
          node.sweep = undefined;
        }
        if(mode==='chain') {
          node.points[node.points.length-1] = node.points[0];
        }
        else if(mode==='spline' && node.points.length >= 3) {
          node.points[node.points.length-1] = node.points[1];
          node.points[0] = node.points[node.points.length-2];
          node.points.push(node.points[2]);
        }
        nodes[nodes.length-1] = node;
        nodes.push({'mode':'unchained'});
        this.setState({'nodes':nodes, 'mode':'edit'});
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
