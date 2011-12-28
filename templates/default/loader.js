(function() {

	// container for turtles
	var rootElement = "#main";

	/*
	 * We are extending the main turtles class with a specific grow function for
	 * our situation. This grow function will automatically load the correct
	 * turtle and create a placeholder.
	 */
	TurtleManager.prototype.grow = function(id, options) {
		if (options == null || typeof options != "object")
			options = {};

		// default group is the turtle's name. if a manual group name is passed,
		// the turtle will be grouped in a different placeholder class
		if (!options.group)
			options.group = id;

		// create placeholder and append it to the root element
		options.el = $('<section class="turtle" data-group="' + options.group + '"></section>');
		$(rootElement).append(options.el);
		
		// enables remote turtles
		if (!options.source)
			options.source = 'turtles/' + id + '/' + id + '.js';

		if (!this.registered(id)) {
			var self = this;
			// load turtle javascript
			$.ajax({
				url : options.source,
				dataType : 'script',
				async : false, // to prevent duplicate javascript file loading
				success : function() {
					self.instantiate(id, options);
				}
			});
		} else {
			this.instantiate(id, options);
		}
	}

	// register the Turtles object on the global namespace
	if (!((global = typeof exports !== "undefined" && exports !== null ? exports
			: window).Turtles != null)) {
		global.Turtles = new TurtleManager();
	}

})();