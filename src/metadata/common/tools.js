/**
 * Подключает формы инструментов к конструкторам инструментов
 *
 * Created by Evgeniy Malyarov on 28.10.2020.
 */

import TextWnd from '../../components/Builder/ToolWnds/TextWnd';

export default function ({Editor}) {
  Editor.ToolText.ToolWnd = TextWnd;
}
