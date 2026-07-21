const SYMBOLS = [
  ['国','土','无','双','忠','义','守','天','地'],
  ['无','家','可','依','慈','悲','婉','常','在'],
  ['残','烛','破','影','罗','摩','皆','幻','梦'],
  ['山','川','安','在','西','北','育','孤','贤'],
  ['江','河','难','越','中','原','春','已','深'],
  ['梦','笔','在','身','丹','青','寿','几','何']
];
const WHITE_SYMBOLS = [new Set(['守']),new Set(['婉']),new Set(['罗','摩']),new Set(['贤']),new Set(['春']),new Set(['寿'])];
const ANSWER = [0,1,2,0,1,2];
const TILE_HEIGHT = 45;
const DRAG_RATIO = .42;
const COPIES = 7;
const CENTER_COPY = 3;
const ringsHost = document.querySelector('#rings');
const statusText = document.querySelector('#statusText');
const lockbox = document.querySelector('#lockbox');
const success = document.querySelector('#success');
let values = [];
let positions = [];
let normalizeTimers = [];
let isUnlocking = false;

function modulo(value,count=9){return ((value%count)+count)%count;}
function translateFor(position){return -(CENTER_COPY*9+position)*TILE_HEIGHT+92;}
function buildRing(index){
  const ring=document.createElement('div');
  ring.className='ring';ring.tabIndex=0;
  ring.setAttribute('role','slider');ring.setAttribute('aria-label',`第 ${index+1} 枚金环`);
  const repeated=Array.from({length:COPIES},()=>SYMBOLS[index]).flat();
  ring.innerHTML=`<div class="strip">${repeated.map((symbol,i)=>`<div class="tile${WHITE_SYMBOLS[index].has(symbol)?' white-symbol':''}" style="top:${i*TILE_HEIGHT}px"><span>${symbol}</span></div>`).join('')}</div>`;
  const strip=ring.querySelector('.strip');
  let startY=0,startValue=0,dragging=false,lastStep=0;
  ring.addEventListener('pointerdown',e=>{
    if(isUnlocking)return;
    clearTimeout(normalizeTimers[index]);
    dragging=true;startY=e.clientY;startValue=positions[index];lastStep=0;
    strip.classList.add('dragging');ring.classList.add('active');ring.setPointerCapture(e.pointerId);
  });
  ring.addEventListener('pointermove',e=>{
    if(!dragging||isUnlocking)return;
    const travel=(e.clientY-startY)*DRAG_RATIO;
    strip.style.transform=`translateY(${translateFor(startValue)+travel}px)`;
    const step=Math.round(-travel/TILE_HEIGHT);
    if(step!==lastStep){softTick();lastStep=step;}
  });
  const finish=e=>{
    if(!dragging)return;
    dragging=false;strip.classList.remove('dragging');ring.classList.remove('active');
    const travel=(e.clientY-startY)*DRAG_RATIO;
    setRing(index,startValue+Math.round(-travel/TILE_HEIGHT),true,true);
  };
  ring.addEventListener('pointerup',finish);
  ring.addEventListener('pointercancel',()=>{if(dragging){dragging=false;strip.classList.remove('dragging');ring.classList.remove('active');setRing(index,startValue,false,false);}});
  ring.addEventListener('wheel',e=>{e.preventDefault();if(!isUnlocking)rotate(index,e.deltaY>0?1:-1);},{passive:false});
  ring.addEventListener('keydown',e=>{if(isUnlocking)return;if(['ArrowDown','ArrowRight'].includes(e.key)){e.preventDefault();rotate(index,1)}if(['ArrowUp','ArrowLeft'].includes(e.key)){e.preventDefault();rotate(index,-1)}});
  return ring;
}
function setRing(index,raw,sound=true,check=true){
  const count=SYMBOLS[index].length;
  positions[index]=raw;values[index]=modulo(raw,count);
  const ring=ringsHost.children[index];
  ring.querySelector('.strip').style.transform=`translateY(${translateFor(positions[index])}px)`;
  ring.setAttribute('aria-valuenow',values[index]);ring.setAttribute('aria-valuetext',SYMBOLS[index][values[index]]);
  if(sound)tick();
  if(check)checkAnswer();
  clearTimeout(normalizeTimers[index]);
  normalizeTimers[index]=setTimeout(()=>normalizeRing(index),460);
}
function normalizeRing(index){
  if(isUnlocking)return;
  const strip=ringsHost.children[index].querySelector('.strip');
  positions[index]=values[index];strip.classList.add('teleport');
  strip.style.transform=`translateY(${translateFor(positions[index])}px)`;
  requestAnimationFrame(()=>requestAnimationFrame(()=>strip.classList.remove('teleport')));
}
function checkAnswer(){
  const correct=values.filter((v,i)=>v===ANSWER[i]).length;
  statusText.textContent=correct>=4?'金匮深处传来微弱共鸣':'找到六个正确的字，开启尘封的记忆';
  if(correct===6&&!isUnlocking)unlock();
}
function rotate(i,d){setRing(i,positions[i]+d);}
function tone(volume,duration){try{const c=new(window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.frequency.value=180;o.type='triangle';g.gain.setValueAtTime(volume,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+duration);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+duration)}catch(e){}}
function tick(){tone(.035,.065)}
function softTick(){tone(.012,.035)}
function unlock(){
  isUnlocking=true;statusText.textContent='六字归位 · 机关锁定';lockbox.classList.add('locked');
  ringsHost.querySelectorAll('.ring').forEach(r=>r.tabIndex=-1);
  setTimeout(()=>{statusText.textContent='国家破山河在 · 佛骨金匮开启';lockbox.classList.remove('locked');lockbox.classList.add('opening');},1000);
  setTimeout(()=>success.classList.add('show'),4100);
}
function resetRings(){
  isUnlocking=false;success.classList.remove('show');lockbox.classList.remove('locked','opening');
  positions=Array(6).fill(4);values=Array(6).fill(4);
  positions.forEach((v,i)=>setRing(i,v,false,false));ringsHost.querySelectorAll('.ring').forEach(r=>r.tabIndex=0);
  statusText.textContent='六枚转轮已归于初位';
}
for(let i=0;i<6;i++)ringsHost.appendChild(buildRing(i));
document.querySelector('#resetBtn').addEventListener('click',()=>{if(!isUnlocking)resetRings()});
document.querySelector('#unlockBtn').addEventListener('click',()=>{if(isUnlocking)return;if(values.every((v,i)=>v===ANSWER[i]))unlock();else{lockbox.classList.remove('shake');void lockbox.offsetWidth;lockbox.classList.add('shake');statusText.textContent='诗句未成 · 机关拒绝开启';}});
resetRings();
