/**
 * ### Форма добавления услуг и комплектуюущих
 * список групп (подоконники, услуги и т.д.)
 *
 * Created by Evgeniy Malyarov on 13.11.2017.
 */

import React from 'react';
import PropTypes from 'prop-types';
import List from 'material-ui/List';
import AdditionsGroup from './AdditionsGroup';

import ItemSill from './AdditionsItemSill';


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
  }

  render() {
    const {items, components, dp} = this;
    return <List>
      {items.map(group => <AdditionsGroup key={`${group.ref}`} group={group} Row={components.get(group)} dp={dp}/>)}
    </List>;
  }

}

AdditionsGroups.propTypes = {
  dialog: PropTypes.object.isRequired,
};


