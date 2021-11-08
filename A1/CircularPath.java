/*=========================================
	A 'drop' path for shapes that travels 
	around the border of the window.
	UPI: pjiv657
	Name: Pratik Jivanji
=========================================*/

import java.awt.*;
//Initiate a clockwise path
public class CircularPath extends MovingPath{
	//temporary varibales
	private int tempX;
	private int tempY;
	
	public CircularPath(int dx, int dy){
		deltaX = 0;		// initially the shape will drop veritcally
		deltaY = dy;
		tempX = dx;
	}
	
	public void move(){
		topLeft.y = topLeft.y + deltaY;
		topLeft.x = topLeft.x + deltaX;
		
		//multiple if/conditional statements: intial down, left, up, right, down...
		if ((topLeft.y + height > marginHeight) && (deltaY > 0)){
			topLeft.y = marginHeight - (height + 5);
			tempY = deltaY;
			deltaY = 0;
			deltaX = -tempX;
		}
		else if ((topLeft.y < 0) && (deltaY < 0)){
			topLeft.y = 0;
			tempY = deltaY;
			deltaY = 0;
			deltaX = -tempX;
		}
		if ((topLeft.x + width > marginWidth) && (deltaX > 0)){
			topLeft.x = marginWidth - width;
			tempX = deltaX;
			deltaX = 0;
			deltaY = -tempY;
		}
		else if ((topLeft.x < 0) && (deltaX < 0)){
			topLeft.x = 0;
			tempX = deltaX;
			deltaX = 0;
			deltaY = -tempY;
		}
	}
}