import {readdir,readFile,stat} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve('dist');
const base=(process.env.BASE_PATH||'/').replace(/\/$/,'');
async function walk(dir){const files=[];for(const item of await readdir(dir,{withFileTypes:true})){const path=join(dir,item.name);if(item.isDirectory())files.push(...await walk(path));else files.push(path);}return files;}
const all=await walk(root),pages=all.filter(f=>f.endsWith('.html'));
const required=['','about','services','services/kitchen-remodeling','services/bathroom-remodeling','services/painting','services/flooring','services/home-remodeling','projects','reviews','service-areas','contact','privacy'];
for(const route of required)await stat(join(root,route,'index.html'));
const titles=new Set(),descriptions=new Set();let links=0,images=0;
for(const path of pages){
 const html=await readFile(path,'utf8');
 assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,`${path}: one h1`);
 assert(!/href=["']#["']/.test(html),`${path}: placeholder anchor`);
 assert(!/(?:href|src)=["'][^"']*oceangeneralcontractors\.com/i.test(html),`${path}: original domain link`);
 const title=html.match(/<title>(.*?)<\/title>/s)?.[1];assert(title&&!titles.has(title),`${path}: unique title`);titles.add(title);
 const description=html.match(/name="description" content="([^"]+)"/)?.[1];assert(description&&!descriptions.has(description),`${path}: unique description`);descriptions.add(description);
 assert(html.includes('rel="canonical"')&&html.includes('property="og:image"'),`${path}: SEO metadata`);
 for(const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)){
  const href=match[1].replaceAll('&amp;','&');
  if(!href.startsWith('/')&&!href.startsWith('#'))continue;
  const target=new URL(href,'https://local.test'+base+'/'+path.slice(root.length+1).replaceAll('\\','/').replace(/index\.html$/,''));
  let pathname=decodeURIComponent(target.pathname);if(base){assert(pathname.startsWith(base),`Base path missing: ${href}`);pathname=pathname.slice(base.length);}
  const file=join(root,pathname,pathname.endsWith('/')?'index.html':'');
  await stat(file).catch(()=>{throw new Error(`${path}: missing linked file ${href}`);});links++;
  if(target.hash){const content=await readFile(file,'utf8');assert(content.includes(`id="${target.hash.slice(1)}"`),`Missing anchor ${href}`);}
 }
 for(const match of html.matchAll(/<img\b[^>]*>/g)){
  const tag=match[0];assert(/\balt="[^"]+"/.test(tag),`${path}: image alt`);assert(/\bwidth="/.test(tag)&&/\bheight="/.test(tag),`${path}: image dimensions`);
  const src=tag.match(/\bsrc="([^"]+)"/)?.[1];assert(src?.startsWith('/'),`Image must be local: ${src}`);await stat(join(root,src.slice(base.length)));images++;
 }
}
await stat(join(root,'sitemap-index.xml'));await stat(join(root,'robots.txt'));await stat(join(root,'social.jpg'));
console.log(`PASS: ${pages.length} static pages; ${links} internal links and anchors; ${images} images; unique SEO metadata; no original-domain navigation or placeholder links.`);
