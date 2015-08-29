
"use strict";

function $(id) {
  return document.getElementById(id);
}

// This is here because setTimeout() doesn't seem to call member functions correctly
function Hide(popupManager)
{
    popupManager.HidePopup();
}

var popUpDuration = 3000;

define( [
        ],
       function (
                 ) {


  var PopUpManager = function (services) {
    this.services = services;
      this.hideTimeoutID = 0;
      
      this.overlay = $("overlay");
      this.line1 = $("overlay-line1");
      this.line2 = $("overlay-line2");
      
      this.HidePopup();
  };
    
  PopUpManager.prototype.CreatePopUp = function(line1, line2)
  {
    this.line1.textContent = line1;
    this.line2.textContent = line2;
    this.ShowPopUp();
    clearTimeout( this.hideTimeoutID );
    this.hideTimeoutID = setTimeout( Hide, popUpDuration, this );
  }
    
  PopUpManager.prototype.ShowPopUp = function()
  {
    this.overlay.style.visibility = 'visible';  
  }
  
  PopUpManager.prototype.HidePopup = function()
  {
    this.overlay.style.visibility = 'hidden';
  }

  return PopUpManager;
});

