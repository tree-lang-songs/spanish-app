al_iniciar(()=>{






escena_canción.selecciona("button.practicar").al_pulsar(()=>{
	const canción = modelo.canciones[id_canción]
	player.stopVideo();
	juglar.escena = "escena-ejercicio"
	
	ejercicio.carga_palabras(canción.lista_palabras)
	muestra_pregunta()
})

escena_canción.selecciona("button.practicar_palabras").al_pulsar(()=>{
	const canción = modelo.canciones[id_canción]
	
	player.stopVideo();
	
	juglar.escena = "escena-ejercicio"
	
	const palabras_base = new Set()
	
	for(const palabra of canción.lista_palabras)
		palabras_base.add(glossa.obtén_forma_base(palabra))
	
	ejercicio.carga_palabras([...palabras_base])
	muestra_pregunta()
})

const botones_ejercicios = selecciona("escena-ejercicio botones-respuestas button")
let al_reves = 0
function muestra_pregunta(){
	
	const pregunta = ejercicio.obtén_pregunta()
	if(!pregunta) return juglar.escena = "escena-canción"
	
	selecciona("escena-ejercicio pregunta-ejercicio").texto = pregunta
	di(pregunta)
	
	const alternativa = ejercicio.obtén_alternativa()
	let opciones = [glossa.traducciones.get(pregunta), glossa.traducciones.get(alternativa)]
	
	if(al_azar_entre(0,5)<1) opciones = opciones.reverse()
	
	botones_ejercicios.elemento(0).texto = opciones[0]
	botones_ejercicios.elemento(1).texto = opciones[1]
	
	botones_ejercicios.clase.error = false
	botones_ejercicios.clase.pulsado = false
}

botones_ejercicios.al_pulsar((botón)=>{
	if(botón.clase.pulsado) return
	botón.clase.pulsado = true
	
	if(!ejercicio.es_correcta(botón.texto))
		return botón.clase.error = true
	
	espera(0.5).then(muestra_pregunta)
})
	
selecciona("escena-ejercicio pregunta-ejercicio").al_pulsar(di_texto)

selecciona("escena-ejercicio button.volver").al_pulsar(()=>{
	juglar.escena = "escena-canción"
})





ejercicio = {
	pregunta_actual:"",
	alternativa:"",
	
	palabras : [],
	posición_palabra: 0,
	
	palabras_falladas:[],
	
	//palabras_no_practicadas:[],
	
	carga_palabras(palabras){
		this.posición_palabra = 0
		this.palabras = []
		for(const palabra of palabras)
			if(!this.palabras.includes(palabra)) this.palabras.push(glossa.progreso.progreso_usuario.get(palabra))
	},
	
	obtén_pregunta(){
		if(this.palabras_falladas.length > 0){
			const más_intentos_restantes = this.palabras_falladas.filter(palabra => palabra.palabra != this.pregunta_actual).reduce((anterior, actual) => {
				return (anterior.intentos_restantes >= actual.intentos_restantes) ? anterior : actual
			});
			this.pregunta_actual = más_intentos_restantes.palabra
			return this.pregunta_actual
		}
		/*this.pregunta_actual = [...this.palabras.values()]
			.filter(palabra => palabra.palabra!=this.pregunta_actual && palabra.frecuencia > 0  && palabra.vista > 0 )
			.sort((a,b) => a.aciertos_seguidos - b.aciertos_seguidos)[0].palabra*/
		
		if(this.posición_palabra < this.palabras.length){
			this.pregunta_actual = this.palabras[this.posición_palabra].palabra
			return this.pregunta_actual
		}
		
		return false
	},
	
	obtén_alternativa(){
		alternativa = [...this.palabras.values()]
			.filter(palabra => palabra.palabra !== this.pregunta_actual && palabra.frecuencia > 0 )
			.sort((a,b) => a.practicada - b.practicada)
			.slice(0, 3).escoge_al_azar().palabra
		return alternativa
	},
	
	fallado:false,
	
	es_correcta(respuesta){
		let info_palabra = glossa.progreso.progreso_usuario.get(this.pregunta_actual)
		
		if(glossa.traducciones.get(this.pregunta_actual) != respuesta){
			this.añade_palabra_fallada(this.pregunta_actual)
			this.añade_palabra_fallada(alternativa)
			
			this.fallado = true
			
			return false
		}
		
		if(this.fallado){
			this.fallado = false
			return true
		}
		
		if(this.palabras_falladas.length > 0){
			let info_palabra = this.palabras_falladas.find(info_palabra => info_palabra.palabra == this.pregunta_actual)
			info_palabra.intentos_restantes--
			if(info_palabra.intentos_restantes <= 0){
				const index = this.palabras_falladas.indexOf(info_palabra)
				this.palabras_falladas.splice(index, 1)
			}
			
			if(this.palabras_falladas.length > 0) return true
		}
		
		//info_palabra.aciertos_seguidos++
		info_palabra = this.palabras[this.posición_palabra]
		info_palabra.practicada++
		
		glossa.progreso.guarda()
		
		this.posición_palabra++
		
		return true
	},
	
	añade_palabra_fallada(palabra){
		let info_palabra = this.palabras_falladas.find(info_palabra => info_palabra.palabra == palabra)
		
		if(!info_palabra){
			info_palabra = {"palabra":palabra}
			this.palabras_falladas.push(info_palabra)
		}
			
		info_palabra.intentos_restantes = 3
	},
}
	
	
})
