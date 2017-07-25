class MyMyAccountComponent extends HTMLElement {
	// Add Listeners, innerHTML, styling, etc...
	constructor({account}={}) {
		super();
		this.account = account;
		this.attachShadow({ mode: "open" });
		this._redrawShadowRootDOM()
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
	_createPassword() {
		const component = this;
		const newPassword = this.shadowRoot.querySelector('#password-create-form input.new-password').value
		const newPasswordRetyped =  this.shadowRoot.querySelector('#password-create-form input.new-password-retyped').value
		if(newPassword == newPasswordRetyped) {
			var data = {}
			data.password =this.shadowRoot.querySelector('#password-create-form input.new-password').value
			const component = this;
			const client = new XMLHttpRequest();
			client.onreadystatechange = function() {
				if (this.readyState === XMLHttpRequest.DONE) {
					const response = JSON.parse(this.response);
					if(this.status === 200) {
						alert('Password created! Logout to apply changes.')
					}
					else {
						handleServerErrorResponse(response)
					}
				}
			}
			client.open('POST', API_SERVER_ADDRESS()+'/account/create-password');
			client.setRequestHeader("Authorization", "Bearer "+window.localStorage.token);
			client.setRequestHeader("Content-Type", "application/json");
			client.send(JSON.stringify(data));
		}
		else {
			alert('Passwords mismatched. Try retyping password fields.')
		}
	}
	_resetPassword() {
		const oldPassword = this.shadowRoot.querySelector('#password-reset-form input.old-password').value
		const newPassword = this.shadowRoot.querySelector('#password-reset-form input.new-password').value
		const newPasswordRetyped =  this.shadowRoot.querySelector('#password-reset-form input.new-password-retyped').value
		if(newPassword == newPasswordRetyped) {
			const component = this;
			const client = new XMLHttpRequest();
			client.onreadystatechange = function() {
				if (this.readyState === XMLHttpRequest.DONE) {
					const response = JSON.parse(this.response);
					if(this.status === 200) {
						alert('Password reset! Logout to apply changes')
					}
					else {
						handleServerErrorResponse(response)
					}
				}
			}
			client.open('POST', API_SERVER_ADDRESS()+'/account/reset-password');
			client.setRequestHeader("Authorization", "Bearer "+window.localStorage.token);
			client.setRequestHeader("Content-Type", "application/json");
			var data = {}
			data.oldPassword = oldPassword
			data.newPassword = newPassword
			client.send(JSON.stringify(data));
		}
		else {
			alert('Passwords mismatched. Try retyping password fields.')
		}
	}
	_editDetails() {
		const component = this;
		const client = new XMLHttpRequest();
		client.onreadystatechange = function() {
			if (this.readyState === XMLHttpRequest.DONE) {
				const response = JSON.parse(this.response);
				if(this.status === 200) {
					alert('Edits succeeded! Logout to apply changes.')
				}
				else {
					handleServerErrorResponse(response)
				}
			}
		}
		client.open('POST', API_SERVER_ADDRESS()+'/account/edit-details');
		client.setRequestHeader("Authorization", "Bearer "+window.localStorage.token);
		client.setRequestHeader("Content-Type", "application/json");
		var data = {}
		data._id = this.account._id;
		data.email =this.shadowRoot.querySelector('#edit-details-form input.email').value
		data.nameFirst = this.shadowRoot.querySelector('#edit-details-form input.name-first').value
		data.nameLast = this.shadowRoot.querySelector('#edit-details-form input.name-last').value
		client.send(JSON.stringify(data));
	}
	_redrawShadowRootDOM() {
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
						<td><input class="email" id="email" type="email" name="email" placeholder="local-part@sldomain.tld" value="${this.account.email}" required></td>
					</tr>
					<tr>
						<td><label for="name-first">First Name</label></td>
						<td><input class="name-first" id="name-first" type="name" name="nameFirst" placeholder="John" value="${this.account.nameFirst}" required></td>
					</tr>
					<tr>
						<td><label for="name-last">Last Name</label></td>
						<td><input class="name-last" id="name-last" type="name" name="nameLast" placeholder="Doe" value="${this.account.nameLast}" required></td>
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
						<td><input class="old-password" id="old-password" type="password" name="oldPassword" placeholder="Old password.." required></td>
					</tr>
					<tr>
						<td><label for="newPassword">New Password</label></td>
						<td><input class="new-password" id="new-password" type="password" name="newPassword" placeholder="New password.." ></td>
					</tr>
					<tr>
						<td><label for="newPasswordRetyped">New Password Retyped</label></td>
						<td><input class="new-password-retyped" id="new-password-retyped" type="password" name="newPasswordRetyped" placeholder="New password.." required></td>
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
						<td><input class="new-password" id="new-password" type="password" name="newPassword" placeholder="New password.." required></td>
					</tr>
					<tr>
						<td><label for="newPasswordRetyped">New Password Retyped</label></td>
						<td><input class="new-password-retyped" id="new-password-retyped" type="password" name="newPasswordRetyped" placeholder="New password.." required></td>
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
			component._linkFacebook.call(component);
		});
		linkGoogleButton.addEventListener('click', function(event) {
			component._linkGoogle.call(component);
		});
		deleteAccountButton.addEventListener('click', function(event) {
			component._deleteAccount.call(component);
		});
		passwordResetForm.addEventListener('submit', function(event) {
			event.preventDefault();
			component._resetPassword.call(component);
		});
		passwordCreateForm.addEventListener('submit', function(event) {
			event.preventDefault();
			component._createPassword.call(component);
		});
		editDetailsForm.addEventListener('submit', function(event) {
			event.preventDefault();
			component._editDetails.call(component);
		});
		// Apply Styling
		if(this.account.facebookProfileID) {
			linkFacebookButton.classList.add('hidden')
		}
	}
}


