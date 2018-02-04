function reset_cache() {
  applicationCache.update();
  setTimeout(() => $p.iface.do_reload(), 10000);
}

export default function (pouch) {
  pouch.on('system', (type) => {
    type === 'reset_cache' && pouch.props._data_loaded && reset_cache();
  });
}
