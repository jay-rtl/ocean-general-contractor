import * as THREE from 'three';

export function mountArchitecture(container:HTMLElement):()=>void {
  let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch{return ()=>{};}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.setClearColor(0x000000,0);
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-hidden','true');
  container.appendChild(renderer.domElement);
  const fallback=container.querySelector<SVGElement>('.model-fallback');
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(32,1,.1,100);
  camera.position.set(8,6,9);camera.lookAt(0,.6,0);
  const group=new THREE.Group();scene.add(group);
  const geometries:THREE.BufferGeometry[]=[];
  const materials:THREE.Material[]=[];
  const stone=new THREE.MeshStandardMaterial({color:0xc8bba3,roughness:.85,metalness:.05});
  const beam=new THREE.MeshStandardMaterial({color:0x8a806b,roughness:.6,metalness:.15});
  const glass=new THREE.MeshStandardMaterial({color:0xc2d2c8,transparent:true,opacity:.22,roughness:.15,metalness:.2,depthWrite:false});
  const line=new THREE.LineBasicMaterial({color:0x72684f,transparent:true,opacity:.65});
  materials.push(stone,beam,glass,line);
  function box(w:number,h:number,d:number,x:number,y:number,z:number,material:THREE.Material,edges=false){
    const geometry=new THREE.BoxGeometry(w,h,d);geometries.push(geometry);
    const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
    if(edges){const edgeGeometry=new THREE.EdgesGeometry(geometry);geometries.push(edgeGeometry);const outline=new THREE.LineSegments(edgeGeometry,line);outline.position.copy(mesh.position);group.add(outline);}
    return mesh;
  }
  box(5.7,.16,3.7,0,-.4,0,stone,true);
  box(4.8,.1,3,0,-.2,0,stone,true);
  for(const x of [-2.3,0,2.3])for(const z of [-1.4,1.4])box(.085,2.1,.085,x,.9,z,beam);
  for(const z of [-1.4,1.4]){box(4.7,.09,.09,0,1.95,z,beam);box(4.7,.06,.06,0,.75,z,beam);}
  for(const x of [-2.3,0,2.3])box(.08,.08,2.85,x,1.95,0,beam);
  for(const x of [-1.7,-1.1,-.5,.6,1.2,1.8])box(.035,.05,2.8,x,1.95,0,beam);
  box(2.1,1.95,.05,-1.15,.85,-1.4,stone,true);
  box(.05,1.95,2.7,2.3,.85,0,glass,true);
  box(2.2,1.95,.025,1.12,.85,1.4,glass,true);
  const roof=box(2.5,.07,3.15,-1.22,2.02,0,stone,true);
  box(.9,.5,.6,-.85,.1,-.6,stone,true);
  const groundGeometry=new THREE.PlaneGeometry(20,20);geometries.push(groundGeometry);
  const shadowMaterial=new THREE.ShadowMaterial({opacity:.12});materials.push(shadowMaterial);
  const ground=new THREE.Mesh(groundGeometry,shadowMaterial);ground.rotation.x=-Math.PI/2;ground.position.y=-.5;ground.receiveShadow=true;scene.add(ground);
  const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(-3,8,5);light.castShadow=true;light.shadow.mapSize.set(512,512);scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff,2));
  let frame=0,visible=false,destroyed=false,mouseX=0,mouseY=0;
  const resize=()=>{const {width,height}=container.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();};
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(container);resize();
  function render(){
    if(!visible||destroyed||document.hidden){frame=0;return;}
    const rect=container.getBoundingClientRect();
    const progress=THREE.MathUtils.clamp((innerHeight-rect.top)/(innerHeight+rect.height),0,1);
    group.rotation.y=THREE.MathUtils.lerp(group.rotation.y,(progress-.5)*.45+mouseX*.1,.045);
    roof.position.y=2.02+Math.sin(progress*Math.PI)*.13;
    camera.position.y=THREE.MathUtils.lerp(camera.position.y,6+mouseY*.3,.035);camera.lookAt(0,.65,0);
    renderer.render(scene,camera);if(fallback)fallback.style.visibility='hidden';
    frame=requestAnimationFrame(render);
  }
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible&&!frame)render();else if(!visible){cancelAnimationFrame(frame);frame=0;}},{threshold:.01});observer.observe(container);
  const pointer=(event:PointerEvent)=>{const rect=container.getBoundingClientRect();mouseX=(event.clientX-rect.left)/rect.width-.5;mouseY=(event.clientY-rect.top)/rect.height-.5;};
  const reset=()=>{mouseX=0;mouseY=0;};
  const visibility=()=>{if(!document.hidden&&visible&&!frame)render();};
  const lost=(event:Event)=>{event.preventDefault();visible=false;cancelAnimationFrame(frame);frame=0;if(fallback)fallback.style.visibility='visible';};
  container.addEventListener('pointermove',pointer);container.addEventListener('pointerleave',reset);document.addEventListener('visibilitychange',visibility);renderer.domElement.addEventListener('webglcontextlost',lost);
  return ()=>{destroyed=true;cancelAnimationFrame(frame);observer.disconnect();resizeObserver.disconnect();container.removeEventListener('pointermove',pointer);container.removeEventListener('pointerleave',reset);document.removeEventListener('visibilitychange',visibility);renderer.domElement.removeEventListener('webglcontextlost',lost);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());light.shadow.dispose();renderer.dispose();renderer.domElement.remove();if(fallback)fallback.style.visibility='visible';};
}
