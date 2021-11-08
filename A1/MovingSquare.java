/*=========================================
	An extension of a rectangle, but the sides
	are equal length.
	UPI: pjiv657
	Name: Pratik Jivanji
=========================================*/

import java.awt.*;

//Square extends rectangle
public class MovingSquare extends MovingRectangle{
	
	//default
	public MovingSquare(){
		this(0, 0, defaultWidth, defaultHeight, defaultMarginWidth, defaultMarginHeight, defaultBorderColor,defaultFillColor, defaultPath);
	}
	
	//construct with params, using the minimum of width and height
	public MovingSquare(int x, int y, int wid, int hei, int marwid, int marhei, Color bor, Color fil, int pat){
		super(x, y, Math.min(wid, hei), Math.min(wid, hei), marwid, marhei, bor, fil, pat);
	}
	
	public void draw(Graphics g, int i){
		g.setColor(fillColor);
		g.drawRect(topLeft.x, topLeft.y, width, height);
		drawHandles(g);
	}
	
}