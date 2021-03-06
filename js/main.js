/**
 * This file is for the main interaction with the app. References all the other plugins
 * and libraries and pulls it all together.
 */
$(function(){
  
  //GLOBAL VARS!
  var TEMPLATE_PATH = 'templates/'
  ,   BASE_URL = window.location.href.split('#!')[0]
  ,   API_PATH = 'io.cfm'
  ,   SMALL_LOADER = '<img class="small-loader" src="'+BASE_URL+'/images/small-loader.gif">';
  
  var initialLoad = 0;
  
  //NOTE: see ticket #37
  var dataStore = function(key,value){
    key = key || '';
    if(value){
      return $.data(document.body,key,value);
    }
    else{
      return $.data(document.body,key);
    }
  }
  app().permissions(function(json){
    if(json.admin == 1){
      
      var displaySidebar = function(){
        console.log('Generate sidebar...');
        app().api({
          action:'get',
          type:'agenda'
        },
        function(json){
          var agendaID
          ,   itemHTML = '';
          $('#draft-agendas,#published-agendas').empty();
          json.reverse();
          for(x in json){
            var selector = '#draft-agendas';
            if(json[x].status == 2){
              selector = '#published-agendas';
            }
            agendaID = json[x].agenda_id;
            
            var dateDisplay = json[x].created_date;
            if(json[x].sessions && json[x].sessions.length > 0){
              dateDisplay = json[x].sessions[0].start_date
            }
            
            itemHTML = $.template($('#sidebar-item-template').html(),{
              "agendaID":agendaID,
              "createdDate":formatDate(dateDisplay,"mmmm dd, yyyy")
            })
            $(selector).append(itemHTML);
            
            if(!$('#agendaNav-'+agendaID).hasClass('active')){
              $('#inner-sidebar .active').removeClass('active');
            }
            
            if(window.location.hash.indexOf('#!/agenda') > -1){
              app().makeActive($('#agendaNav-'+window.location.hash.split('/')[2]));
            }
          }
          $('#inner-sidebar li').bind('click',function(){
            if(!$(this).hasClass('active')){
              var agendaID = $(this).attr('id').split('-')[1];
              actions.display('agenda',agendaID);
            }
          });
          console.log('Sidebar generation complete');
        });
      }
      
      var displayAgenda = function(agendaID,callback){
        callback = callback || function(){};
        var sameID = true;
        app().messageBar('Loading agenda '+agendaID+' '+SMALL_LOADER).generateAgendaHTML(agendaID,function(html){
          if(html.error !== '404'){
            
            app().updateURL('agenda/'+agendaID);
            
            $('#preview').empty().append(html);
    
            //Adds space to the last session so the footer/message bar doesnt overlay the last item
            $('.session:last').css({paddingBottom:$('footer').outerHeight()+20+'px'});
            
            console.log('Content appended, ready for user interaction!');
            
            //Hides/shows relevant menu items.
            //items
            if($('.item:first').length > 0 && !$('.item:first').hasClass('no-items')){
              $('[href="#!/edit/edit-item"],[href="#!/edit/delete-item"]').parent().show();
            }
            else{
              $('[href="#!/edit/edit-item"],[href="#!/edit/delete-item"]').parent().hide();
            }
            //sessions
            if($('.session:first').length > 0){
              $('[href="#!/edit/edit-session"],[href="#!/edit/delete-session"],[href="#!/file/new-item"]').parent().show();
            }
            else{
              $('[href="#!/edit/edit-session"],[href="#!/edit/delete-session"],[href="#!/file/new-item"]').parent().hide();
            }
            
            //shows both unpublish and publish
            $('[href*="publish-agenda"]').parent().show();
            
            //Then we pick which one to hide
            if(!$('body').hasClass('published')){
              $('[href="#!/edit/unpublish-agenda"]').parent().hide();
            }
            else{
              $('[href="#!/edit/publish-agenda"]').parent().hide();
            }
            
            //Updates current items, session, and agenda ids
            if(agendaID !== dataStore('active-agenda')){
              sameID = false;
              $(window).scrollTop(0);
              dataStore('active-agenda',agendaID);
            
              app().makeActive($('.item:first:not(.no-items)'),$('#editor'));
              
              if($('.item:first:not(.no-items)').length > 0){
                dataStore('active-item',$('.item:first').attr('id').split('-')[1]);
              }
              else{
                dataStore('active-item',-1);
                
              }
              if($('.session:first').length > 0){
                dataStore('active-session',$('.session:first').attr('id').split('-')[1]);
              }
              else{
                dataStore('active-session',-1);
              }
            }
            
            // Store sessionCount for use in "Smart Dates"
            app().api({
          		"action":'get',
          		"type":'agenda',
          		"id":agendaID
          		},
          		function(json){
              sessionCount = json[0].sessions.length;
              dataStore('active-item-sessions', sessionCount);
              var nextSession = app().getNextSession(sessionCount);
              dataStore('next-session', nextSession);
              app().makeActive($('#item-'+dataStore('active-item')),$('#editor'));
              if(!$('#agendaNav-'+agendaID).hasClass('active')){
                $('#inner-sidebar .active').removeClass('active');
              }
              app().makeActive($('#agendaNav-'+agendaID)).messageBar('Finished loading agenda '+dataStore('active-agenda'));
              
              callback.call(this,$('#editor'));
              
            });
            
          }
          else{
            $.get(TEMPLATE_PATH+'404.html',function(html){
              app().modal({
                title:'Error',
                content:html,
                onLoad:function(modal){
                  modal.find('a.button').click(function(){ app().modal('close'); })
                }
              })
            })
          }
        });
      }
      
      
      
      var generateOwnersAndBureaus = function(callback){
        var completed = 0
        ,   generatedOwnerHTML
        ,   generatedBureauHTML;
        app().api({
          action:'get',
          type:'owners'
        },function(json){
          generatedOwnerHTML = '<ul id="owner-list">';
          
          for(x in json){
            generatedOwnerHTML  = generatedOwnerHTML +'<li><input type="checkbox" id="'+json[x].name.replace(/ /g,'+')+'" value="'+json[x].name+'"> <label for="'+json[x].name.replace(/ /g,'+')+'">'+json[x].name+'</label></li>'
          }
          
          generatedOwnerHTML  = generatedOwnerHTML +'</ul>';
          
          completed++;
          
          if(completed == 2){ callback.call(this,generatedOwnerHTML,generatedBureauHTML); }
        });
        
        app().api({
          action:'get',
          type:'bureaus'
        },function(json){
          generatedBureauHTML = '<ul id="bureau-list">';
          
          for(x in json){
            generatedBureauHTML = generatedBureauHTML+'<li><input type="checkbox" id="'+json[x].name.replace(/ /g,'+')+'" value="'+json[x].name+'"> <label for="'+json[x].name.replace(/ /g,'+')+'">'+json[x].name+'</label></li>'
          }
          
          generatedBureau = generatedBureauHTML+'</ul>';
          
          completed++;
          
          if(completed == 2){ callback.call(this,generatedOwnerHTML,generatedBureauHTML); }
        });
      }
      
      
      var addRemoveBureausOwners = function(what,id){
        $('#'+what+'-list li').each(function(){
            var action = 'update'
            ,   checkbox = $(this).find('[type=checkbox]')
            ,   whatPostData = {
                  action:action,
                  type:what,
                  id:id,
                  name:checkbox.val()
                };
            
            //If this item doesn't exist yet (undefined due to no "id"), and it's checked, we add it
            if(!checkbox.attr('data-item_'+what+'_id') && checkbox.is(':checked')){
              app().api(whatPostData,function(json){});
            }
            //Otherwise, set above, if the "what" existed, but it's now unchecked we delete it.
            if(checkbox.attr('data-item_'+what+'_id') && !checkbox.is(':checked')){
              whatPostData.action = "delete";
              whatPostData['item_'+what+'_id'] = checkbox.attr('data-item_'+what+'_id');
              app().api(whatPostData,function(json){});
            }
          });
      }
      
      
      displaySidebar();
      
      if(window.location.hash.indexOf('agenda/') > -1){
        displayAgenda(window.location.hash.split('/')[2]);
      }
      else{
        
        app().api({
          action:'get',
          type:'agenda'
        },function(json){
          var id = json.pop().agenda_id;
          app().updateURL('agenda/'+id)
          displayAgenda(id);
        });
      }
      
      /**
       * Agenda, session, item CRUD functions,
       */
      var actions = {
        "create"  : function(type){
          //Step 1: Grab the template file
          $.get(TEMPLATE_PATH+'new-'+type+'.html?'+new Date().getTime(),function(html){
            //Step 2: Boot up the modal
            var initModal = function(){
              app().modal({
                title: 'New '+type.capitalize(),
                //The html value is the template's html we grabbed
                content: html,
                //Once the modal is in the DOM (but not visible)...
                onLoad: function(modal){
                  
                    // Handling for Session "Smart Dates"
                  if(type=='session'){
                    modal.find('[name=datetime]').val(dataStore('next-session'));
                    //Hide the session notes on create
                    modal.find('.session-notes').remove();
                  }
                  
                  if(type=='item'){
                    //Dispositions don't need to be there for new items!
                    modal.find('.tab-1,.tab-2').hide();
                  }
                  
                  //If there are items, but not the dummy "Due to lack of an agenda there will be no meeting." item...
                  //NOTE: needs to be changed as per ticket #37
                  if($('.item').length > 0 && $('.no-items').length < 1){

                    app().api({
                      action:'get',
                      type:'item',
                      id:$('.item:last').attr('id').split('-')[1]
                    },function(json){
                      modal.find('[name=heading]').find('[value="'+json[0].heading+'"]').attr('selected','selected')
                        
                      for(b in json[0].bureaus){
                        modal.find('[value="'+json[0].bureaus[b].name+'"]').attr('checked','checked');
                      }
                      
                      for(o in json[0].owners){
                        modal.find('[value="'+json[0].owners[o].name+'"]').attr('checked','checked');
                      }
                    });
                  }

                  //Find the buttons
                  modal.find('a.button').click(function(){
                    //If they clicked cancel
                    if($(this).attr('href').indexOf('#!/edit/cancel') > -1){
                      app().modal('close');
                    }
                    //Or, if they clicked save.
                    else if($(this).attr('href').indexOf('#!/edit/save') > -1){
                      if(type == 'agenda'){
                        app().api({
                          "action":"create",
                          "type":type,
                          "title":modal.find('[name=title]').val(),
                          "footer":modal.find('[name=footer]').val()
                        },
                        function(json){
                          displaySidebar(); //Refresh the sidebar so new the new Agenda shows up
                          displayAgenda(json.agenda_id);
                          $(window).scrollTop(0);
                          app().modal('close');
                        });
                      }
                      else if(type == 'session'){                      
                        app().api({
                          "action":'create',
                          "type":type,
                          "header":modal.find('[name=header]').val(),
                          "datetime":modal.find('[name=datetime]').val(),
                          "location":modal.find('[name=location]').val(),
                          "message":modal.find('[name=empty-session]').val(),
                          "id":dataStore('active-agenda')
                        },
                        function(json){
                          displayAgenda(dataStore('active-agenda'));
                          dataStore('active-session',json.session_id);
                          app().modal('close');
                        })
                      }
                      
                      else if(type == 'item'){
                        var emergencyItem = 0;
                        
                        if(modal.find('[name=emergency-item]').is(':checked')){
                          emergencyItem = 1;
                        }
                        
                        app().api({
                          "action":"create",
                          "emergency":emergencyItem,
                          "type":type,
                          "item_number":modal.find('[name=item-number]').val(),
                          "heading":modal.find('[name=heading]').val(),
                          "topic":modal.find('[name=topic]').val(),
                          //Will need to use active session when feature req. #54 is taken care of
                          "id":$('.session:last').attr('id').split('-')[1]
                        },
                        function(json){
                          if(!json.error){
                            //Needs fix for displaying before item is done saving
                            addRemoveBureausOwners('owner',json.item_id);
                            addRemoveBureausOwners('bureau',json.item_id);
                            dataStore('active-item',json.item_id);
                            displayAgenda(dataStore('active-agenda'));
                            app().modal('close');
                          }
                          else{
                            alert('Error: '+json.error);
                          }
                        });
                        
                      }
                      
                    }
                  });
                }
              });
            }
            
            if(type == 'item'){
              generateOwnersAndBureaus(function(owners,bureaus){
                $.getJSON('io.cfm?action=getitemnumber',function(json){
                  
                  var last_item = json;
                  
                  //If the last item was blank OR its a new year
                  if(last_item.item_number_string == '' || last_item.created_date.split('-')[0] < new Date().getFullYear()){
                    last_item_number = '1';
                  }
                  //Otherwise just increment by 1
                  else{
                    //If the last item had a - in it
                    
                    if(last_item.item_number_string.toString().indexOf('-') > -1){
                      last_item_number = last_item.item_number_string.split('-')[0];
                    }
                    
                    last_item_number = parseInt(last_item.item_number_string)+1
                  }
                  html = $.template(html,{bureaus:bureaus,owners:owners,number:last_item_number});
                  initModal();
                });
              });
            }
            else {
              initModal();
            }
            
          });
        },
        "remove"  : function(type,id){
          $.get(TEMPLATE_PATH+'delete.html',function(html){
            html = $.template(html,{ type:type,id:id });
            app().modal({
              content:html,
              title:'Delete '+type.capitalize(),
              onLoad:function(modal){
                modal.find('[href^="#!/delete"]').click(function(){
                  app().api({
                    "action":"delete",
                    "type":type,
                    "id":id
                  },function(json){
                    if(type == 'agenda'){
                      var sidebarAgendaLink = $('#inner-sidebar').find('#agendaNav-'+id);
                      if(sidebarAgendaLink.prev().length > 0){
                        displayAgenda(sidebarAgendaLink.prev().attr('id').split('-')[1]);
                      }
                      else{
                        displayAgenda(sidebarAgendaLink.next().attr('id').split('-')[1]);
                      }
                      sidebarAgendaLink.remove();
                    }
                    else{
                      var newActiveItem = '';
                      if(type == 'item'){
                        if($('#item-'+id).prev('.item').length > 0){
                          newActiveItem = $('#item-'+id).prev('.item').attr('id');
                        }
                        else{
                          newActiveItem = $('#item-'+id).next('.item').attr('id');
                        }
                      }
                      displayAgenda(dataStore('active-agenda'),function(){
                        if(newActiveItem !== ''){
                          app().makeActive($('#'+newActiveItem),this);
                        }
                      });
                    }
                    app().modal('close');
                  });
                });
                
                modal.find('[href="#!/edit/cancel"]').click(function(){ app().modal('close'); });
              }
            });
          });
        },
        "update"  : function(type,id){
          app().messageBar('Opening '+type+' '+id+' '+SMALL_LOADER);
          $.get(TEMPLATE_PATH+'new-'+type+'.html',function(html){
            var initModal = function(){
              app().api({
                action:'get',
                type:type,
                id:id
              },function(json){
                app().modal({
                  content:html,
                  title:'Edit '+type.capitalize(),
                  onLoad:function(modal){
                    
                    app().messageBar('Finished loading '+type+' '+id);
                    
                    if(type == 'agenda'){
                      modal.find('[name=title]').val(json[0].title);
                      modal.find('[name=footer]').val(json[0].footer);
                      modal.find('[name=status]').val(json[0].status);
                    }
                    else if(type == 'session'){
                      modal.find('[name=datetime]').val(json[0].start_date);
                      modal.find('[name=header]').val(json[0].header);
                      modal.find('[name=location]').val(json[0].location);
                      modal.find('[name=empty-session]').val(json[0].message);
                    }
                    else if(type=='item'){

                      var ownerListCache = undefined;
                      /**
                       * If you set type to create itll grab the current owner list.
                       * if you set it to update itll use the owner list you give it
                       */
                      var addMotionForm = function(type,owners,motion_id){
                        type = type || 'create';
                        owners = owners || [];
                        motion_id = motion_id || 'NULL';
                        var appendVoteHTML = function(ownerHTML){
                          modal.find('.vote-wrapper').prepend($.template($('#item-voting-html').html(), {id:motion_id, type:type, owners:ownerHTML}));
                        }
                        
                        var loopAndAppendOwners = function(json){
                          var html = '';
                          for(o in json){
                            //Change a couple fields for motion owners
                            if(json[o].can_vote === undefined){
                              json[o].can_vote = 1;
                              json[o].name = json[o].owner;
                            }
                            if(json[o].motion_vote_id === undefined){
                              json[o].motion_vote_id = 'NULL';
                            }
                            if(json[o].can_vote !== 0){ //the Auditor would be false
                              html = html+$.template($('#single-vote-html').html(),{type:type,id:json[o].motion_vote_id,owner:json[o].name}) 
                            }
                          }
                          return html;
                        }
                        if(type == 'create'){
                          if(!ownerListCache){
                            app().api({
                              action:'get',
                              type:'owners'
                            },function(json){
                              ownerListCache = loopAndAppendOwners(json);
                              appendVoteHTML(ownerListCache);
                            }); 
                          }
                          else{
                            appendVoteHTML(ownerListCache);
                          }
                        }
                        else if(type == 'update'){
                          appendVoteHTML(loopAndAppendOwners(owners));
                        }
                      }


                      modal.find('[name=item-number]').val(json[0].item_number_string)

                      modal.find('[name=topic]').val(json[0].topic);
                      
                      modal.find('[name=heading]').find('[value="'+json[0].heading+'"]').attr('selected','selected')

                      for(b in json[0].bureaus){
                        modal.find('[value="'+json[0].bureaus[b].name+'"]').attr('checked','checked').attr('data-item_bureau_id',json[0].bureaus[b].item_bureau_id);
                      }
                      
                      for(o in json[0].owners){
                        modal.find('[value="'+json[0].owners[o].name+'"]').attr('checked','checked').attr('data-item_owner_id',json[0].owners[o].item_owner_id);
                      }
                      
                      if(json[0].emergency == 1){
                        modal.find('[name=emergency-item]').attr('checked','checked');
                      }

                      if(json[0].disposition.length > 0){
                        modal.find('[name=disposition-title]').val(json[0].disposition);
                      }

                      if(json[0].disposition_header.length > 0){
                        modal.find('[name="disposition-header"] [value="'+json[0].disposition_header+'"]').attr('selected','selected');
                      }

                      if(json[0].motions.length > 0){
                        //for(x in json[0].motions){} //app doesn't support multiple motions yet tho...
                        for(m in json[0].motions){
                          //HERE IS WHERE WE PUT THE LOOP FOR VOTING
                          console.log(json[0].motions[m].votes)
                          addMotionForm('update',json[0].motions[m].votes,json[0].motions[m].item_motion_id);

                          //ADD LOOP HERE TO GET THE DEFAULTS IN THERE

                          //Because these are being appended, we keep it at 0, or, the first element
                          var theMotionHtml = $('.motion-wrapper').eq(0);

                          theMotionHtml.find('[name="motion-text"]').val(json[0].motions[m].header);
                          theMotionHtml.find('[name="motion-type"] [value="'+json[0].motions[m].type+'"]').attr('selected','selected');
                          if(json[0].motions[m].type == 'motion'){
                            $('.motion-status-wrapper [value="'+json[0].motions[m].status+'"]').attr('selected','selected');
                            $('.motion-status-wrapper').addClass('visible');
                          }
                          var theVotes = json[0].motions[m].votes;
                          for(vv in theVotes){
                            if(theVotes[vv].vote === false) { theVotes[vv].vote = 'No'; }
                            theMotionHtml.find('select[name="vote-'+theVotes[vv].owner+'"] [value="'+theVotes[vv].vote+'"]').attr('selected','selected');
                          }
                        }
                      }
                      
                      var votingHTML = '';
                      app().api({
                        action:'get',
                        type:'owners'
                      },function(ownerjson){
                        for(x in ownerjson){
                          if(ownerjson[x].position_number !== ''){ //auditor
                            votingHTML = votingHTML+'<label>'+ownerjson[x].name+'</label><select class="owner-vote" name="'+ownerjson[x].name+'"><option value="">---</option><option value="Aye">Aye</option><option value="No">No</option><option value="Absent">Absent</option><option value="Recuse">Recuse</option><option value="Abstain">Abstain</option></select><br class="clear">';
                          }
                        }
                        modal.find('#owner-votes').append(votingHTML);

                        if(json[0].motions[0]){
                          var votes = json[0].motions[0].votes;
                          for(v in votes){
                            modal.find('[name="'+votes[v].owner+'"]').attr('data-motion_vote_id',votes[v].motion_vote_id).find('[value='+votes[v].vote+']').attr('selected','selected');
                          }
                        }
                        
                      });
                      
                      app().api({
                        action:'get',
                        type:'files',
                        id:dataStore('active-item')
                      },function(json){
                        for(x in json){
                          var itemHTML = $.template($('#item-file-list-template').html(),{ id: json[x].item_file_id, name: json[x].file_name});
                          $('#item-file-list').append(itemHTML);
                        }
                      });
                    }
                    
                    modal.find('[href="#!/newvote"]').click(function(){
                      addMotionForm();
                    });
                    
                    modal.find('[href="#!/edit/save"]').click(function(){
                      if(type == 'agenda'){
                        app().api({
                          action:'update',
                          type:type,
                          id:id,
                          title:modal.find('[name=title]').val(),
                          footer:modal.find('[name=footer]').val(),
                          status:modal.find('[name=status]').val()
                        },function(){
                          displayAgenda(dataStore('active-agenda'));
                          app().modal('close');
                        });
                      }
                      else if(type == 'session'){
                        app().api({
                          action:'update',
                          type:type,
                          id:id,
                          header:modal.find('[name=header]').val(),
                          datetime:modal.find('[name=datetime]').val(),
                          location:modal.find('[name=location]').val(),
                          message:modal.find('[name=empty-session]').val()
                        },function(){
                          displayAgenda(dataStore('active-agenda'));
                          app().modal('close');
                        });
                      }
                      else if(type == 'item'){
                        
                        var emergencyItem = 0;
                        
                        if(modal.find('[name=emergency-item]').is(':checked')){
                          emergencyItem = 1;
                        }
                        
                        addRemoveBureausOwners('owner',id);
                        addRemoveBureausOwners('bureau',id);

                        var postItemData = function(){
                          app().api({
                            "action":'update',
                            "type":type,
                            "id":id,
                            "disposition":modal.find('[name=disposition-title]').val(),
                            "disposition_header": modal.find('[name=disposition-header]').val(),
                            "emergency":emergencyItem,
                            "heading":modal.find('[name=heading]').val(),
                            "topic":modal.find('[name=topic]').val(),
                            "item_number":modal.find('[name=item-number]').val()
                          },function(json){
                            displayAgenda(dataStore('active-agenda'));
                            app().modal('close');
                          });
                        }

                        //Dispositions shouldnt be in motions (disposition header should be out side of it)
                        var votesProcessed = 0
                        ,   motionsProcessed = 0;
                        if($('[data-motion-id]').length < 1){
                          postItemData();
                        }
                        else{
                          $('[data-motion-id]').each(function(i){

                            var motionAction = 'create'
                            ,   motionId = id
                            ,   motionEle = $(this);

                            if($(this).attr('data-motion-type') == 'update'){
                              motionAction = 'update';
                              motionId = $(this).attr('data-motion-id');
                            }

                            app().api({
                              action:motionAction,
                              type:'motion',
                              id:motionId,
                              header:$(this).find('[name=motion-text]').val(),
                              motion_type:$(this).find('[name=motion-type]').val(),
                              status:$(this).find('[name=motion-status]').val()
                            },function(json){
                              motionsProcessed++;
                              motionEle.find('.owner-votes select:not([name="all-votes"])').each(function(){

                                var voteAction = 'create'
                                ,   voteId = json.item_motion_id;

                                if($(this).attr('data-vote-type') == 'update'){
                                  voteAction = 'update';
                                  voteId = $(this).attr('data-vote-id');
                                }
                                app().api({
                                  action:voteAction,
                                  type:'vote',
                                  id:voteId,
                                  owner:$(this).attr('name').split('-')[1],
                                  vote:$(this).val()
                                },function(){
                                  votesProcessed++;
                                  if(votesProcessed == ($('.motion-wrapper [name^="vote-"]').length)){
                                    postItemData();
                                  }
                                });
                              });
                            });
                          });
                        }
                      }
                    });
                    
                    modal.find('[href="#!/edit/cancel"]').click(function(){ app().modal('close'); });
                  }
                });
              });
            }
            if(type == 'item'){
              generateOwnersAndBureaus(function(owners,bureaus){
                html = $.template(html,{bureaus:bureaus,owners:owners});
                initModal();
              });
            }
            else {
              initModal();
            }
          });
        },
        "display" : function(type, id){
          id = id || 0;
          if(type == 'agenda'){
            displayAgenda(id);
          }
        }
      }
      /**
       * Add right click menu
       * $.rightClick([
       *  {
       *    on:'.item',
       *    action: function(){}
       *    ...
       *  }
       * ],callback())
       */
      
      /**
       * Makes the selected item "active"
       */
      $('body').delegate('.item','click',function(){
        if(!$(this).hasClass('no-items')){
          dataStore('active-item',$(this).attr('id').split('-')[1]);
        }
        else{
          dataStore('active-item',-1);
        }
        dataStore('active-session',$(this).closest('.session').attr('id').split('-')[1]);
        app().makeActive($(this),$('#editor'));
      });
      
      
      $('body').delegate('select.motion-type','change',function(){
        if($(this).val() == 'motion'){
          $(this).parent().parent().find('.motion-status-wrapper').addClass('visible');
        }
        else{
          $(this).parent().parent().find('.motion-status-wrapper').removeClass('visible');
        }
      });
      
      
      $('body').delegate('[name=all-votes]','change',function(){
        $(this).parent().find('select[name^="vote-"]').find('option[value="'+$(this).val()+'"]').attr('selected','selected');
      });
      

      $('body').delegate('[href="#!/removevote"]', 'click', function(){
        $this = $(this);
        if($this.parent().attr('data-motion-type') == 'update'){
          if(confirm("Are you sure you want to delete this motion?\nAll votes within this motion will also be deleted!")){
            app().api({
              type:'motion',
              action:'delete',
              id:$this.parent().attr('data-motion-id')
            },function(){
              $this.parent().remove();
            });
          }
        }
        else{
          $this.parent().remove();
        }
      });

      /**
       * When a user clicks on a menu item in File > New X this runs which
       * splits the new-X and grabs what it is, which would be agenda, session, etc
       * Then, closes the menu
       */
      $('[href^="#!/file/new-"]').click(function(){
        actions.create($(this).attr('href').split('-')[1]);
        app().actionMenu('close');
        return false;
      });
      
      /**
       * When a user clicks on a menu item in Edit > Delete X this runs which
       * splits the delete-X and grabs what it is, which would be agenda, session, etc
       * Then, closes the menu
       */
      $('[href^="#!/edit/delete-"]').click(function(){
        var type = $(this).attr('href').split('-')[1];
        if(dataStore('active-'+type) !== -1){
          actions.remove(type,dataStore('active-'+type));
        }
        app().actionMenu('close');
        return false;
      });
      
      /**
       * When a user clicks on a menu item in File > New X this runs which
       * splits the new-X and grabs what it is, which would be agenda, session, etc
       * Then, closes the menu
       */
      $('[href^="#!/edit/edit-"]').click(function(){
        var type = $(this).attr('href').split('-')[1];
          console.log(type);
          console.log(dataStore('active-'+type))
        if(dataStore('active-'+type) !== -1){
          actions.update(type,dataStore('active-'+type));
        }
        app().actionMenu('close');
        return false;
      });
      
      /**
       * When a user click on File > Print it will open a popup and send the print command
       */
      $('[href^="#!/file/print"]').click(function(){
        app().printAgenda(dataStore('active-agenda'));
      });
      
      $('[href="#!/councilconnect/about"]').click(function(){
        app().messageBar('Getting build information '+SMALL_LOADER);
        $.get(TEMPLATE_PATH+'about.html',function(html){
          $.getJSON('https://github.com/api/v2/json/commits/list/egovpdx/council-agenda-app/master?callback=?',function(json){
            app().messageBar('Finished loading build information');
            var newHTML = $.template(html,{
              name:json.commits[0].committer.name,
              sha:json.commits[0].id,
              url:json.commits[0].url,
              date:dateFormat(json.commits[0].committed_date.split('T')[0].replace(/-/g,'/'),dateFormat.masks.fullDate)
            });
            app().modal({
              title:'About CouncilConnect',
              content:newHTML,
              onLoad:function(modal){ modal.find('.button').click(function(){ app().modal('close'); }); }
            })
          });
        });
      });
      
      /**
       * Allows you to double click on an item to edit it
       */
      $('body').delegate('.item','dblclick',function(){
        if(!$(this).hasClass('no-items')){
          actions.update('item',dataStore('active-item'));
        }
        else{
          actions.update('session',dataStore('active-session'));
        }
      });
      
      /**
       * The uploader
       */
      $('body').delegate('[href^="#!/edit/upload"]','click',function(){
        app().api({
          action:'create',
          type:'file',
          selector:'#item-file-upload-form',
          id:dataStore('active-item')
        },function(json){
          $('#item-file-list').empty();
          for(x in json){
            var itemHTML = $.template($('#item-file-list-template').html(),{ id: json[x].item_file_id, name: json[x].file_name})
            $('#item-file-list').append(itemHTML);
          }
        });
      });
      
      /**
       * Triggers delete of file
       */
      $('body').delegate('.delete-item','click',function(){
        var $this = $(this);
        if(confirm("Are you sure you want to delete this file?")){
          app().api({
            type:'file',
            action:'delete',
            id:$this.parent().attr('id').split('-')[1]
          },function(){
            $this.parent().fadeOut(150,function(){ $this.parent().remove() });
          });
        }
      });
      
      
      /**
       * Publish agenda
       */
      $('body').delegate('[href="#!/edit/publish-agenda"]','click',function(){
        console.log('clicked');
        app().api({
          type:'agenda',
          action:'update',
          id:dataStore('active-agenda'),
          publish:'2'
        },function(){
          displaySidebar();
          displayAgenda(dataStore('active-agenda'))
        })
      });
      
      /**
       * Unpublish agenda
       */
      $('body').delegate('[href="#!/edit/unpublish-agenda"]','click',function(){
        app().api({
          type:'agenda',
          action:'update',
          id:dataStore('active-agenda'),
          publish:'0'
        },function(){
          displaySidebar();
          displayAgenda(dataStore('active-agenda'));  
        })
      });
      
      /**
       * Show/hide sidebar
       */
      $('#inner-editor').attr('data-original-padding',$('#inner-editor').css('padding-left'));
      $('#sidebar').attr('data-visible','true')
      $('body').delegate('[href="#!/view/show-hide-sidebar"]','click',function(){
        var sidebar = $('#sidebar')
        ,   editor = $('#inner-editor');
        if(sidebar.attr('data-visible') == 'true'){
          sidebar.attr('data-visible','false').animate({left:'-'+sidebar.outerWidth()+'px'},250);
          editor.animate({paddingLeft:'0'},250)
          $(this).text('Show Sidebar');
        }
        else{
          sidebar.attr('data-visible','true').animate({left:'0px'},250);
          editor.animate({paddingLeft:editor.attr('data-original-padding')},250);
          $(this).text('Hide Sidebar');
        }
      });
      
      /**
       * Simple URL bookmarking function. If the hash is changed (like, going back/forward, entering in a URL manually, etc)
       * First checks for a hash containing agenda, if so, checks that the ID following isnt blank then lastly checks
       * to make sure the current agenda displayed isn't the same as the one in the URL
       *
       * Needs to be migrated to my script eventually...
       */
      window.onhashchange = function(){
        url = window.location.href;
        if(url.indexOf('#!/agenda/') > -1){
          if(url.split('#!/agenda/')[1] !== '' && url.split('#!/agenda/')[1] !== dataStore('active-agenda')){
            displayAgenda(url.split('#!/agenda/')[1]);
          }
        }
      }
      
      
      /**
       * Here are all the key commands
       */
      
      var isInView = function(elem){
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();
    
        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).height();
        
        //Completely outside
        //return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom));
        
        //Partially outside
        return ((docViewTop < elemTop) && (docViewBottom > elemBottom));
      }
      
      //kbs=keyboardshortcut
      var kbs = {
        create:'alt+shit+',
        update:'ctrl+alt+shift+'
      }
      
      //alt+shift commands == NEW
      $(document)
      .jkey('ctrl+shift+a',function(){
        actions.create('agenda');
      })
      .jkey('ctrl+shift+s',function(){
        actions.create('session');
      })
      .jkey('ctrl+shift+i',function(){
        actions.create('item');
      })
      //ctrl+shift commands == EDIT
      .jkey('alt+shift+a',function(){
        actions.update('agenda',dataStore('active-agenda'));
      })
      .jkey('alt+shift+s',function(){
        actions.update('session',dataStore('active-session'));
      })
      .jkey('alt+shift+i',function(){
        actions.update('item',dataStore('active-item'));
      })
      .jkey('up,down',function(key){
        if(key == 'down'){
          if($('.item.active').next('.item').length > 0 || $('.item.active').parent().next('.session').find('.item:first').length > 0){
            if($('.item.active').next('.item').length > 0){
              app().makeActive($('.item.active').next('.item'),$('#editor'));
            }
            else{
              app().makeActive($('.item.active').parent().next('.session').find('.item:first'));
            }
            if(!isInView('.item.active')){
              $("html,body").animate({scrollTop:$('.item.active').offset().top-250+'px'},200);
            }
          }
        }
        else{
          if($('.item.active').prev('.item').length > 0 || $('.item.active').parent().prev('.session').find('.item:last').length){
            if($('.item.active').prev('.item').length > 0){
              app().makeActive($('.item.active').prev('.item'),$('#editor'));
            }
            else{
              app().makeActive($('.item.active').parent().prev('.session').find('.item:last'));
            }
            if(!isInView('.item.active')){
              $("html,body").animate({scrollTop:$('.item.active').offset().top-350+'px'},200);
            }
          }
        }
        dataStore('active-item',$('.item.active').attr('id').split('-')[1]);
        dataStore('active-session',$('.item.active').closest('.session').attr('id').split('-')[1]);
      })
      .jkey('enter',true,function(){
        if($('#modal-wrapper').length == 0){ //If the modal isn't open (modal, on enter, saves and closes)
          actions.update('item',dataStore('active-item'));
        }
      })
      .jkey('ctrl+down',true,function(){
        if($('#sidebar .active').next().length > 0){
          actions.display('agenda',$('#sidebar .active').next().attr('id').split('-')[1]);
        }
      })
      .jkey('ctrl+up',true,function(){
        if($('#sidebar .active').prev().length > 0){
          actions.display('agenda',$('#sidebar .active').prev().attr('id').split('-')[1]);
        }
      });
      
    }
    else{ //If you don't have creds to the app...
      $.get(TEMPLATE_PATH+'login.html',function(html){
        app().modal({
          title:'Login',
          content:html,
          onLoad:function(modal){
            setTimeout(function(){
              window.location = 'http://dev.portlandonline.com?login=1&c=53490';
            },2000)
          }
        });
      });
    }
  });
  
});