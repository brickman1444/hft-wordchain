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

define([
    'hft/misc/misc',
    'hft/misc/strings',
    '../bower_components/hft-utils/dist/2d',
    '../bower_components/hft-utils/dist/imageutils',
  ], function(
    Misc,
    Strings,
    M2D,
    ImageUtils) {

  var availableColors = [];
  var nameFontOptions = {
    font: "20px sans-serif",
    yOffset: 18,
    height: 20,
    fillStyle: "black",
  };

  /**
   * Player represnt a player in the game.
   * @constructor
   */
  var Player = (function() {
    return function(services, name, netPlayer) {
      this.services = services;
      this.renderer = services.renderer;
      this.netPlayer = netPlayer;
      if (availableColors.length == 0) {
        var colors = services.colors;
        for (var ii = 0; ii < colors.length; ++ii) {
          availableColors.push(colors[ii]);
        }
      }
      var colorNdx = Math.floor(Math.random() * availableColors.length);
      this.color = availableColors[colorNdx];
      window.p = this;
      netPlayer.sendCmd('setColor', this.color);
      availableColors.splice(colorNdx, 1);
      this.color.id;

      this.scoreLine = this.services.scoreManager.createScoreLine(this, this.color);
      //this.scoreLine.ctx.drawImage(this.services.images.idle.imgColors[this.color.id][0], 0, 0);

      netPlayer.addEventListener('disconnect', Player.prototype.handleDisconnect.bind(this));
      netPlayer.addEventListener('setName', Player.prototype.handleNameMsg.bind(this));
      netPlayer.addEventListener('busy', Player.prototype.handleBusyMsg.bind(this));
      netPlayer.addEventListener('word choice', Player.prototype.handleWordChoiceMsg.bind(this));
      netPlayer.addEventListener('down press', Player.prototype.handleDirectionButton.bind(this));
      netPlayer.addEventListener('up press', Player.prototype.handleDirectionButton.bind(this));

      this.setName(name);
      this.score = 0;
      this.addPoints(0);
      this.endTurn();

      this.reset();
    };
  }());

  Player.prototype.setName = function(name) {
    if (name != this.playerName) {
      this.playerName = name;
      this.scoreLine.setName(":" + name);
    }
  };

  Player.prototype.reset = function() {

  };

  Player.prototype.addPoints = function(points) {
    this.score += points;
    this.scoreLine.setMsg(Strings.padLeft(this.score, 3, "0"));
  };

  Player.prototype.removeFromGame = function() {
    this.services.playerManager.removePlayer(this);
    this.services.scoreManager.deleteScoreLine(this.scoreLine);
    availableColors.push(this.color);
  };

  Player.prototype.handleDisconnect = function() {
    this.removeFromGame();
  };

  Player.prototype.handleBusyMsg = function(msg) {
    // We ignore this message
  };
    
  Player.prototype.handleWordChoiceMsg = function(msg) {
    
    if ( this.services.wordManager.checkWord( msg.word ) )
    {
        this.addPoints( this.services.wordManager.getNumBlanks() );
        this.services.wordManager.advanceWordIndex();
    }
      
    this.services.playerManager.advanceTurn();
  };

  Player.prototype.handleNameMsg = function(msg) {
    if (!msg.name) {
      this.sendCmd('setName', {
        name: this.playerName
      });
    } else {
      this.setName(msg.name.replace(/[<>]/g, ''));
    }
  };
    
  Player.prototype.handleDirectionButton = function(msg)
  {
      if ( msg.direction == "up" )
      {
          this.services.wordManager.setTop();
      }
      else
      {
         this.services.wordManager.setBottom(); 
      }
      
      this.services.wordManager.giveLetter();
  };
    
  Player.prototype.endTurn = function() {
      this.sendCmd("end turn");
  };
    
  Player.prototype.startTurn = function() {
      this.sendCmd("start turn");
  };

  Player.prototype.sendCmd = function(cmd, data) {
    this.netPlayer.sendCmd(cmd, data);
  };

  return Player;
});
