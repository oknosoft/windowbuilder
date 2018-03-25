/**
 * Обновляет заказы и продукции из облака
 *
 * @module Download
 *
 * Created by Evgeniy Malyarov on 24.03.2018.
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { LinearProgress } from 'material-ui/Progress';

class Download extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      error: '',
      step: 'Подготовка данных...',
      docs: null,
      prods: null,
      completed: 0,
      buffer: 10,
    };
    this.timer = 0;
  }

  componentDidMount() {
    // получаем локальные и серверные шаблоны
    const {local, remote, authorized} = $p.adapters.pouch;
    const {moment} = $p.utils;

    if(local.doc === remote.doc) {
      this.setState({error: `В режиме 'direct', синхронизация шаблонов не требуется`});
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
        this.setState({step: 'Сравниваем версии заказов local и remote...', completed: 0, buffer: 10});
        const keys = docs.filter((v) => v.state !== 'template').map((v) => v._id)
        return remote.doc.allDocs({keys})
          .then(({rows}) => {
            const diff = [];
            for(const rdoc of rows) {
              if(rdoc.value){
                if(!docs.some((doc) => {
                    return doc._id === rdoc.id && doc._rev === rdoc.value.rev;
                  })) {
                  diff.push(rdoc.id);
                }
              }
              else {
                // TODO: обработать пометку удаления
              }
            }
            return {ldoc: keys, diff};
          });
      })
      .then(({ldoc, diff}) => {
        if(diff.length) {
          this.setState({step: 'Получаем объекты заказов с сервера...', completed: 0, buffer: 10});
          return remote.doc.allDocs({include_docs: true, keys: diff})
            .then(({rows}) => {
              return local.doc.bulkDocs(rows.filter((v) => v.doc && !v.doc._attachments).map(({doc}) => doc), {new_edits: false});
            })
            .then((res) => {
              return local.doc.allDocs({include_docs: true, keys: ldoc});
            });
        }
        else {
          return local.doc.allDocs({include_docs: true, keys: ldoc});
        }
      })
      .then(({rows}) => {
        const keys = [];
        for (const {doc} of rows) {
          if(doc.production) {
            for (const row of doc.production) {
              if(row.characteristic && row.characteristic !== $p.utils.blank.guid) {
                keys.push(`cat.characteristics|${row.characteristic}`);
              }
            }
          }
        }
        this.setState({step: 'Сравниваем версии характеристик продукций...', completed: 0, buffer: 10});
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
        this.setState({step: `Найдено ${difs.length} отличий в характеристиках`, completed: 0, buffer: 10});
        let rows = [];
        for(const dif of diff) {
          if(rows.length < 100) {
            rows.push(dif);
          }
          else {
            difs.rows.push(rows);
            rows = [dif];
          }
        }
        if(rows.length) {
          difs.rows.push(rows);
        }
        return difs;
      })
      .then((difs) => {
        // редуцируем
        return difs.rows.reduce((sum, keys, index) => {
          return sum.then(() => {
            this.setState({step: `Обработано ${index * 100} из ${difs.length} характеристик продукций`});
            return remote.doc.allDocs({include_docs: true, keys})
              .then(({rows}) => {
                const deleted = rows.filter((v) => !v.doc);
                return local.doc.bulkDocs(rows.filter((v) => v.doc && !v.doc._attachments).map((v) => v.doc), {new_edits: false});
              });
          });
        }, Promise.resolve());
      })
      .then(() => {
        if(this.timer) {
          clearInterval(this.timer);
          this.timer = 0;
        }
        this.setState({error: 'Обработка завершена'});
        setTimeout(() => {
          this.props.handleCancel();
        }, 2000);
      })
      .catch((err) => {
        this.setState({error: err.message || 'Ошибка синхронизации шаблонов'});
      });

  }

  componentWillUnmount() {
    this.timer && clearInterval(this.timer);
  }

  progress = () => {
    const { completed } = this.state;
    if (completed > 100) {
      this.setState({ completed: 0, buffer: 10 });
    } else {
      const diff = Math.random() * 5;
      const diff2 = Math.random() * 5;
      this.setState({ completed: completed + diff, buffer: completed + diff + diff2 });
    }
  };

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

Download.propTypes = {
  dialog: PropTypes.object.isRequired,
  handleCancel: PropTypes.func.isRequired,
};

export default Download;
