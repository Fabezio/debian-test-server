
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
    			add_location(a0, file, 2, 23, 119);
    			attr_dev(li0, "class", "nav-item svelte-kaz2wz");
    			add_location(li0, file, 2, 2, 98);
    			attr_dev(a1, "class", "nav-link svelte-kaz2wz");
    			attr_dev(a1, "href", "#changes");
    			add_location(a1, file, 3, 23, 201);
    			attr_dev(li1, "class", "nav-item svelte-kaz2wz");
    			add_location(li1, file, 3, 2, 180);
    			attr_dev(a2, "class", "nav-link svelte-kaz2wz");
    			attr_dev(a2, "href", "#docroot");
    			add_location(a2, file, 4, 23, 281);
    			attr_dev(li2, "class", "nav-item svelte-kaz2wz");
    			add_location(li2, file, 4, 2, 260);
    			attr_dev(a3, "class", "nav-link svelte-kaz2wz");
    			attr_dev(a3, "href", "#bugs");
    			add_location(a3, file, 5, 23, 363);
    			attr_dev(li3, "class", "nav-item svelte-kaz2wz");
    			add_location(li3, file, 5, 2, 342);
    			attr_dev(ul, "class", "nav justify-content-center sticky-top mb-5 bg-light svelte-kaz2wz");
    			attr_dev(ul, "id", "top");
    			add_location(ul, file, 1, 2, 22);
    			attr_dev(nav, "class", "glass svelte-kaz2wz");
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
    			add_location(span0, file$1, 5, 2, 53);
    			attr_dev(span1, "class", "svelte-6xslaz");
    			add_location(span1, file$1, 6, 2, 82);
    			attr_dev(span2, "class", "svelte-6xslaz");
    			add_location(span2, file$1, 7, 2, 104);
    			attr_dev(footer, "class", "glass svelte-6xslaz");
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
    			attr_dev(div, "class", "card glass border svelte-jzupq5");
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

    function create_fragment$3(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let header;
    	let h2;
    	let t2;
    	let hr0;
    	let t3;
    	let body;
    	let t4;
    	let t5;
    	let t6;
    	let hr1;
    	let t7;
    	let footer;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			header = element("header");
    			h2 = element("h2");
    			h2.textContent = "Title";
    			t2 = space();
    			hr0 = element("hr");
    			t3 = space();
    			body = element("body");
    			t4 = text("Modal status: ");
    			t5 = text(/*dispModal*/ ctx[0]);
    			t6 = space();
    			hr1 = element("hr");
    			t7 = space();
    			footer = element("footer");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "backdrop svelte-1wkxrpd");
    			add_location(div0, file$3, 4, 0, 43);
    			add_location(h2, file$3, 7, 4, 109);
    			add_location(header, file$3, 6, 2, 96);
    			attr_dev(hr0, "class", "svelte-1wkxrpd");
    			add_location(hr0, file$3, 9, 2, 139);
    			attr_dev(body, "class", "svelte-1wkxrpd");
    			add_location(body, file$3, 10, 2, 146);
    			attr_dev(hr1, "class", "svelte-1wkxrpd");
    			add_location(hr1, file$3, 13, 2, 193);
    			attr_dev(footer, "class", "svelte-1wkxrpd");
    			add_location(footer, file$3, 14, 2, 200);
    			attr_dev(div1, "class", "window svelte-1wkxrpd");
    			add_location(div1, file$3, 5, 0, 72);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, header);
    			append_dev(header, h2);
    			append_dev(div1, t2);
    			append_dev(div1, hr0);
    			append_dev(div1, t3);
    			append_dev(div1, body);
    			append_dev(body, t4);
    			append_dev(body, t5);
    			append_dev(div1, t6);
    			append_dev(div1, hr1);
    			append_dev(div1, t7);
    			append_dev(div1, footer);

    			if (default_slot) {
    				default_slot.m(footer, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*dispModal*/ 1) set_data_dev(t5, /*dispModal*/ ctx[0]);

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
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
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
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
    	let { dispModal } = $$props;
    	const writable_props = ["dispModal"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Modal", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("dispModal" in $$props) $$invalidate(0, dispModal = $$props.dispModal);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ dispModal });

    	$$self.$inject_state = $$props => {
    		if ("dispModal" in $$props) $$invalidate(0, dispModal = $$props.dispModal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [dispModal, $$scope, $$slots];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { dispModal: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*dispModal*/ ctx[0] === undefined && !("dispModal" in props)) {
    			console.warn("<Modal> was created without expected prop 'dispModal'");
    		}
    	}

    	get dispModal() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dispModal(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.23.2 */

    const { console: console_1 } = globals;
    const file$4 = "src/App.svelte";

    // (79:3) {#if alerts }
    function create_if_block_2(ctx) {
    	let div;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*alerts*/ ctx[4]);
    			attr_dev(div, "class", "alert svelte-1uhglgl");
    			add_location(div, file$4, 79, 4, 1679);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*handleAlert*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*alerts*/ 16) set_data_dev(t, /*alerts*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(79:3) {#if alerts }",
    		ctx
    	});

    	return block;
    }

    // (76:2) <Card mode="glass">
    function create_default_slot_2(ctx) {
    	let p0;
    	let t0;
    	let span0;
    	let t1;
    	let t2_value = (/*root*/ ctx[1] ? " (admin)" : "") + "";
    	let t2;
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
    	let if_block = /*alerts*/ ctx[4] && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			t0 = text("user:  ");
    			span0 = element("span");
    			t1 = text(/*user*/ ctx[6]);
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
    			attr_dev(span0, "class", "on svelte-1uhglgl");
    			add_location(span0, file$4, 76, 14, 1472);
    			attr_dev(p0, "class", "svelte-1uhglgl");
    			add_location(p0, file$4, 76, 3, 1461);
    			attr_dev(span1, "class", span1_class_value = "" + (null_to_empty(/*root*/ ctx[1] ? "on" : "off") + " svelte-1uhglgl"));
    			add_location(span1, file$4, 77, 49, 1580);
    			attr_dev(p1, "class", "svelte-1uhglgl");
    			add_location(p1, file$4, 77, 3, 1534);
    			attr_dev(span2, "class", span2_class_value = "" + (null_to_empty(/*isOK*/ ctx[2] ? "on" : "off") + " svelte-1uhglgl"));
    			add_location(span2, file$4, 81, 42, 1787);
    			attr_dev(p2, "class", "svelte-1uhglgl");
    			add_location(p2, file$4, 81, 3, 1748);
    			attr_dev(span3, "class", span3_class_value = "" + (null_to_empty(/*isOn*/ ctx[3] ? "on" : "off") + " svelte-1uhglgl"));
    			add_location(span3, file$4, 82, 44, 1902);
    			attr_dev(p3, "class", "svelte-1uhglgl");
    			add_location(p3, file$4, 82, 3, 1861);
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
    					listen_dev(p1, "click", /*click_handler*/ ctx[12], false, false, false),
    					listen_dev(p2, "click", /*click_handler_1*/ ctx[13], false, false, false),
    					listen_dev(p3, "click", /*click_handler_2*/ ctx[14], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*root*/ 2 && t2_value !== (t2_value = (/*root*/ ctx[1] ? " (admin)" : "") + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*root*/ 2 && t5_value !== (t5_value = (/*root*/ ctx[1] ? "root" : "normal") + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*root*/ 2 && span1_class_value !== (span1_class_value = "" + (null_to_empty(/*root*/ ctx[1] ? "on" : "off") + " svelte-1uhglgl"))) {
    				attr_dev(span1, "class", span1_class_value);
    			}

    			if (/*alerts*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(t7.parentNode, t7);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*isOK*/ 4 && t9_value !== (t9_value = (/*isOK*/ ctx[2] ? "OK" : "failed") + "")) set_data_dev(t9, t9_value);

    			if (dirty & /*isOK*/ 4 && span2_class_value !== (span2_class_value = "" + (null_to_empty(/*isOK*/ ctx[2] ? "on" : "off") + " svelte-1uhglgl"))) {
    				attr_dev(span2, "class", span2_class_value);
    			}

    			if (dirty & /*isOn*/ 8 && t12_value !== (t12_value = (/*isOn*/ ctx[3] ? "on" : "off") + "")) set_data_dev(t12, t12_value);

    			if (dirty & /*isOn*/ 8 && span3_class_value !== (span3_class_value = "" + (null_to_empty(/*isOn*/ ctx[3] ? "on" : "off") + " svelte-1uhglgl"))) {
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
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(76:2) <Card mode=\\\"glass\\\">",
    		ctx
    	});

    	return block;
    }

    // (87:2) {#if root}
    function create_if_block_1(ctx) {
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				mode: "glass border",
    				$$slots: { default: [create_default_slot_1] },
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

    			if (dirty & /*$$scope, dispModal*/ 131104) {
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(87:2) {#if root}",
    		ctx
    	});

    	return block;
    }

    // (88:3) <Card mode="glass border">
    function create_default_slot_1(ctx) {
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
    			attr_dev(p0, "class", "svelte-1uhglgl");
    			add_location(p0, file$4, 88, 4, 2032);
    			attr_dev(p1, "class", "svelte-1uhglgl");
    			add_location(p1, file$4, 89, 4, 2052);
    			attr_dev(p2, "class", "svelte-1uhglgl");
    			add_location(p2, file$4, 90, 4, 2111);
    			attr_dev(p3, "class", "svelte-1uhglgl");
    			add_location(p3, file$4, 91, 4, 2134);
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
    				dispose = listen_dev(p1, "click", /*click_handler_3*/ ctx[15], false, false, false);
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
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(88:3) <Card mode=\\\"glass border\\\">",
    		ctx
    	});

    	return block;
    }

    // (98:2) {#if dispModal}
    function create_if_block(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				dispModal: /*dispModal*/ ctx[5],
    				$$slots: { default: [create_default_slot] },
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
    			if (dirty & /*dispModal*/ 32) modal_changes.dispModal = /*dispModal*/ ctx[5];

    			if (dirty & /*$$scope, dispModal*/ 131104) {
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
    		source: "(98:2) {#if dispModal}",
    		ctx
    	});

    	return block;
    }

    // (99:3) <Modal {dispModal}>
    function create_default_slot(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "close";
    			add_location(button, file$4, 99, 4, 2233);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_4*/ ctx[16], false, false, false);
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
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(99:3) <Modal {dispModal}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let t0;
    	let t1;
    	let main;
    	let navbar;
    	let t2;
    	let header;
    	let h1;
    	let t3;
    	let t4;
    	let section;
    	let div;
    	let card;
    	let t5;
    	let t6;
    	let t7;
    	let footer;
    	let current;

    	navbar = new Navbar({
    			props: { mode: "glass border" },
    			$$inline: true
    		});

    	card = new Card({
    			props: {
    				mode: "glass",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block0 = /*root*/ ctx[1] && create_if_block_1(ctx);
    	let if_block1 = /*dispModal*/ ctx[5] && create_if_block(ctx);
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			t0 = text(/*name*/ ctx[0]);
    			t1 = space();
    			main = element("main");
    			create_component(navbar.$$.fragment);
    			t2 = space();
    			header = element("header");
    			h1 = element("h1");
    			t3 = text(/*name*/ ctx[0]);
    			t4 = space();
    			section = element("section");
    			div = element("div");
    			create_component(card.$$.fragment);
    			t5 = space();
    			if (if_block0) if_block0.c();
    			t6 = space();
    			if (if_block1) if_block1.c();
    			t7 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(h1, "class", "");
    			add_location(h1, file$4, 71, 2, 1366);
    			attr_dev(header, "class", "svelte-1uhglgl");
    			add_location(header, file$4, 70, 1, 1353);
    			attr_dev(div, "class", "group svelte-1uhglgl");
    			add_location(div, file$4, 74, 2, 1416);
    			attr_dev(section, "class", "svelte-1uhglgl");
    			add_location(section, file$4, 73, 1, 1403);

    			set_style(main, "background-image", "url('./build/img/" + (/*root*/ ctx[1]
    			? /*sudoImg*/ ctx[8][/*rndRootImg*/ ctx[10]]
    			: /*images*/ ctx[7][/*rndImg*/ ctx[9]]) + "'");

    			attr_dev(main, "class", "svelte-1uhglgl");
    			add_location(main, file$4, 66, 0, 1220);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(navbar, main, null);
    			append_dev(main, t2);
    			append_dev(main, header);
    			append_dev(header, h1);
    			append_dev(h1, t3);
    			append_dev(main, t4);
    			append_dev(main, section);
    			append_dev(section, div);
    			mount_component(card, div, null);
    			append_dev(div, t5);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(section, t6);
    			if (if_block1) if_block1.m(section, null);
    			append_dev(main, t7);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);
    			if (!current || dirty & /*name*/ 1) set_data_dev(t3, /*name*/ ctx[0]);
    			const card_changes = {};

    			if (dirty & /*$$scope, isOn, isOK, alerts, root*/ 131102) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);

    			if (/*root*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*root*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
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

    			if (/*dispModal*/ ctx[5]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*dispModal*/ 32) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block(ctx);
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

    			if (!current || dirty & /*root*/ 2) {
    				set_style(main, "background-image", "url('./build/img/" + (/*root*/ ctx[1]
    				? /*sudoImg*/ ctx[8][/*rndRootImg*/ ctx[10]]
    				: /*images*/ ctx[7][/*rndImg*/ ctx[9]]) + "'");
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
    			detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main);
    			destroy_component(navbar);
    			destroy_component(card);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(footer);
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
    	let { name } = $$props;
    	let user = "fabezio";
    	let root = true;
    	let isOK = true;
    	let isOn = true;
    	let alerts;

    	let images = [
    		"1920x1080.png",
    		"Abstract Shapes 2.jpg",
    		"Abstract Shapes.jpg",
    		"Chroma 1.jpg",
    		"Chroma 2.jpg",
    		"Flower 1.jpg",
    		"Flower 2.jpg",
    		"Flower 3.jpg",
    		"Flower 4.jpg",
    		"Mojave Day.jpg",
    		"Mojave Night.jpg"
    	]; // 'debian10_grey.jpg',

    	let sudoImg = [
    		"debian10.jpg",
    		// 'debian10.jpg',
    		"debian10_2.jpg",
    		"debian10_3.jpg",
    		"bash_oblique.jpg"
    	];

    	let rndImg = Math.floor(Math.random() * images.length);
    	let rndRootImg = Math.floor(Math.random() * sudoImg.length);
    	let dispModal = false;

    	// }
    	function handleAlert() {
    		$$invalidate(4, alerts = "");
    		$$invalidate(2, isOK = true);
    	}

    	const writable_props = ["name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	const click_handler = () => $$invalidate(1, root = !root);
    	const click_handler_1 = () => $$invalidate(2, isOK = !isOK);
    	const click_handler_2 = () => $$invalidate(3, isOn = !isOn);
    	const click_handler_3 = () => $$invalidate(5, dispModal = true);
    	const click_handler_4 = () => $$invalidate(5, dispModal = false);

    	$$self.$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		Navbar,
    		Footer,
    		Card,
    		Modal,
    		name,
    		user,
    		root,
    		isOK,
    		isOn,
    		alerts,
    		images,
    		sudoImg,
    		rndImg,
    		rndRootImg,
    		dispModal,
    		checkStatus,
    		handleAlert
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("user" in $$props) $$invalidate(6, user = $$props.user);
    		if ("root" in $$props) $$invalidate(1, root = $$props.root);
    		if ("isOK" in $$props) $$invalidate(2, isOK = $$props.isOK);
    		if ("isOn" in $$props) $$invalidate(3, isOn = $$props.isOn);
    		if ("alerts" in $$props) $$invalidate(4, alerts = $$props.alerts);
    		if ("images" in $$props) $$invalidate(7, images = $$props.images);
    		if ("sudoImg" in $$props) $$invalidate(8, sudoImg = $$props.sudoImg);
    		if ("rndImg" in $$props) $$invalidate(9, rndImg = $$props.rndImg);
    		if ("rndRootImg" in $$props) $$invalidate(10, rndRootImg = $$props.rndRootImg);
    		if ("dispModal" in $$props) $$invalidate(5, dispModal = $$props.dispModal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isOK*/ 4) {
    			// $: {if(root) adminUser 
    			// 		else user }
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
    	};

    	 console.log(images.length, rndImg);

    	return [
    		name,
    		root,
    		isOK,
    		isOn,
    		alerts,
    		dispModal,
    		user,
    		images,
    		sudoImg,
    		rndImg,
    		rndRootImg,
    		handleAlert,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
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
    		name: "Page d'accueil test serveur (localhost)"
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
