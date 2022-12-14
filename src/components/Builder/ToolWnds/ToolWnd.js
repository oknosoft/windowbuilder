/**
 * Показывает окно свойств текущего инструмента
 *
 * @module ToolWnd
 *
 * Created by Evgeniy Malyarov on 13.12.2019.
 */
import React from 'react';
import PropTypes from 'prop-types';
import {Provider} from 'react-redux';
import {ThemeProvider} from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';


// тема для material-ui
import theme from '../../../styles/muiTheme';
import {lazy} from '../../App/lazy';
import {store} from '../../../index';

const Stub = () => <Typography color="primary">Текущий инструмент не имеет окна свойств</Typography>;

class ToolWnd extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      elm: null,
      layer: null,
      tool: null,
      type: 'root',
    };
  }

  componentDidMount() {
    const {eve} = this.props.editor;
    eve.on({
      tool_activated: this.tool_activated,
      elm_activated: this.elm_activated,
    });
  }

  componentWillUnmount() {
    const {eve} = this.props.editor;
    eve.off({
      tool_activated: this.tool_activated,
      elm_activated: this.elm_activated,
    });
  }

  tool_activated = (tool) => {
    this.setState({tool});
  };

  elm_activated = (elm) => {
    const {constructor: {Scheme}, Layer} = this.props.editor;
    if(!elm || elm instanceof Scheme) {
      this.tree_select({type: 'root', elm});
    }
    else if(elm instanceof Layer) {
      this.tree_select({type: 'layer', layer: elm, elm: null});
    }
    else {
      const {selected_elements} = elm.project;
      if(selected_elements.length === 2) {
        this.tree_select({type: 'pair', elm: selected_elements});
      }
      else if(selected_elements.length > 2) {
        this.tree_select({type: 'grp', elm: selected_elements});
      }
      else {
        this.tree_select({type: 'elm', elm});
      }
    }
  };

  tree_select = ({type, elm, layer}) => {
    this.setState({type, elm, layer});
  };

  render() {
    const {props: {editor}, state: {elm, layer, tool, type}} = this;
    const Wnd = (tool && (tool.ToolWnd || tool.constructor.ToolWnd)) || Stub;
    return <Provider store={store}>
      <ThemeProvider theme={theme}>
        <div style={{overflowX: 'hidden', overflowY: 'auto'}}>
          <Wnd editor={editor} type={type} elm={elm} layer={layer} tree_select={this.tree_select}/>
        </div>
      </ThemeProvider>
    </Provider>;
  }

  getChildContext() {
    return {components: lazy, store};
  }
}

ToolWnd.childContextTypes = {
  components: PropTypes.object,
  store: PropTypes.object,
};

ToolWnd.propTypes = {
  editor: PropTypes.object.isRequired,
};

export default ToolWnd;
