const diálogos = {
	lista_diálogos:{},
	diálogo_actual:0,
	línea:0,
	
	avanza_rápido:false,
	
	elemento_diálogo:selecciona("diálogo-personajes"),
	
	añade(nombre, ...contenido){
		this.lista_diálogos[nombre] = contenido
	},
	
	inicia(nombre, al_terminar){
		this.al_terminar = al_terminar
		setTimeout(()=>{
			if(!diálogos.lista_diálogos[nombre]) throw new Error(`No existe el diálogo "${nombre}"`)
				
			this.avanza_rápido=false

			selecciona("body").clase.mostrar_diálogo = true
			
			this.diálogo_actual = diálogos.lista_diálogos[nombre]
			this.línea = -1
			this.muestra_siguiente_línea()
		},1)
	},
	

	acciones : {},
	añade_acción(etiqueta, acción){
		this.acciones[etiqueta] = acción
	},
	
	async muestra_siguiente_línea(){
		this.línea++
		const líneas_acabadas = this.diálogo_actual.length <= this.línea
		if(líneas_acabadas) return this.termina_diálogo()
		
		const línea = this.diálogo_actual[this.línea]
		
		if(typeof línea === "function")
			this.realiza_función(línea)
		else if(typeof línea === "string") 
			this.muestra_texto(línea)
		//else if(Array.isArray(línea)) 
		//	this.muestra_opciones(línea)
		else{
			etiqueta = Object.keys(línea)[0]
		
			if(this.acciones[etiqueta])
				return this.acciones[etiqueta].call(this, línea[etiqueta], línea)
			
			return this.muestra_siguiente_línea()
		}
	},
	
	termina_diálogo(){
		if(this.al_terminar) this.al_terminar()
		selecciona("body").clase.mostrar_diálogo = false
	},

	realiza_función(función){
		función()
		this.muestra_siguiente_línea()
	},

	muestra_texto(texto){
		this.elemento_diálogo.selecciona('globo-frase').clase.visible = true
		this.elemento_diálogo.selecciona('texto-frase').texto = texto
		if(this.avanza_rápido) setTimeout(()=>this.muestra_siguiente_línea(),50)
	},

	/*muestra_opciones(opciones){
		let campoOpciones = this.elemento_diálogo.selecciona('opciones-diálogo')
		
		this.elemento_diálogo.clase.modoOpciones = true
		
		campoOpciones.html = ""
		for(const opción of opciones)
			if(!opción.si || opción.si())
				campoOpciones.html += `<button data-sigue="${opción.sigue?opción.sigue:''}">${opción.opción}</button>`
		
		this.elemento_diálogo.selecciona('opciones-diálogo > button').al_pulsar(botón=>{
			this.elemento_diálogo.clase.modoOpciones = false
			const sigue = botón.atributo.data_sigue
			if(sigue) this.inicia(sigue)
			else this.muestra_siguiente_línea()
		})
	},*/
}

al_iniciar(() => {
	diálogos.elemento_diálogo = selecciona("diálogo-personajes")
	
	selecciona('body [data-diálogo]').al_pulsar(botón=>diálogos.inicia(botón.atributo.data_diálogo))
	
	selecciona('diálogo-personajes botón-saltar').al_pulsar(()=>{
		diálogos.avanza_rápido=true
		diálogos.MuestraSiguienteLínea()
	})

	diálogos.botón_continuar = selecciona('diálogo-personajes globo-frase button')
	selecciona('diálogo-personajes globo-frase button').al_pulsar(()=>diálogos.pulsa_continuar())
})

diálogos.pulsa_continuar = function(){
	if(this.botón_continuar.clase.desactivar) return
	this.elemento_diálogo.selecciona('globo-frase').clase.visible = false
	this.botón_continuar.clase.desactivar = true
	setTimeout(()=>this.botón_continuar.clase.desactivar = false,200)
	this.muestra_siguiente_línea()
}

diálogos.añade_acción("personaje",function(nombre, {visible = true, posición = undefined}){
	this.personaje = nombre
	
	selecciona('nombre-personaje').texto = nombre
	selecciona("diálogo-personajes").atributo.data_personaje = nombre

	
	selecciona(`body > diálogo-personajes personaje-diálogo[nombre="${nombre}"]`).clase.visible = visible
	selecciona(`body > diálogo-personajes personaje-diálogo.hablando`).clase.hablando = false
	selecciona(`body > diálogo-personajes personaje-diálogo[nombre="${nombre}"]`).clase.hablando = true
	if(posición) selecciona(`body > diálogo-personajes personaje-diálogo[nombre="${nombre}"]`).atributo.posición = posición
	
	this.muestra_siguiente_línea()
})


diálogos.añade_acción("si", function(condición, línea){
	if(!estado[condición]) return this.muestra_siguiente_línea()
	
	etiqueta = Object.keys(línea)[1]

	if(this.acciones[etiqueta])
		return this.acciones[etiqueta].call(this, línea[etiqueta], línea)
	
	return this.muestra_siguiente_línea()
})

diálogos.muestra_opción = function(opción, posición){
	this.elemento_diálogo.selecciona('opciones-diálogo').html += `<button data-línea="${posición}">${opción}</button>`
}

diálogos.añade_acción("opción",function(texto){
	const obtener_campo = (línea,campo) => typeof línea !== 'object'?false:línea[campo]
	
	if(this.recorriendo_opción){
		this.recorriendo_opción = false
		
		this.línea = this.diálogo_actual.findIndex((línea, i) =>
			i >= this.línea && typeof línea === 'object' && línea.fin_opciones
		)
		if(this.línea == -1) return this.termina_diálogo()
		return this.muestra_siguiente_línea()
	}
	
	this.recorriendo_opción = true
	
	const campoOpciones = this.elemento_diálogo.selecciona('opciones-diálogo')
	
	this.elemento_diálogo.clase.modoOpciones = true
	
	campoOpciones.html = ""
	let posición = this.línea - 1
	for(const línea of this.diálogo_actual.slice(this.línea)){
		posición++
		if(obtener_campo(línea,"fin_opciones")) break
		const opción = obtener_campo(línea,"opción")
		if(!opción) continue
		
		const condición = obtener_campo(línea,"si")
		if(condición && !estado[condición]) continue
		
		this.muestra_opción(opción, posición)
	}
	
	
	//for(const opción of opciones)
	//	if(!opción.si || opción.si())
	//		campoOpciones.html += `<button data-sigue="${opción.sigue?opción.sigue:''}">${opción.opción}</button>`
	
	this.elemento_diálogo.selecciona('opciones-diálogo > button').al_pulsar(botón=>{
		this.elemento_diálogo.clase.modoOpciones = false
		this.línea = botón.atributo.data_línea
		this.muestra_siguiente_línea()
	})
})

diálogos.añade_acción("fin_opciones", function(diálogo){
	this.recorriendo_opción = false
	this.muestra_siguiente_línea()
})

diálogos.añade_acción("sigue", function(diálogo){
	this.recorriendo_opción = false
	this.inicia(diálogo)
})

diálogos.añade_acción("espera", function(segundos){
	setTimeout(()=>this.muestra_siguiente_línea(), 1000*segundos)
})

diálogos._actividades = {}
diálogos.añade_actividad = function (nombre, actividad){
	this._actividades[nombre] = actividad
}

diálogos.añade_acción("inicia", function(actividad, detalles){
	if(!(actividad in this._actividades)) throw new Error(`No existe la actividad "${actividad}"`)
	this._actividades[actividad](detalles)
	this.muestra_siguiente_línea()
})


diálogos.añade_acción("estado", function(variable, {pon, suma, resta}){
	if(pon !== undefined) estado[variable] = pon
	if(suma !== undefined) estado[variable] += suma
	if(resta !== undefined) estado[variable] -= resta
	this.muestra_siguiente_línea()
})


diálogos.añade_acción("sonido", function(sonido, {volumen= 1}){
	if(datos.sonidos[sonido]){
		datos.sonidos[sonido].volumen = volumen
		datos.sonidos[sonido].play()
		return this.muestra_siguiente_línea()
	}
	
	const audio = new Audio(sonido)
	audio.volume = volumen
	audio.play()
	this.muestra_siguiente_línea()
})


diálogos.añade_acción("ambiente", function(sonido, {volumen= 1}){
	if(diálogos.ambiente_actual){
		diálogos.ambiente_actual.pause()
		diálogos.ambiente_actual.currentTime = 0
	}
	
	if(!datos.sonidos[sonido]) return this.muestra_siguiente_línea()
	
	diálogos.ambiente_actual = datos.sonidos[sonido]
	datos.sonidos[sonido].volume = volumen
	datos.sonidos[sonido].loop = true
	datos.sonidos[sonido].play()
	return this.muestra_siguiente_línea()
})



diálogos.añade_acción("música", function(sonido, {volumen= 1}){
	if(diálogos.música_actual){
		diálogos.música_actual.pause()
		diálogos.música_actual.currentTime = 0
	}
	
	if(!datos.sonidos[sonido]) return this.muestra_siguiente_línea()
	
	diálogos.música_actual = datos.sonidos[sonido]
	datos.sonidos[sonido].volume = volumen
	datos.sonidos[sonido].loop = true
	datos.sonidos[sonido].play()
	return this.muestra_siguiente_línea()
})