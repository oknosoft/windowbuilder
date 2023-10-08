
const cnnp = (cnn) => cnn && ! cnn.empty() ? `${cnn?.name} (${cnn?.id})` : 'Не найдено';

export default function cnnsData(elm) {
  const rows = [];
  function rowGetter(i) {
    return rows[i];
  }

  const {enm: {cnn_types}, cat: {cnns}, job_prm: {nom: {strip}}} = $p;
  const {profiles, path, ox} = elm;
  const interior = elm.interiorPoint();
  const nom = elm.inset.nom(elm);

  for(const gls of profiles) {
    const index = profiles.indexOf(gls);
    rows.push({
      region: 0,
      side: `№${index+1} l: ${gls.sub_path.length.round()}`,
      profile: gls.profile.info,
      nom: `${nom?.name} (${nom?.id})`,
      cnn: cnnp(gls.cnn),
      size: gls.cnn.size(elm),
    });
  }

  ox.glass_specification.find_rows({elm: elm.elm}, (row) => {
    if ([1, 2, -1].includes(row.region)) {
      const nom = row.inset.nom(elm);
      const path = elm._attr.paths.get(row.region);
      for(const gls of profiles) {
        const index = profiles.indexOf(gls);

        let profile = gls.profile.nearest() || gls.profile;
        let side = profile.cnn_side(elm, interior);
        const elm2 = [{profile, side}];
        if(gls.profile !== profile) {
          elm2.push({profile: gls.profile, side: gls.profile.cnn_side(elm, interior)});
        }
        const cnn = cnns.region_cnn({
          region: row.region,
          elm1: elm,
          nom1: nom,
          elm2,
          art1glass: true,
          cnn_types: cnn_types.acn.ii,
        });
        if(cnn.sd2) {
          if(!side.is('outer')) {
            side = side._manager.outer;
          }
          profile = gls.profile;
        }
        const size = cnn?.size(elm, profile, row.region) || 0;

        rows.push({
          region: row.region,
          side: `№${index+1} l: ${profile.orientation.is('hor') ? path.bounds.width.round() : path.bounds.height.round()}`,
          profile: profile.info,
          nom: `${nom?.name} (${nom?.id})`,
          cnn: cnnp(cnn),
          size: `${size.round(1)} (от ${cnn.sd1 ? 'створки' : 'рамы, импоста'})`,
        });
      }
    }
  });

  return {rows, rowGetter};

}
