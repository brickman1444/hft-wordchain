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

define( [
        'hft/misc/misc',
        '../bower_components/hft-utils/dist/imageutils',
        '../bower_components/hft-utils/dist/spritemanager'],
       function (
                 Misc,
                 ImageUtils,
                 SpriteManager) {

  var wordFontOptions = {
    font: "40px sans-serif",
    yOffset: 30,
    height: 300,
    fillStyle: "white",
  };
    
  var blanksString = "______________";
    
  var WordManager = function (services) {
    this.services = services;
    this.currentWord = "Invalid";
    this.displayString = "";
    this.letters = 0;
      
    this.words = ["turtle", "egg", "box", "cat"];
      
    this.currentWordSprite = this.services.spriteManager.createSprite();
      
    this.randomizeWord();
      
    this.setWordSprite();
  };
    
  WordManager.prototype.randomizeWord = function ()
  {
      var randomIndex = Misc.randInt( this.words.length );
      var newWord = this.words[randomIndex];
      
      if ( newWord !== this.currentWord )
      {
          this.currentWord = newWord;
          this.letters = 0;
          this.setWordSprite();
      }
      else
      {
          this.randomizeWord();  
      }
  };
    
  WordManager.prototype.checkWord = function( word ) 
  {
      if (word.toLowerCase() == this.currentWord.toLowerCase())
      {
        return true;   
      }
      else
      {
        this.letters++;
        this.setWordSprite();
          return false;
      }
  };
    
  WordManager.prototype.makeDisplayWord = function(word,letters)
  {
    var upperCaseWord = word.toUpperCase();
    var displayString = upperCaseWord.substring(0, this.letters) + blanksString.substring(0,upperCaseWord.length - this.letters);
    
    var spacedString = "";
      
    for ( var i = 0; i < displayString.length; i++ )
    {
        spacedString += displayString.charAt(i) + " ";
    }
      
    return spacedString;
  }
    
  WordManager.prototype.setWordSprite = function()
  {      
    this.displayString = this.makeDisplayWord( this.currentWord, this.letters);
      
    this.currentWordImage = this.services.createTexture(
            ImageUtils.makeTextImage(this.displayString, wordFontOptions));
      
    this.currentWordSprite.uniforms.u_texture = this.currentWordImage;
    this.currentWordSprite.x = 500;
    this.currentWordSprite.y = 250;
    this.currentWordSprite.width = this.currentWordImage.img.width;
    this.currentWordSprite.height = this.currentWordImage.img.height;
  };

  return WordManager;
});

