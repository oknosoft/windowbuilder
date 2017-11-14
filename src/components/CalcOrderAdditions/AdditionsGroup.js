/**
 * ### Форма добавления услуг и комплектуюущих
 * список элементов группы - конкретные подоконники, отливы и т.д.
 *
 * Created by Evgeniy Malyarov on 13.11.2017.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {ListItem, ListItemSecondaryAction, ListItemText} from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import Divider from 'material-ui/Divider';
import Collapse from 'material-ui/transitions/Collapse';
import withStyles from './styles';


class AdditionsGroup extends React.Component {

  constructor(props) {
    super(props);
    this.state = {checked: false};
  }

  handleToggle = () => {
    this.setState({
      checked: !this.state.checked,
    });
  };

  render() {

    const {Row, group, dp, classes} = this.props;
    const {checked} = this.state;
    const {ref, presentation} = group;
    const style = {flex: 'initial'};
    if(checked) {
      style.minHeight = 180;
      style.maxHeight = 320;
    }

    return <div style={style}>
      <ListItem disableGutters className={classes.listitem} onClick={this.handleToggle}>
        <Checkbox checked={checked} tabIndex={-1} disableRipple/>
        <ListItemText primary={presentation}/>
        <ListItemSecondaryAction>1 шт</ListItemSecondaryAction>
      </ListItem>

      <Collapse in={checked} timeout={50} classes={{entered: classes.entered}}>
        {!Row && <p key={`p${ref}`}>{`свойства ${presentation}`}</p>}
        {Row && <Row group={group} dp={dp}/>}
      </Collapse>

      {!checked && !Row && <Divider key={`d${ref}`}/>}

    </div>;
  }

}

AdditionsGroup.propTypes = {
  group: PropTypes.object.isRequired,
};

export default withStyles(AdditionsGroup);

