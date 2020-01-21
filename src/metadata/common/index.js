// общие модули

// строки интернационализации
import i18ru from './i18n.ru';
import scale_svg from './scale_svg';

export default function ($p) {
  i18ru($p);
  $p.iface.scale_svg = scale_svg;
}
