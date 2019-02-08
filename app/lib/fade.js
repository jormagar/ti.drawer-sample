/**
 * Librería que permite aplicar efecto Fade entre vistas
 * @author Jorge Macías García
 * @copyright Universitat Politècnica de València (c) 2018
 * @module Fade
 * @version 1.0.0
 */
let FADE_DURATION = 750;

exports.setContent = setContent;
exports.setDuration = setDuration;

/**
 * Establece duración de la animación
 * @method setDuration
 * @param  {number}    duration
 */
function setDuration(duration) {
  Ti.API.debug('Fade.setDuration');

  FADE_DURATION = Number(duration);
}

/**
 * Establecemos contenido en el contenedor
 * @method setContent
 * @param  {object}   container   Vista contenedora
 * @param  {object}   view   Vista a mostrar
 * @param  {boolean}   reset Flag eliminar contenido
 * @param  {object}   obj Controlador y evento a lanzar
 */
function setContent(container, view, reset, obj) {
  Ti.API.debug('Fade.setContent');

  if (reset) {
    removeContent(container, view, obj);
  } else {
    container.add(view);
  }
}

/**
 * @method removeContent
 * @description Establecemos contenido en el contenedor
 * @param  {object}   container   Vista contenedora
 * @param {Object} view
 * @param {Object} obj Controlador y evento a lanzar
 */
function removeContent(container, view, obj) {
  Ti.API.debug('Fade.removeContent');

  const children = container.getChildren()[0];

  if (children) {
    fadeOut(container, children, view, obj);
  } else {
    container.add(view);
  }
}

/**
 * Inicia el proceso de desaparecer en pantalla
 * @method fadeOut
 * @param {object} container   Vista contenedora
 * @param {object} fadeOutView Vista fade out
 * @param {object} fadeInView Vista fade in
 * @param {object} obj Controlador y evento a lanzar
 */
function fadeOut(container, fadeOutView, fadeInView, obj) {
  Ti.API.debug('Fade.fadeOut');

  const animation = Ti.UI.createAnimation({
    opacity: 0,
    duration: FADE_DURATION
  });

  animation.addEventListener('complete', fadeIn.bind(null, container, fadeInView, obj));

  fadeOutView.animate(animation);
}

/**
 * Inicia el proceso de hacer aparecer en pantalla
 * @method fadeIn
 * @param {object} container
 * @param {object} fadeInView
 * @param {object} obj
 * @param  {object} e Evento
 */
function fadeIn(container, fadeInView, obj, e) {
  Ti.API.debug('Fade.fadeIn');

  const animation = Ti.UI.createAnimation({
    opacity: 1,
    duration: FADE_DURATION
  });

  fadeInView.setOpacity(0);

  if (Object(obj).hasOwnProperty('e')) {
    animation.addEventListener('complete', fireEvent.bind(null, obj));
  }

  container.children.length && container.removeAllChildren();
  container.add(fadeInView);

  fadeInView.animate(animation);
}

/**
 * Lanza evento
 * @method  fireEvent
 * @param {object} obj
 * @param   {object}  e Evento
 */
function fireEvent(obj, e) {
  Ti.API.debug('Fade.fireEvent');

  obj.controller.trigger(obj.e);
}
