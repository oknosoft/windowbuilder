/**
 * ### Контейнер сохраненных настроек
 * Кнопка открытия + диалог
 *
 * @module SchemeSettingsWrapper
 *
 * Created 31.12.2016
 */
import React, {Component, PropTypes} from "react";
import IconButton from "material-ui/IconButton";
import IconSettings from "material-ui/svg-icons/action/settings";
import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";
import SchemeSettingsTabs from "./SchemeSettingsTabs";
import TextField from "material-ui/TextField";


export default class SchemeSettingsWrapper extends Component {

  static propTypes = {
    scheme: PropTypes.object.isRequired,
    handleSchemeChange: PropTypes.func.isRequired,
    tabParams: PropTypes.object,                    // конструктор пользовательской панели параметров
    show_search: PropTypes.boolean,                 // показывать поле поиска
    show_variants: PropTypes.boolean,               // показывать список вариантов
  }

  state = {
    open: false,
  }

  handleOpen = () => {
    this.setState({open: true});
  }

  handleClose = () => {
    this.setState({open: false});
  }

  handleOk = () => {
    this.handleClose();
    this.props.handleSchemeChange(this.state.scheme || this.props.scheme);
  }

  handleSchemeChange = (scheme) => {
    this.props.handleSchemeChange(scheme)
    this.setState({scheme});
  }

  handleSearchChange = (event, newValu) => {

  }

  componentDidMount = () => {
    if(this.searchInput){
      this.searchInput.input.placeholder = "Найти..."
    }
  }

  render() {

    const {props, state, handleOpen, handleOk, handleClose, handleSchemeChange, handleSearchChange} = this;
    const {open, scheme} = state
    const {show_search, show_variants, tabParams} = props

    const actions = [
      <FlatButton
        label="Применить"
        primary={true}
        keyboardFocused={true}
        onTouchTap={handleOk}
      />,
      <FlatButton
        label="Отмена"
        secondary={true}
        onTouchTap={handleClose}
      />,
    ];

    return (

      <div>

        {show_search ? (
            <TextField
              name="search"
              ref={(search) => {this.searchInput = search;}}
              width={300}
              underlineShow={false}
              style={{backgroundColor: 'white', height: 36, top: -6, padding: 6}}
              onChange={handleSearchChange}
            />
          ) : null
        }

        <IconButton touch={true} tooltip="Настройка списка" onTouchTap={handleOpen}>
          <IconSettings />
        </IconButton>

        <Dialog
          title="Настройка списка"
          actions={actions}
          modal={false}
          autoScrollBodyContent={true}
          open={open}
          onRequestClose={handleClose}
        >

          <SchemeSettingsTabs
            handleSchemeChange={handleSchemeChange}
            scheme={scheme || props.scheme}
            tabParams={tabParams}
          />

        </Dialog>

      </div>
    )
  }

}
