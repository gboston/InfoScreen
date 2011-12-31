(function($) {
	
	var model = Backbone.Model.extend({});

	var collection = Backbone.Collection.extend({
		initialize : function(models, options) {
			// prevents loss of 'this' inside methods
			_.bindAll(this, "refresh");
			
			// bind refresh
			this.bind("born", this.refresh);
			this.bind("refresh", this.refresh);
			
			// automatic collection refresh each minute, this will automatically
			// trigger the reset event
			refreshInterval = window.setInterval(this.refresh, 60000);
		},
		refresh : function() {
			this.fetch({
				data : {
					direction : this.options.direction || "departures" ,
					lang : this.options.lang || "en"
				}
			});
		},
		url : function() {
		    var currentTime = new Date()
                    var month = currentTime.getMonth() + 1
		    var day = currentTime.getDate()
		    var year = currentTime.getFullYear()
		    var minutes = currentTime.getMinutes()
		    var hours = currentTime.getHours()
		    if (minutes < 10){
			minutes = "0" + minutes
		    }
		    if (hours < 10){
			hours = "0" + hours
		    }
		    if(month < 10)
			month = "0" + month
		    if(day <10){
			day = "0" + day
		    }
			// remote source url
			return "http://data.irail.be/Airports/Liveboard/" + this.options.location + "/" + year + "/" + month + "/" + day + "/" +hours + "/" + minutes+ ".json";
		},
		parse : function(json) {
			// parse ajax results
			var liveboard = json.Liveboard.departures || json.Liveboard.arrivals;

			for (var i in liveboard) {
				liveboard[i].delay = liveboard[i].delay ? this.formatTime(liveboard[i].time + liveboard[i].delay) : false;
				liveboard[i].time = this.formatTime(liveboard[i].time);
			}
			
			return liveboard;
		},
		formatTime : function(timestamp) {
			var time = new Date(timestamp * 1000);
			var hours = time.getHours();
			var minutes = time.getMinutes();
			return (hours < 10 ? '0' : '') + hours + ':'
					+ (minutes < 10 ? '0' : '') + minutes;
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
			if(this.template == null) {
				$.get("turtles/airport/list.html", function(template) {
					self.template = template;
					self.render();
				});
			}
		},
		render : function() {
			// only render when template file is loaded
			if(this.template) {
				var data = {
					direction : this.options.direction || "departures",
					airport : this.options.location,
					entries : this.collection.toJSON(),
				};
				
				this.el.html($.tmpl(this.template, data)).trigger("rendered");
			}
		}
	});

	// register turtle
	Turtles.register("airport", {
		collection : collection,
		view : view,
		model : model
	});

})(jQuery);
