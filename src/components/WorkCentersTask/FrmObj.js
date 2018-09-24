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

import MDNRComponent from 'metadata-react/common/MDNRComponent';
import LoadingMessage from 'metadata-react/DumbLoader/LoadingMessage';
import DataObjToolbar from 'metadata-react/FrmObj/DataObjToolbar';
import DataField from 'metadata-react/DataField';
import TabularSection from 'metadata-react/TabularSection';

import withStyles from 'metadata-react/styles/paper600';
import {withIface} from 'metadata-redux';

const htitle = 'Задание на производство';
const description = 'Раскрой, потребность в материалах, файлы для станков';

class FrmObj extends MDNRComponent {

  static propTypes = {
    _mgr: PropTypes.object,             // DataManager, с которым будет связан компонент
    _acl: PropTypes.string,             // Права на чтение-изменение
    _meta: PropTypes.object,            // Здесь можно переопределить метаданные
    _layout: PropTypes.object,          // Состав и расположение полей, если не задано - рисуем типовую форму

    read_only: PropTypes.object,        // Элемент только для чтения

    handlers: PropTypes.object.isRequired, // обработчики редактирования объекта
  };

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
    };
  }

  componentDidMount() {
    const {_mgr, match} = this.props;
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
      state: {_obj, _meta, index},
      context, _handlers} = this;
    const toolbar_props = Object.assign({
      closeButton: !context.dnr,
      posted: _obj && _obj.posted,
      deleted: _obj && _obj.deleted,
      postable: !!(_meta.posted || _mgr.metadata('posted')),
      deletable: false,
    }, _handlers);

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

        index === 1 && <TabularSection key="planning" _obj={_obj} _tabular="planning" minHeight={height - 48}/>,

        index === 2 && <TabularSection key="demand" _obj={_obj} _tabular="demand" minHeight={height - 48}/>,

        index === 3 && <TabularSection key="cuts_in" _obj={_obj} _tabular="cuts" minHeight={height - 48}/>,

        index === 4 && <TabularSection key="сutting" _obj={_obj} _tabular="сutting" minHeight={height - 48}/>,

        index === 5 && <TabularSection key="cuts_out" _obj={_obj} _tabular="cuts" minHeight={height - 48}/>,

      ]
      :
      <LoadingMessage />;
  }
}

export default withStyles(withIface(FrmObj));
