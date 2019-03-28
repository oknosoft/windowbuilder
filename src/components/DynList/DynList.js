/**
 *
 *
 * @module DynList
 *
 * Created by Evgeniy Malyarov on 27.03.2019.
 */

import React from 'react';
import PropTypes from 'prop-types';
import MDNRComponent from 'metadata-react/common/MDNRComponent';
import {withIface} from 'metadata-redux';
import ReactDataGrid from 'react-data-grid';
import LoadingMessage from 'metadata-react/DumbLoader/LoadingMessage';
import DataListToolbar from 'metadata-react/DataList/DataListToolbar';
import SchemeSettingsTabs from 'metadata-react/SchemeSettings/SchemeSettingsTabs';
import Confirm from 'metadata-react/App/Confirm';
import Helmet from 'react-helmet';

const LIMIT = 50;
const ROW_HEIGHT = 33;
//const OVERSCAN_ROW = 2;

class DynList extends MDNRComponent {

  constructor(props, context) {
    super(props, context);

    this.state = {
      selectedRow: null,
      scrollToRow: 0,
      scrollSetted: false,
      rowCount: 0,
      settings_open: false,
      network_error: '',
      no_rows: false,
      ref: '',
      scheme: null,
      columns: [],
    };

    /** Set of grid rows. */
    this.rows = new Map();
    this.fakeRows = new Map();
    this.ranges = [];
  }

  componentDidMount() {
    super.componentDidMount();
    this.handleManagerChange(this.props);
  }

  // при изменении менеджера данных
  handleManagerChange({_mgr, _meta, _ref}) {

    const {class_name} = _mgr;

    this._meta = _meta || _mgr.metadata();

    const newState = {ref: _ref || '', scrollSetted: false};
    this.setState(newState);

    $p.cat.scheme_settings.get_scheme(class_name).then(this.handleSchemeChange);

  }

  // при изменении настроек или варианта компоновки
  handleSchemeChange = (scheme) => {
    scheme.set_default();
    // пересчитываем и перерисовываем динсписок
    const columns = scheme.rx_columns({mode: 'ts', fields: this._meta.fields, _mgr: this.props._mgr});
    this.handleFilterChange(scheme, columns);
  };

  // при изменении параметров компоновки - схему не меняем, но выполняем пересчет
  handleFilterChange = (scheme, columns) => {

    const {state, props, rows, fakeRows, ranges} = this;

    if(!(scheme instanceof $p.CatScheme_settings)) {
      scheme = state.scheme;
    }

    if(!columns) {
      columns = state.columns;
    }

    rows.clear();
    fakeRows.clear();
    ranges.length = 0;

    const newState = {scheme, columns, scrollToRow: 0, rowCount: 0, selectedRow: null};
    this.setState(newState, () => {
      this.loadMoreRows({
        startIndex: 0,
        stopIndex: LIMIT - 1,
      });
    });

  };

  loadMoreRows = ({startIndex, stopIndex}) => {
    const {props: {_mgr, _owner, find_rows}, state: {scheme, columns, ref, scrollSetted}, rows, fakeRows, ranges}  = this;

    //const increment = Math.max(DataList.LIMIT, stopIndex - startIndex + 1);

    let increment = stopIndex - startIndex;
    if(!increment && rows.get(startIndex)) {
      return;
    }

    for(let j = startIndex; j < stopIndex; j++) {
      fakeRows.set(j, {});
    }

    return Promise.resolve().then(() => {
      const newState = {no_rows: false, network_error: null};
      if(scrollSetted) {
        newState.scrollSetted = false;
        newState.scrollToRow = 0;
        newState.ref = '';
      }
      this.setState(newState);

      // в зависимости от типа кеширования...
      if(/ram$/.test(_mgr.cachable)) {
        // фильтруем в озу
        const selector = _mgr.get_search_selector({
          _obj: _owner ? (_owner._obj || _owner.props && _owner.props._obj) : null,
          _meta: _owner ? _owner._meta : {},
          search: scheme._search,
          top: increment,
          skip: startIndex ? startIndex - 1 : 0,
        });
        return Promise.resolve(this.updateList(_mgr.find_rows(selector), startIndex));
      }
      else {
        // выполняем запрос
        const sprm = {
          columns,
          skip: startIndex ? startIndex - 1 : 0,
          limit: increment + 1,
        };
        if(sprm.limit < LIMIT / 2) {
          sprm.limit = LIMIT / 2;
        }
        const selector = _mgr.mango_selector ? _mgr.mango_selector(scheme, sprm) : scheme.mango_selector(sprm);
        // если указано начальное значение списка, первый запрос делаем со ссылкой
        if(ref && !scrollSetted) {
          selector.ref = ref;
        }
        selector._raw = true;

        return (find_rows ? find_rows(selector, scheme) : _mgr.find_rows_remote(selector))
          .then((data) => {

            for(let j = startIndex; j <= stopIndex; j++) {
              fakeRows.delete(j);
            }

            if(Array.isArray(data)) {
              this.updateList(data, startIndex);
            }
            else {
              const {docs, scroll, flag, count} = data;
              this.updateList(docs, startIndex, count);
              if(ref && !scrollSetted) {
                const newState = {
                  scrollSetted: true,
                  ref: '',
                }
                if(!flag && scroll !== null) {
                  newState.selectedRow = scroll;
                  newState.scrollToRow = newState.selectedRow + 4 < count ? newState.selectedRow + 4 : newState.selectedRow;
                }
                this.setState(newState);
                if(newState.scrollToRow && (!_list[newState.selectedRow] || !_list[newState.scrollToRow])) {
                  const opt = {
                    startIndex: newState.scrollToRow - DataList.LIMIT / 2,
                    stopIndex: newState.scrollToRow + DataList.LIMIT / 2,
                  };
                  if(opt.startIndex < 1) {
                    opt.startIndex = 1;
                  }
                  if(opt.stopIndex > count) {
                    opt.stopIndex = count;
                  }
                  this.loadMoreRows(opt);
                }
              }
            }
          })
          .catch((err) => {
            this.setState({network_error: err});
            if(this._mounted) {
              this._timer = setTimeout(this.handleFilterChange, 2600);
            }
          });
      }
    });
  };

  updateList = (data, startIndex, rowCount) => {
    const {rows} = this;

    // обновляем массив результата
    for (let i = 0; i < data.length; i++) {
      // Append one because first row is header.
      rows.set(i + startIndex, data[i]);
    }
    // Обновить количество записей.
    if(this._mounted) {
      if(rowCount === undefined) {
        rowCount = rows.size > 1 ? rows.size : 0;
      }
      const newState = {
        no_rows: !rowCount,
        rowCount,
      };
      this.setState(newState);
    }
  };

  rowGetter = (i) => {
    if(i < 0) {
      return undefined;
    }
    const {rows, fakeRows, ranges}  = this;
    const row = rows.get(i);
    if(!row) {
      // todo: учесть диапазоны
      if(!fakeRows.get(i)) {
        this.loadMoreRows({
          startIndex: i,
          stopIndex: i + LIMIT - 1,
        });
      }

      return fakeRows.get(i);
    }
    return row;
  };

  handleSettingsOpen = () => {
    this.setState({settings_open: true});
  };

  handleSettingsClose = () => {
    this.setState({settings_open: false});
  };

  // показывает-скрывает диалог предупреждения о закрытии
  handleConfirmClose = () => {
    this.setState({confirm_text: ''});
  };

  // показывает-скрывает диалог информации
  handleInfoText = (info_text) => {
    if(typeof info_text !== 'string') {
      info_text = '';
    }
    this.setState({info_text});
  }

  // обработчик выбора значения в списке
  handleSelect = () => {
    const {state: {selectedRow}, props: {handlers, _mgr}} = this;
    const row = this.rows.get(state.selectedRow);
    if(row) {
      handlers.handleSelect && handlers.handleSelect(row, _mgr);
    }
    else {
      this.handleInfoText('Не выбрана строка');
    }
  };

  // обработчик добавления элемента списка
  handleAdd = (event) => {
    const {handlers, _mgr} = this.props;
    handlers.handleAdd && handlers.handleAdd(_mgr, event);
  };

  // обработчик редактирования элемента списка
  handleEdit = () => {
    const {_list, _meta, state, props} = this;
    const {handlers, _mgr} = props;
    const row = this.rows.get(state.selectedRow);
    if(!row || $p.utils.is_empty_guid(row.ref)) {
      handlers.handleIfaceState({
        component: '',
        name: 'alert',
        value: {open: true, text: 'Укажите строку для редактирования', title: _meta.synonym}
      });
    }
    else if(handlers.handleEdit) {
      handlers.handleEdit({row, ref: row.ref, _mgr});
    }
  };

  // обработчик удаления элемента списка
  handleRemove = () => {
    const {_meta, state, props} = this;
    const {handlers, _mgr} = props;
    const row = this.rows.get(state.selectedRow);

    if(!row || $p.utils.is_empty_guid(row.ref)) {
      handlers.handleIfaceState({
        component: '',
        name: 'alert',
        value: {open: true, text: 'Укажите строку для удаления', title: _meta.synonym}
      });
    }
    else if(handlers.handleMarkDeleted) {
      this._handleRemove = () => {
        this.setState({confirm_text: ''}, () => {
          Promise.resolve()
            .then(() => handlers.handleMarkDeleted({row, ref: row.ref, _mgr}))
            .then(this.handleFilterChange)
            .catch((err) => this.setState({network_error: err}));
        });
      };
      this.setState({confirm_text: 'Удалить объект?'});
    }
  };

  // обработчик печати теущей строки
  handlePrint = () => {
    const row = this.rows.get(this.state.selectedRow);
    const {handlers, _mgr} = this.props;
    row && handlers.handlePrint && handlers.handlePrint(row, _mgr);
  };

  // обработчик вложений теущей строки
  handleAttachments = () => {
    const row = this.rows.get(this.state.selectedRow);
    const {handlers, _mgr} = this.props;
    row && handlers.handleAttachments && handlers.handleAttachments(row, _mgr);
  };

  get ltitle() {
    const {_mgr} = this.props;
    return `${_mgr.metadata().list_presentation || _mgr.metadata().synonym} (список)`;
  }

  render() {

    const {state, props, context, sizes, handleFilterChange, handleSchemeChange} = this;
    const {columns, scheme, confirm_text, info_text, settings_open, rowCount} = state;
    const {_mgr: {RepParams}, classes, title, registerFilterChange, width, height, GridRenderer, rowHeight, ...others} = props;

    if(!scheme) {
      return <LoadingMessage text="Чтение настроек компоновки..."/>;
    }
    else if(!columns || !columns.length) {
      return <LoadingMessage text="Ошибка настроек компоновки..."/>;
    }

    registerFilterChange && registerFilterChange(handleFilterChange);

    const show_grid = !settings_open || sizes.height > 572;

    const toolbar_props = {
      scheme,
      ...others,
      settings_open,
      handleSelect: this.handleSelect,
      handleAdd: this.handleAdd,
      handleEdit: this.handleEdit,
      handleRemove: this.handleRemove,
      handlePrint: this.handlePrint,
      handleAttachments: this.handleAttachments,
      handleSettingsOpen: this.handleSettingsOpen,
      handleSettingsClose: this.handleSettingsClose,
      handleSchemeChange,
      handleFilterChange,
    };

    return [

      !context.dnr && <Helmet key="helmet" title={title}>
        <meta name="description" content="Форма списка" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content="Форма списка" />
      </Helmet>,

      // диалог предупреждений при удалении
      confirm_text && <Confirm
        key="confirm"
        title={_meta.synonym}
        text={confirm_text}
        handleOk={this._handleRemove}
        handleCancel={this.handleConfirmClose}
        open
      />,

      // диалог информации
      info_text && <Confirm
        key="info"
        title={_meta.synonym}
        text={info_text}
        handleOk={this.handleInfoText}
        handleCancel={this.handleInfoText}
        open
      />,

      // панель инструментов табчасти
      <DataListToolbar key="toolbar" {...toolbar_props} />,

      // панель настроек компоновки
      settings_open && <SchemeSettingsTabs
        height={show_grid ? 272 : (sizes.height || 500) - 104}
        scheme={scheme}
        tabParams={RepParams && <RepParams scheme={scheme} handleFilterChange={handleFilterChange}/>}
        handleSchemeChange={handleSchemeChange}
      />,

      <ReactDataGrid
        key="grid"
        ref={(el) => this.grid = el}
        rowHeight={ROW_HEIGHT}
        minHeight={sizes.height - 50 - (settings_open ? 320 : 0)}
        cellNavigationMode="changeRow"
        columns={columns}
        rowGetter={this.rowGetter}
        rowsCount={rowCount}
        onCellDeSelected={(v) => {
          v = this.grid;
        }}
        onCellSelected={(v) => {
          v = this.grid;
        }}
      />
    ];
  }

};

DynList.propTypes = {

  // данные
  _mgr: PropTypes.object.isRequired,    // Менеджер данных
  _acl: PropTypes.string,               // Права на чтение-изменение
  _meta: PropTypes.object,              // Описание метаданных. Если не указано, используем метаданные менеджера
  _ref: PropTypes.string,               // Ссылка, на которую надо спозиционироваться

  _owner: PropTypes.object,             // Поле - владелец. У него должны быть _obj, _fld и _meta
                                        // а внутри _meta могут быть choice_params и choice_links

  // настройки внешнего вида и поведения
  selectionMode: PropTypes.bool,        // Режим выбора из списка. Если истина - дополнительно рисуем кнопку выбора
  read_only: PropTypes.bool,            // Элемент только для чтения
  denyAddDel: PropTypes.bool,           // Запрет добавления и удаления строк (скрывает кнопки в панели, отключает обработчики)
  show_search: PropTypes.bool,          // Показывать поле поиска
  show_variants: PropTypes.bool,        // Показывать список вариантов настройки динсписка
  modal: PropTypes.bool,                // Показывать список в модальном диалоге

  // Redux actions
  handlers: PropTypes.object.isRequired, // обработчики редактирования объекта

};

DynList.defaultProps = {
  denyAddDel: false,
  read_only: false,
  minHeight: 220,
};

DynList.contextTypes = {
  dnr: PropTypes.object
};

export default withIface(DynList);
