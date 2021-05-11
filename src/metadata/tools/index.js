/**
 * Подключает формы инструментов к конструкторам инструментов
 *
 * Created by Evgeniy Malyarov on 28.10.2020.
 */

import TextWnd from '../../components/Builder/ToolWnds/TextWnd';
import tool_stulp_flap from './tool_stulp_flap';
//import tool_vitrazh from './tool_vitrazh';

export default function ($p) {

  tool_stulp_flap($p);
  //tool_vitrazh($p);
  $p.Editor.ToolText.ToolWnd = TextWnd;
}
