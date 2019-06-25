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
	objetive: null,

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
        /*AR.logger.debug("Location changed");
    	var currentLocation=new GeoPoint(lat,lon,alt);

        /*  SI ANDA MAL ES XQ LAS LLAMADADAS SON ASÍNCRONAS  */
        /*var recalc=true;  //True si hay que volver a calcular el camino (la primera vez hay que calcularlo)
        while (recalc){
            recalc=false;
            if (!World.loadedPath) { //The first time called will create the path
                World.loadPath(currentLocation); //tener cuidado xq es asíncrono
                World.loadedPath = true;
                World.lastObjective=false;
            } 
                
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
                        if (World.pointsPath.length<=3 && !World.lastObjective){    //Es el final del tramo
                            World.makePointsPath(World.cornerPath[World.currentObjetive],World.cornerPath[World.currentObjetive+1]);    //calcular camino hasta objetivo
                            World.nextObjetive();
                            World.drawPath();
                        }
                    }
                }
            }
        }*/

    },

    locationChanged: function locationChangedFn(lat, lon, acc) {
        AR.logger.debug("Location changed without alt");
        var currentLocation=new GeoPoint(lat,lon,null);

        //var recalc=true;  //True si hay que volver a calcular el camino (la primera vez hay que calcularlo)
        /*  SI ANDA MAL ES XQ LAS LLAMADADAS SON ASÍNCRONAS  */
        //while (recalc){
        //    recalc=false;
            if (!World.loadedPath) { //The first time called will create the path
                World.loadPath(currentLocation); //tener cuidado xq es asíncrono
                World.loadedPath = true;
                World.lastObjective=false;
            } 
                
            if(World.currentObjetive==null){   // Si todavía no se comenzó a dibujar el camino
                AR.logger.debug("Objetivo null");
                World.currentObjetive= 0;
                if (World.currentObjetive==World.cornerPath.length-1){
                    World.lastObjective=true;
                }
                World.makePointsPath(currentLocation,World.cornerPath[World.currentObjetive]);     //calcular camino hasta objetivo
                World.drawPath();
            }else{
                AR.logger.debug("Objetivo no null");
                if (World.farAwayPath(currentLocation)){
                    // Si se va muy lejos del proximo punto recalcular el camino
                    World.loadedPath = false;
        //            recalc=true;
                }else {
                    if(World.nextPointReached(currentLocation)){ //llegaste al siguiente punto
                        World.ereaseNextPoint();
                        if (World.pointsPath.length<=3 && !World.lastObjective){    //Es el final del tramo
                            World.makePointsPath(World.cornerPath[World.currentObjetive],World.cornerPath[World.currentObjetive+1]);    //calcular camino hasta objetivo
                            World.nextObjetive();
                            World.drawPath();
                        }
                    }
                }
            }
        //}
    },

    escribirHola: function escribirHolaFn() {
        AR.logger.debug("Hola");
        var location2 = new AR.RelativeLocation(null, 5, 5, 0);

        // Create overlay for page one
        var imgOne = new AR.ImageResource("assets/magazine_page_one.jpeg");
        var overlayOne = new AR.ImageDrawable(imgOne, 1, {
            translate: {
                x: -0.15,
            }
        });

        World.markerDrawable_idle = new AR.ImageResource("assets/marker_idle.png");
        /* Create an AR.ImageDrawable for the marker in idle state. */
        var dot = new AR.Model("resources/circle.wt3", { scale: {x:10, y:10, z:10} } );


        /* Create the AR.GeoObject with the drawable objects. */
        var markerObject = new AR.GeoObject(location2, {
            drawables: {
                cam: [overlayOne, dot]
            }
        });

        AR.logger.debug("Punto dibujado");
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
    		if(World.pointsPath[0].geopoint.getDistance(location)<World.POINT_REACHED_THRESHOLD){  //if user are in the point
    			return true;
    		}else{
    			return false;
    		}
    	}
    },


	loadPath: function getPuntosCriticos (from) {
        var distance=0;
	    for (var i = 0; i < 3; i++) {
            distance+=0.0005;
            World.cornerPath.push(new GeoPoint(from.lat+distance,from.lon+distance,from.alt))
        }
        AR.logger.debug("Path laoded");
	},


	makePointsPath: function makePointsPathFn (origen,destino) {
		var pointsAmount = origen.getKilometros(destino)/0.005;  //Un punto cada cinco metros
        AR.logger.debug("Cantidad de puntos");


	    var latStep=(origen.lat-destino.lat)/pointsAmount;
	    var lonStep=(origen.lon-destino.lon)/pointsAmount;
	    var altStep=(origen.alt-destino.alt)/pointsAmount;

	    var pointLat=origen.lat;
	    var pointLon=origen.lon;
	    var pointAlt=origen.alt;

	    for (var point = 0; point < pointsAmount; point++) { 
	    	pointLat=pointLat+latStep;
	    	pointLon=pointLon+lonStep;
	    	pointAlt=pointAlt+altStep;
	    	World.pointsPath.push(new GeoPoint(pointLat,pointLon,pointAlt));
            AR.logger.debug("Punto añadido");
	    }

	},


	drawPath: function drawPathFn () {
		World.pointsPathDraws.length=0;
		for (var i = 0; i < World.pointsPath.length; i++) {
			World.pointsPathDraws.push(new PointOfPath(World.pointsPath[i]));
            AR.logger.debug("Punto dibujado");
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