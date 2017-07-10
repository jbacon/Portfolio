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
		this.attachShadow({ mode: "open" });
		const component = this;
		this.shadowRoot.innerHTML = `
			<div>
				<span style='width:50px; height=50px;'>
					${ (comment.account && comment.account.facebookProfileID) ? '<img display="inline-block" width="50px" height="50px" alt="" src="http://graph.facebook.com/'+comment.account.facebookProfileID+'/picture?type=large">' : ''}
				</span>
				<span style='width: 500px;'>
					<div id='header'>${(comment.account) ? comment.account.nameFirst+' '+comment.account.nameLast+' @ '+comment.dateCreated : ''}</div>
					<div id='content'><p>${comment.text}</p></div>
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
					content: "";
				}
				#replies-toggle.active::before {
					content: "Hide ";
				}
				#reply-toggle:not(.active)::before {
					content: "";
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
				// button([disabled]) {
				// }
			</style>
		`;
		const content = this.shadowRoot.querySelector('#content')
		const repliesToggle = this.shadowRoot.querySelector('#replies-toggle')
		const repliesSection = this.shadowRoot.querySelector('#replies')
		const replyToggle = this.shadowRoot.querySelector('#reply-toggle')
		const createForm = this.shadowRoot.querySelector('#create-form')
		const removeButton = this.shadowRoot.querySelector('#remove-button')
		const flagButton = this.shadowRoot.querySelector('#flag-button')
		const upVoteButton = this.shadowRoot.querySelector('#up-vote-button')
		const upVoteCount = this.shadowRoot.querySelector('#up-vote-count')
		const downVoteButton = this.shadowRoot.querySelector('#down-vote-button')
		const downVoteCount = this.shadowRoot.querySelector('#down-vote-count')
		const loadNewButton = this.shadowRoot.querySelector('#load-new-button')
		const loadOldButton = this.shadowRoot.querySelector('#load-old-button')              
		
		if(comment.removed) {
			this._applyStyleRemoved()
		}
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
				component._remove.call(component, function(err) {
					if(err)
						handleServerErrorResponse(err)
				});
			}
		});
		flagButton.addEventListener('click', function(event) {
			if(component.flagDisplay !== MyCommentComponent.displayValues.disabled && component.flagDisplay !== MyCommentComponent.displayValues.hidden) {
				component._flag.call(component, function(err) {
					if(err) 
						handleServerErrorResponse(err)
					else 
						alert('Comment has been flagged, system admin has been alerted...')
				});
			}
		});
		upVoteButton.addEventListener('click', function(event) {
			if(component.voteDisplay !== MyCommentComponent.displayValues.disabled && component.voteDisplay !== MyCommentComponent.displayValues.hidden) {
				component._upVote.call(component, function(err) {
					if(err) 
						handleServerErrorResponse(err)
				});
			}
		});
		downVoteButton.addEventListener('click', function(event) {
			if(component.voteDisplay !== MyCommentComponent.displayValues.disabled && component.voteDisplay !== MyCommentComponent.displayValues.hidden) {
				component._downVote.call(component, function(err) {
					if(err) 
						handleServerErrorResponse(err)
				});
			}
		});
		loadNewButton.addEventListener('click', function(event) {
			component._loadNewReplies.call(component, function(err) {
					if(err) 
						handleServerErrorResponse(err)
			});
		});
		loadOldButton.addEventListener('click', function(event) {
			component._loadMoreReplies.call(component, function(err) {
					if(err) 
						handleServerErrorResponse(err)
			});
		});
		createForm.addEventListener('submit', function(event) {
			event.preventDefault();
			component._create.call(component, function(err) {
					if(err) 
						handleServerErrorResponse(err)
			});
		});
	}
	static get observedAttributes() { return ["reply-display", "replies-display", "flag-display", "vote-display", "remove-display" ]; };
	// Respond to attribute changes...
	attributeChangedCallback(attr, oldValue, newValue, namespace) {
		// super.attributeChangedCallback(attr, oldValue, newValue, namespace);
		if(attr === 'reply-display') {
			/* Reset replyToggle activation, Hide Create Form, apply new display value for replyToggle.. */
			const replyToggle = this.shadowRoot.querySelector('#reply-toggle')
			replyToggle.classList.remove('active')
			this._applyDisplayValueClass(replyToggle, newValue)
			const createForm = this.shadowRoot.querySelector('#create-form')
			createForm.add('hidden')
		}
		else if (attr === 'replies-display') {
			const repliesToggle = this.shadowRoot.querySelector('#replies-toggle')
			repliesToggle.remove('active')
			this._applyDisplayValueClass(repliesToggle, newValue)
			const replies = this.shadowRoot.querySelector('#replies')
			replies.add('hidden')
		}
		else if (attr === 'flag-display') {
			const flagButton = this.shadowRoot.querySelector('#flag-button')
			this._applyDisplayValueClass(flagButton, newValue)
		}
		else if (attr === 'vote-display') {
			const upVoteButton = this.shadowRoot.querySelector('#up-vote-button')
			this._applyDisplayValueClass(upVoteButton, newValue)
			const downVoteButton = this.shadowRoot.querySelector('#down-vote-button')
			this._applyDisplayValueClass(downVoteButton, newValue)
		}
		else if (attr === 'remove-display') {
			const removeButton = this.shadowRoot.querySelector('#remove-button')
			this._applyDisplayValueClass(removeButton, newValue)
		}
		// Propogate AttributeChanged Event to all Child Comment Components (Replies)
		const myCommentList = this.getElementsByTagName("my-comment")
		for(var i=0; i < myCommentList.length; i++) {
			myCommentList[i].setAttribute(attr, newValue)
		}
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
	_create(callback) {
		const loadNewButton = this.shadowRoot.querySelector('#load-new-button')
		const replyToggle = this.shadowRoot.querySelector('#reply-toggle')
		const createForm = this.shadowRoot.querySelector('#create-form')
		const component = this;
		const client = new XMLHttpRequest();
		client.onreadystatechange = function() {
			if (this.readyState === XMLHttpRequest.DONE) {
				const response = JSON.parse(this.response);
				if(this.status === 200) {
					// If initial comment, unhide 'Show Comments' and click 'Show Comments'
					// Otherwise Programmatically click load latest comments...
					loadNewButton.click();
					replyToggle.click();
					callback.call(component)
				}
				else {
					callback.call(component, response);
				}
			}
		}
		client.open('POST', API_SERVER_ADDRESS()+'/comments/create');
		client.setRequestHeader("Authorization", "Bearer "+window.localStorage.token);
		client.setRequestHeader("Content-Type", "application/json");
		var jsonData = {}
		for(var i = 0; i < event.target.length - 1; i++) {
			jsonData[createForm.elements[i].name] = createForm.elements[i].value;
		}
		client.send(JSON.stringify(jsonData));
	}
	_remove(callback) {
		const component = this;
		const client = new XMLHttpRequest();
		client.onreadystatechange = function() {
			if (this.readyState === XMLHttpRequest.DONE) {
				const response = JSON.parse(this.response);
				if(this.status === 200) {
					component._applyStyleRemoved()
					callback.call(component)
				}
				else {
					callback.call(component, response)
				}
			}
		}
		client.open('POST', API_SERVER_ADDRESS()+'/comments/remove');
		client.setRequestHeader("Authorization", "Bearer "+window.localStorage.token);
		client.setRequestHeader("Content-Type", "application/json");
		var data = {}
		data._id = this.comment._id || null;
		client.send(JSON.stringify(data));
	}
	_flag(callback) {
		const component = this;
		const client = new XMLHttpRequest();
		client.onreadystatechange = function() {
			if (this.readyState === XMLHttpRequest.DONE) {
				const response = JSON.parse(this.response);
				if(this.status === 200) {
					component._applyStyleRemoved()
					callback.call(component)
				}
				else {
					callback.call(component, response)
				}
			}
		}
		client.open('POST', API_SERVER_ADDRESS()+'/comments/flag');
		client.setRequestHeader("Authorization", "Bearer "+window.localStorage.token);
		client.setRequestHeader("Content-Type", "application/json");
		var data = {}
		data._id = this.comment._id || null;
		client.send(JSON.stringify(data));
	}
	_upVote(callback) {
		const upVoteCount = this.shadowRoot.querySelector('#up-vote-count')
		const component = this;
		const client = new XMLHttpRequest();
		client.onreadystatechange = function() {
			if (this.readyState === XMLHttpRequest.DONE) {
				const response = JSON.parse(this.response);
				if(this.status === 200) {
					upVoteCount.innerHTML = '-'+(Number(upVoteCount.innerHTML.substring(1))+1)
					callback.call(component)
				}
				else {
					callback.call(component, response)
				}
			}
		}
		client.open('POST', API_SERVER_ADDRESS()+'/comments/down-vote');
		client.setRequestHeader("Authorization", "Bearer "+window.localStorage.token);
		client.setRequestHeader("Content-Type", "application/json");
		var data = {}
		data._id = this.comment._id || null;
		client.send(JSON.stringify(data));
	}
	_downVote(callback) {
		const downVoteCount = this.shadowRoot.querySelector('#down-vote-count')
		const component = this;
		const client = new XMLHttpRequest();
		client.onreadystatechange = function() {
			if (this.readyState === XMLHttpRequest.DONE) {
				const response = JSON.parse(this.response);
				if(this.status === 200) {
					downVoteCount.innerHTML = '-'+(Number(downVoteCount.innerHTML.substring(1))+1)
					callback.call(component)
				}
				else {
					callback.call(component, response)
				}
			}
		}
		client.open('POST', API_SERVER_ADDRESS()+'/comments/down-vote');
		client.setRequestHeader("Authorization", "Bearer "+window.localStorage.token);
		client.setRequestHeader("Content-Type", "application/json");
		var data = {}
		data._id = this.comment._id || null;
		client.send(JSON.stringify(data));
	}
	_loadNewReplies(callback) {
		const query = {}
		if(this.firstElementChild && this.firstElementChild.comment)
			query.start = this.firstElementChild.comment._id
		else
			query.start = 'newest'
		query.sortOrder = 1
		query.pageNum = 1
		query.pageSize = 5
		query.articleID = this.comment.articleID
		query.parentCommentID = this.comment._id || null;
		const queryString = JSON.stringify(query);
		const encodedQuery = encodeURIComponent(queryString);
		const component = this;
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
					callback.call(component)
				}
				else {
					callback.call(component, response)
				}
			}
		}
		client.open('GET', API_SERVER_ADDRESS()+'/comments/read?data='+encodedQuery);
		client.send();
	}
	_loadMoreReplies(callback) {
		const repliesSection = this.shadowRoot.querySelector('#replies')
		const query = {}
		query.start = repliesSection.dataset.start //either 'newest' or some id
		query.sortOrder = -1
		query.pageNum = Number(repliesSection.dataset.pageNum || 1)
		query.skipOnPage = Number(repliesSection.dataset.skipOnPage || 0)
		query.pageSize = 5
		query.articleID = this.comment.articleID
		query.parentCommentID = this.comment._id || null;
		const queryString = JSON.stringify(query);
		const encodedQuery = encodeURIComponent(queryString);
		const component = this;
		const client = new XMLHttpRequest();
		client.onreadystatechange = function() {
			if (this.readyState === XMLHttpRequest.DONE) {
				const response = JSON.parse(this.response);
				if(this.status === 200) {
					const comments = response.data;
					if(repliesSection.dataset.start == 'newest' && comments.length > 0) {
						repliesSection.dataset.start = comments[0]._id
					}
					repliesSection.dataset.skipOnPage = ((comments.length + query.skipOnPage) < 5) ? query.skipOnPage + comments.length : 0
					repliesSection.dataset.pageNum = ((comments.length + query.skipOnPage) < 5) ? query.pageNum : query.pageNum+1
					for(var i = 0; i < comments.length; i++) {
						const newComment = new MyCommentComponent(comments[i]);
						component.insertAdjacentElement('beforeend', newComment)
					}
					callback.call(component)
				}
				else {
					callback.call(component, response)
				}
			}
		}
		client.open('GET', API_SERVER_ADDRESS()+'/comments/read?data='+encodedQuery);
		client.send();
	}
	_applyStyleRemoved() {
		/*
		1) Disable all features...
		2) Check for replies (child comments)
		3) If all replies are hidden (thus also disabled), 
			then also hide this parent comment...
		~ Only hide comments that are removed are also have no visible children...
		*/
		const content = this.shadowRoot.querySelector('#content')
		const replyToggle = this.shadowRoot.querySelector('#reply-toggle')
		const repliesSection = this.shadowRoot.querySelector('#replies')
		const createForm = this.shadowRoot.querySelector('#create-form')
		const removeButton = this.shadowRoot.querySelector('#remove-button')
		const flagButton = this.shadowRoot.querySelector('#flag-button')
		const upVoteButton = this.shadowRoot.querySelector('#up-vote-button')
		const downVoteButton = this.shadowRoot.querySelector('#down-vote-button')
		const loadNewButton = this.shadowRoot.querySelector('#load-new-button')
		const loadOldButton = this.shadowRoot.querySelector('#load-old-button') 
		content.classList.add('removed')
		removeButton.classList.add('disabled')
		replyToggle.classList.remove('active')
		replyToggle.classList.add('disabled')
		createForm.classList.add('hidden')
		flagButton.classList.add('disabled')
		upVoteButton.classList.add('disabled')
		downVoteButton.classList.add('disabled')
		const totalChildren = this.comment.childCommentIDs.length;
		if(totalChildren === 0) {
			this.classList.add('hidden');
		}
		else {
			const canHide = function() {
				var canHide = true
				for(var i=0; i < this.children.length; i++) {
					if(!this.children[i].classList.contains('hidden')) {
						canHide = false
						break;
					}
				}
				return canHide;
			}

			var checkPaginatedRepliesRecursively = function()
			{
				this._loadMoreReplies(function(err) {
					if(err) {
						handleServerErrorResponse(err)
					}
					else {
						var canHide = true
						for(var i=0; i < this.children.length; i++) {
							if(!this.children[i].classList.contains('hidden')) {
								canHide = false
								break;
							}
						}
						/* Get new current page */
						if(canHide) { 
							/* Might be able to hide.... 
							if no more comments */
							if(totalChildren === this.children.length) {
								/* If lastPage same as currentPage, reached end of pagination!!!
								Can hide*/
								this.classList.add('hidden');
							}
							else {
								/* Need to query more children.. */
								checkPaginatedRepliesRecursively.call(this)
							}
						}
						else {
							// Can't hide... or done!
						}
					}
				});
			}
			checkPaginatedRepliesRecursively.call(this)
		}
	};
	_applyDisplayValueClass(element, value) {
		Object.keys(MyCommentComponent.displayValues).forEach((key) => {
			element.classList.remove(MyCommentComponent.displayValues[key])
		})
		element.classList.add(value)
	}
	_getDisplayValueClass(element) {
		Object.keys(MyCommentComponent.displayValues).forEach((key) => {
			if(element.classList.contains(this.displayValues[key])) {
				return MyCommentComponent.displayValues[key];
			}
		})
	}
}


