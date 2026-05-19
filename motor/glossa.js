const glossa = {
	frases:[],
	
	formas_palabras:new Map(),
	
	// Añadir frases (genera vocabulario)
	añade_frase(frase){
		
		const frase_normalizada = frase.normalize('NFC')
		const palabras = frase_normalizada.toLowerCase().replace(/\p{P}/gu, " ").replace(/\s+/g, " ").trim() .split(" ").filter(Boolean)
		this.frases.push(frase_normalizada)
		
		for (const palabra of palabras)
			this.añade_palabra(palabra)
	},
	
	añade_palabra(palabra){
		if(!this.formas_palabras.has(palabra)){
			this.formas_palabras.set(palabra,{forma:palabra,frecuencia:0})
		}
		const forma = this.formas_palabras.get(palabra)
		forma.frecuencia++
		
		const info_palabra = this.progreso.obtén_palabra(palabra)
		info_palabra.frecuencia++
	},
	
	añade_formas_palabras(formas){
		formas.normalize('NFC').trim().split('\n').forEach(línea_forma => {
			this.añade_forma_palabra(línea_forma.trim().split('\t'))
		})
	},
	
	añade_forma_palabra(forma, base){
		if(!forma) return
		
		this.progreso.obtén_palabra(base)
		
		if(base && !this.formas_palabras.has(base)){
			this.formas_palabras.set(base,{"forma":base,frecuencia:0})
		}
		
		if(!this.formas_palabras.has(forma)){
			this.formas_palabras.set(forma,{"forma":forma,frecuencia:0})
		}
		const info_forma = this.formas_palabras.get(forma)
		info_forma.base = base
	},
	
	obtén_forma_base(forma){
		return this.formas_palabras.get(forma).base
	},
	
	bases_pendientes(){
		return [...this.formas_palabras.values()].filter(forma => !forma.base).map(forma => forma.forma)
	},
	
	traducciones:new Map(),
	añade_traducciones(lista){
		lista.normalize('NFC').trim().split('\n').forEach(info_palabra => {
			this.añade_traducción(...info_palabra.trim().split('\t'))
		})
		
		
		/*lista.para_cada_fila([palabra, traducción] => {
			this.traducciones.set(palabra, traducción)
		})*/
	},
	
	añade_traducción(palabra, traducción){
		if(!palabra) return
		this.traducciones.set(palabra.normalize('NFC'), traducción)
	},
	
	traducciones_pendientes(){
		let traducciones_pendientes = []
		const palabras = [...this.formas_palabras.values()]
		palabras.forEach(palabra => {
			const traducción = this.traducciones.get(palabra.forma)
			
			if(!traducción)
				traducciones_pendientes.push(palabra.forma)
		})
		
		this.frases.forEach(frase => {
			const traducción = this.traducciones.get(frase)
			if(!traducción)
				traducciones_pendientes.push(frase)
		})
		return traducciones_pendientes
	},
	
	// Mostrar frase con traducciones
	glosa_frase(frase){
		const tokens = frase.toLowerCase().split(/([^\p{L}\p{M}]+)/gu);
		
		const filtro_letras = /[\p{L}\p{M}]/u;

		//let frase_complicada = false

		const glosa = `<frase-glosada frase="${frase}">` + tokens.map(token => { 
			// Si el token está vacío (a veces pasa al split), lo ignoramos
			if (!token) return "";

			// Si el token NO contiene letras (son espacios, puntos, etc.), lo devolvemos tal cual
			if (!filtro_letras.test(token)) return token;
			const palabra = token
			//palabra.vista
			const info_palabra = this.progreso.obtén_palabra(palabra)
			//if(info_palabra.vista < 3) frase_complicada = true
			
			// Si llegamos aquí, es una palabra real
			this.progreso.registra_vista(palabra);
			const traduccion = this.traducciones.get(palabra) || ""; // Evitamos undefined si no hay traducción
			
			return `<palabra-frase palabra="${palabra}">${palabra}<glosa-palabra>${traduccion}<transliteración-palabra>${this.transliteración(palabra)}</transliteración-palabra></glosa-palabra></palabra-frase>`; 
		}).join("") + "</frase-glosada>";
		
		//if(frase_complicada) return "<traducción-frase>"+this.traducciones.get(frase)+"</traducción-frase>"
		
		this.progreso.guarda();
		return glosa;
	},
	
	obtén_palabras(frase){
		const tokens = frase.toLowerCase().split(/([^\p{L}\p{M}]+)/gu);
		
		const filtro_letras = /[\p{L}\p{M}]/u;

		return new Set(tokens.filter(token => filtro_letras.test(token)))
	},
	
	obtén_lista_palabras(frase){
		const tokens = frase.toLowerCase().split(/([^\p{L}\p{M}]+)/gu);
		
		const filtro_letras = /[\p{L}\p{M}]/u;

		return tokens.filter(token => filtro_letras.test(token))
	},
	
	transliteración(){
		
	},
}

glossa.progreso = {
	nombre_almacenamiento:"progreso_glosa",
	
	progreso_usuario: new Map(), // Aquí guardaremos { nivel: 0, vistas: 0, aciertos_seguidos: 0 }
	
	// Cargar del localStorage al iniciar
	carga() {
		const guardado = localStorage.getItem(this.nombre_almacenamiento)
		if(!guardado) return
		
		try {
			const datos = JSON.parse(guardado);
			this.progreso_usuario = new Map(Object.entries(datos));
			for (const datos of this.progreso_usuario.values()){
				datos.frecuencia = 0
				if(typeof datos.practicada === "undefined") datos.practicada = 0
			}
		} catch (e) {
			console.error("Error al cargar el progreso de Glossa:", e);
			this.progreso_usuario = new Map();
		}
	},
	
	// Guardar en el localStorage
	guarda() {
		// Convertimos el Map a un objeto para poder guardarlo como JSON
		const datos = Object.fromEntries(this.progreso_usuario)
		localStorage.setItem(this.nombre_almacenamiento, JSON.stringify(datos));
	},

	registra_vista(palabra) {
		let datos = this.obtén_palabra(palabra)
		if(!datos.vista) datos.vista = 0
		datos.vista++
	},
	
	obtén_palabra(palabra){
		let info_palabra = this.progreso_usuario.get(palabra)
    
		if (!info_palabra) {
			info_palabra = { "palabra": palabra, frecuencia: 0, vista: 0, aciertos_seguidos: 0 , practicada: 0}
			this.progreso_usuario.set(palabra, info_palabra)
		}
		return info_palabra
	}
}
glossa.progreso.carga()

glossa.ejercicio = {
	pregunta_actual:"",
	alternativa:"",
	
	palabras_practicadas:[],
	//palabras_no_practicadas:[],
	
	inicia(){
	},
	
	obtén_pregunta(){
		this.pregunta_actual = [...glossa.progreso.progreso_usuario.values()]
			.filter(palabra => palabra.palabra!=this.pregunta_actual && palabra.frecuencia > 0  && palabra.vista > 0 )
			.sort((a,b) => a.aciertos_seguidos - b.aciertos_seguidos)[0].palabra
			
		return this.pregunta_actual
	},
	
	obtén_alternativa(){
		alternativa = [...glossa.progreso.progreso_usuario.values()]
			.filter(palabra => palabra.palabra !== this.pregunta_actual && palabra.vista > 0 && palabra.frecuencia > 0 )
			.sort((a,b) => a.aciertos_seguidos - b.aciertos_seguidos)
			.slice(0, 3).escoge_al_azar().palabra
		return alternativa
	},
	
	es_correcta(respuesta){
		let info_palabra = glossa.progreso.progreso_usuario.get(this.pregunta_actual)
		
		if(glossa.traducciones.get(this.pregunta_actual) != respuesta){
			info_palabra.aciertos_seguidos = 0
			glossa.progreso.progreso_usuario.get(alternativa).aciertos_seguidos = 0
			glossa.progreso.guarda()
			return false
		}
		
		info_palabra.aciertos_seguidos++
		
		glossa.progreso.guarda()
		
		return true
	},
}



glossa.voces ={
	cache_de_voz:{},
	reproductor : new Audio(),
	
	recurso_texto: new Map(),
	añade(texto, recurso){
		this.recurso_texto.set(texto, recurso)
	},
	
	async di(texto){
		console.log("di:"+ texto)
		this.reproductor.pause();
		this.reproductor.currentTime = 0;
			
		let audio = this.carga_voz(texto)
		
		//audio_anterior = audio
		return new Promise(resolve => {
			this.reproductor.src = audio.src
			this.reproductor.play();
			this.reproductor.addEventListener('ended', resolve, { once: true });
		});
	},
	
	carga_voz(texto){
		if (this.cache_de_voz[texto]) return this.cache_de_voz[texto]
		
		const texto_adaptado = this.adapta_url(texto)
		const recurso = this.recurso_texto.get(texto)
		return new Audio(`${recurso.url}${texto_adaptado[0]}/v_${texto_adaptado}.${recurso.extensión}`);
	},
	
	adapta_url(texto) {
		return texto
			.replace(/[*,;:|\\\/?"<>!¿¡.@#$%^&()]/g, ' ')
			.trim()
			.replace(/\s+/g, '_')
			.toLowerCase();
	},
	
	precarga(textos) {
		Object.keys(this.cache_de_voz).forEach(clave => {
			const audio = this.cache_de_voz[clave]
			if(!audio) return
			audio.pause()
			audio.src = ""
			audio.load()
			audio.onended = null
		});
		this.cache_de_voz = {}
		
		textos.forEach(texto => this.cache_de_voz[texto] = this.carga_voz(texto))
	},
}

async function di(texto) {
	glossa.voces.di(texto)
}


// http://localhost/contenidos/vocabulario/voces/
// http://localhost/contenidos/vocabulario/voces/














// Árabe

glossa.transliteración = function (texto) {
    const mapa = {
    // Consonantes
    'أ': "'a", 'إ': "'i", 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 
    'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 
    'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 
    'ع': "'", 'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 
    'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y', 'ا': 'a', 
    'ة': 'h', 'ء': "'",
    // Vocales cortas
    '\u064E': 'a', '\u064F': 'u', '\u0650': 'i', '\u0652': ''
};

    return texto.split('').map(char => {
        // Si el carácter está en el mapa, lo traduce; si no, deja el original
        return mapa[char] !== undefined ? mapa[char] : '';
    }).join('');
}