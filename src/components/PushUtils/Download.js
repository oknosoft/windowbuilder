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

    const {local} = $p.adapters.pouch;
    const {moment} = $p.utils;

    this.setState({step: 'Получаем массив заказов текущей базы...'});
    local.doc.find({
      selector: {
        class_name: 'doc.calc_order',
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
        return this.sync_orders(docs, keys);
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
