
export function event_src_ram({wsql, md, utils, adapters: {pouch}, ireg}) {

  const onRam = ({data}) => {
    try {
      let types = JSON.parse(data);
      if(!Array.isArray(types) || !types.length) {
        types = ['все'];
      }
      ireg.log.record({class: 'ram', note: `На сервере обновлены справочники (${types.join(',')})
    Рекомендуется перезагрузить программу`});
    }
    catch (e) {}
  };

  pouch.on({
    user_log_in() {
      if(wsql.evt_src) {
        wsql.evt_src.addEventListener('ram', onRam, false);
      }
    }
  });
}
