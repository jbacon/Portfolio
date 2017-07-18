class MyMyAccountComponent extends HTMLElement {
	// Add Listeners, innerHTML, styling, etc...
	constructor({account}={}) {
		super();
		this.userAccount = account;
		this.attachShadow({ mode: "open" });
		const component = this;
		this.shadowRoot.innerHTML = `
			<div>
	        	<button id='edit-details-toggle' name='Edit Account Details'>Edit Account Details</button>
	        </div>
	        <div>
			<form id='edit-details-form' action='' class='hidden'>
				<table>
					<tr>
						<td><label for="email">Email</label></td>
						<td><input class="email" id="email" type="email" name="email" placeholder="local-part@sldomain.tld" val="${account.email}"></td>
					</tr>
					<tr>
						<td><label for="name-first">First Name</label></td>
						<td><input class="name-first" id="name-first" type="name" name="nameFirst" placeholder="John" val="${account.nameFirst}"></td>
					</tr>
					<tr>
						<td><label for="name-last">Last Name</label></td>
						<td><input class="name-last" id="name-last" type="name" name="nameLast" placeholder="Doe" val="${account.nameLast}"></td>
					</tr>
				</table>
	            <div>
	                <input class="submit" type="submit">
	            </div>
			</form>
			<div>
				<button id='password-reset-toggle' name='Reset Password'>Reset Password</button>
			</div>
			<form id='password-reset-form' action='' class='hidden'>
				<table>
					<tr>
						<td><label for="oldPassword">Old Password</label></td>
						<td><input class="oldPassword" id="oldPassword" type="password" name="oldPassword" placeholder="Old password.."></td>
					</tr>
					<tr>
						<td><label for="newPassword">New Password</label></td>
						<td><input class="newPassword" id="newPassword" type="password" name="newPassword" placeholder="New password.."></td>
					</tr>
					<tr>
						<td><label for="newPasswordRetyped">New Password Retyped</label></td>
						<td><input class="newPasswordRetyped" id="newPasswordRetyped" type="password" name="newPasswordRetyped" placeholder="New password.."></td>
					</tr>
				</table>
	            <div>
	                <input class="submit" type="submit">
	            </div>
			</form>
			<div>
				<button id='password-create-toggle' name='Create Password'>Create Password</button>
			</div>
			<form id='password-create-form' action='' class='hidden'>
				<table>
					<tr>
						<td><label for="newPassword">New Password</label></td>
						<td><input class="newPassword" id="newPassword" type="password" name="newPassword" placeholder="New password.."></td>
					</tr>
					<tr>
						<td><label for="newPasswordRetyped">New Password Retyped</label></td>
						<td><input class="newPasswordRetyped" id="newPasswordRetyped" type="password" name="newPasswordRetyped" placeholder="New password.."></td>
					</tr>
				</table>
	            <div>
	                <input class="submit" type="submit">
	            </div>
			</form>
			<div>
				<button id='link-facebook-button' name='Link Facebook'>Link Facebook</button>
			</div>
			<div>
				<button id='link-google-button' name='Link Google Account'>Link Google Account</button>
			</div>
			<div>
				<button id='delete-account-button' name='Delete Account'>Delete Account</button>
			</div>
			<style>
				label {
					font: bold 15px Verdana, sans-serif;
					color: black;
				}
				.hidden {
					display: none;
				}
				.disabled {
					color: grey;
					pointer-events: none;
				}
				.active {
					color: green;
				}
			</style>
		`;
		const editDetailsToggle = this.shadowRoot.querySelector('#edit-details-toggle')
		const editDetailsForm = this.shadowRoot.querySelector('#edit-details-form')
		const passwordResetToggle = this.shadowRoot.querySelector('#password-reset-toggle')
		const passwordResetForm = this.shadowRoot.querySelector('#password-reset-form')
		const passwordCreateToggle = this.shadowRoot.querySelector('#password-create-toggle')
		const passwordCreateForm = this.shadowRoot.querySelector('#password-create-form')
		const linkFacebookButton = this.shadowRoot.querySelector('#link-facebook-button')
		const linkGoogleButton = this.shadowRoot.querySelector('#link-google-button')
		const deleteAccountButton = this.shadowRoot.querySelector('#delete-account-button')
		
		
		editDetailsToggle.addEventListener('click', function(event) {
			if(!editDetailsToggle.classList.contains('disabled')) {
				editDetailsToggle.classList.toggle('active')
				editDetailsForm.classList.toggle('hidden')
			}
		});
		passwordResetToggle.addEventListener('click', function(event) {
			if(!passwordResetToggle.classList.contains('disabled')) {
				passwordResetToggle.classList.toggle('active')
				passwordResetForm.classList.toggle('hidden')
			}
		});
		passwordCreateToggle.addEventListener('click', function(event) {
			if(!passwordCreateToggle.classList.contains('disabled')) {
				passwordCreateToggle.classList.contains('disabled')
				passwordCreateForm.classList.toggle('hidden')
			}
		});
		linkFacebookButton.addEventListener('click', function(event) {
			component._linkFacebook.call(component, function(err) {
				if(err)
					handleServerErrorResponse(err)
				else
					asdf
			});
		});
		linkGoogleButton.addEventListener('click', function(event) {
			component._linkGoogle.call(component, function(err) {
				if(err)
					handleServerErrorResponse(err)
				else
					asdf
			});
		});
		deleteAccountButton.addEventListener('click', function(event) {

		});
		passwordResetForm.addEventListener('submit', function(event) {

		});
		passwordCreateForm.addEventListener('submit', function(event) {

		});
		editDetailsForm.addEventListener('submit', function(event) {

		});
		// Apply Styling
		if(account.facebookProfileID) {
			linkFacebookButton.classList.add('hidden')
		}
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
	}
	// Called when the element is adopted into a new document
	adoptedCallback(oldDocument, newDocument) {
		super.adoptedCallback(oldDocument, newDocument);
	}
	static get displayValues() { return { disabled: 'disabled', hidden: 'hidden' }; };
	/* DATA */
	get account() {
		return this._account
	}
	set account(val) {
		if(val) {
			this._account = val
		}
		else {
			delete this._account
		}
	}
	/* INTERNAL FUNCIONS */
}


