import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const colors={'#9d4ae3':'#228b22','#8236be':'#1c711c','#692a99':'#185b1a','#56217e':'#183d27','#32104c':'#102b1b','#f9f6fd':'#f7f9f4','#f3ecfc':'#eff4e9','#e8dbf8':'#dfead5','#d8c1f4':'#c4dab3','#c69ff4':'#a3c78b','#ad74e8':'#67a652'};
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(/\.(tsx|css)$/.test(p)){let s=fs.readFileSync(p,'utf8');let n=s.replace(/#[0-9a-f]{6}\b/gi,v=>colors[v.toLowerCase()]||v).replaceAll('/fa_logo_brand.png','/brand/ekivamart-logo.svg').replace(/\bFaflora\b/g,'EkivaMart').replace(/\bfaflora(?= Mobile| mobile| app| App| processing|<|\s*['"`])/g,'EkivaMart');if(n!==s)fs.writeFileSync(p,n);}}}
walk(path.join(root,'app'));walk(path.join(root,'components'));
