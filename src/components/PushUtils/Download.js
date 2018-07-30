/**
 * Обновляет заказы и продукции из облака
 *
 * @module Download
 *
 * Created by Evgeniy Malyarov on 24.03.2018.
 */

import PropTypes from 'prop-types';
import Progress from './Progress';

class Download extends Progress {

  init() {

    const {local, remote} = $p.adapters.pouch;
    const {utils: {moment}, doc: {calc_order}} = $p;

    this.setState({step: 'Получаем последние 70 заказов текущего пользователя...'});
    // создадим fake-заказ, чтобы безопасно рассчитать префикс
    calc_order.create({}, true)
      .then((doc) => {
        const prefix = doc.number_doc.substr(0, 7);
        // выгружаем fake-заказ из памяти, он нам больше не нужен
        doc.unload();
        return remote.doc.query('doc/number_doc',
          {
            limit: 70,
            include_docs: false,
            startkey: [calc_order.class_name, new Date().getFullYear(), prefix + '\ufff0'],
            endkey: [calc_order.class_name, new Date().getFullYear(), prefix],
            descending: true,
          });
      })
      .then(({rows}) => {
        this.setState({step: 'Получаем массив заказов текущей базы...'});
        return local.doc.find({
          selector: {
            class_name: calc_order.class_name,
            date: {
              $gte: moment().subtract(3, 'months').format('YYYY-MM-DD'),
              $lte: moment().add(1, 'months').format('YYYY-MM-DD')
            }
          },
          fields: ['_id', '_rev', 'state'],
          limit: 10000,
        })
          .then(({docs}) => {
            const keys = docs.filter((v) => v.state !== 'template').map((v) => v._id);
            for(const {id} of rows) {
              keys.indexOf(id) === -1 && keys.push(id);
            }
            return this.sync_orders(docs, keys);
          });
      })
      .then(({rows}) => {
        const docs = rows.filter((v) => v.doc).map((v) => v.doc);
        return this.sync_products(docs);
      })
      .then(() => {
        return this.rebuild_indexes();
      })
      .catch((err) => {
        this.setState({error: err.message || 'Ошибка синхронизации заказов'});
      });
  }
}

Download.propTypes = {
  dialog: PropTypes.object.isRequired,
  handleCancel: PropTypes.func.isRequired,
};

export default Download;
