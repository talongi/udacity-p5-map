function AppViewModel() {
    // Data
    var self = this;

    self.searchTerm = ko.observable("Enter places here!");

    self.updateResults = function(){
    	ko.computed(function(){
    		console.log("computed");
    	}, self);
    }
}

ko.applyBindings(new AppViewModel());