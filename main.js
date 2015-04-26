(function () {

var InputView = ok.$View.extend({
	init: function () {
		this.sup('init');
		_.bindAll(this, 'updateValue');
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
	updateValue: function () {
		var value = this.getValue().replace(/\s+|\s+/g, '');
		this.setValue(value);
	},
	start: function () {
		this.sup('start');
		this.updateValue();
		this.$el.on('keypress', this.updateValue);
		this.$el.on('keyup', this.updateValue);
	},
	stop: function () {
		this.sup('stop');
		this.$el.off('keypress', this.updateValue);
		this.$el.off('keyup', this.updateValue);
	}
});

var ValueView = ok.$View.extend({
	init: function () {
		this.listenTo(this.watch, 'change', this.handleChange, this);
		this.updateValue(this.watch);
	},
	handleChange: function (prop, ip) {
		var valid = ip.isValid();
		this.toggleValid(valid);
		if (valid) {
			this.updateValue(ip);
		}
	},
	toggleValid: function (valid) {
		this.$el.toggleClass('is-invalid', !valid);
	},
	updateValue: function (ip) {
		var formatted = this.format(ip);
		this.$el.text(formatted).attr('href', 'http://' + formatted);
	},
	// virtual
	format: function () {
		return null;
	}
});

var DottedOctalView = ValueView.extend({
	format: function (ip) {
		return IP.format(ip, 8);
	}
});

var DottedDecimalView = ValueView.extend({
	format: function (ip) {
		return IP.format(ip, 10);
	}
});

var DottedHexadecimalView = ValueView.extend({
	format: function (ip) {
		return IP.format(ip, 16);
	}
});

var FlatOctalView = ValueView.extend({
	format: function (ip) {
		return IP.formatPart(ip, 8);
	}
});

var FlatDecimalView = ValueView.extend({
	format: function (ip) {
		return IP.formatPart(ip, 10);
	}
});

var FlatHexadecimalView = ValueView.extend({
	format: function (ip) {
		return IP.formatPart(ip, 16);
	}
});

var OutputView = ok.$View.extend({
	init: function () {
		var options = { watch: this.watch };
		this.dottedOctalView = DottedOctalView.create(options);
		this.dottedDecimalView = DottedDecimalView.create(options);
		this.dottedHexadecimalView = DottedHexadecimalView.create(options);
		this.flatOctalView = FlatOctalView.create(options);
		this.flatDecimalView = FlatDecimalView.create(options);
		this.flatHexadecimalView = FlatHexadecimalView.create(options);
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
	}
});

var App = ok.Controller.extend({
	init: function (options) {
		// initialize properties
		this.inputValue = ok.Property.create();
		this.ip = ok.Property.create();
		// initialize views
		this.inputView = InputView.create({
			watch: this.inputValue
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
		var ip = new IP(val);
		this.ip.set(ip);
	},
	start: function () {
		this.inputView.render();
		this.outputView.render();
		this.inputView.start();
		this.outputView.start();
		this.readInput();
	}
});

var app = App.create();

$(function () {
	app.inputView.setElement($('#input'));
	app.outputView.setElement($('#output'));
	app.start();
});

})();