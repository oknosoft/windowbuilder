
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
import AddIcon from '@material-ui/icons/AddCircleOutline';
import RemoveIcon from '@material-ui/icons/DeleteOutline';
import ArrowUpIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownIcon from '@material-ui/icons/ArrowDownward';
import FlipCameraAndroidIcon from '@material-ui/icons/FlipCameraAndroid';
import VerticalAlignBottomIcon from '@material-ui/icons/VerticalAlignBottom';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import TabularSection from 'metadata-react/TabularSection';
import Tip from 'metadata-react/App/Tip';
import GlassLayerProps from './GlassLayerProps';
import CompositeChains from './GlassCompositeChains';
import useStyles from './stylesAccordion';
import {useOpenContext} from './OpenContext';

const reflect = ({project, reflect_grp}) => {
  if(reflect_grp) {
    reflect_grp();
  }
  else if(project){
    project.register_change(true);
  }
};

export default function AccordionGlassComposite(props) {
  const {elm}  = props;
  const classes = useStyles();

  const [length, set_length] = React.useState(elm.ox.glass_specification.find_rows({elm: elm.elm}).length);
  const {open, openChange} = useOpenContext();
  const onChange = (e, composite) => {
    openChange({composite});
  };

  const update_length = () => {
    set_length(elm.ox.glass_specification.find_rows({elm: elm.elm}).length);
  };

  return <Accordion square elevation={0} classes={{expanded: classes.rootExpanded}} expanded={open.composite} onChange={onChange}>
    <AccordionSummary classes={{
      root: classes.summary,
      content: classes.summaryContent,
      expanded: classes.summaryExpanded,
      expandIcon: classes.icon,
    }}>
      <FormControl classes={{root: classes.control}}>
        <InputLabel classes={{shrink: classes.lshrink, formControl: classes.lformControl}}>
          Состав пакета
        </InputLabel>
        <Input
          classes={{root: classes.iroot, input: classes.input}}
          readOnly
          value={`${length} элем.`}
          endAdornment={<InputAdornment position="end" classes={{root: classes.input}}>
            <ArrowDropDownIcon />
          </InputAdornment>}
        />
      </FormControl>
    </AccordionSummary>
    <AccordionDetails classes={{root: classes.details}}>
      <GlassComposite {...props} update_length={update_length} length={length}/>
    </AccordionDetails>
  </Accordion>;
}
AccordionGlassComposite.propTypes = {
  elm: PropTypes.object, // элемент составного заполнения
};

class GlassComposite extends React.Component {

  constructor(props, context) {
    super(props, context);
    const {cat, utils} = $p;
    const {region} = props.elm.inset;
    this._meta = utils._clone(cat.characteristics.metadata('glass_specification'));
    cat.scheme_settings.find_rows({obj: 'cat.characteristics.glass_specification'}, (scheme) => {
      if(!this.scheme || scheme.name.endsWith(region ? 'region' : 'main')) {
        this.scheme = scheme;
      }
    });
  }

  componentDidMount() {
    $p.cat.characteristics.on('update', this.value_change);
  }

  componentWillUnmount() {
    $p.cat.characteristics.off('update', this.value_change);
  }

  shouldComponentUpdate({elm, row}) {
    const {props, _grid} = this;
    if(_grid && (props.elm !== elm || row === null)) {
      setTimeout(() => {
        const row = _grid.rowGetter(0);
        if(row) {
          props.set_row(row);
          _grid._grid.selectCell({rowIdx: 0, idx: 0}, false);
        }
      });
    }
    return props.elm !== elm || props.row !== row;
  }

  value_change = (obj, flds) => {
    if(obj instanceof $p.CatCharacteristicsGlass_specificationRow && ('inset' in flds || 'dop' in flds)) {
      reflect(this.props.elm);
      this.forceUpdate();
    }
  };

  filter = (collection) => {
    const {elm} = this.props.elm;
    const res = [];
    collection.find_rows({elm}, (row) => {
      res.push(row);
    });
    return res;
  };

  handleAdd = () => {
    const {_grid, props} = this;
    const {ox, elm} = props.elm;

    const row = ox.glass_specification.add({elm});
    props.update_length();

    //selectRow
    if(_grid) {
      _grid.handleFilterChange();
      for (let i = 0; i < row.row; i++) {
        if(_grid.rowGetter(i) === row) {
          setTimeout(() => _grid._grid.selectCell({rowIdx: i, idx: 0}, true));
          break;
        }
      }
    }
  };

  handleRemove = () => {
    const {_grid, props: {elm, set_row, update_length}} = this;
    if(_grid) {
      const {selected} = _grid.state;
      if(selected && selected.hasOwnProperty('rowIdx')) {
        _grid.handleRemove();
        reflect(elm);
        update_length();
        if(_grid.rowGetter(0)) {
          setTimeout(() => {
            _grid._grid.selectCell({rowIdx: 0, idx: 0}, false);
          });
        }
        else {
          set_row(null);
        }
      }
    }
  };

  handleUp = () => {
    const {_grid, props: {elm}} = this;
    if(_grid) {
      _grid.handleUp();
      reflect(elm);
    }
  };

  handleDown = () => {
    const {_grid, props: {elm}} = this;
    if(_grid) {
      _grid.handleDown();
      reflect(elm);
    }
  };

  handleByInset = () => {
    const {elm, set_row} = this.props;
    elm.set_inset(elm.inset, false, true);
    set_row(null, true);
    elm.project.register_change();
  };

  handleReverse = () => {
    const {elm, set_row} = this.props;
    const {glass_specification} = elm.ox;
    const rows = glass_specification.find_rows({elm: elm.elm})
      .map(({row, _row, ...other}) => other).reverse();
    glass_specification.clear({elm: elm.elm});
    for(const row of rows){
      glass_specification.add(row, true, null, true);
    }
    set_row(null, true);
    elm.project.register_change();
  };

  Toolbar = (props) => {
    const {width} = props;
    const {_grid, props: {elm, set_row}} = this;
    return <Toolbar disableGutters style={{width: width || '100%'}}>
      <Tip title="Добавить вставку">
        <IconButton onClick={this.handleAdd}><AddIcon /></IconButton>
      </Tip>
      <Tip title="Удалить строку">
        <IconButton onClick={this.handleRemove}><RemoveIcon /></IconButton>
      </Tip>
      <IconButton disabled>|</IconButton>
      <Tip title="Переместить вверх">
        <IconButton onClick={this.handleUp}><ArrowUpIcon/></IconButton>
      </Tip>
      <Tip title="Переместить вниз">
        <IconButton onClick={this.handleDown}><ArrowDownIcon/></IconButton>
      </Tip>
      <IconButton disabled>|</IconButton>
      <Tip title="Заполнить по вставке">
        <IconButton onClick={this.handleByInset}><VerticalAlignBottomIcon/></IconButton>
      </Tip>
      <CompositeChains _grid={_grid} elm={elm} set_row={set_row} />
      <Tip title="Перевернуть состав">
        <IconButton onClick={this.handleReverse}><FlipCameraAndroidIcon/></IconButton>
      </Tip>
    </Toolbar>;
  };

  handleRef = (el) => {
    this._grid = el;
  };

  handleCellSelected = (sel, row) => {
    if(!row && sel && sel.hasOwnProperty('rowIdx')) {
      row = this._grid.rowGetter(sel.rowIdx);
    }
    this.props.set_row(row);
  };

  render() {

    const {elm, row, length}  = this.props;
    let height = 172;
    if(length > 2) {
      height += (length -2) * 35;
    }
    if(height < 220) {
      height = 220;
    }

    return <>
      {this.scheme ? <>
        <div style={{height}}>
          <TabularSection
            ref={this.handleRef}
            _obj={elm.ox}
            _meta={this._meta}
            _tabular="glass_specification"
            scheme={this.scheme}
            filter={this.filter}
            disable_cache
            denyAddDel
            denySort
            Toolbar={this.Toolbar}
            onCellSelected={this.handleCellSelected}
          />
        </div>
        <GlassLayerProps elm={elm} row={row} inset={row && row.inset}/>
      </>
      :
        <Typography color="error">
          {`Не найден элемент scheme_settings {obj: "cat.characteristics.glass_specification", name: "glass_specification.main"}`}
        </Typography>}
    </>;
  }
}
GlassComposite.propTypes = {
  elm: PropTypes.object, // элемент составного заполнения
  row: PropTypes.object, // строка состава
  set_row: PropTypes.func, // метод
};
