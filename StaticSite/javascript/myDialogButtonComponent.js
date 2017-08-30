class MyDialogButtonComponent extends HTMLElement {
	// Add Listeners, innerHTML, styling, etc...
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this._refreshShadowRoot()
	}
	static get observedAttributes() { return [ ]; };
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
		super.adoptedCallback(oldDocument, newDocument);
	}
	get open() {
		return this.shadowRoot.getElementById('dialog').open
	}
	_refreshShadowRoot() {
		this.shadowRoot.innerHTML = `
		<slot id='open' name='open'><button>Open</button></slot>
		<dialog id='dialog'>
			<slot id='content' name='content'><p>Placeholder Content</p></slot>
			<button id='close'>Close</button>
		</dialog>
		<style>
		#open::hover {
			cursor: pointer;
		}
		#close {
			position: relative;
			top: 0px;
			right: 0px;
		}
		#dialog {
			top: 0%;
		}
		</style>
		`
		const dialog = this.shadowRoot.getElementById('dialog')
		const content = this.shadowRoot.getElementById('content')
		const close = this.shadowRoot.getElementById('close')
		const open = this.shadowRoot.getElementById('open')
		open.addEventListener('click', function(event) {
			if(!dialog.open) {
				dialog.showModal()
			}
		});
		close.addEventListener('click', function(event) {
			if(dialog.open) {
				dialog.close()
			}
		});
	}
}
window.customElements.define('my-dialog-button', MyDialogButtonComponent)