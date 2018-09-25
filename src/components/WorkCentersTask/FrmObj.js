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
import Helmet from 'react-helmet';
import FormGroup from '@material-ui/core/FormGroup';
import IconButton from '@material-ui/core/IconButton';

import MDNRComponent from 'metadata-react/common/MDNRComponent';
import LoadingMessage from 'metadata-react/DumbLoader/LoadingMessage';
import DataObjToolbar from 'metadata-react/FrmObj/DataObjToolbar';
import DataField from 'metadata-react/DataField';
import TabularSection from 'metadata-react/TabularSection';

import withStyles from 'metadata-react/styles/paper600';
import {withIface} from 'metadata-redux';
import SelectOrder from '../RepMaterialsDemand/SelectOrder';

const htitle = 'Задание на производство';
const description = 'Раскрой, потребность в материалах, файлы для станков';
const schemas = {
  planning: 'c864d895-ac50-42be-8760-203cc46d208f',
  demand: 'dab2c503-a426-4bf5-f083-fe6f1c64fbe5',
  cuts_in: '187f9a40-94fc-4ad2-ee4c-26341b816ade',
  сutting: '4fe15a0f-a6c2-442e-d8bb-7204c3085c4e',
  cuts_out: '8fca797a-4e1c-4f8b-b0aa-1965b5e5e7db',
};

class FrmObj extends MDNRComponent {

  constructor(props, context) {
    super(props, context);
    const {_mgr, _meta} = props;
    this._handlers = {
      handleSave: this.handleSave.bind(this),
      handleClose: this.handleClose.bind(this),
      handleMarkDeleted: this.handleMarkDeleted.bind(this),
    };
    this.state = {
      _meta: _meta || _mgr.metadata(),
      _obj: null,
      index: 0,
      schemas_ready: typeof schemas.planning === 'object',
    };
  }

  componentDidMount() {
    const {props: {_mgr, match}, state} = this;

    if(!state.schemas_ready) {
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

    _mgr.get(match.params.ref, 'promise').then((_obj) => {
      this.setState({_obj}, () => this.shouldComponentUpdate(this.props));
    });

    _mgr.on('update', this.onDataChange);
  }

  componentWillUnmount() {
    this.props._mgr.off('update', this.onDataChange);
  }

  /* eslint-disable-next-line*/
  onDataChange = (obj, fields) => {
    if(obj === this.state._obj) {
      this.shouldComponentUpdate(this.props);
    }
  }

  handleOrder = (row) => {
    const {_obj} = this.state;
    _obj && _obj.fill_by_orders([row])
      .then(() => this.forceUpdate());
  }

  handleSave() {
    //this.props.handleSave(this.state._obj);
    const {_obj} = this.state;
    _obj && _obj.save()
      .then(() => this.shouldComponentUpdate(this.props))
      .catch((err) => {
        // показываем диалог
        this.props.handleIfaceState({
          component: '',
          name: 'alert',
          value: {open: true, title: _obj.presentation, text: err.reason || err.message}
        });
      });
  }


  handleMarkDeleted() {

  }

  handleClose() {
    const {handlers, _mgr} = this.props;
    const {_obj} = this.state;
    handlers.handleNavigate(`/${_mgr.class_name}/list${_obj ? '/?ref=' + _obj.ref : ''}`);
  }

  handleValueChange(_fld) {
    return (event, value) => {
      const {_obj, handlers} = this.props;
      const old_value = _obj[_fld];
      _obj[_fld] = (value || (event && event.target ? event.target.value : ''));
      handlers.handleValueChange(_fld, old_value);
    };
  }

  get ltitle() {
    const {_meta, _obj} = this.state;
    let ltitle = (_obj && _obj.presentation) || _meta.obj_presentation || _meta.synonym;
    if(_obj && _obj._modified && ltitle[ltitle.length - 1] !== '*') {
      ltitle += ' *';
    }
    return ltitle;
  }


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
      props: {_mgr, classes, handleIfaceState, height},
      state: {_obj, _meta, index, schemas_ready},
      context, _handlers} = this;
    const toolbar_props = Object.assign({
      closeButton: !context.dnr,
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
          <Tab label="Реквизиты"/>
          <Tab label="Планирование"/>
          <Tab label="Материалы"/>
          <Tab label="Обрезь вход"/>
          <Tab label="Раскрой"/>
          <Tab label="Обрезь выход"/>
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
          btns={[
            <IconButton key="a_sep1" disabled>|</IconButton>,
            <SelectOrder key="a_ord" handleSelect={this.handleOrder}/>,
          ]}
        />,

        index === 2 && schemas_ready && <TabularSection key="demand" _obj={_obj} _tabular="demand" minHeight={h} scheme={schemas.demand}/>,

        index === 3 && schemas_ready && <TabularSection key="cuts_in" _obj={_obj} _tabular="cuts" minHeight={h} scheme={schemas.cuts_in}/>,

        index === 4 && schemas_ready && <TabularSection key="сutting" _obj={_obj} _tabular="сutting" minHeight={h} scheme={schemas.сutting}/>,

        index === 5 && schemas_ready && <TabularSection key="cuts_out" _obj={_obj} _tabular="cuts" minHeight={h} scheme={schemas.cuts_out}/>,

      ]
      :
      <LoadingMessage />;
  }
}

FrmObj.propTypes = {
  _mgr: PropTypes.object,             // DataManager, с которым будет связан компонент
  _acl: PropTypes.string,             // Права на чтение-изменение
  _meta: PropTypes.object,            // Здесь можно переопределить метаданные
  _layout: PropTypes.object,          // Состав и расположение полей, если не задано - рисуем типовую форму

  read_only: PropTypes.object,        // Элемент только для чтения

  handlers: PropTypes.object.isRequired, // обработчики редактирования объекта
};

export default withStyles(withIface(FrmObj));
