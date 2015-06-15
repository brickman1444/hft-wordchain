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
        '../bower_components/hft-utils/dist/spritemanager',
        '../bower_components/hft-utils/dist/io'],
       function (
                 Misc,
                 ImageUtils,
                 SpriteManager,
                 IO) {

  var wordFontOptions = {
    font: "40px sans-serif",
    yOffset: 30,
    height: 300,
    fillStyle: "white",
  };
    
  var blanksString = "______________";
    
  var wordListURL = "assets/wordLists.json";
    
  var wordListLength = 6;
    
  var WordManager = function (services) {
    this.services = services;
    this.displayString = "";
    this.letters = 1;
      
    this.wordSprites = [];
      
    for ( var i = 0; i < wordListLength; i++ )
    {
      this.wordSprites[i] = this.services.spriteManager.createSprite();
    }
      
    this.xOrigin = 500;
    this.yOrigin = 250;
    this.yStride = 50;
      
    this.setupWordLists();
  };
    
  WordManager.prototype.setupWordLists = function()
  {
      var that = this;
      
      var onLoad = function(err, wordListsObject)
      {
          if (err)
          {
           throw err;   
          }
          
          that.wordList = wordListsObject.wordList;
          
          that.currentWordIndex = 0;
          that.currentWord = that.wordList[that.currentWordIndex];
          
          that.randomizeWordList();
      };
      
      var options = { method: 'GET', };
      
      IO.sendJSON( wordListURL, {}, onLoad, options );
  }
    
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
          //this.wordList = sampleWordList;
          this.currentWordIndex = 0;
          this.letters = 1;
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
    var displayString = upperCaseWord.substring(0, letters) + blanksString.substring(0,upperCaseWord.length - letters);
    
    var spacedString = "";
      
    for ( var i = 0; i < displayString.length; i++ )
    {
        spacedString += displayString.charAt(i) + " ";
    }
      
    return spacedString;
  }
    
  WordManager.prototype.setWordSprites = function()
  {          
      // Before current word
      for ( var i = 0; i < this.currentWordIndex; i++ )
      {
         this.displayString = this.makeDisplayWord( this.wordList[i], 100);
      
         this.makeSprite( i, this.displayString );
      }
      
      //Current word
      this.displayString = this.makeDisplayWord( this.wordList[this.currentWordIndex], this.letters);
      
      this.makeSprite( this.currentWordIndex, this.displayString );
     
      
      //After current word
      for ( var i = this.currentWordIndex + 1; i < this.wordList.length; i++ )
      {
         this.displayString = this.makeDisplayWord( this.wordList[i], 0);
      
         this.makeSprite( i, this.displayString );
      }
  };
    
  WordManager.prototype.makeSprite = function( index, wordString )
  {
        var wordImage = this.services.createTexture(
            ImageUtils.makeTextImage(wordString, wordFontOptions));
      
        this.wordSprites[index].uniforms.u_texture = wordImage;
        this.wordSprites[index].x = this.xOrigin;
        this.wordSprites[index].y = this.yOrigin + this.yStride * index;
        this.wordSprites[index].width = wordImage.img.width;
        this.wordSprites[index].height = wordImage.img.height;  
  }
  
  WordManager.prototype.advanceWordIndex = function()
  {
    this.currentWordIndex++;
      
    if ( this.currentWordIndex >= this.wordList.length )
    {
        this.randomizeWordList();
    }
      
    this.currentWord = this.wordList[this.currentWordIndex];
    this.letters = 1;
    this.setWordSprites();
  }

  return WordManager;
});

