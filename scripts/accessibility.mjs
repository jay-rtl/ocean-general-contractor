import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {existsSync} from 'node:fs';
import {mkdir,writeFile} from 'node:fs/promises';
const executablePath=process.env.BROWSER_PATH||['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
const results=[];
await mkdir('artifacts',{recursive:true});
try{
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();
  for(const route of ['/','/services/kitchen-remodeling/','/projects/','/contact/','/service-areas/']){
   await page.goto((process.env.PREVIEW_URL||'http://127.0.0.1:4327')+route);
   await page.evaluate(()=>document.fonts.ready);
   const {violations}=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
   results.push({width,route,violations:violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
  }
  await context.close();
 }
 await writeFile('artifacts/accessibility-results.json',JSON.stringify(results,null,2));
 const failures=results.filter(r=>r.violations.length);
 console.log(failures.length?JSON.stringify(failures,null,2):'PASS: 10 desktop/mobile accessibility scans; no WCAG A/AA violations detected.');
 if(failures.length)process.exitCode=1;
}finally{await browser.close();}
