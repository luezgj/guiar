/*
    Information about server communication. This sample webservice is provided by Wikitude and returns random dummy
    places near given location.
 */
var ServerInformation = {
    POIDATA_SERVER: "https://example.wikitude.com/GetSamplePois/",
    POIDATA_SERVER_ARG_LAT: "lat",
    POIDATA_SERVER_ARG_LON: "lon",
    POIDATA_SERVER_ARG_NR_POIS: "nrPois"
};

/* Implementation of AR-Experience (aka "World"). */
var World = {

    /*
        User's latest known location, accessible via userLocation.latitude, userLocation.longitude,
         userLocation.altitude.
     */
    userLocation: null,

    /* You may request new data from server periodically, however: in this sample data is only requested once. */
    isRequestingData: false,

    /* True once data was fetched. */
    initiallyLoadedData: false,

    /* Different POI-Marker assets. */
    markerDrawableIdle: null,
    markerDrawableSelected: null,
    markerDrawableDirectionIndicator: null,

    /* List of AR.GeoObjects that are currently shown in the scene / World. */
    markerList: [],

    /* the last selected marker. */
    currentMarker: null,

    locationUpdateCounter: 0,
    updatePlacemarkDistancesEveryXLocationUpdates: 10,

    /* Called to inject new POI data. */
    loadPoisFromPlacesArray: function loadPoisFromPlacesArrayFn(placesArray) {

        /* Destroys all existing AR-Objects (markers & radar). */
        AR.context.destroyAll();

        /* Show radar & set click-listener. */
        //PoiRadar.show();
        $('#radarContainer').unbind('click');
        $("#radarContainer").click(PoiRadar.clickedRadar);

        /* Empty list of visible markers. */
        World.markerList = [];

        /* Start loading marker assets. */
        World.markerTuristicoDrawableIdle = new AR.ImageResource("assets/locationTuristico.png", {
            onError: World.onError
        });
        World.markerTuristicoDrawableSelected = new AR.ImageResource("assets/locationTuristicoSelected.png", {
            onError: World.onError
        });

        World.markerRestauranteDrawableIdle = new AR.ImageResource("assets/locationRestaurante.png", {
            onError: World.onError
        });
        World.markerRestauranteDrawableSelected = new AR.ImageResource("assets/locationRestauranteSelected.png", {
            onError: World.onError
        });

        World.markerCafeteriaDrawableIdle = new AR.ImageResource("assets/locationCafeteria.png", {
            onError: World.onError
        });
        World.markerCafeteriaDrawableSelected = new AR.ImageResource("assets/locationCafeteriaSelected.png", {
            onError: World.onError
        });

        World.markerBarDrawableIdle = new AR.ImageResource("assets/locationBar.png", {
            onError: World.onError
        });
        World.markerBarDrawableSelected = new AR.ImageResource("assets/locationBarSelected.png", {
            onError: World.onError
        });

        World.markerDrawableDirectionIndicator = new AR.ImageResource("assets/indi.png", {
            onError: World.onError
        });

        /* Loop through POI-information and create an AR.GeoObject (=Marker) per POI. */
        for (var currentPlaceNr = 0; currentPlaceNr < placesArray.length; currentPlaceNr++) {
            AR.logger.debug(placesArray[currentPlaceNr].name+":"+placesArray[currentPlaceNr].geopoint.lat+";"+placesArray[currentPlaceNr].geopoint.long);
            let currentMarker=new Marker(placesArray[currentPlaceNr]);
            console.log(currentMarker);
            World.markerList.push(currentMarker);
            if (currentMarker.markerObject.locations[0].distanceToUser()>500){
                currentMarker.markerObject.enabled=false;
            }
        }

        /* Updates distance information of all placemarks. */
        World.updateDistanceToUserValues();

        World.updateStatusMessage(currentPlaceNr + ' places loaded');

        /* Set distance slider to 100%. */
        $("#panel-distance-range").val(100);
        $("#panel-distance-range").slider("refresh");
    },

    /*
        Sets/updates distances of all makers so they are available way faster than calling (time-consuming)
        distanceToUser() method all the time.
     */
    updateDistanceToUserValues: function updateDistanceToUserValuesFn() {
        for (var i = 0; i < World.markerList.length; i++) {
            World.markerList[i].distanceToUser = World.markerList[i].markerObject.locations[0].distanceToUser();
        }
    },

    /* Updates status message shown in small "i"-button aligned bottom center. */
    updateStatusMessage: function updateStatusMessageFn(message, isWarning) {

        var themeToUse = isWarning ? "e" : "c";
        var iconToUse = isWarning ? "alert" : "info";

        $("#status-message").html(message);
        $("#popupInfoButton").buttonMarkup({
            theme: themeToUse,
            icon: iconToUse
        });
    },

    /*
        It may make sense to display POI details in your native style.
        In this sample a very simple native screen opens when user presses the 'More' button in HTML.
        This demoes the interaction between JavaScript and native code.
    */
    /* User clicked "More" button in POI-detail panel -> fire event to open native screen. */
    onPoiDetailGuideClicked: function onPoiDetailGuideClickedFn() {
        var currentMarker = World.currentMarker;
        AR.logger.debug();
        var objective= { id : currentMarker.place.id };
        AR.platform.sendJSONObject(objective);
    },

    /* Location updates, fired every time you call architectView.setLocation() in native environment. */
    locationChanged: function locationChangedFn(lat, lon, alt, acc) {
        AR.logger.debug("locationChanged:"+lat+";"+lon);
        AR.logger.debug("accuracy:"+acc);

        /* Store user's current location in World.userLocation, so you always know where user is. */
        World.userLocation = {
            'latitude': lat,
            'longitude': lon,
            'altitude': alt,
            'accuracy': acc
        };


        /* Request data if not already present. */
        if (!World.initiallyLoadedData) {
            World.requestDataFromServer(lat, lon);
            World.initiallyLoadedData = true;
        } else if (World.locationUpdateCounter === 0) {
            /*
                Update placemark distance information frequently, you max also update distances only every 10m with
                some more effort.
             */
            World.updateDistanceToUserValues();
        }

        /* Helper used to update placemark information every now and then (e.g. every 10 location upadtes fired). */
        World.locationUpdateCounter =
            (++World.locationUpdateCounter % World.updatePlacemarkDistancesEveryXLocationUpdates);
    },

    /*
        POIs usually have a name and sometimes a quite long description.
        Depending on your content type you may e.g. display a marker with its name and cropped description but
        allow the user to get more information after selecting it.
    */

    /* Fired when user pressed maker in cam. */
    onMarkerSelected: function onMarkerSelectedFn(marker) {
        World.currentMarker = marker;

        /*
            In this sample a POI detail panel appears when pressing a cam-marker (the blue box with title &
            description), compare index.html in the sample's directory.
        */
        /* Update panel values. */
        $("#poi-detail-title").html(marker.place.name);
        $("#poi-detail-description").html(marker.place.description);
        $("#poi-detail-category").html(marker.place.category);
        $("#poi-img").attr("src",marker.place.imgsrc)

        /*
            It's ok for AR.Location subclass objects to return a distance of `undefined`. In case such a distance
            was calculated when all distances were queried in `updateDistanceToUserValues`, we recalculate this
            specific distance before we update the UI.
         */
        if (undefined === marker.distanceToUser) {
            marker.distanceToUser = marker.markerObject.locations[0].distanceToUser();
        }

        /*
            Distance and altitude are measured in meters by the SDK. You may convert them to miles / feet if
            required.
        */
        var distanceToUserValue = (marker.distanceToUser > 999) ?
            ((marker.distanceToUser / 1000).toFixed(2) + " km") :
            (Math.round(marker.distanceToUser) + " m");

        $("#poi-detail-distance").html(distanceToUserValue);

        /* Show panel. */
        $("#panel-poidetail").panel("open", 123);

        $(".ui-panel-dismiss").unbind("mousedown");

        /* Deselect AR-marker when user exits detail screen div. */
        $("#panel-poidetail").on("panelbeforeclose", function(event, ui) {
            World.currentMarker.setDeselected(World.currentMarker);
        });
    },

    /* Screen was clicked but no geo-object was hit. */
    onScreenClick: function onScreenClickFn() {
        /* You may handle clicks on empty AR space too. */
    },

    /* Returns distance in meters of placemark with maxdistance * 1.1. */
    getMaxDistance: function getMaxDistanceFn() {

        /* Sort places by distance so the first entry is the one with the maximum distance. */
        World.markerList.sort(World.sortByDistanceSortingDescending);

        /* Use distanceToUser to get max-distance. */
        var maxDistanceMeters = World.markerList[0].distanceToUser;

        /*
            Return maximum distance times some factor >1.0 so ther is some room left and small movements of user
            don't cause places far away to disappear.
         */
        return maxDistanceMeters * 1.1;
    },

    /* Updates values show in "range panel". */
    updateRangeValues: function updateRangeValuesFn() {

        /* Get current slider value (0..100);. */
        var slider_value = $("#panel-distance-range").val();
        /* Max range relative to the maximum distance of all visible places. */
        var maxRangeMeters = Math.round(World.getMaxDistance() * (slider_value / 100));

        /* Range in meters including metric m/km. */
        var maxRangeValue = (maxRangeMeters > 999) ?
            ((maxRangeMeters / 1000).toFixed(2) + " km") :
            (Math.round(maxRangeMeters) + " m");

        /* Number of places within max-range. */
        var placesInRange = World.getNumberOfVisiblePlacesInRange(maxRangeMeters);

        /* Update UI labels accordingly. */
        $("#panel-distance-value").html(maxRangeValue);
        $("#panel-distance-places").html((placesInRange != 1) ?
            (placesInRange + " Places") : (placesInRange + " Place"));

        World.updateStatusMessage((placesInRange != 1) ?
            (placesInRange + " places loaded") : (placesInRange + " place loaded"));

        /* Update culling distance, so only places within given range are rendered. */
        AR.context.scene.cullingDistance = Math.max(maxRangeMeters, 1);

        /* Update radar's maxDistance so radius of radar is updated too. */
        PoiRadar.setMaxDistance(Math.max(maxRangeMeters, 1));
    },

    /* Returns number of places with same or lower distance than given range. */
    getNumberOfVisiblePlacesInRange: function getNumberOfVisiblePlacesInRangeFn(maxRangeMeters) {

        /* Sort markers by distance. */
        World.markerList.sort(World.sortByDistanceSorting);

        /* Loop through list and stop once a placemark is out of range ( -> very basic implementation ). */
        for (var i = 0; i < World.markerList.length; i++) {
            if (World.markerList[i].distanceToUser > maxRangeMeters) {
                return i;
            }
        }

        /* In case no placemark is out of range -> all are visible. */
        return World.markerList.length;
    },

    handlePanelMovements: function handlePanelMovementsFn() {

        $("#panel-distance").on("panelclose", function(event, ui) {
            $("#radarContainer").addClass("radarContainer_left");
            $("#radarContainer").removeClass("radarContainer_right");
            PoiRadar.updatePosition();
        });

        $("#panel-distance").on("panelopen", function(event, ui) {
            $("#radarContainer").removeClass("radarContainer_left");
            $("#radarContainer").addClass("radarContainer_right");
            PoiRadar.updatePosition();
        });
    },

    /* Display range slider. */
    showRange: function showRangeFn() {
        if (World.markerList.length > 0) {

            /* Update labels on every range movement. */
            $('#panel-distance-range').change(function() {
                World.updateRangeValues();
            });

            World.updateRangeValues();
            World.handlePanelMovements();

            /* Open panel. */
            $("#panel-distance").trigger("updatelayout");
            $("#panel-distance").panel("open", 1234);
        } else {

            /* No places are visible, because the are not loaded yet. */
            World.updateStatusMessage('No places available yet', true);
        }
    },

    /*
        You may need to reload POI information because of user movements or manually for various reasons.
        In this example POIs are reloaded when user presses the refresh button.
        The button is defined in index.html and calls World.reloadPlaces() on click.
    */

    /* Reload places from content source. */
    reloadPlaces: function reloadPlacesFn() {
        if (!World.isRequestingData) {
            if (World.userLocation) {
                World.requestDataFromServer(World.userLocation.latitude, World.userLocation.longitude);
            } else {
                World.updateStatusMessage('Unknown user-location.', true);
            }
        } else {
            World.updateStatusMessage('Already requesing places...', true);
        }
    },

    /* Request POI data. */
    /*requestDataFromServer: function requestDataFromServerFn(centerPointLatitude, centerPointLongitude) {
        var data = [
        {
            "id": 1,
            "longitude": (centerPointLongitude + (Math.random() / 5 - 0.1)),
            "latitude": (centerPointLatitude + (Math.random() / 5 - 0.1)),
            "description":"Instituto de investigación NICE",
            "altitude": "100.0",
            "name": "NICE"
        },
        {
            "id": 2,
            "longitude": (centerPointLongitude + (Math.random() / 5 - 0.1)),
            "latitude": (centerPointLatitude + (Math.random() / 5 - 0.1)),
            "description": "Instituto de investigación de Física",
            "altitude": "100.0",
            "name": "IFAT"
        },
        {
            "id": 3,
            "longitude": (centerPointLongitude + (Math.random() / 5 - 0.1)),
            "latitude": (centerPointLatitude + (Math.random() / 5 - 0.1)),
            "description": "Comedor universitario de la UNICEN",
            "altitude": "100.0",
            "name": "Comedor"
        },
         {
            "id": 4,
            "longitude": (centerPointLongitude + (Math.random() / 5 - 0.1)),
            "latitude": (centerPointLatitude + (Math.random() / 5 - 0.1)),
            "description": "Gimnasio de la UNICEN y Secretaría de Bienestar Estudiantil",
            "altitude": "100.0",
            "name": "Gimnasio"
        },
         {
            "id": 5,
            "longitude": (centerPointLongitude + (Math.random() / 5 - 0.1)),
            "latitude": (centerPointLatitude + (Math.random() / 5 - 0.1)),
            "description": "Facultad de Ciencias Humanas",
            "altitude": "100.0",
            "name": "Facultad de Ciencias Humanas"
        }];


       /* for (var i = 0; i < poisToCreate; i++) {
            poiData.push({
                "id": (i + 1),
                "longitude": (centerPointLongitude + (Math.random() / 5 - 0.1)),
                "latitude": (centerPointLatitude + (Math.random() / 5 - 0.1)),
                "description": ("This is the description of POI#" + (i + 1)),
                "altitude": "100.0",
                "name": ("POI#" + (i + 1))
            });
        }*/
		

	filterPlaces: function filterPlacesFn(categoryArray){
		for (var i = 0; i < World.markerList.length ; i++) {
            if(!pertenece(categoryArray,World.markerList[i].category)){
                World.markerList[i].markerObject.enabled=false;
            }else{
                World.markerList[i].markerObject.enabled=true;
            }
        }
	},
    
	
    requestDataFromServer: function requestDataFromServerFn(centerPointLatitude, centerPointLongitude) {
        function requestDataAfterLoad(){
            var data = getLugares(new GeoPoint(centerPointLatitude, centerPointLongitude, null), ["Cerveceria","Cafeteria","Restaurant","Turistico"]/*Traer todos los tipos de lugares*/,  10/*Traer lugares hasta 10km*/);
            console.log("Lugares traidos del servidor:");
            console.log(data);
            World.loadPoisFromPlacesArray(data);
            World.isRequestingData = false;
        }

        traerDatosJson(requestDataAfterLoad);
    },


    /* Helper to sort places by distance. */
    sortByDistanceSorting: function sortByDistanceSortingFn(a, b) {
        return a.distanceToUser - b.distanceToUser;
    },

    /* Helper to sort places by distance, descending. */
    sortByDistanceSortingDescending: function sortByDistanceSortingDescendingFn(a, b) {
        return b.distanceToUser - a.distanceToUser;
    },

    onError: function onErrorFn(error) {
        alert(error);
    },

    llamarGuia: function llamarGuiaFn(){
        var obj= { id : 6 };
        AR.platform.sendJSONObject(obj);
    }
};


/* Forward locationChanges to custom function. */
AR.context.onLocationChanged = World.locationChanged;

/* Forward clicks in empty area to World. */
AR.context.onScreenClick = World.onScreenClick;