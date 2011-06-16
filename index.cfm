<cfset Request.css = "/4c.css">
<cfmodule name="4C.screenLogin" datasource="4C" force="yes" nt_tip="no">
<cfsetting showdebugoutput="no">
<!DOCTYPE html>
<html>
  <head>
	  <meta http-equiv="x-ua-compatible" content="IE=edge">
	  <!--[if lt IE 9]> <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script> <![endif]-->
    <title>Agenditor - Alpha</title>
    <link rel="stylesheet" href="css/main.css">
  </head>
  <body>
    <header>
      <h1 id="logo"></h1>
      <nav id="menu">
        <ol>
          <li>
            <a href="#!/file" class="button file">File</a>
            <ol>
            	<li><a href="#!/file/new-agenda">New Agenda</a></li>
            	<li><a href="#!/file/new-session">New Session</a></li>
            	<li><a href="#!/file/new-item">New Item</a></li>
						<li class="new-nav-group"><a href="#!/file/print">Print</a></li>
            </ol>
          </li>
          <li>
            <a href="#!/edit" class="button edit">Edit</a>
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
					<li>
						<a href="#!/help" class="button help">Help</a>
						<ol>
							 <li><a href="https://github.com/eGovPDX/Council-Agenda-App/wiki" target="_blank">Documentation</a></li>
							 <li class="new-nav-group"><a href="https://github.com/eGovPDX/Council-Agenda-App/issues/new" target="_blank">Report an Issue</a></li>
						</ol>
					</li>
					<li><img src="http://cdn2.iconfinder.com/data/icons/fugue/bonus/icons-24/printer.png" href="#!/file/print"></li>
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