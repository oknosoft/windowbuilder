/**
 * ### Форма добавления услуг и комплектуюущих
 * список элементов группы - конкретные подоконники, отливы и т.д.
 *
 * Created by Evgeniy Malyarov on 13.11.2017.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {ListItem, ListItemText} from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import Divider from 'material-ui/Divider';


export default class AdditionsGroup extends React.Component {

  constructor(props) {
    super(props);
    this.state = {checked: false};
  }

  handleToggle = () => {
    this.setState({
      checked: !this.state.checked,
    });
  };

  renderRows(Row) {
    return Row && <Row />;
  }

  render() {

    const {Row, group} = this.props;
    const {checked} = this.state;
    const {ref, presentation} = group;

    return [
      <ListItem
        key={`l${ref}`}
        onClick={this.handleToggle}
      >
        <Checkbox
          checked={checked}
          tabIndex={-1}
          disableRipple
        />
        <ListItemText primary={presentation}/>

      </ListItem>,

      checked && <p key={`p${ref}`}>{`свойства ${presentation}`}</p>,

      checked && this.renderRows(Row),

      <Divider key={`d${ref}`}/>,
    ];
  }

}

AdditionsGroup.propTypes = {
  group: PropTypes.object.isRequired,
};


