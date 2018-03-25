/**
 * Загружает шаблоны из облака
 * Имеет смысл только для  push автономного режима работы
 *
 * @module Templates
 *
 * Created by Evgeniy Malyarov on 24.03.2018.
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { LinearProgress } from 'material-ui/Progress';

class Templates extends Component {

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

        const keys = [];
        for (const {production} of docs) {
          if(production) {
            for (const row of production) {
              keys.push(`cat.characteristics|${row.characteristic}`);
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
        return difs.rows.reduce((sum, keys, index) => {
          return sum.then(() => {
            this.setState({step: `Обработано ${index * 100} из ${difs.length} характеристик продукций`});
            return remote.doc.allDocs({include_docs: true, keys})
              .then(({rows}) => {
                const deleted = rows.filter((v) => !v.doc);
                return local.doc.bulkDocs(rows.filter((v) => v.doc).map((v) => v.doc), {new_edits: false});
              });
          });
        }, Promise.resolve());
      })
      .then(() => {
        if(this.timer) {
          clearInterval(this.timer);
          this.timer = 0;
        };
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
      const diff = Math.random() * 10;
      const diff2 = Math.random() * 10;
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

Templates.propTypes = {
  dialog: PropTypes.object.isRequired,
};

export default Templates;
