/*
In my use-case I want to 
Web Components! https://developers.google.com/web/fundamentals/getting-started/primers/customelements
Shadow DOM! - Awesome! Always creating hidden content within an element that will not be added as html to page.

Examples:
Authenticated Users: <my-comment reply-display='enabled' flag-display='enabled' vote-display='enabled' replies-display='enabled' data-id='1234'></my-comment>
Anonymous Users: <my-comment reply-display='hidden' flag-display='hidden' vote-display='hidden' replies-display='enabled' data-id='1234'></my-comment>
Admin Users:  <my-comment reply-display='enabled' flag-display='enabled' vote-display='enabled' replies-display='enabled' data-id='1234'></my-comment>
*/
class MyCommentComponent extends HTMLElement {
	// Add Listeners, innerHTML, styling, etc...
	constructor(comment) {
		super();
		this.comment = comment;
		const component = this;
		const shadowRoot = this.attachShadow({ mode: "open" });
		shadowRoot.innerHTML = `
			<div>
				<span style='width:50px; height=50px;'>
					${ (comment.account && comment.account.facebookProfileID) ? '<img display="inline-block" width="50px" height="50px" alt="" src="http://graph.facebook.com/'+comment.account.facebookProfileID+'/picture?type=large">' : ''}
				</span>
				<span style='width: 500px;'>
					<div>${(comment.account) ? comment.account.nameFirst+' '+comment.account.nameLast+' @ '+comment.dateCreated : ''}</div>
					<div>${comment.text}</div>
				</span>
			</div>
			<footer>
				<div id='actions'>
					<button id='replies-toggle' name='Replies'>Replies</button>
					<button id='reply-toggle' name='Reply'>Reply</button>
					<span id='up-vote-count'>${'+'+comment.upVoteAccountIDs.length}</span>
					<button id='up-vote-button' name='Up'>Up</button>
					<span id='down-vote-count'>${'-'+comment.downVoteAccountIDs.length}</span>
					<button id='down-vote-button' name='Down'>Down</button>
					<button id='remove-button' name='Remove'>Remove</button>
					<button id='flag-button' name='Flag'>Flag</button>
				</div>
				<div id='replies' data-start='newest' class='hidden'>
					<button id='load-new-button' class='hidden' name='Load Newest..'>Load Newest..</button>
					<slot id="repliesSlot"></slot>
					<button id='load-old-button' class='hidden'>Load more..</button>
				</div>
				<form id='create-form' action='' class='hidden'>
					<input id='article-id' name='articleID' type='hidden' value='${comment.articleID}'>
					<input id='parent-comment-id' name='parentCommentID' type='hidden' value='${comment._id}'>
					<input id='text' name='text' type='text' placeholder='Text...'>
					<button id='submit' name='Submit'>Submit</button>
				</form>
			</footer>
			<style>
				#repliesSlot::slotted(*) {
					display: block;
				}
				#replies{
					margin-left: 20px;
				}
				span {
					display: inline-block;
					text-align: left;
					vertical-align: top;
				}
				#content.removed > * {
					display: none;
				}
				#content.removed::before {
					content: '~Comment has been removed~';
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
				#replies-toggle:not(.active)::before {
					content: "Show ";
				}
				#replies-toggle.active::before {
					content: "Hide ";
				}
				#reply-toggle:not(.active)::before {
					content: "Create ";
				}
				#reply-toggle.active::before {
					content: "Discard ";
				}
				// :host([replies-display=${MyCommentComponent.displayValues.disabled}]) #replies {
				// }
				// :host([replies-display=${MyCommentComponent.displayValues.disabled}]) #replies-toggle {
				// }
				// :host([replies-display=${MyCommentComponent.displayValues.hidden}]) #replies {
				// 	color: red
				// }
				// :host([replies-display=${MyCommentComponent.displayValues.hidden}]) #replies-toggle {
				// 	color: red
				// }
				// :host([reply-display=disabled]){
				// 	color: red
				// }
				// :host([flag-display=disabled]){
				// 	color: red
				// }
				// :host([remove-display=disabled]) {
				// 	color: red
				// }
				// :host([vote-display=disabled]) {
				// 	color: red
				// }
				// :host([removed=disabled]) {
				// 	color: red
				// }
				// button([disabled]) {
				// }
			</style>
		`;
		const content = shadowRoot.querySelector('#content')
		const repliesToggle = shadowRoot.querySelector('#replies-toggle')
		const repliesSection = shadowRoot.querySelector('#replies')
		const replyToggle = shadowRoot.querySelector('#reply-toggle')
		const createForm = shadowRoot.querySelector('#create-form')
		const removeButton = shadowRoot.querySelector('#remove-button')
		const flagButton = shadowRoot.querySelector('#flag-button')
		const upVoteButton = shadowRoot.querySelector('#up-vote-button')
		const upVoteCount = shadowRoot.querySelector('#up-vote-count')
		const downVoteButton = shadowRoot.querySelector('#down-vote-button')
		const downVoteCount = shadowRoot.querySelector('#down-vote-count')
		const loadNewButton = shadowRoot.querySelector('#load-new-button')
		const loadOldButton = shadowRoot.querySelector('#load-old-button')
                                        
		repliesToggle.addEventListener('click', function(event) {
			if(component.repliesDisplay !== MyCommentComponent.displayValues.disabled && component.repliesDisplay !== MyCommentComponent.displayValues.hidden) {
				repliesToggle.classList.toggle('active')
				repliesSection.classList.toggle('hidden')
				loadNewButton.classList.toggle('hidden')
				loadOldButton.classList.toggle('hidden')
				// If replies are empty... AND replies are active
				if(component.childElementCount <= 0 && repliesToggle.classList.contains('active')) {
					// Query for 1st batch of child comments
					loadOldButton.click();
				}
			}
		});
		replyToggle.addEventListener('click', function(event) {
			if(component.replyDisplay !== MyCommentComponent.displayValues.disabled && component.replyDisplay !== MyCommentComponent.displayValues.hidden) {
				replyToggle.classList.toggle('active')
				createForm.classList.toggle('hidden')
			}
		});
		removeButton.addEventListener('click', function(event) {
			if(component.removed !== MyCommentComponent.displayValues.disabled && component.removed !== MyCommentComponent.displayValues.hidden) {
				const client = new XMLHttpRequest();
				client.onreadystatechange = function() {
					if (this.readyState === XMLHttpRequest.DONE) {
						const response = JSON.parse(this.response);
						if(this.status === 200) {
							content.classList.add('removed')
							removeButton.classList.add('disabled')
							replyToggle.classList.remove('active')
							replyToggle.classList.add('disabled')
							createForm.classList.add('hidden')
							flagButton.classList.add('disabled')
							upVoteButton.classList.add('disabled')
							downVoteButton.classList.add('disabled')
						}
						else {
							handleServerErrorResponse('Remove Comment Failed.', response)
						}
					}
				}
				client.open('POST', '/comments/remove');
				client.setRequestHeader("Authorization", "Bearer "+window.localStorage.token);
				client.setRequestHeader("Content-Type", "application/json");
				var data = {}
				data._id = component.comment.id || null;
				client.send(JSON.stringify(data));
			}
		});
		flagButton.addEventListener('click', function(event) {
			if(component.flagDisplay !== MyCommentComponent.displayValues.disabled && component.flagDisplay !== MyCommentComponent.displayValues.hidden) {
				const client = new XMLHttpRequest();
				client.onreadystatechange = function() {
					if (this.readyState === XMLHttpRequest.DONE) {
						const response = JSON.parse(this.response);
						if(this.status === 200) {
							alert('Comment has been flagged, system admin has been alerted...')
						}
						else {
							handleServerErrorResponse('Flag Comment Failed.', response)
						}
					}
				}
				client.open('POST', '/comments/flag');
				client.setRequestHeader("Authorization", "Bearer "+window.localStorage.token);
				client.setRequestHeader("Content-Type", "application/json");
				var data = {}
				data._id = component.comment.id || null;
				client.send(JSON.stringify(data));
			}
		});
		upVoteButton.addEventListener('click', function(event) {
			if(component.voteDisplay !== MyCommentComponent.displayValues.disabled && component.voteDisplay !== MyCommentComponent.displayValues.hidden) {
				const client = new XMLHttpRequest();
				client.onreadystatechange = function() {
					if (this.readyState === XMLHttpRequest.DONE) {
						const response = JSON.parse(this.response);
						if(this.status === 200) {
							upVoteCount.innerHTML = '+'+(Number(upVoteCount.substring(1))+1)
						}
						else {
							handleServerErrorResponse('Up-Vote Comment Failed.', response)
						}
					}
				}
				client.open('POST', '/comments/up-vote');
				client.setRequestHeader("Authorization", "Bearer "+window.localStorage.token);
				client.setRequestHeader("Content-Type", "application/json");
				var data = {}
				data._id = component.comment.id || null;
				client.send(JSON.stringify(data));
			}
		});
		downVoteButton.addEventListener('click', function(event) {
			if(component.voteDisplay !== MyCommentComponent.displayValues.disabled && component.voteDisplay !== MyCommentComponent.displayValues.hidden) {
				const client = new XMLHttpRequest();
				client.onreadystatechange = function() {
					if (this.readyState === XMLHttpRequest.DONE) {
						const response = JSON.parse(this.response);
						if(this.status === 200) {
							upVoteCount.innerHTML = '-'+(Number(upVoteCount.substring(1))+1)
						}
						else {
							handleServerErrorResponse('Down-vote Comment Failed.', response)
						}
					}
				}
				client.open('POST', '/comments/down-vote');
				client.setRequestHeader("Authorization", "Bearer "+window.localStorage.token);
				client.setRequestHeader("Content-Type", "application/json");
				var data = {}
				data._id = component.comment.id || null;
				client.send(JSON.stringify(data));
			}
		});
		loadNewButton.addEventListener('click', function(event) {
			const query = {}
			if(component.firstElementChild && component.firstElementChild.comment)
				query.start = component.firstElementChild.comment._id
			else
				query.start = 'newest'
			query.sortOrder = 1
			query.pageNum = 1
			query.pageSize = PAGE_SIZE
			query.articleID = component.comment.articleID
			query.parentCommentID = component.comment._id || null;
			const queryString = JSON.stringify(query);
			const encodedQuery = encodeURIComponent(queryString);
			const client = new XMLHttpRequest();
			client.onreadystatechange = function() {
				if (this.readyState === XMLHttpRequest.DONE) {
					const response = JSON.parse(this.response);
					if(this.status === 200) {
						const comments = response.data;
						for(var i = 0; i < comments.length; i++) {
							const newComment = new MyCommentComponent(comments[i]);
							component.insertAdjacentElement('afterbegin', newComment)
						}
					}
					else {
						alert('Error getting comments. '+this.status +' - '+this.statusText+'. '+response.message);
					}
				}
			}
			client.open('GET', '/comments/read?data='+encodedQuery);
			client.send();
		});
		loadOldButton.addEventListener('click', function(event) {
			const query = {}
			query.start = repliesSection.dataset.start //either 'newest' or some id
			query.sortOrder = -1
			query.pageNum = Number(repliesSection.dataset.pageNum || 1)
			query.skipOnPage = Number(repliesSection.dataset.skipOnPage || 0)
			query.pageSize = PAGE_SIZE
			query.articleID = component.comment.articleID
			query.parentCommentID = component.comment._id || null;
			const queryString = JSON.stringify(query);
			const encodedQuery = encodeURIComponent(queryString);
			const client = new XMLHttpRequest();
			client.onreadystatechange = function() {
				if (this.readyState === XMLHttpRequest.DONE) {
					const response = JSON.parse(this.response);
					if(this.status === 200) {
						const comments = response.data;
						if(repliesSection.dataset.start == 'newest' && comments.length > 0) {
							repliesSection.dataset.start = comments[0]._id
						}
						repliesSection.dataset.skipOnPage = ((comments.length + query.skipOnPage) < PAGE_SIZE) ? query.skipOnPage + comments.length : 0
						repliesSection.dataset.pageNum = ((comments.length + query.skipOnPage) < PAGE_SIZE) ? query.pageNum : query.pageNum+1
						for(var i = 0; i < comments.length; i++) {
							const newComment = new MyCommentComponent(comments[i]);
							component.insertAdjacentElement('beforeend', newComment)
						}
					}
					else {
						alert('Error getting comments. '+this.status +' - '+this.statusText+'. '+response.message);
					}
				}
			}
			client.open('GET', '/comments/read?data='+encodedQuery);
			client.send();
		});
		createForm.addEventListener('submit', function(event) {
			event.preventDefault();
			const client = new XMLHttpRequest();
			client.onreadystatechange = function() {
				if (this.readyState === XMLHttpRequest.DONE) {
					const response = JSON.parse(this.response);
					if(this.status === 200) {
						// If initial comment, unhide 'Show Comments' and click 'Show Comments'
						// Otherwise Programmatically click load latest comments...
						loadNewButton.click();
						replyToggle.click();
					}
					else {
						handleServerErrorResponse('Create Comment Failed.', response)
					}
				}
			}
			client.open('POST', '/comments/create');
			client.setRequestHeader("Authorization", "Bearer "+window.localStorage.token);
			client.setRequestHeader("Content-Type", "application/json");
			var jsonData = {}
			for(var i = 0; i < event.target.length - 1; i++) {
				jsonData[createForm.elements[i].name] = createForm.elements[i].value;
			}
			client.send(JSON.stringify(jsonData));
		});
	}
	static get observedAttributes() { return ["reply-display", "replies-display", "flag-display", "vote-display", "remove-display", "removed" ]; };
	// Respond to attribute changes...
	attributeChangedCallback(attr, oldValue, newValue, namespace) {
		// super.attributeChangedCallback(attr, oldValue, newValue, namespace);
		if(attr === 'reply-display') {
			/* Reset replyToggle activation, Hide Create Form, apply new display value for replyToggle.. */
			const replyToggle = this.shadowRoot.querySelector('#reply-toggle')
			replyToggle.classList.remove('active')
			MyCommentComponent._applyDisplayValueClass(replyToggle, newValue)
			const createForm = this.shadowRoot.querySelector('#create-form')
			createForm.add('hidden')
		}
		else if (attr === 'replies-display') {
			const repliesToggle = this.shadowRoot.querySelector('#replies-toggle')
			repliesToggle.remove('active')
			MyCommentComponent._applyDisplayValueClass(repliesToggle, newValue)
			const replies = this.shadowRoot.querySelector('#replies')
			replies.add('hidden')
		}
		else if (attr === 'flag-display') {
			const flagButton = this.shadowRoot.querySelector('#flag-button')
			MyCommentComponent._applyDisplayValueClass(flagButton, newValue)
		}
		else if (attr === 'vote-display') {
			const upVoteButton = this.shadowRoot.querySelector('#up-vote-button')
			MyCommentComponent._applyDisplayValueClass(upVoteButton, newValue)
			const downVoteButton = this.shadowRoot.querySelector('#down-vote-button')
			MyCommentComponent._applyDisplayValueClass(downVoteButton, newValue)
		}
		else if (attr === 'remove-display') {
			const removeButton = this.shadowRoot.querySelector('#remove-button')
			MyCommentComponent._applyDisplayValueClass(removeButton, newValue)
		}
		else if(attr === 'removed') {
			const content = this.shadowRoot.querySelector('#content')
			if(newValue !== '')
				content.classList.add('removed')
			else 
				content.classList.remove('removed')
			/* Reset replyToggle activation, Hide Create Form, apply new display value for replyToggle.. */
			// const replyToggle = this.shadowRoot.querySelector('#reply-toggle')
			// replyToggle.classList.remove('active')
			// MyCommentComponent._applyDisplayValueClass(replyToggle, newValue)
			// const createForm = this.shadowRoot.querySelector('#create-form')
			// createForm.add('hidden')
			// const flagButton = this.shadowRoot.querySelector('#flag-button')
			// MyCommentComponent._applyDisplayValueClass(flagButton, newValue)
			// const upVoteButton = this.shadowRoot.querySelector('#up-vote-button')
			// MyCommentComponent._applyDisplayValueClass(upVoteButton, newValue)
			// const downVoteButton = this.shadowRoot.querySelector('#down-vote-button')
			// MyCommentComponent._applyDisplayValueClass(downVoteButton, newValue)
		}
		// Update rending not needed, styling is applied via css
  		// this._updateRendering();
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
	/* NORMAL ATTRIBUTES (hold state/style/stype) */
	get replyDisplay() {
		return this.hasAttribute('reply-display')
	}
	set replyDisplay(val) {
		if(val) {
			this.setAttribute('reply-display', val)		
		}
		else {
			this.removeAttribute('reply-display')
		}
	}
	get flagDisplay() {
		return this.hasAttribute('flag-display')
	}
	set flagDisplay(val) {
		if(val) {
			this.setAttribute('flag-display', val)
		}
		else {
			this.removeAttribute('flag-display')
		}
	}
	get voteDisplay() {
		return this.hasAttribute('vote-display')
	}
	set voteDisplay(val) {
		if(val) {
			this.setAttribute('vote-display', val)
		}
		else {
			this.removeAttribute('vote-display')
		}
	}
	get repliesDisplay() {
		return this.hasAttribute('replies-display')
	}
	set repliesDisplay(val) {
		if(val) {
			this.setAttribute('replies-display', val)
		}
		else {
			this.removeAttribute('replies-display')
		}
	}
	get removeDisplay() {
		return this.hasAttribute('remove-display')
	}
	set removeDisplay(val) {
		if(val) {
			this.setAttribute('remove-display', val)
		}
		else {
			this.removeAttribute('remove-display')
		}
	}
	get removed() {
		return this.hasAttribute('removed')
	}
	set removed(val) {
		if(val) {
			this.setAttribute('removed', '')
		}
		else {
			this.removeAttribute('removed')
		}
	}
	/* DATA */
	get comment() {
		return this._comment
	}
	set comment(val) {
		if(val) {
			this._comment = val
		}
		else {
			delete this._comment
		}
	}
	static _applyDisplayValueClass(element, value) {
		Object.keys(MyCommentComponent.displayValues).forEach((key) => {
			element.classList.remove(MyCommentComponent.displayValues[key])
		})
		element.classList.add(value)
	}
	static _getDisplayValueClass(element) {
		Object.keys(MyCommentComponent.displayValues).forEach((key) => {
			if(element.classList.contains(MyCommentComponent.displayValues[key])) {
				return MyCommentComponent.displayValues[key];
			}
		})
	}
}


