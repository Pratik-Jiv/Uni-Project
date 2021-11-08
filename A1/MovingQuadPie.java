/*=========================================
	A bordered circle split into 4 quadrants,
	2 of which are white and the others vary
	UPI: pjiv657
	Name: Pratik Jivanji
=========================================*/

import java.awt.*;
import java.awt.geom.Arc2D;
public class MovingQuadPie extends MovingOval{
	
	//default
	public MovingQuadPie(){
		this(0, 0, defaultWidth, defaultHeight, defaultMarginWidth, defaultMarginHeight, defaultBorderColor, defaultFillColor, defaultPath);
	}
	
	//with params
	public MovingQuadPie(int x, int y, int wid, int hei, int marwid, int marhei, Color bor, Color fil, int pat){
		super(x, y, Math.min(wid, hei), Math.min(wid, hei), marwid, marhei, bor, fil, pat);
	}
	
	//draw
	public void draw(Graphics g){
		super.draw(g, 1);
		Graphics2D g2d = (Graphics2D) g;
		Arc2D.Float ac1 = new Arc2D.Float(Arc2D.PIE);
		double a = 0.8;
		double b = 0.1;
		ac1.setFrame(topLeft.x + (b * width), topLeft.y + (b * height), (width) * a, (height) * a);
		ac1.setAngleStart(0);
		ac1.setAngleExtent(90);
		
		
		Arc2D.Float ac2 = new Arc2D.Float(Arc2D.PIE);
		ac2.setFrame(topLeft.x + (b * width), topLeft.y + (b * height), (width) * a, (height) * a);
		ac2.setAngleStart(180);
		ac2.setAngleExtent(90);
		
		
		g.setColor(new Color(255, 255, 255));
		g.fillOval(topLeft.x + (int) (b * width), topLeft.y + (int) (b * height), (int) (width * a), (int) (height * a));
		g2d.setPaint(fillColor);
		g2d.fill(ac1);
		g2d.fill(ac2);
		drawHandles(g);
	}

}