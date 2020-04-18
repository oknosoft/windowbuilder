/**
 * Форма документа Задание на производство
 *
 * @module FrmObj
 *
 * Created by Evgeniy Malyarov on 24.09.2018.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {Helmet} from 'react-helmet';
import FormGroup from '@material-ui/core/FormGroup';
import IconButton from '@material-ui/core/IconButton';
import IconEvent from '@material-ui/icons/Event';
import IconRotate from '@material-ui/icons/RotateRight';
import IconClose from '@material-ui/icons/Close';

import DataObj from 'metadata-react/FrmObj/DataObj';
import LoadingMessage from 'metadata-react/DumbLoader/LoadingMessage';
import DataObjToolbar from 'metadata-react/FrmObj/DataObjToolbar';
import DataField from 'metadata-react/DataField';
import TabularSection from 'metadata-react/TabularSection';

import withStyles from 'metadata-react/styles/paper600';
import {withIface} from 'metadata-redux';

import SelectOrder from '../RepMaterialsDemand/SelectOrder';
import MenuFillCutting from './MenuFillCutting';
import MenuPrint from './MenuPrint';
import ProgressDialog from './ProgressDialog';

const htitle = 'Задание на производство';
const description = 'Раскрой, потребность в материалах, файлы для станков';
const schemas = {
  planning: 'c864d895-ac50-42be-8760-203cc46d208f',
  demand: 'dab2c503-a426-4bf5-f083-fe6f1c64fbe5',
  cuts_in: '187f9a40-94fc-4ad2-ee4c-26341b816ade',
  cutting: '4fe15a0f-a6c2-442e-d8bb-7204c3085c4e',
  cuts_out: '8fca797a-4e1c-4f8b-b0aa-1965b5e5e7db',
};

function Space({classes, children}) {
  return [<div key="space" className={classes.fullFlex} />, ...children];
}

class FrmObj extends DataObj {

  constructor(props, context) {
    super(props, context);
    Object.assign(this.state, {
      index: 0,
      schemas_ready: typeof schemas.planning === 'object',
      statuses: [],
      run: false,
    });
  }

  componentDidMount() {
    const {_mgr, match} = this.props;

    _mgr.get(match.params.ref, 'promise')
      .then((_obj) => {
        this.setState({_obj}, () => this.shouldComponentUpdate(this.props));
        return _obj.load_production();
      })
      .then((prods) => prods.length && this.forceUpdate());

    _mgr.on('update', this.onDataChange);

    if(!this.state.schemas_ready) {
      const {scheme_settings} = $p.cat;
      const {adapter} = scheme_settings;
      adapter.load_array(scheme_settings, Object.keys(schemas).map((ref) => schemas[ref]), false, adapter.local.templates)
        .then(() => {
          for(const ts in schemas) {
            schemas[ts] = scheme_settings.get(schemas[ts]);
          }
          this.setState({schemas_ready: true});
        });
    }
  }

  handleOrder = (row) => {
    const {_obj} = this.state;
    _obj && _obj.fill_by_orders([row])
      .then(() => this.forceUpdate());
  };

  handlePlan = () => {
    this.props.handleIfaceState({
      component: '',
      name: 'alert',
      value: {open: true, title: 'Заполнить по плану', text: 'Сервис планирования не подключен'}});
  };

  handleFillCutting = (opts) => {
    const {_obj} = this.state;
    _obj && _obj.fill_cutting(opts)
      .then(() => this.forceUpdate());
  };

  handleOptimize = (opts = {}) => {
    const {_obj} = this.state;
    opts.onStep = this.handleOnStep;
    this.setState({statuses: [], run: true});
    _obj && _obj.optimize(opts)
      .then(() => this.setState({run: false}));
  };

  // вызывается из раскроя
  handleOnStep = (status) => {
    const {nom, characteristic} = status.cut_row;
    const statuses = $p.utils._clone(this.state.statuses);
    let row;
    if(!statuses.some((elm) => {
      if(elm.nom === nom && elm.characteristic === characteristic) {
        row = elm;
        return true;
      }
    })) {
      row = {nom, characteristic};
      statuses.push(row);
    }
    Object.assign(row, status);

    this.setState({statuses});
  };


  renderFields(_obj, classes) {
    return (
      <FormGroup key="props" className={classes.spaceLeft}>
        <FormGroup row>
          <DataField _obj={_obj} _fld="number_doc"/>
          <DataField _obj={_obj} _fld="date"/>
          <DataField _obj={_obj} _fld="responsible"/>
        </FormGroup>
        <FormGroup row>
          <DataField _obj={_obj} _fld="key"/>
          <DataField _obj={_obj} _fld="recipient"/>
          <DataField _obj={_obj} _fld="biz_cuts"/>
        </FormGroup>
        <DataField _obj={_obj} _fld="note" fullWidth/>
      </FormGroup>
    );
  }

  render() {
    const {
      props: {_mgr, classes, height},
      state: {_obj, _meta, index, schemas_ready, run, statuses},
      _handlers} = this;
    const toolbar_props = Object.assign({
      posted: _obj && _obj.posted,
      deleted: _obj && _obj.deleted,
      postable: !!(_meta.posted || _mgr.metadata('posted')),
      deletable: false,
    }, _handlers);
    const h = height - 48;

    return _obj ? [
        <Helmet key="helmet" title={htitle}>
          <meta name="description" content={description} />
        </Helmet>,

        <Tabs key="tabs" value={index} onChange={(event, index) => this.setState({index})}>
          <Tab label="Шапка"/>
          <Tab label="План"/>
          <Tab label="Материалы"/>
          <Tab label="Обрезь вход"/>
          <Tab label="Раскрой"/>
          <Tab label="Обрезь выход"/>
          <Space classes={classes}>
            <MenuPrint key="fprint" _obj={_obj}/>
            <IconButton key="fclose" title="Закрыть форму" onClick={_handlers.handleClose}>
              <IconClose/>
            </IconButton>
          </Space>
        </Tabs>,

        index === 0 && <DataObjToolbar key="toolbar" {...toolbar_props} />,

        index === 0 && this.renderFields(_obj, classes),

        index !== 0 && !schemas_ready && <LoadingMessage />,

        index === 1 && schemas_ready && <TabularSection
          key="planning"
          _obj={_obj}
          _tabular="planning"
          minHeight={h}
          scheme={schemas.planning}
          denyReorder
          btns={[
            <IconButton key="a_sep1" disabled>|</IconButton>,
            <SelectOrder key="a_ord" handleSelect={this.handleOrder}/>,
            <IconButton key="a_plan" title="Заполнить по плану" onClick={this.handlePlan}>
              <IconEvent/>
            </IconButton>
          ]}
        />,

        index === 2 && schemas_ready && <TabularSection
          key="demand"
          _obj={_obj}
          _tabular="demand"
          minHeight={h}
          scheme={schemas.demand}
          denyReorder
        />,

        index === 3 && schemas_ready && <TabularSection
          key="cuts_in"
          _obj={_obj}
          _tabular="cuts"
          minHeight={h}
          scheme={schemas.cuts_in}
          denyReorder
        />,

        index === 4 && schemas_ready && <TabularSection
          key="cutting"
          _obj={_obj}
          _tabular="cutting"
          minHeight={h}
          scheme={schemas.cutting}
          denyReorder
          btns={[
            <IconButton key="a_sep1" disabled>|</IconButton>,
            <MenuFillCutting key="a_fill_cut" handleFillCutting={this.handleFillCutting}/>,
            <IconButton key="a_run" title="Оптимизировать раскрой" onClick={this.handleOptimize}>
              <IconRotate/>
            </IconButton>,
          ]}
        />,

        index === 5 && schemas_ready && <TabularSection
          key="cuts_out"
          _obj={_obj}
          _tabular="cuts"
          minHeight={h}
          scheme={schemas.cuts_out}
          denyReorder
        />,

        run && <ProgressDialog key="statuses" statuses={statuses} />,

      ]
      :
      <LoadingMessage />;
  }
}

FrmObj.propTypes = {
  _mgr: PropTypes.object,             // DataManager, с которым будет связан компонент
  _acl: PropTypes.string,             // Права на чтение-изменение
  _meta: PropTypes.object,            // Здесь можно переопределить метаданные

  read_only: PropTypes.object,        // Элемент только для чтения

  handlers: PropTypes.object.isRequired, // обработчики редактирования объекта
};

FrmObj.rname = 'FrmObj';

export default withStyles(withIface(FrmObj));
