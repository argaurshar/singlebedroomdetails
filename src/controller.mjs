import {spec,stages,finishes} from './spec.mjs';
import {evaluate,clamp} from './model.mjs';
import {renderScene,clearanceDetail} from './scene.mjs';
const $=s=>document.querySelector(s),reduced=matchMedia('(prefers-reduced-motion: reduce)'),renderMode=new URLSearchParams(location.search).has('render');
let preferences={};try{preferences=JSON.parse(localStorage.getItem('room-anatomy')||'{}')||{};}catch{}
let mode=preferences.mode==='auto'?'auto':'manual',finish=finishes[preferences.finish]?preferences.finish:'sage';
let time=0,running=false,explore=false,extension=450,bedGap=1500,frame=0,last=0,target=null,model;
const save=()=>{try{localStorage.setItem('room-anatomy',JSON.stringify({mode,finish}));}catch{}};
const announce=s=>$('#status').textContent=s;
$('#steps').innerHTML=stages.map((s,i)=>`<li><button class="step" data-index="${i}" aria-label="${i+1}. ${s.title}"><span class="step-num">${String(i+1).padStart(2,'0')}</span><span><strong>${s.title}</strong><small>${s.short}</small></span></button></li>`).join('');
$('#swatches').innerHTML=Object.entries(finishes).map(([key,f])=>`<button data-finish="${key}" aria-label="${f.name}" title="${f.name}"><span style="background:linear-gradient(135deg,${f.fabric} 50%,${f.wood} 50%)"></span></button>`).join('');
const format=n=>Math.round(n).toLocaleString('en');
function draw(){
 model=evaluate({time,explore,extension:explore?extension:null,bedGap});
 const room=renderScene(model,finish);$('#scene').innerHTML=room.svg;
 const completed=model.completed;
 const index=explore?2:model.active>=0?model.active:completed>0?Math.min(completed-1,6):-1;
 $('#chapter').textContent=explore?'EXPLORE / SPACE TO MOVE':index>=0?`DISCOVERY ${String(index+1).padStart(2,'0')} / ${stages[index].short.toUpperCase()}`:'THE COMPLETE ROOM';
 $('#hint').textContent=explore?'How much space does a drawer need?':index>=0?stages[index].hint:'Everything has its place.';
 $('#explanation').textContent=index>=0?stages[index].detail:'A room works when its layers, furniture and services fit together. Open the room, then follow each discovery to see why.';
 $('#count').textContent=`${completed} / 7`;
 document.querySelectorAll('.step').forEach((b,i)=>{
  const active=running&&model.active===i;const done=i<completed;
  b.dataset.state=active?'running':done?'done':i===completed?'next':'waiting';
  b.disabled=running||explore||i!==completed;
  b.setAttribute('aria-current',active||(!running&&i===completed)?'step':'false');
  b.querySelector('.step-num').textContent=done?'✓':String(i+1).padStart(2,'0');
 });
 for(const value of['manual','auto'])$('#'+value).setAttribute('aria-pressed',String(mode===value));
 $('#mode-hint').textContent=reduced.matches?'Reduced motion: one still per action.':mode==='auto'?'A 36-second tour. Pause with Manual.':'Go at your own pace.';
 $('#area').innerHTML=`${model.area.toFixed(2)} <small>m²</small>`;$('#volume').innerHTML=`${model.volume.toFixed(2)} <small>m³</small>`;
 const metric=index===1?['Floor section',model.layerTotal,'mm']:index===3?['Connected load',model.connectedPower,'W']:index===4?['Service void',spec.ceilingVoid,'mm']:['Drawer travel',model.extension,'mm'];
 $('#metric-label').textContent=metric[0];$('#metric').innerHTML=`${format(metric[1])} <small>${metric[2]}</small>`;
 $('#clearance').innerHTML=`${format(model.clearance)} <small>mm</small>`;$('#clearance').style.color=model.collision?'#a14f3c':'';
 $('#scene-note').textContent=index===5?'Recirculation · schematic':index===3?'Light pools · illustrative':index===4?'Selected ceiling panel · cutaway':'Finished surfaces · illustrative view';
 document.querySelectorAll('[data-finish]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.finish===finish)));
 $('#finish-name').textContent=finishes[finish].name;
 $('#explore-controls').hidden=!explore;$('#explore-intro').hidden=explore;$('#explore').hidden=explore;
 if(explore){$('#extension-output').textContent=`${format(extension)} mm`;$('#gap-output').textContent=`${format(bedGap)} mm`;$('#clearance-detail').innerHTML=clearanceDetail(model,finish);
  const msg=model.collision?`Interference: the drawer overlaps the bed by ${format(-model.clearance)} mm.`:`${format(model.clearance)} mm of geometric clearance remains.`;
  if($('#collision').textContent!==msg)$('#collision').textContent=msg;
  $('#collision').dataset.collision=String(model.collision);
 }
 window.roomState={...model,mode,finish,running,renderMode,partCount:room.inventory.length,depthCycles:room.depthCycles};
 window.roomInventory=room.inventory;
}
function stop(){cancelAnimationFrame(frame);frame=0;running=false;last=0;target=null;}
function tick(now){
 if(!running)return;
 if(document.hidden){last=0;frame=requestAnimationFrame(tick);return;}
 const dt=last?Math.min((now-last)/1000,.05):0;last=now;time+=dt;
 const end=target??36;
 if(time>=end){time=end;draw();if(target!==null){const i=stages.findIndex(s=>s.end===target);stop();announce(`${stages[i].title} complete.${i===6?' Room reassembled. Start over to replay.':' Next discovery is ready.'}`);draw();return;}
  time=0;announce('Tour complete. Beginning again.');
 }
 draw();frame=requestAnimationFrame(tick);
}
function play(){if(renderMode||reduced.matches||explore)return;running=true;last=0;frame=requestAnimationFrame(tick);}
function advance(i){if(running||explore||i!==model.completed)return;
 stop();time=stages[i].start;announce(`${stages[i].title}.`);
 if(reduced.matches||renderMode){time=stages[i].end;draw();announce(`${stages[i].title} complete.`);return;}
 target=stages[i].end;play();draw();
}
function setMode(value){if(mode===value)return;
 if(value==='manual'){
  if(running){const active=model.active;if(active>=0)time=stages[active].end;}
  stop();mode=value;announce('Manual. Continue when you are ready.');
 }else{stop();mode=value;if(!explore){if(time>=36)time=0;play();}announce(reduced.matches?'Auto selected. Reduced motion uses still steps.':'Auto tour selected.');}
 save();draw();
}
function reset(){stop();time=0;explore=false;bedGap=1500;extension=450;$('#extension').value='450';$('#bed-gap').value='1500';announce('Room reset. Ready when you are.');draw();if(mode==='auto')play();}
$('.tour').addEventListener('click',e=>{const b=e.target.closest('[data-index]');if(b)advance(Number(b.dataset.index));});
$('#manual').addEventListener('click',()=>setMode('manual'));$('#auto').addEventListener('click',()=>setMode('auto'));$('#reset').addEventListener('click',reset);
$('#swatches').addEventListener('click',e=>{const b=e.target.closest('[data-finish]');if(!b)return;finish=b.dataset.finish;save();draw();});
$('#explore').addEventListener('click',()=>{stop();explore=true;draw();$('#extension').focus();announce('Explore clearance. The tour is paused.');});
for(const id of['extension','bed-gap'])$('#'+id).addEventListener('input',()=>{extension=Number($('#extension').value);bedGap=Number($('#bed-gap').value);draw();});
$('#return').addEventListener('click',()=>{stop();explore=false;time=0;draw();document.querySelector('.step').focus();announce('Guided tour reset with your valid room inputs.');if(mode==='auto')play();});
reduced.addEventListener('change',()=>{if(reduced.matches){if(model.active>=0)time=stages[model.active].end;stop();}draw();});
document.addEventListener('visibilitychange',()=>{last=0;});
// Public deterministic capture contract. Stops live playback; canonical time reconstructs state.
window.seek=t=>{if(!Number.isFinite(t))throw new TypeError('Time must be finite');stop();explore=false;time=clamp(t,0,36);draw();return structuredClone(window.roomState);};
window.roomAPI={evaluate,stages,spec,reset};
draw();if(mode==='auto'&&!renderMode)play();
