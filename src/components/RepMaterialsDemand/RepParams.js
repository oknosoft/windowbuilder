import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import AddIcon from 'material-ui-icons/AddCircleOutline';
import RemoveIcon from 'material-ui-icons/Delete';
import TabularSection from 'metadata-react/TabularSection';
import SelectOrder from './SelectOrder';

import withStyles from 'metadata-react/Header/toolbar';

class SettingsToolbar extends Component {

  static propTypes = {
    handleAdd: PropTypes.func,             // обработчик добавления объекта
    handleRemove: PropTypes.func,          // обработчик удаления строки
    handleCustom: PropTypes.func,
    classes: PropTypes.object.isRequired,
  };

  render() {

    const {handleAdd, handleRemove, handleCustom, classes} = this.props;

    return (

      <Toolbar className={classes.bar}>
        <IconButton title="Добавить строку" onClick={handleAdd}><AddIcon/></IconButton>
        <IconButton title="Удалить строку" onClick={handleRemove}><RemoveIcon/></IconButton>

        <Typography type="title" color="inherit" className={classes.flex}> </Typography>

        <SelectOrder handleSelect={handleCustom}/>

      </Toolbar>
    );
  }
}

const StyledToolbar = withStyles(SettingsToolbar);

export default class RepParams extends Component {

  static propTypes = {
    handleAdd: PropTypes.func,             // обработчик добавления объекта
    handleRemove: PropTypes.func,          // обработчик удаления строки
    _obj: PropTypes.object.isRequired,
  };

  handleCustom = (row, _mgr) => {
    this.props._obj.fill_by_order(row, _mgr)
      .then((objs) => {
        this.production.forceUpdate();
      });
  };

  render() {

    const {handleAdd, handleRemove, _obj} = this.props;

    return (

      <TabularSection
        _obj={_obj}
        _tabular="production"
        ref={(el) => this.production = el}
        minHeight={308}
        Toolbar={StyledToolbar}
        handleAdd={handleAdd}
        handleRemove={handleRemove}
        handleCustom={this.handleCustom}
      />
    );
  }

}

