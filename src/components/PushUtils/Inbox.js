/**
 * Заказы, отправленные сотруднику с push автономным режимом работы
 *
 * @module Inbox
 *
 * Created by Evgeniy Malyarov on 24.03.2018.
 */

import React from 'react';
import Progress from './Progress';
import PropTypes from 'prop-types';
import { LinearProgress } from 'material-ui/Progress';

class Inbox extends Progress {

  init() {

    const {local, remote} = $p.adapters.pouch;

    // получим local-документ текущего пользователя
    this.setState({step: 'Получаем inbox-документ текущего пользователя...'});
    remote.doc.get(`_local/inbox_${$p.current_user.ref}`)
      .then((doc) => {
        this.setState({step: 'Сравниваем версии входящих заказов...'});
        const docs = [];
        for(const ref in doc) {
          if(ref[0] == '_') {
            continue;
          }
          docs.push({ref});
        }
        const keys = docs.map((v) => `doc.calc_order|${v.ref}`);
        return Promise.all([
          local.doc.allDocs({keys}),
          remote.doc.allDocs({keys}),
        ]);
      })
      .then((res) => {
        const ldoc = res[0].rows;
        const diff = [];
        for(const rdoc of res[1].rows) {
          if(!rdoc.value) {
            // TODO: обработать удаление
            continue;
          }
          if(!ldoc.some((doc) => {
              return !doc.error && doc.id === rdoc.id && doc.value.rev === rdoc.value.rev;
            })) {
            diff.push(rdoc.id);
          }
        }
        // формируем массив пачек по 100 элементов
        const difs = {
          length: diff.length,
          rows: []
        };
      })
      .catch((err) => {
        this.setState({error: err.message || `Ошибка доступа к _local/inbox_`});
      });
  }

  render() {
    const {error, step, completed, buffer} = this.state;

    if(error) {
      return <div>{error}</div>;
    }

    return [
      <div key="progress" style={{flexGrow: 1}}>
        <LinearProgress color="secondary" variant="buffer" value={completed} valueBuffer={buffer} />
        <br />
      </div>,
      <div key="text">{step}</div>
    ];
  }
}

Inbox.propTypes = {
  dialog: PropTypes.object.isRequired,
};

export default Inbox;
