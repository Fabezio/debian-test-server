
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
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
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
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
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
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
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
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
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
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
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
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
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.23.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
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
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const users = writable([
      {
        name: "fabezio",
        group: 'wheel',
        avatar: 'Terminal-icon.png',
        root: true,
        job: 'administrator',
        hobbies: ['space science', 'infotech'],
        adage: "we are only stardust"
      }
    ]);

    const images = readable([
      '1920x1080.png',
      'Abstract Shapes 2.jpg',
      'Abstract Shapes.jpg',
      'Chroma 1.jpg',
      'Chroma 2.jpg',
      'Flower 1.jpg',
      'Flower 2.jpg',
      'Flower 3.jpg',
      'Flower 4.jpg',
      'Mojave Day.jpg',
      'Mojave Night.jpg'
    ]);
    const sudoImg = readable([
      'debian10.jpg',
      'debian10_2.jpg',
      'debian10_3.jpg',
      // 'bash_oblique.jpg'
    ]);

    /* src/Layouts/Navbar.svelte generated by Svelte v3.23.2 */

    const file = "src/Layouts/Navbar.svelte";

    function create_fragment(ctx) {
    	let nav;
    	let ul;
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;
    	let t3;
    	let li2;
    	let a2;
    	let t5;
    	let li3;
    	let a3;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "A propos";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Changements";
    			t3 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Documentation";
    			t5 = space();
    			li3 = element("li");
    			a3 = element("a");
    			a3.textContent = "Problèmes";
    			attr_dev(a0, "class", "nav-link active svelte-kaz2wz");
    			attr_dev(a0, "href", "#about");
    			add_location(a0, file, 2, 23, 131);
    			attr_dev(li0, "class", "nav-item svelte-kaz2wz");
    			add_location(li0, file, 2, 2, 110);
    			attr_dev(a1, "class", "nav-link svelte-kaz2wz");
    			attr_dev(a1, "href", "#changes");
    			add_location(a1, file, 3, 23, 213);
    			attr_dev(li1, "class", "nav-item svelte-kaz2wz");
    			add_location(li1, file, 3, 2, 192);
    			attr_dev(a2, "class", "nav-link svelte-kaz2wz");
    			attr_dev(a2, "href", "#docroot");
    			add_location(a2, file, 4, 23, 293);
    			attr_dev(li2, "class", "nav-item svelte-kaz2wz");
    			add_location(li2, file, 4, 2, 272);
    			attr_dev(a3, "class", "nav-link svelte-kaz2wz");
    			attr_dev(a3, "href", "#bugs");
    			add_location(a3, file, 5, 23, 375);
    			attr_dev(li3, "class", "nav-item svelte-kaz2wz");
    			add_location(li3, file, 5, 2, 354);
    			attr_dev(ul, "class", "nav justify-content-center sticky-top mb-5 bg-light svelte-kaz2wz");
    			attr_dev(ul, "id", "top");
    			add_location(ul, file, 1, 2, 34);
    			attr_dev(nav, "class", "glass box-shadow svelte-kaz2wz");
    			add_location(nav, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(ul, t5);
    			append_dev(ul, li3);
    			append_dev(li3, a3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
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

    function instance($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", $$slots, []);
    	return [];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/Layouts/Footer.svelte generated by Svelte v3.23.2 */

    const file$1 = "src/Layouts/Footer.svelte";

    function create_fragment$1(ctx) {
    	let footer;
    	let span0;
    	let t1;
    	let span1;
    	let t3;
    	let span2;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			span0 = element("span");
    			span0.textContent = "debian server";
    			t1 = space();
    			span1 = element("span");
    			span1.textContent = "©";
    			t3 = space();
    			span2 = element("span");
    			span2.textContent = `${new Date().getFullYear()}`;
    			attr_dev(span0, "class", "svelte-6xslaz");
    			add_location(span0, file$1, 5, 2, 54);
    			attr_dev(span1, "class", "svelte-6xslaz");
    			add_location(span1, file$1, 6, 2, 83);
    			attr_dev(span2, "class", "svelte-6xslaz");
    			add_location(span2, file$1, 7, 2, 105);
    			attr_dev(footer, "class", "glass  svelte-6xslaz");
    			add_location(footer, file$1, 4, 0, 28);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, span0);
    			append_dev(footer, t1);
    			append_dev(footer, span1);
    			append_dev(footer, t3);
    			append_dev(footer, span2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
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

    function instance$1($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Footer", $$slots, []);
    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/UI/Card.svelte generated by Svelte v3.23.2 */

    const file$2 = "src/UI/Card.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "card glass border");
    			add_location(div, file$2, 4, 0, 25);
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
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
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
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
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
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Card", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, $$slots];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/UI/Modal.svelte generated by Svelte v3.23.2 */

    const file$3 = "src/UI/Modal.svelte";
    const get_footer_slot_changes = dirty => ({});
    const get_footer_slot_context = ctx => ({});
    const get_content_slot_changes = dirty => ({});
    const get_content_slot_context = ctx => ({});
    const get_title_slot_changes = dirty => ({});
    const get_title_slot_context = ctx => ({});

    function create_fragment$3(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let header;
    	let t1;
    	let body;
    	let t2;
    	let footer;
    	let current;
    	const title_slot_template = /*$$slots*/ ctx[1].title;
    	const title_slot = create_slot(title_slot_template, ctx, /*$$scope*/ ctx[0], get_title_slot_context);
    	const content_slot_template = /*$$slots*/ ctx[1].content;
    	const content_slot = create_slot(content_slot_template, ctx, /*$$scope*/ ctx[0], get_content_slot_context);
    	const footer_slot_template = /*$$slots*/ ctx[1].footer;
    	const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[0], get_footer_slot_context);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			header = element("header");
    			if (title_slot) title_slot.c();
    			t1 = space();
    			body = element("body");
    			if (content_slot) content_slot.c();
    			t2 = space();
    			footer = element("footer");
    			if (footer_slot) footer_slot.c();
    			attr_dev(div0, "class", "backdrop svelte-1ffx416");
    			add_location(div0, file$3, 4, 0, 46);
    			attr_dev(header, "class", "svelte-1ffx416");
    			add_location(header, file$3, 6, 2, 98);
    			attr_dev(body, "class", "svelte-1ffx416");
    			add_location(body, file$3, 11, 2, 156);
    			attr_dev(footer, "class", "svelte-1ffx416");
    			add_location(footer, file$3, 15, 2, 211);
    			attr_dev(div1, "class", "modal");
    			add_location(div1, file$3, 5, 0, 75);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, header);

    			if (title_slot) {
    				title_slot.m(header, null);
    			}

    			append_dev(div1, t1);
    			append_dev(div1, body);

    			if (content_slot) {
    				content_slot.m(body, null);
    			}

    			append_dev(div1, t2);
    			append_dev(div1, footer);

    			if (footer_slot) {
    				footer_slot.m(footer, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (title_slot) {
    				if (title_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(title_slot, title_slot_template, ctx, /*$$scope*/ ctx[0], dirty, get_title_slot_changes, get_title_slot_context);
    				}
    			}

    			if (content_slot) {
    				if (content_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(content_slot, content_slot_template, ctx, /*$$scope*/ ctx[0], dirty, get_content_slot_changes, get_content_slot_context);
    				}
    			}

    			if (footer_slot) {
    				if (footer_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(footer_slot, footer_slot_template, ctx, /*$$scope*/ ctx[0], dirty, get_footer_slot_changes, get_footer_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title_slot, local);
    			transition_in(content_slot, local);
    			transition_in(footer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title_slot, local);
    			transition_out(content_slot, local);
    			transition_out(footer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (title_slot) title_slot.d(detaching);
    			if (content_slot) content_slot.d(detaching);
    			if (footer_slot) footer_slot.d(detaching);
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

    function instance$3($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Modal", $$slots, ['title','content','footer']);

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, $$slots];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.23.2 */

    const { console: console_1 } = globals;
    const file$4 = "src/App.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[31] = list[i];
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (92:1) {:else}
    function create_else_block(ctx) {
    	let navbar;
    	let t0;
    	let header;
    	let h1;
    	let t1;
    	let t2;
    	let section;
    	let div;
    	let card;
    	let t3;
    	let t4;
    	let t5;
    	let footer;
    	let current;
    	navbar = new Navbar({ $$inline: true });

    	card = new Card({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block0 = /*root*/ ctx[1] && create_if_block_2(ctx);
    	let if_block1 = /*dispModal*/ ctx[11] && create_if_block_1(ctx);
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			header = element("header");
    			h1 = element("h1");
    			t1 = text(/*pagename*/ ctx[0]);
    			t2 = space();
    			section = element("section");
    			div = element("div");
    			create_component(card.$$.fragment);
    			t3 = space();
    			if (if_block0) if_block0.c();
    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(h1, "class", "");
    			add_location(h1, file$4, 95, 3, 2208);
    			attr_dev(header, "class", "svelte-13g73zy");
    			add_location(header, file$4, 94, 2, 2194);
    			attr_dev(div, "class", "group svelte-13g73zy");
    			add_location(div, file$4, 98, 3, 2265);
    			add_location(section, file$4, 97, 2, 2251);
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    			append_dev(h1, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			mount_component(card, div, null);
    			append_dev(div, t3);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(section, t4);
    			if (if_block1) if_block1.m(section, null);
    			insert_dev(target, t5, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*pagename*/ 1) set_data_dev(t1, /*pagename*/ ctx[0]);
    			const card_changes = {};

    			if (dirty[0] & /*isOn, isOK, alerts, root, user*/ 32798 | dirty[1] & /*$$scope*/ 8) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);

    			if (/*root*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*root*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*dispModal*/ ctx[11]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*dispModal*/ 2048) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(section, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(card.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(card.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(section);
    			destroy_component(card);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t5);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(92:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (68:1) {#if !upSigned}
    function create_if_block(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				$$slots: {
    					default: [create_default_slot],
    					footer: [create_footer_slot],
    					content: [create_content_slot],
    					title: [create_title_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};

    			if (dirty[0] & /*upSigned, quotation, value, hobbies, job, username*/ 2016 | dirty[1] & /*$$scope*/ 8) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(68:1) {#if !upSigned}",
    		ctx
    	});

    	return block;
    }

    // (103:5) {#if alerts }
    function create_if_block_3(ctx) {
    	let div;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*alerts*/ ctx[4]);
    			attr_dev(div, "class", "alert svelte-13g73zy");
    			add_location(div, file$4, 103, 6, 2552);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*handleAlert*/ ctx[18], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*alerts*/ 16) set_data_dev(t, /*alerts*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(103:5) {#if alerts }",
    		ctx
    	});

    	return block;
    }

    // (100:4) <Card>
    function create_default_slot_3(ctx) {
    	let p0;
    	let t0;
    	let span0;
    	let t1;
    	let t2_value = (/*root*/ ctx[1] ? " (admin)" : "") + "";
    	let t2;
    	let span0_class_value;
    	let t3;
    	let p1;
    	let t4;
    	let span1;
    	let t5_value = (/*root*/ ctx[1] ? "root" : "normal") + "";
    	let t5;
    	let span1_class_value;
    	let t6;
    	let t7;
    	let p2;
    	let t8;
    	let span2;
    	let t9_value = (/*isOK*/ ctx[2] ? "OK" : "failed") + "";
    	let t9;
    	let span2_class_value;
    	let t10;
    	let p3;
    	let t11;
    	let span3;
    	let t12_value = (/*isOn*/ ctx[3] ? "on" : "off") + "";
    	let t12;
    	let span3_class_value;
    	let mounted;
    	let dispose;
    	let if_block = /*alerts*/ ctx[4] && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			t0 = text("user:  ");
    			span0 = element("span");
    			t1 = text(/*user*/ ctx[15]);
    			t2 = text(t2_value);
    			t3 = space();
    			p1 = element("p");
    			t4 = text("privileges:  ");
    			span1 = element("span");
    			t5 = text(t5_value);
    			t6 = space();
    			if (if_block) if_block.c();
    			t7 = space();
    			p2 = element("p");
    			t8 = text("test: ");
    			span2 = element("span");
    			t9 = text(t9_value);
    			t10 = space();
    			p3 = element("p");
    			t11 = text("status: ");
    			span3 = element("span");
    			t12 = text(t12_value);
    			attr_dev(span0, "class", span0_class_value = "" + (null_to_empty(/*user*/ ctx[15] !== "---" ? "on" : "off") + " svelte-13g73zy"));
    			add_location(span0, file$4, 100, 16, 2312);
    			attr_dev(p0, "class", "svelte-13g73zy");
    			add_location(p0, file$4, 100, 5, 2301);
    			attr_dev(span1, "class", span1_class_value = "" + (null_to_empty(/*root*/ ctx[1] ? "on" : "off") + " svelte-13g73zy"));
    			add_location(span1, file$4, 101, 51, 2449);
    			attr_dev(p1, "class", "svelte-13g73zy");
    			add_location(p1, file$4, 101, 5, 2403);
    			attr_dev(span2, "class", span2_class_value = "" + (null_to_empty(/*isOK*/ ctx[2] ? "on" : "off") + " svelte-13g73zy"));
    			add_location(span2, file$4, 105, 44, 2664);
    			attr_dev(p2, "class", "svelte-13g73zy");
    			add_location(p2, file$4, 105, 5, 2625);
    			attr_dev(span3, "class", span3_class_value = "" + (null_to_empty(/*isOn*/ ctx[3] ? "on" : "off") + " svelte-13g73zy"));
    			add_location(span3, file$4, 106, 46, 2781);
    			attr_dev(p3, "class", "svelte-13g73zy");
    			add_location(p3, file$4, 106, 5, 2740);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t0);
    			append_dev(p0, span0);
    			append_dev(span0, t1);
    			append_dev(span0, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t4);
    			append_dev(p1, span1);
    			append_dev(span1, t5);
    			insert_dev(target, t6, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, p2, anchor);
    			append_dev(p2, t8);
    			append_dev(p2, span2);
    			append_dev(span2, t9);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, p3, anchor);
    			append_dev(p3, t11);
    			append_dev(p3, span3);
    			append_dev(span3, t12);

    			if (!mounted) {
    				dispose = [
    					listen_dev(p1, "click", /*click_handler_1*/ ctx[24], false, false, false),
    					listen_dev(p2, "click", /*click_handler_2*/ ctx[25], false, false, false),
    					listen_dev(p3, "click", /*click_handler_3*/ ctx[26], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*user*/ 32768) set_data_dev(t1, /*user*/ ctx[15]);
    			if (dirty[0] & /*root*/ 2 && t2_value !== (t2_value = (/*root*/ ctx[1] ? " (admin)" : "") + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*user*/ 32768 && span0_class_value !== (span0_class_value = "" + (null_to_empty(/*user*/ ctx[15] !== "---" ? "on" : "off") + " svelte-13g73zy"))) {
    				attr_dev(span0, "class", span0_class_value);
    			}

    			if (dirty[0] & /*root*/ 2 && t5_value !== (t5_value = (/*root*/ ctx[1] ? "root" : "normal") + "")) set_data_dev(t5, t5_value);

    			if (dirty[0] & /*root*/ 2 && span1_class_value !== (span1_class_value = "" + (null_to_empty(/*root*/ ctx[1] ? "on" : "off") + " svelte-13g73zy"))) {
    				attr_dev(span1, "class", span1_class_value);
    			}

    			if (/*alerts*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					if_block.m(t7.parentNode, t7);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*isOK*/ 4 && t9_value !== (t9_value = (/*isOK*/ ctx[2] ? "OK" : "failed") + "")) set_data_dev(t9, t9_value);

    			if (dirty[0] & /*isOK*/ 4 && span2_class_value !== (span2_class_value = "" + (null_to_empty(/*isOK*/ ctx[2] ? "on" : "off") + " svelte-13g73zy"))) {
    				attr_dev(span2, "class", span2_class_value);
    			}

    			if (dirty[0] & /*isOn*/ 8 && t12_value !== (t12_value = (/*isOn*/ ctx[3] ? "on" : "off") + "")) set_data_dev(t12, t12_value);

    			if (dirty[0] & /*isOn*/ 8 && span3_class_value !== (span3_class_value = "" + (null_to_empty(/*isOn*/ ctx[3] ? "on" : "off") + " svelte-13g73zy"))) {
    				attr_dev(span3, "class", span3_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t6);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(p3);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(100:4) <Card>",
    		ctx
    	});

    	return block;
    }

    // (111:4) {#if root}
    function create_if_block_2(ctx) {
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const card_changes = {};

    			if (dirty[0] & /*dispModal*/ 2048 | dirty[1] & /*$$scope*/ 8) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(111:4) {#if root}",
    		ctx
    	});

    	return block;
    }

    // (112:5) <Card>
    function create_default_slot_2(ctx) {
    	let p0;
    	let t1;
    	let p1;
    	let t3;
    	let p2;
    	let t5;
    	let p3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			p0.textContent = "add user";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "see user info";
    			t3 = space();
    			p2 = element("p");
    			p2.textContent = "update user";
    			t5 = space();
    			p3 = element("p");
    			p3.textContent = "delete user";
    			attr_dev(p0, "class", "svelte-13g73zy");
    			add_location(p0, file$4, 112, 6, 2903);
    			attr_dev(p1, "class", "svelte-13g73zy");
    			add_location(p1, file$4, 113, 6, 2925);
    			attr_dev(p2, "class", "svelte-13g73zy");
    			add_location(p2, file$4, 114, 6, 2986);
    			attr_dev(p3, "class", "svelte-13g73zy");
    			add_location(p3, file$4, 115, 6, 3011);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p3, anchor);

    			if (!mounted) {
    				dispose = listen_dev(p1, "click", /*click_handler_4*/ ctx[27], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p3);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(112:5) <Card>",
    		ctx
    	});

    	return block;
    }

    // (121:3) {#if dispModal}
    function create_if_block_1(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				dispModal: /*dispModal*/ ctx[11],
    				$$slots: {
    					default: [create_default_slot_1],
    					footer: [create_footer_slot_1],
    					content: [create_content_slot_1],
    					title: [create_title_slot_1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};
    			if (dirty[0] & /*dispModal*/ 2048) modal_changes.dispModal = /*dispModal*/ ctx[11];

    			if (dirty[0] & /*dispModal, $users*/ 18432 | dirty[1] & /*$$scope*/ 8) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(121:3) {#if dispModal}",
    		ctx
    	});

    	return block;
    }

    // (123:5) <div slot="title" class="title">
    function create_title_slot_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "User Info";
    			attr_dev(div, "slot", "title");
    			attr_dev(div, "class", "title svelte-13g73zy");
    			add_location(div, file$4, 122, 5, 3112);
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
    		id: create_title_slot_1.name,
    		type: "slot",
    		source: "(123:5) <div slot=\\\"title\\\" class=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (137:9) {#each user.hobbies as hobby}
    function create_each_block_1(ctx) {
    	let br;
    	let t0;
    	let t1_value = /*hobby*/ ctx[31] + "";
    	let t1;

    	const block = {
    		c: function create() {
    			br = element("br");
    			t0 = text("- ");
    			t1 = text(t1_value);
    			add_location(br, file$4, 137, 10, 3565);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$users*/ 16384 && t1_value !== (t1_value = /*hobby*/ ctx[31] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(137:9) {#each user.hobbies as hobby}",
    		ctx
    	});

    	return block;
    }

    // (127:6) {#each $users as user}
    function create_each_block(ctx) {
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let p0;
    	let t1;
    	let t2_value = /*user*/ ctx[15].name + "";
    	let t2;
    	let t3;
    	let p1;
    	let t4;
    	let t5_value = /*user*/ ctx[15].group + "";
    	let t5;
    	let t6;
    	let p2;
    	let t7;
    	let t8_value = /*user*/ ctx[15].job + "";
    	let t8;
    	let t9;
    	let p3;
    	let t10;
    	let t11;
    	let p4;
    	let t12;
    	let q;
    	let t13_value = /*user*/ ctx[15].adage + "";
    	let t13;
    	let t14;
    	let each_value_1 = /*user*/ ctx[15].hobbies;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			p0 = element("p");
    			t1 = text("Name: ");
    			t2 = text(t2_value);
    			t3 = space();
    			p1 = element("p");
    			t4 = text("Group: ");
    			t5 = text(t5_value);
    			t6 = space();
    			p2 = element("p");
    			t7 = text("Job: ");
    			t8 = text(t8_value);
    			t9 = space();
    			p3 = element("p");
    			t10 = text("Hobbies:\n\t\t\t\t\t\t\t\t\t");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t11 = space();
    			p4 = element("p");
    			t12 = text("Favorite sentence: \n\t\t\t\t\t\t\t\t\t");
    			q = element("q");
    			t13 = text(t13_value);
    			t14 = space();
    			if (img.src !== (img_src_value = "./logos/" + /*user*/ ctx[15].avatar)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-13g73zy");
    			add_location(img, file$4, 129, 9, 3305);
    			attr_dev(div0, "class", "img svelte-13g73zy");
    			add_location(div0, file$4, 128, 8, 3278);
    			attr_dev(p0, "class", "svelte-13g73zy");
    			add_location(p0, file$4, 132, 9, 3399);
    			attr_dev(p1, "class", "svelte-13g73zy");
    			add_location(p1, file$4, 133, 9, 3434);
    			attr_dev(p2, "class", "svelte-13g73zy");
    			add_location(p2, file$4, 134, 9, 3471);
    			attr_dev(p3, "class", "svelte-13g73zy");
    			add_location(p3, file$4, 135, 9, 3504);
    			add_location(q, file$4, 141, 9, 3651);
    			attr_dev(p4, "class", "svelte-13g73zy");
    			add_location(p4, file$4, 140, 9, 3619);
    			attr_dev(div1, "class", "list svelte-13g73zy");
    			add_location(div1, file$4, 131, 8, 3371);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, img);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p0);
    			append_dev(p0, t1);
    			append_dev(p0, t2);
    			append_dev(div1, t3);
    			append_dev(div1, p1);
    			append_dev(p1, t4);
    			append_dev(p1, t5);
    			append_dev(div1, t6);
    			append_dev(div1, p2);
    			append_dev(p2, t7);
    			append_dev(p2, t8);
    			append_dev(div1, t9);
    			append_dev(div1, p3);
    			append_dev(p3, t10);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(p3, null);
    			}

    			append_dev(div1, t11);
    			append_dev(div1, p4);
    			append_dev(p4, t12);
    			append_dev(p4, q);
    			append_dev(q, t13);
    			append_dev(div1, t14);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$users*/ 16384 && img.src !== (img_src_value = "./logos/" + /*user*/ ctx[15].avatar)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*$users*/ 16384 && t2_value !== (t2_value = /*user*/ ctx[15].name + "")) set_data_dev(t2, t2_value);
    			if (dirty[0] & /*$users*/ 16384 && t5_value !== (t5_value = /*user*/ ctx[15].group + "")) set_data_dev(t5, t5_value);
    			if (dirty[0] & /*$users*/ 16384 && t8_value !== (t8_value = /*user*/ ctx[15].job + "")) set_data_dev(t8, t8_value);

    			if (dirty[0] & /*$users*/ 16384) {
    				each_value_1 = /*user*/ ctx[15].hobbies;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(p3, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty[0] & /*$users*/ 16384 && t13_value !== (t13_value = /*user*/ ctx[15].adage + "")) set_data_dev(t13, t13_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(127:6) {#each $users as user}",
    		ctx
    	});

    	return block;
    }

    // (126:5) <div slot="content" class="data">
    function create_content_slot_1(ctx) {
    	let div;
    	let each_value = /*$users*/ ctx[14];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "slot", "content");
    			attr_dev(div, "class", "data");
    			add_location(div, file$4, 125, 5, 3178);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$users*/ 16384) {
    				each_value = /*$users*/ ctx[14];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot_1.name,
    		type: "slot",
    		source: "(126:5) <div slot=\\\"content\\\" class=\\\"data\\\">",
    		ctx
    	});

    	return block;
    }

    // (148:5) <div slot="footer">
    function create_footer_slot_1(ctx) {
    	let div;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "close";
    			attr_dev(button, "class", "svelte-13g73zy");
    			add_location(button, file$4, 148, 6, 3765);
    			attr_dev(div, "slot", "footer");
    			add_location(div, file$4, 147, 5, 3739);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_5*/ ctx[28], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_footer_slot_1.name,
    		type: "slot",
    		source: "(148:5) <div slot=\\\"footer\\\">",
    		ctx
    	});

    	return block;
    }

    // (122:4) <Modal {dispModal}>
    function create_default_slot_1(ctx) {
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(122:4) <Modal {dispModal}>",
    		ctx
    	});

    	return block;
    }

    // (71:4) <div class="title" slot='title'>
    function create_title_slot(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Fill the form below then click the Sign up button";
    			attr_dev(div, "class", "title svelte-13g73zy");
    			attr_dev(div, "slot", "title");
    			add_location(div, file$4, 70, 4, 1472);
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
    		id: create_title_slot.name,
    		type: "slot",
    		source: "(71:4) <div class=\\\"title\\\" slot='title'>",
    		ctx
    	});

    	return block;
    }

    // (76:4) <div slot='content'>
    function create_content_slot(ctx) {
    	let div;
    	let form;
    	let input0;
    	let t0;
    	let t1;
    	let t2;
    	let br0;
    	let t3;
    	let input1;
    	let t4;
    	let t5;
    	let t6;
    	let br1;
    	let t7;
    	let input2;
    	let t8;
    	let t9;
    	let t10;
    	let br2;
    	let t11;
    	let textarea;
    	let t12;
    	let t13;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			form = element("form");
    			input0 = element("input");
    			t0 = space();
    			t1 = text(/*username*/ ctx[5]);
    			t2 = space();
    			br0 = element("br");
    			t3 = space();
    			input1 = element("input");
    			t4 = space();
    			t5 = text(/*job*/ ctx[6]);
    			t6 = space();
    			br1 = element("br");
    			t7 = space();
    			input2 = element("input");
    			t8 = space();
    			t9 = text(/*hobbies*/ ctx[7]);
    			t10 = space();
    			br2 = element("br");
    			t11 = space();
    			textarea = element("textarea");
    			t12 = space();
    			t13 = text(/*quotation*/ ctx[9]);
    			attr_dev(input0, "cols", "30");
    			attr_dev(input0, "placeholder", "name:");
    			add_location(input0, file$4, 78, 6, 1680);
    			add_location(br0, file$4, 79, 17, 1757);
    			attr_dev(input1, "placeholder", "job:");
    			add_location(input1, file$4, 80, 6, 1768);
    			add_location(br1, file$4, 81, 12, 1824);
    			attr_dev(input2, "placeholder", "hobbies:");
    			add_location(input2, file$4, 82, 6, 1835);
    			add_location(br2, file$4, 83, 16, 1903);
    			attr_dev(textarea, "name", "");
    			attr_dev(textarea, "id", "");
    			attr_dev(textarea, "cols", "30");
    			attr_dev(textarea, "rows", "2");
    			attr_dev(textarea, "placeholder", "quotation here");
    			add_location(textarea, file$4, 84, 6, 1914);
    			attr_dev(form, "action", "");
    			add_location(form, file$4, 76, 5, 1650);
    			attr_dev(div, "slot", "content");
    			add_location(div, file$4, 75, 4, 1624);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, form);
    			append_dev(form, input0);
    			set_input_value(input0, /*username*/ ctx[5]);
    			append_dev(form, t0);
    			append_dev(form, t1);
    			append_dev(form, t2);
    			append_dev(form, br0);
    			append_dev(form, t3);
    			append_dev(form, input1);
    			set_input_value(input1, /*job*/ ctx[6]);
    			append_dev(form, t4);
    			append_dev(form, t5);
    			append_dev(form, t6);
    			append_dev(form, br1);
    			append_dev(form, t7);
    			append_dev(form, input2);
    			set_input_value(input2, /*hobbies*/ ctx[7]);
    			append_dev(form, t8);
    			append_dev(form, t9);
    			append_dev(form, t10);
    			append_dev(form, br2);
    			append_dev(form, t11);
    			append_dev(form, textarea);
    			set_input_value(textarea, /*value*/ ctx[8]);
    			append_dev(form, t12);
    			append_dev(form, t13);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[19]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[20]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[21]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[22])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*username*/ 32 && input0.value !== /*username*/ ctx[5]) {
    				set_input_value(input0, /*username*/ ctx[5]);
    			}

    			if (dirty[0] & /*username*/ 32) set_data_dev(t1, /*username*/ ctx[5]);

    			if (dirty[0] & /*job*/ 64 && input1.value !== /*job*/ ctx[6]) {
    				set_input_value(input1, /*job*/ ctx[6]);
    			}

    			if (dirty[0] & /*job*/ 64) set_data_dev(t5, /*job*/ ctx[6]);

    			if (dirty[0] & /*hobbies*/ 128 && input2.value !== /*hobbies*/ ctx[7]) {
    				set_input_value(input2, /*hobbies*/ ctx[7]);
    			}

    			if (dirty[0] & /*hobbies*/ 128) set_data_dev(t9, /*hobbies*/ ctx[7]);

    			if (dirty[0] & /*value*/ 256) {
    				set_input_value(textarea, /*value*/ ctx[8]);
    			}

    			if (dirty[0] & /*quotation*/ 512) set_data_dev(t13, /*quotation*/ ctx[9]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot.name,
    		type: "slot",
    		source: "(76:4) <div slot='content'>",
    		ctx
    	});

    	return block;
    }

    // (90:4) <button slot='footer' on:click={() => upSigned = true}>
    function create_footer_slot(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Sign up";
    			attr_dev(button, "slot", "footer");
    			attr_dev(button, "class", "svelte-13g73zy");
    			add_location(button, file$4, 89, 4, 2056);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[23], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_footer_slot.name,
    		type: "slot",
    		source: "(90:4) <button slot='footer' on:click={() => upSigned = true}>",
    		ctx
    	});

    	return block;
    }

    // (70:3) <Modal>
    function create_default_slot(ctx) {
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(70:3) <Modal>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let t0;
    	let t1;
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*upSigned*/ ctx[10]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			t0 = text(/*pagename*/ ctx[0]);
    			t1 = space();
    			main = element("main");
    			if_block.c();

    			set_style(main, "background-image", "url('./img/" + (/*root*/ ctx[1]
    			? /*$sudoImg*/ ctx[13][/*rndRootImg*/ ctx[17]]
    			: /*$images*/ ctx[12][/*rndImg*/ ctx[16]]) + "'");

    			attr_dev(main, "class", "svelte-13g73zy");
    			add_location(main, file$4, 64, 0, 1319);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);
    			if_blocks[current_block_type_index].m(main, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*pagename*/ 1) set_data_dev(t0, /*pagename*/ ctx[0]);
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
    				}

    				transition_in(if_block, 1);
    				if_block.m(main, null);
    			}

    			if (!current || dirty[0] & /*root, $sudoImg, $images*/ 12290) {
    				set_style(main, "background-image", "url('./img/" + (/*root*/ ctx[1]
    				? /*$sudoImg*/ ctx[13][/*rndRootImg*/ ctx[17]]
    				: /*$images*/ ctx[12][/*rndImg*/ ctx[16]]) + "'");
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
    			detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main);
    			if_blocks[current_block_type_index].d();
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

    function checkStatus() {
    	
    } // if (!root) {
    // 	user = normal

    function instance$4($$self, $$props, $$invalidate) {
    	let $images;
    	let $sudoImg;
    	let $users;
    	validate_store(images, "images");
    	component_subscribe($$self, images, $$value => $$invalidate(12, $images = $$value));
    	validate_store(sudoImg, "sudoImg");
    	component_subscribe($$self, sudoImg, $$value => $$invalidate(13, $sudoImg = $$value));
    	validate_store(users, "users");
    	component_subscribe($$self, users, $$value => $$invalidate(14, $users = $$value));
    	let { pagename } = $$props;
    	let user = "sudo";
    	let root = true;
    	let isOK = true;
    	let isOn = true;
    	let alerts;
    	let username = "";
    	let job = "";

    	// let privileges = ''
    	let hobbies = "";

    	let value = "";
    	let quotation = "";

    	// let username = ''
    	let upSigned = true;

    	let rndImg = Math.floor(Math.random() * $images.length);
    	let rndRootImg = Math.floor(Math.random() * $sudoImg.length);
    	let dispModal = false;

    	// }
    	function handleAlert() {
    		$$invalidate(4, alerts = "");
    		$$invalidate(2, isOK = true);
    	}

    	const writable_props = ["pagename"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	function input0_input_handler() {
    		username = this.value;
    		$$invalidate(5, username);
    	}

    	function input1_input_handler() {
    		job = this.value;
    		$$invalidate(6, job);
    	}

    	function input2_input_handler() {
    		hobbies = this.value;
    		$$invalidate(7, hobbies);
    	}

    	function textarea_input_handler() {
    		value = this.value;
    		$$invalidate(8, value);
    	}

    	const click_handler = () => $$invalidate(10, upSigned = true);
    	const click_handler_1 = () => $$invalidate(1, root = !root);
    	const click_handler_2 = () => $$invalidate(2, isOK = !isOK);
    	const click_handler_3 = () => $$invalidate(3, isOn = !isOn);
    	const click_handler_4 = () => $$invalidate(11, dispModal = true);
    	const click_handler_5 = () => $$invalidate(11, dispModal = false);

    	$$self.$set = $$props => {
    		if ("pagename" in $$props) $$invalidate(0, pagename = $$props.pagename);
    	};

    	$$self.$capture_state = () => ({
    		users,
    		images,
    		sudoImg,
    		Navbar,
    		Footer,
    		Card,
    		Modal,
    		pagename,
    		user,
    		root,
    		isOK,
    		isOn,
    		alerts,
    		username,
    		job,
    		hobbies,
    		value,
    		quotation,
    		upSigned,
    		rndImg,
    		rndRootImg,
    		dispModal,
    		checkStatus,
    		handleAlert,
    		$images,
    		$sudoImg,
    		$users
    	});

    	$$self.$inject_state = $$props => {
    		if ("pagename" in $$props) $$invalidate(0, pagename = $$props.pagename);
    		if ("user" in $$props) $$invalidate(15, user = $$props.user);
    		if ("root" in $$props) $$invalidate(1, root = $$props.root);
    		if ("isOK" in $$props) $$invalidate(2, isOK = $$props.isOK);
    		if ("isOn" in $$props) $$invalidate(3, isOn = $$props.isOn);
    		if ("alerts" in $$props) $$invalidate(4, alerts = $$props.alerts);
    		if ("username" in $$props) $$invalidate(5, username = $$props.username);
    		if ("job" in $$props) $$invalidate(6, job = $$props.job);
    		if ("hobbies" in $$props) $$invalidate(7, hobbies = $$props.hobbies);
    		if ("value" in $$props) $$invalidate(8, value = $$props.value);
    		if ("quotation" in $$props) $$invalidate(9, quotation = $$props.quotation);
    		if ("upSigned" in $$props) $$invalidate(10, upSigned = $$props.upSigned);
    		if ("rndImg" in $$props) $$invalidate(16, rndImg = $$props.rndImg);
    		if ("rndRootImg" in $$props) $$invalidate(17, rndRootImg = $$props.rndRootImg);
    		if ("dispModal" in $$props) $$invalidate(11, dispModal = $$props.dispModal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*value*/ 256) {
    			 if (value.length) $$invalidate(9, quotation = value);
    		}

    		if ($$self.$$.dirty[0] & /*user*/ 32768) {
    			// $: console.log(images.length, rndImg)
    			// $: {if(root) adminUser 
    			// 		else user }
    			 {
    				if (!user.length) {
    					$$invalidate(15, user = "---");
    					$$invalidate(1, root = false);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*isOK*/ 4) {
    			 {
    				if (!isOK) {
    					$$invalidate(3, isOn = false);
    					$$invalidate(4, alerts = "!");
    				} else {
    					$$invalidate(3, isOn = true);
    					$$invalidate(4, alerts = null);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$users*/ 16384) {
    			 console.log($users);
    		}

    		if ($$self.$$.dirty[0] & /*upSigned*/ 1024) {
    			 if (!upSigned) console.log("You have to sign up to get minimum privileges.");
    		}
    	};

    	return [
    		pagename,
    		root,
    		isOK,
    		isOn,
    		alerts,
    		username,
    		job,
    		hobbies,
    		value,
    		quotation,
    		upSigned,
    		dispModal,
    		$images,
    		$sudoImg,
    		$users,
    		user,
    		rndImg,
    		rndRootImg,
    		handleAlert,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		textarea_input_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { pagename: 0 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*pagename*/ ctx[0] === undefined && !("pagename" in props)) {
    			console_1.warn("<App> was created without expected prop 'pagename'");
    		}
    	}

    	get pagename() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pagename(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		pagename: "Page d'accueil test serveur (localhost)"
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
