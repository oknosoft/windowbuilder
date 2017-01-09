import React, {Component, PropTypes} from "react";
import RepToolbar from "./RepToolbar";
import RepTabularSection from "./RepTabularSection";
import DumbLoader from "../DumbLoader";


export default class Report extends Component {

  static propTypes = {
    _obj: PropTypes.object,
    _acl: PropTypes.string.isRequired,

    handleSave: PropTypes.func.isRequired,
    handleRevert: PropTypes.func.isRequired,
    handleMarkDeleted: PropTypes.func.isRequired,
    handlePrint: PropTypes.func.isRequired,
    handleAddRow: PropTypes.func.isRequired,
    handleDelRow: PropTypes.func.isRequired
  }

  static contextTypes = {
    $p: React.PropTypes.object.isRequired
  }

  constructor(props, context) {

    super(props, context);

    const {$p} = context
    const {_obj} = props
    const _tabular = "specification"

    this.state = {
      _tabular,
      _meta: _obj._metadata(_tabular),
    }

    $p.cat.scheme_settings.get_scheme(_obj._manager.class_name + `.${_tabular}`)
      .then(this.handleSchemeChange)

  }

  handleSave = () => {
    this.props._obj.calculate(this.state._columns)
      .then(() => {
        this.refs.data.setState({groupBy: []})
        //this.forceUpdate()
      })
  }

  handlePrint = () => {

  }

  // обработчик при изменении настроек компоновки
  handleSchemeChange = (scheme) => {

    const {props, state} = this
    const _columns = scheme.rx_columns({
      mode: "ts",
      fields: state._meta.fields,
      _obj: props._obj
    })

    this.setState({
      scheme,
      _columns
    })
  }

  render() {

    const {props, state, handleSave, handlePrint, handleSchemeChange} = this
    const {_obj, height, width, handleClose} = props
    const {_columns, scheme, _tabular} = state

    if (!scheme) {
      return <DumbLoader title="Чтение настроек компоновки..."/>

    }
    else if (!_obj) {
      return <DumbLoader title="Чтение объекта данных..."/>

    }
    else if (!_columns || !_columns.length) {
      return <DumbLoader title="Ошибка настроек компоновки..."/>

    }

    return (

      <div>

        <RepToolbar
          handleSave={handleSave}
          handlePrint={handlePrint}
          handleClose={handleClose}

          _obj={_obj}
          _tabular={_tabular}
          _columns={_columns}

          scheme={scheme}
          handleSchemeChange={handleSchemeChange}
        />

        <div className="meta-padding-8" style={{width: width - 20, height: height - 50}}>

          <RepTabularSection
            ref="data"
            _obj={_obj}
            _tabular={_tabular}
            _columns={_columns}
            minHeight={height - 60}
          />

        </div>

      </div>

    );
  }
}

