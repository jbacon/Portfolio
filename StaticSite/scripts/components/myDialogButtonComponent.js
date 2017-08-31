window.portfolio.components.MyDialogButtonComponent = class extends HTMLElement {
	// Add Listeners, innerHTML, styling, etc...
	constructor() {
		super()
		this.attachShadow({ mode: "open" })
		this._refreshShadowRoot()
	}
	static get observedAttributes() { return [ ] }
	// Respond to attribute changes...
	attributeChangedCallback(attr, oldValue, newValue, namespace) {
		// super.attributeChangedCallback(attr, oldValue, newValue, namespace);
	}
	// Removed from a document
	disconnectedCallback() {
		// super.disconnectedCallback();
	}
	// Called when an attribute is changed, appended, removed, or replaced on the element
	connectedCallback() {
		// super.connectedCallback();
		this._refreshShadowRoot()
	}
	// Called when the element is adopted into a new document
	adoptedCallback(oldDocument, newDocument) {
		super.adoptedCallback(oldDocument, newDocument)
	}
	get open() {
		return this.shadowRoot.getElementById("dialog").open
	}
	close() {
		const dialog = this.shadowRoot.getElementById("dialog")
		if(dialog.open) {
			dialog.close()
		}
	}
	_refreshShadowRoot() {
		this.shadowRoot.innerHTML = `
		<slot id='open' name='open'><button>Open</button></slot>
		<dialog id='dialog'>
			<slot id='content' name='content'><p>Placeholder Content</p></slot>
			<button id='close'>Close</button>
		</dialog>
		<style>
		:host {
			position: relative;
		}
		#open::slotted(*:hover) {
			cursor: pointer;
		}
		#close {
			position: absolute;
			top: 0px;
			right: 0px;
			display: block;
		}
		#close:hover {
			cursor: pointer;
		}
		#dialog {
			max-width: 90%;
			max-height: 90%;
			color: black;
			top: 0%;
		}
		</style>
		`
		const dialog = this.shadowRoot.getElementById("dialog")
		const content = this.shadowRoot.getElementById("content")
		const close = this.shadowRoot.getElementById("close")
		const open = this.shadowRoot.getElementById("open")
		open.addEventListener("click", function(event) {
			if(!dialog.open) {
				dialog.showModal()
			}
		})
		close.addEventListener("click", function(event) {
			if(dialog.open) {
				dialog.close()
			}
		})
	}
}
if(!window.customElements.get("my-dialog-button")) {
	window.customElements.define("my-dialog-button", window.portfolio.components.MyDialogButtonComponent)
}