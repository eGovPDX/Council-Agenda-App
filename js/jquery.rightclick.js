/*
	Copyright (c) 2011 Oscar Godson, OscarGodson.com
	
	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the
	"Software"), to deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to
	permit persons to whom the Software is furnished to do so, subject to
	the following conditions:
	
	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
	LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
	OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function($){
	$.fn.rightClickMenu = function(items,onClick) {
		return this.each(function() {
      $this.bind('contextmenu',function(e){
        var $this = $(this);
        //When 
        onClick.call($this);
        
        //First of all... if there is a rightClickMenu already remove it.
        $('.rightClickMenu').remove();
        
        var $list = $('<ol class="rightClickMenu"></ol>');
        
        
        var itemDefaults = {
          icon:'',
          title:'',
          action:function(){},
          startSection:false
        }
        for(var x = 0; items[x];x++){
          (function(index) {
            
            var itemSettings = $.extend({},itemDefaults,items[index]);
            if(itemSettings.icon == ''){
            }
            else{
              itemSettings.icon = '<img width="16" src='+itemSettings.icon+'>';
            }
            $list.append('<li class="rightClickMenuOption'+index+'">'+itemSettings.icon+itemSettings.title+'</li>')
              .find('.rightClickMenuOption'+index)
                .bind('click',function(){
                  itemSettings.action.call($this);
                });
          }(x));
        }
        $list.css({
          'position':'absolute',
          'left':e.pageX,
          'top':e.pageY,
          'zIndex':'1000'
        }).prependTo('body');
        return false;
      });
      //Preload the images...
			/*
      for(var x = 0; items[x];x++){
        $('body').append('<img style="display:none;width:0px;height:0px;" src="'+items[x].icon+'">');
      }
			*/
		});
	};
})(jQuery);
$('body').live('click',function(){
  if($('.rightClickMenu').length > 0){
    $('.rightClickMenu').remove();
  }
});