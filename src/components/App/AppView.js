import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Switch, Route} from 'react-router';

import Snack from 'metadata-react/App/Snack';       // сообщения в верхней части страницы (например, обновить после первого запуска)
import Alert from 'metadata-react/App/Alert';       // диалог сообщения пользователю
import Confirm from 'metadata-react/App/Confirm';   // диалог вопросов пользователю (да, нет)
import FrmLogin from 'metadata-react/FrmLogin';     // логин и свойства подключения
import NeedAuth from 'metadata-react/App/NeedAuth'; // страница "необхлдима авторизация"
import Header from 'metadata-react/Header';         // навигация
import DumbScreen from '../DumbScreen';             // заставка "загрузка занных"
import DataRoute from '../DataRoute';               // вложенный маршрутизатор страниц с данными
import AboutPage from '../About';                   // информация о программе
import Settings from '../Settings';                 // настройки
import NotFoundPage from '../NotFoundPage';         // 404
import MetaTreePage from '../MetaTreePage';         // дерево метаданных

import {withNavigateAndMeta} from 'metadata-redux';
import Builder from '../Builder';
import CalcOrderList from '../CalcOrderList';

import items, {item_props} from './menu_items';                   // массив элементов меню

class AppRoot extends Component {

  static propTypes = {
    handleNavigate: PropTypes.func.isRequired,
    handleIfaceState: PropTypes.func.isRequired,
    first_run: PropTypes.bool.isRequired,
    snack: PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);
    this.handleAlertClose = this.handleDialogClose.bind(this, 'alert');
    const iprops = item_props();
    this.state = {
      need_meta: !!iprops.need_meta,
      need_user: !!iprops.need_user,
    };
  }

  shouldComponentUpdate(props, {need_user, need_meta}) {
    const {meta_loaded, user, offline} = props;
    const iprops = item_props();
    let res = true;

    if(need_user != !!iprops.need_user) {
      this.setState({need_user: !!iprops.need_user});
      res = false;
    }

    if(need_meta != !!iprops.need_meta) {
      this.setState({need_meta: !!iprops.need_meta});
      res = false;
    }

    // если есть сохранённый пароль и online, пытаемся авторизоваться
    if(meta_loaded && !user.logged_in && user.has_login && !user.try_log_in && !offline) {
      props.handleLogin();
      res = false;
    }

    return res;
  }

  handleDialogClose(name) {
    this.props.handleIfaceState({component: '', name, value: {open: false}});
  }

  handleReset(reset) {
    const {handleNavigate, first_run} = this.props;
    if(first_run || reset) {
      $p.eve && ($p.eve.redirect = true);
      location.replace('/');
    }
    else {
      handleNavigate('/');
    }
  }

  render() {
    const {props, state} = this;
    const {snack, alert, confirm, meta_loaded, doc_ram_loaded, nom_prices_step, user, couch_direct, offline, title} = props;

    return [

      <Header key="header" items={items} {...props} />,

      // основной контент или заставка загрузки или приглашение к авторизации
      meta_loaded && state.need_user && ((!user.try_log_in && !user.logged_in) || (couch_direct && offline)) ?
        <NeedAuth
          key="auth"
          handleNavigate={props.handleNavigate}
          handleIfaceState={props.handleIfaceState}
          title={title}
          offline={couch_direct && offline}
        />
        :
        (
          (!props.path_log_in && ((state.need_meta && !meta_loaded) || (state.need_user && !props.complete_loaded))) ?
            <DumbScreen
              key="dumb"
              title={doc_ram_loaded ? 'Подготовка данных в памяти...' : 'Загрузка из IndexedDB...'}
              page={{text: doc_ram_loaded ? `Цены и характеристики${nom_prices_step ? ` (такт №${nom_prices_step})` : ''}...` : 'Почти готово...'}}
              top={92}/>
            :
            <Switch key="switch">
              <Route exact path="/" component={CalcOrderList}/>
              <Route path="/builder/:ref([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})" component={Builder} />
              <Route path="/:area(doc|cat|ireg|cch|rep).:name" component={DataRoute} />
              <Route path="/about" component={AboutPage} />
              <Route path="/meta" component={MetaTreePage} />
              <Route path="/login" component={FrmLogin} />
              <Route path="/settings" component={Settings} />
              <Route component={NotFoundPage} />
            </Switch>
        ),

      // всплывающтй snackbar оповещений пользователя
      ((snack && snack.open) || (props.first_run && doc_ram_loaded)) &&
      <Snack
        key="snack"
        snack={snack}
        handleClose={snack && snack.open && !snack.reset ? this.handleDialogClose.bind(this, 'snack') : () => this.handleReset(snack && snack.reset)}
      />,

      // диалог сообщений пользователю
      alert && alert.open && <Alert key="alert" open text={alert.text} title={alert.title} handleOk={this.handleAlertClose}/>,

      // диалог вопросов пользователю (да, нет)
      confirm && confirm.open && <Confirm key="confirm" open text={confirm.text} title={confirm.title} handleOk={confirm.handleOk} handleCancel={confirm.handleCancel}/>,

    ];
  }
}

export default withNavigateAndMeta(AppRoot);

