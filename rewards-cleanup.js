/* Keep coin-purchasable skins in Shop only. */
(function(){
  function clean(){
    document.querySelectorAll('#progressionPanel .extra-skin').forEach(el=>el.remove());
  }
  const obs=new MutationObserver(clean);
  function init(){
    clean();
    const panel=document.getElementById('progressionPanel');
    if(panel) obs.observe(panel,{childList:true,subtree:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
