import React, {Component,Fragment} from 'react';
import Strand from './Strand.js';
import StrandControls from './StrandControls.js';

class Strands extends Component {
  render() {
    return  <Fragment>{this.props.nodes.map((n,i,a) => {
      var cls = '';
      if (this.props.detailsIndex===i) {
        cls= 'selected';
        }
        else if(this.props.detailsIndex===-1 && this.props.mode === 'edit') {
          cls = 'editable';
        }
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
          return <Strand id={i} closed={n.closed===true} points={pts} sweep={n.sweep} mode={n.mode} class={cls} />
        }
      }
    })}
    <StrandControls nodes={this.props.nodes} mode={this.props.mode} detailsIndex={this.props.detailsIndex} />
    </Fragment>
  }
}

export default Strands;