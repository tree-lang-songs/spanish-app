const modelo = {
	canciones:[],
	
	añade_canción(canción){
		canción.frases = canción.letra.map(frase => frase.normalize('NFC')).filter(cadena => cadena.trim() !== "")
		
		canción.frases.forEach(frase => glossa.añade_frase(frase))
		
		canción.palabras = new Set()
		for(const frase of canción.frases){
			canción.palabras = canción.palabras.union(glossa.obtén_palabras(frase))
		}
		
		canción.lista_palabras = []
		for(const frase of canción.frases){
			canción.lista_palabras.push(...glossa.obtén_lista_palabras(frase))
		}
		
		this.canciones.push(canción)
	},
}