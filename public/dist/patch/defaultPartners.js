

export function defaultPartners($p) {
  const {pouch} = $p.adapters;
  pouch.once('pouch_complete_loaded', () => {
    const {cat, current_user} = $p;
    const refs = new Set();
    current_user.acl_objs.find_rows({type: 'cat.partners', by_default: true}, ({_obj}) => {
      const partner =  cat.partners.by_ref[_obj.acl_obj]
      if(!partner || partner.is_new()) {
        refs.add(_obj.acl_obj);
      }
    });
    refs.size && pouch.load_array(cat.partners, Array.from(refs));
  });
}
