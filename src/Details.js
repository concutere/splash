import React,{Component, Fragment} from 'react';

export class Details extends Component {
  constructor(props) {
    super(props);
    this.state = {node:null, id:-1};
  }

  componentWillReceiveProps(props) {
    let node = props.node;
    let id = props.id;

    this.setState(props);
  }

  render() {
    var details=[];
    let {node, id} = this.state;
    if(node && id > -1) {
      details.push(<div><div className="detail-label">id</div><div className="detail">{this.state.detailsIndex}</div></div>);
      for (var n in node) {
        if((node.mode === 'chain' || node.mode === 'spline') && n === 'points') {
          let points = node[n];
          points.forEach((v,i,a) => {
            details.push(
              <div><div className="detail-label">{(i === 0 ? n : '')}</div><div className="detail">{`${v.x},${v.y}`}</div></div>
            );  
          });
        }
        else {
          const val = node[n] || '';
          console.log(n,val);
          details.push(<div><div className="detail-label">{n}</div><div className="detail">{val.toString()}</div></div>);
        }
      }
    }
    return <Fragment>
        <div>DETAILS</div>
        <div className="details">{details}</div>
      </Fragment>
  }
}