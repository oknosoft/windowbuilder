/**
 * Отправляет ссылку на заказ некому сотруднику
 *
 * @module Share
 *
 * Created by Evgeniy Malyarov on 24.03.2018.
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';

class Share extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      error: '',
      doc: null,
      users: null,
    };
    const {ref} = this.props.dialog;
    const {current_user} = $p;

    if($p.utils.is_empty_guid(ref)) {
      this.state.error = 'При открытии из формы списка, укажите текущую строку заказа, который собираетесь отправить сотруднику';
    }
    else if(!current_user || current_user.branch.empty()) {
      this.state.error = 'Нельзя поделиться заказом центральной базы - только из базы отдела';
    }

  }

  componentDidMount() {
    const {state: {error}, props: {dialog}} = this;
    const users = new Map();

    if(!error) {
      const doc = $p.doc.calc_order.get(dialog.ref);
      const {branch} = $p.current_user;
      (doc.is_new() ? doc.load() : Promise.resolve())
        .then(() => {
          $p.cat.users.find_rows({branch, push_only: true}, (o) => users.set(o, {}));
          if(users.size < 1) {
            this.setState({error: `Некому отправлять, в филиале "${branch.name}", нет сотрудников с push-репликацией`});
          }
          else {
            // получим local-документы пользователей
            $p.adapters.pouch.remote.doc.allDocs({
              include_docs: true,
              keys: Array.from(users.keys()).map((v) => `_local/inbox_${v.ref}`)
            })
              .then(({rows}) => {
                for (const row of rows) {
                  const map = users.get($p.cat.users.get(row.key.replace('_local/inbox_', '')));
                  if(row.error) {
                    map._id = row.key;
                  }
                  else {
                    Object.assign(map, row.doc);
                  }
                }
                this.setState({doc, users});
              })
              .catch((err) => {
                this.setState({error: err.message || `Ошибка доступа к _local/inbox_`});
              });
          }
        });
    }
  }

  handleToggle = value => () => {
    const map = this.state.users.get(value);
    const {ref} = this.state.doc;
    const {doc} = $p.adapters.pouch.remote;
    if(Object.prototype.hasOwnProperty.call(map, ref)) {
      delete map[ref];
    }
    else {
      map[ref] = true;
    }

    // результат сразу записываем
    doc.get(map._id)
      .catch((err) => {
        if(err.status != 404) {
          throw err;
        }
        return map;
      })
      .then((rdoc) => {
        if(rdoc !== map) {
          if(Object.prototype.hasOwnProperty.call(rdoc, ref)) {
            delete rdoc[ref];
          }
          else {
            rdoc[ref] = true;
          }
        }
        return doc.put(rdoc);
      })
      .then(() => {
        this.forceUpdate();
      })
      .catch((err) => {
        this.setState({error: err.message || `Не удалось записать ${map._id}`});
      });
  };

  render() {

    const {error, doc, users} = this.state;

    if(error) {
      return <div>{error}</div>;
    }

    if(!doc) {
      return <div>Подготовка данных...</div>;
    }

    return [
        <Typography variant="subtitle1" key="doc" gutterBottom>{doc.presentation}</Typography>,
        <List key="list">
          {Array.from(users.keys()).map(value => (
            <ListItem
              key={value.ref}
              button
              onClick={this.handleToggle(value)}
            >
              <Checkbox
                checked={!!users.get(value)[doc.ref]}
                tabIndex={-1}
                disableRipple
              />
              <ListItemText primary={value.name} />
            </ListItem>
          ))}
        </List>
      ];

  }
}

Share.propTypes = {
  dialog: PropTypes.object.isRequired,
};

export default Share;
