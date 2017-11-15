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

import ItemSill from './AdditionsItemSill';

const alasql_schemas = $p.wsql.alasql.compile('select * from cat_scheme_settings where obj="dp.buyers_order.production"');

export default class AdditionsGroups extends React.Component {

  constructor(props, context) {
    super(props, context);
    const {Подоконник, Водоотлив, МоскитнаяСетка, Откос, Монтаж} = $p.enm.inserts_types;
    this.items = [Подоконник, Водоотлив, МоскитнаяСетка, Откос, Монтаж];
    this.dp = $p.dp.buyers_order.create();
    this.dp.calc_order = $p.doc.calc_order.by_ref[props.dialog.ref];
    this.components = new Map([
      [Подоконник, ItemSill],
    ]);
    this.state = {schemas: null};
  }

  fill_schemas(docs = []) {
    const schemas = new Map();
    const {scheme_settings} = $p.cat;
    for(const doc of docs){
      for(const item of this.items){
        if(doc.name == item.name){
          schemas.set(item, scheme_settings.get(doc));
          break;
        }
      }
    }
    this.setState({schemas})
  }

  componentDidMount() {
    const schemas = alasql_schemas();
    if(schemas.length){
      return this.fill_schemas(schemas);
    }
    $p.cat.scheme_settings.find_schemas('dp.buyers_order.production')
      .then((schemas) => {
        this.fill_schemas(schemas);
      });
  }

  render() {
    const {items, components, dp} = this;
    const {schemas} = this.state;
    return <List>
      {schemas ?
        items.map(group => <AdditionsGroup
          key={`${group.ref}`}
          dp={dp}
          group={group}
          Row={components.get(group)}
          scheme={schemas.get(group)}
        />)
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


