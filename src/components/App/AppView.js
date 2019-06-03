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

let CalcOrderList = DumbScreen;

import items, {item_props} from './menu_items';                   // массив элементов меню

class AppRoot extends Component {

  static propTypes = {
    handleNavigate: PropTypes.func.isRequired,
    handleLogin: PropTypes.func.isRequired,
    handleIfaceState: PropTypes.func.isRequired,
    first_run: PropTypes.bool.isRequired,
    snack: PropTypes.object,
  };

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

  componentDidMount() {
    $p.ui.dialogs.init({handleIfaceState: this.props.handleIfaceState});
    let comp;
    if($p.wsql.get_user_param('ram_indexer')) {
      comp = import('../CalcOrderList/CalcOrderList.js');
      if(items[0].id === 'orders') {
        const orders = items.splice(0, 1);
        items[0].items.unshift({
          text: 'Расчеты-заказы',
          navigate: '/',
          need_meta: true,
          need_user: true,
          icon: orders.icon,
        });
      }
    }
    else {
     comp = import('../CalcOrderList/CalcOrderListDhtmlx');
    }
    comp.then((module) => {
      CalcOrderList = module.default;
    });
  }

  render() {
    const {props} = this;
    const {snack, alert, confirm, meta_loaded, doc_ram_loaded, nom_prices_step, page, user, couch_direct, offline, title} = props;
    const iprops = item_props();

    let need_auth = meta_loaded && iprops.need_user && ((!user.try_log_in && !user.logged_in) || (couch_direct && offline));
    if(need_auth && !couch_direct && $p.current_user && $p.current_user.name == user.name) {
      need_auth = false;
    }

    return [

      <Header key="header" items={items} {...props} />,

      // основной контент или заставка загрузки или приглашение к авторизации
      need_auth ?
        <NeedAuth
          key="auth"
          handleNavigate={props.handleNavigate}
          handleIfaceState={props.handleIfaceState}
          title={title}
          offline={couch_direct && offline}
        />
        :
        (
          (!props.path_log_in && ((iprops.need_meta && !meta_loaded) || (iprops.need_user && !props.complete_loaded))) ?
            <DumbScreen
              key="dumb"
              title={doc_ram_loaded ? 'Подготовка данных в памяти...' : 'Загрузка из IndexedDB...'}
              page={{text: doc_ram_loaded ? `Цены и характеристики${nom_prices_step ? ` (такт №${nom_prices_step})` : ''}...` :
                  `${(page && page.synonym) || 'Почти готово'}...`}}
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
              <Route path="/waiting" component={(tprops) => <DumbScreen {...tprops} repl={props.repl} />} />
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
      alert && alert.open && <Alert key="alert" open text={alert.text} title={alert.title} handleOk={this.handleDialogClose.bind(this, 'alert')}/>,

      // диалог вопросов пользователю (да, нет)
      confirm && confirm.open && <Confirm key="confirm" open {...confirm}/>,

      // обрыв связи
      couch_direct && user.logged_in && !offline && props.complete_loaded && !props.sync_started &&
      <Snack
        key="break"
        snack={{
          open: true,
          message: 'Потеряна связь с сервером, ждём восстановления...',
          button: 'Подробнее'}}
        handleClose={() => {
          props.handleIfaceState({
            component: '',
            name: 'alert',
            value: {open: true, title: 'Интернет-соединение', text: 'Можно будет продолжить работу после восстановления связи'}});
        }}
      />,

    ];
  }
}

export default withNavigateAndMeta(AppRoot);

