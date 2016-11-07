import React from 'react';

export default function (props) {
  return (

    <div>
      <h1>Окнософт: Заказ дилера</h1>
      <p>Заказ дилера - это веб-приложение с открытым исходным кодом, разработанное компанией <a href="http://www.oknosoft.ru/" target="_blank">Окнософт</a> на базе фреймворка <a href="http://www.oknosoft.ru/metadata/" target="_blank">Metadata.js</a>. Исходный код и документация доступны на <a href="https://github.com/oknosoft/windowbuilder" target="_blank">GitHub</a>
      </p>

      <h3>Назначение и возможности</h3>
      <ul>
        <li>Построение и редактирование эскизов изделий в графическом 2D редакторе</li>
        <li>Экстремальная поддержка нестандартных изделий (многоугольники, сложные перегибы профиля)</li>
        <li>Расчет спецификации и координат технологических операций</li>
        <li>Расчет цены и плановой себестоимости изделий по произвольным формулам с учетом индивидуальных дилерских скидок и наценок</li>
        <li>Формирование печатных форм для заказчика и производства</li>
        <li>Поддержка автономной работы при отсутствии доступа в Интернет и прозрачного обмена с сервером при возобновлении соединения</li>
      </ul>

      <h3>Использованы следующие библиотеки и инструменты:</h3>
      <h4>Серверная часть</h4>
      <ul>
        <li><a href="http://couchdb.apache.org/" target="_blank">CouchDB</a>, NoSQL база данных с поддержкой master-master репликации</li>
        <li><a href="http://nginx.org/ru/" target="_blank">Nginx</a>, высокопроизводительный HTTP-сервер</li>
        <li><a href="https://nodejs.org/en/" target="_blank">NodeJS</a>, JavaScript runtime built on Chrome's V8 JavaScript engine</li>
        <li><a href="http://expressjs.com/ru/" target="_blank">Express</a>, HTTP-сервер для NodeJS</li>
        <li><a href="https://github.com/colinskow/superlogin" target="_blank">SuperLogin</a>, библиотека oAuth авторизации</li>
      </ul>

      <h4>Управление данными в памяти браузера</h4>
      <ul>
        <li><a href="http://www.oknosoft.ru/metadata/" target="_blank">Metadata.js</a>, движок ссылочной типизации для браузера и Node.js</li>
        <li><a href="https://pouchdb.com/" target="_blank">PouchDB</a>, клиентская NoSQL база данных с поддержкой автономной работы и репликации с CouchDB</li>
        <li><a href="https://github.com/agershun/alasql" target="_blank">AlaSQL</a>, SQL-интерфейс к массивам javascript в памяти браузера и Node.js</li>
        <li><a href="http://www.movable-type.co.uk/scripts/aes.html" target="_blank">Aes</a>, библиотека шифрования/дешифрования строк</li>
        <li><a href="http://www.movable-type.co.uk/scripts/aes.html" target="_blank">Redux</a>, диспетчер состояния веб-приложения</li>
      </ul>

      <h4>UI библиотеки и компоненты интерфейса</h4>
      <ul>
        <li><a href="http://www.material-ui.com/" target="_blank">Material-ui</a>, компоненты React UI в стиле Google's material design</li>
        <li><a href="https://github.com/bvaughn/react-virtualized" target="_blank">React virtualized</a>, компоненты React для динамических списков</li>
        <li><a href="https://github.com/eligrey/FileSaver.js" target="_blank">Filesaver.js</a>, HTML5 реализация метода saveAs</li>
        <li><a href="http://momentjs.com/" target="_blank">Moment.js</a>, библиотека форматирования интервалов и дат</li>
        <li><a href="http://numbrojs.com/" target="_blank">Numbro</a>, библиотека форматирования чисел</li>
        <li><a href="http://meritt.github.io/rubles/" target="_blank">Rubles.js</a>, библиотека форматирования чисел - сумма прописью</li>
      </ul>

      <h3>Лицензия</h3>
      <p><i>Заказ дилера</i> распространяется под коммерческой лицензией <a href="http://www.oknosoft.ru/programmi-oknosoft/zakaz-dilera.html" target="_blank">Окнософт</a></p>

      <h3>Вопросы</h3>
      <p>Если обнаружили ошибку, пожалуйста, <a href="https://github.com/oknosoft/metadata.js/issues" target="_blank">зарегистрируйте вопрос в GitHub
        </a> или <a href="http://www.oknosoft.ru/metadata/#page-118" target="_blank">свяжитесь с разработчиком</a> напрямую<br /></p>
    </div>
  )
}
