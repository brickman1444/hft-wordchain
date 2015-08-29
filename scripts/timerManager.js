
"use strict";

function $(id) {
    return document.getElementById(id);
}

function tick(timerManager)
{
    timerManager.tick();
}

define( [],
       function (
                 ) {
    
  var turnTime = 20;
    
  var TimerManager = function (services) {
    this.services = services;
    this.timerElement = $("timer");
    this.timerNum = turnTime;
    this.tickIntervalID = 0;
    this.hideTimer();
  };
    
  TimerManager.prototype.startTimer = function()
  {
      this.timerNum = turnTime;
      clearInterval(this.tickIntervalID);
      this.tickIntervalID = setInterval(tick, 1000, this);
      this.updateTimerText();
      this.showTimer();
  }
  
  TimerManager.prototype.stopTimer = function()
  {
      clearInterval(this.tickIntervalID);
      this.tickIntervalID = 0;
      this.hideTimer();
  }
  
  TimerManager.prototype.resetTimer = function()
  {
     this.startTimer();
  }
  
  TimerManager.prototype.showTimer = function()
  {
      this.timerElement.style.visibility = 'visible';
  }
  
  TimerManager.prototype.hideTimer = function()
  {
      this.timerElement.style.visibility = 'hidden';
  }
    
  TimerManager.prototype.tick = function()
  {      
      this.timerNum--;
      
      if (this.timerNum <= 0)
      {
          this.services.playerManager.advanceTurn();
          this.timerNum = turnTime;
      }
      
      this.updateTimerText();
  }
  
  TimerManager.prototype.updateTimerText = function()
  {
      this.timerElement.textContent = this.timerNum;
  }

  return TimerManager;
});

