const SYMBOLS = [
  ['国','土','无','双','忠','义','守','天','地'],
  ['无','家','可','依','慈','悲','婉','常','在'],
  ['残','烛','破','影','罗','摩','皆','幻','梦'],
  ['山','川','安','在','西','北','育','孤','贤'],
  ['江','河','难','越','中','原','春','已','深'],
  ['梦','笔','在','身','丹','青','寿','几','何']
];
const ANSWER = [0,1,2,0,1,2];
const ringsHost = document.querySelector('#rings');
const statusText = document.querySelector('#statusText');
const lockbox = document.querySelector('#lockbox');
const success = document.querySelector('#success');
let values = [];

function buildRing(index) {
  const ring = document.createElement('div');
  ring.className = 'ring'; ring.tabIndex = 0;
  ring.setAttribute('role','slider'); ring.setAttribute('aria-label',`第 ${index + 1} 枚金环`);
  ring.innerHTML = `<div class="strip">${SYMBOLS[index].map((s,i)=>`<div class="tile" style="top:${i*45}px">${s}</div>`).join('')}</div>`;
  let startY=0, startValue=0, dragging=false;
  ring.addEventListener('pointerdown',e=>{ dragging=true;startY=e.clientY;startValue=values[index];ring.setPointerCapture(e.pointerId);ring.classList.add('active'); });
  ring.addEventListener('pointermove',e=>{ if(dragging)setRing(index,startValue+Math.round((e.clientY-startY)/28),false); });
  ring.addEventListener('pointerup',()=>{ dragging=false;ring.classList.remove('active');setRing(index,values[index],true); });
  ring.addEventListener('wheel',e=>{ e.preventDefault();rotate(index,e.deltaY>0?1:-1); },{passive:false});
  ring.addEventListener('keydown',e=>{ if(['ArrowDown','ArrowRight'].includes(e.key)){e.preventDefault();rotate(index,1)} if(['ArrowUp','ArrowLeft'].includes(e.key)){e.preventDefault();rotate(index,-1)} });
  return ring;
}
function setRing(index,raw,sound=true) {
  const count=SYMBOLS[index].length;
  values[index]=((raw%count)+count)%count;
  ringsHost.children[index].querySelector('.strip').style.transform=`translateY(${-values[index]*45+92}px)`;
  const ring=ringsHost.children[index];
  ring.setAttribute('aria-valuenow',values[index]);ring.setAttribute('aria-valuetext',SYMBOLS[index][values[index]]);
  if(sound) tick();
  const correct=values.filter((v,i)=>v===ANSWER[i]).length;
  statusText.textContent=correct>=4?'金匮深处传来微弱共鸣':'找到六个正确的字，开启尘封的记忆';
  if(correct===6&&!lockbox.classList.contains('solved')) unlock();
}
function rotate(i,d){ setRing(i,values[i]+d); }
function tick(){ try{const c=new(window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.frequency.value=180;o.type='triangle';g.gain.setValueAtTime(.035,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.06);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+.065)}catch(e){} }
function unlock(){ statusText.textContent='国家破山河在 · 佛骨金匮正在开启';lockbox.classList.add('solved');setTimeout(()=>success.classList.add('show'),2700); }
function randomize(){
  success.classList.remove('show');lockbox.classList.remove('solved');
  values=Array.from({length:6},(_,i)=>Math.floor(Math.random()*SYMBOLS[i].length));
  if(values.every((v,i)=>v===ANSWER[i]))values[0]=(values[0]+1)%SYMBOLS[0].length;
  values.forEach((v,i)=>setRing(i,v,false));statusText.textContent='机关已重新扰乱';
}
for(let i=0;i<6;i++)ringsHost.appendChild(buildRing(i));
document.querySelector('#resetBtn').addEventListener('click',randomize);
document.querySelector('#unlockBtn').addEventListener('click',()=>{
  if(values.every((v,i)=>v===ANSWER[i]))unlock();
  else{lockbox.classList.remove('shake');void lockbox.offsetWidth;lockbox.classList.add('shake');statusText.textContent='诗句未成 · 机关拒绝开启';}
});
randomize();
