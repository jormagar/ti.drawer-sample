/**
 * Librería gestión de items de acción en
 * barras de navegación cola FIFO/LIFO
 * @author Jorge Macías García
 * @copyright Universitat Politècnica de València (c) 2018
 * @module Actionbar
 * @version 1.0.0
 */
'use strict';

module.exports = {
  showActions: showActions,
  hideActions: hideActions
};

/**
 * Muestra los iconos de action bar
 * @method showActions
 * @param {object} controller Referencia al controlador
 * @param {string} id Identificador de ventana
 * @param {object} iconList Lista de iconos
 */
function showActions(controller, id, iconList = []) {
  if (OS_IOS) {
    showActionsOnIOS(controller, id, iconList);
  } else if (OS_ANDROID) {
    showActionsOnAndroid(controller, id, iconList);
  }
}

/**
 * Muestra el icono de la barra de acciones
 * @method showActionsOnIOS
 * @param {object} controller Referencia al controlador
 * @param {string} id Identificador de ventana
 * @param {object} iconList Lista de iconos
 */
function showActionsOnIOS(controller, id, iconList) {
  let buttons = [];

  hideActionsOnIOS(controller, id);

  //Añadimos botones
  iconList.forEach(function (item) {
    let action = Ti.UI.createImageView({
      width: Ti.UI.SIZE,
      height: Ti.UI.SIZE,
      image: item.icon
    });
    controller.addListener(action, 'click', item.callback);

    buttons.push(action);
  });

  controller.getView(id).rightNavButtons = buttons;

}

/**
 * Muestra el icono de la barra de acciones
 * @method showActionsOnAndroid
 * @param {object} controller Referencia al controlador
 * @param {string} id Identificador de ventana
 * @param {object} iconList Lista de iconos
 */
function showActionsOnAndroid(controller, id, iconList) {

  hideActionsOnAndroid(controller, id);

  if (typeof controller.getView(id).activity.getOnCreateOptionsMenu === 'function') {
    controller.getView(id).activity.onCreateOptionsMenu = getOnCreateOptionsMenu(iconList);
    controller.getView(id).activity.invalidateOptionsMenu();
  }
}

/**
 * Oculta los iconos de action bar
 * @method hideActions
 * @param {object} controller
 * @param {string} id Identificador de ventana
 */
function hideActions(controller, id) {
  if (OS_IOS) {
    hideActionsOnIOS(controller, id);
  } else if (OS_ANDROID) {
    hideActionsOnAndroid(controller, id);
  }
}

/**
 * Oculta el icono de la barra de acciones
 * @method hideActionsOnIOS
 * @param {object} controller
 * @param {string} id Identificador de ventana
 */
function hideActionsOnIOS(controller, id) {
  //Nos aseguramos que no hay botones
  //Eliminamos listeners
  const buttons = controller.getView(id).rightNavButtons;

  buttons && buttons.forEach(function (button) {
    controller.removeListener(button);
  });

  //Vaciamos botones
  controller.getView(id).rightNavButtons = null;
}

/**
 * Oculta el icono de la barra de acciones
 * @method hideActionsOnAndroid
 * @param {object} controller
 * @param {string} id Identificador de ventana
 */
function hideActionsOnAndroid(controller, id) {
  if (typeof controller.getView(id).activity.getOnCreateOptionsMenu === 'function') {
    controller.getView(id).activity.onCreateOptionsMenu = getOnCreateOptionsMenu(null, true);
    controller.getView(id).activity.invalidateOptionsMenu();
  }
}

/**
 * Caso especial búsqueda en action bar
 * @method onSubmitSearch
 * @param {object} e 
 */
function onSubmitSearch(e){
  action.callback(e.source.value);
}

/**
 * Devuelve la función adecuada para la creación del menú en
 * action bar
 * @method getOnCreateOptionsMenu
 * @param {object} iconList
 * @param {boolean} clear Reset de actionbar
 * @returns {function} onCreateOptionsMenu
 */
function getOnCreateOptionsMenu(iconList, clear) {
  var onCreateOptionsMenu;

  if (clear) {
    onCreateOptionsMenu = function (e) {
      const items = e.menu.getItems();

      items.forEach(function (item) {
        if (item.actionView && item.actionView.type === 'search') {
          item.actionView.removeEventListener('submit', onSubmitSearch);
        } else {
          item.removeEventListener('click', item.callback);
        }
      });

      e.menu.clear();
    };
  } else {
    onCreateOptionsMenu = (function (list) {
      const actionList = list;

      return function (e) {
        
        const menu = e.menu;

        actionList.forEach(function (action) {
          let searchView = null;
          let item = null;

          Ti.API.debug('ACTION: ' + JSON.stringify(action));

          if (action.type === 'search'){
            Ti.API.debug('ACTION TYPE: ' + action.type);

            searchView = Ti.UI.Android.createSearchView({
              type: action.type,
              hintText: 'Search...',
              hintTextColor: 'black',
              iconified: true,
              color: 'black'
            });

            searchView.addEventListener('submit', onSubmitSearch);

            item = menu.add({
              title: 'Search',
              icon: action.icon,
              actionView: searchView,
              showAsAction: Ti.Android.SHOW_AS_ACTION_IF_ROOM | Ti.Android.SHOW_AS_ACTION_COLLAPSE_ACTION_VIEW,
            });
          } else {
            item = menu.add({
              icon: action.icon,
              showAsAction: Ti.Android.SHOW_AS_ACTION_ALWAYS | Ti.Android.SHOW_AS_ACTION_COLLAPSE_ACTION_VIEW,
              callback: action.callback
            });
  
            item.addEventListener('click', action.callback);
          }
          
        });
      };
    })(iconList);
  }

  return onCreateOptionsMenu;
}
