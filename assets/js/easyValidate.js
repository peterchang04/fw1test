/*
 * GOAL:
 * Speed up development by streamlining validation programming
 * Make validation programming easy, consolidating different practices
 * leverage the commonalities of inputs based on the Minerva framework to reduce errors caused by bad data entry.
 * 
 * FEATURES:
 * Input scrubbing validation based on attribute:"Validate"
 * Format placeholders for input.timepicker and input.calendarSelectDate
 * Guided entry for input.timepickerj and input.calendarSelectDate
 * Immediate validation feedback when required or format is violated (red box + red label if applicable)
 * Automatically adds * to inputs / selects that are required
 * Automatically validates forms containing easyValidate inputs.
 * Compatible with existing validation / page questions.
 * Required works with <c:hidden /> looks for corresponding label / field for * and highlights
 * 
 * INSTRUCTIONS:
 * give inputs to cleanse an attribute of "validate" e.g. <input name="x" value="" validate="required" />
 * give additional classes depending on flavor of input cleansing wanted. e.g. class="EasyValidateMoneyPositive"
 * 
 * OPT OUT:
 * Just put a hidden input anywhere on the page with name "noEasyValidate". e.g. <input type="hidden" name="noEasyValidate"/> or <c:hidden name="noEasyValidate />
 * and page easyValidate will not init.
 * 
 * VOCABULARY:
 * required : adds a * to form field. Highlight field if focusout and left blank
 * maxlength* : string.length limited e.g. "EasyValidateMaxlength10" is ignored when coupled with number-ish words
 * maximum* : maximum number value. supports decimals but not negative #s
 * minimum* : see above
 * uppercase : is ignored when coupled with number-ish words
 * lowercase : see above
 * integer : is ignored when coupled with "money"
 * positive : self explanitory
 * money : self explanitory
 * time : formats input in HH:MM PM format
 * date : datepickers
 * number : not always necessary. using "positive" or "money" will auto add this word
 * username : exclude specials but allow period and underscore
 * 
 * UTILITY FUNCTIONS:
 * init();
 * addValidation($input,'#vocab#');
 * removeValidation($input,'#vocab#');
 * validateForm($form); // this calls addMessage but does not show.
 * 
 * Required js: validation.js + System.js
 */

/*
 * TODO:
 * Fix modal form intercept to use Validation.js
 * check all comments to see if relevant to updates
 * rename the parameters in consistent fashion. thisInput and $thisInput
 * refactor the vocabulary to another js file for 
 * add word: sqlSafe
 * add simple arithmetic ready inputs e.g. 1+2 or 4/3
 */

$(function(){
	EasyValidate.init();
	$(document).bind('modal:opened',EasyValidate.init); // init for new modals
	$(document).bind('modal:tab_loaded',EasyValidate.init); // init for modals with tabs
	$(document).bind('modal:prepared',function(){
		EasyValidate.init();
	});
	$(document).bind('validation:start',function(event){
		if($('form[name="'+event.formName+'"]').length > 0){
			EasyValidate.validateForm($('form[name="'+event.formName+'"]')); // form questions trigger this event so easyValidate can piggyback off it.
		} else{
			EasyValidate.validateForm(document.getElementsByName(event.formName)); // form questions trigger this event so easyValidate can piggyback off it.
		}
	});
});
	
var EasyValidate = {
	lastDateInput: "", // keeps track of input history
	
	validateForm: function(thisForm) {
		if(!(thisForm instanceof $)){thisForm = $(thisForm);} // flexible function works with normal dom objects
		var thisFormName = thisForm.attr('name') || thisForm.attr('id');
		Validation.removeValidation(thisFormName);
		var $thisForm = thisForm;
		$thisForm.find('[validate*=required]').each(function(){
			var $thisInput = $(this);
			if($thisInput.is(":radio")){
				var thisName = $thisInput.attr('name');
				var messageName = $thisInput.closest("div.container").find('div.label').find("label").attr('title');;
				if(!jQuery('input[name='+thisName+']').is(":checked")){
					Validation.addMessage(thisFormName,this.name,messageName + ' is required.');
				}
			} else{
				var thisName = $thisInput.attr('title') || $thisInput.attr('label') || $thisInput.attr('name') || $thisInput.attr('id');
				thisName = thisName.replace(":","");
				var thisValue = $thisInput.val() || "";
				if(thisValue == ""){
					Validation.addMessage(thisFormName,this.name,thisName + ' is required.');
				}
			}
		});
		$thisForm.find('input[validate*=time]').each(function(){
			var $thisInput = $(this);
			var thisName = $thisInput.attr('title') || $thisInput.attr('name') || $thisInput.attr('id');
			if($thisInput.val() != "" && !Validation.time($thisInput.val())){
				Validation.addMessage(thisFormName,$thisInput.attr('name'),thisName + ' is not a valid time (HH:MM PM).');
			}
		});
		$thisForm.find('input[validate*=date]').each(function(){
			var $thisInput = $(this);
			var thisName = $thisInput.attr('title') || $thisInput.attr('name') || $thisInput.attr('id');
			if($thisInput.val() != "" && !Validation.date($thisInput.val())){
				Validation.addMessage(thisFormName,$thisInput.attr('name'),thisName + ' is not a valid date (MM/DD/YYYY).');
			}
		});
		$thisForm.find('input[validate*=email]').each(function(){
			var $thisInput = $(this);
			var thisName = $thisInput.attr('title') || $thisInput.attr('name') || $thisInput.attr('id');
			if($thisInput.val() != "" && $thisInput.data('error_mailGun')){
				Validation.addMessage(thisFormName,$thisInput.attr('name'),thisName + ' is not valid.');
			}
		});
		$thisForm.find('[validate*=fail]').each(function(){
			var $thisInput = $(this);
			var thisName = $thisInput.attr('title') || $thisInput.attr('name') || $thisInput.attr('id');
			Validation.addMessage(thisFormName,$thisInput.attr('name'),thisName + ' failed validation.');
		});
		if(Validation.hasMessages(thisFormName)){
			Validation.showMessages(thisFormName);
			return false;
		} else {
			return true;
		}
	},
	
	init: function() {
		var disable = $('input[name=noEasyValidate]');
		if(disable.length == 0){
			// first get all disabled inputs and enable them (so visible to jQuery). re-enable after classes / types are scrubbed. 
			var disabled = $('input:disabled');
			disabled.attr('disabled','');
			
			// set asterisks for modal load.
			$('span.asterisk.required').remove();
			try{
				var requiredLabels = Validation.requiredLabels;
				Validation.requiredLabels = {};
				for (var fieldName in requiredLabels) {
					EasyValidate.addAsterisk($('#'+fieldName));
				}
			} catch(e) {
				// do nothing//
			}

			// identify calendar and time inputs, add validate to them.
			var $calendarInputs = $('input.calendarSelectDate'); // all the date inputs
			$calendarInputs.each(function(){
				EasyValidate.addValidation(this,'date',true);
			});
			//$calendarInputs.attr('placeholder','mm/dd/yyyy');
			
			var $timeInputs = $('input.time_picker'); // all the time inputs
			$timeInputs.each(function(){
				EasyValidate.addValidation(this,'time',true);
			});
			//$timeInputs.attr('placeholder','hh:mm APM');
			
			var $emailInputs = $('input[type=email]'); // all the email inputs
			$emailInputs.each(function(){
				EasyValidate.addValidation(this,'email',true);
				$(this).on('input propertychange', function() {
					var thisInput = $(this);
					EasyValidate.emailInputChange(thisInput=thisInput);
				});
			});

			var $userInputs = $('input[validate="username"]'); // all the user name inputs
			$userInputs.each(function(){
				EasyValidate.addValidation(this,'username',true);
			});
			
			var $telInputs = $('input[type=tel]'); // all the telephone inputs
			$telInputs.each(function(){
				EasyValidate.addValidation(this,'phone',true);
			});
			
			// add all "class=money" to validate
			var $moneyInputs = $('input[class*=money]');
			$moneyInputs.each(function(){
				EasyValidate.addValidation(this,'money',true);
			});
			// add all "type=number" to validate
			var $numberInputs = jQuery('input[type*=number]').not('[possible_score]');
			$numberInputs.each(function(){
				$(this).get(0).type = 'text'; // scrub all numbers for webkit spinners
				EasyValidate.addValidation(this,'number',true);
			});
			
			try{$('form').undelegate('EasyValidate');}catch(e){/*undelegate existing easyValidate Events */}
			
			// cleanse for inputs with validate
			$('form').delegate('input[validate]','keypress.EasyValidate',keydownEvent = function(e){
				var e = EventKey.get(e);
				var charCode = e.charCode || "";
				if(charCode != ""){
					EasyValidate.inputKeydown(this,e);
				}
			});
			jQuery('form').delegate('input[validate],textarea[validate]','keyup.EasyValidate',keyupEvent = function(e){
				var event = EventKey.get(e);
				if(event.keyName.length == 1 || event.keyName == 'del' || event.keyName == 'bksp'){
					EasyValidate.inputKeyup(this);
				}
			});
			jQuery('form').delegate('input[validate],textarea[validate]','focusout.EasyValidate',focusoutEvent = function(){
				EasyValidate.inputFocusout(this);
			});
			jQuery('form').delegate('input[type=radio][validate],select[validate]','click.EasyValidate',function(){
				EasyValidate.inputFocusout(this);
			});
			
			// add stars to required
			var $requiredInputs = $('[validate*=required]');
			$requiredInputs.each(function(){
				EasyValidate.addAsterisk(this);
			});
			
			disabled.attr('disabled','disabled'); // turn the disabled back to disabled
			
			// store the original value, for readonly fields
			$('[validate*=readonly]').each(function(){
				var $this = $(this);
				$this.data('easyValidate_readonly',$this.val());
			});
		}
	},
	
	addAsterisk: function(thisElement){ // takes in dom or $
		if(!(thisElement instanceof $)){thisElement = $(thisElement);} // flexible function works with normal dom objects
		var name = thisElement.attr('name') || 'noname';
		if (!(name in Validation.requiredLabels)) {
			if(thisElement.is(":radio")){
				var label = thisElement.closest("div.container").find('label#label_for_'+name+'__1');
			} else{
				var label = thisElement.closest("div.container").find('label#label_for_'+name);
			}
			var asterisk = '<span id="'+ name +'_asterisk" class="required asterisk" title="Required">*</span>';
			if(thisElement.attr('type') == 'hidden'){
				label = $('label[for='+name+']');
			}
			if(label.length > 0){
				label.before(asterisk);
			} else {
				//thisElement.before(asterisk);
			}
			Validation.requiredLabels[name] = true;
		}
	},
	
	removeAsterisk: function(thisElement){ // takes in dom or $
		if(!(thisElement instanceof $)){thisElement = $(thisElement);} // flexible function works with normal dom objects
		var name = thisElement.attr('name') || 'noname';
		if ((name in Validation.requiredLabels)) {
			$('#'+name+'_asterisk').remove();
			delete Validation.requiredLabels[name];
		}
	},

	// utility function to get the words for validate,
	getValidateWords: function(thisElement) { // takes in dom or $
		if(!(thisElement instanceof $)){thisElement = $(thisElement);} // flexible function works with normal dom objects
		var wordList = thisElement.attr('validate') || "";
		// remove the float property that sneaks in to this list for whatever reason.
		wordList = wordList.replace("float","");
		wordList = wordList.toLowerCase();
		// if a number word, number filter is prerequisite
		if(wordList.indexOf('number') == -1 && (wordList.indexOf('integer') > -1 || wordList.indexOf('positive') > -1 || wordList.indexOf('money') > -1 || wordList.indexOf('maximum') > -1 || wordList.indexOf('minimum') > -1 || wordList.indexOf('money') > -1)){
			wordList = 'number,' + wordList;
		}
		return wordList;
	},
	
	setInputAndCursor: function(inputString,thisElement) { // relocates the cursor so typing flows naturally for keyup's
		// scrub inputString
		if(inputString == null || inputString === undefined){
			inputString = "";
		}
		
		var position = 0;
		if (document.selection) {
			thisElement.focus ();
			var Sel = document.selection.createRange ();
			Sel.moveStart ('character', -thisElement.value.length);
			position = Sel.text.length;
		} else if (thisElement.selectionStart || thisElement.selectionStart == '0'){
			position = thisElement.selectionStart;
		}
		var offset = inputString.length - $(thisElement).val().length;
		$(thisElement).val(inputString);
		try{
			thisElement.setSelectionRange(position+offset,position+offset);
		}catch(e){
			// do nothing.  sometimes this fails because the element is no longer focused.
		}
	},
	
	getWordNumber: function(svWords,word) {
		var number = "";
		var location = svWords.toLowerCase().indexOf(word.toLowerCase());
		for(var i = location+word.length; i < svWords.length; i++){
			if(isNaN(svWords.charAt(i)) && svWords.charAt(i) != "."){
				break;
			} else {
				number += svWords.charAt(i);
			}
		}
		return number;
	},
	
	addValidation: function(thisElement,word,noupdate) { // will replace existing word including number.  addValidation(this,'Maximum100') to EasyValidateMaximum99 will set the new class = EasyValidateMaximum100
		if(typeof thisElement == 'string'){thisElement = $('[name='+thisElement+']');} // takes in form_name as paramenter too
		if(!(thisElement instanceof $)){thisElement = $(thisElement);} // flexible function works with normal dom objects
		noupdate = noupdate || false; //determines whether a focusout routine is run when word is validated.
		var svWords = EasyValidate.getValidateWords(thisElement);
		word = word.toLowerCase();
		if(word == 'required'){
			EasyValidate.addAsterisk(thisElement);
		}
		var wordToReplace = word;
		if(word.toLowerCase().indexOf('maximum') != -1) {
			wordToReplace = 'maximum' + EasyValidate.getWordNumber(svWords,'maximum');
		}else if(word.toLowerCase().indexOf('minimum') != -1) {
			wordToReplace = 'minimum' + EasyValidate.getWordNumber(svWords,'minimum');
		}else if(word.toLowerCase().indexOf('maxlength') != -1) {
			wordToReplace = 'maxlength' + EasyValidate.getWordNumber(svWords,'maxlength');
		}
		svWords = svWords.replace(wordToReplace+',',"");
		svWords = svWords.replace(wordToReplace,"");
		if(svWords.length > 0 && svWords.charAt(svWords.length-1) != ","){
			svWords += ",";
		}
		thisElement.attr('validate',svWords+word);
		if(!noupdate){
			EasyValidate.inputFocusout(thisElement);
		}
		// for readonly fields, if adding readonly, record the current value for later reference
		if(word == "readonly"){
			thisElement.data('easyValidate_readonly',thisElement.val());
		}
	},
	
	removeValidation: function(thisElement,word,noupdate) {
		if(typeof thisElement == 'string'){thisElement = $('[name='+thisElement+']');} // takes in form_name as paramenter too
		if(!(thisElement instanceof $)){thisElement = $(thisElement);} // flexible function works with normal dom objects
		noupdate = noupdate || false;
		word = word.toLowerCase();
		if(word == 'required'){
			EasyValidate.removeAsterisk(thisElement);
		}
		if(word == 'fail'){
			thisElement.data('error_format',false);
		}
		var svWords = EasyValidate.getValidateWords(thisElement);
		svWords = svWords.replace(word+',',"");
		svWords = svWords.replace(word,"");
		if(svWords.charAt(svWords.length-1)==","){
			svWords = svWords.substring(0,svWords.length-1);
		}
		thisElement.attr('validate',svWords);
		if(!noupdate){
			EasyValidate.inputFocusout(thisElement);
		}
	},
	
	inputHasError:function($thisInput){
		var result = false;
		if($thisInput.data('error_required') || $thisInput.data('error_format') || $thisInput.data('error_fail')){
			result = true;
		}
		return result;
	},
	
	toggleErrorHighlight: function($thisInput) {
		var name = $thisInput.attr('name');
		if($thisInput.is(":radio")){
			var $label = $thisInput.closest("div.container").find('label#label_for_'+name+'__1');
		} else{
			var $label = $thisInput.closest("div.container").find('label#label_for_'+name);
		}
		if($thisInput.attr('type')=='hidden'){
			$label = $('label[for='+name+']')
		}
		if(EasyValidate.inputHasError($thisInput)){
			$thisInput.addClass('validation_required');
			$label.addClass('validation_required');
		} else {
			$thisInput.removeClass('validation_required');
			$label.removeClass('validation_required');
		}
	},
	
	required: function(thisElement){ // validates field for required. Does not prevent submits
		var thisJElement = $(thisElement);
		var thisName = thisJElement.attr('name');
		var thisValue = thisJElement.val() || "";
		if(thisValue == "" || (thisJElement.is(':radio') && !jQuery('input[name='+thisName+']').is(':checked'))){
			thisJElement.data('error_required',true);
			thisJElement.attr('placeholder','required');
		} else {
			thisJElement.data('error_required',false);
			if(thisJElement.hasClass('timePicker')){
				thisJElement.attr('placeholder','hh:mm APM');
			} else if (thisJElement.hasClass('calendarSelectDate')){
				thisJElement.attr('placeholder','mm/dd/yyyy');
			} else {
				thisJElement.attr('placeholder','');
			}
		}
		EasyValidate.toggleErrorHighlight(thisJElement);
	},
	inputKeydown: function(thisInput,event){
		if(!(thisInput instanceof $)){thisInput = $(thisInput);} // flexible function works with normal dom objects
		var svWords = EasyValidate.getValidateWords(thisInput);
		var inputString = thisInput.val();
		if(svWords.match(/maxlength/i) && !EasyValidate.isTextSelected(thisInput)){
			EasyValidate.maxlength(inputString,svWords,event,thisInput);
		}
		if(svWords.match(/number/i)){
			inputString = EasyValidate.number(event); 
		}
		//readonly. works well but doesn't stop deletes. see inputKeyup for that
		if(svWords.match(/readonly/i)){
			event.preventDefault();
		}
		if(svWords.match(/username/i)){
			EasyValidate.usernameKeyDown(event);
		}
	},
	inputKeyup: function(thisInput) {
		if(!(thisInput instanceof $)){thisInput = $(thisInput);} // flexible function works with normal dom objects
		var svWords = EasyValidate.getValidateWords(thisInput);
		var inputString = thisInput.val();
		var originalString = inputString;
		if(svWords.match(/maxlength/i) && !EasyValidate.isTextSelected(thisInput)){
			EasyValidate.maxlengthKeyup(inputString,svWords,thisInput);
		}
		if(svWords.match(/number/i)){
			// moved to keydown
			// inputString = EasyValidate.number(inputString); 
			if(svWords.match(/positive/i)){
				inputString = EasyValidate.positive(inputString);
			}
			if(svWords.match(/negative/i)){
				inputString = EasyValidate.negative(inputString);
			}
			if(svWords.match(/maximum/i)) {
				inputString = EasyValidate.maximum(inputString,svWords);
			}
			if(svWords.match(/integer/i) && !svWords.match(/money/i)){
				inputString = EasyValidate.integer(inputString);
			}
		} else if(svWords.match(/date/i)){	
			inputString = EasyValidate.date(inputString);
		} else {
			if(svWords.match(/uppercase/i)){
				inputString = EasyValidate.uppercase(inputString);
			}
			if(svWords.match(/lowercase/i)){
				inputString = EasyValidate.lowercase(inputString);
			}
			if(svWords.match(/time/i)){
				inputString = EasyValidate.time(inputString);
			}
		}
		//readonly
		if(svWords.match(/readonly/i)){
			inputString = thisInput.data('easyValidate_readonly');
		}
		if(originalString != inputString){ // only overwrite page if inputString has been changed.
			EasyValidate.setInputAndCursor(inputString,thisInput.get(0));
		}
	},
	
	inputFocusout: function(thisInput) {
		if(!(thisInput instanceof $)){thisInput = $(thisInput);} // flexible function works with normal dom objects
		var svWords = EasyValidate.getValidateWords(thisInput);
		var inputString = thisInput.val() || "";
		var originalInputString = inputString;
		if(svWords.match(/number/i)){
			inputString = EasyValidate.numberFocusout(inputString,svWords);
			if(svWords.match(/minimum/i)){
				inputString = EasyValidate.minimumFocusout(inputString,svWords);
			}
			if(svWords.match(/maximum/i)){
				inputString = EasyValidate.maximumFocusout(inputString,svWords);
			}
			if(svWords.match(/money/i)){
				inputString = EasyValidate.moneyFocusout(inputString);
			}
		} else if(svWords.match(/date/i)) {
			inputString = EasyValidate.dateFocusout(thisInput);
		}
		if(svWords.match(/time/i)){
			inputString = EasyValidate.timeFocusout(thisInput);
		}
		if(svWords.match(/phone/i)){
			inputString = EasyValidate.phoneFocusout(thisInput);
		}
		if(svWords.match(/required/i)){
			EasyValidate.required(thisInput);
		} else {
			thisInput.data('error_required',false);
			//thisInput.attr('placeholder','');
			EasyValidate.toggleErrorHighlight(thisInput);
		}
		if(svWords.match(/fail/i)){
			thisInput.data('error_format',true);
		} else{
			thisInput.data('error_format',false);
		}
		if(originalInputString != inputString){
			thisInput.val(inputString);
		}
	},
	
	// User Name cleansing
	usernameKeyDown: function(event){
		switch(true){
			case (event.keyCode > 96 && event.keyCode < 123) : //a-z
				break;
			case (event.keyCode > 64 && event.keyCode < 91) : // A - Z
				break;
			case (event.keyCode > 47 && event.keyCode < 58) : //0-9
				break;
			case (event.keyCode == 95 || event.keyCode == 46) : // _ and .
				break;
			default:
				event.preventDefault();
				break;
		}
	},

	// NUMBER CLEANSING
	number: function(event) { // remove all alpha and symbols except '.' and '-'
		// updated to preventDefault on any non number related keys
		if(false
			|| (event.charCode <= 57 && event.charCode >= 48) // number keys
			|| event.charCode == 45 // minus
			|| event.charCode == 46 // period
		){
			/* proceed*/
		} else {
			event.preventDefault();
		}
	},
		
	integer: function(inputString) {
		return inputString.replace(/[^\d\-]/g,"");
	},
	
	positive: function(inputString) {
		return inputString.replace(/[^\d\.]/g,"");
	},
	negative: function(inputString){
		if(inputString == "-"){
			return inputString;
		}
		inputString = inputString.replace(/[^\d\.]/g,"");
		if(inputString != ""){
			inputString = "-" + inputString
		}
		return inputString;
	},
	maximum: function(inputString,svWords) {
		//find the max number
		var max = "";
		var location = svWords.toLowerCase().indexOf('maximum');
		for(var i = location+7; i < svWords.length; i++){
			if(isNaN(svWords.charAt(i)) && svWords.charAt(i) != "."){
				break;
			} else {
				max += svWords.charAt(i);
			}
		}
		if(svWords.match(/integer/i)){
			max = Math.floor(max) + '';
		} 
		if(max != "" && +inputString > Number(max)){
			inputString = max;
			if(svWords.match(/money/i)){
				inputString = Number(inputString);
				inputString = inputString.toFixed(2);
			}
		}
		return inputString;
	},

	numberFocusout: function(inputString,svWords) {
		// remove multiple '.'
		var periodCount = inputString.split(/\./g).length-1;
		for (var i = 1; i < periodCount; i++) { 
			inputString = inputString.replace(".","");
		}
		// if '-' exists at all.  remove all and prepend string with it.
		var minusCount = inputString.split(/\-/g).length-1;
		if(minusCount > 0){
			for (var i = 0; i < minusCount; i++) { 
				inputString = inputString.replace("-","");
			}
			inputString = '-' + inputString;
			if(inputString == '-'){
				inputString = '';
			}
		}
		if(inputString == '.'){
			inputString = '';
		}
		return inputString;
	},
	
	moneyFocusout: function(inputString) { // do not allow blanks
		if(inputString.length > 0) {
			inputString = Number(inputString).toFixed(2);
		}
		return inputString;
	},
	
	minimumFocusout: function(inputString,svWords) {
		//find the min number
		var min = "";
		var location = svWords.toLowerCase().indexOf('minimum');
		for(var i = location+7; i < svWords.length; i++){
			if(isNaN(svWords.charAt(i)) && svWords.charAt(i) != "."){
				break;
			} else {
				min += svWords.charAt(i);
			}
		}
		if(svWords.match(/integer/i)){
			min = Math.ceil(min) + '';
		} 
		if(inputString != "" && min != "" && +inputString < Number(min)){
			inputString = min;
		}
		return inputString;
	},
	
	maximumFocusout: function(inputString,svWords) {
		//find the min number
		var max = "";
		var location = svWords.toLowerCase().indexOf('maximum');
		for(var i = location+7; i < svWords.length; i++){
			if(isNaN(svWords.charAt(i)) && svWords.charAt(i) != "."){
				break;
			} else {
				max += svWords.charAt(i);
			}
		}
		if(svWords.match(/integer/i)){
			max = Math.floor(max) + '';
		} 
		if(inputString != "" && max != "" && +inputString > Number(max)){
			inputString = max;
		}
		return inputString;
	},
	
	// DATE CLEANSING
	date: function(inputString) {
		if(inputString.length > 1){
			if(inputString.charAt(inputString.length-1) == '/' && inputString.charAt(inputString.length-2) == '/'){
				inputString = inputString.substring(0,inputString.length-1);
			}
		}
		inputString = inputString.replace(/-/g,"/");
		inputString = inputString.replace(/[^\d\/]/g,"");
		var slashCount = inputString.split(/\//g).length-1;
		if(slashCount > 2) { // limit 2 slashes
			if(inputString.charAt(inputString.length-1) == '/'){ 
				inputString = inputString.substring(0,inputString.length-1);
			} else {
				inputString = inputString.replace('/','');
			}
		}
		var inputArray = inputString.split('/');
		if(inputString.length == 2 && inputString.charAt(1) != "/" && EasyValidate.lastDateInput.length <= inputString.length) {
			inputString += "/";
			inputArray = inputString.split('/');
		}
		if(inputArray.length == 2){
			if(inputArray[1].length == 2 && EasyValidate.lastDateInput.length <= inputString.length){
				inputString+="/";
				inputArray = inputString.split('/');
			}
		}

		inputString = "";
		for (var i = 0; i < inputArray.length; i++) {
			if (i > 0) {
				inputString += "/";
			}
			if(i == 2) { // year
				var maxLength = 4;
			} else {
				var maxLength = 2;
			}
			if(inputArray[i].length > maxLength) {
				inputArray[i] = inputArray[i].substring(0,maxLength);
			}
			if(i == 0 && inputArray[i].length == 2){
				if(Number(inputArray[i] > 12)){
					inputArray[i] = '12';
				} else if(Number(inputArray[i] == 0)){
					inputArray[i] = '01';
				}
			} else if (i == 1 && inputArray[i].length == 2){
				if(Number(inputArray[i] > 31)){
					inputArray[i] = '31';
				} else if(Number(inputArray[i] == 0)){
					inputArray[i] = '01';
				}
			}
			inputString += inputArray[i];
		}
		EasyValidate.lastDateInput = inputString; // a record of the last input value
		return inputString;
	},
	
	time: function(inputString){
		inputString = inputString.toUpperCase();
		inputString = inputString.replace(/[^\d\:PAM ]/g,"");
		var hour="",colon="",min="",space="",ampm="";
		colonSplit = inputString.split(':');
		colonSplit[0] = colonSplit[0].replace(/[^\d\:PA ]/g,"");
		var hour = colonSplit[0];
		if(hour.indexOf('P') != -1 && hour.length > 1){
			hour = hour.replace("P","");
			colon = ":";
			min = '00';
			space = " ";
			ampm = "PM";
		} else if (hour.indexOf('A') != -1 && hour.length > 1){
			hour = hour.replace("A","");
			colon = ":";
			min = '00';
			space = " ";
			ampm = "AM";
		}
		//cleanse colonSplit[0];
		if(colonSplit.length > 1){
			colon = ":";
			var spaceSplit = colonSplit[1].split(' ');
			min += spaceSplit[0];
			if(spaceSplit.length > 1) {
				space = " ";
				ampm += spaceSplit[1];
			}
		}
		
		if(hour.length > 2){
			if(min == ""){
				min = hour.substring(2,hour.length);
			}
			hour = hour.substring(0,2);
			colon = ":";
		}
		if(colon.length > 0 || (hour.length == 2 && EasyValidate.lastDateInput.length < inputString.length)) { // validate hour
			colon = ":";
			if(isNaN(hour) || Number(hour) == 0){
				hour = "01";
			} else if (Number(hour) > 12) {
				hour = "12"
			} else if (hour.length == 1) {
				hour = "0" + hour;
			}
		}
		
		if(min.length > 2){
			if(min.charAt(2) == "P" || min.charAt(2) == "A"){
				space = " ";
				ampm = min.charAt(2)+'M';
			}
			min = min.substring(0,2);
		} else if (min.length == 1 && (min == "A" || min == "P")){
			space = " ";
			ampm = min + 'M';
			min = "00";
		}
		if(space.length > 0 || (min.length == 2 && EasyValidate.lastDateInput.length < inputString.length)) { // validate Minute
			space = " ";
			if(isNaN(min)){
				min = "00";
			} else if (Number(min) > 59) {
				min = "59"
			} else if (min.length == 1) {
				
				min = "0" + min;
			}
		}
		ampm = ampm.replace(/[^APM]/g,"");
		if(ampm.length == 1 && EasyValidate.lastDateInput.length < inputString.length){
			if(ampm == 'A'){
				ampm = 'AM';
			} else if (ampm == 'P'){
				ampm = 'PM';
			}
		} else if (ampm.length > 2){
			if(ampm.charAt(2) == 'A') {
				ampm = 'AM';
			} else if (ampm.charAt(2) == 'P'){
				ampm = 'PM';
			} else {
				ampm = ampm.substring(0,2);
			}
		} else if (ampm.length == 2){
			if(ampm.charAt(0) == 'A'){
				ampm = 'AM';
			}else if(ampm.charAt(0) == 'B'){
				ampm = 'PM';
			} else {
				ampm = 'PM';
			}
		}
		var result = hour;
		if(colon.length > 0) {
			result += colon+min;
		}
		if(space.length > 0) {
			result += space+ampm;
		}
		EasyValidate.lastDateInput = inputString; // a record of the last input value
		return result;
	},
	
	timeFocusout: function(thisInput){
		var thisJInput = $(thisInput);
		var svWords = EasyValidate.getValidateWords(thisInput);
		var thisTime = thisJInput.val();
		var pass = true;
		var colonSplit = thisTime.split(':');
		var min="",colon="",hour="",space="",ampm="";
		if(thisTime.length != 0){
			colon = ":";
			space = " ";
			if(colonSplit.length != 2){
				pass = false;
			} else {
				var spaceSplit = colonSplit[1].split(" ");
				if(spaceSplit.length != 2) {
					hour = colonSplit[0];
					min = spaceSplit[0];
					ampm = "AM";
				} else {
					hour = colonSplit[0];
					min = spaceSplit[0];
					ampm = spaceSplit[1];
				}
			}
			if(pass){
				if(isNaN(hour) || min.length == 0){
					pass = false;
				} else {
					if (Number(hour) > 12){
						hour = 12;
					} else if (Number(hour) < 1) {
						hour = 1;
					}
					if(hour.length > 2) {
						hour = hour.substring(0,2);
					} else if (hour.length == 1){
						hour = '0' + hour;
					}
				}
				if(min.length == 0) {
					min = '00';
				}
				if(isNaN(min)){
					pass = false;
				} else {
					if (Number(min) > 59){
						min = 59;
					} else if (Number(min) < 0) {
						min = 0;
					}
					if(min.length > 2) {
						min = min.substring(0,2);
					} else if (min.length == 1){
						min = '0' + min;
					}
				}
				if(ampm != 'AM' && ampm != 'PM'){
					if(ampm.charAt(0) == 'A'){
						ampm = 'AM';
					} else if (ampm.charAt(0) == 'P'){
						ampm = 'PM';
					} else {
						ampm = 'AM';
					}
				}
			}
		}
		
		if(pass) {
			thisJInput.data('error_format',false);
			EasyValidate.toggleErrorHighlight(thisJInput);
			return hour + colon + min + space + ampm;
		} else {
			thisJInput.data('error_format',true);
			EasyValidate.toggleErrorHighlight(thisJInput);
			return thisTime;
		}
	},

	dateFocusout: function(thisInput) {
		var svWords = EasyValidate.getValidateWords(thisInput);
		var thisJInput = $(thisInput);
		var thisDate = thisJInput.val();
		var pass = true;
		var inputArray = thisDate.split('/');
		if (inputArray.length != 3) {
			pass = false;
		} else {
			for(var i = 0; i < 2; i++) {
				if(inputArray[i].length < 2) {
					inputArray[i] = '0' + inputArray[i];
				}
			}
			if (inputArray[2].length == 2) {
				if(inputArray[2] > 20){
					inputArray[2] = '19' + inputArray[2];
				} else {
					inputArray[2] = '20' + inputArray[2];
				}
			} else if (inputArray[2].length != 4) {
				pass = false;
			}
			thisDate = inputArray[0] + '/' + inputArray[1] + '/' + inputArray[2];
		}
		if(pass || thisDate == "") {
			thisJInput.data('error_format',false);
		} else {
			thisJInput.data('error_format',true);
		}
		EasyValidate.toggleErrorHighlight(thisJInput);
		return thisDate;
	},
	
	//STRING CLEANSING
	uppercase: function(thisInput) {
		return thisInput.toUpperCase();
	},
	
	lowercase: function(thisInput) {
		return thisInput.toLowerCase();
	},
	
	maxLengthOutline:function(input){
		var $input = $(input);
		$input.css({outline:"2px dashed rgba(255,126,0,1)",outlineOffset:"2px"});
		$input.stop();
		$input.animate({outlineColor:"rgba(255,126,0,0)"},400);
	},

	maxlength: function(inputString,svWords,event,input){
		//find the max number
		var max = "";
		var location = svWords.toLowerCase().indexOf('maxlength');
		for(var i = location+9; i < svWords.length; i++){
			if(isNaN(svWords.charAt(i))){
				break;
			} else {
				max += svWords.charAt(i);
			}
		}
		// updated to stop the keystroke if too long already, on keydown instead of keyup
		if(max != "" && +inputString.length >= Number(max)){
			event.preventDefault();
			EasyValidate.maxLengthOutline(input);
			//inputString = inputString.substring(0,max);
		}
	},
	maxlengthKeyup: function(inputString,svWords,input){
		//find the max number
		var max = "";
		var location = svWords.toLowerCase().indexOf('maxlength');
		for(var i = location+9; i < svWords.length; i++){
			if(isNaN(svWords.charAt(i))){
				break;
			} else {
				max += svWords.charAt(i);
			}
		}
		// updated to stop the keystroke if too long already, on keydown instead of keyup
		if(max != "" && +inputString.length > Number(max)){
			input.val(inputString.substring(0,max));
			EasyValidate.maxLengthOutline(input);
		}
	},
	isTextSelected: function($input) { // because for maxLength, you don't want to filter if at maxLength but all text is selected and tobe replaced
		var input = $input.get(0);
		// get selection start (if possible)
		try{
			var selectionStartType = typeof input.selectionStart;
		}catch(e){
			var selectionStartType = "failed";
		}
	    if (selectionStartType == "number") {
			return input.selectionStart == 0 && input.selectionEnd == input.value.length;
	    } else if (typeof document.selection != "undefined") {
	        input.focus();
	        return document.selection.createRange().text == input.value;
	    }
	},

	validateMailgunAJAX:function($input){
		var errorJInput = $('#error_for_' + $input.attr('id'));
		var inputString = $input.val();

		if(!$input.val()){
			return;
		}
		try{EasyValidate["mailgunAJAX"+$input.attr('id')].abort();}catch(e){/*do nothing*/}

		//ask mailgun if the address is valid
		var emailValidateUrl = Site.components + '?method=emailAddressService.mailgunValidator&email=' + inputString;

		EasyValidate["mailgunAJAX"+$input.attr('id')] = $.ajax({
	        type: "GET",
	        url: emailValidateUrl,
	        crossDomain: true,

	        //success callback takes three parameters, we only use "data"
	        success: function(data,textStatus,jqXHR) { 
	              	
	        	try {
					data = $.parseJSON(data);
				}
				catch(err){
					console.warn("Mailgun error");
					console.log(data);
					return false;
				}

				isEmailValid = data.is_valid;
				
				if( isEmailValid ) {
					errorJInput.addClass('hide');
				}
				else {
					var errorText = 'Invalid email address.';
					if (data.did_you_mean) {
						errorText += ' Did you mean "' + data.did_you_mean +'"?';
					}
					errorJInput.html('<label class="validation_required">' + errorText + '</label>');
					errorJInput.removeClass('hide');
				}
				$input.data('error_format', !isEmailValid);
				$input.data('error_mailGun', !isEmailValid);
				EasyValidate.toggleErrorHighlight($input);
	        }
	    });

	},

	emailInputChange: function(thisInput){
		var thisJInput = $(thisInput);
		var inputString = thisJInput.val() || "";
		var errorJInput = $('#error_for_' + thisJInput.attr('id'));

		// see if there is a string
		if(inputString == ""){
			thisJInput.data('error_format', false);
			thisJInput.data('error_mailGun', false);
			EasyValidate.toggleErrorHighlight(thisJInput);
			errorJInput.addClass('hide');
			return;
		}

		// do raw js validate
		var isEmailValid = Validation.email(inputString);
		thisJInput.data('error_format', !isEmailValid);
		thisJInput.data('error_mailGun', !isEmailValid);
		EasyValidate.toggleErrorHighlight(thisJInput);

		// call mailgun validate
		System.throttle(
			EasyValidate.validateMailgunAJAX,
			'MailgunEmailValidate_'+thisJInput.attr('name'),
			'500',
			[thisJInput]
		);

		return inputString;
	},

	phoneFocusout: function(thisInput) {
		var thisJInput = $(thisInput);
		var inputString = thisJInput.val();
		inputString = inputString.replace(/[^a-zA-Z 0-9]+/g,'');
		if(inputString.length < 10 && thisInput.val() != ""){
			thisJInput.data('error_format',true);
		} else {
			thisJInput.data('error_format',false);
		}
		return thisJInput.val()||"";
	}
	
};

/*
 Color animation jQuery-plugin
 http://www.bitstorm.org/jquery/color-animation/
 Copyright 2011 Edwin Martin <edwin@bitstorm.org>
 Released under the MIT and GPL licenses.
*/
(function(d){function i(){var b=d("script:first"),a=b.css("color"),c=false;if(/^rgba/.test(a))c=true;else try{c=a!=b.css("color","rgba(0, 0, 0, 0.5)").css("color");b.css("color",a)}catch(e){}return c}function g(b,a,c){var e="rgb"+(d.support.rgba?"a":"")+"("+parseInt(b[0]+c*(a[0]-b[0]),10)+","+parseInt(b[1]+c*(a[1]-b[1]),10)+","+parseInt(b[2]+c*(a[2]-b[2]),10);if(d.support.rgba)e+=","+(b&&a?parseFloat(b[3]+c*(a[3]-b[3])):1);e+=")";return e}function f(b){var a,c;if(a=/#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/.exec(b))c=
[parseInt(a[1],16),parseInt(a[2],16),parseInt(a[3],16),1];else if(a=/#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])/.exec(b))c=[parseInt(a[1],16)*17,parseInt(a[2],16)*17,parseInt(a[3],16)*17,1];else if(a=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(b))c=[parseInt(a[1]),parseInt(a[2]),parseInt(a[3]),1];else if(a=/rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9\.]*)\s*\)/.exec(b))c=[parseInt(a[1],10),parseInt(a[2],10),parseInt(a[3],10),parseFloat(a[4])];return c}
d.extend(true,d,{support:{rgba:i()}});var h=["color","backgroundColor","borderBottomColor","borderLeftColor","borderRightColor","borderTopColor","outlineColor"];d.each(h,function(b,a){d.fx.step[a]=function(c){if(!c.init){c.a=f(d(c.elem).css(a));c.end=f(c.end);c.init=true}c.elem.style[a]=g(c.a,c.end,c.pos)}});d.fx.step.borderColor=function(b){if(!b.init)b.end=f(b.end);var a=h.slice(2,6);d.each(a,function(c,e){b.init||(b[e]={a:f(d(b.elem).css(e))});b.elem.style[e]=g(b[e].a,b.end,b.pos)});b.init=true}})(jQuery);
