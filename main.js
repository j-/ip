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
		this.$el.on('keypress', this.updateValue);
		this.$el.on('keyup', this.updateValue);
	},
	stop: function () {
		this.sup('stop');
		this.$el.off('keypress', this.updateValue);
		this.$el.off('keyup', this.updateValue);
	}
});

var OutputView = ok.$View.extend({
	update: function (prop, ip) {
		var valid = ip.isValid();
		this.updateDottedDecimal(ip, valid);
		this.updateDottedOctal(ip, valid);
		this.updateDottedHexadecimal(ip, valid);
		this.updateFlatDecimal(ip, valid);
		this.updateFlatOctal(ip, valid);
		this.updateFlatHexadecimal(ip, valid);
	},
	updateDottedDecimal: function (ip, valid) {
		var value = IP.format(ip, 10);
		var $output = this.$('.output-dotted-decimal')
			.toggleClass('is-invalid', !valid);
		if (valid) {
			$output.text(value).attr('href', 'http://' + value);
		}
	},
	updateDottedOctal: function (ip, valid) {
		var value = IP.format(ip, 8);
		var $output = this.$('.output-dotted-octal')
			.toggleClass('is-invalid', !valid);
		if (valid) {
			$output.text(value).attr('href', 'http://' + value);
		}
	},
	updateDottedHexadecimal: function (ip, valid) {
		var value = IP.format(ip, 16);
		var $output = this.$('.output-dotted-hexadecimal')
			.toggleClass('is-invalid', !valid);
		if (valid) {
			$output.text(value).attr('href', 'http://' + value);
		}
	},
	updateFlatDecimal: function (ip, valid) {
		var value = IP.formatPart(ip, 10);
		var $output = this.$('.output-flat-decimal')
			.toggleClass('is-invalid', !valid);
		if (valid) {
			$output.text(value).attr('href', 'http://' + value);
		}
	},
	updateFlatOctal: function (ip, valid) {
		var value = IP.formatPart(ip, 8);
		var $output = this.$('.output-flat-octal')
			.toggleClass('is-invalid', !valid);
		if (valid) {
			$output.text(value).attr('href', 'http://' + value);
		}
	},
	updateFlatHexadecimal: function (ip, valid) {
		var value = IP.formatPart(ip, 16);
		var $output = this.$('.output-flat-hexadecimal')
			.toggleClass('is-invalid', !valid);
		if (valid) {
			$output.text(value).attr('href', 'http://' + value);
		}
	},
	start: function () {
		this.sup('start');
		this.listenTo(this.watch, 'change', this.update, this);
	},
	stop: function () {
		this.sup('stop');
		this.stopListening(this.watch, 'change', this.update, this);
	}
});

var App = ok.Controller.extend({
	init: function (options) {
		// initialize properties
		this.inputValue = ok.Property.create();
		this.ip = ok.Property.create(new IP('127.0.0.1'));
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
		this.updateValue();
	},
	updateValue: function () {
		var val = this.inputValue.get();
		var ip = new IP(val);
		this.ip.set(ip);
	},
	start: function () {
		this.inputView.render();
		this.outputView.render();
		this.inputView.start();
		this.outputView.start();
		this.updateValue();
	}
});

var app = App.create();

$(function () {
	app.inputView.setElement($('#input'));
	app.outputView.setElement($('#output'));
	app.start();
});

})();