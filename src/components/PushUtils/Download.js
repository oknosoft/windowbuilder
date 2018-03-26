/**
 * Обновляет заказы и продукции из облака
 *
 * @module Download
 *
 * Created by Evgeniy Malyarov on 24.03.2018.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Progress from './Progress';

class Download extends Progress {

  componentDidMount() {

    const {local, remote, authorized} = $p.adapters.pouch;
    const {moment} = $p.utils;

    if(local.doc === remote.doc) {
      this.setState({error: `В режиме 'direct', синхронизация заказов не требуется`});
      return;
    }

    if(!authorized) {
      this.setState({error: `Пользователь должен быть авторизован на сервере`});
      return;
    }

    this.timer = setInterval(this.progress, 700);

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
        return this.props.sync_orders.call(this, docs, keys);
      })
      .then(({rows}) => {
        const docs = rows.filter((v) => v.doc).map((v) => v.doc);
        return this.props.sync_products.call(this, docs);
      })
      .then(() => {
        return this.props.rebuild_indexes.call(this);
      })
      .catch((err) => {
        this.setState({error: err.message || 'Ошибка синхронизации заказов'});
      });

  }

}

Download.propTypes = {
  dialog: PropTypes.object.isRequired,
  handleCancel: PropTypes.func.isRequired,
  sync_orders: PropTypes.func.isRequired,
};

export default Download;
