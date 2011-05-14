/**
 * jQuery.labelify - Display in-textbox hints
 * Stuart Langridge, http://www.kryogenix.org/
 * Released into the public domain
 * Date: 25 June 2008
 * Last update: 08 September 2008
 * @author Stuart Langridge
 * @author Garrett LeSage
 * @version 2.0
 */

/**
 * Defaults to taking the in-field label from the field's title attribute
 * @example $("input").labelify();
 * @param {object|string} [settings] optional parameters to pass
 * @config {string} [text] "title" to use the field's title attribute (default),
 *                         "label" to use its <label> (for="fieldid" must be specified)
 * @config {string} [labeledClass] class applied to the field when it has label text
 *
 * @example $('input').labelify('hasLabel'); // return true if the field has a label
 */

/*
 *
 * Copyright (c) 2010 C. F., Wong (<a href="http://cloudgen.w0ng.hk">Cloudgen Examplet Store</a>)
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 */
(function($,len,createRange,duplicate){
	$.fn.caret=function(options,opt2){
		var start,end,t=this[0],browser=$.browser.msie;
		if(typeof options==="object" && typeof options.start==="number" && typeof options.end==="number") {
			start=options.start;
			end=options.end;
		} else if(typeof options==="number" && typeof opt2==="number"){
			start=options;
			end=opt2;
		} else if(typeof options==="string"){
			if((start=t.value.indexOf(options))>-1) end=start+options[len];
			else start=null;
		} else if(Object.prototype.toString.call(options)==="[object RegExp]"){
			var re=options.exec(t.value);
			if(re != null) {
				start=re.index;
				end=start+re[0][len];
			}
		}
		if(typeof start!="undefined"){
			if(browser){
				var selRange = this[0].createTextRange();
				selRange.collapse(true);
				selRange.moveStart('character', start);
				selRange.moveEnd('character', end-start);
				selRange.select();
			} else {
				this[0].selectionStart=start;
				this[0].selectionEnd=end;
			}
			this[0].focus();
			return this
		} else {
			// Modification as suggested by Андрей Юткин
           if(browser){
                if (this[0].tagName.toLowerCase() != "textarea") {
                    var val = this.val(),
					selection=document.selection,
                    range = selection[createRange]()[duplicate]();
                    range.moveEnd("character", val[len]);
                    var s = (range.text == "" ? val[len]:val.lastIndexOf(range.text));
                    range = selection[createRange]()[duplicate]();
                    range.moveStart("character", -val[len]);
                    var e = range.text[len];
                } else {
                    var range = selection[createRange](),
                    stored_range = range[duplicate]();
                    stored_range.moveToElementText(this[0]);
                    stored_range.setEndPsoint('EndToEnd', range);
                    var s = stored_range.text[len] - range.text[len],
                    e = s + range.text[len]
                }
			// End of Modification
            } else {
				var s=t.selectionStart,
					e=t.selectionEnd;
			}
			var te=t.value.substring(s,e);
			return {start:s,end:e,text:te,replace:function(st){
				return t.value.substring(0,s)+st+t.value.substring(e,t.value[len])
			}}
		}
	}
})(jQuery,"length","createRange","duplicate");


jQuery.fn.labelify = function(settings) {
  // if the element has a label, return true when 'hasLabel' is passed as an arg
  if (typeof settings === 'string' && settings === 'hasLabel') {
    return $(this).data('hasLabel');
  }

  settings = jQuery.extend({
    text: 'title',
    labeledClass: ''
  }, settings);

  // Compatibility with version 1.3 and prior (double-ls)
  if (settings.labelledClass) { settings.labeledClass = settings.labelledClass; }

  var showLabel, hideLabel,
      lookups, lookup,
      $labelified_elements;

  lookups = {
    title: function(input) {
      return $(input).attr('title');
    },
    label: function(input) {
      return $("label[for=" + input.id +"]").text();
    }
  };

  $labelified_elements = $(this);

  showLabel = function(el){
    el.value = $(el).data("label");
    $(el).addClass(settings.labeledClass).data('hasLabel', true);
  };
  hideLabel = function(el){
    el.value = el.defaultValue;
    $(el).removeClass(settings.labeledClass).data('hasLabel', false);
  };

  return $(this).each(function() {
    var $item = $(this),
        removeValuesOnExit;

    if (typeof settings.text === 'string') {
      lookup = lookups[settings.text]; // what if not there?
    } else {
      lookup = settings.text; // what if not a fn?
    }

    // bail if lookup isn't a function or if it returns undefined
    if (typeof lookup !== "function" || !lookup(this)) { return; }

    if($item.attr("type")=="password"){
        $item[0].setAttribute('type','text');
        $item.data("is-password", 1)
    }

    $item.bind('focus.label',function() {
      if (this.value === $(this).data("label")) {
        $(this).caret(0,0)
        var other = this
        // TODO: This is a hack for chrome where the events are handled differently
        window.setTimeout(function(){
            $(other).caret(0,0)
        }, 100)
      }
    }).bind('blur.label',function(){
      if (this.value === this.defaultValue) {
          showLabel(this);
          if($item.data("is-password")){
             $item[0].setAttribute('type','text');
          }
      }
    }).bind('keydown', function(){
        if (this.value === $(this).data("label")) { hideLabel(this); }
        if($item.data("is-password")){
            $item[0].setAttribute('type','password');
        }
    }).bind('keyup', function(){
        if (this.value === ""){
            showLabel(this)
            $(this).caret(0,0)
            if($item.data("is-password")){
                 $item[0].setAttribute('type','text');
            }
        }
    }).data('label',lookup(this).replace(/\n/g,'')); // strip label's newlines
    
    removeValuesOnExit = function() {
      $labelified_elements.each(function(){
        if (this.value === $(this).data("label")) { hideLabel(this); }
      });
    };
    
    $item.parents("form").submit(removeValuesOnExit);
    $(window).unload(removeValuesOnExit);
    
    if (this.value !== this.defaultValue) {
      // user started typing; don't overwrite his/her text!
      return;
    }

    // set the defaults
    showLabel(this);
  });
};