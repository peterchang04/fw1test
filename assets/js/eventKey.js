/*
	This package has 2 objectives and works with Keyup Keydown Keypress
	1. Take any key event and add the "character" representing
	2. normalize any rogue key translations (browsers returning different values for which keycode charcode)
*/
$(document).ready(function(){
	EventKey.initCapslockDetection();
});
EventKey = {
	initCapslockDetection:function(){
		// recognize and set capslock state based on letter keystroke
		$(document).unbind('keypress.EventKeyCaps').bind('keypress.EventKeyCaps',function(e){
			if(e.keyCode == 0){
				e.keyCode = e.which;
			}
			if ( ( ( e.keyCode >= 65 && e.keyCode <= 90 ) && !e.shiftKey ) || ( ( e.keyCode >= 97 && e.keyCode <= 122 ) && e.shiftKey ) ) {
				EventKey.capslock = true;
			} else {
				EventKey.capslock = false;
			}
		});
		// toggle capslock state based on hitting capslock key
		$(document).unbind('keydown.EventKeyCaps').bind('keydown.EventKeyCaps',function(e){
			if(e.keyCode == 20){
				EventKey.capslock = !EventKey.capslock;
			}
		});
	},
	capslock:false,
	get:function(e){
		// keypress should only trigger if hitting a character key. on firefox it triggers always
		e.keyName = "";
		if(e.type == 'keypress' && e.charCode == 0){
			return {keyCode:-1,which:-1,keyName:""};
		}
		
		//console.log(e);
		if(e.keyCode == 0){
			e.keyCode = e.which;
		}
		
		// silence shift key
		if(e.keyCode == 16){return e}
		
		//console.log(e.type + ' ' + e.keyCode);
		var key = e.type;
		if(key == "keydown"){
			key = "keyup";
		}
		
		// test for capslock
		var shift = e.shiftKey;
		if(EventKey.capslock){
			shift = !shift;
		}
		
		// test for shift
		if(shift && key == "keyup" && e.keyCode in EventKey[key+'_shift']){
			key += '_shift';
		}
		//console.log(EventKey[key][e.keyCode] + ' ' + e.type + ' ' + e.keyCode);
		e.keyName = EventKey[key][e.keyCode] || "Somekey";
		return e;
	},
	keyup:{
		// misc non char keys
		27:"esc",	46:"del",	8:"bksp",	44:"prt",	20:"caps",	16:"shift",	17:"ctrl",	18:"alt",	32:"spc",	13:"enter",	144:"num",
		// 1st keyboard row
		192:"`",	49:"1",		50:"2",		51:"3",		52:"4",		53:"5",		54:"6",		55:"7",		56:"8",		57:"9",		48:"0",		189:"-",	187:"=",
		// 2nd keyboard row
		9:"tab",	81:"q",		87:"w",		69:"e",		82:"r",		84:"t",		89:"y",		85:"u",		73:"i",		79:"o",		80:"p",		219:"[",	221:"]",	220:"\\",
		// 3rd keyboard row
		65:"a",		83:"s",		68:"d",		70:"f",		71:"g",		72:"h",		74:"j",		75:"k",		76:"l",		186:";",	222:"'",
		// 4th keyboard row
		90:"z",		88:"x",		67:"c",		86:"v",		66:"b",		78:"n",		77:"m",		188:",",	190:".",	191:"/",
		// keypad
		96:"0",		97:"1",		98:"2",		99:"3",		100:"4",	101:"5",	102:"6",	103:"7",	104:"8",	105:"9",
		110:".",	107:"+",	109:"-",	106:"*",	111:"/",
		// directional
		38:"up",	40:"down",	37:"left",	39:"right",	36:"home",	35:"end",	33:"pgup",	34:"pgdn",
		// alternate (browser specific)
		173:"-",	59:";",		61:"="
	},
	keyup_shift:{
		// 1st keyboard row
		192:"~",	49:"!",		50:"@",		51:"#",		52:"$",		53:"%",		54:"^",		55:"&",		56:"*",		57:"(",		48:")",		189:"_",	187:"+",
		// 2nd keyboard row
		9:"tab",	81:"Q",		87:"W",		69:"E",		82:"R",		84:"T",		89:"Y",		85:"U",		73:"I",		79:"O",		80:"P",		219:"{",	221:"}",	220:"|",
		// 3rd keyboard row
		65:"A",		83:"S",		68:"D",		70:"F",		71:"G",		72:"H",		74:"J",		75:"K",		76:"L",		186:":",	222:'"',
		// 4th keyboard row
		90:"Z",		88:"X",		67:"C",		86:"V",		66:"B",		78:"N",		77:"M",		188:"<",	190:">",	191:"?",
		// alternate (browser specific)
		173:"_",	59:":",		61:"+"
	},
	keypress:{
		// 1st keyboard row
		96:"`",		49:"1",		50:"2",		51:"3",		52:"4",		53:"5",		54:"6",		55:"7",		56:"8",		57:"9",		48:"0",		45:"-",		61:"=",
		126:"~",	33:"!",		64:"@",		35:"#",		36:"$",		37:"%",		94:"^",		38:"&",		42:"*",		40:"(",		41:")",		95:"_",		43:"+",
		// 2nd keyboard row
					113:"q",	119:"w",	101:"e",	114:"r",	116:"t",	121:"y",	117:"u",	105:"i",	111:"o",	112:"p",	91:"[",		93:"]",		92:"\\",
					81:"Q",		87:"W",		69:"E",		82:"R",		84:"T",		89:"Y",		85:"U",		73:"I",		79:"O",		80:"P",		123:"{",	125:"}",	124:"|",
		// 3rd keyboard row
		97:"a",		115:"s",	100:"d",	102:"f",	103:"g",	104:"h",	106:"j",	107:"k",	108:"l",	59:";",		39:"'",
		65:"A",		83:"S",		68:"D",		70:"F",		71:"G",		72:"H",		74:"J",		75:"K",		76:"L",		58:":",		34:'"',
		// 4th keyboard row
		122:"z",	120:"x",	99:"c",		118:"v",	98:"b",		110:"n",	109:"m",	44:",",		46:".",		47:"/",
		90:"Z",		88:"X",		67:"C",		86:"V",		66:"B",		78:"N",		77:"M",		60:"<",		62:">",		63:"?"
	}
};