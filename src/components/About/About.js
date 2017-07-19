import React from 'react';
import PropTypes from 'prop-types';
import {withStyles, createStyleSheet} from 'material-ui/styles';
import Grid from 'material-ui/Grid';

const styleSheet = createStyleSheet('About', theme => ({
  root: {
    flexGrow: 1,
    //marginTop: 30,
  },
}));

function About(props) {

  const classes = props.classes;

  return (
    <div className={classes.root}>
      <Grid container gutter={24}>
        <Grid item xs={0} sm={0} md={1} lg={2} xl={3} />
        <Grid item xs={12} sm={12} md={11} lg={10} xl={8}>

          <h1>Hello world</h1>
          <p>Hello world - это веб-приложение на базе <a href="http://www.oknosoft.ru/metadata/"
               target="_blank" rel="noopener noreferrer">Metadata.js</a> для демонстрации базовых возможностей фреймворка
          </p>

          <h3>Назначение и возможности</h3>
          <ul>
            <li>Ввод и редактирование докумнтов поступления - выбытия - перемещения денег</li>
            <li>Формирование отчета о движении денег</li>
            <li>Автономная работа при отсутствии доступа к Интернет</li>
            <li>Фоновая синхронизация с ИБ 1С</li>
          </ul>

          <h3>Использованы следующие библиотеки и инструменты</h3>
          <h4>Серверная часть</h4>
          <ul>
            <li><a href="http://couchdb.apache.org/" target="_blank" rel="noopener noreferrer">CouchDB</a>, NoSQL база данных с поддержкой master-master репликации
            </li>
            <li><a href="http://nginx.org/ru/" target="_blank" rel="noopener noreferrer">Nginx</a>, высокопроизводительный HTTP-сервер</li>
            <li><a href="https://nodejs.org/en/" target="_blank" rel="noopener noreferrer">NodeJS</a>, JavaScript runtime built on Chrome`s V8 JavaScript engine
            </li>
            {/*
             <li><a href="http://expressjs.com/ru/" target="_blank" rel="noopener noreferrer">Express</a>, HTTP-сервер для NodeJS</li>
             <li><a href="https://github.com/colinskow/superlogin" target="_blank" rel="noopener noreferrer">SuperLogin</a>, библиотека oAuth авторизации</li>
             */}
          </ul>

          <h4>Управление данными в памяти браузера</h4>
          <ul>
            <li><a href="http://www.oknosoft.ru/metadata/" target="_blank" rel="noopener noreferrer">Metadata.js</a>, движок ссылочной типизации для браузера и Node.js
            </li>
            <li><a href="https://pouchdb.com/" target="_blank" rel="noopener noreferrer">PouchDB</a>, клиентская NoSQL база данных с поддержкой автономной работы и репликации с CouchDB
            </li>
            <li><a href="https://github.com/agershun/alasql" target="_blank" rel="noopener noreferrer">AlaSQL</a>, SQL-интерфейс к массивам javascript в памяти браузера и Node.js
            </li>
            <li><a href="http://www.movable-type.co.uk/scripts/aes.html" target="_blank" rel="noopener noreferrer">Aes</a>, библиотека шифрования/дешифрования строк
            </li>
            <li><a href="https://github.com/reactjs/redux" target="_blank" rel="noopener noreferrer">Redux</a>, диспетчер состояния веб-приложения
            </li>
          </ul>

          <h4>UI библиотеки и компоненты интерфейса</h4>
          <ul>
            <li><a href="http://www.material-ui.com/" target="_blank" rel="noopener noreferrer">Material-ui</a>, компоненты React UI в стиле Google`s material design
            </li>
            <li><a href="https://github.com/bvaughn/react-virtualized" target="_blank" rel="noopener noreferrer">React virtualized</a>, компоненты React для динамических списков
            </li>
            <li><a href="https://github.com/adazzle/react-data-grid" target="_blank" rel="noopener noreferrer">React data grid</a>, React компонент табличной части
            </li>
            <li><a href="https://github.com/eligrey/FileSaver.js" target="_blank" rel="noopener noreferrer">Filesaver.js</a>, HTML5 реализация метода saveAs
            </li>
            <li><a href="http://momentjs.com/" target="_blank" rel="noopener noreferrer">Moment.js</a>, библиотека форматирования интервалов и дат
            </li>
            <li><a href="http://meritt.github.io/rubles/" target="_blank" rel="noopener noreferrer">Rubles.js</a>, библиотека форматирования чисел - сумма прописью
            </li>
          </ul>

          <h3>Лицензия</h3>
          <p><a href="https://ru.wikipedia.org/wiki/%D0%9B%D0%B8%D1%86%D0%B5%D0%BD%D0%B7%D0%B8%D1%8F_MIT" target="_blank"
                rel="noopener noreferrer">MIT</a></p>

          <h3>Вопросы</h3>
          <p>Если обнаружили ошибку, пожалуйста, <a href="https://github.com/oknosoft/metadata.js/issues" target="_blank"
                                                    rel="noopener noreferrer">зарегистрируйте вопрос в GitHub
          </a> или <a href="http://www.oknosoft.ru/metadata/#page-118" target="_blank" rel="noopener noreferrer">свяжитесь с разработчиком</a> напрямую</p>

        </Grid>
      </Grid>
    </div>
  );
}

About.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styleSheet)(About);
