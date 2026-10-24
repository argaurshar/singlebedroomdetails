import test from 'node:test';import assert from 'node:assert/strict';
import {evaluate,timeline,transform,compose} from '../src/model.mjs';import{spec,stages}from'../src/spec.mjs';
test('demo units, area, volume and layer totals',()=>{const m=evaluate();assert.equal(m.area,17.28);assert.equal(m.volume,51.84);assert.equal(m.layerTotal,70);});
test('drawer travel and geometric clearance share inputs',()=>{for(const [extension,expected]of [[0,1500],[225,1275],[450,1050]]){const m=evaluate({explore:true,extension});assert.equal(m.clearance,expected);assert.equal(m.extension,extension);}const m=evaluate({explore:true,extension:450,bedGap:200});assert.equal(m.clearance,-250);assert.equal(m.collision,true);});
test('input bounds reject invalid numbers',()=>{for(const extension of [-1,451,NaN,Infinity])assert.throws(()=>evaluate({extension}));for(const bedGap of [0,199,1801,NaN])assert.throws(()=>evaluate({bedGap}));assert.throws(()=>evaluate({time:NaN}));assert.throws(()=>evaluate({}, {...spec,width:-1}));});
test('all stage boundaries are continuous and measurements invariant',()=>{for(let t=0;t<=36;t+=.01){const m=evaluate({time:t});assert.equal(m.area,17.28);assert.equal(m.volume,51.84);assert.ok(m.extension>=0&&m.extension<=450);assert.ok(Math.abs(m.clearance+m.extension-1500)<1e-9);}for(const s of stages)for(const t of[s.start,s.end]){const a=timeline(t-1e-6),b=timeline(t+1e-6);for(const k of['open','layers','drawer','lights','ceiling','air'])assert.ok(Math.abs(a[k]-b[k])<1e-5,k);}});
test('canonical endpoints and circuit power',()=>{for(const k of['open','layers','drawer','lights','ceiling','air'])assert.equal(timeline(36)[k],0);assert.equal(evaluate({time:20.6}).connectedPower,30);assert.equal(evaluate({time:0}).connectedPower,0);});
test('seek is order independent',()=>{const times=[0,4.5,15.9,25.3,30.6,36,12.2];const expected=times.map(t=>evaluate({time:t}));for(const i of[6,1,4,0,5,3,2,6])assert.deepEqual(evaluate({time:times[i]}),expected[i]);});
test('hinges and nested transforms preserve geometry',()=>{const p=transform([2,1,3],{pivot:[1,1,0],angle:Math.PI/2});assert.ok(Math.abs(p[0]-1)<1e-9);assert.equal(p[1],2);assert.equal(p[2],3);assert.deepEqual(compose([0,0,0],[{translation:[1,2,3]},{translation:[4,5,6]}]),[5,7,9]);});
import {renderScene} from '../src/scene.mjs';
test('scene travel matches model and preserves complete-room inventory',()=>{
 for(const extension of[0,225,450]){
  const m=evaluate({explore:true,extension}),r=renderScene(m);
  assert.equal(r.depthCycles,0);assert.ok(r.inventory.length>=140);
  assert.equal(r.inventory.find(p=>p.id==='drawer-front').y+25,600+extension);
  assert.equal(r.inventory.find(p=>p.id==='bed-frame').y,m.bedY);
  assert.equal(r.inventory.find(p=>p.id==='runner-middle-1395').y,45+extension/2);
  assert.ok(!r.svg.includes('NaN'));
 }
});
test('drawer, cabinet and bed envelopes support nominal clearance section',()=>{
 const m=evaluate({explore:true,extension:450}),r=renderScene(m);
 const front=r.inventory.find(p=>p.id==='drawer-front'),bed=r.inventory.find(p=>p.id==='bed-frame');
 assert.ok(front.x>=bed.x&&front.x+front.w<=bed.x+bed.w);
 assert.equal(bed.y-(front.y+front.d),m.clearance);
});
test('projection and depth ordering stay deterministic across final reconstruction',()=>{
 for(const time of[0,4.5,9.2,15.9,20.6,25.3,30.6,35.7,36]){
  const a=renderScene(evaluate({time}));renderScene(evaluate({time:12.3}));
  assert.equal(renderScene(evaluate({time})).svg,a.svg);assert.equal(a.depthCycles,0);
 }
 assert.equal(renderScene(evaluate({time:0})).svg,renderScene(evaluate({time:36})).svg);
});
