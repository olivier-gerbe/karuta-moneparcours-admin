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

/// Check namespace existence
if( UIFactory === undefined )
{
  var UIFactory = {};
}



/// Define our type
//==================================
UIFactory["Get_Resource"] = function(node,condition)
//==================================
{
	this.clause = "xsi_type='Get_Resource'";
	if (condition!=null)
		this.clause = condition;
	this.id = $(node).attr('id');
	this.node = node;
	this.type = 'Get_Resource';
	this.code_node = $("code",$("asmResource["+this.clause+"]",node));
	this.value_node = $("value",$("asmResource["+this.clause+"]",node));
	this.label_node = [];
	for (var i=0; i<languages.length;i++){
		this.label_node[i] = $("label[lang='"+languages[i]+"']",$("asmResource["+this.clause+"]",node));
		if (this.label_node[i].length==0) {
			if (i==0 && $("label",$("asmResource["+this.clause+"]",node)).length==1) { // for WAD6 imported portfolio
				this.label_node[i] = $("text",$("asmResource["+this.clause+"]",node));
			} else {
				var newelement = createXmlElement("label");
				$(newelement).attr('lang', languages[i]);
				$("asmResource["+this.clause+"]",node)[0].appendChild(newelement);
				this.label_node[i] = $("label[lang='"+languages[i]+"']",$("asmResource["+this.clause+"]",node));
			}
		}
	}
	this.text_node = [];
	for (var i=0; i<languages.length;i++){
		this.text_node[i] = $("text[lang='"+languages[i]+"']",$("asmResource["+this.clause+"]",node));
		if (this.text_node[i].length==0) {
			var newelement = createXmlElement("text");
			$(newelement).attr('lang', languages[i]);
			$("asmResource["+this.clause+"]",node)[0].appendChild(newelement);
			this.text_node[i] = $("text[lang='"+languages[i]+"']",$("asmResource["+this.clause+"]",node));
		}
	}
	this.encrypted = ($("metadata",node).attr('encrypted')=='Y') ? true : false;
	if (this.clause=="xsi_type='Get_Resource'")
		this.multilingual = ($("metadata",node).attr('multilingual-resource')=='Y') ? true : false;
	else // asmUnitStructure - Get_Resource
		this.multilingual = ($("metadata",node).attr('multilingual-node')=='Y') ? true : false;
	this.inline = ($("metadata",node).attr('inline')=='Y') ? true : false;
	this.display = {};
	this.displayCode = {};
	this.displayValue = {};
	this.multiple = "";
	this.queryattr_value = $("metadata-wad",node).attr('query');
};

//==================================
UIFactory["Get_Resource"].prototype.getAttributes = function(type,langcode)
//==================================
{
	var result = {};
	//---------------------
	if (langcode==null)
		langcode = LANGCODE;
	if (this.multilingual!=undefined && !this.multilingual)
		langcode = 0;
	//---------------------
	if (dest!=null) {
		this.display[dest]=langcode;
	}
	//---------------------
	if (type==null)
		type = 'default';
	//---------------------
	if (type=='default') {
		result['restype'] = this.type;
		result['value'] = this.value_node.text();
		result['code'] = this.code_node.text();
		result['portfoliocode'] = this.portfoliocode_node.text();
		result['label'] = this.label_node[langcode].text();
	}
	return result;
}

/// Display

//==================================
UIFactory["Get_Resource"].prototype.getCode = function(dest)
//==================================
{
	if (dest!=null) {
		this.displayCode[dest] = true;
	}
	return this.code_node.text();
};

//==================================
UIFactory["Get_Resource"].prototype.getValue = function(dest)
//==================================
{
	if (dest!=null) {
		this.displayValue[dest] = true;
	}
	return this.value_node.text();
};

//==================================
UIFactory["Get_Resource"].prototype.getView = function(dest,type,langcode,indashboard)
//==================================
{
	//---------------------
	if (indashboard==null)
		indashboard = false;
	//---------------------
	if (langcode==null)
		langcode = LANGCODE;
	//---------------------
	if (!this.multilingual)
		langcode = NONMULTILANGCODE;
	//---------------------
	if (dest!=null) {
		this.display[dest] = langcode;
	}
	var text = this.text_node[langcode].text();
	if (this.encrypted)
		text = decrypt(text.substring(3),g_rc4key);
	var label = this.label_node[langcode].text();
	if (this.encrypted)
		label = decrypt(label.substring(3),g_rc4key);
	var code = $(this.code_node).text();
	var html = "";
	if (label.indexOf("resource:")>-1) {
		var elts = label.split("|");
		try {
			html += UICom.structure["ui"][elts[0].substring(9)].resource.getView();
		}
		catch(e) {
			var semtag = elts[1].substring(7);
			// search for resource uuid
			var res_node = $("asmContext:has(metadata[semantictag='"+semtag+"']):has(code:contains('"+code+"'))",g_portfolio_current);

			var resid = $($(res_node)[0]).attr('id');
			for (var i=0; i<languages.length;i++){
				this.label_node[i].text('resource:'+resid+'|semtag:'+semtag);
			}
			if (resid!=undefined) {
			//update get_resource
			this.save();
			html += UICom.structure["ui"][resid].resource.getView();
			}
		}
	} else {
		html += "<div class='"+cleanCode(code)+" view-div' style='";
		if (indashboard)
			html += "background-position:center;";
		if (this.queryattr_value != undefined && this.queryattr_value.indexOf("CNAM")>-1)
			html += "font-weight:bold;"
		html += "'>";
		if (code.indexOf("#")>-1 || (this.queryattr_value != undefined && this.queryattr_value.indexOf("CNAM")>-1))
			html += cleanCode(code) + " ";
		if (code.indexOf("%")<0) {
			if (label.indexOf("fileid-")>-1)
				html += UICom.structure["ui"][label.substring(7)].resource.getView();
			else
				html += label;
		}
		if (code.indexOf("&")>-1)
			html += " ["+$(this.value_node).text()+ "] ";
		html += "</div>";
		if (this.queryattr_value != undefined && this.queryattr_value.indexOf("CNAM")>-1){
			html += text;
		}

	}
	return html;
};

//==================================
UIFactory["Get_Resource"].prototype.displayView = function(dest,type,langcode)
//==================================
{
	//---------------------
	if (langcode==null)
		langcode = LANGCODE;
	//---------------------
//	this.multilingual = ($("metadata",this.node).attr('multilingual-resource')=='Y') ? true : false;
	if (!this.multilingual)
		langcode = NONMULTILANGCODE;
	//---------------------
	if (dest!=null) {
		this.display[dest] = langcode;
	}
	var text = this.text_node[langcode].text();
	if (this.encrypted)
		text = decrypt(text.substring(3),g_rc4key);
	var label = this.label_node[langcode].text();
	if (this.encrypted)
		label = decrypt(label.substring(3),g_rc4key);
	var code = $(this.code_node).text();
	var html = "";
	html += "<div class='"+cleanCode(code)+"'"
	if (this.queryattr_value != undefined && this.queryattr_value.indexOf("CNAM")>-1)
		html += " style='font-weight:bold' "
	html += ">";
	if (code.indexOf("#")>-1 || (this.queryattr_value != undefined && this.queryattr_value.indexOf("CNAM")>-1))
		html += cleanCode(code) + " ";
	if (code.indexOf("%")<0)
		html += label;
	if (code.indexOf("&")>-1)
		html += " ["+$(this.value_node).text()+ "] ";
	html += "</div>";
	html += "<div class='"+cleanCode(code)+"'>";
	if (code.indexOf("#")>-1)
		html += cleanCode(code) + " ";
	if (code.indexOf("%")<0)
		html += text;
	if (code.indexOf("&")>-1)
		html += " ["+$(this.value_node).text()+ "] ";
	html += "</div>";
	if (this.queryattr_value != undefined && this.queryattr_value.indexOf("CNAM")>-1){
		html += text;
	}
	$("#"+dest).html("");
	$("#"+dest).append($(html));
};


/// Editor
//==================================
UIFactory["Get_Resource"].update = function(selected_item,itself,langcode,type)
//==================================
{
	var value = $(selected_item).attr('value');
	var code = $(selected_item).attr('code');
	var text = "";
	//---------------------
	if (itself.encrypted)
		value = "rc4"+encrypt(value,g_rc4key);
	if (itself.encrypted)
		code = "rc4"+encrypt(code,g_rc4key);
	//---------------------
	$(itself.value_node[0]).text(value);
	$(itself.code_node[0]).text(code);
	//------------CNAM----------------------------
	if (itself.queryattr_value != undefined && itself.queryattr_value.indexOf("CNAM")>-1) {
		if (code!='') {
			var srce_indx = itself.queryattr_value.lastIndexOf('.');
			var srce = itself.queryattr_value.substring(srce_indx+1);
			var semtag_indx = itself.queryattr_value.substring(0,srce_indx).lastIndexOf('.');
			var semtag = itself.queryattr_value.substring(semtag_indx+1,srce_indx);
			var target = itself.queryattr_value.substring(srce_indx+1); // label or text
			var url = serverBCK+"/cnam/";
			url+= semtag+"/"+code;
			$.ajax({
				type : "GET",
				dataType : "json",
				url : url,
				success : function(data) {
					if (typeof eval("data."+target) === "undefined")
						text = "";
					else
						text = eval("data."+target).replace(/"/g, "'");						
					//----------------------------------------
					for (var i=0; i<languages.length;i++){
						var label = $(selected_item).attr('label_'+languages[i]);
						//---------------------
						if (itself.encrypted) {
							label = "rc4"+encrypt(label,g_rc4key);
							text = "rc4"+encrypt(text,g_rc4key);
						}
						//---------------------
						$(itself.label_node[i][0]).text(label);
						$(itself.text_node[i][0]).text(text);
					}
					itself.save();
				}
			});
		} else { // re-init
			//----------------------------------------
			for (var i=0; i<languages.length;i++){
				var label = "";
				$(itself.label_node[i][0]).text(label);
				$(itself.text_node[i][0]).text(text);
			}
			itself.save();
		}
	} else {
		for (var i=0; i<languages.length;i++){
			var label = $(selected_item).attr('label_'+languages[i]);
			//---------------------
			if (itself.encrypted) {
				label = "rc4"+encrypt(label,g_rc4key);
				text = "rc4"+encrypt(text,g_rc4key);
			}
			//---------------------
			$(itself.label_node[i][0]).text(label);
			$(itself.text_node[i][0]).text(text);
		}
		itself.save();
		}
};

//==================================
UIFactory["Get_Resource"].prototype.displayEditor = function(destid,type,langcode,disabled,cachable,resettable)
//==================================
{

	var multiple_tags = "";
	if (cachable==undefined || cachable==null)
		cachable = true;
	if (type==undefined || type==null)
		type = $("metadata-wad",this.node).attr('seltype');
	var queryattr_value = $("metadata-wad",this.node).attr('query');
	this.queryattr_value = queryattr_value; // update if changed
	if (this.multiple!=""){
		multiple_tags = this.multiple.substring(this.multiple.indexOf('/')+1);
		queryattr_value = this.multiple.substring(0,this.multiple.indexOf('/'));
		type = 'multiple';
	}
	if (queryattr_value!=undefined && queryattr_value!='') {
		//------------
		var srce_indx = queryattr_value.lastIndexOf('.');
		var srce = queryattr_value.substring(srce_indx+1);
		var semtag_indx = queryattr_value.substring(0,srce_indx).lastIndexOf('.');
		var semtag = queryattr_value.substring(semtag_indx+1,srce_indx);
		var target = queryattr_value.substring(srce_indx+1); // label or text
		//------------
		var portfoliocode = queryattr_value.substring(0,semtag_indx);
		// ==============================================================================
		if (portfoliocode.indexOf("ROME")>-1){  // ==== ROME =====
			var self = this;
			if (cachable && g_Get_Resource_caches[queryattr_value]!=undefined && g_Get_Resource_caches[queryattr_value]!="")
				UIFactory["Get_Resource"].parseROME(destid,type,langcode,g_Get_Resource_caches[queryattr_value],self,disabled,srce,resettable,target,semtag,multiple_tags);
			else {
				$.ajax({
					type : "GET",
					dataType : "json",
					url : serverBCK+"/rome/"+semtag,
					success : function(data) {
						if (cachable)
							g_Get_Resource_caches[queryattr_value] = data;
						UIFactory["Get_Resource"].parseROME(destid,type,langcode,data,self,disabled,srce,resettable,target,semtag,multiple_tags);
					}
				});
			}
		} else if  (portfoliocode.indexOf("CNAM")>-1){  // ==== CNAM =====
			var self = this;
			if (cachable && g_Get_Resource_caches[queryattr_value]!=undefined && g_Get_Resource_caches[queryattr_value]!="")
				UIFactory["Get_Resource"].parseCNAM(destid,type,langcode,g_Get_Resource_caches[queryattr_value],self,disabled,srce,resettable,target,semtag,multiple_tags);
			else {
				$.ajax({
					type : "GET",
					dataType : "json",
					url : serverBCK+"/cnam/"+semtag,
					success : function(data) {
						if (cachable)
							g_Get_Resource_caches[queryattr_value] = data;
						UIFactory["Get_Resource"].parseCNAM(destid,type,langcode,data,self,disabled,srce,resettable,target,semtag,multiple_tags);
					}
				});
			}
		// ==============================================================================
		} else {	// ==== KARUTA =====
			var selfcode = $("code",$("asmRoot>asmResource[xsi_type='nodeRes']",UICom.root.node)).text();
			if (portfoliocode.indexOf('.')<0 && selfcode.indexOf('.')>0 && portfoliocode!='self')  // There is no project, we add the project of the current portfolio
				portfoliocode = selfcode.substring(0,selfcode.indexOf('.')) + "." + portfoliocode;
			if (portfoliocode=='self') {
				portfoliocode = selfcode;
				cachable = false;
			}
			//------------
			var self = this;
			if (cachable && g_Get_Resource_caches[queryattr_value]!=undefined && g_Get_Resource_caches[queryattr_value]!="")
				UIFactory["Get_Resource"].parse(destid,type,langcode,g_Get_Resource_caches[queryattr_value],self,disabled,srce,resettable,target,semtag,multiple_tags);
			else {
				$.ajax({
					type : "GET",
					dataType : "xml",
					url : serverBCK_API+"/nodes?portfoliocode=" + portfoliocode + "&semtag="+semtag,
					success : function(data) {
						if (cachable)
							g_Get_Resource_caches[queryattr_value] = data;
						UIFactory["Get_Resource"].parse(destid,type,langcode,data,self,disabled,srce,resettable,target,semtag,multiple_tags);
					}
				});
			}
			
		}
		/*		var selfcode = $("code",$("asmRoot>asmResource[xsi_type='nodeRes']",UICom.root.node)).text();
		if (portfoliocode.indexOf('.')<0 && selfcode.indexOf('.')>0 && portfoliocode!='self')  // There is no project, we add the project of the current portfolio
			portfoliocode = selfcode.substring(0,selfcode.indexOf('.')) + "." + portfoliocode;
		if (portfoliocode=='self') {
			portfoliocode = selfcode;
			cachable = false;
		}
		//------------
		var self = this;
		if (cachable && g_Get_Resource_caches[queryattr_value]!=undefined && g_Get_Resource_caches[queryattr_value]!="")
			UIFactory["Get_Resource"].parse(destid,type,langcode,g_Get_Resource_caches[queryattr_value],self,disabled,srce,resettable,target,semtag,multiple_tags);
		else
			$.ajax({
				type : "GET",
				dataType : "xml",
				url : serverBCK_API+"/nodes?portfoliocode=" + portfoliocode + "&semtag="+semtag,
				success : function(data) {
					if (cachable)
						g_Get_Resource_caches[queryattr_value] = data;
					UIFactory["Get_Resource"].parse(destid,type,langcode,data,self,disabled,srce,resettable,target,semtag,multiple_tags);
				}
			});
*/
	}
};


//==================================
UIFactory["Get_Resource"].parse = function(destid,type,langcode,data,self,disabled,srce,resettable,target,semtag,multiple_tags) {
//==================================
	//---------------------
	if (langcode==null)
		langcode = LANGCODE;
	if (!self.multilingual)
		langcode = NONMULTILANGCODE;
	if (disabled==null)
		disabled = false;
	if (resettable==null)
		resettable = true;
	//---------------------
	if (target=='resource')
		srce = 'label';
	//---------------------
	var self_code = $(self.code_node).text();
	if (self.encrypted)
		self_code = decrypt(self_code.substring(3),g_rc4key);
	//---------------------
	if (type==undefined || type==null)
		type = 'select';
	//-----Node ordering-------------------------------------------------------
	var nodes = $("node",data);
	var tableau1 = new Array();
	for ( var i = 0; i < $(nodes).length; i++) {
		var resource = null;
		if ($("asmResource",nodes[i]).length==3)
			resource = $("asmResource[xsi_type!='nodeRes'][xsi_type!='context']",nodes[i]); 
		else
			resource = $("asmResource[xsi_type='nodeRes']",nodes[i]);
		var code = $('code',resource).text();
		tableau1[i] = [code,nodes[i]];
	}
	var newTableau1 = tableau1.sort(sortOn1);
	//------------------------------------------------------------
	if (type=='select') {
		var html = "<div class='btn-group choice-group select-"+semtag+"'>";		
		html += "<button type='button' class='btn btn-default select select-label' id='button_"+self.id+"'>&nbsp;</button>";
		html += "<button type='button' class='btn btn-default dropdown-toggle select' data-toggle='dropdown' aria-expanded='false'><span class='caret'></span><span class='sr-only'>&nbsp;</span></button>";
		html += "</div>";
		var btn_group = $(html);
		$("#"+destid).append($(btn_group));
		html = "<ul class='dropdown-menu' role='menu'></ul>";
		var select  = $(html);
		if (resettable) //----------------- null value to erase
			html = "<li></li>";
		else
			html ="";
		var select_item = $(html);
		html = "<a  value='' code='' ";
		for (var j=0; j<languages.length;j++) {
			html += "label_"+languages[j]+"='&nbsp;' ";
		}
		html += ">";
		html += "&nbsp;</a>";
		var select_item_a = $(html);
		$(select_item_a).click(function (ev){
			$("#button_"+self.id).html($(this).attr("label_"+languages[langcode]));
			$("#button_"+self.id).attr('class', 'btn btn-default select select-label');
			UIFactory["Get_Resource"].update(this,self,langcode);
		});
		$(select_item).append($(select_item_a))
		$(select).append($(select_item));
		//---------------------
		if (target=='label') {
			for ( var i = 0; i < newTableau1.length; i++) {
				//------------------------------
				var resource = null;
				if ($("asmResource",newTableau1[i][1]).length==3)
					resource = $("asmResource[xsi_type!='nodeRes'][xsi_type!='context']",newTableau1[i][1]); 
				else
					resource = $("asmResource[xsi_type='nodeRes']",newTableau1[i][1]);
				//------------------------------
				var code = $('code',resource).text();
				var display_code = false;
				var display_label = true;
				if (code.indexOf("$")>-1) 
					display_label = false;
				if (code.indexOf("@")<0) {
					display_code = true;
				}
				code = cleanCode(code);
				//------------------------------
				if ($('code',resource).text().indexOf('----')>-1) {
					html = "<li class='divider'></li><li></li>";
				} else {
					html = "<li></li>";
				}
				var select_item = $(html);
				html = "<a  value='"+$('value',resource).text()+"' code='"+$('code',resource).text()+"' class='sel"+code+"' ";
				for (var j=0; j<languages.length;j++){
					html += "label_"+languages[j]+"=\""+$(srce+"[lang='"+languages[j]+"']",resource).text()+"\" ";
				}
				html += ">";
				if (display_code)
					html += "<span class='li-code'>"+code+"</span>";
				if (display_label)
					html += "<span class='li-label'>"+$(srce+"[lang='"+languages[langcode]+"']",resource).text()+"</span>";
				html += "</a>";			
				var select_item_a = $(html);
				$(select_item_a).click(function (ev){
					//--------------------------------
					var code = $(this).attr('code');
					var display_code = false;
					var display_label = true;
					if (code.indexOf("$")>-1) 
						display_label = false;
					if (code.indexOf("@")<0) {
						display_code = true;
					}
					code = cleanCode(code);
					//--------------------------------
					var html = "";
					if (display_code)
						html += code+" ";
					if (display_label)
						html += $(this).attr("label_"+languages[langcode]);
					$("#button_"+self.id).html(html);
					$("#button_"+self.id).attr('class', 'btn btn-default select select-label').addClass("sel"+code);
					UIFactory["Get_Resource"].update(this,self,langcode);
					//--------------------------------
				});
				$(select_item).append($(select_item_a))
				//-------------- update button -----
				if (code!="" && self_code==$('code',resource).text()) {
					var html = "";
					if (display_code)
						html += code+" ";
					if (display_label)
						html += $(srce+"[lang='"+languages[langcode]+"']",resource).text();
					$("#button_"+self.id).html(html);
					$("#button_"+self.id).attr('class', 'btn btn-default select select-label').addClass("sel"+code);
				}
				$(select).append($(select_item));
			}
		}
		//---------------------
		if (target=='text') {
			for ( var i = 0; i < newTableau1.length; i++) {
				var resource = $("asmResource[xsi_type!='nodeRes'][xsi_type!='context']",newTableau1[i][1]); 
				html = "<li></li>";
				var select_item = $(html);
				html = "<a  value='"+$('value',resource).text()+"' code='"+$('code',resource).text()+"' class='sel"+code+"' ";
				for (var j=0; j<languages.length;j++){
					html += "label_"+languages[j]+"=\""+$(srce+"[lang='"+languages[j]+"']",resource).text()+"\" ";
				}
				html += ">";
				
				html += $(srce+"[lang='"+languages[langcode]+"']",resource).text()+"</a>";
				var select_item_a = $(html);
				$(select_item_a).click(function (ev){
					$("#button_"+self.id).html($(this).attr("label_"+languages[langcode]));
					$("#button_"+self.id).attr('class', 'btn btn-default select select-label').addClass("sel"+code);
					UIFactory["Get_Resource"].update(this,self,langcode);
				});
				$(select_item).append($(select_item_a))
				$(select).append($(select_item));
			}
		}
		if (target=='fileid') {
			for ( var i = 0; i < newTableau1.length; i++) {
				var uuid = $(newTableau1[i][1]).attr('id');
				var resource = $("asmResource[xsi_type!='nodeRes'][xsi_type!='context']",newTableau1[i][1]);
				//------------------------------
				var code = $('code',resource).text();
				var display_code = false;
				var display_label = true;
				if (code.indexOf("$")>-1) 
					display_label = false;
				if (code.indexOf("@")<0) {
					display_code = true;
				}
				code = cleanCode(code);
				//------------------------------
				if ($('code',resource).text().indexOf('----')>-1) {
					html = "<li class='divider'></li><li></li>";
				} else {
					html = "<li></li>";
				}
				var select_item = $(html);
				html = "<a  value='"+$('value',resource).text()+"' code='"+$('code',resource).text()+"' class='sel"+code+"' ";
				for (var j=0; j<languages.length;j++){
					html += "label_"+languages[j]+"=\"fileid-"+uuid+"\" ";
				}
				html += ">";
				
				if (display_code)
					html += code+" ";
				if (display_label)
					html += UICom.structure["ui"][uuid].resource.getView(null,'span');
				var select_item_a = $(html);
				$(select_item_a).click(function (ev){
					$("#button_"+self.id).html(UICom.structure["ui"][$(this).attr("label_"+languages[langcode]).substring(7)].resource.getView());
					$("#button_"+self.id).attr('class', 'btn btn-default select select-label').addClass("sel"+code);
					UIFactory["Get_Resource"].update(this,self,langcode);
				});
				$(select_item).append($(select_item_a))
				$(select).append($(select_item));
				//-------------- update button -----
				if (code!="" && self_code==$('code',resource).text()) {
					var html = "";
					if (display_code)
						html += code+" ";
					if (display_label)
						html += UICom.structure["ui"][uuid].resource.getView(null,'span');
					$("#button_"+self.id).html(html);
					$("#button_"+self.id).attr('class', 'btn btn-default select select-label').addClass("sel"+code);
				}
			}
		}
		if (target=='resource') {
			for ( var i = 0; i < newTableau1.length; i++) {
				var uuid = $(newTableau1[i][1]).attr('id');
				var resource = $("asmResource[xsi_type!='nodeRes'][xsi_type!='context']",newTableau1[i][1]);
				//------------------------------
				var code = $('code',resource).text();
				var display_code = false;
				var display_label = true;
				if (code.indexOf("$")>-1) 
					display_label = false;
				if (code.indexOf("@")<0) {
					display_code = true;
				}
				code = cleanCode(code);
				//------------------------------
				if ($('code',resource).text().indexOf('----')>-1) {
					html = "<li class='divider'></li><li></li>";
				} else {
					html = "<li></li>";
				}
				var select_item = $(html);
				html = "<a  value='"+semtag+"' code='"+$('code',resource).text()+"' class='sel"+code+"' ";
				for (var j=0; j<languages.length;j++){
					html += "label_"+languages[j]+"=\"resource:"+uuid + "|semtag:"+semtag+"\" ";
				}
				html += ">";
				
				if (display_code)
					html += code+" ";
				if (display_label)
					html += UICom.structure["ui"][uuid].resource.getView(null,'span');
				var select_item_a = $(html);
				$(select_item_a).click(function (ev){
					$("#button_"+self.id).html(UICom.structure["ui"][$(this).attr("label_"+languages[langcode]).substring(7)].resource.getView());
					$("#button_"+self.id).attr('class', 'btn btn-default select select-label').addClass("sel"+code);
					UIFactory["Get_Resource"].update(this,self,langcode);
				});
				$(select_item).append($(select_item_a))
				$(select).append($(select_item));
				//-------------- update button -----
				if (code!="" && self_code==$('code',resource).text()) {
					var html = "";
					if (display_code)
						html += code+" ";
					if (display_label)
						html += UICom.structure["ui"][uuid].resource.getView(null,'span');
					$("#button_"+self.id).html(html);
					$("#button_"+self.id).attr('class', 'btn btn-default select select-label').addClass("sel"+code);
				}
			}
		}		//---------------------
		$(btn_group).append($(select));
	}
	//------------------------------------------------------------
	if (type.indexOf('radio')>-1) {
		//----------------- null value to erase
		if (resettable) {
			var radio_obj = $("<div class='get-radio'></div>");
			var input = "";
			input += "<input type='radio' name='radio_"+self.id+"' value='' code='' ";
			if (disabled)
				input +="disabled='disabled' ";
			for (var j=0; j<languages.length;j++){
				input += "label_"+languages[j]+"='&nbsp;'";
			}
			if (self_code=='')
				input += " checked ";
			input += ">&nbsp;&nbsp;";
			input += "</input>";
			var obj = $(input);
			$(obj).click(function (){
				UIFactory["Get_Resource"].update(this,self,langcode,type);
			});
			$(radio_obj).append(obj);
			$("#"+destid).append(radio_obj);
		}
		//-------------------
		for ( var i = 0; i < newTableau1.length; i++) {
			var uuid = $(newTableau1[i][1]).attr('id');
			var radio_obj = $("<div class='get-radio'></div>");
			var input = "";
			//------------------------------
			var resource = null;
			if ($("asmResource",newTableau1[i][1]).length==3)
				resource = $("asmResource[xsi_type!='nodeRes'][xsi_type!='context']",newTableau1[i][1]); 
			else
				resource = $("asmResource[xsi_type='nodeRes']",newTableau1[i][1]);
			//------------------------------
			var code = $('code',resource).text();
			var display_code = false;
			var display_label = true;
			if (code.indexOf("$")>-1) 
				display_label = false;
			if (code.indexOf("@")<0) {
				display_code = true;
			}
			code = cleanCode(code);
			//------------------------------
			input += "<input type='radio' name='radio_"+self.id+"' value='"+$('value',resource).text()+"' code='"+$('code',resource).text()+"' ";
			if (disabled)
				input +="disabled='disabled' ";
			for (var j=0; j<languages.length;j++){
				if (target=='fileid' || target=='resource') {
					if (target=='fileid')
						input += "label_"+languages[j] + "=\"" + target + "-" + uuid + "\" ";
					else
						input += "label_"+languages[j] + "=\"" + target + ":" + uuid + "|semtag:"+semtag+"\" ";
				} else 
					input += "label_"+languages[j]+"=\""+$(srce+"[lang='"+languages[j]+"']",resource).text()+"\" ";
			}
			if (code!="" && self_code==$('code',resource).text())
				input += " checked ";
			input += ">&nbsp;&nbsp;";
			input += "<div  class='sel"+code+" radio-div'>"
			if (display_code)
				input += code + " ";
			if (display_label){
				if (target=='label')
					input += $(srce+"[lang='"+languages[langcode]+"']",resource).text();
				if (target=='fileid')
					input += UICom.structure["ui"][uuid].resource.getView(null,'span');
			}
			input += "</div></input>";
			var obj = $(input);
			$(obj).click(function (){
				UIFactory["Get_Resource"].update(this,self,langcode,type);
			});
			$(radio_obj).append(obj);
			$("#"+destid).append(radio_obj);
		}
	}
	//------------------------------------------------------------
	if (type.indexOf('click')>-1) {
		var inputs = "<div class='click'></div>";
		var inputs_obj = $(inputs);
		//----------------- null value to erase
		if (resettable){
			var input = "";
			input += "<div name='click_"+self.id+"' value='' code='' class='click-item";
			if (self_code=="")
				input += " clicked";
			input += "' ";
			for (var j=0; j<languages.length;j++){
				input += "label_"+languages[j]+"='&nbsp;' ";
			}
			input += "> ";
			input +="<span  class=''>&nbsp;</span></div>";
			var input_obj = $(input);
			$(input_obj).click(function (){
				$('.clicked',inputs_obj).removeClass('clicked');
				$(this).addClass('clicked');
				UIFactory["Get_Resource"].update(this,self,langcode,type);
			});
			$(inputs_obj).append(input_obj);
		}
		//-----------------------
		for ( var i = 0; i < newTableau1.length; ++i) {
			var input = "";
			var resource = null;
			if ($("asmResource",newTableau1[i][1]).length==3)
				resource = $("asmResource[xsi_type!='nodeRes'][xsi_type!='context']",newTableau1[i][1]); 
			else
				resource = $("asmResource[xsi_type='nodeRes']",newTableau1[i][1]);
			//------------------------------
			var code = $('code',resource).text();
			var display_code = false;
			var display_label = true;
			if (code.indexOf("$")>-1) 
				display_label = false;
			if (code.indexOf("@")<0) {
				display_code = true;
			}
			code = cleanCode(code);
			//------------------------------
			input += "<div name='click_"+self.id+"' value='"+$('value',resource).text()+"' code='"+$('code',resource).text()+"' class='click-item";
			if (self_code==$('code',resource).text())
				input += " clicked";
			input += "' ";
			for (var j=0; j<languages.length;j++){
				input += "label_"+languages[j]+"=\""+$("label[lang='"+languages[j]+"']",resource).text()+"\" ";
			}
			input += "> ";
			input += "<span  class='"+code+"'>"
			if (display_code)
				input += code + " ";
			if (display_label)
				input += $(srce+"[lang='"+languages[langcode]+"']",resource).text();
			input += "</span></div>";
			var input_obj = $(input);
			$(input_obj).click(function (){
				$('.clicked',inputs_obj).removeClass('clicked');
				$(this).addClass('clicked');
				UIFactory["Get_Resource"].update(this,self,langcode,type);
			});
			$(inputs_obj).append(input_obj);
		}
		$("#"+destid).append(inputs_obj);
		//------------------------------------------------------------
	}
	//------------------------------------------------------------
	if (type.indexOf('multiple')>-1) {
		//------------------------
		var inputs = "<div id='get_multiple' class='multiple'></div>";
		var inputs_obj = $(inputs);
		//-----------------------
		for ( var i = 0; i < newTableau1.length; ++i) {
			var uuid = $(newTableau1[i][1]).attr('id');
			var disabled = false;
			var selectable = true;
			var input = "";
			var resource = null;
			if ($("asmResource",newTableau1[i][1]).length==3)
				resource = $("asmResource[xsi_type!='nodeRes'][xsi_type!='context']",newTableau1[i][1]); 
			else
				resource = $("asmResource[xsi_type='nodeRes']",newTableau1[i][1]);
			//------------------------------
			var code = $('code',resource).text();
			var display_code = false;
			var display_label = true;
			if (code.indexOf("$")>-1) 
				display_label = false;
			if (code.indexOf("@")<0) {
				display_code = true;
			}
			if (code.indexOf("?")>-1) {
				disabled = true;
			}
			if (code.indexOf("!")>-1) {
				selectable = false;
			}
			code = cleanCode(code);
			//------------------------------
			input += "<div>";
			if (selectable) {
				input += "	<input type='checkbox' name='multiple_"+self.id+"' value='"+$('value',resource).text()+"' code='"+$('code',resource).text()+"' class='multiple-item";
				input += "' ";
				for (var j=0; j<languages.length;j++){
					if (target=='fileid' || target=='resource') {
						if (target=='fileid')
							input += "label_"+languages[j] + "=\"" + target + "-" + uuid + "\" ";
						else
							input += "label_"+languages[j] + "=\"" + target + ":" + uuid + "|semtag:"+semtag+"\" ";
					} else 
						input += "label_"+languages[j]+"=\""+$(srce+"[lang='"+languages[j]+"']",resource).text()+"\" ";
				}
				if (disabled)
					input += "disabled";
				input += "> ";
			}
			if (display_code)
				input += code + " ";
			input +="<span  class='"+code+"'>"+$(srce+"[lang='"+languages[langcode]+"']",resource).text()+"</span></div>";
			var input_obj = $(input);
			$(inputs_obj).append(input_obj);
		}
		$("#"+destid).append(inputs_obj);
	}
	//------------------------------------------------------------
};

//==================================
UIFactory["Get_Resource"].prototype.save = function()
//==================================
{
	if (this.clause=="xsi_type='Get_Resource'") {
		UICom.UpdateResource(this.id,writeSaved);
		if (!this.inline)
			this.refresh();
	}
	else {// Node - Get_Resource {
		UICom.UpdateNode(this.id);
		UICom.structure.ui[this.id].refresh()
	}	
};

//==================================
UIFactory["Get_Resource"].prototype.refresh = function()
//==================================
{
	for (dest in this.display) {
		$("#"+dest).html(this.getView(null,null,this.display[dest]));
	};
	for (dest in this.displayCode) {
		$("#"+dest).html(this.getCode());
	};
	for (dest in this.displayValue) {
		$("#"+dest).html(this.getValue());
	};
};

//==================================
UIFactory["Get_Resource"].addMultiple = function(parentid,multiple_tags)
//==================================
{
	$.ajaxSetup({async: false});
	var part_code = multiple_tags.substring(0,multiple_tags.indexOf(','));
	var srce = part_code.substring(0,part_code.lastIndexOf('.'));
	var part_semtag = part_code.substring(part_code.lastIndexOf('.')+1);
	var get_resource_semtag = multiple_tags.substring(multiple_tags.indexOf(',')+1);
	var inputs = $("input[name='multiple_"+parentid+"']").filter(':checked');
	// for each one create a part
	var databack = true;
	var callback = UIFactory.Get_Resource.updateaddedpart;
	var param2 = get_resource_semtag;
	var param4 = false;
	for (var j=0; j<inputs.length;j++){
		var param3 = inputs[j];
		if (j==inputs.length-1)
			param4 = true;
		importBranch(parentid,srce,part_semtag,databack,callback,param2,param3,param4);
	}
};

//==================================
UIFactory["Get_Resource"].importMultiple = function(parentid,srce)
//==================================
{
	$.ajaxSetup({async: false});
	var inputs = $("input[name='multiple_"+parentid+"']").filter(':checked');
	// for each one import a part
	var databack = true;
	var callback = UIFactory.Node.reloadUnit;
	for (var j=0; j<inputs.length;j++){
		var code = $(inputs[j]).attr('code');
		if (srce.indexOf("?")>-1){
			var newcode = srce.substring(srce.indexOf(".")+1);
			srce = code;
			if (srce.indexOf("@")>-1) {
				srce =srce.substring(0,srce.indexOf("@"))+srce.substring(srce.indexOf("@")+1);
			}
			if (srce.indexOf("#")>-1) {
				srce = srce.substring(0,srce.indexOf("#"))+srce.substring(srce.indexOf("#")+1);
			}
			if (srce.indexOf("%")>-1) {
				srce = srce.substring(0,srce.indexOf("%"))+srce.substring(srce.indexOf("%")+1);
			}
			if (code.indexOf("$")>-1) {
				display_label = false;
				code = code.substring(0,code.indexOf("$"))+code.substring(code.indexOf("$")+1);
			}
			if (code.indexOf("&")>-1) {
				display_label = false;
				code = code.substring(0,code.indexOf("$"))+code.substring(code.indexOf("&")+1);
			}
			code = newcode;
		}
		importBranch(parentid,encodeURIComponent(srce),encodeURIComponent(code),databack,callback);
	}
};

//==================================
UIFactory["Get_Resource"].updateaddedpart = function(data,get_resource_semtag,selected_item,last)
//==================================
{
	var partid = data;
	var value = $(selected_item).attr('value');
	var code = $(selected_item).attr('code');
	var xml = "<asmResource xsi_type='Get_Resource'>";
	xml += "<code>"+code+"</code>";
	xml += "<value>"+value+"</value>";
	for (var i=0; i<languages.length;i++){
		var label = $(selected_item).attr('label_'+languages[i]);
		xml += "<label lang='"+languages[i]+"'>"+label+"</label>";
	}
	xml += "</asmResource>";
	$.ajax({
		type : "GET",
		dataType : "xml",
		url : serverBCK_API+"/nodes/node/"+partid,
		last : last,
		success : function(data) {
//			var nodeid = $("asmContext:has(metadata[semantictag='"+get_resource_semtag+"'])",data).attr('id');
			var node = $("*:has(metadata[semantictag='"+get_resource_semtag+"'])",data);
			if (node.length==0)
				node = $( ":root",data ); //node itself
			var nodeid = $(node).attr('id');
			var url_resource = serverBCK_API+"/resources/resource/" + nodeid;
			var tagname = $( ":root",data )[ 0 ].nodeName;
			if( "asmRoot" == tagname || "asmStructure" == tagname || "asmUnit" == tagname || "asmUnitStructure" == tagname) {
				xml = xml.replace("Get_Resource","nodeRes");
				url_resource = serverBCK_API+"/nodes/node/" + nodeid + "/noderesource";
			}
			$.ajax({
				type : "PUT",
				contentType: "application/xml",
				dataType : "text",
				data : xml,
				last : this.last,
				url : url_resource,
				success : function(data) {
					if (this.last) {
						$('#edit-window').modal('hide');
						UIFactory.Node.reloadUnit();
					}
				}
			});
		}
	});

}

//==================================
function get_multiple(parentid,title,query,partcode,get_resource_semtag)
//==================================
{
	var langcode = LANGCODE;
	//---------------------
	var js1 = "javascript:$('#edit-window').modal('hide')";
	var js2 = "UIFactory.Get_Resource.addMultiple('"+parentid+"','"+partcode+","+get_resource_semtag+"')";
	var footer = "<button class='btn' onclick=\""+js2+";\">"+karutaStr[LANG]['Add']+"</button> <button class='btn' onclick=\""+js1+";\">"+karutaStr[LANG]['Close']+"</button>";
	$("#edit-window-footer").html(footer);
	$("#edit-window-title").html(title);
	var html = "<div id='get-resource-node'></div>";
	$("#edit-window-body").html(html);
	$("#edit-window-body-node").html("");
	$("#edit-window-type").html("");
	$("#edit-window-body-metadata").html("");
	$("#edit-window-body-metadata-epm").html("");
	var getResource = new UIFactory["Get_Resource"](UICom.structure["ui"][parentid].node,"xsi_type='nodeRes'");
	getResource.multiple = query+"/"+partcode+","+get_resource_semtag;
	getResource.displayEditor("get-resource-node");
	$('#edit-window').modal('show');

}

//==================================
function import_multiple(parentid,title,query,partcode,get_resource_semtag)
//==================================
{
	var langcode = LANGCODE;
	//---------------------
	var js1 = "javascript:$('#edit-window').modal('hide')";
	var js2 = "UIFactory.Get_Resource.importMultiple('"+parentid+"','"+partcode+"')";
	var footer = "<button class='btn' onclick=\""+js2+";\">"+karutaStr[LANG]['Add']+"</button> <button class='btn' onclick=\""+js1+";\">"+karutaStr[LANG]['Close']+"</button>";
	$("#edit-window-footer").html(footer);
	$("#edit-window-title").html(title);
	var html = "<div id='get-resource-node'></div>";
	$("#edit-window-body").html(html);
	$("#edit-window-body-node").html("");
	$("#edit-window-type").html("");
	$("#edit-window-body-metadata").html("");
	$("#edit-window-body-metadata-epm").html("");
	var getResource = new UIFactory["Get_Resource"](UICom.structure["ui"][parentid].node,"xsi_type='nodeRes'");
	getResource.multiple = query+"/"+partcode+","+get_resource_semtag;
	getResource.displayEditor("get-resource-node");
	$('#edit-window').modal('show');

}

//==================================
UIFactory["Get_Resource"].parseROME = function(destid,type,langcode,data,self,disabled,srce,resettable,target,semtag,multiple_tags) {
//==================================
	//---------------------
	if (langcode==null)
		langcode = LANGCODE;
	if (!self.multilingual)
		langcode = NONMULTILANGCODE;
	if (disabled==null)
		disabled = false;
	if (resettable==null)
		resettable = true;
	//---------------------
	if (type==undefined || type==null)
		type = 'select';
	//---------------------
	var cachable = true;
	var langcode = LANGCODE;
	var semtag = 'rome';
	var display_code = true;
	var display_label = true;
	var self_code = $(self.code_node).text();
	//-----Node ordering-------------------------------------------------------
	var newTableau1 = data;
	//------------------------------------------------------------
	if (type=='select') {
		var html ="";
		html += "<form autocomplete='off'>";
		html += "</form>";
		var form = $(html);
		html = "";
		html += "<div class='auto-complete btn-group roles-choice'>";
		html += "<input id='input_"+self.id+"' type='text' class='btn btn-default select select-rome' code= '' value=''>";
		html += "<button type='button' class='btn btn-default dropdown-toggle select' data-toggle='dropdown' aria-expanded='false'><span class='caret'></span><span class='sr-only'>&nbsp;</span></button>";
		html += "</div>";
		var btn_group = $(html);
		$(form).append($(btn_group));
		$("#"+destid).append(form);
		var onupdate = "UIFactory.Get_Resource.update(input,self)";
		autocomplete(document.getElementById("input_"+self.id), newTableau1,onupdate,self,langcode);
		//-------------------------------------------------
		html = "<ul class='dropdown-menu' role='menu'></ul>";
		var select  = $(html);
		//---------------------
		var code = "";
		var label = "";
		html = "<li></li>";
		var select_item = $(html);
		html = "<a  value='' code='"+code+"' class='sel"+code+"' label_fr=\""+label+"\" >";
		if (display_code)
			html += "<span class='li-code'>"+code+"</span>";
		if (display_label)
			html += "<span class='li-label'>"+label+"</span>";
		html += "</a>";			
		var select_item_a = $(html);
		$(select_item_a).click(function (ev){
			//--------------------------------
			var code = $(this).attr('code');
			var display_code = false;
			var display_label = true;
			//--------------------------------
			var html = "";
			if (display_code)
				html += code+" ";
			if (display_label)
				html += $(this).attr("label_fr");
			$("#input_"+self.id).attr('value',html);
			UIFactory["Get_Resource"].update(this,self,langcode);
			//--------------------------------
		});
		$(select_item).append($(select_item_a))
		$(select).append($(select_item));
		//---------------------
		for ( var i = 0; i < newTableau1.length; i++) {
			//------------------------------
			var code = newTableau1[i].code;
			var label = newTableau1[i].libelle;
			html = "<li></li>";
			var select_item = $(html);
			html = "<a  value='' code='"+code+"' class='sel"+code+"' label_fr=\""+label+"\" >";
			if (display_code)
				html += "<span class='li-code'>"+code+"</span>";
			if (display_label)
				html += "<span class='li-label'>"+label+"</span>";
			html += "</a>";			
			var select_item_a = $(html);
			$(select_item_a).click(function (ev){
				//--------------------------------
				var code = $(this).attr('code');
				var display_code = false;
				var display_label = true;
				//--------------------------------
				var html = "";
				if (display_code)
					html += code+" ";
				if (display_label)
					html += $(this).attr("label_fr");
				$("#input_"+self.id).attr('value',html);
				UIFactory["Get_Resource"].update(this,self,langcode);
				//--------------------------------
			});
			$(select_item).append($(select_item_a))
			$(select).append($(select_item));
			//-------------- update button -----
			if (code!="" && self_code==code) {
				var html = "";
				if (display_code)
					html += code+" ";
				if (display_label)
					html += label;
				$("#button_"+self.id).html(html);
			}
		}
		//---------------------
		$(btn_group).append($(select));
	}
	if (type=='completion') {
		var html ="";
		html += "<form autocomplete='off'>";
		html += "</form>";
		var form = $(html);
		html = "";
		html += "<div class='auto-complete btn-group roles-choice'>";
		html += "<input id='input_"+self.id+"' type='text' class='btn btn-default select select-rome' code= '' value=''>";
		html += "<button type='button' class='btn btn-default dropdown-toggle select' data-toggle='dropdown' aria-expanded='false'><span class='caret'></span><span class='sr-only'>&nbsp;</span></button>";
		html += "</div>";
		var btn_group = $(html);
		$(form).append($(btn_group));
		$("#"+destid).append(form);
		var onupdate = "UIFactory.Get_Resource.update(inp,self)";
		autocomplete(document.getElementById("input_"+self.id), newTableau1,onupdate,self,langcode);
		//===============
		html = "<ul class='dropdown-menu' role='menu'></ul>";
		var select  = $(html);
		//---------------------
		for ( var i = 0; i < newTableau1.length; i++) {
			//------------------------------
			var code = newTableau1[i].code;
			var label = newTableau1[i].libelle;
			html = "<li></li>";
			var select_item = $(html);
			html = "<a  value='' code='"+code+"' class='sel"+code+"' label_fr=\""+label+"\" >";
			if (display_code)
				html += "<span class='li-code'>"+code+"</span>";
			if (display_label)
				html += "<span class='li-label'>"+label+"</span>";
			html += "</a>";			
			var select_item_a = $(html);
			$(select_item_a).click(function (ev){
				//--------------------------------
				var code = $(this).attr('code');
				var display_code = false;
				var display_label = true;
				//--------------------------------
				var html = "";
				if (display_code)
					html += code+" ";
				if (display_label)
					html += $(this).attr("label_fr");
				$("#input_"+self.id).attr("value",html);
				UIFactory["Get_Resource"].update(this,self,langcode);
				//--------------------------------
			});
			$(select_item).append($(select_item_a))
			$(select).append($(select_item));
			//-------------- update button -----
			if (code!="" && self_code==code) {
				var html = "";
				if (display_code)
					html += code+" ";
				if (display_label)
					html += label;
				$("#input_"+self.id).attr("value",html);
			}
		}
		//---------------------
		$(btn_group).append($(select));
	}
}

//==================================
UIFactory["Get_Resource"].parseCNAM = function(destid,type,langcode,data,self,disabled,srce,resettable,target,semtag,multiple_tags) {
//==================================
	//---------------------
	if (langcode==null)
		langcode = LANGCODE;
	if (!self.multilingual)
		langcode = NONMULTILANGCODE;
	if (disabled==null)
		disabled = false;
	if (resettable==null)
		resettable = true;
	//---------------------
	if (type==undefined || type==null)
		type = 'select';
	//---------------------
	var cachable = true;
	var langcode = LANGCODE;
	var semtag = 'cnam';
	var display_code = true;
	var display_label = true;
	var self_code = $(self.code_node).text();
	//-----Node ordering-------------------------------------------------------
	var tableau1 = data;
	//------------------------------------------------------------
	$('#wait-window').modal('hide');
	if (type=='select') {
		var newTableau2 = [];
		var html ="";
		html += "<form autocomplete='off'>";
		html += "</form>";
		var form = $(html);
		html = "";
		html += "<div class='auto-complete btn-group roles-choice'>";
		html += "<input id='input_"+self.id+"' type='text' class='btn btn-default select select-rome' code= '' value=''>";
		html += "<button type='button' class='btn btn-default dropdown-toggle select' data-toggle='dropdown' aria-expanded='false'><span class='caret'></span><span class='sr-only'>&nbsp;</span></button>";
		html += "</div>";
		var btn_group = $(html);
		$(form).append($(btn_group));
		$("#"+destid).append(form);
		//-------------------------------------------------
		html = "<ul class='dropdown-menu' role='menu'></ul>";
		var select  = $(html);
		//---------------------
		html = "<li></li>";
		var select_item = $(html);
		html = "<a  value='' code='' label_fr='&nbsp;' >&nbsp;</a>";
		var select_item_a = $(html);
		$(select_item_a).click(function (ev){
			//--------------------------------
			var code = $(this).attr('code');
			var display_code = true;
			var display_label = true;
			//--------------------------------
			var html = "";
			if (display_code)
				html += code+" ";
			if (display_label)
				html += $(this).attr("label_fr");
			$("#input_"+self.id).attr("value",html);
			UIFactory["Get_Resource"].update(this,self,langcode);
			//--------------------------------
		});
		$(select_item).append($(select_item_a))
		$(select).append($(select_item));
		var sortFonction = sortJsonOnCode;
		if (tableau1[0].code==undefined)
			sortFonction = sortJsonOnCodeInterne;
		var newTableau1 = tableau1.sort(sortFonction);
		//---------------------
		for ( var i = 0; i < newTableau1.length; i++) {
			//------------------------------
			var code = (newTableau1[i].code==undefined)?newTableau1[i].code_interne:newTableau1[i].code;
			var label = (newTableau1[i].intitule==undefined)?newTableau1[i].intitule_officiel:newTableau1[i].intitule;
			newTableau2.push({'code':code,'libelle':code+" - "+label});
			html = "<li></li>";
			var select_item = $(html);
			html = "<a  value='' code='"+code+"' class='sel"+code+"' label_fr=\""+label+"\" >";
			if (display_code)
				html += "<span class='li-code'>"+code+"</span>";
			if (display_label)
				html += "<span class='li-label'>"+label+"</span>";
			html += "</a>";			
			var select_item_a = $(html);
			$(select_item_a).click(function (ev){
				//--------------------------------
				var code = $(this).attr('code');
				var display_code = true;
				var display_label = true;
				//--------------------------------
				var html = "";
				if (display_code)
					html += code+" ";
				if (display_label)
					html += $(this).attr("label_fr");
				$("#input_"+self.id).attr("value",html);
				UIFactory["Get_Resource"].update(this,self,langcode);
				//--------------------------------
			});
			$(select_item).append($(select_item_a))
			$(select).append($(select_item));
			//-------------- update button -----
			if (code!="" && self_code==code) {
				var html = "";
				if (display_code)
					html += code+" ";
				if (display_label)
					html += label;
				$("#input_"+self.id).attr("value",html);
			}
		}
		//---------------------
		$(btn_group).append($(select));
		var onupdate = "UIFactory.Get_Resource.update(input,self)";
		autocomplete(document.getElementById("input_"+self.id), newTableau2,onupdate,self,langcode);
}
	if (type=='completion') {
		var newTableau2 = [];
		var html ="";
		html += "<form autocomplete='off'>";
		html += "</form>";
		var form = $(html);
		html = "";
		html += "<div class='auto-complete btn-group roles-choice'>";
		html += "<input id='input_"+self.id+"' type='text' class='btn btn-default select select-cnam' code= '' value=''>";
		html += "<button type='button' class='btn btn-default dropdown-toggle select' data-toggle='dropdown' aria-expanded='false'><span class='caret'></span><span class='sr-only'>&nbsp;</span></button>";
		html += "</div>";
		var btn_group = $(html);
		$(form).append($(btn_group));
		$("#"+destid).append(form);
		//===============
		html = "<ul class='dropdown-menu' role='menu'></ul>";
		var select  = $(html);
		//---------------------
		for ( var i = 0; i < newTableau1.length; i++) {
			//------------------------------
			var code = newTableau1[i].code;
			var label = newTableau1[i].intitule;
			newTableau2.push({'code':code,'libelle':label});
			html = "<li></li>";
			var select_item = $(html);
			html = "<a  value='' code='"+code+"' class='sel"+code+"' label_fr=\""+label+"\" >";
			if (display_code)
				html += "<span class='li-code'>"+code+"</span>";
			if (display_label)
				html += "<span class='li-label'>"+label+"</span>";
			html += "</a>";			
			var select_item_a = $(html);
			$(select_item_a).click(function (ev){
				//--------------------------------
				var code = $(this).attr('code');
				var display_code = false;
				var display_label = true;
				//--------------------------------
				var html = "";
				if (display_code)
					html += code+" ";
				if (display_label)
					html += $(this).attr("label_fr");
				$("#input_"+self.id).attr("value",html);
				UIFactory["Get_Resource"].update(this,self,langcode);
				//--------------------------------
			});
			$(select_item).append($(select_item_a))
			$(select).append($(select_item));
			//-------------- update button -----
			if (code!="" && self_code==code) {
				var html = "";
				if (display_code)
					html += code+" ";
				if (display_label)
					html += label;
				$("#input_"+self.id).attr("value",html);
			}
		}
		//---------------------
		$(btn_group).append($(select));
		var onupdate = "UIFactory.Get_Resource.update(input,self)";
		autocomplete(document.getElementById("input_"+self.id), newTableau2,onupdate,self,langcode);
	}
}

