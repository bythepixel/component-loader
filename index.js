import ComponentLoader from './loader';
import setIndex from './indexService';

export default class Component {
  static loaderPriority = 'idle'
  static loaderPriorityDelay = 0

  #loaderInstance

  constructor(element, options = {}, loaderInstance) {
    this.$id = `$id_${setIndex()}`;
    this.$container = element;
    this.$options = { ...options };
    this.#loaderInstance = loaderInstance;
  }

  $setOptions(options, DEFAULTS = {}) {
    Object.assign(this.$options, DEFAULTS, options);
  }

  $debug(...args) {
    console.debug(this.$id, ...args);
  }

  $publish(subscription, ...args) {
    this.#loaderInstance.publish(subscription, this.$id, ...args);
  }

  $subscribe(subscription, callback) {
    this.#loaderInstance.subscribe(subscription, callback, this);
  }

  $unsubscribe(subscription, callback) {
    this.#loaderInstance.unsubscribe(subscription, callback, this);
  }
}

export { ComponentLoader };
