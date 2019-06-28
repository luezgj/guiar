function PointOfPath(geolocation) {

    /*
        For creating the marker a new object AR.GeoObject will be created at the specified geolocation. An
        AR.GeoObject connects one or more AR.GeoLocations with multiple AR.Drawables. The AR.Drawables can be
        defined for multiple targets. A target can be the camera, the radar or a direction indicator. Both the
        radar and direction indicators will be covered in more detail in later examples.
    */
    this.markerLocation;
    /* Create the AR.GeoLocation from the poi data. */
    if (geolocation.alt==null || geolocation.alt==0){
        this.markerLocation= new AR.GeoLocation(geolocation.lat, geolocation.long);
    }else{
        this.markerLocation= new AR.GeoLocation(geolocation.lat, geolocation.long, geolocation.alt);
    }

    /* Create the AR.GeoObject with the drawable objects. */
    this.markerObject = new AR.GeoObject(this.markerLocation, {
        drawables: {
            cam: World.overlayOne
        }
    });

    return this;
}


PointOfPath.prototype.remove = function(point) {
    console.log(point);
    console.log(point.markerObject);
    point.markerLocation.destroy();
    point.markerObject.destroy();
};