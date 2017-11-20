/**
 * ### Форма добавления услуг и комплектуюущих
 * список элементов группы - конкретные подоконники, отливы и т.д.
 *
 * Created by Evgeniy Malyarov on 13.11.2017.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {ListItem, ListItemSecondaryAction, ListItemText} from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import AddIcon from 'material-ui-icons/AddCircleOutline';
import RemoveIcon from 'material-ui-icons/Delete';
import Divider from 'material-ui/Divider';
import Collapse from 'material-ui/transitions/Collapse';
import withStyles from './styles';


class AdditionsGroup extends React.Component {

  constructor(props) {
    super(props);
    this.state = {count: props.count};
  }

  handleAdd = () => {
    this.tabular && this.tabular.handleAdd();
    this.setState({
      count: this.state.count + 1,
    });
  };

  handleRemove = () => {
    this.tabular && this.tabular.handleRemove();
    if(this.state.count) {
      this.setState({
        count: this.state.count - 1,
      });
    }
  };

  render() {

    const {props, state: {count}, handleAdd, handleRemove} = this;
    const {Renderer, group, dp, classes, scheme, meta} = props;
    const {ref, presentation} = group;
    const style = {flex: 'initial'};
    if(count) {
      style.minHeight = 120 + (33 * (count - 1));
      style.maxHeight = 320;
    }

    return <div style={style}>
      <ListItem disableGutters className={classes.listitem}>
        <IconButton title="Добавить строку" onClick={handleAdd}><AddIcon/></IconButton>
        <IconButton title="Удалить строку" disabled={!count} onClick={handleRemove}><RemoveIcon/></IconButton>
        <ListItemText primary={presentation}/>
        <ListItemSecondaryAction className={classes.secondary}>{count ? `${count} шт` : ''}</ListItemSecondaryAction>
      </ListItem>

      <Collapse in={!!count} timeout={100} classes={{entered: classes.entered}}>
        <div style={{height: style.minHeight + 35}}>
          <Renderer
            tref={(el) => this.tabular = el}
            minHeight={style.minHeight}
            dp={dp}
            group={group}
            scheme={scheme}
            meta={meta}
          />
        </div>
      </Collapse>

      {!count && <Divider key={`d${ref}`}/>}

    </div>;
  }

}

AdditionsGroup.propTypes = {
  dp: PropTypes.object.isRequired,
  group: PropTypes.object.isRequired,
  scheme: PropTypes.object.isRequired,
  count: PropTypes.number.isRequired,
  Renderer: PropTypes.func,
};

export default withStyles(AdditionsGroup);

