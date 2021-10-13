
import React from 'react';
import Typography from '@material-ui/core/Typography';
import Bar from './Bar';
import TabularSection from 'metadata-react/TabularSection';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import RemoveIcon from '@material-ui/icons/DeleteOutline';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';


export default class GlassComposite extends React.Component {

  constructor(props, context) {
    super(props, context);
    const {cat, utils} = $p;
    this._meta = utils._clone(cat.characteristics.metadata('glass_specification'));
    cat.scheme_settings.find_rows({obj: 'cat.characteristics.glass_specification'}, (scheme) => {
      if(!this.scheme || scheme.name.endsWith('main')) {
        this.scheme = scheme;
      }
    });
    this.state = {row: null, inset: null};
  }

  filter = (collection) => {
    const {elm} = this.props.elm;
    const res = [];
    collection.find_rows({elm}, (row) => {
      res.push(row);
    });
    return res;
  };

  defferedUpdate = () => {
    setTimeout(() => {
      this.forceUpdate();
    }, 100);
  };

  handleAdd = () => {
    const {ox, elm} = this.props.elm;
    /* eslint-disable-next-line */
    const row = ox.glass_specification.add({elm});
    this.defferedUpdate();
  };

  handleRemove = () => {
    this._grid.handleRemove();
    this.defferedUpdate();
  };

  Toolbar = (props) => {
    const {classes, width} = props;
    return <Toolbar disableGutters style={{width: width || '100%'}}>
      <IconButton key="btn_add" title="Добавить вставку" onClick={this.handleAdd}><AddIcon /></IconButton>
      <IconButton key="btn_del" title="Удалить строку" onClick={this.handleRemove}><RemoveIcon /></IconButton>
    </Toolbar>;
  };

  handleRef = (el) => {
    this._grid = el;
  };

  render() {

    const {elm} = this.props;

    return <>
      <Bar>Составной пакет</Bar>
      {this.scheme ? <>
        <div style={{height: 320}}>
          <TabularSection
            ref={this.handleRef}
            _obj={elm.ox}
            _meta={this._meta}
            _tabular="glass_specification"
            scheme={this.scheme}
            filter={this.filter}
            denyAddDel
            denyReorder
            Toolbar={this.Toolbar}
          />
        </div>
          <div style={{height: 200}}>
            <TabularSection
              ref={this.handleRef}
              _obj={elm.ox}
              _meta={this._meta}
              _tabular="glass_specification"
              scheme={this.scheme}
              filter={this.filter}
              denyAddDel
              denyReorder
              Toolbar={this.Toolbar}
            />
          </div>
      </>
      :
        <Typography color="error">
          {`Не найден элемент scheme_settings {obj: "cat.characteristics.glass_specification", name: "glass_specification.main"}`}
        </Typography>}
    </>;
  }
};
