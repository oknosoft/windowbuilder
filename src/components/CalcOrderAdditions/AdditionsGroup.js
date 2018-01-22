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
import {find_inset} from './connect';
import withStyles from './styles';


class AdditionsGroup extends React.Component {

  constructor(props) {
    super(props);
    this.state = {count: props.count};
  }

  handleAdd = () => {
    const {tabular, props} = this;
    const inset = find_inset.call(this, props.group);
    if(inset && tabular) {
      tabular.state._tabular.add({inset, quantity: 1}, false, props.ProductionRow);
      tabular.forceUpdate();
      this.setState({
        count: this.state.count + 1,
      });
    }
    else {
      $p.msg.show_msg({
        type: 'alert-info',
        text: `Нет вставки подходящего типа (${props.group})`,
        title: 'Новая строка'
      });
    }
  };

  handleRemove = () => {
    const {props, tabular, state} = this;
    if(tabular){
      const {selected} = tabular._grid.state;
      const row = tabular.rowGetter(selected && selected.hasOwnProperty('rowIdx') ? selected.rowIdx : 0);
      if(row){
        const {calc_order_row} = row.characteristic;
        row._owner.del(row);
        tabular.forceUpdate();
        if(state.count) {
          this.setState({
            count: state.count - 1,
          });
        }
        if(calc_order_row){
          calc_order_row._owner.del(calc_order_row);
        }
      }
      else{
        $p.msg.show_msg({
          type: 'alert-info',
          text: `Укажите строку для удаления (${props.group})`,
          title: 'Удаление строки'
        });
      }
    }
  };

  onRowUpdated = (e, row) => {
    if(e && e.updated.hasOwnProperty('inset')){
      const {meta} = this.props;
      $p.cat.clrs.selection_exclude_service(meta.fields.clr, row.inset);
      if(!row.clr.empty()){
        const filter = meta.fields.clr.choice_params.filter(({name}) =>  name === 'ref');
        if(filter.length) {
          if(filter[0].path.in && !filter[0].path.in.some(v => v == row.clr)){
            row.clr = filter[0].path.in[0];
          }
        }
      }
    }
    this.forceUpdate();
  }

  onCellSelected = (e) => {
    const {props, tabular} = this;
    const {meta} = props;
    if(tabular && tabular.state._columns && tabular.state._columns[e.idx].key == 'clr'){
      const row = tabular.rowGetter(e.rowIdx);
      $p.cat.clrs.selection_exclude_service(meta.fields.clr, row.inset);
    }
  }

  render() {

    const {props, state: {count}, handleAdd, handleRemove} = this;
    const {Renderer, group, dp, classes, scheme, meta} = props;
    const {ref, presentation} = group;
    const style = {flex: 'initial'};
    if(count) {
      style.minHeight = 80 + (33 * (count - 1));
      style.maxHeight = 320;
    }

    function pieces() {
      return scheme.filter(dp.production).reduce((sum, row) => sum + row.quantity, 0);
    }

    return <div style={style}>
      <ListItem disableGutters className={classes.listitem}>
        <IconButton title="Добавить строку" onClick={handleAdd}><AddIcon/></IconButton>
        <IconButton title="Удалить строку" disabled={!count} onClick={handleRemove}><RemoveIcon/></IconButton>
        <ListItemText classes={count ? {text: classes.groupTitle} : {}} primary={presentation}/>
        <ListItemSecondaryAction className={classes.secondary}>{count ? `${pieces()} шт` : ''}</ListItemSecondaryAction>
      </ListItem>

      <Collapse in={!!count} timeout={100} classes={{entered: classes.entered}}>
        <div style={{height: (style.minHeight || 0) + 35}}>
          <Renderer
            tref={(el) => this.tabular = el}
            minHeight={style.minHeight}
            dp={dp}
            group={group}
            scheme={scheme}
            meta={meta}
            onRowUpdated={this.onRowUpdated}
            onCellSelected={this.onCellSelected}
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
  meta: PropTypes.object.isRequired,
  count: PropTypes.number.isRequired,
  Renderer: PropTypes.func,
};

export default withStyles(AdditionsGroup);

