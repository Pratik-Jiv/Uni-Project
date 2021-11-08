/*=========================================
	A hollow sqaure containing multiple lines
	that appear as a pattern.
	UPI: pjiv657
	Name: Pratik Jivanji
=========================================*/

import java.awt.*;
public class MovingSquarePattern extends MovingSquare{
	
	//default
	public MovingSquarePattern(){
		this(0, 0, defaultWidth, defaultHeight, defaultMarginWidth, defaultMarginHeight, defaultBorderColor,defaultFillColor, defaultPath);
	}
	public MovingSquarePattern(int x, int y, int wid, int hei, int marwid, int marhei, Color bor, Color fil, int pat){
		super(x, y, Math.min(wid, hei), Math.min(wid, hei), marwid, marhei, new Color(255, 255, 255, 255), fil, pat);
	}
	
	//draw
	public void draw(Graphics g){
		super.draw(g, 1);
		g.setColor(fillColor);
		for(int i = 1; i < 10; i++){
			g.drawLine(topLeft.x + (i * (int)(width/10)), topLeft.y, topLeft.x + width, topLeft.y + (i * (int)(height/10)));
			g.drawLine(topLeft.x, topLeft.y + (i * (int)(height/10)), topLeft.x  + (i * (int)(width/10)), topLeft.y + height);
		}
		drawHandles(g);
	}
	//contains
	public boolean contains(Point mousePt){
		double dx, dy;
		Point EndPt = new Point(topLeft.x + width, topLeft.y + height);
		dx = (2 * mousePt.x - topLeft.x - EndPt.x) / (double) width;
		dy = (2 * mousePt.y - topLeft.y - EndPt.y) / (double) height;
		return dx * dx + dy * dy < 1.0;
	}
}