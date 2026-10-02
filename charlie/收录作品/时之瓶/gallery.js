(()=>{'use strict';
const stage=document.querySelector('.stage'),ring=document.querySelector('.ring'),cards=[...document.querySelectorAll('.orbit-card')],label=document.querySelector('#orbit-label'),flat=document.querySelector('#flat');
let index=0,angle=0,startX=0,startY=0,startAngle=0,dragging=false,moved=false,press=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function paint(){ring.style.transform=`rotateX(-5deg) rotateY(${angle}deg)`;const active=((Math.round(-angle/45)%8)+8)%8;index=active;label.textContent=`${String(active+1).padStart(2,'0')} / 08 · ${cards[active].querySelector('span').textContent.slice(2)}`;cards.forEach((c,i)=>{c.tabIndex=stage.classList.contains('flat')||i===active?0:-1;c.setAttribute('aria-current',String(i===active));});}
cards.forEach((c,i)=>c.style.setProperty('--i',i));
function step(n){angle=Math.round(angle/45)*45-n*45;paint();}
document.querySelector('#prev').onclick=()=>step(-1);document.querySelector('#next').onclick=()=>step(1);
stage.addEventListener('keydown',e=>{if(stage.classList.contains('flat'))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();step(e.key==='ArrowRight'?1:-1);}});
function setFlat(value){stage.classList.toggle('flat',value);flat.setAttribute('aria-pressed',String(value));flat.textContent=value?'环绕浏览':'平面浏览';document.querySelector('#prev').disabled=value;document.querySelector('#next').disabled=value;paint();}
flat.onclick=()=>setFlat(!stage.classList.contains('flat'));
stage.addEventListener('pointerdown',e=>{if(stage.classList.contains('flat')||e.button!==0)return;press=true;dragging=false;moved=false;startX=e.clientX;startY=e.clientY;startAngle=angle;});
stage.addEventListener('pointermove',e=>{if(!press)return;const dx=e.clientX-startX,dy=e.clientY-startY;if(!dragging){if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){press=false;return;}if(Math.abs(dx)<8)return;dragging=true;moved=true;stage.setPointerCapture(e.pointerId);ring.style.transition='none';}angle=startAngle+dx*.25;paint();});
function finish(e){if(!press)return;press=false;if(dragging){dragging=false;ring.style.transition='';angle=Math.round(angle/45)*45;paint();if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);setTimeout(()=>{moved=false;},100);}}
stage.addEventListener('pointerup',finish);stage.addEventListener('pointercancel',finish);
stage.addEventListener('click',e=>{if(moved){e.preventDefault();return;}const c=e.target.closest('.orbit-card');if(c&&!stage.classList.contains('flat')&&Number(c.dataset.index)!==index){e.preventDefault();let delta=Number(c.dataset.index)-index;if(delta>4)delta-=8;if(delta< -4)delta+=8;step(delta);}});
if(reduced.matches)setFlat(true);else paint();reduced.addEventListener('change',e=>{if(e.matches)setFlat(true);});
document.querySelectorAll('.states button').forEach(b=>b.addEventListener('click',()=>{const box=b.closest('.location'),im=box.querySelector('.scene-image');box.querySelectorAll('.states button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));im.src=b.dataset.src;im.alt=b.dataset.label;im.classList.remove('broken');box.querySelector('.scene-link').href=b.dataset.src;}));
const modal=document.querySelector('#viewer'),full=modal.querySelector('img');let prior;
document.querySelectorAll('.zoom').forEach(a=>a.addEventListener('click',e=>{if(!modal.showModal)return;e.preventDefault();prior=a;full.src=a.getAttribute('href');full.alt=a.querySelector('img').alt;modal.querySelector('p').textContent=full.alt;modal.showModal();}));
modal.querySelector('.close').onclick=()=>modal.close();modal.addEventListener('click',e=>{if(e.target===modal)modal.close();});modal.addEventListener('close',()=>{full.removeAttribute('src');prior?.focus();});
document.querySelectorAll('img').forEach(im=>im.addEventListener('error',()=>{im.classList.add('broken');im.alt='图片未能加载，请确认解压后的 素材 文件夹完整。';}));
})();
