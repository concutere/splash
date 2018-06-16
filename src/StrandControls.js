import React, {Component,Fragment} from 'react';
import {Curve} from './Curve.js';

class StrandControls extends Component {

  render() {
    return <g id="controls">
    {
        this.props.nodes.filter((n,i,a) => n !== undefined && ['spline','chain'].includes(n.mode) && ( i === this.props.detailsIndex || (n.sweep && !isNaN(n.sweep.x) && !isNaN(n.sweep.y))))
          .map((n) => n.points.map((pt,pi) => {
              return <rect id={`ctl${pi}`} x={pt.x-2.5} y={pt.y-2.5} width={5} height={5} fill="white" stroke="orangered" strokeWidth="0.5" />
            }))
      }
      {
        this.props.nodes.filter((n,i,a) => n !== undefined && ['spline'].includes(n.mode) && n.points.length > 1 && (n.sweep && !isNaN(n.sweep.x) && !isNaN(n.sweep.y)))
          .map((n) => 
              <polyline id="sweepline" points={Curve.chain(n.points.filter((n,i,a) => i >= a.length-2).concat([n.sweep]).map((v) => [v.x, v.y]), true)}  fill="none" stroke="orangered" strokeWidth="0.5" strokeDasharray="5, 5" />
            )
      }
      {
        this.props.nodes.filter((n,i,a) => n !== undefined && ['chain'].includes(n.mode) && n.points.length > 0 && (n.sweep && !isNaN(n.sweep.x) && !isNaN(n.sweep.y)))
          .map((n) => 
              <line id="sweepline" x1={n.points[n.points.length-1].x} y1={n.points[n.points.length-1].y} x2={n.sweep.x} y2={n.sweep.y} fill="none" stroke="orangered" strokeWidth="0.5" strokeDasharray="5, 5" />
            )
      }
    </g>
  }
}

export default StrandControls;