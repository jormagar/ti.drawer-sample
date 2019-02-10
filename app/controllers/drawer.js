/**
 * Drawer controller
 * @controller menu.js
 * @params {object} args
 */
(function controller(args) {

  'use strict';

  const DURATION = 500;
  const CACHE = 180000;
  const MORNING = 8;
  const AFTERNOON = 16;
  const NIGHT = 21;

  const CATEGORY = {
    MAIN: 'main',
    OPENABLE: 'openable',
    ACTION: 'action'
  };

  const DRAWER = args.drawer;

  const HEADER = DRAWER.Header;

  const ROOT = HEADER.root;

  const Menu = {
    values: {
      visible: false,
      current: DRAWER.Items.Home.id
    },
    get current() {
      return this.values.current;
    },
    set current(value) {
      this.values.current = value;
    },
    get visible() {
      return this.values.visible;
    },
    set visible(value) {
      this.values.visible = value;
    }
  };

  const menuItems = getMenuItems();

  //Function export section
  $.open = open;
  $.close = close;
  $.dataTransform = dataTransform;
  $.dataFilterMenu = dataFilter.bind(null, [CATEGORY.MAIN]);
  $.dataFilterOpenable = dataFilter.bind(null, [CATEGORY.OPENABLE, CATEGORY.ACTION]);
  $.setHeader = getSetHeader();
  $.reset = reset;

  /**
   * @method  onCreateController
   */
  (function onCreateController() {
    Ti.API.debug('drawer.js_onCreateController');

    addListener();
    setLayout();
  })();

  /**
   * Añadimos manejadores de eventos
   * @method addListener
   */
  function addListener() {
    Ti.API.debug('drawer.js_addListener');

    //Eventos de controlador
    $.on('sync', fetch);

    //Eventos de UI
    $.addListener($.list, 'itemclick', onItemClick);

    if (OS_IOS) {
      $.addListener($.win, 'open', onOpen);
      $.addListener($.win, 'swipe', onSwipe);
      $.addListener($.background, 'click', onBackgroundClick);
    }
  }

  /**
   * @method setLayout
   */
  function setLayout() {
    Ti.API.debug('drawer.js_setLayout');

    Alloy.Collections.menu.reset(menuItems);
  }

  /**
   * Menu sync
   * @method fetch
   * @param  {object} e
   */
  function fetch(e) {
    Ti.API.debug('drawer.js_fetch');

    Alloy.Collections.menu.trigger('change');
  }

  /**
   * @method onOpen
   * @param  {object} e
   */
  function onOpen(e) {
    Ti.API.debug('drawer.js_onOpen');
    openMenu();
  }

  /**
   * @method onBackgroundClick
   * @param  {object}          e
   */
  function onBackgroundClick(e) {
    Ti.API.debug('drawer.js_onBackgroundClick');
    close();
  }

  /**
   * @method openMenu
   */
  function openMenu() {
    Ti.API.debug('drawer.js_openMenu');

    if (Menu.visible) {
      close();
      return;
    }

    Menu.visible = true;

    $.setHeader();

    $.background.animate(Ti.UI.createAnimation({
      opacity: 1,
      duration: DURATION
    }));

    $.menu.animate(Ti.UI.createAnimation({
      left: 0,
      duration: DURATION
    }));
  }

  /**
   * Callback swipe sobre ventana
   * @method onSwipe
   * @param  {object} e
   */
  function onSwipe(e) {
    Ti.API.debug('drawer.js_onSwipe');

    if (e.direction === 'left') {
      close();
    }
  }

  /**
   * Drawer item click
   * @method onItemClick
   * @param {object} e Event
   */
  function onItemClick(e) {
    Ti.API.debug('drawer.js_onItemClick');

    Ti.API.debug('e: ' + JSON.stringify(e));

    const itemId = Number(e.itemId);
    const model = Alloy.Collections.menu.get({id: itemId});

    if (model.get('category') === CATEGORY.MAIN) {
      if (itemId === Menu.current) {
        $.trigger('hide');
        return;
      }

      Menu.current = itemId;
      fetch();
    }

    $.trigger('itemclick', {
      itemId: itemId,
      key: model.get('name')
    });
  }

  /**
   * Open iOS drawer
   * @method open
   */
  function open() {
    Ti.API.debug('open.js_close');

    $.getView().open();
  }

  /**
   * Close iOS drawer
   * @method close
   */
  function close() {
    Ti.API.debug('drawer.js_close');

    Menu.visible = false;

    $.background.animate(Ti.UI.createAnimation({
      opacity: 0,
      duration: DURATION
    }));

    $.menu.animate(Ti.UI.createAnimation({
      duration: DURATION,
      left: Alloy.Globals.UI.Design.DRAWER_WIDTH_NEGATIVE
    }), function () {
      $.getView().close();
    });
  }

  /**
   * Get header setter
   * @method getSetHeader
   * @returns {function}
   */
  function getSetHeader() {

    let lastCache = 0;

    return function () {
      Ti.API.debug('drawer.js_setHeader');
      const date = new Date();
      const now = Date.now();

      //Force always load new image
      //lastCache = 0;

      if (lastCache <= now) {
        lastCache = now + CACHE;

        const hour = date.getHours();

        let key = 'night';

        if (hour >= MORNING && hour < AFTERNOON) {
          key = 'morning';
        } else if (hour >= AFTERNOON && hour < NIGHT) {
          key = 'afternoon';
        }

        const length = HEADER[key].length;
        const index = Math.floor(Math.random() * length);

        $.header.setImage(ROOT + HEADER[key][index]);

      }
    };
  }

  /**
   * @method dataTransform
   * @param  {object}      model
   * @returns {object}
   */
  function dataTransform(model) {
    Ti.API.debug('drawer.js_dataTransform');

    return prepareModel(model.toJSON());
  }

  /**
   * @method prepareModel
   * @param  {object}     model
   * @returns {object}
   */
  function prepareModel(model) {
    Ti.API.debug('drawer.js_prepareModel');

    model.iconColor = Alloy.CFG.Color.text.secondary;
    model.titleColor = Alloy.CFG.Color.text.secondary;
    model.rowColor = Alloy.CFG.Color.white;

    if (model.id === Menu.current) {
      model.iconColor = Alloy.CFG.Color.text.primary;
      model.titleColor = Alloy.CFG.Color.text.primary;
      model.rowColor = Alloy.CFG.Color.white_dark;
    }

    return model;
  }

  /**
   * Collection filter
   * @method dataFilter
   * @param {string} category Categoría de item de menú
   * @param  {object} collection Colección de menú
   * @returns {object}
   */
  function dataFilter(categories, collection) {
    let result = [];
    categories.forEach(function(category){
      result = result.concat(collection.where({ category: category }));
    });
    return result;
  }

  /**
   * @method getMenuItems
   * @returns {object} items
  */
  function getMenuItems() {
    Ti.API.debug('drawer.js_getMenuItems');

    const models = [];
    const items = DRAWER.Items;

    Object.keys(items).forEach(function (key) {
      models.push(Alloy.createModel('menu', {
        id: items[key].id,
        name: items[key].name,
        label: L(items[key].label),
        path: items[key].path,
        icon: String.fromCharCode('0x' + items[key].icon),
        category: items[key].category
      }));
    });

    return models;
  }

  /**
   * Clean controller
   * @method reset
   */
  function reset() {
    Ti.API.debug('drawer.js_reset');

    $.removeListener();
    $.off();
    $.destroy();
  }

})(arguments[0] || {});
