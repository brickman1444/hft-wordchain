/*
 * Copyright 2014, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
"use strict";

// Start the main app logic.
requirejs(
  [ 'hft/commonui',
    'hft/gameclient',
    'hft/misc/input',
    'hft/misc/misc',
    'hft/misc/mobilehacks',
    'hft/misc/touch',
    '../bower_components/hft-utils/dist/audio',
    '../bower_components/hft-utils/dist/imageloader',
    '../bower_components/hft-utils/dist/imageutils',
    '../bower_components/hft-utils/dist/colorutils'
  ], function(
    CommonUI,
    GameClient,
    Input,
    Misc,
    MobileHacks,
    Touch,
    AudioManager,
    ImageLoader,
    ImageUtils,
    colorUtils) {
  var g_client;
  var g_audioManager;
  var g_clock;
  var g_grid;
  var g_instrument;
  var g_leftRight = 0;
  var g_oldLeftRight = 0;
  var g_jump = false;

  var globals = {
    debug: false,
    orientation: "portrait-primary",
  };
  Misc.applyUrlSettings(globals);
  MobileHacks.fixHeightHack();
  MobileHacks.disableContextMenu();
  MobileHacks.adjustCSSBasedOnPhone([
    {
      test: MobileHacks.isIOS8OrNewerAndiPhone4OrIPhone5,
      styles: {
        ".button": {
          bottom: "100px",
        },
      },
    },
  ]);

  function $(id) {
    return document.getElementById(id);
  }

  var startClient = function() {

    g_client = new GameClient();
    //
    var handleScore = function() {
    };

    var handleDeath = function() {
    };

    var handleSetColor = function(msg) {
      
      var cssColor = colorUtils.makeCSSColorFromRgba255(msg.r,msg.g,msg.b,255);
        
      document.body.style.background = cssColor;
    };

    g_client.addEventListener('score', handleScore);
    g_client.addEventListener('die', handleDeath);
    g_client.addEventListener('setColor', handleSetColor);
    g_client.addEventListener('end turn', handleEndTurn);
    g_client.addEventListener('start turn', handleStartTurn);

    var sounds = {
        coin:              { jsfx: ["square",0.0000,0.4000,0.0000,0.0240,0.4080,0.3480,20.0000,909.0000,2400.0000,0.0000,0.0000,0.0000,0.0100,0.0003,0.0000,0.2540,0.1090,0.0000,0.0000,0.0000,0.0000,0.0000,1.0000,0.0000,0.0000,0.0000,0.0000], },
    };
    g_audioManager = new AudioManager(sounds);

    CommonUI.setupStandardControllerUI(g_client, globals);

  };
        

  var images = {
    idle:  { url: "assets/spr_idle.png", },
  };
  
  var bodyElement = $("body");
        
  var wordInput = $("word-choice");
  var wordChoiceButton = $("word-choice-button");
  var wordGuessForm = $("word-guess-form");
  
  wordChoiceButton.addEventListener('click', onInputSubmit, false);
  
  wordInput.onkeypress=onKeyPress
  
  function onInputSubmit()
  {
	  //alert(wordInput.value)
      g_client.sendCmd('word choice', {
            word: wordInput.value,
        });
      wordInput.value = "";
      enterButtonsMode();
  }
  
  function onKeyPress()
  {
      // 13 is the code for the enter button
      // This somehow cancels the form submission event
	  if (event.keyCode != 13)
      {
         return true;   
      }
      else
      {
         onInputSubmit()
         return false;
      }
  }

  var upButton = $("up-button");
  var downButton = $("down-button");
        
  upButton.addEventListener('click', upPress, false);
  downButton.addEventListener('click', downPress, false);
                            
  function upPress()
  {
     g_client.sendCmd('up press', {
            direction: "up",
        }); 
     enterWordChoiceMode();
  }
                            
  function downPress()
  {
     g_client.sendCmd('down press', {
            direction: "down",
        });  
     enterWordChoiceMode();
  }
        
  var enterButtonsMode = function()
  {
      unhideButtons();
      hideWordChoice();
  };
        
  var enterWordChoiceMode = function()
  {
      unhideWordChoice();
      hideButtons();
  };
        
  function hideButtons() {
      hideElement(upButton);
      hideElement(downButton);
  };
        
  function unhideButtons() {
      unhideElement(upButton);
      unhideElement(downButton);
  };
        
  function hideWordChoice() {
      hideElement(wordGuessForm);
  };
        
  function unhideWordChoice() {
      unhideElement(wordGuessForm);
      wordInput.focus();
  };
        
  function hideElement(element)
  {
    element.style.visibility = 'hidden';
  };
        
  function unhideElement(element)
  {
    element.style.visibility = 'visible';
  };
        
  var handleStartTurn = function() {
      enterButtonsMode();
      g_audioManager.playSound("coin");
  };
        
  var handleEndTurn = function() {
      hideButtons();
      hideWordChoice();
  };
        
  ImageLoader.loadImages(images, startClient);
});


