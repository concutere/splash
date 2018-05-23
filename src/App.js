import React, { Component } from 'react';
import './App.css';
import  {Curve} from './Curve.js';
import {Details} from './Details.js';

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
          <div id="point" onClick={this.setModeToPoint} className={(this.state.mode === 'point') ? 'selected' : ''}>POINT</div>
          <div id="line" onClick={this.setModeToLine} className={(this.state.mode === 'line') ? 'selected' : ''}>LINE</div>
          <div id="chain" onClick={this.setModeToChain} className={(this.state.mode === 'chain') ? 'selected' : ''}>CHAIN</div>
          <div id="spline" onClick={this.setModeToSpline} className={(this.state.mode === 'spline') ? 'selected' : ''}>SPLINE</div>
        </div>
        <div id="proptop"></div>
        <div id="toolbox">
        </div>
        <div id="output-outer">
          <div className="output-cnt">
            <svg xmlns="http://www.w3.org/2000/svg" id="surface" width="100%" height="100%" preserveAspectRatio="none" onMouseDown={this.startClick} onMouseUp={this.endClick} onMouseMove={this.handleMove}>
              {this.state.nodes.map((n,i,a) => {
                var cls = (this.state.detailsIndex===i) ? 'selected' : '';
                if(n){
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
                  else if(n.mode==='chain' || n.mode==='spline') {
                    var pts=n.points.slice() || [];
                    let swept = n.sweep && !isNaN(n.sweep.x) && !isNaN(n.sweep.y);
                    if(n.mode==='chain') {
                      pts = pts.map((v,i,a) => {
                        return `${v.x},${v.y}`;
                      });
                      if(swept) {
                        pts.push(`${n.sweep.x},${n.sweep.y}`);
                        cls='selected';
                      }
                      pts = pts.join(' ');
                    }
                    else if(n.mode==='spline') {
                      if(swept) {
                        let last = n.points[n.points.length-1];
                        if(!(n.sweep.x === last.x && n.sweep.y === last.y)) {
                          pts.push({'x':n.sweep.x,'y':n.sweep.y});
                        }
                        cls='selected';
                      }
                      if(pts.length > 3) {
                        pts = Curve.chain(pts.map((v)=> [v.x,v.y]), swept);
                      }
                      else {
                        pts='';
                      }
                    }
                    return <polyline id={`el${i}`} className={cls} points={pts} fill="none" stroke="black"/>
                  }
                }
              })}
              <g id="controls">
                {
                  this.state.nodes.filter((n,i,a) => n !== undefined && ['spline','chain'].includes(n.mode) && ( i === this.state.detailsIndex || (n.sweep && !isNaN(n.sweep.x) && !isNaN(n.sweep.y))))
                    .map((n) => n.points.map((pt,pi) => {
                        return <rect id={`ctl${pi}`} x={pt.x-1.75} y={pt.y-1.75} width={3.5} height={3.5} fill="white" stroke="orangered" strokeWidth="0.5" />
                      }))
                }
              </g>
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
        node = {'mode':mode,'points':[{'x':x, 'y':y}]};
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
          console.log('dblclickd');
          let cid = parseInt(id.substr(3));
          console.log(cid);
          
          var nodes = this.state.nodes.slice();
          var node = nodes[this.state.detailsIndex]
          console.log(node);
          let pts = node.points.filter((_,i) => i !== cid);
          console.log(pts);
          node.points = pts;
          nodes[this.state.detailsIndex] = node;
          console.log(nodes);

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
            //todo find correct segment to insert new control point
            //current naive least distance approach has too many false positives
            let pts = node.points.slice();
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
            console.log(ci, closestPt.x, closestPt.y, diff);
            var nextPt;
            if(ci <= 0) {
              nextPt = pts[1];
            } 
            else if(ci >= pts.length-1) {
              nextPt = pts[pts.length-2];
            }
            else {
              let d1 = Math.sqrt(Math.pow(pts[ci-1].x-x,2) + Math.pow(pts[ci-1].y-y,2));
              let d2 = Math.sqrt(Math.pow(pts[ci+1].x-x,2) + Math.pow(pts[ci+1].y-y,2));
              if(d1 < d2) {
                ci--;
              }
              pts.splice(ci,0,{x:x, y:y});
              node.points = pts;
              nodes[this.state.detailsIndex] = node;
              this.setState({'nodes':nodes});
            }

          }
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
      this.setState({'mode':'edit', 'ctlid':-1});
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

////////////////////////////////
}

export default App;
