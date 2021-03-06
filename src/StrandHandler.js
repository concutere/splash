import {Curve} from './Curve.js';

export default class StrandHandler {
  static editControl(x, y, nodes, id, ctlid) {
    let node = nodes[id];
    
    if(node && node.points && node.points.length > 0) {
      node = Object.assign({}, node);
      let pts = node.points.map((pt) => Object.assign({}, pt));
      pts[ctlid] = {'x':x,'y':y};
      node.points = pts;
      nodes = [...nodes.slice(0,id),
                node,
                ...nodes.slice(id+1)];
      
      return {'nodes':nodes};
    }
    else {
      return { };
    }
  }

  static editMove(to, from, nodes, id) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    let node = Object.assign({},nodes[id]);
    //TODO centralize node.points transform options?
    if(node.mode==='chain' || node.mode==='spline') {
      let pts = node.points.map((pt) => ({x:pt.x+dx, y:pt.y+dy}));
      node.points = pts;
      nodes = [...nodes.slice(0,id),
        node,
        ...nodes.slice(id+1)];
return {'nodes':nodes, 'moveFrom':{x:to.x, y:to.y}};
    }
    else {
      return {'moveFrom':{x:to.x,y:to.y}};
    }
  }

  static addToChain(x, y, nodes, mode) {
    var state;

    if(nodes.length > 0 && nodes[nodes.length-1].mode===mode) {
      let node = Object.assign({},nodes[nodes.length-1]);
      node.points = [...node.points.map((pt) => Object.assign({}, pt)), {'x':x, 'y':y}];
      state = {'nodes': [...nodes.slice(0,nodes.length-1), node]};
    }
    else {
      //TODO refactor node object/constructor?
      let node = {'mode':mode,'points':[{'x':x, 'y':y}], 'closed':false};
      state = {'nodes': [...nodes.map((n) => Object.assign({}, n)), node]}
    }

    return state;
  }

  static doubleClickEditControl(id, lastClicked, nodes, nodeid) {
    const dblClickOffset = 300;
    let clickedAt = Date.now();
    if (lastClicked && clickedAt - lastClicked < dblClickOffset) {
      clickedAt = undefined;
      let cid = parseInt(id.substr(3));
      
      //var nodes = nodes.slice();
      var node = Object.assign({},nodes[nodeid]);
      let pts = node.points.filter((_,i) => i !== cid).map((pt) => Object.assign({}, pt));
      node.points = pts;
      nodes = [...nodes.slice(0,nodeid), 
                node,
                ...nodes.slice(nodeid+1)];

      return ({'mode':'edit','ctlid':-1, 'lastClicked':clickedAt, 'nodes':nodes});

    }
    else {
      return ({'mode':'editctl','ctlid':id.substr(3), 'lastClicked':clickedAt});
    }
  }

  static endClickEditControl(ctlid, lastClicked, nodes, nodeid) {
    let node = nodes[nodeid];
    const pts = node.points;
    
    if((node.mode === 'spline' && node.points.length >= 3 && (ctlid == 1 || ctlid == pts.length - 2)) 
      || (node.mode === 'chain' && node.points.length >= 3 && (ctlid == 0 || ctlid == pts.length - 1)))  {
      const ptA = node.mode === 'chain' ? pts[0] : pts[1];
      const ptZ = node.mode === 'chain' ? pts[pts.length-1] : pts[pts.length-2];
      var diff = Curve.dist(ptA, ptZ);
      const ctlw = 5;
      const closed = (diff <= ctlw);
      
      if (closed !== node.closed) {
        node = Object.assign({}, node);
        node.closed = closed;
        nodes = [...nodes.slice(0,nodeid,),
                  node,
                  ...nodes.slice(nodeid+1)];
      }
    }

    return ({'mode':'edit', 'ctlid':-1, 'nodes':nodes});
  
  }

  static onClickEdit(id, x, y, lastClicked, nodes, nodeid) {
    const dblClickOffset = 300;
    let clickedAt = Date.now();
    var moveFrom;
    if (lastClicked && clickedAt - lastClicked < dblClickOffset) {
      clickedAt = undefined;
      var node = Object.assign({}, nodes[nodeid]);

      if (node && node.points) {
        //todo optimize from checking full render pts for segment insertion point?
        let ctls = node.points.map((pt) => Object.assign({}, pt));
        let pts = Curve.chainPts(ctls.map((v) => [v.x,v.y])).map((v) => ({x:v[0], y:v[1]}));
        var closestPt = pts[pts.length-1];
        var ci = pts.length-1;
        var diff = Curve.dist({x, y}, closestPt); //Math.sqrt(Math.pow(x-closestPt.x,2) + Math.pow(y-closestPt.y,2));

        pts.forEach((p,i) => {
          let d = Curve.dist({x, y}, p); //Math.sqrt(Math.pow(x-p.x,2) + Math.pow(y-p.y,2));
          if (d < diff) {
            closestPt = p;
            ci = i;
            diff = d;
          }
        });
        let pi = Math.ceil(ci / 100) + 1;
        if(pi > 0 && pi < ctls.length) {
          ctls.splice(pi,0,{x:x, y:y});
          node.points = ctls;
          nodes = [...nodes.slice(0, nodeid),
                    node,
                    ...nodes.slice(nodeid+1)];
          //this.setState({'nodes':nodes, 'lastClicked':undefined});
        }
      }
    }
    else {
      //set initial point for editMove
      //this.setState({'moveFrom':{x:x, y:y}});
      moveFrom = {x:x, y:y};
    }
    let numpart = id.substr(2);
    if (id.substr(0,2) !== 'el' || isNaN(numpart)) {
      numpart = -1;
    }
    else {
      numpart = parseInt(numpart);
    }
    return ({'detailsIndex':numpart,'lastClicked':clickedAt, 'nodes':nodes, 'moveFrom':moveFrom });
  }

  static endChain(x, y, mode, nodes, nodeid) {
    if(nodes[nodes.length-1].points.length >= 3) {
      let node = nodes[nodes.length-1];
      const first = node.points[0];
      const second = node.points[1];
      const ctlw = 5;
      const diff = mode === 'chain' ?
                    Curve.dist({x:x, y:y}, first) :
                    Curve.dist({x:x, y:y}, second);
      
      if (diff <= ctlw) {
        node = Object.assign({}, node);
        node.points = node.points.map((pt) => Object.assign({}, pt));
        node.closed = true;
        if(node.sweep) {
          node.sweep = undefined;
        }
        if(mode==='chain') {
          node.points[node.points.length-1] = node.points[0];
        }
        else if(mode==='spline' && node.points.length >= 3) {
          const A = node.points[node.points.length-2];
          const B = node.points[1];
          const C = node.points[2];

          node.points[0] = A;
          node.points[node.points.length-1] = B;
          node.points.push(C);
        }
        nodes = [...nodes.slice(0,nodes.length-1),
                  node,
                  {'mode':'unchained'}];
        
        return({'nodes':nodes, 'mode':'edit'});
      }
    }
  }
}