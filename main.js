(function () {

var InputView = ok.$View.extend({
	init: function () {
		this.sup('init');
		_.bindAll(this, 'updateValue');
		this.listenTo(this.watch, 'change', this.showValue, this);
	},
	setElement: function () {
		this.sup('setElement', arguments);
		this.getValue();
	},
	getValue: function () {
		return this.$el.val();
	},
	setValue: function (value) {
		this.watch.set(value);
	},
	showValue: function () {
		this.$el.val(this.watch.get());
	},
	updateValue: function () {
		var value = this.getValue();
		this.setValue(value);
	},
	start: function () {
		this.sup('start');
		this.$el.on('keypress', this.updateValue);
		this.$el.on('keyup', this.updateValue);
	},
	stop: function () {
		this.sup('stop');
		this.$el.off('keypress', this.updateValue);
		this.$el.off('keyup', this.updateValue);
	}
});

var ActionsView = ok.$View.extend({
	init: function (options) {
		_.bindAll(this, 'loadPublicIP');
		this.inputValue = options.inputValue;
	},
	setInputValue: function (val) {
		this.inputValue.set(val);
	},
	loadPublicIP: function () {
		var context = this;
		this.$('.action-public-ip').button('loading');
		$.get('http://ipinfo.io', function (response) {
			var ip = response.ip;
			context.$('.action-public-ip').button('reset');
			context.setInputValue(ip);
		}, 'jsonp');
	},
	start: function () {
		this.sup('start');
		this.$el.on('click', '.action-public-ip', this.loadPublicIP);
	},
	stop: function () {
		this.sup('stop');
		this.$el.off('click', '.action-public-ip', this.loadPublicIP);
	}
});

var ValueView = ok.$View.extend({
	init: function () {
		this.listenTo(this.watch, 'change', this.handleChange, this);
	},
	handleChange: function (prop, ip) {
		var value = this.format(ip);
		this.updateValue(value);
	},
	toggleValid: function (valid) {
		this.$el.toggleClass('is-invalid', !valid);
	},
	updateValue: function (formatted) {
		this.$el.text(formatted);
	},
	render: function () {
		this.sup('render');
		this.updateValue(this.watch.get());
	},
	// virtual
	format: function () {
		return null;
	}
});

var ValueLinkView = ValueView.extend({
	handleChange: function (prop, ip) {
		var valid = ip.isValid();
		var value = this.format(ip);
		this.toggleValid(valid);
		if (valid) {
			this.updateValue(value);
		}
	},
	updateValue: function (formatted) {
		this.sup('updateValue', arguments);
		this.$el.attr('href', 'http://' + formatted);
	}
});

var DottedOctalView = ValueLinkView.extend({
	format: function (ip) {
		return IP.format(ip, 8);
	}
});

var DottedDecimalView = ValueLinkView.extend({
	format: function (ip) {
		return IP.format(ip, 10);
	}
});

var DottedHexadecimalView = ValueLinkView.extend({
	format: function (ip) {
		return IP.format(ip, 16);
	}
});

var FlatOctalView = ValueLinkView.extend({
	format: function (ip) {
		return IP.formatPart(ip, 8);
	}
});

var FlatDecimalView = ValueLinkView.extend({
	format: function (ip) {
		return IP.formatPart(ip, 10);
	}
});

var FlatHexadecimalView = ValueLinkView.extend({
	format: function (ip) {
		return IP.formatPart(ip, 16);
	}
});

var IsValidView = ValueView.extend({
	format: function (ip) {
		var valid = IP.isValid(ip);
		return valid ? 'yes' : 'no';
	},
	updateValue: function (formatted) {
		this.sup('updateValue', arguments);
		var valid = IP.isValid(this.watch.get());
		this.$el.toggleClass('text-success', valid);
		this.$el.toggleClass('text-danger', !valid);
	}
});

var ClassView = ValueView.extend({
	format: function (ip) {
		var n = IP.getClass(ip);
		var valid = IP.isValid(ip);
		return valid ? n : '';
	}
});

var ClassRangeView = ValueView.extend({
	rangeText: {
		A:   '0.0.0.0\u2014127.255.255.255',
		B: '128.0.0.0\u2014191.255.255.255',
		C: '192.0.0.0\u2014223.255.255.255',
		D: '224.0.0.0\u2014239.255.255.255',
		E: '240.0.0.0\u2014255.255.255.255'
	},
	format: function (ip) {
		var n = IP.getClass(ip);
		var valid = IP.isValid(ip);
		return valid ? this.rangeText[n] : '';
	}
});

var OutputView = ok.$View.extend({
	init: function () {
		var options = { watch: this.watch };
		this.dottedOctalView = this.addChildView(DottedOctalView, options);
		this.dottedDecimalView = this.addChildView(DottedDecimalView, options);
		this.dottedHexadecimalView = this.addChildView(DottedHexadecimalView, options);
		this.flatOctalView = this.addChildView(FlatOctalView, options);
		this.flatDecimalView = this.addChildView(FlatDecimalView, options);
		this.flatHexadecimalView = this.addChildView(FlatHexadecimalView, options);
		this.isValidView = this.addChildView(IsValidView, options);
		this.classView = this.addChildView(ClassView, options);
		this.classRangeView = this.addChildView(ClassRangeView, options);
	},
	setElement: function (el) {
		var hasElement = this.el;
		this.sup('setElement', [el]);
		if (!hasElement) {
			return;
		}
		this.dottedOctalView.setElement(this.$('.output-dotted-octal'));
		this.dottedDecimalView.setElement(this.$('.output-dotted-decimal'));
		this.dottedHexadecimalView.setElement(this.$('.output-dotted-hexadecimal'));
		this.flatOctalView.setElement(this.$('.output-flat-octal'));
		this.flatDecimalView.setElement(this.$('.output-flat-decimal'));
		this.flatHexadecimalView.setElement(this.$('.output-flat-hexadecimal'));
		this.isValidView.setElement(this.$('.output-is-valid'));
		this.classView.setElement(this.$('.output-class'));
		this.classRangeView.setElement(this.$('.output-class-range'));
	}
});

var ValueStore = ok.Controller.extend({
	key: 'latest-value',
	init: function (options) {
		this.watch = options.watch;
		this.listenTo(this.watch, 'change', this.saveValue, this);
	},
	loadValue: function () {
		var value = localStorage.getItem(this.key);
		if (value) {
			this.watch.set(value);
		}
	},
	saveValue: function () {
		var value = this.watch.get();
		localStorage.setItem(this.key, value);
	}
});

var App = ok.Controller.extend({
	init: function (options) {
		// initialize properties
		this.inputValue = ok.Property.create();
		this.ip = ok.Property.create();
		// initialize other controllers
		this.valueStore = ValueStore.create({
			watch: this.inputValue
		});
		// initialize views
		this.inputView = InputView.create({
			watch: this.inputValue
		});
		this.actionsView = ActionsView.create({
			inputValue: this.inputValue
		});
		this.outputView = OutputView.create({
			watch: this.ip
		});
		// initialize listeners
		this.listenTo(this.inputValue, 'change', this.handleChange, this);
	},
	handleChange: function () {
		this.readInput();
	},
	readInput: function () {
		var val = this.inputValue.get();
		if (typeof val === 'string') {
			val = val.replace(/\s+|\s+/g, '');
		}
		var ip = new IP(val);
		this.ip.set(ip);
	},
	start: function () {
		this.inputView.render();
		this.outputView.render();
		this.actionsView.render();
		this.inputView.start();
		this.outputView.start();
		this.actionsView.start();
		this.readInput();
		this.valueStore.loadValue();
	}
});

var app = App.create();

$(function () {
	app.inputView.setElement($('#input'));
	app.actionsView.setElement($('#actions'));
	app.outputView.setElement($('#output'));
	app.start();
});

})();