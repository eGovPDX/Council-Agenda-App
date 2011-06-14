<cfsetting showdebugoutput="no">
<!DOCTYPE html>
<html>
  <head>
    <title>Agenditor - Alpha</title>
    <link rel="stylesheet" href="css/main.css">
  </head>
  <body>
    <header>
      <h1 id="logo">PDXCouncilConnect</h1>
      <nav id="menu">
        <ol>
          <li>
            <a href="#!/file">File</a>
            <ol>
              <li><a class="test" href="#!/file/new-agenda">New Agenda</a></li>
              <li><a href="#!/file/new-session">New Session</a></li>
              <li><a href="#!/file/new-item">New Item</a></li>
							<li class="new-nav-group"><a href="#!/file/print">Print</a></li>
            </ol>
          </li>
          <li>
            <a href="#!/edit">Edit</a>
            <ol>
							 <li><a href="#!/edit/edit-item">Edit Item</a></li>
							 <li><a href="#!/edit/edit-session">Edit Session</a></li>
							 <li><a href="#!/edit/edit-agenda">Edit Agenda</a></li>
							 <li class="new-nav-group"><a href="#!/edit/delete-item">Delete Item</a></li>
							 <li><a href="#!/edit/delete-session">Delete Session</a></li>
							 <li><a href="#!/edit/delete-agenda">Delete Agenda</a></li>
							 <li class="new-nav-group"><a href="#!/menu/edit/unpublish-agenda">Unpublish Agenda</a></li>
            </ol>
          </li>
        </ol>
      </nav>
      <br class="clear">
    </header>
    <section id="sidebar">
      <div id="inner-sidebar">
        <h2>Drafts</h2>
        <ol id="draft-agendas">
          
        </ol>
        <h2>Published</h2>
        <ol id="published-agendas">
          
        </ol>
      </div>
    </section>
    <section id="editor">
      <div id="inner-editor"> <!-- extra div to get rid of the scrollbars when the outermost element is 100% of the window + padding -->
				 <div id="preview">
						<!--
						 <h1>Portland City Council Agenda</h1>
						 <h2>City Hall - 1221 SW Fourth Avenue</h2>
						 <h3>Wednesday, 09:30 AM, September 29, 2010</h3>
						 <div class="session">
							 <h4>Communications</h4>
							 <div class="item">
								 <p>Request of Michael Van Kleeck to address Council regarding the role the City can play in improving Portland's education (Communication)</p>
								 <p>Disposition:</p>
							 </div>
						 </div>
						-->
				 </div>
      </div>
    </section>
    <br class="clear">
    <footer>
      <div id="inner-footer">
        <p>Information would go down here...</p>
      </div>
    </footer>
		<script>
			/**
			 * Stuff in here is mainly for IE8
			 */
			//Fix console undefined error
			if(typeof console == 'undefined'){ var console = {log:function(){}};}
			//Fix JSON undefined error
			var JSON;if(!JSON){JSON={};}
			(function(){"use strict";function f(n){return n<10?'0'+n:n;}
			if(typeof Date.prototype.toJSON!=='function'){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+'-'+
			f(this.getUTCMonth()+1)+'-'+
			f(this.getUTCDate())+'T'+
			f(this.getUTCHours())+':'+
			f(this.getUTCMinutes())+':'+
			f(this.getUTCSeconds())+'Z':null;};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf();};}
			var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==='string'?c:'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);})+'"':'"'+string+'"';}
			function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==='object'&&typeof value.toJSON==='function'){value=value.toJSON(key);}
			if(typeof rep==='function'){value=rep.call(holder,key,value);}
			switch(typeof value){case'string':return quote(value);case'number':return isFinite(value)?String(value):'null';case'boolean':case'null':return String(value);case'object':if(!value){return'null';}
			gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==='[object Array]'){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||'null';}
			v=partial.length===0?'[]':gap?'[\n'+gap+partial.join(',\n'+gap)+'\n'+mind+']':'['+partial.join(',')+']';gap=mind;return v;}
			if(rep&&typeof rep==='object'){length=rep.length;for(i=0;i<length;i+=1){if(typeof rep[i]==='string'){k=rep[i];v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}
			v=partial.length===0?'{}':gap?'{\n'+gap+partial.join(',\n'+gap)+'\n'+mind+'}':'{'+partial.join(',')+'}';gap=mind;return v;}}
			if(typeof JSON.stringify!=='function'){JSON.stringify=function(value,replacer,space){var i;gap='';indent='';if(typeof space==='number'){for(i=0;i<space;i+=1){indent+=' ';}}else if(typeof space==='string'){indent=space;}
			rep=replacer;if(replacer&&typeof replacer!=='function'&&(typeof replacer!=='object'||typeof replacer.length!=='number')){throw new Error('JSON.stringify');}
			return str('',{'':value});};}
			if(typeof JSON.parse!=='function'){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==='object'){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v;}else{delete value[k];}}}}
			return reviver.call(holder,key,value);}
			text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return'\\u'+
			('0000'+a.charCodeAt(0).toString(16)).slice(-4);});}
			if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,''))){j=eval('('+text+')');return typeof reviver==='function'?walk({'':j},''):j;}
			throw new SyntaxError('JSON.parse');};}}());
	 </script>
		
		<!-- Below are some mini JS templates that are too small to be considered an include -->
		<script type="js-template" id="sidebar-item-template">
			<li id="agendaNav-{{agendaID}}">{{createdDate}}</li>
		</script>
		
		<script type="js-template" id="item-file-list-template">
			<li id="item-{{id}}">
				 <a target="_blank" href="io.cfm?action=getitemfile&item_file_id={{id}}">{{name}}</a> <span class="delete-item">[x]</span>
			</li>
		</script>
		
    <script src="js/jquery-1.4.4.js"></script>
    <script src="js/jquery.rightclick.js"></script>
    <script src="js/app.js"></script>
    <script src="js/ui.js"></script>
    <script src="js/main.js"></script>
  </body>
</html>