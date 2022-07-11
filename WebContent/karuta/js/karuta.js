/* =======================================================
	Copyright 2018 - ePortfolium - Licensed under the
	Educational Community License, Version 2.0 (the "License"); you may
	not use this file except in compliance with the License. You may
	obtain a copy of the License at

	http://opensource.org/licenses/ECL-2.0

	Unless required by applicable law or agreed to in writing,
	software distributed under the License is distributed on an "AS IS"
	BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
	or implied. See the License for the specific language governing
	permissions and limitations under the License.
   ======================================================= */

//--------- for languages
//var karutaStr = new Array();

var portfolioid = null;

// -------------------
var g_userrole = "";
var g_userroles = [];
var g_portfolioid = "";
var g_complex = false;
var g_designerrole = false;
var g_rc4key = "";
var g_encrypted = false;
var g_display_type = "standard"; // default value
var g_edit = true;
var g_visible = 'hidden';
var g_welcome_edit = false;
var g_welcome_add = false;  // we don't display add a welcome page
var g_display_sidebar = true;
var g_free_toolbar_visibility = 'hidden';
//---- caches -----
var g_dashboard_models = {}; // cache for dashboard_models
var g_report_models = {}; // cache for report_models
var g_Get_Resource_caches = {};
//------------------
var g_wysihtml5_autosave = 60000; // 60 seconds
var g_block_height = 220; // block height in pixels
var g_portfolio_current = ""; // XML jQuery Object - must be set after loading xml
var g_portfolio_rootid = "";
var g_toggle_sidebar = [];
var g_current_page = "";
var g_nb_trees = 0;
var g_sum_trees = 0;
//-------------- used for designer-----
var redisplays = {};
// -------------------------------------


//==============================
function setDesignerRole(role)
//==============================
{
	USER.admin = false;
	if (role=='')
		role = 'designer';
	g_userroles[0] = role;
	fillEditBoxBody();
	$("#userrole").html(role);
	if (g_display_type=='standard'){
		var uuid = $("#page").attr('uuid');
		var html = "";
		html += "	<div id='main-row' class='row'>";
		if (g_display_sidebar) {
			html += "		<div class='col-md-3' id='sidebar'></div>";
			html += "		<div class='col-md-9' id='contenu'></div>";
		} else {
			html += "		<div class='col-md-3' id='sidebar' style='display:none'></div>";
			html += "		<div class='col-md-12' id='contenu'></div>";
		}
		html += "	</div>";
		$("#main-page").html(html);
		UIFactory["Portfolio"].displaySidebar(UICom.root,'sidebar','standard',LANGCODE,true,g_portfolio_rootid);
		$("#sidebar_"+uuid).click();
	};
	if (g_display_type=='model'){
		displayPage(UICom.rootid,1,"model",LANGCODE,g_edit);
	}
	if (g_display_type=='header'){
		if (g_userroles[0]!='designer')
			$("#rootnode").hide();
		else
			$("#rootnode").show();
		UIFactory["Portfolio"].displayNodes('header',UICom.root.node,'header',LANGCODE,g_edit);
		UIFactory["Portfolio"].displayMenu('menu','horizontal_menu',LANGCODE,g_edit,UICom.root.node);
		var uuid = $("#page").attr('uuid');
		$("#sidebar_"+uuid).click();
	};
}


//==============================
function getLanguageMenu(js)
//==============================
{
	var html = "";
	for (var i=0; i<languages.length;i++) {
		html += "			<li><a  id='lang-menu-"+languages[i]+"' onclick=\"setLanguage('"+languages[i]+"');if (elgg_installed) displaySocialNetwork();setWelcomeTitles();"+js+"\">";
		html += "<img width='20px;' src='"+karuta_url+"/karuta/img/flags/"+karutaStr[languages[i]]['flag-name']+".png'/>&nbsp;&nbsp;"+karutaStr[languages[i]]['language']+"</a></li>";
	}
	return html;
}


//==============================
function setLanguageMenu(js)
//==============================
{
	for (var i=0; i<languages.length;i++) {
		$("#lang-menu-"+languages[i]).attr("onclick","setLanguage('"+languages[i]+"');$('#navigation-bar').html(getNavBar('list',null));if (elgg_installed) displaySocialNetwork();setWelcomeTitles();"+js);
	}
}


//==============================
function getNavBar(type,portfolioid,edit)
//==============================
{
	var html = "";
	html += "<nav class='navbar navbar-default'>";
	html += "<div class='navbar-inner'>";
	html += "	<div class='container-fluid'>";
	html += "	  <div class='nav-bar-header'>";
	html += "		<button type='button' class='navbar-toggle collapsed' data-toggle='collapse' data-target='#collapse-1'>";
	html += "			<span class='icon-bar'></span><span class='icon-bar'></span><span class='icon-bar'></span><span class='icon-bar'></span>";
	html += "		</button>";
	html += "		<div class='navbar-brand'>";
	if (typeof navbar_title != 'undefined')
		html += "			<a data-toggle='dropdown' class='brand dropdown-toggle' >"+navbar_title[LANG]+"</a>";
	else
		html += "			<a data-toggle='dropdown' class='brand dropdown-toggle' ><img style='margin-bottom:4px;' src='../../karuta/img/favicon.png'/> KARUTA </a>";
	if (type!='login') {
		html += "			<ul style='padding:5px;' class='dropdown-menu versions'>";
		html += "				<li><b>Versions</b></li>";
		html += "				<li>Application : "+application_version+" (" +application_date+")</li>";
		html += "				<li>Karuta-frontend : "+karuta_version+" (" +karuta_date+")</li>";
		html += "				<li>Karuta-backend : "+karuta_backend_version+" (" +karuta_backend_date+")</li>";
		html += "				<li>Karuta-fileserver : "+karuta_fileserver_version+" (" +karuta_fileserver_date+")</li>";
		html += "			</ul>";
	}
	html += "		</div>";
	html += "	  </div>";
	//---------------------HOME - TECHNICAL SUPPORT-----------------------
	html += "		<div class='navbar-collapse collapse' id='collapse-1'>";
	html += "			<ul class='nav navbar-nav'>";
	if (type=='login') {
		html += "				<li><a href='mailto:"+technical_support+"?subject="+karutaStr[LANG]['technical_support']+" ("+appliname+")' class='navbar-icon' data-title='"+karutaStr[LANG]["button-technical-support"]+"' data-tooltip='true' data-placement='bottom'><span class='glyphicon glyphicon-envelope' data-title='"+karutaStr[LANG]["technical_support"]+"' data-tooltip='true' data-placement='bottom'></span></a></li>";
	} else {
		html += "				<li><a id='home-icon' onclick='show_list_page()' class='navbar-icon' data-title='"+karutaStr[LANG]["home"]+"' data-tooltip='true' data-placement='bottom'><span class='glyphicon glyphicon-home'></span></a></li>";
		html += "				<li><a href='javascript:displayTechSupportForm()' class='navbar-icon' data-title='"+karutaStr[LANG]["technical_support"]+"' data-tooltip='true' data-placement='bottom'><span class='glyphicon glyphicon-envelope'></span></a></li>";
	}
	html += "			</ul>";
	//-------------------LANGUAGES---------------------------displayTechSupportForm(langcode)
	if (languages.length>1) 
		if(type=="create_account") {
			html += "			<ul class='nav navbar-nav'>";
			html += "				<li class='dropdown'><a data-toggle='dropdown' class='dropdown-toggle navbar-icon' ><img id='flagimage' style='width:25px;margin-top:-5px;' src='"+karuta_url+"/karuta/img/flags/"+karutaStr[LANG]['flag-name']+".png'/>&nbsp;&nbsp;<span class='glyphicon glyphicon-triangle-bottom'></span></a>";
			html += "					<ul class='dropdown-menu'>";
			for (var i=0; i<languages.length;i++) {
				html += "			<li><a  onclick=\"setLanguage('"+languages[i]+"');$('#login').html(getInputs());\"><img width='20px;' src='"+karuta_url+"./karuta/img/flags/"+karutaStr[languages[i]]['flag-name']+".png'/>&nbsp;&nbsp;"+karutaStr[languages[i]]['language']+"</a></li>";
			}
			html += "					</ul>";
			html += "				</li>";
			html += "			</ul>";
		} else
			if(type=="login") {
				html += "			<ul class='nav navbar-nav'>";
				html += "				<li class='dropdown'><a data-toggle='dropdown' class='dropdown-toggle navbar-icon' ><img id='flagimage' style='width:25px;margin-top:-5px;' src='"+karuta_url+"/karuta/img/flags/"+karutaStr[LANG]['flag-name']+".png'/>&nbsp;&nbsp;<span class='glyphicon glyphicon-triangle-bottom'></span></a>";
				html += "					<ul class='dropdown-menu'>";
				for (var i=0; i<languages.length;i++) {
					html += "			<li><a  onclick=\"setLanguage('"+languages[i]+"');displayKarutaLogin();\"><img width='20px;' src='"+karuta_url+"/karuta/img/flags/"+karutaStr[languages[i]]['flag-name']+".png'/>&nbsp;&nbsp;"+karutaStr[languages[i]]['language']+"</a></li>";
				}
				html += "					</ul>";
				html += "				</li>";
				html += "			</ul>";
			} else {
				html += "			<ul class='nav navbar-nav'>";
				html += "				<li class='dropdown'><a data-toggle='dropdown' class='dropdown-toggle navbar-icon' ><img id='flagimage' style='width:25px;margin-top:-5px;' src='"+karuta_url+"/karuta/img/flags/"+karutaStr[LANG]['flag-name']+".png'/>&nbsp;&nbsp;<span class='glyphicon glyphicon-triangle-bottom'></span></a>";
				html += "					<ul class='dropdown-menu'>";
//				html += getLanguageMenu("fill_list_page();$('#search-portfolio-div').html(getSearch());$('#search-user-div').html(getSearchUser());");
				html += getLanguageMenu("fill_list_page();$('#navigation-bar').html(getNavBar('list',null));$('#search-portfolio-div').html(getSearch());$('#search-user-div').html(getSearchUser());");
				html += "					</ul>";
				html += "				</li>";
				html += "			</ul>";
			}		
	//-----------------ACTIONS-------------------------------
	if (type!='login' && USER!=undefined) {
		if (USER.admin || (USER.creator && !USER.limited) ) {
			html += "			<ul class='nav navbar-nav'>";
			html += "				<li>&nbsp;</li>";
			html += "				<li class='dropdown active'><a data-toggle='dropdown' class='dropdown-toggle' >Actions<span class='caret'></span></a>";
			html += "					<ul class='dropdown-menu'>";
			html += "						<li><a  onclick='show_list_page()'>"+karutaStr[LANG]['list_portfolios']+"</a></li>";
			//-----------------
			if (USER.admin) {
				if ($("#main-portfoliosgroup").length && $("#main-portfoliosgroup").html()!="")
					html += "						<li><a  onclick='show_list_portfoliosgroups()'>"+karutaStr[LANG]['list_portfoliosgroups']+"</a></li>";
				else
					html += "						<li><a  onclick='display_list_portfoliosgroups()'>"+karutaStr[LANG]['list_portfoliosgroups']+"</a></li>";
				//-----------------
				if ($("#main-user").length && $("#main-user").html()!="")
					html += "						<li><a  onclick='show_list_users()'>"+karutaStr[LANG]['list_users']+"</a></li>";
				else
					html += "						<li><a  onclick='display_list_users()'>"+karutaStr[LANG]['list_users']+"</a></li>";
				//-----------------
				if ($("#main-usersgroup").length && $("#main-usersgroup").html()!="")
					html += "						<li><a  onclick='show_list_usersgroups()'>"+karutaStr[LANG]['list_usersgroups']+"</a></li>";
				else
					html += "						<li><a  onclick='display_list_usersgroups()'>"+karutaStr[LANG]['list_usersgroups']+"</a></li>";
			}
			//-----------------
			html += "						<li><a  onclick='display_exec_batch()'>"+karutaStr[LANG]['batch']+"</a></li>";
			html += "						<li><a  onclick='display_exec_report()'>"+karutaStr[LANG]['report']+"</a></li>";
			html += "					</ul>";
			html += "				</li>";
			html += "			</ul>";
		}
		//-----------------NEW WINDOW-----------------------------------------
		if (type!='login' && USER!=undefined) {
			if (USER.admin || (USER.creator && !USER.limited) ) {
				html += "			<ul class='nav navbar-nav'>";
				html += "						<li><a href='"+window.location+"' target='_blank' class='navbar-icon' data-title='"+karutaStr[LANG]["button-new-window"]+"' data-tooltip='true' data-placement='bottom'><i class='glyphicon glyphicon-new-window'></i></a></li>";
				html += "			</ul>";
			}
		}
		//-----------------LOGOUT-----------------------------------------
		html += "			<ul class='nav navbar-nav navbar-right'>";
		html += "						<li><a onclick='logout()' class='navbar-icon' data-title='"+karutaStr[LANG]["button-disconnect"]+"' data-tooltip='true' data-placement='bottom'><span class='glyphicon glyphicon-log-out'></span></a></li>";
		html += "			</ul>";
		//-----------------USERNAME-----------------------------------------
		html += "			<ul class='nav navbar-nav navbar-right'>";
		html += "				<li class='dropdown'><a data-toggle='dropdown' class='dropdown-toggle navbar-icon' data-title='"+karutaStr[LANG]["button-change-password"]+"' data-tooltip='true' data-placement='bottom' ><span class='glyphicon glyphicon-user'></span>&nbsp;&nbsp;"+USER.firstname+" "+USER.lastname;
		html += " 					<span class='glyphicon glyphicon-triangle-bottom'></span></a>";
		html += "					<ul class='dropdown-menu pull-right'>";
		html += "						<li><a href=\"javascript:UIFactory['User'].callChangePassword()\">"+karutaStr[LANG]['change_password']+"</a></li>";
		if ((USER.creator && !USER.limited)  && !USER.admin)
			html += "						<li><a href=\"javascript:UIFactory['User'].callCreateTestUser()\">"+karutaStr[LANG]['create-test-user']+"</a></li>";
		if (USER.change_name)
			html += "						<li><a href=\"javascript:UIFactory['User'].callChangeName()\">"+karutaStr[LANG]['change_name']+"</a></li>";
		html += "					</ul>";
		html += "				</li>";
		html += "			</ul>";
	}

	//----------------------------------------------------------
	html += "			</div><!--.nav-collapse -->";
	html += "	</div>";
	html += "</div>";
	html += "</div>";
	
	html += "</nav>";
	return html;
}


//==============================
function EditBox()
//==============================
{
	var html = "";
	html += "\n<!-- ==================== Edit box ==================== -->";
	html += "\n<div id='edit-window' class='modal fade'>";
	html += "\n		<div class='modal-dialog'>";
	html += "\n		<div class='modal-content'>";
	html += "\n		<div id='edit-window-header' class='modal-header'>";
	html += "\n			<div id='edit-window-type' style='float:right'></div>";
	html += "\n			<h3 id='edit-window-title' ></h3>";
	html += "\n		</div>";
	html += "\n		<div id='edit-window-body' class='modal-body'></div>";
	html += "\n		<div class='modal-footer' id='edit-window-footer'></div>";
	html += "\n		</div>";
	html += "\n		</div>";
	html += "\n	</div>";
	html += "\n<!-- ============================================== -->";
	return html;
}


//==============================
function fillEditBoxBody()
//==============================
{
	var html = "";
	if (g_userroles[0]=='designer' || USER.admin) {
		html += "\n			<div role='tabpanel'>";
		html += "\n				<ul class='nav nav-tabs' role='tablist'>";
		html += "\n					<li role='presentation' class='active'><a href='#edit-window-body-main' aria-controls='edit-window-body-main' role='tab' data-toggle='tab'>"+karutaStr[LANG]['resource']+"</a></li>";
		html += "\n					<li role='presentation'><a href='#edit-window-body-metadata' aria-controls='edit-window-body-metadata' role='tab' data-toggle='tab'>"+karutaStr[LANG]['metadata']+"</a></li>";
		html += "\n					<li role='presentation'><a href='#edit-window-body-metadata-epm' aria-controls='edit-window-body-metadata-epm' role='tab' data-toggle='tab'>"+karutaStr[LANG]['css-styles']+"</a></li>";
		html += "\n				</ul>";
		html += "\n				<div class='tab-content'>";
		html += "\n					<div role='tabpanel' class='tab-pane active' id='edit-window-body-main' style='margin-top:10px'>";
		html += "\n						<div id='edit-window-body-resource'></div>";
		html += "\n						<div id='edit-window-body-node'></div>";
		html += "\n						<div id='edit-window-body-context'></div>";
		html += "\n					</div>";
		html += "\n					<div role='tabpanel' class='tab-pane' id='edit-window-body-metadata'></div>";
		html += "\n					<div role='tabpanel' class='tab-pane' id='edit-window-body-metadata-epm'></div>";
		html += "\n				</div>";
		html += "\n			</div>";
	}
	else {
		html += "\n					<div id='edit-window-body-resource'></div>";
		html += "\n					<div id='edit-window-body-node'></div>";
		html += "\n					<div id='edit-window-body-context'></div>";
		html += "\n					<div id='edit-window-body-metadata'></div>";
		html += "\n					<div id='edit-window-body-metadata-epm'></div>";
	}
	$('#edit-window-body').html(html);
}

//==============================
function setMessageBox(html)
//==============================
{
	html = "<span>" + html + "</span>";
	$("#message-body").html($(html));
}

//==============================
function addMessageBox(html)
//==============================
{
	html = "<span>" + html + "</span>";
	$("#message-body").add($(html));
}

//==============================
function showMessageBox()
//==============================
{
	$("#message-window").show();
}

//==============================
function hideMessageBox()
//==============================
{
	$("#message-window").hide();
}


//==================================
function getEditBox(uuid,js2) {
//==================================
	fillEditBoxBody();
	var js1 = "javascript:$('#edit-window').modal('hide')";
	if (js2!=null)
		js1 += ";"+js2;
	var footer = "<button class='btn' onclick=\""+js1+";\">"+karutaStr[LANG]['Close']+"</button>";
	$("#edit-window-footer").html($(footer));
	var html = "";
	//--------------------------
	if(UICom.structure["ui"][uuid].resource!=null) {
		try {
			html = UICom.structure["ui"][uuid].resource.getEditor();
			$("#edit-window-body-resource").html($(html));
			html = UICom.structure["ui"][uuid].getEditor();
			$("#edit-window-body-node").html($(html));
		}
		catch(e) {
			UICom.structure["ui"][uuid].resource.displayEditor("edit-window-body-resource");
			html = UICom.structure["ui"][uuid].getEditor();
			$("#edit-window-body-node").html($(html));
		}
	} else {
		if(UICom.structure["ui"][uuid].structured_resource!=null) {
			try {
				UICom.structure["ui"][uuid].structured_resource.displayEditor("edit-window-body-resource");
				html = UICom.structure["ui"][uuid].getEditor();
				$("#edit-window-body-node").html($(html));
			}
			catch(e) {
				html = UICom.structure["ui"][uuid].getEditor();
				$("#edit-window-body-node").html($(html));
			}
		} else {
			html = UICom.structure["ui"][uuid].getEditor();
			$("#edit-window-body-node").html($(html));
			if ($("#get-resource-node").length){
				var getResource = new UIFactory["Get_Resource"](UICom.structure["ui"][uuid].node,"xsi_type='nodeRes'");
				getResource.displayEditor("get-resource-node");
			}
			if ($("#get-get-resource-node").length){
				var getgetResource = new UIFactory["Get_Get_Resource"](UICom.structure["ui"][uuid].node,"xsi_type='nodeRes'");
				getgetResource.displayEditor("get-get-resource-node");
			}
		}
	}
	// ------------ context -----------------
	UIFactory["Node"].displayCommentsEditor('edit-window-body-context',UICom.structure["ui"][uuid]);
	// ------------ graphicer -----------------
	var editHtml = UIFactory["Node"].getMetadataEpmAttributesEditor(UICom.structure["ui"][uuid]);
	$("#edit-window-body-metadata-epm").html($(editHtml));
	// ------------admin and designer----------
	if (USER.admin || g_userroles[0]=='designer') {
		var editHtml = UIFactory["Node"].getMetadataAttributesEditor(UICom.structure["ui"][uuid]);
		$("#edit-window-body-metadata").html($(editHtml));
		UIFactory["Node"].displayMetadataTextsEditor(UICom.structure["ui"][uuid]);
	}
	// ------------------------------
	$(".modal-dialog").css('width','600px');
	$(".pickcolor").colorpicker();
	// ------------------------------
	$('#edit-window-body').animate({ scrollTop: 0 }, 'slow');
}


//==================================
function getEditBoxOnCallback(data,param2,param3,param4) {
//==================================
	var uuid = $("node",data).attr('id');//alertHTML(uuid);
	param2(param3,param4);
	getEditBox(uuid);
}


//==============================
function deleteButton(uuid,type,parentid,destid,callback,param1,param2)
//==============================
{
	var html = "";
	html += "\n<!-- ==================== Delete Button ==================== -->";
	html += "<span id='del-"+uuid+"' class='button glyphicon glyphicon-remove' onclick=\"confirmDel('"+uuid+"','"+type+"','"+parentid+"','"+destid+"','"+callback+"','"+param1+"','"+param2+"')\" data-title='"+karutaStr[LANG]["button-delete"]+"' data-tooltip='true' data-placement='bottom'></span>";
	return html;
}

//==============================
function DeleteBox()
//==============================
{
	var html = "";
	html += "\n<!-- ==================== Delete box ==================== -->";
	html += "\n<div id='delete-window' class='modal fade'>";
	html += "\n		<div class='modal-dialog'>";
	html += "\n			<div class='modal-content'>";
	html += "\n				<div class='modal-header'>";
	html += "\n					<div id='edit-window-type' style='float:right'></div>";
	html += "\n					<h3 id='edit-window-title' >Attention</h3>";
	html += "\n				</div>";
	html += "\n				<div id='delete-window-body' class='modal-body'>";
	html += "\n					<div id='delete-window-body-content'>";
	html += "\n					</div>";
	html += "\n				</div>";
	html += "\n				<div class='modal-footer' id='delete-window-footer'></div>";
	html += "\n			</div>";
	html += "\n		</div>";
	html += "\n</div>";
	html += "\n<!-- ============================================== -->";
	return html;
}


//==============================
function savedBox()
//==============================
{
	var html = "";
	html += "\n<!-- ==================== Saved box ==================== -->";
	html += "\n<div id='saved-window'>";
	html += "\n	<div id='saved-window-body' style='text-align:center'></div>";
	html += "\n</div>";
	html += "\n<!-- ============================================== -->";
	return html;
}

//==============================
function alertBox()
//==============================
{
	var html = "";
	html += "\n<!-- ==================== Alert box ==================== -->";
	html += "\n<div id='alert-window' class='modal fade'>";
	html += "\n		<div class='modal-dialog'>";
	html += "\n			<div class='modal-content'>";
	html += "\n				<div class='modal-header'>";
	html += "\n					<h3 id='alert-window-header' >Attention</h3>";
	html += "\n				</div>";
	html += "\n				<div id='alert-window-body' class='modal-body'>";
	html += "\n				</div>";
	html += "\n				<div id='alert-window-footer' class='modal-footer' >";
	html += "\n				</div>";
	html += "\n			</div>";
	html += "\n		</div>";
	html += "\n</div>";
	html += "\n<!-- ============================================== -->";
	return html;
}

//==============================
function messageBox()
//==============================
{
	var html = "";
	html += "\n<!-- ==================== Message box ==================== -->";
	html += "\n<div id='message-window' class='modal fade'>";
	html += "\n		<div class='modal-dialog'>";
	html += "\n			<div class='modal-content'>";
	html += "\n				<div id='message-window-body' class='modal-body'>";
	html += "\n				</div>";
	html += "\n				<div id='message-window-footer' class='modal-footer' >";
	html += "\n				</div>";
	html += "\n			</div>";
	html += "\n		</div>";
	html += "\n</div>";
	html += "\n<!-- ============================================== -->";
	return html;
}

//==============================
function imageBox()
//==============================
{
	var html = "";
	html += "\n<!-- ==================== image box ==================== -->";
	html += "\n<div id='image-window' class='modal'>";
	html += "\n			<div class='modal-content'>";
	html += "\n				<div id='image-window-body' class='modal-body'>";
	html += "\n				</div>";
	html += "\n				<div id='image-window-footer' class='modal-footer' >";
	html += "\n				</div>";
	html += "\n			</div>";
	html += "\n</div>";
	html += "\n<!-- ============================================== -->";
	return html;
}

//=======================================================================
function deleteandhidewindow(uuid,type,parentid,destid,callback,param1,param2) 
// =======================================================================
{
	$('#delete-window').modal('hide');
	$('#wait-window').modal('show');
	if (type!=null && (type=='asmStructure' || type=='asmUnit' || type=='asmUnitStructure' || type=='asmContext')) {
		UIFactory['Node'].remove(uuid,callback,param1,param2); //asm node
		if (parentid!=null) {
			parent = $("#"+parentid);
			$("#"+uuid,parent).remove();
		}
	}
	else
		if (type!=null)
			UIFactory[type].remove(uuid,parentid,destid,callback,param1,param2); // application defined type
	// ----------------------------------
	UICom.structure['tree'][uuid] = null;
	// ----------------------------------
}

//=======================================================================
function confirmSubmit(uuid,submitall) 
// =======================================================================
{
	var href = "";
	var type = "";
	try {
		type = UICom.structure.ui[uuid].resource.type;
		href = document.getElementById('file_'+uuid).href;
	}
	catch(err) {
		href = "";
	}
	if (href=="" && type!="" && type=="Document")
		alertHTML(karutaStr[LANG]["document-required"]);
	else
	{
		document.getElementById('delete-window-body').innerHTML = karutaStr[LANG]["confirm-submit"];
		var buttons = "<button class='btn' onclick=\"javascript:$('#delete-window').modal('hide');\">" + karutaStr[LANG]["Cancel"] + "</button>";
		buttons += "<button class='btn btn-danger' onclick=\"$('#delete-window').modal('hide');submit('"+uuid+"',"+submitall+")\">" + karutaStr[LANG]["button-submit"] + "</button>";
		document.getElementById('delete-window-footer').innerHTML = buttons;
		$('#delete-window').modal('show');
    }
}

//=======================================================================
function confirmDel(uuid,type,parentid,destid,callback,param1,param2) 
// =======================================================================
{
	document.getElementById('delete-window-body').innerHTML = karutaStr[LANG]["confirm-delete"];
	var buttons = "<button class='btn' onclick=\"javascript:$('#delete-window').modal('hide');\">" + karutaStr[LANG]["Cancel"] + "</button>";
	buttons += "<button class='btn btn-danger' onclick=\"javascript:deleteandhidewindow('"+uuid+"','"+type+"','"+parentid+"','"+destid+"',"+callback+",'"+param1+"','"+param2+"')\">" + karutaStr[LANG]["button-delete"] + "</button>";
	document.getElementById('delete-window-footer').innerHTML = buttons;
	$('#delete-window').modal('show');
}

//=======================================================================
function confirmDelPortfolio(uuid) 
// =======================================================================
{
	document.getElementById('delete-window-body').innerHTML = karutaStr[LANG]["confirm-delete"];
	var buttons = "<button class='btn' onclick=\"javascript:$('#delete-window').modal('hide');\">" + karutaStr[LANG]["Cancel"] + "</button>";
	buttons += "<button class='btn btn-danger' onclick=\"javascript:$('#delete-window').modal('hide');UIFactory.Portfolio.del('"+uuid+"')\">" + karutaStr[LANG]["button-delete"] + "</button>";
	document.getElementById('delete-window-footer').innerHTML = buttons;
	$('#delete-window').modal('show');
}

//=======================================================================
function confirmDelProject(uuid,projectcode) 
// =======================================================================
{
	document.getElementById('delete-window-body').innerHTML = karutaStr[LANG]["confirm-delete"];
	var buttons = "<button class='btn' onclick=\"javascript:$('#delete-window').modal('hide');\">" + karutaStr[LANG]["Cancel"] + "</button>";
	buttons += "<button class='btn btn-danger' onclick=\"javascript:$('#delete-window').modal('hide');UIFactory.Portfolio.delProject('"+uuid+"','"+projectcode+"')\">" + karutaStr[LANG]["button-delete"] + "</button>";
	document.getElementById('delete-window-footer').innerHTML = buttons;
	$('#delete-window').modal('show');
}

//=======================================================================
function confirmDelPortfolios_EmptyBin() 
// =======================================================================
{
	document.getElementById('delete-window-body').innerHTML = karutaStr[LANG]["confirm-delete"];
	var buttons = "<button class='btn' onclick=\"javascript:$('#delete-window').modal('hide');\">" + karutaStr[LANG]["Cancel"] + "</button>";
	buttons += "<button class='btn btn-danger' onclick=\"javascript:$('#delete-window').modal('hide');UIFactory.Portfolio.emptyBin()\">" + karutaStr[LANG]["button-delete"] + "</button>";
	document.getElementById('delete-window-footer').innerHTML = buttons;
	$('#delete-window').modal('show');
}

//=======================================================================
function confirmDelTemporaryUsers() 
// =======================================================================
{
	document.getElementById('delete-window-body').innerHTML = karutaStr[LANG]["confirm-delete"];
	var buttons = "<button class='btn' onclick=\"javascript:$('#delete-window').modal('hide');\">" + karutaStr[LANG]["Cancel"] + "</button>";
	buttons += "<button class='btn btn-danger' onclick=\"javascript:$('#delete-window').modal('hide');UIFactory.User.deleteTemporaryUsers()\">" + karutaStr[LANG]["button-delete"] + "</button>";
	document.getElementById('delete-window-footer').innerHTML = buttons;
	$('#delete-window').modal('show');
}


//==================================
function getURLParameter(sParam) {
//==================================
	var sPageURL = window.location.search.substring(1);
	var sURLVariables = sPageURL.split('&');
	for ( var i = 0; i < sURLVariables.length; i++) {
		var sParameterName = sURLVariables[i].split('=');
		if (sParameterName[0] == sParam) {
			return sParameterName[1];
		}
	}
}

//==================================
function displayPage(uuid,depth,type,langcode,edit) {
//==================================
	//---------------------
	if (langcode==null)
		langcode = LANGCODE;
	//---------------------
	if (g_current_page!=uuid) {
		$(window).scrollTop(0);
		g_current_page = uuid;
	}
	//---------------------
	$("#contenu").html("<div id='page' uuid='"+uuid+"'></div>");
	$('.selected').removeClass('selected');
	$("#sidebar_"+uuid).parent().addClass('selected');
	var name = $(UICom.structure['ui'][uuid].node).prop("nodeName");
	if (name == 'asmUnit' && !UICom.structure.ui[uuid].loaded) {// content is not loaded or empty
		$("#wait-window").modal('show');
		UIFactory.Node.loadNode(uuid);
	}
	if (name=='asmStructure' && !UICom.structure.ui[uuid].loaded) {// content is not loaded or empty
		$("#wait-window").modal('show');
		UIFactory.Node.loadStructure(uuid);
	}
	if (depth==null)
		depth=100;
	if (name=='asmRoot' || name=='asmStructure')
		depth = 1;
	if (UICom.structure['tree'][uuid]!=null) {
		if (type=='standard') {
			var node = UICom.structure['ui'][uuid].node;
			var display = ($(node.metadatawad).attr('display')==undefined)?'Y':$(node.metadatawad).attr('display');
			$("#welcome-edit").html("");
			if (UICom.structure["ui"][uuid].semantictag.indexOf('welcome-unit')>-1 && !g_welcome_edit && display=='Y')
				UIFactory['Node'].displayWelcomePage(UICom.structure['tree'][uuid],'contenu',depth,langcode,edit);
			else
				UIFactory['Node'].displayStandard(UICom.structure['tree'][uuid],'contenu',depth,langcode,edit);
		}
		if (type=='translate')
			UIFactory['Node'].displayTranslate(UICom.structure['tree'][uuid],'contenu',depth,langcode,edit);
		if (type=='model') {
			UIFactory['Node'].displayModel(UICom.structure['tree'][uuid],'contenu',depth,langcode,edit);
		}
	}
	$("#wait-window").modal('hide');
}

//==================================
function displayControlGroup_getEditor(destid,label,controlsid,nodeid) {
//==================================
	$("#"+destid).append($("<div class='form-group'><label class='col-sm-3 control-label'>"+label+"</label><div id='"+controlsid+"' class='col-sm-9'></div></div>"));
	$("#"+controlsid).append(UICom.structure["ui"][nodeid].resource.getEditor());
}

//==================================
function displayControlGroup_displayEditor(destid,label,controlsid,nodeid,type,classitem,lang,resettable) {
//==================================
	if (classitem==null)
		classitem="";
	$("#"+destid).append($("<div class='control-group'><label class='control-label "+classitem+"'>"+label+"</label><div id='"+controlsid+"' class='controls'></div></div>"));
	UICom.structure["ui"][nodeid].resource.displayEditor(controlsid,type,lang,null,null,resettable);
}

//==================================
function displayControlGroup_getView(destid,label,controlsid,nodeid,type,classitem,lang) {
//==================================
	$("#"+destid).append($("<div class='control-group'><label class='control-label "+classitem+"'>"+label+"</label><div id='"+controlsid+"' class='controls'></div></div>"));
	$("#"+controlsid).append(UICom.structure["ui"][nodeid].resource.getView(null,type,lang));
}

//==================================
function displayControlGroup_displayView(destid,label,controlsid,nodeid,type,classitem) {
//==================================
	if (classitem==null)
		classitem="";
	$("#"+destid).append($("<div class='control-group'><label class='control-label "+classitem+"'>"+label+"</label><div id='"+controlsid+"' class='controls'></div></div>"));
	$("#"+controlsid).append(UICom.structure["ui"][nodeid].resource.getView());
}

//=======================================================================
function writeSaved(uuid,data)
//=======================================================================
{
	$("#saved-window-body").html("<img src='"+karuta_url+"/karuta/img/green.png'/> saved : "+new Date().toLocaleString());
}

//=======================================================================
function importBranch(destid,srcecode,srcetag,databack,callback,param2,param3,param4,param5,param6,param7,param8) 
//=======================================================================
// if srcetag does not exist as semantictag search as code
{
//	$("#wait-window").modal('show');
	//------------
	var selfcode = $("code",$("asmRoot>asmResource[xsi_type='nodeRes']",UICom.root.node)).text();
	if (srcecode.indexOf('.')<0 && srcecode!='self')  // There is no project, we add the project of the current portfolio
		srcecode = selfcode.substring(0,selfcode.indexOf('.')) + "." + srcecode;
	if (srcecode=='self')
		srcecode = selfcode;
	//------------
	var urlS = serverBCK_API+"/nodes/node/import/"+destid+"?srcetag="+srcetag+"&srcecode="+srcecode;
	if (USER.admin || g_userroles[1]=='designer') {
		var rights = UIFactory["Node"].getRights(destid);
		var roles = $("role",rights);
		if (roles.length==0) // test if model (otherwise it is an instance and we import)
			urlS = serverBCK_API+"/nodes/node/copy/"+destid+"?srcetag="+srcetag+"&srcecode="+srcecode;
	}
//	$.ajaxSetup({async: false});
	$.ajax({
		type : "POST",
		dataType : "text",
		url : urlS,
		data : "",
		success : function(data) {
			if (data=='Inexistent selection'){
				alertHTML(karutaStr[languages[LANGCODE]]['inexistent-selection']);
			}
			if (callback!=null)
				if (databack)
					callback(data,param2,param3,param4,param5,param6,param7,param8);
				else
					callback(param2,param3,param4,param5,param6,param7,param8);
			$("#wait-window").modal('hide');			
		},
		error : function(jqxhr,textStatus) {
			alertHTML(karutaStr[languages[LANGCODE]]['inexistent-selection']);
			$("#wait-window").modal('hide');			
		}
	});
//	$.ajaxSetup({async: true});
}

//=======================================================================
function edit_displayEditor(uuid,type)
//=======================================================================
{
	$("#edit-window-body").remove();
	$("#edit-window-body").append($("<div id='edit-window-body'></div>"));
	UICom.structure["ui"][uuid].resource.displayEditor("edit-window-body",type);
}

//=======================================================================
function loadLanguages(callback)
//=======================================================================
{
	$.ajaxSetup({async: false});
	for (var i=0; i<languages.length; i++){
		if (i<languages.length-1) {
			if (elgg_installed) {
				$.ajax({
					type : "GET",
					dataType : "script",
					url : karuta_url+"/socialnetwork-elgg/js/languages/locale_"+languages[i]+".js"
				});
			}
			$.ajax({
				type : "GET",
				dataType : "script",
				url : karuta_url+"/karuta/js/languages/locale_"+languages[i]+".js"
			});
		}
		else { // last one so we callback
			if (elgg_installed) {
				$.ajax({
					type : "GET",
					dataType : "script",
					url : karuta_url+"/socialnetwork-elgg/js/languages/locale_"+languages[i]+".js"
				});
			}
			$.ajax({
				type : "GET",
				dataType : "script",
				url : karuta_url+"/karuta/js/languages/locale_"+languages[i]+".js",
			});
		}
	}
	callback();
	$.ajaxSetup({async: true});
}


//=======================================================================
function sleep(milliseconds)
//=======================================================================
{
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

//=======================================================================
function submit(uuid,submitall)
//=======================================================================
{
	var urlS = serverBCK_API+'/nodes/node/'+uuid+'/action/submit';
	if (submitall!=null && submitall)
		urlS += 'all';
	$.ajax({
		type : "POST",
		dataType : "text",
		contentType: "application/xml",
		url : urlS,
		uuid : uuid,
		success : function (data){
			UIFactory.Node.reloadUnit();
		}
	});
}

//=======================================================================
function reset(uuid)
//=======================================================================
{
	var urlS = serverBCK_API+'/nodes/node/'+uuid+'/action/reset';
	$.ajax({
		type : "POST",
		dataType : "text",
		contentType: "application/xml",
		url : urlS,
		uuid : uuid,
		success : function (data){
			UIFactory.Node.reloadUnit();
		}
	});
}

//=======================================================================
function postAndDownload(url,data)
//=======================================================================
{
	var html = "<form id='form-data' action='"+url+"' method='post' enctype='multipart/form-data' ><input id='input-data' type='hidden' name='data'></form>";
	$("#post-form").html($(html));
	$("#input-data").val(data);
	$("#form-data").submit();
}


//=======================================================================
function show(uuid)
//=======================================================================
{
	var urlS = serverBCK_API+'/nodes/node/'+uuid+'/action/show';
	$.ajax({
		type : "POST",
		dataType : "text",
		contentType: "application/xml",
		url : urlS,
		success : function (data){
			UIFactory.Node.reloadUnit();
		}
	});
}

//=======================================================================
function hide(uuid)
//=======================================================================
{
	var urlS = serverBCK_API+'/nodes/node/'+uuid+'/action/hide';
	$.ajax({
		type : "POST",
		dataType : "text",
		contentType: "application/xml",
		url : urlS,
		success : function (data){
			UIFactory.Node.reloadUnit();
		}
	});
}


//=======================================================================
function Set()
//=======================================================================
{
	this.content = {};
}
Set.prototype.add = function(val) {
	this.content[val]=true;
};
Set.prototype.remove = function(val) {
	delete this.content[val];
};
Set.prototype.contains = function(val) {
	return (val in this.content);
};
Set.prototype.asArray = function() {
	var res = [];
	for (var val in this.content) res.push(val);
	return res;
};

//==================================
function encrypt(text,key){  
	//==================================
    var result = $.rc4EncryptStr(text,key);
	return result;
}  
//==================================
function decrypt(text,key){  
//==================================
	var result = "";
	try {
		result = $.rc4DecryptStr(text,key);
	}
	catch(err) {
		result = karutaStr[LANG]['error_rc4key'];
	}
		return result;
	}  

//==================================
function sortJsonOnCode(a,b)
//==================================
{
	a = a.code.toLowerCase();
	b = b.code.toLowerCase();
	return (a < b) ? -1 : (a > b) ? 1 : 0;
}

//==================================
function sortJsonOnCodeInterne(a,b)
//==================================
{
	a = a.code_interne.toLowerCase();
	b = b.code_interne.toLowerCase();
	return (a < b) ? -1 : (a > b) ? 1 : 0;
}

//==================================
function sortOn1(a,b)
//==================================
{
	a = a[0];
	b = b[0];
	return a == b ? 0 : (a > b ? 1 : -1);
}

//==================================
function sortOn1Desc(a,b)
//==================================
{
	a = a[0];
	b = b[0];
	return a == b ? 0 : (a < b ? 1 : -1);
}

//==================================
function sortOn1_2(a,b)
//==================================
{
	a = a[0]+a[1];
	b = b[0]+b[1];
	return a == b ? 0 : (a > b ? 1 : -1);
}

//==================================
function sortOn1_2_3(a,b)
//==================================
{
	a = a[0]+a[1]+a[2];
	b = b[0]+b[1]+b[2];
	return a == b ? 0 : (a > b ? 1 : -1);
}


//==================================
function getSendPublicURL(uuid,shareroles)
//==================================
{
	//---------------------
	$("#edit-window-footer").html("");
	fillEditBoxBody();
	$("#edit-window-title").html(karutaStr[LANG]['share-URL']);
	var js1 = "javascript:$('#edit-window').modal('hide')";
	var send_button = "<button id='send_button' class='btn'>"+karutaStr[LANG]['button-send']+"</button>";
	var obj = $(send_button);
	$(obj).click(function (){
		var email = $("#email").val();
		if (email!='') {
			getPublicURL(uuid,email,shareroles)
		}
	});
	$("#edit-window-footer").append(obj);
	var footer = " <button class='btn' onclick=\""+js1+";\">"+karutaStr[LANG]['Close']+"</button>";
	$("#edit-window-footer").append($(footer));

	var html = "<div class='form-horizontal'>";
	html += "<div class='form-group'>";
	html += "		<label for='email' class='col-sm-3 control-label'>"+karutaStr[LANG]['email']+"</label>";
	html += "		<div class='col-sm-9'>";
	html += "			<input id='email' type='text' class='form-control'>";
	html += "		</div>";
	html += "</div>";
	html += "</div>";
	$("#edit-window-body").html(html);
	//--------------------------
}

//==================================
function getSendSharingURL(uuid,sharewithrole,sharetoemail,sharetoroles,langcode,sharelevel,shareduration,sharerole,shareoptions)
//==================================
{
	var emailsarray = [];
	//---------------------
	if (langcode==null)
		langcode = LANGCODE;
	//---------------------
	var sharetomessage = "";
	var sharetoobj = "";
	$("#edit-window-footer").html("");
	fillEditBoxBody();
	$("#edit-window-title").html(karutaStr[LANG]['share-URL']);
	var js1 = "javascript:$('#edit-window').modal('hide')";
	var send_button = "<button id='send_button' class='btn'>"+karutaStr[LANG]['button-send']+"</button>";
	var obj = $(send_button);
	$(obj).click(function (){
		if (sharetoemail.indexOf('?')>-1) {
			sharetoemail = $("#email").val();
		}
		if (shareoptions.indexOf('mess')>-1) {
			sharetomessage = $("#message").val();
			sharetomessage = $('<div/>').text(sharetomessage).html();  // encode html
		}
		if (shareoptions.indexOf('obj')>-1) {
			sharetoobj = $("#object").val();
		}
		if (shareduration=='?') {
			shareduration = $("#duration").val();
		}
		if (sharetoemail!='' && shareduration!='') {
			getPublicURL(uuid,sharetoemail,sharerole,sharewithrole,sharelevel,shareduration,langcode,sharetomessage,sharetoobj);
		}
	});
	$("#edit-window-footer").append(obj);
	var footer = " <button class='btn' onclick=\""+js1+";\">"+karutaStr[LANG]['Close']+"</button>";
	$("#edit-window-footer").append($(footer));

	var html = "<div class='form-horizontal'>";
	html += "<div class='form-group'>";
	if (sharetoemail=='?') {
		html += "		<label for='email' class='col-sm-3 control-label'>"+karutaStr[LANG]['email']+"</label>";
		html += "		<div class='col-sm-9'>";
		html += "			<input autocomplete='off' id='email' type='text' class='form-control'>";
		html += "		</div>";
	}
	if (shareoptions.indexOf('obj')>-1) {
		html += "		<label for='object' class='col-sm-3 control-label'>"+karutaStr[LANG]['subject']+"</label>";
		html += "		<div class='col-sm-9'>";
		html += "			<input id='object' type='text' class='form-control'>";
		html += "		</div>";
	}
	if (shareoptions.indexOf('mess')>-1) {
		html += "		<label for='message' class='col-sm-3 control-label'>"+karutaStr[LANG]['message']+"</label>";
		html += "		<div class='col-sm-9'>";
		html += "<textarea id='message' class='form-control' expand='false' style='height:300px'></textarea>";
		html += "		</div>";
	}
	if (shareduration=='?') {
		html += "		<label for='email' class='col-sm-3 control-label'>"+karutaStr[LANG]['shareduration']+"</label>";
		html += "		<div class='col-sm-9'>";
		html += "			<input id='duration' type='text' class='form-control'>";
		html += "		</div>";
	}
	html += "</div>";
	html += "</div>";
	$("#edit-window-body").html(html);
	$("#message").wysihtml5(
			{
				toolbar:{"size":"xs","font-styles": false,"html":true,"blockquote": false,"image": false,"link": false},
				"uuid":uuid,
				"locale":LANG
			}
		);
	if (shareoptions.indexOf('emailautocomplete')>-1) {
		for ( var i = 0; i < UsersActive_list.length; i++) {
			emailsarray[emailsarray.length] = {'libelle': UsersActive_list[i].email_node.text()};
		}
		addautocomplete(document.getElementById('email'), emailsarray);
	}
	//--------------------------
}


//==================================
function getPublicURL(uuid,email,sharerole,role,level,duration,langcode,sharetomessage,sharetoobj) {
//==================================
	if (role==null)
		role = "all";
	if (level==null)
		level = 4; //public
	if (duration==null)
		duration = 'unlimited'; 
	var urlS = serverBCK+'/direct?type=email&uuid='+uuid+'&email='+email+'&role='+role+'&l='+level+'&d='+duration+'&sharerole='+sharerole;
	$.ajax({
		type : "POST",
		dataType : "text",
		contentType: "application/xml",
		url : urlS,
		success : function (data){
			sendEmailPublicURL(data,email,langcode,sharetomessage,sharetoobj);
		}
	});
}

//==================================
function sendSharingURL(uuid,sharewithrole,email,sharetorole,langcode,level,duration,sharerole) {
//==================================
	if (level==null)
		level = 0; //must be logged
	if (sharewithrole==null)
		sharewithrole = "all";
	if (duration==null)
		duration = "24";
	//---------------------
	if (email!=null && email!='') {
		var emails = email.split(" "); // email1 email2 ..
		for (var i=0;i<emails.length;i++) {
			if (emails[i].length>4) {
				var urlS = serverBCK+'/direct?uuid='+uuid+'&email='+emails[i]+'&role='+sharewithrole+'&l='+level+'&d='+duration+'&sharerole='+sharerole+'&type=email';
				$.ajax({
					type : "POST",
					email : emails[i],
					dataType : "text",
					contentType: "application/xml",
					url : urlS,
					success : function (data){
						sendEmailPublicURL(data,this.email,langcode);
					}
				});
			}
		}
	}
	if (sharetorole!=null && sharetorole!='') {
		var roles = sharetorole.split(" "); // role1 role2 ..
		var groups = null;
		$.ajax({
			type : "GET",
			dataType : "xml",
			url : serverBCK_API+"/rolerightsgroups/all/users?portfolio="+g_portfolioid,
			success : function(data) {
				groups = $("rrg",data);
				for (var i=0;i<roles.length;i++) {
					if (roles[i].length>0) {
						if (groups.length>0) {
							for (var j=0; j<groups.length; j++) {
								var label = $("label",groups[j]).text();
								var users = $("user",groups[j]);
								if (label==roles[i] && users.length>0){
									for (var k=0; k<users.length; k++){
											var email = $("email",$(users[k])).text();
											if (email.length>4) {
												var urlS = serverBCK+'/direct?uuid='+uuid+'&email='+email+'&role='+sharewithrole+'&l='+level+'&d='+duration+'&sharerole='+sharerole+'&type=showtorole&showtorole='+roles[i];
												$.ajax({
													type : "POST",
													email : email,
													dataType : "text",
													contentType: "application/xml",
													url : urlS,
													success : function (data){
														sendEmailPublicURL(data,this.email,langcode);
													},
													error : function(jqxhr,textStatus) {
														alertHTML("Error in direct : "+jqxhr.responseText);
													}
												});
											} else {
												alert("email undefined:"+email);
											}
									}
								}
							}
						}
					}
				}
			},
			error : function(jqxhr,textStatus) {
				alertHTML("Error in rolerightsgroups : "+jqxhr.responseText);
			}
		});
	}
}

//==================================
function getEmail(role,emails) {
//==================================
	$.ajax({
		type : "GET",
		dataType : "xml",
		url : serverBCK_API+"/users",
		success : function(data) {
			UIFactory["User"].parse(data);
			//--------------------------
			$.ajax({
				type : "GET",
				dataType : "xml",
				url : serverBCK_API+"/rolerightsgroups/all/users?portfolio="+g_portfolioid,
				success : function(data) {
					var groups = $("rrg",data);
					if (groups.length>0) {
						for (var i=0; i<groups.length; i++) {
							var label = $("label",groups[i]).text();
							var users = $("user",groups[i]);
							if (label==role && users.length>0){
								for (var j=0; j<users.length; j++){
									var userid = $(users[j]).attr('id');
									if (Users_byid[userid]==undefined)
										alertHTML('error undefined userid:'+userid);
									else
										emails[j] = Users_byid[userid].getEmail();
								}
							}
						}
					}
					return emails;
				},
				error : function(jqxhr,textStatus) {
					return emails;
				}
			});
			//--------------------------
		},
		error : function(jqxhr,textStatus) {
			alertHTML("Error in getEmail : "+jqxhr.responseText);
		}
	});
}

//==================================
function sendEmailPublicURL(encodeddata,email,langcode,sharetomessage,sharetoobj) {
//==================================
	var url = window.location.href;
	var serverURL = url.substring(0,url.lastIndexOf(appliname)+appliname.length);
	url = serverURL+"/application/htm/public.htm?i="+encodeddata+"&amp;lang="+languages[langcode];
//	url = "https://moneparcours.eportfolium.fr/moneparcours-externe/application/htm/public.htm?i="+encodeddata+"&amp;lang="+languages[langcode];
	//------------------------------
	var message = "";
	message = g_sendEmailPublicURL_message.replace("#firstname#",USER.firstname);
	message = message.replace("#lastname#",USER.lastname);
	message = message.replace("#want-sharing#",karutaStr[LANG]['want-sharing']);
	message = message.replace("#see#",karutaStr[LANG]['see']);
	message = message.replace("#do not edit this#",url);
	if (sharetomessage!=undefined)
		message += "&lt;hr&gt;" + sharetomessage;
	var subject = USER.firstname+" "+USER.lastname+" "+karutaStr[LANG]['want-sharing'];
	if (sharetoobj!= undefined && sharetoobj!="")
		subject = sharetoobj;
	//------------------------------
	var xml ="<node>";
	xml +="<sender>"+$(USER.email_node).text()+"</sender>";
	xml +="<recipient>"+email+"</recipient>";
	xml +="<subject>"+subject+"</subject>";
	xml +="<message>"+message+"</message>";
	xml +="<recipient_cc></recipient_cc><recipient_bcc></recipient_bcc>";
	xml +="</node>";
	$.ajax({
		contentType: "application/xml",
		type : "POST",
		dataType : "xml",
		url : "../../../"+serverBCK+"/mail",
		data: xml,
		success : function(data) {
			$('#edit-window').modal('hide');
			alertHTML(karutaStr[LANG]['email-sent']);
		}
	});
}


//==================================
function getLanguage(setElggLocale) {
//==================================
	if (setElggLocale==null)
		setElggLocale = true;
	var lang = languages[0];
	var cookielang = localStorage.getItem('karuta-language');
	for (var i=0; i<languages.length;i++){
		if (languages[i]==cookielang) {
			LANGCODE = i;
			LANG = cookielang;
		}
	}
	setLanguage(LANG);
	if (setElggLocale && USER!=undefined && elgg_installed && $(USER.username_node).text()!="public") // not public Account
		moment.locale(lang);  // for elgg
}

//==================================
function setLanguage(lang,caller) {
//==================================
	if (caller==null)
		caller="";
	localStorage.setItem('karuta-language',lang);
	LANG = lang;
	console.log("LANG: "+LANG);
	$("#flagimage").attr("src",karuta_url+"/karuta/img/flags/"+karutaStr[LANG]['flag-name']+".png");
	for (var i=0; i<languages.length;i++){
		if (languages[i]==lang)
			LANGCODE = i;
	}
	if (caller=="" && elgg_installed && USER!=undefined && $(USER.username_node).text()!="public") // not public Account
		moment.locale(lang);
}


//==================================
function toggleZoom(uuid) {
//==================================
	var classname = $("#zoom_"+uuid).attr("class");
	if (classname=="fa fa-search-plus")
		$("#zoom_"+uuid).attr("class","fa fa-search-minus");
	else
		$("#zoom_"+uuid).attr("class","fa fa-search-plus");
}

//==================================
function toggleContent(uuid) {
//==================================
	if ($("#toggleContent_"+uuid).hasClass("glyphicon-plus")) {
		if (g_designerrole)
			UIFactory["Node"].updateMetadataAttribute(uuid,'collapsed','N');
		else
			sessionStorage.setItem("collapsed"+uuid,"N");
		$("#toggleContent_"+uuid).removeClass("glyphicon-plus")
		$("#toggleContent_"+uuid).addClass("glyphicon-minus")
		$("#content-"+uuid).show();
	} else {
		if (g_designerrole)
			UIFactory["Node"].updateMetadataAttribute(uuid,'collapsed','Y');
		else
			sessionStorage.setItem("collapsed"+uuid,"Y");
		$("#toggleContent_"+uuid).removeClass("glyphicon-minus")
		$("#toggleContent_"+uuid).addClass("glyphicon-plus")
		$("#content-"+uuid).hide();
	}
}

//==================================
function toggleSharing(uuid) {
//==================================
	if ($("#toggleSharing_"+uuid).hasClass("glyphicon-plus")) {
		$("#toggleSharing_"+uuid).removeClass("glyphicon-plus")
		$("#toggleSharing_"+uuid).addClass("glyphicon-minus")
		$("#sharing-content-"+uuid).show();
	} else {
		$("#toggleSharing_"+uuid).removeClass("glyphicon-minus")
		$("#toggleSharing_"+uuid).addClass("glyphicon-plus")
		$("#sharing-content-"+uuid).hide();
	}
}

//==================================
function toggleMetadata(state) {
//==================================
	if (state=='hidden') {
		changeCss(".metainfo", "display:none;");
		g_visible = 'hidden';
	} else {
		changeCss(".metainfo", "display:block;");
		g_visible = 'visible';
	}
	localStorage.setItem('metadata',g_visible);
}

//==================================
function toggleButton(state) {
//==================================
	if (state=='hidden') {
		changeCss(".btn-group", "visibility:hidden;");
	} else {
		changeCss(".btn-group", "visibility:visible;");
	}
}


//==================================
function toggleSideBar() {
//==================================
	if ($("#sidebar").is(":visible"))
	{
		$("#sidebar").hide();
		g_display_sidebar = false;
		$("#contenu").removeClass().addClass('col-md-12').addClass('col-sm-12');
	} else {
		$("#contenu").removeClass().addClass('col-md-9').addClass('col-sm-9');
		$("#sidebar").show();
		g_display_sidebar = true;
	}
	UIFactory['Node'].reloadUnit();
}

//==================================
function toggleSocialNetwork() {
//==================================
	if ($("#socialnetwork").is(":visible"))
	{
		$("#socialnetwork").hide();
		$("#toggleSocialNetwork").removeClass('fa-arrow-left').addClass('fa-arrow-right');
		$("#main-content").removeClass().addClass('col-md-12');
		localStorage.setItem('socialnetwork','hidden');
//		Cookies.set('socialnetwork','hidden',{ expires: 60 });
	} else {
		$("#toggleSocialNetwork").removeClass('fa-arrow-right').addClass('fa-arrow-left');
		$("#main-content").removeClass().addClass('col-md-8 col-md-push-4');
		$("#socialnetwork").show();
		localStorage.setItem('socialnetwork','shown');
//		Cookies.set('socialnetwork','shown',{ expires: 60 });
	}
}

//==================================
function toggleSidebarPlusMinus(uuid) { // click on PlusMinus
//==================================
	if ($("#toggle_"+uuid).hasClass("glyphicon-plus"))
	{
//		g_toggle_sidebar [uuid] = 'open';
		localStorage.setItem('sidebar'+uuid,'open');
		$("#toggle_"+uuid).removeClass("glyphicon-plus")
		$("#toggle_"+uuid).addClass("glyphicon-minus")
		$("#collapse"+uuid).collapse("show")
	} else {
//		g_toggle_sidebar [uuid] = 'closed';
		localStorage.setItem('sidebar'+uuid,'closed');
		$("#toggle_"+uuid).removeClass("glyphicon-minus")
		$("#toggle_"+uuid).addClass("glyphicon-plus")
		$("#collapse"+uuid).collapse("hide")
	}
}

//==================================
function toggleSidebarPlus(uuid) { // click on label
//==================================
	if ($("#toggle_"+uuid).hasClass("glyphicon-plus"))
	{
//		g_toggle_sidebar [uuid] = 'open';
		localStorage.setItem('sidebar'+uuid,'open');
		$("#toggle_"+uuid).removeClass("glyphicon-plus")
		$("#toggle_"+uuid).addClass("glyphicon-minus")
		$("#collapse"+uuid).collapse("show");
	}
}

//==================================
function toggleUsersList(list) {
//==================================
	if ($("#"+list+"-users-button").hasClass("glyphicon-plus")) {
		if (list=='empty') {
			$("#wait-window").show();
			UIFactory.User.getListUserWithoutPortfolio();
			UIFactory.User.displayUserWithoutPortfolio('empty')
			$("#wait-window").hide();
		}
		$("#"+list+"-users-button").removeClass("glyphicon-plus");
		$("#"+list+"-users-button").addClass("glyphicon-minus");
		$("#"+list).show();
	} else {
		$("#"+list+"-users-button").removeClass("glyphicon-minus")
		$("#"+list+"-users-button").addClass("glyphicon-plus")
		$("#"+list).hide();
	}
}

//==================================
function changeCss(className, classValue)
//==================================
{
    var cssMainContainer = $('#css-modifier-container');

    if (cssMainContainer.length == 0) {
        var cssMainContainer = $('<style id="css-modifier-container"></style>');
        cssMainContainer.appendTo($('head'));
    }

    cssMainContainer.append(className + " {" + classValue + "}\n");
}

//================================== not used
function equalize_column_height(uuid)
//==================================
{
	var heights = $("#node_"+uuid).find(".same-height").map(function() {
		if (UICom.structure["ui"][uuid].resource!=undefined && UICom.structure["ui"][uuid].resource.type == 'image')
			return $("#image_uuid").height();
		else
			return $(this).height();
	});
	var maxHeight = Math.max.apply(null, heights);
	$("#node_"+uuid).find(".same-height").height(maxHeight);
}

//==================================
function rgb(red, green, blue)
//==================================
{
    var rgb = blue | (green << 8) | (red << 16);
    return '#' + (0x1000000 + rgb).toString(16).slice(1)
}

//==================================
function alertHTML(message,header,footer)
//==================================
{
	if (header!=null) {
		document.getElementById('alert-window-header').innerHTML = header;
	}
	if (footer!=null) {
		document.getElementById('alert-window-footer').innerHTML = footer;
	} else {
		var buttons = "<button class='btn' onclick=\"javascript:$('#alert-window').modal('hide');\">" + karutaStr[LANG]["Close"] + "</button>";
		document.getElementById('alert-window-footer').innerHTML = buttons;
	}
	$('#alert-window-body').html(message);
	$('#alert-window').modal('show');

}

//==================================
function messageHTML(message)
//==================================
{
	var buttons = "<button class='btn' onclick=\"javascript:$('#message-window').modal('hide');\">" + karutaStr[LANG]["Close"] + "</button>";
	document.getElementById('message-window-footer').innerHTML = buttons;
	$('#message-window-body').html(message);
	$('#message-window').modal('show');
}

//==================================
function imageHTML(image)
//==================================
{
	var buttons = "<button class='btn' onclick=\"javascript:$('#image-window').modal('hide');\">" + karutaStr[LANG]["Close"] + "</button>";
	document.getElementById('image-window-footer').innerHTML = buttons;
	$('#image-window-body').html(image);
	$('#image-window').modal('show');

}


//==================================
String.prototype.containsArrayElt = function (rolesarray) 
//==================================
	// usage : if (editnoderoles.containsArrayElt(g_userroles)) 
{
	var result = false;
	for (var i=0;i<rolesarray.length;i++){
		if (this.indexOf(rolesarray[i])>-1){
			result = true;
			i = rolesarray.length;
		}
	}
	return result;
}

//==================================
function toggleGroup(group_type,uuid,callback,type,lang) {
//==================================
	if ($("#toggleContent_"+group_type+"-"+uuid).hasClass("glyphicon-plus")) {
		$("#toggleContent_"+group_type+"-"+uuid).removeClass("glyphicon-plus");
		$("#toggleContent_"+group_type+"-"+uuid).addClass("glyphicon-minus");
		if (callback!=null){
			if (jQuery.isFunction(callback))
				callback(uuid,"content-"+group_type+"-"+uuid,type,lang);
			else
				eval(callback+"('"+uuid+"','content-"+group_type+"-"+uuid+"','"+type+"','"+lang+"')");
		}
		$("#content-"+group_type+"-"+uuid).show();
		displayGroup[group_type][uuid] = 'open';
		localStorage.setItem('dg_'+group_type+"-"+uuid,'open');
//		Cookies.set('dg_'+group_type+"-"+uuid,'open',{ expires: 60 });
	} else {
		$("#toggleContent_"+group_type+"-"+uuid).removeClass("glyphicon-minus");
		$("#toggleContent_"+group_type+"-"+uuid).addClass("glyphicon-plus");
		$("#content-"+group_type+"-"+uuid).hide();
		displayGroup[group_type][uuid] = 'closed';
		localStorage.setItem('dg_'+group_type+"-"+uuid,'closed');
//		Cookies.set('dg_'+group_type+"-"+uuid,'closed',{ expires: 60 });
	}
}

//==================================
function parseList(tag,xml) {
//==================================
	var ids = [];
	var items = $(tag,xml);
	for ( var i = 0; i < items.length; i++) {
		ids[i] = $(items[i]).attr('id');
	}
	return ids;
}

//==============================
function updateDisplay_page(elt,callback)
//==============================
{
	var val = $("#"+elt).attr("value");
	if (val=='1') {
		if (callback!=null){
			if (jQuery.isFunction(callback))
				callback();
			else
				eval(callback+"()");
		}
	}
}

//==================================
function toggleProject2Select(uuid) {
//==================================
	if ($("#toggleContent2Select_"+uuid).hasClass("glyphicon-plus")) {
		$("#toggleContent2Select_"+uuid).removeClass("glyphicon-plus")
		$("#toggleContent2Select_"+uuid).addClass("glyphicon-minus")
		$("#selectform-content-"+uuid).show();
	} else {
		$("#toggleContent2Select_"+uuid).removeClass("glyphicon-minus")
		$("#toggleContent2Select_"+uuid).addClass("glyphicon-plus")
		$("#selectform-content-"+uuid).hide();
	}
}

//==================================
function countWords(html) {
//==================================
	var text = html.replace(/(<([^>]+)>)/ig," ").replace(/(&lt;([^&gt;]+)&gt;)/ig," ").replace( /[^\w ]/g, "" );
	return text.trim().split( /\s+/ ).length;
}

//==================================
function getFirstWords(html,nb) {
//==================================
	var text = html.replace(/(<([^>]+)>)/ig," ").replace(/(&lt;([^&gt;]+)&gt;)/ig," ").replace( /[^\w ]/g, "" );
	var tableOfWords = text.trim().split( /\s+/ ).slice(0,nb);
	var tableIndex = [];
	var end = 0;
	for (var i=0;i<tableOfWords.length;i++){
		end += html.substring(end).indexOf(tableOfWords[i])+tableOfWords[tableOfWords.length-1].length;
		tableIndex[tableIndex.length] = {'s':tableOfWords[i], 'end':end};
	}
	return html.substring(0,tableIndex[tableOfWords.length-1].end);
}

//==================================
function setCSSportfolio(data)
//==================================
{
	// ================================= CSS Portfolio ========================
	if ($("asmContext:has(metadata[semantictag='portfolio-navbar'])",data).length>0) {
		var portfolio_navbar_id = $("asmContext:has(metadata[semantictag='portfolio-navbar'])",data).attr("id");
		var portfolio_navbar_color = UICom.structure["ui"][portfolio_navbar_id].resource.getValue();
		changeCss("#sub-bar .navbar-default", "background-color:"+portfolio_navbar_color+";border-color:"+portfolio_navbar_color+";");
		changeCss("#sub-bar .dropdown-menu", "background-color:"+portfolio_navbar_color+";border-color:"+portfolio_navbar_color+";");
		changeCss("#sub-bar .open > a", "background-color:"+portfolio_navbar_color+";border-color:"+portfolio_navbar_color+";");
	}
	//--------------
	if ($("asmContext:has(metadata[semantictag='portfolio-navbar-link'])",data).length>0) {
		var portfolio_navbar_link_id = $("asmContext:has(metadata[semantictag='portfolio-navbar-link'])",data).attr("id");
		var portfolio_navbar_link_color = UICom.structure["ui"][portfolio_navbar_link_id].resource.getValue();
		changeCss("#sub-bar a", "color:"+portfolio_navbar_link_color+";");
	}
	//--------------------------------
	if ($("asmContext:has(metadata[semantictag='portfolio-sidebar'])",data).length>0) {
		var portfolio_sidebar_id = $("asmContext:has(metadata[semantictag='portfolio-sidebar'])",data).attr("id");
		var portfolio_sidebar_color = UICom.structure["ui"][portfolio_sidebar_id].resource.getValue();
		changeCss("#sidebar", "background-color:"+portfolio_sidebar_color+";");
	}
	//--------------------------------
	if ($("asmContext:has(metadata[semantictag='portfolio-sidebar-link'])",data).length>0) {
		var portfolio_sidebar_link_id = $("asmContext:has(metadata[semantictag='portfolio-sidebar-link'])",data).attr("id");
		var portfolio_sidebar_link_color = UICom.structure["ui"][portfolio_sidebar_link_id].resource.getValue();
		changeCss(".sidebar-link", "color:"+portfolio_sidebar_link_color+";padding-right:9px;");
		changeCss(".sidebar-link a", "color:"+portfolio_sidebar_link_color+";");
	}
	//--------------------------------
	if ($("asmContext:has(metadata[semantictag='portfolio-sidebar-link-selected'])",data).length>0) {
		var portfolio_sidebar_link_selected_id = $("asmContext:has(metadata[semantictag='portfolio-sidebar-link-selected'])",data).attr("id");
		var portfolio_sidebar_link_selected_color = UICom.structure["ui"][portfolio_sidebar_link_selected_id].resource.getValue();								
		changeCss(".selected a", "color:"+portfolio_sidebar_link_selected_color+";font-weight:bold;");
		changeCss(".sidebar-link a:hover", "color:"+portfolio_sidebar_link_selected_color+";");
		changeCss("a.sidebar-link:hover", "color:"+portfolio_sidebar_link_selected_color+";");
	}
	//--------------------------------
	if ($("asmContext:has(metadata[semantictag='portfolio-sidebar-selected-border'])",data).length>0) {
		var portfolio_sidebar_selected_border_id = $("asmContext:has(metadata[semantictag='portfolio-sidebar-selected-border'])",data).attr("id");
		portfolio_sidebar_selected_border_color = UICom.structure["ui"][portfolio_sidebar_selected_border_id].resource.getValue();
		changeCss("#sidebar .selected", "border-right:4px solid "+portfolio_sidebar_selected_border_color+";");
	}
	//--------------------------------
	if ($("asmContext:has(metadata[semantictag='portfolio-sidebar-separator'])",data).length>0) {
		var portfolio_sidebar_separator_id = $("asmContext:has(metadata[semantictag='portfolio-sidebar-separator'])",data).attr("id");
		var portfolio_sidebar_separator_color = UICom.structure["ui"][portfolio_sidebar_separator_id].resource.getValue();								
		changeCss(".sidebar-item", "border-bottom:1px solid "+portfolio_sidebar_separator_color+";");
		changeCss(".sidebar-item .sidebar-item", "border-bottom:0px solid "+portfolio_sidebar_separator_color+";");
	}
	//--------------------------------
	if ($("asmContext:has(metadata[semantictag='welcome-title-color'])",data).length>0) {
		var welcome_title_color_id = $("asmContext:has(metadata[semantictag='welcome-title-color'])",data).attr("id");
		var welcome_title_color = UICom.structure["ui"][welcome_title_color_id].resource.getValue();
		changeCss(".page-welcome .welcome-title", "color:"+welcome_title_color+";");
	}
	//--------------------------------
	if ($("asmContext:has(metadata[semantictag='welcome-line-color'])",data).length>0) {
		var welcome_line_color_id = $("asmContext:has(metadata[semantictag='welcome-line-color'])",data).attr("id");
		var welcome_line_color = UICom.structure["ui"][welcome_line_color_id].resource.getValue();
		changeCss(".welcome-line", "border-bottom:1px solid "+welcome_line_color+";width:25%;margin-left:auto;margin-right:auto;");
	}
	//--------------------------------
	if ($("asmContext:has(metadata[semantictag='page-title-background-color'])",data).length>0) {
		var page_title_background_color_id = $("asmContext:has(metadata[semantictag='page-title-background-color'])",data).attr("id");
		var page_title_background_color = UICom.structure["ui"][page_title_background_color_id].resource.getValue();
		changeCss(".welcome-line,.row-node-asmRoot,.row-node-asmStructure,.row-node-asmUnit", "background-color:"+page_title_background_color+";");
		changeCss(".row-node", "border-top:1px solid "+page_title_background_color+";");
	}
	//--------------------------------
	if ($("asmContext:has(metadata[semantictag='portfolio-section-separator-color'])",data).length>0) {
		var section_separator_color_id = $("asmContext:has(metadata[semantictag='portfolio-section-separator-color'])",data).attr("id");
		var section_separator_color = UICom.structure["ui"][section_separator_color_id].resource.getValue();
		changeCss(".row-node", "border-top:1px solid "+section_separator_color+";");
	}
	//--------------------------------
	if ($("asmContext:has(metadata[semantictag='page-title-subline-color'])",data).length>0) {
		var page_title_subline_color_id = $("asmContext:has(metadata[semantictag='page-title-subline-color'])",data).attr("id");
		var page_title_subline_color = UICom.structure["ui"][page_title_subline_color_id].resource.getValue();
		changeCss(".row-node-asmRoot .title-subline,.row-node-asmStructure .title-subline,.row-node-asmUnit .title-subline", "border-bottom:1px solid "+page_title_subline_color+";");
	}
	//--------------------------------
	if ($("asmContext:has(metadata[semantictag='portfolio-buttons-color'])",data).length>0) {
		var portfolio_buttons_color_id = $("asmContext:has(metadata[semantictag='portfolio-buttons-color'])",data).attr("id");
		var portfolio_buttons_color = UICom.structure["ui"][portfolio_buttons_color_id].resource.getValue();
	//	changeCss(".asmnode .dropdown-button, .submit-button", "border:1px solid "+portfolio_buttons_color+";");
		changeCss(".collapsible .glyphicon, .createreport .button,.btn-group .button", "color:"+portfolio_buttons_color+";");
	}
	//--------------------------------
	if ($("asmContext:has(metadata[semantictag='portfolio-buttons-background-color'])",data).length>0) {
		var portfolio_buttons_background_color_id = $("asmContext:has(metadata[semantictag='portfolio-buttons-background-color'])",data).attr("id");
		var portfolio_buttons_background_color = UICom.structure["ui"][portfolio_buttons_background_color_id].resource.getValue();
		changeCss(".row-resource td.buttons,.csv-button,.pdf-button", "border:1px solid "+portfolio_buttons_background_color+";");
		changeCss(".row-resource td.buttons,.csv-button,.pdf-button", "background:"+portfolio_buttons_background_color+";");
	}
	//--------------------------------
	if ($("asmContext:has(metadata[semantictag='portfolio-link-color'])",data).length>0) {
		var portfolio_link_color_id = $("asmContext:has(metadata[semantictag='portfolio-link-color'])",data).attr("id");
		var portfolio_link_color = UICom.structure["ui"][portfolio_link_color_id].resource.getValue();
		changeCss("a", "color:"+portfolio_link_color+";");
	}
	//--------------------------------
	if ($("asmContext:has(metadata[semantictag='portfolio-section-title-background-color'])",data).length>0) {
		var portfolio_section_title_background_color_id = $("asmContext:has(metadata[semantictag='portfolio-section-title-background-color'])",data).attr("id");
		var portfolio_section_title_background_color = UICom.structure["ui"][portfolio_section_title_background_color_id].resource.getValue();
//		changeCss(".row-node-asmUnitStructure", "background:"+portfolio_section_title_background_color+";");
		changeCss(".asmUnitStructure", "background:"+portfolio_section_title_background_color+";");
	}
	// ========================================================================
}

//==============================
function logout()
//==============================
{
	$.ajax({
		type: "GET",
		dataType: "text",
		url: serverBCK_API+"/credential/logout",
		data: "",
		success: function(data) {
		window.location="login.htm?lang="+LANG;
		},
		error: function(data) {
		window.location="login.htm?lang="+LANG;
		}
	});
}

//==============================
function hideAllPages()
//==============================
{
	$("#search-portfolio-div").hide();
	$("#search-user-div").hide();
	$("#main-list").hide();
	$("#main-portfoliosgroup").hide();
	$("#main-page").hide();
	$("#main-user").hide();
	$("#main-usersgroup").hide();
	$("#main-exec-report").hide();
	$("#main-exec-batch").hide();
}


//==============================
function removeStr(str1,str2)
//==============================
{
	return str1.replace(str2,"");
}

//==============================
function cleanCode(code)
//==============================
{
	code = removeStr(code,"@");
	code = removeStr(code,"#");
	code = removeStr(code,"%");
	code = removeStr(code,"$");
	code = removeStr(code,"&");
	code = removeStr(code,"?");
	code = removeStr(code,"!");
	code = removeStr(code,"----");
	return code;
}

//==================================
function displayTechSupportForm(langcode)
//==================================
{
	var serverURL = url.substring(0,url.indexOf(appliname)-1);
	var application_server = serverURL+"/"+appliname;
	//---------------------
	if (langcode==null)
		langcode = LANGCODE;
	//---------------------
	$("#edit-window-footer").html("");
	$("#edit-window-title").html(karutaStr[LANG]['technical-support']);
	var js1 = "javascript:$('#edit-window').modal('hide')";
	var send_button = "<button id='send_button' class='btn'>"+karutaStr[LANG]['button-send']+"</button>";
	var obj = $(send_button);
	$(obj).click(function (){
		var user_name = $("#user-name").val();
		var user_email = $("#user-email").val();
		var message = $("#email-message").val();
		var subject = application_server+" - "+karutaStr[LANG]['sent-by']+" "+user_name + " ("+user_email+")";
		//---------------------
		var xml ="<node>";
		xml +="<recipient>"+technical_support+"</recipient>";
		xml +="<subject>"+subject+"</subject>";
		xml +="<message>"+message+"</message>";
		xml +="<sender>"+user_email+"</sender>";
		xml +="<recipient_cc></recipient_cc><recipient_bcc></recipient_bcc>";
		xml +="</node>";
		$.ajax({
			type : "POST",
			contentType: "application/xml",
			dataType : "text",
			url : serverBCK+"/mail",
			data: xml,
			success : function() {
				alertHTML(karutaStr[LANG]['email-sent']);
				$("#edit-window").modal("hide");
			},
			error : function(jqxhr,textStatus) {
				alert("Error in send mail : "+jqxhr.responseText);
			}
		});

	});
	$("#edit-window-footer").append(obj);
	var footer = " <button class='btn' onclick=\""+js1+";\">"+karutaStr[LANG]['Close']+"</button>";
	$("#edit-window-footer").append($(footer));

	var html = "<div class='form-horizontal'>";
	html += "<div class='form-group'>";
	html += "		<label for='application-server' class='col-sm-3 control-label'>"+karutaStr[LANG]['application-server']+"</label>";
	html += "		<div class='col-sm-9'>";
	html += "			<input id='application-server' disabled='true' type='text' value='"+application_server+"' class='form-control'>";
	html += "		</div>";
	html += "</div>";
	html += "<div class='form-group'>";
	html += "		<label for='user-name' class='col-sm-3 control-label'>"+karutaStr[LANG]['user-name']+"</label>";
	html += "		<div class='col-sm-9'>";
	html += "			<input id='user-name' type='text' class='form-control'>";
	html += "		</div>";
	html += "</div>";
	html += "<div class='form-group'>";
	html += "		<label for='user-email' class='col-sm-3 control-label'>"+karutaStr[LANG]['user-email']+"</label>";
	html += "		<div class='col-sm-9'>";
	html += "			<input id='user-email' type='text' class='form-control'>";
	html += "		</div>";
	html += "</div>";
	html += "<div class='form-group'>";
	html += "		<label for='email-message' class='col-sm-3 control-label'>"+karutaStr[LANG]['email-message']+"</label>";
	html += "		<div class='col-sm-9'>";
	html += "			<textarea rows='5' id='email-message' class='form-control'></textarea>";
	html += "		</div>";
	html += "</div>";
	html += "</div>";
	$("#edit-window-body").html(html);
	if (USER!=null) {
		$("#user-name").val(USER.firstname+" "+USER.lastname);
		$("#user-name").attr('disabled','true');
		$("#user-email").val($(USER.email_node).text());
		if ($(USER.email_node).text()!="")
			$("#user-email").attr('disabled','true');
	}
	$('#edit-window').modal('show')
	//--------------------------
}

//==================================
function convertDot2Dash(text) 
//==================================
{
	return text.replace(/\./g, '-'); 
}

//==================================
function selectRole(nodeid,attribute,value,yes_no,disabled) 
//==================================
{
	var html = "<div class='btn-group roles-choice'>";		
	html += "<input id='"+attribute+nodeid+"' type='text' class='btn btn-default select select-label'  onchange=\"javascript:UIFactory['Node'].updateMetadataWadAttribute('"+nodeid+"','"+attribute+"',this.value)\" value=\""+value+"\"";
	if(disabled!=null && disabled)
		html+= " disabled='disabled' ";			
	html += ">";
	if(disabled==null || !disabled) {
		html += "<button type='button' class='btn btn-default dropdown-toggle select' data-toggle='dropdown' aria-expanded='false'><span class='caret'></span><span class='sr-only'>&nbsp;</span></button>";
		html += "<ul class='dropdown-menu' role='menu'>";
		html += "<li><a value='' onclick=\"$('#"+attribute+nodeid+"').attr('value','');$('#"+attribute+nodeid+"').change();\")>&nbsp;</a></li>";
		//---------------------
		for (role in UICom.roles) {
			html += "<li><a value='"+role+"' onclick=\"$('#"+attribute+nodeid+"').attr('value','"+role+"');$('#"+attribute+nodeid+"').change();\")>"+role+"</a></li>";
		}
		html += "</ul>"
	}
	html += "</div>";
	return html;
}

//==================================
function autocomplete(input,arrayOfValues,onupdate,self,langcode) {
//==================================
	var currentFocus;
	/*execute a function when someone writes in the text field:*/
	input.addEventListener("input", function(e) {
		var a, b, i, val = this.value;
		closeAllLists();
		if (!val) { return false;}
	 	currentFocus = -1;
		a = document.createElement("DIV");
		a.setAttribute("id", this.id + "autocomplete-list");
		a.setAttribute("class", "autocomplete-items");
		this.parentNode.appendChild(a);
		for (i = 0; i < arrayOfValues.length; i++) {
			var indexval = arrayOfValues[i].libelle.toUpperCase().indexOf(val.toUpperCase());
			if (indexval>-1) {
				b = document.createElement("DIV");
				b.innerHTML = arrayOfValues[i].libelle.substr(0, indexval);
				b.innerHTML += "<strong>" + arrayOfValues[i].libelle.substr(indexval,val.length) + "</strong>";
				b.innerHTML += arrayOfValues[i].libelle.substr(indexval+val.length);
				b.innerHTML += "<input type='hidden' code='"+arrayOfValues[i].code+"' label=\""+arrayOfValues[i].libelle+"\" >";
				b.addEventListener("click", function(e) {
					$(input).attr("label_"+languages[langcode],$("input",this).attr('label'));
					$(input).attr('code',$("input",this).attr('code'));
					input.value = $("input",this).attr('label');
					eval(onupdate);
					closeAllLists();
				});
				a.appendChild(b);
			}
		}
	});
	/*execute a function presses a key on the keyboard:*/
	input.addEventListener("keydown", function(e) {
		var x = document.getElementById(this.id + "autocomplete-list");
		if (x) x = x.getElementsByTagName("div");
		if (e.keyCode == 40) {
		/*If the arrow DOWN key is pressed, increase the currentFocus variable:*/
			currentFocus++;
			/*and and make the current item more visible:*/
		addActive(x);
		} else if (e.keyCode == 38) { //up
			/*If the arrow UP key is pressed, decrease the currentFocus variable:*/
			currentFocus--;
			/*and and make the current item more visible:*/
			addActive(x);
		} else if (e.keyCode == 13) {
			/*If the ENTER key is pressed, prevent the form from being submitted,*/
			e.preventDefault();
			if (currentFocus > -1) {
				/*and simulate a click on the "active" item:*/
				if (x) x[currentFocus].click();
			}
		}
	});
	function addActive(x) {
		/*a function to classify an item as "active":*/
		if (!x) return false;
		/*start by removing the "active" class on all items:*/
		removeActive(x);
		if (currentFocus >= x.length) currentFocus = 0;
		if (currentFocus < 0) currentFocus = (x.length - 1);
		/*add class "autocomplete-active":*/
		x[currentFocus].classList.add("autocomplete-active");
	}
	function removeActive(x) {
		/*a function to remove the "active" class from all autocomplete items:*/
		for (var i = 0; i < x.length; i++) {
			x[i].classList.remove("autocomplete-active");
		}
	}
	function closeAllLists(elmnt) {
		/*close all autocomplete lists in the document, except the one passed as an argument:*/
		var x = document.getElementsByClassName("autocomplete-items");
		for (var i = 0; i < x.length; i++) {
			if (elmnt != x[i] && elmnt != input) {
				x[i].parentNode.removeChild(x[i]);
			}
		}
	}
	/*execute a function when someone clicks in the document:*/
	document.addEventListener("click", function (e) {
		closeAllLists(e.target);
	});
}

String.prototype.toNoAccents = function(){
	var accent = [
		/[\300-\306]/g, /[\340-\346]/g, // A, a
		/[\310-\313]/g, /[\350-\353]/g, // E, e
		/[\314-\317]/g, /[\354-\357]/g, // I, i
		/[\322-\330]/g, /[\362-\370]/g, // O, o
		/[\331-\334]/g, /[\371-\374]/g, // U, u
		/[\321]/g, /[\361]/g, // N, n
		/[\307]/g, /[\347]/g, // C, c
	];
	var noaccent = ['A','a','E','e','I','i','O','o','U','u','N','n','C','c'];
	var str = this;
	for(var i = 0; i < accent.length; i++){
		str = str.replace(accent[i], noaccent[i]);
	}
	return str;
}

//==============================
function printSection(eltid)
//==============================
{
	var node_type = UICom.structure.ui[eltid.substring(6)].asmtype;
	if (node_type=='asmUnit' || node_type=='asmStructure' || node_type=='asmRoot')
		window.print();
	else {
		/*
		$("#wait-window").show();
		$("#print-window").html("");
		var divcontent = $(eltid).clone();
		var ids = $("*[id]", divcontent);
		$(ids).removeAttr("id");
		var content = $(divcontent).html();
		$("#print-window").html(content);
		$("#main-container").addClass("section2hide");
		$("#print-window").addClass("section2print");
		$("#wait-window").hide();
		
		window.print();
		$("#print-window").removeClass("section2print");
		$("#main-container").removeClass("section2hide");
		$("#print-window").css("display", "none");
		*/
		printElement(eltid,'main-container');
	}
}

//==============================
function printElement(eltid,eltids2hide)
//==============================
{
	$("#wait-window").show();
	$("#print-window").html("");
	var divcontent = $(eltid).clone();
	var ids = $("*[id]", divcontent);
	$(ids).removeAttr("id");
	var content = $(divcontent).html();
	$("#print-window").html(content);
	printPopupBox('#print-window',eltids2hide);
	$("#print-window").css("display", "none");

}

//==============================
function printPopupBox(eltid,eltids2hide)
//==============================
{
	$("#wait-window").show();
	var items = eltids2hide.split(";");
	for (var i=0; i<items.length; i++){
		$("#"+items[i]).addClass("section2hide");
	}	
	$(eltid).addClass("section2print");
	$("#wait-window").hide();	
	window.print();
	$(eltid).removeClass("section2print");
	for (var i=0; i<items.length; i++){
		$("#"+items[i]).removeClass("section2hide");
	}	
}

//==================================
function filesReceptionMessage(filename)
//==================================
{
	var message = karutaStr[LANG]['file']+": "+filename;
	message += "<br/>"+karutaStr[LANG]['uploaded-by']+": "+USER.firstname+" "+USER.lastname;
	message += "<br/>"+karutaStr[LANG]['date']+": "+new Date().toLocaleString();
	$('#message-window-body').html(message);
	var js1 = "javascript:$('#message-window').modal('hide')";
//	var js2 = "printPopupBox('#message-window','main-container;edit-window')";
	var js2 = "printElement('#message-window-body','main-container;edit-window;message-window')";
	var footer = "<div class='buttons'><button class='btn' onclick=\""+js2+";\">"+karutaStr[LANG]["button-print"]+"</button> <button class='btn' onclick=\""+js1+";\">"+karutaStr[LANG]['Close']+"</button></div> ";
	document.getElementById('message-window-footer').innerHTML = footer;
	$('#message-window').modal('show');
}

//==================================
function addautocomplete(input,arrayOfValues) {
//==================================
	var currentFocus;
	input.addEventListener("input", function(e) {
		var a, b, i, val = this.value.substring(this.value.lastIndexOf(" ")+1);
		closeAllLists();
		if (!val) { return false;}
	 	currentFocus = -1;
		a = document.createElement("DIV");
		a.setAttribute("id", this.id + "autocomplete-list");
		a.setAttribute("class", "autocomplete-items");
		this.parentNode.appendChild(a);
		for (i = 0; i < arrayOfValues.length; i++) {
			var indexval = arrayOfValues[i].libelle.toUpperCase().indexOf(val.toUpperCase());
			if (indexval>-1) {
				b = document.createElement("DIV");
				b.innerHTML = arrayOfValues[i].libelle.substr(0, indexval);
				b.innerHTML += "<strong>" + arrayOfValues[i].libelle.substr(indexval,val.length) + "</strong>";
				b.innerHTML += arrayOfValues[i].libelle.substr(indexval+val.length);
				b.innerHTML += "<input type='hidden' label=\""+arrayOfValues[i].libelle+"\" >";
				b.addEventListener("click", function(e) {
					if (input.value.lastIndexOf(" "))
						input.value = input.value.substring(0,input.value.lastIndexOf(" ")+1) + $("input",this).attr('label');
					else
						input.value = $("input",this).attr('label');
					$(input).change();
					closeAllLists();
				});
				a.appendChild(b);
			}
		}
	});
	input.addEventListener("keydown", function(e) {
		var x = document.getElementById(this.id + "autocomplete-list");
		if (x) x = x.getElementsByTagName("div");
		if (e.keyCode == 40) {
			currentFocus++;
		addActive(x);
		} else if (e.keyCode == 38) { //up
			currentFocus--;
			addActive(x);
		} else if (e.keyCode == 13) {
			e.preventDefault();
			if (currentFocus > -1) {
				if (x) x[currentFocus].click();
			}
		}
	});
	function addActive(x) {
		if (!x) return false;
		removeActive(x);
		if (currentFocus >= x.length) currentFocus = 0;
		if (currentFocus < 0) currentFocus = (x.length - 1);
		x[currentFocus].classList.add("autocomplete-active");
	}
	function removeActive(x) {
		for (var i = 0; i < x.length; i++) {
			x[i].classList.remove("autocomplete-active");
		}
	}
	function closeAllLists(elmnt) {
		var x = document.getElementsByClassName("autocomplete-items");
		for (var i = 0; i < x.length; i++) {
			if (elmnt != x[i] && elmnt != input) {
				x[i].parentNode.removeChild(x[i]);
			}
		}
	}
	document.addEventListener("click", function (e) {
		closeAllLists(e.target);
	});
}
