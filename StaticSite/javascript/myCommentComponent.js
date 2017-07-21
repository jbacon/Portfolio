class MyCommentComponent extends HTMLElement {
	// Add Listeners, innerHTML, styling, etc...
	constructor({comment, currentUserID, isAdmin}={}) {
		super();
		this.comment = comment || null;
		this.currentUserID = currentUserID || null;
		this.isAdmin = isAdmin || null;
		this.attachShadow({ mode: "open" });
		this._redrawShadowRootDOM()
	}
	static get observedAttributes() { return [ ]; };
	// Respond to attribute changes...
	attributeChangedCallback(attr, oldValue, newValue, namespace) {
		// super.attributeChangedCallback(attr, oldValue, newValue, namespace);
		// Just Redraw the Element U.I. because changing any attribute 
		// will propogate changes to all decendant elements anyway
		if(attr === 'comment') {
			this._redrawShadowRootDOM()
		}
		else if(attr === 'current-user-id') {
			this._redrawShadowRootDOM()
		}
		else if(attr === 'is-admin') {
			this._redrawShadowRootDOM()
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
	/* DATA */
	get comment() {
		return JSON.parse(this.getAttribute('comment'));
	}
	set comment(val) {
		if(val) {
			this.setAttribute('comment', JSON.stringify(val));
		}
		else {
			this.removeAttribute('comment');
		}
	}
	get currentUserID() {
		return this.getAttribute('current-user-id');
	}
	set currentUserID(val) {
		if(val) {
			this.setAttribute('current-user-id', val);
		}
		else {
			this.removeAttribute('current-user-id');
		}
	}
	get isAdmin() {
		return this.getAttribute('is-admin');
	}
	set isAdmin(val) {
		if(val) {
			this.setAttribute('is-admin', val);
		}
		else {
			this.removeAttribute('is-admin');
		}
	}
	/* INTERNAL FUNCIONS */
	_create(callback) {
		const loadNewButton = this.shadowRoot.querySelector('#load-new-button')
		const loadOldButton = this.shadowRoot.querySelector('#load-old-button')  
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
					if(component.children.length === 0)
						loadOldButton.click();
					else
						loadNewButton.click();
					replyToggle.click();
					createForm.reset()
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
		client.open('POST', API_SERVER_ADDRESS()+'/comments/up-vote');
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
						const newComment = new MyCommentComponent({ comment: comments[i], currentUserID: component.currentUserID, isAdmin: component.isAdmin});
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
						const newComment = new MyCommentComponent({ comment: comments[i], currentUserID: component.currentUserID, isAdmin: component.isAdmin});
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
	_redrawShadowRootDOM() {
		const component = this;
		this.shadowRoot.innerHTML = `
			<div>
				<span>
					${ (this.comment.account && this.comment.account.facebookProfileID) ? '<img display="inline-block" width="50px" height="50px" alt="" src="http://graph.facebook.com/'+this.comment.account.facebookProfileID+'/picture?type=large">' : ''}
				</span>
				<span style='width: 500px;'>
					<div id='header'>${(this.comment.account) ? this.comment.account.nameFirst+' '+this.comment.account.nameLast+' @ '+this.comment.dateCreated : ''}</div>
					<div id='content'>${this.comment.text}</div>
				</span>
			</div>
			<footer>
				<div id='actions'>
					<button id='replies-toggle' name='Replies'>Replies</button>
					<button id='reply-toggle' name='Reply' class='hidden'>Reply</button>
					<span id='up-vote-count'>${'+'+this.comment.upVoteAccountIDs.length}</span>
					<button id='up-vote-button' name='Up' class='hidden'>Up</button>
					<span id='down-vote-count'>${'-'+this.comment.downVoteAccountIDs.length}</span>
					<button id='down-vote-button' name='Down' class='hidden'>Down</button>
					<button id='remove-button' name='Remove' class='hidden'>Remove</button>
					<button id='flag-button' name='Flag' class='hidden'>Flag</button>
				</div>
				<div id='replies' data-start='newest' class='hidden'>
					<button id='load-new-button' class='hidden' name='Load Newest..'>Load Newest..</button>
					<slot id="repliesSlot"></slot>
					<button id='load-old-button' class='hidden'>Load more..</button>
				</div>
				<form id='create-form' action='' class='hidden'>
					<input id='article-id' name='articleID' type='hidden' value='${this.comment.articleID}'>
					<input id='parent-comment-id' name='parentCommentID' type='hidden' value='${this.comment._id}'>
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
		
		if(this.comment.removed) {
			this._applyStyleRemoved()
		}
		repliesToggle.addEventListener('click', function(event) {
			if(!repliesToggle.classList.contains('disabled')) {
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
			if(!replyToggle.classList.contains('disabled')) {
				replyToggle.classList.toggle('active')
				createForm.classList.toggle('hidden')
				var firstFormInput = createForm.querySelector('#text')
				if(firstFormInput.isEqualNode(document.activeElementcreateForm)) {
			        firstFormInput.blur();
			    } else {
			        firstFormInput.focus();
			    }
			}
		});
		removeButton.addEventListener('click', function(event) {
			if(!removeButton.classList.contains('disabled')) {
				component._remove.call(component, function(err) {
					if(err)
						handleServerErrorResponse(err)
				});
			}
		});
		flagButton.addEventListener('click', function(event) {
			if(!flagButton.classList.contains('disabled')) {
				component._flag.call(component, function(err) {
					if(err) 
						handleServerErrorResponse(err)
					else 
						alert('Comment has been flagged, system admin has been alerted...')
				});
			}
		});
		upVoteButton.addEventListener('click', function(event) {
			if(!upVoteButton.classList.contains('disabled')) {
				component._upVote.call(component, function(err) {
					if(err) 
						handleServerErrorResponse(err)
				});
			}
		});
		downVoteButton.addEventListener('click', function(event) {
			if(!downVoteButton.classList.contains('disabled')) {
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
		if(this.currentUserID) {
			replyToggle.classList.remove('hidden')
			repliesToggle.classList.remove('hidden')
			upVoteButton.classList.remove('hidden')
			downVoteButton.classList.remove('hidden')
			flagButton.classList.remove('hidden')
			if(this.isAdmin || this.comment.accountID === this.currentUserID) {
				removeButton.classList.remove('hidden')
			}
		}
	}
	_applyStyleRemoved() {
		/* Complicated logic....
		DYNAMIC STYLING OPTIONS:
			- Hide Entire Comment -> Only if no dependent children exist
			- Hide Only Comment Content/User -> Only if dependent children exist 
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
		var canHide = function() {
			if(totalChildren === 0)
				return true
			for(var i=0; i < this.children.length; i++) {
				if(!this.children[i].classList.contains('hidden')) {
					return false
				}
			}
			// Comments might be missing from current children, still can't be true...
			if(totalChildren !== this.children.length)
				return false
			return true;
		}
		var recursivelyPaginateChildrenToDetermineVisbility = function()
		{
			if(canHide.call(this)) { // Try without querying database
				this.classList.add('hidden');
			}
			else {
				this._loadMoreReplies(function(err) {
					if(err) {
						handleServerErrorResponse(err)
					}
					else {
						recursivelyPaginateChildrenToDetermineVisbility.call(this)
					}
				});
			}
		}
		recursivelyPaginateChildrenToDetermineVisbility.call(this)
	}
}


