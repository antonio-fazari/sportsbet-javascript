'use strict';

var Parser = (function() {

	function Parser(data) {
		this.data = data;
	}

	Parser.prototype.getData = function() {
	  return this.data;
	};

	Parser.prototype.getCompetitionEvents = function(competitionName) {
	  var events;
	  var competitions = this.data.Sportsbet.Competition;

	  for (var i in competitions) {
	  	if (competitions[i].CompetitionName === competitionName) {
	  		events = competitions[i].Round.Event;
	  	}
	  }

	  return events;
	};

	Parser.prototype.getAllVenues = function(events) {
		var venues = [];
		var venueIsPresent;

		for (var i in events) {
			for (var j = 0; j < venues.length; j++) {
				if (venues[j] == events[i].Venue) {
					venueIsPresent = true;
					break;
				} else {
					venueIsPresent = false;
				}
			}

			if (!venueIsPresent) {
				venues.push(events[i].Venue);
			}
		}

		return venues;
	}

	Parser.prototype.filterEventsByType = function(events, marketType) {
		var filteredEvents = [];
		var key = marketType.replace(/\s/g, '');

		for (var i in events) {
			if (events[i].Market !== undefined && events[i].Market instanceof Object) {
				// This event does not have multiple markets.
				if (events[i].Market.Type === marketType) {
					events[i][key] = events[i].Market;
					filteredEvents.push(events[i]);
				}
			} else if (events[i].Market !== undefined && events[i].Market instanceof Array) {
				// This event has multiple markets, check if the given type is one
				// of them.
				for (var j in events[i].Market) {
					if (events[i].Market[j].Type === marketType) {
						events[i][key] = events[i].Market[j];
						filteredEvents.push(events[i]);
					}
				}
			}
		}

		return filteredEvents;
	}

	Parser.prototype.filterEventsByVenue = function(events, venue) {
		var filteredEvents = [];

		for (var i in events) {
			// Cycle through each event and filter events with the given venue.
			var Venue = events[i].Venue.toLowerCase();
			if (Venue !== undefined && Venue === venue) {
				filteredEvents.push(events[i]);
			}
		}

		return filteredEvents;
	};

	return Parser;
})();
