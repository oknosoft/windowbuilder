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
import SelectTags from 'metadata-react/DataField/SelectTags';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
  group: {
    marginLeft: theme.spacing.unit,
  },
});

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
    const department = this.department = [

    ];
    department._mgr = cat.divisions;
    if(current_user && !current_user.branch.empty()) {
      current_user.branch.divisions.forEach((v) => {
        department.push(v.acl_obj);
      });
    }
    else {
      cat.divisions.forEach((v) => {
        department.push(v);
      });
    }

    this.state = {
      obj_delivery_state: [states[0].ref],
      department: [],
    }
    if(department.length){
      department.sort((a, b) => {
        if (a.name < b.name){
          return -1;
        }
        else if (a.name > b.name){
          return 1;
        }
        return 0;
      });
      this.state.department.push(current_department && department.some((v) => v == current_department) ? current_department : department[0].ref);
    }
  }

  handleChange = (area) => ({target}) => {
    this.setState({[area]: target.value });
    this.apply_ref_filter(area, target.value);
  };

  apply_ref_filter(left_value, objs) {
    const {selection} = this.props.scheme || {};
    if(!selection) return;
    let row = selection.find({left_value});
    if(!row) {
      row = selection.add({left_value});
    }
    if(!objs.length) {
      row.use = false;
      return;
    }
    row.use = true;
    row.left_value_type = 'path';
    row.right_value_type = this[left_value]._mgr.class_name;

    // для статусов отбор особый
    if(left_value === 'obj_delivery_state') {
      const tmp = [];
      for(const ref of objs) {
        if(ref === 'draft') {
          tmp.push('Черновик');
          tmp.push('Отозван');
        }
        else if(ref === 'sent') {
          tmp.push('Отправлен');
        }
        else if(ref === 'confirmed') {
          tmp.push('Подтвержден');
        }
        else if(ref === 'declined') {
          tmp.push('Отклонен');
        }
        else if(ref === 'template') {
          tmp.push('Шаблон');
        }
      }
      objs = tmp;
    }

    if(objs.length > 1) {
      row.comparison_type = 'in';
      row.right_value = objs.join();
    }
    else {
      row.comparison_type = 'eq';
      row.right_value = objs[0];
    }
  }

  render() {
    const {scheme, handleFilterChange, classes} = this.props;
    const {obj_delivery_state, department} = this.state;
    return <div className={classes.group}>
      <FormGroup key="dates" row>
        <DataField _obj={scheme} _fld="date_from"/>
        <DataField _obj={scheme} _fld="date_till"/>
      </FormGroup>
      <SelectTags
        title="Статусы"
        tags={obj_delivery_state}
        fullWidth
        handleChange={this.handleChange('obj_delivery_state')}
        tagList={this.obj_delivery_state}
        _mgr={this.obj_delivery_state._mgr}
      />
      <SelectTags
        title="Подразделения"
        tags={department}
        fullWidth
        handleChange={this.handleChange('department')}
        tagList={this.department}
        _mgr={this.department._mgr}
      />
    </div>;
  }

}

Params.propTypes = {
  scheme: PropTypes.object.isRequired,
  handleFilterChange: PropTypes.func.isRequired,
};

export default withStyles(styles)(Params);
