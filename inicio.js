
const recursos =[
	"https://tree-lang-songs.github.io/contenidos-espanol/canciones%20deva/canciones.tsv",
	"https://tree-lang-songs.github.io/contenidos-espanol/canciones%20deva/traducciones.tsv",
	"https://tree-lang-songs.github.io/contenidos-espanol/vocabulario/vocabulario.tsv",
	"https://tree-lang-songs.github.io/contenidos-espanol/vocabulario/traducciones.tsv",
]


	inicia()
	
	  // 1. Carga el código de la API de manera asíncrona
	  const tag = document.createElement('script');
	  tag.src = "https://www.youtube.com/iframe_api";
	  tag.async = true;
	  const firstScriptTag = document.getElementsByTagName('script')[0];
	  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

	  // 2. Esta función se ejecuta automáticamente cuando la API está lista
	  var player;
	  function onYouTubeIframeAPIReady() {
		player = new YT.Player('mi-reproductor', {
		  height: '100%',
		  width: '100%',
		  //videoId: '', // ID del video de YouTube
		  /*events: {'onReady': onPlayerReady,'onStateChange': onPlayerStateChange},*/
		  playerVars: {
				'origin': window.location.origin,
				'enablejsapi': 1,
				'controls': 1,       // 1 = Muestra los controles (play, volumen, etc.)
				'autoplay': 0,
				'rel': 0, 
				'modestbranding': 1,
				'fs': 0
			},
		});
	  }





async function inicia(){
	for(const recurso of recursos)
		await carga_recurso(`${recurso}?v=${Date.now()}`)

	const lista_canciones = selecciona("lista-canciones")
	let palabras_totales = new Set()
	for(const [id_canción,canción] of Object.entries(modelo.canciones)){
		lista_canciones.html += `<button id-canción="${id_canción}">${canción.título}<número-de-palabras>${canción.palabras.size} words</número-de-palabras>
			<barra-de-progreso style="${colores_progreso_canción(canción)}" ></barra-de-progreso></button>`
		palabras_totales = palabras_totales.union(canción.palabras)
	}


	lista_canciones.selecciona("button").al_pulsar(pulsa_botón_canción)


// canción.nombre.toLowerCase().replace(/ /g, '-');

}

al_iniciar(()=>{
	const params = new URLSearchParams(window.location.search);

	// 2. Extraemos el valor de "v"
	const url_canción = params.get('canción'); 

	if (url_canción) {
		
		
		for(const [id,canción] of Object.entries(modelo.canciones)){
			if(url_canción == canción.título.toLowerCase().replace(/ /g, '-')){
				id_canción = id
				muestra_canción()
			}
		}
		
	}
})


window.addEventListener('popstate', (event) => {
    // Al cambiar la URL, volvemos a leer el parámetro 'v'
    const params = new URLSearchParams(window.location.search);
    const url_canción = params.get('canción');

    if (url_canción) {
		for(const [id,canción] of Object.entries(modelo.canciones)){
			if(url_canción == canción.título.toLowerCase().replace(/ /g, '-')){
				id_canción = id
				muestra_canción()
			}
		}
    } else  juglar.escena = "portada-juego"
});

let id_canción
function pulsa_botón_canción(botón){
	id_canción = botón.atributo.id_canción
	
	const canción = modelo.canciones[id_canción]
	
	const url = new URL(window.location);
    
    const tituloSlug = canción.título.toLowerCase().replace(/ /g, '-');
    url.searchParams.set('canción', tituloSlug); 

    window.history.pushState({}, '', url);
	
	muestra_canción()
}


const escena_canción = selecciona("escena-canción")
console.log(escena_canción)
function muestra_canción(){
	const canción = modelo.canciones[id_canción]
	
	player.cueVideoById(canción.youtube) 
	
	juglar.escena = "escena-canción"
	
	escena_canción.selecciona("h2").texto = canción.título
	
	//escena_canción.selecciona("source").atributo.src = `canciones/${canción.nombre}.mp3`
	//document.getElementById('player').load()
	
	const letra = escena_canción.selecciona("letra-canción")
	letra.texto = ""
	for(const frase of canción.frases)
		letra.html += glossa.glosa_frase(frase)+`<traducción-frase>${glossa.traducciones.get(frase)}<traducción-frase/>`
	
	letra.selecciona("palabra-frase").al_pulsar(palabra =>{
		setTimeout(()=>di(palabra.padre.atributo.frase),1000)
		di(palabra.atributo.palabra)
	})
	
	const tabla = escena_canción.selecciona("table tbody")
	
	tabla.html = [...canción.palabras].map(palabra => `<tr><td>${palabra}</td><td>${glossa.traducciones.get(palabra)}</td></tr>` ).join("")
	
	
	tabla.selecciona("td:first-child").al_pulsar(di_texto)
	
	const palabras_base = new Set()
	
	for(const palabra of canción.lista_palabras)
		palabras_base.add(glossa.obtén_forma_base(palabra))
	
	glossa.voces.precarga([...canción.palabras,...canción.frases,...palabras_base])
}

escena_canción.selecciona("button.volver").al_pulsar(()=>{
	juglar.escena = "portada-juego"
	
	player.stopVideo()
	const url = new URL(window.location);
    
    url.searchParams.delete('canción'); 

    // 3. Actualizamos la barra de direcciones
    window.history.pushState({}, '', url);
})


function di_texto(elemento){
	di(elemento.texto)
}

	
function colores_progreso_canción(canción){
	const niveles = [	
		{título:"extremadamente-practicadas", aciertos: 80, palabras:0},
		{título:"muy-practicadas", aciertos: 40, palabras:0},
		{título:"bastante-practicadas", aciertos: 20, palabras:0},
		{título:"algo-practicadas", aciertos: 10, palabras:0},
		{título:"poco-practicadas", aciertos: 5, palabras:0},
		{título:"vistas", aciertos: 1, palabras:0}
	]
	
	for(const palabra of canción.palabras){
		const info_palabra = glossa.progreso.obtén_palabra(palabra)
		if(!info_palabra.practicada) {
			continue
		}
		
		const nivel = niveles.find(nivel => nivel.aciertos <= info_palabra.practicada)
		nivel.palabras++
	}
	
	let suma_palabras = 0
	
	const estilo = niveles.map(nivel => {
		suma_palabras += nivel.palabras
		return `--palabras-${nivel.título}:${Math.floor(suma_palabras*100/canción.palabras.size)}%;`
	}).join("")
	return estilo
	
}







async function carga_recurso(url){
	let texto
	try {
		console.log(url)
		const respuesta = await fetch(url)
		texto = await respuesta.text()
	} catch (error) {
        console.error("Error al leer el archivo: "+url, error);
    }
	
	texto = texto.normalize('NFC')
	await lee_recurso(url, texto)
}


async function lee_recurso(url, texto) {
	const recurso = {extensión:"opus"};
	let elemento = recurso
	
	texto.split('\n').forEach(linea => {
		
		const columnas = linea.trim().split('\t');
		//if (columnas.length < 2) return;
		
		if (columnas.length > 0 && columnas[0]=='#') {
			elemento[columnas[1]] = columnas[2]
			
			return
		}
		
		if(recurso.tipo == "canciones"){
			if(columnas[0].startsWith("---")){
				if(recurso.tipo == "canciones"){
					
					if(elemento.letra){
						modelo.añade_canción(elemento)
					}
					elemento = {letra:[]}
				}
				return
			}
			
			elemento.letra.push(columnas[0])
			glossa.voces.añade(columnas[0],recurso)
			return
		}
		
		if(recurso.tipo == "traducción") glossa.añade_traducción(...columnas)
		else if(recurso.tipo == "vocabulario"){
			glossa.añade_forma_palabra(...columnas)
			glossa.voces.añade(columnas[0],recurso)
		}
			
	});

	if(elemento.letra) modelo.añade_canción(elemento)
		
	if(recurso.url){
		const base_url = url.substring(0, url.lastIndexOf("/") + 1);
		recurso.url = base_url + recurso.url
		console.log(recurso.url)
	}
}