// общие модули

// строки интернационализации
import i18ru from './i18n.ru';
import scale_svg from './scale_svg';
import tools from './tools';
import qs from 'qs';

export default function ($p) {
  i18ru($p);
  tools($p);
  $p.iface.scale_svg = scale_svg;
  $p.utils.scale_svg = scale_svg;
  $p.utils.prm = () => qs.parse(location.search.replace('?',''));
}
