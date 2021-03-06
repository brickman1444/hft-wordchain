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

function $(id) {
  return document.getElementById(id);
}

// Start the main app logic.
requirejs(
  [ 'hft/gameserver',
    'hft/gamesupport',
    'hft/localnetplayer',
    'hft/misc/input',
    'hft/misc/misc',
    'hft/misc/strings',
    '../bower_components/tdl/tdl/textures',
    '../bower_components/tdl/tdl/webgl',
    '../bower_components/hft-utils/dist/audio',
    '../bower_components/hft-utils/dist/entitysystem',
    '../bower_components/hft-utils/dist/imageloader',
    '../bower_components/hft-utils/dist/imageutils',
    '../bower_components/hft-utils/dist/spritemanager',
    './particleeffectmanager',
    './particlesystemmanager',
    './playermanager',
    './scoremanager',
    './wordmanager',
    './popupmanager',
   './timermanager',
  ], function(
    GameServer,
    GameSupport,
    LocalNetPlayer,
    Input,
    Misc,
    Strings,
    Textures,
    WebGL,
    AudioManager,
    EntitySystem,
    ImageLoader,
    ImageUtils,
    SpriteManager,
    ParticleEffectManager,
    ParticleSystemManager,
    PlayerManager,
    ScoreManager,
    WordManager,
    PopUpManager,
    TimerManager) {
  var g_debug = false;
  var g_services = {};
window.s = g_services;

  var g_entitySystem = new EntitySystem();
  g_services.entitySystem = g_entitySystem;
  var g_drawSystem = new EntitySystem('draw');
  g_services.drawSystem = g_drawSystem;
  var g_playerManager = new PlayerManager(g_services);
  g_services.playerManager = g_playerManager;
  g_services.misc = Misc;
  var g_scoreManager = new ScoreManager(g_services, $("score"));
  g_services.scoreManager = g_scoreManager;
  var stop = false;

  // You can set these from the URL with
  // http://path/gameview.html?settings={name:value,name:value}
  var globals = {
    haveServer: true,
    numLocalPlayers: 1,  // num players when local (ie, debugger)
    debug: false,
    tileInspector: false,
    showState: false,
    moveAcceleration: 500,
    maxVelocity: [200, 1000],
    jumpDuration: 0.2,        // how long the jump velocity can be applied
    jumpVelocity: -350,
    minStopVelocity: 25,      // below this we're idling
    stopFriction: 0.95,       // amount of velocity to keep each frame
    gravity: 1200,
    frameCount: 0,
    idleAnimSpeed: 4,
    moveAnimSpeed: 0.2,
    coinAnimSpeed: 10,
    jumpFirstFrameTime: 0.1,
    fallTopAnimVelocity: 100,
    drawOffset: {},
    scale: 1,
  };
window.g = globals;

  function startLocalPlayers() {
    var localPlayers = [];

    var addLocalPlayer = function() {
      var netPlayer = new LocalNetPlayer();
      localPlayers.push({
        player: g_playerManager.startPlayer(netPlayer, "Player" + (localPlayers.length + 1)),
        netPlayer: netPlayer,
        leftRight: 0,
        oldLeftRight: 0,
        jump: false,
      });
    };

    var removeLocalPlayer = function(playerId) {
      if (playerId < localPlayers.length) {
        localPlayers[playerId].netPlayer.sendEvent('disconnect');
        localPlayers.splice(playerId, 1);
      }
    };

    for (var ii = 0; ii < globals.numLocalPlayers; ++ii) {
      addLocalPlayer();
    }

  }

  Misc.applyUrlSettings(globals);

  var canvas = $("playfield");
  var gl = WebGL.setupWebGL(canvas, {alpha:false}, function() {});
  g_services.spriteManager = new SpriteManager();
  g_services.particleSystemManager = new ParticleSystemManager(2);

  var resize = function() {
    if (Misc.resize(canvas)) {

    }
  };
  g_services.globals = globals;

  var createTexture = function(img) {
    var tex = Textures.loadTexture(img);
    tex.setParameter(gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    tex.setParameter(gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    tex.setParameter(gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    tex.setParameter(gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
  };

  g_services.createTexture = createTexture;
  // colorize: number of colors to make
  // slizes: number = width of all slices, array = width of each consecutive slice
  var images = {
    idle:  { url: "assets/spr_idle.png",  colorize: 32, scale: 2, slices: 16, },
    move:  { url: "assets/spr_run.png",   colorize: 32, scale: 2, slices: 16, },
    jump:  { url: "assets/spr_jump.png",  colorize: 32, scale: 2, slices: [16, 17, 17, 18, 16, 16] },
  };
        
  g_services.images = images;
  g_services.colors = [];
  var processImages = function() {

    var minVal = .4;
    var maxVal = 1.01;
    var stepSize = .1;
      
    for( var r = minVal; r <= maxVal; r += stepSize) {
        for( var g = minVal; g <= maxVal; g += stepSize) {
            for( var b = minVal; b <= maxVal; b += stepSize) {
                if ( r != g && r != b && g != b) { // Don't put in grays
                    g_services.colors.push({
                      r: Math.floor(r * 255),
                      g: Math.floor(g * 255),
                      b: Math.floor(b * 255),
                      a: 255,
                    });
                }
            };
        };
    };
      
      
    var g_wordManager = new WordManager(g_services);
    g_services.wordManager = g_wordManager;
    var g_popUpManager = new PopUpManager(g_services);
    g_services.popUpManager = g_popUpManager;
    var g_timerManager = new TimerManager(g_services);
    g_services.timerManager = g_timerManager;
      
    var resetGame = function() {
      g_services.playerManager.forEachPlayer(function(player) {
        player.reset();
      });
    };
      
    startGame();

    function startGame() {

      resetGame();
      resize();

      // Add a 2 players if there is no communication
      if (!globals.haveServer) {
        startLocalPlayers();
      }

      g_services.particleEffectManager = new ParticleEffectManager(g_services);

      var server;
      if (globals.haveServer) {
        var server = new GameServer();
        g_services.server = server;
        server.addEventListener('playerconnect', g_playerManager.startPlayer.bind(g_playerManager));
      }
      GameSupport.init(server, globals);
      GameSupport.run(globals, mainloop);
    }
  };

  ImageLoader.loadImages(images, processImages); 

  var mainloop = function() {
    resize();
    g_services.entitySystem.processEntities();

    var levelWidth = 960;
    var levelHeight = 480;
      
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.15, 0.15, 0.15, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    var xtraX = ((gl.canvas.width  - levelWidth) / 2 | 0);
    var xtraY = ((gl.canvas.height - levelHeight) / 2 | 0);
    gl.scissor(xtraX, xtraY, levelWidth, levelHeight);
    gl.enable(gl.SCISSOR_TEST);
    gl.clearColor(0.15, 0.36, 0.53, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.SCISSOR_TEST);
    gl.disable(gl.BLEND);
      
    g_services.drawSystem.processEntities();

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.blendEquation(gl.FUNC_ADD);
    g_services.spriteManager.draw();
    gl.disable(gl.BLEND);

    g_services.scoreManager.update();
  };

  var sounds = {
    coin:              { jsfx: ["square",0.0000,0.4000,0.0000,0.0240,0.4080,0.3480,20.0000,909.0000,2400.0000,0.0000,0.0000,0.0000,0.0100,0.0003,0.0000,0.2540,0.1090,0.0000,0.0000,0.0000,0.0000,0.0000,1.0000,0.0000,0.0000,0.0000,0.0000], },
    jump:              { jsfx: ["square",0.0000,0.4000,0.0000,0.1800,0.0000,0.2040,20.0000,476.0000,2400.0000,0.3360,0.0000,0.0000,0.0100,0.0003,0.0000,0.0000,0.0000,0.5000,0.0000,0.0000,0.0000,0.0000,1.0000,0.0000,0.0000,0.0000,0.0000], },
    coinland:          { jsfx: ["square",0.0000,0.4000,0.0000,0.0520,0.3870,0.1160,20.0000,1050.0000,2400.0000,0.0000,0.0000,0.0000,0.0100,0.0003,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,1.0000,0.0000,0.0000,0.0000,0.0000], },
    bonkhead:          { jsfx: ["square",0.0000,0.4000,0.0000,0.0120,0.4500,0.1140,20.0000,1218.0000,2400.0000,0.0000,0.0000,0.0000,0.0100,0.0003,0.0000,0.5140,0.2350,0.0000,0.0000,0.0000,0.0000,0.0000,1.0000,0.0000,0.0000,0.0000,0.0000], },
    land:              { jsfx: ["sine",0.0000,0.4000,0.0000,0.1960,0.0000,0.1740,20.0000,1012.0000,2400.0000,-0.7340,0.0000,0.0000,0.0100,0.0003,0.0000,0.0000,0.0000,0.3780,0.0960,0.0000,0.0000,0.0000,1.0000,0.0000,0.0000,0.0000,0.0000],  },
    scoreWord:         { jsfx:
["square",0.0000,0.4000,0.1000,0.3000,2.0010,1.0000,20.0000,440.0000,2000.0000,0.0000,0.0000,0.0000,7.9763,0.0003,0.0000,0.0000,0.1000,0.0000,0.0000,0.0000,0.0000,0.0000,1.0000,0.0000,0.0000,0.0000,0.0000], },
  };
  var audioManager = new AudioManager(sounds);
  g_services.audioManager = audioManager;
});


