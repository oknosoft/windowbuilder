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
import {Tabs} from 'wb-forms/dist/Common/AntTabs';
import Tab from '@material-ui/core/Tab';
import Controls from '../Controls';

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
      index: 0,
      visible: false,
    };
  }

  componentDidMount() {
    const {eve} = this.props.editor;
    eve.on('tool_activated', this.tool_activated);
    eve.on('elm_activated', this.elm_activated);
    eve.on('react', this.visible);
  }

  componentWillUnmount() {
    const {eve} = this.props.editor;
    eve.off('tool_activated', this.tool_activated);
    eve.off('elm_activated', this.elm_activated);
    eve.off('react', this.visible);
  }

  tool_activated = (tool) => {
    this.setState({tool});
  };

  visible = (visible) => {
    this.setState({visible});
  };

  elm_activated = (elm) => {
    if(!elm) {
      this.tree_select({type: 'root', elm});
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
    const {props: {editor}, state: {elm, layer, tool, type, index, visible}} = this;
    const Wnd = (tool && (tool.ToolWnd || tool.constructor.ToolWnd)) || Stub;
    return <Provider store={store}>
      <ThemeProvider theme={theme}>
        <div style={{overflowX: 'hidden', overflowY: 'auto'}}>
          {visible && [
            <Tabs key="tabs" value={index} onChange={(event, index) => this.setState({index})}>
              <Tab label="tool"/>
              <Tab label="tree"/>
              <Tab label="props"/>
            </Tabs>,
            index === 0 && <Wnd key="tool" editor={editor} />,
            index === 1 && "Дерево - пока не подключено",
            index === 2 && <Controls key="elm" editor={editor} type={type} elm={elm} layer={layer}/>,
          ]}
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
