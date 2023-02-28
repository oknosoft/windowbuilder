/**
 * Вставки в элемент
 *
 * Created by Evgeniy Malyarov on 25.08.2021.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import TabularSection from 'metadata-react/TabularSection';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import RemoveIcon from '@material-ui/icons/DeleteOutline';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import ElmInsetProps from './ElmInsetProps';
import RegionEditor from './ElmInsetRegion';
import useStyles from './stylesAccordion';

function tune_meta(elm) {
  const {cat, utils} = $p;
  const _meta = utils._clone(cat.characteristics.metadata('inserts'));
  const path = elm.inset.offer_insets(elm);
  _meta.fields.inset.choice_params = path.length ? [{name: 'ref', path}] : [];
  return _meta;
}

export default function AccordionElmInsets(props) {
  const {elm} = props;
  const classes = useStyles();
  const _meta = tune_meta(elm);

  const [length, set_length] = React.useState(elm.ox.inserts.find_rows({cnstr: -elm.elm}).length);

  if(!_meta.fields.inset.choice_params.length) {
    return null;
  }

  const update_length = () => {
    set_length(elm.ox.inserts.find_rows({cnstr: -elm.elm}).length);
  };

  return <Accordion square elevation={0} classes={{expanded: classes.rootExpanded}}>
    <AccordionSummary classes={{
      root: classes.summary,
      content: classes.summaryContent,
      expanded: classes.summaryExpanded,
      expandIcon: classes.icon,
    }}>
      <FormControl classes={{root: classes.control}}>
        <InputLabel classes={{shrink: classes.lshrink, formControl: classes.lformControl}}>
          {elm.elm > 0 ? 'Вложенные вставки' : `Вставки в ${elm.info}`}
        </InputLabel>
        <Input
          classes={{root: classes.iroot, input: classes.input}}
          readOnly
          value={length ? `${length} шт.` : 'Не заданы'}
          endAdornment={<InputAdornment position="end" classes={{root: classes.input}}>
            <ArrowDropDownIcon />
          </InputAdornment>}
        />
      </FormControl>
    </AccordionSummary>
    <AccordionDetails classes={{root: classes.details}}>
      <ElmInsets {...props} _meta={_meta} update_length={update_length} length={length}/>
    </AccordionDetails>
  </Accordion>;
}
AccordionElmInsets.propTypes = {
  elm: PropTypes.object.isRequired,
};
class ElmInsets extends React.Component {

  constructor(props, context) {
    super(props, context);

    $p.cat.scheme_settings.find_rows({obj: 'cat.characteristics.inserts'}, (scheme) => {
      if(!this.scheme || scheme.name.endsWith('main')) {
        this.scheme = scheme;
      }
    });
    this.state = {row: null, inset: null};
  }

  filter = (collection) => {
    const {elm} = this.props.elm;
    const res = [];
    collection.find_rows({cnstr: -elm}, (row) => {
      res.push(row);
    });
    return res;
  };

  defferedUpdate = () => {
    setTimeout(() => {
      this._grid && this._grid.forceUpdate();
    }, 100);
  };

  handleAdd = () => {
    const {elm, update_length} = this.props;
    const {ox, elm: cnstr, inset} = elm;

    $p.ui.dialogs.input_value({
      title: 'Укажите вставку',
      list: inset.offer_insets(elm),
    })
      .then((inset) => {
        const row = ox.inserts.add({cnstr: -cnstr, inset});
        return row;
      })
      .then((row) => {
        if(this._grid) {
          this._grid.cache_actual = false;
        }
        this.setState({row, inset: row.inset}, update_length);
      });
  };

  handleRemove = () => {
    const row = this._grid.handleRemove();
    if(row?.region) {
      const {_ranges, paths} = this.props.elm._attr;
      _ranges.delete(row.region);
      _ranges.delete(`cnns${row.region}`);
      if(paths.get(row.region)) {
        paths.get(row.region).remove();
        paths.delete(row.region);
      }
    }
    this.setState({row: null, inset: null}, this.props.update_length);
  };

  handleRef = (el) => {
    this._grid = el;
  };

  handleCellSelected = (sel, row) => {
    if(!row && sel && sel.hasOwnProperty('rowIdx')) {
      row = this._grid.rowGetter(sel.rowIdx);
    }
    this.setState({row, inset: (!row || row.inset.empty()) ? null : row.inset});
  };

  // установим для колонки "Ряд", индивидуальный элемент управления
  handleColumnsChange = ({scheme, columns}) => { /* eslint-disable-line */
    const region = columns.find(({key}) => key === 'region');
    if(region) {
      region.editor = RegionEditor;
    }
  };


  render() {

    const {props: {elm, _meta, length}, state: {row, inset}} = this;
    let height = 110;
    if(length > 1) {
      height = 90 + (length -1) * 35;
    }

    return <>
      <Toolbar disableGutters variant="dense">
        <IconButton key="btn_add" title="Добавить вставку" onClick={this.handleAdd}><AddIcon /></IconButton>
        <IconButton key="btn_del" title="Удалить строку" onClick={this.handleRemove}><RemoveIcon /></IconButton>
      </Toolbar>
      {this.scheme ? <>
          <div style={{height}}>
            <TabularSection
              ref={this.handleRef}
              _obj={elm.ox}
              _meta={_meta}
              _tabular="inserts"
              scheme={this.scheme}
              filter={this.filter}
              disable_cache
              minHeight={110}
              hideToolbar
              denyReorder
              onCellSelected={this.handleCellSelected}
              columnsChange={this.handleColumnsChange}
              //onRowUpdated={this.defferedUpdate}
            />
          </div>
          <ElmInsetProps elm={elm} inset={inset} row={row}/>
        </>
        :
        <Typography color="error">
          {`Не найден элемент scheme_settings {obj: "cat.characteristics.inserts", name: "inserts.main"}`}
        </Typography>}
    </>;
  }
}

ElmInsets.propTypes = {
  elm: PropTypes.object.isRequired,
  update_length: PropTypes.func,
};
