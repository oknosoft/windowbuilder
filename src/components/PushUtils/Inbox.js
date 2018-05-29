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
import LinearProgress from '@material-ui/core/LinearProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

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
        return local.doc.allDocs({keys})
          .then(({rows}) => {
            return this.sync_orders(rows, keys);
          });
      })
      .then(({rows}) => {
        const docs = rows.filter((v) => v.doc).map((v) => v.doc);
        return this.sync_products(docs)
          .then(() => {
            docs.sort((a, b) => {
              const ta = a.timestamp ? a.timestamp.moment : a.date;
              const tb = b.timestamp ? b.timestamp.moment : b.date;
              if(ta > tb) {
                return -1;
              }
              if(tb > ta) {
                return 1;
              }
              return 0;
            });
            if(this.timer){
              clearInterval(this.timer);
              this.timer = 0;
            }
            this.setState({docs});
          });
      })
      .catch((err) => {
        this.setState({error: err.message || `Ошибка доступа к _local/inbox_`});
      });
  }

  handleOpen = value => () => {
    this.props.handleCancel();
    this.props.handleOpen(value);
  }

  render() {
    const {error, step, docs, completed, buffer} = this.state;
    const {moment} = $p.utils;

    if(error) {
      return <div>{error}</div>;
    }

    if(docs) {
      return <List key="list">
        {docs.map(value => {
          const {_id, number_doc, date, posted, timestamp, partner, client_of_dealer, manager} = value;
          return <ListItem
            key={_id}
            button
            onDoubleClick={this.handleOpen(_id)}
          >
            <ListItemText
              primary={`№${number_doc || 'б/н'} от ${moment(date).format(moment._masks.ldt)} (${posted ? '' : 'не '}проведен), ${
              client_of_dealer || $p.cat.partners.get(partner).name || 'Клиент не указан'}`}
              secondary={`${$p.cat.users.get(manager).name || timestamp && timestamp.user}`}
            />
          </ListItem>;
        })}
      </List>;
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
