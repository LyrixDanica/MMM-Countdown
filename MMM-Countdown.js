Module.register("MMM-Countdown", {

  defaults: {
    icsUrl: '',
    updateInterval: 60000,
    events: [],
    currentEventIndex: 0,
    cycleInterval: 10000
  },

  start: function () {
    this.sendSocketNotification('FETCH_EVENTS', this.config.icsUrl);
    
    setInterval(() => {
      this.sendSocketNotification('FETCH_EVENTS', this.config.icsUrl);
    }, this.config.updateInterval);

    setInterval(() => {
      if (this.events.length > 0) {
        this.currentEventIndex = (this.currentEventIndex + 1) % this.events.length;
        this.updateDom();
      }
    }, this.config.cycleInterval);
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === 'EVENTS_RESULT') {
      this.events = payload;
      this.updateDom();
    }
  },

  getDom: function () {
    const wrapper = document.createElement("div");

    if (!this.events.length) {
      wrapper.innerHTML = "Henter kommende begivenheder...";
      return wrapper;
    }

    const event = this.events[this.currentEventIndex];
    const now = new Date();
    
    const eventDate = new Date(event.date);
    eventDate.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    
    const diffDays = Math.round((eventDate - now) / (1000 * 60 * 60 * 24));

    let text = '';
    if (diffDays > 1) {
      text = `${diffDays} dage`;
    } else if (diffDays === 1) {
      text = "I morgen";
    } else if (diffDays === 0) {
      text = "I dag 🎉";
    } else {
      text = ""; // Bør ikke ske, da vi kun henter fremtidige events
    }

    wrapper.innerHTML = `
      <strong>${event.title}</strong><br>
      ${text}
    `;

    wrapper.style.textAlign = "center";
    wrapper.style.fontSize = "28px";
    wrapper.style.padding = "10px";

    return wrapper;
  }
});
