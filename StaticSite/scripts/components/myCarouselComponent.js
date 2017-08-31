window.portfolio.components.MyCarouselComponent = class extends HTMLElement {
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
	}
	// Called when the element is adopted into a new document
	adoptedCallback(oldDocument, newDocument) {
		super.adoptedCallback(oldDocument, newDocument)
	}
	/* DATA */
	get currentSlide() {
		return this._currentSlide
	}
	get currentSlideIndex() {
		return this._currentSlideIndex
	}
	_refreshShadowRoot() {
		const component = this
		this.shadowRoot.innerHTML = `
		<div id='controls'>
			<span id='previous' class='control'>&lt;</span>
			<span id='numbering'></span>
			<span id='next' class='control'>&gt;</span>
		</div>
		<div id='container'>
			<div id='slides'>
				<slot id='slidesSlot' name='slide'></slot>
			</div>
		</div>
		<style>
		:host {
			display: block;
			position: absolute;
			overflow: hidden;
			width: 100%;
			height: 100%;
		}
		#container {
			position: relative;
			height: 100%;
			width: 100%;
			overflow-y: scroll;
			z-index: 1;
		}
		#controls {
			position: absolute;
			left: calc(50% - 100px);
			height: 30px;
			width: 200px;
			overflow: hidden;
			z-index: 2;
		}
		.control {
			font: bold 20px Verdana, sans-serif;
			cursor: pointer;
			vertical-align: middle;
			text-align: center;
		}
		.control:hover {
			color: red;
			background: rgba(0,0,0,.3);
			cursor: pointer;
		}
		.number.current-number {
			color: red;
		}
		#slides {
			width: 100%;
			height: 100%;
		}
		#slidesSlot::slotted(*) {
			position: absolute;
			display: inline-block;
			transition: .5s all linear;
			overflow: hidden;
			top: 0%;
			left: -100%;
			width: 100%;
		}
		#slidesSlot::slotted(.current) {
			left: 0%;
			top: 0%;
			text-align: center;
		}
		.hidden {
			overflow: hidden !important;
			width: 0px !important;
		}
		</style>
		`
		const slidesSlot = this.shadowRoot.getElementById("slidesSlot")
		const controls = this.shadowRoot.getElementById("controls")
		const next = this.shadowRoot.getElementById("next")
		const previous = this.shadowRoot.getElementById("previous")
		const numbering = this.shadowRoot.getElementById("numbering")
		const numbers = this.shadowRoot.querySelector(".number")

		var changeSlide = function(newIndex) {
			if(newIndex != this._currentSlideIndex) {
				var newSlide
				if(newIndex === this._currentSlideIndex+1) {
					// Next Sibling -> Quicker
					newSlide = this._currentSlide.nextElementSibling
				}
				else if(newIndex === this._currentSlideIndex-1) {
					// Previous Sibling
					newSlide = this._currentSlide.previousElementSibling
				}
				else {
					// Other Index
					newSlide = slidesSlot.assignedNodes()[newIndex]
				}
				newSlide.classList.add("current")
				if(this._currentSlide) 
					this._currentSlide.classList.remove("current")
				this._currentSlide = newSlide
				this._currentSlideIndex = newIndex
				if(!this._currentSlide.nextElementSibling) {
					next.classList.add("hidden")
				}
				else {
					next.classList.remove("hidden")
				}
				if(!this._currentSlide.previousElementSibling) {
					previous.classList.add("hidden")
				}
				else {
					previous.classList.remove("hidden")
				}
				const previousNumber = numbering.querySelector(".number.current-number")
				if(previousNumber)
					previousNumber.classList.remove("current-number")
				const newNumber = numbering.querySelector(".number.number"+(this._currentSlideIndex+1))
				newNumber.classList.add("current-number")
			}
		}
		var initSlides = function() {
			const slides = slidesSlot.assignedNodes()
			if(slides.length > 0) {
				var numberingHTML = ""
				for(var i=0; i < slides.length; i++) {
					numberingHTML += "<span class='number number"+(i+1)+" control'>"+(i+1)+"</span>"
				}
				numbering.innerHTML = numberingHTML
				const numbers = numbering.querySelectorAll(".number")
				for(var i=0; i < numbers.length; i++) {
					numbers[i].addEventListener("click", function(event) {
						changeSlide.call(component, Number(event.target.innerText)-1)
					})
				}
				changeSlide.call(component, 0)
			}
			else {
				controls.classList.add("hidden")
			}
		}
		initSlides()
		slidesSlot.addEventListener("slotchange", event => {
			initSlides()
		})
		next.addEventListener("click", function(event) {
			previous.classList.remove("hidden")
			changeSlide.call(component, component._currentSlideIndex+1)
		})
		previous.addEventListener("click", function(event) {
			next.classList.remove("hidden")
			changeSlide.call(component, component._currentSlideIndex-1)
		})
	}
}
if(!window.customElements.get("my-carousel")) {
	window.customElements.define("my-carousel", window.portfolio.components.MyCarouselComponent)
}