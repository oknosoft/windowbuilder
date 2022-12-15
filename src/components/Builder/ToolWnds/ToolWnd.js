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
    const {editor: {project, tool, constructor}, fix} = props;
    this.state = {
      elm: null,
      layer: null,
      tool,
      type: 'root',
    };
    if(fix === 'root') {
      return;
    }
    if(fix === 'layer') {
      let {activeLayer} = project;
      if(!(activeLayer instanceof constructor.Contour)) {
        activeLayer = project.contours[0];
      }
      this.state.type = 'layer';
      this.state.layer = activeLayer;
      return;
    }
    const {selected_elements: elm} = project;
    if(elm.length === 2) {
      this.state.type = 'pair';
      this.state.elm = elm;
    }
    else if(elm.length > 2) {
      this.state.type = 'grp';
      this.state.elm = elm;
    }
    else if(elm.length || fix === 'elm') {
      this.state.type = 'elm';
      this.state.elm = elm[0];
    }
    else {
      const {activeLayer} = project;
      if(activeLayer instanceof constructor.Contour) {
        this.state.type = 'layer';
        this.state.layer = activeLayer;
      }
    }
  }

  componentDidMount() {
    const {editor: {eve}, fix} = this.props;
    if(fix !== 'root') {
      eve.on({
        tool_activated: this.tool_activated,
        elm_activated: this.elm_activated,
      });
    }
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
    const {editor: {constructor: {Scheme}, Layer, project}, fix} = this.props;

    if(fix === 'layer') {
      if(!(elm instanceof Scheme)) {
        if(elm instanceof Layer) {
          this.tree_select({type: 'layer', layer: elm, elm: null});
        }
        else {
          this.tree_select({type: 'layer', layer: elm.layer, elm: null});
        }
      }
      return;
    }

    if(fix !== 'elm' && (!elm || elm instanceof Scheme)) {
      this.tree_select({type: 'root', elm});
    }
    else if(fix !== 'elm' && (elm instanceof Layer)) {
      this.tree_select({type: 'layer', layer: elm, elm: null});
    }
    else {
      const {selected_elements} = project;
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
        <div style={{overflowX: 'hidden', overflowY: 'auto', height: '100%'}}>
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
