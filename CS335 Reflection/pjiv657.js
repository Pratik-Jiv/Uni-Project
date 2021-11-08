let dCase = "";
let aCase = "";
let tCase = "";
let tDeath = "";
let tRecov = "";
let date = "";
let count = 0;

let maxTotal = 0;
let maxDayTotal = 0;

const fetchCovid = fetch("https://api.thevirustracker.com/free-api?countryTimeline=NZ");
const streamCovid = fetchCovid.then((response) => response.json());
streamCovid.then((d) => {
	let covstring = JSON.stringify(d);
	let myObj = JSON.parse(covstring);

	let x = myObj.timelineitems[0];
	let y = JSON.stringify(x);
	let z = JSON.parse(y);
	
	Object.entries(z).forEach(function(key){
		if (key[0] != "stat"){
			date = key[0];
			let dailyCase = key[1].new_daily_cases;
			let totalCase = key[1].total_cases;
			let dailyDeath = key[1].new_dailY_deaths;
			let totalDeath = key[1].total_deaths;
			let totalRecov = key[1].total_recoveries;
			let activeCase = totalCase - (totalDeath + totalRecov);
			
			if(totalCase >= maxTotal){
				maxTotal = totalCase;
			}
			if(dailyCase >= maxDayTotal){
				maxDayTotal = dailyCase;
			}
			
			//overwrite to be most recent
			console.log(key[0], ', daily cases ' + dailyCase, ', active cases ' + activeCase);
			dCase = dailyCase;
			aCase = activeCase;
			tCase = totalCase;
			tDeath = totalDeath;
			tRecov = totalRecov;
			
			count = count + 1;
		}
	});
	makeGraphs(Object.entries(z));
	document.getElementById('today').appendChild(document.createTextNode("Showing the latest information, collected on "+ date));
	let li = [tCase, aCase, dCase, tRecov, tDeath];
	for(let i = 0; i<li.length;i++){
		let div = document.createElement('div');
		div.classList.add('stat');
		let num = document.createElement('p');
		num.classList.add('statNum');
		let p = document.createElement('p');
		p.classList.add('statDet');
		num.appendChild(document.createTextNode(li[i]));
		if(i == 0){
			p.appendChild(document.createTextNode('Total cases'));
		}else if(i == 1){
			p.appendChild(document.createTextNode('Active cases'));
		}else if(i == 2){
			p.appendChild(document.createTextNode('Daily cases'));
		}else if(i == 3){
			p.appendChild(document.createTextNode('Total recoveries'));
		}else if(i == 4){
			p.appendChild(document.createTextNode('Total deaths'));
		}
		
		div.appendChild(num);
		div.appendChild(p);
		document.getElementById('main').appendChild(div);
	}
});
function show(that){
	document.getElementById('daily').style.display = "none";
	document.getElementById('d').style.borderColor = "black";
	document.getElementById('total').style.display = "none";
	document.getElementById('t').style.borderColor = "black";
	
	document.getElementById(that).style.display = "block";
	document.getElementById(that.substring(0, 1)).style.borderColor = "yellow";
}

// active = total - (recovered + deaths)
//Considering Covid statistics started recording at the end of Feb, the first month would be Feb
let currMonth = "2";
let prev = ['',''];
let prevt = ['',''];
let maxD = "";
let maxT="";
function makeGraphs(z){
	//create a graph for daily cases
	let graphD = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	graphD.id = 'graphD';
	graphD.setAttribute("width", 157 + (z.length * 24));
	graphD.setAttribute("height", 57 + (maxDayTotal + 10)*24);	
	maxD = 157 + (z.length * 24);
	let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
	rect.setAttribute('x', '150');
	rect.setAttribute('y', 0);
	rect.setAttribute('width', 150 + (z.length * 24));
	rect.setAttribute('height', (maxDayTotal)*24+57);
	rect.setAttribute('fill', '#e9e9e9');
	graphD.appendChild(rect);
	//create a graph for total cases
	let graphT = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	graphT.id = 'graphT';
	graphT.setAttribute("width", 157 + (z.length * 24));
	graphT.setAttribute("height", 357 + maxTotal);
	maxT = 157 + (z.length * 24);
	let rect1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
	rect1.setAttribute('x', '150');
	rect1.setAttribute('y', 0);
	rect1.setAttribute('width', 150 + (z.length * 24));
	rect1.setAttribute('height', (maxTotal)+247);
	rect1.setAttribute('fill', '#e9e9e9');
	graphT.appendChild(rect1);
	
	
	drawY(graphD, maxDayTotal, z);
	drawY(graphT, maxTotal, z);
	
	drawX(graphD, z, maxDayTotal);
	drawX(graphT, z, maxTotal);
	
	let c = 0;
	z.forEach(function(key){
		if (key[0] != "stat"){
			let date = key[0];
			let daily = key[1].new_daily_cases;
			let total = key[1].total_cases;
				
			let month = date.substring(0, date.indexOf('/'));
			if(month != currMonth){
				currMonth = month;
				incX(graphD, month, c, maxDayTotal);
				incX(graphT, month, c, maxTotal);
			}
			date = JSON.stringify(date);
			let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			circle.setAttribute("cx",157 + (c * 24));
			circle.setAttribute("cy", ((maxTotal+250) - total));
			circle.setAttribute("r", "20");
			circle.setAttribute("fill", "red");
			circle.setAttribute("stroke", "black");
			circle.setAttribute('onmouseover', 'plotTotal('+ c +', '+ date +', '+ total +')');
			circle.setAttribute('onmouseout', 'clearPoint('+c+ ',' + date + ')');
			
			if(prevt[0] != ''){
				let conn2 = document.createElementNS('http://www.w3.org/2000/svg','line');
				conn2.setAttribute('x1', prevt[0]);
				conn2.setAttribute('y1', prevt[1]);
				conn2.setAttribute("x2", 157 + (c * 24));
				conn2.setAttribute("y2", ((maxTotal+250) - total));
				conn2.setAttribute('stroke', 'red');
				graphT.appendChild(circle);
				graphT.appendChild(conn2);
			}
			prevt[0] = 157 + (c * 24);
			prevt[1] = maxTotal+250 - total;
			console.log(prevt[0]);
			
			if(daily != -1){
				let circle1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
				let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
				circle1.setAttribute("cx",157 + (c * 24));
				circle1.setAttribute("cy", 100 +(maxDayTotal - daily)*24 - 57);
				circle1.setAttribute("r", "20");
				circle1.setAttribute("fill", "red");
				circle1.setAttribute("stroke", "black");
				circle1.setAttribute('onmouseover', 'plotPoint('+ c +', '+ date +', '+ daily +')');
				circle1.setAttribute('onmouseout', 'clearPoint('+c+ ',' + date + ')');

				graphD.appendChild(circle1);
				
				if(prev[0] != ''){
					let conn = document.createElementNS('http://www.w3.org/2000/svg','line');
					conn.setAttribute('x1', prev[0]);
					conn.setAttribute('y1', prev[1]);
					conn.setAttribute('x2', 157 + (c * 24));
					conn.setAttribute('y2', 100 + (maxDayTotal - daily)*24 - 57);
					conn.setAttribute('stroke', 'red');
					graphD.appendChild(conn);
				}
			prev[0] = 157 + (c * 24);
			prev[1] = 100 +(maxDayTotal - daily)*24 - 57;
			}
			c++;
		}
	});
	document.getElementById('dailyGraph').appendChild(graphD);
	document.getElementById('totalGraph').appendChild(graphT);
}
function drawY(graph, max, z){
	let yline = document.createElementNS('http://www.w3.org/2000/svg','line');
	yline.setAttribute('x1', '150');
	yline.setAttribute('y1', '0');
	yline.setAttribute('x2', '150');
	yline.setAttribute('y2', 100 + max*24 - 50);
	yline.setAttribute('stroke', 'black');
	yline.setAttribute('stroke-width', '3')
	graph.appendChild(yline);
	let inc = 0;
	if(max > 1000){
		inc = 200;
	} else if(max > 500){
		inc = 50;
	} else if(max > 200){
		inc = 20;
	} else {
		inc = 10;
	}
	for(let i=0; i < (max + 2*inc); i = i + inc){
		let incline = document.createElementNS('http://www.w3.org/2000/svg','line');
		incline.setAttribute('x1', '130');
		incline.setAttribute('y1', 100 +(max-i)*24 - 50);
		incline.setAttribute('x2', 150+(z.length*24));
		incline.setAttribute('y2', 100 +(max-i)*24 - 50);
		incline.setAttribute('stroke', 'black');
		incline.setAttribute('stroke-width', '1');
		graph.appendChild(incline);
		let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
		text.setAttribute('x', '0');
		text.setAttribute('y', 100 +(max-i)*24 - 50);
		text.textContent = i;
		text.style.fontSize = "62px";
		if(max == maxTotal){
			incline.setAttribute('y1', 250 + (max-i));
			incline.setAttribute('y2', 250 + (max-i));
			yline.setAttribute('y2', 250 + max);
			text.setAttribute('y', 250 + (max-i));
		}
		graph.appendChild(text);
	}
}
function drawX(graph, z, max){
	let xline = document.createElementNS('http://www.w3.org/2000/svg','line');
	xline.setAttribute('x1', '150');
	xline.setAttribute('y1', 100 + max*24 - 50);
	xline.setAttribute('x2', 150 + (z.length * 24));
	xline.setAttribute('y2', 100 + max*24 - 50);
	xline.setAttribute('stroke', 'black');
	xline.setAttribute('stroke-width', '4');
	if(max == maxTotal){
		xline.setAttribute('y1', 250+max);
		xline.setAttribute('y2', 250+max);
	}
	graph.appendChild(xline);
}

function incX(graph, month, c, max){
	let xincline = document.createElementNS('http://www.w3.org/2000/svg','line');
	xincline.setAttribute('x1', 157 + (c * 24));
	xincline.setAttribute('y1', '0');
	xincline.setAttribute('x2', 157 + (c * 24));
	xincline.setAttribute('y2', 100 + max*24 - 20);
	xincline.setAttribute('stroke', 'black');
	xincline.setAttribute('stroke-width', '1');
				
	let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
	text.setAttribute('x', 157 + (c * 24));
	text.setAttribute('y', 100 + max*24 + 40);
	if(month == "1"){
		text.textContent = "January";
	} else if (month == "2"){
		text.textContent = "Feburary";
	} else if (month == "3"){
		text.textContent = "March";
	} else if (month == "4"){
		text.textContent = "April";
	} else if (month == "5"){
		text.textContent = "May";
	} else if (month == "6"){
		text.textContent = "June";
	} else if (month == "7"){
		text.textContent = "July";
	} else if (month == "8"){
		text.textContent = "August";
	} else if (month == "9"){
		text.textContent = "September";
	} else if (month == "10"){
		text.textContent = "October";
	} else if (month == "11"){
		text.textContent = "November";
	} else if (month == "12"){
		text.textContent = "December";
	}
	text.style.fontSize = "62px";
	
	if(max == maxTotal){
		xincline.setAttribute('y1', 250 + max);
		xincline.setAttribute('y2', 250 + max + 10);
		text.setAttribute('y', 250 + max + 90);
	}
	
	graph.appendChild(xincline);
	graph.appendChild(text);
}

function plotPoint(c, date, daily){
	date = date.toString();
	let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
	circle.id = c;
	circle.setAttribute("cx", 157 + (c * 24));
	circle.setAttribute("cy", 100 +(maxDayTotal - daily)*24 - 57);
	circle.setAttribute("r", "25");
	circle.setAttribute("fill", "yellow");
	circle.setAttribute("stroke", "black");
	document.getElementById('graphD').appendChild(circle);
	let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
	rect.setAttribute('x', 157 + (c * 24) - 250);
	rect.setAttribute('y', 100 +(maxDayTotal - daily)*24 - 57 - 350);
	rect.setAttribute('width', '500');
	rect.setAttribute('height', '250');
	rect.setAttribute('fill', 'lightGrey');
	rect.setAttribute('stroke', 'black');
	rect.id = date;
	
	let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
	text.textContent = date;
	text.id = "t"+date;
	text.setAttribute('x', 157 + (c * 24) - 75);
	text.setAttribute('y', 100 +(maxDayTotal - daily)*24 - 57 - 275);
	text.style.fontSize = "62px";
	
	let text2 = document.createElementNS("http://www.w3.org/2000/svg", "text");
	text2.textContent = "Daily cases: "+daily;
	text2.id = "t2"+date;
	text2.setAttribute('x', 157 + (c * 24) - 175);
	text2.setAttribute('y', 100 +(maxDayTotal - daily)*24 - 57 - 175);
	text2.style.fontSize = "62px";
	
	if(daily > maxDayTotal*0.9){
		text.setAttribute('y', 100 +(maxDayTotal - daily)*24 - 57 + 175);
		text2.setAttribute('y', 100 +(maxDayTotal - daily)*24 - 57 + 275);
		rect.setAttribute('y', 100 +(maxDayTotal - daily)*24 - 57 + 100);
	}
	if(157 + (c * 24) - 250 + 500 > maxD){
		rect.setAttribute('x', maxD - 500);
		text2.setAttribute('x', maxD - 400);
		text.setAttribute('x', maxD - 325);
	} else if(157 + (c * 24) - 250 < 100){
		rect.setAttribute('x', 100);
		text2.setAttribute('x', 200);
		text.setAttribute('x', 250);
	}
	document.getElementById('graphD').appendChild(rect);
	document.getElementById('graphD').appendChild(text);
	document.getElementById('graphD').appendChild(text2);
}

function plotTotal(c, date, total){

	let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
	circle.id = c;
	circle.setAttribute("cx", 157 + (c * 24));
	circle.setAttribute("cy", (maxTotal+250) - total);
	circle.setAttribute("r", "25");
	circle.setAttribute("fill", "yellow");
	circle.setAttribute("stroke", "black");
	document.getElementById('graphT').appendChild(circle);
	
	let rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
	rect.id = date;
	rect.setAttribute('width', '500');
	rect.setAttribute('height', '200');
	rect.setAttribute('x', 157 + (c * 24) - 250);
	rect.setAttribute('y', maxTotal + 250 - total + 100);
	rect.setAttribute('fill', 'lightGrey');
	rect.setAttribute('stroke', 'black');
	document.getElementById('graphT').appendChild(rect);
	
	let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
	text.textContent = date;
	text.id = "t"+date;
	text.setAttribute('x', 157 + (c * 24) - 50);
	text.setAttribute('y', maxTotal + 250 - total + 175);
	text.style.fontSize = "62px";
	document.getElementById('graphT').appendChild(text);
	
	let text2 = document.createElementNS("http://www.w3.org/2000/svg", "text");
	text2.textContent = "Total cases: "+total;
	text2.id = "t2"+date;
	text2.setAttribute('x', 157 + (c * 24) - 190);
	text2.setAttribute('y', maxTotal + 250 - total + 275);
	text2.style.fontSize = "62px";
	document.getElementById('graphT').appendChild(text2);
	if(157 + (c * 24) - 250 + 500 > maxT){
		rect.setAttribute('x', maxT - 500);
		text2.setAttribute('x', maxT - 450);
		text.setAttribute('x', maxT - 325);
	} else if(157 + (c * 24) - 250 < 100){
		rect.setAttribute('x', 100);
		text2.setAttribute('x', 150);
		text.setAttribute('x', 250);
	}
	if(total < maxTotal * 0.1){
		rect.setAttribute('y', maxTotal - 200);
		text.setAttribute('y', maxTotal - 125);
		text2.setAttribute('y', maxTotal - 50);
	}
}
function clearPoint(c, date){
	if(document.getElementById(c) != null){
		document.getElementById(c).remove();
	}
	document.getElementById(date).remove();
	document.getElementById("t"+date).remove();
	document.getElementById("t2"+date).remove();
}
