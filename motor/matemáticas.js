const geometría = {
	crea_punto(x, y){
		if(isNaN(Number(x))) throw new Error(`El parámetro x (${x}) no es un número correcto`)
		if(isNaN(Number(y))) throw new Error(`El parámetro y (${y}) no es un número correcto`)
		
		return {
			'x': Number(x),
			'y': Number(y),
			por(valor){
				return geometría.crea_punto(this.x*valor, this.y*valor)
			},
			más(vector){
				return geometría.crea_punto(this.x+vector.x, this.y+vector.y)
			},
			menos(vector){
				return geometría.crea_punto(this.x-vector.x, this.y-vector.y)
			},
			a_longitud(longitud){
				console.log(longitud/(this.distancia(geometría.crea_punto(0,0))))
				return this.por(longitud/(this.distancia(geometría.crea_punto(0,0))))
			},
			distancia(punto){
				return Math.sqrt(Math.pow(this.x-punto.x,2) + Math.pow(this.y-punto.y,2))
			},
			coloca_entre(a,b){
				const min_x = Math.min(a.x, b.x);
				const max_x = Math.max(a.x, b.x);
				this.x = Math.min(Math.max(this.x, min_x), max_x);

				const min_y = Math.min(a.y, b.y);
				const max_y = Math.max(a.y, b.y);
				this.y = Math.min(Math.max(this.y, min_y), max_y);
			}
		}
	},
	
	crea_flecha_con_ángulo(ángulo){
		const radianes = ángulo * (Math.PI / 180)
		return this.crea_punto(Math.cos(radianes), Math.sin(radianes))
	},
	
	crea_vector(x = 0, y = 0){
		return this.crea_punto(x, y)
	},
	
	seno(ángulo){
		const radianes = ángulo * (Math.PI / 180)
		return Math.sin(radianes)
	},
	
	coseno(ángulo){
		const radianes = ángulo * (Math.PI / 180)
		return Math.cos(radianes)
	},
}


function al_azar_entre(a,b){
	return a + (b-a) * Math.random()
}

function entero_al_azar_entre(a,b){
	return Math.round(a + (b-a) * Math.random())
}