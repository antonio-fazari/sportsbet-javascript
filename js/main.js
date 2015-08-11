'use strict';

/**
 * Get url parameters.
 */
var urlParams;
(window.onpopstate = function () {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query)) {
       urlParams[decode(match[1]).toLowerCase()] = decode(match[2]).toLowerCase();
    }
})();

/**
 * Load and parse sportsbet data.
 */
function loadSportBetData(data) {
	// Hide loading message.
	document.getElementsByClassName('message')[0].style.display = 'none';

	// Initiate parser.
  var parser = new Parser(data);
  var events = parser.getCompetitionEvents('Horses - Aus/NZ');
      events = parser.filterEventsByType(events, 'Fixed Odds');
  // Get all venues and populate the select filter.
  var venues = parser.getAllVenues(events);
  populateVenueFilter(venues);

  if (urlParams.venue !== undefined && urlParams.venue) {
  	var subtitle = document.getElementsByClassName('subtitle')[0];
  			subtitle.innerHTML = urlParams.venue;
  	events = parser.filterEventsByVenue(events, urlParams.venue);
  }

  var eventsElement = document.getElementById('events');
  var storedElements = [];
  // Cycle through events and populate the html.
  for (var i in events) {
  	var eventElement = createEventElement(events[i]);
  			eventsElement.appendChild(eventElement);
  	// Store the newly created element.
  	storedElements.push(eventElement);
  }

  // Build jump timer for each of the events.
  setInterval(function() {
  	for (var i in storedElements) {
  		var eventJumpTime = storedElements[i].getElementsByClassName('event-jump-time')[0];
  		var utcDate = eventJumpTime.getAttribute('data-utc-date');
  		eventJumpTime.innerHTML = 'Jump time: ' + getEventJumpTime(utcDate);
  	}
  }, 1000);
}

/**
 * Populate venue filter with venue options.
 */
function populateVenueFilter(venues) {
	var venueFilter = document.getElementById('venue-filter');
			venueFilter.addEventListener('change', filterByVenue);

	for (var i = 0; i < venues.length; i++) {
		var option = document.createElement('option');
				option.value = venues[i].toLowerCase();
				option.innerHTML = venues[i];

		venueFilter.appendChild(option);
	}
}

/**
 * Filter by venue for change event.
 */
function filterByVenue() {
	var href;
	var venue = document.getElementById('venue-filter').value;
	// IE Fix - window.location.origin doesn't exist.
	if (window.location.origin === undefined) {
		window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
	}
	if (venue !== 'default' && venue) {
		var base = window.location.origin + window.location.pathname;

		if (venue !== 'all') {
			href = base + '?venue=' + venue;
		} else {
			href = base;
		}
	}

	window.location.href = href;
}

/**
 * Create event header element.
 */
function createEventHeaderElement(event) {
	var el = document.createElement('div');
			el.className = 'event__header';

	var eventName = document.createElement('h2');
			eventName.className = 'event-name';
			eventName.innerHTML = event.EventName;

	var eventVenue = document.createElement('h3');
			eventVenue.className = 'event-venue';
			eventVenue.innerHTML = event.Venue;

	var utcDate = moment.utc(event.EventDate).toDate();
	var formattedDate = moment(utcDate).format('DD/MM/YYYY	HH:mm a');
	var jumpTime = getEventJumpTime(utcDate);

	var eventDate = document.createElement('span');
			eventDate.className = 'event-date';
			eventDate.innerHTML = 'Event Date: ' + formattedDate;

	var eventMarketType = document.createElement('span');
			eventMarketType.className = 'event-market-type';
			eventMarketType.innerHTML = 'Market Type: ' + event.FixedOdds.Type;

	var eventJumpTime = document.createElement('span');
			eventJumpTime.className = 'event-jump-time';
			eventJumpTime.setAttribute('data-utc-date', utcDate);
			eventJumpTime.innerHTML = 'Jump time: ' + jumpTime;

	el.appendChild(eventName);
	el.appendChild(eventVenue);
	el.appendChild(eventDate);
	el.appendChild(eventMarketType);
	el.appendChild(eventJumpTime);

	return el;
}

/**
 * Create event runners element
 */
function createEventRunnersElement(event) {
	var el = document.createElement('div');
			el.className = 'event__runners';
	var eventSelections = event.FixedOdds.EventSelections;
	// Create table element.
	var runnerTable = document.createElement('table');
	var runnerTableHeaderRow = document.createElement('tr');
	// Set the table headers.
	var runnerTableHeaderHeadingOne = document.createElement('th');
			runnerTableHeaderHeadingOne.innerHTML = 'Runners';
	var runnerTableHeaderHeadingTwo = document.createElement('th');
			runnerTableHeaderHeadingTwo.innerHTML = 'Odds';

	// Append headings to the table row and then to the table.
	runnerTableHeaderRow.appendChild(runnerTableHeaderHeadingOne);
	runnerTableHeaderRow.appendChild(runnerTableHeaderHeadingTwo);
	runnerTable.appendChild(runnerTableHeaderRow);

	for (var i in eventSelections) {
		var rowClass = i % 2 === 0 ? 'even' : 'odd';
		var runner = document.createElement('tr');
				runner.className = 'event-runner ' + rowClass;

		var runnerName = document.createElement('td');
				runnerName.className = 'event-runner-name';
				runnerName.innerHTML = eventSelections[i].EventSelectionName;

		var runnerOdds = document.createElement('td');
				runnerOdds.className = 'event-runner-odds';
				runnerOdds.innerHTML = eventSelections[i].Bet.Odds;

		runner.appendChild(runnerName);
		runner.appendChild(runnerOdds);

		runnerTable.appendChild(runner);
	}

	el.appendChild(runnerTable);

	return el;
}

/**
 * Create event element.
 */
function createEventElement(event) {
	var el = document.createElement('div');
			el.className = 'event';
	var header = createEventHeaderElement(event);
	var runners = createEventRunnersElement(event);

	el.appendChild(header);
	el.appendChild(runners);

	return el;
}

/**
 * Get the difference between a given date and the current one in minutes.
 */
function getEventJumpTime(eventDate) {
	var diffHours = -(moment().diff(eventDate, 'hours'));
	var diffMinutes = -(moment().diff(eventDate, 'minutes') % 60);
	var diffSeconds = -(moment().diff(eventDate, 'seconds') % 60);

	return diffHours + 'hrs ' + diffMinutes + 'mins ' + diffSeconds + 'secs';
}
