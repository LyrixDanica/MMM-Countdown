const NodeHelper = require('node_helper');
const ical = require('node-ical');

module.exports = NodeHelper.create({
  socketNotificationReceived: function(notification, payload) {
    if (notification === 'FETCH_EVENTS') {
      this.fetchEvents(payload);
    }
  },

  fetchEvents: function(url) {
    ical.fromURL(url, {}, (err, data) => {
      if (err) {
        this.sendSocketNotification('EVENTS_RESULT', []);
        return;
      }

      const today = new Date();
      today.setHours(0,0,0,0);

      const events = Object.values(data)
        .filter(event => event.type === 'VEVENT' && event.start)
        .map(event => ({
          title: event.summary,
          date: event.start
        }))
        .filter(event => {
          const eventDate = new Date(event.date);
          eventDate.setHours(0,0,0,0);
          return eventDate >= today; // kun fremtidige begivenheder
        })
        .sort((a, b) => a.date - b.date)
        .slice(0, 10); // max 10 events

      this.sendSocketNotification('EVENTS_RESULT', events);
    });
  }
});
