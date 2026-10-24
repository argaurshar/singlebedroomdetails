// All inputs are demonstration assumptions, in millimetres unless stated otherwise.
export const spec = Object.freeze({
  width:3600, length:4800, height:3000,
  bed:{x:1000,y:2100,width:1600,length:2000},
  wardrobe:{x:600,y:0,width:2400,depth:600,height:2400},
  drawer:{x:1410,width:780,depth:540,base:620,height:190,travel:450},
  door:{wall:'east',y:950,width:850,height:2100,hingeY:950},
  window:{wall:'north',x:1050,width:1500,sill:1200,height:1200},
  layers:[{name:'Oak finish',mm:15},{name:'Acoustic underlay',mm:5},{name:'Screed',mm:50}],
  wallLayers:[{name:'Plaster',mm:12},{name:'Block substrate',mm:150}],
  ceilingVoid:150,
  study:{panelThickness:12.5,panelWidth:1200,panelLength:2400,channelDepth:35,
    hangerDiameter:8,structuralSlab:150,carcassThickness:30,
    air:{x:3150,y:5,z:2450,width:420,depth:180,height:370}},
  fixtures:[{id:'downlight-1',watts:7},{id:'downlight-2',watts:7},{id:'bedside-left',watts:4},{id:'bedside-right',watts:4},{id:'wardrobe-strip',watts:8}],
  provenance:'Demonstration assumption — not measured or certified'
});
export const stages = [
  {title:'Open the room',short:'The space',start:.9,end:4.5,hint:'Move the foreground walls to look inside.',detail:'A cutaway keeps the bedroom readable. The clear dimensions describe the finished space; moving a drawing never changes its area.'},
  {title:'See the layers',short:'Beneath the finish',start:5.2,end:9.2,hint:'The finished surface sits on other layers.',detail:'A magnified floor and wall section separates into 15 mm oak, 5 mm acoustic underlay and 50 mm screed. The wall section reveals plaster over a block substrate.'},
  {title:'Open the drawer',short:'Space to move',start:9.9,end:15.9,hint:'The drawer needs space in front of it.',detail:'The runner telescopes as the drawer moves. Every millimetre of travel removes one millimetre from the gap to the bed. Study the carcass, select a runner, then test the clearance controls.'},
  {title:'Turn on the lights',short:'One connected circuit',start:16.6,end:20.6,hint:'This switch controls these lights.',detail:'Two downlights, two bedside lamps and a wardrobe strip share an illustrative circuit: 7 + 7 + 4 + 4 + 8 = 30 W. Light pools are illustrative, not a lux calculation.'},
  {title:'Lift the ceiling',short:'Above the surface',start:21.3,end:25.3,hint:'The ceiling hides the service route.',detail:'The full ceiling separates into six panels, framing, hangers and structural slab to reveal the cable route in a nominal 150 mm service void. This is an explanatory cutaway, not an installation drawing.'},
  {title:'Follow the air',short:'Around, and back again',start:26,end:30.6,hint:'The unit takes room air in and sends it back out.',detail:'The indoor unit recirculates room air through its intake, fan and outlet. The moving traces are schematic: they do not predict ventilation, temperature or airflow rate.'},
  {title:'Put it together',short:'One complete room',start:31.3,end:35.7,hint:'All the parts fit back into one room.',detail:'The drawer closes, the section settles and the ceiling returns. Furniture, finishes and services share the same space.'}
];
export const finishes={sage:{name:'Sage & oak',fabric:'#8f9e85',wood:'#c3a47b',accent:'#b67d65'},clay:{name:'Clay & walnut',fabric:'#b98070',wood:'#94735b',accent:'#89947b'},blue:{name:'Slate & ash',fabric:'#81979e',wood:'#c6bba5',accent:'#b08b67'}};
