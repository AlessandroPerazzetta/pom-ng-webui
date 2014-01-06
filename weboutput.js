
weboutput = {};

weboutput.outputs = [ 'arpwatch' ];

weboutput.arpwatch = function(elem) {
	this.elem = elem;
	this.init();
}

weboutput.arpwatch.counter = 0;
weboutput.arpwatch.description = "Show discovered stations.";

weboutput.arpwatch.prototype.init = function() {
	this.elem.html('<h2>Output arpwatch</h2><table class="ui-widget ui-widget-content ui-table"><thead><tr class="ui-widget-header"><td>IP address</td><td>Mac address</td><td>Vlan</td><td>Last change</td></tr></thead><tbody></tbody></table>');
	this.sta = {};

	pomng.monitor.eventListenerRegister("arp_new_sta", weboutput.arpwatch.process_event, this);
	pomng.monitor.eventListenerRegister("arp_sta_changed", weboutput.arpwatch.process_event, this);
	

}

weboutput.arpwatch.prototype.cleanup = function() {
	pomng.monitor.eventListenerUnregister("arp_new_sta", this);
}

weboutput.arpwatch.process_event = function(evt) {

	var data = evt.data;
	var ip = data['ip_addr'];
	var id = 'sta_' + ip.replace(/\./g, '_');

	if (evt.event == "arp_new_sta") {

		if (this.sta[ip] !== undefined)
			return; // We already know about this station

		// Found a new station, add it to our list
		this.sta[ip] = data;

		var vlan = "none";
		if (vlan in data)
			vlan = data['vlan'];


		this.elem.find('tbody').append('<tr id="' + id + '"><td>' + ip + '</td><td>' + data['mac_addr'] + '</td><td>' + vlan + '</td><td>' + pomngUI.timeval_toString(evt.timestamp) + '</td></tr>');

	} else if (evt.event == "arp_sta_changed") {
		var elem = $('#' + id);
		if (!elem.length) {
			this.elem.find('tbody').append('<tr id="' + id + '"><td>' + ip + '</td><td>' + data['new_mac_addr'] + '</td><td>' + vlan + '</td><td>' + pomngUI.timeval_toString(evt.timestamp) + '</td></tr>');
		} else {
			elem.html('<td>' + ip + '</td><td style="color:red">' + data['old_mac_addr'] + ' -> ' + data['new_mac_addr'] + '</td><td>' + vlan + '</td><td>' + pomngUI.timeval_toString(evt.timestamp) + '</td>');
		}
	}

}