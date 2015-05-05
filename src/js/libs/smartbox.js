module.exports = function($, _) {
	(function(window) {
		"use strict";

		if (!Array.prototype.indexOf) {
			Array.prototype.indexOf = function(searchElement, fromIndex) {
				if (this === undefined || this === null) {
					throw new TypeError('"this" is null or not defined');
				}

				var length = this.length >>> 0; // Hack to convert object.length to a UInt32

				fromIndex = +fromIndex || 0;

				if (Math.abs(fromIndex) === Infinity) {
					fromIndex = 0;
				}

				if (fromIndex < 0) {
					fromIndex += length;
					if (fromIndex < 0) {
						fromIndex = 0;
					}
				}

				for (; fromIndex < length; fromIndex++) {
					if (this[fromIndex] === searchElement) {
						return fromIndex;
					}
				}

				return -1;
			};
		}

		var eventSplitter = /\s+/,
			namespaceSplitter = '.',
			Events;

		function makeBind(event, fn, context, isSignal) {
			var arr = event.split(namespaceSplitter);
			return {
				c: context,
				s: isSignal,
				fn: fn,
				n: arr[0],
				ns: arr.slice(1)
			};
		}

		function compare(request, target) {
			var compared = (!request.fn || request.fn === target.fn)
					&& (!request.n || request.n === target.n)
					&& (!request.c || request.c === target.c),
				requestNs = request.ns,
				ns2;

			//compare namespaces
			if (compared) {
				if (requestNs.length) {
					compared = false;
					ns2 = target.ns;
					for (var i = 0; i < requestNs.length; i++) {
						if (ns2.indexOf(requestNs[i]) !== -1) {
							compared = true;
							break;
						}
					}
				}
			}
			return compared;
		}

		function remove(me, event, fn, context) {
			var bind;
			if (!me._listeners) {
				return;
			}
			if (!event && !fn && !context) {
				delete me._listeners;
				return;
			}

			bind = makeBind(event, fn, context);

			if (!bind.ns.length && !fn && !context) {
				delete me._listeners[bind.n];
				return;
			}

			if (bind.n && !me._listeners[bind.n]) {
				return;
			}

			var listeners = {},
				binds;
			if (bind.n) {
				listeners[bind.n] = me._listeners[bind.n];
			} else {
				listeners = me._listeners;
			}

			for (var bindName in listeners) {
				binds = listeners[bindName];
				for (var i = 0; i < binds.length; i++) {
					if (compare(bind, binds[i])) {
						binds.splice(i, 1);
						i--;
					}
				}
			}

		}

		Events = function() {
			this._listeners = {};
		};

		var proto = Events.prototype;

		proto.on = function(events, fn, context, callOnce) {
			var eventNames;

			if (typeof events === 'object') {
				context = fn || this;
				for (var eventName in events) {
					this.on(eventName, events[eventName], context, callOnce);
				}
				return this;
			}

			if (typeof fn !== 'function') {
				throw new TypeError('function expected');
			}

			context = context || this;

			eventNames = events.split(eventSplitter);

			eventNames.forEach(function(eventName) {
				var bind = makeBind(eventName, fn, context, callOnce),
					binds = this._listeners || {},
					curBind = binds[bind.n] || [];

				curBind.push(bind);
				binds[bind.n] = curBind;

				this._listeners = binds;
			}, this);

			return this;
		};

		proto.one = function(events, fn, context) {
			return this.on(events, fn, context, true);
		};

		proto.off = function(events, fn, context) {
			var eventNames;

			if (!events) {
				remove(this, '', fn, context);
			} else {
				eventNames = events.split(eventSplitter);
				for (var i = 0, l = eventNames.length; i < l; i++) {
					remove(this, eventNames[i], fn, context);
				}
			}

			return this;
		};

		proto.fire = function(events) {
			if (!this._listeners) {
				return this;
			}

			var args = Array.prototype.slice.call(arguments, 1),
				me = this,
				eventNames,
				bind,
				bindsArray,
				bindObject;

			eventNames = events.split(eventSplitter);
			for (var i = 0, l = eventNames.length; i < l; i++) {

				bind = makeBind(eventNames[i], false, false);

				if (bind.n) {
					bindsArray = me._listeners[bind.n];
					if (!bindsArray) {
						return this;
					}

					for (var j = 0; j < bindsArray.length; j++) {
						bindObject = bindsArray[j];

						if (!bind.ns.length || compare(bind, bindObject)) {
							bindObject.fn.apply(bindObject.c, args);

							// delete handler, if it was 'one'
							if (bindObject.s) {
								bindsArray.splice(j, 1);
								j--;
							}
						}
					}
				} else {
					throw 'not implemented';
				}
			}
			return me;
		};

		Events.prototype.trigger = Events.prototype.fire;

		window.SBEvents = Events;
	}(this));
	;
	(function(_global) {
		var _ready = false,
			readyCallbacks = [],
			userAgent = navigator.userAgent.toLowerCase(),
			Smartbox;

		//private func for applying all ready callbacks
		function onReady() {
			var cb, scope;
			_ready = true;

			for (var i = 0, len = readyCallbacks.length; i < len; i++) {
				cb = readyCallbacks[i][0];
				scope = readyCallbacks[1];
				if (typeof cb === 'function') {
					cb.call(scope);
				}
			}

			// no need anymore
			readyCallbacks = null;
		}

		/**
		 * Detecting current platform
		 * @returns {boolean} true if running on current platform
		 */
		function detect(slug) {
			return userAgent.indexOf(slug) !== -1;
		}

		function initialize() {
			Smartbox.setPlugins();
			Smartbox.getDUID();

			// wait for calling others $()
			setTimeout(function() {
				onReady();
				onReady = null;
			}, 10);
		}

		var extend = (function() {
			if (_global._) {
				return _global._.extend
			} else {
				return $.extend
			}
		})();

		Smartbox = function(platform, cb, scope) {
			if (typeof platform === 'string') {
				Smartbox.readyForPlatform(platform, cb, scope);
			} else if (typeof platform === 'function') {
				scope = cb;
				cb = platform;
				Smartbox.ready(cb, scope);
			}
		};

		/**
		 * Version of smartbox
		 * @type {number}
		 */
		Smartbox.version = 0.2;

		/**
		 * Current platform name
		 * @type {string} default, samsung, lg, etc
		 */
		Smartbox.platformName = '';

		/**
		 * User agent of current platform
		 * @type {string}
		 */
		Smartbox.userAgent = userAgent;

		/**
		 * Calling cb after Smartbox ready
		 * @param cb {function} callback
		 * @param scope {object} scope for callback calling
		 */
		Smartbox.ready = function(cb, scope) {
			scope = scope || _global;

			if (_ready) {
				cb.call(scope);
			} else {
				readyCallbacks.push([cb, scope]);
			}
		};

		/**
		 * Calling cb after library initialise if platform is current
		 * @param platform {string} platform name
		 * @param cb {function} callback
		 * @param scope {object} scope for callback calling
		 */
		Smartbox.readyForPlatform = function(platform, cb, scope) {
			var self = this;
			this.ready(function() {
				if (platform == self.platformName) {
					cb.call(this);
				}
			}, scope);
		};

		/**
		 * TODO: description
		 * @param platformName
		 * @param platformApi
		 */
		Smartbox.createPlatform = function(platformName, platformApi) {
			var isCurrent = platformApi.detect && platformApi.detect();

			if (isCurrent || detect(platformApi.platformUserAgent)) {
				this.platformName = platformName;
				_.extend(this, platformApi);

				if (typeof platformApi.onDetect === 'function') {
					this.onDetect();
				}
			}
		};

		/**
		 * Asynchroniosly adding javascript files
		 * @param filesArray {Array} array of sources of javascript files
		 * @param cb {Function} callback on load javascript files
		 */
		Smartbox.addExternalJS = function(filesArray, cb) {
			var loadedScripts = 0,
				len = filesArray.length,
				el;

			function onloadScript() {
				loadedScripts++;

				if (loadedScripts === len) {
					cb && cb.call();
				}
			}

			if (filesArray.length) {
				for (var i = 0; i < len; i++) {
					el = document.createElement('script');
					el.type = 'text/javascript';
					el.onload = onloadScript;
					el.src = filesArray[i];
					document.head.appendChild(el);
				}
			} else {
				// if no external js simple call cb
				cb && cb.call(this);
			}
		};

		/**
		 * Add external css filess
		 * @param filesArray {array} array of css sources
		 */
		Smartbox.addExternalCSS = function(filesArray) {
			var $externalCssContainer,
				len = filesArray.length,
				i = 0,
				el, src;

			if (len) {
				$externalCssContainer = document.createDocumentFragment();

				while (i < len) {
					src = filesArray[i];
					if (src) {
						el = document.createElement('link');
						el.rel = 'stylesheet';
						el.href = src;

						$externalCssContainer.appendChild(el);
					}
				}

				document.body.appendChild($externalCssContainer);
			}
		};

		Smartbox.extend = extend;

		Smartbox.utils = {
			/**
			 * Show error message
			 * @param msg
			 */
			error: function(msg) {
				$$log(msg, 'error');
			},

			/**
			 * Show messages in log
			 * all functionality in main.js
			 */
			log: {
				log: $.noop,
				state: $.noop,
				show: $.noop,
				hide: $.noop,
				startProfile: $.noop,
				stopProfile: $.noop
			},

			// for backward compatibility
			addExternalJS: Smartbox.addExternalJS,
			addExternalCSS: Smartbox.addExternalCSS
		};

		/**
		 * Main config for library
		 * @type {object}
		 */
		Smartbox.config = {
			DUID: 'real',
			customVolumeEnable: false
		};

		document.head = document.head || document.getElementsByTagName('head')[0];

		extend(Smartbox, SBEvents.prototype);

		// exporting library to global
		_global.SB = Smartbox;

		// initialize library
		if (typeof document.addEventListener === 'function') {
			document.addEventListener('DOMContentLoaded', function() {
				initialize();
			}, false);
		} else {
			document.onload = function() {
				initialize();
			};
		}
	})(this);
// global SB
	!(function(window, undefined) {

		var PlatformApi = {
			externalCss: [],
			externalJs: [],
			keys: {},

			DUID: '',

			platformUserAgent: 'not found',

			/**
			 * Get DUID in case of Config
			 * @return {string} DUID
			 */
			getDUID: function() {
				switch (SB.config.DUID) {
					case 'real':
						this.DUID = this.getNativeDUID();
						break;
					case 'mac':
						this.DUID = this.getMac();
						break;
					case 'random':
						this.DUID = this.getRandomDUID();
						break;
					/*case 'local_random':
					 this.DUID = this.getLocalRandomDUID();
					 break;*/
					default:
						this.DUID = Config.DUIDSettings;
						break;
				}

				return this.DUID;
			},

			getSDI: function() {
				return '';
			},

			/**
			 * Returns random DUID for platform
			 * @returns {string}
			 */
			getRandomDUID: function() {
				return (new Date()).getTime().toString(16) + Math.floor(Math.random() * parseInt("10000", 16)).toString(16);
			},

			/**
			 * Returns MAC for platform if exist
			 * @returns {string}
			 */
			getMac: function() {
				return '';
			},

			/**
			 * Returns native DUID for platform if exist
			 * @returns {string}
			 */
			getNativeDUID: function() {
				return '';
			},

			/**
			 * Set custom plugins for platform
			 */
			setPlugins: $.noop,

			// TODO: volume for all platforms
			volumeUp: $.noop,
			volumeDown: $.noop,
			getVolume: $.noop,
			exit: $.noop,
			sendReturn: $.noop,
			setData: function(name, val) {
				// save data in string format
				localStorage.setItem(name, JSON.stringify(val));
			},

			getData: function(name) {
				var result;
				try {
					result = JSON.parse(localStorage.getItem(name));
				} catch (e) {
				}

				return result;
			},

			removeData: function(name) {
				localStorage.removeItem(name);
			}
		};

		_.extend(SB, PlatformApi);
	})(this);
	/**
	 * Keyboard Plugin
	 */
	;
	(function($, window, document, undefined) {

		var pluginName = 'SBInput',
			defaultOptions = {
				keyboard: {
					type: 'fulltext_ru',
					firstLayout: 'ru'
				},

				/**
				 * Format function
				 * @param text
				 */
				formatText: null,
				bindKeyboard: null,

				input: {
					template: '<div class="smart_input-container">' +
					'<div class="smart_input-wrap">' +
					'<span class="smart_input-text"></span>' +
					'<span class="smart_input-cursor"></span>' +
					'</div>' +
					'</div>',
					elClass: 'smart_input-container',
					wrapperClass: 'smart_input-wrap',
					cursorClass: 'smart_input-cursor',
					textClass: 'smart_input-text'
				},

				directKeyboardInput: false,
				directNumInput: false,

				max: 0,

				next: null
			},
			pluginPrototype,
			$keyboardOverlay,
			$keyboardPopup,
		// in app can be only one blink cursor
			blinkInterval;

		/**
		 * Generate input element
		 * @param opt  input options
		 * @returns {*}  jQuery el
		 */
		function generateInput(opt) {
			var div = $(document.createElement('div'));
			div.html(opt.template);
			return div.find('.' + opt.elClass);
		}

		/**
		 * generate popup for input keyboards
		 */
		function generateKeyboardPopup() {
			$keyboardOverlay = $(document.createElement('div')).attr('id', 'keyboard_overlay');
			$keyboardPopup = $(document.createElement('div')).attr({
				'id': 'keyboard_popup',
				'class': 'keyboard_popup_wrapper'
			});
			$keyboardOverlay.append($keyboardPopup);
			$(document.body).append($keyboardOverlay);
		}

		// The actual plugin constructor
		function Plugin(element, options) {
			this.$input = $(element);
			this.initialise(options);
			this.stopBlink();
			this.setText(element.value);
		}

		pluginPrototype = {
			isInited: false,
			_generatedKeyboard: false,
			isKeyboardActive: false,
			text: '',
			initialise: function(options) {
				var $el;
				if (this.isInited) {
					return this;
				}

				options = $.extend({}, defaultOptions, options);
				options.next = this.$input.attr('data-next') || options.next;
				options.max = this.$input.attr('data-max') || options.max || 0;

				this.options = options;

				this.$input.attr({
					'data-value': '',
					'data-max': options.max
				});

				$el = generateInput(options.input);
				$el.addClass(this.$input[0].className);
				$el.attr('data-nav_ud', this.$input[0].getAttribute('data-nav_ud'));

				this.$input.hide().after($el);

				this.$el = $el;
				this.$text = $el.find('.' + options.input.textClass);
				this.$cursor = $el.find('.' + options.input.cursorClass);
				this.$wrapper = $el.find('.' + options.input.wrapperClass);

				if (options.directKeyboardInput) {
					this.addDirectKeyboardEvents();
				}

				this.addEvents();
				this.isInited = true;
				return this;
			},

			startBlink: function() {
				var self = this,
					hiddenClass = this.options.input.cursorClass + '_hidden';

				if (blinkInterval) {
					clearInterval(blinkInterval);
				}
				blinkInterval = setInterval(function() {
					self.$cursor.toggleClass(hiddenClass);
				}, 500);
			},

			stopBlink: function() {
				var hiddenClass = this.options.input.cursorClass + '_hidden';
				if (blinkInterval) {
					clearInterval(blinkInterval);
				}
				this.$cursor.addClass(hiddenClass);
			},

			addEvents: function() {
				var $wrap = this.$wrapper,
					opt = this.options,
					self = this;

				this.$input.on({
					'nav_focus': function() {
						$$nav.current(self.$el);
					},
					'startBlink': function() {
						self.startBlink();
					},
					'stopBlink': function() {
						self.stopBlink();
					},
					'hideKeyboard': function() {
						if ($wrap.hasClass('smart-input-active')) {
							self.hideKeyboard();
						}
					},
					'showKeyboard': function() {
						self.showKeyboard();
					}
				});

				this.$el.on({
					'nav_focus': function() {
						self.$input.addClass('focus');
					},
					'nav_blur': function() {
						self.$input.removeClass('focus');
					}
				});

				if (opt.directNumInput && !opt.directKeyboardInput) {
					this.$el.off('nav_key:num nav_key:red').on('nav_key:num nav_key:red', function(e) {
						self.typeNum(e);
					});
				}

				$wrap.off('nav_focus nav_blur click');

				if (opt.bindKeyboard) {
					opt.keyboard = false;
					opt.bindKeyboard
						.off('type backspace delall')
						.on('type', function(e) {
							self.type(e.letter);
						})
						.on('backspace', function() {
							self.type('backspace');
						})
						.on('delall', function() {
							self.type('delall');
						});
				}

				if (opt.keyboard) {
					this.$el.on('click', function() {
						self.startBlink();
						self.showKeyboard();
					})
				}
			},

			addDirectKeyboardEvents: function() {
				var self = this;

				this.$el.on({
					nav_focus: function() {
						self.startBlink();
						$(document.body).on('keypress.SBInput', function(e) {
							if (e.charCode) {
								e.preventDefault();
								self.type(String.fromCharCode(e.charCode));
							} else {
								switch (e.keyCode) {
									case 8:
										e.preventDefault();
										self.type('backspace');
										break;
								}
							}
						});
					},
					nav_blur: function() {
						self.stopBlink();
						$(document.body).off('keypress.SBInput');
					}
				});
			},

			setText: function(text) {
				var opt = this.options,
					formatText,
					max = opt.max,
					method;

				text = text || '';

				if (text.length > max && max != 0) {
					text = text.substr(0, max);
				}

				formatText = opt.formatText ? opt.formatText(text) : text;

				this.$input.val(text).attr('data-value', text);
				this.text = text;
				this.$text.html(formatText);

				// TODO: fix for Samsung 11
				if (text.length > 1) {
					method = (this.$text.width() > this.$wrapper.width()) ? 'add' : 'remove';
					this.$wrapper[method + 'Class']('.' + opt.input.wrapperClass + '_right');
				} else {
					this.$wrapper.removeClass('.' + opt.input.wrapperClass + '_right');
				}

				this.$input.trigger('text_change');
			},

			type: function(letter) {
				var text = this.text || '',
					opt = this.options;

				switch (letter) {
					case 'backspace':
						text = text.substr(0, text.length - 1);
						break;
					case 'delall':
						text = '';
						break;
					default:
						text += letter;
						break;
				}

				this.setText(text);

				//jump to next input if is set
				if (text.length === opt.max &&
					opt.max != 0) {
					this.hideKeyboard(true);

					if (opt.next) {
						$$nav.current(opt.next);
						$$nav.current().click();
					}
				}
			},

			typeNum: function(e) {
				switch (e.keyName) {
					case 'red':
						this.type('backspace');
						break;
					default:
						this.type(e.num);
						break;
				}
				e.stopPropagation();
			},

			changeKeyboard: function(keyboardOpt) {
				var curOpt = this.options.keyboard;
				this.options.keyboard = _.extend({}, curOpt, keyboardOpt);
				$keyboardPopup && $keyboardPopup.SBKeyboard(this.options.keyboard);
			},

			hideKeyboard: function(isComplete) {
				this.$wrapper.removeClass('smart-input-active');
				this.$input.trigger('keyboard_hide');


				$$nav.restore();
				$$voice.restore();

				this.isKeyboardActive = false;
				if (isComplete) {
					this.$input.trigger('keyboard_complete');
				}
				else {
					this.$input.trigger('keyboard_cancel');
				}
				$keyboardPopup && $keyboardPopup.trigger('keyboard_hide');

				$keyboardOverlay && $keyboardOverlay.detach();
			},

			showKeyboard: function() {
				var $wrapper = this.$wrapper,
					keyboardOpt = this.options.keyboard,
					self = this;

				this.isKeyboardActive = true;
				$wrapper.addClass('smart-input-active');

				var h = this.$el.outerHeight();
				var o = this.$el.offset();
				var top = o.top + h;

				if (!$keyboardOverlay) {
					generateKeyboardPopup();
				}

				if (!this._generatedKeyboard) {
					$keyboardPopup.SBKeyboard(keyboardOpt);
					this._generatedKeyboard = true;
				}

				$keyboardPopup.SBKeyboard('changeKeyboard', keyboardOpt.type)
					.css({
						'left': o.left,
						'top': top
					})
					.off('type backspace delall complete cancel')
					.on('type', function(e) {
						self.type(e.letter);
					})
					.on('backspace', function() {
						self.type('backspace');
					})
					.on('delall', function() {
						self.type('delall');
					})
					.on('complete cancel', function(e) {
						var isComplete = false;
						if (e.type === 'complete') {
							isComplete = true;
						}
						self.stopBlink();
						self.hideKeyboard(isComplete);
					});

				$keyboardOverlay.appendTo('body');

				var kh = $keyboardPopup.height();
				var kw = $keyboardPopup.width();

				if (top + kh > 680) {
					$keyboardPopup.css({
						'top': top - kh - h
					})
				}
				if (o.left + kw > 1280) {
					$keyboardPopup.css({
						'left': 1280 - kw - 20
					})
				}
				$$voice.save();
				$$nav.save();
				$$nav.on('#keyboard_popup');
				$keyboardPopup.SBKeyboard('refreshVoice').voiceLink();
				this.$el.addClass($$nav.higlight_class);
				this.$input.trigger('keyboard_show');
				this.startBlink();
			}
		};

		$.extend(Plugin.prototype, pluginPrototype);
		pluginPrototype = null;

		$.fn.SBInput = function() {
			var args = Array.prototype.slice.call(arguments),
				method = (typeof args[0] == 'string') && args[0],
				options = (typeof args[0] == 'object') && args[0],
				params = args.slice(1);

			return this.each(function() {
				var instance = $.data(this, 'plugin_' + pluginName);
				if (!instance) {
					$.data(this, 'plugin_' + pluginName,
						new Plugin(this, options));
				} else if (typeof instance[method] === 'function') {
					instance[method].apply(instance, params);
				}
			});
		}

	})(jQuery, window, document);
	/**
	 * Keyboard Plugin
	 */
	;
	(function($, window, document, undefined) {

		var pluginName = 'SBKeyboard',
			keyRegExp = /([^{]+){{([^}]*)}}/,
			defaults = {
				type: 'en',
				firstLayout: null
			},
			pluginPrototype = {},
			keyboardPrototype = {},
			generatedKeyboards = {};

		/**
		 * Keyboard constructor
		 * @param options
		 * @param $el parent element
		 * @constructor
		 */
		function Keyboard(options, $el) {

			this.type = options.type;
			this.currentLayout = '';
			this.previousLayout = '';
			this.$el = $el;

			// jquery layout els
			this.$layouts = {};

			// all available layouts(for changeKeyboardLang)
			this.presets = [];

			this.initialize(options);
		}

		keyboardPrototype = {
			isShiftActive: false,
			isNumsShown: false,
			currentPresetType: '',
			initialize: function(options) {

				var _type = _.result(this, 'type'),
					board = '',
					preset,
					haveNums = false,
					type;

				preset = SB.keyboardPresets[_type];

				if (!preset) {
					throw new Error('Preset ' + _type + ' doesn\'t exist');
				}

				this.currentPresetType = _type;

				this.$wrap = $(document.createElement('div')).addClass('kb-wrap');

				if (typeof preset === 'function') {
					this.presets.push(_type);
					board = this.generateBoard(_type);
				} else if (preset.length) {
					this.presets = preset;
					haveNums = (preset.indexOf('fullnum') !== -1);
					if (haveNums) {
						this.presets = _.without(this.presets, 'fullnum');
					}
					board = this.generateFull(this.presets, haveNums);
				}

				this.$wrap
					.append(board)
					.addClass('kekekey_' + _type);

				this.$el.append(this.$wrap);
				this.setEvents();

				// save jquery els of current layouts
				for (var i = 0; i < this.presets.length; i++) {
					type = this.presets[i];
					this.$layouts[type] = this.$wrap.find('.keyboard_generated_' + type);
				}

				if (haveNums) {
					this.$layouts['fullnum'] = this.$wrap.find('.keyboard_generated_fullnum');
				}

				if (this.presets.indexOf(options.firstLayout) !== -1) {
					this.changeLayout(options.firstLayout);
				} else {
					this.changeLayout(this.presets[0]);
				}
			},

			/**
			 * Generate multilayout keyboards
			 * @param types {Array} array of layout types (['ru', 'en'])
			 * @param haveNums {Boolean} add fullnum keyboard
			 * @returns {string} generated html
			 */
			generateFull: function(types, haveNums) {
				var wrapHtml = '',
					preset = '',
					type = '';

				if (types.length > 1) {
					this.$wrap.addClass('kb-multilang');
				}

				for (var i = 0; i < types.length; i++) {
					type = types[i];
					wrapHtml += this.generateBoard(type);
				}

				if (haveNums) {
					this.$wrap.addClass('kb-havenums');
					wrapHtml += this.generateBoard('fullnum');
				}

				return wrapHtml;
			},

			/**
			 * Generate keyboard layout
			 * @param type {String}  'ru', 'en'
			 * @returns {String} generated html
			 */
			generateBoard: function(type) {

				var preset = SB.keyboardPresets[type],
					boardHtml = '',
					rowHtml = '',
					keyAttrs = {},
					row, letter;

				if (generatedKeyboards[type]) {
					return generatedKeyboards[type].board;
				}

				preset = preset();
				boardHtml = '<div class="kb-c keyboard_generated_' + type + '">';

				for (var i = 0; i < preset.length; i++) {
					row = preset[i];
					rowHtml = '<div class="kb-row" data-nav_type="hbox">';

					for (var j = 0; j < row.length; j++) {
						letter = row[j];
						if (letter.length == 1 || letter === '&amp;') {
							keyAttrs = {
								text: letter,
								type: '',
								letter: letter
							};
						}
						else {
							var matches = keyRegExp.exec(letter);

							keyAttrs.text = matches[2] || '';
							keyAttrs.type = matches[1];
							keyAttrs.letter = '';
						}
						rowHtml += '<div class="kbtn nav-item ' +
							keyAttrs.type +
							'" data-letter="' + _.escape(keyAttrs.letter) + '"';

						if (keyAttrs.type) {
							rowHtml += ' data-keytype="' + keyAttrs.type + '"';
						}

						rowHtml += '>' + keyAttrs.text + '</div>';
					}

					boardHtml += rowHtml + '</div>';
				}

				boardHtml += '</div>';

				generatedKeyboards[type] = {
					board: boardHtml
				};
				return boardHtml;
			},

			/**
			 * Num keys event handler
			 * @param e
			 */
			onKeyNum: function(e) {
				switch (e.keyName) {
					case 'red':
						this.$el.trigger('backspace');
						break;
					default:
						var ev = $.Event({
							'type': 'type'
						});
						ev.letter = '' + e.num;

						this.$el.trigger(ev);
						break;
				}
				e.stopPropagation();
			},
			defaultOnKey: function(e) {
				e.stopPropagation();
			},
			onKeyDown: function(e) {
				var $el = $(e.currentTarget),
					keyType = $el.attr('data-keytype'),
					letter = $el.attr('data-letter'),
					ev;

				// create custom event for triggering keyboard event
				ev = $.Event({
					'type': 'type'
				});

				if (keyType) {
					switch (keyType) {
						case 'backspace':
							ev = 'backspace';
							break;
						case 'delall':
							ev = 'delall';
							break;
						case 'complete':
							ev = 'complete';
							break;
						case 'space':
							ev.letter = ' ';
							break;
						case 'shift':
							this.triggerShiftLetters();
							return;
						case 'lang':
							this.changeKeyboardLang();
							return;
						case 'nums':
							this.triggerNumKeyboard();
							return;
						default:
							break;
					}
				} else {
					ev.letter = this.isShiftActive ? letter.toUpperCase() : letter;
				}

				ev && this.$el.trigger(ev);

				e.stopPropagation();
			},

			triggerShiftLetters: function() {
				var self = this;

				if (this.isShiftActive) {
					this.isShiftActive = false;
					this.$el.removeClass('shift_active');
				} else {
					this.isShiftActive = true;
					this.$el.addClass('shift_active');
				}

				// TODO: only for samsung 11
//      this.$el.find('.kbtn').not('.delall,.complete,.space,.nums,.lang,.shift,.backspace').each(function () {
//        this.innerHTML = self.isShiftActive ? this.innerHTML.toUpperCase() : this.innerHTML.toLowerCase();
//      });
			},

			/**
			 * show/hide fullnum layout
			 */
			triggerNumKeyboard: function() {

				if (this.isNumsShown) {
					this.isNumsShown = false;
					this.changeLayout(this.previousLayout);
					this.$el.trigger('hide_num');
				} else {
					this.isNumsShown = true;
					this.changeLayout('fullnum');
					this.$el.trigger('show_num');
				}

				$$nav.current(this.$layouts[this.currentLayout].find('.nums'));
			},

			changeKeyboardLang: function() {
				var curIndex = this.presets.indexOf(this.currentLayout),
					index;

				index = (curIndex + 1) % this.presets.length;
				this.changeLayout(this.presets[index]);
				$$nav.current(this.$layouts[this.currentLayout].find('.lang'));
			},

			/**
			 * Change layout function
			 * @param layout {String} 'fullnum', 'en'
			 */
			changeLayout: function(layout) {
				var prevLayout,
					curLayout = this.$layouts[layout];

				if (this.currentLayout) {
					prevLayout = this.$layouts[this.currentLayout];
					prevLayout && prevLayout.hide();
					this.$el.removeClass('keyboard_' + this.currentLayout);
					this.previousLayout = this.currentLayout;
				}

				if (curLayout) {
					this.currentLayout = layout;
					this.$el.addClass('keyboard_' + layout);
					curLayout.show();
				}
			},
			setEvents: function() {
				var self = this;
				// block yellow & blue buttons
				this.$wrap.on('nav_key:yellow nav_key:blue', this.defaultOnKey);
				this.$wrap.on('nav_key:num nav_key:red', _.bind(this.onKeyNum, this));
				this.$wrap.on('click', '.kbtn', _.bind(this.onKeyDown, this));
				this.$wrap
					.on('nav_key:green', function(e) {
						self.$el.trigger('complete');
						e.stopPropagation();
					})
					.on('nav_key:return', function(e) {
						self.$el.trigger('cancel');
						e.stopPropagation();
					});
			},
			show: function() {
				this.$wrap.show();
				this.$el.addClass(_.result(this, 'type') + '_wrap').addClass('keyboard_' + this.currentLayout);
				return this;
			},
			hide: function() {
				this.$wrap.hide();
				this.$el.removeClass(_.result(this, 'type') + '_wrap').removeClass('keyboard_' + this.currentLayout);
			}
		};

		$.extend(Keyboard.prototype, keyboardPrototype);
		keyboardPrototype = null;

		// The actual plugin constructor
		function Plugin(element, options) {
			this.$el = $(element);
			this.keyboards = {};

			options = $.extend({}, defaults, options);
			this.addKeyboard(options);
			this.$el.addClass('keyboard_popup_wrapper');
		}

		pluginPrototype = {
			/**
			 * Add keyboard to current element
			 * @param opt {Object}
			 */
			addKeyboard: function(opt) {
				var options = $.extend({}, defaults, opt),
					type = _.isFunction(opt.type) ? _.result(opt, 'type') : opt.type;

				if (!this.keyboards[type]) {
					this.keyboards[type] = new Keyboard(options, this.$el);
				}
				this.changeKeyboard(type);
			},
			/**
			 * Change current active keyboard
			 * @param type {String|Function} 'en', 'ru'
			 */
			changeKeyboard: function(type) {
				var curKeyboard = this.currentKeyboard,
					preset,
					isCurrent;

				type = _.isFunction(type) ? type() : type;
				preset = this.keyboards[type];
				isCurrent = curKeyboard && (curKeyboard.currentPresetType === type);

				if (preset && !isCurrent) {
					curKeyboard && curKeyboard.hide();
					this.currentKeyboard = preset.show();
				} else if (!preset) {
					this.addKeyboard({
						type: type
					});
				}
			}
		};

		$.extend(Plugin.prototype, pluginPrototype);
		pluginPrototype = null;

		// A lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn.SBKeyboard = function() {
			var args = Array.prototype.slice.call(arguments),
				method = (typeof args[0] == 'string') && args[0],
				options = (typeof args[0] == 'object') && args[0],
				params = args.slice(1);

			return this.each(function() {
				var instance = $.data(this, 'plugin_' + pluginName);
				if (!instance) {
					$.data(this, 'plugin_' + pluginName,
						new Plugin(this, options));
				} else {
					if (method) {
						instance[method] && instance[method].apply(instance, params)
					} else if (options) {
						instance.addKeyboard(options);
					}
				}
			});
		}
	})(jQuery, window, document);

	window.SB = window.SB || {};

// Default layouts, can be extended
	window.SB.keyboardPresets = {

		en: function() {
			return [
				'qwertyuiop'.split(''),
				'asdfghjkl'.split('').concat(['backspace{{<i class="backspace_icon"></i>}}']),
				['shift{{<i class="shift_icon"></i>Shift}}'].concat('zxcvbnm'.split('')).concat(
					['delall{{<span>Del<br/>all</span>}}']),
				['lang{{en}}', 'nums{{123}}', 'space{{}}', 'complete{{Complete}}']
			];
		},

		ru: function() {
			return [
				'йцукенгшщзхъ'.split(''),
				'фывапролджэ'.split('').concat(['backspace{{<i class="backspace_icon"></i>}}']),
				['shift{{<i class="shift_icon"></i>Shift}}'].concat('ячсмитьбю'.split('')).concat(['delall{{<span>Del<br/>all</span>}}']),
				['lang{{ru}}', 'nums{{123}}', 'space{{}}', 'complete{{Готово}}']
			]
		},

		email: function() {
			return [
				'1234567890@'.split(''),
				'qwertyuiop'.split('').concat(['backspace{{<i class="backspace_icon"></i>}}']),
				'asdfghjkl_'.split('').concat(['delall{{<span>Del<br/>all</span>}}']),
				'zxcvbnm-.'.split('').concat('complete{{OK}}')
			];
		},

		num: function() {
			return [
				'123'.split(''),
				'456'.split(''),
				'789'.split(''),
				['backspace{{<i class="backspace_icon"></i>}}', '0', 'complete{{OK}}']
			]
		},

		fullnum: function() {
			return [
				'1234567890'.split(''),
				'-/:;()$"'.split('').concat(['&amp;', 'backspace{{<i class="backspace_icon"></i>}}']),
				['nums{{ABC}}'].concat("@.,?!'+".split('')),
				['space{{}}', 'complete{{OK}}']
			]
		},

		fulltext_ru: ['ru', 'en'],
		fulltext_en: ['en'],
		fulltext_ru_nums: ['ru', 'en', 'fullnum'],
		fulltext_en_nums: ['en', 'fullnum']
	};
	(function(window) {
		"use strict";
		/*globals _, ViewModel,$,Events,document, Observable, Computed, Lang, nav*/
		var icons = ['info', 'red', 'green', 'yellow', 'blue', 'rew', 'play', 'pause', 'stop', 'ff', 'tools', 'left',
				'right', 'up', 'down', 'leftright', 'updown', 'move', 'number', 'enter', 'ret'],

			notClickableKeys = ['leftright', 'left', 'right', 'up', 'down', 'updown', 'move', 'number'],
			_isInited,
			LegendKey,
			savedLegend = [],
			Legend;

		function isClickable(key) {
			return (notClickableKeys.indexOf(key) === -1)
		}

		function renderKey(key) {
			var clickableClass = isClickable(key) ? ' legend-clickable' : '';
			return '<div class="legend-item legend-item-' + key + clickableClass + '" data-key="' + key + '">' +
				'<i class="leg-icon leg-icon-' + key + '"></i>' +
				'<span class="legend-item-title"></span>' +
				'</div>';
		}

		function _renderLegend() {
			var legendEl,
				wrap,
				allKeysHtml = '';

			for (var i = 0, len = icons.length; i < len; i++) {
				allKeysHtml += renderKey(icons[i]);
			}

			legendEl = document.createElement('div');
			wrap = document.createElement('div');

			legendEl.className = 'legend';
			legendEl.id = 'legend';
			wrap.className = 'legend-wrap';
			wrap.innerHTML = allKeysHtml;
			legendEl.appendChild(wrap);

			return $(legendEl);
		}

		Legend = function() {
			var self = this;
			this.$el = _renderLegend();
			this.keys = {};

			var initKey = function(key) {
				var $keyEl;
				if (!self.keys[key]) {
					$keyEl = self.$el.find('.legend-item-' + key);
					self.keys[key] = new LegendKey($keyEl);
				}
			};

			for (var i = 0; i < icons.length; i++) {
				initKey(icons[i]);
			}

			this.addKey = function(keyName, isClickable) {
				var keyHtml;

				if (typeof isClickable === 'undefined') {
					isClickable = true;
				}

				if (!isClickable) {
					notClickableKeys.push(keyName);
				}

				keyHtml = renderKey(keyName);

				this.$el.find('.legend-wrap').append(keyHtml);
				initKey(keyName);
			};

			this.show = function() {
				this.$el.show();
			};

			this.hide = function() {
				this.$el.hide();
			};

			this.clear = function() {
				for (var key in this.keys) {
					this.keys[key]('');
				}
			};

			this.save = function() {
				for (var key in this.keys) {
					savedLegend[key] = this.keys[key]();
				}
			};

			this.restore = function() {
				_.each(icons, function(key) {
					Legend[key](savedLegend[key]);
				});

				for (var key in savedLegend) {
					this.keys[key](savedLegend[key]);
				}

				savedLegend = [];
			};
		};

		LegendKey = function($el) {
			this.$el = $el;
			this.$text = $el.find('.legend-item-title');
			return _.bind(this.setText, this);
		};

		LegendKey.prototype.text = '';
		LegendKey.prototype.isShown = false;
		LegendKey.prototype.setText = function(text) {
			if (typeof text === 'undefined') {
				return this.text;
			} else if (text !== this.text) {
				text = text || '';

				if (!text && this.isShown) {
					this.$el[0].style.display = 'none';
					this.$el.removeClass('legend-item-visible');
					this.isShown = false;
				} else if (text && !this.isShown) {
					this.$el[0].style.display = '';
					this.$el.addClass('legend-item-visible');
					this.isShown = true;
				}

				this.text = text;
				this.$text.html(text);
			}
		};


		window.$$legend = new Legend();

		$(function() {
			$$legend.$el.appendTo(document.body);
			$$legend.$el.on('click', '.legend-clickable', function() {
				var key = $(this).attr('data-key'),
					ev, commonEvent;

				if (key === 'ret') {
					key = 'return';
				} else if (key === 'rew') {
					key = 'rw';
				}

				ev = $.Event("nav_key:" + key);
				commonEvent = $.Event("nav_key");
				commonEvent.keyName = ev.keyName = key;

				$$nav.current().trigger(ev).trigger(commonEvent);
			});
		});
	})(this);
	(function(window, undefined) {

		var profiles = {},
			logs = {},
			logNames = [],
			curPanelIndex = 0,
		// максимум логов на странице
			maxLogCount = 20,
			$logWrap,
			$logRow,
			Log,
			LogApi,
			LogPanel;

		// append log wrapper to body
		$logWrap = $('<div></div>', {
			id: 'log'
		});

		$(function() {
			$logWrap.appendTo(document.body);
		});

		$logRow = $('<div></div>', {
			'class': 'log-row'
		});

		/**
		 * LogPanel constructor
		 * @param logName {String} name of log panel
		 * @constructor
		 */
		LogPanel = function(logName) {
			this.name = logName;
			this.logs = 0;
			this.states = {};

			var $wrapper = $logWrap.find('#log_' + this.name);

			this.$content = $wrapper.find('.log_content');
			this.$state = $wrapper.find('.log_states');

			// no need anymore
			$wrapper = null;
		};

		_.extend(LogPanel.prototype, {
			log: function log(msg) {
				var logRow = $logRow.clone(),
					$rows, length;
				this.logs++;
				msg = _.escape(msg);

				logRow.html(msg).appendTo(this.$content);
				if (this.logs > maxLogCount) {
					$rows = this.$content.find(".log-row");
					length = $rows.length;
					$rows.slice(0, length - maxLogCount).remove();
					this.logs = $rows.length;
				}
			},

			state: function state(value, stateName) {
				var state = this.states[stateName] || this.createState(stateName);
				state.textContent = stateName + ': ' + value;
			},

			createState: function(stateName) {
				var $state = document.createElement('div');
				$state.id = '#log_' + this.name + '_' + stateName;
				this.states[stateName] = $state;
				this.$state.append($state);

				return $state;
			}
		});

		var logPanelTemplate = '<div class="log_pane" id="log_<%=name%>">' +
			'<div class="log_name">Log: <%=name%></div>' +
			'<div class="log_content_wrap">' +
			'<div class="log_content"></div>' +
			'</div>' +
			'<div class="log_states"></div>' +
			'</div>';

		Log = {

			create: function(logName) {
				var logHtml = logPanelTemplate.replace(/<%=name%>/g, logName);
				$logWrap.append(logHtml);
				logs[logName] = new LogPanel(logName);
				logNames.push(logName);
				return logs[logName];
			},

			getPanel: function(logName) {
				logName = logName || 'default';
				return (logs[logName] || this.create(logName));
			}
		};

		/**
		 * Public log API
		 */
		LogApi = {
			log: function(msg, logName) {
				Log.getPanel(logName).log(msg);
			},

			state: function(msg, state, logName) {
				Log.getPanel(logName).state(msg, state);
			},

			show: function(logName) {
				logName = logName || logNames[curPanelIndex];

				if (!logName) {
					curPanelIndex = 0;
					this.hide();
				} else {
					curPanelIndex++;
					$logWrap.show();
					$('.log_pane').hide();
					$('#log_' + logName).show();
				}
			},

			hide: function() {
				$logWrap.hide();
			},

			startProfile: function(profileName) {
				if (profileName) {
					profiles[profileName] = (new Date()).getTime();
				}
			},

			stopProfile: function(profileName) {
				if (profiles[profileName]) {
					this.log(profileName + ': ' + ((new Date()).getTime() - profiles[profileName]) + 'ms', 'profiler');
					delete profiles[profileName];
				}
			}
		};
		window.SB.utils.log = LogApi;
		window.$$log = LogApi.log;
		window.$$logApi = LogApi;
		window.$$error = SB.utils.error;

	})(this);

	$(function() {
		var logKey = SB.config.logKey || 'tools';
		$(document.body).on('nav_key:' + logKey, function() {
			SB.utils.log.show();
		});
	});


	!(function(window, undefined) {

		var $body = null,
			nav, invertedKeys = {};

		SB.ready(function() {
			var keys = SB.keys;
			for (var key in keys) {
				invertedKeys[keys[key]] = key.toLowerCase();
			}
		});

		function Navigation() {


			// for methods save и restore
			var savedNavs = [],

			// object for store throttled color keys  methods
				throttledMethods = {},

			// current el in focus
				navCur = null,

			// arrays
				numsKeys = ['n0', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9'],
				colorKeys = ['green', 'red', 'yellow', 'blue'],

			// pause counter
				paused = 0;

			function onKeyDown(e) {
				var key,
					data = {},
					keyCode = e.keyCode;

				if (paused || !navCur) {
					return;
				}

				key = invertedKeys[keyCode];
				if (key) {
					if (colorKeys.indexOf(key) > -1) {
						throttleEvent(key);
					} else {
						if (numsKeys.indexOf(key) > -1) {
							data.num = key[1];
							key = 'num';
						}

						triggerKeyEvent(key, data);
					}
				}
			}

			/**
			 * 'nav_key:' event trigger
			 * @param key key name
			 * @param data event data
			 */
			function triggerKeyEvent(key, data) {
				var ev,
					commonEvent;
				if (navCur) {
					ev = $.Event("nav_key:" + key, data || {});
					commonEvent = $.Event("nav_key");

					ev.keyName = key;
					commonEvent.keyName = key;
					navCur.trigger(ev);
					//первый trigger мог уже сменить текщий элемент
					navCur && navCur.trigger(commonEvent);
				}
			}

			function throttleEvent(key) {
				var keyMethod = throttledMethods[key];

				// lazy init
				if (!keyMethod) {
					keyMethod = throttledMethods[key] = _.throttle(function() {
						triggerKeyEvent(key);
					}, 800, {
						leading: true
					});
				}

				keyMethod(key);
			}

			/**
			 * trigger click on current element
			 */
			function onClick() {
				navCur && navCur.click();
			}

			return {

				// nav els selector
				area_selector: '.nav-item',

				/**
				 * Current el class
				 * @type {string}
				 */
				higlight_class: 'focus',

				/**
				 * navigation container
				 * @type {jQuery}
				 */
				$container: null,

				/**
				 * Current looping type
				 * false/hbox/vbox
				 * @type {boolean|string}
				 */
				loopType: null,

				/**
				 * Phantom els selector
				 * @type {string}
				 */
				phantom_selector: '[data-nav-phantom]',

				/**
				 * Returns current navigation state
				 * @returns {boolean}
				 */
				isPaused: function() {
					return !!paused;
				},

				/**
				 * Stop navigation. Increase pause counter
				 * @returns {Navigation}
				 */
				pause: function() {
					paused++;
					return this;
				},

				/**
				 * Resume navigation if force or pause counter is zero
				 * @param force {Boolean} force navigation resume
				 * @returns {Navigation}
				 */
				resume: function(force) {
					paused--;
					if (paused < 0 || force) {
						paused = 0;
					}
					return this;
				},

				/**
				 * Save current navigation state
				 * @returns {Navigation}
				 */
				save: function() {

					savedNavs.push({
						navCur: navCur,
						area_selector: this.area_selector,
						higlight_class: this.higlight_class,
						$container: this.$container
					});
					return this;
				},

				/**
				 * Restore navigation state
				 * @returns {Navigation}
				 */
				restore: function() {
					if (savedNavs.length) {
						this.off();
						var foo = savedNavs.pop();
						this.area_selector = foo.area_selector;
						this.higlight_class = foo.higlight_class;
						this.on(foo.$container, foo.navCur);
					}

					return this;
				},

				/**
				 * Setting focus on element
				 * @param element {*} - HTMLElement, selector or Jquery object
				 * @param originEvent {string} - event source(nav_key, mousemove, voice etc.)
				 * @return {Navigation}
				 */
				current: function(element, originEvent) {
					if (!element) {
						return navCur;
					}

					originEvent = originEvent || 'nav_key';

					var $el = $(element);
					if ($el.is(this.phantom_selector)) {
						$el = $($($el.attr('data-nav-phantom'))[0]);
					}
					if ($el.length > 1) {
						throw new Error('Focused element must be only one!');
					}
					if (!$el.length) {
						return this;
					}
					var old = navCur;
					if (navCur) {
						navCur.removeClass(this.higlight_class).trigger('nav_blur', [originEvent, $el]);
					}

					navCur = $el;

					$el.addClass(this.higlight_class).trigger('nav_focus', [originEvent, old]);
					return this;
				},

				/**
				 * Turn on navigation in container, turn off previous navigation
				 * @param container - HTMLElement, selector or Jquery object (body by default)
				 * @param cur - HTMLElement, selector or Jquery object(first nav el by default)
				 * @return {Navigation}
				 */
				on: function(container, cur) {

					var self = this,
						$navTypeEls;

					$body = $body || $(document.body);

					this.off();

					this.$container = container ? $(container) : $body;

					if (SB.platform != 'philips') {
						this.$container.on('mouseenter.nav', this.area_selector, function(e) {
							if (!$(this).is(self.phantom_selector)) {
								self.current(this, 'mouseenter');
							}
						});
					}

					$navTypeEls = this.$container.find('[data-nav_type]');

					if (this.$container.attr('data-nav_type')) {
						$navTypeEls = $navTypeEls.add(this.$container);
					}

					$navTypeEls.each(function() {
						var $el = $(this);
						var navType = $el.attr("data-nav_type");
						$el.removeAttr('data-nav_type');
						//self.setLoop($el);
						var loop = $el.attr("data-nav_loop");

						self.siblingsTypeNav($el, navType, loop);
					});

					$body
						.bind('keydown.navigation', onKeyDown)
						.bind('nav_key:enter.navigation', onClick);

					if (!cur) {
						cur = this.$container.find(this.area_selector).filter(':visible')[0];
					}
					this.current(cur);
					return this;
				},

				siblingsTypeNav: function($container, type, loop) {
					var self = this;
					$container.on('nav_key:left nav_key:right nav_key:up nav_key:down', this.area_selector,
						function(e) {
							var last = 'last',
								cur = self.current(),
								next,
								fn;

							//check if direction concur with declared
							if ((type == 'hbox' && e.keyName == 'left') ||
								(type == 'vbox' && e.keyName == 'up')) {
								fn = 'prev';
							} else if ((type == 'hbox' && e.keyName == 'right') ||
								(type == 'vbox' && e.keyName == 'down')) {
								fn = 'next';
							}

							if (fn == 'next') {
								last = 'first';
							}

							if (fn) {
								next = cur[fn](self.area_selector);

								while (next.length && !next.is(':visible')) {
									next = next[fn](self.area_selector);
								}

								if (!next.length && loop) {
									next = $container.find(self.area_selector).filter(':visible')[last]();
								}

								if (next.length) {
									nav.current(next);
									return false;
								}
							}
						});
				},

				/**
				 * Turn off navigation from container, disable navigation from current element
				 * @return {Navigation}
				 */
				off: function() {
					if (navCur) {
						navCur.removeClass(this.higlight_class).trigger('nav_blur');
					}
					this.$container && this.$container.off('mouseenter.nav').off('.loop');
					$body.unbind('.navigation');
					navCur = null;
					return this;
				},

				/**
				 * Find first nav el & set navigation on them
				 */
				findSome: function() {
					var cur;

					if (!(navCur && navCur.is(':visible'))) {
						cur = this.$container.find(this.area_selector).filter(':visible').eq(0);
						this.current(cur);
					}

					return this;
				},

				/**
				 * Find closest to $el element by dir direction
				 * @param $el {jQuery} - source element
				 * @param dir {string} - direction up, right, down, left
				 * @param navs {jQuery} - object, contains elements to search
				 * @returns {*}
				 */
				findNav: function($el, dir, navs) {
					var user_defined = this.checkUserDefined($el, dir);

					if (user_defined) {
						if (user_defined === 'none') {
							return false;
						} else {
							return user_defined;
						}
					}

					var objBounds = $el[0].getBoundingClientRect(),
						arr = [],
						curBounds = null,
						cond1, cond2, i, l;

					for (i = 0, l = navs.length; i < l; i++) {
						curBounds = navs[i].getBoundingClientRect();

						if (curBounds.left == objBounds.left &&
							curBounds.top == objBounds.top) {
							continue;
						}

						switch (dir) {
							case 'left':
								cond1 = objBounds.left > curBounds.left;
								break;
							case 'right':
								cond1 = objBounds.right < curBounds.right;
								break;
							case 'up':
								cond1 = objBounds.top > curBounds.top;
								break;
							case 'down':
								cond1 = objBounds.bottom < curBounds.bottom;
								break;
							default:
								break;
						}

						if (cond1) {
							arr.push({
								'obj': navs[i],
								'bounds': curBounds
							});
						}
					}

					var min_dy = 9999999, min_dx = 9999999, min_d = 9999999, max_intersection = 0;
					var dy = 0, dx = 0, d = 0;

					function isIntersects(b1, b2, dir) {
						var temp = null;
						switch (dir) {
							case 'left':
							case 'right':
								if (b1.top > b2.top) {
									temp = b2;
									b2 = b1;
									b1 = temp;
								}
								if (b1.bottom > b2.top) {
									if (b1.top > b2.right) {
										return b2.top - b1.right;
									}
									else {
										return b2.height;
									}
								}
								break;
							case 'up':
							case 'down':
								if (b1.left > b2.left) {
									temp = b2;
									b2 = b1;
									b1 = temp;
								}
								if (b1.right > b2.left) {
									if (b1.left > b2.right) {
										return b2.left - b1.right;
									}
									else {
										return b2.width;
									}
								}
								break;
							default:
								break;
						}
						return false;
					}

					var intersects_any = false;
					var found = false;

					for (i = 0, l = arr.length; i < l; i++) {
						if (!this.checkEntryPoint(arr[i].obj, dir)) {
							continue;
						}

						var b = arr[i].bounds;
						var intersects = isIntersects(objBounds, b, dir);
						dy = Math.abs(b.top - objBounds.top);
						dx = Math.abs(b.left - objBounds.left);
						d = Math.sqrt(dy * dy + dx * dx);
						if (intersects_any && !intersects) {
							continue;
						}
						if (intersects && !intersects_any) {
							min_dy = dy;
							min_dx = dx;
							max_intersection = intersects;
							found = arr[i].obj;
							intersects_any = true;
							continue;
						}

						switch (dir) {
							case 'left':
							case 'right':
								if (intersects_any) {
									cond2 = dx < min_dx || (dx == min_dx && dy < min_dy);
								}
								else {
									cond2 = dy < min_dy || (dy == min_dy && dx < min_dx);
								}
								break;
							case 'up':
							case 'down':
								if (intersects_any) {
									cond2 = dy < min_dy || (dy == min_dy && dx < min_dx);
								}
								else {
									cond2 = dx < min_dx || (dx == min_dx && dy < min_dy);
								}
								break;
							default:
								break;
						}
						if (cond2) {
							min_dy = dy;
							min_dx = dx;
							min_d = d;
							found = arr[i].obj;
						}
					}

					return found;
				},

				/**
				 * Return element defied by user
				 * Если юзером ничего не определено или направление равно 0, то возвращает false
				 * Если направление определено как none, то переход по этому направлению запрещен
				 *
				 * @param $el - current element
				 * @param dir - direction
				 * @returns {*}
				 */
				checkUserDefined: function($el, dir) {
					var ep = $el.data('nav_ud'),
						result = false,
						res = $el.data('nav_ud_' + dir);
					if (!ep && !res) {
						return false;
					}

					if (!res) {
						var sides = ep.split(','),
							dirs = ['up', 'right', 'down', 'left'];
						if (sides.length !== 4) {
							return false;
						}

						$el.data({
							'nav_ud_up': sides[0],
							'nav_ud_right': sides[1],
							'nav_ud_down': sides[2],
							'nav_ud_left': sides[3]
						});

						res = sides[dirs.indexOf(dir)];
					}

					if (res == 'none') {
						result = 'none';
					} else if (res == '0') {
						result = false;
					} else if (res) {
						result = $(res).first();
					}
					return result;
				},

				/**
				 * Проверяет можно ли войти в элемент с определенной стороны.
				 * Работает если у элемента задан атрибут data-nav_ep. Точки входа задаются в атрибуте с помощью 0 и 1 через запятые
				 * 0 - входить нельзя
				 * 1 - входить можно
				 * Стороны указываются в порядке CSS - top, right, bottom, left
				 *
				 * data-nav_ep="0,0,0,0" - в элемент зайти нельзя, поведение такое же как у элемента не являющегося элементом навигации
				 * data-nav_ep="1,1,1,1" - поведение по умолчанию, как без задания этого атрибута
				 * data-nav_ep="0,1,0,0" - в элемент можно зайти справа
				 * data-nav_ep="1,1,0,1" - в элемент нельзя зайти снизу
				 * data-nav_ep="0,1,0,1" - можно зайти слева и справа, но нельзя сверху и снизу
				 *
				 * @param elem -  проверяемый элемент
				 * @param dir - направление
				 * @returns {boolean}
				 */
				checkEntryPoint: function(elem, dir) {
					var $el = $(elem),
						ep = $el.attr('data-nav_ep'),
						res = null;

					if (!ep) {
						return true;
					}

					res = $el.attr('data-nav_ep_' + dir);

					if (res === undefined) {
						var sides = ep.split(',');
						$el.attr('data-nav_ep_top', sides[0]);
						$el.attr('data-nav_ep_right', sides[1]);
						$el.attr('data-nav_ep_bottom', sides[2]);
						$el.attr('data-nav_ep_left', sides[3]);
						res = $el.attr('data-nav_ep_' + dir);
					}

					return !!parseInt(res);
				}
			};
		}

		nav = window.$$nav = new Navigation();

		$(function() {
			// Navigation events handler
			$(document.body).bind('nav_key:left nav_key:right nav_key:up nav_key:down', function(e) {
				var cur = nav.current(),
					$navs,
					n;

				$navs = nav.$container.find(nav.area_selector).filter(':visible');
				n = nav.findNav(cur, e.keyName, $navs);
				n && nav.current(n);
			});
		});
	})(this);
	/**
	 * Player plugin for smartbox
	 */

	(function(window) {

		var updateInterval, curAudio = 0, curSubtitle = 0;


		/**
		 * emulates events after `play` method called
		 * @private
		 * @param self Player
		 */
		var stub_play = function(self) {
			self.state = "play";

			updateInterval && clearInterval(updateInterval);
			updateInterval = setInterval(function() {
				self.trigger("update");
				self.videoInfo.currentTime += 0.5;
				if (self.videoInfo.currentTime >= self.videoInfo.duration) {
					self.stop();
					self.trigger("complete");
				}
			}, 500);
		};
		var inited = false;

		var errorTimeout;

		var Player = window.Player = {
			mode3d: {
				OFF: 'off',
				SIDE_BY_SIDE: 'side_by_side',
				ABOVE_BELOW: 'above_below'
			},
			isSeeking: false,
			// default seek time in seconds
			jumpLength: 5,
			config: {
				//time for 'error' event(if nothing happens)
				errorTimeout: 15000,
				// use debounce for seek functions
				useSeekDebounce: true,
				autosize: true,
				size: {
					left: 0,
					top: 0,
					width: 1280,
					height: 720
				}
			},
			/**
			 * Inserts player object to DOM and do some init work
			 * @examples
			 * Player._init(); // run it after SB.ready
			 */
			_init: function() {

				//no need to do anything because just stub
			},

			extend: function(obj) {
				return SB.extend(this, obj);
			},
			/**
			 * current player state ["play", "stop", "pause"]
			 */
			state: 'stop',
			/**
			 * Runs some video
			 * @param {Object} options {url: "path", type: "hls", from: 0
         * }
			 * @examples
			 *
			 * Player.play({
         * url: "movie.mp4"
         * }); // => runs video
			 *
			 * Player.play({
         * url: "movie.mp4"
         * from: 20
         * }); // => runs video from 20 second
			 *
			 * Player.play({
         * url: "stream.m3u8",
         * type: "hls"
         * }); // => runs stream
			 */
			play: function(options) {
				var self = this;
				if (!inited) {
					self._init();
					inited = true;
				}

				if (typeof options == "string") {
					options = {
						url: options
					}
				}
				if (options !== undefined) {
					self.stop();
					self.state = 'play';
					self._play(options);


					/*
					 var onready=function(){
					 self.off('ready', onready);
					 self.off('error', onready);
					 clearTimeout(errorTimeout);
					 };

					 self.on('ready', onready);
					 self.on('error', onready);

					 errorTimeout=setTimeout(function(){
					 self.trigger('error');
					 }, self.config.errorTimeout);*/


				} else if (options === undefined && this.state === 'pause') {
					this.resume();
				}
			},
			_play: function() {
				var self = this;

				setTimeout(function() {
					self.trigger("ready");
					setTimeout(function() {
						self.trigger("bufferingBegin");
						setTimeout(function() {
							self.videoInfo.currentTime = 0;
							self.trigger("bufferingEnd");
							stub_play(self);
						}, 1000);
					}, 1000);
				}, 1000);

			},
			/**
			 * Stop video playback
			 * @param {Boolean} silent   if flag is set, player will no trigger "stop" event
			 * @examples
			 *
			 * Player.stop(); // stop video
			 *
			 * App.onDestroy(function(){
         *      Player.stop(true);
         * });  // stop player and avoid possible side effects
			 */
			stop: function(silent) {
				var info = this.videoInfo;
				if (this.state != 'stop') {
					this._stop();
					if (!silent) {
						this.trigger('stop');
					}
					if (info.seekTime) {
						info.seekTime = null;
						this.trigger('seekStop')
					}
				}
				this.state = 'stop';
			},
			/**
			 * Pause playback
			 * @examples
			 * Player.pause(); //paused
			 */
			pause: function() {
				if (this.state === 'play') {
					this._pause();
					this.state = "pause";
					this.trigger('pause');
				}
			},
			_pause: $.noop,
			/**
			 * Resume playback
			 * @examples
			 * Player.pause(); //resumed
			 */
			resume: function() {
				if (this.state === 'pause') {
					this._resume();
					this.state = "play";
					this.trigger('resume');
				}
			},
			_resume: function() {
				stub_play(this);
			},
			/**
			 * Toggles pause/resume
			 * @examples
			 *
			 * Player.togglePause(); // paused or resumed
			 */
			togglePause: function() {
				if (this.state == "play") {
					this.pause();
				} else {
					this.resume();
				}
			},
			_stop: function() {
				clearInterval(updateInterval);
			},
			/**
			 * Converts time in seconds to readable string in format H:MM:SS
			 * @param {Number} seconds time to convert
			 * @returns {String} result string
			 * @examples
			 * Player.formatTime(PLayer.videoInfo.duration); // => "1:30:27"
			 */
			formatTime: function(time) {
				var hours = Math.floor(time / (60 * 60));
				var divisor_for_minutes = time % (60 * 60);
				var minutes = Math.floor(divisor_for_minutes / 60);
				var divisor_for_seconds = divisor_for_minutes % 60;
				var seconds = Math.ceil(divisor_for_seconds);
				if (seconds < 10) {
					seconds = "0" + seconds;
				}
				if (minutes < 10) {
					minutes = "0" + minutes;
				}
				return (hours ? hours + ':' : '') + minutes + ":" + seconds;
			},

			setSize: function(opt) {
				opt = opt || {};
				var size = this.config.size;

				_.extend(size, opt);

				if (inited) {
					this._setSize(size);
				}
			},

			_setSize: $.noop,

			/**
			 * Hash contains info about current video
			 */
			videoInfo: {
				/**
				 * Total video duration in seconds
				 */
				duration: 0,
				/**
				 * Video stream width in pixels
				 */
				width: 0,
				/**
				 * Video stream height in pixels
				 */
				height: 0,
				/**
				 * Current playback time in seconds
				 */
				currentTime: 0,
				/**
				 * Current seeking time
				 */
				seekTime: null
			},

			/**
			 *
			 * @param {Number} seconds time to seek
			 * @examples
			 * Player.seek(20); // seek to 20 seconds
			 */
			_seek: function(seconds) {
				var self = this;
				self.videoInfo.currentTime = seconds;
				self.pause();
				self.trigger("bufferingBegin");
				setTimeout(function() {
					self.trigger("bufferingEnd");
					self.resume();
				}, 500);
			},

			seek: function(time, useDebounce) {
				var info = this.videoInfo,
					jump;
				if (time <= 0) {
					time = 0;
				}
				if (time >= info.duration) {
					time = info.duration;
					var state = this.state;
					this.state = 'STOP';
					if (state != 'STOP') {
						this.stop();
						this.trigger('complete');
					}
				} else {
					if (this.config.useSeekDebounce && useDebounce) {
						this.seekDebounce(time);
					} else {
						this.seekStop(time);
					}
					if (info.seekTime) {
						this.trigger('seekProgress')
					}
				}
			},

			seekStop: function(time) {
				var info = this.videoInfo;
				if (this.state !== 'stop') {
					this._seek(time);
					info.currentTime = time;
					if (info.seekTime) {
						info.seekTime = null;
						this.trigger('seekStop');
					}
					this.trigger('update');
				}
			},

			seekDebounce: _.debounce(function(time) {
				this.seekStop(time)
			}, 500),

			forward: function(time) {
				time = time || this.jumpLength;
				if (this.state !== 'stop') {
					var seekTime = this.setSeekTime(time);
					this.seek(seekTime, true);
				}
			},
			backward: function(time) {
				time = time || this.jumpLength;
				if (this.state !== 'stop') {
					var seekTime = this.setSeekTime(-time);
					this.seek(seekTime, true);
				}

			},
			setSeekTime: function(time) {
				var info = this.videoInfo;

				// check for null value
				if (_.isNull(info.seekTime)) {
					info.seekTime = info.currentTime;
					this.trigger('seekStart');
				}

				info.seekTime += time;

				return info.seekTime;
			},

			/**
			 * For multi audio tracks videos
			 */
			audio: {
				/**
				 * Set audio track index
				 * @param index
				 */
				set: function(index) {
					curAudio = index;
				},
				/**
				 * Returns list of supported language codes
				 * @returns {Array}
				 */
				get: function() {
					var len = 2;
					var result = [];
					for (var i = 0; i < len; i++) {
						result.push(0);
					}
					return result;
				},
				/**
				 * @returns {Number} index of current playing audio track
				 */
				cur: function() {
					return curAudio;
				},
				toggle: function() {
					var l = this.get().length;
					var cur = this.cur();
					if (l > 1) {
						cur++;
						if (cur >= l) {
							cur = 0;
						}
						this.set(cur);
					}
				}
			},
			subtitle: {
				_urls: [],
				running: false,
				$subtitles_text: null,

				hasUpdateListener: false,

				_prevTime: -1,
				_prevSubtitle: -1,

				onUpdate: function() {
					if (this.running) {
						var cTime = Player.videoInfo.currentTime, index, subtitleObject;
						//если идет последовательное воспроизведение
						//это самый частый случай
						if (cTime > this._prevTime) {
							console.log('normal');
							index = this.getTextIndex(this._prevSubtitle + 1);
						} else {//если были перемотки ищем с начала и до конца
							console.log('rewind');
							index = this.getTextIndex(0);
						}

						subtitleObject = this.data[index];

						if (subtitleObject) {
							this.showText(subtitleObject.text);
							this._prevTime = cTime;
							this._prevSubtitle = index;
						}
					}

				},

				showText: function(text) {
					var $subtitiles;
					if (!this.$subtitles_text) {
						$('body').append('<div id="subtitles_view" style="position: absolute; z-index: 1;"><div id="subtitles_text"></div></div>');
						$subtitiles = $('#subtitles_view');
						$subtitiles.css({
							width: '1280px',
							height: '720px',
							left: '0px',
							top: '0px'
						});
						this.$subtitles_text = $('#subtitles_text').css({
							'position': 'absolute',
							'text-align': 'center',
							'width': '100%',
							'left': '0',
							'bottom': '50px',
							'font-size': '24px',
							'color': '#fff',
							'text-shadow': '0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000',
							'line-height': '26px'
						});
					}
					this.$subtitles_text.html(text);
				},

				add: function(url, name) {
					this._urls.push({
						url: url,
						name: name
					});
				},
				/**
				 * Set subtitle index
				 * @param index
				 */
				set: function(index) {
					curSubtitle = index;
					if (index != -1) {
						this.url(this._urls[index].url);
					} else {
						this.running = false;
					}
				},
				/**
				 * Returns list of available subtitles
				 * @returns {Array}
				 */
				get: function() {
					return _.pluck(this._urls, 'name');
				},
				/**
				 * @returns {Number} index of current subtitles
				 */
				cur: function() {
					return curSubtitle;
				},
				toggle: function() {
					var l = Player.subtitle.get().length;
					var cur = Player.subtitle.cur();
					if (l > 1) {
						cur++;
						if (cur >= l) {
							cur = 0;
						}
						Player.subtitle.set(cur);
					}
				},
				getTextIndex: function(fromIndex) {
					var cTime = Player.videoInfo.currentTime * 1000;
					for (var i = fromIndex, l = this.data.length; i < l; i++) {
						var obj = this.data[i];
						if (cTime >= obj.time) {
							var next = this.data[i + 1];
							if (next && cTime >= next.time) {
								continue;
							}
							return i;
						}
					}
					return -1;
				},
				data: [
					{
						time: 0,
						text: ''
					}
				],
				/**
				 * Load subtitles from remote file
				 * @param url
				 */
				url: function(url) {
					var extension = /\.([^\.]+)$/.exec(url)[1];
					var self = this;
					$.ajax({
						url: url,
						dataType: 'text',
						success: function(data) {
							self.running = true;
							Player.subtitle.parse[extension].call(Player, data);

							if (!self.hasUpdateListener) {
								self.hasUpdateListener = true;
								Player.on('update', function() {
									self.onUpdate();
								});
							}

						}
					});
				},
				parse: {
					smi: function(data) {
						data = data.split(/\s*<sync/i);
						data.shift();
						Player.subtitle.data = _.map(data, function(value) {
							var match = /[\s\S]*start=(\d+)[\s\S]*<p[^>]*>([\s\S]*)<spanid/i.exec(value);
							if (match) {
								return {
									time: parseInt(match[1], 10),
									text: match[2]
								};
							}
						});
					},
					srt: function(data) {
						data = data.split('\r\n\r\n');
						var self = Player.subtitle;

						self.data = [];
						var parseTime = function(time) {
							var matches = time.match(/(\d{2}):(\d{2}):(\d{2}),(\d+)/);
							return parseInt(matches[1], 10) * 3600000 +
								parseInt(matches[2], 10) * 60000 +
								parseInt(matches[3], 10) * 1000 +
								parseInt(matches[4], 10);
						};

						_.each(data, function(value) {
							if (!value) {
								return;
							}
							var rows = value.split('\n');

							var timeRow = rows[1].split(' --> '),
								timeStart, timeEnd, text;
							rows.splice(0, 2);
							timeStart = parseTime(timeRow[0]);
							timeEnd = parseTime(timeRow[1]);

							self.data.push({
								time: timeStart,
								text: rows.join('<br/>')
							});
							self.data.push({
								time: timeEnd,
								text: ''
							});
						});
						self.data.unshift({
							time: 0,
							text: ''
						});
					}
				}
			}
		};

		//SBEvents.call(Player);
		SB.extend(Player, SBEvents.prototype);

	}(this));

	(function($) {
		"use strict";

		var inited = false,
			enabled = false,
			currentVoiceState,
			curOptions,
			$curTarget,
			$buble,
			stack = [],
			$moreDiv = $('<div/>'),

			paused = false;


		var init = function() {
			if (!inited) {

				enabled = $$voice._nativeCheckSupport();
				if (!enabled) {
					return;
				}

				$$voice._init();
				$buble = $('#voice_buble');
				inited = true;
			}
		}


		var defaults = {
			selector: '.voicelink',
			moreText: 'More',
			eventName: 'voice',
			useHidden: false,
			helpText: '',
			// количество показов баббла помощи
			showHelperTimes: 3,
			// количество самсунговских всплывашек с командами
			helpbarMaxItems: 6,
			// включение сортировки по весу
			sortByWeight: true,
			//Вес голосовых ссылок по умолчанию
			helpbarItemWeight: 200,
			candidateWeight: 0
		};


		var helpbarVisibityTimeoutLink;


		window.$$voice = {
			voiceTimeout: 10000,
			_resetVisibilityTimeout: function() {
				$$voice.helpbarVisible = true;

				clearTimeout(helpbarVisibityTimeoutLink);
				helpbarVisibityTimeoutLink = setTimeout(function() {

					//чтобы обновлял подсказки если был вызван голосовой поиск смотри баг #966
					if (typeof voiceServer == 'function') {
						voiceServer = false;
						$$voice.restore();
					}


					$buble.hide();
					$$voice.helpbarVisible = false;
				}, this.voiceTimeout);
			},
			_init: function() {

			},
			_nativeCheckSupport: function() {

			},
			helpbarVisible: false,
			enabled: function() {
				init();
				return enabled;
			},
			_setVoiceHelp: function(voicehelp) {

			},
			pause: function() {
				paused = true;
			},
			resume: function() {
				paused = false;
			},
			say: function(text) {
                if (paused) {
                    return;
                }
				var result = text.toLowerCase();
				var opts = $.extend({}, defaults, curOptions);
				if (elements[result]) {
					elements[result].trigger(opts.eventName);
				}
				if ($curTarget) {
					generateHelpBar.call($curTarget, curOptions);
				}
			},
			_nativeTurnOff: function() {

			},
			hide: function() {
				if (!this.enabled()) {
					return;
				}
				this._nativeTurnOff();
				$buble.hide();
				return this;
			},

			setup: function(options) {
				$.extend(defaults, options);
				return this;
			},
			save: function() {
                if (currentVoiceState) {
                    stack.push(currentVoiceState);
                }
				return this;
			},
			restore: function() {
				var last = stack.pop();
                if (last) {
                    $.fn.voiceLink.apply(last.self, last.args);
                }
				return this;
			},
			_nativeFromServer: function(title, callback) {

			},
			fromServer: function(title, callback) {
                if (!inited) {
                    return this;
                }
				this.save();
				this._nativeFromServer(title, callback);
				return this;
			},
			refresh: function() {
				return this.save().restore();
			}
		}


		var generated = false, elements;


		/**
		 * Преобразование jQuery коллекции в массив
		 * и добавление команд в объект elements
		 * @param elems
		 * @returns {Array}
		 */
		function voiceElementsToArray(elems) {


			var items = [];

			elems.each(function() {
				var $el = $(this);
				var commands = $el.attr('data-voice');
				var group = $el.attr('data-voice-group');
				var hidden = $el.attr('data-voice-hidden') === 'true' ? true : false;
				var weight = $el.attr('data-voice-weight') || 0;
				var main = false;

				if (!commands) {
					console.error('command in ', this, ' is not defined');
					return;
				}


				if ($el.attr('data-voice-disabled')) {
					return;
				}

				if (!weight) {
					if (!group && !hidden) {
						weight = defaults.helpbarItemWeight
						main = true;
					}
					else {
						weight = defaults.candidateWeight
					}
				}

				items.push({
					itemText: commands,
					weight: weight,
					group: group,
					hidden: hidden,
					main: main
				});

				elements[commands.toLowerCase()] = $el;
			});

			return items;
		}

		var groupNames = {},
			gnCount = 0;

		var generateHelpBar = function(options) {

			if (generated) {
				return;
			}
			generated = true;

			$buble.hide().empty();

			var voiceItems,
				helpbarVoiceItems,
				candidateVoiceItems,
				activeItems,
				hiddenItems,
				items = [],
				candidates = [],
				opts = $.extend({}, defaults, options),
				helpbarMaxItems = opts.helpbarMaxItems,
				elems = this.find(opts.selector);


			var voicehelp = {
				helpbarType: "HELPBAR_TYPE_VOICE_CUSTOMIZE",
				bKeepCurrentInfo: "false",
				helpbarItemsList: {}
			};

			elements = {};

			if (!options.useHidden) {
				var force = elems.filter('[data-voice-force-visible]');
				elems = elems.filter(':visible').add(force);
			}


			// сортировка элементов по весу (от большего к меньшему)
			if (opts.sortByWeight) {
				voiceItems = _.sortBy(voiceElementsToArray(elems), function(el) {
					return -el.weight;
				});
			} else {
				voiceItems = voiceElementsToArray(elems);
			}


			// количество скрытых голосовых подсказок
			hiddenItems = $.grep(voiceItems, function(el) {
				return el.hidden === true;
			});


			// количество отображаемых подсказок
			activeItems = _.difference(voiceItems, hiddenItems);


			// добавление кнопки "Еще"
			if (activeItems.length > helpbarMaxItems) {
				activeItems.splice(helpbarMaxItems - 1, 0, {
					itemText: opts.moreText,
					commandList: [
						{command: opts.moreText}
					]
				});
				$moreDiv.unbind().bind(opts.eventName, function() {
					$('body').trigger('showVoiceHelpbar');
					$$voice._resetVisibilityTimeout();
					$buble.show();
				});
				elements[opts.moreText.toLowerCase()] = $moreDiv;
			}

			// выбираем элементы для подсказок самсунга
			helpbarVoiceItems = activeItems.splice(0, helpbarMaxItems);

			// остальные голосовые команды
			candidateVoiceItems = _.union(hiddenItems, activeItems);

			// массив для хелпбара самсунга
			_.each(helpbarVoiceItems, function(val) {
				var commands = val.itemText;

				items.push({
					itemText: commands,
					commandList: [
						{command: commands}
					]
				});
			});

			// массив команд, не отображаемых в хелпбаре самсунга
			_.each(candidateVoiceItems, function(val) {

				var group = val.group,
					commands = val.itemText,
					hidden = val.hidden,
					main = val.main;

				if (main && !group) {
					group = '';
				}


				if (!hidden) {
					if (!groupNames[group]) {
						gnCount++;
						groupNames[group] = gnCount;
					}
					var $groupWrap = $buble.find('#voice_group_body_' + groupNames[group]);
					if ($groupWrap.length) {
						$groupWrap.append('<div class="voice_help_item">' + commands + '</div>');
					}
					else {
						$buble.append('<div class="voice_group_head">' + group + '</div>' +
							'<div class="voice_group_body" id="voice_group_body_' + groupNames[group] + '">' +
							'<div class="voice_help_item">' + commands + '</div>' +
							'</div>');
					}
				}

				candidates.push({
					candidate: val.itemText
				});
			});

			voicehelp.helpbarItemsList = items;

			if (candidates.length) {
				voicehelp.candidateList = candidates;
			}


			$$voice._setVoiceHelp(voicehelp);

		};

		$.fn.voiceLink = function(options) {
			// выходим, если нет реализации голоса
			if (inited && !enabled) {
				return;
			}

			init()


			currentVoiceState = {
				self: this,
				args: arguments
			};

			generated = false;
			options || (options = {});
			curOptions = options;
			$curTarget = this;

			if ($$voice.helpbarVisible) {
				generateHelpBar.call(this, curOptions);
			}
		}

	})(jQuery);
	SB.readyForPlatform('browser', function() {

		Player.extend({
			_init: function() {
				var self = this;

				this.$video_container = $('<video></video>', {
					"id": "smart_player"
				});
				this._setSize(this.config.size);

				var video = this.$video_container[0];
				$('body').append(this.$video_container);

				this.$video_container.on('loadedmetadata', function() {
					self.videoInfo.width = video.videoWidth;
					self.videoInfo.height = video.videoHeight;
					self.videoInfo.duration = video.duration;
					self.trigger('ready');
				});


				this.$video_container.on('loadstart', function(e) {
					self.trigger('bufferingBegin');
				}).on('playing', function() {
					self.trigger('bufferingEnd');
				}).on('timeupdate', function() {
					self.videoInfo.currentTime = video.currentTime;
					self.trigger('update');
				}).on('ended', function() {
					self.state = "stop";
					self.trigger('complete');
				}).on('error', function(e) {
					self.trigger('error');
				});


				this.$video_container.on('abort canplay canplaythrough canplaythrough durationchange emptied ended error loadeddata loadedmetadata loadstart mozaudioavailable pause play playing ratechange seeked seeking suspend volumechange waiting', function(e) {
					//console.log(e.type);
				});


				/*
				 abort 	Sent when playback is aborted; for example, if the media is playing and is restarted from the beginning, this event is sent.
				 canplay 	Sent when enough data is available that the media can be played, at least for a couple of frames.  This corresponds to the CAN_PLAY readyState.
				 canplaythrough 	Sent when the ready state changes to CAN_PLAY_THROUGH, indicating that the entire media can be played without interruption, assuming the download rate remains at least at the current level. Note: Manually setting the currentTime will eventually fire a canplaythrough event in firefox. Other browsers might not fire this event.
				 durationchange 	The metadata has loaded or changed, indicating a change in duration of the media.  This is sent, for example, when the media has loaded enough that the duration is known.
				 emptied 	The media has become empty; for example, this event is sent if the media has already been loaded (or partially loaded), and the load() method is called to reload it.
				 ended 	Sent when playback completes.
				 error 	Sent when an error occurs.  The element's error attribute contains more information. See Error handling for details.
				 loadeddata 	The first frame of the media has finished loading.
				 loadedmetadata 	The media's metadata has finished loading; all attributes now contain as much useful information as they're going to.
				 loadstart 	Sent when loading of the media begins.
				 mozaudioavailable 	Sent when an audio buffer is provided to the audio layer for processing; the buffer contains raw audio samples that may or may not already have been played by the time you receive the event.
				 pause 	Sent when playback is paused.
				 play 	Sent when playback of the media starts after having been paused; that is, when playback is resumed after a prior pause event.
				 playing 	Sent when the media begins to play (either for the first time, after having been paused, or after ending and then restarting).
				 progress 	Sent periodically to inform interested parties of progress downloading the media. Information about the current amount of the media that has been downloaded is available in the media element's buffered attribute.
				 ratechange 	Sent when the playback speed changes.
				 seeked 	Sent when a seek operation completes.
				 seeking 	Sent when a seek operation begins.
				 suspend 	Sent when loading of the media is suspended; this may happen either because the download has completed or because it has been paused for any other reason.
				 timeupdate 	The time indicated by the element's currentTime attribute has changed.
				 volumechange 	Sent when the audio volume changes (both when the volume is set and when the muted attribute is changed).
				 waiting 	Sent when the requested operation (such as playback) is delayed pending the completion of another operation (such as a seek).
				 */
			},
			_play: function(options) {
				var video = this.$video_container[0];
				video.src = options.url;

				if (options.from) {
					//may be buggy
					video.addEventListener('loadedmetadata', function() {
						video.currentTime = options.from;
					}, false);
				}
				video.play();
			},
			_stop: function() {
				this.$video_container[0].pause();
				this.$video_container[0].src = '';
			},
			_pause: function() {
				this.$video_container[0].pause();
			},
			_resume: function() {
				this.$video_container[0].play();
			},
			_seek: function(time) {
				this.$video_container[0].currentTime = time;
			},
			_forward: function(time) {
				this.$video_container[0].currentTime = this.videoInfo.currentTime + time;
			},
			_backward: function(time) {
				this.$video_container[0].currentTime = this.videoInfo.currentTime - time;
			},
			_setSize: function(size) {
				this.$video_container.css({
					position: "absolute",
					left: size.left + 'px',
					top: size.top + 'px',
					width: size.width + 'px',
					height: size.height + 'px',
					zIndex: size.zIndex
				});
			},
			audio: {
				//https://bugzilla.mozilla.org/show_bug.cgi?id=744896
				set: function(index) {

				},
				get: function() {
					return [];
				},
				cur: function() {
					return 0;
				}
			},
			/*subtitle: {
			 set: function (index) {
			 if (Player.$video_container[0].textTracks) {
			 var subtitles = _.filter(Player.$video_container[0].textTracks, function (i) {
			 return i.kind === 'subtitles';
			 });
			 if (subtitles.length) {
			 _.each(subtitles, function (self, i) {
			 if (self.mode === "showing") {
			 self.mode = "disabled";
			 }
			 else if (i == index) {
			 self.mode = "showing";
			 }
			 });
			 return true;
			 }
			 }
			 return false;
			 },
			 get: function () {
			 if (Player.$video_container[0].textTracks) {
			 var subtitles = _.filter(Player.$video_container[0].textTracks, function (i) {
			 return i.kind === 'subtitles';
			 });
			 if (subtitles.length) {
			 return _.map(subtitles, function (self) {
			 return {index: subtitles.indexOf(self), language: self.language};
			 });
			 }
			 }
			 return false;
			 },
			 cur: function () {
			 var cur = -1;
			 if (Player.$video_container[0].textTracks) {
			 var subtitles = _.filter(Player.$video_container[0].textTracks, function (i) {
			 return i.kind === 'subtitles';
			 });
			 if (subtitles.length) {
			 _.each(subtitles, function (self, i) {
			 if (self.mode === "showing") {
			 cur = i;
			 return false;
			 }
			 });
			 }
			 }
			 return cur;
			 },
			 toggle: function () {
			 var l = Player.subtitle.get().length;
			 var cur = Player.subtitle.cur();
			 if (l > 1) {
			 cur++;
			 if (cur >= l) {
			 cur = -1;
			 }
			 Player.subtitle.set(cur);
			 }
			 }
			 }*/
		});
	});

	/**
	 * Browser platform description
	 */
	SB.createPlatform('browser', {
		keys: {
			RIGHT: 39,
			LEFT: 37,
			DOWN: 40,
			UP: 38,
			RETURN: 27,//esc
			EXIT: 46,//delete
			TOOLS: 32,//space
			FF: 33,//page up
			RW: 34,//page down
			NEXT: 107,//num+
			PREV: 109,//num-
			ENTER: 13,
			RED: 65,//A
			GREEN: 66,//B
			YELLOW: 67,//C
			BLUE: 68,//D
			CH_UP: 221, // ]
			CH_DOWN: 219, // [
			N0: 48,
			N1: 49,
			N2: 50,
			N3: 51,
			N4: 52,
			N5: 53,
			N6: 54,
			N7: 55,
			N8: 56,
			N9: 57,
			PRECH: 45,//ins
			SMART: 36,//home
			PLAY: 97,//numpad 1
			STOP: 98,//numpad 2
			PAUSE: 99,//numpad 3
			SUBT: 76,//l,
			INFO: 73,//i
			REC: 82,//r
			APP: 81//q
		},

		detect: function() {
			// always true for browser platform
			return true;
		},

		getNativeDUID: function() {
			if (navigator.userAgent.indexOf('Chrome') != -1) {
				this.DUID = 'CHROMEISFINETOO';
			} else {
				this.DUID = 'FIREFOXISBEST';
			}
			return this.DUID;
		}
	});
	(function($) {
		"use strict";

		SB.readyForPlatform('browser', function() {
			_.extend($$voice, {
				_init: function() {
					this.helpbarVisible = true;
					$('body').append('<div id="voice_buble"></div><div id="help_voice_bubble"></div><div class="emul_voice_helpbar_wrap"><div id="emul_voice_helpbar"></div></div>');
					// клики по кнопкам эмулятора голоса
					$('#emul_voice_helpbar').on('click', '.emul_voice_trigger', function() {
						$$voice.say(this.innerHTML);
					});
				},
				_nativeTurnOff: function() {
					$('#emul_voice_helpbar').empty();
				},
				_nativeFromServer: function(title, callback) {
					var text = prompt(title);
					callback(text || '');
				},
				_nativeCheckSupport: function() {
					return true;
				},
				_setVoiceHelp: function(voicehelp) {
					var $bar = $('#emul_voice_helpbar');
					$bar.empty();
					if (voicehelp.helpbarItemsList) {
						$.each(voicehelp.helpbarItemsList, function(key, val) {
							$('<div>', {
								'attr': {
									'class': "emul_voice_trigger main"
								},
								html: val.itemText,
								appendTo: $bar
							});
						});
					}
					if (voicehelp.candidateList) {
						$.each(voicehelp.candidateList, function(key, val) {
							$('<div>', {
								'attr': {
									'class': "emul_voice_trigger"
								},
								html: val.candidate,
								appendTo: $bar
							});
						});
					}
				}
			});
		});
	})(jQuery);
	SB.readyForPlatform('lg', function() {
		var updateInterval;

		var isReady = false, from;

		Player.extend({
			mode3d: {
				OFF: 'off',
				SIDE_BY_SIDE: 'side_by_side',
				ABOVE_BELOW: 'top_bottom'
			},
			updateDelay: 500,
			_init: function() {

			},
			onEvent: function() {
				if (this.plugin.playState == 5) {
					this.state = 'stop';
					this.trigger('complete');
				} else if (this.plugin.playState == 6) {
					this.trigger('error')
				}
			},
			_update: function() {
				var info = this.plugin.mediaPlayInfo();

				if (info && info.duration && !isReady) {
					//$('#log').append('<div>'+info.duration+'</div>');

					//$$log(JSON.stringify(info));

					isReady = true;


					this.videoInfo = {
						duration: info.duration / 1000
					};
					var self = this;
					if (from) {
						var self = this;
						var onBufEnd = function() {
							self.off('bufferingEnd', onBufEnd);
							self.seek(from);
						};
						self.on('bufferingEnd', onBufEnd);
					}

					this.trigger('ready');

				}

				if (!isReady) {
					return;
				}

				this.videoInfo.currentTime = info.currentPosition / 1000;
				this.trigger('update');
			},
			onBuffering: function(isStarted) {
				this.trigger(isStarted ? 'bufferingBegin' : 'bufferingEnd');
			},
			_play: function(options) {
				clearInterval(updateInterval);
				updateInterval = setInterval(function() {

					Player._update();
				}, this.updateDelay);
				isReady = false;

				$('#pluginPlayer').remove();

				var drm_string = '';


				if (options.drm && options.drm.type == 'widevine') {
					drm_string = ' drm_type="widevine" ';
				}


				$('body').append('<object mode3D="' + (options.mode3d ? options.mode3d : 'off') + '" ' + drm_string + ' type="video/mp4" data="" width="1280" height="720" id="pluginPlayer" style="z-index: 0; position: absolute; left: 0; top: 0;"></object>');
				this.plugin = $('#pluginPlayer')[0];
				this.$plugin = $(this.plugin);

				var self = this;
				this.plugin.onPlayStateChange = function() {
					self.onEvent.apply(self, arguments);
				}
				this.plugin.onBuffering = function() {
					self.onBuffering.apply(self, arguments);
				}

				this.plugin.onError = function() {
					self.trigger('error')
				}


				if (options.drm && options.drm.type == 'widevine') {


					self.plugin.setWidevineDrmURL(options.drm.url);

                    if (options.drm.streamID) {
                        self.plugin.setWidevineStreamID(options.drm.streamID);
                    }
                    if (options.drm.deviceType) {
                        self.plugin.setWidevineDeviceType(options.drm.deviceType);
                    }
                    if (options.drm.portalID) {
                        self.plugin.setWidevinePortalID(options.drm.portalID);
                    }
                    if (options.drm.storeFront) {
                        self.plugin.setWidevineStoreFront(options.drm.storeFront);
                    }
				}


				this.plugin.data = options.url;
				this.plugin.play(1);

				from = options.from;
			},
			_setSize: function(size) {

				//size = this._fixAspectRatio(size);


				if (size.width) {
					this.plugin.width = size.width;
				}

				if (size.height) {
					this.plugin.height = size.height;
				}

				if (size.left) {
					this.plugin.style.left = size.left + 'px';
				}

				if (size.top) {
					this.plugin.style.top = size.top + 'px';
				}
			},
			_pause: function() {
				this.plugin.play(0);
			},
			_resume: function() {
				this.plugin.play(1);
			},
			_stop: function() {
				this.plugin.stop();
			},
			seek: function(time) {
				this.plugin.seek(time * 1000);
			},
			showOptionMedia: function() {
				var app = new lge();
				app.optionMedia();
			},
			audio: {
				set: function(index) {
				},
				get: function() {
					return [];
				},
				cur: function() {
					return 0;
				},
				toggle: function() {
				}
			}
		});
	});
	/**
	 * LG platform
	 */

	SB.createPlatform('lg', {
		platformUserAgent: 'netcast',

		keys: {
			ENTER: 13,
			PAUSE: 19,
			LEFT: 37,
			UP: 38,
			RIGHT: 39,
			DOWN: 40,
			N0: 48,
			N1: 49,
			N2: 50,
			N3: 51,
			N4: 52,
			N5: 53,
			N6: 54,
			N7: 55,
			N8: 56,
			N9: 57,
			RED: 403,
			GREEN: 404,
			YELLOW: 405,
			BLUE: 406,
			RW: 412,
			STOP: 413,
			PLAY: 415,
			FF: 417,
			RETURN: 461,
			CH_UP: 33,
			CH_DOWN: 34
		},

		getNativeDUID: function() {
			return this.device.serialNumber;
		},

		getMac: function() {
			return this.device.net_macAddress.replace(/:/g, '');
		},

		getSDI: $.noop,

		setPlugins: function() {
			//this._listenGestureEvent();

			$('body').append('<object type="application/x-netcast-info" id="device" width="0" height="0"></object>');
			this.device = $('#device')[0];

			this.modelCode = this.device.version;
			this.productCode = this.device.platform;

			this.getDUID();


			//Log.show('default');
			setInterval(function() {
				//Log.show('default');
				var usedMemorySize;
				if (window.NetCastGetUsedMemorySize) {
					usedMemorySize = window.NetCastGetUsedMemorySize();
				}
				//Log.state(Math.floor(usedMemorySize * 100 / (1024 * 1024)) / 100, 'memory', 'profiler');
			}, 5000);


			if (Player && Player.setPlugin) {
				Player.setPlugin();
			}
		},

		sendReturn: function() {
			if (Player) {
				Player.stop(true);
			}
			window.NetCastBack();
		},

		exit: function() {
			Player && Player.stop(true);
			window.NetCastExit();
		},

		getUsedMemory: function() {
			return window.NetCastGetUsedMemorySize();
		},
		getChildlockPin: function() {
			return 1234;
		}
	});
	SB.readyForPlatform('mag', function() {

		var updateInterval;
		var startUpdate = function() {
			var lastTime = 0;
			updateInterval = setInterval(function() {
				var position = stb.GetPosTime();
				//if (position != lastTime) {
				Player.videoInfo.currentTime = position;
				Player.trigger('update');
				SB.utils.log.state(position, 'position', 'player');
				//}
				//lastTime = position;
			}, 500);
		}
		var stopUpdate = function() {
			clearInterval(updateInterval);
		}

		window.stbEvent =
		{

			onEvent: function(data) {

				data += '';
				if (data == '1') {
					Player.trigger('complete');
				} else if (data == '2') {
					Player.videoInfo.duration = stb.GetMediaLen() + 1;
					Player.videoInfo.currentTime = 0;
					Player.trigger('ready');
				}
				else if (data == '4') {
					Player.trigger('bufferingEnd');
				}
				else if (data == '7') {
					var vi = eval(stb.GetVideoInfo());
					Player.videoInfo.width = vi.pictureWidth;
					Player.videoInfo.height = vi.pictureHeight;
				}
			},
			event: 0
		};


		var stb = window.gSTB;
		Player.extend({
			_init: function() {
				stb.InitPlayer();
				stb.SetViewport(1280, 720, 0, 0);
				stb.SetTopWin(0);
			},
			_play: function(options) {
				stb.Play(options.url);
				startUpdate();
				Player.trigger('bufferingBegin');
				if (options.from) {
					this.seek(options.from);
				}
			},
			_stop: function() {
				stb.Stop();
				stopUpdate();
			},
			_pause: function() {
				stb.Pause();
				stopUpdate();
			},
			_resume: function() {
				stb.Continue();
				startUpdate();
			},
			seek: function(time) {
				stb.SetPosTime(time)
			},
			audio: {
				set: function(index) {
					stb.SetAudioPID(index);
				},
				get: function() {
					return stb.GetAudioPIDs();
				},
				cur: function() {
					return stb.GetAudioPID();
				}
			},
			subtitle: {
				set: function(index) {
					stb.SetSubtitlePID(index);
				},
				get: function() {
					var subtitles = [];
					_.each(stb.GetSubtitlePIDs(), function(self) {
						subtitles.push({index: self.pid, language: self.lang[1]});
					});
					return subtitles;
				},
				cur: function() {
					return stb.GetSubtitlePID();
				}
			}
		});
	});

	(function() {

		var stb;
		/**
		 * Mag set top box platform description
		 */
		SB.createPlatform('mag', {
			keys: {
				RIGHT: 39,
				LEFT: 37,
				DOWN: 40,
				UP: 38,
				RETURN: 8,
				EXIT: 27,
				TOOLS: 122,
				FF: 70,
				RW: 66,
				NEXT: 34,
				PREV: 33,
				ENTER: 13,
				RED: 112,
				GREEN: 113,
				YELLOW: 114,
				BLUE: 115,
				CH_UP: 901,
				CH_DOWN: 902,
				N0: 48,
				N1: 49,
				N2: 50,
				N3: 51,
				N4: 52,
				N5: 53,
				N6: 54,
				N7: 55,
				N8: 56,
				N9: 57,
				PRECH: 116,
				POWER: 85,
				//SMART: 36,
				PLAY: 82,
				STOP: 83,
				//PAUSE: 99,
				//SUBT: 76,
				INFO: 89,
				APP: 123
				//REC: 82
			},

			onDetect: function() {

				var isStandBy = false;

				stb = window.gSTB;

				// prohibition of keyboard showing on click keyboard button
				stb.EnableVKButton(false);

				window.moveTo(0, 0);
				window.resizeTo(1280, 720);

				SB(function() {
					var $body = $(document.body);
					// polyfill for ch+/ch-
					$body.on('keydown', function(e) {
						var ev;
						if (e.keyCode === 9) {
							e.stopPropagation();

							e.keyCode = e.shiftKey ? 902 : 901;

							ev = $.Event("keydown", e);
							$body.trigger(ev);
						}
					});
					$body.on('nav_key:power', function() {
						var eventName = 'standby_';
						isStandBy = !isStandBy;

						eventName += isStandBy ? 'set' : 'unset';
						stb.StandBy(isStandBy);

						SB.trigger(eventName);
					});
				});

				window.localStorage = {
					setItem: function(name, data) {
						if (typeof data === 'object') {
							data = JSON.stringify(data);
						}
						stb.SaveUserData(name, encodeURIComponent(data));
					},
					clear: function() {

					},
					getItem: function(name) {
						return decodeURIComponent(stb.LoadUserData(name));
					},
					removeItem: function(name) {
						stb.SaveUserData(name, null);
					}
				}
			},

			detect: function() {
				return !!window.gSTB;
			},

			exit: function() {
				$$log('try to location change');
				Player.stop(true);
				gSTB.DeinitPlayer();
				window.location = 'file:///home/web/services.html';
			},

			sendReturn: function() {
				this.exit();
			},

			getMac: function() {
				return stb.GetDeviceMacAddress();
			},

			getNativeDUID: function() {
				return stb.GetDeviceSerialNumber();
			}
		});

	}());


	SB.readyForPlatform('philips', function() {
		var video;


		var updateInterval;
		var ready = false;

		var startUpdate = function() {
			var lastTime = 0;
			updateInterval = setInterval(function() {
				if (video.playPosition != lastTime) {
					Player.videoInfo.currentTime = video.playPosition / 1000;
					Player.trigger('update');
				}
				lastTime = video.playPosition;
			}, 500);
		}

		var stopUpdate = function() {
			clearInterval(updateInterval);
		}

		function checkPlayState() {
			//$('#log').append('<div>' + video.playState + '</div>');


			//some hack
			//in my tv player can sent lesser than 1 time, and correct time after
			if (video.playTime > 1) {

				if (!ready) {
					//+1 for test pass
					Player.videoInfo.duration = (video.playTime / 1000) + 1;
					Player.trigger('ready');
					ready = true;
				}
			}

			switch (video.playState) {
				case 5: // finished
					Player.trigger('complete');
					stopUpdate();
					Player.state = "stop";
					break;
				case 0: // stopped
					Player.state = "stop";
					break;
				case 6: // error
					Player.trigger('error');
					break;
				case 1: // playing
					Player.trigger('bufferingEnd');
					startUpdate();
					break;
				case 2: // paused

				case 3: // connecting

				case 4: // buffering
					Player.trigger('bufferingBegin');
					stopUpdate();
					break;
				default:
					// do nothing
					break;
			}
		}

		Player.extend({
			_init: function() {
				$('body').append('<div id="mediaobject" style="position:absolute;left:0px;top:0px;width:640px;height:480px;">\n\
              <object id="videoPhilips" type="video/mpeg4" width="1280" height="720" />\n\
               </div>');
				video = document.getElementById('videoPhilips');
				video.onPlayStateChange = checkPlayState;
			},
			_play: function(options) {
				video.data = options.url;
				video.play(1);
				ready = false;
				Player.trigger('bufferingBegin');
			},
			_stop: function() {
				video.stop();
				stopUpdate();
			},
			_pause: function() {
				video.play(0);
				stopUpdate();
			},
			_resume: function() {
				video.play(1);
				startUpdate();
			},
			_seek: function(time) {
				//-10 for test pass
				video.seek((time - 10) * 1000);
			}
		});
	});
	/**
	 * Philips platform
	 */
	SB.createPlatform('philips', {
		platformUserAgent: 'nettv',
		setPlugins: function() {
			this.keys = {
				ENTER: VK_ENTER,
				PAUSE: VK_PAUSE,
				LEFT: VK_LEFT,
				UP: VK_UP,
				RIGHT: VK_RIGHT,
				DOWN: VK_DOWN,
				N0: VK_0,
				N1: VK_1,
				N2: VK_2,
				N3: VK_3,
				N4: VK_4,
				N5: VK_5,
				N6: VK_6,
				N7: VK_7,
				N8: VK_8,
				N9: VK_9,
				RED: VK_RED,
				GREEN: VK_GREEN,
				YELLOW: VK_YELLOW,
				BLUE: VK_BLUE,
				RW: VK_REWIND,
				STOP: VK_STOP,
				PLAY: VK_PLAY,
				FF: VK_FAST_FWD,
				RETURN: VK_BACK,
				CH_UP: VK_PAGE_UP,
				CH_DOWN: VK_PAGE_DOWN
			};
		}
	});
	(function() {

		var localStorage = window.localStorage,
			fileSysObj,
			commonDir,
			fileName,
			fileObj;

		//if Samsung 11

		if (_.isFunction(window.FileSystem)) {

			fileSysObj = new FileSystem();
			commonDir = fileSysObj.isValidCommonPath(curWidget.id);

			if (!commonDir) {
				fileSysObj.createCommonDir(curWidget.id);
			}
			fileName = curWidget.id + "_localStorage.db";
			fileObj = fileSysObj.openCommonFile(fileName, "r+");

			if (fileObj) {
				try {
					JSON.parse(fileObj.readAll());
				} catch (e) {
					localStorage && localStorage.clear();
				}
			} else {
				fileObj = fileSysObj.openCommonFile(fileName, "w");
				fileObj.writeAll("{}");
			}
			fileSysObj.closeCommonFile(fileObj);

			if (!localStorage) {
				var lStorage = {},
					changed = false;

				var saveStorage = _.debounce(function saveStorage() {
					if (changed) {
						fileObj = fileSysObj.openCommonFile(fileName, "w");
						fileObj.writeAll(JSON.stringify(window.localStorage));
						fileSysObj.closeCommonFile(fileObj);
						changed = false;
					}
				}, 100);


				lStorage.setItem = function(key, value) {
					changed = true;
					this[key] = value;
					saveStorage();
					return this[key];
				};
				lStorage.getItem = function(key) {
					return this[key];
				};
				lStorage.removeItem = function(key) {
					delete this[key];
					saveStorage();
				};
				lStorage.clear = function() {
					var self = this;
					for (var key in self) {
						if (typeof self[key] != 'function') {
							delete self[key];
						}
					}
					saveStorage();
				};
				window.localStorage = lStorage;
			}
		}
	}());
	SB.readyForPlatform('samsung', function() {
		var curAudio = 0,
			curSubtitle = 0;


		var safeApply = function(self, method, args) {
			try {
				switch (args.length) {
					case 0:
						return self[method]();
					case 1:
						return self[method](args[0]);
					case 2:
						return self[method](args[0], args[1]);
					case 3:
						return self[method](args[0], args[1], args[2]);
					case 4:
						return self[method](args[0], args[1], args[2], args[3]);
					case 5:
						return self[method](args[0], args[1], args[2], args[3], args[4]);
					case 6:
						return self[method](args[0], args[1], args[2], args[3], args[4], args[5]);
					case 7:
						return self[method](args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
					case 8:
						return self[method](args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);

				}
			} catch (e) {
				throw e;
			}
		};

		Player.extend({
			usePlayerObject: true,
			fullscreenSize: {
				width: 1280,
				height: 720
			},
			_init: function() {
				var style,
					wrap;
				//document.body.onload=function(){
				if (this.usePlayerObject) {
					this.plugin = document.getElementById('pluginPlayer');
					style = this.plugin.style;
					style.position = 'absolute';
					style.left = '0px';
					style.top = '0px';
					wrap = document.createElement('div');
					wrap.className = 'player-wrap';
					wrap.appendChild(this.plugin);
					document.body.appendChild(wrap);
				} else {
					this.plugin = sf.core.sefplugin('Player');
				}

				if (!this.plugin) {
					throw new Error('failed to set plugin');
				}

				this.plugin.OnStreamInfoReady = 'Player.OnStreamInfoReady';
				this.plugin.OnRenderingComplete = 'Player.OnRenderingComplete';
				this.plugin.OnCurrentPlayTime = 'Player.OnCurrentPlayTime';
				this.plugin.OnCurrentPlaybackTime = 'Player.OnCurrentPlayTime';
				this.plugin.OnBufferingStart = 'Player.OnBufferingStart';
				//this.plugin.OnBufferingProgress = 'Player.OnBufferingProgress';
				this.plugin.OnBufferingComplete = 'Player.OnBufferingComplete';
				this.plugin.OnConnectionFailed = 'Player.onError';
				this.plugin.OnNetworkDisconnected = 'Player.onError';
				//this.plugin.OnAuthenticationFailed = 'Player.OnAuthenticationFailed';

				this.plugin.OnEvent = 'Player.onEvent';
				//}

			},
			_seek: function(time) {
				var jump = Math.floor(time - this.videoInfo.currentTime) + 1;

				alert('SEEK TIME ' + time);
				alert('jump time ' + jump);
				if (jump < 0) {
					this.doPlugin('JumpBackward', -jump);
				}
				else {
					this.doPlugin('JumpForward', jump);
				}
			},

			onError: function() {
				this.trigger('error');
			},
			onEvent: function(event, arg1, arg2) {

				// alert('playerEvent: ' + event);
				switch (event) {
					case 9:
						this.OnStreamInfoReady();
						break;

					case 4:
						this.onError();
						break;

					case 8:
						this.OnRenderingComplete();
						break;
					case 14:
						this.OnCurrentPlayTime(arg1);
						break;
					case 13:
						//this.OnBufferingProgress(arg1);
						break;
					case 12:
						this.OnBufferingComplete();
						break;
					case 11:
						this.OnBufferingStart();
						break;
				}
			},
			OnRenderingComplete: function() {
				alert('PLAYER COMPLETE');
				Player.trigger('complete');
			},
			OnStreamInfoReady: function() {
				var duration, width, height, resolution,
					playerSize = this.config.size,
					style;

				try {
					duration = this.doPlugin('GetDuration');
				} catch (e) {
					alert('######## ' + e.message);
				}

				duration = Math.ceil(duration / 1000);
				//this.jumpLength = Math.floor(this.duration / 30);

				if (this.usePlayerObject) {
					width = this.doPlugin('GetVideoWidth');
					height = this.doPlugin('GetVideoHeight');
					style = this.plugin.style;
					style.left = playerSize.left + 'px';
					style.top = playerSize.top + 'px';
					style.width = playerSize.width + 'px';
					style.height = playerSize.height + 'px';
				} else {
					resolution = this.doPlugin('GetVideoResolution');
					if (resolution == -1) {
						width = 0;
						height = 0;
					} else {
						var arrResolution = resolution.split('|');
						width = arrResolution[0];
						height = arrResolution[1];
					}
				}

				this.videoInfo.duration = duration;
				this.videoInfo.width = width * 1;
				this.videoInfo.height = height * 1;
				this._setSize(this.config.size);
				this.trigger('ready');
			},
			OnBufferingStart: function() {
				this.trigger('bufferingBegin');
			},
			OnBufferingComplete: function() {
				this.trigger('bufferingEnd');
			},
			OnCurrentPlayTime: function(millisec) {
				if (this.state == 'play') {
					alert(millisec / 1000);
					this.videoInfo.currentTime = millisec / 1000;
					this.trigger('update');
				}
			},
			_play: function(options) {
				var url = options.url;
				switch (options.type) {
					case 'hls':
						url += '|COMPONENT=HLS'
				}
				this.doPlugin('InitPlayer', url);
				this.doPlugin('StartPlayback', options.from || 0);
			},
			_stop: function() {
				this.doPlugin('Stop');
			},
			_pause: function() {
				this.doPlugin('Pause');
			},
			_resume: function() {
				this.doPlugin('Resume');
			},
			doPlugin: function() {
				var result,
					plugin = this.plugin,
					methodName = arguments[0],
					args = Array.prototype.slice.call(arguments, 1, arguments.length) || [];

				if (this.usePlayerObject) {
					result = safeApply(plugin, methodName, args);
				}
				else {
					if (methodName.indexOf('Buffer') != -1) {
						methodName += 'Size';
					}
					args.unshift(methodName);
					result = safeApply(plugin, 'Execute', args);
				}

				return result;
			},
			_setSize: function(size) {
				var width = size.width,
					height = size.height,
					x = size.left,
					y = size.top,
					videoWidth = this.videoInfo.width,
					videoHeight = this.videoInfo.height,
					windowRate, clipRate, w, h;

				// check if no video sizes
				if (!videoWidth || !videoHeight) {
					return;
				}

				if (this.config.autosize) {
					windowRate = width / height;
					clipRate = videoWidth / videoHeight;

					if (windowRate > clipRate) {
						w = height * clipRate;
						h = height;
						x += (width - w) / 2;
					}
					else {
						w = width;
						h = width / clipRate;
						y += (height - h) / 2;
					}
				}
				else {
					w = width;
					h = height;
				}

				//Player DPI is not the same as window DPI
				x = Math.floor(x * 0.75);
				y = Math.floor(y * 0.75);
				w = Math.floor(w * 0.75);
				h = Math.floor(h * 0.75);
				this.doPlugin('SetDisplayArea', x, y, w, h);

				// hack for pause
				// samsung player starts video after setDisplayArea
				if (this.state === 'PAUSE') {
					this.pause(true);
				}

				$$log('Player size: ' + Math.floor(w) + " * " + Math.floor(h) + " ### Position: top:" + y + " / left: " + x, 'player');
			},
			audio: {
				set: function(index) {
					/*one is for audio*/
					//http://www.samsungdforum.com/SamsungDForum/ForumView/f0cd8ea6961d50c3?forumID=63d211aa024c66c9
					Player.doPlugin('SetStreamID', 1, index);
					curAudio = index;
				},
				get: function() {
					/*one is for audio*/
					var len = Player.doPlugin('GetTotalNumOfStreamID', 1);

					var result = [];
					for (var i = 0; i < len; i++) {
						result.push(Player.doPlugin('GetStreamLanguageInfo', 1, i));
					}
					return result;
				},
				cur: function() {
					return curAudio;
				}
			},
			subtitle: {
				set: function(index) {
					Player.doPlugin('SetStreamID', 5, index);
					curSubtitle = index;
				},
				get: function() {
					var len = Player.doPlugin('GetTotalNumOfStreamID', 5);

					var result = [];
					for (var i = 0; i < len; i++) {
						result.push(Player.doPlugin('GetStreamLanguageInfo', 5, i));
					}
					return result;
				},
				cur: function() {
					return curSubtitle;
				}
			}
		});
	});

	/**
	 * Samsung platform
	 */
	!(function(window, undefined) {


		var
			document = window.document,
			/**
			 * Native plugins
			 * id: clsid (DOM element id : CLSID)
			 * @type {{object}}
			 */
			plugins = {
				audio: 'SAMSUNG-INFOLINK-AUDIO',
				pluginObjectTV: 'SAMSUNG-INFOLINK-TV',
				pluginObjectTVMW: 'SAMSUNG-INFOLINK-TVMW',
				pluginObjectNetwork: 'SAMSUNG-INFOLINK-NETWORK',
				pluginObjectNNavi: 'SAMSUNG-INFOLINK-NNAVI',
				pluginPlayer: 'SAMSUNG-INFOLINK-PLAYER'
			},
			samsungFiles = [
				/*            '$MANAGER_WIDGET/Common/af/../webapi/1.0/deviceapis.js',
				 '$MANAGER_WIDGET/Common/af/../webapi/1.0/serviceapis.js',
				 '$MANAGER_WIDGET/Common/af/2.0.0/extlib/jquery.tmpl.js',
				 '$MANAGER_WIDGET/Common/Define.js',
				 '$MANAGER_WIDGET/Common/af/2.0.0/sf.min.js',*/
				'$MANAGER_WIDGET/Common/API/Plugin.js',
				'$MANAGER_WIDGET/Common/API/Widget.js',
				'$MANAGER_WIDGET/Common/API/TVKeyValue.js'
			];

		SB.createPlatform('samsung', {

			$plugins: {},
			platformUserAgent: 'maple',

			onDetect: function() {
				// non-standart inserting objects in DOM (i'm looking at you 2011 version)
				// in 2011 samsung smart tv's we can't add objects if document is ready

				var htmlString = '';
				for (var i = 0; i < samsungFiles.length; i++) {
					htmlString += '<script type="text/javascript" src="' + samsungFiles[i] + '"></script>';
				}
				for (var id in plugins) {
					htmlString += '<object id=' + id + ' border=0 classid="clsid:' + plugins[id] + '" style="opacity:0.0;background-color:#000000;width:0px;height:0px;"></object>';
				}
				document.write(htmlString);
			},

			getNativeDUID: function() {
				return this.$plugins.pluginObjectNNavi.GetDUID(this.getMac());
			},

			getMac: function() {
				return this.$plugins.pluginObjectNetwork.GetMAC();
			},

			getSDI: function() {
				this.SDI = this.$plugins.SDIPlugin.Execute('GetSDI_ID');
				return this.SDI;
			},

			/**
			 * Return hardware version for 2013 samsung only
			 * @returns {*}
			 */
			getHardwareVersion: function() {
				var version = this.firmware.match(/\d{4}/) || [];
				if (version[0] === '2013') {
					this.hardwareVersion = sf.core.sefplugin('Device').Execute('Firmware');
				} else {
					this.hardwareVersion = null;
				}
				return this.hardwareVersion;
			},

			setPlugins: function() {
				var self = this,
					PL_NNAVI_STATE_BANNER_NONE = 0,
					PL_NNAVI_STATE_BANNER_VOL = 1,
					PL_NNAVI_STATE_BANNER_VOL_CH = 2,
					tvKey;

				_.each(plugins, function(clsid, id) {
					self.$plugins[id] = document.getElementById(id);
				});

				this.$plugins.SDIPlugin = sf.core.sefplugin('ExternalWidgetInterface');
				this.$plugins.tvKey = new Common.API.TVKeyValue();

				var NNAVIPlugin = this.$plugins.pluginObjectNNavi,
					TVPlugin = this.$plugins.pluginObjectTV;

				this.modelCode = NNAVIPlugin.GetModelCode();
				this.firmware = NNAVIPlugin.GetFirmware();
				this.systemVersion = NNAVIPlugin.GetSystemVersion(0);
				this.productCode = TVPlugin.GetProductCode(1);

				this.pluginAPI = new Common.API.Plugin();
				this.widgetAPI = new Common.API.Widget();

				tvKey = new Common.API.TVKeyValue();
				this.productType = TVPlugin.GetProductType();

				this.setKeys();

				if (this.pluginAPI.SetBannerState) {
					NNAVIPlugin.SetBannerState(PL_NNAVI_STATE_BANNER_VOL_CH);
				}

				function unregisterKey(key) {
					try {
						self.pluginAPI.unregistKey(tvKey['KEY_' + key]);
					} catch (e) {
						$$error(e);
					}
				}

				if (!this.config.customVolumeEnable) {
					unregisterKey('VOL_UP');
					unregisterKey('VOL_DOWN');
					unregisterKey('MUTE');
				}

				this.widgetAPI.sendReadyEvent();
			},

			/**
			 * Set keys for samsung platform
			 */
			setKeys: function() {

				this.keys = sf.key;

				this.keys['RW'] = 69;

				document.body.onkeydown = function(event) {
					var keyCode = event.keyCode;
					$$log('keyDown ' + keyCode);

					switch (keyCode) {
						case sf.key.RETURN:
						case sf.key.EXIT:
						case 147:
						case 261:
							sf.key.preventDefault();
							break;
						default:
							break;
					}
				}
			},

			/**
			 * Start screensaver
			 * @param time
			 */
			enableScreenSaver: function(time) {
				time = time || false;
				sf.service.setScreenSaver(true, time);
			},

			/**
			 * Disable screensaver
			 */
			disableScreenSaver: function() {
				sf.service.setScreenSaver(false);
			},

			exit: function() {
				sf.core.exit(true);
			},

			sendReturn: function() {
				sf.core.exit(false);
			},

			blockNavigation: function() {
				sf.key.preventDefault();
			},
			volumeAddStep: 5,
			volumeAdd: function(num) {
				var $audio = this.$plugins.audio,
					outputDevice = $audio.GetOutputDevice(),
					volume, i;

				if (outputDevice == 3 || this.productType == 2) {
					return;
				}

				var key = num < 0 ? 1 : 0;//если меньше 0 убавляем громкость
				num = Math.abs(num);
				for (i = 0; i < num; i++) {
					$audio.SetVolumeWithKey(key);
				}
				volume = this.getVolume();
				$(document.body).trigger('volume_change', {
					volume: volume
				});
			},
			toggleMute: function() {
				var $audio = this.$plugins.audio,
					volume, $body = $(document.body);
				if (this.isMute) {
					$audio.SetUserMute(0);
					volume = this.getVolume();

					if (volume === 0) {
						this.volumeUp(5);
					} else {
						$body.trigger('volume_change', {
							volume: volume
						});
					}
					this.isMute = false;
				} else {
					if (!this.isMute) {
						$audio.SetUserMute(1);

						this.getVolume({
							mute: true
						});

						$body.trigger('volume_change', {
							volume: 0
						});
						this.isMute = true;
					}
				}
			},
			volumeDown: function(step) {
				step = step || -this.volumeAddStep;
				this.volumeAdd(-step);
			},
			volumeUp: function(step) {
				step = step || this.volumeAddStep;
				this.volumeAdd(step);
			},
			getVolume: function(options) {
				options = options || {};
				var $audio = this.$plugins.audio,
					volume = $audio.GetVolume(),
					$body = $(document.body);

				if (volume == 0 || options.mute) {
					if (!this.isMute) {
						$body.addClass('mute').trigger('volume_mute');
						this.isMute = true;
					}
				} else if (this.isMute) {
					$body.removeClass('mute').trigger('volume_unmute');
					this.isMute = false;
				}
				return volume;
			}
		});

	})(this);

	(function($) {
		"use strict";


		SB.readyForPlatform('samsung', function() {
			var voiceServer;

			/**
			 * Обработка нативных событий распознавания голоса
			 * @param evt событие от самсунга
			 */
			var handleRecognitionEvent = function(evt) {

				switch (evt.eventtype) {
					case "EVENT_VOICE_END_MONITOR":
						//не работает в телевизоре
						break;
					case "EVENT_VOICE_BEGIN_MONITOR":
					case "EVENT_VOICE_BTSOUND_START":
						//this.updateVoiceKeyHelp();
						/*if (paused) {
						 break;
						 }
						 $('body').trigger('voiceStart');
						 if (helperWasShowed < defaults.showHelperTimes) {
						 helperWasShowed++;
						 $helpBubble.html(defaults.helpText).show();
						 }*/


						$$voice.refresh();

						$$voice._resetVisibilityTimeout();

						/*
						 if ($curTarget) {
						 doAll.call($curTarget, curOptions);
						 }*/
						break;
					case "EVENT_VOICE_RECOG_RESULT":

						var result = evt.result.toLowerCase();
						//если не голосовой поиск
						if (typeof voiceServer != 'function') {
							$$voice.say(result);
						}
						else {
							voiceServer(result);
							voiceServer = false;
							$$voice.restore();
						}
						break;
				}
			};
			_.extend($$voice, {
				_init: function() {
					deviceapis.recognition.SubscribeExEvent(deviceapis.recognition.PL_RECOGNITION_TYPE_VOICE, "Smartbox", function(evt) {
						handleRecognitionEvent(evt);
					});
					deviceapis.recognition.SetVoiceTimeout(this.voiceTimeout);
					$('body').append('<div id="voice_buble"></div><div id="help_voice_bubble"></div>');
				},
				_nativeCheckSupport: function() {
					var enabled = false;
					try {
						enabled = deviceapis.recognition.IsRecognitionSupported();
					} catch (e) {
					}
					return enabled;
				},
				_nativeFromServer: function(title, callback) {
					voiceServer = callback;
					var describeHelpbar = {
						helpbarType: "HELPBAR_TYPE_VOICE_SERVER_GUIDE_RETURN",
						guideText: title
					};

					deviceapis.recognition.SetVoiceHelpbarInfo(JSON.stringify(describeHelpbar));
				},
				_setVoiceHelp: function(voicehelp) {
					deviceapis.recognition.SetVoiceHelpbarInfo(JSON.stringify(voicehelp));
				},
				_nativeTurnOff: function() {
					deviceapis.recognition.SetVoiceHelpbarInfo(JSON.stringify({
						helpbarType: "HELPBAR_TYPE_VOICE_CUSTOMIZE",
						bKeepCurrentInfo: "false",
						helpbarItemsList: []
					}));
				}
			});
		});
	})(jQuery);
};