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
    
  var sampleWordList = [ "Hold", "Fast", "Food", "Truck", "Stop", "Light"];
    
  var wordListLength = 6;
    
  var WordManager = function (services) {
    this.services = services;
    this.displayString = "";
    this.letters = 0;
      
    this.wordList = sampleWordList;
    this.currentWord = this.wordList[0];
      
    this.wordSprites = [];
      
    for ( var i = 0; i < wordListLength; i++ )
    {
      this.wordSprites[i] = this.services.spriteManager.createSprite();
    }
      
    this.randomizeWordList();
      
    this.setWordSprites();
  };
    
  WordManager.prototype.getNumBlanks = function()
  {
      var numBlanks = this.currentWord.length - this.letters;
      
      if ( numBlanks < 0 )
      {
        return 0;   
      }
      else
      {
       return numBlanks;   
      }
  }
    
  WordManager.prototype.randomizeWordList = function ()
  {
      //var randomIndex = Misc.randInt( this.words.length );
      //var newWord = this.words[randomIndex];
      
      //if ( newWord !== this.currentWord )
      //{
          this.wordList = sampleWordList;
          this.letters = 0;
          this.setWordSprites();
      //}
      //else
      //{
    //      this.randomizeWord();  
      //}
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
          
        if ( this.letters >= this.currentWord.length )
        {
           this.letters = this.currentWord.length - 1;   
        }
          
        this.setWordSprites();
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
    
  WordManager.prototype.setWordSprites = function()
  {            
      var xOrigin = 500;
      var yOrigin = 250;
      var yStride = 50;
      
      for ( var i = 0; i < this.wordList.length; i++ )
      {
         this.displayString = this.makeDisplayWord( this.currentWord, this.letters);
      
         var wordImage = this.services.createTexture(
            ImageUtils.makeTextImage(this.displayString, wordFontOptions));
      
        this.wordSprites[i].uniforms.u_texture = wordImage;
        this.wordSprites[i].x = xOrigin;
        this.wordSprites[i].y = yOrigin + yStride * i;
        this.wordSprites[i].width = wordImage.img.width;
        this.wordSprites[i].height = wordImage.img.height;  
      }
  };

  return WordManager;
});

