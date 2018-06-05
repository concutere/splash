import React, {Component} from 'react';
import {Curve} from './Curve.js';

export class Strand extends Component {
  constructor(props) {
    super(props);
    //this.state = props;
    
  }

  componentWillReceiveProps(props) {
    //this.setState(props);
  }

  render() {
    const {id,mode, sweep} = this.props;
    var fill = 'none';
    if(this.props.closed===true) {
      fill='rgba(0,0,0,0.5)';
    }
    var cls = this.props.class || '';
    var pts=this.props.points.slice() || [];
    let swept = sweep && !isNaN(sweep.x) && !isNaN(sweep.y);
    if(mode==='chain') {
      pts = pts.map((v,i,a) => {
        return `${v.x},${v.y}`;
      });
      if(swept) {
        //pts.push(`${n.sweep.x},${n.sweep.y}`);
        cls='selected';
      }
      pts = pts.join(' ');
    }
    else if(mode==='spline') {
      if(swept) {
        let last = pts[pts.length-1];
        if(!(sweep.x === last.x && sweep.y === last.y)) {
          pts.push({'x':sweep.x,'y':sweep.y});
        }
        cls='selected';
      }
      if(pts.length > 3) {
        pts = Curve.chain(pts.map((v)=> [v.x,v.y]));
        if(this.props.closed===true) {
          pts+=` ${this.props.points[1].x},${this.props.points[1].y}`;
        }
      }
      else {
        pts='';
      }
    }
    return <polyline id={`el${id}`} className={cls} points={pts} fill={fill} stroke="black"/>

  }
}