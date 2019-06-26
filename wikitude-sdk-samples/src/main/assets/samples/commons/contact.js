class Contact{
	constructor(telephone, email, facebook, instagram, twitter) {
        this._telephone = telephone;
        this._email = email;
        this._facebook = facebook;
        this._instagram = instagram;
		this._twitter = twitter;
    }

    get telephone(){
        return this._telephone;
    }

	get email(){
        return this._email;
    }

    get facebook(){
        return this._facebook;
    }

    get instagram(){
        return this._instagram;
    }

    get twitter(){
        return this._twitter;
    }
}