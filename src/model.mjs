import {spec,stages} from './spec.mjs';
export const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
export const smooth=n=>{n=clamp(n);return n*n*(3-2*n);};
export function validateSpec(s){
 for(const key of ['width','length','height'])if(!Number.isFinite(s[key])||s[key]<=0)throw new RangeError(key);
 for(const n of [s.bed.x,s.bed.y,s.bed.width,s.bed.length,s.wardrobe.depth,s.drawer.travel])if(!Number.isFinite(n)||n<0)throw new RangeError('Invalid furniture dimension');
 if(s.bed.x+s.bed.width>s.width||s.bed.y+s.bed.length>s.length)throw new RangeError('Bed outside room');
 if(s.layers.some(l=>!Number.isFinite(l.mm)||l.mm<=0)||s.fixtures.some(f=>!Number.isFinite(f.watts)||f.watts<0))throw new RangeError('Invalid layer or power');
 return s;
}
export function timeline(t){
 if(!Number.isFinite(t))throw new TypeError('Time must be finite');
 t=clamp(t,0,36);
 const progress=stages.map(s=>smooth((t-s.start)/(s.end-s.start)));
 const close=progress[6];
 const keep=1-close;
 let active=stages.findIndex(s=>t>=s.start&&t<s.end);
 let completed=stages.filter(s=>t>=s.end).length;
 return {t,progress,active,completed,open:progress[0]*keep,layers:progress[1]*(1-progress[2])*keep,drawer:progress[2]*keep,lights:progress[3]*keep,ceiling:progress[4]*keep,air:progress[5]*keep};
}
export function evaluate({time=0,extension=null,bedGap=1500,explore=false}={},s=spec){
 validateSpec(s);
 if(!Number.isFinite(bedGap)||bedGap<200||bedGap>1800)throw new RangeError('Bed gap must be 200–1800 mm');
 if(extension!==null&&(!Number.isFinite(extension)||extension<0||extension>s.drawer.travel))throw new RangeError('Drawer extension must be 0–450 mm');
 const state=timeline(time);
 if(explore){Object.assign(state,{open:1,layers:0,ceiling:0,air:0,lights:0,drawer:extension===null?1:extension/s.drawer.travel});}
 const travel=extension!==null&&explore?extension:s.drawer.travel*state.drawer;
 const gap=bedGap;
 return {...state,explore,bedGap:gap,bedY:s.wardrobe.depth+gap,extension:travel,clearance:gap-travel,collision:gap-travel<0,
 area:s.width*s.length/1e6,volume:s.width*s.length*s.height/1e9,layerTotal:s.layers.reduce((n,l)=>n+l.mm,0),
 connectedPower:state.lights>0?s.fixtures.reduce((n,f)=>n+f.watts,0):0};
}
// Hierarchical translations and true hinge rotations, shared by scene and geometry tests.
export function transform(point,{translation=[0,0,0],pivot=[0,0,0],angle=0}={}){
 const [x,y,z]=point;const [px,py]=pivot;const c=Math.cos(angle),s=Math.sin(angle);
 return [px+(x-px)*c-(y-py)*s+translation[0],py+(x-px)*s+(y-py)*c+translation[1],z+translation[2]];
}
export function compose(point,transforms){return transforms.reduce((p,t)=>transform(p,t),point);}
