
"use strict";

function $(id) {
  return document.getElementById(id);
}

// This is here because setTimeout() doesn't seem to call member functions correctly
function Hide(popupManager)
{
    popupManager.HidePopup();
}

var popUpDuration = 10000;

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
  };
    
  PopUpManager.prototype.CreatePopUp = function(line1, line2)
  {
    this.line1.childNodes[0].data = line1;
    this.line2.childNodes[0].data = line2;
    this.ShowPopUp();
    setTimeout( Hide, popUpDuration, this );
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

