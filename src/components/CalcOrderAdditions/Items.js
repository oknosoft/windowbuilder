/**
 * ### Форма добавления услуг и комплектуюущих
 * список групп (подоконники, услуги и т.д.)
 *
 * Created by Evgeniy Malyarov on 13.11.2017.
 */

import React from 'react';
import PropTypes from 'prop-types';
import List, {ListItem, ListItemSecondaryAction, ListItemText} from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import Divider from 'material-ui/Divider';


export default class Items extends React.Component {

  constructor(props) {
    super(props);
    const {Подоконник, Водоотлив, МоскитнаяСетка, Откос} = $p.enm.inserts_types;
    this.items = [Подоконник, Водоотлив, МоскитнаяСетка, Откос];
    this.state = {
      checked: [0],
    };
  }

  handleToggle = value => () => {
    const {checked} = this.state;
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if(currentIndex === -1) {
      newChecked.push(value);
    }
    else {
      newChecked.splice(currentIndex, 1);
    }

    this.setState({
      checked: newChecked,
    });
  };

  render() {

    return <List>
      {this.items.map(value => {
        const checked = this.state.checked.indexOf(value) !== -1;

        return [
          <ListItem
            key={`l${value.ref}`}
            onClick={this.handleToggle(value)}
          >
            <Checkbox
              checked={checked}
              tabIndex={-1}
              disableRipple
            />
            <ListItemText primary={value.presentation}/>

          </ListItem>,

          checked && <p key={`p${value.ref}`}>`свойства ${value.presentation}`</p>,

          <Divider key={`d${value.ref}`}/>,
        ];
      })}
    </List>;
  }

}


