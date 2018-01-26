/**
 * ### Форма добавления услуг и комплектуюущих
 * список групп (подоконники, услуги и т.д.)
 * Здесь есть немного работы с данными - создаём экземпляр обработки, находим варианты настроек
 *
 * Created by Evgeniy Malyarov on 13.11.2017.
 */

import React from 'react';
import PropTypes from 'prop-types';
import List, {ListItem, ListItemText} from 'material-ui/List';
import AdditionsGroup from './AdditionsGroup';
import {alasql_schemas, fill_data} from './connect';


export default class AdditionsGroups extends React.Component {

  state = {schemas: null};

  // заполняет соответствие схем и типов вставок в state компонента
  fill_schemas(docs = []) {
    const schemas = new Map();
    const {scheme_settings} = $p.cat;
    for (const doc of docs) {
      for (const item of this.items) {
        if(doc.name == item.name) {
          schemas.set(item, scheme_settings.get(doc));
          break;
        }
      }
    }
    this.setState({schemas});
  }

  componentWillMount() {
    fill_data.call(this, this.props.dialog.ref);
  }

  componentDidMount() {
    this.fill_schemas(alasql_schemas());
  }

  render() {
    const {items, components, dp} = this;
    const {schemas} = this.state || {};

    return <List>
      {schemas ?
        items.map(group => {
          const cmp = components.get(group);
          return <AdditionsGroup
            key={`${group.ref}`}
            dp={dp}
            group={group}
            {...cmp}
            scheme={schemas.get(group)}
          />;

        })
        :
        <ListItem>
          <ListItemText primary="Чтение настроек компоновки..."/>
        </ListItem>
      }
    </List>;
  }

}

AdditionsGroups.propTypes = {
  dialog: PropTypes.object.isRequired,
};


