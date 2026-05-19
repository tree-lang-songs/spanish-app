const al_iniciar = function(evento){
	window.addEventListener("load", evento)
}

const selecciona = function(selector){
	const nodos = document.querySelectorAll(selector)
	return new objeto_selector_de_elementos_html(nodos)
}

class objeto_selector_de_elementos_html {
	constructor(nodos = []) {
		if(nodos.length == 0) nodos = [document.createElement("div")]
		this.nodos = nodos
		
		this.clase = new Proxy({}, {
			get: (target, nombre) => this.nodos[0]?.classList.contains(nombre),
			set: (target, nombre, valor) => {
				this.nodos.forEach(nodo=>{
					if(valor) nodo?.classList.add(nombre)
					else nodo?.classList.remove(nombre)
				})
				return true;
			}
		});
		
		this.atributo = new Proxy({}, {
			get: (target, nombre) => this.nodos[0]?.getAttribute(nombre.replaceAll('_', '-')),
			set: (target, nombre, valor) => {
				if(valor!==null) this.nodos[0]?.setAttribute(nombre.replaceAll('_', '-'), valor)
				else {
					this.nodos[0]?.removeAttribute(nombre.replaceAll('_', '-'))
				}
				return true;
			}
		});
		
		this.estilo = new Proxy({}, {
			get: (target, nombre) => this.nodos[0]?.style.getPropertyValue(nombre.replaceAll('_', '-')),
			set: (target, nombre, valor) => {
				if(valor!=null) this.nodos[0]?.style.setProperty(nombre.replaceAll('_', '-'), valor)
				else this.nodos[0]?.style.removeProperty(nombre.replaceAll('_', '-'))
				return true;
			}
		});
	}
	
	obtén(posición){
		if(this.nodos[posición] == null) throw new Error(`No existe ningún elemento en ${posición}`)
		return new objeto_selector_de_elementos_html([this.nodos[posición]])
	}
	
	elemento(posición){
		if(this.nodos.length <= posición) return null
		return new objeto_selector_de_elementos_html([this.nodos[posición]])
	}
	
	
	elimina(){
		this.nodos.forEach(nodo=>nodo.remove())
		this.nodos = []
	}
	
	elimina_animado(){
		this.clase.elimina = true
		this.nodos[0]?.addEventListener('transitionend', e=> {
			this.elimina()
		})
	}
	
	
	alterna_clase(clase){
		this.nodos[0]?.classList.toggle(clase)
	}
  
	selecciona(selector){
		if(this.nodos.length == 0) return null
		
		return new objeto_selector_de_elementos_html(this.nodos[0].querySelectorAll(selector))
	}
  
	hijo(posición){
		if(this.nodos.length == 0) return null
		return new objeto_selector_de_elementos_html([this.nodos[0].children[posición]])
	}
	
	al_coger(función){
		this.añade_evento_movimiento(función,"pointerdown")
	}
	
	al_mover(función){
		this.añade_evento_movimiento(función,"pointermove")
	}
	
	al_soltar(función){
		this.añade_evento_movimiento(función,"pointerup")
	}
	
	
	añade_evento_movimiento(función,nombre_evento){
		if(!this.eventos) this.eventos = {}
		
		this.quita_evento(nombre_evento)
		this.nodos.forEach(nodo=>{
			this.eventos[nombre_evento] = (evento)=>{
				const elemento = new objeto_selector_de_elementos_html([evento.currentTarget])
				elemento.eventos = this.eventos
				elemento.identificador_puntero = evento.pointerId
				
				evento.posición = geometría.crea_punto(evento.clientX, evento.clientY)
				
				const elementos_debajo = document.elementsFromPoint(evento.posición.x, evento.posición.y)
				for(const elemento_debajo of elementos_debajo)
					if(elemento_debajo != evento.currentTarget){
						evento.debajo = elemento_debajo
						break
					}
				if(evento.debajo) evento.debajo = new objeto_selector_de_elementos_html([evento.debajo])
				función(elemento,evento)
			
				if(evento.type==="pointerup" || evento.type=="pointerleave"){
					evento.target.releasePointerCapture(evento.pointerId)
					this.quita_evento("pointermove")
					this.quita_evento("pointerleave")
					this.quita_evento("pointerup")
				}
				
				if(evento.type==="pointerdown"){
					evento.target.setPointerCapture(evento.pointerId)
				}
			}
			
			nodo.addEventListener(nombre_evento, this.eventos[nombre_evento])
		})
	}
	
	detén_arrastre(evento){
		evento.target.releasePointerCapture(evento.pointerId)
		this.quita_evento("pointermove")
		this.quita_evento("pointerleave")
		this.quita_evento("pointerup")
	}
	
	añade(elementoHTML) {
		if(typeof elementoHTML === 'string'){
			if(this.nodos.length == 0) return null
			const contenedor = document.createElement("div");
			contenedor.innerHTML = elementoHTML.trim()
			const elemento = contenedor.firstChild
			this.nodos[0].appendChild(elemento)
			
			return new objeto_selector_de_elementos_html([elemento])
		}
		else if(elementoHTML.nodos.length > 0){
			for(const nodo of this.nodos)
				nodo.appendChild(elementoHTML.nodos[0])
		}
	}
	
	quita_evento(nombre_evento){
		if(this.eventos && this.eventos[nombre_evento]){
			this.nodos[0].removeEventListener(nombre_evento, this.eventos[nombre_evento])
		}
	}
	
	para_cada(función){
		this.nodos.forEach(nodo=>{
			función(new objeto_selector_de_elementos_html([nodo]))
		})
	}
	
	para_cada_elemento(función){
		this.nodos.forEach(nodo=>{
			función(new objeto_selector_de_elementos_html([nodo]))
		})
	}
	
	todos_cumplen(función){
		for(const nodo of this.nodos)
			if(!función(new objeto_selector_de_elementos_html([nodo]))) return false
		return true
	}
}

;(()=>{

Object.defineProperty(objeto_selector_de_elementos_html.prototype, 'orden_elemento', {
	get() {
		if(this.nodos.length <= 0) return undefined
		return Array.from(this.nodos[0].parentElement.children).indexOf(this.nodos[0]);
	}
})

Object.defineProperty(objeto_selector_de_elementos_html.prototype, 'posición_relativa', {
	get() {
		if(this.nodos.length <= 0) return undefined
		
		if (this.nodos[0] instanceof SVGGraphicsElement) {
			const rect = this.nodos[0].getBoundingClientRect();
			return geometría.crea_punto(rect.left, rect.top)
		}
		else return geometría.crea_punto(this.nodos[0].offsetLeft, this.nodos[0].offsetTop)
	}
});

Object.defineProperty(objeto_selector_de_elementos_html.prototype, 'texto', {
	get() {
		if(this.nodos.length <= 0) return undefined
		return this.nodos[0].textContent
	},

	set(texto) {
		this.nodos.forEach(nodo=>nodo.textContent = texto)
	}
});


Object.defineProperty(objeto_selector_de_elementos_html.prototype, 'número', {
	get() {
		if(this.nodos.length <= 0) return undefined
		return parseFloat(this.nodos[0].textContent)
	},

	set(número) {
		this.nodos.forEach(nodo=>{
			const decimales = nodo.getAttribute("data-decimales")
			if(decimales!==null) número = número.toFixed(decimales)
			nodo.textContent = número
		})
	}
});

Object.defineProperty(objeto_selector_de_elementos_html.prototype, 'html', {
	get() {
		if(this.nodos.length <= 0) return undefined
		return this.nodos[0].innerHTML
	},

	set(texto) {
		this.nodos.forEach(nodo=>nodo.innerHTML = texto)
	}
});


Object.defineProperty(objeto_selector_de_elementos_html.prototype, 'cantidad', {
	get() {
		return this.nodos.length
	}
});

Object.defineProperty(objeto_selector_de_elementos_html.prototype, 'primer_nodo', {
	get() {
		if(this.nodos.length<1) return null
		return this.nodos[0]
	},
});

Object.defineProperty(objeto_selector_de_elementos_html.prototype, 'existe', {
	get() {
		if(this.nodos.length<1) return null
		return this.nodos[0]
	},
})

Object.defineProperty(objeto_selector_de_elementos_html.prototype, 'valor', {
	get() {
		if(this.nodos.length<1) return null
		return this.nodos[0].value
	},
	set(valor) {
		if(this.nodos.length<1) return
		this.nodos[0].value = valor
	},
})



const propiedades_navegación_selector = {
    padre: 'parentNode',
    anterior: 'previousElementSibling',
    siguiente: 'nextElementSibling',
    primer_hijo: 'firstElementChild'
};

Object.keys(propiedades_navegación_selector).forEach(prop => {
    Object.defineProperty(objeto_selector_de_elementos_html.prototype, prop, {
        get() {
			return new objeto_selector_de_elementos_html([this.nodos[0][propiedades_navegación_selector[prop]]])
		}
    });
});

Object.defineProperty(objeto_selector_de_elementos_html.prototype, "hijos", {
	get() {
		if(this.nodos.length == 0) return null
		return Array.from(this.nodos[0].children).map(nodo => new objeto_selector_de_elementos_html([nodo]))
	}
});

const eventos_interfaz = {
	"al_pulsar" : "click",
	"al_cambiar" : "change",
	"al_entrar" : "pointerenter",
	"al_salir" : "pointerleave",
	"al_presionar_tecla" : "keydown",
}

Object.keys(eventos_interfaz).forEach(nombre_evento => {
	objeto_selector_de_elementos_html.prototype[nombre_evento]= function(función){
		this.nodos.forEach(nodo=>{
			nodo.addEventListener(eventos_interfaz[nombre_evento], evento=>{
				const elemento = new objeto_selector_de_elementos_html([evento.currentTarget])
				función(elemento,evento)
			})
		})
	}
})

})()