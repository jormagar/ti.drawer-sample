/**
 * Controlador principal de aplicación
 * @controller main/navigation.js
 * @params {object} args
 */
(function controller(args) {

  'use strict';

  const BOTTOM_NAVIGATION_CONFIG = {
    cell: {
      icon: {
        fontFamily: Alloy.CFG.Text.Font.Icons.MaterialIcons
      },
      android: {
        background: Alloy.CFG.Color.white,
        default: Alloy.CFG.Color.gray,
        active: Alloy.CFG.Color.primary,
        border: Alloy.CFG.Color.gray
      },
      ios: {
        background: Alloy.CFG.Color.white,
        default: Alloy.CFG.Color.gray,
        active: Alloy.CFG.Color.primary,
        border: Alloy.CFG.Color.gray
      }
    }
  };

  const configuration = args.configuration;
  const controllers = args.controllers;

  const onReady = (function () {
    let times = 1;
    return function () {
      times -= 1;
      if (!times) {
        times = 1;
        onBottomNavigationReady();
      }
    };
  })();

  //Funciones exportadas
  $.reset = reset;

  /**
   * Creación de controlador
   * @method  onCreateController
   */
  (function onCreateController() {
    Ti.API.debug('onCreateController main/navigation.js');
    //Configurar librerias
    addListener();
    setLayout();
  })();

  /**
   * Añadimos manejadores de eventos
   * @method addListener
   */
  function addListener() {
    Ti.API.debug('addListener main/navigation.js');

    $.on('ready', onReady);
    $.bottomNavigation.on('ready', onReady);
    $.bottomNavigation.on('scrollTab', onScrollTab);
  }

  /**
   * Establecemos elementos de interfaz
   * @method setLayout
   */
  function setLayout() {
    $.bottomNavigation.init({
      config: BOTTOM_NAVIGATION_CONFIG,
      tabs: generateTabs()
    });
  }

  /**
   * Genera los tabs
   * @method  generateTabs
   * @returns {object}       Lista de tabs
   */
  function generateTabs() {
    Ti.API.debug('generateTabs on main/navigation.js');

    const tabs = [];

    for (let i = 0, l = controllers.length; i < l; ++i) {
      tabs.push({
        label: L(controllers[i].label),
        icon: String.fromCharCode('0x' + controllers[i].icon),
        controller: getControllerParams(controllers[i].path, {
          configuration: configuration
        })
      });
    }

    Ti.API.debug('tabs : ---> ' + JSON.stringify(tabs));

    return tabs;
  }

  /**
   * Devuelve los parámetros de creación de controlador
   * @method  getControllerParams
   * @param   {string}            name        Nombre del controlador a instanciar
   * @param   {object}            params      Parámetros del controlador
   * @returns {object}
   */
  function getControllerParams(name, params) {
    Ti.API.debug('getControllerParams on main/navigation.js');
    return {
      name: name,
      args: params
    };
  }

  /**
   * Callback ready bottom nav
   * @method  onBottomNavigationReady
   * @param   {object}                e
   */
  function onBottomNavigationReady(e) {
    Ti.API.debug('onBottomNavigationReady on main/navigation.js');
    $.bottomNavigation.fadeIn();
  }

  /**
   * Callback evento scrollTab del widget bottomNavigation
   * @method  onScrollTab
   * @param   {Object}    e Evento
   * @returns {void}
   */
  function onScrollTab(e) {
    $.trigger('scrollTab', e);
  }

  /**
   * Limpieza del controlador
   * @method reset
   */
  function reset() {
    Ti.API.debug('reset on main/navigation.js');

    $.bottomNavigation.reset();

    $.removeListener();
    $.off();
    $.destroy();
  }

})(arguments[0] || {});
