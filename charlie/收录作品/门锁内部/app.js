import * as THREE from 'three';
import { OrbitControls } from './第三方依赖/OrbitControls.js';
const $=id=>document.getElementById(id);
const descriptions={housing:['01 / HOUSING','锁体外壳','容纳内部零件，并为传动件提供固定与支撑。切换透视或拆解，观察它包围的结构。'],handle:['02 / LEVER','把手组件','手的动作从这里进入锁体。压下把手，方轴将转动传给内部传动件。'],hub:['03 / TRANSMISSION','传动与回位','转动件把把手的转动传给斜舌。弹簧负责回位；这里以简化连杆与弹簧展示这一关系。'],latch:['04 / LATCH','斜舌组件','日常开合使用的锁舌。压下把手时，它沿水平方向缩回锁体。'],cylinder:['05 / CYLINDER','锁芯组件','位于锁体下部的控制部件。本模型展示外形、安装位置与拨动件，不展开内部编码结构。'],bolt:['06 / DEADBOLT','方舌组件','用于锁定的独立部件。它与把手控制的斜舌分开，因此按下把手时，方舌在本演示中保持不动。']};
let mode='solid',spread=0,pressed=false,selected='housing';
const partButtons=[...document.querySelectorAll('[data-part]')];
function setInfo(id){selected=id;const d=descriptions[id];$('part-no').textContent=d[0];$('part-name').textContent=d[1];$('part-copy').textContent=d[2];partButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.part===id)));}
try{
const canvas=$('scene'),renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor('#d6dcdb');renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.1,100);camera.position.set(7,4,10);
const controls=new OrbitControls(camera,canvas);controls.target.set(.25,0,0);controls.enableDamping=true;controls.minDistance=6;controls.maxDistance=20;controls.enablePan=false;controls.maxPolarAngle=Math.PI*.82;
scene.add(new THREE.HemisphereLight(0xf5f8ff,0x596154,2.5));
const key=new THREE.DirectionalLight(0xfff3dd,4);key.position.set(5,9,8);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-8;key.shadow.camera.right=8;key.shadow.camera.top=8;key.shadow.camera.bottom=-8;key.shadow.bias=-.001;scene.add(key);
const fill=new THREE.DirectionalLight(0x9ab8ff,2.5);fill.position.set(-6,3,-6);scene.add(fill);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0xd6dcdb,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-3.15;floor.receiveShadow=true;scene.add(floor);
const root=new THREE.Group();scene.add(root);
const groups={},selectables=[],shells=[],pieces=[];
for(const id of Object.keys(descriptions)){groups[id]=new THREE.Group();groups[id].userData.part=id;root.add(groups[id]);}
const steel=new THREE.MeshStandardMaterial({color:0x9aa9b4,metalness:.75,roughness:.26});
const dark=new THREE.MeshStandardMaterial({color:0x263544,metalness:.65,roughness:.32});
const brass=new THREE.MeshStandardMaterial({color:0xc19c48,metalness:.72,roughness:.28});
const blue=new THREE.MeshStandardMaterial({color:0x315ed5,metalness:.48,roughness:.28});
const red=new THREE.MeshStandardMaterial({color:0xdb7556,metalness:.45,roughness:.3});
function mesh(geo,mat,parent,x,y,z){const o=new THREE.Mesh(geo,mat.clone());o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);let p=parent;while(p&&!p.userData.part)p=p.parent;o.userData.part=p?.userData.part;selectables.push(o);return o;}
function box(w,h,d,mat,parent,x=0,y=0,z=0){return mesh(new THREE.BoxGeometry(w,h,d),mat,parent,x,y,z);}
function cyl(r,len,mat,parent,x,y,z,axis='z'){const o=mesh(new THREE.CylinderGeometry(r,r,len,48),mat,parent,x,y,z);if(axis==='z')o.rotation.x=Math.PI/2;if(axis==='x')o.rotation.z=Math.PI/2;return o;}
function track(o,offset){pieces.push({o,base:o.position.clone(),offset:new THREE.Vector3(...offset)});return o;}
// Case plates separate to expose the mechanism.
const back=box(2.65,4.25,.14,dark,groups.housing,0,0,-.55);shells.push(back);track(back,[0,0,-1.5]);
const cover=box(2.65,4.25,.14,steel,groups.housing,0,0,.55);shells.push(cover);track(cover,[0,0,1.8]);
for(const y of [-2.05,2.05]){const edge=box(2.65,.14,1.1,dark,groups.housing,0,y,0);shells.push(edge);}
const spine=box(.14,4.1,1.1,dark,groups.housing,-1.26,0,0);shells.push(spine);
// Split faceplate leaves visible openings for latch and bolt.
for(const [cy,h]of [[2.17,.85],[.45,.55],[-1.68,1.3]])box(.17,h,1.45,steel,groups.housing,1.45,cy,0);
for(const z of [-.62,.62])box(.17,5.2,.2,steel,groups.housing,1.45,0,z);
for(const y of [-2.3,2.3]){const screw=cyl(.10,.03,dark,groups.housing,1.55,y,0,'x');box(.015,.025,.12,steel,groups.housing,1.575,y,0);}
for(const y of [-1.8,1.8])for(const x of [-1,1]){const screw=cyl(.07,.04,dark,groups.housing,x,y,.65);track(screw,[0,0,1.8]);}
// Lever on a rose, square spindle and rear knob.
const handleFront=new THREE.Group();groups.handle.add(handleFront);handleFront.position.set(-.38,1.05,1.15);track(handleFront,[0,0,2.6]);
cyl(.47,.16,steel,handleFront,0,0,0);cyl(.2,.45,dark,handleFront,0,0,.22);
const lever=new THREE.Group();handleFront.add(lever);lever.position.z=.48;
box(1.55,.2,.22,steel,lever,.63,0,0);cyl(.12,.20,steel,lever,1.4,0,0,'y');
box(.21,.21,2.2,dark,groups.handle,-.38,1.05,0);
const rear=cyl(.44,.18,steel,groups.handle,-.38,1.05,-1.1);track(rear,[0,0,-1.8]);
// Follower hub, arm and an exposed return spring.
const follower=new THREE.Group();groups.hub.add(follower);follower.position.set(-.38,1.05,0);
cyl(.42,.36,brass,follower,0,0,0);box(.19,.19,.39,dark,follower,0,0,.015);box(.82,.17,.2,brass,follower,.5,-.14,0);
const rail=box(1.2,.12,.18,blue,groups.hub,.38,.5,0);const points=[];for(let i=0;i<=220;i++){const t=i/220;points.push(new THREE.Vector3(-.83+t*1.15,.05+Math.sin(t*Math.PI*22)*.11,Math.cos(t*Math.PI*22)*.11));}mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),220,.025,8,false),steel,groups.hub,0,.65,.06);
track(groups.hub,[-.55,.35,.1]);
// Latch nose has a sloped closing surface.
const latch=new THREE.Group();groups.latch.add(latch);latch.position.set(1.28,1.08,0);
const shape=new THREE.Shape();shape.moveTo(-.5,-.30);shape.lineTo(.65,-.30);shape.lineTo(.3,.30);shape.lineTo(-.5,.30);shape.closePath();const nose=mesh(new THREE.ExtrudeGeometry(shape,{depth:.64,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:2,steps:1}),steel,latch,0,0,-.32);
box(1.3,.22,.3,blue,latch,-.95,0,0);track(groups.latch,[1.25,.15,0]);
// Lower locking assembly: simplified cylinder outline and cam.
cyl(.32,1.5,brass,groups.cylinder,-.45,-.88,0);box(.39,.57,1.5,brass,groups.cylinder,-.45,-1.18,0);cyl(.23,.03,dark,groups.cylinder,-.45,-.88,.77);box(.035,.23,.03,brass,groups.cylinder,-.45,-.88,.795);const cam=box(.68,.2,.21,brass,groups.cylinder,.02,-.88,0);cam.rotation.z=.4;track(groups.cylinder,[-.3,-.5,2.2]);
box(1.4,.62,.77,steel,groups.bolt,1.03,-.73,0);box(.8,.32,.28,red,groups.bolt,.04,-.73,0);track(groups.bolt,[1.5,-.3,0]);
function highlight(){for(const o of selectables){o.material.emissive.set(o.userData.part===selected?0x254071:0x000000);o.material.emissiveIntensity=o.userData.part===selected?.22:0;}}
function setMode(next){mode=next;document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));$('view-label').textContent={solid:'外观观察',xray:'透视观察',explode:'拆解观察'}[mode];for(const s of shells){s.material.transparent=mode==='xray';s.material.opacity=mode==='xray'?.13:1;s.material.depthWrite=mode!=='xray';}if(mode!=='explode'){spread=0;$('spread').value=0;$('spread-value').textContent='0%';}else if(spread===0){spread=.75;$('spread').value=75;$('spread-value').textContent='75%';}}
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
$('spread').addEventListener('input',e=>{const value=Number(e.target.value);spread=value/100;if(mode!=='explode')setMode('explode');spread=value/100;$('spread').value=value;$('spread-value').textContent=value+'%';});
partButtons.forEach(b=>b.addEventListener('click',()=>{setInfo(b.dataset.part);if(['hub','latch','cylinder','bolt'].includes(selected)&&mode==='solid')setMode('xray');highlight();}));
$('operate').addEventListener('click',()=>{pressed=!pressed;$('operate').setAttribute('aria-pressed',String(pressed));$('operate').innerHTML=pressed?'释放把手 <span>↗</span>':'压下把手 <span>↗</span>';if(mode==='solid')setMode('xray');});
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;canvas.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});canvas.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(selectables,false).filter(h=>!(mode==='xray'&&shells.includes(h.object)));if(hits.length){setInfo(hits[0].object.userData.part);highlight();}});
function view(name){const v={front:[0,1,12],side:[12,2,0],back:[0,1,-12],reset:[7,4,10]}[name];camera.position.set(...v);controls.target.set(.25,0,0);controls.update();}
$('reset').addEventListener('click',()=>view('reset'));document.querySelectorAll('[data-camera]').forEach(b=>b.addEventListener('click',()=>view(b.dataset.camera)));
canvas.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const v=camera.position.clone().sub(controls.target);v.applyAxisAngle(new THREE.Vector3(0,1,0),e.key==='ArrowLeft'?-.15:.15);camera.position.copy(controls.target).add(v);controls.update();}});
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(canvas);resize();highlight();$('loading').hidden=true;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let amount=0,opening=0,last=performance.now();function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.05);last=now;const ease=reduced.matches?1:1-Math.exp(-8*dt);amount+=(spread-amount)*ease;opening+=((pressed?1:0)-opening)*ease;for(const p of pieces)p.o.position.copy(p.base).addScaledVector(p.offset,amount);lever.rotation.z=-opening*.55;follower.rotation.z=-opening*.55;latch.position.x=1.28-opening*.72;rail.position.x=.38-opening*.3;controls.update();renderer.render(scene,camera);}requestAnimationFrame(animate);
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();$('loading').hidden=false;$('loading').textContent='三维显示暂时中断，请刷新页面恢复。';});
}catch(error){$('loading').hidden=false;$('loading').textContent='当前浏览器无法启动三维显示。请使用支持 WebGL 的浏览器打开；下方仍可阅读结构说明。';document.querySelectorAll('button,input').forEach(el=>el.disabled=true);console.error(error);}
