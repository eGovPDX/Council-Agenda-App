<cfset Request.css = "css/login.css">
<cfmodule name="4C.screenLogin" datasource="4C" force="yes" nt_tip="no">
<cfsetting showdebugoutput="no">
<!--- Force POL Login --->
<cf_udf_isUserAuthenticated>
<cfif not Request.udf_isUserAuthenticated()>
	<cf_polwrapper site_id="7" c="25777" force="yes" nt_tip="no"></cf_polwrapper>
</cfif>
<!DOCTYPE html>
<html>
  <head>
	  <meta http-equiv="x-ua-compatible" content="IE=edge">
	  <!--[if lt IE 9]> <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script> <![endif]-->
    <title>PDXCouncilConnect - Alpha</title>
    <link rel="stylesheet" href="css/main.css">
		<script>
			//Removes the ugly index.cfm? in the URL that doesn't need to be there. 
			if(window.location.href.indexOf('index.cfm?') > -1){
				window.location = window.location.href.replace('index.cfm?','');
			}
		</script>
  </head>
  <body>
    <header>
      <h1 id="logo"></h1>
      <nav id="menu">
        <ol>
			<li>
				<a href="#!/file" class="button file">CouncilConnect</a>
				<ol>
					<li><a href="#!/councilconnect/about">About CouncilConnect</a></li>
					<!--<li><a href="#!/councilconnect/preferences" class="new-nav-group">Preferences</a></li>-->
					<li><a href="/index.cfm?logoff=1" class="new-nav-group">Logout</a></li>
				</ol>
			</li>
          <li>
            <a href="#!/file" class="button file">File</a>
            <ol class="file menu">
				<li><a href="#!/file/new-agenda"><span class="menu-item">New Agenda</span><span class="hint">Ctrl+Shift+A</span></a></li>
				<li><a href="#!/file/new-session"><span class="menu-item">New Session</span><span class="hint">Ctrl+Shift+S</span></a></li>
				<li><a href="#!/file/new-item"><span class="menu-item">New Item</span><span class="hint">Ctrl+Shift+I</span></a></li>
				<li class="new-nav-group"><a href="#!/file/print">Print</a></li>
            </ol>
          </li>
          <li>
            <a href="#!/edit" class="button edit">Edit</a>
            <ol class="edit menu">
				<li><a href="#!/edit/edit-item"><span class="menu-item">Edit Item</span><span class="hint">Alt+Shift+I</span></a></li>
				<li><a href="#!/edit/edit-session"><span class="menu-item">Edit Session</span><span class="hint">Alt+Shift+S</span></a></li>
				<li><a href="#!/edit/edit-agenda"><span class="menu-item">Edit Agenda</span><span class="hint">Alt+Shift+A</span></a></li>
				<li class="new-nav-group"><a href="#!/edit/delete-item">Delete Item</a></li>
				<li><a href="#!/edit/delete-session">Delete Session</a></li>
				<li><a href="#!/edit/delete-agenda">Delete Agenda</a></li>
				<li class="new-nav-group"><a href="#!/edit/publish-agenda">Publish Agenda</a></li>
				<li class="new-nav-group"><a href="#!/edit/unpublish-agenda">Unpublish Agenda</a></li>
            </ol>
          </li>
			<li>
				<a href="#!/help" class="button help">Help</a>
				<ol class="help menu">
					 <li><a href="https://github.com/eGovPDX/Council-Agenda-App/wiki" target="_blank">Documentation</a></li>
					 <li class="new-nav-group"><a href="https://github.com/eGovPDX/Council-Agenda-App/issues/new" target="_blank">Report an Issue</a></li>
				</ol>
			</li>
			<li class="icon"><img src="http://cdn2.iconfinder.com/data/icons/fugue/bonus/icons-24/printer.png" href="#!/file/print"></li>
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
				 </div>
      </div>
    </section>
    <br class="clear">
    <footer>
      <div id="inner-footer">
        <p>Information would go down here...</p>
      </div>
    </footer>

		<!-- This script includes code so the rest of the code works on older browsers -->
		<script src="js/legacy-patches.js"></script>

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
		<script src="js/date.format.js"></script>
    <script src="js/app.js"></script>
    <script src="js/ui.js"></script>
    <script src="js/main.js"></script>
  </body>
</html>