import {storeZip} from './zip.mjs';
import {readFile,mkdir,writeFile,copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read=p=>readFile(path.join(root,p),'utf8');
// Dependency-free bundling: isolated module namespaces keep upstream exports and lexical names intact.
const mod=(s)=>s.replace(/^import .*;\s*$/gm,'').replace(/\bexport (?=(const|function|class|let)\b)/g,'');
const kit=await read('.agents/skills/anatomy/kit/iso-kit.mjs');
const names=[...kit.matchAll(/export (?:function|const|let|class) (\w+)/g)].map(m=>m[1]);
let script=`(()=>{\n'use strict';\nconst kit=(()=>{${mod(kit)}\nreturn {${names.join(',')}};})();\n`;
for(const name of['spec','model','scene','controller'])script+=mod(await read(`src/${name}.mjs`))+'\n';
script+='})();';
script=script.replace(/<\/script/gi, '<\\/script');
let html=await read('src/index.html');html=html.replace('/* STYLES */',await read('src/style.css')).replace('/* APP */',script);
const licence=await read('.agents/skills/anatomy/LICENSE');
html=html.replace('</head>',`<!-- Anatomy toolkit licence:\n${licence}-->\n</head>`);
await mkdir(path.join(root,'dist'),{recursive:true});
await writeFile(path.join(root,'dist/index.html'),html);
await writeFile(path.join(root,'dist/room-anatomy.html'),html);
await copyFile(path.join(root,'.agents/skills/anatomy/LICENSE'),path.join(root,'dist/ANATOMY-LICENSE.txt'));
console.log(`Built standalone HTML: ${Buffer.byteLength(html).toLocaleString()} bytes; no runtime dependencies.`);

await writeFile(path.join(root,'dist/room-anatomy.zip'),storeZip([['room-anatomy.html',html],['ANATOMY-LICENSE.txt',licence],['READ-ME.txt','Open room-anatomy.html in a browser that permits local HTML files. No installation or internet is required for the app. All room dimensions are demonstration assumptions. See the in-app notes for controls and limitations.\n']]));
