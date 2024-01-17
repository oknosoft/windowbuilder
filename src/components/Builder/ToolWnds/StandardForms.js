import React from 'react';
import PropTypes from 'prop-types';
import ImageList from '@material-ui/core/ImageList';
import ImageListItem from '@material-ui/core/ImageListItem';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  img: {
    width: 32,
    height: 32,
    cursor: 'pointer',
  },
  divider: {
    marginTop: 16,
  }
}));

const frms = {
  square: 'Квадрат',
  triangle1: 'Треугольник №1',
  triangle2: 'Треугольник №2',
  triangle3: 'Треугольник №3',
  semicircle1: 'Полукруг №1',
  semicircle2: 'Полукруг №2',
  circle: 'Круг',
  arc1: 'Арка',
  trapeze1: 'Трапеция №1',
  trapeze2: 'Трапеция №2',
  trapeze3: 'Трапеция №3',
  trapeze4: 'Трапеция №4',
  trapeze5: 'Трапеция №5',
  trapeze6: 'Трапеция №6',
  trapeze7: 'Трапеция №7',
  trapeze8: 'Трапеция №8',
  trapeze9: 'Трапеция №9',
  trapeze10: 'Трапеция №10',
};

export default function StandardForms({editor, layer, elm_type}) {
  const classes = useStyles();

  const onClick = ({target}) => {
    let text = `Добавить форму ${target.title} в слой ${layer.presentation()}`;
    if(layer.profiles.length) {
      text = `В слое ${layer.presentation()} уже есть профили\n
Уверены, что хотите добавить форму ${target.title} в этот слой?`;
    }
    $p.ui.dialogs.confirm({title: 'Типовая форма', text})
      .then(() => {
        editor.tool?.standard_form(target.alt);
      })
      .catch(() => null);
  };

  return <div className={classes.divider}>
    <ImageList rowHeight={42} cols={6} className={(layer.layer || elm_type != 'Рама') ? 'gl disabled' : ''}>
      {Object.keys(frms).map((key) => <ImageListItem key={key}>
        <img className={classes.img} src={`/imgs/${key}.png`} alt={key} title={frms[key]} onClick={onClick}/>
      </ImageListItem>)}
    </ImageList>
  </div>;
}

StandardForms.propTypes = {
  editor: PropTypes.object.isRequired,
  layer: PropTypes.object.isRequired,
  elm_type: PropTypes.object.isRequired,
};
