/**
 * This file/library contains all the functions to modify and work with the app.
 * Contains the following functions
 *
 * resetUI (resets the UI elements when calling)
 * generateAgendaHTML (generates the entire agenda HTML from an agenda ID)
 * actionMenu (opens and closes the action menu at the top of the app UI)
 * modal (the default modal for the agenda. Create and destroy modals with it)
 * api (for interacting with the API [AJAX]);
 * makeActive (makes the current item have a "active" state)
 * debug (easy way to call an alert or console log)
 */
var app = function(){
  var _settings = {
    templatePath: 'templates/'
  }
  var api = {
  /**
   * resetUI Re-renders the UI. Use in resizing, click, and load events for example.
   * @returns {object} It re-renders the UI and returns the app() object for chaining
   */
    resetUI: function(){
      $('#sidebar,#editor,#preview').css({
                height:$(window).height()-$('header').outerHeight()-$('footer').outerHeight()+500+'px'
            })
            .filter('#sidebar').css({
                top:$('header').outerHeight()+'px'
            });
      //$('#preview').jScrollPane();
      return this;
    },
    /**
     * Simple method of updating the URL. Just give it the path you want WITHOUT the hash!
     * @param {Strong} path The URL path you want
     * @returns {Object} Returns the the app() object for chaining
     */
    updateURL: function(path){
      window.location.hash = '#!/'+path;
      return this;
    },
    /**
     * Checks if a user is logged in
     */
    permissions: function(callback){
      $.getJSON('io.cfm?action=GetPermission',function(json){
        callback.call(this,json);
      });
    },
    /**
     * generateAgendaHTML generates the HTML for the Agenda based on the provided agenda_id
     * This is useful when you need to do a complete refresh as in, initial page load or a user
     * clicks on an agenda in the sidebar
     * @param {int} agenda_id The ID of the agenda you want to generate the HTML for
     * @param {function} callback What you wanna do with the HTML after it's generated
     * @returns N/A
     */
    generateAgendaHTML: function(agenda_id,callback){
      //The Math.random() and uID is to make sure IE doesn't cache anything!
      $.get('io.cfm?action=getagenda&agenda_id='+agenda_id+'&include_items=1&uID='+Math.round(Math.random()*1000),function(json){
        //Save "json" to be worked with in any sub scope
        //var json = json;
        console.log('Main JSON loaded...');
        console.log(json);
        
        // Using settings.status to set body class
        if(json[0].status == 2){
          $('body').attr('class', 'published');
        } else {
          $('body').attr('class', 'preview');
        }
        
        if(json.length > 0) {
          //Grab the agenda Template 
          $.get(_settings.templatePath+'agenda.html',function(html){
            console.log('Agenda template HTML loaded...');
            //newHTML starts with the modified agenda.html template and will be modified
            //throughout the loops below

            // Formatting the Session Date for the header
            if(json[0].sessions.length > 0){
                startDate = json[0].sessions[0].start_date;
                startDate = formatDate(startDate,"mmmm dd, yyyy");
            }
            else{
                startDate = '';
            }
            var newHTML = $.template(html,{"title":json[0].title, "date":startDate, "agenda-number":json[0].agenda_id});
            //Session loop variables
            var theSessions = json[0].sessions,
                sessionLocation = '', //Used to check if the location is different than the last session (for display only)
                sessionTime = ''; //same as the location var above. Only for display.
            console.log('Looping through the sessions...')
            
            for(x in theSessions){
              newHTML = newHTML+'<div id="session-'+theSessions[x].session_id+'" class="session">';
              if(sessionLocation !== theSessions[x].location){
                sessionLocation = theSessions[x].location;
                newHTML = newHTML+'<h2>'+sessionLocation+'</h2>';
              }
              if(sessionTime !== theSessions[x].start_date){
                sessionTime = formatDate(theSessions[x].start_date,"dddd, h:MM TT, mmmm dd, yyyy");
                newHTML = newHTML+'<h3><span>'+sessionTime+'</span></h3>';
                
              }
              
                       
              var theItems = theSessions[x].items
              ,    itemHeading = '' //Same as the session location and time vars
              ,    itemBureau = ''
              ,    itemOwner = '';
                  
              
              if(theSessions[x].items.length < 1){
                newHTML = newHTML + '<div class="item no-items">'+theSessions[x].message+'</div>';
              }
              else{ console.log('Looping through the '+theSessions[x].items.length+' items...') 
              
	              // Adding Agenda notes to the display...
	              if(theSessions[x].header != ''){
	              	newHTML += '<div class="session-notes">'+theSessions[x].header+'</div>';     
	              }
              
              }
              
              for(y in theItems){
                var e = '' //Emergency item. If 1 will be replaced with *
                ,    isLastClass = ' ';
                
                //If the upcoming item is the last of it's kind, mark the current item as the "last"
                var n = parseInt(y) + 1;
                if(typeof(theItems[n]) !== 'undefined' && theItems[n].heading !== theItems[y].heading){
                  isLastClass = ' last ';
                }
                
                newHTML = newHTML+'<div id="item-'+theItems[y].item_id+'" class="item'+isLastClass+''+theItems[y].heading.replace(/ /g,'-').replace(/---/g,'-').toLowerCase()+'">';
                
                if(theItems[y].heading !== itemHeading){
                  itemHeading = theItems[y].heading;
                  newHTML = newHTML+'<h4>'+itemHeading+'</h4>';
                }
                
                var tempOwnerHTML = '';
                if(theItems[y].owners.length > 0){
                  tempOwnerHTML = '<h5>';
                  for(z in theItems[y].owners){
                    var dash = ' - ';
                    if(z == 0){ dash = ''; }
                    tempOwnerHTML = tempOwnerHTML+dash+theItems[y].owners[z].name;
                  }
                  tempOwnerHTML = tempOwnerHTML+'</h5>';
                  
                  // Checking for owner, addding Position Number if it exists
                  if(theItems[y].owners[z].position_number !== ''){
                    tempOwnerHTML = tempOwnerHTML + '<p class=\"position\">Position No. '+theItems[y].owners[z].position_number+'</p>';
                  }
                }
                
                if(tempOwnerHTML !== itemOwner){
                  itemOwner = tempOwnerHTML;
                  newHTML = newHTML+itemOwner;
                }
                
                var tempBureauHTML = '';
                if(theItems[y].bureaus.length > 0){
                  tempBureauHTML = '<h6>';
                  for(z in theItems[y].bureaus){
                    var dash = ' - ';
                    if(z == 0){ dash = ''; }
                    tempBureauHTML = tempBureauHTML+dash+theItems[y].bureaus[z].name;
                  }
                  tempBureauHTML = tempBureauHTML+'</h6>';
                }
                
                if(tempBureauHTML !== itemBureau){
                  itemBureau = tempBureauHTML;
                  newHTML = newHTML+itemBureau;
                }
                
                if(theItems[y].emergency == 1){ e = '*'; }
                
                
                var theDisposition = '';
                if(theItems[y].motions.length > 0){
                  theDisposition = theItems[y].motions[0].title;
                }
                
                newHTML = newHTML+'<p class="item-no">'+e+theItems[y].item_id+'</p><p class="item-text">'+theItems[y].topic+'</p><p class="disposition">'+theDisposition+'</p>';
                
                // Adds voting information display                                
                if(theItems[y].motions[0] !== undefined){
                  var itemVotes = theItems[y].motions[0].votes;
                  itemVotes.blank = 0;
                  
                  //Holders...
                  itemVotes.yeaTally = 0;
                  itemVotes.yeaNames = '';
                  
                  itemVotes.nayTally = 0;
                  itemVotes.nayNames = '';

                  itemVotes.absentTally = 0;
                  itemVotes.absentNames = '';                  
                  
                  // Tally the votes...
                  for(v in itemVotes){
		            switch(itemVotes[v].vote){
		              case '-' : 
		                itemVotes.blank ++;
		                break;
		              case 'Yea' : 
		                itemVotes.yeaTally ++;
		                if(itemVotes.yeaTally > 1){itemVotes.yeaNames += ', ';}
		                itemVotes.yeaNames += getLastName(itemVotes[v].owner);
		                break;
		              case 'Nay' :
		                itemVotes.nayTally ++;
		                if(itemVotes.nayTally > 1){itemVotes.nayNames += ', ';}
  		                itemVotes.nayNames += getLastName(itemVotes[v].owner);
		                break;
		              case 'Absent' : 
		                itemVotes.absentTally ++;
		                if(itemVotes.absentTally > 1){itemVotes.absentNames += ', ';}
   		                itemVotes.absentNames += getLastName(itemVotes[v].owner);
		                break;
		            }

                  }
                  
                  // Display votes if less than 5 records are blank.
                  if(itemVotes.blank < 5) {
                  
                    newHTML += '<div class="voting-record"><b>Votes:</b> ';
                      if(itemVotes.yeaTally > 0){ newHTML += '&nbsp;&nbsp;&nbsp;<b>Yea - '+itemVotes.yeaTally + '</b> (<i>'+itemVotes.yeaNames+'</i>)'}
                      if(itemVotes.nayTally > 0){ newHTML += ',  &nbsp;&nbsp;&nbsp;<b>Nay - '+itemVotes.nayTally + '</b> (<i>'+itemVotes.nayNames+'</i>)' }
                      if(itemVotes.absentTally > 0){ newHTML += ', &nbsp;&nbsp;&nbsp;<b>Absent - '+itemVotes.absentTally + '</b> (<i>'+itemVotes.absentNames+'</i>)'}
                    
                    newHTML += '</div>'; // closes voting record
                  
                  }
                  
                } // ends loop
                
                newHTML = newHTML+'</div>'; //Closes <div class="item">
              }
              newHTML = newHTML+'</div>'; //Closes <div class="session">
            }
                                    
            console.log('Appending generated agenda HTML');
            callback.call(this,newHTML);            
          });
        }
        else{
          callback.call(this,{"error":"404"});
        }
        
      });
    },
    /**
     * actionMenu opens and closes the action menu at the top of the UI
     * @param action {string} Can be "open" or "close" and does what it sounds like. If "open" see "item" param
     * @param item {object} Is only needed for the "open" action. It gives a reference of what item is clicked on
     * @returns {object} Returns the app() object for chaining.
     */
    actionMenu: function(action,item){
      if(action == 'open'){
        $('body').bind('click.contextMenus',function() { app().actionMenu('close') });
        $(item).addClass('active').find('ol').css({display:'block',top:$(item).outerHeight()+'px'});
      }
      else if(action == 'close'){
        $('#menu .active').removeClass('active');
        $('#menu > ol > li ol').css({display:'none'});
        $('body').unbind('click.contextMenus');
      }
      return this;
    },
    /**
     * modal() simply takes care of the modals. Lots of params also make it easy.
     */
    modal: function(options,oldSettings){
       var defaults = {
        title: 'Message',
        content:'',
        animationSpeed:150,
        beforeLoad:function(){},
        onLoad:function(){},
        afterLoad:function(){},
        onClose:function(){},
        afterClose:function(){}
      }
      var settings;
      var modalWrapper = '#modal-wrapper';
      var modalOverlay = '#modal-overlay';
      if(typeof options == 'string'){
        settings = $.extend({},defaults,oldSettings);
        if(options == 'close'){
          $('*').unbind('click.modalClose');
                    $(document).unbind('keyup.modal');
                    window.onbeforeunload = null;
          settings.onClose.call(this,$(modalWrapper));
          $(modalWrapper).fadeOut(settings.animationSpeed,function(){
                        $(modalOverlay).fadeOut(settings.animationSpeed,function(){
                          $(modalWrapper+','+modalOverlay).remove();
                          settings.afterClose();
                        });
          });
        }
      }
      else{
        settings = $.extend({},defaults,options);
        settings.beforeLoad();
                window.onbeforeunload = function(){
                  return "Looks like you're in the middle of editing something.\nAre you sure you want to leave?";
                }
                //adding getTime() so that the modal isn't cached during development, REMOVE BEFORE PRODUCTION
        $.get(_settings.templatePath+'modal.html?'+new Date().getTime(),function(html){
          var newHTML = $.template(html,{"title":settings.title,"content":settings.content});
          $('body').prepend(newHTML)
            .find(modalOverlay)
              .css({
                height:$(window).height()+'px'
              })
              .fadeTo(settings.animationSpeed,0.5)
              
            .siblings(modalWrapper)
              .find('#modal-content')
                .css({
                  maxHeight:$(window).height()-125+'px'
                })
            .end()
              .css({
                left:($(window).width()/2-$(modalWrapper).outerWidth()/2)+'px',
                top:(($(window).height()/2-$(modalWrapper).outerHeight()/2)+$(window).scrollTop())+'px'
              })
              .delay(settings.animationSpeed).fadeIn(settings.animationSpeed,function(){
                $(document).bind('keyup.modal',function(e){
                  if(e.keyCode == 27){
                    $(document).unbind('keyup.modal');
                    app().modal('close');
                  }
                  else if(e.keyCode == 13){
                    if($(modalWrapper).find('input:focus,textarea:focus,select:focus').length < 1){
                        $(document).unbind('keyup.modal');
                        $(modalWrapper).find('[data-default]').click();
                    }
                  }
                });
                
                settings.afterLoad.call(this,$(modalWrapper));
                //$(this).find('#modal-content').jScrollPane();
              });
              /**
               * This adds tabbing to the modal if the developer adds a class="tab" in the modal HTML like so:
               * <div class="tab">
               *   <h2 class="tab-heading">Tab 1</h2>
               *   <p>Content in tab 1</p>
               * </div>
               *  <div class="tab">
               *    <h2 class="tab-heading">Tab 2</h2>
               *   <p>Content in tab 2</p>
               * </div>
               * 
               * .tab-heading is what is used for the tab's text, and content in the tab is shown/hidden when clicked on.
               */
              
              //Check if there are any tab elements
              if($(modalWrapper).find('.tab').length > 0){
                //Setup the tab container HTML. Tabs will be <li>s inside
                $('.modal-title',modalWrapper).after('<div class="tab-container"><ol></ol><br style="clear:both"></div>');
                //For every tab element the developer added...
                $('.tab',modalWrapper).each(function(i){
                  var isActive = '';
                  if(i == 0){
                    //If its the first one, make it the active tab
                    isActive = ' active-tab';
                    $(this).addClass(isActive);
                  }
                  else{
                    //If its not the first one, hide everything
                    $(this).css({display:'none'});
                  }
                  $('.tab-container ol').append('<li data-match="tab-'+i+'" class="tab-'+i+''+isActive+'">'+$(this).find('.tab-heading').text()+'</li>');
                  $(this).attr('data-match','tab-'+i).find('.tab-heading').remove();
                });
                $('.tab-container li').click(function(){
                  if(!$(this).hasClass('active-tab')){
                    $('.tab',modalWrapper).hide();
                    $('.active-tab',modalWrapper).removeClass('active-tab');
                    $('[data-match='+$(this).attr('data-match')+']',modalWrapper).addClass('active-tab').show();
                  }
                });
              }
            
          settings.onLoad.call(this,$(modalWrapper));
          
          $('#modal-buttons [href*=close],#modal-overlay').bind('click.modalClose',function(){app().modal('close',settings);return false;});
          
        });
      }
    },
    api: function(options,callback){
      callback = callback || function(){};
      var defaults = {
        "action"         : "get",
        "type"           : "agenda",
        "title"          : "Portland City Council Agenda",
        "id"             : "",
        "baseURL"        : "io.cfm?",
        "header"       : "THOSE PRESENT WERE: ",
        "footer"         : "",
        "datetime "      : "1-1-1111 11:11",
        "message"        : "Due to lack of an agenda there will be no meeting",
        "location"       : "City Hall - 1221 SW Fourth Avenue",
        "itemNumber"     : "",
        "emergency"      : 0,
        "topic"          : "",
        "status"         : 0,
        "name"           : "",
        "item_owner_id"  : "",
        "item_bureau_id" : "",
        "published"      : "",
        "status"         : "",
        "vote"           : "",
        "owner"          : "",
        "motion_type"    : "",
        "item_motion_id" : 0,
        "motion_vote_id" : 0
     
        
      }
      //The default url params
      var urlp = {
        "action":"",
        "delete":"no"
      }
      
      //Merge the defaults and options for the settings
      var settings = $.extend({},defaults,options);
      
      //Convert the real API lang into our lang
      if(settings.action == 'get'){
        urlp.action = 'get';
      }
      else if(settings.action == 'create' || settings.action == 'update' || settings.action == 'delete'){
        urlp.action = 'update';
      }
      
      if(settings.action == 'delete'){
        urlp['delete'] = 'true'
      }
      
      
      if(settings.type == 'agenda'){
        
        var defaultAgendaData = {
          "action"    : urlp.action+settings.type,
          "title"     : settings.title,
          "header"    : settings.header,
          "footer"    : settings.footer,
          "agenda_id" : settings.id,
          "status"    : settings.publish
        }
        
        if(defaultAgendaData.agenda_id == ""){ delete defaultAgendaData.agenda_id; }
        
        switch(settings.action){
          case 'create':
            delete defaultAgendaData.agenda_id;
            break;
          
          case 'delete':
            defaultAgendaData['delete'] = urlp['delete'];
            break;
        }
        
        var newAgendaData = {}
        ,    agendaData = $.extend({},defaultAgendaData,newAgendaData);
        
        $.ajax({
          type:'POST',
          url:settings.baseURL,
          cache:false,
          dataType:'json',
          data:agendaData,
          complete:function(json){
            callback.call(this,JSON.parse(json.responseText));
          }
        });
      }
      else if(settings.type == 'session'){
        var defaultSessionData = {
          "action"     : urlp.action+settings.type,
          "session_id" : settings.id,
          "message"    : settings.message,
          "location"   : settings.location,
          "header"     : settings.header,
          "start_date" : settings.datetime
        }
        
        if(defaultSessionData.agenda_id == ""){ delete defaultSessionData.agenda_id; }
        
        switch(settings.action){
          //If we are creating a session we dont want to use session_id, we want to use agenda as the id
          case 'create':
            delete defaultSessionData.session_id;
            defaultSessionData.agenda_id = settings.id;
            break;
          
          case 'delete':
            defaultSessionData['delete'] = urlp['delete'];
            break;
        }
        
        var newSessionData = {}
        ,    sessionData = $.extend({},defaultSessionData,newSessionData)

        $.ajax({
          type:'POST',
          url:settings.baseURL,
          cache:false,
          dataType:'json',
          data:sessionData,
          complete:function(json){
            callback.call(this,JSON.parse(json.responseText));
          }
        });
      }
      
      else if(settings.type == 'item'){
        
        var defaultItemData = {
          "action"            : urlp.action+settings.type,
          "item_id"           : settings.id,
          "item_number_string": settings.itemNumber,
          "title"             : settings.title,
          "heading"           : settings.heading,
          "emergency"         : settings.emergency,
          "topic"             : settings.topic
        }
        
        if(defaultItemData.agenda_id == ""){ delete defaultItemData.agenda_id; }
        
        switch(settings.action){
          case 'create':
            delete defaultItemData.item_id;
            defaultItemData.session_id = settings.id;
            break;
          
          case 'delete':
            defaultItemData['delete'] = urlp['delete'];
            break;
            
        }
        
        var newItemData = {}
        ,    itemData = $.extend({},defaultItemData,newItemData);
        
        
        $.ajax({
          type:'POST',
          url:settings.baseURL,
          cache:false,
          dataType:'json',
          data:itemData,
          complete:function(json){
            callback.call(this,JSON.parse(json.responseText));
          }
        });
        
      }
      
      else if(settings.type == 'motion'){
          
        var itemMotionData = {
            action:'updateitemmotion',
            type:settings.motion_type,
            status:settings.status,
            title:settings.title,
            item_id:settings.id,
            item_motion_id:settings.id
        }

        if(settings.action == 'create'){
          delete itemMotionData.item_motion_id;
        }
        else if(settings.action == 'update'){
          delete itemMotionData.item_id;
        }
        else if(settings.action == 'delete'){
          delete itemMotionData.item_id;
          itemMotionData['delete'] = 'yes';
        }
        
        var motionVoteData = [];
        
        $.ajax({
          type:'POST',
          url:settings.baseURL,
          cache:false,
          dataType:'json',
          data:itemMotionData,
          complete:function(json){
            callback.call(this,JSON.parse(json.responseText));
          }
        });
      }
      
      else if(settings.type == 'vote'){
        var itemVoteData = {
          action:'updatemotionvote',
          item_motion_id:settings.id,
          motion_vote_id:settings.id,
          vote:settings.vote,
          owner:settings.owner
        }
        
        if(settings.action == 'create'){
          delete itemVoteData.motion_vote_id;
        }
        else if(settings.action == 'update'){
          delete itemVoteData.item_motion_id;
        }
        else if(settings.action == 'delete'){
          delete itemVoteData.item_motion_id;
          itemVoteData['delete'] = 'yes';
        }
        
        
        $.ajax({
          type:'POST',
          url:settings.baseURL,
          cache:false,
          dataType:'json',
          data:itemVoteData,
          complete:function(json){
            callback.call(this,JSON.parse(json.responseText));
          }
        });
        
      }
      
      else if(settings.type == 'owner' || settings.type == 'owners'){
        var defaultOwnerData = {
          "action":urlp.action+'owner',
          "item_id":settings.id,
          "owner":settings.name,
          "item_owner_id":settings.item_owner_id
        }
        
        if(defaultOwnerData.item_owner_id == ""){ delete defaultOwnerData.item_owner_id; }
        
        if(settings.action == 'update' || settings.action == 'delete'){ defaultOwnerData['action'] = urlp.action+'itemowner'; }
        
        if(settings.action == 'delete') { defaultOwnerData['delete'] = "yes"; }
        
        $.ajax({
          type:'POST',
          url:settings.baseURL,
          cache:false,
          dataType:'json',
          data:defaultOwnerData,
          complete:function(json){
            callback.call(this,JSON.parse(json.responseText));
          }
        });
      }
      
      else if(settings.type == 'bureau' || settings.type == 'bureaus'){
        var defaultBureauData = {
          "action":urlp.action+'bureau',
          "item_id":settings.id,
          "bureau":settings.name,
          "item_bureau_id":settings.item_bureau_id
        }
        
        if(defaultBureauData.item_bureau_id == ""){ delete defaultBureauData.item_bureau_id; }
        
        if(settings.action == 'update' || settings.action == 'delete'){ defaultBureauData['action'] = urlp.action+'itembureau'; }
        
        if(settings.action == 'delete') { defaultBureauData['delete'] = "yes"; }
        
        $.ajax({
          type:'POST',
          url:settings.baseURL,
          cache:false,
          dataType:'json',
          data:defaultBureauData,
          complete:function(json){
            callback.call(this,JSON.parse(json.responseText));
          }
        });
      }
      
      else if(settings.type == 'file'){
        //FIX ACTION TO ACCEPT GET OF FILE
        var defaultFileData = {
          "action":'updateitemfile',
          "item_id":settings.id
        }
        
        if(settings.action == 'delete'){
          delete defaultFileData.item_id;
          defaultFileData.item_file_id = settings.id;
          defaultFileData['delete'] = 'yes';
          
          $.ajax({
            type:'POST',
            url:settings.baseURL,
            cache:false,
            dataType:'json',
            data:defaultFileData,
            complete:function(json){
              callback.call(this,JSON.parse(json.responseText));
            }
          });
          
        }
        else{
          $(settings.selector) //This makes sure the form is setup correctly
            .find('[type=file]').attr('name','binary')
          .end()
          //.attr('enctype','multipart/form-data')
          //.attr('method','post')
          .attr('ACTION',settings.baseURL+'action='+defaultFileData.action+'&item_id='+defaultFileData.item_id)
          .attr('target','item-file-uploader-frame')
          .append('<iframe src="" style="display:none;" id="item-file-uploader-temp-frame" name="item-file-uploader-frame">')
          .submit();
          
          
          $('[name=item-file-uploader-frame]').one('load',function(){
            app().api({
              action:'get',
              type:'item',
              id:settings.id
            },function(json){
              callback.call(this,json[0].files);
              $('#item-file-uploader-temp-frame').remove();
              $(settings.selector).find('[type=file]').val('');
            });
            
          });
        }
        
        
      }
      //Files (plural) is much different than file!
      //There is no specific way to get all files for an item without grabbing the item.
      //This is really just an alias
      else if(settings.type == 'files'){
        app().api({
          action:'get',
          type:'item',
          id:settings.id
        },function(json){
          if(typeof json[0].files == 'string'){
            callback.call(this,[]);
          }
          else{
            callback.call(this,json[0].files);
          }
        });
      }
      
      else{
        console.error(settings.type+' is not a valid type');
      }
      
    },
    /**
     * This makes the selected item have an active class and removes other isntances
     */
    makeActive: function(selector,where){
      where = where || $('#inner-sidebar');
      if(!selector.hasClass('active')){
        $(where).find('.active').removeClass('active');
        selector.addClass('active');
      }
      return this;
    },
    messageBar: function(message){
      $('#inner-footer p').empty().html(message);
      return this;
    },
    printAgenda: function(id){
      app().generateAgendaHTML(id,function(html){
        newwindow=window.open('','agendaprint','height=700,width=915');
        var tmp = newwindow.document;
        tmp.write('\
          <style>\
            @import "http://dev.portlandonline.com/councilagenda/css/resets.css";\
            @import "http://dev.portlandonline.com/councilagenda_eric_dev/css/print.css";\
          </style>\
          <div id="editor"><div id="preview">'
            +html+
          '</div></div>');
        tmp.close();
        newwindow.print();
      });
    },
    
    /**
     * Used to auto-populate "smart dates" for Add New Session
     */
    getNextSession: function(sessionCount){    

      // Set the session time.          
      switch(sessionCount){
            case 0: sessionTime = '09:30'; break;
            case 1: sessionTime = '14:00'; break;
            default: sessionTime = '14:00'; 
        }
      
      // Find the date of the next session.
      var sessionDay = 'wednesday'; // Default session day is Wednesday
      
      if(sessionCount > 1) {
        sessionDay = 'thursday'; // If there are more than 2 sessions, move to Thursday
      }      
      
        switch(sessionDay){
          case 'monday' : d = 1; break;
          case 'tuesday' : d = 2; break;
          case 'wednesday' : d = 3; break;
          case 'thursday' : d = 4; break;
          case 'friday' : d = 5; break;
          case 'saturday' : d = 6; break;
          case 'sunday' : d = 7; break;
          default : d = 3;
        }
      
      var nextSession = new Date();
      // Logic to add a week to the date if today is Wednesday
      if(nextSession.getDay() == 3 && sessionDay == 'thursday'){
        nextSession.setDate(nextSession.getDate()+7);
      }
      
        nextSession.setDate(nextSession.getDate() + (d - 1 - nextSession.getDay() + 7) % 7 + 1);
    
        // Write it to the input as a default value
        return nextSession.getMonth()+1 + '-' + nextSession.getDate() + '-' + nextSession.getFullYear()+ ' ' + sessionTime;  
      },
      
    /**
     * debug simply returns "message" in either a console.log() or alert()
     * @param message {string} What message you want to return
     * @param type {string} Can be console or alert. If console, will do a console.log() or if alert, alert();
     */
    debug: function(message,type){
      if(type == 'alert'){
        alert(message);
      }
      else{
        console.log(message)
      }
    }
  }
  return api;
}



$(function(){
/**
 * Takes a string and JSON of a list of template tags and what to replace with
 * and returns a new string with all the replacements
 **/
(function($){
  $.template = function(str,json) {
    for(x in json){
      pattern = new RegExp('{{'+x+'}}','g');
      str = str.replace(pattern,json[x]);
    }
    return str;
  };
})(jQuery);

});




String.prototype.capitalize = function(){
  return this.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
}

/**
 * Gets the size, or, "length" of an object that doesn't have the .length method. I.E. JSON feed
 * @param {obj } obj the object you want to get the size of.
 */
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

/**
 * Proxy function to make dateFormat work in IE8 and also with Coldfusion dates
 */
var formatDate = function(date,mask){
  return dateFormat(new Date(date.split('.')[0].replace(/-/g,'/')),mask);
}

/**
 * Proxy function to reutrn the last name of a council member for Voting record display
 */
var getLastName = function(string){
	fullName = string.split(" ");
	return fullName[fullName.length-1];
}