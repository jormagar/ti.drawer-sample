/**
 * Controlador tabPages
 * Scrollable view de los tabs
 */
(function controller(args) {
  'use strict';

  var tabs,
    pages,
    TAB_PREFIX;

  TAB_PREFIX = 'tab_';

  tabs = {};

  pages = args.tabs;

  //Zona de funciones exportadas
  $.reset = resetController;
  $.scrollToTab = scrollToTab;
  $.getLoadedTabs = getLoadedTabs;

  //Para cada página de ScrollableView
  pages.forEach(function (page, index) {
    var controller, tabName;

    tabName = TAB_PREFIX + index;

    //Instanciamos controlador
    controller = Alloy.createController(page.controller.name, page.controller.args);

    //Añadimos el controlador al objeto global
    addTabController(tabName, controller);

    //Añadimos la vista a ScrollableView
    addTabView(controller.getView());
    controller.trigger('ready');
  });

  /**
   * addTabController
   * @description Añade el controlador de tab al objeto de tabs
   * @param {String} name
   * @param {Object} controller
   */
  function addTabController(name, controller) {
    tabs[name] = controller;
  }

  /**
   * addTabView
   * @description Añade una vista a ScrollableView
   * @param {Object} view
   */
  function addTabView(view) {
    let v = Ti.UI.createView();
    v.add(view);
    $.scrollableView.addView(v);
  }

  /**
   * replaceTabView
   * @description Reemplazamos la vista de ScrollableView
   * @param  {Object} view
   * @param {Number} index
   */
  function replaceTabView(view, index) {
    var views = $.scrollableView.getViews();
    views[index] = view;
    $.scrollableView.setViews(views);
  }

  /**
   * scrollToTab
   * @description Mueve la vista al tab elegido
   * @param  {Number} index Tab al que movernos
   */
  function scrollToTab(index) {
    $.trigger('scroll', index);
    $.scrollableView.setCurrentPage(index);
  }

  /**
   * getLoadedTabs
   * @description  Obtiene el número de tabs activos
   * @returns {Number}
   */
  function getLoadedTabs() {
    return Object.keys(tabs).length;
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

    //Para cada controlador de tab, reset
    Object.keys(tabs).forEach(function (tab) {
      tabs[tab].reset();
    });

    //Liberamos recursos
    pages = null;
    tabs = null;
    $ = null;
  }

})(arguments[0] || {});
