function readSingleFile(evt) {
    //Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0];

    if(f){
    	var r = new FileReader();
    		r.onload = function(e) {
    			var contents = e.target.result;
    			switchParam(contents);
    		}
    	r.readAsText(f);
    } else {
    	alert("Failed to load file");
    }
}


function switchSingleQuery(){
	var queryToSwitch = document.getElementById("queryTextArea").value ;
	switchParam( queryToSwitch) ;
}


function showHideTextArea( showHide){
	document.getElementById("queryTextAreaTR").style.display = showHide.checked?"block" : "none" ;
}

var i=0, k=0;
var table = "";
function switchParam(textFile){
	i=0, k=0;
		table = "<table border='1' id='tracerTable'>";

	var connectionsArr = textFile.split("ooo Connection Opened");

	for( i ; i<connectionsArr.length ; i++){
		selectQueryParam( connectionsArr[i])
	}
	table += "</table>";
	document.getElementById("theDiv").innerHTML = table;
}

var trIndex=0;
function selectQueryParam( queries){
	var subQuery = queries.split('\n');
	for( k=1 ; k<subQuery.length-1 ; k++){
		if(subQuery[k] != ''  && typeof subQuery[k+3] != 'undefined'){
			if(subQuery[k].indexOf('[DEBUG]') != -1 ){
				var indexOfExec = subQuery[k].indexOf('Executing');
				if(indexOfExec == -1)
				{
					indexOfExec = subQuery[k].indexOf('Preparing');
				}
					if(indexOfExec != -1){
						indexOfExec+=11;
						if(subQuery[k].indexOf('==>') != -1){
							var eachQuery = subQuery[k].substring(indexOfExec);
							var indexOfParam = subQuery[k+3].indexOf('Parameters')+11;
							var eachParam = subQuery[k+3].substring(indexOfParam);
								table += "<tr id='tableRow_"+(trIndex++)+"' onmouseover='colorRow(this)' onmouseout='unColorRow(this)' onclick='selectRow(this)'>";
							fillParamsInQuery( eachQuery, eachParam);
								table += "</tr>" ;
						}
						else{
							table += "<tr id='tableUpperRow_"+(trIndex++)+"' ><td></td><td>"+subQuery[k].split(" ")[5]+" ("+subQuery[k-1].substring(1,subQuery[k-1].indexOf(']'))+")</td></tr>";
						}
					}
					k+=2;
				}//end if 2
			}//end if 1
	}//end for
}

function showHideTr(obj){
	if( obj.nextSibling.style.display == "block" )
		obj.nextSibling.style.display = "none" ;
	else
		obj.nextSibling.style.display = "block" ;
}

function fillParamsInQuery( queryArray, paramArray){
	var splitEachParam = paramArray.split(',');
	var tmpString = '', generalString ='';
	var index = 0, j=0;
	var queryArrayLen = queryArray.length ;
	for(var a=index ; a<queryArrayLen ; a++){
		if(queryArray[a] == '?'){
			tmpString = queryArray.substring(index, a+1);
			generalString += tmpString.replace( '?', trimParam(splitEachParam[j])) ;
			index = a+1;
			j++;
		}
	}
	if(index < queryArrayLen)
		generalString += queryArray.substring(index, queryArrayLen-1);

	table += "<td title='Parameters :"+paramArray+"' style='cursor: pointer;' ><span><input type='button' value='Beautify' onclick='openBeautifer(this);'/></span>"+i+"</td>";
	table += "<td><textarea id='textQuery_"+trIndex+"' rows='3' style='cursor: default;' cols='150'>"+generalString+"</textarea></td>";
}


function trimParam( paramArray){
	if( paramArray.indexOf('(') != -1){
		if( paramArray.indexOf('(String)') != -1 || paramArray.indexOf('(Timestamp)') != -1)
			return '\'' + paramArray.substring(1, paramArray.indexOf('(')) + '\''
		else
			return  paramArray.substring(0, paramArray.indexOf('('))
	}
	else
		return paramArray;
}

function colorRow( obj){
	if(selectedRowIndex != obj.rowIndex)
		document.getElementById('tableRow_'+obj.rowIndex).cells[0].style.backgroundColor = 'lightBlue';
}

function unColorRow(obj){
	if(selectedRowIndex != obj.rowIndex){
		document.getElementById('tableRow_'+obj.rowIndex).cells[0].style.backgroundColor = 'steelBlue';
	}
}


var selectedRowIndex=-1 ;
function selectRow(obj){
	if(selectedRowIndex !=-1){
		document.getElementById('tableRow_'+selectedRowIndex).cells[0].style.backgroundColor = 'steelBlue';
		document.getElementById('tableRow_'+selectedRowIndex).cells[0].style.fontWeight = 'normal';
	}

	selectedRowIndex=obj.rowIndex
	document.getElementById('tableRow_'+selectedRowIndex).cells[0].style.backgroundColor = 'blue';
	document.getElementById('tableRow_'+selectedRowIndex).cells[0].style.fontWeight = 'bold';

	getCopyText();
}

function openBeautifer( thisTD){
	var query = thisTD.parentElement.parentElement.nextSibling.children[0].innerHTML;
	var beautifiedQuery = beautifyTheQuery( query.toUpperCase());

	window.showModalDialog("formatWindow.html", beautifiedQuery, "status:no;dialogHeight:700px;dialogWeight:100px;");
}


var formattedText = "";
function beautifyTheQueryy( queryField){
	if( queryField.indexOf('FROM')!=-1){
		formattedText += beautifyTheQuery( queryField.substring(queryField.indexOf('FROM')!=-1));
	}
	else
		formattedText += queryField;
	return formattedText;
}

function beautifyTheQuery( queryField){
	var formattedText = "";
	var stepCount = 1;
	var isSubQuery = false;
	for(var i=0 ; i<queryField.length ; i+=stepCount)
	{
		var instantChar = queryField[i];
		stepCount = 1;
		if(instantChar == ' ' && instantChar == 'F' && queryField[i+1] == 'R' && queryField[i+2] == 'O' && queryField[i+3] == 'M'){
			formattedText += "\n" ;
			if(isSubQuery)
				formattedText += "\t" +"   ";
			formattedText += "  FROM ";
			stepCount = 5;
			continue;
		}else
			if(instantChar == 'O' && queryField[i+1] == 'R' && queryField[i+2] == 'D' && queryField[i+3] == 'E' && queryField[i+4] == 'R' && queryField[i+5] == ' ' && queryField[i+6] == 'B' && queryField[i+7] == 'Y'){
				formattedText += "\n" ;
				if(isSubQuery)
					formattedText += "\t" +"  ";
				formattedText += " ORDER BY ";
				stepCount = 9;
				continue;
			}else
				if(instantChar == 'W' && queryField[i+1] == 'H' && queryField[i+2] == 'E' && queryField[i+3] == 'R' && queryField[i+4] == 'E'){
					formattedText +=  "\n" ;
					if(isSubQuery)
						formattedText += "\t" + "   ";
					formattedText += " WHERE ";
					stepCount = 6;
					continue;
				}else
					if(instantChar == 'A' && queryField[i+1] == 'N' && queryField[i+2] == 'D' && queryField[i+3] == ' '){
						formattedText += "\n" ;
						if(isSubQuery)
							formattedText += "\t" +"   ";
						formattedText += "   AND ";
						stepCount = 4;
						continue;
				}else
					if(instantChar == ' ' && queryField[i+1] == 'S' && queryField[i+2] == 'E' && queryField[i+3] == 'T' && queryField[i+4] == ' '){
						formattedText += "\n" ;
						formattedText += "SET ";
						stepCount = 5;
						continue;
				}else
					if(instantChar == ' ' && queryField[i+1] == 'V' && queryField[i+2] == 'A' && queryField[i+3] == 'L' && queryField[i+4] == 'U' && queryField[i+5] == 'E' && queryField[i+6] == 'S'){
						formattedText += "\n" ;
						formattedText += "VALUES";
						stepCount = 7;
						continue;
				}else
					if(instantChar == 'G' && queryField[i+1] == 'R' && queryField[i+2] == 'O' && queryField[i+3] == 'U' && queryField[i+4] == 'P' && queryField[i+5] == ' ' && queryField[i+6] == 'B' && queryField[i+7] == 'Y'){
						formattedText += "\n";
						if(isSubQuery)
							formattedText += "\t" +" ";
						formattedText += "GROUP BY";
						stepCount = 8;
						continue;
				}else
					if(instantChar == 'U' && queryField[i+1] == 'N' && queryField[i+2] == 'I' && queryField[i+3] == 'O' && queryField[i+4] == 'N' && queryField[i+5] == ' '){
						formattedText += "\n\nUNION \n\n";
						stepCount = 6;
						continue;
				}else
					if(instantChar == '(' && queryField[i+1]+queryField[i+2]+queryField[i+3]+queryField[i+4] != 'NOLO'){
						formattedText += instantChar ;
						stepCount = 1;
						isSubQuery = true;
						continue;
				}else
					if(instantChar == ')' && queryField[i-1] != 'K'){
						formattedText = formattedText  + instantChar ;
						stepCount = 1;
						isSubQuery = false;
						continue;
				}else
					if(instantChar == ','){
						if(isSubQuery)
							formattedText += "\t" +"\t";
						formattedText += "\n" + "\t" + instantChar;
						stepCount = 1;
						continue;
				}else
					formattedText += instantChar ;

	}
	return formattedText;
}


function getCopyText(){
	var target = document.getElementById('textQuery_'+(selectedRowIndex+1))
	createSelection(0, target.innerHTML.length, target);
}


function createSelection(start, end, field) {
	if( field.createTextRange ) {//IE
		/*
	        IE calculates the end of selection range based
	        from the starting point.
	        Other browsers will calculate end of selection from
	        the beginning of given text node.
		 */

		var newend = end - start;
		var selRange = field.createTextRange();
	        selRange.collapse(true);
	        selRange.moveStart("character", start);
	        selRange.moveEnd("character", newend);
	        selRange.select();
	    }
	else if( field.setSelectionRange ){
        field.setSelectionRange(start, end);
    }
    field.focus();
}


document.getElementById('fileinput').addEventListener('change', readSingleFile, false);