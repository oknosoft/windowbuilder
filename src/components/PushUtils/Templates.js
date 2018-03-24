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

class Templates extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      error: '',
      step: 'Подготовка данных...',
      docs: null,
      prods: null,
    };
  }

  componentDidMount() {
    // получаем локальные и серверные шаблоны
    const {local, remote} = $p.adapters.pouch;

    if(local.doc === remote.doc) {
      this.setState({error: `В режиме 'direct', синхронизация шаблонов не требуется`});
      return;
    }

    this.setState({step: 'Сравниваем версии шаблонов в локальной базе и на сервере'});

    Promise.all([
      local.doc.find({
        selector: {department: $p.utils.blank.guid, state: 'template'},
        fields: ['_id', '_rev'],
        limit: 1000,
      }),
      remote.doc.find({
        selector: {department: $p.utils.blank.guid, state: 'template'},
        fields: ['_id', '_rev'],
        limit: 1000,
      }),
    ])
      .then((res) => {
        const ldoc = res[0].docs;
        const diff = [];
        for(const rdoc of res[1].docs) {
          if(!ldoc.some((doc) => {
            return doc._id === rdoc._id && doc._rev === rdoc._rev;
            })) {
            diff.push(rdoc);
          }
        }
        return {ldoc, diff};
      })
      .then(({ldoc, diff}) => {
        if(diff.length) {
          this.setState({step: 'Получаем документы шаблонов с сервера'});
          return remote.doc.allDocs({
            include_docs: true,
            keys: diff.map((v) => v._id)
          })
            .then(({rows}) => {
              return local.doc.bulkDocs(rows.map(({doc}) => doc), {new_edits: false});
            })
            .then((res) => {
              const keys = ldoc.map((v) => v._id);
              diff.forEach((dif) => {
                keys.indexOf(dif._id) === -1 && keys.push(dif._id);
              });
              return local.doc.allDocs({include_docs: true, keys});
            });
        }
        else {
          return local.doc.allDocs({include_docs: true, keys: ldoc.map((v) => v._id)});
        }
      })
      .then(({rows}) => {
        this.setState({step: 'Сравниваем версии характеристик продукций'});
        const keys = [];
        for (const {doc} of rows) {
          for (const row of doc.production) {
            keys.push(`cat.characteristics|${row.characteristic}`);
          }
        }
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
        this.setState({step: `Найдено ${difs.length} отличий в характеристиках`});
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
              })
          });
        }, Promise.resolve());
      })
      .catch((err) => {
        this.setState({error: err.message || 'Ошибка синхронизации шаблонов'});
      });

  }

  render() {
    const {error, step, docs, prods} = this.state;
    if(error) {
      return <div>{error}</div>;
    }
    return <div>{step}</div>;
  }
}

Templates.propTypes = {
  dialog: PropTypes.object.isRequired,
};

export default Templates;
