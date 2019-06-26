var listOfLugares = [];

function traerDatosJson(){ // LEVANTA EL ARCHIVO JSON Y LO GUARDA EN LISTOFLUGARES
    const xhttp = new XMLHttpRequest();
    console.log("traerDatosJson llamado");
    xhttp.open('GET', 'Lugares.json', true);

    xhttp.send();

    xhttp.onreadystatechange = function(responseText){
        console.log("Pedido cumplido");
        console.log(responseText);
        console.log(xhttp);
        if (this.readyState == 4 && this.status == 200){
            console.log("datos parseado?");
            let datos = JSON.parse(this.responseText);
            console.log("datos parseado");
            for (var input of datos){
                console.log("Un dato:");
                var sitio = new Place(input.id, input.name, input.description, input.category, new Contact(), new Schedule(), new GeoPoint(input.lat, input.long));
                console.log(sitio);
                listOfLugares.push(sitio);
            }
        }
    }
}

var pertenece = function(categorias, categories){
    for (var item of categorias)
        for (var item2 of categories)
            if (item === item2)
                return true;
    return false;
}

function getLugares(myPlace, categorias, maxKm){
    var listofSites = [];

    for (var item of listOfLugares){
        var distancia = item.geopoint.getKilometros(myPlace);
        if (pertenece(categorias, item.categories) && (distancia < maxKm))
            listofSites.push(item);
    }
    return listofSites;
}

function getSitios(){

    // UBICACION ACTUAL
    var myPlace = new GeoPoint(-37.3404992, -59.1301319, 0);
    var maxKm = 2;      // ESTABLECE EL MAXIMO RANGO EN KM DE ALCANCE PARA DEVOLVER LOS LUGARES
    var categorias = ["Cafeteria", "Cerveceria"]; // CATEGORIAS PASADAS

    list = getLugares(myPlace, categorias, maxKm);

    return list;
}




