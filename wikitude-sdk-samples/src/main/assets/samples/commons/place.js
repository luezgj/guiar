class Place {
    constructor(id, name, description, categories, contact, schedule , geopoint) {
        this._id = id;
        this._name = name;
        this._description = description;
        this._categories = categories;

        this._contact = contact;
		this._schedule = schedule;

		this._geopoint = geopoint;
    }

    get id(){
        return this._id;
    }

    get name(){
        return this._name;
    }

	get description(){
        return this._description;
    }

    get categories(){
        return this._categories;
    }

    get contact(){
        return this._contact;
    }

    get schedule(){
        return this._schedule;
    }

    get geopoint(){
        return this._geopoint;
    }
}