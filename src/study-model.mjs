import {spec,stages} from './spec.mjs';
import {clamp,smooth,evaluate} from './model.mjs';
import {renderScene} from './scene.mjs';
// Physical extents stay in millimetres. offset is only an exploded drawing translation.
export const lessons=[
 {name:'Room & circulation',parts:[['enclosure','Enclosure','Finished internal space','3,600 × 4,800 × 3,000 mm','Walls define the clear volume. Cutaway edges expose the furniture and circulation.'],['furniture','Furniture layout','Objects share one floor','Bed 1,600 × 2,000 mm','Compare the bed, wardrobe, door swing and window before studying their details.'],['ceiling','Ceiling plane','The fifth surface','17.28 m² footprint','A translucent full-room plane identifies the ceiling; chapter five exposes its construction.']]},
 {name:'Floor & wall build-up',parts:[['oak','Oak finish','Walking surface','15 mm','The finish sits on the underlay. Board joints remain on the upper face.'],['underlay','Acoustic underlay','Resilient separating layer','5 mm','Shown at its actual thickness; the vertical gap is a display offset, not an air cavity. No acoustic rating is assumed.'],['screed','Screed','Levelling substrate','50 mm','Supports the floor build-up. Finish + underlay + screed = 70 mm.'],['block','Block substrate','Wall backing','150 mm','A cut section exposes the substrate. This is a typical assembly assumption, not a structural design.'],['plaster','Plaster finish','Wall surface','12 mm','Separates normal to the wall to reveal the interface behind it.']]},
 {name:'Wardrobe & drawer',parts:[['carcass','Carcass & shelves','Support and storage','2,400 × 600 × 2,400 mm','The back, uprights, shelves and crown form the cabinet. Panels separate for inspection; offsets do not change its size.'],['doors','Doors & handles','Access to side bays','Two 750 mm leaves','The leaves move out of the drawing to expose the carcass. This is an exploded view, not a door hinge simulation.'],['drawer','Drawer tray','Moving storage','780 × 540 × 190 mm','Base, sides, back and front travel together. The front face determines the remaining gap to the bed.'],['runner','Telescopic runners','Guide drawer travel','0–450 mm stroke','Fixed rail stays on the cabinet; intermediate rail travels half the stroke; inner rail follows the tray.'],['bed-edge','Opposing bed','Clearance boundary','1,500 mm nominal gap','Remaining clearance = initial gap − extension. A negative value means geometric interference.']]},
 {name:'Lighting & connections',parts:[['downlights','Two downlights','Overhead lighting','2 × 7 W','Two fittings share the illustrative switched circuit. Their output is not a lux calculation.'],['lamps','Bedside lamps','Local lighting','2 × 4 W','These two loads are included in the illustrative circuit. Actual wiring and switching depend on the installation.'],['strip','Wardrobe strip','Cabinet lighting','8 W','A linear light sits at the wardrobe opening. Drivers and cable routing require an installation-specific design.'],['circuit','Switch & route','Electrical connection','30 W connected load','7 + 7 + 4 + 4 + 8 = 30 W. The animated route indicates connectivity, not current or electrical compliance.']]},
 {name:'Full ceiling assembly',parts:[['slab','Structural slab','Upper boundary','150 mm study slab','Translucent for visibility. Thickness is an added demonstration assumption, not a structural calculation.'],['hangers','Hangers & anchors','Suspension connections','150 mm nominal void','Rods connect the channel grid to the slab. Exploded gaps are exaggerated only for display.'],['primary','Primary channels','Suspension grid','35 mm study depth','Primary members carry the crossing furring members. Layout and fixings are illustrative, not a certified span design.'],['furring','Furring channels','Panel support','35 mm study depth','Cross members sit below the primary grid and support the panel edges.'],['panels','Six ceiling panels','Finished ceiling surface','6 × 1,200 × 2,400 × 12.5 mm','The six panels cover the full 3,600 × 4,800 mm footprint. The finish plane remains at 3,000 mm above the floor.'],['services','Cable & luminaires','Services in the void','2 × 7 W fittings','The route is supported within the ceiling zone. The drawing does not specify a rated installation.']]},
 {name:'Indoor unit & recirculation',parts:[['housing','Casing & cover','Protective enclosure','420 × 180 × 370 mm','Dimensions match the demonstration unit in the room. The cover lifts to expose an illustrative internal arrangement.'],['filter','Intake filter','Air entry','Illustrative filter','Room air passes through the intake and filter. Filter performance is not modelled.'],['coil','Coil fins','Heat-exchange surface','Schematic internal assembly','Fins illustrate the heat-exchange zone. No capacity, refrigerant circuit or temperature is calculated.'],['fan','Fan & motor','Recirculation mechanism','Illustrative rotor','The rotor turns about its own fixed axis. Speed is visual only and does not imply an airflow rate.'],['outlet','Outlet louvres','Air direction','Schematic recirculation','Air returns to the same room; this view does not demonstrate fresh-air ventilation.']]},
 {name:'One coordinated room',parts:[['enclosure','Enclosure','A shared space','17.28 m² · 51.84 m³','The assemblies return to the same room. Display movements never alter its physical dimensions.'],['furniture','Furniture & access','Use and movement','1,050 mm at full extension','Furniture, door swings and opening drawers need to be coordinated. This is geometric clearance, not a certified accessible aisle.'],['ceiling','Finishes & services','Coordination above and below','150 mm nominal ceiling void','Ceiling, lighting and indoor unit occupy the same room. Detailed installation design remains project-specific.']]}
];
export function studyState(m){
 const index=m.explore?2:Math.max(0,stages.findLastIndex(s=>m.t>=s.start));
 const stage=stages[index];return {index,u:m.explore?1:clamp((m.t-stage.start)/(stage.end-stage.start)),transition:m.explore?1:smooth((m.t-stage.start)/.65)};
}
const stageEase=(u,a=0,b=1)=>smooth((u-a)/(b-a));
let cabinetInventory;
export function studyParts(index,u,m){
 const parts=[];
 const add=(id,component,x,y,z,w,d,h,material,offset=[0,0,0],opacity=1,r=0)=>parts.push({id,component,x,y,z,w,d,h,material,offset,opacity,r});
 if(index===1){
  let z=-70;
  for(let i=2;i>=0;i--){const l=spec.layers[i],e=stageEase(u,.05+i*.09,.7+i*.1);add(`layer-${i}`,['oak','underlay','screed'][i],0,0,z,900,850,l.mm,['wood','dark','wall'][i],[0,0,(3-i)*180*e]);z+=l.mm;}
  add('wall-substrate','block',-162,0,0,150,850,950,'wall',[-240*stageEase(u,.12,.8),0,0]);
  add('wall-plaster','plaster',-12,0,0,12,850,950,'linen',[-90*stageEase(u,.26,.95),0,0]);
  for(let i=0;i<5;i++)add(`plank-joint-${i}`,'oak',i*180,0,0,1,850,.4,'bronze',[0,0,540*stageEase(u,.05,.7)]);
 }
 if(index===2){
  cabinetInventory??=renderScene(evaluate()).inventory.filter(p=>/^(wardrobe|drawer|runner)/.test(p.id)&&!p.id.includes('light-strip'));
  for(const p of cabinetInventory){
   const component=p.id.startsWith('runner')?'runner':p.id.startsWith('drawer')?'drawer':/door|handle/.test(p.id)?'doors':'carcass';
   let delta=0;if(component==='drawer')delta=m.extension;if(p.id.startsWith('runner-middle'))delta=m.extension/2;if(p.id.startsWith('runner-inner'))delta=m.extension;
   let offset=[0,0,0];const e=stageEase(u,.05,.65);
   if(component==='doors')offset=[p.x<1800?-420*e:420*e,280*e,60*e];
   if(p.id==='wardrobe-back')offset=[0,-240*e,0];
   if(p.id==='wardrobe-crown')offset=[0,0,320*stageEase(u,.15,.8)];
   if(/wardrobe-shelf|wardrobe-folded-linen|wardrobe-storage-box|wardrobe-box-pull/.test(p.id))offset=[0,100*e,80*e];
   add(p.id,component,p.x,p.y+delta,p.z,p.w,p.d,p.h,p.material,offset,1,p.id.includes('linen')?16:0);
  }
  add('bed-clearance-edge','bed-edge',1000,m.bedY,190,1600,260,350,'fabric',[0,0,0],.55,24);
 }
 if(index===4){
  const e=stageEase(u,.05,.9),s=spec.study;
  add('structure','slab',0,0,3150,spec.width,spec.length,s.structuralSlab,'wall',[0,0,950*e],.17);
  for(const x of[600,1800,3000]){
   for(const y of[600,1800,3000,4200]){
    add(`anchor-${x}-${y}`,'hangers',x-24,y-24,3140,48,48,10,'bronze',[0,0,750*e]);
    add(`rod-${x}-${y}`,'hangers',x-4,y-4,3082.5,8,8,57.5,'metal',[0,0,750*e]);
    add(`clip-${x}-${y}`,'hangers',x-20,y-18,3077.5,40,36,5,'bronze',[0,0,750*e]);
   }
   add(`primary-${x}`,'primary',x-25,0,3047.5,50,4800,35,'metal',[0,0,450*e]);
   add(`primary-web-${x}`,'primary',x-25,0,3082.5,8,4800,8,'dark',[0,0,450*e]);
  }
  for(let y=0;y<=4800;y+=600){add(`furring-${y}`,'furring',0,Math.min(y,4770),3012.5,3600,30,35,'metal',[0,0,160*e]);}
  for(let i=0;i<3;i++)for(let j=0;j<2;j++){
   const stagger=stageEase(u,.08+(i+j)*.06,.58+(i+j)*.08);
   add(`panel-${i}-${j}`,'panels',i*1200,j*2400,3000,1200,2400,12.5,'linen',[(i-1)*160*stagger,(j-.5)*220*stagger,-550*stagger]);
   for(const x of[60,1140])for(const y of[80,1200,2320])add(`fixing-${i}-${j}-${x}-${y}`,'panels',i*1200+x,j*2400+y,3012.5,6,6,3,'bronze',[(i-1)*160*stagger,(j-.5)*220*stagger,-550*stagger]);
  }
  for(const x of[1100,2500]){add(`ceiling-fitting-${x}`,'services',x-75,425,2960,150,150,40,'light',[0,0,-800*stageEase(u,.3,.95)],1,50);add(`driver-${x}`,'services',x,600,3020,180,70,35,'dark',[0,0,-80*e]);}
 }
 if(index===5){
  const a=spec.study.air,e=stageEase(u,.05,.8);
  // These internals are schematic within the existing physical casing envelope.
  add('unit-back','housing',0,0,0,a.width,16,a.height,'linen');
  add('unit-base','housing',0,16,0,a.width,a.depth-16,18,'linen');
  add('unit-cover','housing',0,170,0,a.width,10,a.height,'linen',[0,135*e,175*e],.68,10);
  add('unit-top','housing',0,16,a.height-15,a.width,154,15,'linen',[0,70*e,180*e]);
  add('filter-frame','filter',25,125,200,370,8,140,'bronze',[0,80*stageEase(u,.15,.9),105*stageEase(u,.15,.9)]);
  for(let x=35;x<390;x+=14)add(`filter-mesh-${x}`,'filter',x,134,210,2,2,120,'dark',[0,80*stageEase(u,.15,.9),105*stageEase(u,.15,.9)]);
  for(let z=215;z<335;z+=14)add(`filter-mesh-z-${z}`,'filter',35,135,z,350,2,2,'dark',[0,80*stageEase(u,.15,.9),105*stageEase(u,.15,.9)]);
  add('coil-back','coil',35,30,190,350,60,145,'metal');
  for(let x=40;x<380;x+=12)add(`coil-fin-${x}`,'coil',x,30,190,2,70,145,'metal');
  add('motor','fan',340,45,80,45,65,70,'dark',[-10*e,10*e,0],1,12);
  add('fan-axle','fan',55,77,110,285,8,8,'bronze');
  for(let i=0;i<5;i++)add(`outlet-louvre-${i}`,'outlet',25,135+i*8,28+i*7,370,4,5,'bronze',[0,95*stageEase(u,.25,1),-65*stageEase(u,.25,1)]);
 }
 return parts;
}
