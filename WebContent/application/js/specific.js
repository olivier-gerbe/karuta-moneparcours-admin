document.write("<link href='https://fonts.googleapis.com/css?family=Montserra' rel='stylesheet'/>");

//------ EXEC BATCH AT USER CREATION ------------------
var g_execbatch = true;
var g_execbatchbuttonlabel1 = [];
	g_execbatchbuttonlabel1['fr'] = "Patience! Création de votre portfolio ...";
var g_json = {};

//=======================
function prepareBatch()
//=======================
{
	var today=new Date();
	var annee = today.getFullYear();
	var mois = today.getMonth() + 1;
	if (mois<10)
		mois = "0"+mois;
	// ---- global variables ---------
	g_json['model_code'] = "modeles-cnam.batch-creation";
	g_json['diploma_begin'] = annee+"-"+mois;
	// ---- local variables ---------
	g_json['lines'] = [];
	g_json.lines[0] =
	{
		"auditeurUsername" : USER.username,
		"auditeurCourriel" : USER.email,
		"auditeurNomFamille" : USER.lastname,
		"auditeurPrenom" : USER.firstname,
	};
}//----------------------------------------------------
