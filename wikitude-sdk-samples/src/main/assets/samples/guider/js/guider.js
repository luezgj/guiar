/* Implementation of AR-Experience (aka "World"). */
var World = {
	//Distance considered far away to a point
	FAR_AWAY_DISTANCE: 0.07,	//70mts
	FARAWAYDISTANCE: 0.001,		//1mt

	/* List of corners that form the path */
	cornerPath: [],

	/* index of the corner that is the inmediate objective */
	currentObjetive: null,

	/* destination of the path */
	objective: new GeoPoint(-37.318337,-59.121612,null),


    // -59.121612,-37.318337  Casa de Joaco
    // -59.125902,-37.320751  Mi casa

    /* True once path was fetched. */
    loadedPath: false,
    loadingPath: false,

    /* True when the objective is the last. */
    lastObjective: false,

    /* List of the points that form the path to the next objective */
    /* List of AR.GeoObjects that are currently shown in the scene / World. */
    pointsPath: [],
    pointsPathDraws: [],




        /* Location updates, fired every time you call architectView.setLocation() in native environment. */
    locationChanged: function locationChangedFn(lat, lon, alt, acc) {
        AR.logger.debug("Location changed con altitud");
    	var currentLocation=new GeoPoint(lat,lon,alt);


        /*
    	if (es la primera vez || estás muy lejos del objetivo)
			cargar el camino
			objetivo=primer punto
			calcular camino hasta objetivo
			dibujarCaminoHastaObjetivo
		if (llegaste al punto)
			if (!es el último)
				objetivo=siguiente punto
				calcular camino hasta objetivo
				dibujarCaminoHastaObjetivo
        */


        var recalc=false;  //True si hay que volver a calcular el camino
        /*  SI ANDA MAL ES XQ LAS LLAMADADAS SON ASÍNCRONAS  */
        while (!recalc){
            recalc=false;
            if (!World.loadingPath){
                if (!World.loadedPath) { //The first time called will create the path
                    World.loadPath(currentLocation,acc); //tener cuidado xq es asíncrono
                    World.lastObjective=false;
                }
            } 
        
        
            if (!World.loadingPath){
                if(World.currentObjetive==null){   // Si todavía no se comenzó a dibujar el camino
                	World.currentObjetive= 0;
                    if (World.currentObjetive==World.cornerPath.length-1){
                        World.lastObjective=true;
                    }
                	World.makePointsPath(currentLocation,World.cornerPath[World.currentObjetive]);     //calcular camino hasta objetivo
        			World.drawPath();
                }else{
                	if (World.farAwayPath(currentLocation)){
                		// Si se va muy lejos del proximo punto recalcular el camino
                		World.loadedPath = false;
                		recalc=true;
                	}else {
                		if(World.nextPointReached(currentLocation)){ //llegaste al siguiente punto
                			World.ereaseNextPoint();
        	        		if (World.pointsPath.length<=3 && !World.lastObjective){	//Es el final del tramo
        						World.makePointsPath(World.cornerPath[World.currentObjetive],World.cornerPath[World.currentObjetive+1]);	//calcular camino hasta objetivo
        						World.nextObjetive();
        						World.drawPath();
        					}
        				}
                	}
                }
            }
        }


    },

    locationChanged: function locationChangedFn(lat, lon, acc) {
        AR.logger.debug("Location changed");
        var currentLocation=new GeoPoint(lat,lon,null);
        /*
        if (es la primera vez || estás muy lejos del objetivo)
            cargar el camino
            objetivo=primer punto
            calcular camino hasta objetivo
            dibujarCaminoHastaObjetivo
        if (llegaste al punto)
            if (!es el último)
                objetivo=siguiente punto
                calcular camino hasta objetivo
                dibujarCaminoHastaObjetivo
        */


        //var recalc=false;  //True si hay que volver a calcular el camino
        /*  SI ANDA MAL ES XQ LAS LLAMADADAS SON ASÍNCRONAS  */
        //while (!recalc){
        //    recalc=false;
            if (!World.loadingPath){
                if (!World.loadedPath) { //The first time called will create the path
                    World.loadPath(currentLocation,acc); //tener cuidado xq es asíncrono
                    World.lastObjective=false;
                }
            } 
        
        
            if (!World.loadingPath){
                AR.logger.debug("Not loading path");
                if(World.currentObjetive==null){   // Si todavía no se comenzó a dibujar el camino
                    AR.logger.debug("Objective null");
                    World.currentObjetive= 0;
                    if (World.currentObjetive==World.cornerPath.length-1){
                        World.lastObjective=true;
                    }
                    console.log("index: "+World.currentObjetive);
                    console.log("cantidad de esquinas: "+World.cornerPath.length);
                    World.makePointsPath(currentLocation,World.cornerPath[World.currentObjetive]);     //calcular camino hasta objetivo
                    World.drawPath();
                }else{
                    AR.logger.debug("Hay objetivo");
                    //if (World.farAwayPath(currentLocation)){
                        // Si se va muy lejos del proximo punto recalcular el camino
                        //World.loadedPath = false;
        //                recalc=true;
                    //}else {
                        if(World.nextPointReached(currentLocation)){ //llegaste al siguiente punto
                            World.ereaseNextPoint();
                            if (World.pointsPath.length<=3 && !World.lastObjective){    //Es el final del tramo
                                World.makePointsPath(World.cornerPath[World.currentObjetive],World.cornerPath[World.currentObjetive+1]);    //calcular camino hasta objetivo
                                World.nextObjetive();
                                World.drawPath();
                            }
                        }
                    //}
                }
            }
        //}


    },

    nextObjetive: function nextObjetiveFn() {
        currentObjetive++;
        if (currentObjetive==cornerPath.length-1){
            lastObjective=true;
        }
    },


    farAwayPath: function farAwayPathFn(location) {
    	if ((World.pointsPath.length == 0) && !World.lastObjective){
    		return true;
    	}else{
    		if(World.pointsPath[0].geopoint.getDistance(location)>World.FAR_AWAY_DISTANCE){  //if next path point is far away
    			return true;
    		}else{
    			return false;
    		}
    	}
    },


    nextPointReached: function nextPointReachedFn(location) {
    	if (World.pointsPath.length == 0){
    		return false;
    	}else{
    		if(World.pointsPath[0].getKilometros(location)<World.POINT_REACHED_THRESHOLD){  //if user are in the point
    			return true;
    		}else{
    			return false;
    		}
    	}
    },


	loadPath: function getPuntosCriticos (from,accuracy) {
	    var request = new XMLHttpRequest();
        AR.logger.debug("Origen:"+from.toString());
        AR.logger.debug("Destino:"+World.objective.toString());
	    var url = 'https://api.mapbox.com/directions/v5/mapbox/walking/' + from.toString() + ';' + World.objective.toString() + '.json?access_token=pk.eyJ1IjoibGFyZGEiLCJhIjoiY2p2enlpeng0MDVqNTQ5bGtmcXVoOGFvYyJ9.BV8qWVhxm6i2QW2LSNcUUg&steps=true&alternatives=true&overview=full&geometries=polyline';
	    request.open('GET',url,true);
	    World.cornerPath.length=0;
	    request.onload = function () {
            AR.logger.debug("Llegó la respuesta");
	        var data = JSON.parse(this.response);
            AR.logger.debug(data);
            console.log(data);
	        var steps = data.routes[0].legs[0].steps;
	        steps.forEach(step => {
	            var esquinas= step.intersections
	            esquinas.forEach ( esquina =>{
	                World.cornerPath.push(new GeoPoint(esquina.location[1],esquina.location[0],null));
	             })
	        });
	        World.cornerPath.forEach(punto => {
	            console.log(punto)    
	        });
            World.loadingPath = false;
            World.loadedPath = true;
            AR.logger.debug("Camino cargado");
            World.locationChanged(from.lat,from.long,from.alt,accuracy);
	    };
        World.loadingPath=true;
	    request.send();
        AR.logger.debug("Petición realizada");
	},


	makePointsPath: function makePointsPathFn (origen,destino) {
        AR.logger.debug("MakePoints llamado");
        var pointsAmount = origen.getKilometros(destino);
        console.log("Distancia al siguiente punto"+ pointsAmount);
		pointsAmount=Math.trunc(pointsAmount/0.005);  //Un punto cada cinco metros
        console.log("Cantidad de puntos:"+ pointsAmount);

	    var latStep=(origen.lat-destino.lat)/pointsAmount;
        console.log("latStep:"+ latStep);
	    var lonStep=(origen.long-destino.long)/pointsAmount;
        console.log("lonStep:"+ lonStep);
	    var altStep=(origen.alt-destino.alt)/pointsAmount;
        console.log("altStep:"+ altStep);

	    var pointLat=origen.lat;
	    var pointLon=origen.long;
	    var pointAlt=origen.alt;

	    for (var point = 0; point < pointsAmount; point++) { 
	    	pointLat=pointLat+latStep;
	    	pointLon=pointLon+lonStep;
	    	pointAlt=pointAlt+altStep;
            AR.logger.debug("Agregadando un punto");
	    	World.pointsPath.push(new GeoPoint(pointLat,pointLon,pointAlt));
            AR.logger.debug("Punto agregado");
	    }

	},


	drawPath: function drawPathFn () {
        AR.logger.debug("Draw llamado");
		World.pointsPathDraws.length=0;
		for (var i = 0; i < World.pointsPath.length; i++) {
            console.log("Point of path:");
            console.log(World.pointsPath[i]);
			World.pointsPathDraws.push(new PointOfPath(World.pointsPath[i]));
            AR.logger.debug("Punto mostrado");
		}
	},

	ereaseNextPoint: function ereaseNextPointFn() {
    	World.pointsPath.shift(); 
    	PointOfPath.prototype.remove(pointsPathDraws[0]);
    	World.pointsPath.shift(); 
    },

};

/* Forward locationChanges to custom function. */
AR.context.onLocationChanged = World.locationChanged;