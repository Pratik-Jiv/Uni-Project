//if possible change all links to be local. either on port 88 or 89

const adjustBody = () => {document.getElementById("home").style.display = "block";}
			window.onload = adjustBody;

//fetch function to initialise the promise
const f = fetch('http://localhost:8188/DairyService.svc/id', {headers : { "Accept" : "application/json", },
});
const streamf = f.then((response) => response.json());
	streamf.then((data) => {
		//alert(data)
	});

const fversion = fetch('http://localhost:8188/DairyService.svc/version', {headers : { "Accept" : "application/json", },
});
const streamver = fversion.then((response) => response.json());
	streamver.then((data) => {
		let verstring = JSON.stringify(data);
		verstring = verstring.split('"'); 
		let vers = document.createTextNode(' All rights reserved. V' + verstring[1]);
		document.getElementById('foot').appendChild(vers);
	});
	
//get the news articles
const fnews = fetch('http://localhost:8188/DairyService.svc/news', {headers : {"Accept" : "application/json", }, });
const streamfnews = fnews.then((response) => response.json());
	streamfnews.then((data) => {
		let newsstring = JSON.stringify(data);
		let newsobj = JSON.parse(newsstring);
		for (let i = 0; i < newsobj.length; i++){
			//create an article section/div
			let articlelink = document.createElement('a');
			let article = document.createElement('div');
			article.classList.add("article");
			//create text nodes for each of the fields
			let descfield = document.createTextNode(newsobj[i].descriptionField);
			let guidfield = document.createTextNode(newsobj[i].guidField);
			let linkfield = document.createTextNode(newsobj[i].linkField);
			let pubdatefield = document.createTextNode(newsobj[i].pubDateField);
			let titlefield = document.createTextNode(newsobj[i].titleField);
			
			let typefield = document.createTextNode(newsobj[i].enclosureField.typeField);
			let img = document.createElement('img');
			img.src = (newsobj[i].enclosureField.urlField);
			img.classList.add('articleimg');
			articlelink.href = newsobj[i].linkField;
			//open the news link in a new tab
			articlelink.target = "_blank";
			
			let newsarr = [img, titlefield, pubdatefield, descfield];
			//append each text node to the article
			for (let i=0; i<newsarr.length;i++){
				article.appendChild(newsarr[i]);
				let br = document.createElement('br');
				article.appendChild(br);
			}
			//append the article to the main news page
			articlelink.appendChild(article);
			articlelink.style.textDecoration = "none";
			articlelink.style.fontSize = "16px";
			articlelink.style.width= "300px";
			document.getElementById("articlelist").appendChild(articlelink);
		}
	});

	
//get the items	and images
const fitem = fetch('http://localhost:8188/DairyService.svc/items', {headers : {"Accept" : "application/json", }, });
const streamfitem = fitem.then((response) => response.json());
	streamfitem.then((data) => {
		//establish full list
		let jstring = JSON.stringify(data);
		let myObj = JSON.parse(jstring);
		//show the products fetched
		showProducts(myObj);
	});
	
//on keyup conduct a search, for responsiveness
function search(){
//get the search term
let searchterm = document.getElementById('searchbar').value;	
//filter myObj using the search function
let fsearch = fetch('http://localhost:8188/DairyService.svc/search?term=' + searchterm, {headers : {"Accept" : "application/json", }, });
	let streamfsearch = fsearch.then((response) => response.json());
	
	streamfsearch.then((data) => {
		let searchstring = JSON.stringify(data);
		myObj = JSON.parse(searchstring);
		//get all products via the shared class, if the id is in the array of objects returned from the search, display else hide
		let allproducts = document.getElementsByClassName("productdiv");
		for (let i = 0; i < allproducts.length ; i++){
			if(myObj.some(product => product.ItemId == (allproducts[i].id))){
				allproducts[i].style.display = "block";
			}else{
			allproducts[i].style.display= "none";
			}
		}

});
}

//A function that takes an array of products fetched from the server and displays them
function showProducts(productArr) {
	for (let i = 0; i < productArr.length; i++){
		//create a description for each item using information pulled from the server
		let description = document.createElement('p');
		description.classList.add("desc");

		let title = document.createTextNode(productArr[i].Title);
		let price = document.createTextNode('$' + productArr[i].Price);			
		let origin = document.createTextNode(productArr[i].Origin);
		
		//for visibility purposes, insert a break between each element
		let arr = [title, price, origin]
		for (let i = 0; i < arr.length; i++){
			description.appendChild(arr[i]);
			description.appendChild(document.createElement("br"));
		}
		//use the source of the image using the item ID
		//create a new img element for the item image
		let img = document.createElement('img');
		let imgID = productArr[i].ItemId;
		img.src = 'http://localhost:8188/DairyService.svc/itemimg?id=' + imgID;
		
		//add a styled class for visual purposes
		img.classList.add("image");
		let div = document.createElement('div');
		div.classList.add("productdiv");
		div.id = productArr[i].ItemId;
		
		//add image and description to the div and make it visible
		div.appendChild(img);
		div.appendChild(description);
		let button = document.createElement("button");
		button.appendChild(document.createTextNode("Buy Now"));
		button.style.backgroundColor = "#A9A9A9";
		
		button.setAttribute('onclick', 'buyNow('+ productArr[i].ItemId +')');
		
		div.appendChild(button);
		document.getElementById('productlist').appendChild(div);
	}
}	

/* vCard */
const fetchvcard = fetch('http://localhost:8188/DairyService.svc/vcard')
const sfetchvcard = fetchvcard.then((response) => response.text());
	sfetchvcard.then((data) => {
		let vstring = JSON.stringify(data);
		//split the string into managable lines
		let vstrarray = vstring.split("\\n");
		//make instances to hold the value pulled from the server
		let phone = "";
		let address = "";
		let email= "";
		//create anchors for links to the address book, email(default gmail) and calling
		let emailaddr = document.createElement('a');
		let phonenum = document.createElement('a');
		let addr = document.createElement('a');
		//go through the vcard lines to find the work telephon, work address and email
		for (let i=0; i<vstrarray.length;i++){
			if(vstrarray[i].includes('ADR;WORK')){
				//split the resultant address to make it 'readable on screen'
				let addrval = vstrarray[i].split(":");
				address = (addrval[1].split(";"));
				address = address.join(" ");
				address = address.substring(0, address.length - 2);
				//upon clicking the address (anchor) download the vCard which opens the default mail app
				addr.onclick = "window.open('http://localhost:8188/DairyService.svc/vcard')";
				addr.href = 'http://localhost:8188/DairyService.svc/vcard'
				addr.text = address;
				addr.style.textDecoration = "none";
				addr.style.color = "black";
			} else if (vstrarray[i].includes('TEL;WORK')){
				let phoneval = vstrarray[i].split(":");
				phone = phoneval[1].substring(0, phoneval[1].length - 2);
				//since the phone number has spaces replace spaces with 'nothing'
				phonenum.href = "tel: " + phone.replace(/\s/g, '');
				phonenum.style.float = "right";
				phonenum.text = phone;
				phonenum.style.display = "inline";
				phonenum.style.textDecoration = "none";
				phonenum.style.color= "black";
				
			} else if (vstrarray[i].includes('EMAIL')){
				let emailval = vstrarray[i].split(":");
				email = emailval[1].substring(0, emailval[1].length - 2);

				//open the chosen mail app (gmail) and start a new email to the dunedin dairy email
				emailaddr.href = "https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=" + email;
				//open in a new tab
				emailaddr.target ="_blank";
				emailaddr.text = email;
				emailaddr.style.float = "left";
				emailaddr.style.display = "block";
				emailaddr.style.textDecoration ="none";
				emailaddr.style.color = "black";
			}
		}
		//make an array for the contact details, and append them to a div to be added to the main location section
		let contactarr = [addr, emailaddr, phonenum];
		let contact = document.createElement('div');
		for (let i=0; i<contactarr.length;i++){
			contact.appendChild(contactarr[i]);
			let br = document.createElement('br');
			if(i == 0){contact.appendChild(br)};
		}
		document.getElementById('contactinfo').appendChild(contact);
	});

function postComment(){
	let comment = document.getElementById('commentfield').value;
	let username = document.getElementById('username').value;
	if(comment == ""){ //if either the comment or the name field are empty raise an alert to inform the user
		modal("You need to type something");
	}else if (username == ""){
		modal("You need to enter a name");
	} else {
		//if both fields are full then post to the server
		let postc = fetch('http://localhost:8188/DairyService.svc/comment?name=' + username, {
			headers: {'Content-Type':'application/json',},
			method: 'post',
			body: JSON.stringify(comment)
		}).then(function (response){
			return response.text();
	});
		//at the end, clear the text box and reload comments
		document.getElementById('commentfield').value = "";
		document.getElementById('username').value ="";
	}
	loadComments();
}	

//loadcomments is occassionally non-functional on submission of a comment; so use at the end of the post function and on the button call; to force a refresh
function loadComments(){
const fcomments = fetch('http://localhost:8188/DairyService.svc/htmlcomments');
const sfcomments = fcomments.then((response) => response.text());
	sfcomments.then((data) => {
		let htmlstring = data;
		//get the html 'code' for the comments, found in the (only) div tag
		let commentstring = htmlstring.substring(htmlstring.indexOf('<div>'), htmlstring.indexOf('</div>'));
		let sect = document.getElementById('comments');
		sect.innerHTML = commentstring;
	});
}
//load the initial set of comments on start
loadComments();



//single function to change the section
function showSection(that){
	//Assuming that the sections are limited, go through and individually hide all
	document.getElementById("home").style.display = "none";
	document.getElementById("h").style.backgroundColor="transparent";
	document.getElementById("location").style.display = "none";
	document.getElementById("l").style.backgroundColor="transparent";
	document.getElementById("products").style.display = "none";
	document.getElementById("p").style.backgroundColor="transparent";
	document.getElementById("news").style.display = "none";
	document.getElementById("n").style.backgroundColor="transparent";
	document.getElementById("guestbook").style.display = "none";
	document.getElementById("g").style.backgroundColor="transparent";
	document.getElementById("user").style.display = "none";
	document.getElementById("u").style.backgroundColor="transparent";
	//get the section that is passed through the function and show that section
	document.getElementById(that).style.display = "block";
	document.getElementById(that[0]).style.backgroundColor = "#F6F6F6";
}

//----------------------------- Part 2 script ----------------------------------
let uname = '';
let pword = '';

function logUser(){
	uname = document.getElementById('uname').value;
	pword = document.getElementById('pword').value;
	if(uname == "" || pword == ""){
		modal('Username or password missing!');
	}else{
		let url = "http://localhost:8189/Service.svc/user";
		const xhr = new XMLHttpRequest();
			xhr.open("GET", url, true, uname, pword);
			xhr.withCredentials = true;
			xhr.onload =() => {
				if(xhr.responseText.indexOf("Authentication failed") != -1){
					modal("Incorrect username or password entered");
					document.getElementById('pword').value = "";
				} else{
					modal('Successfully logged in');
					editUser();
				}
			}
			xhr.send(null);
		//document.getElementById('log').parentNode.removeChild(document.getElementById('log'));
	}
}
function registerUser(){
	uname = document.getElementById('uname').value;
	pword = document.getElementById('pword').value;
	let addr = document.getElementById('addr').value;
	let rpword = document.getElementById('rpword').value;
	
	if(uname == "" || pword== "" || addr=="" || rpword==""){
		modal('One or more fields are missing!');
	}else if(pword != rpword){
		modal('passwords do not match');
		document.getElementById('pword').value = "";
		document.getElementById('rpword').value = "";
	} else {
		let bod = {
			'Address': addr,
			'Name': uname,
			'Password': pword
			};
		let register = fetch('http://localhost:8188/DairyService.svc/register', {
			headers: {'Content-Type':'application/json',},
			method: 'post',
			body: JSON.stringify(bod)
		}).then((response) => response.json())
		.then((d) => {
			if(d != "Username not available"){
				modal(uname + ' has successfully been registered');
				editUser();
			}else{
				modal('Sorry, but '+ uname + ' has already been registered. If this belongs to you, please use the log in option, or try a new username.');
				document.getElementById('uname').value = "";
				document.getElementById('pword').value = "";
				document.getElementById('rpword').value = "";
			}
		});
	}
}

function buyNow(id){
	if(document.getElementById("noUser").style.display == "none"){
		let url = "http://localhost:8189/Service.svc/buy?id=" + id;
		//window.open(url);
		const xhr = new XMLHttpRequest();
		xhr.open("GET", url, true, uname, pword);
		xhr.withCredentials = true;
		xhr.onload =() => {
			let bg = document.createElement('div');
			bg.style.width = "100%";
			bg.style.height= "100%";
			bg.style.position = "fixed";
			bg.style.top = "0px";
			bg.style.left = "0px";
			bg.style.backgroundColor="rgba(169,169,169, 0.5)";
			
			let div = document.createElement('div');
			div.style.display = "block";
			div.id = "purchased";
			div.style.width = "60%";
			div.style.height = "300px";
			div.style.position = "fixed";
			div.style.backgroundColor = "lightGray";
			div.style.top = "0px";
			div.style.left= "20%";
			div.style.border = "solid";
			
			let span = document.createElement('span');
			span.appendChild(document.createTextNode('X'));
			span.style.float ="right";
			span.style.fontSize="24px";
			span.style.padding="12px";
			span.style.cursor="pointer";
			div.appendChild(span);
			
			let p = document.createElement('p');
			p.style.padding = "20px";
			p.style.marginTop = "25px";
			p.style.fontSize = "32px";
			p.style.textAlign="center";
			let resp = xhr.responseText.substring(xhr.response.indexOf('/">')+3, xhr.response.indexOf("</"))
			p.appendChild(document.createTextNode(resp));
			div.appendChild(p);
			bg.appendChild(div);
			document.getElementById('products').appendChild(bg);
			
			span.onclick = function(event){
				document.getElementById('purchased').remove();
				bg.remove();
			}
			
			window.onclick = function(event){
				if(document.getElementById('purchased') != null){
					if(event.target == bg){
						document.getElementById('purchased').remove();
						bg.remove();
					}
				}
			}
		}
		xhr.send(null);
	} else {
		showSection('user');
	}
}

function preReg(){
	document.getElementById('email').style.display="block";
	document.getElementById('repass').style.display="block";
	document.getElementById('log').style.display="none";
	
	let button = document.createElement('button');
	button.appendChild(document.createTextNode('Back'));
	button.id = "back";
	button.style.marginTop = "17px";
	button.style.marginLeft = "25px";
	button.style.float = "left";
	button.onclick = function(event){
		document.getElementById('email').style.display="none";
		document.getElementById('repass').style.display="none";
		document.getElementById('log').style.display="block";
		document.getElementById('pword').value ="";
		document.getElementById('reg').removeAttribute('onclick');
		document.getElementById('reg').setAttribute('onclick', 'preReg()');
		button.remove();
	}
	document.getElementById('user').appendChild(button);
	document.getElementById('reg').removeAttribute('onclick');
	document.getElementById('reg').setAttribute('onclick', 'registerUser()');
}
function editUser(){
	if(document.getElementById('back') != null){
		document.getElementById('back').remove();
	}
	document.getElementById('rpword').value = "";
	document.getElementById('addr').value = "";
	document.getElementById('email').style.display="none";
	
	document.getElementById('repass').style.display="none";

	document.getElementById('log').style.display="block";
	document.getElementById('pword').value ="";
	document.getElementById('reg').removeAttribute('onclick');
	document.getElementById('reg').setAttribute('onclick', 'preReg()');
	
	document.getElementById("noUser").style.display = "none";
	
	let d = document.createElement('div');
	d.style.position = "absolute";
	d.style.left= "70%";
	d.style.top = "5px";
	let p = document.createElement('p');
	p.id = "status";
	p.style.marginTop = "10px";
	p.style.marginLeft = "15px";
	p.style.float = "right";
	p.setAttribute('onclick', 'showSection("user")');
	p.style.cursor = "pointer";
	p.appendChild(document.createTextNode('\uD83D\uDC64' + uname));
	let lout = document.createElement('button');
	lout.id = "lout";
	lout.style.float = "left";
	lout.style.width= "100px";
	lout.style.height = "10px;"
	lout.appendChild(document.createTextNode('Log out'));
	lout.style.marginLeft= "10px";
	lout.setAttribute('onclick', 'logout()');
	d.appendChild(p);
	d.appendChild(lout);
	
	let p1 = document.createElement('p');
	p1.id = "loggedIn";
	p1.classList.add('intro');
	p1.appendChild(document.createTextNode('Currently logged in as ' + uname + '. There are currently no options to edit your account just yet, but this is in developement so please be patient'));
	document.getElementById('user').appendChild(p1);
	
	document.getElementById('header').appendChild(d);
	
	document.getElementById('username').value = uname;
}

function logout(){
	document.getElementById('loggedIn').remove();
	document.getElementById("noUser").style.display = "block";
	document.getElementById('log').style.display="block";
	uname = "";
	pword = "";
	document.getElementById('uname').value = "";
	document.getElementById('pword').value = "";
	document.getElementById('status').remove();
	document.getElementById('lout').remove();
	
	showSection('home');
	modal('logged out successfully');
}

function modal(txt){
	let bg = document.createElement('div');
			bg.style.width = "100%";
			bg.style.height= "100%";
			bg.style.position = "fixed";
			bg.style.top = "0px";
			bg.style.left = "0px";
			bg.style.backgroundColor="rgba(169,169,169, 0.5)";
			bg.style.zIndex = '1';
			
			let div = document.createElement('div');
			div.style.display = "block";
			div.id = "modal";
			div.style.width = "40%";
			div.style.height = "20%";
			div.style.position = "fixed";
			div.style.backgroundColor = "lightGray";
			div.style.top = "0px";
			div.style.left= "30%";
			div.style.border = "solid";
			
			let span = document.createElement('span');
			span.appendChild(document.createTextNode('X'));
			span.style.float ="right";
			span.style.fontSize="24px";
			span.style.padding="12px";
			span.style.cursor="pointer";
			div.appendChild(span);
			
			
			
			let p = document.createElement('p');
			p.style.padding = "20px";
			p.id = 'modaltxt';
			p.style.marginLeft = "5%";
			p.style.marginTop = "25px";
			p.style.fontSize = "24px";
			p.style.textAlign="center";
			p.appendChild(document.createTextNode(txt));
			div.appendChild(p);
			bg.appendChild(div);
			
			document.getElementById('header').appendChild(bg);
			span.onclick = function(event){
				document.getElementById('modal').remove();
				bg.remove();
			}
			
			window.onclick = function(event){
				if(document.getElementById('modal') != null){
					if(event.target == bg){
						document.getElementById('modal').remove();
						bg.remove();
					}
				}
			}
}