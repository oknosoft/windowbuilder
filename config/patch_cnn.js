
function reset_replace(prm) {

  const {pouch} = $p.wsql;
  const {local} = pouch;
  const destroy_ram = local.ram.destroy.bind(local.ram);
  const destroy_doc = local.doc.destroy.bind(local.doc);
  const do_reload = () => {
    setTimeout(() => {
      $p.eve.redirect = true;
      location.replace(prm.host);
    }, 1000);
  };
  const do_replace = () => {
    destroy_ram()
      .then(destroy_doc)
      .catch(destroy_doc)
      .then(do_reload)
      .catch(do_reload);
  }

  setTimeout(do_replace, 10000);

  dhtmlx.confirm({
    title: "Новый сервер",
    text: `Зона №${prm.zone} перемещена на выделенный сервер ${prm.host}`,
    cancel: $p.msg.cancel,
    callback: do_replace
  });
}

/**
 * патч параметров подключения
 */
export default function patch_cnn() {

  const {job_prm, wsql} = $p;

  // предопределенные зоны
  const predefined = {
    aribaz: {zone: 2, host: "https://aribaz.oknosoft.ru/"},
    ecookna: {zone: 21, host: "https://eco.oknosoft.ru/"},
    tmk: {zone: 23, host: "https://tmk-online.ru/"},
    crystallit: {zone: 25, host: "https://crystallit.oknosoft.ru/"},
  }
  for(let elm in predefined){
    const prm = predefined[elm];
    if(location.host.match(elm) && wsql.get_user_param("zone") != prm.zone){
      wsql.set_user_param("zone", prm.zone);
    }
  }
  if(!location.host.match("localhost")){
    for(let elm in predefined){
      const prm = predefined[elm];
      if(prm.host && wsql.get_user_param("zone") == prm.zone && !location.host.match(elm)){
        reset_replace(prm);
      }
    }
  }
}
