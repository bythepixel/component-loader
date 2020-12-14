import { id } from './util';

/**
 * Binds a component to the DOM
 * @param {HTMLElement} DOMElement
 * @param {Component} Component
 */
export function bindComponent(entry, loaderInstance) {
  const instance = new entry.Component(entry.element, entry.options, loaderInstance);
  // eslint-disable-next-line no-param-reassign
  entry.element.component = instance;
  return Object.assign(entry, {
    instance,
    loaderInstance,
    loaded: true,
  });
}

export function createRegistryEntry(element, Component, options) {
  return {
    id: id(),
    loaded: false,
    element,
    Component,
    options,
  };
}
