var listOfLugares = [];

function traerDatosJson(callback){ // LEVANTA EL ARCHIVO JSON Y LO GUARDA EN LISTOFLUGARES
    const xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'Lugares.json', true);

    xhttp.send();

    xhttp.onreadystatechange = function(responseText){
        if (this.readyState == 4 && this.status == 200){
            let datos = JSON.parse(this.responseText);
            for (var input of datos){
                var sitio = new Place(input.id, input.name, input.description, input.category, new Contact(), new Schedule(), new GeoPoint(input.lat, input.long),input.imgsrc );
                listOfLugares.push(sitio);
                console.log("cargué un lugar");
            }
            if (callback!=null){
                console.log("llamo al callback");
                callback();
            }
        }
    }
}

var pertenece = function(categorias, category){
    for (var item of categorias){
        if (item === category){
            return true;
        }
    }
    return false;
}

function getLugares(myPlace, categorias, maxKm){
    var listofSites = [];
    for (var item of listOfLugares){
        var distancia = item.geopoint.getKilometros(myPlace);
        if (pertenece(categorias, item.category) && (distancia < maxKm))
            listofSites.push(item);
    }
    return listofSites;
}

function getPlace(placeId){
    console.log("placeId:"+placeId+"; CantidadLugares"+listOfLugares.length);
    if (placeId<listOfLugares.length){
        console.log(listOfLugares[placeId]);
        return listOfLugares[placeId];
    }
}

function getSitios(){

    // UBICACION ACTUAL
    var myPlace = new GeoPoint(-37.3404992, -59.1301319, 0);
    var maxKm = 2;      // ESTABLECE EL MAXIMO RANGO EN KM DE ALCANCE PARA DEVOLVER LOS LUGARES
    var categorias = ["Cafeteria", "Cerveceria"]; // CATEGORIAS PASADAS

    list = getLugares(myPlace, categorias, maxKm);

    return list;
}




