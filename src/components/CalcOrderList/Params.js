/**
 * ### Фильтр по статусам, подразделениям и ответственным
 * по сути - редактор табчасти selection текущей scheme_settings
 *
 * @module Params
 *
 * Created by Evgeniy Malyarov on 07.03.2019.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FormGroup from '@material-ui/core/FormGroup';
import DataField from 'metadata-react/DataField';
import ChipList from 'metadata-react/DataField/ChipList';
import withStyles from '@material-ui/core/styles/withStyles';
import {apply_ref_filter} from './scheme_change';


const styles = theme => ({
  group: {
    marginLeft: theme.spacing.unit,
  },
});

const sort = (a, b) => {
  if (a.name < b.name){
    return -1;
  }
  else if (a.name > b.name){
    return 1;
  }
  return 0;
};

class Params extends React.Component {

  constructor(props, context) {
    super(props, context);

    const states = this.obj_delivery_state = [
      {ref: 'draft', name: 'Черновики'},
      {ref: 'sent', name: 'Отправлено'},
      {ref: 'confirmed', name: 'Согласовано'},
      {ref: 'declined', name: 'Отклонено'},
      {ref: 'service', name: 'Сервис'},
      {ref: 'complaints', name: 'Рекламации'},
      {ref: 'template', name: 'Шаблоны'},
      ];
    states._mgr = {
      get(v) {
        for(const el of states) {
          if(el.ref === v) {
            return el;
          }
        }
      },
      class_name: 'enm.obj_delivery_states',
    }

    const {current_user, wsql, cat} = $p;
    const current_department = wsql.get_user_param('current_department');

    const department = this.department = [];
    department._mgr = cat.divisions;

    const manager = this.manager = [];
    manager._mgr = cat.users;

    if(current_user && !current_user.branch.empty()) {
      current_user.branch.divisions.forEach((v) => {
        department.push(v.acl_obj);
      });
      cat.users.find_rows({branch: current_user.branch}, manager.push.bind(manager));
    }
    else {
      cat.divisions.forEach(department.push.bind(department));
      cat.users.forEach(manager.push.bind(manager));
    }


    this.state = {
      obj_delivery_state: [states[0].ref],
      department: [],
      manager: [],
    }

    const {selection} = this.props.scheme;

    if(department.length){
      department.sort(sort);
      selection.find_rows({left_value: 'department', use: true}, (row) => {
        row.right_value && this.state.department.push.apply(this.state.department, row.right_value.split());
      });
    }

    if(manager.length){
      manager.sort(sort);
      selection.find_rows({left_value: 'manager', use: true}, (row) => {
        row.right_value && this.state.manager.push.apply(this.state.manager, row.right_value.split());
      });
    }
  }

  handleChange = (area) => ({target}) => {
    this.setState({[area]: target.value });
    apply_ref_filter.call(this, area, target.value);
  };

  render() {
    const {scheme, handleFilterChange, classes} = this.props;
    const {obj_delivery_state, department, manager} = this.state;
    return <div className={classes.group}>
      <FormGroup key="dates" row>
        <DataField _obj={scheme} _fld="date_from"/>
        <DataField _obj={scheme} _fld="date_till"/>
      </FormGroup>
      <ChipList
        title="Статусы"
        items={this.obj_delivery_state}
        selectedItems={obj_delivery_state}
        handleChange={this.handleChange('obj_delivery_state')}
        fullWidth
      />
      <ChipList
        title="Подразделения"
        items={this.department}
        selectedItems={department}
        handleChange={this.handleChange('department')}
        fullWidth
      />
      <ChipList
        title="Менеджер"
        items={this.manager}
        selectedItems={manager}
        handleChange={this.handleChange('manager')}
        fullWidth
      />
    </div>;
  }

}

Params.propTypes = {
  scheme: PropTypes.object.isRequired,
  handleFilterChange: PropTypes.func.isRequired,
};

export default withStyles(styles)(Params);
