const NodeHelper = require('node_helper');
const ical = require('node-ical');
const fs = require('fs-extra');
const path = require('path');

module.exports = NodeHelper.create({
  logPath: path.join(__dirname, 'MMM-Countdown.log'),

  socketNotificationReceived: function(notification, payload) {
    if (notification === 'FETCH_EVENTS') {
      this.writeLog(`Modtog FETCH_EVENTS med URL: ${payload}`);
      this.fetchEvents(payload);
    }
  },

  fetchEvents: function(url) {
    ical.fromURL(url, {}, (err, data) => {
      if (err) {
        this.writeLog(`Fejl ved hentning af ICS: ${err.message}`);
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
          return eventDate >= today;
        })
        .sort((a, b) => a.date - b.date)
        .slice(0, 10);

      this.writeLog(`Fandt ${events.length} kommende begivenheder.`);
      events.forEach(e => this.writeLog(`- ${e.title} : ${e.date}`));

      this.sendSocketNotification('EVENTS_RESULT', events);
    });
  },

  writeLog: function(message) {
    const timestamp = new Date().toLocaleString('da-DK');
    const logMessage = `[${timestamp}] ${message}\n`;

    fs.appendFile(this.logPath, logMessage)
      .catch(err => console.error("Fejl ved skrivning til log:", err));
  }
});
