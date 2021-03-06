(function($) {
	var collection = Backbone.Collection.extend({
		initialize : function(models, options) {
			// prevents loss of 'this' inside methods
			_.bindAll(this, "refresh");

			// bind refresh
			this.bind("born", this.refresh);
			this.bind("refresh", this.refresh);

			thatdl = this;

			// default error value
			options.error = false;

			// automatic collection refresh each minute, this will 
			// trigger the reset event
			refreshInterval = window.setInterval(this.refresh, 30000);
		},
		refresh : function() {
			var self = this;
			self.fetch({
				error : function() {
					// will allow the view to detect errors
					self.options.error = true;

					// if there are no previous items to show, display error message
					if(self.length == 0)
						self.trigger("reset");
				}
			});
		},
		url : function() {
            var latitude = this.options.location.split(';')[0];
            var longitude = this.options.location.split(';')[1];
        
            return "http://data.irail.be/Bikes/Velo.json?lat=" + encodeURIComponent(latitude) + "&long=" + encodeURIComponent(longitude) + "&offset=0&rowcount=15";
		},
		capitalizeWords: function (strSentence) {
			return strSentence.toLowerCase().replace(/\b[a-z]/g, convertToUpper);

			function convertToUpper() {
				return arguments[0].toUpperCase();
			}
		}, 
		parse : function(json) {
            var velo = json.Velo;
            
            if(velo.length <= 0) {
                return undefined;
            }
            
            for(var i in velo) {
                velo[i].distance = Math.round(parseInt(velo[i].distance)/10)*10;
				velo[i].name = this.capitalizeWords(jQuery.trim(velo[i].name));
            }
            
            return velo;
		}
	});

	var view = Backbone.View.extend({
		initialize : function() {
			// prevents loss of 'this' inside methods
			_.bindAll(this, "render");
			// bind render to collection reset

			this.collection.bind("reset", this.render);

			// pre-fetch template file and render when ready
			var self = this;
			if (this.template == null) {
				$.get("turtles/velo/list.html", function(template) {
					self.template = template;
					self.render();
				});
			}
		},
		render : function() {
			// only render when template file is loaded
			if (this.template) {
				var data = {
					entries : this.collection.toJSON(),
					error : this.options.error, // have there been any errors?
					i18n : this.options.i18n
				};

				// add html to container
				this.$el.html($.tmpl(this.template, data));

				// notify listeners render completed and pass element
				this.trigger("rendered", this.$el);
			}
		}
	});

	// register turtle
	Turtles.register("velo", {
		collection : collection,
		view : view
	});

})(jQuery);