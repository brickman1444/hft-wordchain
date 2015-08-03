
"use strict";

function $(id) {
  return document.getElementById(id);
}

define( [
        ],
       function (
                 ) {


  var PopUpManager = function (services) {
    this.services = services;
      
      this.overlay = $("overlay");
      this.line1 = $("overlay-line1");
      this.line2 = $("overlay-line2");
      
      this.HidePopup();
      
      setTimeout( this.ShowPopUp, 3000 );
  };
    
  PopUpManager.prototype.ShowPopUp = function()
  {
    this.overlay.style.visibility = 'visible';  
  }
  
  PopUpManager.prototype.HidePopup = function()
  {
    this.overlay.style.visibility = 'hidden';
  }
    
  PopUpManager.prototype.func = function()
  {
     
  }

  return PopUpManager;
});

