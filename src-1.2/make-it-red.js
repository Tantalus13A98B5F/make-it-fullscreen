if (Zotero.platformMajorVersion < 102) {
	Cu.importGlobalProperties(['URL']);
}

MakeItRed = {
	id: null,
	version: null,
	rootURI: null,
	initialized: false,
	addedElementIDs: [],
	
	init({ id, version, rootURI }) {
		if (this.initialized) return;
		this.id = id;
		this.version = version;
		this.rootURI = rootURI;
		this.initialized = true;
	},
	
	log(msg) {
		Zotero.debug("Make It Fullscreen: " + msg);
	},
	
	addToWindow(window) {
		let doc = window.document;
		
		// createElementNS() necessary in Zotero 6; createElement() defaults to HTML in Zotero 7
		let HTML_NS = "http://www.w3.org/1999/xhtml";
		let XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
		
		// Add menu option
		let menuitem = doc.createElementNS(XUL_NS, 'menuitem');
		menuitem.id = 'make-it-green-instead';
		menuitem.setAttribute('type', 'button');
		menuitem.setAttribute('data-l10n-id', 'make-it-red-green-instead');
		menuitem.addEventListener('command', () => {
			MakeItRed.toggleFullscreen(window);
		});
		doc.getElementById('menu_viewPopup').appendChild(menuitem);
		this.storeAddedElement(menuitem);
		
		// Use strings from make-it-red.ftl (Fluent) in Zotero 7
		if (Zotero.platformMajorVersion >= 102) {
			window.MozXULElement.insertFTLIfNeeded("make-it-red.ftl");
		}
		// Use strings from make-it-red.properties (legacy properties format) in Zotero 6
		else {
			let stringBundle = Services.strings.createBundle(
				'chrome://make-it-red/locale/make-it-red.properties'
			);
			doc.getElementById('make-it-green-instead')
				.setAttribute('label', stringBundle.GetStringFromName('makeItGreenInstead.label'));
		}
	},
	
	addToAllWindows() {
		var enumerator = Services.wm.getEnumerator("navigator:browser");
		while (enumerator.hasMoreElements()) {
			let win = enumerator.getNext();
			if (!win.ZoteroPane) continue;
			this.addToWindow(win);
		}
	},
	
	storeAddedElement(elem) {
		if (!elem.id) {
			throw new Error("Element must have an id");
		}
		this.addedElementIDs.push(elem.id);
	},
	
	removeFromWindow(window) {
		var doc = window.document;
		// Remove all elements added to DOM
		for (let id of this.addedElementIDs) {
			// ?. (null coalescing operator) not available in Zotero 6
			let elem = doc.getElementById(id);
			if (elem) elem.remove();
		}
		doc.querySelector('[href="make-it-red.ftl"]').remove();
	},
	
	removeFromAllWindows() {
		var enumerator = Services.wm.getEnumerator("navigator:browser");
		while (enumerator.hasMoreElements()) {
			let win = enumerator.getNext();
			if (!win.ZoteroPane) continue;
			this.removeFromWindow(win);
		}
	},
	
	toggleFullscreen(window) {
		var doc = window.document;
		if (doc.fullscreenElement) {
			doc.exitFullscreen();
		}
		else {
			doc.documentElement.requestFullscreen();
		}
	},
	
	async main() {
		// Global properties are imported above in Zotero 6 and included automatically in
		// Zotero 7
		var host = new URL('https://foo.com/path').host;
		this.log(`Host is ${host}`);
		
		// Retrieve a global pref
		this.log(`Intensity is ${Zotero.Prefs.get('extensions.make-it-red.intensity', true)}`);
	},
};
