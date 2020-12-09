import { runInView, isValidSelector } from './util';
import { bindComponent, createRegistryEntry } from './registry';

export default class ComponentLoader {
  #idleQueue = [];
  #subscriptions = {};
  #idleQueueDoneCallback
  #container
  #registry = new Map();

  #loaders = {
    high: entry => bindComponent(entry.element, this),
    idle: (entry, queue) => queue.push(entry),
    'in-view': entry => runInView(entry.element, () => bindComponent(entry, this)),
  };

  constructor(container, components, idleQueueDoneCallback = () => {}) {
    this.#container = container;
    this.#idleQueueDoneCallback = idleQueueDoneCallback;

    components.forEach(comp => {
      // eslint-disable-next-line no-unused-expressions
      Array.isArray(comp) ? this._registerComponent(comp[0], comp[1]) : this._registerComponent(comp);
    });
    this._loadAll();
    this._runIdleQueue();
  }

  /**
   * Binds a component to the DOM, and registers the instance
   * @param {Component} Component
   */
  _registerComponent(Component, options) {
    if (!isValidComponent(Component)) return;
    this.#container.querySelectorAll(Component.selector)
      .forEach(element => this._addToRegistry(element, Component, options));
  }

  _addToRegistry(element, Component, options) {
    const entry = createRegistryEntry(element, Component, options);
    this.#registry.set(entry.id, entry);
  }

  loadComponent(entry) {
    if (!entry) return;
    const load = this.getLoader(entry.Component.loaderPriority);
    if (entry.Component.loaderPriority === 'idle') {
      Object.assign(entry, {
        instance: load(entry, this.#idleQueue),
        loaded: 'pending',
      });
    } else {
      Object.assign(entry, {
        instance: load(entry),
        loaded: true,
      });
    }
  }

  _loadAll() {
    [...this.#registry.values()].forEach(entry => this.loadComponent(entry));
  }

  _addToQueue(...args) {
    this.#idleQueue.push({ args });
  }

  _runIdleQueue() {
    this.#idleQueue.forEach((entry, i) => {
      if (!window.requestIdleCallback) {
        window.requestAnimationFrame(() => {
          bindComponent(entry, this);
          if (i === this.#idleQueue.length - 1) {
            this.#idleQueueDoneCallback();
          }
        });
      } else {
        window.requestIdleCallback(() => {
          bindComponent(entry, this);
          if (i === this.#idleQueue.length - 1) {
            this.#idleQueueDoneCallback();
          }
        }, { timeout: 4000 });
      }
    });
  }

  _getComponentsBySelector(selector) {
    return this.#registry.get(selector);
  }

  subscribe(subscription, callback, context) {
    if (!this.#subscriptions[subscription]) {
      this.#subscriptions[subscription] = [];
    }

    this.#subscriptions[subscription].push({ context, callback });
  }

  unsubscribe(subscription) {
    if (!this.#subscriptions[subscription]) {
      console.warn(`The subscript '${subscription}' doesn't exist.`);
      return false;
    }

    this.#subscriptions[subscription].forEach((sub, i) => sub.splice(i, 1));

    return false;
  }

  publish(subscription, originId, ...args) {
    if (!this.#subscriptions[subscription]) return false;
    this.#subscriptions[subscription].forEach(sub => {
      // Don't pass the message to the origin component
      if (sub.context.$id === originId) return;
      sub?.callback.apply(sub.context, args);
    });

    return true;
  }

  getLoader(loader) {
    return this.#loaders[loader];
  }
}

function isValidComponent(Component) {
  if (!isValidSelector(Component.selector)) {
    console.error(
      `ComponentLoader: The Component subclass, '${Component.name}', needs a valid 'selector' property.`,
      Component,
    );
    return false;
  }
  return true;
}
