const funciones_de_estado = {}

const estado = new Proxy({}, {
	get(objeto, propiedad) {
		if(funciones_de_estado[propiedad]) return funciones_de_estado[propiedad](estado)
		return objeto[propiedad] ?? 0
	},
	set(objeto, propiedad, valor) {
		objeto[propiedad] = valor;
		return true
	}
});


const juglar = {
	escenas : {},
	
	al_mostrar_escena(nombre_escena,evento){
		if(!this.escenas[nombre_escena])
			this.escenas[nombre_escena] = selecciona('escenas-juego > ' + nombre_escena)
		this.escenas[nombre_escena].al_mostrar = evento
	},
}


Object.defineProperty(juglar, 'escena', {
	get() {
		return this._escena
	},
	set(nombre_escena) {
		this._escena.atributo.escena_actual = null
		
		if(!this.escenas[nombre_escena])
			this.escenas[nombre_escena] = selecciona('escenas-juego > ' + nombre_escena)
		
		this._escena = this.escenas[nombre_escena]
		this._escena.atributo.escena_actual = ""
		if(this._escena.al_mostrar) this._escena.al_mostrar(this._escena)
	}
});

al_iniciar(()=>juglar._escena = selecciona('escenas-juego > [escena-actual]'))


diálogos.inicia_una_vez = function(diálogo, al_terminar){
	if(estado[diálogo+".leído"]) {
		if(al_terminar) al_terminar()
		return
	}
	estado[diálogo+".leído"] = true
	this.inicia(diálogo, al_terminar)
}

diálogos.añade_acción("primera_vez",(diálogo, línea)=>{
	if(estado[diálogo+".leído"]) return diálogos.muestra_siguiente_línea()
	estado[diálogo+".leído"] = true
	diálogos.inicia(diálogo)
})


diálogos.añade_acción("escena",(escena, línea)=>{
	juglar.escena = escena
	diálogos.muestra_siguiente_línea()
})

diálogos.añade_acción("activa",(variable, línea)=>{
	estado[variable] = true
	selecciona(`[data-activable="${variable}"]`).clase.visible = true
	diálogos.muestra_siguiente_línea()
})



/*

Funciones extra que deberían estar en otro archivo

*/

Array.prototype.desordena = function() {
    const nuevoArray = [...this]; // Crear una copia del array original
    for (let i = nuevoArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nuevoArray[i], nuevoArray[j]] = [nuevoArray[j], nuevoArray[i]];
    }
    return nuevoArray;
}

Array.prototype.escoge_al_azar = function() {
    return this[Math.floor(Math.random() * this.length)];
}

function espera(segundos) {
	return new Promise(resolve => setTimeout(resolve, segundos * 1000));
}