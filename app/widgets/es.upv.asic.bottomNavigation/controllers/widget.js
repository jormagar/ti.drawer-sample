/**
 * Controlador tabGroup.js
 * Contenedor de los tabs
 */
(function controller(args) {
  'use strict';

  var IS_IPHONEX,
    SAFE_IPHONEX_BOTTOM,
    TAB_PAGES_CONTAINER_IPHONEX_BOTTOM,
    PLATFORM,
    DURATION,
    CELL_PREFIX,
    TAB_PREFIX,
    FIRST_TAB,
    tabGroup,
    activeTab;

  //Safe bottom padding for iPhone X

  IS_IPHONEX = (OS_IOS && Ti.Platform.displayCaps.platformHeight >= 792);
  SAFE_IPHONEX_BOTTOM = 34;
  TAB_PAGES_CONTAINER_IPHONEX_BOTTOM = 90;

  PLATFORM = OS_ANDROID ? 'android' : 'ios';
  DURATION = 250;
  FIRST_TAB = 0;
  CELL_PREFIX = 'cell_';
  TAB_PREFIX = 'tab_';

  activeTab = FIRST_TAB;

  tabGroup = {
    cells: {},
    tabs: null
  };

  //Zona de funciones exportadas
  $.init = init;
  $.reload = reload;
  $.getActiveTab = getActiveTab;
  $.getLoadedTabs = getLoadedTabs;
  $.fadeIn = fadeIn;
  $.fadeOut = fadeOut;
  $.reset = resetTabs;

  //Aplica las propiedades asignadas al widget
  $.tabs.applyProperties(_.omit(args, 'id', 'opacity'));

  /**
   * init
   * @description Inicializamos widget dinámicamente
   * @param  {Object} params Parámetros de inicialización
   */
  function init(params) {
    var config, tabs, width, height, DEFAULT_HEIGHT;

    DEFAULT_HEIGHT = 56;

    config = params.config;
    tabs = params.tabs;

    //Calculamos % en base a tabs
    //width = (100 / tabs.length) + '%';
    width = getWidthForTab(tabs.length);
    //width = Titanium.Platform.displayCaps.platformWidth / tabs.length;
    height = DEFAULT_HEIGHT;

    //Creamos barra de tabs
    setTabControls(tabs, width, height, config);
  }

  /**
   * reload
   * @description Recargamos tabs
   * @param  {Object} params Parámetros de inicialización
   */
  function reload(params) {
    //Restablecemos el primer tab como activo
    setActiveTab(FIRST_TAB);
    //Reset de Widget
    resetTabs();
    //Reset y regeneración de UI
    regenerate(params);
  }

  /**
   * setTabControls
   * @description Establece la barra de control entre tabs
   * @param  {Object} tabs
   * @param  {String} width Ancho en %
   * @param {Number} height
   * @param {Object} config
   */
  function setTabControls(tabs, width, height, config) {
    //Check iPhone X
    if (IS_IPHONEX) {
      $.bar.setBackgroundColor(config.cell[PLATFORM].background);
      $.iPhoneX.setHeight(SAFE_IPHONEX_BOTTOM);
    }

    //Iteramos sobre los tabs para crear las celdas de control
    tabs.forEach(function (tab, index) {
      //Obtenemos el controlador de celda
      var tabController = getCellController({
        icon: tab.icon,
        label: tab.label,
        width: width,
        height: height,
        index: index,
        onclick: scrollToTab,
        style: config.cell
      });

      //Añadimos la celda a la vista del widget
      $.tabControlContainer.add(tabController.getView());

      //Guardamos la referencia al controlador de celda
      tabGroup.cells[CELL_PREFIX + index] = tabController;
    });

    setTabPages(tabs, config);
  }

  /**
   * setTabPages
   * @description Establece la vista de tabs
   * @param  {Object} tabs
   * @param  {Object} config
   */
  function setTabPages(tabs, config) {
    //Check iPhoneX
    if (IS_IPHONEX) {
      $.tabPagesContainer.setBottom(TAB_PAGES_CONTAINER_IPHONEX_BOTTOM);
    }

    //Obtenemos controlador de páginas
    tabGroup.tabs = Widget.createController('tabPages', {
      lazyLoad: config.lazyLoad || false,
      tabs: tabs
    });

    tabGroup.tabs.on('scroll', scrollPage);

    //Establecemos ScrollableView
    $.tabPagesContainer.add(tabGroup.tabs.getView());
    $.trigger('ready');
  }

  /**
   * getCellController
   * @description Obtenemos el controlador de cada celda
   * @param  {Object} params Parámetros de inicialización de controlador de celda
   * @returns {Object} controller
   */
  function getCellController(params) {
    return Widget.createController('tabCell', {
      icon: params.icon,
      label: params.label,
      width: params.width,
      height: params.height,
      index: params.index,
      style: params.style,
      onclick: scrollToTab
    });
  }

  /**
   * scrollPage
   * @description Callback al cambiar de tab. Establecemos tab activo en tabControl
   * @param  {Number} index
   */
  function scrollPage(index) {
    if (index !== activeTab) {
      setActiveCell(index);
      setActiveTab(index);
      $.trigger('scrollTab', {
        index: index
      });
    }
  }

  /**
   * getActiveTab
   * @description Establece tab activo
   * @returns  {Number} activeTab
   */
  function getActiveTab() {
    return activeTab;
  }

  /**
   * setActiveTab
   * @description Establece tab activo
   * @param  {Number} index
   */
  function setActiveTab(index) {
    activeTab = index;
  }

  /**
   * setActiveCell
   * @description Establece celda activa
   * @param  {Number} index
   */
  function setActiveCell(index) {
    tabGroup.cells[CELL_PREFIX + activeTab].resetActiveCell();
    tabGroup.cells[CELL_PREFIX + index].setActiveCell();
  }

  /**
   * scrollToTab
   * @description Visualiza un tab concreto
   * @param  {Number} index
   */
  function scrollToTab(index) {
    tabGroup.tabs.scrollToTab(index);
  }

  /**
   * getWidthForTab
   * @description Obtiene el tamaño de un tab
   * @param {Number} tabs
   * @returns {string}
   */
  function getWidthForTab(tabs) {
    var width = 100 / tabs;

    //Mas de 5 tabs
    if (width < 20) {
      width = 22;
    } else {
      $.tabControlContainer.setContentWidth(Ti.UI.FILL);
    }

    return width + '%';
  }

  /**
   * getLoadedTabs
   * @description  Obtiene el número de tabs activos
   * @returns {number}
   */
  function getLoadedTabs() {
    return tabGroup.tabs.getLoadedTabs();
  }

  /**
   * Reseteo de Tabs
   * @method resetTabs
   */
  function resetTabs() {
    resetTabControl();
    resetTabPages();
  }

  /**
   * Reset de celdas de control de tabs
   * @method resetTabControl
   */
  function resetTabControl() {
    //Para todas las celdas, reset
    Object.keys(tabGroup.cells).forEach(function (cell) {
      tabGroup.cells[cell].reset();
    });
    //Reset objeto global
    tabGroup.cells = {};
  }

  /**
   * Reset de contenido de tabs
   * @method resetTabPages
   */
  function resetTabPages() {
    //Para los tabs, reset
    tabGroup.tabs.reset();
    //Reset objeto global
    tabGroup.tabs = null;
  }

  /**
   * Reset de vistas y regeneración de interfaz
   * @method  regenerate
   * @param   {object}   params Opciones de inicialización
   */
  function regenerate(params) {
    var animation,
      removeElements;

    //Elimina los elementos de UI del Widget
    removeElements = function () {
      $.tabControlContainer.removeAllChildren();
      $.tabPagesContainer.removeAllChildren();

      //Iniciamos los tabs
      init(params);
    };

    //Creamos animación para fade out
    animation = Ti.UI.createAnimation({
      duration: DURATION,
      opacity: 0
    });

    //Eliminamos vistas de los contenedores principales
    animation.addEventListener('complete', removeElements);

    //Animamos vistas
    $.tabs.animate(animation);
    //$.tabControlContainer.animate(animation);
    //$.tabPagesContainer.animate(animation);
  }

  /**
   * Efecto de entrada fade in
   * @method  fadeIn
   */
  function fadeIn() {
    $.tabs.animate({
      opacity: 1,
      duration: DURATION
    });
  }

  /**
   * Efecto de entrada fade out
   * @method  fadeOut
   */
  function fadeOut() {
    $.tabs.animate({
      opacity: 0,
      duration: DURATION
    });
  }

})(arguments[0] || {});
