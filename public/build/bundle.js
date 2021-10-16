
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function self(fn) {
        return function (event) {
            // @ts-ignore
            if (event.target === this)
                fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind$1(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.43.2' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
     * Create a ripple action
     * @typedef {{ event?: string; transition?: number; zIndex?: string; rippleColor?: string; disabled?: boolean }} Options
     * @param {Element} node
     * @param {Options} [options={}]
     * @returns {{ destroy: () => void; update: (options?: Options) => void }}
     */
    function ripple(node, options = {}) {
      // Default values.
      const props = {
        event: options.event || 'click',
        transition: options.transition || 150,
        zIndex: options.zIndex || '100',
        bg: options.rippleColor || null,
        disabled: options.disabled || false,
      };

      const handler = event => rippler(event, node, props);

      if (!props.disabled) {
        node.addEventListener(props.event, handler);
      }

      function rippler(event, target, { bg, zIndex, transition }) {
        // Get border to avoid offsetting on ripple container position
        const targetBorder = parseInt(
          getComputedStyle(target).borderWidth.replace('px', '')
        );

        // Get necessary variables
        const rect = target.getBoundingClientRect(),
          left = rect.left,
          top = rect.top,
          width = target.offsetWidth,
          height = target.offsetHeight,
          dx = event.clientX - left,
          dy = event.clientY - top,
          maxX = Math.max(dx, width - dx),
          maxY = Math.max(dy, height - dy),
          style = window.getComputedStyle(target),
          radius = Math.sqrt(maxX * maxX + maxY * maxY),
          border = targetBorder > 0 ? targetBorder : 0;

        // Create the ripple and its container
        const ripple = document.createElement('div');
        const rippleContainer = document.createElement('div');
        rippleContainer.className = 'ripple-container';
        ripple.className = 'ripple';

        // Styles for the ripple
        ripple.style.marginTop = '0px';
        ripple.style.marginLeft = '0px';
        ripple.style.width = '1px';
        ripple.style.height = '1px';
        ripple.style.transition = `all ${transition}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        ripple.style.borderRadius = '50%';
        ripple.style.pointerEvents = 'none';
        ripple.style.position = 'relative';
        ripple.style.zIndex = zIndex;
        if (bg !== null) {
          ripple.style.backgroundColor = bg;
        }

        // Styles for the rippleContainer
        rippleContainer.style.position = 'absolute';
        rippleContainer.style.left = 0 - border + 'px';
        rippleContainer.style.top = 0 - border + 'px';
        rippleContainer.style.height = '0';
        rippleContainer.style.width = '0';
        rippleContainer.style.pointerEvents = 'none';
        rippleContainer.style.overflow = 'hidden';

        // Store target position to change it after
        const storedTargetPosition =
          target.style.position.length > 0
            ? target.style.position
            : getComputedStyle(target).position;
        // Change target position to relative to guarantee ripples correct positioning
        if (
          storedTargetPosition !== 'relative' &&
          storedTargetPosition !== 'absolute'
        ) {
          target.style.position = 'relative';
        }

        rippleContainer.appendChild(ripple);
        target.appendChild(rippleContainer);

        ripple.style.marginLeft = dx + 'px';
        ripple.style.marginTop = dy + 'px';

        rippleContainer.style.width = width + 'px';
        rippleContainer.style.height = height + 'px';
        rippleContainer.style.borderTopLeftRadius = style.borderTopLeftRadius;
        rippleContainer.style.borderTopRightRadius = style.borderTopRightRadius;
        rippleContainer.style.borderBottomLeftRadius = style.borderBottomLeftRadius;
        rippleContainer.style.borderBottomRightRadius =
          style.borderBottomRightRadius;
        rippleContainer.style.direction = 'ltr';

        setTimeout(() => {
          ripple.style.width = radius * 2 + 'px';
          ripple.style.height = radius * 2 + 'px';
          ripple.style.marginLeft = dx - radius + 'px';
          ripple.style.marginTop = dy - radius + 'px';
        }, 0);

        function clearRipple() {
          setTimeout(() => {
            ripple.style.backgroundColor = 'rgba(0, 0, 0, 0)';
          }, 250);

          // Timeout set to get a smooth removal of the ripple
          setTimeout(() => {
            rippleContainer.parentNode.removeChild(rippleContainer);
          }, transition + 250);

          // After removing event set position to target to it's original one
          // Timeout it's needed to avoid jerky effect of ripple jumping out parent target
          setTimeout(() => {
            let clearPosition = true;
            for (let i = 0; i < target.childNodes.length; i++) {
              if (target.childNodes[i].className === 'ripple-container') {
                clearPosition = false;
              }
            }

            if (clearPosition) {
              if (storedTargetPosition !== 'static') {
                target.style.position = storedTargetPosition;
              } else {
                target.style.position = '';
              }
            }
          }, transition + 250);
        }

        clearRipple();
      }

      return {
        destroy() {
          node.removeEventListener(props.event, handler);
        },
        update(newProps = {}) {
          if (newProps.disabled) {
            node.removeEventListener(props.event, handler);
          } else {
            node.addEventListener(props.event, handler);
          }
        },
      };
    }

    /**
     * An action to set up arbitrary event listeners dynamically.
     * @param {Element} node
     * @param {Array<{ name: string; handler: EventListenerOrEventListenerObject }>} args The event listeners to be registered
     * @returns {{ destroy: () => void }}
     */
    function events(node, args) {
      if (args != null) {
        for (const event of args) {
          node.addEventListener(event.name, event.handler);
        }
      }

      return {
        destroy() {
          if (args != null) {
            for (const event of args) {
              node.removeEventListener(event.name, event.handler);
            }
          }
        },
      };
    }

    /**
     * Filters out falsy classes.
     * @param {...(string | false | null)} args The classes to be filtered
     * @return {string} The classes without the falsy values
     */
    function classes(...args) {
      return args.filter(cls => !!cls).join(' ');
    }

    /* node_modules/attractions/button/button.svelte generated by Svelte v3.43.2 */
    const file$g = "node_modules/attractions/button/button.svelte";

    // (124:0) {:else}
    function create_else_block$3(ctx) {
    	let button;
    	let button_class_value;
    	let ripple_action;
    	let eventsAction_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[16], null);

    	let button_levels = [
    		{ type: "button" },
    		{ disabled: /*disabled*/ ctx[10] },
    		{
    			class: button_class_value = classes('btn', /*_class*/ ctx[0])
    		},
    		/*$$restProps*/ ctx[15]
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			set_attributes(button, button_data);
    			toggle_class(button, "filled", /*filled*/ ctx[1]);
    			toggle_class(button, "outline", /*outline*/ ctx[2]);
    			toggle_class(button, "danger", /*danger*/ ctx[3]);
    			toggle_class(button, "round", /*round*/ ctx[5]);
    			toggle_class(button, "neutral", /*neutral*/ ctx[4]);
    			toggle_class(button, "rectangle", /*rectangle*/ ctx[6]);
    			toggle_class(button, "small", /*small*/ ctx[7]);
    			toggle_class(button, "selected", /*selected*/ ctx[8]);
    			toggle_class(button, "svelte-2r4z0x", true);
    			add_location(button, file$g, 124, 2, 3278);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			if (button.autofocus) button.focus();
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*click_handler_1*/ ctx[19], false, false, false),
    					action_destroyer(ripple_action = ripple.call(null, button, {
    						disabled: /*noRipple*/ ctx[9] || /*disabled*/ ctx[10]
    					})),
    					action_destroyer(eventsAction_action = events.call(null, button, /*events*/ ctx[13]))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 65536)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[16],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[16])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[16], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				{ type: "button" },
    				(!current || dirty & /*disabled*/ 1024) && { disabled: /*disabled*/ ctx[10] },
    				(!current || dirty & /*_class*/ 1 && button_class_value !== (button_class_value = classes('btn', /*_class*/ ctx[0]))) && { class: button_class_value },
    				dirty & /*$$restProps*/ 32768 && /*$$restProps*/ ctx[15]
    			]));

    			if (ripple_action && is_function(ripple_action.update) && dirty & /*noRipple, disabled*/ 1536) ripple_action.update.call(null, {
    				disabled: /*noRipple*/ ctx[9] || /*disabled*/ ctx[10]
    			});

    			if (eventsAction_action && is_function(eventsAction_action.update) && dirty & /*events*/ 8192) eventsAction_action.update.call(null, /*events*/ ctx[13]);
    			toggle_class(button, "filled", /*filled*/ ctx[1]);
    			toggle_class(button, "outline", /*outline*/ ctx[2]);
    			toggle_class(button, "danger", /*danger*/ ctx[3]);
    			toggle_class(button, "round", /*round*/ ctx[5]);
    			toggle_class(button, "neutral", /*neutral*/ ctx[4]);
    			toggle_class(button, "rectangle", /*rectangle*/ ctx[6]);
    			toggle_class(button, "small", /*small*/ ctx[7]);
    			toggle_class(button, "selected", /*selected*/ ctx[8]);
    			toggle_class(button, "svelte-2r4z0x", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(124:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (101:0) {#if href}
    function create_if_block$7(ctx) {
    	let a;
    	let a_href_value;
    	let a_rel_value;
    	let a_sapper_prefetch_value;
    	let a_sveltekit_prefetch_value;
    	let a_disabled_value;
    	let a_class_value;
    	let eventsAction_action;
    	let ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[16], null);

    	let a_levels = [
    		{
    			href: a_href_value = /*disabled*/ ctx[10] ? null : /*href*/ ctx[11]
    		},
    		{
    			rel: a_rel_value = /*noPrefetch*/ ctx[12] ? null : 'prefetch'
    		},
    		{
    			"sapper:prefetch": a_sapper_prefetch_value = /*noPrefetch*/ ctx[12] ? null : true
    		},
    		{
    			"sveltekit:prefetch": a_sveltekit_prefetch_value = /*noPrefetch*/ ctx[12] ? null : true
    		},
    		{
    			disabled: a_disabled_value = /*disabled*/ ctx[10] ? true : null
    		},
    		{
    			class: a_class_value = classes('btn', /*_class*/ ctx[0])
    		},
    		/*$$restProps*/ ctx[15]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			toggle_class(a, "filled", /*filled*/ ctx[1]);
    			toggle_class(a, "outline", /*outline*/ ctx[2]);
    			toggle_class(a, "danger", /*danger*/ ctx[3]);
    			toggle_class(a, "round", /*round*/ ctx[5]);
    			toggle_class(a, "neutral", /*neutral*/ ctx[4]);
    			toggle_class(a, "rectangle", /*rectangle*/ ctx[6]);
    			toggle_class(a, "small", /*small*/ ctx[7]);
    			toggle_class(a, "selected", /*selected*/ ctx[8]);
    			toggle_class(a, "svelte-2r4z0x", true);
    			add_location(a, file$g, 101, 2, 2694);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a, "click", /*click_handler*/ ctx[18], false, false, false),
    					action_destroyer(eventsAction_action = events.call(null, a, /*events*/ ctx[13])),
    					action_destroyer(ripple_action = ripple.call(null, a, {
    						disabled: /*noRipple*/ ctx[9] || /*disabled*/ ctx[10]
    					}))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 65536)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[16],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[16])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[16], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*disabled, href*/ 3072 && a_href_value !== (a_href_value = /*disabled*/ ctx[10] ? null : /*href*/ ctx[11])) && { href: a_href_value },
    				(!current || dirty & /*noPrefetch*/ 4096 && a_rel_value !== (a_rel_value = /*noPrefetch*/ ctx[12] ? null : 'prefetch')) && { rel: a_rel_value },
    				(!current || dirty & /*noPrefetch*/ 4096 && a_sapper_prefetch_value !== (a_sapper_prefetch_value = /*noPrefetch*/ ctx[12] ? null : true)) && {
    					"sapper:prefetch": a_sapper_prefetch_value
    				},
    				(!current || dirty & /*noPrefetch*/ 4096 && a_sveltekit_prefetch_value !== (a_sveltekit_prefetch_value = /*noPrefetch*/ ctx[12] ? null : true)) && {
    					"sveltekit:prefetch": a_sveltekit_prefetch_value
    				},
    				(!current || dirty & /*disabled*/ 1024 && a_disabled_value !== (a_disabled_value = /*disabled*/ ctx[10] ? true : null)) && { disabled: a_disabled_value },
    				(!current || dirty & /*_class*/ 1 && a_class_value !== (a_class_value = classes('btn', /*_class*/ ctx[0]))) && { class: a_class_value },
    				dirty & /*$$restProps*/ 32768 && /*$$restProps*/ ctx[15]
    			]));

    			if (eventsAction_action && is_function(eventsAction_action.update) && dirty & /*events*/ 8192) eventsAction_action.update.call(null, /*events*/ ctx[13]);

    			if (ripple_action && is_function(ripple_action.update) && dirty & /*noRipple, disabled*/ 1536) ripple_action.update.call(null, {
    				disabled: /*noRipple*/ ctx[9] || /*disabled*/ ctx[10]
    			});

    			toggle_class(a, "filled", /*filled*/ ctx[1]);
    			toggle_class(a, "outline", /*outline*/ ctx[2]);
    			toggle_class(a, "danger", /*danger*/ ctx[3]);
    			toggle_class(a, "round", /*round*/ ctx[5]);
    			toggle_class(a, "neutral", /*neutral*/ ctx[4]);
    			toggle_class(a, "rectangle", /*rectangle*/ ctx[6]);
    			toggle_class(a, "small", /*small*/ ctx[7]);
    			toggle_class(a, "selected", /*selected*/ ctx[8]);
    			toggle_class(a, "svelte-2r4z0x", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(101:0) {#if href}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$7, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*href*/ ctx[11]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"class","filled","outline","danger","neutral","round","rectangle","small","selected","noRipple","disabled","href","noPrefetch","events"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, ['default']);
    	let { class: _class = null } = $$props;
    	let { filled = false } = $$props;
    	let { outline = false } = $$props;
    	let { danger = false } = $$props;
    	let { neutral = false } = $$props;
    	let { round = false } = $$props;
    	let { rectangle = false } = $$props;
    	let { small = false } = $$props;
    	let { selected = false } = $$props;
    	let { noRipple = false } = $$props;
    	let { disabled = false } = $$props;
    	let { href = null } = $$props;
    	let { noPrefetch = false } = $$props;
    	let { events: events$1 = [] } = $$props;

    	if (filled && outline) {
    		console.error('A button may not be filled and outlined at the same time');
    	}

    	if (danger && neutral) {
    		console.error('A button may not be danger and neutral at the same time');
    	}

    	if (filled && selected) {
    		console.error('A button may not be filled and selected at the same time');
    	}

    	const dispatch = createEventDispatcher();
    	const click_handler = e => dispatch('click', { nativeEvent: e });
    	const click_handler_1 = e => dispatch('click', { nativeEvent: e });

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(15, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(0, _class = $$new_props.class);
    		if ('filled' in $$new_props) $$invalidate(1, filled = $$new_props.filled);
    		if ('outline' in $$new_props) $$invalidate(2, outline = $$new_props.outline);
    		if ('danger' in $$new_props) $$invalidate(3, danger = $$new_props.danger);
    		if ('neutral' in $$new_props) $$invalidate(4, neutral = $$new_props.neutral);
    		if ('round' in $$new_props) $$invalidate(5, round = $$new_props.round);
    		if ('rectangle' in $$new_props) $$invalidate(6, rectangle = $$new_props.rectangle);
    		if ('small' in $$new_props) $$invalidate(7, small = $$new_props.small);
    		if ('selected' in $$new_props) $$invalidate(8, selected = $$new_props.selected);
    		if ('noRipple' in $$new_props) $$invalidate(9, noRipple = $$new_props.noRipple);
    		if ('disabled' in $$new_props) $$invalidate(10, disabled = $$new_props.disabled);
    		if ('href' in $$new_props) $$invalidate(11, href = $$new_props.href);
    		if ('noPrefetch' in $$new_props) $$invalidate(12, noPrefetch = $$new_props.noPrefetch);
    		if ('events' in $$new_props) $$invalidate(13, events$1 = $$new_props.events);
    		if ('$$scope' in $$new_props) $$invalidate(16, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		ripple,
    		eventsAction: events,
    		classes,
    		_class,
    		filled,
    		outline,
    		danger,
    		neutral,
    		round,
    		rectangle,
    		small,
    		selected,
    		noRipple,
    		disabled,
    		href,
    		noPrefetch,
    		events: events$1,
    		dispatch
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('_class' in $$props) $$invalidate(0, _class = $$new_props._class);
    		if ('filled' in $$props) $$invalidate(1, filled = $$new_props.filled);
    		if ('outline' in $$props) $$invalidate(2, outline = $$new_props.outline);
    		if ('danger' in $$props) $$invalidate(3, danger = $$new_props.danger);
    		if ('neutral' in $$props) $$invalidate(4, neutral = $$new_props.neutral);
    		if ('round' in $$props) $$invalidate(5, round = $$new_props.round);
    		if ('rectangle' in $$props) $$invalidate(6, rectangle = $$new_props.rectangle);
    		if ('small' in $$props) $$invalidate(7, small = $$new_props.small);
    		if ('selected' in $$props) $$invalidate(8, selected = $$new_props.selected);
    		if ('noRipple' in $$props) $$invalidate(9, noRipple = $$new_props.noRipple);
    		if ('disabled' in $$props) $$invalidate(10, disabled = $$new_props.disabled);
    		if ('href' in $$props) $$invalidate(11, href = $$new_props.href);
    		if ('noPrefetch' in $$props) $$invalidate(12, noPrefetch = $$new_props.noPrefetch);
    		if ('events' in $$props) $$invalidate(13, events$1 = $$new_props.events);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		_class,
    		filled,
    		outline,
    		danger,
    		neutral,
    		round,
    		rectangle,
    		small,
    		selected,
    		noRipple,
    		disabled,
    		href,
    		noPrefetch,
    		events$1,
    		dispatch,
    		$$restProps,
    		$$scope,
    		slots,
    		click_handler,
    		click_handler_1
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {
    			class: 0,
    			filled: 1,
    			outline: 2,
    			danger: 3,
    			neutral: 4,
    			round: 5,
    			rectangle: 6,
    			small: 7,
    			selected: 8,
    			noRipple: 9,
    			disabled: 10,
    			href: 11,
    			noPrefetch: 12,
    			events: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get class() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outline() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outline(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get danger() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set danger(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get neutral() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set neutral(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get round() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set round(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rectangle() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rectangle(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get small() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set small(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noRipple() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noRipple(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noPrefetch() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noPrefetch(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get events() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set events(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Button$1 = Button;

    /* node_modules/attractions/text-field/text-field.svelte generated by Svelte v3.43.2 */
    const file$f = "node_modules/attractions/text-field/text-field.svelte";
    const get_error_slot_changes = dirty => ({});
    const get_error_slot_context = ctx => ({});

    // (145:2) {:else}
    function create_else_block$2(ctx) {
    	let input;
    	let input_value_value;
    	let input_class_value;
    	let eventsAction_action;
    	let t0;
    	let t1;
    	let t2;
    	let if_block2_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		{ id: /*id*/ ctx[8] },
    		{
    			value: input_value_value = toString$1(/*value*/ ctx[0])
    		},
    		{
    			class: input_class_value = classes(/*inputClass*/ ctx[2])
    		},
    		/*$$restProps*/ ctx[17]
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	let if_block0 = /*outline*/ ctx[5] && /*label*/ ctx[10] != null && create_if_block_3$1(ctx);
    	let if_block1 = /*withItem*/ ctx[6] && create_if_block_2$2(ctx);
    	let if_block2 = /*error*/ ctx[11] && create_if_block_1$5(ctx);

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			set_attributes(input, input_data);
    			toggle_class(input, "svelte-fxvd28", true);
    			add_location(input, file$f, 145, 4, 4012);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			input.value = input_data.value;
    			if (input.autofocus) input.focus();
    			/*input_binding*/ ctx[26](input);
    			insert_dev(target, t0, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*handleInput*/ ctx[15], false, false, false),
    					listen_dev(input, "change", /*change_handler_1*/ ctx[27], false, false, false),
    					listen_dev(input, "focus", /*focus_handler_1*/ ctx[28], false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler_1*/ ctx[29], false, false, false),
    					listen_dev(input, "blur", /*blur_handler_1*/ ctx[30], false, false, false),
    					action_destroyer(eventsAction_action = events.call(null, input, /*events*/ ctx[13]))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				(!current || dirty & /*id*/ 256) && { id: /*id*/ ctx[8] },
    				(!current || dirty & /*value*/ 1 && input_value_value !== (input_value_value = toString$1(/*value*/ ctx[0])) && input.value !== input_value_value) && { value: input_value_value },
    				(!current || dirty & /*inputClass*/ 4 && input_class_value !== (input_class_value = classes(/*inputClass*/ ctx[2]))) && { class: input_class_value },
    				dirty & /*$$restProps*/ 131072 && /*$$restProps*/ ctx[17]
    			]));

    			if ('value' in input_data) {
    				input.value = input_data.value;
    			}

    			if (eventsAction_action && is_function(eventsAction_action.update) && dirty & /*events*/ 8192) eventsAction_action.update.call(null, /*events*/ ctx[13]);
    			toggle_class(input, "svelte-fxvd28", true);

    			if (/*outline*/ ctx[5] && /*label*/ ctx[10] != null) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3$1(ctx);
    					if_block0.c();
    					if_block0.m(t1.parentNode, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*withItem*/ ctx[6]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*withItem*/ 64) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t2.parentNode, t2);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*error*/ ctx[11]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*error*/ 2048) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_1$5(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding*/ ctx[26](null);
    			if (detaching) detach_dev(t0);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(145:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (131:2) {#if multiline}
    function create_if_block$6(ctx) {
    	let textarea;
    	let textarea_class_value;
    	let eventsAction_action;
    	let mounted;
    	let dispose;

    	let textarea_levels = [
    		{ id: /*id*/ ctx[8] },
    		{ value: /*value*/ ctx[0] },
    		{
    			class: textarea_class_value = classes(/*inputClass*/ ctx[2])
    		},
    		/*$$restProps*/ ctx[17]
    	];

    	let textarea_data = {};

    	for (let i = 0; i < textarea_levels.length; i += 1) {
    		textarea_data = assign(textarea_data, textarea_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			textarea = element("textarea");
    			set_attributes(textarea, textarea_data);
    			toggle_class(textarea, "svelte-fxvd28", true);
    			add_location(textarea, file$f, 131, 4, 3556);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea, anchor);
    			if (textarea.autofocus) textarea.focus();
    			/*textarea_binding*/ ctx[21](textarea);

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea, "input", /*handleInput*/ ctx[15], false, false, false),
    					listen_dev(textarea, "change", /*change_handler*/ ctx[22], false, false, false),
    					listen_dev(textarea, "focus", /*focus_handler*/ ctx[23], false, false, false),
    					listen_dev(textarea, "keydown", /*keydown_handler*/ ctx[24], false, false, false),
    					listen_dev(textarea, "blur", /*blur_handler*/ ctx[25], false, false, false),
    					action_destroyer(eventsAction_action = events.call(null, textarea, /*events*/ ctx[13]))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(textarea, textarea_data = get_spread_update(textarea_levels, [
    				dirty & /*id*/ 256 && { id: /*id*/ ctx[8] },
    				dirty & /*value*/ 1 && { value: /*value*/ ctx[0] },
    				dirty & /*inputClass*/ 4 && textarea_class_value !== (textarea_class_value = classes(/*inputClass*/ ctx[2])) && { class: textarea_class_value },
    				dirty & /*$$restProps*/ 131072 && /*$$restProps*/ ctx[17]
    			]));

    			if (eventsAction_action && is_function(eventsAction_action.update) && dirty & /*events*/ 8192) eventsAction_action.update.call(null, /*events*/ ctx[13]);
    			toggle_class(textarea, "svelte-fxvd28", true);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea);
    			/*textarea_binding*/ ctx[21](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(131:2) {#if multiline}",
    		ctx
    	});

    	return block;
    }

    // (159:4) {#if outline && label != null}
    function create_if_block_3$1(ctx) {
    	let label_1;
    	let t;
    	let label_1_class_value;

    	const block = {
    		c: function create() {
    			label_1 = element("label");
    			t = text(/*label*/ ctx[10]);
    			attr_dev(label_1, "for", /*id*/ ctx[8]);
    			attr_dev(label_1, "class", label_1_class_value = "" + (null_to_empty(classes(/*labelClass*/ ctx[3])) + " svelte-fxvd28"));
    			add_location(label_1, file$f, 159, 6, 4508);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label_1, anchor);
    			append_dev(label_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 1024) set_data_dev(t, /*label*/ ctx[10]);

    			if (dirty & /*id*/ 256) {
    				attr_dev(label_1, "for", /*id*/ ctx[8]);
    			}

    			if (dirty & /*labelClass*/ 8 && label_1_class_value !== (label_1_class_value = "" + (null_to_empty(classes(/*labelClass*/ ctx[3])) + " svelte-fxvd28"))) {
    				attr_dev(label_1, "class", label_1_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(159:4) {#if outline && label != null}",
    		ctx
    	});

    	return block;
    }

    // (163:4) {#if withItem}
    function create_if_block_2$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[20].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 524288)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[19],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[19])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[19], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(163:4) {#if withItem}",
    		ctx
    	});

    	return block;
    }

    // (167:4) {#if error}
    function create_if_block_1$5(ctx) {
    	let span;
    	let span_class_value;
    	let current;
    	const error_slot_template = /*#slots*/ ctx[20].error;
    	const error_slot = create_slot(error_slot_template, ctx, /*$$scope*/ ctx[19], get_error_slot_context);
    	const error_slot_or_fallback = error_slot || fallback_block$4(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (error_slot_or_fallback) error_slot_or_fallback.c();
    			attr_dev(span, "class", span_class_value = "" + (null_to_empty(classes('error', /*errorClass*/ ctx[4])) + " svelte-fxvd28"));
    			add_location(span, file$f, 167, 6, 4646);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (error_slot_or_fallback) {
    				error_slot_or_fallback.m(span, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (error_slot) {
    				if (error_slot.p && (!current || dirty & /*$$scope*/ 524288)) {
    					update_slot_base(
    						error_slot,
    						error_slot_template,
    						ctx,
    						/*$$scope*/ ctx[19],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[19])
    						: get_slot_changes(error_slot_template, /*$$scope*/ ctx[19], dirty, get_error_slot_changes),
    						get_error_slot_context
    					);
    				}
    			} else {
    				if (error_slot_or_fallback && error_slot_or_fallback.p && (!current || dirty & /*error*/ 2048)) {
    					error_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}

    			if (!current || dirty & /*errorClass*/ 16 && span_class_value !== (span_class_value = "" + (null_to_empty(classes('error', /*errorClass*/ ctx[4])) + " svelte-fxvd28"))) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(error_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(error_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (error_slot_or_fallback) error_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(167:4) {#if error}",
    		ctx
    	});

    	return block;
    }

    // (169:27) {error}
    function fallback_block$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*error*/ ctx[11]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*error*/ 2048) set_data_dev(t, /*error*/ ctx[11]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$4.name,
    		type: "fallback",
    		source: "(169:27) {error}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let div_class_value;
    	let current;
    	const if_block_creators = [create_if_block$6, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*multiline*/ ctx[12]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(classes('text-field', /*_class*/ ctx[1])) + " svelte-fxvd28"));
    			toggle_class(div, "outline", /*outline*/ ctx[5]);
    			toggle_class(div, "with-item", /*withItem*/ ctx[6]);
    			toggle_class(div, "left", /*withItem*/ ctx[6] && !/*itemRight*/ ctx[7]);
    			toggle_class(div, "right", /*withItem*/ ctx[6] && /*itemRight*/ ctx[7]);
    			toggle_class(div, "no-spinner", /*noSpinner*/ ctx[9]);
    			add_location(div, file$f, 122, 0, 3335);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}

    			if (!current || dirty & /*_class*/ 2 && div_class_value !== (div_class_value = "" + (null_to_empty(classes('text-field', /*_class*/ ctx[1])) + " svelte-fxvd28"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*_class, outline*/ 34) {
    				toggle_class(div, "outline", /*outline*/ ctx[5]);
    			}

    			if (dirty & /*_class, withItem*/ 66) {
    				toggle_class(div, "with-item", /*withItem*/ ctx[6]);
    			}

    			if (dirty & /*_class, withItem, itemRight*/ 194) {
    				toggle_class(div, "left", /*withItem*/ ctx[6] && !/*itemRight*/ ctx[7]);
    			}

    			if (dirty & /*_class, withItem, itemRight*/ 194) {
    				toggle_class(div, "right", /*withItem*/ ctx[6] && /*itemRight*/ ctx[7]);
    			}

    			if (dirty & /*_class, noSpinner*/ 514) {
    				toggle_class(div, "no-spinner", /*noSpinner*/ ctx[9]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function toNumber(string) {
    	if (string === '') {
    		return null;
    	}

    	return parseFloat(string);
    }

    function toString$1(value) {
    	if (value == null) {
    		return '';
    	}

    	return value.toString();
    }

    function instance$f($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"class","inputClass","labelClass","errorClass","outline","withItem","itemRight","id","noSpinner","label","error","multiline","autofocus","value","events"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Text_field', slots, ['default','error']);
    	let { class: _class = null } = $$props;
    	let { inputClass = null } = $$props;
    	let { labelClass = null } = $$props;
    	let { errorClass = null } = $$props;
    	let { outline = false } = $$props;
    	let { withItem = false } = $$props;
    	let { itemRight = false } = $$props;
    	let { id = null } = $$props;
    	let { noSpinner = false } = $$props;
    	let { label = null } = $$props;
    	let { error = null } = $$props;
    	let { multiline = false } = $$props;
    	let { autofocus = false } = $$props;

    	if (!outline && label != null) {
    		console.error('Labels are only available for outlined text fields');
    	}

    	let { value = null } = $$props;
    	let { events: events$1 = [] } = $$props;
    	let inputElement;
    	onMount(() => autofocus && inputElement.focus());

    	function handleInput(event) {
    		$$invalidate(0, value = $$restProps.type === 'number'
    		? toNumber(event.target.value)
    		: event.target.value);

    		dispatch('input', { value, nativeEvent: event });
    	}

    	const dispatch = createEventDispatcher();

    	function textarea_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inputElement = $$value;
    			$$invalidate(14, inputElement);
    		});
    	}

    	const change_handler = e => dispatch('change', { value, nativeEvent: e });
    	const focus_handler = e => dispatch('focus', { nativeEvent: e });
    	const keydown_handler = e => dispatch('keydown', { nativeEvent: e });
    	const blur_handler = e => dispatch('blur', { nativeEvent: e });

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inputElement = $$value;
    			$$invalidate(14, inputElement);
    		});
    	}

    	const change_handler_1 = e => dispatch('change', { value, nativeEvent: e });
    	const focus_handler_1 = e => dispatch('focus', { nativeEvent: e });
    	const keydown_handler_1 = e => dispatch('keydown', { nativeEvent: e });
    	const blur_handler_1 = e => dispatch('blur', { nativeEvent: e });

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(17, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(1, _class = $$new_props.class);
    		if ('inputClass' in $$new_props) $$invalidate(2, inputClass = $$new_props.inputClass);
    		if ('labelClass' in $$new_props) $$invalidate(3, labelClass = $$new_props.labelClass);
    		if ('errorClass' in $$new_props) $$invalidate(4, errorClass = $$new_props.errorClass);
    		if ('outline' in $$new_props) $$invalidate(5, outline = $$new_props.outline);
    		if ('withItem' in $$new_props) $$invalidate(6, withItem = $$new_props.withItem);
    		if ('itemRight' in $$new_props) $$invalidate(7, itemRight = $$new_props.itemRight);
    		if ('id' in $$new_props) $$invalidate(8, id = $$new_props.id);
    		if ('noSpinner' in $$new_props) $$invalidate(9, noSpinner = $$new_props.noSpinner);
    		if ('label' in $$new_props) $$invalidate(10, label = $$new_props.label);
    		if ('error' in $$new_props) $$invalidate(11, error = $$new_props.error);
    		if ('multiline' in $$new_props) $$invalidate(12, multiline = $$new_props.multiline);
    		if ('autofocus' in $$new_props) $$invalidate(18, autofocus = $$new_props.autofocus);
    		if ('value' in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ('events' in $$new_props) $$invalidate(13, events$1 = $$new_props.events);
    		if ('$$scope' in $$new_props) $$invalidate(19, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onMount,
    		eventsAction: events,
    		classes,
    		_class,
    		inputClass,
    		labelClass,
    		errorClass,
    		outline,
    		withItem,
    		itemRight,
    		id,
    		noSpinner,
    		label,
    		error,
    		multiline,
    		autofocus,
    		value,
    		events: events$1,
    		inputElement,
    		toNumber,
    		toString: toString$1,
    		handleInput,
    		dispatch
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('_class' in $$props) $$invalidate(1, _class = $$new_props._class);
    		if ('inputClass' in $$props) $$invalidate(2, inputClass = $$new_props.inputClass);
    		if ('labelClass' in $$props) $$invalidate(3, labelClass = $$new_props.labelClass);
    		if ('errorClass' in $$props) $$invalidate(4, errorClass = $$new_props.errorClass);
    		if ('outline' in $$props) $$invalidate(5, outline = $$new_props.outline);
    		if ('withItem' in $$props) $$invalidate(6, withItem = $$new_props.withItem);
    		if ('itemRight' in $$props) $$invalidate(7, itemRight = $$new_props.itemRight);
    		if ('id' in $$props) $$invalidate(8, id = $$new_props.id);
    		if ('noSpinner' in $$props) $$invalidate(9, noSpinner = $$new_props.noSpinner);
    		if ('label' in $$props) $$invalidate(10, label = $$new_props.label);
    		if ('error' in $$props) $$invalidate(11, error = $$new_props.error);
    		if ('multiline' in $$props) $$invalidate(12, multiline = $$new_props.multiline);
    		if ('autofocus' in $$props) $$invalidate(18, autofocus = $$new_props.autofocus);
    		if ('value' in $$props) $$invalidate(0, value = $$new_props.value);
    		if ('events' in $$props) $$invalidate(13, events$1 = $$new_props.events);
    		if ('inputElement' in $$props) $$invalidate(14, inputElement = $$new_props.inputElement);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		_class,
    		inputClass,
    		labelClass,
    		errorClass,
    		outline,
    		withItem,
    		itemRight,
    		id,
    		noSpinner,
    		label,
    		error,
    		multiline,
    		events$1,
    		inputElement,
    		handleInput,
    		dispatch,
    		$$restProps,
    		autofocus,
    		$$scope,
    		slots,
    		textarea_binding,
    		change_handler,
    		focus_handler,
    		keydown_handler,
    		blur_handler,
    		input_binding,
    		change_handler_1,
    		focus_handler_1,
    		keydown_handler_1,
    		blur_handler_1
    	];
    }

    class Text_field extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			class: 1,
    			inputClass: 2,
    			labelClass: 3,
    			errorClass: 4,
    			outline: 5,
    			withItem: 6,
    			itemRight: 7,
    			id: 8,
    			noSpinner: 9,
    			label: 10,
    			error: 11,
    			multiline: 12,
    			autofocus: 18,
    			value: 0,
    			events: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Text_field",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get class() {
    		throw new Error("<Text_field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Text_field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputClass() {
    		throw new Error("<Text_field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputClass(value) {
    		throw new Error("<Text_field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelClass() {
    		throw new Error("<Text_field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelClass(value) {
    		throw new Error("<Text_field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get errorClass() {
    		throw new Error("<Text_field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set errorClass(value) {
    		throw new Error("<Text_field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outline() {
    		throw new Error("<Text_field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outline(value) {
    		throw new Error("<Text_field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get withItem() {
    		throw new Error("<Text_field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set withItem(value) {
    		throw new Error("<Text_field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get itemRight() {
    		throw new Error("<Text_field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemRight(value) {
    		throw new Error("<Text_field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Text_field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Text_field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noSpinner() {
    		throw new Error("<Text_field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noSpinner(value) {
    		throw new Error("<Text_field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Text_field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Text_field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<Text_field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<Text_field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiline() {
    		throw new Error("<Text_field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiline(value) {
    		throw new Error("<Text_field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autofocus() {
    		throw new Error("<Text_field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autofocus(value) {
    		throw new Error("<Text_field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Text_field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Text_field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get events() {
    		throw new Error("<Text_field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set events(value) {
    		throw new Error("<Text_field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var TextField = Text_field;

    /**
     * Generates the styles needed for displaying a radiobutton or a checkbox
     *  with the given color.
     * @param {string} hexColor The color (in `#XXXXXX` format)
     * @returns {string | null} The `style` string to be used on the element
     */
    function getColorPickerStyles(hexColor) {
      if (hexColor == null) {
        return null;
      }

      if (hexColor.length !== 7) {
        console.error('Values of colored radio groups must be #XXXXXX hex colors.');
        return null;
      }

      let r, g, b, beforeR, beforeG, beforeB;
      const bgR = (r = parseInt(hexColor.slice(1, 3), 16));
      const bgG = (g = parseInt(hexColor.slice(3, 5), 16));
      const bgB = (b = parseInt(hexColor.slice(5, 7), 16));
      beforeR = beforeG = beforeB = 255;

      const whiteThreshold = 240;
      const gray = 153;
      if (r > whiteThreshold && g > whiteThreshold && b > whiteThreshold) {
        r = g = b = beforeR = beforeG = beforeB = gray;
      }

      return `background-color: rgb(${bgR}, ${bgG}, ${bgB});
          border-color: rgb(${r}, ${g}, ${b});
          --r: ${r}; --g: ${g}; --b: ${b};
          --before-r: ${beforeR};
          --before-g: ${beforeG};
          --before-b: ${beforeB};`;
    }

    /* node_modules/attractions/radio-button/radio-button.svelte generated by Svelte v3.43.2 */
    const file$e = "node_modules/attractions/radio-button/radio-button.svelte";

    // (58:2) {#if slotLeft}
    function create_if_block_1$4(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[11],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[11], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(58:2) {#if slotLeft}",
    		ctx
    	});

    	return block;
    }

    // (71:2) {#if !slotLeft}
    function create_if_block$5(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[11],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[11], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(71:2) {#if !slotLeft}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let label;
    	let t0;
    	let input;
    	let input_class_value;
    	let t1;
    	let div;
    	let div_class_value;
    	let t2;
    	let label_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*slotLeft*/ ctx[7] && create_if_block_1$4(ctx);

    	let input_levels = [
    		{ __value: /*value*/ ctx[5] },
    		{ type: "radio" },
    		{
    			class: input_class_value = classes(/*inputClass*/ ctx[2])
    		},
    		{ disabled: /*disabled*/ ctx[6] },
    		/*$$restProps*/ ctx[10]
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	let if_block1 = !/*slotLeft*/ ctx[7] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			label = element("label");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			input = element("input");
    			t1 = space();
    			div = element("div");
    			t2 = space();
    			if (if_block1) if_block1.c();
    			set_attributes(input, input_data);
    			/*$$binding_groups*/ ctx[14][0].push(input);
    			toggle_class(input, "svelte-1cxgo1k", true);
    			add_location(input, file$e, 60, 2, 1659);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(classes('selector', /*selectorClass*/ ctx[3])) + " svelte-1cxgo1k"));
    			attr_dev(div, "style", /*selectorStyle*/ ctx[4]);
    			add_location(div, file$e, 69, 2, 1852);
    			attr_dev(label, "class", label_class_value = "" + (null_to_empty(classes('radio', /*_class*/ ctx[1])) + " svelte-1cxgo1k"));
    			attr_dev(label, "title", /*title*/ ctx[8]);
    			add_location(label, file$e, 56, 0, 1570);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			if (if_block0) if_block0.m(label, null);
    			append_dev(label, t0);
    			append_dev(label, input);
    			if (input.autofocus) input.focus();
    			input.checked = input.__value === /*group*/ ctx[0];
    			append_dev(label, t1);
    			append_dev(label, div);
    			append_dev(label, t2);
    			if (if_block1) if_block1.m(label, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_handler*/ ctx[13]),
    					listen_dev(input, "change", /*change_handler*/ ctx[15], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*slotLeft*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*slotLeft*/ 128) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$4(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(label, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				(!current || dirty & /*value*/ 32) && { __value: /*value*/ ctx[5] },
    				{ type: "radio" },
    				(!current || dirty & /*inputClass*/ 4 && input_class_value !== (input_class_value = classes(/*inputClass*/ ctx[2]))) && { class: input_class_value },
    				(!current || dirty & /*disabled*/ 64) && { disabled: /*disabled*/ ctx[6] },
    				dirty & /*$$restProps*/ 1024 && /*$$restProps*/ ctx[10]
    			]));

    			if (dirty & /*group*/ 1) {
    				input.checked = input.__value === /*group*/ ctx[0];
    			}

    			toggle_class(input, "svelte-1cxgo1k", true);

    			if (!current || dirty & /*selectorClass*/ 8 && div_class_value !== (div_class_value = "" + (null_to_empty(classes('selector', /*selectorClass*/ ctx[3])) + " svelte-1cxgo1k"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*selectorStyle*/ 16) {
    				attr_dev(div, "style", /*selectorStyle*/ ctx[4]);
    			}

    			if (!/*slotLeft*/ ctx[7]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*slotLeft*/ 128) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$5(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(label, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*_class*/ 2 && label_class_value !== (label_class_value = "" + (null_to_empty(classes('radio', /*_class*/ ctx[1])) + " svelte-1cxgo1k"))) {
    				attr_dev(label, "class", label_class_value);
    			}

    			if (!current || dirty & /*title*/ 256) {
    				attr_dev(label, "title", /*title*/ ctx[8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (if_block0) if_block0.d();
    			/*$$binding_groups*/ ctx[14][0].splice(/*$$binding_groups*/ ctx[14][0].indexOf(input), 1);
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"class","inputClass","selectorClass","selectorStyle","value","disabled","group","slotLeft","title"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Radio_button', slots, ['default']);
    	let { class: _class = null } = $$props;
    	let { inputClass = null } = $$props;
    	let { selectorClass = null } = $$props;
    	let { selectorStyle = null } = $$props;
    	let { value } = $$props;
    	let { disabled = false } = $$props;
    	let { group = null } = $$props;
    	let { slotLeft = false } = $$props;
    	let { title = null } = $$props;
    	const dispatch = createEventDispatcher();
    	const $$binding_groups = [[]];

    	function input_change_handler() {
    		group = this.__value;
    		$$invalidate(0, group);
    	}

    	const change_handler = e => dispatch('change', { value, nativeEvent: e });

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(10, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(1, _class = $$new_props.class);
    		if ('inputClass' in $$new_props) $$invalidate(2, inputClass = $$new_props.inputClass);
    		if ('selectorClass' in $$new_props) $$invalidate(3, selectorClass = $$new_props.selectorClass);
    		if ('selectorStyle' in $$new_props) $$invalidate(4, selectorStyle = $$new_props.selectorStyle);
    		if ('value' in $$new_props) $$invalidate(5, value = $$new_props.value);
    		if ('disabled' in $$new_props) $$invalidate(6, disabled = $$new_props.disabled);
    		if ('group' in $$new_props) $$invalidate(0, group = $$new_props.group);
    		if ('slotLeft' in $$new_props) $$invalidate(7, slotLeft = $$new_props.slotLeft);
    		if ('title' in $$new_props) $$invalidate(8, title = $$new_props.title);
    		if ('$$scope' in $$new_props) $$invalidate(11, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		classes,
    		_class,
    		inputClass,
    		selectorClass,
    		selectorStyle,
    		value,
    		disabled,
    		group,
    		slotLeft,
    		title,
    		dispatch
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('_class' in $$props) $$invalidate(1, _class = $$new_props._class);
    		if ('inputClass' in $$props) $$invalidate(2, inputClass = $$new_props.inputClass);
    		if ('selectorClass' in $$props) $$invalidate(3, selectorClass = $$new_props.selectorClass);
    		if ('selectorStyle' in $$props) $$invalidate(4, selectorStyle = $$new_props.selectorStyle);
    		if ('value' in $$props) $$invalidate(5, value = $$new_props.value);
    		if ('disabled' in $$props) $$invalidate(6, disabled = $$new_props.disabled);
    		if ('group' in $$props) $$invalidate(0, group = $$new_props.group);
    		if ('slotLeft' in $$props) $$invalidate(7, slotLeft = $$new_props.slotLeft);
    		if ('title' in $$props) $$invalidate(8, title = $$new_props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		group,
    		_class,
    		inputClass,
    		selectorClass,
    		selectorStyle,
    		value,
    		disabled,
    		slotLeft,
    		title,
    		dispatch,
    		$$restProps,
    		$$scope,
    		slots,
    		input_change_handler,
    		$$binding_groups,
    		change_handler
    	];
    }

    class Radio_button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			class: 1,
    			inputClass: 2,
    			selectorClass: 3,
    			selectorStyle: 4,
    			value: 5,
    			disabled: 6,
    			group: 0,
    			slotLeft: 7,
    			title: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Radio_button",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[5] === undefined && !('value' in props)) {
    			console.warn("<Radio_button> was created without expected prop 'value'");
    		}
    	}

    	get class() {
    		throw new Error("<Radio_button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Radio_button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputClass() {
    		throw new Error("<Radio_button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputClass(value) {
    		throw new Error("<Radio_button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectorClass() {
    		throw new Error("<Radio_button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectorClass(value) {
    		throw new Error("<Radio_button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectorStyle() {
    		throw new Error("<Radio_button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectorStyle(value) {
    		throw new Error("<Radio_button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Radio_button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Radio_button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Radio_button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Radio_button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get group() {
    		throw new Error("<Radio_button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set group(value) {
    		throw new Error("<Radio_button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get slotLeft() {
    		throw new Error("<Radio_button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set slotLeft(value) {
    		throw new Error("<Radio_button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Radio_button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Radio_button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var RadioButton = Radio_button;

    /* node_modules/attractions/radio-button/radio-group.svelte generated by Svelte v3.43.2 */

    const { console: console_1$1 } = globals;
    const file$d = "node_modules/attractions/radio-button/radio-group.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (62:0) {#if items != null && items.length !== 0}
    function create_if_block$4(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div_class_value;
    	let current;
    	let each_value = /*items*/ ctx[5];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*item*/ ctx[11].value;
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(classes(/*_class*/ ctx[1])) + " svelte-1p5lcds"));
    			attr_dev(div, "role", "radiogroup");
    			add_location(div, file$d, 62, 2, 1884);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*name, labelsLeft, color, getColorPickerStyles, items, classes, radioClass, $$restProps, value, labelClass*/ 509) {
    				each_value = /*items*/ ctx[5];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$3, null, get_each_context$3);
    				check_outros();
    			}

    			if (!current || dirty & /*_class*/ 2 && div_class_value !== (div_class_value = "" + (null_to_empty(classes(/*_class*/ ctx[1])) + " svelte-1p5lcds"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(62:0) {#if items != null && items.length !== 0}",
    		ctx
    	});

    	return block;
    }

    // (76:8) {#if !color}
    function create_if_block_1$3(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*labelClass*/ ctx[3] != null) return create_if_block_2$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(76:8) {#if !color}",
    		ctx
    	});

    	return block;
    }

    // (79:10) {:else}
    function create_else_block$1(ctx) {
    	let t_value = (/*item*/ ctx[11].label || /*item*/ ctx[11].value) + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*items*/ 32 && t_value !== (t_value = (/*item*/ ctx[11].label || /*item*/ ctx[11].value) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(79:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (77:10) {#if labelClass != null}
    function create_if_block_2$1(ctx) {
    	let span;
    	let t_value = (/*item*/ ctx[11].label || /*item*/ ctx[11].value) + "";
    	let t;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", span_class_value = classes(/*labelClass*/ ctx[3]));
    			add_location(span, file$d, 77, 12, 2369);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*items*/ 32 && t_value !== (t_value = (/*item*/ ctx[11].label || /*item*/ ctx[11].value) + "")) set_data_dev(t, t_value);

    			if (dirty & /*labelClass*/ 8 && span_class_value !== (span_class_value = classes(/*labelClass*/ ctx[3]))) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(77:10) {#if labelClass != null}",
    		ctx
    	});

    	return block;
    }

    // (65:6) <RadioButton         {name}         slotLeft={labelsLeft}         selectorStyle={color ? getColorPickerStyles(item.value) : null}         bind:group={value}         value={item.value}         disabled={item.disabled}         class={classes(color && 'colored', radioClass)}         on:change         {...$$restProps}       >
    function create_default_slot$4(ctx) {
    	let t;
    	let if_block = !/*color*/ ctx[4] && create_if_block_1$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (!/*color*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$3(ctx);
    					if_block.c();
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(65:6) <RadioButton         {name}         slotLeft={labelsLeft}         selectorStyle={color ? getColorPickerStyles(item.value) : null}         bind:group={value}         value={item.value}         disabled={item.disabled}         class={classes(color && 'colored', radioClass)}         on:change         {...$$restProps}       >",
    		ctx
    	});

    	return block;
    }

    // (64:4) {#each items as item (item.value)}
    function create_each_block$3(key_1, ctx) {
    	let first;
    	let radiobutton;
    	let updating_group;
    	let current;

    	const radiobutton_spread_levels = [
    		{ name: /*name*/ ctx[6] },
    		{ slotLeft: /*labelsLeft*/ ctx[7] },
    		{
    			selectorStyle: /*color*/ ctx[4]
    			? getColorPickerStyles(/*item*/ ctx[11].value)
    			: null
    		},
    		{ value: /*item*/ ctx[11].value },
    		{ disabled: /*item*/ ctx[11].disabled },
    		{
    			class: classes(/*color*/ ctx[4] && 'colored', /*radioClass*/ ctx[2])
    		},
    		/*$$restProps*/ ctx[8]
    	];

    	function radiobutton_group_binding(value) {
    		/*radiobutton_group_binding*/ ctx[9](value);
    	}

    	let radiobutton_props = {
    		$$slots: { default: [create_default_slot$4] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < radiobutton_spread_levels.length; i += 1) {
    		radiobutton_props = assign(radiobutton_props, radiobutton_spread_levels[i]);
    	}

    	if (/*value*/ ctx[0] !== void 0) {
    		radiobutton_props.group = /*value*/ ctx[0];
    	}

    	radiobutton = new RadioButton({ props: radiobutton_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(radiobutton, 'group', radiobutton_group_binding));
    	radiobutton.$on("change", /*change_handler*/ ctx[10]);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(radiobutton.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(radiobutton, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			const radiobutton_changes = (dirty & /*name, labelsLeft, color, getColorPickerStyles, items, classes, radioClass, $$restProps*/ 500)
    			? get_spread_update(radiobutton_spread_levels, [
    					dirty & /*name*/ 64 && { name: /*name*/ ctx[6] },
    					dirty & /*labelsLeft*/ 128 && { slotLeft: /*labelsLeft*/ ctx[7] },
    					dirty & /*color, getColorPickerStyles, items*/ 48 && {
    						selectorStyle: /*color*/ ctx[4]
    						? getColorPickerStyles(/*item*/ ctx[11].value)
    						: null
    					},
    					dirty & /*items*/ 32 && { value: /*item*/ ctx[11].value },
    					dirty & /*items*/ 32 && { disabled: /*item*/ ctx[11].disabled },
    					dirty & /*classes, color, radioClass*/ 20 && {
    						class: classes(/*color*/ ctx[4] && 'colored', /*radioClass*/ ctx[2])
    					},
    					dirty & /*$$restProps*/ 256 && get_spread_object(/*$$restProps*/ ctx[8])
    				])
    			: {};

    			if (dirty & /*$$scope, labelClass, items, color*/ 16440) {
    				radiobutton_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_group && dirty & /*value*/ 1) {
    				updating_group = true;
    				radiobutton_changes.group = /*value*/ ctx[0];
    				add_flush_callback(() => updating_group = false);
    			}

    			radiobutton.$set(radiobutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(radiobutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(radiobutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(radiobutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(64:4) {#each items as item (item.value)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*items*/ ctx[5] != null && /*items*/ ctx[5].length !== 0 && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*items*/ ctx[5] != null && /*items*/ ctx[5].length !== 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*items*/ 32) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	const omit_props_names = ["class","radioClass","labelClass","color","items","value","name","labelsLeft"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Radio_group', slots, []);
    	let { class: _class = null } = $$props;
    	let { radioClass = null } = $$props;
    	let { labelClass = null } = $$props;
    	let { color = false } = $$props;
    	let { items } = $$props;
    	let { value = null } = $$props;
    	let { name } = $$props;
    	let { labelsLeft = false } = $$props;

    	if (!items || items.length === 0) {
    		console.error('Must have at least one item in the radio group');
    	}

    	if (color && labelClass != null) {
    		console.warn('labelClass has no effect: labels are not rendered for color radio groups');
    	}

    	function radiobutton_group_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	function change_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(8, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(1, _class = $$new_props.class);
    		if ('radioClass' in $$new_props) $$invalidate(2, radioClass = $$new_props.radioClass);
    		if ('labelClass' in $$new_props) $$invalidate(3, labelClass = $$new_props.labelClass);
    		if ('color' in $$new_props) $$invalidate(4, color = $$new_props.color);
    		if ('items' in $$new_props) $$invalidate(5, items = $$new_props.items);
    		if ('value' in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ('name' in $$new_props) $$invalidate(6, name = $$new_props.name);
    		if ('labelsLeft' in $$new_props) $$invalidate(7, labelsLeft = $$new_props.labelsLeft);
    	};

    	$$self.$capture_state = () => ({
    		classes,
    		getColorPickerStyles,
    		RadioButton,
    		_class,
    		radioClass,
    		labelClass,
    		color,
    		items,
    		value,
    		name,
    		labelsLeft
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('_class' in $$props) $$invalidate(1, _class = $$new_props._class);
    		if ('radioClass' in $$props) $$invalidate(2, radioClass = $$new_props.radioClass);
    		if ('labelClass' in $$props) $$invalidate(3, labelClass = $$new_props.labelClass);
    		if ('color' in $$props) $$invalidate(4, color = $$new_props.color);
    		if ('items' in $$props) $$invalidate(5, items = $$new_props.items);
    		if ('value' in $$props) $$invalidate(0, value = $$new_props.value);
    		if ('name' in $$props) $$invalidate(6, name = $$new_props.name);
    		if ('labelsLeft' in $$props) $$invalidate(7, labelsLeft = $$new_props.labelsLeft);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		_class,
    		radioClass,
    		labelClass,
    		color,
    		items,
    		name,
    		labelsLeft,
    		$$restProps,
    		radiobutton_group_binding,
    		change_handler
    	];
    }

    class Radio_group extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			class: 1,
    			radioClass: 2,
    			labelClass: 3,
    			color: 4,
    			items: 5,
    			value: 0,
    			name: 6,
    			labelsLeft: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Radio_group",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*items*/ ctx[5] === undefined && !('items' in props)) {
    			console_1$1.warn("<Radio_group> was created without expected prop 'items'");
    		}

    		if (/*name*/ ctx[6] === undefined && !('name' in props)) {
    			console_1$1.warn("<Radio_group> was created without expected prop 'name'");
    		}
    	}

    	get class() {
    		throw new Error("<Radio_group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Radio_group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get radioClass() {
    		throw new Error("<Radio_group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set radioClass(value) {
    		throw new Error("<Radio_group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelClass() {
    		throw new Error("<Radio_group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelClass(value) {
    		throw new Error("<Radio_group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Radio_group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Radio_group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<Radio_group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Radio_group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Radio_group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Radio_group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Radio_group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Radio_group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelsLeft() {
    		throw new Error("<Radio_group>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelsLeft(value) {
    		throw new Error("<Radio_group>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var RadioGroup = Radio_group;

    /* node_modules/attractions/dropdown/dropdown-shell.svelte generated by Svelte v3.43.2 */
    const file$c = "node_modules/attractions/dropdown/dropdown-shell.svelte";
    const get_default_slot_changes$1 = dirty => ({});
    const get_default_slot_context$1 = ctx => ({ toggle: /*toggle*/ ctx[2] });

    function create_fragment$c(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], get_default_slot_context$1);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(classes('dropdown-shell', /*_class*/ ctx[1])) + " svelte-18ox5ni"));
    			toggle_class(div, "open", /*open*/ ctx[0]);
    			add_location(div, file$c, 55, 0, 1167);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[7](div);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "click", /*clickOutside*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, get_default_slot_changes$1),
    						get_default_slot_context$1
    					);
    				}
    			}

    			if (!current || dirty & /*_class*/ 2 && div_class_value !== (div_class_value = "" + (null_to_empty(classes('dropdown-shell', /*_class*/ ctx[1])) + " svelte-18ox5ni"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*_class, open*/ 3) {
    				toggle_class(div, "open", /*open*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[7](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Dropdown_shell', slots, ['default']);
    	let { class: _class = null } = $$props;
    	let { open = false } = $$props;

    	function toggle() {
    		$$invalidate(0, open = !open);
    	}

    	let self = null;

    	function clickOutside(event) {
    		if (!self) {
    			return;
    		}

    		const isClickInside = self.contains(event.target);

    		if (!isClickInside && open) {
    			toggle();
    		}
    	}

    	function handleKeyPress(evt) {
    		if (evt.key === 'Escape' && open) {
    			evt.preventDefault();
    			toggle();
    		}
    	}

    	const dispatch = createEventDispatcher();
    	const writable_props = ['class', 'open'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Dropdown_shell> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			self = $$value;
    			$$invalidate(3, self);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(1, _class = $$props.class);
    		if ('open' in $$props) $$invalidate(0, open = $$props.open);
    		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		classes,
    		_class,
    		open,
    		toggle,
    		self,
    		clickOutside,
    		handleKeyPress,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ('_class' in $$props) $$invalidate(1, _class = $$props._class);
    		if ('open' in $$props) $$invalidate(0, open = $$props.open);
    		if ('self' in $$props) $$invalidate(3, self = $$props.self);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*open*/ 1) {
    			dispatch('change', { value: open });
    		}

    		if ($$self.$$.dirty & /*open*/ 1) {
    			typeof document !== 'undefined' && (open
    			? document.addEventListener('keydown', handleKeyPress)
    			: document.removeEventListener('keydown', handleKeyPress));
    		}
    	};

    	return [open, _class, toggle, self, clickOutside, $$scope, slots, div_binding];
    }

    class Dropdown_shell extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { class: 1, open: 0, toggle: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dropdown_shell",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get class() {
    		throw new Error("<Dropdown_shell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Dropdown_shell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get open() {
    		throw new Error("<Dropdown_shell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<Dropdown_shell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggle() {
    		return this.$$.ctx[2];
    	}

    	set toggle(value) {
    		throw new Error("<Dropdown_shell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var DropdownShell = Dropdown_shell;

    /* node_modules/attractions/dropdown/dropdown.svelte generated by Svelte v3.43.2 */
    const file$b = "node_modules/attractions/dropdown/dropdown.svelte";

    function create_fragment$b(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(classes('dropdown', /*_class*/ ctx[0])) + " svelte-1fhqrqw"));
    			toggle_class(div, "right", /*right*/ ctx[1]);
    			toggle_class(div, "top", /*top*/ ctx[2]);
    			add_location(div, file$b, 17, 0, 395);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*_class*/ 1 && div_class_value !== (div_class_value = "" + (null_to_empty(classes('dropdown', /*_class*/ ctx[0])) + " svelte-1fhqrqw"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*_class, right*/ 3) {
    				toggle_class(div, "right", /*right*/ ctx[1]);
    			}

    			if (dirty & /*_class, top*/ 5) {
    				toggle_class(div, "top", /*top*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Dropdown', slots, ['default']);
    	let { class: _class = null } = $$props;
    	let { right = false } = $$props;
    	let { top = false } = $$props;
    	const writable_props = ['class', 'right', 'top'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Dropdown> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(0, _class = $$props.class);
    		if ('right' in $$props) $$invalidate(1, right = $$props.right);
    		if ('top' in $$props) $$invalidate(2, top = $$props.top);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ classes, _class, right, top });

    	$$self.$inject_state = $$props => {
    		if ('_class' in $$props) $$invalidate(0, _class = $$props._class);
    		if ('right' in $$props) $$invalidate(1, right = $$props.right);
    		if ('top' in $$props) $$invalidate(2, top = $$props.top);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [_class, right, top, $$scope, slots];
    }

    class Dropdown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { class: 0, right: 1, top: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dropdown",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get class() {
    		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get right() {
    		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set right(value) {
    		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get top() {
    		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set top(value) {
    		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Dropdown$1 = Dropdown;

    /* node_modules/attractions/modal/modal.svelte generated by Svelte v3.43.2 */
    const file$a = "node_modules/attractions/modal/modal.svelte";
    const get_default_slot_changes_1 = dirty => ({});
    const get_default_slot_context_1 = ctx => ({ closeCallback: /*close*/ ctx[3] });
    const get_default_slot_changes = dirty => ({});
    const get_default_slot_context = ctx => ({ closeCallback: /*close*/ ctx[3] });

    // (38:0) {:else}
    function create_else_block(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], get_default_slot_context_1);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(classes('modal-overlay', /*_class*/ ctx[1])) + " svelte-rafkre"));
    			toggle_class(div, "open", /*open*/ ctx[0]);
    			add_location(div, file$a, 38, 2, 832);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, get_default_slot_changes_1),
    						get_default_slot_context_1
    					);
    				}
    			}

    			if (!current || dirty & /*_class*/ 2 && div_class_value !== (div_class_value = "" + (null_to_empty(classes('modal-overlay', /*_class*/ ctx[1])) + " svelte-rafkre"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*_class, open*/ 3) {
    				toggle_class(div, "open", /*open*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(38:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (30:0) {#if !noClickaway}
    function create_if_block$3(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], get_default_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(classes('modal-overlay', /*_class*/ ctx[1])) + " svelte-rafkre"));
    			toggle_class(div, "open", /*open*/ ctx[0]);
    			add_location(div, file$a, 30, 2, 683);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", self(/*close*/ ctx[3]), false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}

    			if (!current || dirty & /*_class*/ 2 && div_class_value !== (div_class_value = "" + (null_to_empty(classes('modal-overlay', /*_class*/ ctx[1])) + " svelte-rafkre"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*_class, open*/ 3) {
    				toggle_class(div, "open", /*open*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(30:0) {#if !noClickaway}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*noClickaway*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modal', slots, ['default']);
    	let { class: _class = null } = $$props;
    	let { open = false } = $$props;
    	let { noClickaway = false } = $$props;

    	function close() {
    		$$invalidate(0, open = false);
    	}

    	const dispatch = createEventDispatcher();
    	const writable_props = ['class', 'open', 'noClickaway'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(1, _class = $$props.class);
    		if ('open' in $$props) $$invalidate(0, open = $$props.open);
    		if ('noClickaway' in $$props) $$invalidate(2, noClickaway = $$props.noClickaway);
    		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		classes,
    		_class,
    		open,
    		noClickaway,
    		close,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ('_class' in $$props) $$invalidate(1, _class = $$props._class);
    		if ('open' in $$props) $$invalidate(0, open = $$props.open);
    		if ('noClickaway' in $$props) $$invalidate(2, noClickaway = $$props.noClickaway);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*open*/ 1) {
    			dispatch('change', { value: open });
    		}
    	};

    	return [open, _class, noClickaway, close, $$scope, slots];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { class: 1, open: 0, noClickaway: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get class() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get open() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noClickaway() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noClickaway(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Modal$1 = Modal;

    /* node_modules/attractions/typography/label.svelte generated by Svelte v3.43.2 */
    const file$9 = "node_modules/attractions/typography/label.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	let div_levels = [
    		{
    			class: div_class_value = classes('label', /*_class*/ ctx[0])
    		},
    		/*$$restProps*/ ctx[2]
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			toggle_class(div, "small", /*small*/ ctx[1]);
    			toggle_class(div, "svelte-1bye8mi", true);
    			add_location(div, file$9, 12, 0, 212);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty & /*_class*/ 1 && div_class_value !== (div_class_value = classes('label', /*_class*/ ctx[0]))) && { class: div_class_value },
    				dirty & /*$$restProps*/ 4 && /*$$restProps*/ ctx[2]
    			]));

    			toggle_class(div, "small", /*small*/ ctx[1]);
    			toggle_class(div, "svelte-1bye8mi", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	const omit_props_names = ["class","small"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Label', slots, ['default']);
    	let { class: _class = null } = $$props;
    	let { small = false } = $$props;

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(2, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(0, _class = $$new_props.class);
    		if ('small' in $$new_props) $$invalidate(1, small = $$new_props.small);
    		if ('$$scope' in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ classes, _class, small });

    	$$self.$inject_state = $$new_props => {
    		if ('_class' in $$props) $$invalidate(0, _class = $$new_props._class);
    		if ('small' in $$props) $$invalidate(1, small = $$new_props.small);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [_class, small, $$restProps, $$scope, slots];
    }

    class Label extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { class: 0, small: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Label",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get class() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get small() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set small(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Label$1 = Label;

    /* node_modules/attractions/table/table.svelte generated by Svelte v3.43.2 */
    const file$8 = "node_modules/attractions/table/table.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    const get_item_slot_changes = dirty => ({
    	header: dirty & /*headers*/ 1,
    	item: dirty & /*items*/ 2
    });

    const get_item_slot_context = ctx => ({
    	header: /*header*/ ctx[9],
    	item: /*item*/ ctx[6]
    });

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    const get_header_item_slot_changes = dirty => ({ header: dirty & /*headers*/ 1 });
    const get_header_item_slot_context = ctx => ({ header: /*header*/ ctx[9] });

    // (49:12) <Label>
    function create_default_slot$3(ctx) {
    	let t_value = /*header*/ ctx[9].text + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*headers*/ 1 && t_value !== (t_value = /*header*/ ctx[9].text + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(49:12) <Label>",
    		ctx
    	});

    	return block;
    }

    // (48:44)              
    function fallback_block_1$1(ctx) {
    	let label;
    	let current;

    	label = new Label$1({
    			props: {
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(label.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(label, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const label_changes = {};

    			if (dirty & /*$$scope, headers*/ 33) {
    				label_changes.$$scope = { dirty, ctx };
    			}

    			label.$set(label_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(label, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1$1.name,
    		type: "fallback",
    		source: "(48:44)              ",
    		ctx
    	});

    	return block;
    }

    // (43:6) {#each headers as header (header.value)}
    function create_each_block_2$1(key_1, ctx) {
    	let th;
    	let t;
    	let current;
    	const header_item_slot_template = /*#slots*/ ctx[4]["header-item"];
    	const header_item_slot = create_slot(header_item_slot_template, ctx, /*$$scope*/ ctx[5], get_header_item_slot_context);
    	const header_item_slot_or_fallback = header_item_slot || fallback_block_1$1(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			th = element("th");
    			if (header_item_slot_or_fallback) header_item_slot_or_fallback.c();
    			t = space();
    			attr_dev(th, "class", "svelte-81z2q2");
    			toggle_class(th, "center", /*header*/ ctx[9].align === 'center');
    			toggle_class(th, "end", /*header*/ ctx[9].align === 'end');
    			add_location(th, file$8, 43, 8, 1198);
    			this.first = th;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);

    			if (header_item_slot_or_fallback) {
    				header_item_slot_or_fallback.m(th, null);
    			}

    			append_dev(th, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (header_item_slot) {
    				if (header_item_slot.p && (!current || dirty & /*$$scope, headers*/ 33)) {
    					update_slot_base(
    						header_item_slot,
    						header_item_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(header_item_slot_template, /*$$scope*/ ctx[5], dirty, get_header_item_slot_changes),
    						get_header_item_slot_context
    					);
    				}
    			} else {
    				if (header_item_slot_or_fallback && header_item_slot_or_fallback.p && (!current || dirty & /*headers*/ 1)) {
    					header_item_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}

    			if (dirty & /*headers*/ 1) {
    				toggle_class(th, "center", /*header*/ ctx[9].align === 'center');
    			}

    			if (dirty & /*headers*/ 1) {
    				toggle_class(th, "end", /*header*/ ctx[9].align === 'end');
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header_item_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header_item_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    			if (header_item_slot_or_fallback) header_item_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(43:6) {#each headers as header (header.value)}",
    		ctx
    	});

    	return block;
    }

    // (63:46)                
    function fallback_block$3(ctx) {
    	let t_value = /*item*/ ctx[6][/*header*/ ctx[9].value] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*items, headers*/ 3 && t_value !== (t_value = /*item*/ ctx[6][/*header*/ ctx[9].value] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$3.name,
    		type: "fallback",
    		source: "(63:46)                ",
    		ctx
    	});

    	return block;
    }

    // (58:8) {#each headers as header (header.value)}
    function create_each_block_1$1(key_1, ctx) {
    	let td;
    	let current;
    	const item_slot_template = /*#slots*/ ctx[4].item;
    	const item_slot = create_slot(item_slot_template, ctx, /*$$scope*/ ctx[5], get_item_slot_context);
    	const item_slot_or_fallback = item_slot || fallback_block$3(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			td = element("td");
    			if (item_slot_or_fallback) item_slot_or_fallback.c();
    			attr_dev(td, "class", "svelte-81z2q2");
    			toggle_class(td, "center", /*header*/ ctx[9].align === 'center');
    			toggle_class(td, "end", /*header*/ ctx[9].align === 'end');
    			add_location(td, file$8, 58, 10, 1603);
    			this.first = td;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);

    			if (item_slot_or_fallback) {
    				item_slot_or_fallback.m(td, null);
    			}

    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (item_slot) {
    				if (item_slot.p && (!current || dirty & /*$$scope, headers, items*/ 35)) {
    					update_slot_base(
    						item_slot,
    						item_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(item_slot_template, /*$$scope*/ ctx[5], dirty, get_item_slot_changes),
    						get_item_slot_context
    					);
    				}
    			} else {
    				if (item_slot_or_fallback && item_slot_or_fallback.p && (!current || dirty & /*items, headers*/ 3)) {
    					item_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}

    			if (dirty & /*headers*/ 1) {
    				toggle_class(td, "center", /*header*/ ctx[9].align === 'center');
    			}

    			if (dirty & /*headers*/ 1) {
    				toggle_class(td, "end", /*header*/ ctx[9].align === 'end');
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(item_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(item_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			if (item_slot_or_fallback) item_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(58:8) {#each headers as header (header.value)}",
    		ctx
    	});

    	return block;
    }

    // (56:4) {#each items as item}
    function create_each_block$2(ctx) {
    	let tr;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t;
    	let current;
    	let each_value_1 = /*headers*/ ctx[0];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*header*/ ctx[9].value;
    	validate_each_keys(ctx, each_value_1, get_each_context_1$1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(tr, "class", "svelte-81z2q2");
    			toggle_class(tr, "alternating", /*alternatingRows*/ ctx[2]);
    			add_location(tr, file$8, 56, 6, 1503);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*headers, items, $$scope*/ 35) {
    				each_value_1 = /*headers*/ ctx[0];
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, tr, outro_and_destroy_block, create_each_block_1$1, t, get_each_context_1$1);
    				check_outros();
    			}

    			if (dirty & /*alternatingRows*/ 4) {
    				toggle_class(tr, "alternating", /*alternatingRows*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(56:4) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let table;
    	let thead;
    	let tr;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let t;
    	let tbody;
    	let current;
    	let each_value_2 = /*headers*/ ctx[0];
    	validate_each_argument(each_value_2);
    	const get_key = ctx => /*header*/ ctx[9].value;
    	validate_each_keys(ctx, each_value_2, get_each_context_2$1, get_key);

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		let child_ctx = get_each_context_2$1(ctx, each_value_2, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_2$1(key, child_ctx));
    	}

    	let each_value = /*items*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let table_levels = [/*$$restProps*/ ctx[3]];
    	let table_data = {};

    	for (let i = 0; i < table_levels.length; i += 1) {
    		table_data = assign(table_data, table_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(tr, file$8, 41, 4, 1138);
    			add_location(thead, file$8, 40, 2, 1126);
    			add_location(tbody, file$8, 54, 2, 1463);
    			set_attributes(table, table_data);
    			toggle_class(table, "svelte-81z2q2", true);
    			add_location(table, file$8, 39, 0, 1099);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tr, null);
    			}

    			append_dev(table, t);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*headers, $$scope*/ 33) {
    				each_value_2 = /*headers*/ ctx[0];
    				validate_each_argument(each_value_2);
    				group_outros();
    				validate_each_keys(ctx, each_value_2, get_each_context_2$1, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_2, each0_lookup, tr, outro_and_destroy_block, create_each_block_2$1, null, get_each_context_2$1);
    				check_outros();
    			}

    			if (dirty & /*alternatingRows, headers, items, $$scope*/ 39) {
    				each_value = /*items*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			set_attributes(table, table_data = get_spread_update(table_levels, [dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]]));
    			toggle_class(table, "svelte-81z2q2", true);
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	const omit_props_names = ["headers","items","alternatingRows"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Table', slots, ['header-item','item']);
    	let { headers = [] } = $$props;
    	let { items = [] } = $$props;
    	let { alternatingRows = true } = $$props;

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('headers' in $$new_props) $$invalidate(0, headers = $$new_props.headers);
    		if ('items' in $$new_props) $$invalidate(1, items = $$new_props.items);
    		if ('alternatingRows' in $$new_props) $$invalidate(2, alternatingRows = $$new_props.alternatingRows);
    		if ('$$scope' in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ Label: Label$1, headers, items, alternatingRows });

    	$$self.$inject_state = $$new_props => {
    		if ('headers' in $$props) $$invalidate(0, headers = $$new_props.headers);
    		if ('items' in $$props) $$invalidate(1, items = $$new_props.items);
    		if ('alternatingRows' in $$props) $$invalidate(2, alternatingRows = $$new_props.alternatingRows);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [headers, items, alternatingRows, $$restProps, slots, $$scope];
    }

    class Table extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { headers: 0, items: 1, alternatingRows: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Table",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get headers() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set headers(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alternatingRows() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alternatingRows(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Table$1 = Table;

    /* node_modules/attractions/tab/tab.svelte generated by Svelte v3.43.2 */
    const file$7 = "node_modules/attractions/tab/tab.svelte";

    // (68:10) {value}
    function fallback_block$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*value*/ ctx[4]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*value*/ 16) set_data_dev(t, /*value*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$2.name,
    		type: "fallback",
    		source: "(68:10) {value}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let label;
    	let input;
    	let input_class_value;
    	let t;
    	let div;
    	let div_class_value;
    	let rippleEffect_action;
    	let label_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		{ __value: /*value*/ ctx[4] },
    		{ name: /*name*/ ctx[5] },
    		{ type: "radio" },
    		{
    			class: input_class_value = classes(/*inputClass*/ ctx[2])
    		},
    		{ disabled: /*disabled*/ ctx[6] },
    		/*$$restProps*/ ctx[9]
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);
    	const default_slot_or_fallback = default_slot || fallback_block$2(ctx);

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t = space();
    			div = element("div");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			set_attributes(input, input_data);
    			/*$$binding_groups*/ ctx[13][0].push(input);
    			toggle_class(input, "svelte-xi6tc3", true);
    			add_location(input, file$7, 52, 2, 1491);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(classes('content', /*contentClass*/ ctx[3])) + " svelte-xi6tc3"));
    			add_location(div, file$7, 63, 2, 1753);
    			attr_dev(label, "class", label_class_value = "" + (null_to_empty(classes('tab', /*_class*/ ctx[1])) + " svelte-xi6tc3"));
    			add_location(label, file$7, 51, 0, 1450);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			if (input.autofocus) input.focus();
    			input.checked = input.__value === /*group*/ ctx[0];
    			append_dev(label, t);
    			append_dev(label, div);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_handler*/ ctx[12]),
    					listen_dev(input, "change", /*change_handler*/ ctx[14], false, false, false),
    					listen_dev(input, "click", /*click_handler*/ ctx[15], false, false, false),
    					action_destroyer(rippleEffect_action = ripple.call(null, div, {
    						disabled: /*noRipple*/ ctx[7] || /*disabled*/ ctx[6]
    					}))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				(!current || dirty & /*value*/ 16) && { __value: /*value*/ ctx[4] },
    				(!current || dirty & /*name*/ 32) && { name: /*name*/ ctx[5] },
    				{ type: "radio" },
    				(!current || dirty & /*inputClass*/ 4 && input_class_value !== (input_class_value = classes(/*inputClass*/ ctx[2]))) && { class: input_class_value },
    				(!current || dirty & /*disabled*/ 64) && { disabled: /*disabled*/ ctx[6] },
    				dirty & /*$$restProps*/ 512 && /*$$restProps*/ ctx[9]
    			]));

    			if (dirty & /*group*/ 1) {
    				input.checked = input.__value === /*group*/ ctx[0];
    			}

    			toggle_class(input, "svelte-xi6tc3", true);

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[10],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[10], dirty, null),
    						null
    					);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && (!current || dirty & /*value*/ 16)) {
    					default_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}

    			if (!current || dirty & /*contentClass*/ 8 && div_class_value !== (div_class_value = "" + (null_to_empty(classes('content', /*contentClass*/ ctx[3])) + " svelte-xi6tc3"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (rippleEffect_action && is_function(rippleEffect_action.update) && dirty & /*noRipple, disabled*/ 192) rippleEffect_action.update.call(null, {
    				disabled: /*noRipple*/ ctx[7] || /*disabled*/ ctx[6]
    			});

    			if (!current || dirty & /*_class*/ 2 && label_class_value !== (label_class_value = "" + (null_to_empty(classes('tab', /*_class*/ ctx[1])) + " svelte-xi6tc3"))) {
    				attr_dev(label, "class", label_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			/*$$binding_groups*/ ctx[13][0].splice(/*$$binding_groups*/ ctx[13][0].indexOf(input), 1);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"class","inputClass","contentClass","value","name","group","disabled","noRipple"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tab', slots, ['default']);
    	let { class: _class = null } = $$props;
    	let { inputClass = null } = $$props;
    	let { contentClass = null } = $$props;
    	let { value } = $$props;
    	let { name = null } = $$props;
    	let { group = null } = $$props;
    	let { disabled = false } = $$props;
    	let { noRipple = false } = $$props;
    	const dispatch = createEventDispatcher();
    	const $$binding_groups = [[]];

    	function input_change_handler() {
    		group = this.__value;
    		$$invalidate(0, group);
    	}

    	const change_handler = e => dispatch('change', { value, nativeEvent: e });
    	const click_handler = e => dispatch('click', { nativeEvent: e });

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(9, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('class' in $$new_props) $$invalidate(1, _class = $$new_props.class);
    		if ('inputClass' in $$new_props) $$invalidate(2, inputClass = $$new_props.inputClass);
    		if ('contentClass' in $$new_props) $$invalidate(3, contentClass = $$new_props.contentClass);
    		if ('value' in $$new_props) $$invalidate(4, value = $$new_props.value);
    		if ('name' in $$new_props) $$invalidate(5, name = $$new_props.name);
    		if ('group' in $$new_props) $$invalidate(0, group = $$new_props.group);
    		if ('disabled' in $$new_props) $$invalidate(6, disabled = $$new_props.disabled);
    		if ('noRipple' in $$new_props) $$invalidate(7, noRipple = $$new_props.noRipple);
    		if ('$$scope' in $$new_props) $$invalidate(10, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		rippleEffect: ripple,
    		classes,
    		_class,
    		inputClass,
    		contentClass,
    		value,
    		name,
    		group,
    		disabled,
    		noRipple,
    		dispatch
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('_class' in $$props) $$invalidate(1, _class = $$new_props._class);
    		if ('inputClass' in $$props) $$invalidate(2, inputClass = $$new_props.inputClass);
    		if ('contentClass' in $$props) $$invalidate(3, contentClass = $$new_props.contentClass);
    		if ('value' in $$props) $$invalidate(4, value = $$new_props.value);
    		if ('name' in $$props) $$invalidate(5, name = $$new_props.name);
    		if ('group' in $$props) $$invalidate(0, group = $$new_props.group);
    		if ('disabled' in $$props) $$invalidate(6, disabled = $$new_props.disabled);
    		if ('noRipple' in $$props) $$invalidate(7, noRipple = $$new_props.noRipple);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		group,
    		_class,
    		inputClass,
    		contentClass,
    		value,
    		name,
    		disabled,
    		noRipple,
    		dispatch,
    		$$restProps,
    		$$scope,
    		slots,
    		input_change_handler,
    		$$binding_groups,
    		change_handler,
    		click_handler
    	];
    }

    class Tab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			class: 1,
    			inputClass: 2,
    			contentClass: 3,
    			value: 4,
    			name: 5,
    			group: 0,
    			disabled: 6,
    			noRipple: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tab",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[4] === undefined && !('value' in props)) {
    			console.warn("<Tab> was created without expected prop 'value'");
    		}
    	}

    	get class() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputClass() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputClass(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get contentClass() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set contentClass(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get group() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set group(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noRipple() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noRipple(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Tab$1 = Tab;

    /* node_modules/attractions/divider/divider.svelte generated by Svelte v3.43.2 */

    const file$6 = "node_modules/attractions/divider/divider.svelte";

    function create_fragment$6(ctx) {
    	let hr;
    	let hr_levels = [{ "data-text": /*text*/ ctx[0] }, /*$$restProps*/ ctx[1]];
    	let hr_data = {};

    	for (let i = 0; i < hr_levels.length; i += 1) {
    		hr_data = assign(hr_data, hr_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			set_attributes(hr, hr_data);
    			toggle_class(hr, "svelte-lhyupy", true);
    			add_location(hr, file$6, 8, 0, 129);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			set_attributes(hr, hr_data = get_spread_update(hr_levels, [
    				dirty & /*text*/ 1 && { "data-text": /*text*/ ctx[0] },
    				dirty & /*$$restProps*/ 2 && /*$$restProps*/ ctx[1]
    			]));

    			toggle_class(hr, "svelte-lhyupy", true);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	const omit_props_names = ["text"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Divider', slots, []);
    	let { text = null } = $$props;

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(1, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('text' in $$new_props) $$invalidate(0, text = $$new_props.text);
    	};

    	$$self.$capture_state = () => ({ text });

    	$$self.$inject_state = $$new_props => {
    		if ('text' in $$props) $$invalidate(0, text = $$new_props.text);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, $$restProps];
    }

    class Divider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { text: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Divider",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get text() {
    		throw new Error("<Divider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Divider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Divider$1 = Divider;

    /**
     * Generates a semi-open range.
     * @param {number} start The beginning of the range (included)
     * @param {number} [end] The end of the range (excluded)
     * @param {number} [step=1] The distance between the numbers in the range
     * @returns {Generator<number, void, never>}
     */
    function* range(start, end, step = 1) {
      if (end == null) {
        end = start;
        start = 0;
      }

      if (step === 0) {
        throw new Error('Range must have a non-zero step.');
      }

      if ((start >= end && step > 0) || (start <= end && step < 0)) {
        return;
      }

      for (let i = start; start < end ? i < end : i > end; i += step) {
        yield i;
      }
    }

    /* node_modules/attractions/dialog/x.svelte generated by Svelte v3.43.2 */

    const file$5 = "node_modules/attractions/dialog/x.svelte";

    function create_fragment$5(ctx) {
    	let svg;
    	let line0;
    	let line1;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			attr_dev(line0, "x1", "18");
    			attr_dev(line0, "y1", "6");
    			attr_dev(line0, "x2", "6");
    			attr_dev(line0, "y2", "18");
    			add_location(line0, file$5, 12, 2, 274);
    			attr_dev(line1, "x1", "6");
    			attr_dev(line1, "y1", "6");
    			attr_dev(line1, "x2", "18");
    			attr_dev(line1, "y2", "18");
    			add_location(line1, file$5, 13, 2, 315);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "stroke", "currentColor");
    			attr_dev(svg, "stroke-width", "2");
    			attr_dev(svg, "stroke-linecap", "round");
    			attr_dev(svg, "stroke-linejoin", "round");
    			add_location(svg, file$5, 1, 0, 71);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, line0);
    			append_dev(svg, line1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('X', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<X> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class X extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "X",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    var X$1 = X;

    /* node_modules/attractions/dialog/dialog.svelte generated by Svelte v3.43.2 */
    const file$4 = "node_modules/attractions/dialog/dialog.svelte";
    const get_title_icon_slot_changes = dirty => ({});
    const get_title_icon_slot_context = ctx => ({});
    const get_close_icon_slot_changes = dirty => ({});
    const get_close_icon_slot_context = ctx => ({});

    // (41:2) {#if closeCallback != null}
    function create_if_block_1$2(ctx) {
    	let button;
    	let current;

    	button = new Button$1({
    			props: {
    				neutral: true,
    				round: true,
    				class: "close",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", function () {
    		if (is_function(/*closeCallback*/ ctx[3])) /*closeCallback*/ ctx[3].apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(41:2) {#if closeCallback != null}",
    		ctx
    	});

    	return block;
    }

    // (43:30)          
    function fallback_block$1(ctx) {
    	let x;
    	let current;
    	x = new X$1({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(x.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(x, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(x.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(x.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(x, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$1.name,
    		type: "fallback",
    		source: "(43:30)          ",
    		ctx
    	});

    	return block;
    }

    // (42:4) <Button neutral round class="close" on:click={closeCallback}>
    function create_default_slot$2(ctx) {
    	let current;
    	const close_icon_slot_template = /*#slots*/ ctx[6]["close-icon"];
    	const close_icon_slot = create_slot(close_icon_slot_template, ctx, /*$$scope*/ ctx[7], get_close_icon_slot_context);
    	const close_icon_slot_or_fallback = close_icon_slot || fallback_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (close_icon_slot_or_fallback) close_icon_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (close_icon_slot_or_fallback) {
    				close_icon_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (close_icon_slot) {
    				if (close_icon_slot.p && (!current || dirty & /*$$scope*/ 128)) {
    					update_slot_base(
    						close_icon_slot,
    						close_icon_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(close_icon_slot_template, /*$$scope*/ ctx[7], dirty, get_close_icon_slot_changes),
    						get_close_icon_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(close_icon_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(close_icon_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (close_icon_slot_or_fallback) close_icon_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(42:4) <Button neutral round class=\\\"close\\\" on:click={closeCallback}>",
    		ctx
    	});

    	return block;
    }

    // (48:2) {#if title != null}
    function create_if_block$2(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let div_class_value;
    	let current;
    	const title_icon_slot_template = /*#slots*/ ctx[6]["title-icon"];
    	const title_icon_slot = create_slot(title_icon_slot_template, ctx, /*$$scope*/ ctx[7], get_title_icon_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (title_icon_slot) title_icon_slot.c();
    			t0 = space();
    			t1 = text(/*title*/ ctx[4]);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(classes('title', /*closeCallback*/ ctx[3] != null && 'close-padded', /*titleClass*/ ctx[1])) + " svelte-11akk9u"));
    			add_location(div, file$4, 48, 4, 1212);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (title_icon_slot) {
    				title_icon_slot.m(div, null);
    			}

    			append_dev(div, t0);
    			append_dev(div, t1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (title_icon_slot) {
    				if (title_icon_slot.p && (!current || dirty & /*$$scope*/ 128)) {
    					update_slot_base(
    						title_icon_slot,
    						title_icon_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(title_icon_slot_template, /*$$scope*/ ctx[7], dirty, get_title_icon_slot_changes),
    						get_title_icon_slot_context
    					);
    				}
    			}

    			if (!current || dirty & /*title*/ 16) set_data_dev(t1, /*title*/ ctx[4]);

    			if (!current || dirty & /*closeCallback, titleClass*/ 10 && div_class_value !== (div_class_value = "" + (null_to_empty(classes('title', /*closeCallback*/ ctx[3] != null && 'close-padded', /*titleClass*/ ctx[1])) + " svelte-11akk9u"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title_icon_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title_icon_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (title_icon_slot) title_icon_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(48:2) {#if title != null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let div_class_value;
    	let current;
    	let if_block0 = /*closeCallback*/ ctx[3] != null && create_if_block_1$2(ctx);
    	let if_block1 = /*title*/ ctx[4] != null && create_if_block$2(ctx);
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(classes('dialog', /*_class*/ ctx[0])) + " svelte-11akk9u"));
    			toggle_class(div, "danger", /*danger*/ ctx[2]);
    			toggle_class(div, "constrain-width", /*constrainWidth*/ ctx[5]);
    			add_location(div, file$4, 35, 0, 910);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*closeCallback*/ ctx[3] != null) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*closeCallback*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*title*/ ctx[4] != null) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*title*/ 16) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 128)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*_class*/ 1 && div_class_value !== (div_class_value = "" + (null_to_empty(classes('dialog', /*_class*/ ctx[0])) + " svelte-11akk9u"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*_class, danger*/ 5) {
    				toggle_class(div, "danger", /*danger*/ ctx[2]);
    			}

    			if (dirty & /*_class, constrainWidth*/ 33) {
    				toggle_class(div, "constrain-width", /*constrainWidth*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Dialog', slots, ['close-icon','title-icon','default']);
    	let { class: _class = null } = $$props;
    	let { titleClass = null } = $$props;
    	let { danger = false } = $$props;
    	let { closeCallback = null } = $$props;
    	let { title = null } = $$props;
    	let { constrainWidth = false } = $$props;
    	const writable_props = ['class', 'titleClass', 'danger', 'closeCallback', 'title', 'constrainWidth'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Dialog> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(0, _class = $$props.class);
    		if ('titleClass' in $$props) $$invalidate(1, titleClass = $$props.titleClass);
    		if ('danger' in $$props) $$invalidate(2, danger = $$props.danger);
    		if ('closeCallback' in $$props) $$invalidate(3, closeCallback = $$props.closeCallback);
    		if ('title' in $$props) $$invalidate(4, title = $$props.title);
    		if ('constrainWidth' in $$props) $$invalidate(5, constrainWidth = $$props.constrainWidth);
    		if ('$$scope' in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Button: Button$1,
    		X: X$1,
    		classes,
    		_class,
    		titleClass,
    		danger,
    		closeCallback,
    		title,
    		constrainWidth
    	});

    	$$self.$inject_state = $$props => {
    		if ('_class' in $$props) $$invalidate(0, _class = $$props._class);
    		if ('titleClass' in $$props) $$invalidate(1, titleClass = $$props.titleClass);
    		if ('danger' in $$props) $$invalidate(2, danger = $$props.danger);
    		if ('closeCallback' in $$props) $$invalidate(3, closeCallback = $$props.closeCallback);
    		if ('title' in $$props) $$invalidate(4, title = $$props.title);
    		if ('constrainWidth' in $$props) $$invalidate(5, constrainWidth = $$props.constrainWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		_class,
    		titleClass,
    		danger,
    		closeCallback,
    		title,
    		constrainWidth,
    		slots,
    		$$scope
    	];
    }

    class Dialog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			class: 0,
    			titleClass: 1,
    			danger: 2,
    			closeCallback: 3,
    			title: 4,
    			constrainWidth: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dialog",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get class() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get titleClass() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set titleClass(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get danger() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set danger(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeCallback() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeCallback(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get constrainWidth() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set constrainWidth(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Dialog$1 = Dialog;

    const numberRegex = /\d+/g;
    const formatSpecifierRegex = /%[HMSpPdmyY%]/g;

    /**
     * Parses a string representing a timestamp using the given format into a `Date` object.
     * @param {string} string The date-time string to be parsed
     * @param {string} format The format against which to parse the date-time string
     * @param {Date} [defaultValue] If the string cannot be properly parsed against the format string, this is returned
     * @returns {Date | null} The date object representing the given string
     */
    function parseDateTime(string, format, defaultValue) {
      const century = Math.floor(new Date().getFullYear() / 100);
      let isPM = false;

      if (string === '') {
        return null;
      }

      const parts = format.split(formatSpecifierRegex);
      let stringIdx = 0;
      let formatIdx = 0;
      const result = new Date(0);

      for (const part of parts) {
        if (!string.startsWith(part, stringIdx)) {
          return defaultValue;
        }

        stringIdx += part.length;
        if (stringIdx === string.length) {
          if (formatIdx !== format.length) {
            return defaultValue;
          }
          break;
        }

        if (format[formatIdx + part.length] !== '%') {
          break;
        }

        formatIdx += part.length + 1;

        if (format[formatIdx] === '%') {
          if (string[stringIdx] !== '%') {
            return defaultValue;
          }
          stringIdx++;
        } else if (format[formatIdx].toLowerCase() === 'p') {
          const hourFormat = string.substr(stringIdx, 2).toUpperCase();
          if (hourFormat === 'AM') {
            isPM = false;
            if (result.getHours() >= 12) {
              result.setHours(result.getHours() - 12);
            }
          } else if (hourFormat === 'PM') {
            isPM = true;
            if (result.getHours() < 12) {
              result.setHours(result.getHours() + 12);
            }
          } else {
            return defaultValue;
          }
        } else {
          numberRegex.lastIndex = stringIdx;
          const number = numberRegex.exec(string);
          if (number == null) {
            return defaultValue;
          }

          switch (format[formatIdx]) {
            case 'H':
              result.setHours(parseInt(number[0]) + 12 * isPM);
              break;
            case 'M':
              result.setMinutes(number[0]);
              break;
            case 'S':
              result.setSeconds(number[0]);
              break;
            case 'd':
              result.setDate(number[0]);
              break;
            case 'm':
              result.setMonth(number[0] - 1);
              break;
            case 'y':
              result.setFullYear(century * 100 + parseInt(number[0]));
              break;
            case 'Y':
              result.setFullYear(number[0]);
              break;
          }
          stringIdx += number[0].length;
        }
        formatIdx++;
      }

      if (isNaN(result.valueOf())) {
        // If the resulting date is invalid
        return defaultValue;
      }
      return result;
    }

    /**
     * Formats a given `Date` object into a string representation.
     * @param {Date} datetime The timestamp to be formatted
     * @param {string} format The format to which the given timestamp will be formatted
     */
    function formatDateTime(datetime, format) {
      if (datetime == null) {
        return null;
      }

      let hours = datetime.getHours();
      if (/%p/i.test(format)) {
        // If the AM/PM specifier is in the format string
        hours %= 12;
        if (hours === 0) {
          hours = 12;
        }
      }

      return format
        .replace('%Y', datetime.getFullYear())
        .replace('%y', (datetime.getFullYear() % 100).toString().padStart(2, '0'))
        .replace('%m', (datetime.getMonth() + 1).toString().padStart(2, '0'))
        .replace('%d', datetime.getDate().toString().padStart(2, '0'))
        .replace('%H', hours.toString().padStart(2, '0'))
        .replace('%M', datetime.getMinutes().toString().padStart(2, '0'))
        .replace('%S', datetime.getSeconds().toString().padStart(2, '0'))
        .replace('%p', datetime.getHours() < 12 ? 'am' : 'pm')
        .replace('%P', datetime.getHours() < 12 ? 'AM' : 'PM')
        .replace('%%', '%');
    }

    /**
     * Copies the time (hour, minute, and second) from the first `Date` object to the second.
     * @param {Date | null} source The object to copy the time from
     * @param {Date | null} destination The object to which the time will be copied, modified in-place
     * @returns {Date | null} The modified object
     */
    function applyTime(source, destination) {
      if (source == null || destination == null) {
        return source;
      }
      destination.setHours(
        source.getHours(),
        source.getMinutes(),
        source.getSeconds()
      );
      return destination;
    }

    /**
     * Copy a Date object, respecting null values.
     * @param {Date | null} date The object from which a copy should be made
     * @returns {Date | null} The clone of the given object
     */
    function copyDate(date) {
      if (date == null) {
        return null;
      }
      return new Date(date.valueOf());
    }

    /* node_modules/attractions/time-picker/clock.svelte generated by Svelte v3.43.2 */

    const file$3 = "node_modules/attractions/time-picker/clock.svelte";

    function create_fragment$3(ctx) {
    	let svg;
    	let circle;
    	let polyline;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			polyline = svg_element("polyline");
    			attr_dev(circle, "cx", "12");
    			attr_dev(circle, "cy", "12");
    			attr_dev(circle, "r", "10");
    			add_location(circle, file$3, 12, 2, 278);
    			attr_dev(polyline, "points", "12 6 12 12 16 14");
    			add_location(polyline, file$3, 13, 2, 314);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "stroke", "currentColor");
    			attr_dev(svg, "stroke-width", "2");
    			attr_dev(svg, "stroke-linecap", "round");
    			attr_dev(svg, "stroke-linejoin", "round");
    			add_location(svg, file$3, 1, 0, 75);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, circle);
    			append_dev(svg, polyline);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Clock', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Clock> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Clock extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Clock",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    var Clock$1 = Clock;

    /* node_modules/attractions/time-picker/time-picker.svelte generated by Svelte v3.43.2 */
    const file$2 = "node_modules/attractions/time-picker/time-picker.svelte";
    const get_now_label_slot_changes = dirty => ({});
    const get_now_label_slot_context = ctx => ({});
    const get_now_icon_slot_changes = dirty => ({});
    const get_now_icon_slot_context = ctx => ({});

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[35] = list[i];
    	return child_ctx;
    }

    const get_seconds_label_slot_changes = dirty => ({});
    const get_seconds_label_slot_context = ctx => ({});

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[38] = list[i];
    	return child_ctx;
    }

    const get_minutes_label_slot_changes = dirty => ({});
    const get_minutes_label_slot_context = ctx => ({});

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	return child_ctx;
    }

    const get_hours_label_slot_changes = dirty => ({});
    const get_hours_label_slot_context = ctx => ({});

    // (205:8) <Button noRipple on:click={() => (focus = false)}>
    function create_default_slot_9(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("close the time picker");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(205:8) <Button noRipple on:click={() => (focus = false)}>",
    		ctx
    	});

    	return block;
    }

    // (210:8) <Label>
    function create_default_slot_8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Hours");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(210:8) <Label>",
    		ctx
    	});

    	return block;
    }

    // (209:31)          
    function fallback_block_4(ctx) {
    	let label;
    	let current;

    	label = new Label$1({
    			props: {
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(label.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(label, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const label_changes = {};

    			if (dirty[1] & /*$$scope*/ 2) {
    				label_changes.$$scope = { dirty, ctx };
    			}

    			label.$set(label_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(label, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_4.name,
    		type: "fallback",
    		source: "(209:31)          ",
    		ctx
    	});

    	return block;
    }

    // (214:10) <Button             on:click={() =>               setHours(                 hour +                   12 * (f12hours && (currentAmPm === 'PM') ^ (value === 12))               )}             selected={matchesCurrentHour(hour, value)}           >
    function create_default_slot_7(ctx) {
    	let t0_value = /*hour*/ ctx[41].toString().padStart(2, '0') + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*hours*/ 128 && t0_value !== (t0_value = /*hour*/ ctx[41].toString().padStart(2, '0') + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(214:10) <Button             on:click={() =>               setHours(                 hour +                   12 * (f12hours && (currentAmPm === 'PM') ^ (value === 12))               )}             selected={matchesCurrentHour(hour, value)}           >",
    		ctx
    	});

    	return block;
    }

    // (213:8) {#each hours as hour}
    function create_each_block_2(ctx) {
    	let button;
    	let current;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[26](/*hour*/ ctx[41]);
    	}

    	button = new Button$1({
    			props: {
    				selected: /*matchesCurrentHour*/ ctx[20](/*hour*/ ctx[41], /*value*/ ctx[0]),
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", click_handler_1);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const button_changes = {};
    			if (dirty[0] & /*hours, value*/ 129) button_changes.selected = /*matchesCurrentHour*/ ctx[20](/*hour*/ ctx[41], /*value*/ ctx[0]);

    			if (dirty[0] & /*hours*/ 128 | dirty[1] & /*$$scope*/ 2) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(213:8) {#each hours as hour}",
    		ctx
    	});

    	return block;
    }

    // (227:8) <Label>
    function create_default_slot_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Minutes");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(227:8) <Label>",
    		ctx
    	});

    	return block;
    }

    // (226:33)          
    function fallback_block_3(ctx) {
    	let label;
    	let current;

    	label = new Label$1({
    			props: {
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(label.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(label, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const label_changes = {};

    			if (dirty[1] & /*$$scope*/ 2) {
    				label_changes.$$scope = { dirty, ctx };
    			}

    			label.$set(label_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(label, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_3.name,
    		type: "fallback",
    		source: "(226:33)          ",
    		ctx
    	});

    	return block;
    }

    // (231:10) <Button             on:click={() => setMinutes(mins)}             selected={value && mins === value.getMinutes()}           >
    function create_default_slot_5$1(ctx) {
    	let t0_value = /*mins*/ ctx[38].toString().padStart(2, '0') + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*minutes*/ 256 && t0_value !== (t0_value = /*mins*/ ctx[38].toString().padStart(2, '0') + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$1.name,
    		type: "slot",
    		source: "(231:10) <Button             on:click={() => setMinutes(mins)}             selected={value && mins === value.getMinutes()}           >",
    		ctx
    	});

    	return block;
    }

    // (230:8) {#each minutes as mins}
    function create_each_block_1(ctx) {
    	let button;
    	let current;

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[27](/*mins*/ ctx[38]);
    	}

    	button = new Button$1({
    			props: {
    				selected: /*value*/ ctx[0] && /*mins*/ ctx[38] === /*value*/ ctx[0].getMinutes(),
    				$$slots: { default: [create_default_slot_5$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", click_handler_2);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const button_changes = {};
    			if (dirty[0] & /*value, minutes*/ 257) button_changes.selected = /*value*/ ctx[0] && /*mins*/ ctx[38] === /*value*/ ctx[0].getMinutes();

    			if (dirty[0] & /*minutes*/ 256 | dirty[1] & /*$$scope*/ 2) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(230:8) {#each minutes as mins}",
    		ctx
    	});

    	return block;
    }

    // (239:6) {#if hasSeconds}
    function create_if_block_1$1(ctx) {
    	let t;
    	let div;
    	let current;
    	const seconds_label_slot_template = /*#slots*/ ctx[22]["seconds-label"];
    	const seconds_label_slot = create_slot(seconds_label_slot_template, ctx, /*$$scope*/ ctx[32], get_seconds_label_slot_context);
    	const seconds_label_slot_or_fallback = seconds_label_slot || fallback_block_2(ctx);
    	let each_value = /*seconds*/ ctx[9];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			if (seconds_label_slot_or_fallback) seconds_label_slot_or_fallback.c();
    			t = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "column");
    			add_location(div, file$2, 242, 8, 6977);
    		},
    		m: function mount(target, anchor) {
    			if (seconds_label_slot_or_fallback) {
    				seconds_label_slot_or_fallback.m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (seconds_label_slot) {
    				if (seconds_label_slot.p && (!current || dirty[1] & /*$$scope*/ 2)) {
    					update_slot_base(
    						seconds_label_slot,
    						seconds_label_slot_template,
    						ctx,
    						/*$$scope*/ ctx[32],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[32])
    						: get_slot_changes(seconds_label_slot_template, /*$$scope*/ ctx[32], dirty, get_seconds_label_slot_changes),
    						get_seconds_label_slot_context
    					);
    				}
    			}

    			if (dirty[0] & /*value, seconds, setSeconds*/ 131585) {
    				each_value = /*seconds*/ ctx[9];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(seconds_label_slot_or_fallback, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(seconds_label_slot_or_fallback, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (seconds_label_slot_or_fallback) seconds_label_slot_or_fallback.d(detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(239:6) {#if hasSeconds}",
    		ctx
    	});

    	return block;
    }

    // (241:10) <Label>
    function create_default_slot_4$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Seconds");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(241:10) <Label>",
    		ctx
    	});

    	return block;
    }

    // (240:35)            
    function fallback_block_2(ctx) {
    	let label;
    	let current;

    	label = new Label$1({
    			props: {
    				$$slots: { default: [create_default_slot_4$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(label.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(label, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const label_changes = {};

    			if (dirty[1] & /*$$scope*/ 2) {
    				label_changes.$$scope = { dirty, ctx };
    			}

    			label.$set(label_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(label, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_2.name,
    		type: "fallback",
    		source: "(240:35)            ",
    		ctx
    	});

    	return block;
    }

    // (245:12) <Button               on:click={() => setSeconds(secs)}               selected={value && secs === value.getSeconds()}             >
    function create_default_slot_3$1(ctx) {
    	let t0_value = /*secs*/ ctx[35].toString().padStart(2, '0') + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*seconds*/ 512 && t0_value !== (t0_value = /*secs*/ ctx[35].toString().padStart(2, '0') + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(245:12) <Button               on:click={() => setSeconds(secs)}               selected={value && secs === value.getSeconds()}             >",
    		ctx
    	});

    	return block;
    }

    // (244:10) {#each seconds as secs}
    function create_each_block$1(ctx) {
    	let button;
    	let current;

    	function click_handler_3() {
    		return /*click_handler_3*/ ctx[28](/*secs*/ ctx[35]);
    	}

    	button = new Button$1({
    			props: {
    				selected: /*value*/ ctx[0] && /*secs*/ ctx[35] === /*value*/ ctx[0].getSeconds(),
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", click_handler_3);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const button_changes = {};
    			if (dirty[0] & /*value, seconds*/ 513) button_changes.selected = /*value*/ ctx[0] && /*secs*/ ctx[35] === /*value*/ ctx[0].getSeconds();

    			if (dirty[0] & /*seconds*/ 512 | dirty[1] & /*$$scope*/ 2) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(244:10) {#each seconds as secs}",
    		ctx
    	});

    	return block;
    }

    // (254:6) {#if f12hours}
    function create_if_block$1(ctx) {
    	let div;
    	let tab0;
    	let updating_group;
    	let t;
    	let tab1;
    	let updating_group_1;
    	let current;

    	function tab0_group_binding(value) {
    		/*tab0_group_binding*/ ctx[29](value);
    	}

    	let tab0_props = {
    		value: "AM",
    		name: /*amPmTabName*/ ctx[6]
    	};

    	if (/*currentAmPm*/ ctx[11] !== void 0) {
    		tab0_props.group = /*currentAmPm*/ ctx[11];
    	}

    	tab0 = new Tab$1({ props: tab0_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(tab0, 'group', tab0_group_binding));
    	tab0.$on("change", /*changeAmPm*/ ctx[19]);

    	function tab1_group_binding(value) {
    		/*tab1_group_binding*/ ctx[30](value);
    	}

    	let tab1_props = {
    		value: "PM",
    		name: /*amPmTabName*/ ctx[6]
    	};

    	if (/*currentAmPm*/ ctx[11] !== void 0) {
    		tab1_props.group = /*currentAmPm*/ ctx[11];
    	}

    	tab1 = new Tab$1({ props: tab1_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(tab1, 'group', tab1_group_binding));
    	tab1.$on("change", /*changeAmPm*/ ctx[19]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(tab0.$$.fragment);
    			t = space();
    			create_component(tab1.$$.fragment);
    			attr_dev(div, "class", "am-pm-tabs");
    			add_location(div, file$2, 254, 8, 7321);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(tab0, div, null);
    			append_dev(div, t);
    			mount_component(tab1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tab0_changes = {};
    			if (dirty[0] & /*amPmTabName*/ 64) tab0_changes.name = /*amPmTabName*/ ctx[6];

    			if (!updating_group && dirty[0] & /*currentAmPm*/ 2048) {
    				updating_group = true;
    				tab0_changes.group = /*currentAmPm*/ ctx[11];
    				add_flush_callback(() => updating_group = false);
    			}

    			tab0.$set(tab0_changes);
    			const tab1_changes = {};
    			if (dirty[0] & /*amPmTabName*/ 64) tab1_changes.name = /*amPmTabName*/ ctx[6];

    			if (!updating_group_1 && dirty[0] & /*currentAmPm*/ 2048) {
    				updating_group_1 = true;
    				tab1_changes.group = /*currentAmPm*/ ctx[11];
    				add_flush_callback(() => updating_group_1 = false);
    			}

    			tab1.$set(tab1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab0.$$.fragment, local);
    			transition_in(tab1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab0.$$.fragment, local);
    			transition_out(tab1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(tab0);
    			destroy_component(tab1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(254:6) {#if f12hours}",
    		ctx
    	});

    	return block;
    }

    // (271:30)            
    function fallback_block_1(ctx) {
    	let clock;
    	let current;
    	clock = new Clock$1({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(clock.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(clock, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(clock.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(clock.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(clock, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(271:30)            ",
    		ctx
    	});

    	return block;
    }

    // (274:31) now
    function fallback_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("now");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(274:31) now",
    		ctx
    	});

    	return block;
    }

    // (270:6) <Button on:click={setToNow}>
    function create_default_slot_2$1(ctx) {
    	let t;
    	let current;
    	const now_icon_slot_template = /*#slots*/ ctx[22]["now-icon"];
    	const now_icon_slot = create_slot(now_icon_slot_template, ctx, /*$$scope*/ ctx[32], get_now_icon_slot_context);
    	const now_icon_slot_or_fallback = now_icon_slot || fallback_block_1(ctx);
    	const now_label_slot_template = /*#slots*/ ctx[22]["now-label"];
    	const now_label_slot = create_slot(now_label_slot_template, ctx, /*$$scope*/ ctx[32], get_now_label_slot_context);
    	const now_label_slot_or_fallback = now_label_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			if (now_icon_slot_or_fallback) now_icon_slot_or_fallback.c();
    			t = space();
    			if (now_label_slot_or_fallback) now_label_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (now_icon_slot_or_fallback) {
    				now_icon_slot_or_fallback.m(target, anchor);
    			}

    			insert_dev(target, t, anchor);

    			if (now_label_slot_or_fallback) {
    				now_label_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (now_icon_slot) {
    				if (now_icon_slot.p && (!current || dirty[1] & /*$$scope*/ 2)) {
    					update_slot_base(
    						now_icon_slot,
    						now_icon_slot_template,
    						ctx,
    						/*$$scope*/ ctx[32],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[32])
    						: get_slot_changes(now_icon_slot_template, /*$$scope*/ ctx[32], dirty, get_now_icon_slot_changes),
    						get_now_icon_slot_context
    					);
    				}
    			}

    			if (now_label_slot) {
    				if (now_label_slot.p && (!current || dirty[1] & /*$$scope*/ 2)) {
    					update_slot_base(
    						now_label_slot,
    						now_label_slot_template,
    						ctx,
    						/*$$scope*/ ctx[32],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[32])
    						: get_slot_changes(now_label_slot_template, /*$$scope*/ ctx[32], dirty, get_now_label_slot_changes),
    						get_now_label_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(now_icon_slot_or_fallback, local);
    			transition_in(now_label_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(now_icon_slot_or_fallback, local);
    			transition_out(now_label_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (now_icon_slot_or_fallback) now_icon_slot_or_fallback.d(detaching);
    			if (detaching) detach_dev(t);
    			if (now_label_slot_or_fallback) now_label_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(270:6) <Button on:click={setToNow}>",
    		ctx
    	});

    	return block;
    }

    // (203:4) <Dropdown class="barrel" {top} {right}>
    function create_default_slot_1$1(ctx) {
    	let div0;
    	let button0;
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let t3;
    	let div2;
    	let t4;
    	let t5;
    	let t6;
    	let button1;
    	let current;

    	button0 = new Button$1({
    			props: {
    				noRipple: true,
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*click_handler*/ ctx[25]);
    	const hours_label_slot_template = /*#slots*/ ctx[22]["hours-label"];
    	const hours_label_slot = create_slot(hours_label_slot_template, ctx, /*$$scope*/ ctx[32], get_hours_label_slot_context);
    	const hours_label_slot_or_fallback = hours_label_slot || fallback_block_4(ctx);
    	let each_value_2 = /*hours*/ ctx[7];
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	const minutes_label_slot_template = /*#slots*/ ctx[22]["minutes-label"];
    	const minutes_label_slot = create_slot(minutes_label_slot_template, ctx, /*$$scope*/ ctx[32], get_minutes_label_slot_context);
    	const minutes_label_slot_or_fallback = minutes_label_slot || fallback_block_3(ctx);
    	let each_value_1 = /*minutes*/ ctx[8];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block0 = /*hasSeconds*/ ctx[14] && create_if_block_1$1(ctx);
    	let if_block1 = /*f12hours*/ ctx[13] && create_if_block$1(ctx);

    	button1 = new Button$1({
    			props: {
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*setToNow*/ ctx[18]);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(button0.$$.fragment);
    			t0 = space();
    			if (hours_label_slot_or_fallback) hours_label_slot_or_fallback.c();
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			if (minutes_label_slot_or_fallback) minutes_label_slot_or_fallback.c();
    			t3 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			if (if_block0) if_block0.c();
    			t5 = space();
    			if (if_block1) if_block1.c();
    			t6 = space();
    			create_component(button1.$$.fragment);
    			attr_dev(div0, "class", "shown-on-focus");
    			add_location(div0, file$2, 203, 6, 5858);
    			attr_dev(div1, "class", "column");
    			add_location(div1, file$2, 211, 6, 6090);
    			attr_dev(div2, "class", "column");
    			add_location(div2, file$2, 228, 6, 6576);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(button0, div0, null);
    			insert_dev(target, t0, anchor);

    			if (hours_label_slot_or_fallback) {
    				hours_label_slot_or_fallback.m(target, anchor);
    			}

    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			insert_dev(target, t2, anchor);

    			if (minutes_label_slot_or_fallback) {
    				minutes_label_slot_or_fallback.m(target, anchor);
    			}

    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			insert_dev(target, t4, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(button1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button0_changes = {};

    			if (dirty[1] & /*$$scope*/ 2) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);

    			if (hours_label_slot) {
    				if (hours_label_slot.p && (!current || dirty[1] & /*$$scope*/ 2)) {
    					update_slot_base(
    						hours_label_slot,
    						hours_label_slot_template,
    						ctx,
    						/*$$scope*/ ctx[32],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[32])
    						: get_slot_changes(hours_label_slot_template, /*$$scope*/ ctx[32], dirty, get_hours_label_slot_changes),
    						get_hours_label_slot_context
    					);
    				}
    			}

    			if (dirty[0] & /*matchesCurrentHour, hours, value, setHours, f12hours, currentAmPm*/ 1091713) {
    				each_value_2 = /*hours*/ ctx[7];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (minutes_label_slot) {
    				if (minutes_label_slot.p && (!current || dirty[1] & /*$$scope*/ 2)) {
    					update_slot_base(
    						minutes_label_slot,
    						minutes_label_slot_template,
    						ctx,
    						/*$$scope*/ ctx[32],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[32])
    						: get_slot_changes(minutes_label_slot_template, /*$$scope*/ ctx[32], dirty, get_minutes_label_slot_changes),
    						get_minutes_label_slot_context
    					);
    				}
    			}

    			if (dirty[0] & /*value, minutes, setMinutes*/ 65793) {
    				each_value_1 = /*minutes*/ ctx[8];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div2, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}

    			if (/*hasSeconds*/ ctx[14]) if_block0.p(ctx, dirty);
    			if (/*f12hours*/ ctx[13]) if_block1.p(ctx, dirty);
    			const button1_changes = {};

    			if (dirty[1] & /*$$scope*/ 2) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(hours_label_slot_or_fallback, local);

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			transition_in(minutes_label_slot_or_fallback, local);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(hours_label_slot_or_fallback, local);
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			transition_out(minutes_label_slot_or_fallback, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(button0);
    			if (detaching) detach_dev(t0);
    			if (hours_label_slot_or_fallback) hours_label_slot_or_fallback.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t2);
    			if (minutes_label_slot_or_fallback) minutes_label_slot_or_fallback.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(button1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(203:4) <Dropdown class=\\\"barrel\\\" {top} {right}>",
    		ctx
    	});

    	return block;
    }

    // (190:2) <DropdownShell bind:open={focus} on:change={toggleKeyboardListener}>
    function create_default_slot$1(ctx) {
    	let div;
    	let textfield;
    	let t;
    	let dropdown;
    	let current;

    	textfield = new TextField({
    			props: {
    				placeholder: /*readableFormat*/ ctx[12],
    				value: formatDateTime(/*value*/ ctx[0], /*format*/ ctx[5]),
    				class: classes(/*focus*/ ctx[10] && 'in-focus'),
    				inputClass: /*inputClass*/ ctx[2]
    			},
    			$$inline: true
    		});

    	textfield.$on("focus", /*focus_handler*/ ctx[23]);
    	textfield.$on("change", /*change_handler*/ ctx[24]);

    	dropdown = new Dropdown$1({
    			props: {
    				class: "barrel",
    				top: /*top*/ ctx[3],
    				right: /*right*/ ctx[4],
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(textfield.$$.fragment);
    			t = space();
    			create_component(dropdown.$$.fragment);
    			attr_dev(div, "class", "handle");
    			add_location(div, file$2, 190, 4, 5433);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(textfield, div, null);
    			insert_dev(target, t, anchor);
    			mount_component(dropdown, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const textfield_changes = {};
    			if (dirty[0] & /*readableFormat*/ 4096) textfield_changes.placeholder = /*readableFormat*/ ctx[12];
    			if (dirty[0] & /*value, format*/ 33) textfield_changes.value = formatDateTime(/*value*/ ctx[0], /*format*/ ctx[5]);
    			if (dirty[0] & /*focus*/ 1024) textfield_changes.class = classes(/*focus*/ ctx[10] && 'in-focus');
    			if (dirty[0] & /*inputClass*/ 4) textfield_changes.inputClass = /*inputClass*/ ctx[2];
    			textfield.$set(textfield_changes);
    			const dropdown_changes = {};
    			if (dirty[0] & /*top*/ 8) dropdown_changes.top = /*top*/ ctx[3];
    			if (dirty[0] & /*right*/ 16) dropdown_changes.right = /*right*/ ctx[4];

    			if (dirty[0] & /*amPmTabName, currentAmPm, seconds, value, minutes, hours, focus*/ 4033 | dirty[1] & /*$$scope*/ 2) {
    				dropdown_changes.$$scope = { dirty, ctx };
    			}

    			dropdown.$set(dropdown_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield.$$.fragment, local);
    			transition_in(dropdown.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield.$$.fragment, local);
    			transition_out(dropdown.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(textfield);
    			if (detaching) detach_dev(t);
    			destroy_component(dropdown, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(190:2) <DropdownShell bind:open={focus} on:change={toggleKeyboardListener}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let dropdownshell;
    	let updating_open;
    	let div_class_value;
    	let current;

    	function dropdownshell_open_binding(value) {
    		/*dropdownshell_open_binding*/ ctx[31](value);
    	}

    	let dropdownshell_props = {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	if (/*focus*/ ctx[10] !== void 0) {
    		dropdownshell_props.open = /*focus*/ ctx[10];
    	}

    	dropdownshell = new DropdownShell({
    			props: dropdownshell_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind$1(dropdownshell, 'open', dropdownshell_open_binding));
    	dropdownshell.$on("change", /*toggleKeyboardListener*/ ctx[21]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(dropdownshell.$$.fragment);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(classes('time-picker', /*_class*/ ctx[1], /*f12hours*/ ctx[13] && 'f12hours', /*hasSeconds*/ ctx[14] && 'seconds')) + " svelte-68zps1"));
    			add_location(div, file$2, 181, 0, 5241);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(dropdownshell, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const dropdownshell_changes = {};

    			if (dirty[0] & /*top, right, amPmTabName, currentAmPm, seconds, value, minutes, hours, focus, readableFormat, format, inputClass*/ 8189 | dirty[1] & /*$$scope*/ 2) {
    				dropdownshell_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_open && dirty[0] & /*focus*/ 1024) {
    				updating_open = true;
    				dropdownshell_changes.open = /*focus*/ ctx[10];
    				add_flush_callback(() => updating_open = false);
    			}

    			dropdownshell.$set(dropdownshell_changes);

    			if (!current || dirty[0] & /*_class*/ 2 && div_class_value !== (div_class_value = "" + (null_to_empty(classes('time-picker', /*_class*/ ctx[1], /*f12hours*/ ctx[13] && 'f12hours', /*hasSeconds*/ ctx[14] && 'seconds')) + " svelte-68zps1"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dropdownshell.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dropdownshell.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(dropdownshell);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let readableFormat;
    	let currentAmPm;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Time_picker', slots, ['hours-label','minutes-label','seconds-label','now-icon','now-label']);
    	let { class: _class = null } = $$props;
    	let { inputClass = null } = $$props;
    	let { top = false } = $$props;
    	let { right = false } = $$props;
    	let { value = null } = $$props;
    	let { format = '%H:%M' } = $$props;
    	let { amPmTabName = 'am-pm' } = $$props;
    	const f12hours = (/%p/i).test(format);
    	const hasSeconds = (/%S/).test(format);
    	let focus = false;
    	let { hours = [...range(f12hours ? 1 : 0, f12hours ? 13 : 24)] } = $$props;
    	let { minutes = [...range(0, 60, 5)] } = $$props;
    	let { seconds = hasSeconds ? [...range(0, 60, 5)] : [] } = $$props;

    	function setHours(hourValue, minuteValue = null, secondValue = null) {
    		hourValue %= 24;

    		if (value == null) {
    			$$invalidate(0, value = new Date(0));
    		} else {
    			$$invalidate(0, value = copyDate(value));
    		}

    		if (minuteValue != null && secondValue != null) {
    			value.setHours(hourValue, minuteValue, secondValue);
    		} else {
    			value.setHours(hourValue);
    		}

    		$$invalidate(0, value);
    		dispatch('change', { value });
    	}

    	function setMinutes(minuteValue) {
    		if (value == null) {
    			$$invalidate(0, value = new Date(0));
    		} else {
    			$$invalidate(0, value = copyDate(value));
    		}

    		value.setMinutes(minuteValue);
    		$$invalidate(0, value);
    		dispatch('change', { value });
    	}

    	function setSeconds(secondValue) {
    		if (value == null) {
    			$$invalidate(0, value = new Date(0));
    		} else {
    			$$invalidate(0, value = copyDate(value));
    		}

    		value.setSeconds(secondValue);
    		$$invalidate(0, value);
    		dispatch('change', { value });
    	}

    	function setToNow() {
    		const now = new Date();
    		setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    	}

    	function changeAmPm({ detail: newAmPm }) {
    		if (value == null) {
    			if (newAmPm.value === 'PM') {
    				setHours(12);
    			} else {
    				setHours(0);
    			}
    		} else {
    			if (newAmPm.value === 'PM' && value.getHours() < 12) {
    				setHours(value.getHours() + 12);
    			} else if (newAmPm.value === 'AM' && value.getHours() >= 12) {
    				setHours(value.getHours() - 12);
    			}
    		}
    	}

    	function matchesCurrentHour(hour, selected) {
    		if (!value) {
    			return false;
    		}

    		const currentHour = f12hours
    		? (selected.getHours() + 11) % 12 + 1
    		: selected.getHours();

    		return hour === currentHour;
    	}

    	function handleKeyPress(evt) {
    		if (evt.key === 'Enter') {
    			evt.preventDefault();
    			$$invalidate(10, focus = !focus);
    		}
    	}

    	function toggleKeyboardListener({ detail }) {
    		if (detail.value) {
    			document.addEventListener('keydown', handleKeyPress);
    		} else {
    			document.removeEventListener('keydown', handleKeyPress);
    		}
    	}

    	const dispatch = createEventDispatcher();

    	const writable_props = [
    		'class',
    		'inputClass',
    		'top',
    		'right',
    		'value',
    		'format',
    		'amPmTabName',
    		'hours',
    		'minutes',
    		'seconds'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Time_picker> was created with unknown prop '${key}'`);
    	});

    	const focus_handler = () => $$invalidate(10, focus = true);

    	const change_handler = ({ detail }) => {
    		$$invalidate(0, value = applyTime(parseDateTime(detail.value, format, value), value));
    	};

    	const click_handler = () => $$invalidate(10, focus = false);
    	const click_handler_1 = hour => setHours(hour + 12 * (f12hours && currentAmPm === 'PM' ^ value === 12));
    	const click_handler_2 = mins => setMinutes(mins);
    	const click_handler_3 = secs => setSeconds(secs);

    	function tab0_group_binding(value$1) {
    		currentAmPm = value$1;
    		($$invalidate(11, currentAmPm), $$invalidate(0, value));
    	}

    	function tab1_group_binding(value$1) {
    		currentAmPm = value$1;
    		($$invalidate(11, currentAmPm), $$invalidate(0, value));
    	}

    	function dropdownshell_open_binding(value) {
    		focus = value;
    		$$invalidate(10, focus);
    	}

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(1, _class = $$props.class);
    		if ('inputClass' in $$props) $$invalidate(2, inputClass = $$props.inputClass);
    		if ('top' in $$props) $$invalidate(3, top = $$props.top);
    		if ('right' in $$props) $$invalidate(4, right = $$props.right);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('format' in $$props) $$invalidate(5, format = $$props.format);
    		if ('amPmTabName' in $$props) $$invalidate(6, amPmTabName = $$props.amPmTabName);
    		if ('hours' in $$props) $$invalidate(7, hours = $$props.hours);
    		if ('minutes' in $$props) $$invalidate(8, minutes = $$props.minutes);
    		if ('seconds' in $$props) $$invalidate(9, seconds = $$props.seconds);
    		if ('$$scope' in $$props) $$invalidate(32, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		classes,
    		Button: Button$1,
    		Label: Label$1,
    		TextField,
    		Dropdown: Dropdown$1,
    		DropdownShell,
    		Tab: Tab$1,
    		Clock: Clock$1,
    		parseDateTime,
    		formatDateTime,
    		applyTime,
    		copyDate,
    		rangeGenerator: range,
    		_class,
    		inputClass,
    		top,
    		right,
    		value,
    		format,
    		amPmTabName,
    		f12hours,
    		hasSeconds,
    		focus,
    		hours,
    		minutes,
    		seconds,
    		setHours,
    		setMinutes,
    		setSeconds,
    		setToNow,
    		changeAmPm,
    		matchesCurrentHour,
    		handleKeyPress,
    		toggleKeyboardListener,
    		dispatch,
    		currentAmPm,
    		readableFormat
    	});

    	$$self.$inject_state = $$props => {
    		if ('_class' in $$props) $$invalidate(1, _class = $$props._class);
    		if ('inputClass' in $$props) $$invalidate(2, inputClass = $$props.inputClass);
    		if ('top' in $$props) $$invalidate(3, top = $$props.top);
    		if ('right' in $$props) $$invalidate(4, right = $$props.right);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('format' in $$props) $$invalidate(5, format = $$props.format);
    		if ('amPmTabName' in $$props) $$invalidate(6, amPmTabName = $$props.amPmTabName);
    		if ('focus' in $$props) $$invalidate(10, focus = $$props.focus);
    		if ('hours' in $$props) $$invalidate(7, hours = $$props.hours);
    		if ('minutes' in $$props) $$invalidate(8, minutes = $$props.minutes);
    		if ('seconds' in $$props) $$invalidate(9, seconds = $$props.seconds);
    		if ('currentAmPm' in $$props) $$invalidate(11, currentAmPm = $$props.currentAmPm);
    		if ('readableFormat' in $$props) $$invalidate(12, readableFormat = $$props.readableFormat);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*format*/ 32) {
    			$$invalidate(12, readableFormat = format.replace('%H', 'HH').replace('%M', 'MM').replace('%S', 'SS').replace('%P', 'AM').replace('%p', 'am').replace('%%', '%'));
    		}

    		if ($$self.$$.dirty[0] & /*value*/ 1) {
    			$$invalidate(11, currentAmPm = value && (value.getHours() < 12 ? 'AM' : 'PM'));
    		}
    	};

    	return [
    		value,
    		_class,
    		inputClass,
    		top,
    		right,
    		format,
    		amPmTabName,
    		hours,
    		minutes,
    		seconds,
    		focus,
    		currentAmPm,
    		readableFormat,
    		f12hours,
    		hasSeconds,
    		setHours,
    		setMinutes,
    		setSeconds,
    		setToNow,
    		changeAmPm,
    		matchesCurrentHour,
    		toggleKeyboardListener,
    		slots,
    		focus_handler,
    		change_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		tab0_group_binding,
    		tab1_group_binding,
    		dropdownshell_open_binding,
    		$$scope
    	];
    }

    class Time_picker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$2,
    			create_fragment$2,
    			safe_not_equal,
    			{
    				class: 1,
    				inputClass: 2,
    				top: 3,
    				right: 4,
    				value: 0,
    				format: 5,
    				amPmTabName: 6,
    				hours: 7,
    				minutes: 8,
    				seconds: 9
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Time_picker",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get class() {
    		throw new Error("<Time_picker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Time_picker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputClass() {
    		throw new Error("<Time_picker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputClass(value) {
    		throw new Error("<Time_picker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get top() {
    		throw new Error("<Time_picker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set top(value) {
    		throw new Error("<Time_picker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get right() {
    		throw new Error("<Time_picker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set right(value) {
    		throw new Error("<Time_picker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Time_picker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Time_picker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get format() {
    		throw new Error("<Time_picker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set format(value) {
    		throw new Error("<Time_picker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get amPmTabName() {
    		throw new Error("<Time_picker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set amPmTabName(value) {
    		throw new Error("<Time_picker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hours() {
    		throw new Error("<Time_picker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hours(value) {
    		throw new Error("<Time_picker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minutes() {
    		throw new Error("<Time_picker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minutes(value) {
    		throw new Error("<Time_picker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get seconds() {
    		throw new Error("<Time_picker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set seconds(value) {
    		throw new Error("<Time_picker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var TimePicker = Time_picker;

    /* node_modules/attractions/form-field/form-field.svelte generated by Svelte v3.43.2 */
    const file$1 = "node_modules/attractions/form-field/form-field.svelte";
    const get_message_slot_changes = dirty => ({});
    const get_message_slot_context = ctx => ({});

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    const get_description_slot_changes = dirty => ({});
    const get_description_slot_context = ctx => ({});

    // (53:4) {#if name != null}
    function create_if_block_4(ctx) {
    	let label;
    	let t0;
    	let t1;
    	let label_class_value;
    	let if_block = /*required*/ ctx[6] && create_if_block_5(ctx);

    	const block = {
    		c: function create() {
    			label = element("label");
    			t0 = text(/*name*/ ctx[3]);
    			t1 = text(" ");
    			if (if_block) if_block.c();
    			attr_dev(label, "class", label_class_value = "" + (null_to_empty(classes('name', /*nameClass*/ ctx[1])) + " svelte-3y9l2h"));
    			attr_dev(label, "for", /*id*/ ctx[5]);
    			add_location(label, file$1, 53, 6, 1582);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			if (if_block) if_block.m(label, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*name*/ 8) set_data_dev(t0, /*name*/ ctx[3]);

    			if (/*required*/ ctx[6]) {
    				if (if_block) ; else {
    					if_block = create_if_block_5(ctx);
    					if_block.c();
    					if_block.m(label, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*nameClass*/ 2 && label_class_value !== (label_class_value = "" + (null_to_empty(classes('name', /*nameClass*/ ctx[1])) + " svelte-3y9l2h"))) {
    				attr_dev(label, "class", label_class_value);
    			}

    			if (dirty & /*id*/ 32) {
    				attr_dev(label, "for", /*id*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(53:4) {#if name != null}",
    		ctx
    	});

    	return block;
    }

    // (55:20) {#if required}
    function create_if_block_5(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "*";
    			attr_dev(span, "class", "required svelte-3y9l2h");
    			add_location(span, file$1, 54, 34, 1668);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(55:20) {#if required}",
    		ctx
    	});

    	return block;
    }

    // (58:4) {#if help != null}
    function create_if_block_3(ctx) {
    	let div;
    	let t;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*help*/ ctx[4]);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(classes('help', /*helpClass*/ ctx[2])) + " svelte-3y9l2h"));
    			add_location(div, file$1, 58, 6, 1759);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*help*/ 16) set_data_dev(t, /*help*/ ctx[4]);

    			if (dirty & /*helpClass*/ 4 && div_class_value !== (div_class_value = "" + (null_to_empty(classes('help', /*helpClass*/ ctx[2])) + " svelte-3y9l2h"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(58:4) {#if help != null}",
    		ctx
    	});

    	return block;
    }

    // (66:6) {#if error}
    function create_if_block_2(ctx) {
    	let div;
    	let t_value = /*error*/ ctx[11] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "message error svelte-3y9l2h");
    			add_location(div, file$1, 66, 8, 1952);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errors*/ 256 && t_value !== (t_value = /*error*/ ctx[11] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(66:6) {#if error}",
    		ctx
    	});

    	return block;
    }

    // (65:4) {#each errors as error}
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let if_block = /*error*/ ctx[11] && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*error*/ ctx[11]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(65:4) {#each errors as error}",
    		ctx
    	});

    	return block;
    }

    // (72:23) 
    function create_if_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Optional";
    			attr_dev(div, "class", "message info svelte-3y9l2h");
    			add_location(div, file$1, 72, 6, 2115);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(72:23) ",
    		ctx
    	});

    	return block;
    }

    // (70:4) {#if required}
    function create_if_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "* Required";
    			attr_dev(div, "class", "message info svelte-3y9l2h");
    			add_location(div, file$1, 70, 6, 2042);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(70:4) {#if required}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let div1;
    	let t3;
    	let t4;
    	let t5;
    	let div2_class_value;
    	let current;
    	let if_block0 = /*name*/ ctx[3] != null && create_if_block_4(ctx);
    	let if_block1 = /*help*/ ctx[4] != null && create_if_block_3(ctx);
    	const description_slot_template = /*#slots*/ ctx[10].description;
    	const description_slot = create_slot(description_slot_template, ctx, /*$$scope*/ ctx[9], get_description_slot_context);
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);
    	let each_value = /*errors*/ ctx[8];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	function select_block_type(ctx, dirty) {
    		if (/*required*/ ctx[6]) return create_if_block;
    		if (/*optional*/ ctx[7]) return create_if_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block2 = current_block_type && current_block_type(ctx);
    	const message_slot_template = /*#slots*/ ctx[10].message;
    	const message_slot = create_slot(message_slot_template, ctx, /*$$scope*/ ctx[9], get_message_slot_context);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (description_slot) description_slot.c();
    			t2 = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			if (if_block2) if_block2.c();
    			t5 = space();
    			if (message_slot) message_slot.c();
    			attr_dev(div0, "class", "description svelte-3y9l2h");
    			add_location(div0, file$1, 51, 2, 1527);
    			attr_dev(div1, "class", "field svelte-3y9l2h");
    			add_location(div1, file$1, 62, 2, 1865);
    			attr_dev(div2, "class", div2_class_value = "" + (null_to_empty(classes('form-field', /*_class*/ ctx[0])) + " svelte-3y9l2h"));
    			add_location(div2, file$1, 50, 0, 1481);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t0);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div0, t1);

    			if (description_slot) {
    				description_slot.m(div0, null);
    			}

    			append_dev(div2, t2);
    			append_dev(div2, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			append_dev(div1, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div1, t4);
    			if (if_block2) if_block2.m(div1, null);
    			append_dev(div1, t5);

    			if (message_slot) {
    				message_slot.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*name*/ ctx[3] != null) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(div0, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*help*/ ctx[4] != null) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					if_block1.m(div0, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (description_slot) {
    				if (description_slot.p && (!current || dirty & /*$$scope*/ 512)) {
    					update_slot_base(
    						description_slot,
    						description_slot_template,
    						ctx,
    						/*$$scope*/ ctx[9],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
    						: get_slot_changes(description_slot_template, /*$$scope*/ ctx[9], dirty, get_description_slot_changes),
    						get_description_slot_context
    					);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 512)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[9],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, null),
    						null
    					);
    				}
    			}

    			if (dirty & /*errors*/ 256) {
    				each_value = /*errors*/ ctx[8];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, t4);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if (if_block2) if_block2.d(1);
    				if_block2 = current_block_type && current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div1, t5);
    				}
    			}

    			if (message_slot) {
    				if (message_slot.p && (!current || dirty & /*$$scope*/ 512)) {
    					update_slot_base(
    						message_slot,
    						message_slot_template,
    						ctx,
    						/*$$scope*/ ctx[9],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
    						: get_slot_changes(message_slot_template, /*$$scope*/ ctx[9], dirty, get_message_slot_changes),
    						get_message_slot_context
    					);
    				}
    			}

    			if (!current || dirty & /*_class*/ 1 && div2_class_value !== (div2_class_value = "" + (null_to_empty(classes('form-field', /*_class*/ ctx[0])) + " svelte-3y9l2h"))) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(description_slot, local);
    			transition_in(default_slot, local);
    			transition_in(message_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(description_slot, local);
    			transition_out(default_slot, local);
    			transition_out(message_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (description_slot) description_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			destroy_each(each_blocks, detaching);

    			if (if_block2) {
    				if_block2.d();
    			}

    			if (message_slot) message_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Form_field', slots, ['description','default','message']);
    	let { class: _class = null } = $$props;
    	let { nameClass = null } = $$props;
    	let { helpClass = null } = $$props;
    	let { name = null } = $$props;
    	let { help = null } = $$props;
    	let { id = null } = $$props;
    	let { required = false } = $$props;
    	let { optional = false } = $$props;
    	let { errors = [] } = $$props;

    	const writable_props = [
    		'class',
    		'nameClass',
    		'helpClass',
    		'name',
    		'help',
    		'id',
    		'required',
    		'optional',
    		'errors'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Form_field> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(0, _class = $$props.class);
    		if ('nameClass' in $$props) $$invalidate(1, nameClass = $$props.nameClass);
    		if ('helpClass' in $$props) $$invalidate(2, helpClass = $$props.helpClass);
    		if ('name' in $$props) $$invalidate(3, name = $$props.name);
    		if ('help' in $$props) $$invalidate(4, help = $$props.help);
    		if ('id' in $$props) $$invalidate(5, id = $$props.id);
    		if ('required' in $$props) $$invalidate(6, required = $$props.required);
    		if ('optional' in $$props) $$invalidate(7, optional = $$props.optional);
    		if ('errors' in $$props) $$invalidate(8, errors = $$props.errors);
    		if ('$$scope' in $$props) $$invalidate(9, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		classes,
    		_class,
    		nameClass,
    		helpClass,
    		name,
    		help,
    		id,
    		required,
    		optional,
    		errors
    	});

    	$$self.$inject_state = $$props => {
    		if ('_class' in $$props) $$invalidate(0, _class = $$props._class);
    		if ('nameClass' in $$props) $$invalidate(1, nameClass = $$props.nameClass);
    		if ('helpClass' in $$props) $$invalidate(2, helpClass = $$props.helpClass);
    		if ('name' in $$props) $$invalidate(3, name = $$props.name);
    		if ('help' in $$props) $$invalidate(4, help = $$props.help);
    		if ('id' in $$props) $$invalidate(5, id = $$props.id);
    		if ('required' in $$props) $$invalidate(6, required = $$props.required);
    		if ('optional' in $$props) $$invalidate(7, optional = $$props.optional);
    		if ('errors' in $$props) $$invalidate(8, errors = $$props.errors);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		_class,
    		nameClass,
    		helpClass,
    		name,
    		help,
    		id,
    		required,
    		optional,
    		errors,
    		$$scope,
    		slots
    	];
    }

    class Form_field extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			class: 0,
    			nameClass: 1,
    			helpClass: 2,
    			name: 3,
    			help: 4,
    			id: 5,
    			required: 6,
    			optional: 7,
    			errors: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Form_field",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get class() {
    		throw new Error("<Form_field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Form_field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nameClass() {
    		throw new Error("<Form_field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nameClass(value) {
    		throw new Error("<Form_field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get helpClass() {
    		throw new Error("<Form_field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set helpClass(value) {
    		throw new Error("<Form_field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Form_field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Form_field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get help() {
    		throw new Error("<Form_field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set help(value) {
    		throw new Error("<Form_field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Form_field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Form_field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get required() {
    		throw new Error("<Form_field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set required(value) {
    		throw new Error("<Form_field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get optional() {
    		throw new Error("<Form_field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set optional(value) {
    		throw new Error("<Form_field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get errors() {
    		throw new Error("<Form_field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set errors(value) {
    		throw new Error("<Form_field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var FormField = Form_field;

    var bind = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return toString.call(val) === '[object Array]';
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    function isArrayBuffer(val) {
      return toString.call(val) === '[object ArrayBuffer]';
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(val) {
      return (typeof FormData !== 'undefined') && (val instanceof FormData);
    }

    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a plain Object
     *
     * @param {Object} val The value to test
     * @return {boolean} True if value is a plain Object, otherwise false
     */
    function isPlainObject(val) {
      if (toString.call(val) !== '[object Object]') {
        return false;
      }

      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }

    /**
     * Determine if a value is a Date
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    function isDate(val) {
      return toString.call(val) === '[object Date]';
    }

    /**
     * Determine if a value is a File
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    function isFile(val) {
      return toString.call(val) === '[object File]';
    }

    /**
     * Determine if a value is a Blob
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    function isBlob(val) {
      return toString.call(val) === '[object Blob]';
    }

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    function isURLSearchParams(val) {
      return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
    }

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     * @return {string} content value without BOM
     */
    function stripBOM(content) {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    }

    var utils = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isPlainObject: isPlainObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      extend: extend,
      trim: trim,
      stripBOM: stripBOM
    };

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected,
        synchronous: options ? options.synchronous : false,
        runWhen: options ? options.runWhen : null
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Update an Error with the specified config, error code, and response.
     *
     * @param {Error} error The error to update.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The error.
     */
    var enhanceError = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }

      error.request = request;
      error.response = response;
      error.isAxiosError = true;

      error.toJSON = function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code,
          status: this.response && this.response.status ? this.response.status : null
        };
      };
      return error;
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    var createError = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError(
          'Request failed with status code ' + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    var buildFullPath = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    /**
     * A `Cancel` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function Cancel(message) {
      this.message = message;
    }

    Cancel.prototype.toString = function toString() {
      return 'Cancel' + (this.message ? ': ' + this.message : '');
    };

    Cancel.prototype.__CANCEL__ = true;

    var Cancel_1 = Cancel;

    var defaults$1 = defaults_1;

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;
        var responseType = config.responseType;
        var onCanceled;
        function done() {
          if (config.cancelToken) {
            config.cancelToken.unsubscribe(onCanceled);
          }

          if (config.signal) {
            config.signal.removeEventListener('abort', onCanceled);
          }
        }

        if (utils.isFormData(requestData)) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        function onloadend() {
          if (!request) {
            return;
          }
          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
            request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(function _resolve(value) {
            resolve(value);
            done();
          }, function _reject(err) {
            reject(err);
            done();
          }, response);

          // Clean up request
          request = null;
        }

        if ('onloadend' in request) {
          // Use onloadend if available
          request.onloadend = onloadend;
        } else {
          // Listen for ready state to emulate onloadend
          request.onreadystatechange = function handleLoad() {
            if (!request || request.readyState !== 4) {
              return;
            }

            // The request errored out and we didn't get a response, this will be
            // handled by onerror instead
            // With one exception: request that using file: protocol, most browsers
            // will return status as 0 even though it's a successful request
            if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
              return;
            }
            // readystate handler is calling before onerror or ontimeout handlers,
            // so we should call onloadend on the next 'tick'
            setTimeout(onloadend);
          };
        }

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(createError('Request aborted', config, 'ECONNABORTED', request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(createError('Network Error', config, null, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
          var transitional = config.transitional || defaults$1.transitional;
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(createError(
            timeoutErrorMessage,
            config,
            transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
            cookies.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (responseType && responseType !== 'json') {
          request.responseType = config.responseType;
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken || config.signal) {
          // Handle cancellation
          // eslint-disable-next-line func-names
          onCanceled = function(cancel) {
            if (!request) {
              return;
            }
            reject(!cancel || (cancel && cancel.type) ? new Cancel_1('canceled') : cancel);
            request.abort();
            request = null;
          };

          config.cancelToken && config.cancelToken.subscribe(onCanceled);
          if (config.signal) {
            config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
          }
        }

        if (!requestData) {
          requestData = null;
        }

        // Send the request
        request.send(requestData);
      });
    };

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      }
      return adapter;
    }

    function stringifySafely(rawValue, parser, encoder) {
      if (utils.isString(rawValue)) {
        try {
          (parser || JSON.parse)(rawValue);
          return utils.trim(rawValue);
        } catch (e) {
          if (e.name !== 'SyntaxError') {
            throw e;
          }
        }
      }

      return (encoder || JSON.stringify)(rawValue);
    }

    var defaults = {

      transitional: {
        silentJSONParsing: true,
        forcedJSONParsing: true,
        clarifyTimeoutError: false
      },

      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');

        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }
        if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
          setContentTypeIfUnset(headers, 'application/json');
          return stringifySafely(data);
        }
        return data;
      }],

      transformResponse: [function transformResponse(data) {
        var transitional = this.transitional || defaults.transitional;
        var silentJSONParsing = transitional && transitional.silentJSONParsing;
        var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
        var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

        if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
          try {
            return JSON.parse(data);
          } catch (e) {
            if (strictJSONParsing) {
              if (e.name === 'SyntaxError') {
                throw enhanceError(e, this, 'E_JSON_PARSE');
              }
              throw e;
            }
          }
        }

        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      },

      headers: {
        common: {
          'Accept': 'application/json, text/plain, */*'
        }
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      var context = this || defaults$1;
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn.call(context, data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }

      if (config.signal && config.signal.aborted) {
        throw new Cancel_1('canceled');
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData.call(
        config,
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults$1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData.call(
          config,
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData.call(
              config,
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      function getMergedValue(target, source) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge(target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      // eslint-disable-next-line consistent-return
      function mergeDeepProperties(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(config1[prop], config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function valueFromConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(undefined, config2[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function defaultToConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(undefined, config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function mergeDirectKeys(prop) {
        if (prop in config2) {
          return getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      var mergeMap = {
        'url': valueFromConfig2,
        'method': valueFromConfig2,
        'data': valueFromConfig2,
        'baseURL': defaultToConfig2,
        'transformRequest': defaultToConfig2,
        'transformResponse': defaultToConfig2,
        'paramsSerializer': defaultToConfig2,
        'timeout': defaultToConfig2,
        'timeoutMessage': defaultToConfig2,
        'withCredentials': defaultToConfig2,
        'adapter': defaultToConfig2,
        'responseType': defaultToConfig2,
        'xsrfCookieName': defaultToConfig2,
        'xsrfHeaderName': defaultToConfig2,
        'onUploadProgress': defaultToConfig2,
        'onDownloadProgress': defaultToConfig2,
        'decompress': defaultToConfig2,
        'maxContentLength': defaultToConfig2,
        'maxBodyLength': defaultToConfig2,
        'transport': defaultToConfig2,
        'httpAgent': defaultToConfig2,
        'httpsAgent': defaultToConfig2,
        'cancelToken': defaultToConfig2,
        'socketPath': defaultToConfig2,
        'responseEncoding': defaultToConfig2,
        'validateStatus': mergeDirectKeys
      };

      utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
        var merge = mergeMap[prop] || mergeDeepProperties;
        var configValue = merge(prop);
        (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
      });

      return config;
    };

    var data = {
      "version": "0.23.0"
    };

    var VERSION = data.version;

    var validators$1 = {};

    // eslint-disable-next-line func-names
    ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
      validators$1[type] = function validator(thing) {
        return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
      };
    });

    var deprecatedWarnings = {};

    /**
     * Transitional option validator
     * @param {function|boolean?} validator - set to false if the transitional option has been removed
     * @param {string?} version - deprecated version / removed since version
     * @param {string?} message - some message with additional info
     * @returns {function}
     */
    validators$1.transitional = function transitional(validator, version, message) {
      function formatMessage(opt, desc) {
        return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
      }

      // eslint-disable-next-line func-names
      return function(value, opt, opts) {
        if (validator === false) {
          throw new Error(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')));
        }

        if (version && !deprecatedWarnings[opt]) {
          deprecatedWarnings[opt] = true;
          // eslint-disable-next-line no-console
          console.warn(
            formatMessage(
              opt,
              ' has been deprecated since v' + version + ' and will be removed in the near future'
            )
          );
        }

        return validator ? validator(value, opt, opts) : true;
      };
    };

    /**
     * Assert object's properties type
     * @param {object} options
     * @param {object} schema
     * @param {boolean?} allowUnknown
     */

    function assertOptions(options, schema, allowUnknown) {
      if (typeof options !== 'object') {
        throw new TypeError('options must be an object');
      }
      var keys = Object.keys(options);
      var i = keys.length;
      while (i-- > 0) {
        var opt = keys[i];
        var validator = schema[opt];
        if (validator) {
          var value = options[opt];
          var result = value === undefined || validator(value, opt, options);
          if (result !== true) {
            throw new TypeError('option ' + opt + ' must be ' + result);
          }
          continue;
        }
        if (allowUnknown !== true) {
          throw Error('Unknown option ' + opt);
        }
      }
    }

    var validator = {
      assertOptions: assertOptions,
      validators: validators$1
    };

    var validators = validator.validators;
    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof config === 'string') {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else {
        config = config || {};
      }

      config = mergeConfig(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      var transitional = config.transitional;

      if (transitional !== undefined) {
        validator.assertOptions(transitional, {
          silentJSONParsing: validators.transitional(validators.boolean),
          forcedJSONParsing: validators.transitional(validators.boolean),
          clarifyTimeoutError: validators.transitional(validators.boolean)
        }, false);
      }

      // filter out skipped interceptors
      var requestInterceptorChain = [];
      var synchronousRequestInterceptors = true;
      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
          return;
        }

        synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

        requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      var responseInterceptorChain = [];
      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
      });

      var promise;

      if (!synchronousRequestInterceptors) {
        var chain = [dispatchRequest, undefined];

        Array.prototype.unshift.apply(chain, requestInterceptorChain);
        chain = chain.concat(responseInterceptorChain);

        promise = Promise.resolve(config);
        while (chain.length) {
          promise = promise.then(chain.shift(), chain.shift());
        }

        return promise;
      }


      var newConfig = config;
      while (requestInterceptorChain.length) {
        var onFulfilled = requestInterceptorChain.shift();
        var onRejected = requestInterceptorChain.shift();
        try {
          newConfig = onFulfilled(newConfig);
        } catch (error) {
          onRejected(error);
          break;
        }
      }

      try {
        promise = dispatchRequest(newConfig);
      } catch (error) {
        return Promise.reject(error);
      }

      while (responseInterceptorChain.length) {
        promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: (config || {}).data
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, data, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });

    var Axios_1 = Axios;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;

      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;

      // eslint-disable-next-line func-names
      this.promise.then(function(cancel) {
        if (!token._listeners) return;

        var i;
        var l = token._listeners.length;

        for (i = 0; i < l; i++) {
          token._listeners[i](cancel);
        }
        token._listeners = null;
      });

      // eslint-disable-next-line func-names
      this.promise.then = function(onfulfilled) {
        var _resolve;
        // eslint-disable-next-line func-names
        var promise = new Promise(function(resolve) {
          token.subscribe(resolve);
          _resolve = resolve;
        }).then(onfulfilled);

        promise.cancel = function reject() {
          token.unsubscribe(_resolve);
        };

        return promise;
      };

      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new Cancel_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Subscribe to the cancel signal
     */

    CancelToken.prototype.subscribe = function subscribe(listener) {
      if (this.reason) {
        listener(this.reason);
        return;
      }

      if (this._listeners) {
        this._listeners.push(listener);
      } else {
        this._listeners = [listener];
      }
    };

    /**
     * Unsubscribe from the cancel signal
     */

    CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
      if (!this._listeners) {
        return;
      }
      var index = this._listeners.indexOf(listener);
      if (index !== -1) {
        this._listeners.splice(index, 1);
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    var isAxiosError = function isAxiosError(payload) {
      return (typeof payload === 'object') && (payload.isAxiosError === true);
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      // Factory for creating new instances
      instance.create = function create(instanceConfig) {
        return createInstance(mergeConfig(defaultConfig, instanceConfig));
      };

      return instance;
    }

    // Create the default instance to be exported
    var axios = createInstance(defaults$1);

    // Expose Axios class to allow class inheritance
    axios.Axios = Axios_1;

    // Expose Cancel & CancelToken
    axios.Cancel = Cancel_1;
    axios.CancelToken = CancelToken_1;
    axios.isCancel = isCancel;
    axios.VERSION = data.version;

    // Expose all/spread
    axios.all = function all(promises) {
      return Promise.all(promises);
    };
    axios.spread = spread;

    // Expose isAxiosError
    axios.isAxiosError = isAxiosError;

    var axios_1 = axios;

    // Allow use of default import syntax in TypeScript
    var _default = axios;
    axios_1.default = _default;

    const verstuur = async (data) => {
        console.log(data);
        fetch("/versturen", {
         
        // Adding method type
        method: "POST",
         
        // Adding body or contents to send
        body: JSON.stringify(data),
         
        // Adding headers to the request
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(r =>  r.json().then(data => {
        console.log(data);
        window.location.href = data.url;
    }))

            .catch((err) => {
              console.log(err);
              alert("je boeking is jammer genoeg niet gelukt, probeer het opnieuw");
            });
        };

    /* src/App.svelte generated by Svelte v3.43.2 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    // (90:4) <FormField   name="Aantal minuten"   required >
    function create_default_slot_5(ctx) {
    	let radiogroup;
    	let updating_value;
    	let current;

    	function radiogroup_value_binding(value) {
    		/*radiogroup_value_binding*/ ctx[10](value);
    	}

    	let radiogroup_props = { items: /*items*/ ctx[8], name: "numbers" };

    	if (/*minuten*/ ctx[4] !== void 0) {
    		radiogroup_props.value = /*minuten*/ ctx[4];
    	}

    	radiogroup = new RadioGroup({ props: radiogroup_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(radiogroup, 'value', radiogroup_value_binding));

    	const block = {
    		c: function create() {
    			create_component(radiogroup.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(radiogroup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const radiogroup_changes = {};

    			if (!updating_value && dirty & /*minuten*/ 16) {
    				updating_value = true;
    				radiogroup_changes.value = /*minuten*/ ctx[4];
    				add_flush_callback(() => updating_value = false);
    			}

    			radiogroup.$set(radiogroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(radiogroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(radiogroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(radiogroup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(90:4) <FormField   name=\\\"Aantal minuten\\\"   required >",
    		ctx
    	});

    	return block;
    }

    // (96:6) <FormField       name="Tijd"       help="Om welke tijd wil je gemasseerd worden?"       required     >
    function create_default_slot_4(ctx) {
    	let timepicker;
    	let updating_value;
    	let current;

    	function timepicker_value_binding(value) {
    		/*timepicker_value_binding*/ ctx[11](value);
    	}

    	let timepicker_props = { right: true };

    	if (/*tijd*/ ctx[0] !== void 0) {
    		timepicker_props.value = /*tijd*/ ctx[0];
    	}

    	timepicker = new TimePicker({ props: timepicker_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(timepicker, 'value', timepicker_value_binding));

    	const block = {
    		c: function create() {
    			create_component(timepicker.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(timepicker, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const timepicker_changes = {};

    			if (!updating_value && dirty & /*tijd*/ 1) {
    				updating_value = true;
    				timepicker_changes.value = /*tijd*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			timepicker.$set(timepicker_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(timepicker.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(timepicker.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(timepicker, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(96:6) <FormField       name=\\\"Tijd\\\"       help=\\\"Om welke tijd wil je gemasseerd worden?\\\"       required     >",
    		ctx
    	});

    	return block;
    }

    // (104:4) <FormField       name="Voornaam"       help="Met welke naam wordt je graag aangesproken?"       required     >
    function create_default_slot_3(ctx) {
    	let textfield;
    	let updating_value;
    	let current;

    	function textfield_value_binding(value) {
    		/*textfield_value_binding*/ ctx[12](value);
    	}

    	let textfield_props = {};

    	if (/*naam*/ ctx[1] !== void 0) {
    		textfield_props.value = /*naam*/ ctx[1];
    	}

    	textfield = new TextField({ props: textfield_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(textfield, 'value', textfield_value_binding));

    	const block = {
    		c: function create() {
    			create_component(textfield.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(textfield, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const textfield_changes = {};

    			if (!updating_value && dirty & /*naam*/ 2) {
    				updating_value = true;
    				textfield_changes.value = /*naam*/ ctx[1];
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield.$set(textfield_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(textfield, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(104:4) <FormField       name=\\\"Voornaam\\\"       help=\\\"Met welke naam wordt je graag aangesproken?\\\"       required     >",
    		ctx
    	});

    	return block;
    }

    // (111:4) <FormField       name="Email adress"       help="waar kan de bevestigingsmail heen?"       type="email"       required     >
    function create_default_slot_2(ctx) {
    	let textfield;
    	let updating_value;
    	let current;

    	function textfield_value_binding_1(value) {
    		/*textfield_value_binding_1*/ ctx[13](value);
    	}

    	let textfield_props = {};

    	if (/*email*/ ctx[2] !== void 0) {
    		textfield_props.value = /*email*/ ctx[2];
    	}

    	textfield = new TextField({ props: textfield_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(textfield, 'value', textfield_value_binding_1));

    	const block = {
    		c: function create() {
    			create_component(textfield.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(textfield, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const textfield_changes = {};

    			if (!updating_value && dirty & /*email*/ 4) {
    				updating_value = true;
    				textfield_changes.value = /*email*/ ctx[2];
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield.$set(textfield_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(textfield, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(111:4) <FormField       name=\\\"Email adress\\\"       help=\\\"waar kan de bevestigingsmail heen?\\\"       type=\\\"email\\\"       required     >",
    		ctx
    	});

    	return block;
    }

    // (119:4) <FormField       name="Telefoonnummer"       help="Als ik je niet kan vinden bel ik"       type="phone"       required     >
    function create_default_slot_1(ctx) {
    	let textfield;
    	let updating_value;
    	let current;

    	function textfield_value_binding_2(value) {
    		/*textfield_value_binding_2*/ ctx[14](value);
    	}

    	let textfield_props = {};

    	if (/*telefoon*/ ctx[3] !== void 0) {
    		textfield_props.value = /*telefoon*/ ctx[3];
    	}

    	textfield = new TextField({ props: textfield_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(textfield, 'value', textfield_value_binding_2));

    	const block = {
    		c: function create() {
    			create_component(textfield.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(textfield, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const textfield_changes = {};

    			if (!updating_value && dirty & /*telefoon*/ 8) {
    				updating_value = true;
    				textfield_changes.value = /*telefoon*/ ctx[3];
    				add_flush_callback(() => updating_value = false);
    			}

    			textfield.$set(textfield_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(textfield, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(119:4) <FormField       name=\\\"Telefoonnummer\\\"       help=\\\"Als ik je niet kan vinden bel ik\\\"       type=\\\"phone\\\"       required     >",
    		ctx
    	});

    	return block;
    }

    // (127:4) <Button on:click={verstuurSender} filled>
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Boeken");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(127:4) <Button on:click={verstuurSender} filled>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div;
    	let divider0;
    	let t0;
    	let table;
    	let t1;
    	let divider1;
    	let t2;
    	let formfield0;
    	let t3;
    	let formfield1;
    	let t4;
    	let formfield2;
    	let t5;
    	let formfield3;
    	let t6;
    	let formfield4;
    	let t7;
    	let button;
    	let current;

    	divider0 = new Divider$1({
    			props: { text: "Massage rooster" },
    			$$inline: true
    		});

    	table = new Table$1({
    			props: {
    				id: "table",
    				headers: /*columns*/ ctx[6],
    				items: /*rows*/ ctx[5]
    			},
    			$$inline: true
    		});

    	divider1 = new Divider$1({
    			props: { text: "Bestel hier uw massage!" },
    			$$inline: true
    		});

    	formfield0 = new FormField({
    			props: {
    				name: "Aantal minuten",
    				required: true,
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	formfield1 = new FormField({
    			props: {
    				name: "Tijd",
    				help: "Om welke tijd wil je gemasseerd worden?",
    				required: true,
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	formfield2 = new FormField({
    			props: {
    				name: "Voornaam",
    				help: "Met welke naam wordt je graag aangesproken?",
    				required: true,
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	formfield3 = new FormField({
    			props: {
    				name: "Email adress",
    				help: "waar kan de bevestigingsmail heen?",
    				type: "email",
    				required: true,
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	formfield4 = new FormField({
    			props: {
    				name: "Telefoonnummer",
    				help: "Als ik je niet kan vinden bel ik",
    				type: "phone",
    				required: true,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button = new Button$1({
    			props: {
    				filled: true,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*verstuurSender*/ ctx[7]);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			create_component(divider0.$$.fragment);
    			t0 = space();
    			create_component(table.$$.fragment);
    			t1 = space();
    			create_component(divider1.$$.fragment);
    			t2 = space();
    			create_component(formfield0.$$.fragment);
    			t3 = space();
    			create_component(formfield1.$$.fragment);
    			t4 = space();
    			create_component(formfield2.$$.fragment);
    			t5 = space();
    			create_component(formfield3.$$.fragment);
    			t6 = space();
    			create_component(formfield4.$$.fragment);
    			t7 = space();
    			create_component(button.$$.fragment);
    			attr_dev(div, "class", "centerdiv");
    			add_location(div, file, 85, 2, 1842);
    			attr_dev(main, "class", "svelte-tedyij");
    			add_location(main, file, 84, 0, 1833);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			mount_component(divider0, div, null);
    			append_dev(div, t0);
    			mount_component(table, div, null);
    			append_dev(div, t1);
    			mount_component(divider1, div, null);
    			append_dev(div, t2);
    			mount_component(formfield0, div, null);
    			append_dev(div, t3);
    			mount_component(formfield1, div, null);
    			append_dev(div, t4);
    			mount_component(formfield2, div, null);
    			append_dev(div, t5);
    			mount_component(formfield3, div, null);
    			append_dev(div, t6);
    			mount_component(formfield4, div, null);
    			append_dev(div, t7);
    			mount_component(button, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const table_changes = {};
    			if (dirty & /*rows*/ 32) table_changes.items = /*rows*/ ctx[5];
    			table.$set(table_changes);
    			const formfield0_changes = {};

    			if (dirty & /*$$scope, minuten*/ 2097168) {
    				formfield0_changes.$$scope = { dirty, ctx };
    			}

    			formfield0.$set(formfield0_changes);
    			const formfield1_changes = {};

    			if (dirty & /*$$scope, tijd*/ 2097153) {
    				formfield1_changes.$$scope = { dirty, ctx };
    			}

    			formfield1.$set(formfield1_changes);
    			const formfield2_changes = {};

    			if (dirty & /*$$scope, naam*/ 2097154) {
    				formfield2_changes.$$scope = { dirty, ctx };
    			}

    			formfield2.$set(formfield2_changes);
    			const formfield3_changes = {};

    			if (dirty & /*$$scope, email*/ 2097156) {
    				formfield3_changes.$$scope = { dirty, ctx };
    			}

    			formfield3.$set(formfield3_changes);
    			const formfield4_changes = {};

    			if (dirty & /*$$scope, telefoon*/ 2097160) {
    				formfield4_changes.$$scope = { dirty, ctx };
    			}

    			formfield4.$set(formfield4_changes);
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 2097152) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(divider0.$$.fragment, local);
    			transition_in(table.$$.fragment, local);
    			transition_in(divider1.$$.fragment, local);
    			transition_in(formfield0.$$.fragment, local);
    			transition_in(formfield1.$$.fragment, local);
    			transition_in(formfield2.$$.fragment, local);
    			transition_in(formfield3.$$.fragment, local);
    			transition_in(formfield4.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(divider0.$$.fragment, local);
    			transition_out(table.$$.fragment, local);
    			transition_out(divider1.$$.fragment, local);
    			transition_out(formfield0.$$.fragment, local);
    			transition_out(formfield1.$$.fragment, local);
    			transition_out(formfield2.$$.fragment, local);
    			transition_out(formfield3.$$.fragment, local);
    			transition_out(formfield4.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(divider0);
    			destroy_component(table);
    			destroy_component(divider1);
    			destroy_component(formfield0);
    			destroy_component(formfield1);
    			destroy_component(formfield2);
    			destroy_component(formfield3);
    			destroy_component(formfield4);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	var emailVal = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    	var telefoonVal = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    	let { name } = $$props;

    	let tijd = new Date(Date.now()),
    		naam,
    		body,
    		email = "",
    		telefoon,
    		minuten = 15,
    		modalOpen,
    		prijs;

    	let rows = [];

    	const columns = [
    		{ text: 'naam', value: 'naam' },
    		{ text: 'tijd', value: 'tijd' },
    		{
    			text: 'minuten',
    			value: 'minuten',
    			align: 'end'
    		}
    	];

    	onMount(async () => {
    		const res = await fetch("/boekingen");
    		$$invalidate(5, rows = await res.json());
    		console.log(rows);
    	});

    	function verstuurSender() {
    		items.forEach(item => {
    			if (item.value == minuten) {
    				prijs = item.price;
    			}
    		});

    		body = {
    			minuten,
    			tijd,
    			naam,
    			email,
    			telefoon,
    			prijs
    		};

    		if (checkData(body)) {
    			verstuur(body);
    		}
    	}

    	function checkData(body) {
    		if (!!!body.minuten) {
    			alert("vul minuten in");
    			return false;
    		}

    		if (!!!body.naam) {
    			alert("vul naam in");
    			return false;
    		}

    		if (!emailVal.exec(body.email)) {
    			alert("vul email in");
    			return false;
    		}

    		if (!telefoonVal.exec(body.telefoon)) {
    			alert("vul telefoonnummer in");
    			return false;
    		}

    		return true;
    	}

    	const items = [
    		{
    			value: 10,
    			label: '10 Minuten',
    			price: 20
    		},
    		{
    			value: 15,
    			label: '15 Minuten',
    			price: 25
    		},
    		{
    			value: 30,
    			label: "30 Minuten",
    			price: 50
    		}
    	];

    	const writable_props = ['name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function radiogroup_value_binding(value) {
    		minuten = value;
    		$$invalidate(4, minuten);
    	}

    	function timepicker_value_binding(value) {
    		tijd = value;
    		$$invalidate(0, tijd);
    	}

    	function textfield_value_binding(value) {
    		naam = value;
    		$$invalidate(1, naam);
    	}

    	function textfield_value_binding_1(value) {
    		email = value;
    		$$invalidate(2, email);
    	}

    	function textfield_value_binding_2(value) {
    		telefoon = value;
    		$$invalidate(3, telefoon);
    	}

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(9, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		TimePicker,
    		FormField,
    		Button: Button$1,
    		RadioGroup,
    		Modal: Modal$1,
    		Dialog: Dialog$1,
    		TextField,
    		Divider: Divider$1,
    		Table: Table$1,
    		onMount,
    		emailVal,
    		telefoonVal,
    		verstuur,
    		name,
    		tijd,
    		naam,
    		body,
    		email,
    		telefoon,
    		minuten,
    		modalOpen,
    		prijs,
    		rows,
    		columns,
    		verstuurSender,
    		checkData,
    		items
    	});

    	$$self.$inject_state = $$props => {
    		if ('emailVal' in $$props) emailVal = $$props.emailVal;
    		if ('telefoonVal' in $$props) telefoonVal = $$props.telefoonVal;
    		if ('name' in $$props) $$invalidate(9, name = $$props.name);
    		if ('tijd' in $$props) $$invalidate(0, tijd = $$props.tijd);
    		if ('naam' in $$props) $$invalidate(1, naam = $$props.naam);
    		if ('body' in $$props) body = $$props.body;
    		if ('email' in $$props) $$invalidate(2, email = $$props.email);
    		if ('telefoon' in $$props) $$invalidate(3, telefoon = $$props.telefoon);
    		if ('minuten' in $$props) $$invalidate(4, minuten = $$props.minuten);
    		if ('modalOpen' in $$props) modalOpen = $$props.modalOpen;
    		if ('prijs' in $$props) prijs = $$props.prijs;
    		if ('rows' in $$props) $$invalidate(5, rows = $$props.rows);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		tijd,
    		naam,
    		email,
    		telefoon,
    		minuten,
    		rows,
    		columns,
    		verstuurSender,
    		items,
    		name,
    		radiogroup_value_binding,
    		timepicker_value_binding,
    		textfield_value_binding,
    		textfield_value_binding_1,
    		textfield_value_binding_2
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { name: 9 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[9] === undefined && !('name' in props)) {
    			console_1.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
