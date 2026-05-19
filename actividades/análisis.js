al_iniciar(()=>{
selecciona("button.análisis").al_pulsar(muestra_análisis)
	
	
	
let id_canción
const escena_análisis = selecciona("escena-análisis")

escena_análisis.selecciona("button.volver").al_pulsar(()=>{
	juglar.escena = "portada-juego"
})


function muestra_análisis(){
	juglar.escena = "escena-análisis"
	
	escena_análisis.selecciona("ul").texto = ""
	
	const número_canciones = modelo.canciones.length
	const palabras_totales = modelo.canciones.reduce((suma, canción) => suma + canción.lista_palabras.length, 0)
	const formas_de_palabras = modelo.canciones.reduce((conjunto, canción) => conjunto.union(canción.palabras), new Set())
	const [palabras_base, palabras_base_repetidas] = palabras_base_repetidas_en_canciones()
	
	escena_análisis.selecciona("ul").html = `
		<li>Songs: ${número_canciones}</li>
		<li>Words: ${palabras_totales}</li>
		<li>Word forms: ${formas_de_palabras.size}</li>
		<li>Base words: ${palabras_base.size}</li>
		<li>New base words per song: ${Math.round(palabras_base.size/número_canciones)}</li>
		<li>Repeated words: ${palabras_base_repetidas.size} (${Math.round(100*palabras_base_repetidas.size/palabras_base.size)}%)</li>
	`
}

function palabras_base_repetidas_en_canciones(){
	let bases_canciones_anteriores = new Set()
	let bases_repetidas = new Set()
	
	for(const canción of modelo.canciones){
		const bases_en_canción = new Set()
		
		canción.palabras.forEach(forma =>{
			const info_forma = glossa.formas_palabras.get(forma)
			bases_en_canción.add(info_forma.base)
		})
		
		const bases_comunes = bases_canciones_anteriores.intersection(bases_en_canción)
		bases_repetidas = bases_repetidas.union(bases_comunes)
		
		bases_canciones_anteriores = bases_canciones_anteriores.union(bases_en_canción)
	}
	
	return [bases_canciones_anteriores, bases_repetidas]
}

escena_análisis.selecciona("button.evolución_contenidos").al_pulsar(muestra_evolución_de_contenidos)

const escena_evolución = selecciona("escena-evolución-contenidos")
escena_evolución.selecciona("button.volver").al_pulsar(()=>{
	juglar.escena = "escena-análisis"
})

function muestra_evolución_de_contenidos(){
	juglar.escena = "escena-evolución-contenidos"
	
	let filas_canciones = ""
	let palabras = 0
	let bases = new Set()
	
	let bases_canciones_anteriores = new Set()
	let bases_repetidas = new Set()
	
	for(const canción of modelo.canciones){
		
		const bases_en_canción = new Set()
		
		canción.palabras.forEach(forma =>{
			const info_forma = glossa.formas_palabras.get(forma)
			bases_en_canción.add(info_forma.base)
		})
		
		const bases_comunes = bases_canciones_anteriores.intersection(bases_en_canción)
		bases_repetidas = bases_repetidas.union(bases_comunes)
		
		bases_canciones_anteriores = bases_canciones_anteriores.union(bases_en_canción)
		
		palabras += canción.lista_palabras.length
		
		
		filas_canciones+=`<tr><td>${palabras}</td><td>${bases_canciones_anteriores.size}</td><td>${bases_repetidas.size}</td></tr>`
	}
	
	escena_evolución.selecciona("tbody").html = filas_canciones
}




escena_análisis.selecciona("button.palabras_base_comunes").al_pulsar(muestra_palabras_base_comunes)

const escena_palabras_base = selecciona("escena-palabras-base")
escena_palabras_base.selecciona("button.volver").al_pulsar(()=>{
	juglar.escena = "escena-análisis"
})

function muestra_palabras_base_comunes(){
	juglar.escena = "escena-palabras-base"
	
	const formas_base = new Map()
	const frecuencia_formas = new Map()
	
	for(const canción of modelo.canciones){
		
		const bases_de_canción = new Set()
		
		canción.palabras.forEach(forma =>{
			const info_forma = glossa.formas_palabras.get(forma)
			
			if(!bases_de_canción.has(info_forma.base)){
				bases_de_canción.add(info_forma.base)
				
				if(!formas_base.has(info_forma.base))
					formas_base.set(info_forma.base,{palabra:info_forma.base,número_canciones:0, formas:new Set()})
				
				const info_base = formas_base.get(info_forma.base)
				info_base.número_canciones++
				info_base.formas.add(forma)
			}
			
			if(!frecuencia_formas.has(forma))
				frecuencia_formas.set(forma, 0)
			
			frecuencia_formas.set(forma, frecuencia_formas.get(forma)+1)
		})
		
	}
	
	console.log(formas_base)
	
	let filas_palabras_base = ""
	for(const base of [...formas_base.values()].sort((a, b) => b.número_canciones - a.número_canciones)){
		const traducción = glossa.traducciones.get(base.palabra) ?? ""
		filas_palabras_base += `<tr><th>${base.palabra}</th><th>${traducción}</th><th>${base.número_canciones}</th></tr>`
		
		for(const forma of base.formas){
			const traducción = glossa.traducciones.get(forma) ?? ""
			filas_palabras_base += `<tr><td>${forma}</td><td>${traducción}</td><td>${frecuencia_formas.get(forma)}</td></tr>`
		}
	}
	
	escena_palabras_base.selecciona("tbody").html = filas_palabras_base
	
	escena_palabras_base.selecciona("tbody th:first-child, tbody td:first-child").al_pulsar(di_texto)
}



function di_texto(elemento){
	di(elemento.texto)
}

	
})

