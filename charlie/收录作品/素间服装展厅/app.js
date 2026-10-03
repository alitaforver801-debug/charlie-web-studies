import * as THREE from 'three';
import { GLTFLoader } from './第三方依赖/GLTFLoader.js';
import { OrbitControls } from './第三方依赖/OrbitControls.js';
const canvas=document.querySelector('#garment'), loading=document.querySelector('#loading');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer,model,materials=[],ready=false,spinning=false,targetPose=null,zoomed=false;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(34,1,.01,100);
camera.position.set(.65,.18,3.8);
const pivot=new THREE.Group();scene.add(pivot);
let controls;
function error(message){loading.classList.remove('done');loading.replaceChildren();const text=document.createElement('span');text.textContent=message;const retry=document.createElement('button');retry.textContent='重新加载';retry.onclick=()=>location.reload();loading.append(text,retry);document.querySelectorAll('.render-placeholder>span').forEach(x=>x.textContent='模型暂不可用');}
try{
renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
controls=new OrbitControls(camera,canvas);canvas.style.touchAction="pan-y";controls.enableDamping=true;controls.dampingFactor=.075;controls.enablePan=false;controls.enableZoom=false;controls.minPolarAngle=.7;controls.maxPolarAngle=2.05;controls.minDistance=2.2;controls.maxDistance=5.3;controls.rotateSpeed=.65;controls.target.set(0,0,0);
controls.addEventListener('start',()=>{targetPose=null;setSpin(false);document.querySelectorAll('.view-tools [data-view]').forEach(x=>x.classList.remove('active'));});
scene.add(new THREE.HemisphereLight(0xfffcf1,0x5e6553,2.4));
const key=new THREE.DirectionalLight(0xfff6dd,3.2);key.position.set(-3,5,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-3;key.shadow.camera.right=3;key.shadow.camera.top=3;key.shadow.camera.bottom=-3;key.shadow.bias=-.0003;key.shadow.normalBias=.03;scene.add(key);
const fill=new THREE.DirectionalLight(0xe5ebff,1.1);fill.position.set(4,1,-3);scene.add(fill);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.ShadowMaterial({color:0x707460,opacity:.12}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.22;floor.receiveShadow=true;scene.add(floor);
function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(canvas);resize();
new GLTFLoader().load('./素材/衬衫模型.glb',gltf=>{
model=gltf.scene;model.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
const scale=2.05/size.y;model.scale.multiplyScalar(scale);model.position.sub(center.multiplyScalar(scale));
model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;const old=o.material;o.material=new THREE.MeshStandardMaterial({color:0x727c60,roughness:.92,metalness:0,side:THREE.DoubleSide,normalMap:old.normalMap||null,normalScale:new THREE.Vector2(.32,.32)});materials.push(o.material);}});
pivot.add(model);ready=true;loading.classList.add('done');document.body.dataset.model='ready';renderDetails();
},xhr=>{if(xhr.total)document.querySelector('#load-percent').textContent=Math.round(xhr.loaded/xhr.total*100)+'%';},err=>{console.error(err);error('样衣加载失败，请重试。');});
function renderDetails(){if(!ready)return;const oldPos=camera.position.clone(),oldTarget=controls.target.clone(),oldAspect=camera.aspect,oldSize=renderer.getSize(new THREE.Vector2()),oldRatio=renderer.getPixelRatio(),oldRot=pivot.rotation.y;renderer.setPixelRatio(1);renderer.setSize(640,800,false);camera.aspect=.8;camera.updateProjectionMatrix();pivot.rotation.y=0;
for(const [name,z] of [['front',4],['back',-4]]){camera.position.set(0,.02,z);camera.lookAt(0,0,0);renderer.render(scene,camera);const img=document.querySelector('#shot-'+name);img.src=canvas.toDataURL('image/png');img.hidden=false;}
pivot.rotation.y=oldRot;camera.position.copy(oldPos);controls.target.copy(oldTarget);camera.aspect=oldAspect;camera.updateProjectionMatrix();renderer.setPixelRatio(oldRatio);renderer.setSize(oldSize.x,oldSize.y,false);controls.update();renderer.render(scene,camera);}
function pose(which){if(!ready)return;setSpin(false);zoomed=false;document.querySelector('#closeup').innerHTML='靠近看一看 <span>＋</span>';pivot.rotation.y=0;const poses={front:new THREE.Vector3(0,.06,3.8),side:new THREE.Vector3(3.8,.06,0),back:new THREE.Vector3(0,.06,-3.8)};targetPose=poses[which];if(reduced.matches){camera.position.copy(targetPose);targetPose=null;}document.querySelector('#angle-label').textContent={front:'正面视角',side:'侧面视角',back:'背面视角'}[which];document.querySelectorAll('.view-tools [data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===which));document.body.dataset.view=which;}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{pose(b.dataset.view);if(b.classList.contains('detail-image'))document.querySelector('#exhibit').scrollIntoView({behavior:reduced.matches?'instant':'smooth'});});
document.querySelectorAll('.swatches button').forEach(b=>b.onclick=()=>{materials.forEach(m=>m.color.set(b.dataset.color));document.querySelectorAll('.swatches button').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});document.querySelector('#color-name').textContent=b.dataset.name;document.body.dataset.color=b.dataset.name;renderDetails();});
document.querySelector('#reset').onclick=()=>{setSpin(false);targetPose=new THREE.Vector3(.65,.18,3.8);pivot.rotation.set(0,0,0);zoomed=false;document.body.dataset.view='oblique';document.querySelectorAll('.view-tools [data-view]').forEach(x=>x.classList.remove('active'));document.querySelector('#angle-label').textContent='斜侧视角';document.querySelector('#closeup').innerHTML='靠近看一看 <span>＋</span>';if(reduced.matches){camera.position.copy(targetPose);targetPose=null;}};
document.querySelector('#closeup').onclick=()=>{if(!ready)return;zoomed=!zoomed;targetPose=camera.position.clone().normalize().multiplyScalar(zoomed?2.5:3.8);if(reduced.matches){camera.position.copy(targetPose);targetPose=null;}document.querySelector('#closeup').innerHTML=zoomed?'恢复完整视图 <span>－</span>':'靠近看一看 <span>＋</span>';document.querySelector('#stage').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'center'});};
canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();targetPose=null;setSpin(false);const s=new THREE.Spherical().setFromVector3(camera.position);if(e.key==='ArrowLeft')s.theta-=.14;if(e.key==='ArrowRight')s.theta+=.14;if(e.key==='ArrowUp')s.phi=Math.max(.7,s.phi-.1);if(e.key==='ArrowDown')s.phi=Math.min(2.05,s.phi+.1);camera.position.setFromSpherical(s);});
canvas.addEventListener('wheel',e=>{if(!ready)return;e.preventDefault();targetPose=null;const d=THREE.MathUtils.clamp(camera.position.length()+e.deltaY*.002,2.2,5.3);camera.position.setLength(d);},{passive:false});
reduced.addEventListener('change',()=>{if(reduced.matches)setSpin(false);});
let last=0;function animate(t){requestAnimationFrame(animate);if(document.hidden)return;const dt=Math.min((t-last)/1000,.05);last=t;if(targetPose){camera.position.lerp(targetPose,reduced.matches?1:1-Math.exp(-dt*7));if(camera.position.distanceTo(targetPose)<.003)targetPose=null;}if(spinning&&ready)pivot.rotation.y+=dt*.28;controls.update();renderer.render(scene,camera);}requestAnimationFrame(animate);
}catch(e){console.error(e);error('当前浏览器未能启用三维展示。请尝试支持 WebGL 的浏览器。');}
function setSpin(on){spinning=on;const b=document.querySelector('#spin');b.setAttribute('aria-pressed',String(on));b.innerHTML=on?'暂停旋转 <b>Ⅱ</b>':'自动旋转 <b>↻</b>';}
document.querySelector('#spin').onclick=()=>{if(ready){targetPose=null;setSpin(!spinning);}};
