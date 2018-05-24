let map;
let startLocation = {lat: 55.70586, lng: 12.51028};

/**
 * Defines our method for constructing the google map.
 * This method is automatically called from Google Maps js script.
 */
window.initMap = function initMap() {
    // Defines the look and feel of our map.
    map = new google.maps.Map(document.getElementById('map'), {
        center: startLocation,
        zoom: 16,
        styles: [
            {
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#212121"
                    }
                ]
            },
            {
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#757575"
                    }
                ]
            },
            {
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#212121"
                    }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#757575"
                    },
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "administrative.country",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#9e9e9e"
                    }
                ]
            },
            {
                "featureType": "administrative.locality",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#bdbdbd"
                    }
                ]
            },
            {
                "featureType": "poi",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#757575"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#181818"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#616161"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#1b1b1b"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#2c2c2c"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#8a8a8a"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#373737"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#3c3c3c"
                    }
                ]
            },
            {
                "featureType": "road.highway.controlled_access",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#4e4e4e"
                    }
                ]
            },
            {
                "featureType": "road.local",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#616161"
                    }
                ]
            },
            {
                "featureType": "transit",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#757575"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#000000"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#3d3d3d"
                    }
                ]
            }
        ],
        streetViewControl: false,
        mapTypeControlOptions: { mapTypeIds: [] }
    });


    // Draw grocery stores when map is loaded.
    viewModel.groceryStores.subscribe(function(groceryStores) {
        if(groceryStores == null) {
            return;
        }
        groceryStores.forEach(function (groceryStore) {
            groceryStore.draw(map);
        });
    });
    viewModel.groceryStores.valueHasMutated();

    // Close info Windows if clicking on map.
    map.addListener('click', function () {
        viewModel.closeInfoWindows();
    });
};

window.gm_authFailure = function() {
    // remove the map div or maybe call another API to load map
    // maybe display a useful message to the user
    alert('Failed loading Google Maps.');
};

/**
 * Grocery Store model
 *
 * Contains information regarding the grocery stores.
 */
class GroceryStore {

    constructor(name, location) {
        this.name = name;
        this.location = location;
    }

    /**
     * Draws the marker on the map
     *
     * Draws the marker on the map and adds a listener for showing infoWindow.
     *
     * @param map
     * @returns {GroceryStore}
     */
    draw(map) {
        // Do not draw marker if already drawn.
        if(this.marker != null) {
            return this;
        }

        this.marker = this.createMarker(map);
        this.infoWindow = this.createInfoWindow();

        const self = this;
        this.marker.addListener('click', function() {
            self.click();
        });
        return this;
    }

    /**
     * Creates the marker in the map.
     *
     * @param map
     * @returns {google.maps.Marker}
     */
    createMarker(map) {
        return new google.maps.Marker({
            position: {lat: this.location.lat, lng: this.location.lng},
            map: map,
            title: this.name
        });
    }

    /**
     * Handles clicking on the grocery store.
     */
    click() {
        // Close all info windows and open the current markers one instead.
        viewModel.closeInfoWindows();
        this.infoWindow.open(map, this.marker);
        this.animate();
    }

    /**
     * Make the marker bounce once.
     */
    animate() {
        let self = this;
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){
            self.marker.setAnimation(null);
        }, 750);
    }

    /**
     * Creates the info window for the grocery store.
     *
     * @returns {google.maps.InfoWindow}
     */
    createInfoWindow() {
        return new google.maps.InfoWindow({
            content: `
                <div class="card border-0" style="width: 18rem;">
                  <div class="card-body">
                    <h5 class="card-title">${this.name}</h5>
                    <p class="card-text">${this.location.address || "Unknown address"}, ${this.location.city}, ${this.location.cc}</p>
                  </div>
                </div>`
        });
    }

    /**
     * Searches for grocery stores at the specified location.
     *
     * @param lat
     * @param lng
     * @param search
     * @returns {Promise<Array<GroceryStore>>}
     */
    static async search(lat, lng, search = "") {
        return ajax({
            url: "https://api.foursquare.com/v2/venues/search",
            type: "get",
            data: {
                client_id: "3GYV41WEBBP21ZLSSCI5D3G1NQGBFWVW5QIGUNTYAGLDBIBE",
                client_secret: "L4NNVBRBVHZAUIGO31FZOHCRDDEM30Y4CDQ0YCFKM3IQIJGB",
                format: "json",
                v: "20180323",
                ll: lat +","+ lng,
                radius: 1000,
                categoryId: "4bf58dd8d48988d118951735",
                query: search,
            },
            dataType: "json"
        }).then(function (data) {
            return data.response.venues.map(function(venue) {
                return GroceryStore.fromJson(venue);
            });
        });
    }

    /**
     * Converts a array into a grocery store.
     *
     * @param json
     * @param json.name
     * @param json.location
     * @returns {GroceryStore}
     */
    static fromJson(json) {
        return new GroceryStore(
            json.name,
            json.location
        )
    }

    /**
     * Find multiple Grocery Stores by multiple ids.
     *
     * @param ids
     * @returns {Promise<GroceryStore[]>}
     */
    static async findMultiple(ids) {
        let promises = ids.map(function (id) {
            return GroceryStore.find(id);
        });

        return Promise.all(promises);
    }

    /**
     * Finds a Grocery Store by id
     *
     * @param id
     * @returns {Promise<GroceryStore>}
     */
    static async find(id) {
        return ajax({
            url: "https://api.foursquare.com/v2/venues/" + id,
            type: "get",
            data: {
                client_id: "3GYV41WEBBP21ZLSSCI5D3G1NQGBFWVW5QIGUNTYAGLDBIBE",
                client_secret: "L4NNVBRBVHZAUIGO31FZOHCRDDEM30Y4CDQ0YCFKM3IQIJGB",
                format: "json",
                v: "20180323"
            },
            dataType: "json"
        }).then(function (data) {
            return GroceryStore.fromJson(data.response.venue);
        });
    }
}

/**
 * Contains the view model for the page.
 */
class ViewModel {
    constructor() {
        self = this;

        this.searchField = ko.observable("");

        this.groceryStores = ko.observableArray();

        /**
         * Cleans the map before new grocery stores are drawn.
         */
        this.groceryStores.subscribe(function() {
            self.closeInfoWindows();
            self.destroyMarkers();
        }, null, "beforeChange");

        /**
         * Defines the observable which updates our grocery stores.
         */
        this.updateGroceryStores = ko.computed(function() {
            console.log("searching", self.searchField());
            GroceryStore.search(startLocation.lat, startLocation.lng, self.searchField()).catch(reason => {
                alert("failed fetching grocery stores from FourSquare.");
            }).then((data) => {
                self.groceryStores(data);
            });
        }, this).extend({ deferred: true });
    }

    /**
     * Makes a search with the value from search field. (Used for manually trigger search)
     */
    search() {
        this.updateGroceryStores.valueHasMutated();
    }

    /**
     * Removes all markers linked to grocery stores.
     */
    destroyMarkers() {
        if(this.groceryStores == null) {
            return;
        }
        this.groceryStores().forEach(function (groceryStore) {
            if(groceryStore.marker != null) {
                groceryStore.marker.setMap(null);
            }
        });
    }

    /**
     * Closes all the info windows for the grocery stores.
     */
    closeInfoWindows() {
        if(this.groceryStores == null) {
            return;
        }
        this.groceryStores().forEach(function (groceryStore) {
            if(groceryStore.infoWindow != null) {
                groceryStore.infoWindow.close();
            }
        });
    }
}

let viewModel = new ViewModel();

/**
 * Helper method for wrapping a ajax request to a promise
 *
 * @param options
 * @returns {Promise<array>}
 */
function ajax(options) {
    return new Promise(function (resolve, reject) {
        $.ajax(options).done(resolve).fail(reject);
    });
}

// Activates knockout.js
ko.applyBindings(viewModel);