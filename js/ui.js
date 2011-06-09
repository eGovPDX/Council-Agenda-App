$(function(){
  /**
   * This file has to do with anything regarding the UI!
   * It's not meant for making any AJAX calls.
   * If it has to do with how something acts when a user does an event,
   * this is probably the right file.
   * Some examples in this file are, the drop down menus, scroll bars, resizing, etc
   */
  
  /**
   * Any AJAX urls we'll prevent the URL from being modified automatically
   */
  $('[href^="#!/"]').live('click',function(){ return false; });
  
  $('#menu > ol > li').click(function(e){
    if($(this).find('ol').is(':visible')){
      app().actionMenu('close');
    }
    else{
      app().actionMenu('close').actionMenu('open',this);
      return false;
    }
  });
    
  $(window)
  .resize(function(){ app().resetUI(); })
  .load(function(){ app().resetUI(); });
});