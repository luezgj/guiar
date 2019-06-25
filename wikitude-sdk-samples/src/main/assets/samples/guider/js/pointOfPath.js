function PointOfPath(geolocation) {

    /*
        For creating the marker a new object AR.GeoObject will be created at the specified geolocation. An
        AR.GeoObject connects one or more AR.GeoLocations with multiple AR.Drawables. The AR.Drawables can be
        defined for multiple targets. A target can be the camera, the radar or a direction indicator. Both the
        radar and direction indicators will be covered in more detail in later examples.
    */

    var markerLocation;
    /* Create the AR.GeoLocation from the poi data. */
    if (geolocation.alt==null){
        markerLocation= new AR.GeoLocation(geolocation.lat, geolocation.long);
    }else{
        markerLocation= new AR.GeoLocation(geolocation.lat, geolocation.long, geolocation.alt);
    }
     

    /* Create an AR.ImageDrawable for the marker in idle state. */
    this.dot = new AR.Model("resources/circle.wt3", { scale: {x:1, y:1, z:1} } );

    // Create overlay for page one
    this.imgOne = new AR.ImageResource("assets/magazine_page_one.jpeg");
    this.overlayOne = new AR.ImageDrawable(this.imgOne, 1, {
        translate: 
{            x: -0.15,
        }
    });

    /* Create the AR.GeoObject with the drawable objects. */
    this.markerObject = new AR.GeoObject(markerLocation, {
        drawables: {
            cam: this.overlayOne
        }
    });

    return this;
}


PointOfPath.prototype.remove = function(marker) {
    marker.markerObject.destroy();
};