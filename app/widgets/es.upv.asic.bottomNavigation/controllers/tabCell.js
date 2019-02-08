/**
 * Controlador tabCell
 * Celda de tab en tabControl
 */
(function controller(args) {
  'use strict';

  var index,
    width,
    height,
    icon,
    label,
    style,
    onclick,
    cellElements,
    PLATFORM,
    FIRST_CELL;

  FIRST_CELL = 0;
  PLATFORM = OS_ANDROID ? 'android' : 'ios';

  cellElements = ['cell', 'container', 'icon', 'label'];

  index = args.index;
  width = args.width;
  height = args.height;
  icon = args.icon;
  label = args.label;
  style = args.style;
  onclick = args.onclick;

  //Añadimos la posición de la celda a cada elemento
  //de este modo nos aseguramos que donde se haga click
  //nos devuelve la posición
  cellElements.forEach(function (view) {
    $[view].index = index;
  });

  //Establecemos el tamaño de la celda
  $.cell.setWidth(width);
  $.cell.setHeight(height);

  //Establecemos el icono
  $.icon.setText(icon);
  //Establecemos el texto de la celda
  $.label.setText(label);

  //Establecemos listener sobre click en celda
  $.addListener($.cell, 'click', scrollToTab);

  //Establecemos estilos
  $.cell.setBackgroundColor(style[PLATFORM].background);

  //Si es la primera celda, es activa
  if (index === FIRST_CELL) {
    setActiveCell();
  } else {
    resetActiveCell();
  }

  $.border.applyProperties({
    backgroundColor: style[PLATFORM].border
  });

  /**
   * scrollToTab
   * @description Callback al hacer click sobre celda
   * @param  {Object} e Evento
   */
  function scrollToTab(e) {
    onclick(e.source.index);
  }

  /**
   * setActiveCell
   * @description Establece una celda como activa
   */
  function setActiveCell() {
    $.icon.applyProperties({
      color: style[PLATFORM].active,
      font: {
        fontFamily: style.icon.fontFamily,
        fontSize: 24
      }
    });
    $.label.applyProperties({
      color: style[PLATFORM].active,
      font: {
        fontSize: 14
      }
    });
  }

  /**
   * resetActiveCell
   * @description Restablece una celda a su estado inicial
   */
  function resetActiveCell() {
    $.icon.applyProperties({
      color: style[PLATFORM].default,
      font: {
        fontFamily: style.icon.fontFamily,
        fontSize: 24
      }
    });
    $.label.applyProperties({
      color: style[PLATFORM].default,
      font: {
        fontSize: 12
      }
    });
  }

  /**
   * resetController
   * @description Libera el controlador de sus eventos y recursos
   */
  function resetController() {
    //Eliminamos listeners
    $.removeListener();
    $.off();
    $.destroy();

    //Liberamos recursos
    index = null;
    width = null;
    height = null;
    label = null;
    onclick = null;
    $ = null;
  }

  //Zona de funciones exportadas
  $.setActiveCell = setActiveCell;
  $.resetActiveCell = resetActiveCell;
  $.reset = resetController;

})(arguments[0] || {});
