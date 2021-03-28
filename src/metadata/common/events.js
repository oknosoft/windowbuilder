/**
 * EventSource - обработчики событий sse
 *
 * @module events
 *
 * Created by Evgeniy Malyarov on 09.03.2020.
 */

import qs from 'qs';
import {load_ram} from 'metadata-superlogin/proxy';

export function prm() {
  return qs.parse(location.search.replace('?',''));
}

export default function ({wsql, md, adapters: {pouch}, cat}) {

  const onDoc = ({data}) => {
    const doc = JSON.parse(data);
    const paths = location.pathname.substr(1).split('/');
    if(doc.class_name === 'doc.calc_order') {
      // текущий заказ не перезаписываем
      if(paths[0] === 'builder') {
        const ox = cat.characteristics.by_ref[paths[1]];
        if(ox && (doc._id && doc._id.includes(ox.calc_order.ref) || doc.ref === ox.calc_order.ref)) {
          return;
        }
      }
      else if(paths[0] === 'templates') {
        const aprm = prm();
        if(aprm.order && (doc._id && doc._id.includes(aprm.order) || doc.ref === aprm.order)) {
          return;
        }
      }
      pouch.load_changes({docs: [doc]});
    }
  };

  const onRam = ({data}) => {
    load_ram({adapters: {pouch}, md}, JSON.parse(data))
      .catch((err) => null);
  };

  pouch.on({
    user_log_in() {
      // начинаем слушать события сервера
      wsql.evt_src = new EventSource(`/couchdb/events/${pouch.props._user}`);
      wsql.evt_src.addEventListener('doc', onDoc, false);
      wsql.evt_src.addEventListener('ram', onRam, false);
    },
    user_log_out() {
      if(wsql.evt_src) {
        wsql.evt_src.removeEventListener('doc', onDoc);
        wsql.evt_src.removeEventListener('ram', onRam);
        wsql.evt_src.close();
        wsql.evt_src = null;
      }
    },
  });

  // evt_src.onerror = function (e) {
  //   console.log('sse: error');
  //   if(this.readyState == EventSource.CONNECTING) {
  //     console.log(`Переподключение (readyState=${this.readyState})...`);
  //   }
  // };
}
