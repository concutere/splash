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
    this.setModeToSpline = this.setModeToSpline.bind(this);

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
                    if(n.mode==='chain') {
                      pts = pts.map((v,i,a) => {
                        return `${v.x},${v.y}`;
                      });
                      if(n.sweep && !isNaN(n.sweep.x) && !isNaN(n.sweep.y)) {
                        pts.push(`${n.sweep.x},${n.sweep.y}`);
                        cls='selected';
                      }
                      pts = pts.join(' ');
                    }
                    else if(n.mode==='spline') {
                      if(n.sweep && !isNaN(n.sweep.x) && !isNaN(n.sweep.y)) {
                        pts.push({'x':n.sweep.x,'y':n.sweep.y});
                        cls='selected';
                      }
                      console.log(pts);
                      pts = App.chain(pts.map((v)=> [v.x,v.y]));
                      console.log(pts);
                    }
                    return <polyline id={`el${i}`} className={cls} points={pts} />
                  }
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
    if (this.state.mode==='chain' || this.state.mode==='spline') {
      let nodes = this.state.nodes.slice() || [];
      let node = nodes.pop();
      if (node && node.sweep) {
        node.sweep=undefined;
      }
      nodes.push(node);
      if(this.state.mode==='chain') {
        nodes.push({'mode':'unchained'});
      }
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

////////////////////////////////
  static spline(P0,P1,P2,P3, size=100) {
    let alpha = 0.5;
    let tj = (ti, Pi, Pj) => {
      let xi = Pi[0];
      let yi = Pi[1];
      let xj = Pj[0];
      let yj = Pj[1];

      return ( ( (xj - xi)**2 + (yj-yi)**2 )**0.5 )**alpha + ti;
    };

    let t0 = 0;
    let t1 = tj(t0, P0, P1);
    let t2 = tj(t1, P1, P2);
    let t3 = tj(t2, P2, P3);

    let ts = [];
    let cs = [];
    for (var i = 0; i < size; i++) {
      const step = i/size;

      const t = step * t2 + (1-step) * t1;

      ts.push(t);
      
      let A1 = ([(t1-t)/(t1-t0)*P0[0] + (t-t0)/(t1-t0)*P1[0], (t1-t)/(t1-t0)*P0[1] + (t-t0)/(t1-t0)*P1[1]]);
      let A2 = ([(t2-t)/(t2-t1)*P1[0] + (t-t1)/(t2-t1)*P2[0], (t2-t)/(t2-t1)*P1[1] + (t-t1)/(t2-t1)*P2[1]]);
      let A3 = ([(t3-t)/(t3-t2)*P2[0] + (t-t2)/(t3-t2)*P3[0], (t3-t)/(t3-t2)*P2[1] + (t-t2)/(t3-t2)*P3[1]]);

      let B1 = ([(t2-t)/(t2-t0)*A1[0] + (t-t0)/(t2-t0)*A2[0], (t2-t)/(t2-t0)*A1[1] + (t-t0)/(t2-t0)*A2[1]]);
      let B2 = ([(t3-t)/(t3-t1)*A2[0] + (t-t1)/(t3-t1)*A3[0], (t3-t)/(t3-t1)*A2[1] + (t-t1)/(t3-t1)*A3[1]]);
    
      let C = ([(t2-t)/(t2-t1)*B1[0] + (t-t1)/(t2-t1)*B2[0], (t2-t)/(t2-t1)*B1[1] + (t-t1)/(t2-t1)*B2[1]]);

      cs.push(C);
    }

    return cs;
  }

  static chain(P, reflectedEnds=false) {
    var pts = [];
    if(reflectedEnds === true) {
      var startdiff = [P[0][0] - P[1][0], P[0][1] - P[1][1]];
      var start = [P[0][0] + startdiff[0], P[0][1] + startdiff[1]];
      pts.push(start);
    }
    P.filter((v,i,a) => i+3 < P.length)
      .forEach((v,i) => {
        pts = pts.concat(this.spline(P[i], P[i+1], P[i+2], P[i+3]));
    });

    if(reflectedEnds === true) {
      var enddiff = [P[P.length-1][0] - P[P.length-2][0], P[P.length-1][1] - P[P.length-2][1]];
      var end = [P[P.length-1][0] + enddiff[0], P[P.length-1][1] + enddiff[1]];
      pts = pts.concat(end);
    }
   
    const ptstr = pts.map((pt) => `${pt[0]},${pt[1]}`).join(' ');

    return ptstr;
  }

  static cat2bez(P0, P1, P2, P3) {
    let alpha = 0.5;
    let tj = (ti, Pi, Pj) => {
      let xi = Pi[0];
      let yi = Pi[1];
      let xj = Pj[0];
      let yj = Pj[1];

      return ( ( (xj - xi)**2 + (yj-yi)**2 )**0.5 )**alpha + ti;
    };

    let t0 = 0;
    let t1 = tj(t0, P0, P1);
    let t2 = tj(t1, P1, P2);
    let t3 = tj(t2, P2, P3);

    let c1 = (t2-t1)/(t2-t0);
    let c2 = (t1-t0)/(t2-t0);
    let d1 = (t3-t2)/(t3-t1);
    let d2 = (t2-t1)/(t3-t1);

    let M1 = [(t2-t1)*(c1*(P1[0]-P0[0])/(t1-t0) + c2*(P2[0]-P1[0])/(t2-t1)), (t2-t1)*(c1*(P1[1]-P0[1])/(t1-t0) + c2*(P2[1]-P1[1])/(t2-t1))];
    let M2 = [(t2-t1)*(d1*(P2[0]-P1[0])/(t2-t1) + d2*(P3[0]-P2[0])/(t3-t2)), (t2-t1)*(d1*(P2[1]-P1[1])/(t2-t1) + d2*(P3[1]-P2[1])/(t3-t2))];

    return [P1, [P1[0] + M1[0]/3,P1[1] + M1[1]/3], [P2[0] - M2[0]/3, P2[1] - M2[1]/3], P2];
  }

}

export default App;
