(function(){
function snapshotDatosArticulos(){
let d=[];
if(window.__calculadora__&&Array.isArray(window.__calculadora__.datosArticulos)){d=window.__calculadora__.datosArticulos;}
return JSON.stringify({datosArticulos:d,meta:{timestamp:Date.now(),userAgent:navigator.userAgent}});
}
function guardarPresupuesto(){
if(!window.CP_AJAX){alert("Error AJAX");return;}
var datos=snapshotDatosArticulos();
var f=new FormData();
f.append('action','cp_guardar_presupuesto');
f.append('nonce',CP_AJAX.nonce);
f.append('data',datos);
fetch(CP_AJAX.ajax_url,{method:'POST',body:f}).then(r=>r.json()).then(j=>{
if(j.success){alert('Guardado');console.log(j.data.url);}else{alert('Error '+(j.data.msg||''));}}).catch(()=>alert('Error conexión'));
}
window.addEventListener("message",e=>{if(e.data==="guardarPresupuesto"){guardarPresupuesto();}});
window.guardarPresupuesto=guardarPresupuesto;
})();