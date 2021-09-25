'use strict'

const FOCUSABLE_ELEMENTS = [
	'a[href]',
	'area[href]',
	'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
	'select:not([disabled]):not([aria-hidden])',
	'textarea:not([disabled]):not([aria-hidden])',
	'button:not([disabled]):not([aria-hidden])',
	'iframe',
	'object',
	'embed',
	'[contenteditable]',
	'[tabindex]:not([tabindex^="-"])'
]

class SB_Modal {
	constructor(options) {
		const defaults = {
			selector: '[data-sb-modal]',
			onShow: () => { },
			onClose: () => { },
			openClass: 'is-open',
			disableScroll: true,
			disableFocus: true,
			awaitCloseAnimation: true,
			awaitOpenAnimation: true,
			debug: false			
		};
		
		this.activeModal = false
		
		this.settings = Object.assign({}, defaults, options);
		this.init();
	}
	
	init() {
		this.addEventListeners();
		this.setElements()
	}
	
	setElements() {
		let elements;
		
		if( 'selector' in this.settings ) {
			elements = document.querySelectorAll(this.settings.selector);	
		}
		else if( 'elements' in this.settings ) {
			elements = this.settings.elements;
		}
		
		// Set up modal elements
		this.elements = Array.from(elements).map(element => {
			element.style.display = "none"
			
			if( 'sb' in element ) {				
				element.sb.component = 'modal'
			}
			else {
				element.sb = {
					component: 'modal'
				}
			}
			
			return element
		});	
	}
	
	getTriggerElement(element) {
		return element.sb && element.sbTrigger ? element.sbTrigger : null;
	}
	
	addEventListeners() {
		document.addEventListener('click', (e) => {
			if( e.target.closest('[data-sb-open]') ) {
				e.preventDefault();
			
				const target = document.querySelector(e.target.getAttribute('data-sb-open'));
				
				console.log(target)
				
				// If no target found and only one modal, assume they meant that modal
				// Otherwise open the target indicated, if it exists
				if( !target && this.elements.length === 1 ) {
					this.openModal(this.elements[0]);
				}
				else if( target ) {
					this.openModal(target)
				}				
			}
			else if( e.target.closest('[data-sb-close') && this.activeModal ) {
				this.closeModal(this.activeModal)
			}
		});
		
		document.addEventListener('keydown', (e) => {
			if (e.keyCode === 27) this.closeModal(this.activeModal) // esc
			if (e.keyCode === 9) this.retainFocus(e) // tab		
		})				
	}
	
	scrollBehavior(toggle) {
		if (!this.settings.disableScroll) return
		
		const body = document.querySelector('body')
		
		if( toggle ===  'on') {			
			Object.assign(body.style, { overflow: '' })
		}
		else if( toggle === 'off' ) {			
			Object.assign(body.style, { overflow: 'hidden' })
		}
	}	
	
	// Thank you MicroModal for this and many other things!
	retainFocus (event) {
		let focusableNodes = this.getFocusableNodes()
	
		// no focusable nodes
		if (focusableNodes.length === 0) return
	
		/**
		 * Filters nodes which are hidden to prevent
		 * focus leak outside modal
		 */
		focusableNodes = focusableNodes.filter(node => {
			return (node.offsetParent !== null)
		})
	
		// if disableFocus is true
		if (!this.modal.contains(document.activeElement)) {
			focusableNodes[0].focus()
		} else {
			const focusedItemIndex = focusableNodes.indexOf(document.activeElement)
	
			if (event.shiftKey && focusedItemIndex === 0) {
				focusableNodes[focusableNodes.length - 1].focus()
				event.preventDefault()
			}
	
			if (!event.shiftKey && focusableNodes.length > 0 && focusedItemIndex === focusableNodes.length - 1) {
				focusableNodes[0].focus()
				event.preventDefault()
			}
		}
	}	
	
	getFocusableNodes () {
		const nodes = this.modal.querySelectorAll(FOCUSABLE_ELEMENTS)
		return Array(...nodes)
	}	
	
	openModal(element) {
		console.log('opening modal', element)
		
		// Bail if element isn't a registered modal
		if( !element.sb || element.sb.component !== 'modal' ) return false
		
		
		// Set attributes
		element.ariaHidden    = false
		element.style.display = 'block'
		element.classList.add = this.settings.openClass
		
		// Attempt to turn off scrolling if enabled in settings
		this.scrollBehavior('off')
		
		this.activeModal = element
	}
	
	closeModal(element) {
		// Bail if element isn't a registered modal
		if( !element.sb || element.sb.component !== 'modal' ) return false		
		
		// Set attributes
		element.ariaHidden       = true
		element.style.display    = 'none'
		element.classList.remove = this.settings.openClass
		
		// Attempt to turn on scrolling if enabled in settings
		this.scrollBehavior('on')
	}	
	
	// removeCloseListeners(modal) {
	// 	const closeElements = modal.querySelectorAll('[data-sb-close]')
	// 	
	// 	if( closeElements ) {
	// 		Array.from(closeElements).forEach(element => {
	// 			element.removeEventListener('touchstart', this.closeHandlerClick)
	// 			element.removeEventListener('click', this.closeHandlerClick)		
	// 		})
	// 	}
	// 	
	// 	document.removeEventListener('keydown', this.closeHandlerKeydown)		
	// }
}