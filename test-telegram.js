const fs=require('fs');
const env=fs.readFileSync('.env','utf8');
function get(name){ const m=env.match(new RegExp('^'+name+'=(.*)$','m')); return m ? m[1].trim().replace(/^"|"$/g,'') : null; }
const token=get('TELEGRAM_BOT_TOKEN');
const chat=get('TELEGRAM_CHAT_ID');
console.log('token len', token ? token.length : 0);
console.log('chat', chat);
const file=fs.readFileSync('honarestan-hadi-logo.jpg');
(async()=>{
  const blob=new Blob([file],{type:'image/jpeg'});
  const fd=new FormData();
  fd.append('chat_id',chat);
  fd.append('photo',blob,'honarestan-hadi-logo.jpg');
  const r=await fetch('https://api.telegram.org/bot'+token+'/sendPhoto',{method:'POST',body:fd});
  const t=await r.text();
  console.log('STATUS',r.status);
  console.log('RESP',t.slice(0,300));
})();
