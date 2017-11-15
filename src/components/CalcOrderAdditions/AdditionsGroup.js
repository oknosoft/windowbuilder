/**
 * ### Форма добавления услуг и комплектуюущих
 * список элементов группы - конкретные подоконники, отливы и т.д.
 *
 * Created by Evgeniy Malyarov on 13.11.2017.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {ListItem, ListItemSecondaryAction, ListItemText} from 'material-ui/List';
import IconButton from "material-ui/IconButton";
import AddIcon from "material-ui-icons/AddCircleOutline";
import RemoveIcon from "material-ui-icons/Delete";
import Divider from 'material-ui/Divider';
import Collapse from 'material-ui/transitions/Collapse';
import withStyles from './styles';


class AdditionsGroup extends React.Component {

  constructor(props) {
    super(props);
    this.state = {count: 0};
  }

  handleAdd = () => {
    this.setState({
      count: this.state.count + 1,
    });
  }

  handleRemove = () => {
    if(this.state.count){
      this.setState({
        count: this.state.count - 1,
      });
    }
  }

  render() {

    const {props, state: {count}, handleAdd, handleRemove} = this;
    const {Row, group, dp, classes} = props;
    const {ref, presentation} = group;
    const style = {flex: 'initial'};
    if(count) {
      style.minHeight = 180;
      style.maxHeight = 320;
    }

    return <div style={style}>
      <ListItem disableGutters className={classes.listitem}>
        <IconButton title="Добавить строку" onClick={handleAdd}><AddIcon /></IconButton>
        <IconButton title="Удалить строку" disabled={!count} onClick={handleRemove}><RemoveIcon /></IconButton>
        <ListItemText primary={presentation}/>
        <ListItemSecondaryAction>{count ? `${count} шт` : ''}</ListItemSecondaryAction>
      </ListItem>

      <Collapse in={count} timeout={50} classes={{entered: classes.entered}}>
        {!Row && <p key={`p${ref}`}>{`свойства ${presentation}`}</p>}
        {Row && <Row group={group} dp={dp}/>}
      </Collapse>

      {!count && <Divider key={`d${ref}`}/>}

    </div>;
  }

}

AdditionsGroup.propTypes = {
  group: PropTypes.object.isRequired,
};

export default withStyles(AdditionsGroup);

