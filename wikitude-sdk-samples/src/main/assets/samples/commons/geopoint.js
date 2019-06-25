class GeoPoint {
    constructor(lat, long, alt) {
        this._lat = lat;
        this._long = long;
        this._alt = alt;
    }

    get lat(){
        return this._lat;
    }

    get long(){
        return this._long;
    }
    
    get alt(){
        return this._alt;
    }
    
    getKilometros(otherPoint) {
        var rad = function(x) {return x*Math.PI/180;};
        var R = 6378.137; //Radio de la tierra en km
        var dLat = rad( this.lat - otherPoint.lat );
        var dLong = rad( this.long - otherPoint.long );
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(this.lat)) * Math.cos(rad(otherPoint.lat)) * Math.sin(dLong/2) * Math.sin(dLong/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;
        console.log("Distance between:");
        console.log(this);
        console.log(otherPoint);
        console.log("is:"+d);
        return d;
    }

    toString(){
        return this.long+','+this.lat;
    }
}