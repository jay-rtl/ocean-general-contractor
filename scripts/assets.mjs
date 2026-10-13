import { mkdir, writeFile } from 'node:fs/promises';
const dir = new URL('../src/assets/', import.meta.url);
await mkdir(dir, {recursive:true});
const assets = {
  hero: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2200&q=85',
  kitchen: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1800&q=85',
  bathroom: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1600&q=85',
  interior: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85',
  flooring: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=85',
  living: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=85',
  'project-kitchen':'https://surepulse-images.s3.us-east-1.amazonaws.com/uploads/14099/gallery_cd291419-9208-4004-b5ed-3ca0367e6722_2_1778883292.jpg',
  'project-bathroom':'https://surepulse-images.s3.us-east-1.amazonaws.com/uploads/14099/gallery_img-0661_18_1779054130.jpg',
  'project-tile':'https://surepulse-images.s3.us-east-1.amazonaws.com/uploads/14099/gallery_img-1165_14_1777681566.jpg',
  'project-framing':'https://surepulse-images.s3.us-east-1.amazonaws.com/uploads/14099/gallery_img-0040_7_1775848345.JPEG'
};
await Promise.all(Object.entries(assets).map(async ([name,url])=>{
  if(process.argv.length>2 && !process.argv.slice(2).includes(name))return;
  const response=await fetch(url);
  if(!response.ok) throw new Error(`${name}: ${response.status}`);
  const data=Buffer.from(await response.arrayBuffer());
  await writeFile(new URL(`${name}.jpg`,dir),data);
  console.log(`${name}: ${data.length} bytes`);
}));
