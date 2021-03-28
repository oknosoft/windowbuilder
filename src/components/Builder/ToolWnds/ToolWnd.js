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

const Stub = () => <Typography color="primary">Текущий инструмент не имеет окна свойств</Typography>;

export default function ToolWnd({editor}) {
  const {tool} = editor;
  const Wnd = tool.ToolWnd || Stub;
  return <Wnd editor={editor} />;
}

ToolWnd.propTypes = {
  editor: PropTypes.object.isRequired,
};
