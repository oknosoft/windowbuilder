
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
        const profile = gls.profile.nearest() || gls.profile;
        const side = profile.cnn_side(this, interior);
        const cnn = cnns.nom_cnn(nom, profile, cnn_types.acn.ii, false, side.is('outer'))[0];
        const size = cnn?.size(elm, profile, row.region) || 0;

        rows.push({
          region: row.region,
          side: `№${index+1} l: ${profile.orientation.is('hor') ? path.bounds.width.round() : path.bounds.height.round()}`,
          profile: profile.info,
          nom: `${nom?.name} (${nom?.id})`,
          cnn: cnnp(cnn),
          size,
        });
      }
    }
  });

  return {rows, rowGetter};

}
