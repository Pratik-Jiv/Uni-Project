/*=========================================
	A basic rectangle with changable values
	UPI: pjiv657
	Name: Pratik Jivanji
=========================================*/

import java.awt.*;
public class MovingRectangle extends MovingShape {
	public MovingRectangle(){
		this(0, 0, defaultWidth, defaultHeight, defaultMarginWidth, defaultMarginHeight, defaultBorderColor, defaultFillColor, defaultPath);
	}
	
	public MovingRectangle(int x, int y, int wid, int hei, int marwid, int marhei, Color bor, Color fil, int pat){
		super(x, y, wid, hei, marwid, marhei, bor, fil, pat);
	}
	
	public void draw(Graphics g){
		g.setColor(fillColor);
		g.fillRect(topLeft.x, topLeft.y, width, height);
		g.setColor(borderColor);
		g.drawRect(topLeft.x, topLeft.y, width, height);
		drawHandles(g);
	}
	
	public boolean contains(Point mousePt) {
		double dx, dy;
		Point EndPt = new Point(topLeft.x + width, topLeft.y + height);
		dx = (topLeft.x < mousePt.x && mousePt.x < topLeft.x + width) ? 1 : 0; //if the mousePt is in the bounds the x value is 'true'
		dy = (topLeft.y < mousePt.y && mousePt.y < topLeft.y + height) ? 1 : 0; // if the mousePt is in the bounds the y value is 'true'
		return dx * dy > 0.0; // if either the x or y value is 'false' (0) return false
	}
}
