// общие модули

// строки интернационализации
import i18ru from './i18n.ru';
import select_template from 'wb-core/dist/select_template';
import events from './events';

import randomId from './ids';
import scale_svg from './scale_svg';

export default function ($p) {
  i18ru($p);
  select_template($p);
  events($p);
  Object.assign($p.utils, {scale_svg, randomId});
}

