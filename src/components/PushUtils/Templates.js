/**
 * Загружает шаблоны из облака
 * Имеет смысл только для  push автономного режима работы
 *
 * @module Templates
 *
 * Created by Evgeniy Malyarov on 24.03.2018.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Progress from './Progress';

class Templates extends Progress {

  componentDidMount() {
    // получаем локальные и серверные шаблоны
    const {local, remote, authorized} = $p.adapters.pouch;

    if(local.doc === remote.doc) {
      this.setState({error: `В режиме 'direct', синхронизация шаблонов не требуется`});
      return;
    }

    if(!authorized) {
      this.setState({error: `Пользователь должен быть авторизован на сервере`});
      return;
    }

    this.timer = setInterval(this.progress, 700);

    this.setState({step: 'Синхронизируем базовые справочники...'});
    return new Promise((resolve, reject) => {

      const sync = local.doc.replicate.from(remote.doc, {
        batch_size: 200,
        batches_limit: 6,
        retry: true,
        filter: 'auth/push_only',
        query_params: {user: authorized}
      })
        .on('error', (err) => {
          reject(err);
      })
        .on('complete', () => {
          sync.cancel();
          sync.removeAllListeners();
          resolve();
        });

    })
      .then(() => {
        this.setState({step: 'Получаем документы шаблонов из локальной базы...', completed: 0, buffer: 10});
        return local.doc.find({
          selector: {department: $p.utils.blank.guid, state: 'template'},
          fields: ['_id', 'production'],
          limit: 1000,
        });
      })
      .then(({docs}) => {
        return this.props.sync_products.call(this, docs);
      })
      .then(() => {
        return this.props.rebuild_indexes.call(this);
      })
      .catch((err) => {
        this.setState({error: err.message || 'Ошибка синхронизации шаблонов'});
      });

  }

}

Templates.propTypes = {
  dialog: PropTypes.object.isRequired,
  handleCancel: PropTypes.func.isRequired,
};

export default Templates;
