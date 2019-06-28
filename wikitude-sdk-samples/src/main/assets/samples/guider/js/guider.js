/* Implementation of AR-Experience (aka "World"). */
var World = {

    /* Create an AR.ImageDrawable for the marker in idle state. */
    dot: new AR.Model("resources/circle.wt3", { scale: {x:1, y:1, z:1} } ),

    // Create overlay for page one
    //this.imgOne: ,

    overlayOne: new AR.ImageDrawable(new AR.ImageResource("assets/magazine_page_one.jpeg"), 1, {
        translate: {
            x: -0.15,
        }
    }),

	//Distance considered far away to a point
	FAR_AWAY_DISTANCE: 0.07,	//70mts
	POINT_REACHED_THRESHOLD: 0.001,		//1mt

	/* List of corners that form the path */
	cornerPath: [],

	/* index of the corner that is the inmediate objective */
	currentObjetive: null,

	/* destination of the path */
	objective: null,

    /* True once path was fetched. */
    loadedPath: false,
    loadingPath: false,

    /* True when the objective is the last. */
    lastObjective: false,

    /* List of the points that form the path to the next objective */
    /* List of AR.GeoObjects that are currently shown in the scene / World. */
    pointsPath: [],
    pointsPathDraws: [],

    lastKnowedLocation: null,

    setTarget: function setTargetFn(targetId){
        function getPlaceAfterLoad(){
            World.objective= getPlace(targetId);
            if (World.lastKnowedLocation!=null){
                if(World.lastKnowedLocation.alt!=null){
                    World.locationChanged(World.lastKnowedLocation.lat,World.lastKnowedLocation.long,World.lastKnowedLocation.alt,null);
                }else{
                    World.locationChanged(World.lastKnowedLocation.lat,World.lastKnowedLocation.long,null);
                }
            }
        };

        traerDatosJson(getPlaceAfterLoad);
        
    },

        /* Location updates, fired every time you call architectView.setLocation() in native environment. */
    locationChanged: function locationChangedFn(lat, lon, alt, acc) {
        AR.logger.debug("Location changed con altitud");
    	var currentLocation=new GeoPoint(lat,lon,alt);
        World.lastKnowedLocation=currentLocation;

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
        
        AR.logger.debug("Location changed with accuracy:"+acc);
        var currentLocation=new GeoPoint(lat,lon,null);
        World.lastKnowedLocation=currentLocation;
        
        if (World.objective!=null){

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
                        AR.logger.debug("cantidad de esquinas: "+World.cornerPath.length);
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
                                if ((World.pointsPath.length<=3) && (!World.lastObjective)){    //Es el final del tramo
                                    console.log("Hay que hacer un nuevo tramo");
                                    World.makePointsPath(World.cornerPath[World.currentObjetive],World.cornerPath[World.currentObjetive+1]);    //calcular camino hasta objetivo
                                    World.nextObjetive();
                                    World.drawPath();
                                }
                            }
                        //}
                    }
                }
            //}

        }

    },

    nextObjetive: function nextObjetiveFn() {
        World.currentObjetive++;
        if (World.currentObjetive==World.cornerPath.length-1){
            World.lastObjective=true;
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
    			AR.logger.debug("next point reached");
                return true;
    		}else{
                AR.logger.debug("todavía no llegás");
    			return false;
    		}
    	}
    },


	loadPath: function getPuntosCriticos (from,accuracy) {
	    var request = new XMLHttpRequest();
        AR.logger.debug("Origen:"+from.toString());
        AR.logger.debug("Destino:"+World.objective.toString());
	    var url = 'https://api.mapbox.com/directions/v5/mapbox/walking/' + from.toString() + ';' + World.objective.geopoint.toString() + '.json?access_token=pk.eyJ1IjoibGFyZGEiLCJhIjoiY2p2enlpeng0MDVqNTQ5bGtmcXVoOGFvYyJ9.BV8qWVhxm6i2QW2LSNcUUg&steps=true&alternatives=true&overview=full&geometries=polyline';
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
    	PointOfPath.prototype.remove(World.pointsPathDraws[0]);
    	World.pointsPathDraws.shift(); 
    },

    setTargetJoaco: function setTargetJoacoFn(){
        World.setTarget(6);
    },

};

/* Forward locationChanges to custom function. */
AR.context.onLocationChanged = World.locationChanged;