export class Curve {
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

  static chainPts(P, reflectedTail=false) {
  
    var pts = [];
    P = P.slice() || [];
    if(reflectedTail === true) {
      /*var startdiff = [P[0][0] - P[1][0], P[0][1] - P[1][1]];
      var start = [P[0][0] + startdiff[0], P[0][1] + startdiff[1]];
      P = [start].concat(P);
*/
      var enddiff = [P[P.length-1][0] - P[P.length-2][0], P[P.length-1][1] - P[P.length-2][1]];
      var end = [P[P.length-1][0] + enddiff[0], P[P.length-1][1] + enddiff[1]];
      P = P.concat([end]);

    }
    P.filter((v,i,a) => i+3 < P.length)
      .forEach((v,i) => {
        pts = pts.concat(this.spline(P[i], P[i+1], P[i+2], P[i+3]));
    });

    return pts;
  }

  static chain(P, reflectedTail=false) {
    const pts = Curve.chainPts(P, reflectedTail);
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


  static dist(ptA, ptZ) {
    return Math.sqrt(Math.pow(ptA.x-ptZ.x,2) + Math.pow(ptA.y-ptZ.y,2));
  }
}
