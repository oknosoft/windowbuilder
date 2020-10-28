/**
 * Показывает окно свойств текущего инструмента
 *
 * @module ToolWnd
 *
 * Created by Evgeniy Malyarov on 13.12.2019.
 */
import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';

// тема для material-ui
import {ThemeProvider} from '@material-ui/styles';
import theme from '../../../styles/muiTheme';

const Stub = () => <Typography color="primary">Текущий инструмент не имеет окна свойств</Typography>;

class ToolWnd extends React.Component {

  componentDidMount() {
    this.props.editor.eve.on('tool_activated', this.tool_activated);
  }

  tool_activated = () => {
    this.forceUpdate();
  };

  render() {
    const {editor} = this.props;
    const {tool} = editor
    const Wnd = tool.ToolWnd || tool.constructor.ToolWnd || Stub;
    return <ThemeProvider theme={theme}>
      <Wnd editor={editor} />
    </ThemeProvider>;
  }
}

ToolWnd.propTypes = {
  editor: PropTypes.object.isRequired,
};

export default ToolWnd;
