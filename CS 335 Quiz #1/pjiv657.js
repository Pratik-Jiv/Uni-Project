//Show relevant section
function showSect(sect){
	document.getElementById("home").style.display = "none";
	document.getElementById("staff").style.display = "none";
	
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
	email = document.createTextNode("Email: " + email);
	//check if staff member has a photo
	if(staffObj.imageId != undefined){
		let photoURL =  "https://unidirectory.auckland.ac.nz/people/imageraw/"+ staffObj.profileUrl[1] +"/"+ staffObj.imageId +"/biggest";
		let img = document.createElement('img');
		img.src = photoURL;
		div.appendChild(img);
	} else{
		let h = document.createElement('h4');
		h.appendChild(document.createTextNode("No photo available"));
		div.appendChild(h);
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
	let vcard = fetch("http://redsox.uoa.auckland.ac.nz/cors/CorsProxyService.svc/proxy?url=https%3A%2F%2Funidirectory%2Eauckland%2Eac%2Enz%2Fpeople%2Fvcard%2F"+staffObj.profileUrl[1]);
	let vstream = vcard.then((response) => response.text());
	vstream.then((d) => {
		let vstring = JSON.stringify(d);
		let varray = vstring.split("\\n");
		//for consistency and visual purposes i am using multiple foreach functions
		varray.forEach(element => getPhone(element, staffObj.profileUrl[1]));
		varray.forEach(element => getTitle(element, staffObj.profileUrl[1]));
		varray.forEach(element => getRole(element, staffObj.profileUrl[1]));
		
	});
	//add information gathered
	body.appendChild(head);
	body.appendChild(document.createElement('br'));
	body.appendChild(email);
	div.appendChild(body);
	document.getElementById("staff").appendChild(div);
}

function getPhone(element, uid){
	if(element.includes('VOICE:')){
		let phone = element.split(':');
		phone = phone[1].replace(/\s/g, '');
		document.getElementById(uid).appendChild(document.createElement('br'));
		document.getElementById(uid).appendChild(document.createTextNode("Phone number: "+ phone));
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