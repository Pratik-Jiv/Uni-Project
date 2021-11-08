//Show relevant section
function showSect(sect){
	document.getElementById("home").style.display = "none";
	document.getElementById("staff").style.display = "none";
	//section for quiz 2
	document.getElementById("course").style.display = "none";
	document.getElementById("infographic").style.display = "none";
	
	
	document.getElementById(sect).style.display = "block";
}
const showHome = () => {document.getElementById("home").style.display ="block"};
window.onload = showHome;
//Get staff info
const url = "http://redsox.uoa.auckland.ac.nz/cors/CorsProxyService.svc/proxy?url=https%3A%2F%2Funidirectory%2Eauckland%2Eac%2Enz%2Frest%2Fsearch%3ForgFilter%3DMATHS";
const fetchStaff = fetch(url, {headers : { "Accept" : "application/json",},});
const streamStaff = fetchStaff.then((response) => {return response.json()});
streamStaff.then((data) => {
	const jstring = JSON.stringify(data);
	const obj = JSON.parse(jstring);
	obj.list.forEach((element) => getInfo(element));
});

//take array and get relevant information
function getInfo(obj){
	const staffString = JSON.stringify(obj);
	const staffObj = JSON.parse(staffString);
	let title = staffObj.title;
	let name = "";
	//if there is a middle name display it
	if(staffObj.middlename != undefined){
		name = staffObj.firstname + " " + staffObj.middlename + " "+  staffObj.lastname;
	} else {
		name = staffObj.firstname + " " +  staffObj.lastname;
	}
	
	let email = staffObj.emailAddresses;
	
	//create a div to hold the information
	let div = document.createElement('div');
	div.classList.add("staffMember");
	
	title = document.createTextNode(title + " ");
	name = document.createTextNode(name);
	let a = document.createElement('a');
	a.href = "https://mail.google.com/mail/?view=cm&fs=1&tf=1&to="+email;
	a.appendChild(document.createTextNode(email));
	a.target ="_blank";
	//check if staff member has a photo
	if(staffObj.imageId != undefined){
		let photoURL =  "https://unidirectory.auckland.ac.nz/people/imageraw/"+ staffObj.profileUrl[1] +"/"+ staffObj.imageId +"/biggest";
		let img = document.createElement('img');
		img.src = photoURL;
		div.appendChild(img);
	} else{
		let img = document.createElement('img');
		img.src = "https://media.istockphoto.com/vectors/anonymous-male-face-avatar-incognito-man-head-silhouette-vector-id1208768120?k=6&m=1208768120&s=612x612&w=0&h=lIkyDhS_qd4q92MWeRsB15dKnPlSXOoJtz3gjJJm86I=";
		div.appendChild(img);
	}
	let head = document.createElement('strong');
	//make name bold, with title if available
	if(staffObj.title != undefined){
		head.appendChild(title);
	}
	head.appendChild(name);
	let body = document.createElement('p');
	body.classList.add("staffBody");
	body.id = staffObj.profileUrl[1];
	//get phone and title
	let vref = document.createElement('a');
	try{
		let vcard = fetch("http://redsox.uoa.auckland.ac.nz/cors/CorsProxyService.svc/proxy?url=http%3a%2F%2Funidirectory%2Eauckland%2Eac.nz%2Fpeople%2Fvcard%2F"+staffObj.profileUrl[1]);
		let vstream = vcard.then((response) => response.text());
		vstream.then((d) => {
			let vstring = JSON.stringify(d);
			let varray = vstring.split("\\n");
			//for consistency and visual purposes i am using multiple foreach functions
			varray.forEach(element => getPhone(element, staffObj.profileUrl[1]));
			varray.forEach(element => getTitle(element, staffObj.profileUrl[1]));
			varray.forEach(element => getRole(element, staffObj.profileUrl[1]));
			vref.href = "https://unidirectory.auckland.ac.nz/people/vcard/" + staffObj.profileUrl[1];
			vref.appendChild(document.createTextNode('Add to contacts'));
			
			
		});
		//add information gathered
		body.appendChild(head);
		body.appendChild(document.createElement('br'));
		body.appendChild(vref);
		body.appendChild(document.createElement('br'));
		body.appendChild(document.createElement('br'));
		body.appendChild(a);
		
		
		div.appendChild(body);
		document.getElementById("staff").appendChild(div);
	} catch (e) {
		console.log('error has occured while trying to retrieve vCard contents');
	}
}

function getPhone(element, uid){
	if(element.includes('VOICE:')){
		let phone = element.split(':');
		phone = phone[1].replace(/\s/g, '');
		document.getElementById(uid).appendChild(document.createElement('br'));
		let a = document.createElement('a');
		a.href = "tel: " + phone;
		a.appendChild(document.createTextNode(phone));
		document.getElementById(uid).appendChild(a);
	}
}
function getTitle(element, uid){
	if(element.includes('TITLE:')){
		let title = element.split(':');
		title = title[1];
		document.getElementById(uid).appendChild(document.createElement('br'));
		document.getElementById(uid).appendChild(document.createElement('br'));
		document.getElementById(uid).appendChild(document.createTextNode(title));
	}
}
function getRole(element, uid){
	if(element.includes('ORG:')){
		let org = element.split(':');
		org = org[1];
		document.getElementById(uid).appendChild(document.createElement('br'));
		document.getElementById(uid).appendChild(document.createTextNode("In " + org));
	}
}


//==================================================================================== Section for quiz 2 ===========================================================================
const fetchCourse = fetch("https://api.test.auckland.ac.nz/service/courses/v2/courses?subject=MATHS&year=2020&size=500");
const streamCourse = fetchCourse.then((response) => response.json());
streamCourse.then((d) => {
	const cString = JSON.stringify(d);
	const courseObj = JSON.parse(cString);
	let count = 0;
	courseObj.data.forEach((element) => (getCourse(element)));
});

function getCourse(course){
	let cString = JSON.stringify(course);
	let cObj = JSON.parse(cString);
	//only display those which are intended to be printed
	if(cObj.catalogPrint == "Y"){
		let div = document.createElement('div');
		div.classList.add('course');
		let p = document.createElement('p');
		let bold = document.createElement('strong');
		let italic = document.createElement('I');
		
		//extract information
		let descprereq = "";
		let title = cObj.titleLong;
		let courseID = cObj.subject + " " + cObj.catalogNbr;
		let desc = cObj.description;
		let reqdesc = cObj.rqrmntDescr;
		let prgrm = cObj.mainProgram;
		let points = cObj.unitsAcadProg;
		let course = cObj.catalogNbr;
		
		//check for a description
		if(desc == undefined){
			desc = "This is a special course where the coordinator or supervisor in charge will give specifications upon the start of the course.";
		}
		//check for a prereq in the description
		if(desc.includes("<i>")){
			descprereq = desc.substring(desc.indexOf("<i>") + 3, (desc.length) - 4);
			desc = desc.substring(0, desc.indexOf("<i>"));
		}
		bold.appendChild(document.createTextNode(courseID + ": " + title));
		p.appendChild(bold);
		p.appendChild(document.createElement('hr'));
		p.appendChild(document.createTextNode(desc));
		if(descprereq != ""){
			p.appendChild(document.createElement('br'));
			p.appendChild(document.createElement('br'));
			italic.appendChild(document.createTextNode(descprereq + "."));
			p.appendChild(italic);
		}
		//check for a prereq
		if(reqdesc != undefined){
			p.appendChild(document.createElement('br'));
			p.appendChild(document.createElement('br'));
			p.appendChild(document.createTextNode(reqdesc));
		}
		p.appendChild(document.createElement('br'));
		p.appendChild(document.createElement('br'));
		p.appendChild(document.createTextNode('Contributes ' + points + ' points towards a '+ prgrm + ' degree.'));
		div.appendChild(p);
		//show timetable
		div.setAttribute('onclick', 'showTimetable(' +"'"+ course +"'"+ ')');

		document.getElementById("course").appendChild(div);
	}
}
function showTimetable(course){
	let url = "https://api.test.auckland.ac.nz/service/classes/v1/classes?year=2020&subject=MATHS&size=500&catalogNbr=" + course;
	const table = fetch(url);
	const ttable = table.then((response) => response.json());
	ttable.then((d) =>{

		let tablestring = JSON.stringify(d);
		let timetable = JSON.parse(tablestring);

		let div = document.createElement('div');
		let targ = document.createElement('div');
		targ.style.width="100%";
		targ.style.height="100%";
		targ.style.position="fixed";
		targ.style.top="0";
		targ.style.left="0";
		
		//sem one section
		let p = document.createElement('p');
		
		
		//sem two section
		let p2 = document.createElement('p');
		
		
		
		div.id = course;
		div.style.display = "none";
		targ.id = course;
		targ.appendChild(div);
		document.getElementById("course").appendChild(targ);
		let span = document.createElement('span');
		span.appendChild(document.createTextNode('X'));
		span.style.float ="right";
		span.style.fontSize="24px";
		span.style.padding="12px";
		span.style.cursor="pointer";
		div.appendChild(span);
		let h1 = document.createElement('p');
		let h2 = document.createElement('p');

		timetable.data.forEach((element) => getClass(element, p, p2, h1, h2));
		if(p.innerHTML!="" || p2.innerHTML!=""){
			let h3 = document.createElement('h3');
			h3.appendChild(document.createTextNode('Timetable'));
			div.appendChild(h3);
			if(p.innerHTML != ""){
				p.classList.add('sem');
				let h4 = document.createElement('h4');
				h4.appendChild(document.createTextNode('Semester One:'));
				div.appendChild(h4);
				div.appendChild(document.createElement('br'));
				div.appendChild(h1);
				div.appendChild(p);
				div.appendChild(document.createElement('hr'));
			}
			if(p2.innerHTML != ""){
				p2.classList.add('sem');
				let h4 = document.createElement('h4');
				h4.appendChild(document.createTextNode('Semester Two:'));
				div.appendChild(h4);
				div.appendChild(document.createElement('br'));
				div.appendChild(h2);
				div.appendChild(p2);
				div.appendChild(document.createElement('hr'));
			}
			div.style.display = "block";
			div.style.position = "fixed";
			div.style.top = "10%";
			div.style.left ="15%";
			//div.style.zIndex="1";
			div.style.width = "70%";
			div.style.height = "80%";
			div.style.overflow="auto";
			div.style.marginLeft="auto";
			div.style.backgroundColor ="lightgray";
			div.style.borderStyle="solid";
		} else {
			div.style.height= "20%";
			div.style.width = "20%";
			div.style.display = "block";
			div.style.position = "fixed";
			div.style.top = "40%";
			div.style.left ="40%";
			div.style.marginLeft="auto";
			div.style.backgroundColor ="lightgray";
			div.style.borderStyle="solid";
			div.appendChild(document.createElement('br'));
			div.appendChild(document.createElement('br'));
			div.appendChild(document.createTextNode('There are currently no course sessions listed'));
		
		}
		
		//when user clicks on the 'X' close
		span.onclick = function(){
			document.getElementById(course).remove();
		}
		window.onclick = function(event){
			if(document.getElementById(course) != null){
				if(event.target == targ){
					document.getElementById(course).remove();
				}
			}
		}
	}
);
}
function getClass(ttable, p, p2, h1, h2){
	const times = JSON.stringify(ttable);
	const obj = JSON.parse(times);
	
	let classdesc = obj.acadOrg + " " + obj.catalogNbr;
	let comp = obj.component;
	let sect = obj.classSection;
	let meetings = obj.meetingPatterns;
	
	let termDate = "Semester dates: " + obj.startDate + " to " + obj.endDate;
	
	let pone = document.createElement('p');
	pone.classList.add('course');
	let ptwo = document.createElement('p');
	ptwo.classList.add('course');
	if(meetings == ""){
		
	} else {
		if(obj.term == "1203"){
			
			h1.innerHTML = "";
			h1.appendChild(document.createTextNode(termDate));
			h1.appendChild(document.createElement('br'));			
			
			pone.style.width="20%";
			pone.style.float = 'left';
			pone.style.marginLeft=  "15px";
			pone.style.borderStyle="dashed";
			pone.style.display ="inline-block";
			pone.appendChild(document.createTextNode(classdesc + " " + comp));
			pone.appendChild(document.createTextNode(sect));
			pone.appendChild(document.createElement('br'));

			meetings.forEach((element) => getTime(element, pone));
			p.appendChild(pone);
			
		} else {
			
			h2.innerHTML = "";
			h2.appendChild(document.createTextNode(termDate));
			h2.appendChild(document.createElement('br'));
			
			ptwo.style.width="20%";
			ptwo.style.float = 'left';
			ptwo.style.marginLeft=  "15px";
			ptwo.style.borderStyle="dashed";
			ptwo.style.display="inline";
			ptwo.appendChild(document.createTextNode(classdesc + " " + comp));
			ptwo.appendChild(document.createTextNode(sect));
			ptwo.appendChild(document.createElement('br'));

			meetings.forEach((element) => getTime(element, ptwo));
			p2.appendChild(ptwo);
		}
		
		
		
	}
	
}
function getTime(elem, p){
	const t = JSON.stringify(elem);
	const obj = JSON.parse(t);
	let sDate = obj.startDate;
	let eDate = obj.endDate;
	let day = obj.daysOfWeek;
	let mnum = obj.meetingNumber;
	let sTime = obj.startTime;
	let eTime = obj.endTime;
	let locale = obj['location'];
	p.appendChild(document.createTextNode("Week starting: "+ sDate +", " + day));
	p.appendChild(document.createElement('br'));
	p.appendChild(document.createTextNode(sTime + " - " + eTime));
	p.appendChild(document.createElement('br'));
	p.appendChild(document.createTextNode(locale));
	p.appendChild(document.createElement('br'));
	p.appendChild(document.createElement('br'));
}

const arr = fetch("https://cws.auckland.ac.nz/qz20/Quiz2020ChartService.svc/g");
const streamarr = arr.then((response) => response.json());
streamarr.then((d) =>{
	let points = JSON.stringify(d);
	let pointarray = JSON.parse(points);
	//take a number from the array, make a 'graph' and fill with 'symbols'
	let count = 0;
	pointarray.forEach((element) =>(showGraph(element, count), count++));
	let p = document.createElement('p');
	p.appendChild(document.createTextNode(points));
	document.getElementById("infographic").appendChild(p);
});

function showGraph(elem, i){
	let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttributeNS(null, "viewBox", "0 0 110 10");
	
	//get number and display
	let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
	text.textContent = i + 1;
	text.setAttribute("x", 0);
	text.setAttribute("y", 5);
	text.setAttribute("font-size", 5);
	svg.appendChild(text);

	//make the clipping section
	let clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
	clipPath.id = 'myClip' + elem;
	let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
	rect.setAttributeNS(null, 'x', '0');
	rect.setAttributeNS(null, 'y', '0');
	rect.setAttributeNS(null, 'width', 10 + elem);
	rect.setAttributeNS(null, 'height', '10');
	clipPath.appendChild(rect);
	//group the 'use' results for accurate 'full' clipping
	let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	g.id = elem;
	g.setAttribute('clip-path', 'url(#myClip'+ elem +')');
	svg.appendChild(clipPath);
	svg.appendChild(g);
	document.getElementById("infographic").appendChild(svg);
	//use 'use' changing the x value each time
	let arrs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	arrs.forEach((element) => useSymbol(element, elem));
	
}

function useSymbol(elem, e){

	let use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
	use.setAttributeNS("http://www.w3.org/1999/xlink", 'xlink:href', '#mySym');
	use.setAttribute("x", elem*10);
	document.getElementById(e).appendChild(use);
}