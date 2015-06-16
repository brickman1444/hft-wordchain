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
          
          that.wordLists = wordListsObject.wordLists;
          
          that.randomizeWordList();
      };
      
      var options = { method: 'GET', };
      
      IO.sendJSON( wordListURL, {}, onLoad, options );
  }
    
  WordManager.prototype.getNumBlanks = function()
  {
      if ( this.isTop )
      {
          var numBlanks = this.currentTopWord.length - this.topLetters;
      }
      else
      {
          var numBlanks = this.currentBottomWord.length - this.bottomLetters;
      }
      
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
      var that = this;
      
      function chooseNewList()
      {
         var randomIndex = Misc.randInt( wordListLength );
         var newWordList = that.wordLists[randomIndex];
          
         if ( newWordList != that.currentWordList )
         {
            that.currentWordList = newWordList;   
         }
         else
         {
            chooseNewList();   
         }
      };
      
      chooseNewList();
      
      this.currentTopWordIndex = 1;
      this.currentTopWord = this.currentWordList[this.currentTopWordIndex];
      
      this.currentBottomWordIndex = wordListLength - 2;
      this.currentBottomWord = this.currentWordList[this.currentBottomWordIndex];
      
      this.topLetters = 0;
      this.bottomLetters = 0;
      
      this.setWordSprites();
  };
    
  WordManager.prototype.checkWord = function( word ) 
  {
      if ( this.isTop )
      {
          return word.toLowerCase() == this.currentTopWord.toLowerCase();
      }
      else
      {
          return word.toLowerCase() == this.currentBottomWord.toLowerCase();
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
      // Before top word
      for ( var i = 0; i < this.currentTopWordIndex; i++ )
      {
         this.displayString = this.makeDisplayWord( this.currentWordList[i], 100);
      
         this.makeSprite( i, this.displayString );
      }
      
      //top word
      this.displayString = this.makeDisplayWord( this.currentTopWord, this.topLetters);
      
      this.makeSprite( this.currentTopWordIndex, this.displayString );
     
      
      // middle blank words
      for ( var i = this.currentTopWordIndex + 1; i < this.currentBottomWordIndex; i++ )
      {
         this.displayString = this.makeDisplayWord( this.currentWordList[i], 0);
      
         this.makeSprite( i, this.displayString );
      }
      
      // bottom word
      this.displayString = this.makeDisplayWord( this.currentBottomWord, this.bottomLetters);
      
      this.makeSprite( this.currentBottomWordIndex, this.displayString );
      
      // after bottom word
      for ( var i = this.currentBottomWordIndex + 1; i < wordListLength; i++ )
      {
         this.displayString = this.makeDisplayWord( this.currentWordList[i], 100);
      
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
    if ( this.isTop )
    {
        this.currentTopWordIndex++;
        this.currentTopWord = this.currentWordList[this.currentTopWordIndex];
        this.topLetters = 0;
    }
    else
    {
        this.currentBottomWordIndex--;
        this.currentBottomWord = this.currentWordList[this.currentBottomWordIndex];
        this.bottomLetters = 0;
    }
      
    if ( this.currentBottomWordIndex < this.currentTopWordIndex )
    {
        this.randomizeWordList();   
    }
     
    this.setWordSprites();
  }
  
  WordManager.prototype.setTop = function()
  {
    this.isTop = true;  
  };
    
  WordManager.prototype.setBottom = function()
  {
    this.isTop = false;  
  };
    
  WordManager.prototype.giveLetter = function() {
    if ( this.isTop )
    {
        this.topLetters++;

        if ( this.topLetters >= this.currentTopWord.length )
        {
           this.topLetters = this.currentTopWord.length - 1;   
        }
    }
    else
    {
        this.bottomLetters++;

        if ( this.bottomLetters >= this.currentBottomWord.length )
        {
           this.bottomLetters = this.currentBottomWord.length - 1;   
        }
    }
      
    this.setWordSprites();
  };

  return WordManager;
});

